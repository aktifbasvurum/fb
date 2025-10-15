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

export default function RegisterPage({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Kayıt başarılı! Hoş geldiniz!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kayıt başarısız!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-effect rounded-3xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-2" data-testid="register-heading">
          Hesap Oluştur
        </h1>
        <p className="text-white/80 text-center mb-8">Hemen ücretsiz hesabınızı oluşturun</p>

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
                data-testid="register-email-input"
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
                data-testid="register-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                data-testid="register-toggle-password"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-white mb-2 block">Şifre Tekrar</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="pl-10 pr-10"
                required
                data-testid="register-confirm-password-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                data-testid="register-toggle-confirm-password"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-white text-purple-600 hover:bg-gray-100 text-lg py-6 rounded-xl font-semibold"
            disabled={loading}
            data-testid="register-submit-button"
          >
            {loading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
          </Button>
        </form>

        <p className="text-white/80 text-center mt-6">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-yellow-300 hover:underline font-semibold" data-testid="register-login-link">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}