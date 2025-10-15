import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function MyAccounts({ user }) {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [deleteAccountId, setDeleteAccountId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/accounts/my-accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(response.data);
    } catch (error) {
      toast.error('Hesaplar yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const parseCookies = (cookieData) => {
    try {
      if (typeof cookieData === 'string') {
        return JSON.parse(cookieData);
      }
      return cookieData;
    } catch {
      return [];
    }
  };

  const copyCookie = (cookie) => {
    const text = JSON.stringify(cookie, null, 2);
    navigator.clipboard.writeText(text);
    toast.success('Cookie kopyalandı!');
  };

  const copyAllCookies = (account) => {
    const cookies = parseCookies(account.account_data.cookie_data);
    const text = JSON.stringify(cookies, null, 2);
    navigator.clipboard.writeText(text);
    toast.success('Tüm cookieler kopyalandı!');
  };

  const downloadJSON = async (account) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/accounts/${account.account_id}/download-json`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FB_Account_${account.account_id.substring(0, 8)}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('JSON indirildi!');
    } catch (error) {
      toast.error('İndirilemedi!');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/accounts/${deleteAccountId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Hesap kalıcı olarak silindi!');
      setDeleteAccountId(null);
      fetchAccounts();
    } catch (error) {
      toast.error('Hesap silinemedi!');
    }
  };

  if (loading) {
    return (
      <div className=\"min-h-screen flex items-center justify-center\">
        <p className=\"text-white text-xl\">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen p-6\">
      <div className=\"max-w-7xl mx-auto\">
        {/* Header */}
        <div className=\"glass-effect rounded-2xl p-6 mb-6\">
          <div className=\"flex items-center gap-4\">
            <Button
              onClick={() => navigate('/dashboard')}
              variant=\"outline\"
              className=\"border-white text-white hover:bg-white/10\"
              data-testid=\"back-to-dashboard-button\"
            >
              <ArrowLeft className=\"mr-2 w-4 h-4\" />
              Geri
            </Button>
            <div>
              <h1 className=\"text-3xl font-bold text-white\" data-testid=\"my-accounts-heading\">
                Hesaplarım
              </h1>
              <p className=\"text-white/80\">{accounts.length} hesap</p>
            </div>
          </div>
        </div>

        {accounts.length === 0 ? (
          <Card>
            <CardContent className=\"py-16 text-center\">
              <p className=\"text-gray-500 text-lg\">Henüz hesap satın almadınız.</p>
              <Button onClick={() => navigate('/dashboard')} className=\"mt-4\">
                Hesap Satın Al
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className=\"space-y-6\">
            {accounts.map((account, index) => {
              const cookies = parseCookies(account.account_data.cookie_data);
              const cookieArray = Array.isArray(cookies) ? cookies : (cookies.cookies || []);
              const accountPassword = account.account_data.password || '';

              return (
                <Card key={account.id} className=\"overflow-hidden\" data-testid={`account-card-${account.id}`}>
                  <CardHeader className=\"bg-gradient-to-r from-purple-600 to-blue-600 text-white\">
                    <div className=\"flex justify-between items-center\">
                      <div>
                        <CardTitle className=\"text-2xl\">Hesap #{index + 1}</CardTitle>
                        <p className=\"text-sm text-white/80 mt-1\">
                          Fiyat: ₺{account.account_data.price_tl} • {new Date(account.purchase_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className=\"flex gap-2\">
                        <Button
                          onClick={() => copyAllCookies(account)}
                          variant=\"outline\"
                          size=\"sm\"
                          className=\"border-white text-white hover:bg-white/20\"
                        >
                          <Copy className=\"w-4 h-4 mr-2\" />
                          Tümünü Kopyala
                        </Button>
                        <Button
                          onClick={() => downloadJSON(account)}
                          variant=\"outline\"
                          size=\"sm\"
                          className=\"border-white text-white hover:bg-white/20\"
                        >
                          JSON İndir
                        </Button>
                        <Button
                          onClick={() => setDeleteAccountId(account.account_id)}
                          variant=\"outline\"
                          size=\"sm\"
                          className=\"border-red-300 text-white hover:bg-red-500\"
                        >
                          <Trash2 className=\"w-4 h-4\" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className=\"p-6\">
                    {/* Password Section */}
                    {accountPassword && (
                      <div className=\"bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4\">
                        <div className=\"flex justify-between items-center\">
                          <div>
                            <p className=\"text-xs font-semibold text-yellow-800 mb-1\">Facebook Hesap Şifresi:</p>
                            <p className=\"text-lg font-mono text-yellow-900 font-bold\">
                              {showPassword[account.id] ? accountPassword : '••••••••'}
                            </p>
                          </div>
                          <Button
                            onClick={() => setShowPassword({...showPassword, [account.id]: !showPassword[account.id]})}
                            variant=\"ghost\"
                            size=\"sm\"
                          >
                            {showPassword[account.id] ? <EyeOff className=\"w-4 h-4\" /> : <Eye className=\"w-4 h-4\" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Cookies Table */}
                    <div className=\"border rounded-lg overflow-hidden\">
                      <div className=\"bg-gray-50 px-4 py-3 border-b\">
                        <h3 className=\"font-semibold text-gray-800\">Cookie Listesi ({cookieArray.length} adet)</h3>
                      </div>
                      
                      <div className=\"max-h-96 overflow-auto\">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className=\"w-12\">#</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Domain</TableHead>
                              <TableHead>Path</TableHead>
                              <TableHead className=\"w-20\">Secure</TableHead>
                              <TableHead className=\"w-24\">İşlem</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cookieArray.map((cookie, idx) => (
                              <TableRow key={idx} className=\"hover:bg-gray-50\">
                                <TableCell className=\"font-medium text-gray-500\">{idx + 1}</TableCell>
                                <TableCell className=\"font-mono text-sm font-semibold\">{cookie.name}</TableCell>
                                <TableCell className=\"font-mono text-xs text-gray-600 max-w-md truncate\" title={cookie.value}>
                                  {cookie.value?.substring(0, 50)}{cookie.value?.length > 50 ? '...' : ''}
                                </TableCell>
                                <TableCell className=\"text-sm\">{cookie.domain}</TableCell>
                                <TableCell className=\"text-sm\">{cookie.path}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${cookie.secure ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {cookie.secure ? 'Yes' : 'No'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    onClick={() => copyCookie(cookie)}
                                    variant=\"ghost\"
                                    size=\"sm\"
                                    className=\"h-8 px-2\"
                                  >
                                    <Copy className=\"w-3 h-3\" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className=\"mt-4 grid grid-cols-3 gap-4 text-center\">
                      <div className=\"bg-blue-50 p-3 rounded-lg\">
                        <p className=\"text-xs text-blue-600 font-semibold\">Toplam Cookie</p>
                        <p className=\"text-2xl font-bold text-blue-800\">{cookieArray.length}</p>
                      </div>
                      <div className=\"bg-green-50 p-3 rounded-lg\">
                        <p className=\"text-xs text-green-600 font-semibold\">Secure</p>
                        <p className=\"text-2xl font-bold text-green-800\">
                          {cookieArray.filter(c => c.secure).length}
                        </p>
                      </div>
                      <div className=\"bg-purple-50 p-3 rounded-lg\">
                        <p className=\"text-xs text-purple-600 font-semibold\">HttpOnly</p>
                        <p className=\"text-2xl font-bold text-purple-800\">
                          {cookieArray.filter(c => c.httpOnly).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesabı Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Hesabınız kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className=\"bg-red-500 hover:bg-red-600\">
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MyAccounts;
