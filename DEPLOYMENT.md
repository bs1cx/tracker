# Vercel Deployment Guide

Bu projeyi Vercel'e deploy etmek için aşağıdaki adımları takip edin.

## Hızlı Başlangıç

### 1. GitHub'a Push Edin

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/kullaniciadi/life-tracker.git
git push -u origin main
```

### 2. Vercel'e Import Edin

1. [Vercel Dashboard](https://vercel.com/dashboard) sayfasına gidin
2. "Add New..." > "Project" seçin
3. GitHub repository'nizi seçin
4. "Import" butonuna tıklayın

### 3. Environment Variables Ayarlayın

Vercel proje ayarlarında aşağıdaki environment variable'ları ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Nasıl eklenir:**
1. Vercel dashboard'da projenize gidin
2. "Settings" > "Environment Variables" sekmesine gidin
3. Her bir variable için:
   - Name: `NEXT_PUBLIC_SUPABASE_URL` (veya `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Value: Supabase'den aldığınız değer
   - Environment: Production, Preview, Development (hepsini seçin)
4. "Save" butonuna tıklayın

### 4. Supabase Database Setup

1. [Supabase Dashboard](https://supabase.com/dashboard) sayfasına gidin
2. Projenizi seçin
3. "SQL Editor" sekmesine gidin
4. `supabase-schema.sql` dosyasındaki tüm SQL kodunu kopyalayıp çalıştırın
5. "Settings" > "API" sekmesinden URL ve anon key'i alın

### 5. Deploy

1. Vercel'de "Deploy" butonuna tıklayın
2. Build işlemi tamamlanana kadar bekleyin (genellikle 2-3 dakika)
3. Deploy tamamlandığında URL'nizi alacaksınız

## Build Ayarları

Vercel otomatik olarak Next.js projelerini algılar ve şu ayarları kullanır:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Environment Variables

### Production
Tüm environment variable'lar production, preview ve development için ayarlanmalıdır.

### Supabase URL ve Key Nasıl Bulunur?

1. Supabase Dashboard > Projeniz
2. Settings > API
3. **Project URL**: `NEXT_PUBLIC_SUPABASE_URL` için kullanın
4. **anon public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` için kullanın

## Troubleshooting

### Build Hatası

Eğer build sırasında hata alırsanız:

1. **Environment Variables Kontrolü**: Tüm gerekli variable'ların eklendiğinden emin olun
2. **Node Version**: Vercel otomatik olarak Node.js 18+ kullanır
3. **Build Logs**: Vercel dashboard'daki build logs'u kontrol edin

### Runtime Hatası

Eğer uygulama çalışmıyorsa:

1. **Supabase Connection**: Supabase URL ve key'in doğru olduğundan emin olun
2. **Database Schema**: SQL schema'nın tamamen çalıştırıldığından emin olun
3. **RLS Policies**: Row Level Security policy'lerinin aktif olduğundan emin olun

### CORS Hatası

Supabase'de CORS ayarlarını kontrol edin:
1. Supabase Dashboard > Settings > API
2. "Allowed Origins" listesine Vercel domain'inizi ekleyin (örn: `https://your-app.vercel.app`)

## Custom Domain

Vercel'de custom domain eklemek için:

1. Vercel Dashboard > Projeniz > Settings > Domains
2. Domain'inizi ekleyin
3. DNS ayarlarını yapın (Vercel size talimat verecek)

## Preview Deployments

Her pull request otomatik olarak preview deployment oluşturur. Bu deployment'lar:
- Geçici URL'ler kullanır
- Production database'e bağlanır (ayarlarınıza göre)
- Test için idealdir

## Monitoring

Vercel Analytics ve Monitoring:
1. Vercel Dashboard > Projeniz > Analytics
2. Performance metriklerini görüntüleyin
3. Error tracking için Vercel Logs'u kullanın

## Support

Sorun yaşarsanız:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

