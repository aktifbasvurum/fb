import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, ShoppingCart, LogOut, Package, User } from 'lucide-react';
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
  const [paymentForm, setPaymentForm] = useState({ amount_usdt: '' });
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
      console.error('Error:', error);
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
      await axios.post(`${API}/payment/request`, { amount_usdt: parseFloat(paymentForm.amount_usdt), wallet_address: walletAddress }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Odeme talebiniz gonderildi!');
      setShowPaymentDialog(false);
      setPaymentForm({ amount_usdt: '' });
      fetchData();
    } catch (error) {
      toast.error('Odeme talebi gonderilemedi!');
    }
  };

  const handlePurchase = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/accounts/purchase`, { category_id: selectedCategory.id, quantity: purchaseQuantity }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${purchaseQuantity} hesap basariyla satin alindi!`);
      setShowPurchaseDialog(false);
      setPurchaseQuantity(1);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Satin alma basarisiz!');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="glass-effect rounded-2xl p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Hos Geldiniz</h1>
            <p className="text-white/80">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/profile')} variant="outline" className="border-white text-white hover:bg-white/10">
              <User className="mr-2 w-4 h-4" />Profil
            </Button>
            <Button onClick={() => navigate('/my-accounts')} variant="outline" className="border-white text-white hover:bg-white/10">
              <Package className="mr-2 w-4 h-4" />Hesaplarim
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-white text-white hover:bg-white/10">
              <LogOut className="mr-2 w-4 h-4" />Cikis
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wallet className="w-6 h-6" />Bakiyeniz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-4xl font-bold text-purple-600">{balance.toFixed(2)} TL</p>
                <p className="text-gray-500 mt-1">Turk Lirasi</p>
              </div>
              <Button onClick={() => setShowPaymentDialog(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">Bakiye Yukle</Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="purchase">Hesap Satin Al</TabsTrigger>
            <TabsTrigger value="payments">Odeme Taleplerim</TabsTrigger>
          </TabsList>

          <TabsContent value="purchase">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    {category.description && (
                      <div className="mt-2 p-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg">
                        <p className="text-white text-sm font-semibold text-center animate-pulse">
                          {category.description}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-2">{category.available_count} hesap mevcut</p>
                    <div className="mt-2">
                      {category.original_price > category.price_per_account && (
                        <p className="text-sm text-gray-400 line-through">{category.original_price.toFixed(2)} TL</p>
                      )}
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-purple-600">{category.price_per_account} TL</p>
                        {category.original_price > category.price_per_account && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">%20 İNDİRİM</span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => { setSelectedCategory(category); setShowPurchaseDialog(true); }} className="w-full" disabled={category.available_count === 0}>
                      <ShoppingCart className="mr-2 w-4 h-4" />Satin Al
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader><CardTitle>Odeme Talepleriniz</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Henuz odeme talebiniz yok</p>
                  ) : (
                    paymentRequests.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{payment.amount_usdt} USDT</p>
                          <p className="text-sm text-gray-500">{payment.amount_tl.toFixed(2)} TL</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(payment.created_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'approved' ? 'bg-green-100 text-green-800' : payment.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {payment.status === 'pending' ? 'Beklemede' : payment.status === 'approved' ? 'Onaylandi' : 'Reddedildi'}
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

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bakiye Yukle (USDT)</DialogTitle></DialogHeader>
          {walletAddress ? (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-blue-800 mb-2">Admin Cuzdan Adresi:</p>
              <p className="text-sm bg-white p-3 rounded border border-blue-200 break-all font-mono">{walletAddress}</p>
              <p className="text-xs text-blue-600 mt-2">Bu adrese USDT gonderin</p>
            </div>
          ) : (
            <p className="text-amber-600">Admin henuz cuzdan adresi eklemedi.</p>
          )}
          <form onSubmit={handlePaymentRequest} className="space-y-4">
            <div>
              <Label>USDT Miktari</Label>
              <Input type="number" step="0.01" placeholder="50" value={paymentForm.amount_usdt} onChange={(e) => setPaymentForm({ amount_usdt: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full">Odeme Talebini Gonder</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hesap Satin Al - {selectedCategory?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Adet</Label>
              <Input type="number" min="1" max={selectedCategory?.available_count || 1} value={purchaseQuantity} onChange={(e) => setPurchaseQuantity(parseInt(e.target.value))} />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Toplam Tutar</p>
              <p className="text-2xl font-bold text-purple-600">{((selectedCategory?.price_per_account || 0) * purchaseQuantity).toFixed(2)} TL</p>
            </div>
            <Button onClick={handlePurchase} className="w-full">Satin Al</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserDashboard;