# ✅ Vercel Deployment Kontrol Listesi

Projeyi Vercel'e deploy etmeden önce bu listeyi kontrol edin.

## 📋 Ön Hazırlık

- [x] `npm install` komutu çalıştırıldı ve bağımlılıklar yüklendi
- [x] `npm run build` komutu başarıyla çalıştı (local test)
- [x] Supabase projesi oluşturuldu
- [x] `supabase-schema.sql` dosyası Supabase SQL Editor'de çalıştırıldı
- [x] Supabase URL ve Anon Key alındı

## 🔧 Vercel Kurulumu

- [x] GitHub repository oluşturuldu ve kod push edildi
- [x] Vercel hesabı oluşturuldu (GitHub ile giriş yapıldı)
- [x] Vercel'de yeni proje oluşturuldu
- [x] GitHub repository import edildi

## 🔐 Environment Variables

- [x] `NEXT_PUBLIC_SUPABASE_URL` eklendi (Production, Preview, Development)
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` eklendi (Production, Preview, Development)
- [x] Environment variable değerleri doğru kopyalandı

## 🗄️ Database

- [x] Supabase'de `profiles` tablosu oluşturuldu
- [x] Supabase'de `trackables` tablosu oluşturuldu
- [x] Supabase'de `logs` tablosu oluşturuldu
- [x] RLS (Row Level Security) policy'leri aktif
- [x] Helper function'lar oluşturuldu

## 🚀 Deployment

- [x] Vercel'de "Deploy" butonuna tıklandı
- [x] Build başarıyla tamamlandı
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

- [x] `.vercelignore` - Vercel ignore dosyası (opsiyonel)
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

1. **404 NOT_FOUND Hatası**:
   - Vercel Dashboard > Deployments > Son deployment'ın build log'larını kontrol edin
   - Build başarılı mı? Hata var mı?
   - Environment variable'ların doğru ayarlandığından emin olun:
     - `NEXT_PUBLIC_SUPABASE_URL` (Production, Preview, Development için)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production, Preview, Development için)
   - Vercel'de "Redeploy" butonuna tıklayın
   - Eğer hala çalışmıyorsa, Vercel Dashboard > Settings > General > Framework Preset'in "Next.js" olduğundan emin olun

2. **Build Hatası**: Environment variable'ları kontrol edin
3. **Runtime Hatası**: Supabase connection'ı kontrol edin
4. **CORS Hatası**: Supabase Allowed Origins'e Vercel URL'ini ekleyin
5. **Database Hatası**: SQL schema'nın tamamen çalıştırıldığından emin olun

## 📚 Yardımcı Dokümanlar

- `DEPLOYMENT.md` - Detaylı deployment rehberi
- `VERCEL_SETUP.md` - Hızlı kurulum rehberi
- `README.md` - Genel proje dokümantasyonu

---

**Hazır!** Tüm kontrolleri tamamladıktan sonra projeniz Vercel'de canlı olacak! 🎉

