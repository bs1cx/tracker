# 🗄️ Database Kurulum Rehberi

## Adım Adım Kurulum

### 1. Ana Schema'yı Çalıştırın

1. Supabase Dashboard > **SQL Editor**'e gidin
2. `supabase-schema.sql` dosyasının **tüm içeriğini** kopyalayın
3. SQL Editor'de çalıştırın
4. Başarılı olduğundan emin olun

### 2. Extended Schema'yı Çalıştırın

1. `supabase-schema-extended.sql` dosyasının **tüm içeriğini** kopyalayın
2. SQL Editor'de çalıştırın
3. Tüm tablolar oluşturulmalı

### 3. Migration Script (Sadece Gerekirse)

**Sadece şu durumda çalıştırın:**
- Tablolar zaten `date` kolonu ile oluşturulduysa
- `log_date` kolonu bulunamıyor hatası alıyorsanız

1. `supabase-migration-fix-date.sql` dosyasını çalıştırın
2. Bu script mevcut `date` kolonlarını `log_date` olarak değiştirir

## ⚠️ Önemli Notlar

- **Önce** `supabase-schema.sql` çalıştırılmalı
- **Sonra** `supabase-schema-extended.sql` çalıştırılmalı
- Migration script'i **sadece gerekirse** çalıştırın

## ✅ Kontrol Listesi

- [ ] `supabase-schema.sql` başarıyla çalıştırıldı
- [ ] `supabase-schema-extended.sql` başarıyla çalıştırıldı
- [ ] Tüm tablolar oluşturuldu (Table Editor'de kontrol edin)
- [ ] RLS politikaları aktif (her tablo için kontrol edin)

## 🔍 Tabloları Kontrol Etme

Supabase Dashboard > **Table Editor**'de şu tabloları görmelisiniz:

**Ana Tablolar:**
- profiles
- trackables
- logs

**Yeni Tablolar:**
- health_metrics
- sleep_logs
- water_intake
- nutrition_logs
- nutrition_goals
- mood_logs
- motivation_logs
- meditation_sessions
- journal_entries
- pomodoro_sessions
- focus_sessions
- goals
- expenses
- income
- budget_categories

## 🐛 Sorun Giderme

### "relation does not exist" hatası
- Önce `supabase-schema.sql` çalıştırıldı mı kontrol edin
- Tabloları Table Editor'de kontrol edin

### "column does not exist" hatası
- Migration script'ini çalıştırın (`supabase-migration-fix-date.sql`)

### RLS hatası
- RLS politikalarının oluşturulduğundan emin olun
- Her tablo için policy'leri kontrol edin

