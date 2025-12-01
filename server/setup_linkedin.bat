@echo off
echo ========================================
echo LinkedIn OAuth Veritabani Kurulumu
echo ========================================
echo.
echo PostgreSQL'e baglanip migration dosyasini calistiracaksiniz.
echo.
echo Adimlar:
echo 1. pgAdmin'i acin veya psql komut satirini kullanin
echo 2. "yesileksen" veritabanina baglanin
echo 3. Asagidaki SQL komutunu calistirin:
echo.
echo ----------------------------------------
echo CREATE TABLE IF NOT EXISTS oauth_states (
echo     state VARCHAR(255) PRIMARY KEY,
echo     provider VARCHAR(50) NOT NULL,
echo     expires_at TIMESTAMP NOT NULL,
echo     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo );
echo.
echo CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);
echo ----------------------------------------
echo.
echo VEYA migration dosyasini calistirin:
echo psql -U postgres -d yesileksen -f ..\docs\migration_oauth_states.sql
echo.
pause

