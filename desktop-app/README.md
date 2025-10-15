# 🖥️ Facebook Account Manager - Desktop Application

## Windows Masaüstü Programı

Basit, kullanıcı dostu masaüstü uygulaması ile Facebook hesaplarınızı yönetin.

---

## 📥 KURULUM

### Kullanıcılar İçin (Basit):

1. **FacebookAccountManager.exe** dosyasını indirin
2. Çift tıklayın
3. TAMAM! Kullanıma hazır ✅

### Geliştiriciler İçin (EXE Oluşturma):

```bash
cd /app/desktop-app
python build_exe.py
```

EXE dosyası `dist/FacebookAccountManager.exe` konumunda oluşturulur.

---

## 🚀 KULLANIM

### 1. Program Aç
- FacebookAccountManager.exe'yi çift tıklayın

### 2. Hesap Ekle
- "➕ Hesap Ekle" butonuna tıklayın
- Hesap adı girin (örn: "Facebook Hesap 1")
- Web sitesinden indirdiğiniz JSON cookie dosyasını seçin
- "Kaydet" butonu

### 3. Hesap Aç
- Listeden hesabı seçin
- "🚀 Hesabı Aç" butonuna tıklayın
- Facebook otomatik açılır, giriş yapılmış halde! ✅

### 4. Hesap Sil
- Listeden hesabı seçin
- "🗑️ Sil" butonuna tıklayın

---

## ✨ ÖZELLİKLER

✅ **Basit Arayüz** - Karmaşık değil, herkes kullanabilir
✅ **Otomatik Giriş** - Cookie'ler otomatik yüklenir
✅ **Çoklu Hesap** - Sınırsız hesap ekleyin
✅ **Ayrı Profiller** - Her hesap için ayrı Chrome profili
✅ **Güvenli** - Veriler sadece bilgisayarınızda
✅ **Kolay Yönetim** - Ekle, aç, sil

---

## 📋 GEREKSİNİMLER

### Program İçin:
- ✅ Windows 7/8/10/11
- ✅ Google Chrome (yüklü olmalı)

### İlk Çalıştırmada Otomatik Yüklenecek:
- Python (program içinde)
- Selenium (program içinde)

**NOT:** İlk çalıştırmada gerekli bileşenler otomatik yüklenecektir.

---

## 💾 VERİ DEPOLAMA

Hesaplar şurada saklanır:
```
%LOCALAPPDATA%\FacebookAccountManager\
  ├── accounts.json (Hesap listesi ve cookie'ler)
  └── profiles\ (Chrome profilleri)
```

---

## 🔧 SORUN GİDERME

### "Selenium kurulu değil" Hatası:

Komut İstemini açın ve çalıştırın:
```cmd
pip install selenium
```

### "Chrome bulunamadı" Hatası:

Google Chrome'u yükleyin:
https://www.google.com/chrome/

### Program açılmıyor:

1. Antivirüs yazılımınızı kontrol edin
2. Windows Defender'ı geçici olarak kapatın
3. .exe dosyasına sağ tık → "Yönetici olarak çalıştır"

---

## 🌐 WEB SİTESİ ENTEGRASYONU

### JSON Cookie Dosyası İndirme:

Web sitenizde, kullanıcılar hesaplarını şu şekilde indirebilir:

```javascript
// Backend endpoint
GET /api/accounts/{account_id}/download-json

// Response: JSON file with cookies
{
  "name": "Account Name",
  "email": "user@example.com",
  "cookies": [...]
}
```

---

## 📦 DAĞITIM

### Kullanıcılara Nasıl Dağıtılır:

1. **Tek EXE Dosyası:**
   - `FacebookAccountManager.exe` dosyasını paylaşın
   - Kullanıcılar sadece bu dosyayı indirir ve çalıştırır

2. **Web Sitesinden İndirme:**
   - EXE dosyasını web sunucunuza yükleyin
   - İndirme linki verin

3. **Kurulum Gereksiz:**
   - Kurulum yapmaya gerek yok
   - Çift tık ile çalışır

---

## 🛡️ GÜVENLİK

- ✅ Cookie'ler şifrelenmemiş JSON olarak saklanır (lokal)
- ✅ Hiçbir veri internete gönderilmez
- ✅ Tamamen offline çalışır (hesap açma hariç)
- ⚠️ Cookie dosyalarını güvenli tutun

---

## 🔄 GÜNCELLEME

Yeni sürüm çıktığında:
1. Yeni .exe dosyasını indirin
2. Eski dosyayı silin
3. Yeni dosyayı çalıştırın
4. Verileriniz korunur (%LOCALAPPDATA%'da)

---

## 📞 DESTEK

Sorun yaşarsanız:
1. README'yi okuyun
2. Sorun Giderme bölümünü kontrol edin
3. Hata mesajını not edin ve destek alın

---

## 📄 LİSANS

Bu program web sitenizin kullanıcıları için özel olarak geliştirilmiştir.

---

Made with ❤️ for easy Facebook account management
