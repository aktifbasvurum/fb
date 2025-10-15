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
    
    // Format cookie data for better display
    let formattedCookies = cookieData;
    try {
      const parsed = JSON.parse(cookieData);
      formattedCookies = JSON.stringify(parsed, null, 2);
    } catch (e) {
      // If not valid JSON, use as is
    }
    
    // Open new window
    const newWindow = window.open('', '_blank', 'width=1400,height=900');
    
    if (!newWindow) {
      toast.error('Pop-up engelleyici tarafından engellendi!');
      return;
    }

    // Write HTML content to new window
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facebook Account Viewer - Cookie Manager</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f3f4f6;
            display: flex;
            flex-direction: column;
            height: 100vh;
          }
          .header {
            background: white;
            padding: 12px 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: center;
            border-bottom: 3px solid #667eea;
          }
          .nav-controls {
            display: flex;
            gap: 6px;
            border-right: 2px solid #e5e7eb;
            padding-right: 10px;
            margin-right: 4px;
          }
          .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 13px;
            white-space: nowrap;
          }
          .btn-nav {
            padding: 6px 10px;
            background: #f3f4f6;
            color: #374151;
            font-size: 16px;
            min-width: 36px;
          }
          .btn-nav:hover { background: #e5e7eb; }
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
          .btn-success {
            background: #10b981;
            color: white;
          }
          .btn-success:hover { background: #059669; }
          .btn-danger {
            background: #ef4444;
            color: white;
          }
          .btn-danger:hover { background: #dc2626; }
          
          .content-area {
            display: flex;
            flex: 1;
            overflow: hidden;
          }
          
          .cookie-sidebar {
            width: 400px;
            background: white;
            border-right: 2px solid #e5e7eb;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .cookie-header {
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          .cookie-header h3 {
            margin-bottom: 8px;
            font-size: 18px;
          }
          
          .cookie-header p {
            font-size: 12px;
            opacity: 0.9;
          }
          
          .cookie-actions {
            padding: 12px 16px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            gap: 8px;
          }
          
          .cookie-content {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
          }
          
          .cookie-data {
            background: #1e293b;
            color: #e2e8f0;
            padding: 16px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            overflow-x: auto;
            white-space: pre;
            line-height: 1.6;
          }
          
          .instructions {
            padding: 16px;
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            margin-top: 16px;
            border-radius: 4px;
          }
          
          .instructions h4 {
            color: #92400e;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .instructions ol {
            margin-left: 20px;
            color: #78350f;
            font-size: 12px;
          }
          
          .instructions ol li {
            margin-bottom: 6px;
          }
          
          .instructions a {
            color: #2563eb;
            text-decoration: underline;
          }
          
          .iframe-container {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          
          iframe {
            width: 100%;
            flex: 1;
            border: none;
          }
          
          .toast {
            position: fixed;
            top: 80px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            display: none;
            z-index: 1000;
            animation: slideIn 0.3s ease;
          }
          
          @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          .cookie-toggle {
            position: absolute;
            top: 80px;
            left: 16px;
            background: white;
            border: 2px solid #667eea;
            color: #667eea;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 12px;
            z-index: 100;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .cookie-toggle:hover {
            background: #667eea;
            color: white;
          }
          
          .hidden {
            display: none;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="nav-controls">
            <button class="btn btn-nav" onclick="goBack()" title="Geri">←</button>
            <button class="btn btn-nav" onclick="goForward()" title="İleri">→</button>
            <button class="btn btn-nav" onclick="reloadFrame()" title="Yenile">↻</button>
          </div>
          <button class="btn btn-primary" onclick="navigateTo('https://www.facebook.com')">Facebook</button>
          <button class="btn btn-secondary" onclick="navigateTo('https://business.facebook.com')">Business</button>
          <button class="btn btn-secondary" onclick="navigateTo('https://www.facebook.com/me')">Profil</button>
          <button class="btn btn-secondary" onclick="navigateTo('https://adsmanager.facebook.com/adsmanager')">Ads Manager</button>
          <button class="btn btn-secondary" onclick="navigateTo('https://www.facebook.com/settings?tab=payments')">Fatura</button>
          <button class="btn btn-danger" onclick="window.close()">Kapat</button>
        </div>
        
        <button class="cookie-toggle" onclick="toggleSidebar()">☰ Cookie Panel</button>
        
        <div class="content-area">
          <div class="cookie-sidebar" id="cookieSidebar">
            <div class="cookie-header">
              <h3>🍪 Cookie Yönetimi</h3>
              <p>Hesaba giriş için cookie'leri yükleyin</p>
            </div>
            
            <div class="cookie-actions">
              <button class="btn btn-success" onclick="copyCookies()" style="flex: 1;">
                📋 Kopyala
              </button>
              <button class="btn btn-secondary" onclick="downloadCookies()">
                💾 İndir
              </button>
            </div>
            
            <div class="cookie-content">
              <div class="cookie-data" id="cookieData">${formattedCookies.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
              
              <div class="instructions">
                <h4>📖 Cookie Yükleme Talimatı:</h4>
                <ol>
                  <li><strong>Cookie Editor</strong> eklentisini yükleyin:
                    <br><a href="https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm" target="_blank">Chrome</a> | 
                    <a href="https://addons.mozilla.org/firefox/addon/cookie-editor/" target="_blank">Firefox</a>
                  </li>
                  <li>Yukarıdaki <strong>Kopyala</strong> butonuna tıklayın</li>
                  <li>Facebook sayfasına gidin (Facebook butonuna tıklayın)</li>
                  <li>Cookie Editor eklentisini açın (tarayıcı üst barında)</li>
                  <li><strong>Import</strong> veya <strong>İçe Aktar</strong> düğmesine tıklayın</li>
                  <li>Kopyaladığınız cookie'yi yapıştırın ve <strong>Import</strong> yapın</li>
                  <li>Sayfayı yenileyin (↻ butonu)</li>
                  <li>Hesabınız otomatik olarak açılacak! 🎉</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div class="iframe-container">
            <iframe id="contentFrame" src="about:blank"></iframe>
          </div>
        </div>
        
        <div class="toast" id="toast">Cookie kopyalandı! ✓</div>
        
        <script>
          let sidebarVisible = true;
          
          function toggleSidebar() {
            sidebarVisible = !sidebarVisible;
            const sidebar = document.getElementById('cookieSidebar');
            sidebar.classList.toggle('hidden');
          }
          
          function navigateTo(url) {
            document.getElementById('contentFrame').src = url;
          }
          
          function goBack() {
            document.getElementById('contentFrame').contentWindow.history.back();
          }
          
          function goForward() {
            document.getElementById('contentFrame').contentWindow.history.forward();
          }
          
          function reloadFrame() {
            document.getElementById('contentFrame').contentWindow.location.reload();
          }
          
          function copyCookies() {
            const cookieText = document.getElementById('cookieData').textContent;
            navigator.clipboard.writeText(cookieText).then(() => {
              showToast('Cookie kopyalandı! ✓');
            }).catch(() => {
              // Fallback for older browsers
              const textArea = document.createElement('textarea');
              textArea.value = cookieText;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              showToast('Cookie kopyalandı! ✓');
            });
          }
          
          function downloadCookies() {
            const cookieText = document.getElementById('cookieData').textContent;
            const blob = new Blob([cookieText], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'facebook-cookies.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Cookie indirildi! ✓');
          }
          
          function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.style.display = 'block';
            setTimeout(() => {
              toast.style.display = 'none';
            }, 3000);
          }
          
          // Initialize - load Facebook by default
          setTimeout(() => {
            navigateTo('https://www.facebook.com');
          }, 500);
        </script>
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