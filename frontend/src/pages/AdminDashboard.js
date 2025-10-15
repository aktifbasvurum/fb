import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CreditCard, Package, PlusCircle, LogOut, Check, X, Settings } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminDashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [walletAddress, setWalletAddress] = useState('');
  const [telegramSettings, setTelegramSettings] = useState({ bot_token: '', chat_id: '' });
  const [balanceForm, setBalanceForm] = useState(0);
  const [accountForm, setAccountForm] = useState({ category_id: '', cookie_data: '', password: '', price_tl: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes, paymentsRes, categoriesRes, accountsRes, walletRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/users`, { headers }),
        axios.get(`${API}/admin/payment-requests`, { headers }),
        axios.get(`${API}/admin/categories`, { headers }),
        axios.get(`${API}/admin/accounts`, { headers }),
        axios.get(`${API}/payment/wallet-address`, { headers })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPayments(paymentsRes.data);
      setCategories(categoriesRes.data);
      setAccounts(accountsRes.data);
      setWalletAddress(walletRes.data.wallet_address || '');
      
      const tgRes = await axios.get(`${API}/admin/settings/telegram`, { headers }).catch(() => ({ data: { bot_token: '', chat_id: '' } }));
      setTelegramSettings(tgRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleApprovePayment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/payment-requests/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Odeme onaylandi!');
      fetchData();
    } catch (error) {
      toast.error('Onaylanamadi!');
    }
  };

  const handleRejectPayment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/payment-requests/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Odeme reddedildi!');
      fetchData();
    } catch (error) {
      toast.error('Reddedilemedi!');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingCategory) {
        await axios.put(`${API}/admin/categories/${editingCategory.id}`, categoryForm, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Kategori guncellendi!');
      } else {
        await axios.post(`${API}/admin/categories`, categoryForm, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Kategori olusturuldu!');
      }
      setShowCategoryDialog(false);
      setCategoryForm({ name: '', description: '' });
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      toast.error('Kategori kaydedilemedi!');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Kategoriyi silmek istediginize emin misiniz?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Kategori silindi!');
      fetchData();
    } catch (error) {
      toast.error('Silinemedi!');
    }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/admin/accounts`, accountForm, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Hesap eklendi!');
      setShowAccountDialog(false);
      setAccountForm({ category_id: '', cookie_data: '', password: '', price_tl: '' });
      fetchData();
    } catch (error) {
      toast.error('Eklenemedi!');
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Hesabi silmek istediginize emin misiniz?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/accounts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Hesap silindi!');
      fetchData();
    } catch (error) {
      toast.error('Silinemedi!');
    }
  };

  const handleUpdateBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/users/${editingUser.id}/balance`, { balance_tl: balanceForm }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Bakiye guncellendi!');
      setShowBalanceDialog(false);
      fetchData();
    } catch (error) {
      toast.error('Guncellenemedi!');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${API}/admin/settings/wallet?wallet_address=${encodeURIComponent(walletAddress)}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      
      if (telegramSettings.bot_token && telegramSettings.chat_id) {
        await axios.put(`${API}/admin/settings/telegram?bot_token=${encodeURIComponent(telegramSettings.bot_token)}&chat_id=${encodeURIComponent(telegramSettings.chat_id)}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }
      
      toast.success('Ayarlar kaydedildi!');
      setShowSettingsDialog(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kaydedilemedi!');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="glass-effect rounded-2xl p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Paneli</h1>
            <p className="text-white/80">Hos geldiniz, {user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowSettingsDialog(true)} variant="outline" className="border-white text-white hover:bg-white/10">
              <Settings className="mr-2 w-4 h-4" />Ayarlar
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-white text-white hover:bg-white/10">
              <LogOut className="mr-2 w-4 h-4" />Cikis
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2"><Users className="w-4 h-4" />Kullanicilar</CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{stats.total_users || 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2"><CreditCard className="w-4 h-4" />Bekleyen Odeme</CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-orange-600">{stats.pending_payments || 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2"><Package className="w-4 h-4" />Mevcut Hesap</CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-green-600">{stats.available_accounts || 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Satilan</CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-purple-600">{stats.sold_accounts || 0}</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="payments">Odemeler</TabsTrigger>
            <TabsTrigger value="users">Kullanicilar</TabsTrigger>
            <TabsTrigger value="categories">Kategoriler</TabsTrigger>
            <TabsTrigger value="accounts">Hesaplar</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card>
              <CardHeader><CardTitle>Odeme Talepleri</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanici</TableHead>
                      <TableHead>USDT</TableHead>
                      <TableHead>TL</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Islemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.user_email}</TableCell>
                        <TableCell>{payment.amount_usdt}</TableCell>
                        <TableCell>{payment.amount_tl.toFixed(2)} TL</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${payment.status === 'approved' ? 'bg-green-100 text-green-800' : payment.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {payment.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payment.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleApprovePayment(payment.id)} className="bg-green-600 hover:bg-green-700">
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="sm" onClick={() => handleRejectPayment(payment.id)} className="bg-red-600 hover:bg-red-700">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>Kullanicilar</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Bakiye</TableHead>
                      <TableHead>Hesap</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Islem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((usr) => (
                      <TableRow key={usr.id}>
                        <TableCell>{usr.email}</TableCell>
                        <TableCell>{usr.balance_tl.toFixed(2)} TL</TableCell>
                        <TableCell>{usr.purchase_count || 0}</TableCell>
                        <TableCell>{new Date(usr.created_at).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => { setEditingUser(usr); setBalanceForm(usr.balance_tl); setShowBalanceDialog(true); }}>
                            Bakiye
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Kategoriler</CardTitle>
                <Button onClick={() => { setCategoryForm({ name: '', description: '' }); setEditingCategory(null); setShowCategoryDialog(true); }}>
                  <PlusCircle className="mr-2 w-4 h-4" />Yeni
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad</TableHead>
                      <TableHead>Aciklama</TableHead>
                      <TableHead>Mevcut</TableHead>
                      <TableHead>Satilan</TableHead>
                      <TableHead>Islem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell>{cat.name}</TableCell>
                        <TableCell className="text-xs">{cat.description || '-'}</TableCell>
                        <TableCell>{cat.available_count}</TableCell>
                        <TableCell>{cat.sold_count}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name, description: cat.description || '' }); setShowCategoryDialog(true); }}>
                              Duzenle
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(cat.id)}>Sil</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Hesaplar</CardTitle>
                <Button onClick={() => setShowAccountDialog(true)}>
                  <PlusCircle className="mr-2 w-4 h-4" />Yeni Hesap
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Fiyat</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Islem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((acc) => (
                      <TableRow key={acc.id}>
                        <TableCell>{acc.category_name || 'N/A'}</TableCell>
                        <TableCell>{acc.price_tl} TL</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${acc.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {acc.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteAccount(acc.id)}>Sil</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? 'Kategori Duzenle' : 'Yeni Kategori'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div>
              <Label>Kategori Adi</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})} required />
            </div>
            <div>
              <Label>Aciklama (Renkli Neon)</Label>
              <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})} rows={2} placeholder="HIZLI TESLIMAT!" />
            </div>
            <Button type="submit" className="w-full">{editingCategory ? 'Guncelle' : 'Olustur'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yeni Hesap Ekle</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveAccount} className="space-y-4">
            <div>
              <Label>Kategori</Label>
              <select value={accountForm.category_id} onChange={(e) => setAccountForm({...accountForm, category_id: e.target.value})} required className="w-full p-2 border rounded">
                <option value="">Secin</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Cookie (JSON)</Label>
              <Textarea value={accountForm.cookie_data} onChange={(e) => setAccountForm({...accountForm, cookie_data: e.target.value})} rows={4} required />
            </div>
            <div>
              <Label>Sifre</Label>
              <Input value={accountForm.password} onChange={(e) => setAccountForm({...accountForm, password: e.target.value})} />
            </div>
            <div>
              <Label>Fiyat (TL)</Label>
              <Input type="number" step="0.01" value={accountForm.price_tl} onChange={(e) => setAccountForm({...accountForm, price_tl: e.target.value})} required />
            </div>
            <Button type="submit" className="w-full">Ekle</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showBalanceDialog} onOpenChange={setShowBalanceDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bakiye Duzenle</DialogTitle></DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm">Kullanici: <strong>{editingUser.email}</strong></p>
                <p className="text-sm">Mevcut: <strong>{editingUser.balance_tl.toFixed(2)} TL</strong></p>
              </div>
              <div>
                <Label>Yeni Bakiye (TL)</Label>
                <Input type="number" step="0.01" value={balanceForm} onChange={(e) => setBalanceForm(parseFloat(e.target.value))} required />
              </div>
              <Button onClick={handleUpdateBalance} className="w-full">Kaydet</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sistem Ayarlari</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Cuzdan Ayarlari</h3>
              <Label>USDT Cuzdan Adresi</Label>
              <Input placeholder="0x..." value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Telegram Ayarlari</h3>
              <div className="space-y-3">
                <div>
                  <Label>Bot Token</Label>
                  <Input placeholder="1234:ABCdef" value={telegramSettings.bot_token} onChange={(e) => setTelegramSettings({...telegramSettings, bot_token: e.target.value})} />
                </div>
                <div>
                  <Label>Chat ID</Label>
                  <Input placeholder="-1001234" value={telegramSettings.chat_id} onChange={(e) => setTelegramSettings({...telegramSettings, chat_id: e.target.value})} />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full">Tum Ayarlari Kaydet</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminDashboard;
