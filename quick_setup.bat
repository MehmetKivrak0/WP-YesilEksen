@echo off
echo ========================================
echo YESILEKSEN VERITABANI KURULUMU
echo ========================================
echo.

echo 1/3 - Extensions yukleniyor...
psql -U postgres -d yesileksen -f database_setup_step1_extensions.sql
if errorlevel 1 goto error

echo.
echo 2/3 - Enum tipleri olusturuluyor...
psql -U postgres -d yesileksen -f database_setup_step2_enums.sql
if errorlevel 1 goto error

echo.
echo 3/3 - Tablolar olusturuluyor...
psql -U postgres -d yesileksen -f database_setup_step3_tables.sql
if errorlevel 1 goto error

echo.
echo 4/4 - Tum sema yukleniyor (tam versiyon)...
psql -U postgres -d yesileksen -f database_schema.sql
if errorlevel 1 goto error

echo.
echo ========================================
echo KURULUM TAMAMLANDI!
echo ========================================
echo.
echo Simdi tablolari kontrol edin:
echo psql -U postgres -d yesileksen -c "\dt"
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo HATA OLUSTU!
echo ========================================
echo.
echo Lutfen hata mesajini kontrol edin.
echo.
pause
exit /b 1














