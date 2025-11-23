# SQL Migration Instructions - ÖNEMLİ!

## ⚠️ KRİTİK UYARI

**SQL Editor'e SADECE `.sql` dosyalarının içeriğini yapıştırın!**

**TypeScript/JavaScript dosyalarını (`app/actions.ts`, `lib/*.ts`, vb.) ASLA yapıştırmayın!**

## ✅ Doğru Kullanım

1. `supabase-schema-complete.sql` dosyasını açın
2. **TÜM İÇERİĞİNİ** kopyalayın (Ctrl+A, Ctrl+C)
3. Supabase Dashboard > SQL Editor'e gidin
4. Yeni bir query oluşturun
5. Kopyaladığınız SQL kodunu yapıştırın
6. "Run" butonuna tıklayın

## ❌ Yanlış Kullanım

- `app/actions.ts` dosyasını kopyalayıp SQL Editor'e yapıştırmak ❌
- `lib/calendar-utils.ts` dosyasını kopyalayıp SQL Editor'e yapıştırmak ❌
- Herhangi bir TypeScript/JavaScript dosyasını SQL Editor'e yapıştırmak ❌

## 📝 Migration Sırası

### Yeni Kurulum (Temiz Database)
1. `supabase-schema-complete.sql` - Tüm şemayı oluşturur

### Mevcut Database'e Ekleme
Eğer zaten `supabase-schema.sql` çalıştırdıysanız:

1. `supabase-schema-complete.sql` - Tüm tabloları ve alanları ekler (IF NOT EXISTS kullanır, güvenli)

## 🔍 Dosya Kontrolü

SQL dosyası olduğundan emin olmak için:
- Dosya uzantısı `.sql` olmalı
- İçinde `CREATE TABLE`, `ALTER TABLE`, `CREATE FUNCTION` gibi SQL komutları olmalı
- `"use server"` veya `"use client"` gibi TypeScript direktifleri OLMAMALI

## 🆘 Hata Alırsanız

Eğer `"use server"` hatası alırsanız:
1. SQL Editor'deki tüm kodu silin
2. `supabase-schema-complete.sql` dosyasını açın
3. İçeriğini tekrar kopyalayın
4. SQL Editor'e yapıştırın
5. Tekrar çalıştırın

