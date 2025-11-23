# ✅ Vercel Deployment Kontrol Listesi

Projeyi Vercel'e deploy etmeden önce bu listeyi kontrol edin.

## 📋 Ön Hazırlık

- [ ] `npm install` komutu çalıştırıldı ve bağımlılıklar yüklendi
- [ ] `npm run build` komutu başarıyla çalıştı (local test)
- [ ] Supabase projesi oluşturuldu
- [ ] `supabase-schema.sql` dosyası Supabase SQL Editor'de çalıştırıldı
- [ ] Supabase URL ve Anon Key alındı

## 🔧 Vercel Kurulumu

- [ ] GitHub repository oluşturuldu ve kod push edildi
- [ ] Vercel hesabı oluşturuldu (GitHub ile giriş yapıldı)
- [ ] Vercel'de yeni proje oluşturuldu
- [ ] GitHub repository import edildi

## 🔐 Environment Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL` eklendi (Production, Preview, Development)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` eklendi (Production, Preview, Development)
- [ ] Environment variable değerleri doğru kopyalandı

## 🗄️ Database

- [ ] Supabase'de `profiles` tablosu oluşturuldu
- [ ] Supabase'de `trackables` tablosu oluşturuldu
- [ ] Supabase'de `logs` tablosu oluşturuldu
- [ ] RLS (Row Level Security) policy'leri aktif
- [ ] Helper function'lar oluşturuldu

## 🚀 Deployment

- [ ] Vercel'de "Deploy" butonuna tıklandı
- [ ] Build başarıyla tamamlandı
- [ ] Production URL çalışıyor
- [ ] Sign up/Sign in sayfası açılıyor
- [ ] Yeni kullanıcı kaydı yapılabiliyor
- [ ] Dashboard yükleniyor
- [ ] Yeni item eklenebiliyor

## 🧪 Test Senaryoları

- [ ] Daily habit oluşturulup tamamlanabiliyor
- [ ] One-time task oluşturulup tamamlanabiliyor
- [ ] Progress tracker oluşturulup artırılabiliyor/azaltılabiliyor
- [ ] Logout çalışıyor
- [ ] Mobile responsive çalışıyor

## 📝 Dosya Kontrolü

Aşağıdaki dosyaların mevcut olduğundan emin olun:

- [x] `vercel.json` - Vercel yapılandırması
- [x] `.vercelignore` - Vercel ignore dosyası
- [x] `next.config.js` - Next.js yapılandırması
- [x] `package.json` - Dependencies tanımlı
- [x] `tsconfig.json` - TypeScript yapılandırması
- [x] `tailwind.config.ts` - Tailwind yapılandırması
- [x] `middleware.ts` - Supabase session middleware
- [x] `supabase-schema.sql` - Database schema

## 🎯 Deployment Sonrası

- [ ] Custom domain eklendi (opsiyonel)
- [ ] Analytics aktif edildi (opsiyonel)
- [ ] Error monitoring kuruldu (opsiyonel)
- [ ] CORS ayarları Supabase'de yapıldı (gerekirse)

## ⚠️ Bilinen Sorunlar

Eğer bir sorunla karşılaşırsanız:

1. **Build Hatası**: Environment variable'ları kontrol edin
2. **Runtime Hatası**: Supabase connection'ı kontrol edin
3. **CORS Hatası**: Supabase Allowed Origins'e Vercel URL'ini ekleyin
4. **Database Hatası**: SQL schema'nın tamamen çalıştırıldığından emin olun

## 📚 Yardımcı Dokümanlar

- `DEPLOYMENT.md` - Detaylı deployment rehberi
- `VERCEL_SETUP.md` - Hızlı kurulum rehberi
- `README.md` - Genel proje dokümantasyonu

---

**Hazır!** Tüm kontrolleri tamamladıktan sonra projeniz Vercel'de canlı olacak! 🎉

