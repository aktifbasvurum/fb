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
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showTelegramDialog, setShowTelegramDialog] = useState(false);
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [walletAddress, setWalletAddress] = useState('');
  const [telegramSettings, setTelegramSettings] = useState({ bot_token: '', chat_id: '' });
  const [balanceForm, setBalanceForm] = useState({ balance_tl: 0 });
  const [newAccount, setNewAccount] = useState({
    category_id: '',
    cookie_data: '',
    password: '',
    price_tl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes, paymentsRes, categoriesRes, accountsRes, walletRes, telegramRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/users`, { headers }),
        axios.get(`${API}/admin/payment-requests`, { headers }),
        axios.get(`${API}/admin/categories`, { headers }),
        axios.get(`${API}/admin/accounts`, { headers }),
        axios.get(`${API}/payment/wallet-address`, { headers }),
        axios.get(`${API}/admin/settings/telegram`, { headers }).catch(() => ({ data: { bot_token: '', chat_id: '' } }))
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPayments(paymentsRes.data);
      setCategories(categoriesRes.data);
      setAccounts(accountsRes.data);
      setWalletAddress(walletRes.data.wallet_address || '');
      setTelegramSettings(telegramRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
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
      await axios.put(`${API}/admin/payment-requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Ödeme onaylandı!');
      fetchData();
    } catch (error) {
      toast.error('Ödeme onaylanamadı!');
    }
  };

  const handleRejectPayment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/payment-requests/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Ödeme reddedildi!');
      fetchData();
    } catch (error) {
      toast.error('Ödeme reddedilemedi!');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingCategory) {
        await axios.put(`${API}/admin/categories/${editingCategory.id}`, newCategory, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Kategori guncellendi!');
      } else {
        await axios.post(`${API}/admin/categories`, newCategory, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Kategori olusturuldu!');
      }
      setShowCategoryDialog(false);
      setNewCategory({ name: '', description: '' });
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      toast.error(editingCategory ? 'Kategori güncellenemedi!' : 'Kategori oluşturulamadı!');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bu kategoriyi ve tüm hesaplarını silmek istediğinize emin misiniz?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Kategori silindi!');
      fetchData();
    } catch (error) {
      toast.error('Kategori silinemedi!');
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/admin/accounts`, newAccount, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Hesap eklendi!');
      setShowAccountDialog(false);
      setNewAccount({ category_id: '', cookie_data: '', password: '', price_tl: '' });
      fetchData();
    } catch (error) {
      toast.error('Hesap eklenemedi!');
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Bu hesabı silmek istediğinize emin misiniz?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Hesap silindi!');
      fetchData();
    } catch (error) {
      toast.error('Hesap silinemedi!');
    }
  };

  const handleUpdateWallet = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/settings/wallet?wallet_address=${encodeURIComponent(walletAddress)}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cüzdan adresi güncellendi!');
      setShowWalletDialog(false);
      fetchData();
    } catch (error) {
      toast.error('Cüzdan adresi güncellenemedi!');

  const handleUpdateTelegram = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/settings/telegram?bot_token=${encodeURIComponent(telegramSettings.bot_token)}&chat_id=${encodeURIComponent(telegramSettings.chat_id)}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Telegram ayarlari guncellendi ve test mesaji gonderildi!');
      setShowTelegramDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Telegram guncellenemedi!');
    }
  };

    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="admin-dashboard-heading">Admin Paneli</h1>
            <p className="text-white/80">Hoş geldiniz, {user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowWalletDialog(true)}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              data-testid="wallet-settings-button"
            >
              <Settings className="mr-2 w-4 h-4" />
              Cüzdan Ayarları
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              data-testid="admin-logout-button"
            >
              <LogOut className="mr-2 w-4 h-4" />
              Çıkış
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card data-testid="stats-users">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Toplam Kullanıcı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total_users || 0}</p>
            </CardContent>
          </Card>

          <Card data-testid="stats-pending-payments">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Bekleyen Ödemeler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{stats.pending_payments || 0}</p>
            </CardContent>
          </Card>

          <Card data-testid="stats-available-accounts">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Mevcut Hesaplar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.available_accounts || 0}</p>
            </CardContent>
          </Card>

          <Card data-testid="stats-sold-accounts">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Satılan Hesaplar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{stats.sold_accounts || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="payments" data-testid="tab-payments">Ödemeler</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Kullanıcılar</TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">Kategoriler</TabsTrigger>
            <TabsTrigger value="accounts" data-testid="tab-accounts">Hesaplar</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Talepleri</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>USDT</TableHead>
                      <TableHead>TL</TableHead>
                      <TableHead>Cüzdan</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id} data-testid={`payment-row-${payment.id}`}>
                        <TableCell>{payment.user_email}</TableCell>
                        <TableCell>{payment.amount_usdt}</TableCell>
                        <TableCell>₺{payment.amount_tl.toFixed(2)}</TableCell>
                        <TableCell className="text-xs">{payment.wallet_address.substring(0, 12)}...</TableCell>
                        <TableCell>
                          <span className={`badge badge-${payment.status === 'approved' ? 'success' : payment.status === 'rejected' ? 'danger' : 'warning'}`}>
                            {payment.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payment.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprovePayment(payment.id)}
                                className="bg-green-600 hover:bg-green-700"
                                data-testid={`approve-payment-${payment.id}`}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleRejectPayment(payment.id)}
                                className="bg-red-600 hover:bg-red-700"
                                data-testid={`reject-payment-${payment.id}`}
                              >
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
              <CardHeader>
                <CardTitle>Kullanıcılar</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Bakiye (TL)</TableHead>
                      <TableHead>Hesap Sayisi</TableHead>
                      <TableHead>Kayit Tarihi</TableHead>
                      <TableHead>Islemler</TableHead>
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
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingUser(usr);
                              setBalanceForm({ balance_tl: usr.balance_tl });
                              setShowBalanceDialog(true);
                            }}
                          >
                            Bakiye Duzenle
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
                <Button onClick={() => setShowCategoryDialog(true)} data-testid="add-category-button">
                  <PlusCircle className="mr-2 w-4 h-4" />
                  Yeni Kategori
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori Adı</TableHead>
                      <TableHead>Mevcut Hesap</TableHead>
                      <TableHead>Satılan</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id} data-testid={`category-row-${category.id}`}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>{category.available_count}</TableCell>
                        <TableCell>{category.sold_count}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingCategory(category);
                                setNewCategory({ name: category.name, description: category.description || '' });
                                setShowCategoryDialog(true);
                              }}
                              data-testid={`edit-category-${category.id}`}
                            >
                              Düzenle
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCategory(category.id)}
                              data-testid={`delete-category-${category.id}`}
                            >
                              Sil
                            </Button>
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
                <Button onClick={() => setShowAccountDialog(true)} data-testid="add-account-button">
                  <PlusCircle className="mr-2 w-4 h-4" />
                  Yeni Hesap Ekle
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Fiyat (TL)</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => {
                      const category = categories.find(c => c.id === account.category_id);
                      return (
                        <TableRow key={account.id} data-testid={`account-row-${account.id}`}>
                          <TableCell>{category?.name || 'N/A'}</TableCell>
                          <TableCell>₺{account.price_tl}</TableCell>
                          <TableCell>
                            <span className={`badge badge-${account.status === 'available' ? 'success' : 'info'}`}>
                              {account.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteAccount(account.id)}
                              data-testid={`delete-account-${account.id}`}
                            >
                              Sil
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={(open) => {
        setShowCategoryDialog(open);
        if (!open) {
          setEditingCategory(null);
          setNewCategory({ name: '', description: '' });
        }
      }}>
        <DialogContent data-testid="category-dialog">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Kategori Duzenle' : 'Yeni Kategori Olustur'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <Label>Kategori Adi</Label>
              <Input
                placeholder="Orn: Facebook, Google"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Aciklama (Renkli Neon Gosterilecek)</Label>
              <Textarea
                placeholder="Orn: HIZLI TESLIMAT! GARANTILI HESAPLAR!"
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">Bu metin kullanicilara renkli gradient kutuda gosterilir</p>
            </div>
            <Button type="submit" className="w-full">
              {editingCategory ? 'Guncelle' : 'Olustur'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Account Dialog */}
      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent data-testid="account-dialog">
          <DialogHeader>
            <DialogTitle>Yeni Hesap Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <Label>Kategori</Label>
              <select
                value={newAccount.category_id}
                onChange={(e) => setNewAccount({ ...newAccount, category_id: e.target.value })}
                required
                data-testid="account-category-select"
              >
                <option value="">Kategori Seçin</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Cookie Verisi (JSON)</Label>
              <Textarea
                placeholder='{"cookies": [...]}'
                value={newAccount.cookie_data}
                onChange={(e) => setNewAccount({ ...newAccount, cookie_data: e.target.value })}
                rows={5}
                required
                data-testid="account-cookie-input"
              />
            </div>
            <div>
              <Label>Hesap Şifresi (opsiyonel)</Label>
              <Input
                type="text"
                placeholder="hesapsifre123"
                value={newAccount.password}
                onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                data-testid="account-password-input"
              />
              <p className="text-xs text-gray-500 mt-1">Otomatik giriş için Facebook hesap şifresi</p>
            </div>
            <div>
              <Label>Fiyat (TL)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="100.00"
                value={newAccount.price_tl}
                onChange={(e) => setNewAccount({ ...newAccount, price_tl: e.target.value })}
                required
                data-testid="account-price-input"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="account-submit-button">Hesap Ekle</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Wallet Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent data-testid="wallet-dialog">
          <DialogHeader>
            <DialogTitle>Cüzdan Adresi Ayarları</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateWallet} className="space-y-4">
            <div>
              <Label>USDT Cüzdan Adresi</Label>
              <Input
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                required
                data-testid="wallet-address-input"
              />
              <p className="text-xs text-gray-500 mt-2">
                Kullanıcılar bu adrese USDT gönderecek.
              </p>
            </div>
            <Button type="submit" className="w-full" data-testid="wallet-submit-button">Güncelle</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Balance Edit Dialog */}
      <Dialog open={showBalanceDialog} onOpenChange={setShowBalanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanici Bakiyesi Duzenle</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Kullanici: <span className="font-semibold">{editingUser.email}</span></p>
                <p className="text-sm text-gray-600">Mevcut Bakiye: <span className="font-semibold">{editingUser.balance_tl.toFixed(2)} TL</span></p>
              </div>
              <div>
                <Label>Yeni Bakiye (TL)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={balanceForm.balance_tl}
                  onChange={(e) => setBalanceForm({ balance_tl: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <Button onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  await axios.put(`${API}/admin/users/${editingUser.id}/balance`, balanceForm, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  toast.success('Bakiye guncellendi!');
                  setShowBalanceDialog(false);
                  fetchData();
                } catch (error) {
                  toast.error('Guncellenemedi!');
                }
              }} className="w-full">Kaydet</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminDashboard;