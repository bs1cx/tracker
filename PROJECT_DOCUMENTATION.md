# Yaşam Takipçisi - Life Management & Calendar System

## 📋 Proje Özeti

Yaşam Takipçisi, kullanıcıların günlük alışkanlıklarını, görevlerini, sağlık metriklerini, mental sağlık durumlarını ve finansal aktivitelerini takip edebilecekleri kapsamlı bir yaşam yönetim sistemidir. Takvim tabanlı görev planlama ve katı tarih filtreleme sistemi ile çalışır.

## 🚀 Teknoloji Stack

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui** (UI Component Library)
- **date-fns** (Tarih yönetimi ve DST-aware calendar logic)
- **React Day Picker** (Calendar component)

### Backend & Database
- **Supabase** (PostgreSQL + Authentication + Row Level Security)
- **Server Actions** (Next.js Server Components)

### Önemli Kütüphaneler
- `@supabase/ssr` - Server-side rendering için Supabase entegrasyonu
- `@radix-ui/*` - Headless UI components
- `zod` - Schema validation
- `lucide-react` - Icon library

## 📁 Proje Yapısı

```
tracker/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Ana dashboard
│   ├── actions.ts                # Server actions (CRUD operations)
│   ├── actions-calendar.ts       # Calendar-based server actions
│   ├── auth/                     # Authentication pages
│   ├── health/                   # Sağlık takibi modülü
│   ├── mental/                   # Mental sağlık modülü
│   ├── productivity/             # Verimlilik modülü
│   ├── finance/                  # Finans modülü
│   └── statistics/               # İstatistikler modülü
│
├── components/
│   ├── auth/                     # Authentication components
│   ├── calendar/                 # Calendar components
│   │   ├── calendar-sidebar.tsx  # Tarih seçim sidebar'ı
│   │   └── daily-view.tsx        # Günlük görünüm
│   ├── dashboard/                # Dashboard components
│   │   ├── dashboard-content.tsx # Ana dashboard içeriği
│   │   ├── task-view.tsx         # Görev görünümü (Günlük/Haftalık/Aylık)
│   │   ├── widget.tsx            # Widget container
│   │   ├── widget-selector.tsx   # Widget seçici
│   │   └── digital-clock.tsx     # Dijital saat
│   ├── trackables/               # Görev/Alışkanlık components
│   │   ├── add-item-form.tsx     # Yeni öğe ekleme formu
│   │   ├── task-card.tsx         # Görev kartı
│   │   ├── progress-tracker.tsx  # İlerleme takipçisi
│   │   ├── edit-trackable-dialog.tsx
│   │   ├── delete-trackable-dialog.tsx
│   │   ├── time-picker.tsx       # Saat seçici
│   │   ├── day-selector.tsx      # Gün seçici
│   │   └── date-picker.tsx       # Tarih seçici
│   ├── health/                   # Sağlık takibi formları
│   ├── mental/                   # Mental sağlık formları
│   ├── productivity/             # Verimlilik araçları
│   ├── finance/                  # Finans formları
│   └── ui/                       # Shadcn UI components
│
├── lib/
│   ├── supabase/                 # Supabase client setup
│   │   ├── server.ts             # Server-side client
│   │   └── client.ts             # Client-side client
│   ├── date-utils.ts             # DST-aware date utilities
│   ├── calendar-utils.ts         # Calendar filtering & logic
│   ├── validations.ts            # Zod schemas
│   ├── task-templates.ts        # Görev şablonları (80+ şablon)
│   └── i18n.ts                   # Türkçe çeviriler
│
├── types/
│   └── database.ts               # TypeScript type definitions
│
└── supabase-schema*.sql          # Database migration scripts
```

## 🎯 Ana Özellikler

### 1. Görev ve Alışkanlık Takibi

#### Görev Tipleri
- **Günlük Alışkanlıklar (DAILY_HABIT)**: Her gün tekrarlanan alışkanlıklar
- **Tek Seferlik Görevler (ONE_TIME)**: Belirli bir tarihte tamamlanan görevler
- **İlerleme Takipçileri (PROGRESS)**: Sayısal hedefler ve ilerleme takibi

#### Görev Özellikleri
- ✅ **Öncelik Sistemi**: Düşük, Orta, Yüksek
- ⏰ **Zaman Planlama**: Belirli saatlerde hatırlatma
- 📅 **Tarih Planlama**: Başlangıç tarihi ve takvim entegrasyonu
- 🔄 **Gün Seçimi**: Haftanın belirli günlerinde görünme
- 🏷️ **Kategori**: Görev veya Alışkanlık olarak sınıflandırma
- 📊 **İlerleme Takibi**: Hedef değer ve mevcut ilerleme

#### Görev Şablonları
80+ önceden tanımlanmış görev şablonu, 13 farklı kategoride:
- İş & Verimlilik
- Sağlık & Fitness
- Eğitim & Öğrenme
- Ev & Temizlik
- Sosyal & İlişkiler
- Finans
- Seyahat & Ulaşım
- ve daha fazlası...

### 2. Takvim Sistemi

#### Görünümler
- **Günlük Görünüm**: Seçilen günün detaylı görev listesi
  - Yapılanlar (tamamlanan görevler)
  - Henüz Yapılmayanlar (bekleyen görevler)
  - Yaklaşanlar (gelecek saatlerdeki görevler)
  
- **Haftalık Görünüm**: 7 sütunlu hafta görünümü (yakında)
- **Aylık Görünüm**: Takvim grid görünümü (yakında)

#### Özellikler
- 📅 **Calendar Sidebar**: Hızlı tarih seçimi
- 🔒 **Strict Date Filtering**: Gelecekteki görevler bugün görünmez
- ⚡ **Real-time Updates**: Her dakika otomatik güncelleme
- 🎯 **Selected Days Sync**: Görevler sadece seçilen günlerde görünür

### 3. Sağlık Takibi Modülü

- ❤️ **Nabız Takibi** (Heart Rate Monitor)
- 😴 **Uyku Takibi**
  - Uyku süresi
  - Uyku kalitesi (REM/Light/Deep)
  - Uyku verimliliği
- 💧 **Su Tüketimi Takibi**
- 🍎 **Kalori ve Makro Takibi**
  - Kalori takibi
  - Karbonhidrat, Protein, Yağ takibi
  - Günlük hedefler
  - Barkod tarayıcı (yakında)

### 4. Mental Sağlık & Alışkanlık Yönetimi

- 📊 **Mood Tracker**: Günlük ruh hali takibi
- 💪 **Motivasyon Puanı**: Günlük motivasyon skoru
- 🧘 **Nefes Egzersizleri**: Breathing sessions (yakında)
- ⏱️ **Meditasyon Zamanlayıcı**: Meditasyon süresi takibi
- 📝 **Günce (Journal)**: Günlük notlar ve düşünceler

### 5. Zaman & Verimlilik

- ✅ **Görev Listesi (To-do)**: Yapılacaklar listesi
- 📅 **Takvim Entegrasyonu**: Görevlerin takvimde görünümü
- 🍅 **Pomodoro Timer**: 25 dakikalık çalışma seansları
- 🔕 **Focus Mode**: Bildirim kapatma (yakında)
- 🎯 **Haftalık/Aylık Hedefler**: Uzun vadeli hedefler
- 📈 **Raporlama & İstatistikler**: Detaylı analizler

### 6. Harcama & Kişisel Finans

- 💰 **Günlük Harcama Takibi**: Günlük giderler
- 📊 **Gelir-Gider Analizi**: Finansal durum analizi
- 📁 **Kategori Bazlı Bütçe**: Kategorilere göre bütçe oluşturma
- 📑 **Aylık Özet Raporlar**: Aylık finansal özetler

### 7. Dashboard & Widget Sistemi

#### Widget'lar
- **İstatistikler**: Genel istatistikler (tamamlanan görevler, alışkanlıklar)
- **Hedefler**: Aktif hedefler ve ilerleme
- **İlerleme**: İlerleme grafikleri

#### Özellikler
- 🎨 **Özelleştirilebilir Layout**: Widget'ları ekle/çıkar
- ⏰ **Dijital Saat**: Sol üstte modern dijital saat
- 📱 **Responsive Design**: Mobil uyumlu tasarım

## 🗄️ Veritabanı Şeması

### Ana Tablolar

#### `trackables` (Görevler/Alışkanlıklar)
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key -> profiles.id)
- title (TEXT)
- type (ENUM: DAILY_HABIT, ONE_TIME, PROGRESS)
- status (ENUM: active, completed, archived)
- current_value (INTEGER)
- target_value (INTEGER, nullable)
- last_completed_at (TIMESTAMPTZ, nullable)
- reset_frequency (ENUM: daily, weekly, none)
- priority (ENUM: low, medium, high, nullable)
- scheduled_time (TIME, nullable)
- selected_days (TEXT[], nullable)
- category (TEXT: task, habit, nullable)
- start_date (DATE, nullable)
- scheduled_date (TIMESTAMPTZ, nullable) -- YENİ: Takvim sistemi için
- is_recurring (BOOLEAN, default: false) -- YENİ
- recurrence_rule (JSONB, nullable) -- YENİ: {"frequency": "daily|weekly|monthly", "daysOfWeek": [1,3,5]}
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### `logs` (Aktivite Logları)
```sql
- id (UUID, Primary Key)
- trackable_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- action (ENUM: completed, incremented, decremented, reset)
- previous_value (INTEGER, nullable)
- new_value (INTEGER, nullable)
- created_at (TIMESTAMPTZ)
```

#### `profiles` (Kullanıcı Profilleri)
```sql
- id (UUID, Primary Key)
- email (TEXT, nullable)
- full_name (TEXT, nullable)
- avatar_url (TEXT, nullable)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### Sağlık Modülü Tabloları
- `health_metrics` - Nabız ve diğer sağlık metrikleri
- `sleep_logs` - Uyku kayıtları
- `water_intake` - Su tüketimi
- `nutrition_logs` - Beslenme kayıtları
- `nutrition_goals` - Beslenme hedefleri

### Mental Sağlık Modülü Tabloları
- `mood_logs` - Ruh hali kayıtları
- `motivation_logs` - Motivasyon kayıtları
- `meditation_sessions` - Meditasyon seansları
- `journal_entries` - Günlük kayıtları

### Verimlilik Modülü Tabloları
- `pomodoro_sessions` - Pomodoro seansları
- `focus_sessions` - Odaklanma seansları
- `goals` - Haftalık/aylık hedefler

### Finans Modülü Tabloları
- `expenses` - Giderler
- `income` - Gelirler
- `budget_categories` - Bütçe kategorileri

## 🔐 Güvenlik (Row Level Security)

Tüm tablolarda RLS (Row Level Security) politikaları aktif:
- Kullanıcılar sadece kendi verilerini görebilir
- Kullanıcılar sadece kendi verilerini düzenleyebilir/silebilir
- Tüm sorgular `user_id` ile filtrelenir

## 📝 Migration Scripts

### Sıralı Çalıştırma
1. `supabase-schema.sql` - Ana şema (profiles, trackables, logs)
2. `supabase-schema-extended.sql` - Genişletilmiş şema (sağlık, mental, vb.)
3. `supabase-schema-priority-time.sql` - Öncelik ve zaman özellikleri
4. `supabase-schema-calendar-days.sql` - Gün seçimi özelliği
5. `supabase-schema-category.sql` - Kategori özelliği
6. `supabase-schema-start-date.sql` - Başlangıç tarihi özelliği
7. `supabase-schema-calendar-system.sql` - Takvim sistemi (scheduled_date, recurring)

### Notlar
- Migration script'leri `IF NOT EXISTS` kontrolleri içerir
- Geriye dönük uyumluluk sağlanır
- Mevcut veriler korunur

## 🎨 UI/UX Özellikleri

### Tema
- **Dark Theme**: Koyu mavi tonları
- **Gradient Backgrounds**: Modern gradient arka planlar
- **Glassmorphism**: Backdrop blur efektleri
- **Smooth Transitions**: Yumuşak geçişler

### Responsive Design
- Mobile-first yaklaşım
- Tablet ve desktop uyumlu
- Grid layout sistemi

### Türkçe Arayüz
- Tüm UI elementleri Türkçe
- Tarih formatları Türkçe locale
- Türkçe gün isimleri

## 🔄 State Management

### Server Components
- Ana sayfa ve modül sayfaları Server Components
- `export const dynamic = 'force-dynamic'` ile dinamik rendering
- Supabase client server-side'da oluşturulur

### Client Components
- Form'lar ve interaktif component'ler Client Components
- `useState` ve `useEffect` ile state yönetimi
- `localStorage` ile widget tercihleri saklanır

## 📅 Tarih Yönetimi

### DST-Aware Date Utilities
- `date-fns` kütüphanesi kullanılır
- Daylight Saving Time geçişleri doğru işlenir
- Tüm tarih işlemleri `lib/date-utils.ts` içinde merkezileştirilmiş

### Calendar Logic
- `lib/calendar-utils.ts` - Takvim filtreleme mantığı
- Strict date filtering: Gelecekteki görevler bugün görünmez
- Recurring task logic: Tekrarlayan görevler için akıllı filtreleme

## 🚀 Deployment

### Vercel
- Framework: Next.js (otomatik algılanır)
- Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Build Command: `npm run build`
- Output Directory: `.next` (otomatik)

### Supabase
- PostgreSQL database
- Row Level Security aktif
- Helper functions: `get_user_trackables`, `complete_trackable`, vb.

## 📚 Kullanım Kılavuzu

### Yeni Görev/Alışkanlık Ekleme
1. Dashboard'da "Yeni Öğe Ekle" butonuna tıklayın
2. "Şablonlar" sekmesinden hazır şablon seçin veya "Özel" sekmesinden manuel oluşturun
3. Başlık, tip, öncelik, zaman, günler ve başlangıç tarihi belirleyin
4. "Oluştur" butonuna tıklayın

### Görev Düzenleme/Silme
1. Görev kartının üzerine gelin
2. Sağ üstteki "..." menüsünden "Düzenle" veya "Sil" seçin
3. Değişiklikleri kaydedin

### Takvim Görünümü
1. Dashboard'da "Günlük" sekmesine tıklayın
2. Sol taraftaki calendar sidebar'dan tarih seçin
3. Görevler otomatik olarak filtrelenir ve kategorilere ayrılır

### Widget Yönetimi
1. Dashboard'da boş widget slot'una tıklayın
2. Eklemek istediğiniz widget'ı seçin
3. Widget'ı kaldırmak için widget'ın sağ üstündeki X butonuna tıklayın

## 🐛 Bilinen Sorunlar ve Çözümler

### SQL Migration Hataları
- **Sorun**: `"use server"` veya `"use client"` kodları SQL Editor'e yapıştırılıyor
- **Çözüm**: Sadece `.sql` dosyalarının içeriğini kopyalayın, TypeScript kodlarını değil

### Hydration Errors
- **Sorun**: Server ve client render farklılıkları
- **Çözüm**: `mounted` state kullanılarak client-side rendering kontrol edilir

### Date Filtering
- **Sorun**: Gelecekteki görevler bugün görünüyor
- **Çözüm**: `shouldTrackableAppearOnDate` fonksiyonu ile strict filtering

## 🔮 Gelecek Özellikler

- [ ] Haftalık görünüm (7 sütunlu grid)
- [ ] Aylık görünüm (calendar grid)
- [ ] Barkod tarayıcı (beslenme takibi için)
- [ ] Grafikler ve istatistikler (Chart.js/Recharts)
- [ ] AI analiz raporları
- [ ] Bildirim sistemi
- [ ] Export/Import özelliği
- [ ] Mobil uygulama (React Native)

## 📞 Destek

Sorun yaşarsanız:
1. `DEBUG_GUIDE.md` dosyasını kontrol edin
2. Vercel logs'larına bakın
3. Supabase SQL Editor'de migration script'lerini kontrol edin

## 📄 Lisans

Bu proje özel bir projedir.

---

**Son Güncelleme**: 2025-01-25
**Versiyon**: 1.0.0

