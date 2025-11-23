# Hızlı Çözüm: Database Kolonu Eksik Hatası

## Sorun
"Server Components render" hatası alıyorsunuz. Bu genellikle database'de eksik kolonlar olduğunu gösterir.

## Çözüm (5 Dakika)

### Adım 1: Supabase Dashboard'a Gidin
1. https://supabase.com/dashboard adresine gidin
2. Projenizi seçin
3. Sol menüden **SQL Editor**'ü açın

### Adım 2: İlk Migration'ı Çalıştırın
1. **New query** butonuna tıklayın
2. Aşağıdaki SQL kodunu kopyalayıp yapıştırın:

```sql
-- Add priority column to trackables table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trackables' AND column_name = 'priority') THEN
        ALTER TABLE trackables ADD COLUMN priority TEXT DEFAULT 'medium';
        CREATE TYPE trackable_priority AS ENUM ('low', 'medium', 'high');
        ALTER TABLE trackables ALTER COLUMN priority TYPE trackable_priority USING priority::trackable_priority;
        ALTER TABLE trackables ALTER COLUMN priority SET DEFAULT 'medium';
    END IF;
END $$;

-- Add scheduled_time column to trackables table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trackables' AND column_name = 'scheduled_time') THEN
        ALTER TABLE trackables ADD COLUMN scheduled_time TIME;
    END IF;
END $$;

-- Add selected_days column to trackables table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trackables' AND column_name = 'selected_days') THEN
        ALTER TABLE trackables ADD COLUMN selected_days TEXT[] DEFAULT ARRAY[]::TEXT[];
        CREATE INDEX IF NOT EXISTS idx_trackables_selected_days ON trackables USING GIN (selected_days);
    END IF;
END $$;
```

3. **Run** butonuna tıklayın
4. "Success. No rows returned" mesajını bekleyin

### Adım 3: İkinci Migration'ı Çalıştırın
1. Yeni bir query oluşturun (New query)
2. Aşağıdaki SQL kodunu kopyalayıp yapıştırın:

```sql
-- Add category column (task or habit)
ALTER TABLE trackables
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'habit' CHECK (category IN ('task', 'habit'));

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_trackables_category ON trackables(user_id, category);

-- Add comment for documentation
COMMENT ON COLUMN trackables.category IS 'Category of trackable: task (görev) or habit (alışkanlık)';
```

3. **Run** butonuna tıklayın
4. "Success. No rows returned" mesajını bekleyin

### Adım 4: Uygulamayı Yenileyin
1. Tarayıcıda sayfayı yenileyin (F5 veya Ctrl+R)
2. Yeni bir öğe eklemeyi deneyin

## Hala Çalışmıyor mu?

### Development Modda Çalıştırın
Daha detaylı hata mesajları için:

```bash
npm run dev
```

Sonra tarayıcıda `http://localhost:3000` adresine gidin ve konsolu açın (F12).

### Kontrol Edin
Supabase SQL Editor'de şu sorguyu çalıştırarak kolonların varlığını kontrol edin:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trackables' 
AND column_name IN ('priority', 'scheduled_time', 'selected_days', 'category');
```

Bu sorgu 4 satır döndürmeli (her kolon için bir satır).

## Önemli Notlar

- ❌ **YAPMAYIN:** `"use server"` veya `"use client"` gibi JavaScript kodlarını SQL Editor'e yapıştırmayın
- ✅ **YAPIN:** Sadece SQL kodunu kopyalayın (ALTER TABLE, CREATE INDEX, vb.)
- Her migration'ı ayrı ayrı çalıştırın
- Hata alırsanız, önceki migration'ların başarılı olup olmadığını kontrol edin

