import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, ShoppingCart, CreditCard, LogOut, User, Package } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function UserDashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [balance, setBalance] = useState(user?.balance_tl || 0);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount_usdt: '', wallet_address: '' });
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [categoriesRes, profileRes, paymentsRes, walletRes] = await Promise.all([
        axios.get(`${API}/categories`, { headers }),
        axios.get(`${API}/user/profile`, { headers }),
        axios.get(`${API}/payment/my-requests`, { headers }),
        axios.get(`${API}/payment/wallet-address`, { headers })
      ]);

      setCategories(categoriesRes.data);
      setBalance(profileRes.data.balance_tl);
      setPaymentRequests(paymentsRes.data);
      setWalletAddress(walletRes.data.wallet_address);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handlePaymentRequest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/payment/request`, paymentForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Ödeme talebiniz gönderildi!');
      setShowPaymentDialog(false);
      setPaymentForm({ amount_usdt: '', wallet_address: '' });
      fetchData();
    } catch (error) {
      toast.error('Ödeme talebi gönderilemedi!');
    }
  };

  const handlePurchase = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/accounts/purchase`,
        { category_id: selectedCategory.id, quantity: purchaseQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${purchaseQuantity} hesap başarıyla satın alındı!`);
      setShowPurchaseDialog(false);
      setPurchaseQuantity(1);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Satın alma başarısız!');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="dashboard-heading">Hoş Geldiniz</h1>
            <p className="text-white/80">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/my-accounts')}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              data-testid="my-accounts-button"
            >
              <Package className="mr-2 w-4 h-4" />
              Hesaplarım
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              data-testid="logout-button"
            >
              <LogOut className="mr-2 w-4 h-4" />
              Çıkış
            </Button>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="mb-6" data-testid="balance-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Bakiyeniz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-4xl font-bold text-purple-600" data-testid="balance-amount">
                  ₺{balance.toFixed(2)}
                </p>
                <p className="text-gray-500 mt-1">Türk Lirası</p>
              </div>
              <Button
                onClick={() => setShowPaymentDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                data-testid="add-balance-button"
              >
                <CreditCard className="mr-2 w-4 h-4" />
                Bakiye Yükle
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="purchase" data-testid="purchase-tab">Hesap Satın Al</TabsTrigger>
            <TabsTrigger value="payments" data-testid="payments-tab">Ödeme Taleplerim</TabsTrigger>
          </TabsList>

          <TabsContent value="purchase">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-xl transition-shadow" data-testid={`category-card-${category.id}`}>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>
                      {category.available_count} hesap mevcut
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowPurchaseDialog(true);
                      }}
                      className="w-full"
                      disabled={category.available_count === 0}
                      data-testid={`purchase-button-${category.id}`}
                    >
                      <ShoppingCart className="mr-2 w-4 h-4" />
                      Satın Al
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Talepleriniz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Henüz ödeme talebiniz yok</p>
                  ) : (
                    paymentRequests.map((payment) => (
                      <div
                        key={payment.id}
                        className="border rounded-lg p-4 flex justify-between items-center"
                        data-testid={`payment-request-${payment.id}`}
                      >
                        <div>
                          <p className="font-semibold">{payment.amount_usdt} USDT</p>
                          <p className="text-sm text-gray-500">₺{payment.amount_tl.toFixed(2)}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(payment.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <span className={`badge badge-${payment.status === 'approved' ? 'success' : payment.status === 'rejected' ? 'danger' : 'warning'}`}>
                          {payment.status === 'pending' ? 'Beklemede' : payment.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent data-testid="payment-dialog">
          <DialogHeader>
            <DialogTitle>Bakiye Yükle (USDT)</DialogTitle>
            <DialogDescription>
              {walletAddress ? (
                <div className="mt-2">
                  <p className="font-semibold">Admin Cüzdan Adresi:</p>
                  <p className="text-sm bg-gray-100 p-2 rounded mt-1 break-all">{walletAddress}</p>
                </div>
              ) : (
                <p className="text-amber-600 mt-2">Admin henüz cüzdan adresi eklememiş.</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentRequest} className="space-y-4">
            <div>
              <Label>USDT Miktarı</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="50"
                value={paymentForm.amount_usdt}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount_usdt: e.target.value })}
                required
                data-testid="payment-usdt-input"
              />
            </div>
            <div>
              <Label>Gönderen Cüzdan Adresiniz</Label>
              <Input
                type="text"
                placeholder="0x..."
                value={paymentForm.wallet_address}
                onChange={(e) => setPaymentForm({ ...paymentForm, wallet_address: e.target.value })}
                required
                data-testid="payment-wallet-input"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="payment-submit-button">
              Ödeme Talebini Gönder
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent data-testid="purchase-dialog">
          <DialogHeader>
            <DialogTitle>Hesap Satın Al - {selectedCategory?.name}</DialogTitle>
            <DialogDescription>
              Kaç adet hesap satın almak istiyorsunuz?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Adet</Label>
              <Input
                type="number"
                min="1"
                max={selectedCategory?.available_count || 1}
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(parseInt(e.target.value))}
                data-testid="purchase-quantity-input"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Toplam Tutar</p>
              <p className="text-2xl font-bold text-purple-600">
                ₺{((selectedCategory?.price_per_account || 0) * purchaseQuantity).toFixed(2)}
              </p>
            </div>
            <Button onClick={handlePurchase} className="w-full" data-testid="purchase-confirm-button">
              Satın Al
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserDashboard;