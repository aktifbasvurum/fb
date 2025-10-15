import sys
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import time

def load_cookies_and_open_facebook(profile_name, cookies_json):
    """Load cookies and open Facebook with a dedicated Chrome profile"""
    
    # Parse cookies
    try:
        if isinstance(cookies_json, str):
            cookies = json.loads(cookies_json)
        else:
            cookies = cookies_json
            
        if isinstance(cookies, dict) and 'cookies' in cookies:
            cookies = cookies['cookies']
    except Exception as e:
        print(f"Cookie parse error: {e}")
        return False
    
    # Setup Chrome with dedicated profile
    chrome_options = Options()
    
    # Create profile directory
    profile_dir = os.path.join(os.getenv('LOCALAPPDATA'), 'FacebookAccounts', profile_name)
    os.makedirs(profile_dir, exist_ok=True)
    
    chrome_options.add_argument(f'--user-data-dir={profile_dir}')
    chrome_options.add_argument('--profile-directory=Default')
    chrome_options.add_argument('--no-first-run')
    chrome_options.add_argument('--no-default-browser-check')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    try:
        # Start Chrome
        print(f"Chrome açılıyor: {profile_name}")
        driver = webdriver.Chrome(options=chrome_options)
        
        # Go to Facebook
        print("Facebook'a gidiliyor...")
        driver.get('https://www.facebook.com')
        time.sleep(2)
        
        # Delete existing cookies
        driver.delete_all_cookies()
        
        # Add new cookies
        print(f"Cookie'ler yükleniyor ({len(cookies)} adet)...")
        success_count = 0
        for cookie in cookies:
            try:
                cookie_dict = {
                    'name': cookie['name'],
                    'value': cookie['value'],
                    'domain': cookie.get('domain', '.facebook.com'),
                    'path': cookie.get('path', '/'),
                    'secure': cookie.get('secure', True),
                    'httpOnly': cookie.get('httpOnly', False)
                }
                
                # Add expiry if provided
                if 'expirationDate' in cookie:
                    cookie_dict['expiry'] = int(cookie['expirationDate'])
                elif 'expires' in cookie:
                    cookie_dict['expiry'] = int(cookie['expires'])
                
                driver.add_cookie(cookie_dict)
                success_count += 1
            except Exception as e:
                print(f"Cookie yükleme hatası ({cookie['name']}): {e}")
        
        print(f"✅ {success_count} cookie yüklendi!")
        
        # Refresh to apply cookies
        print("Sayfa yenileniyor...")
        driver.refresh()
        time.sleep(3)
        
        print("✅ Facebook hesabı açıldı!")
        print("\nKISAYOLLAR:")
        print("1. Ana Sayfa: https://www.facebook.com")
        print("2. Business Manager: https://business.facebook.com")
        print("3. Ads Manager: https://adsmanager.facebook.com/adsmanager")
        print("4. Faturalandırma: https://www.facebook.com/settings?tab=payments")
        print("5. Profil: https://www.facebook.com/me")
        print("\n🎯 İstediğiniz URL'ye gitmek için tarayıcıda yazın.")
        print("🔴 Kapatmak için bu pencereyi kapatın.")
        
        # Keep browser open
        input("\nTarayıcıyı kapatmak için Enter'a basın...")
        
        return True
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        return False
    finally:
        try:
            driver.quit()
        except:
            pass

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Kullanım: python fb_launcher.py <profile_name> <cookies_json>")
        sys.exit(1)
    
    profile_name = sys.argv[1]
    cookies_json = sys.argv[2]
    
    success = load_cookies_and_open_facebook(profile_name, cookies_json)
    sys.exit(0 if success else 1)
