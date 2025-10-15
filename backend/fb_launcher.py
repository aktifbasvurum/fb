#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import json
import os

def load_cookies_and_open_facebook(profile_name, cookies_file):
    """Load cookies and open Facebook with a dedicated Chrome profile"""
    
    print(f"📂 Cookie dosyası okunuyor: {cookies_file}")
    
    # Read cookies from file
    try:
        with open(cookies_file, 'r', encoding='utf-8') as f:
            cookies_json = f.read()
    except Exception as e:
        print(f"❌ Cookie dosyası okunamadı: {e}")
        return False
    
    # Parse cookies
    try:
        cookies_data = json.loads(cookies_json)
        
        if isinstance(cookies_data, dict) and 'cookies' in cookies_data:
            cookies = cookies_data['cookies']
        elif isinstance(cookies_data, list):
            cookies = cookies_data
        else:
            cookies = [cookies_data]
            
        print(f"✅ {len(cookies)} cookie bulundu")
    except Exception as e:
        print(f"❌ Cookie parse hatası: {e}")
        return False
    
    # Import selenium
    try:
        print("📦 Selenium yükleniyor...")
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        print("✅ Selenium hazır")
    except ImportError as e:
        print(f"❌ Selenium import hatası: {e}")
        print("\nLütfen şunu çalıştırın: pip install selenium")
        return False
    
    import time
    
    # Setup Chrome with dedicated profile
    chrome_options = Options()
    
    # Create profile directory
    profile_dir = os.path.join(os.getenv('LOCALAPPDATA'), 'FacebookAccounts', profile_name)
    os.makedirs(profile_dir, exist_ok=True)
    print(f"📁 Profil dizini: {profile_dir}")
    
    chrome_options.add_argument(f'--user-data-dir={profile_dir}')
    chrome_options.add_argument('--profile-directory=Default')
    chrome_options.add_argument('--no-first-run')
    chrome_options.add_argument('--no-default-browser-check')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    driver = None
    try:
        # Start Chrome
        print(f"\n🚀 Chrome açılıyor...")
        driver = webdriver.Chrome(options=chrome_options)
        print("✅ Chrome açıldı")
        
        # Go to Facebook
        print("🌐 Facebook'a gidiliyor...")
        driver.get('https://www.facebook.com')
        time.sleep(2)
        
        # Delete existing cookies
        print("🗑️  Eski cookie'ler temizleniyor...")
        driver.delete_all_cookies()
        
        # Add new cookies
        print(f"🍪 Cookie'ler yükleniyor...")
        success_count = 0
        error_count = 0
        
        for cookie in cookies:
            try:
                cookie_dict = {
                    'name': cookie.get('name', ''),
                    'value': cookie.get('value', ''),
                    'domain': cookie.get('domain', '.facebook.com'),
                    'path': cookie.get('path', '/'),
                }
                
                # Optional fields
                if 'secure' in cookie:
                    cookie_dict['secure'] = cookie['secure']
                if 'httpOnly' in cookie:
                    cookie_dict['httpOnly'] = cookie['httpOnly']
                
                # Add expiry if provided
                if 'expirationDate' in cookie:
                    cookie_dict['expiry'] = int(float(cookie['expirationDate']))
                elif 'expires' in cookie:
                    cookie_dict['expiry'] = int(float(cookie['expires']))
                
                driver.add_cookie(cookie_dict)
                success_count += 1
            except Exception as e:
                error_count += 1
                print(f"   ⚠️  Cookie hatası ({cookie.get('name', 'unknown')}): {str(e)[:50]}")
        
        print(f"✅ {success_count} cookie yüklendi ({error_count} hata)")
        
        # Refresh to apply cookies
        print("🔄 Sayfa yenileniyor...")
        driver.refresh()
        time.sleep(3)
        
        print("\n" + "="*50)
        print("✅ Facebook hesabı açıldı!")
        print("="*50)
        print("\n📌 KISAYOLLAR:")
        print("   1. Ana Sayfa: https://www.facebook.com")
        print("   2. Business Manager: https://business.facebook.com")
        print("   3. Ads Manager: https://adsmanager.facebook.com/adsmanager")
        print("   4. Faturalandırma: https://www.facebook.com/settings?tab=payments")
        print("   5. Profil: https://www.facebook.com/me")
        print("\n💡 İpucu: Bu URL'leri tarayıcıya yapıştırın")
        print("\n🔴 Kapatmak için bu pencereyi kapatın veya Enter basın...")
        print("="*50 + "\n")
        
        # Keep browser open
        input()
        
        return True
        
    except Exception as e:
        print(f"\n❌ HATA: {e}")
        print(f"\nDetay: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if driver:
            try:
                print("\n🔴 Chrome kapatılıyor...")
                driver.quit()
            except:
                pass

if __name__ == '__main__':
    print("="*50)
    print("Facebook Account Launcher")
    print("="*50 + "\n")
    
    if len(sys.argv) < 3:
        print("❌ Kullanım hatası!")
        print(f"Kullanım: python {sys.argv[0]} <profile_name> <cookies_file>")
        sys.exit(1)
    
    profile_name = sys.argv[1]
    cookies_file = sys.argv[2]
    
    print(f"👤 Profil: {profile_name}")
    print(f"📂 Cookie dosyası: {cookies_file}\n")
    
    success = load_cookies_and_open_facebook(profile_name, cookies_file)
    
    if not success:
        print("\n❌ İşlem başarısız!")
        input("\nDevam etmek için Enter basın...")
        sys.exit(1)
    
    sys.exit(0)
