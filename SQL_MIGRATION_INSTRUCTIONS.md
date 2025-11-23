# ⚠️ SQL Migration Talimatları

## ❌ HATA: "use server" Hatası

Bu hata, **TypeScript/JavaScript dosyasını** SQL Editor'e yapıştırdığınızda oluşur!

## ✅ DOĞRU KULLANIM

### Adım 1: Doğru Dosyayı Kullanın

**✅ KULLANIN:**
- `SQL_ONLY-performance-indexes.sql` (Sadece SQL içeriği)
- `supabase-performance-indexes.sql` (Ama sadece SQL kısmını kopyalayın)

**❌ KULLANMAYIN:**
- `app/actions-daily-health.ts` (TypeScript dosyası!)
- `components/**/*.tsx` (React dosyaları!)
- `lib/**/*.ts` (TypeScript dosyaları!)

### Adım 2: Supabase SQL Editor'de Çalıştırma

1. **Supabase Dashboard** → **SQL Editor**'e gidin
2. **New Query** butonuna tıklayın
3. **VS Code veya text editor**'de `SQL_ONLY-performance-indexes.sql` dosyasını açın
4. **TÜM SQL KODUNU** kopyalayın (yorumlar dahil)
5. SQL Editor'e yapıştırın
6. **Run** butonuna tıklayın

### Adım 3: Başarı Kontrolü

Başarılı olursa şu mesajı göreceksiniz:
```
Success. No rows returned
```

### Önemli Notlar

- ❌ **YAPMAYIN:** `"use server"` veya `"use client"` gibi JavaScript kodlarını SQL Editor'e yapıştırmayın
- ✅ **YAPIN:** Sadece SQL kodunu kopyalayın (örneğin: `CREATE INDEX IF NOT EXISTS...`)
- Her migration script'ini ayrı ayrı çalıştırın
- Hata alırsanız, önceki migration'ların başarılı olup olmadığını kontrol edin

## 🔍 Hata Kontrolü

### "use server" hatası alıyorsanız:
- ❌ TypeScript dosyası yapıştırmışsınız
- ✅ `SQL_ONLY-performance-indexes.sql` dosyasını kullanın

### "relation does not exist" hatası alıyorsanız:
- Önce `supabase-schema-complete.sql` dosyasını çalıştırın
- Sonra index'leri çalıştırın
