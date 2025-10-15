import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, ExternalLink, Trash2, Building2, DollarSign } from 'lucide-react';
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
    
    // Create console script
    const createCookieScript = (cookies) => {
      return `// Facebook Cookie Yükleyici - Otomatik
(function() {
  const cookies = ${cookies};
  let cookieArray = [];
  
  try {
    if (typeof cookies === 'string') {
      cookieArray = JSON.parse(cookies);
    } else if (Array.isArray(cookies)) {
      cookieArray = cookies;
    } else if (cookies.cookies) {
      cookieArray = cookies.cookies;
    }
  } catch(e) {
    console.error('Parse hatası:', e);
    alert('Cookie formatı hatalı!');
    return;
  }
  
  let successCount = 0;
  cookieArray.forEach(cookie => {
    try {
      let str = cookie.name + '=' + cookie.value + ';';
      if (cookie.domain) str += 'domain=' + cookie.domain + ';';
      if (cookie.path) str += 'path=' + cookie.path + ';';
      if (cookie.secure) str += 'secure;';
      if (cookie.sameSite) str += 'SameSite=' + cookie.sameSite + ';';
      document.cookie = str;
      successCount++;
    } catch(e) {
      console.error('Set hatası:', cookie.name);
    }
  });
  
  alert('✅ ' + successCount + ' cookie yüklendi! Sayfa yenileniyor...');
  setTimeout(() => location.reload(), 500);
})();`.trim();
    };
    
    const consoleScript = createCookieScript(cookieData);
    const bookmarkletCode = 'javascript:' + encodeURIComponent(consoleScript);
    
    // Open new window with cookie loader UI
    const newWindow = window.open('', '_blank', 'width=1400,height=900');
    
    if (!newWindow) {
      toast.error('Pop-up engelleyici tarafından engellendi!');
      return;
    }

    newWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Facebook Account - Cookie Loader</title>
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
.btn-primary:hover { transform: translateY(-2px); }
.btn-secondary { background: #f3f4f6; color: #374151; }
.btn-secondary:hover { background: #e5e7eb; }
.btn-success {
  background: #10b981;
  color: white;
  animation: pulse 2s infinite;
  font-size: 14px;
  padding: 10px 20px;
}
.btn-success:hover { background: #059669; }
.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
}
.content { display: flex; flex: 1; overflow: hidden; }
.info-panel {
  width: 450px;
  background: white;
  border-right: 2px solid #e5e7eb;
  overflow-y: auto;
}
.panel-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.panel-header h3 { margin-bottom: 8px; font-size: 20px; }
.alert-box {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 16px 20px;
  margin: 20px;
  border-radius: 4px;
}
.alert-box strong { color: #92400e; display: block; margin-bottom: 8px; }
.alert-box p { color: #78350f; font-size: 13px; line-height: 1.6; }
.method-box { padding: 20px; border-bottom: 1px solid #e5e7eb; }
.method-box h4 {
  color: #1f2937;
  margin-bottom: 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.method-number {
  background: #667eea;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}
.step {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  border-left: 3px solid #667eea;
}
.step-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  font-size: 13px;
}
.step-desc {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}
.bookmarklet-zone {
  padding: 16px 20px;
  background: #eff6ff;
  border-radius: 8px;
  margin: 0 20px 20px 20px;
  border: 2px dashed #3b82f6;
}
.bookmarklet-zone h5 { color: #1e40af; margin-bottom: 10px; font-size: 13px; }
.bookmarklet-link {
  display: inline-block;
  background: #3b82f6;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
  cursor: move;
}
.bookmarklet-link:hover { background: #2563eb; }
.iframe-container { flex: 1; display: flex; flex-direction: column; }
iframe { width: 100%; flex: 1; border: none; }
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
}
</style>
</head>
<body>
<div class="header">
  <div class="nav-controls">
    <button class="btn btn-nav" onclick="goBack()">←</button>
    <button class="btn btn-nav" onclick="goForward()">→</button>
    <button class="btn btn-nav" onclick="reloadFrame()">↻</button>
  </div>
  <button class="btn btn-success" onclick="autoLoad()">🚀 Cookie'leri Otomatik Yükle</button>
  <button class="btn btn-primary" onclick="nav('https://www.facebook.com')">Facebook</button>
  <button class="btn btn-secondary" onclick="nav('https://business.facebook.com')">Business</button>
  <button class="btn btn-secondary" onclick="nav('https://www.facebook.com/me')">Profil</button>
  <button class="btn btn-secondary" onclick="nav('https://adsmanager.facebook.com/adsmanager')">Ads Manager</button>
  <button class="btn btn-danger" onclick="window.close()">Kapat</button>
</div>

<div class="content">
  <div class="info-panel">
    <div class="panel-header">
      <h3>🍪 Otomatik Cookie Yükleyici</h3>
      <p>2 kolay yöntemle cookie'leri Facebook'a yükleyin</p>
    </div>
    
    <div class="alert-box">
      <strong>⚡ EN HIZLI YÖNTEM</strong>
      <p>Yeşil "🚀 Cookie'leri Otomatik Yükle" butonuna tıklayın ve talimatları takip edin!</p>
    </div>
    
    <div class="method-box">
      <h4><span class="method-number">1</span>Console Yöntemi (Önerilen)</h4>
      
      <div class="step">
        <div class="step-title">Adım 1: Facebook'a Gidin</div>
        <div class="step-desc">Sağdaki pencerede "Facebook" butonuna tıklayın</div>
      </div>
      
      <div class="step">
        <div class="step-title">Adım 2: Yeşil Butona Tıklayın</div>
        <div class="step-desc">"🚀 Cookie'leri Otomatik Yükle" butonuna basın. Script otomatik kopyalanacak!</div>
      </div>
      
      <div class="step">
        <div class="step-title">Adım 3: Console'u Açın</div>
        <div class="step-desc">
          • Windows/Linux: <b>F12</b> veya <b>Ctrl + Shift + J</b><br>
          • Mac: <b>Cmd + Option + J</b><br>
          • "Console" sekmesine gidin
        </div>
      </div>
      
      <div class="step">
        <div class="step-title">Adım 4: Yapıştır ve Enter</div>
        <div class="step-desc">Console'a yapıştırın (<b>Ctrl+V</b>) ve <b>Enter</b>'a basın. Cookie'ler yüklenecek! 🎉</div>
      </div>
    </div>
    
    <div class="method-box">
      <h4><span class="method-number">2</span>Bookmarklet (Tek Seferlik Kurulum)</h4>
      
      <div class="step">
        <div class="step-title">Adım 1: Bookmark'ı Ekleyin</div>
        <div class="step-desc">Aşağıdaki linki bookmark çubuğuna sürükleyin (Ctrl+Shift+B ile bookmark çubuğunu gösterin)</div>
      </div>
      
      <div class="bookmarklet-zone">
        <h5>👇 Bu linki bookmark çubuğuna sürükleyin:</h5>
        <a href="${bookmarkletCode}" class="bookmarklet-link" onclick="return false;">🍪 FB Cookie Yükle</a>
      </div>
      
      <div class="step">
        <div class="step-title">Adım 2: Facebook'ta Tıklayın</div>
        <div class="step-desc">Facebook'a gidin ve eklediğiniz bookmark'ı tıklayın. Cookie'ler otomatik yüklenecek!</div>
      </div>
    </div>
    
    <div class="method-box" style="border: none;">
      <h4 style="color: #059669;">✅ Cookie Yüklendikten Sonra</h4>
      <div class="step">
        <div class="step-desc">Sayfa otomatik yenilenecek ve hesabınız açılacak! Business Manager, Ads Manager'a kısayollarla erişin.</div>
      </div>
    </div>
  </div>
  
  <div class="iframe-container">
    <iframe id="frame" src="about:blank"></iframe>
  </div>
</div>

<div class="toast" id="toast">✓ Kopyalandı!</div>

<script>
const script = \`${consoleScript.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

function autoLoad() {
  navigator.clipboard.writeText(script).then(() => {
    show('✅ Script kopyalandı! Console\'a yapıştırın!');
    alert('🎉 Script Kopyalandı!\\n\\n' +
      '1. Sağdaki Facebook penceresinde F12 basın\\n' +
      '2. "Console" sekmesine gidin\\n' +
      '3. Ctrl+V ile yapıştırın\\n' +
      '4. Enter basın\\n\\n' +
      'Cookie\'ler otomatik yüklenecek!');
  }).catch(() => {
    alert('Kopyalama başarısız!');
  });
}

function nav(url) {
  document.getElementById('frame').src = url;
}

function goBack() {
  try { document.getElementById('frame').contentWindow.history.back(); } catch(e) {}
}

function goForward() {
  try { document.getElementById('frame').contentWindow.history.forward(); } catch(e) {}
}

function reloadFrame() {
  try {
    document.getElementById('frame').contentWindow.location.reload();
  } catch(e) {
    const src = document.getElementById('frame').src;
    document.getElementById('frame').src = src;
  }
}

function show(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 5000);
}

setTimeout(() => nav('https://www.facebook.com'), 500);
</script>
</body>
</html>`);
    
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