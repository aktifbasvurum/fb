import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Lock, Package, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProfilePage({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [purchasedAccounts, setPurchasedAccounts] = useState([]);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, paymentsRes, accountsRes] = await Promise.all([
        axios.get(`${API}/user/profile`, { headers }),
        axios.get(`${API}/payment/my-requests`, { headers }),
        axios.get(`${API}/accounts/my-accounts`, { headers })
      ]);

      setProfile(profileRes.data);
      setPaymentRequests(paymentsRes.data);
      setPurchasedAccounts(accountsRes.data);
    } catch (error) {
      toast.error('Veriler yuklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Yeni sifreler eslesmiyor!');
      return;
    }

    toast.info('Sifre degistirme simdilik aktif degil');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-white text-xl">Yukleniyor...</p></div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="border-white text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 w-4 h-4" />Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Profilim</h1>
              <p className="text-white/80">{profile.email}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="info">Bilgiler</TabsTrigger>
            <TabsTrigger value="payments">Odeme Talepleri</TabsTrigger>
            <TabsTrigger value="accounts">Hesaplarim</TabsTrigger>
            <TabsTrigger value="password">Sifre Degistir</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader><CardTitle>Hesap Bilgilerim</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500">Bakiye</p>
                    <p className="font-semibold text-purple-600">{profile.balance_tl?.toFixed(2)} TL</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Package className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500">Satin Alinan Hesap</p>
                    <p className="font-semibold">{purchasedAccounts.length} adet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader><CardTitle>Odeme Taleplerim</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Henuz odeme talebiniz yok</p>
                  ) : (
                    paymentRequests.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{payment.amount_usdt} USDT = {payment.amount_tl.toFixed(2)} TL</p>
                          <p className="text-xs text-gray-400">{new Date(payment.created_at).toLocaleDateString('tr-TR')}</p>
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

          <TabsContent value="accounts">
            <Card>
              <CardHeader><CardTitle>Satin Aldigim Hesaplar</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {purchasedAccounts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Henuz hesap satin almadiniz</p>
                  ) : (
                    purchasedAccounts.map((acc, idx) => (
                      <div key={acc.id} className="border rounded-lg p-4">
                        <p className="font-semibold">Hesap #{idx + 1}</p>
                        <p className="text-sm text-gray-500">Fiyat: {acc.account_data.price_tl} TL</p>
                        <p className="text-xs text-gray-400">{new Date(acc.purchase_date).toLocaleDateString('tr-TR')}</p>
                      </div>
                    ))
                  )}
                </div>
                <Button onClick={() => navigate('/my-accounts')} className="w-full mt-4">Hesaplari Goruntule</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader><CardTitle>Sifre Degistir</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label>Mevcut Sifre</Label>
                    <Input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Yeni Sifre</Label>
                    <Input type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Yeni Sifre Tekrar</Label>
                    <Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} required />
                  </div>
                  <Button type="submit" className="w-full">Sifre Degistir</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ProfilePage;