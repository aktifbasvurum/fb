#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Facebook Account Manager - Desktop Application
Simple GUI to manage and open Facebook accounts with cookies
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import os
import sys
from pathlib import Path
import webbrowser

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

class FacebookAccountManager:
    def __init__(self, root):
        self.root = root
        self.root.title("Facebook Account Manager")
        self.root.geometry("800x600")
        self.root.configure(bg='#667eea')
        
        # Data
        self.accounts = []
        self.accounts_dir = Path(os.getenv('LOCALAPPDATA')) / 'FacebookAccountManager'
        self.accounts_dir.mkdir(exist_ok=True)
        self.accounts_file = self.accounts_dir / 'accounts.json'
        
        # Load accounts
        self.load_accounts()
        
        # Create UI
        self.create_ui()
        
    def create_ui(self):
        # Header
        header_frame = tk.Frame(self.root, bg='#667eea', pady=20)
        header_frame.pack(fill='x')
        
        title_label = tk.Label(
            header_frame,
            text="Facebook Account Manager",
            font=('Arial', 24, 'bold'),
            bg='#667eea',
            fg='white'
        )
        title_label.pack()
        
        subtitle_label = tk.Label(
            header_frame,
            text="Hesaplarınızı yönetin ve tek tıkla açın",
            font=('Arial', 12),
            bg='#667eea',
            fg='white'
        )
        subtitle_label.pack()
        
        # Main content
        content_frame = tk.Frame(self.root, bg='white', padx=20, pady=20)
        content_frame.pack(fill='both', expand=True, padx=20, pady=(0, 20))
        
        # Buttons frame
        btn_frame = tk.Frame(content_frame, bg='white')
        btn_frame.pack(fill='x', pady=(0, 20))
        
        add_btn = tk.Button(
            btn_frame,
            text="➕ Hesap Ekle",
            command=self.add_account,
            bg='#10b981',
            fg='white',
            font=('Arial', 12, 'bold'),
            padx=20,
            pady=10,
            relief='flat',
            cursor='hand2'
        )
        add_btn.pack(side='left', padx=5)
        
        refresh_btn = tk.Button(
            btn_frame,
            text="🔄 Yenile",
            command=self.refresh_accounts,
            bg='#3b82f6',
            fg='white',
            font=('Arial', 12, 'bold'),
            padx=20,
            pady=10,
            relief='flat',
            cursor='hand2'
        )
        refresh_btn.pack(side='left', padx=5)
        
        help_btn = tk.Button(
            btn_frame,
            text="❓ Yardım",
            command=self.show_help,
            bg='#f59e0b',
            fg='white',
            font=('Arial', 12, 'bold'),
            padx=20,
            pady=10,
            relief='flat',
            cursor='hand2'
        )
        help_btn.pack(side='left', padx=5)
        
        # Accounts list
        list_label = tk.Label(
            content_frame,
            text="Hesaplarım:",
            font=('Arial', 14, 'bold'),
            bg='white',
            fg='#1f2937'
        )
        list_label.pack(anchor='w', pady=(0, 10))
        
        # Scrollable frame
        list_frame = tk.Frame(content_frame, bg='white')
        list_frame.pack(fill='both', expand=True)
        
        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side='right', fill='y')
        
        self.accounts_listbox = tk.Listbox(
            list_frame,
            font=('Arial', 11),
            bg='#f9fafb',
            fg='#1f2937',
            selectbackground='#667eea',
            selectforeground='white',
            relief='flat',
            highlightthickness=1,
            highlightbackground='#e5e7eb',
            yscrollcommand=scrollbar.set
        )
        self.accounts_listbox.pack(side='left', fill='both', expand=True)
        scrollbar.config(command=self.accounts_listbox.yview)
        
        # Action buttons
        action_frame = tk.Frame(content_frame, bg='white')
        action_frame.pack(fill='x', pady=(20, 0))
        
        open_btn = tk.Button(
            action_frame,
            text="🚀 Hesabı Aç",
            command=self.open_account,
            bg='#667eea',
            fg='white',
            font=('Arial', 14, 'bold'),
            padx=30,
            pady=15,
            relief='flat',
            cursor='hand2'
        )
        open_btn.pack(side='left', padx=5, expand=True, fill='x')
        
        delete_btn = tk.Button(
            action_frame,
            text="🗑️ Sil",
            command=self.delete_account,
            bg='#ef4444',
            fg='white',
            font=('Arial', 14, 'bold'),
            padx=30,
            pady=15,
            relief='flat',
            cursor='hand2'
        )
        delete_btn.pack(side='left', padx=5, expand=True, fill='x')
        
        # Populate list
        self.refresh_list()
        
        # Check Selenium
        if not SELENIUM_AVAILABLE:
            self.show_selenium_warning()
    
    def load_accounts(self):
        """Load accounts from JSON file"""
        if self.accounts_file.exists():
            try:
                with open(self.accounts_file, 'r', encoding='utf-8') as f:
                    self.accounts = json.load(f)
            except Exception as e:
                messagebox.showerror("Hata", f"Hesaplar yüklenemedi: {e}")
                self.accounts = []
        else:
            self.accounts = []
    
    def save_accounts(self):
        """Save accounts to JSON file"""
        try:
            with open(self.accounts_file, 'w', encoding='utf-8') as f:
                json.dump(self.accounts, f, indent=2, ensure_ascii=False)
        except Exception as e:
            messagebox.showerror("Hata", f"Hesaplar kaydedilemedi: {e}")
    
    def refresh_list(self):
        """Refresh accounts listbox"""
        self.accounts_listbox.delete(0, tk.END)
        for i, account in enumerate(self.accounts):
            display_text = f"{i+1}. {account.get('name', 'Hesap')} - {account.get('email', 'N/A')}"
            self.accounts_listbox.insert(tk.END, display_text)
    
    def add_account(self):
        """Add new account"""
        add_window = tk.Toplevel(self.root)
        add_window.title("Hesap Ekle")
        add_window.geometry("600x500")
        add_window.configure(bg='white')
        
        # Center window
        add_window.transient(self.root)
        add_window.grab_set()
        
        # Title
        title = tk.Label(
            add_window,
            text="Yeni Hesap Ekle",
            font=('Arial', 18, 'bold'),
            bg='white',
            fg='#1f2937'
        )
        title.pack(pady=20)
        
        # Name
        tk.Label(add_window, text="Hesap Adı:", bg='white', font=('Arial', 11)).pack(anchor='w', padx=30)
        name_entry = tk.Entry(add_window, font=('Arial', 11), width=50)
        name_entry.pack(padx=30, pady=(5, 15))
        
        # Email
        tk.Label(add_window, text="Email (opsiyonel):", bg='white', font=('Arial', 11)).pack(anchor='w', padx=30)
        email_entry = tk.Entry(add_window, font=('Arial', 11), width=50)
        email_entry.pack(padx=30, pady=(5, 15))
        
        # Cookie file
        tk.Label(add_window, text="Cookie Dosyası (JSON):", bg='white', font=('Arial', 11)).pack(anchor='w', padx=30)
        
        cookie_frame = tk.Frame(add_window, bg='white')
        cookie_frame.pack(padx=30, pady=(5, 15), fill='x')
        
        cookie_path_var = tk.StringVar()
        cookie_entry = tk.Entry(cookie_frame, textvariable=cookie_path_var, font=('Arial', 11), state='readonly')
        cookie_entry.pack(side='left', fill='x', expand=True, padx=(0, 10))
        
        def browse_cookie():
            filename = filedialog.askopenfilename(
                title="Cookie JSON Dosyası Seç",
                filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
            )
            if filename:
                cookie_path_var.set(filename)
        
        browse_btn = tk.Button(
            cookie_frame,
            text="Gözat",
            command=browse_cookie,
            bg='#3b82f6',
            fg='white',
            font=('Arial', 10, 'bold'),
            padx=15,
            pady=5,
            relief='flat'
        )
        browse_btn.pack(side='left')
        
        # Instructions
        info_text = """
VEYA web sitesinden indirdiğiniz hesap JSON dosyasını seçin.
Cookie formatı: JSON array veya {"cookies": [...]}
        """
        info_label = tk.Label(
            add_window,
            text=info_text,
            bg='#fef3c7',
            fg='#78350f',
            font=('Arial', 9),
            justify='left',
            padx=10,
            pady=10
        )
        info_label.pack(padx=30, pady=10, fill='x')
        
        # Buttons
        btn_frame = tk.Frame(add_window, bg='white')
        btn_frame.pack(pady=20)
        
        def save():
            name = name_entry.get().strip()
            email = email_entry.get().strip()
            cookie_file = cookie_path_var.get()
            
            if not name:
                messagebox.showwarning("Uyarı", "Lütfen hesap adı girin!")
                return
            
            if not cookie_file:
                messagebox.showwarning("Uyarı", "Lütfen cookie dosyası seçin!")
                return
            
            # Load cookies
            try:
                with open(cookie_file, 'r', encoding='utf-8') as f:
                    cookies_data = json.load(f)
                
                account = {
                    'name': name,
                    'email': email,
                    'cookies': cookies_data
                }
                
                self.accounts.append(account)
                self.save_accounts()
                self.refresh_list()
                
                messagebox.showinfo("Başarılı", "Hesap eklendi!")
                add_window.destroy()
                
            except Exception as e:
                messagebox.showerror("Hata", f"Cookie dosyası okunamadı: {e}")
        
        save_btn = tk.Button(
            btn_frame,
            text="Kaydet",
            command=save,
            bg='#10b981',
            fg='white',
            font=('Arial', 12, 'bold'),
            padx=30,
            pady=10,
            relief='flat'
        )
        save_btn.pack(side='left', padx=5)
        
        cancel_btn = tk.Button(
            btn_frame,
            text="İptal",
            command=add_window.destroy,
            bg='#6b7280',
            fg='white',
            font=('Arial', 12, 'bold'),
            padx=30,
            pady=10,
            relief='flat'
        )
        cancel_btn.pack(side='left', padx=5)
    
    def open_account(self):
        """Open selected account"""
        selection = self.accounts_listbox.curselection()
        if not selection:
            messagebox.showwarning("Uyarı", "Lütfen bir hesap seçin!")
            return
        
        if not SELENIUM_AVAILABLE:
            messagebox.showerror(
                "Hata",
                "Selenium kurulu değil!\n\nKomut İstemini açın ve şunu çalıştırın:\npip install selenium"
            )
            return
        
        idx = selection[0]
        account = self.accounts[idx]
        
        # Show loading
        loading_window = tk.Toplevel(self.root)
        loading_window.title("Yükleniyor...")
        loading_window.geometry("300x150")
        loading_window.configure(bg='white')
        loading_window.transient(self.root)
        
        tk.Label(
            loading_window,
            text="Facebook açılıyor...",
            font=('Arial', 14),
            bg='white'
        ).pack(pady=30)
        
        progress = ttk.Progressbar(loading_window, mode='indeterminate', length=200)
        progress.pack(pady=10)
        progress.start()
        
        loading_window.update()
        
        # Open in separate thread to avoid freezing
        import threading
        
        def open_thread():
            try:
                self.open_facebook_with_cookies(account)
                loading_window.destroy()
                messagebox.showinfo("Başarılı", "Facebook hesabı açıldı!")
            except Exception as e:
                loading_window.destroy()
                messagebox.showerror("Hata", f"Hesap açılamadı:\n{str(e)}")
        
        thread = threading.Thread(target=open_thread, daemon=True)
        thread.start()
    
    def open_facebook_with_cookies(self, account):
        """Open Facebook with cookies using Selenium"""
        import time
        
        # Parse cookies
        cookies_data = account['cookies']
        if isinstance(cookies_data, dict) and 'cookies' in cookies_data:
            cookies = cookies_data['cookies']
        elif isinstance(cookies_data, list):
            cookies = cookies_data
        else:
            raise ValueError("Invalid cookie format")
        
        # Setup Chrome
        chrome_options = Options()
        profile_name = account['name'].replace(' ', '_')
        profile_dir = self.accounts_dir / 'profiles' / profile_name
        profile_dir.mkdir(parents=True, exist_ok=True)
        
        chrome_options.add_argument(f'--user-data-dir={profile_dir}')
        chrome_options.add_argument('--profile-directory=Default')
        chrome_options.add_argument('--no-first-run')
        chrome_options.add_argument('--no-default-browser-check')
        
        # Start Chrome
        driver = webdriver.Chrome(options=chrome_options)
        
        try:
            # Go to Facebook
            driver.get('https://www.facebook.com')
            time.sleep(2)
            
            # Clear cookies
            driver.delete_all_cookies()
            
            # Add cookies
            for cookie in cookies:
                try:
                    cookie_dict = {
                        'name': cookie.get('name', ''),
                        'value': cookie.get('value', ''),
                        'domain': cookie.get('domain', '.facebook.com'),
                        'path': cookie.get('path', '/'),
                    }
                    
                    if 'secure' in cookie:
                        cookie_dict['secure'] = cookie['secure']
                    if 'httpOnly' in cookie:
                        cookie_dict['httpOnly'] = cookie['httpOnly']
                    if 'expirationDate' in cookie:
                        cookie_dict['expiry'] = int(float(cookie['expirationDate']))
                    
                    driver.add_cookie(cookie_dict)
                except:
                    pass
            
            # Refresh
            driver.refresh()
            time.sleep(2)
            
        except Exception as e:
            driver.quit()
            raise e
    
    def delete_account(self):
        """Delete selected account"""
        selection = self.accounts_listbox.curselection()
        if not selection:
            messagebox.showwarning("Uyarı", "Lütfen bir hesap seçin!")
            return
        
        idx = selection[0]
        account = self.accounts[idx]
        
        result = messagebox.askyesno(
            "Onay",
            f"{account['name']} hesabını silmek istediğinize emin misiniz?"
        )
        
        if result:
            self.accounts.pop(idx)
            self.save_accounts()
            self.refresh_list()
            messagebox.showinfo("Başarılı", "Hesap silindi!")
    
    def refresh_accounts(self):
        """Refresh accounts list"""
        self.load_accounts()
        self.refresh_list()
        messagebox.showinfo("Bilgi", "Hesaplar yenilendi!")
    
    def show_help(self):
        """Show help dialog"""
        help_text = """
FACEBOOK ACCOUNT MANAGER - YARDIM

1. HESAP EKLEME:
   - "Hesap Ekle" butonuna tıklayın
   - Hesap adı girin
   - Web sitesinden indirdiğiniz JSON dosyasını seçin
   - Kaydet

2. HESAP AÇMA:
   - Listeden hesap seçin
   - "Hesabı Aç" butonuna tıklayın
   - Facebook otomatik açılır!

3. HESAP SİLME:
   - Listeden hesap seçin
   - "Sil" butonuna tıklayın

GEREKLİLİKLER:
- Python 3.x
- Selenium: pip install selenium
- Google Chrome

SORUN GİDERME:
- Selenium hatası: pip install selenium
- Chrome hatası: Chrome yükleyin
        """
        
        help_window = tk.Toplevel(self.root)
        help_window.title("Yardım")
        help_window.geometry("600x500")
        help_window.configure(bg='white')
        
        text_widget = tk.Text(
            help_window,
            wrap='word',
            font=('Arial', 10),
            padx=20,
            pady=20,
            bg='#f9fafb'
        )
        text_widget.pack(fill='both', expand=True)
        text_widget.insert('1.0', help_text)
        text_widget.config(state='disabled')
    
    def show_selenium_warning(self):
        """Show warning if Selenium is not installed"""
        messagebox.showwarning(
            "Uyarı",
            "Selenium kurulu değil!\n\n" +
            "Hesapları açmak için Selenium gereklidir.\n\n" +
            "Komut İstemini açın ve şunu çalıştırın:\n" +
            "pip install selenium\n\n" +
            "Sonra programı yeniden başlatın."
        )

def main():
    root = tk.Tk()
    app = FacebookAccountManager(root)
    root.mainloop()

if __name__ == '__main__':
    main()
