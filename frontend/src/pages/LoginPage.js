import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Giriş başarılı!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Giriş başarısız!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-effect rounded-3xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-2" data-testid="login-heading">
          Giriş Yap
        </h1>
        <p className="text-white/80 text-center mb-8">Hesabınıza giriş yapın</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="text-white mb-2 block">Email Adresi</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                required
                data-testid="login-email-input"
              />
            </div>
          </div>

          <div>
            <Label className="text-white mb-2 block">Şifre</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10"
                required
                data-testid="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                data-testid="login-toggle-password"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-yellow-300 hover:underline text-sm" data-testid="login-forgot-password-link">
              Şifremi Unuttum
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-white text-purple-600 hover:bg-gray-100 text-lg py-6 rounded-xl font-semibold"
            disabled={loading}
            data-testid="login-submit-button"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        <p className="text-white/80 text-center mt-6">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="text-yellow-300 hover:underline font-semibold" data-testid="login-register-link">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}