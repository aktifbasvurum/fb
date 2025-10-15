import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminLogin({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/admin/login`, formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Admin girişi başarılı!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error('Geçersiz admin bilgileri!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-effect rounded-3xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-purple-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white text-center mb-2" data-testid="admin-login-heading">
          Admin Girişi
        </h1>
        <p className="text-white/80 text-center mb-8">Yönetici paneline erişim</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="text-white mb-2 block">Kullanıcı Adı</Label>
            <Input
              type="text"
              placeholder="admin"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              data-testid="admin-username-input"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Şifre</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pr-10"
                required
                data-testid="admin-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                data-testid="admin-toggle-password"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-yellow-400 text-purple-600 hover:bg-yellow-300 text-lg py-6 rounded-xl font-semibold"
            disabled={loading}
            data-testid="admin-login-submit-button"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Admin Girişi'}
          </Button>
        </form>
      </div>
    </div>
  );
}