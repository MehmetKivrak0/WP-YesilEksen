# Çiftçi Detay Modal - Belge Görüntüleme Sorunu ve Çözümü

## Sorun Özeti

Dashboard'daki "Kayıtlı Çiftçiler" tablosundaki "İncele" butonuna tıklandığında açılan `FarmerDetailModal` component'inde belgeler görüntülenemiyordu ve 404 hatası alınıyordu.

## Tespit Edilen Sorunlar

### 1. Belgeler Gözükmüyordu
- Backend'de belge sorgusu sadece `ciftlik_id` ile yapılıyordu
- Bazı belgeler `basvuru_id` ile bağlı olduğu için getirilemiyordu

### 2. URL'lerde Çift `/api/api/` Hatası
- Backend'den gelen URL'ler `/api/documents/file/...` formatındaydı
- Frontend'de `apiBaseUrl` zaten `http://localhost:5000/api` içeriyordu
- Birleştirilince: `http://localhost:5000/api` + `/api/documents/file/...` = `/api/api/...` ❌
- Sonuç: 404 Not Found hatası

### 3. Belge İsimlerinde Encoding Sorunları
- Türkçe karakterler bozuk görünüyordu (örn: `aÃ¶lf-belge.pdf`)
- `decodeURIComponent` kullanılmıyordu

### 4. Modal Tasarımı
- Açıklama kısmı basit görünüyordu
- Belgeler pop-up şeklinde gösterilmiyordu
- Çiftçi Onay modal'ındaki gibi profesyonel bir görünüm yoktu

## Çözüm

### 1. Backend - Belge Sorgusu Düzeltildi

**Dosya:** `server/src/controllers/ziraatController.js`

```javascript
// Belgeleri al - hem ciftlik_id hem de basvuru_id ile bağlı belgeleri getir
const documentsQuery = `
    SELECT 
        b.id as "belgeId",
        b.ad as name,
        b.dosya_yolu,
        b.durum as status,
        b.kullanici_notu as "farmerNote",
        b.yonetici_notu as "adminNote",
        b.basvuru_id,
        bt.ad as "belgeTuru",
        bt.kod as "belgeKodu"
    FROM belgeler b
    LEFT JOIN belge_turleri bt ON b.belge_turu_id = bt.id
    WHERE (b.ciftlik_id = $1::uuid OR b.basvuru_id IN (
        SELECT id FROM ciftlik_basvurulari WHERE kullanici_id = $2::uuid
    )) AND b.basvuru_tipi = 'ciftlik_basvurusu'
    ORDER BY b.olusturma DESC
`;
```

**Değişiklik:**
- Artık hem `ciftlik_id` hem de `basvuru_id` ile bağlı belgeler getiriliyor
- `kullanici_id` üzerinden başvurular bulunup belgeleri getiriyor

### 2. Backend - URL Oluşturma Düzeltildi

```javascript
// Belgeler için URL oluştur - sadece path döndür (frontend'de base URL ile birleştirilecek)
const documentsWithUrl = documentsResult.rows.map(doc => {
    let url = null;
    if (doc.dosya_yolu) {
        // Dosya yolundaki her segmenti ayrı ayrı encode et (slash'lar korunur)
        const normalizedPath = doc.dosya_yolu.split('/').map(part => encodeURIComponent(part)).join('/');
        // Sadece path döndür, /api ekleme (frontend'de ekleyecek)
        url = `/documents/file/${normalizedPath}`;
    }
    return {
        ...doc,
        url
    };
});
```

**Değişiklik:**
- Artık `/api` olmadan sadece `/documents/file/...` formatında path döndürülüyor
- Frontend'de `apiBaseUrl` ile birleştirilince doğru URL oluşuyor

### 3. Frontend - URL Birleştirme Düzeltildi

**Dosya:** `src/pages/admin/ziraat/dashboard/components/FarmerDetailModal.tsx`

```typescript
// API base URL'ini api.ts ile aynı mantıkta oluştur
const apiBaseUrl = useMemo(() => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
}, []);

// URL birleştirme
const absoluteUrl = doc.url.startsWith('http')
  ? doc.url
  : `${apiBaseUrl}${doc.url.startsWith('/') ? doc.url : '/' + doc.url}`;
```

**Değişiklik:**
- `apiBaseUrl` artık `api.ts` ile aynı mantıkta: `http://localhost:5000/api`
- Backend'den gelen `/documents/file/...` path'i ile birleştirilince: `http://localhost:5000/api/documents/file/...` ✅

### 4. Belge İsimlerinde Encoding Düzeltildi

```typescript
const formatFileName = (name?: string) => {
  if (!name) return 'Belge';
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
};
```

**Değişiklik:**
- `decodeURIComponent` ile Türkçe karakterler düzgün görünüyor
- Hata durumunda orijinal isim gösteriliyor

### 5. Modal Tasarımı İyileştirildi

**Açıklama Bölümü:**
- Sol kenarda renkli border ve ikon eklendi
- Daha okunabilir ve görsel hale getirildi
- `whitespace-pre-wrap` ile çok satırlı açıklamalar düzgün görünüyor

**Belgeler Bölümü:**
- Her belge için ikon eklendi
- Durum badge'leri renkli ve anlaşılır
- Belge türü bilgisi gösteriliyor
- Çiftçi Onay modal'ındaki gibi pop-up belge görüntüleme eklendi
- Token ile fetch yapılıyor, blob URL ile gösteriliyor

## Sonuç

✅ Belgeler artık hem `ciftlik_id` hem de `basvuru_id` ile bağlı olarak getiriliyor  
✅ URL'ler doğru oluşturuluyor, çift `/api/api/` sorunu çözüldü  
✅ Belge isimleri düzgün görünüyor (Türkçe karakterler)  
✅ Modal tasarımı iyileştirildi, pop-up belge görüntüleme eklendi  
✅ Çiftçi Onay modal'ındaki gibi profesyonel bir görünüm sağlandı

## İlgili Dosyalar

- `server/src/controllers/ziraatController.js` - `getFarmerDetails` fonksiyonu
- `src/pages/admin/ziraat/dashboard/components/FarmerDetailModal.tsx` - Modal component
- `src/services/ziraatService.ts` - `getFarmerDetails` service fonksiyonu

## Test

1. Dashboard'a gidin
2. "Kayıtlı Çiftçiler" tablosunda bir çiftçinin "İncele" butonuna tıklayın
3. Modal açıldığında belgelerin göründüğünü kontrol edin
4. Bir belgenin "Görüntüle" butonuna tıklayın
5. Belgenin pop-up içinde açıldığını ve 404 hatası alınmadığını doğrulayın

