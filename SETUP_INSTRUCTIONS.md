# 🚀 Vercel + Supabase Kurulum Talimatları

## ✅ Mevcut Durum

- ✅ Login sistemi hazır (`/auth` sayfası)
- ✅ Supabase database bağlantısı yapılandırıldı
- ✅ Vercel için optimize edildi
- ✅ RLS (Row Level Security) politikaları aktif

## 📝 Kullanıcı Oluşturma

### Yöntem 1: Supabase Dashboard (Önerilen)

1. [Supabase Dashboard](https://supabase.com/dashboard) > Projenize gidin
2. **Authentication** > **Users** sekmesine gidin
3. **"Add User"** > **"Create New User"** butonuna tıklayın
4. Formu doldurun:
   - **Email**: `dogu@example.com` (veya istediğiniz email)
   - **Password**: `0407aylo`
   - **Auto Confirm User**: ✅ **AÇIK** (önemli!)
5. **"Create User"** butonuna tıklayın

### Yöntem 2: Uygulama Üzerinden Kayıt

1. Vercel'de deploy edilmiş uygulamanıza gidin
2. `/auth` sayfasına gidin
3. **"Don't have an account? Sign up"** butonuna tıklayın
4. Formu doldurun:
   - **Email**: `dogu@example.com` (veya istediğiniz email)
   - **Password**: `0407aylo`
5. **"Sign Up"** butonuna tıklayın
6. ⚠️ **Not**: Email confirmation gerekebilir. Supabase Dashboard'dan kullanıcıyı "Confirm" edin.

## 🔧 Email Confirmation'ı Devre Dışı Bırakma (Opsiyonel)

Eğer her kayıt için email confirmation istemiyorsanız:

1. Supabase Dashboard > **Authentication** > **Settings**
2. **"Enable Email Confirmations"** seçeneğini **KAPALI** yapın
3. Kaydedin

## 🗄️ Database Setup

1. Supabase Dashboard > **SQL Editor**
2. `supabase-schema.sql` dosyasındaki tüm SQL'i kopyalayıp çalıştırın
3. Tüm tablolar, RLS politikaları ve helper function'lar oluşturulacak

## 🔐 Environment Variables (Vercel)

Vercel Dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Önemli**: Her iki environment variable'ı da **Production, Preview, Development** için ekleyin!

## ✅ Test

1. Uygulamanıza gidin
2. `/auth` sayfasında login yapın:
   - Email: `dogu@example.com` (oluşturduğunuz email)
   - Password: `0407aylo`
3. Dashboard'a yönlendirilmelisiniz

## 🎯 Kullanıcı Bilgileri

- **Email**: `dogu@example.com` (veya oluşturduğunuz email)
- **Password**: `0407aylo`
- **Username**: dogu

## 📚 Yardımcı Dokümanlar

- `DEPLOYMENT.md` - Detaylı deployment rehberi
- `VERCEL_SETUP.md` - Vercel kurulum rehberi
- `supabase-schema.sql` - Database schema

