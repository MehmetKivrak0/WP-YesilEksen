-- durum_tipi ENUM'una 'incelemede' değerini ekle
-- NOT: Bu işlem transaction içinde yapılamaz ve veritabanında aktif bağlantılar varsa sorun çıkarabilir
-- Bu yüzden önce tüm bağlantıları kapatın veya maintenance mode'a geçin

-- Mevcut ENUM değerlerini kontrol et
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'durum_tipi'::regtype 
ORDER BY enumsortorder;

-- 'incelemede' değeri zaten varsa hata vermez (IF NOT EXISTS yok, ama tekrar çalıştırırsanız hata verir)
-- Eğer hata alırsanız, değer zaten eklenmiş demektir
ALTER TYPE durum_tipi ADD VALUE 'incelemede';

-- Kontrol et
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'durum_tipi'::regtype 
ORDER BY enumsortorder;

