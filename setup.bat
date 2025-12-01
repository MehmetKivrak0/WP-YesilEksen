@echo off
REM YEŞİL-EKSEN - KURULUM SCRIPTİ
echo ========================================
echo YEŞİL-EKSEN KURULUM SCRIPTİ
echo ========================================
echo.

REM 1. Frontend .env dosyasını kontrol et ve oluştur
echo [1/5] Frontend .env dosyası kontrol ediliyor...
if not exist .env (
    echo VITE_API_URL=http://localhost:5000/api > .env
    echo ✓ Frontend .env dosyası oluşturuldu
) else (
    findstr /C:"VITE_API_URL" .env >nul
    if errorlevel 1 (
        echo VITE_API_URL=http://localhost:5000/api >> .env
        echo ✓ VITE_API_URL .env dosyasına eklendi
    ) else (
        echo ✓ Frontend .env dosyası mevcut
    )
)

REM 2. Backend bağımlılıklarını kur
echo.
echo [2/5] Backend bağımlılıkları kuruluyor...
cd server
if not exist node_modules (
    call npm install
    echo ✓ Backend bağımlılıkları kuruldu
) else (
    echo ✓ Backend bağımlılıkları zaten kurulu
)
cd ..

REM 3. Frontend bağımlılıklarını kur
echo.
echo [3/5] Frontend bağımlılıkları kuruluyor...
if not exist node_modules (
    call npm install
    echo ✓ Frontend bağımlılıkları kuruldu
) else (
    echo ✓ Frontend bağımlılıkları zaten kurulu
)

REM 4. PostgreSQL servisini kontrol et
echo.
echo [4/5] PostgreSQL servisi kontrol ediliyor...
sc query postgresql-x64-* 2>nul | find /I "RUNNING" >nul
if errorlevel 1 (
    echo ⚠ PostgreSQL servisi çalışmıyor görünüyor!
    echo   Lütfen manuel olarak kontrol edin: Services ^> PostgreSQL
) else (
    echo ✓ PostgreSQL servisi çalışıyor
)

REM 5. Sonuç
echo.
echo ========================================
echo KURULUM TAMAMLANDI!
echo ========================================
echo.
echo ŞİMDİ YAPMANIZ GEREKENLER:
echo.
echo 1. Seed data'yı çalıştırın:
echo    psql -U postgres -d yesileksen -f docs\seed_data.sql
echo.
echo 2. Test kullanıcılarını ekleyin:
echo    psql -U postgres -d yesileksen -f docs\test_kullanicilar.sql
echo.
echo 3. Backend'i başlatın (yeni terminal):
echo    cd server
echo    npm run dev
echo.
echo 4. Frontend'i başlatın (yeni terminal):
echo    npm run dev
echo.
echo 5. Test edin:
echo    http://localhost:5173/giris
echo    Email: ciftci@test.com
echo    Password: 123456
echo.
pause

