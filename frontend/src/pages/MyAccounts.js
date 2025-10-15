import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function MyAccounts({ user }) {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
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
      toast.error('Hesaplar yuklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const downloadTXT = async (account) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/accounts/${account.account_id}/download-txt`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FB_Hesap_${account.account_id.substring(0, 8)}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Hesap bilgileri indirildi!');
    } catch (error) {
      toast.error('Indirilemedi!');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/accounts/${deleteAccountId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Hesap silindi!');
      setDeleteAccountId(null);
      fetchAccounts();
    } catch (error) {
      toast.error('Silinemedi!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Yukleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="border-white text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 w-4 h-4" />Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Hesaplarim</h1>
              <p className="text-white/80">{accounts.length} hesap</p>
            </div>
          </div>
        </div>

        {accounts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-gray-500 text-lg">Henuz hesap satin almadiniz.</p>
              <Button onClick={() => navigate('/dashboard')} className="mt-4">Hesap Satin Al</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account, index) => {
              const accountPassword = account.account_data.password || '';
              return (
                <Card key={account.id} className="hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <CardTitle>Hesap #{index + 1}</CardTitle>
                    <p className="text-sm text-white/80">Fiyat: {account.account_data.price_tl} TL</p>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-4">
                    {accountPassword && (
                      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                        <p className="text-xs font-semibold text-yellow-800 mb-1">Sifre:</p>
                        <div className="flex justify-between items-center">
                          <p className="text-base font-mono text-yellow-900 font-bold">
                            {showPassword[account.id] ? accountPassword : '••••••••'}
                          </p>
                          <Button onClick={() => setShowPassword({...showPassword, [account.id]: !showPassword[account.id]})} variant="ghost" size="sm">
                            {showPassword[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={() => downloadTXT(account)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" />TXT Indir
                      </Button>
                      <Button onClick={() => setDeleteAccountId(account.account_id)} variant="destructive" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-gray-400 text-center">
                      {new Date(account.purchase_date).toLocaleDateString('tr-TR')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesabi Silmek Istediginize Emin Misiniz?</AlertDialogTitle>
            <AlertDialogDescription>Bu islem geri alinamaz.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Iptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">Evet, Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MyAccounts;