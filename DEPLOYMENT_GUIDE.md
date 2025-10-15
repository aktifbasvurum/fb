# Render.com Deployment Rehberi

## 1. GitHub'a Yükleme

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## 2. MongoDB Atlas Kurulumu

1. https://www.mongodb.com/cloud/atlas adresine gidin
2. Ücretsiz cluster oluşturun
3. Database kullanıcısı ekleyin
4. IP whitelist: 0.0.0.0/0 (tüm IP'ler)
5. Connection string'i kopyalayın

## 3. Render.com Deployment

### Backend Deploy:
1. Render.com'a gidin
2. New → Web Service
3. GitHub repo'nuzu bağlayın
4. Settings:
   - Name: facebook-ads-backend
   - Runtime: Python 3
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Environment Variables ekleyin:
   - MONGO_URL: (MongoDB Atlas connection string)
   - DB_NAME: facebook_ads_automation
   - JWT_SECRET_KEY: (random string)
   - ADMIN_USERNAME: admin
   - ADMIN_PASSWORD: (güçlü şifre)
   - TELEGRAM_BOT_TOKEN: (bot token)
   - TELEGRAM_CHAT_ID: (chat ID)
   - CORS_ORIGINS: *
6. Create Web Service

### Frontend Deploy:
1. New → Static Site
2. GitHub repo bağlayın
3. Settings:
   - Name: facebook-ads-frontend
   - Build Command: `cd frontend && yarn install && yarn build`
   - Publish Directory: `frontend/build`
4. Environment Variable:
   - REACT_APP_BACKEND_URL: (backend URL'nizi buraya)
5. Create Static Site

## 4. UptimeRobot Kurulumu

1. https://uptimerobot.com → Ücretsiz kayıt
2. Add New Monitor
3. Monitor Type: HTTP(s)
4. URL: Backend URL'nizi girin
5. Monitoring Interval: 5 minutes
6. Create Monitor

Bu sayede server hiç uyumaz!

## 5. Domain Bağlama (Opsiyonel)

1. Render dashboard → Settings → Custom Domain
2. Domain'inizi girin
3. DNS ayarlarını yapın

## Sorun Giderme

- **Build hatası:** requirements.txt kontrol edin
- **MongoDB bağlantı hatası:** Connection string kontrol edin
- **CORS hatası:** CORS_ORIGINS='*' olduğundan emin olun

## Destek

Sorun olursa Render.com Discord'una katılabilirsiniz.