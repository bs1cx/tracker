# SQL Migration Kılavuzu

## ⚠️ ÖNEMLİ UYARI

**Supabase SQL Editor'e SADECE SQL KODU yapıştırın!**

### ❌ YAPMAYIN:
- TypeScript dosyalarını (.ts) kopyalayıp yapıştırmayın
- JavaScript dosyalarını (.js) kopyalayıp yapıştırmayın
- "use server" veya "use client" içeren kodları yapıştırmayın
- Tüm dosya içeriğini kopyalayıp yapıştırmayın

### ✅ YAPIN:
- Sadece `.sql` uzantılı dosyaları kullanın
- SQL dosyasının içindeki SQL kodunu kopyalayın
- "use server" veya "use client" satırlarını atlayın

## Doğru Kullanım Adımları

1. **SQL Dosyasını Açın**
   - Örneğin: `supabase-fix-get-user-trackables.sql`

2. **Dosya İçeriğini Kontrol Edin**
   - Dosyanın başında "use server" veya "use client" varsa, bu satırları atlayın
   - Sadece SQL komutlarını kopyalayın

3. **Supabase SQL Editor'e Yapıştırın**
   - Supabase Dashboard > SQL Editor
   - Yeni Query oluşturun
   - Sadece SQL kodunu yapıştırın
   - Run butonuna tıklayın

## Örnek: supabase-fix-get-user-trackables.sql

Bu dosyayı kullanırken:

1. Dosyayı açın
2. **Tüm içeriği** kopyalayın (bu dosya zaten sadece SQL içeriyor)
3. Supabase SQL Editor'e yapıştırın
4. Run butonuna tıklayın

## Hata Mesajları

### "syntax error at or near 'use server'"
**Neden:** TypeScript/JavaScript dosyası yapıştırılmış  
**Çözüm:** Sadece `.sql` dosyalarını kullanın ve içindeki SQL kodunu kopyalayın

### "syntax error at or near 'use client'"
**Neden:** Client-side kod yapıştırılmış  
**Çözüm:** Sadece SQL kodunu kopyalayın

## Hangi Dosyaları Kullanmalıyım?

### ✅ SQL Dosyaları (Kullanın):
- `supabase-schema-complete.sql`
- `supabase-schema-health-extended.sql`
- `supabase-fix-get-user-trackables.sql`
- `supabase-fix-budget-categories.sql`
- `supabase-schema-calendar-system.sql`
- `supabase-schema-category.sql`
- `supabase-schema-start-date.sql`

### ❌ TypeScript/JavaScript Dosyaları (Kullanmayın):
- `app/actions.ts`
- `app/actions-health.ts`
- `components/**/*.tsx`
- `lib/**/*.ts`

## Sorun Giderme

Eğer hala hata alıyorsanız:

1. Dosyanın uzantısını kontrol edin (`.sql` olmalı)
2. Dosya içeriğini kontrol edin (sadece SQL komutları olmalı)
3. İlk satırda "use server" veya "use client" varsa, bu satırı silin
4. Tekrar deneyin

## Yardım

Eğer sorun devam ederse:
1. Hangi dosyayı çalıştırmaya çalıştığınızı belirtin
2. Hata mesajının tamamını paylaşın
3. Dosyanın ilk birkaç satırını paylaşın

