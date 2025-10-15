#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PLATOON FACEBOOK MANAGER
Desktop Application for Facebook Account Management
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import os
import sys
from pathlib import Path
import subprocess

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

class PlatoonFacebookManager:
    def __init__(self, root):
        self.root = root
        self.root.title("PLATOON FACEBOOK MANAGER")
        self.root.geometry("900x700")
        self.root.configure(bg='#667eea')
        
        self.accounts = []
        self.accounts_dir = Path(os.getenv('LOCALAPPDATA') or os.getenv('APPDATA') or Path.home()) / 'PlatoonFacebookManager'
        self.accounts_dir.mkdir(exist_ok=True)
        self.accounts_file = self.accounts_dir / 'accounts.json'
        
        # Check first run
        self.first_run_file = self.accounts_dir / '.first_run'
        if not self.first_run_file.exists():
            self.show_welcome()
            self.first_run_file.touch()
        
        self.load_accounts()
        self.create_ui()
        
        if not SELENIUM_AVAILABLE:
            self.show_selenium_warning()
    
    def show_welcome(self):
        """Show welcome message on first run"""
        welcome_msg = """
        PLATOON FACEBOOK MANAGER
        
        Bu program ucretsiz ve suresiz sekilde kullanabilirsiniz!
        
        Ozellikler:
        - Sinirsiz hesap ekleme
        - Otomatik cookie yukleme
        - Ayri Chrome profilleri
        - Hizli kisayollar (Ads Manager, Business, vb.)
        - Sifre yonetimi
        
        Hemen baslayin!
        """
        messagebox.showinfo("Hosgeldiniz!", welcome_msg)
    
    def create_ui(self):
        # Header
        header = tk.Frame(self.root, bg='#667eea', pady=25)
        header.pack(fill='x')
        
        tk.Label(header, text="PLATOON", font=('Arial', 32, 'bold'), bg='#667eea', fg='white').pack()
        tk.Label(header, text="FACEBOOK MANAGER", font=('Arial', 18), bg='#667eea', fg='#fbbf24').pack()
        tk.Label(header, text="Ucretsiz & Suresiz", font=('Arial', 10), bg='#667eea', fg='white').pack(pady=(5,0))
        
        # Content
        content = tk.Frame(self.root, bg='white', padx=25, pady=25)
        content.pack(fill='both', expand=True, padx=25, pady=(0, 25))
        
        # Buttons
        btn_frame = tk.Frame(content, bg='white')
        btn_frame.pack(fill='x', pady=(0, 20))
        
        tk.Button(btn_frame, text="+ Hesap Ekle", command=self.add_account, bg='#10b981', fg='white', font=('Arial', 12, 'bold'), padx=20, pady=12, relief='flat', cursor='hand2').pack(side='left', padx=5)
        tk.Button(btn_frame, text="Yenile", command=self.refresh, bg='#3b82f6', fg='white', font=('Arial', 12, 'bold'), padx=20, pady=12, relief='flat', cursor='hand2').pack(side='left', padx=5)
        tk.Button(btn_frame, text="Yardim", command=self.show_help, bg='#f59e0b', fg='white', font=('Arial', 12, 'bold'), padx=20, pady=12, relief='flat', cursor='hand2').pack(side='left', padx=5)
        tk.Button(btn_frame, text="Gereksinimler", command=self.install_requirements, bg='#8b5cf6', fg='white', font=('Arial', 12, 'bold'), padx=20, pady=12, relief='flat', cursor='hand2').pack(side='left', padx=5)
        
        # List
        tk.Label(content, text="Hesaplar:", font=('Arial', 14, 'bold'), bg='white', fg='#1f2937').pack(anchor='w', pady=(0, 10))
        
        list_frame = tk.Frame(content, bg='white')
        list_frame.pack(fill='both', expand=True)
        
        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side='right', fill='y')
        
        self.listbox = tk.Listbox(list_frame, font=('Arial', 11), bg='#f9fafb', fg='#1f2937', selectbackground='#667eea', selectforeground='white', relief='flat', highlightthickness=1, highlightbackground='#e5e7eb', yscrollcommand=scrollbar.set)
        self.listbox.pack(side='left', fill='both', expand=True)
        scrollbar.config(command=self.listbox.yview)
        
        # Actions
        action_frame = tk.Frame(content, bg='white')
        action_frame.pack(fill='x', pady=(20, 0))
        
        tk.Button(action_frame, text="HESABI AC", command=self.open_account, bg='#667eea', fg='white', font=('Arial', 16, 'bold'), padx=40, pady=18, relief='flat', cursor='hand2').pack(side='left', padx=5, expand=True, fill='x')
        tk.Button(action_frame, text="Sil", command=self.delete_account, bg='#ef4444', fg='white', font=('Arial', 16, 'bold'), padx=40, pady=18, relief='flat', cursor='hand2').pack(side='left', padx=5, expand=True, fill='x')
        
        self.refresh_list()
    
    def load_accounts(self):
        if self.accounts_file.exists():
            try:
                with open(self.accounts_file, 'r', encoding='utf-8') as f:
                    self.accounts = json.load(f)
            except:
                self.accounts = []
        else:
            self.accounts = []
    
    def save_accounts(self):
        try:
            with open(self.accounts_file, 'w', encoding='utf-8') as f:
                json.dump(self.accounts, f, indent=2, ensure_ascii=False)
        except Exception as e:
            messagebox.showerror("Hata", f"Kayit hatasi: {e}")
    
    def refresh_list(self):
        self.listbox.delete(0, tk.END)
        for i, acc in enumerate(self.accounts):
            pwd_text = f" | Sifre: {acc.get('password', 'N/A')}" if acc.get('password') else ""
            text = f"{i+1}. {acc.get('name', 'Hesap')} - {acc.get('email', 'N/A')}{pwd_text}"
            self.listbox.insert(tk.END, text)
    
    def add_account(self):
        win = tk.Toplevel(self.root)
        win.title("Hesap Ekle")
        win.geometry("650x600")
        win.configure(bg='white')
        win.transient(self.root)
        win.grab_set()
        
        tk.Label(win, text="Yeni Hesap Ekle", font=('Arial', 20, 'bold'), bg='white', fg='#1f2937').pack(pady=25)
        
        tk.Label(win, text="Hesap Adi:", bg='white', font=('Arial', 11, 'bold')).pack(anchor='w', padx=35)
        name_entry = tk.Entry(win, font=('Arial', 11), width=55)
        name_entry.pack(padx=35, pady=(5, 15))
        
        tk.Label(win, text="Email (opsiyonel):", bg='white', font=('Arial', 11, 'bold')).pack(anchor='w', padx=35)
        email_entry = tk.Entry(win, font=('Arial', 11), width=55)
        email_entry.pack(padx=35, pady=(5, 15))
        
        tk.Label(win, text="Hesap Sifresi:", bg='white', font=('Arial', 11, 'bold')).pack(anchor='w', padx=35)
        pwd_entry = tk.Entry(win, font=('Arial', 11), width=55, show='*')
        pwd_entry.pack(padx=35, pady=(5, 15))
        
        tk.Label(win, text="Cookie Dosyasi (JSON):", bg='white', font=('Arial', 11, 'bold')).pack(anchor='w', padx=35)
        
        cookie_frame = tk.Frame(win, bg='white')
        cookie_frame.pack(padx=35, pady=(5, 15), fill='x')
        
        cookie_var = tk.StringVar()
        tk.Entry(cookie_frame, textvariable=cookie_var, font=('Arial', 11), state='readonly').pack(side='left', fill='x', expand=True, padx=(0, 10))
        
        def browse():
            f = filedialog.askopenfilename(title="JSON Dosyasi Sec", filetypes=[("JSON", "*.json"), ("All", "*.*")])
            if f:
                cookie_var.set(f)
        
        tk.Button(cookie_frame, text="Gozat", command=browse, bg='#3b82f6', fg='white', font=('Arial', 10, 'bold'), padx=15, pady=8, relief='flat').pack()
        
        tk.Label(win, text="Web sitesinden indirdiginiz JSON dosyasini secin", bg='#fef3c7', fg='#78350f', font=('Arial', 9), padx=10, pady=10).pack(padx=35, pady=10, fill='x')
        
        btn_frame = tk.Frame(win, bg='white')
        btn_frame.pack(pady=25)
        
        def save():
            name = name_entry.get().strip()
            email = email_entry.get().strip()
            pwd = pwd_entry.get().strip()
            cf = cookie_var.get()
            
            if not name or not cf:
                messagebox.showwarning("Uyari", "Hesap adi ve cookie dosyasi gerekli!")
                return
            
            try:
                with open(cf, 'r', encoding='utf-8') as f:
                    cookies_data = json.load(f)
                
                self.accounts.append({'name': name, 'email': email, 'password': pwd, 'cookies': cookies_data})
                self.save_accounts()
                self.refresh_list()
                messagebox.showinfo("Basarili", "Hesap eklendi!")
                win.destroy()
            except Exception as e:
                messagebox.showerror("Hata", f"Cookie okunamadi: {e}")
        
        tk.Button(btn_frame, text="Kaydet", command=save, bg='#10b981', fg='white', font=('Arial', 12, 'bold'), padx=35, pady=12, relief='flat').pack(side='left', padx=5)
        tk.Button(btn_frame, text="Iptal", command=win.destroy, bg='#6b7280', fg='white', font=('Arial', 12, 'bold'), padx=35, pady=12, relief='flat').pack(side='left', padx=5)
    
    def open_account(self):
        sel = self.listbox.curselection()
        if not sel:
            messagebox.showwarning("Uyari", "Lutfen hesap secin!")
            return
        
        if not SELENIUM_AVAILABLE:
            messagebox.showerror("Hata", "Selenium kurulu degil!\\n\\nGereksinimler butonuna tiklayin.")
            return
        
        acc = self.accounts[sel[0]]
        
        loading = tk.Toplevel(self.root)
        loading.title("Yukleniyor...")
        loading.geometry("350x180")
        loading.configure(bg='white')
        loading.transient(self.root)
        
        tk.Label(loading, text="Facebook aciliyor...", font=('Arial', 14, 'bold'), bg='white').pack(pady=25)
        tk.Label(loading, text=acc['name'], font=('Arial', 11), bg='white', fg='#6b7280').pack()
        
        progress = ttk.Progressbar(loading, mode='indeterminate', length=250)
        progress.pack(pady=15)
        progress.start()
        
        loading.update()
        
        import threading
        
        def open_thread():
            try:
                self.open_with_selenium(acc)
                loading.destroy()
                messagebox.showinfo("Basarili", f"{acc['name']} acildi!\\n\\nKisayol toolbar sayfanin ustunde!")
            except Exception as e:
                loading.destroy()
                messagebox.showerror("Hata", f"Acilamadi:\\n{str(e)}")
        
        threading.Thread(target=open_thread, daemon=True).start()
    
    def open_with_selenium(self, account):
        import time
        
        cookies_data = account['cookies']
        if isinstance(cookies_data, dict) and 'cookies' in cookies_data:
            cookies = cookies_data['cookies']
        elif isinstance(cookies_data, list):
            cookies = cookies_data
        else:
            raise ValueError("Gecersiz cookie formati")
        
        chrome_options = Options()
        profile_name = account['name'].replace(' ', '_').replace('/', '_')
        profile_dir = self.accounts_dir / 'profiles' / profile_name
        profile_dir.mkdir(parents=True, exist_ok=True)
        
        chrome_options.add_argument(f'--user-data-dir={profile_dir}')
        chrome_options.add_argument('--profile-directory=Default')
        chrome_options.add_argument('--no-first-run')
        chrome_options.add_argument('--no-default-browser-check')
        chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
        
        driver = webdriver.Chrome(options=chrome_options)
        
        try:
            driver.get('https://www.facebook.com')
            time.sleep(2)
            
            driver.delete_all_cookies()
            
            for cookie in cookies:
                try:
                    cd = {
                        'name': cookie.get('name', ''), 
                        'value': cookie.get('value', ''), 
                        'domain': cookie.get('domain', '.facebook.com'), 
                        'path': cookie.get('path', '/')
                    }
                    if 'secure' in cookie: 
                        cd['secure'] = cookie['secure']
                    if 'httpOnly' in cookie: 
                        cd['httpOnly'] = cookie['httpOnly']
                    if 'expirationDate' in cookie: 
                        cd['expiry'] = int(float(cookie['expirationDate']))
                    driver.add_cookie(cd)
                except:
                    pass
            
            driver.refresh()
            time.sleep(3)\n            \n            # Auto login if password is provided
            password = account.get('password', '')
            if password:
                try:
                    # Check if login form is present
                    pwd_field = driver.find_elements(By.NAME, 'pass')
                    if pwd_field:
                        pwd_field[0].send_keys(password)
                        login_btn = driver.find_elements(By.NAME, 'login')
                        if login_btn:
                            login_btn[0].click()
                            time.sleep(3)
                except:
                    pass  # Already logged in or no login form
            
            # Add toolbar
            toolbar_js = '''
var toolbar = document.createElement('div');
toolbar.style.cssText = 'position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:12px;display:flex;gap:6px;z-index:999999;box-shadow:0 4px 12px rgba(0,0,0,0.3);flex-wrap:wrap;';

var btns = [
    ['Facebook', 'https://www.facebook.com'],
    ['Business Manager', 'https://business.facebook.com'],
    ['Ads Manager', 'https://adsmanager.facebook.com/adsmanager'],
    ['Reklam Olustur', 'https://www.facebook.com/ads/create'],
    ['Kampanyalar', 'https://www.facebook.com/ads/manager/campaigns'],
    ['Sayfa Yonetimi', 'https://www.facebook.com/pages'],
    ['Faturalandirma', 'https://www.facebook.com/settings?tab=payments'],
    ['Odeme Yontemleri', 'https://www.facebook.com/ads/manager/account_settings/account_billing/'],
    ['Hesap Ayarlari', 'https://www.facebook.com/settings'},
    ['Reklam Hesabi', 'https://www.facebook.com/ads/manager/account_settings/account_info/'],
    ['Profil', 'https://www.facebook.com/me']
];

btns.forEach(function(b){
    var btn = document.createElement('button');
    btn.textContent = b[0];
    btn.style.cssText = 'background:#fff;color:#667eea;border:none;padding:8px 14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:11px;transition:all 0.2s;';
    btn.onmouseover = function(){ this.style.background='#f3f4f6'; this.style.transform='translateY(-2px)'; };
    btn.onmouseout = function(){ this.style.background='#fff'; this.style.transform='translateY(0)'; };
    btn.onclick = function(){ window.location.href = b[1]; };
    toolbar.appendChild(btn);
});

var close = document.createElement('button');
close.textContent = 'X';
close.style.cssText = 'background:#ef4444;color:#fff;border:none;padding:8px 12px;border-radius:8px;font-weight:600;cursor:pointer;margin-left:auto;';
close.onclick = function(){ toolbar.remove(); document.body.style.paddingTop='0'; };
toolbar.appendChild(close);

document.body.insertBefore(toolbar, document.body.firstChild);
document.body.style.paddingTop = '65px';
'''
            driver.execute_script(toolbar_js)
            
        except Exception as e:
            driver.quit()
            raise e
    
    def delete_account(self):
        sel = self.listbox.curselection()
        if not sel:
            messagebox.showwarning("Uyari", "Lutfen hesap secin!")
            return
        
        if messagebox.askyesno("Onay", f"{self.accounts[sel[0]]['name']} silinsin mi?"):
            self.accounts.pop(sel[0])
            self.save_accounts()
            self.refresh_list()
            messagebox.showinfo("Basarili", "Hesap silindi!")
    
    def refresh(self):
        self.load_accounts()
        self.refresh_list()
        messagebox.showinfo("Bilgi", "Yenilendi!")
    
    def install_requirements(self):
        """Install Python requirements"""
        msg = messagebox.askyesno(
            "Gereksinimler",
            "Selenium kurulacak. Devam edilsin mi?\\n\\nInternet baglantisi gereklidir."
        )
        
        if msg:
            loading = tk.Toplevel(self.root)
            loading.title("Yukleniyor...")
            loading.geometry("400x200")
            loading.configure(bg='white')
            loading.transient(self.root)
            
            tk.Label(loading, text="Selenium yukleniyor...", font=('Arial', 14), bg='white').pack(pady=30)
            
            progress = ttk.Progressbar(loading, mode='indeterminate', length=300)
            progress.pack(pady=10)
            progress.start()
            
            loading.update()
            
            try:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'selenium', '--quiet'])
                loading.destroy()
                messagebox.showinfo("Basarili", "Selenium yuklendi!\\n\\nProgrami yeniden baslatin.")
                self.root.quit()
            except Exception as e:
                loading.destroy()
                messagebox.showerror("Hata", f"Yuklenemedi:\\n{e}")
    
    def show_help(self):
        help_text = """
PLATOON FACEBOOK MANAGER - YARDIM

KULLANIM:
1. Web sitesinden JSON dosyasi indirin
2. \"Hesap Ekle\" ile hesap ekleyin
3. \"HESABI AC\" ile Facebook'u acin
4. Tarayicidaki kisayol butonlari ile yonetin!

KISAYOLLAR:
- Business Manager
- Ads Manager
- Reklam Olustur
- Kampanyalar
- Faturalandirma
- Odeme Yontemleri
- ve daha fazlasi!

GEREKSINIMLER:
- Python 3.x
- Selenium (Gereksinimler butonundan yukleyin)
- Google Chrome

DESTEK:
Web sitesi uzerinden destek alin.
        """
        
        hw = tk.Toplevel(self.root)
        hw.title("Yardim")
        hw.geometry("650x550")
        hw.configure(bg='white')
        
        text = tk.Text(hw, wrap='word', font=('Arial', 10), padx=20, pady=20, bg='#f9fafb')
        text.pack(fill='both', expand=True)
        text.insert('1.0', help_text)
        text.config(state='disabled')

def main():
    root = tk.Tk()
    app = PlatoonFacebookManager(root)
    root.mainloop()

if __name__ == '__main__':
    main()
