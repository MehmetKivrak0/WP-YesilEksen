# Sorunlar ve Çözümler

Bu klasör, projede karşılaşılan sorunlar ve çözümlerinin dokümantasyonunu içerir.

## 📁 İçindekiler

### 🔐 Giriş ve Kimlik Doğrulama Sorunları

1. **[401 Unauthorized - Giriş Hatası](./401-unauthorized-login-hatasi.md)** ✅
   - **Tarih:** 2024-11-19
   - **Sorun:** PostgreSQL `crypt()` ile hash'lenen şifreler, Node.js `bcrypt` ile uyumsuzluk yaratıyordu
   - **Çözüm:** Hem PostgreSQL `crypt()` hem de Node.js `bcrypt` ile şifre kontrolü yapılıyor

2. **[400 Bad Request - Kayıt Hatası](./400-bad-request-kayit-hatasi.md)** ✅
   - **Tarih:** 2024-11-19
   - **Sorun:** FormData'dan gelen boolean değerler string olarak geliyordu, validasyon hataları
   - **Çözüm:** Boolean kontrolü düzeltildi, detaylı hata mesajları eklendi

3. **[Multer Dosya Yükleme Hatası](./multer-dosya-yukleme-hatasi.md)** ✅
   - **Tarih:** 2024-11-19
   - **Sorun:** Dosya yüklenmeden kayıt yapılamıyordu, Multer middleware hatası
   - **Çözüm:** Multer middleware wrapper eklendi, opsiyonel field'lar için hata vermeden devam ediyor

4. **[Login Hata Çözüm](./LOGIN_HATA_COZUM.md)**
   - Giriş ile ilgili diğer sorunlar ve çözümleri

5. **[Debug Login](./DEBUG_LOGIN.md)**
   - Giriş hatalarını debug etme yöntemleri

6. **[403 Forbidden - Oda Yöneticileri Giriş Hatası](./403-forbidden-oda-yoneticisi-giris.md)** ✅
   - **Tarih:** 2024-12-XX
   - **Sorun:** Ziraat ve sanayi yöneticileri giriş yaparken "Hesabınız admin onayı bekliyor" hatası alıyordu
   - **Çözüm:** Oda yöneticileri için durum kontrolü atlandı, `oda_kullanicilari` tablosu kontrolü eklendi

7. **[404 Not Found - Şifremi Unuttum E-posta Kontrolü Hatası](./404-not-found-check-email-endpoint.md)** ✅
   - **Tarih:** 2024-12-XX
   - **Sorun:** Şifremi unuttum sayfasında e-posta kontrolü yapılırken 404 hatası alınıyordu
   - **Çözüm:** Yeni endpoint eklendi ama server yeniden başlatılmamıştı, server yeniden başlatıldı

8. **[500 Internal Server Error - oda_kullanicilari Normalizasyon Sorunu](./500-internal-server-error-oda-kullanicilari-normalizasyon.md)** ✅
   - **Tarih:** 2024-11-22
   - **Sorun:** Oda yöneticisi kaydı sırasında 500 hatası, `oda_kullanicilari` tablosu normalizasyon ihlali yaratıyordu
   - **Çözüm:** `oda_kullanicilari` tablosu kaldırıldı, sadece `kullanicilar.rol` kullanılıyor, `oda_tipi` rol'den türetiliyor

9. **[Dashboard 500 Internal Server Error - Farm Applications](./dashboard-500-internal-server-error-farm-applications.md)** ✅
   - **Tarih:** 2024-12-XX
   - **Sorun:** Dashboard sayfasında `/api/ziraat/farms/applications` endpoint'inden veri çekerken 500 hatası alınıyordu
   - **Çözüm:** SQL parametre indeksleme hatası düzeltildi, NULL değerler için COALESCE eklendi, silinmiş kullanıcılar filtrelendi, json_agg syntax düzeltildi

10. **[500 Internal Server Error - Çiftlik Panel Stats](./500-internal-server-error-ciftlik-panel-stats.md)** ✅
   - **Tarih:** 2024-12-XX
   - **Sorun:** Çiftçi panel sayfasında istatistikler yüklenirken `/api/ciftlik/panel/stats` endpoint'inde 500 hatası alınıyordu
   - **Çözüm:** SQL sorgusunda `IN ($2, $3)` parametreli kullanım yerine sabit değerler için doğrudan string literal kullanımına geçildi

### 🎨 Kullanıcı Deneyimi İyileştirmeleri

11. **[Belge Yükleme Bildirimi ve Validasyon](./belge-yukleme-bildirimi.md)** ✅
   - **Tarih:** 2024-11-19
   - **Özellik:** Belge yüklendiğinde anında geri bildirim, dosya validasyonu
   - **Fayda:** Hatalar önceden yakalanıyor, kullanıcı deneyimi iyileştirildi

12. **[Ziraat Dashboard API Entegrasyonu](./OZET_NOT_ZIRAAT_DASHBOARD_ENTEGRASYON.md)** ✅
   - **Tarih:** 2024-12-XX
   - **Özellik:** Dashboard sayfasının API'ye tam entegrasyonu, gerçek zamanlı veri yükleme
   - **Fayda:** Statik veriler yerine dinamik API verileri, onaylama/reddetme işlemleri çalışıyor

13. **[Çiftlik Onay Butonu İyileştirme](./ciftlik-onay-butonu-iyilestirme.md)** ✅
   - **Tarih:** 2024-12-XX
   - **Özellik:** Çiftlik onay sayfasındaki onay butonuna loading state, toast bildirimleri ve gelişmiş hata yönetimi eklendi
   - **Fayda:** Kullanıcı deneyimi iyileştirildi, çift tıklama koruması sağlandı, görsel geri bildirimler eklendi

14. **[Çiftlik Belge Onay Butonu İyileştirme](./ciftlik-belge-onay-butonu-iyilestirme.md)** ✅
   - **Tarih:** 2024-12-XX
   - **Özellik:** Çiftlik inceleme modal'ındaki belge onay/red butonlarına loading state, optimistic update, toast bildirimleri ve gelişmiş hata yönetimi eklendi
   - **Fayda:** Belge onaylama süreci daha kullanıcı dostu hale getirildi, anında UI güncellemesi sağlandı, hata durumlarında state geri alma mekanizması eklendi

15. **[Çiftlik Belge Red İşlemi İyileştirme](./ciftlik-belge-red-islemi-iyilestirme.md)** ✅
   - **Tarih:** 2024-12-XX
   - **Özellik:** Belge red işlemi için reason zorunluluğu, otomatik reason formu açılması, scroll/focus mekanizması ve kullanıcı yönlendirmesi eklendi
   - **Fayda:** Belge red işlemi daha güvenilir hale getirildi, reason zorunluluğu ile veri kalitesi artırıldı, kullanıcı yönlendirmesi ile kullanıcı deneyimi iyileştirildi

16. **[Denetim Tabloları Kaldırma](./denetim-tablolari-kaldirma.md)** ✅
   - **Tarih:** 2024-12-XX
   - **Özellik:** Denetim sistemi kullanılmadığı için tüm denetim tabloları, kolonları, index'leri ve trigger'ları kaldırıldı
   - **Fayda:** Veritabanı yapısı sadeleştirildi, gereksiz tablolar kaldırıldı, bakım kolaylığı sağlandı

17. **[Çiftçi Detay Modal - Belge Görüntüleme Sorunu](./ciftci-detay-modal-belge-goruntuleme-sorunu.md)** ✅
   - **Tarih:** 2024-12-XX
   - **Sorun:** Dashboard'daki çiftçi detay modal'ında belgeler görüntülenemiyordu, URL'lerde çift `/api/api/` hatası vardı, belge isimlerinde encoding sorunları vardı
   - **Çözüm:** Belge sorgusu düzeltildi (hem ciftlik_id hem basvuru_id), URL oluşturma mantığı düzeltildi, belge isimleri decode edildi, modal tasarımı iyileştirildi ve pop-up belge görüntüleme eklendi
   - **Fayda:** Belgeler artık düzgün görüntüleniyor, 404 hatası çözüldü, Türkçe karakterler düzgün görünüyor, kullanıcı deneyimi iyileştirildi

18. **[Çiftçi Panel JSX Syntax Hatası](./ciftci-panel-jsx-syntax-hatasi.md)** ✅
   - **Tarih:** 2024-12-XX
   - **Sorun:** Çiftçi panel sayfası veritabanına bağlanırken JSX syntax hatası oluştu, `Expected '</', got '}'` hatası alındı
   - **Çözüm:** Conditional rendering ve map fonksiyonlarındaki parantez dengesi düzeltildi, tüm JSX elementleri doğru girintilendi, tag kapanışları düzeltildi
   - **Fayda:** Syntax hatası tamamen çözüldü, Vite development server hatasız çalışıyor, kod okunabilirliği artırıldı

### 🗄️ Veritabanı Sorunları

19. **[Veritabanı Güncelleme](./VERITABANI_GUNCELLEME.md)**
   - Veritabanı güncellemeleri ve migration'lar

## 📝 Yeni Sorun Ekleme

Yeni bir sorun ve çözüm dokümantasyonu eklerken:

1. Dosya adını şu formatta kullanın: `[sorun-numarasi]-[kisa-aciklama].md`
2. Dosyanın başına şu bilgileri ekleyin:
   - Tarih
   - Durum (✅ Çözüldü / 🔄 Devam Ediyor / ❌ Çözülemedi)
   - Sorun açıklaması
   - Çözüm detayları
3. Bu README.md dosyasını güncelleyin

## 🔍 Hızlı Erişim

- **Giriş Sorunları:** 
  - [401 Unauthorized](./401-unauthorized-login-hatasi.md)
  - [403 Forbidden - Oda Yöneticileri](./403-forbidden-oda-yoneticisi-giris.md)
  - [404 Not Found - Şifremi Unuttum](./404-not-found-check-email-endpoint.md)
- **Veritabanı Sorunları:** 
  - [500 Internal Server Error - oda_kullanicilari Normalizasyon](./500-internal-server-error-oda-kullanicilari-normalizasyon.md)
  - [Dashboard 500 Internal Server Error - Farm Applications](./dashboard-500-internal-server-error-farm-applications.md)
  - [500 Internal Server Error - Çiftlik Panel Stats](./500-internal-server-error-ciftlik-panel-stats.md)
  - [Veritabanı Güncelleme](./VERITABANI_GUNCELLEME.md)
- **Frontend Sorunları:**
  - [Çiftçi Panel JSX Syntax Hatası](./ciftci-panel-jsx-syntax-hatasi.md)
- **Debug Yöntemleri:** [Debug Login](./DEBUG_LOGIN.md)

## 📊 Sorun İstatistikleri

- **Toplam Sorun:** 18
- **Çözülen:** 18
- **Özellik Eklendi:** 5
- **Veritabanı Temizleme:** 1
- **Frontend Syntax Hatası:** 1
- **Devam Eden:** 0
- **Çözülemeyen:** 0

---

**Son Güncelleme:** 2024-12-XX

