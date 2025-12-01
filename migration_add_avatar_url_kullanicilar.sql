-- Kullanicilar tablosuna avatar_url kolonu ekle (eğer yoksa)
-- Bu migration profil fotoğrafları için kullanılacak

-- Önce kolonun var olup olmadığını kontrol et
DO $$
BEGIN
    -- avatar_url kolonu yoksa ekle
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'kullanicilar' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.kullanicilar 
        ADD COLUMN avatar_url TEXT;
        
        RAISE NOTICE 'avatar_url kolonu eklendi';
    ELSE
        RAISE NOTICE 'avatar_url kolonu zaten mevcut';
    END IF;
END $$;

-- Firmalar tablosuna profil_foto_url kolonu ekle (opsiyonel - şimdilik kullanicilar.avatar_url kullanıyoruz)
-- Gelecekte firmalar tablosuna da eklenebilir
-- DO $$
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 
--         FROM information_schema.columns 
--         WHERE table_schema = 'public' 
--         AND table_name = 'firmalar' 
--         AND column_name = 'profil_foto_url'
--     ) THEN
--         ALTER TABLE public.firmalar 
--         ADD COLUMN profil_foto_url TEXT;
--         
--         RAISE NOTICE 'firmalar.profil_foto_url kolonu eklendi';
--     ELSE
--         RAISE NOTICE 'firmalar.profil_foto_url kolonu zaten mevcut';
--     END IF;
-- END $$;

