# 500 Internal Server Error - Çiftlik Panel Stats Hatası

## Sorun

Çiftçi panel sayfasında istatistikler yüklenirken 500 Internal Server Error hatası alınıyordu.

**Hata Detayları:**
- **Endpoint:** `GET /api/ciftlik/panel/stats?timeRange=ay`
- **Hata:** 500 Internal Server Error
- **Dosya:** `server/src/controllers/ciftlikController.js`
- **Fonksiyon:** `getPanelStats`

## Hata Kaynağı

SQL sorgusunda `IN ($2, $3)` şeklinde parametreli kullanım PostgreSQL'de sorun çıkarıyordu.

**Hatalı Kod:**
```javascript
const aktifUrunResult = await pool.query(
    'SELECT COUNT(*) as aktif FROM urunler WHERE ciftlik_id = $1 AND durum IN ($2, $3)',
    [ciftlik_id, 'aktif', 'stokta']
);
```

## Çözüm

Sabit değerler için doğrudan string literal kullanımına geçildi.

**Düzeltilmiş Kod:**
```javascript
const aktifUrunResult = await pool.query(
    `SELECT COUNT(*) as aktif FROM urunler WHERE ciftlik_id = $1 AND durum IN ('aktif', 'stokta')`,
    [ciftlik_id]
);
```

**Değişiklikler:**
- `IN ($2, $3)` → `IN ('aktif', 'stokta')` (doğrudan SQL içinde)
- Parametre dizisinden `'aktif'` ve `'stokta'` değerleri kaldırıldı
- Sadece `ciftlik_id` parametre olarak kaldı

## Sonuç

✅ SQL sorgusu hatasız çalışıyor  
✅ Panel istatistikleri başarıyla yükleniyor  
✅ PostgreSQL parametreli IN kullanımı sorunu çözüldü

## Not

PostgreSQL'de sabit değerler için parametreli sorgu kullanmak yerine doğrudan string literal kullanmak daha güvenli ve performanslıdır.

