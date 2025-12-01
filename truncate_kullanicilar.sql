-- Sadece kullanicilar tablosunu truncate etme komutu
-- Bağımlı tablolar korunur, sadece kullanicilar tablosu silinir
-- NOT: Bu işlem sonrası bağımlı tablolardaki kullanici_id referansları geçersiz olacak (orphan kayıtlar)

-- Foreign key constraint'lerini dinamik olarak bulup geçici olarak drop eden script
DO $$
DECLARE
    r RECORD;
    constraint_drop_sql TEXT;
BEGIN
    -- Tüm foreign key constraint'lerini bul ve drop et
    FOR r IN 
        SELECT 
            tc.table_name,
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND ccu.table_name = 'kullanicilar'
            AND tc.table_schema = 'public'
    LOOP
        -- Constraint'i drop et
        constraint_drop_sql := 'ALTER TABLE ' || quote_ident(r.table_name) || 
                              ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE;';
        EXECUTE constraint_drop_sql;
        
        RAISE NOTICE 'Dropped constraint: % on table %', r.constraint_name, r.table_name;
    END LOOP;
    
    -- Şimdi kullanicilar tablosunu truncate et
    TRUNCATE TABLE kullanicilar;
    RAISE NOTICE 'Truncated table: kullanicilar';
    
    -- NOT: Foreign key constraint'leri tekrar oluşturmuyoruz
    -- çünkü bağımlı tablolardaki kullanici_id referansları artık geçersiz
END $$;




