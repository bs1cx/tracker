# Debug Rehberi: Server Action Hataları

## Production'da Hata Mesajları Gizleniyor

Production build'de Next.js hata mesajlarını güvenlik nedeniyle gizler. Detaylı hata mesajlarını görmek için development modda çalıştırmanız gerekir.

## Development Modda Çalıştırma

### Adım 1: Development Server'ı Başlatın

```bash
npm run dev
```

### Adım 2: Tarayıcıda Açın

1. `http://localhost:3000` adresine gidin
2. F12 tuşuna basarak Developer Tools'u açın
3. **Console** sekmesine gidin

### Adım 3: Hata Oluşturun

1. Yeni bir öğe eklemeyi deneyin
2. Console'da detaylı hata mesajlarını göreceksiniz

## Console'da Göreceğiniz Loglar

Development modda şu loglar görünecek:

```
createTrackable called with data: { ... }
Validation successful: { ... }
Supabase client created successfully
User authenticated: <user-id>
Attempting to insert trackable with data: { ... }
```

Eğer hata varsa:

```
Supabase error creating trackable: { ... }
Error code: 42703
Error message: column "priority" does not exist
Error details: ...
Error hint: ...
```

## Yaygın Hata Kodları

### 42703 - Column Does Not Exist
**Anlamı:** Database'de kolon eksik
**Çözüm:** Migration script'lerini çalıştırın (QUICK_FIX.md'ye bakın)

### 23505 - Unique Violation
**Anlamı:** Aynı isimde öğe zaten var
**Çözüm:** Farklı bir isim kullanın

### 23503 - Foreign Key Violation
**Anlamı:** Geçersiz referans
**Çözüm:** Verilerinizi kontrol edin

### 42501 - Insufficient Privilege
**Anlamı:** RLS (Row Level Security) policy hatası
**Çözüm:** Supabase'de RLS policy'lerini kontrol edin

## Vercel Logs'u Kontrol Etme

Eğer production'da hata alıyorsanız:

1. Vercel Dashboard → Projeniz → **Logs** sekmesi
2. Son deployment'ın loglarını kontrol edin
3. "Error creating trackable" ile başlayan satırları arayın

## Network Tab'ı Kontrol Etme

1. Developer Tools → **Network** sekmesi
2. Yeni öğe eklemeyi deneyin
3. Failed request'i bulun (kırmızı renkte)
4. **Response** sekmesine tıklayın
5. Hata mesajını okuyun

## Migration Script'lerini Kontrol Etme

Supabase SQL Editor'de şu sorguyu çalıştırarak kolonların varlığını kontrol edin:

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'trackables' 
AND column_name IN ('priority', 'scheduled_time', 'selected_days', 'category')
ORDER BY column_name;
```

Bu sorgu 4 satır döndürmeli:
- `category` (TEXT)
- `priority` (TEXT veya ENUM)
- `scheduled_time` (TIME)
- `selected_days` (ARRAY)

Eğer eksik kolon varsa, migration script'lerini çalıştırın.

## Hata Hala Devam Ediyorsa

1. **Console loglarını** kaydedin (screenshot veya text)
2. **Network tab'ındaki** failed request'in response'unu kaydedin
3. **Vercel logs'u** kontrol edin
4. Bu bilgileri paylaşın

