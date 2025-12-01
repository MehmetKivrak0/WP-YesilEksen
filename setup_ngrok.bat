@echo off
echo ========================================
echo LinkedIn OAuth - ngrok Kurulumu
echo ========================================
echo.
echo ngrok, localhost'unuzu public URL'ye cevirir.
echo.
echo ADIMLAR:
echo.
echo 1. ngrok'u indirin: https://ngrok.com/download
echo 2. ngrok'u PATH'e ekleyin veya bu klasore kopyalayin
echo 3. Frontend'i baslatin: npm run dev
echo 4. Bu script'i calistirin
echo.
echo ========================================
echo.
echo Frontend icin ngrok baslatiliyor (port 5173)...
echo.
ngrok http 5173
pause

