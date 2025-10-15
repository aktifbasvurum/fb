import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-5xl w-full text-center">
        {/* Hero Section */}
        <div className="glass-effect rounded-3xl p-12 mb-8">
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6" data-testid="landing-main-heading">
            Facebook Reklam <br />
            <span className="text-yellow-300">Otomasyon Platformu</span>
          </h1>
          <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto" data-testid="landing-subheading">
            Facebook reklam hesaplarını kolayca yönetin. Güvenli, hızlı ve kullanımı kolay platform ile işlerinizi
            otomatikleştirin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/register')}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl"
              data-testid="landing-register-button"
            >
              Hemen Başla <ArrowRight className="ml-2" />
            </Button>
            <Button
              onClick={() => navigate('/login')}
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
              data-testid="landing-login-button"
            >
              Giriş Yap
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card text-center" data-testid="feature-card-secure">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Güvenli</h3>
            <p className="text-gray-600">
              Tüm hesaplarınız şifrelenmiş olarak saklanır ve güvenliğiniz önceliğimizdir.
            </p>
          </div>

          <div className="card text-center" data-testid="feature-card-fast">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Hızlı</h3>
            <p className="text-gray-600">
              Hesaplarınıza anında erişin ve tek tıkla işlemlerinizi gerçekleştirin.
            </p>
          </div>

          <div className="card text-center" data-testid="feature-card-support">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">7/24 Destek</h3>
            <p className="text-gray-600">
              Her zaman yanınızdayız. Sorunlarınız için hızlı çözümler sunuyoruz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}