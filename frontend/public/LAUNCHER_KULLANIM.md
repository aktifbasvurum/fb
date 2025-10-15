# 🚀 Facebook Account Launcher - Kullanım Kılavuzu

## Otomatik Chrome Profili + Cookie Yükleme

Her hesap için ayrı `.bat` dosyası indirebilir ve çalıştırabilirsiniz.

---

## 📥 İlk Kurulum (Tek Sefer - 5 Dakika)

### Gereksinimler:

1. **Google Chrome** (zaten yüklü olmalı)

2. **Python 3.x**
   - İndirin: https://www.python.org/downloads/
   - ⚠️ ÖNEMLİ: Kurulum sırasında **"Add Python to PATH"** seçeneğini işaretleyin!
   - Kurulum tamamlandıktan sonra bilgisayarı yeniden başlatın

3. **Selenium** (otomatik yüklenecek)
   - .bat dosyası ilk çalıştırmada otomatik yükler

---

## 🎯 Kullanım (Her Hesap İçin)

### Adım 1: Launcher'ı İndirin
- Web sitesinde "Hesaplarım" sayfasına gidin
- İstediğiniz hesabın altında **"📥 Launcher İndir (.bat)"** butonuna tıklayın
- `.bat` dosyası indirilecek

### Adım 2: Çalıştırın
- İndirilen `.bat` dosyasına **ÇİFT TIKLAYIN**
- Komut penceresi açılacak
- Python ve gerekli kütüphaneler kontrol edilecek
- Otomatik olarak:
  1. Yeni Chrome profili oluşturulur
  2. Cookie'ler yüklenir
  3. Facebook GİRİLİ OLARAK açılır! ✅

### Adım 3: Kullanın!
- Facebook hesabınız açık
- İstediğiniz yere gidin:
  - Ana Sayfa: Zaten açık
  - Business Manager: `https://business.facebook.com`
  - Ads Manager: `https://adsmanager.facebook.com/adsmanager`
  - Faturalandırma: `https://www.facebook.com/settings?tab=payments`
  - Profil: `https://www.facebook.com/me`

---

## ⚡ Özellikler

✅ **Ayrı Chrome Profili** - Her hesap için ayrı profil, karışma yok
✅ **Otomatik Cookie Yükleme** - Manuel işlem sıfır
✅ **Kalıcı Giriş** - Kapatsanız bile, tekrar açınca giriş yapılmış
✅ **Hızlı Erişim** - Tüm önemli sayfalara direkt erişim
✅ **Güvenli** - Cookie'ler sadece o profilde

---

## 🔧 Sorun Giderme

### "Python bulunamadı" Hatası:
1. Python'u yükleyin: https://www.python.org/downloads/
2. Kurulumda "Add Python to PATH" işaretleyin
3. Bilgisayarı yeniden başlatın

### "Chrome bulunamadı" Hatası:
1. Google Chrome'u yükleyin: https://www.google.com/chrome/
2. Yeniden deneyin

### "Selenium yüklenemedi" Hatası:
1. Komut istemini (CMD) yönetici olarak açın
2. Şunu çalıştırın: `pip install selenium`
3. .bat dosyasını tekrar çalıştırın

### "Launcher indirilemedi" Hatası:
1. Web sunucusunun çalıştığından emin olun
2. Manuel indirin: `http://localhost:3000/fb_launcher.py`
3. İndirdiğiniz `fb_launcher.py` dosyasını `.bat` dosyasıyla aynı klasöre koyun

---

## 💡 İpuçları

- **Birden Fazla Hesap:** Her hesap için ayrı .bat dosyası indirin ve çalıştırın
- **Masaüstü Kısayolu:** .bat dosyasının kısayolunu masaüstüne oluşturun
- **İsimlendirme:** .bat dosyalarını anlamlı isimlerle kaydedin (örn: FB_Hesap1.bat)
- **Profiller:** Her hesap `%LOCALAPPDATA%\FacebookAccounts\` altında saklanır

---

## 📞 Destek

Sorun yaşarsanız:
1. Komut penceresindeki hata mesajını okuyun
2. Yukarıdaki sorun giderme adımlarını deneyin
3. Gerekirse desteğe başvurun

---

**Not:** .bat dosyası her çalıştırmada aynı hesabı açar. Farklı hesaplar için farklı .bat dosyaları indirin.
