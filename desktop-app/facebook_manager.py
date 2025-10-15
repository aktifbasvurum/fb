#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PLATOON FACEBOOK MANAGER
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import os
import sys
from pathlib import Path
import subprocess
import traceback

def log_error(error_msg):
    try:
        log_dir = Path(os.getenv('LOCALAPPDATA') or os.getenv('APPDATA') or Path.home()) / 'PlatoonFacebookManager'
        log_dir.mkdir(exist_ok=True)
        log_file = log_dir / 'error.log'
        with open(log_file, 'a', encoding='utf-8') as f:
            from datetime import datetime
            f.write(f"\n{'='*50}\n{datetime.now()}\n{error_msg}\n")
        return str(log_file)
    except:
        return None

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    SELENIUM_AVAILABLE = True
except:
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
        
        self.first_run_file = self.accounts_dir / '.first_run'
        if not self.first_run_file.exists():
            self.show_welcome()
            self.first_run_file.touch()
        
        self.load_accounts()
        self.create_ui()
        
        if not SELENIUM_AVAILABLE:
            self.root.after(1000, self.show_selenium_warning)
    
    def show_welcome(self):
        try:
            messagebox.showinfo("PLATOON FACEBOOK MANAGER", "Bu program UCRETSIZ ve SURESIZ kullanabilirsiniz!\\n\\nOzellikler:\\n- Sinirsiz hesap\\n- Otomatik giris\\n- Hizli kisayollar\\n\\nBaslayin!")
        except:
            pass
    
    def create_ui(self):
        header = tk.Frame(self.root, bg='#667eea', pady=25)
        header.pack(fill='x')
        
        tk.Label(header, text="PLATOON", font=('Arial', 32, 'bold'), bg='#667eea', fg='white').pack()
        tk.Label(header, text="FACEBOOK MANAGER", font=('Arial', 18), bg='#667eea', fg='#fbbf24').pack()
        tk.Label(header, text="Ucretsiz & Suresiz", font=('Arial', 10), bg='#667eea', fg='white').pack(pady=(5,0))
        
        content = tk.Frame(self.root, bg='white', padx=25, pady=25)
        content.pack(fill='both', expand=True, padx=25, pady=(0, 25))
        
        btn_frame = tk.Frame(content, bg='white')
        btn_frame.pack(fill='x', pady=(0, 20))
        
        tk.Button(btn_frame, text="+ Hesap Ekle", command=self.add_account, bg='#10b981', fg='white', font=('Arial', 12, 'bold'), padx=20, pady=12, relief='flat', cursor='hand2').pack(side='left', padx=5)
        tk.Button(btn_frame, text="Yenile", command=self.refresh, bg='#3b82f6', fg='white', font=('Arial', 12, 'bold'), padx=20, pady=12, relief='flat', cursor='hand2').pack(side='left', padx=5)
        tk.Button(btn_frame, text="Yardim", command=self.show_help, bg='#f59e0b', fg='white', font=('Arial', 12, 'bold'), padx=20, pady=12, relief='flat', cursor='hand2').pack(side='left', padx=5)
        tk.Button(btn_frame, text="Selenium Kur", command=self.install_requirements, bg='#8b5cf6', fg='white', font=('Arial', 12, 'bold'), padx=20, pady=12, relief='flat', cursor='hand2').pack(side='left', padx=5)
        
        tk.Label(content, text="Hesaplar:", font=('Arial', 14, 'bold'), bg='white', fg='#1f2937').pack(anchor='w', pady=(0, 10))
        
        list_frame = tk.Frame(content, bg='white')
        list_frame.pack(fill='both', expand=True)
        
        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side='right', fill='y')
        
        self.listbox = tk.Listbox(list_frame, font=('Arial', 11), bg='#f9fafb', fg='#1f2937', selectbackground='#667eea', selectforeground='white', relief='flat', highlightthickness=1, highlightbackground='#e5e7eb', yscrollcommand=scrollbar.set, height=15)
        self.listbox.pack(side='left', fill='both', expand=True)
        scrollbar.config(command=self.listbox.yview)
        
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
        try:
            self.listbox.delete(0, tk.END)
            for i, acc in enumerate(self.accounts):
                pwd = acc.get('password', '')
                pwd_text = f" | Sifre: {pwd}" if pwd else ""
                text = f"{i+1}. {acc.get('name', 'Hesap')}{pwd_text}"
                self.listbox.insert(tk.END, text)
        except:
            pass
    
    def add_account(self):
        try:
            win = tk.Toplevel(self.root)
            win.title("Hesap Ekle")
            win.geometry("650x550")
            win.configure(bg='white')
            win.transient(self.root)
            win.grab_set()
            
            tk.Label(win, text="Yeni Hesap Ekle", font=('Arial', 20, 'bold'), bg='white', fg='#1f2937').pack(pady=20)
            
            tk.Label(win, text="Hesap Adi:", bg='white', font=('Arial', 11, 'bold')).pack(anchor='w', padx=30)
            name_entry = tk.Entry(win, font=('Arial', 11), width=50)
            name_entry.pack(padx=30, pady=(5, 12))
            
            tk.Label(win, text="Hesap Sifresi (Facebook):", bg='white', font=('Arial', 11, 'bold')).pack(anchor='w', padx=30)
            pwd_entry = tk.Entry(win, font=('Arial', 11), width=50)
            pwd_entry.pack(padx=30, pady=(5, 12))
            
            tk.Label(win, text="Cookie Dosyasi (JSON):", bg='white', font=('Arial', 11, 'bold')).pack(anchor='w', padx=30)
            
            cookie_frame = tk.Frame(win, bg='white')
            cookie_frame.pack(padx=30, pady=(5, 12), fill='x')
            
            cookie_var = tk.StringVar()
            tk.Entry(cookie_frame, textvariable=cookie_var, font=('Arial', 11), state='readonly').pack(side='left', fill='x', expand=True, padx=(0, 10))
            
            def browse():
                f = filedialog.askopenfilename(title="JSON Sec", filetypes=[("JSON", "*.json"), ("All", "*.*")])
                if f:
                    cookie_var.set(f)
            
            tk.Button(cookie_frame, text="Gozat", command=browse, bg='#3b82f6', fg='white', font=('Arial', 10, 'bold'), padx=15, pady=8, relief='flat').pack()
            
            tk.Label(win, text="Web sitesinden indirdiginiz JSON dosyasini secin", bg='#fef3c7', fg='#78350f', font=('Arial', 9), padx=10, pady=10).pack(padx=30, pady=10, fill='x')
            
            btn_frame = tk.Frame(win, bg='white')
            btn_frame.pack(pady=20)
            
            def save():
                try:
                    name = name_entry.get().strip()
                    pwd = pwd_entry.get().strip()
                    cf = cookie_var.get()
                    
                    if not name or not cf:
                        messagebox.showwarning("Uyari", "Hesap adi ve cookie dosyasi gerekli!")
                        return
                    
                    with open(cf, 'r', encoding='utf-8') as f:
                        cookies_data = json.load(f)
                    
                    self.accounts.append({'name': name, 'password': pwd, 'cookies': cookies_data})
                    self.save_accounts()
                    self.refresh_list()
                    messagebox.showinfo("Basarili", "Hesap eklendi!")
                    win.destroy()
                except Exception as e:
                    log_error(f"Save error: {traceback.format_exc()}")
                    messagebox.showerror("Hata", f"Eklenemedi: {str(e)[:150]}")
            
            tk.Button(btn_frame, text="Kaydet", command=save, bg='#10b981', fg='white', font=('Arial', 12, 'bold'), padx=30, pady=12, relief='flat').pack(side='left', padx=5)
            tk.Button(btn_frame, text="Iptal", command=win.destroy, bg='#6b7280', fg='white', font=('Arial', 12, 'bold'), padx=30, pady=12, relief='flat').pack(side='left', padx=5)
        except Exception as e:
            log_error(f"Add window error: {traceback.format_exc()}")
            messagebox.showerror("Hata", str(e))
    
    def open_account(self):
        try:
            sel = self.listbox.curselection()
            if not sel:
                messagebox.showwarning("Uyari", "Lutfen hesap secin!")
                return
            
            if not SELENIUM_AVAILABLE:
                result = messagebox.askyesno("Selenium Gerekli", "Selenium kurulu degil!\\n\\nSimdi kurmak ister misiniz?")
                if result:
                    self.install_requirements()
                return
            
            acc = self.accounts[sel[0]]
            
            loading = tk.Toplevel(self.root)
            loading.title("Yukleniyor...")
            loading.geometry("350x150")
            loading.configure(bg='white')
            loading.transient(self.root)
            
            tk.Label(loading, text="Facebook aciliyor...", font=('Arial', 14, 'bold'), bg='white').pack(pady=30)
            progress = ttk.Progressbar(loading, mode='indeterminate', length=250)
            progress.pack(pady=10)
            progress.start()
            loading.update()
            
            import threading
            
            def open_thread():
                try:
                    self.open_with_selenium(acc)
                    loading.destroy()
                    messagebox.showinfo("Basarili", f"{acc['name']} acildi!")
                except Exception as e:
                    loading.destroy()
                    log_file = log_error(f"Open error: {traceback.format_exc()}")
                    messagebox.showerror("Hata", f"Acilamadi: {str(e)[:150]}")
            
            threading.Thread(target=open_thread, daemon=True).start()
        except Exception as e:
            log_error(f"Open account error: {traceback.format_exc()}")
            messagebox.showerror("Hata", str(e))
    
    def open_with_selenium(self, account):
        import time
        
        cookies_data = account.get('cookies', {})
        
        if isinstance(cookies_data, dict) and 'cookies' in cookies_data:
            cookies = cookies_data['cookies']
        elif isinstance(cookies_data, list):
            cookies = cookies_data
        else:
            raise ValueError("Gecersiz cookie formati")
        
        chrome_options = Options()
        profile_name = account.get('name', 'Default').replace(' ', '_').replace('/', '_')
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
            time.sleep(3)
            driver.delete_all_cookies()
            
            for cookie in cookies:
                try:
                    cd = {'name': str(cookie.get('name', '')), 'value': str(cookie.get('value', '')), 'domain': str(cookie.get('domain', '.facebook.com')), 'path': str(cookie.get('path', '/'))}
                    if 'secure' in cookie: cd['secure'] = bool(cookie['secure'])
                    if 'httpOnly' in cookie: cd['httpOnly'] = bool(cookie['httpOnly'])
                    if 'expirationDate' in cookie: cd['expiry'] = int(float(cookie['expirationDate']))
                    driver.add_cookie(cd)
                except:
                    pass
            
            driver.refresh()
            time.sleep(4)
            
            pwd = account.get('password', '')
            if pwd:
                try:
                    pf = driver.find_elements(By.NAME, 'pass')
                    if pf:
                        pf[0].send_keys(pwd)
                        lb = driver.find_elements(By.NAME, 'login')
                        if lb:
                            lb[0].click()
                            time.sleep(4)
                except:
                    pass
            
            toolbar = """
var t=document.createElement('div');
t.style.cssText='position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#667eea,#764ba2);padding:12px;display:flex;gap:6px;z-index:999999;box-shadow:0 4px 12px rgba(0,0,0,0.3);flex-wrap:wrap';

var btns=[['Facebook','https://www.facebook.com'],['Business Manager','https://business.facebook.com'],['Ads Manager','https://adsmanager.facebook.com/adsmanager'],['Reklam Olustur','https://www.facebook.com/ads/create'],['Kampanyalar','https://www.facebook.com/ads/manager/campaigns'],['Sayfa Yonetimi','https://www.facebook.com/pages'],['Faturalandirma','https://www.facebook.com/settings?tab=payments'],['Odeme','https://www.facebook.com/ads/manager/account_settings/account_billing/'],['Hesap Ayar','https://www.facebook.com/settings'],['Reklam Hesabi','https://www.facebook.com/ads/manager/account_settings/account_info/'],['Profil','https://www.facebook.com/me']];

btns.forEach(function(b){var btn=document.createElement('button');btn.textContent=b[0];btn.style.cssText='background:#fff;color:#667eea;border:none;padding:8px 14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:11px;transition:all 0.2s;white-space:nowrap';btn.onmouseover=function(){this.style.background='#f3f4f6';this.style.transform='translateY(-2px)'};btn.onmouseout=function(){this.style.background='#fff';this.style.transform='translateY(0)'};btn.onclick=function(){window.location.href=b[1]};t.appendChild(btn)});

var c=document.createElement('button');c.textContent='X';c.style.cssText='background:#ef4444;color:#fff;border:none;padding:8px 14px;border-radius:8px;font-weight:600;cursor:pointer;margin-left:auto';c.onclick=function(){t.remove();document.body.style.paddingTop='0'};t.appendChild(c);

document.body.insertBefore(t,document.body.firstChild);
document.body.style.paddingTop='70px';
"""
            try:
                driver.execute_script(toolbar)
            except:
                pass
        except:
            driver.quit()
            raise
    
    def delete_account(self):
        try:
            sel = self.listbox.curselection()
            if not sel:
                messagebox.showwarning("Uyari", "Hesap secin!")
                return
            if messagebox.askyesno("Onay", "Silinsin mi?"):
                self.accounts.pop(sel[0])
                self.save_accounts()
                self.refresh_list()
                messagebox.showinfo("Basarili", "Silindi!")
        except Exception as e:
            messagebox.showerror("Hata", str(e))
    
    def refresh(self):
        self.load_accounts()
        self.refresh_list()
        messagebox.showinfo("Bilgi", f"{len(self.accounts)} hesap!")
    
    def install_requirements(self):
        try:
            if messagebox.askyesno("Selenium", "Selenium kurulsun mu?"):
                loading = tk.Toplevel(self.root)
                loading.title("Yukleniyor...")
                loading.geometry("400x150")
                loading.configure(bg='white')
                tk.Label(loading, text="Selenium kuruluyor...", font=('Arial', 14), bg='white').pack(pady=30)
                progress = ttk.Progressbar(loading, mode='indeterminate', length=300)
                progress.pack(pady=10)
                progress.start()
                loading.update()
                
                try:
                    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'selenium', '--quiet'])
                    loading.destroy()
                    messagebox.showinfo("Basarili", "Selenium kuruldu! Program yeniden baslatiliyor...")
                    self.root.quit()
                    os.execl(sys.executable, sys.executable, *sys.argv)
                except Exception as e:
                    loading.destroy()
                    messagebox.showerror("Hata", f"Kurulamadi: {e}")
        except Exception as e:
            messagebox.showerror("Hata", str(e))
    
    def show_help(self):
        try:
            help_text = f"""PLATOON FACEBOOK MANAGER

KULLANIM:
1. Web sitesinden JSON indir
2. + Hesap Ekle
3. JSON sec, sifre gir
4. HESABI AC

KISAYOLLAR:
Tarayicida 11 buton:
- Business Manager
- Ads Manager
- Reklam Olustur
- Kampanyalar
- Faturalandirma
- ve daha fazla!

GEREKSINIMLER:
- Python 3.x
- Selenium (Selenium Kur butonu)
- Google Chrome

VERI:
{self.accounts_file}

HATA LOG:
{self.accounts_dir / 'error.log'}
"""
            hw = tk.Toplevel(self.root)
            hw.title("Yardim")
            hw.geometry("650x500")
            hw.configure(bg='white')
            text = tk.Text(hw, wrap='word', font=('Courier', 9), padx=20, pady=20, bg='#f9fafb')
            text.pack(fill='both', expand=True)
            text.insert('1.0', help_text)
            text.config(state='disabled')
        except Exception as e:
            messagebox.showerror("Hata", str(e))
    
    def show_selenium_warning(self):
        try:
            result = messagebox.askyesno("Selenium Gerekli", "Selenium kurulu degil.\\n\\nSimdi kurmak ister misiniz?")
            if result:
                self.install_requirements()
        except:
            pass

def main():
    try:
        root = tk.Tk()
        app = PlatoonFacebookManager(root)
        root.mainloop()
    except Exception as e:
        error_msg = f"KRITIK HATA:\\n{traceback.format_exc()}"
        log_file = log_error(error_msg)
        
        try:
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror("Program Hatasi", f"Program baslatılamadi!\\n\\n{str(e)[:200]}\\n\\nLog: {log_file}")
            root.destroy()
        except:
            print("="*50)
            print("HATA!")
            print("="*50)
            print(error_msg)
            input("Enter...")
        
        sys.exit(1)

if __name__ == '__main__':
    main()
