# Temiz SQL Sorgusu - Çiftlik Başvuruları

**Tarih:** 2024-12-XX  
**Açıklama:** Denetim kısmı tamamen kaldırılmış temiz SQL sorgusu

## Ana SQL Sorgusu (getFarmApplications)

```sql
SELECT 
    cb.id,
    cb.ciftlik_adi as name,
    cb.sahip_adi as owner,
    cb.durum as status,
    cb.guncelleme as "lastUpdate",
    cb.id::text as "applicationNumber",
    cb.konum as sector,
    EXTRACT(YEAR FROM cb.basvuru_tarihi)::INTEGER as "establishmentYear",
    '1-5' as "employeeCount",
    k.eposta as email,
    COALESCE(k.telefon, '') as phone,
    cb.basvuru_tarihi as "applicationDate",
    '' as "taxNumber",
    COALESCE(cb.notlar, '') as description,
    COALESCE(
        json_agg(
            json_build_object(
                'name', bt.ad,
                'status', CASE 
                    WHEN b.durum = 'onaylandi' THEN 'Onaylandı'
                    WHEN b.durum = 'reddedildi' THEN 'Reddedildi'
                    WHEN b.durum = 'eksik' THEN 'Eksik'
                    ELSE 'Beklemede'
                END,
                'url', b.dosya_yolu,
                'belgeId', b.id,
                'farmerNote', COALESCE(b.kullanici_notu, ''),
                'adminNote', COALESCE(b.yonetici_notu, '')
            )
            ORDER BY bt.ad
        ) FILTER (WHERE b.id IS NOT NULL),
        '[]'::json
    ) as documents
FROM ciftlik_basvurulari cb
JOIN kullanicilar k ON cb.kullanici_id = k.id
LEFT JOIN belgeler b ON b.basvuru_id = cb.id AND b.basvuru_tipi = 'ciftlik_basvurusu'
LEFT JOIN belge_turleri bt ON b.belge_turu_id = bt.id
WHERE 1=1
    -- Durum filtresi (opsiyonel)
    -- AND cb.durum = $1
    -- Varsayılan durum filtresi: sadece 'ilk_inceleme' ve 'reddedildi' durumları
    AND cb.durum IN ('ilk_inceleme', 'reddedildi')
    -- Arama filtresi (opsiyonel)
    -- AND (cb.ciftlik_adi ILIKE $2 OR cb.sahip_adi ILIKE $2 OR k.ad ILIKE $2 OR k.soyad ILIKE $2 OR cb.id::text ILIKE $2)
GROUP BY cb.id, cb.ciftlik_adi, cb.sahip_adi, cb.durum, cb.guncelleme, cb.konum, cb.basvuru_tarihi, k.eposta, k.telefon, cb.notlar
ORDER BY cb.basvuru_tarihi DESC
LIMIT $3 OFFSET $4
```

## Count Sorgusu

```sql
SELECT COUNT(*) as total
FROM ciftlik_basvurulari cb
JOIN kullanicilar k ON cb.kullanici_id = k.id
WHERE 1=1
    -- Durum filtresi (opsiyonel)
    -- AND cb.durum = $1
    -- Varsayılan durum filtresi: sadece 'ilk_inceleme' ve 'reddedildi' durumları
    AND cb.durum IN ('ilk_inceleme', 'reddedildi')
    -- Arama filtresi (opsiyonel)
    -- AND (cb.ciftlik_adi ILIKE $2 OR cb.sahip_adi ILIKE $2 OR k.ad ILIKE $2 OR k.soyad ILIKE $2 OR cb.id::text ILIKE $2)
```

## Dashboard Stats Sorgusu

```sql
SELECT 
    COUNT(*) FILTER (WHERE durum = 'ilk_inceleme') as newApplications,
    0 as inspections,
    COUNT(*) FILTER (WHERE durum = 'onaylandi') as approved
FROM ciftlik_basvurulari
```

## Kaldırılan Öğeler

- ❌ `denetim_tarihi` alanı SELECT kısmından kaldırıldı
- ❌ `denetim_tarihi` alanı GROUP BY kısmından kaldırıldı
- ❌ `denetimde` durumu WHERE clause'dan kaldırıldı
- ❌ `denetimde` durumu dashboard stats'tan kaldırıldı (0 olarak set edildi)

## Durum Değerleri

Artık sadece şu durumlar kullanılıyor:
- `ilk_inceleme` → Frontend: 'İlk İnceleme'
- `onaylandi` → Frontend: 'Onaylandı'
- `reddedildi` → Frontend: 'Evrak Bekliyor'

## Notlar

- Sadece gerekli alanlar seçiliyor
- Belgeler JSON formatında döndürülüyor
- Denetim ile ilgili hiçbir alan veya durum kullanılmıyor

