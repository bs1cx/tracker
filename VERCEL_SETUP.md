# Vercel Deployment - Hızlı Kurulum Rehberi

## 🚀 Adım Adım Deployment

### 1. GitHub Repository Oluştur

```bash
# Projeyi git repository'ye çevir
git init
git add .
git commit -m "Initial commit - Vercel ready"

# GitHub'da yeni repository oluştur, sonra:
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git branch -M main
git push -u origin main
```

### 2. Vercel'e Bağla

1. [vercel.com](https://vercel.com) adresine git
2. "Sign Up" ile GitHub hesabınla giriş yap
3. Dashboard'da "Add New..." > "Project" seç
4. GitHub repository'ni seç ve "Import" tıkla

### 3. Environment Variables Ekle

Vercel proje ayarlarında:

**Settings > Environment Variables** bölümüne git ve ekle:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Production, Preview, Development |

**Supabase Bilgilerini Nereden Bulursun?**

1. [Supabase Dashboard](https://supabase.com/dashboard) > Projen
2. **Settings** > **API** sekmesi
3. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Database Setup

Supabase'de SQL Editor'ü aç ve `supabase-schema.sql` dosyasındaki tüm SQL'i çalıştır.

### 5. Deploy!

Vercel'de "Deploy" butonuna tıkla. 2-3 dakika içinde hazır olacak! 🎉

## ✅ Deployment Sonrası Kontrol

1. **Build Logs**: Deployment sırasında hata var mı kontrol et
2. **Live URL**: Vercel sana bir URL verecek (örn: `life-tracker.vercel.app`)
3. **Test Et**: 
   - Sign up/Sign in çalışıyor mu?
   - Dashboard yükleniyor mu?
   - Yeni item ekleyebiliyor musun?

## 🔧 Sorun Giderme

### Build Hatası Alıyorsan

- Environment variable'ların doğru eklendiğinden emin ol
- `package.json`'daki tüm dependency'lerin yüklendiğini kontrol et
- Build logs'u detaylı oku

### Runtime Hatası

- Supabase connection çalışıyor mu kontrol et
- Database schema'nın tamamen çalıştırıldığından emin ol
- Browser console'da hata var mı bak

### CORS Hatası

Supabase Dashboard > Settings > API > Allowed Origins'e Vercel URL'ini ekle:
```
https://your-app.vercel.app
```

## 📝 Notlar

- Her commit otomatik olarak yeni bir deployment oluşturur
- Pull request'ler için preview URL'ler oluşturulur
- Production deployment'lar `main` branch'e push edildiğinde otomatik deploy olur

## 🎯 Sonraki Adımlar

- Custom domain ekleyebilirsin (Settings > Domains)
- Analytics'i aktif edebilirsin
- Environment variable'ları güncelleyebilirsin

Başarılar! 🚀

