-- Sadece ciftlikler tablosunu truncate etme komutu
-- Bağımlı tablolar korunur, sadece ciftlikler tablosu silinir
-- NOT: Bu işlem sonrası bağımlı tablolardaki ciftlik_id referansları geçersiz olacak (orphan kayıtlar)

-- Foreign key constraint'lerini dinamik olarak bulup geçici olarak drop eden script
DO $$
DECLARE
    r RECORD;
    constraint_drop_sql TEXT;
    constraint_recreate_sql TEXT;
    constraint_definitions TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Tüm foreign key constraint'lerini bul ve kaydet
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
            AND ccu.table_name = 'ciftlikler'
            AND tc.table_schema = 'public'
    LOOP
        -- Constraint'i drop et
        constraint_drop_sql := 'ALTER TABLE ' || quote_ident(r.table_name) || 
                              ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE;';
        EXECUTE constraint_drop_sql;
        
        -- Constraint tanımını kaydet (sonra tekrar oluşturmak için)
        constraint_definitions := array_append(
            constraint_definitions,
            r.table_name || '|' || r.constraint_name || '|' || r.column_name || '|' || r.foreign_column_name
        );
        
        RAISE NOTICE 'Dropped constraint: % on table %', r.constraint_name, r.table_name;
    END LOOP;
    
    -- Şimdi ciftlikler tablosunu truncate et
    TRUNCATE TABLE ciftlikler;
    RAISE NOTICE 'Truncated table: ciftlikler';
    
    -- NOT: Foreign key constraint'leri tekrar oluşturmuyoruz
    -- çünkü bağımlı tablolardaki ciftlik_id referansları artık geçersiz
    -- Eğer constraint'leri tekrar oluşturmak isterseniz, aşağıdaki kodu kullanabilirsiniz:
    /*
    FOR i IN 1..array_length(constraint_definitions, 1) LOOP
        DECLARE
            parts TEXT[] := string_to_array(constraint_definitions[i], '|');
            table_name TEXT := parts[1];
            constraint_name TEXT := parts[2];
            column_name TEXT := parts[3];
            foreign_column_name TEXT := parts[4];
        BEGIN
            constraint_recreate_sql := 'ALTER TABLE ' || quote_ident(table_name) ||
                                     ' ADD CONSTRAINT ' || quote_ident(constraint_name) ||
                                     ' FOREIGN KEY (' || quote_ident(column_name) || ')' ||
                                     ' REFERENCES ciftlikler(' || quote_ident(foreign_column_name) || ')';
            -- EXECUTE constraint_recreate_sql;
            RAISE NOTICE 'Would recreate: %', constraint_recreate_sql;
        END;
    END LOOP;
    */
END $$;

