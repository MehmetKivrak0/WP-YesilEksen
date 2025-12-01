-- Migration: ciftlik_basvurulari tablosuna telefon alanı ekleme
-- Normalizasyon: Başvuruya özel telefon için esnek yapı
-- Öncelik: cb.telefon (başvuru telefonu) > k.telefon (kullanıcı telefonu)

-- ciftlik_basvurulari tablosuna telefon alanı ekle
ALTER TABLE ciftlik_basvurulari 
ADD COLUMN IF NOT EXISTS telefon VARCHAR(20);

-- Mevcut kayıtlar için telefon bilgisi güncelleme (opsiyonel)
-- Kullanıcı telefonunu başvuru telefonuna kopyala (sadece başvuru telefonu boşsa)
UPDATE ciftlik_basvurulari cb
SET telefon = k.telefon
FROM kullanicilar k
WHERE cb.kullanici_id = k.id 
  AND (cb.telefon IS NULL OR cb.telefon = '')
  AND k.telefon IS NOT NULL
  AND k.telefon != '';

-- Yorum: Telefon alanı opsiyonel
-- Başvuruya özel telefon varsa onu kullanır, yoksa kullanıcının telefonunu kullanır
COMMENT ON COLUMN ciftlik_basvurulari.telefon IS 'Başvuruya özel telefon numarası (opsiyonel). Sorgularda COALESCE(cb.telefon, k.telefon) kullanılmalıdır.';




