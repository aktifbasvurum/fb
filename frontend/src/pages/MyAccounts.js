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
  const [showExtensionInfo, setShowExtensionInfo] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  useEffect(() => {
    fetchAccounts();
    
    // Check if extension is installed
    setTimeout(() => {
      if (window.FB_COOKIE_LOADER_INSTALLED) {
        setExtensionInstalled(true);
        toast.success('🎉 Extension aktif! Otomatik cookie yükleme hazır!');
      } else {
        setShowExtensionInfo(true);
      }
    }, 1000);
    
    // Listen for extension messages
    window.addEventListener('message', handleExtensionMessage);
    return () => window.removeEventListener('message', handleExtensionMessage);
  }, []);

  const handleExtensionMessage = (event) => {
    if (event.data.type === 'FB_COOKIES_LOADED') {
      if (event.data.success) {
        toast.success('🎉 Cookie\'ler yüklendi! Facebook açıldı!');
      } else {
        toast.error('Cookie yükleme hatası: ' + event.data.error);
      }
    }
  };

  const loadCookiesViaExtension = (cookieData) => {
    toast.info('Cookie\'ler yükleniyor...');
    
    // Send message to extension via content script
    window.postMessage({
      type: 'FB_LOAD_COOKIES',
      cookies: cookieData
    }, '*');
  };

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
    
    // Check if extension is installed
    if (window.FB_COOKIE_LOADER_INSTALLED) {
      // Use extension to load cookies automatically
      loadCookiesViaExtension(cookieData);
      return;
    }
    
    // Fallback to manual method
    const newWindow = window.open('', '_blank', 'width=1400,height=900');
    
    if (!newWindow) {
      toast.error('Pop-up engelleyici tarafından engellendi!');
      return;
    }

    const cookieScript = `(function() {
  try {
    const cookieData = ${JSON.stringify(cookieData)};
    let cookies = [];
    
    if (typeof cookieData === 'string') {
      cookies = JSON.parse(cookieData);
    } else if (Array.isArray(cookieData)) {
      cookies = cookieData;
    } else if (cookieData.cookies && Array.isArray(cookieData.cookies)) {
      cookies = cookieData.cookies;
    }
    
    let count = 0;
    cookies.forEach(function(cookie) {
      try {
        let str = cookie.name + '=' + cookie.value + ';';
        if (cookie.domain) str += 'domain=' + cookie.domain + ';';
        if (cookie.path) str += 'path=' + cookie.path + ';';
        if (cookie.secure) str += 'secure;';
        if (cookie.sameSite) str += 'SameSite=' + cookie.sameSite + ';';
        document.cookie = str;
        count++;
      } catch(e) {
        console.error('Cookie error:', cookie.name, e);
      }
    });
    
    alert('✅ ' + count + ' cookie yüklendi! Sayfa yenileniyor...');
    setTimeout(function() { location.reload(); }, 500);
  } catch(e) {
    alert('❌ Hata: ' + e.message);
    console.error(e);
  }
})();`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Facebook Account - Cookie Manager</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui;background:#f3f4f6;display:flex;flex-direction:column;height:100vh}
.header{background:#fff;padding:12px 16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);display:flex;gap:8px;flex-wrap:wrap;border-bottom:3px solid #667eea}
.btn{padding:8px 16px;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px}
.btn-big{padding:10px 20px;font-size:14px;animation:pulse 2s infinite}
.btn-nav{padding:6px 10px;background:#f3f4f6;color:#374151;font-size:16px;min-width:36px}
.btn-nav:hover{background:#e5e7eb}
.btn-success{background:#10b981;color:#fff}
.btn-success:hover{background:#059669;transform:translateY(-2px)}
.btn-primary{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}
.btn-primary:hover{transform:translateY(-2px)}
.btn-secondary{background:#f3f4f6;color:#374151}
.btn-secondary:hover{background:#e5e7eb}
.btn-danger{background:#ef4444;color:#fff}
.btn-danger:hover{background:#dc2626}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.7)}50%{box-shadow:0 0 0 10px rgba(16,185,129,0)}}
.content{display:flex;flex:1;overflow:hidden}
.sidebar{width:400px;background:#fff;border-right:2px solid #e5e7eb;overflow-y:auto}
.sidebar-header{padding:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}
.sidebar-header h3{font-size:18px;margin-bottom:8px}
.alert{background:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;margin:20px}
.alert strong{color:#92400e;display:block;margin-bottom:8px}
.alert p{color:#78350f;font-size:13px}
.steps{padding:20px}
.step{background:#f9fafb;padding:12px;border-radius:8px;margin-bottom:10px;border-left:3px solid #667eea}
.step-title{font-weight:600;color:#374151;margin-bottom:6px;font-size:13px}
.step-desc{color:#6b7280;font-size:12px}
.iframe-container{flex:1}
iframe{width:100%;height:100%;border:none}
.toast{position:fixed;top:80px;right:20px;background:#10b981;color:#fff;padding:12px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);display:none;z-index:1000}
</style>
</head>
<body>

<div class="header">
<button class="btn btn-nav" onclick="goBack()">←</button>
<button class="btn btn-nav" onclick="goForward()">→</button>
<button class="btn btn-nav" onclick="reload()">↻</button>
<button class="btn btn-success btn-big" onclick="loadCookies()">🚀 Cookie'leri Yükle</button>
<button class="btn btn-primary" onclick="goTo('https://www.facebook.com')">Facebook</button>
<button class="btn btn-secondary" onclick="goTo('https://business.facebook.com')">Business</button>
<button class="btn btn-secondary" onclick="goTo('https://www.facebook.com/me')">Profil</button>
<button class="btn btn-secondary" onclick="goTo('https://adsmanager.facebook.com/adsmanager')">Ads Manager</button>
<button class="btn btn-danger" onclick="window.close()">Kapat</button>
</div>

<div class="content">
<div class="sidebar">
<div class="sidebar-header">
<h3>🍪 Cookie Yükleyici</h3>
<p>Hesaba otomatik giriş</p>
</div>

<div class="alert">
<strong>⚡ HIZLI BAŞLANGIÇ</strong>
<p>1. "Facebook" butonuna tıklayın<br>2. Yeşil "🚀 Cookie'leri Yükle" butonuna basın<br>3. Console'a yapıştırın ve Enter - Hesap açılacak!</p>
</div>

<div class="steps">
<h4 style="margin-bottom:12px;color:#1f2937">📋 Detaylı Adımlar:</h4>

<div class="step">
<div class="step-title">1️⃣ Facebook'a Git</div>
<div class="step-desc">"Facebook" butonuna tıklayın</div>
</div>

<div class="step">
<div class="step-title">2️⃣ Cookie'leri Yükle</div>
<div class="step-desc">Yeşil butona bas. Script otomatik kopyalanacak</div>
</div>

<div class="step">
<div class="step-title">3️⃣ Console Aç</div>
<div class="step-desc">F12 bas → Console sekmesi</div>
</div>

<div class="step">
<div class="step-title">4️⃣ Yapıştır ve Enter</div>
<div class="step-desc">Ctrl+V → Enter bas 🎉</div>
</div>
</div>
</div>

<div class="iframe-container">
<iframe id="frame" src="about:blank"></iframe>
</div>
</div>

<div class="toast" id="toast"></div>

<script>
var cookieScript=${JSON.stringify(cookieScript)};

function goTo(u){document.getElementById('frame').src=u}

function goBack(){try{document.getElementById('frame').contentWindow.history.back()}catch(e){show('Geri gidilemedi')}}

function goForward(){try{document.getElementById('frame').contentWindow.history.forward()}catch(e){show('İleri gidilemedi')}}

function reload(){try{document.getElementById('frame').contentWindow.location.reload()}catch(e){var s=document.getElementById('frame').src;if(s&&s!=='about:blank')document.getElementById('frame').src=s;else show('Önce sayfa açın')}}

function loadCookies(){var f=document.getElementById('frame');var s=f.src;if(!s||s==='about:blank'){alert('⚠️ Önce Facebook\\'a gidin!\\n\\n"Facebook" butonuna tıklayın');return}if(!s.includes('facebook.com')){alert('⚠️ Sadece Facebook için!\\n\\n"Facebook" butonuna tıklayın');return}var t=document.createElement('textarea');t.value=cookieScript;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');document.body.removeChild(t);alert('✅ Script kopyalandı!\\n\\nŞİMDİ:\\n1. Facebook penceresinde F12 basın\\n2. Console sekmesine gidin\\n3. Ctrl+V yapıştırın\\n4. Enter basın\\n\\nCookie\\'ler yüklenecek!');show('✅ Script kopyalandı! Console\\'a yapıştırın')}catch(e){alert('❌ Kopyalama başarısız!')}}

function show(m){var t=document.getElementById('toast');t.textContent=m;t.style.display='block';setTimeout(function(){t.style.display='none'},4000)}

setTimeout(function(){goTo('https://www.facebook.com')},500);
</script>

</body>
</html>`;

    newWindow.document.write(htmlContent);
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
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white" data-testid="my-accounts-heading">
                Satın Aldığım Hesaplar
              </h1>
              <p className="text-white/80">{accounts.length} hesap</p>
            </div>
            {extensionInstalled && (
              <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                ✅ Extension Aktif
              </div>
            )}
          </div>
        </div>

        {showExtensionInfo && !extensionInstalled && (
          <Card className="mb-6 border-2 border-yellow-400 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <span className="text-2xl">⚡</span>
                Otomatik Cookie Yükleme İçin Extension Yükleyin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Cookie'lerin otomatik yüklenmesi için Chrome Extension'ı kurmanız gerekiyor. 
                Kurulum sadece <strong>2 dakika</strong> sürer ve sonrasında tüm hesaplar tek tıkla açılır!
              </p>
              <div className="bg-white p-4 rounded-lg mb-4">
                <h3 className="font-bold mb-2 text-gray-800">📥 Hızlı Kurulum:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Extension'ı indirin (aşağıdaki buton)</li>
                  <li>ZIP dosyasını çıkarın</li>
                  <li>Chrome'da <code className="bg-gray-200 px-2 py-1 rounded">chrome://extensions/</code> açın</li>
                  <li>"Geliştirici modu"nu aktif edin (sağ üst)</li>
                  <li>"Paketten yükle" → Klasörü seçin</li>
                  <li>Sayfayı yenileyin - Hazır! ✅</li>
                </ol>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => window.open('/fb-cookie-loader-extension.zip', '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  📥 Extension'ı İndir
                </Button>
                <Button
                  onClick={() => setShowExtensionInfo(false)}
                  variant="outline"
                >
                  Kapat
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
