# 🔧 Migration Rehberi

## ⚠️ ÖNEMLİ: SQL Dosyalarını Doğru Kullanma

**HATA:** `"use client"` hatası alıyorsanız, muhtemelen yanlış dosyayı kopyaladınız!

**ÇÖZÜM:** Sadece `.sql` uzantılı dosyaları kullanın. `.tsx`, `.ts` veya `.js` dosyalarını ASLA kullanmayın!

## 📋 Doğru Migration Sırası

### 1. Ana Schema (İlk Kurulum)
```sql
-- supabase-schema.sql dosyasını çalıştırın
```

### 2. Extended Schema (Yeni Tablolar)
```sql
-- supabase-schema-extended.sql dosyasını çalıştırın
```

### 3. Complete Migration (Önerilen - Tek Seferde)
```sql
-- supabase-migration-complete.sql dosyasını çalıştırın
-- Bu dosya priority, scheduled_time ve selected_days kolonlarını ekler
```

### VEYA Ayrı Ayrı:

**3a. Priority ve Scheduled Time**
```sql
-- supabase-schema-priority-time.sql
```

**3b. Calendar ve Selected Days**
```sql
-- supabase-schema-calendar-days.sql
```

## ✅ Doğru Kullanım Adımları

1. **Supabase Dashboard** > **SQL Editor**'e gidin
2. **Yeni Query** oluşturun
3. `.sql` dosyasını açın (VS Code veya text editor'de)
4. **Sadece SQL kodunu** kopyalayın (yorumlar dahil, ama JavaScript/TypeScript kodları DEĞİL)
5. SQL Editor'e yapıştırın
6. **Run** butonuna tıklayın

## ❌ YAPMAYIN

- ❌ `.tsx` veya `.ts` dosyalarını SQL Editor'e yapıştırmayın
- ❌ `"use client"` veya `"use server"` gibi JavaScript direktiflerini SQL'e kopyalamayın
- ❌ Component kodlarını SQL Editor'e yapıştırmayın

## 🔍 Hangi Dosyaları Kullanmalıyım?

**SQL Dosyaları (✅ Kullanın):**
- `supabase-schema.sql`
- `supabase-schema-extended.sql`
- `supabase-migration-complete.sql`
- `supabase-schema-priority-time.sql`
- `supabase-schema-calendar-days.sql`
- `supabase-migration-fix-date.sql`

**TypeScript/JavaScript Dosyaları (❌ Kullanmayın):**
- `app/actions.ts`
- `components/**/*.tsx`
- `lib/**/*.ts`

## 🐛 Hata Alırsanız

### "use client" hatası
- ✅ `.sql` dosyasını kullandığınızdan emin olun
- ✅ Sadece SQL kodunu kopyalayın
- ✅ JavaScript/TypeScript kodlarını kopyalamayın

### "column does not exist" hatası
- ✅ Önce `supabase-schema.sql` çalıştırıldı mı kontrol edin
- ✅ Migration script'lerini sırayla çalıştırın

### "relation does not exist" hatası
- ✅ Tablolar oluşturuldu mu kontrol edin
- ✅ `supabase-schema.sql` ve `supabase-schema-extended.sql` çalıştırıldı mı?

