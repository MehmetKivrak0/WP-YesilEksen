# Dashboard 500 Internal Server Error - Farm Applications

## Sorun
Dashboard sayfasında `/api/ziraat/farms/applications` endpoint'inden veri çekerken **500 Internal Server Error** hatası alınıyordu.

## Neden
Backend'deki `getFarmApplications` fonksiyonunda birkaç SQL sorgu hatası vardı:

1. **SQL Parametre İndeksleme Hatası:** `LIMIT` ve `OFFSET` için parametre indeksleri yanlış hesaplanıyordu
2. **NULL Değerler:** `k.ad`, `k.soyad` ve `bt.ad` kolonları NULL olabiliyordu
3. **Silinmiş Kullanıcılar:** JOIN'de silinmiş kullanıcılar filtrelenmiyordu
4. **json_agg Syntax:** `json_agg` içindeki `ORDER BY` kullanımı hatalıydı

## Çözüm

### 1. Frontend - Hata Yakalama İyileştirmesi
`DashboardPage.tsx` dosyasında `Promise.all` içindeki her isteği ayrı ayrı yakalayarak, bir istek başarısız olsa bile diğer verilerin yüklenmesine izin verildi:

```typescript
const [statsRes, productsRes, farmsRes, ...] = await Promise.all([
  ziraatService.getDashboardStats().catch((err) => {
    console.error('Dashboard stats hatası:', err);
    return { success: false, stats: {...} };
  }),
  // ... diğer istekler
]);
```

### 2. Backend - SQL Parametre İndeksleme Düzeltmesi
`server/src/controllers/ziraatController.js` dosyasında `LIMIT` ve `OFFSET` için parametre indeksleri düzeltildi:

```javascript
// ÖNCE (HATALI)
params.push(limit, offset);
LIMIT $${paramIndex} OFFSET $${paramIndex + 1}

// SONRA (DOĞRU)
const limitParamIndex = paramIndex;
const offsetParamIndex = paramIndex + 1;
params.push(limit, offset);
LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
```

### 3. NULL Değerler için COALESCE
`k.ad`, `k.soyad` ve `bt.ad` kolonları için `COALESCE` kullanıldı:

```sql
-- Search sorgusunda
COALESCE(k.ad, '') ILIKE $${paramIndex} OR COALESCE(k.soyad, '') ILIKE $${paramIndex}

-- json_agg içinde
'name', COALESCE(bt.ad, b.ad, 'Belge')
```

### 4. Silinmiş Kullanıcılar Filtresi
JOIN'e `k.silinme IS NULL` filtresi eklendi:

```sql
JOIN kullanicilar k ON cb.kullanici_id = k.id AND k.silinme IS NULL
```

### 5. json_agg ORDER BY Syntax Düzeltmesi
`json_agg` içindeki `ORDER BY` syntax'ı düzeltildi:

```sql
json_agg(
  json_build_object(...) ORDER BY COALESCE(bt.ad, b.ad, '')
) FILTER (WHERE b.id IS NOT NULL)
```

## Sonuç
- ✅ Dashboard sayfası artık hatasız çalışıyor
- ✅ Bir endpoint başarısız olsa bile diğer veriler yükleniyor
- ✅ SQL sorguları daha güvenli ve hatasız

## İlgili Dosyalar
- `src/pages/admin/ziraat/dashboard/DashboardPage.tsx`
- `server/src/controllers/ziraatController.js` (getFarmApplications, getProductApplications)

## Tarih
2024 - Dashboard 500 hatası çözümü

