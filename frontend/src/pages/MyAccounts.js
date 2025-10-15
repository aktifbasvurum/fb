import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, ExternalLink, Trash2, Building2, User as UserIcon, CreditCard, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function MyAccounts({ user }) {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [deleteAccountId, setDeleteAccountId] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const openAccountInNewWindow = (account) => {
    const cookieData = account.account_data.cookie_data;
    
    // Open new window
    const newWindow = window.open('', '_blank', 'width=1200,height=800');
    
    if (!newWindow) {
      toast.error('Pop-up engelleyici tarafından engellendi!');
      return;
    }

    // Write HTML content to new window
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facebook Account Viewer</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .header {
            background: white;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
          }
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
          .btn-secondary {
            background: #f3f4f6;
            color: #374151;
          }
          .btn-secondary:hover { background: #e5e7eb; }
          .btn-danger {
            background: #ef4444;
            color: white;
          }
          .btn-danger:hover { background: #dc2626; }
          iframe {
            width: 100%;
            height: calc(100vh - 80px);
            border: none;
          }
          .cookie-box {
            background: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            margin: 16px;
          }
          .cookie-content {
            background: white;
            padding: 12px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            max-height: 200px;
            overflow-y: auto;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <button class="btn btn-primary" onclick="window.location.href='https://www.facebook.com'">Facebook Ana Sayfa</button>
          <button class="btn btn-secondary" onclick="window.location.href='https://business.facebook.com'">Business Manager</button>
          <button class="btn btn-secondary" onclick="window.location.href='https://www.facebook.com/me'">Profil</button>
          <button class="btn btn-secondary" onclick="window.location.href='https://adsmanager.facebook.com/adsmanager'">Ads Manager</button>
          <button class="btn btn-secondary" onclick="window.location.href='https://www.facebook.com/settings?tab=payments'">Faturalandırma</button>
          <button class="btn btn-danger" onclick="window.close()">Kapat</button>
        </div>
        
        <div class="cookie-box">
          <h3 style="margin-bottom: 8px; color: #374151;">Cookie Verisi:</h3>
          <div class="cookie-content">${cookieData}</div>
          <p style="margin-top: 8px; font-size: 12px; color: #6b7280;">
            Not: Bu cookie verisini tarayıcınıza manuel olarak ekleyerek hesaba giriş yapabilirsiniz.
          </p>
        </div>
        
        <iframe src="https://www.facebook.com" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
      </body>
      </html>
    `);
    
    newWindow.document.close();
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              data-testid="back-to-dashboard-button"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white" data-testid="my-accounts-heading">
                Satın Aldığım Hesaplar
              </h1>
              <p className="text-white/80">{accounts.length} hesap</p>
            </div>
          </div>
        </div>

        {/* Accounts Grid */}
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-gray-500 text-lg">Henüz hesap satın almadınız.</p>
              <Button onClick={() => navigate('/dashboard')} className="mt-4" data-testid="go-purchase-button">
                Hesap Satın Al
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account, index) => (
              <Card key={account.id} className="hover:shadow-xl transition-shadow" data-testid={`account-card-${account.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Hesap #{index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteAccountId(account.account_id)}
                      data-testid={`delete-button-${account.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>Kategori: Facebook</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>Fiyat: ₺{account.account_data.price_tl}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(account.purchase_date).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => openAccountInNewWindow(account)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    data-testid={`open-account-button-${account.id}`}
                  >
                    <ExternalLink className="mr-2 w-4 h-4" />
                    Hesabı Aç
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent data-testid="delete-confirmation-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Hesabı Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Hesabınız kalıcı olarak silinecektir ve geri getirilemez.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-cancel-button">İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-500 hover:bg-red-600"
              data-testid="delete-confirm-button"
            >
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MyAccounts;