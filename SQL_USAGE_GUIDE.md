# ⚠️ SQL Dosyalarını Doğru Kullanma Rehberi

## ❌ HATA: "use server" Hatası

Bu hata, **TypeScript/JavaScript dosyasını** SQL Editor'e yapıştırdığınızda oluşur!

## ✅ DOĞRU KULLANIM

### 1. Sadece `.sql` Dosyalarını Kullanın

**✅ KULLANIN:**
- `supabase-schema.sql`
- `supabase-schema-extended.sql`
- `supabase-schema-category.sql`
- `supabase-migration-complete.sql`
- `supabase-schema-priority-time.sql`
- `supabase-schema-calendar-days.sql`

**❌ KULLANMAYIN:**
- `app/actions.ts` (TypeScript dosyası!)
- `components/**/*.tsx` (React dosyaları!)
- `lib/**/*.ts` (TypeScript dosyaları!)

### 2. Adım Adım Kullanım

1. **Supabase Dashboard** > **SQL Editor**'e gidin
2. **Yeni Query** oluşturun
3. **VS Code veya text editor**'de `.sql` dosyasını açın
4. **Sadece SQL kodunu** kopyalayın (yorumlar dahil)
5. SQL Editor'e yapıştırın
6. **Run** butonuna tıklayın

### 3. Migration Sırası

**ÖNEMLİ:** Dosyaları bu sırayla çalıştırın:

1. ✅ `supabase-schema.sql` (Ana schema)
2. ✅ `supabase-schema-extended.sql` (Yeni tablolar)
3. ✅ `supabase-migration-complete.sql` (Priority, time, days)
4. ✅ `supabase-schema-category.sql` (Kategori - YENİ!)

### 4. Kategori Migration'ı

Kategori özelliğini eklemek için:

```sql
-- Supabase SQL Editor'de çalıştırın:
-- supabase-schema-category.sql dosyasının içeriği
```

**Dosya içeriği:**
```sql
-- Add category column (task or habit)
ALTER TABLE trackables 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'habit' CHECK (category IN ('task', 'habit'));

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_trackables_category ON trackables(user_id, category);

-- Add comment for documentation
COMMENT ON COLUMN trackables.category IS 'Category of trackable: task (görev) or habit (alışkanlık)';
```

## 🔍 Hata Kontrolü

### "use server" hatası alıyorsanız:
- ❌ TypeScript dosyası yapıştırmışsınız
- ✅ `.sql` dosyasını kullanın

### "column does not exist" hatası alıyorsanız:
- ✅ Migration script'lerini sırayla çalıştırın
- ✅ Önce `supabase-schema.sql` çalıştırıldı mı kontrol edin

### "relation does not exist" hatası alıyorsanız:
- ✅ Tablolar oluşturuldu mu kontrol edin
- ✅ `supabase-schema.sql` çalıştırıldı mı?

## 📝 Örnek: Kategori Migration'ı

1. `supabase-schema-category.sql` dosyasını açın
2. **Tüm içeriği** kopyalayın (yorumlar dahil)
3. Supabase SQL Editor'e yapıştırın
4. **Run** butonuna tıklayın
5. Başarılı mesajını bekleyin

**ASLA `app/actions.ts` veya başka TypeScript dosyalarını kopyalamayın!**

