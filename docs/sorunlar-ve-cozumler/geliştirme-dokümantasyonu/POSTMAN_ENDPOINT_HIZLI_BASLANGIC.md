# 🚀 POSTMAN'DE ENDPOINT NASIL KULLANILIR - HIZLI BAŞLANGIÇ

## 📌 TEMEL ADIMLAR (3 Dakika)

### 1️⃣ Yeni Request Oluştur

1. **Sol tarafta** Collection'ınıza **sağ tıklayın**
2. **"Add Request"** seçin
3. İsim verin: **"Dashboard Stats"** (veya istediğiniz isim)
4. **Save** butonuna tıklayın

---

### 2️⃣ Method ve URL Ayarla

**Postman'in üst kısmında:**

1. **Method dropdown'dan** → `GET` seçin (veya `POST`, `PUT`, `DELETE`)
2. **URL kutusuna** → `{{base_url}}/api/ziraat/dashboard/stats` yazın

**Görünüm:**
```
┌──────────────────────────────────────────────────┐
│ [GET ▼] [{{base_url}}/api/ziraat/dashboard/stats] [Send] │
└──────────────────────────────────────────────────┘
```

---

### 3️⃣ Headers (İsteğe Bağlı - Şu An Gerekli Değil)

**Headers sekmesine tıklayın:**

**Şu An (Auth Kapalı):**
- Boş bırakabilirsiniz
- Veya sadece: `Content-Type: application/json`

**Auth Açıldığında:**
| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{token}}` |
| `Content-Type` | `application/json` |

---

### 4️⃣ Body (Sadece POST/PUT İçin)

**GET request'lerde Body YOK!**

**POST request'lerde:**
1. **Body sekmesine** tıklayın
2. **`raw`** seçin
3. **Dropdown'dan `JSON`** seçin
4. JSON yazın:
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

---

### 5️⃣ Send Butonuna Tıkla!

**Sağ üstteki mavi "Send" butonuna tıklayın**

**Response alt kısımda görünecek:**
- **Status:** `200 OK` (yeşil) ✅
- **Body:** JSON verisi

---

## 📋 TÜM ENDPOINT'LER LİSTESİ

### ✅ GET Endpoint'leri (Hiçbiri Body gerektirmez)

#### 1. Dashboard Stats
```
GET {{base_url}}/api/ziraat/dashboard/stats
```

#### 2. Product Applications
```
GET {{base_url}}/api/ziraat/products/applications
```
**Params (Opsiyonel):**
- `page`: 1
- `limit`: 10
- `status`: beklemede
- `search`: domates

#### 3. Farm Applications
```
GET {{base_url}}/api/ziraat/farms/applications
```
**Params (Opsiyonel):**
- `page`: 1
- `limit`: 10
- `status`: yeni
- `search`: çiftlik

#### 4. Registered Farmers
```
GET {{base_url}}/api/ziraat/farmers/registered
```
**Params (Opsiyonel):**
- `page`: 1
- `limit`: 10
- `search`: ahmet

#### 5. Dashboard Products
```
GET {{base_url}}/api/ziraat/dashboard/products
```
**Params (Opsiyonel):**
- `search`: domates

#### 6. Activity Log
```
GET {{base_url}}/api/ziraat/activity-log
```
**Params (Opsiyonel):**
- `page`: 1
- `limit`: 10
- `type`: product_approval

---

### ✅ POST Endpoint'leri (Body gerektirir)

#### 7. Approve Product
```
POST {{base_url}}/api/ziraat/products/approve/1
```
**Body (Opsiyonel):**
```json
{
  "note": "Onaylandı"
}
```

#### 8. Reject Product
```
POST {{base_url}}/api/ziraat/products/reject/1
```
**Body (Zorunlu):**
```json
{
  "reason": "Belgeler eksik"
}
```

#### 9. Approve Farm
```
POST {{base_url}}/api/ziraat/farms/approve/1
```
**Body (Opsiyonel):**
```json
{
  "note": "Onaylandı"
}
```

#### 10. Reject Farm
```
POST {{base_url}}/api/ziraat/farms/reject/1
```
**Body (Zorunlu):**
```json
{
  "reason": "Eksiklikler var"
}
```

---

## 🎯 HIZLI TEST SIRASI

1. ✅ **Dashboard Stats** - En basit, hiçbir şey gerektirmez
2. ✅ **Product Applications** - Listeleme
3. ✅ **Farm Applications** - Listeleme
4. ✅ **Registered Farmers** - Listeleme
5. ✅ **Dashboard Products** - Listeleme
6. ✅ **Activity Log** - Listeleme

---

## 💡 İPUÇLARI

### Query Parametreleri Nasıl Eklenir?

**Params sekmesinde:**
1. **Key** kolonuna: `page` yazın
2. **Value** kolonuna: `1` yazın
3. **Checkbox'ı işaretleyin** (aktif olması için)

**URL otomatik güncellenir:**
```
{{base_url}}/api/ziraat/products/applications?page=1
```

### Birden Fazla Parametre

Her parametre için yeni satır ekleyin:
- Key: `page`, Value: `1`
- Key: `limit`, Value: `10`
- Key: `status`, Value: `beklemede`

**URL:**
```
{{base_url}}/api/ziraat/products/applications?page=1&limit=10&status=beklemede
```

### Response'u İncele

**Response'da şunları kontrol edin:**
- ✅ **Status Code:** `200 OK` (yeşil) = Başarılı
- ✅ **Body:** JSON verisi görünmeli
- ❌ **401:** Token gerekli (auth açıksa)
- ❌ **404:** Endpoint bulunamadı
- ❌ **500:** Sunucu hatası

---

## 🚨 YAYGIN HATALAR

### 404 Not Found
**Çözüm:** 
- Server çalışıyor mu kontrol edin
- URL'yi kontrol edin (yazım hatası var mı?)
- Route dosyası var mı kontrol edin

### 401 Unauthorized
**Çözüm:**
- Login yapın ve token alın
- Token'ı environment'a kaydedin
- Headers'da `Authorization: Bearer {{token}}` ekleyin

### 500 Internal Server Error
**Çözüm:**
- Terminal'deki hata mesajlarını kontrol edin
- Controller fonksiyonlarını kontrol edin
- Veritabanı bağlantısını kontrol edin

---

**Başarılar! 🎉**

