-- durum_tipi ENUM'una 'eksik' değerini ekle
-- NOT: Bu işlem transaction içinde yapılamaz ve veritabanında aktif bağlantılar varsa sorun çıkarabilir
-- Bu yüzden önce tüm bağlantıları kapatın veya maintenance mode'a geçin

-- Mevcut ENUM değerlerini kontrol et
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'durum_tipi'::regtype 
ORDER BY enumsortorder;

-- 'eksik' değeri zaten varsa hata verir, ama tekrar çalıştırırsanız hata verir
-- Eğer hata alırsanız, değer zaten eklenmiş demektir
ALTER TYPE durum_tipi ADD VALUE 'eksik';

-- Kontrol et
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'durum_tipi'::regtype 
ORDER BY enumsortorder;

