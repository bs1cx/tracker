# 🚀 Deployment Stratejisi - Rate Limit Çözümü

## Problem
Vercel'de çok fazla otomatik deploy yapıldığı için rate limit'e takıldık. Her commit'te otomatik deploy olmaması gerekiyor.

## Çözüm: Branch-Based Deployment Stratejisi

### Strateji
- **`dev` branch**: Günlük geliştirme için kullanılır, Vercel'e deploy olmaz
- **`main` branch**: Sadece production-ready kodlar buraya merge edilir, Vercel'e deploy olur

### Workflow

#### 1. Development Branch Oluştur
```bash
git checkout -b dev
git push -u origin dev
```

#### 2. Günlük Çalışma
```bash
# Dev branch'inde çalış
git checkout dev

# Değişikliklerini yap ve commit et (sınırsız)
git add .
git commit -m "Feature: yeni özellik"
git push origin dev  # Vercel deploy olmaz ✅
```

#### 3. Production'a Geçiş (Her 10 güncellemede veya hazır olduğunda)
```bash
# Dev'den main'e merge et
git checkout main
git merge dev
git push origin main  # Vercel deploy olur 🚀
```

### Vercel Ayarları

Vercel Dashboard'da şu ayarları yapın:

1. **Settings > Git** bölümüne gidin
2. **Production Branch**: `main` olarak ayarlayın
3. **Auto-deploy**: Sadece `main` branch'i için aktif olsun
4. **Preview Deployments**: İsteğe bağlı olarak kapatabilirsiniz (rate limit için)

**Alternatif:**
- **Settings > Git > Ignored Build Step**: 
  - Command: `[ "$VERCEL_GIT_COMMIT_REF" != "main" ] && exit 1 || exit 0`
  - Bu sayede sadece `main` branch'ine push edildiğinde build olur

### Avantajlar

✅ **Rate Limit Sorunu Çözülür**: Sadece `main` branch'ine push edildiğinde deploy olur  
✅ **Esnek Geliştirme**: `dev` branch'inde sınırsız commit yapabilirsiniz  
✅ **Production Güvenliği**: Sadece test edilmiş kodlar production'a gider  
✅ **Kolay Rollback**: Sorun olursa `main` branch'inden önceki commit'e dönebilirsiniz  

### Hızlı Komutlar

```bash
# Dev branch'ine geç ve çalış
git checkout dev

# Değişiklik yap ve push et (deploy olmaz)
git add .
git commit -m "Update"
git push origin dev

# Hazır olduğunda main'e merge et (deploy olur)
git checkout main
git merge dev
git push origin main
```

### Notlar

- `dev` branch'ine push yapmak Vercel'e deploy tetiklemez
- `main` branch'ine push yapmak Vercel'e deploy tetikler
- Her 10 güncellemede veya önemli bir özellik tamamlandığında `main`'e merge edin
- Acil bir fix gerekiyorsa direkt `main`'e push edebilirsiniz

## Alternatif: Manuel Deploy

Eğer branch stratejisi istemiyorsanız:

1. Vercel Dashboard > **Settings > Git**
2. **Auto-deploy** seçeneğini kapatın
3. Her deploy'u manuel olarak **Deployments** sekmesinden yapın

Bu durumda:
- Commit'leriniz GitHub'a push olur ama Vercel deploy olmaz
- İstediğiniz zaman manuel olarak deploy edersiniz

