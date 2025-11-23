# Sorun Giderme Rehberi

## Server Action Hataları

### "Database kolonu eksik" Hatası

Eğer yeni bir görev/alışkanlık oluştururken "Database kolonu eksik" hatası alıyorsanız, Supabase database'inizde gerekli kolonlar eksik demektir.

#### Çözüm:

1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. Şu dosyaları **sırayla** çalıştırın (sadece SQL içeriğini kopyalayın):

   **Adım 1:** `supabase-migration-complete.sql` dosyasının içeriğini kopyalayıp yapıştırın ve çalıştırın.
   
   **Adım 2:** `supabase-schema-category.sql` dosyasının içeriğini kopyalayıp yapıştırın ve çalıştırın.

#### Önemli Notlar:

- ❌ **YAPMAYIN:** `"use server"` veya `"use client"` gibi JavaScript kodlarını SQL Editor'e yapıştırmayın
- ✅ **YAPIN:** Sadece SQL kodunu kopyalayın (örneğin: `ALTER TABLE trackables ADD COLUMN...`)
- Her migration script'ini ayrı ayrı çalıştırın
- Hata alırsanız, önceki migration'ların başarılı olup olmadığını kontrol edin

### Development Modda Çalıştırma

Daha detaylı hata mesajları için development modda çalıştırın:

```bash
npm run dev
```

Sonra tarayıcıda `http://localhost:3000` adresine gidin ve konsolu açın (F12).

### Yaygın Hatalar

#### 1. "column does not exist" (42703)
- **Neden:** Migration script'leri çalıştırılmamış
- **Çözüm:** Yukarıdaki migration script'lerini çalıştırın

#### 2. "syntax error at or near 'use server'"
- **Neden:** JavaScript kodunu SQL Editor'e yapıştırmışsınız
- **Çözüm:** Sadece SQL kodunu kopyalayın

#### 3. "relation does not exist"
- **Neden:** Ana schema dosyası (`supabase-schema.sql`) çalıştırılmamış
- **Çözüm:** Önce `supabase-schema.sql` dosyasını çalıştırın, sonra migration'ları

## React Hydration Hataları

Eğer React hydration hataları (#418, #423, #425) alıyorsanız:

1. Tarayıcı cache'ini temizleyin (Ctrl+Shift+Delete)
2. Sayfayı hard refresh yapın (Ctrl+F5)
3. Development modda çalıştırıp konsolu kontrol edin

## Migration Script'lerini Çalıştırma

### Supabase SQL Editor Kullanımı:

1. Supabase Dashboard → SQL Editor
2. "New query" butonuna tıklayın
3. SQL dosyasının içeriğini kopyalayın (sadece SQL, başka kod değil)
4. "Run" butonuna tıklayın
5. Başarılı mesajını bekleyin

### Örnek SQL İçeriği:

```sql
-- Doğru: Sadece SQL
ALTER TABLE trackables
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'habit' CHECK (category IN ('task', 'habit'));

-- Yanlış: JavaScript kodları içeriyor
"use server"
ALTER TABLE trackables...
```

## Hala Sorun mu Var?

1. Tarayıcı konsolunu açın (F12)
2. Network sekmesinde failed request'leri kontrol edin
3. Console sekmesinde hata mesajlarını okuyun
4. Hata mesajlarını ve ekran görüntülerini kaydedin

