# 📮 POSTMAN TEST REHBERİ - ZİRAAT DASHBOARD API

**Tarih:** 19 Kasım 2024  
**Hedef:** Tüm Ziraat Dashboard endpoint'lerini Postman ile test etme

---

## 🔐 1. ÖN HAZIRLIK

### 1.1 Postman Kurulumu
1. [Postman'i indirin](https://www.postman.com/downloads/)
2. Postman'i açın ve yeni bir Collection oluşturun: **"Ziraat Dashboard API"**

### 1.2 Environment Variables Oluşturma

**Postman'de Environment Nasıl Oluşturulur?**

1. **Sağ üstteki "gear (⚙️)" ikonu**na tıklayın
2. **"Add"** butonuna tıklayın
3. Environment adını verin: **"Ziraat Dashboard"**
4. Şu değişkenleri ekleyin:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:5000` |
| `token` | (boş bırakın, login sonrası otomatik doldurulacak) |

5. **"Save"** butonuna tıklayın
6. **Sağ üstteki dropdown'dan** yeni oluşturduğunuz environment'ı seçin

**⚠️ ÖNEMLİ:** 
- Environment'ı seçili hale getirmeyi unutmayın! (sağ üst dropdown)
- `token` değişkenini boş bırakın, login yaptıktan sonra otomatik olarak doldurulacak
- Environment seçiliyse, `{{base_url}}` ve `{{token}}` değişkenleri çalışır

---

### 1.3 Postman Arayüzü - Hangi Kısım Ne İşe Yarar?

**Postman'de Request oluştururken şu kısımları kullanacaksınız:**

| Postman Kısmı | Nerede? | Ne İşe Yarar? | Kullanım |
|---------------|---------|---------------|----------|
| **Method Dropdown** | Sol üst (GET, POST, vb.) | HTTP method seçimi | GET veya POST seçin |
| **URL Kutusu** | Method'un yanı | API endpoint URL'i | `{{base_url}}/api/...` yazın |
| **Params** | URL'in altında sekme | Query parametreleri | `?page=1&limit=10` gibi |
| **Authorization** | Sekme | Token/Auth bilgileri | Genelde kullanmayız, Headers'da yapıyoruz |
| **Headers** | Sekme | HTTP header'ları | `Authorization`, `Content-Type` |
| **Body** | Sekme | Request body | POST için JSON verisi |
| **Pre-request Script** | Sekme (eski) veya Scripts > Pre-request (yeni) | Request öncesi script | Opsiyonel |
| **Scripts** | Sekme (yeni versiyon) | Pre-request ve Post-response script'leri | Scripts sekmesi içinde iki seçenek var |
| **Post-response (Tests)** | Scripts > Post-response (yeni) veya Tests (eski) | Response test script'leri | Token kaydetme için - Login'de ZORUNLU |
| **Send** | Sağ üst mavi buton | Request gönder | Tıkla! |
| **Response Body** | Alt kısım | API cevabı | Sonucu burada görün |
| **Response Status** | Alt kısım | HTTP status code | `200 OK` gibi |
| **Test Results** | Alt kısım | Test sonuçları | Yeşil tik = başarılı |

---

## 🔑 2. AUTHENTICATION (GİRİŞ)

### 2.1 Postman'de Request Nasıl Oluşturulur?

Postman'de yeni bir request oluşturmak için:

1. **Sol tarafta Collection'ınıza sağ tıklayın** → **Add Request**
2. Request adını verin: **"Login"**
3. Request penceresinde şu kısımları doldurun:

---

### 2.2 Login Request - Adım Adım Kullanım

#### 📍 **ADIM 1: Method ve URL Seçimi**
**Postman'de üst kısımda:**
- **Method dropdown'dan** → `POST` seçin
- **URL kutusuna** → `{{base_url}}/api/auth/login` yazın
  - `{{base_url}}` otomatik olarak environment'tan `http://localhost:5000` değerini alacak

**Görünüm:**
```
[POST ▼] [{{base_url}}/api/auth/login] [Send]
```

---

#### 📋 **ADIM 2: Headers Sekmesi**
**Postman'de Headers sekmesine tıklayın:**

1. **Key** kolonuna: `Content-Type` yazın
2. **Value** kolonuna: `application/json` yazın
3. İsteğe bağlı: Otomatik olarak eklenmişse kontrol edin

**Görünüm:**
| Key | Value |
|-----|-------|
| Content-Type | application/json |

---

#### 📦 **ADIM 3: Body Sekmesi**
**Postman'de Body sekmesine tıklayın:**

1. **Radio butonlardan** → `raw` seçin
2. **Dropdown'dan** → `JSON` seçin
3. **Büyük metin kutusuna** şunu yapıştırın:

```json
{
  "email": "ziraat_yoneticisi@example.com",
  "password": "sifre123"
}
```
//Çıktısı
{
    "success": true,
    "message": "Giriş başarılı",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImY0NGE1NTI1LTUxYjUtNDY0Zi05NjE0LTQ1MzEzY2M1YWQ4NSIsImVtYWlsIjoiemlyYWF0QHllc2lsZWtzZW4uY29tIiwicm9sIjoiemlyYWF0X3lvbmV0aWNpc2kiLCJpYXQiOjE3NjM3MzMyNzMsImV4cCI6MTc2NDMzODA3M30.6615t-Iry_BF4XgrsWOfjQr0v-cLGWhXWm2WglqK87w",
    "user": {
        "id": "f44a5525-51b5-464f-9614-45313cc5ad85",
        "ad": "Ziraat",
        "soyad": "Yöneticisi",
        "eposta": "ziraat@yesileksen.com",
        "telefon": null,
        "rol": "ziraat_yoneticisi",
        "durum": "aktif"
    }
}

**⚠️ DİKKAT:** 
- `email` ve `password` değerlerini kendi kullanıcı bilgilerinizle değiştirin
- Kullanıcının rolü `ziraat_yoneticisi` olmalı

---

#### 🧪 **ADIM 4: Tests Sekmesi (Çok Önemli!)**

**📍 Tests Sekmesi Nerede?**

Postman'in yeni versiyonunda iki farklı görünüm olabilir:

**🔹 Eski Versiyon:**
URL'in altında şu sekmeler görünür:
```
[Params] [Authorization] [Headers] [Body] [Pre-request Script] [Tests] [Settings]
```
**"Tests"** sekmesi ayrı bir sekmedir.

**🔹 Yeni Versiyon (Sizin Kullandığınız):**
URL'in altında şu sekmeler görünür:
```
[Params] [Authorization] [Headers] [Body] [Scripts] [Settings]
```

**Tests sekmesi artık "Scripts" sekmesinin içinde!**

**Nasıl Bulunur (Yeni Versiyon):**
1. Request penceresinde URL'in **hemen altına** bakın
2. **"Scripts"** sekmesini bulun (Body'nin yanında)
3. **"Scripts"** sekmesine **tıklayın**
4. Sol tarafta iki seçenek göreceksiniz:
   - **Pre-request** (üstte - request öncesi script)
   - **Post-response** (altta - response sonrası script) ⬅️ **BURASI TESTS!**
5. **"Post-response"** seçeneğine **tıklayın**
6. Açılan kod editörüne Tests script'ini yazın

**Görsel Konum (Yeni Postman Versiyonu):**
```
┌─────────────────────────────────────────────────────────────┐
│ [POST ▼] [{{base_url}}/api/auth/login]        [Send]        │ ← URL ve Send butonu
├─────────────────────────────────────────────────────────────┤
│ [Params] [Auth] [Headers] [Body] [Scripts] [Settings]       │ ← Scripts sekmesi burada!
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────────────────────────────────────┐  │
│ │Pre-request│ │ Use JavaScript to configure this request │  │
│ │          │ │ dynamically. Ctrl+Alt+P to Ask           │  │
│ │          │ │                                          │  │
│ │Post-     │ │                                          │  │
│ │response ⬅│ │                                          │  │ ← Post-response seçeneği (TESTS!)
│ └──────────┘ └──────────────────────────────────────────┘  │
│   ↑ Sol      ↑ Sağ - Kod editörü (buraya Tests script'i)   │
└─────────────────────────────────────────────────────────────┘
```

**Adım Adım (Yeni Versiyon):**
1. Request penceresini açın (Login request'i)
2. URL'in **hemen altındaki sekmelere** bakın
3. **"Scripts"** sekmesini bulun (Body'nin yanında)
4. **"Scripts"** sekmesine **tıklayın**
5. **Sol tarafta** iki seçenek göreceksiniz:
   - **Pre-request** (üstte) - Request öncesi kodlar
   - **Post-response** (altta) ⬅️ **BURASI TESTS!**
6. **"Post-response"** seçeneğine **tıklayın**
7. **Sağdaki kod editörüne** (beyaz alan) Tests script'ini yapıştırın

**⚠️ ÖNEMLİ:**
- **Pre-request** = Request gönderilmeden ÖNCE çalışan kodlar
- **Post-response** = Response alındıktan SONRA çalışan kodlar (Tests burada!)
- Login için **Post-response** kullanıyoruz çünkü token'ı response'dan alıyoruz

---

**Tests Script'i Nasıl Eklenir?**

**Bu kısmı MUTLAKA ekleyin çünkü token otomatik kaydedilecek:**

**Yeni Postman Versiyonu için:**
1. **"Scripts"** sekmesine tıklayın
2. **Sol tarafta** **"Post-response"** seçeneğine tıklayın
3. **Sağdaki kod editörüne** (beyaz alan) şu kodu yapıştırın:

**Eski Postman Versiyonu için:**
1. **"Tests"** sekmesine tıklayın
2. **Kod editörüne** (beyaz alan) şu kodu yapıştırın:

```javascript
// Token'ı environment'a kaydet
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.token) {
        pm.environment.set("token", response.token);
        console.log("✅ Token kaydedildi:", response.token);
    }
}

// Test kontrolü
pm.test("Login başarılı", function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.json()).to.have.property('token');
});
```

**Bu kod ne işe yarar?**
- Login başarılı olursa (200 status code)
- Response'dan `token` değerini alır
- Otomatik olarak environment'taki `token` değişkenine kaydeder
- Artık diğer request'lerde `{{token}}` kullanabilirsiniz

---

#### ▶️ **ADIM 5: Send Butonu**
**Sağ üstteki mavi "Send" butonuna tıklayın**

**Beklenen Sonuç:**
- **Status:** `200 OK` (yeşil)
- **Response Body'de** token görünmeli
- **Test Results** sekmesinde yeşil tik işaretleri görünmeli

**Response örneği:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "ad": "Admin",
    "soyad": "User",
    "eposta": "ziraat_yoneticisi@example.com",
    "rol": "ziraat_yoneticisi"
  }
}
```

**✅ Kontrol:**
- Sağ üstteki **"eye" (👁️) ikonu**na tıklayın → **"Environment Quick Look"**
- `token` değişkeninin doldurulduğunu görün

---

### 2.3 Login Request Özet

**Postman'de şu kısımları kullanın:**

| Postman Kısmı | Ne Yapılacak |
|---------------|--------------|
| **Method (üst)** | `POST` seçin |
| **URL (üst)** | `{{base_url}}/api/auth/login` yazın |
| **Headers** | `Content-Type: application/json` ekleyin |
| **Body** | `raw` → `JSON` seçin, email/password yazın |
| **Tests** | Token kaydetme script'ini ekleyin |
| **Send** | Butona tıklayın ve sonucu kontrol edin |

**Beklenen Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "ad": "Admin",
    "soyad": "User",
    "eposta": "ziraat_yoneticisi@example.com",
    "rol": "ziraat_yoneticisi"
  }
}
```

**⚠️ ÖNEMLİ:** 
- Login başarılı olduktan sonra `token` değişkeni otomatik olarak environment'a kaydedilecek
- Tüm diğer request'lerde bu token kullanılacak
- Kullanıcının rolü `ziraat_yoneticisi` olmalı!

---

## 📊 3. GET ENDPOINT'LERİ

### 📖 GET Request'lerde Postman Kullanımı

**GET request'ler için Postman'de şu kısımları kullanın:**

---

### 3.1 Dashboard Stats

#### 📍 **Postman'de Adım Adım Nasıl Yapılır?**

**🔹 ADIM 1: Yeni Request Oluştur (İlk Defa İse)**
1. **Sol tarafta Collection'ınıza sağ tıklayın**
2. **"Add Request"** seçin
3. Request adını verin: **"Dashboard Stats"**
4. **Save** butonuna tıklayın

**🔹 ADIM 2: Method ve URL Ayarla**
**Postman'de üst kısımda:**
1. **Method dropdown'dan** → `GET` seçin
2. **URL kutusuna** → `{{base_url}}/api/ziraat/dashboard/stats` yazın
   - `{{base_url}}` otomatik olarak environment'tan gelecek
   - Tam URL: `http://localhost:5000/api/ziraat/dashboard/stats`

**Görünüm:**
```
[GET ▼] [{{base_url}}/api/ziraat/dashboard/stats] [Send]
```

**🔹 ADIM 3: Headers Sekmesi (ŞİMDİLİK GEREK YOK)**
**⚠️ NOT: Auth'u kapattığımız için şu anda headers'a gerek yok!**

**Eğer auth açıksa:**
- **Headers sekmesine tıklayın**
- Şu header'ları ekleyin:

| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{token}}` |
| `Content-Type` | `application/json` |

**ŞİMDİLİK (Auth kapalı):**
- Headers sekmesini boş bırakabilirsiniz
- Veya sadece `Content-Type: application/json` ekleyin

**🔹 ADIM 4: Body Sekmesi**
- **GET request'lerde Body kullanılmaz!** 
- Body sekmesini boş bırakın veya görmezden gelin

**🔹 ADIM 5: Params Sekmesi**
- Bu endpoint'te query parametresi yok
- Params sekmesini boş bırakın

**🔹 ADIM 6: Send Butonuna Tıkla**
1. **Sağ üstteki mavi "Send" butonuna tıklayın**
2. **Alt kısımda Response görünecek**

**🔹 ADIM 7: Response'u İncele**
- **Status:** `200 OK` görmelisiniz (yeşil)
- **Body sekmesinde** JSON response görünecek:
```json
{
  "success": true,
  "stats": {
    "productSummary": {
      "pending": 5,
      "approved": 12,
      "revision": 3
    },
    ...
  }
}
```

**Endpoint:** `GET {{base_url}}/api/ziraat/dashboard/stats`

**Şu Anki Durum (Auth Kapalı):**
- **Headers:** Boş bırakabilirsiniz veya sadece `Content-Type: application/json`
- **Body:** Yok
- **Params:** Yok

**Auth Açıldığında:**
- **Headers:** 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`

**Beklenen Response:**
```json
{
  "success": true,
  "stats": {
    "productSummary": {
      "pending": 5,
      "approved": 12,
      "revision": 3
    },
    "farmSummary": {
      "newApplications": 8,
      "inspections": 4,
      "approved": 15
    },
    "totalFarmers": 120,
    "totalProducts": 45
  }
}
```

---

### 3.2 Product Applications

#### 📍 **Postman'de Nasıl Yapılır?**

**ADIM 1: Method ve URL**
- **Method:** `GET` seçin
- **URL:** `{{base_url}}/api/ziraat/products/applications` yazın

**ADIM 2: Headers Sekmesi**
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`

**ADIM 3: Params Sekmesi (Query Parameters)**
**Postman'de Params sekmesine tıklayın:**

Bu sekme URL'e query parametreleri eklemek için kullanılır. Şu parametreleri ekleyebilirsiniz:

| Key | Value | Açıklama |
|-----|-------|----------|
| `page` | `1` | Sayfa numarası |
| `limit` | `10` | Sayfa başına kayıt |
| `status` | `beklemede` | Durum filtresi (beklemede, onaylandi, revizyon) |
| `search` | `domates` | Arama terimi |

**Postman otomatik olarak URL'i şuna dönüştürür:**
```
{{base_url}}/api/ziraat/products/applications?page=1&limit=10&status=beklemede&search=domates
```

**⚠️ İPUCU:** 
- Parametreleri manuel URL'e yazmak yerine **Params** sekmesinden eklemek daha kolaydır
- İstediğiniz parametreyi işaretleyin (checkbox), istemediğinizi kaldırın

**Endpoint:** `GET {{base_url}}/api/ziraat/products/applications`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Query Parameters (Opsiyonel):**
- `page`: Sayfa numarası (örn: 1)
- `limit`: Sayfa başına kayıt (örn: 10)
- `status`: Durum filtresi (örn: "beklemede", "onaylandi", "revizyon")
- `search`: Arama terimi

**Örnek URL:**
```
GET {{base_url}}/api/ziraat/products/applications?page=1&limit=10&status=beklemede
```

**Beklenen Response:**
```json
{
  "success": true,
  "applications": [
    {
      "id": "1",
      "name": "Organik Domates",
      "applicant": "Çiftlik A",
      "status": "beklemede",
      "lastUpdate": "2024-11-19T10:30:00Z",
      "applicationNumber": "UR-2024-001",
      "sector": "Sebze",
      "establishmentYear": 2020,
      "employeeCount": "5-10",
      "email": "ciftlik@example.com",
      "applicationDate": "2024-11-15T08:00:00Z",
      "taxNumber": "1234567890",
      "description": "Organik domates üretimi",
      "documents": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 3.3 Farm Applications

#### 📍 **Postman'de Nasıl Yapılır?**

**ADIM 1: Method ve URL**
- **Method:** `GET` seçin
- **URL:** `{{base_url}}/api/ziraat/farms/applications` yazın
  - ⚠️ **DİKKAT:** URL'de sadece endpoint olsun! Query parametreleri Params sekmesinden eklenir.

**ADIM 2: Headers Sekmesi**
- `Authorization: Bearer {{token}}` (Auth kapalıyken gerekli değil)
- `Content-Type: application/json`

**ADIM 3: Params Sekmesi (ÇOK ÖNEMLİ!)**
**Postman'de Params sekmesine tıklayın:**

**⚠️ YANLIŞ KULLANIM (YAPMAYIN!):**
| Key | Value (YANLIŞ!) | ❌ |
|-----|-----------------|-----|
| `page` | `Sayfa numarası` | Açıklama metni girmeyin! |
| `limit` | `Sayfa başına kayıt` | Açıklama metni girmeyin! |
| `status` | `Durum filtresi (örn: "yeni")` | Açıklama metni girmeyin! |

**✅ DOĞRU KULLANIM:**
| Key | Value (DOĞRU!) | ✅ |
|-----|----------------|-----|
| `page` | `1` | Gerçek sayı girin! |
| `limit` | `10` | Gerçek sayı girin! |
| `status` | `yeni` | Gerçek durum değeri girin! |
| `search` | `çiftlik` | Arama terimi girin (opsiyonel) |

**⚠️ ÖNEMLİ KURALLAR:**
1. **Key** kolonuna: Parametre adını yazın (`page`, `limit`, `status`, `search`)
2. **Value** kolonuna: **GERÇEK DEĞER** yazın:
   - `page`: `1`, `2`, `3` (sayı)
   - `limit`: `10`, `20`, `50` (sayı)
   - `status`: `yeni`, `denetimde`, `onaylandi` (durum değeri)
   - `search`: `çiftlik`, `ahmet` (arama terimi)
3. **Checkbox'ı işaretleyin** (aktif olması için)
4. **Description** kolonuna açıklama yazabilirsiniz (opsiyonel, sadece not için)

**Postman otomatik olarak URL'i şuna dönüştürür:**
```
{{base_url}}/api/ziraat/farms/applications?page=1&limit=10&status=yeni
```

**Endpoint:** `GET {{base_url}}/api/ziraat/farms/applications`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Query Parameters (Opsiyonel):**
- `page`: Sayfa numarası (örn: 1, 2, 3)
- `limit`: Sayfa başına kayıt (örn: 10, 20, 50)
- `status`: Durum filtresi (örn: "yeni", "denetimde", "onaylandi")
- `search`: Arama terimi

**Örnek URL:**
```
GET {{base_url}}/api/ziraat/farms/applications?page=1&limit=10&status=yeni
```

**Beklenen Response:**
```json
{
  "success": true,
  "applications": [
    {
      "id": "1",
      "name": "Yeşil Çiftlik",
      "owner": "Ahmet Yılmaz",
      "status": "yeni",
      "inspectionDate": "2024-11-20T14:00:00Z",
      "applicationNumber": "CF-2024-001",
      "sector": "Organik Tarım",
      "establishmentYear": 2018,
      "employeeCount": "10-20",
      "email": "ahmet@example.com",
      "applicationDate": "2024-11-10T09:00:00Z",
      "taxNumber": "9876543210",
      "description": "Organik tarım çiftliği",
      "documents": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 30,
    "totalPages": 3
  }
}
```

---

### 3.4 Registered Farmers
**Endpoint:** `GET {{base_url}}/api/ziraat/farmers/registered`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Query Parameters (Opsiyonel):**
- `page`: Sayfa numarası
- `limit`: Sayfa başına kayıt
- `search`: Arama terimi

**Beklenen Response:**
```json
{
  "success": true,
  "farmers": [
    {
      "id": "1",
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "farmName": "Yeşil Çiftlik",
      "phone": "+90 555 123 4567",
      "status": "aktif",
      "registrationDate": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 120,
    "totalPages": 12
  }
}
```

---

### 3.5 Dashboard Products
**Endpoint:** `GET {{base_url}}/api/ziraat/dashboard/products`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Query Parameters (Opsiyonel):**
- `search`: Arama terimi

**Beklenen Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "1",
      "name": "Organik Domates",
      "category": "Sebze",
      "farmer": "Ahmet Yılmaz",
      "status": "aktif",
      "price": 25.50,
      "stock": 100
    }
  ]
}
```

---

### 3.6 Activity Log
**Endpoint:** `GET {{base_url}}/api/ziraat/activity-log`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Query Parameters (Opsiyonel):**
- `page`: Sayfa numarası
- `limit`: Sayfa başına kayıt
- `type`: Aktivite tipi (örn: "product_approval", "farm_approval")

**Beklenen Response:**
```json
{
  "success": true,
  "activities": [
    {
      "id": "1",
      "type": "product_approval",
      "description": "Organik Domates ürünü onaylandı",
      "user": "Admin User",
      "timestamp": "2024-11-19T10:30:00Z",
      "details": {
        "productId": "1",
        "productName": "Organik Domates"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

## ✅ 4. POST ENDPOINT'LERİ (ONAYLAMA/REDDETME)

### 4.1 Approve Product

#### 📍 **Postman'de POST Request Nasıl Yapılır?**

**ADIM 1: Method ve URL**
- **Method:** `POST` seçin
- **URL:** `{{base_url}}/api/ziraat/products/approve/1` yazın
  - `1` yerine gerçek ürün ID'sini yazın
  - Önce Product Applications endpoint'inden ID'leri alın

**ADIM 2: Headers Sekmesi**
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`

**ADIM 3: Body Sekmesi**
**Postman'de Body sekmesine tıklayın:**
1. **Radio butonlardan** → `raw` seçin
2. **Dropdown'dan** → `JSON` seçin
3. **Opsiyonel** olarak şunu ekleyin (boş da bırakabilirsiniz):

```json
{
  "note": "Ürün onaylandı, belgeler tamam."
}
```

**⚠️ NOT:** 
- Body opsiyoneldir (boş bırakılabilir)
- Not eklemek isterseniz yukarıdaki JSON'u kullanın

**ADIM 4: Send**
- **Send** butonuna tıklayın
- Başarılı ise `200 OK` ve success mesajı görmelisiniz

**Endpoint:** `POST {{base_url}}/api/ziraat/products/approve/:id`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**URL Parameters:**
- `id`: Ürün başvurusu ID'si (örn: 1)

**Body (raw JSON - Opsiyonel):**
```json
{
  "note": "Ürün onaylandı, belgeler tamam."
}
```

**Örnek URL:**
```
POST {{base_url}}/api/ziraat/products/approve/1
```

**Beklenen Response:**
```json
{
  "success": true,
  "message": "Ürün başvurusu başarıyla onaylandı"
}
```

---

### 4.2 Reject Product

#### 📍 **Postman'de Reject Request (Body Zorunlu)**

**ADIM 1: Method ve URL**
- **Method:** `POST` seçin
- **URL:** `{{base_url}}/api/ziraat/products/reject/1` yazın
  - `1` yerine gerçek ürün ID'sini yazın

**ADIM 2: Headers Sekmesi**
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`

**ADIM 3: Body Sekmesi (ZORUNLU!)**
**⚠️ Bu endpoint'te Body ZORUNLUDUR!**

**Postman'de Body sekmesine tıklayın:**
1. **Radio butonlardan** → `raw` seçin
2. **Dropdown'dan** → `JSON` seçin
3. **Mutlaka** şunu ekleyin:

```json
{
  "reason": "Belgeler eksik, lütfen eksik belgeleri tamamlayın."
}
```

**⚠️ ÖNEMLİ:** 
- `reason` alanı zorunludur!
- Reddetme nedeni mutlaka yazılmalı
- Body boş bırakılırsa hata alırsınız

**ADIM 4: Send**
- **Send** butonuna tıklayın
- Başarılı ise `200 OK` ve reddetme mesajı görmelisiniz

**Endpoint:** `POST {{base_url}}/api/ziraat/products/reject/:id`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**URL Parameters:**
- `id`: Ürün başvurusu ID'si (örn: 1)

**Body (raw JSON - Zorunlu):**
```json
{
  "reason": "Belgeler eksik, lütfen eksik belgeleri tamamlayın."
}
```

**Örnek URL:**
```
POST {{base_url}}/api/ziraat/products/reject/1
```

**Beklenen Response:**
```json
{
  "success": true,
  "message": "Ürün başvurusu reddedildi"
}
```

---

### 4.3 Approve Farm
**Endpoint:** `POST {{base_url}}/api/ziraat/farms/approve/:id`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**URL Parameters:**
- `id`: Çiftlik başvurusu ID'si (örn: 1)

**Body (raw JSON - Opsiyonel):**
```json
{
  "note": "Çiftlik onaylandı, denetim başarılı."
}
```

**Örnek URL:**
```
POST {{base_url}}/api/ziraat/farms/approve/1
```

**Beklenen Response:**
```json
{
  "success": true,
  "message": "Çiftlik başvurusu başarıyla onaylandı"
}
```

---

### 4.4 Reject Farm
**Endpoint:** `POST {{base_url}}/api/ziraat/farms/reject/:id`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**URL Parameters:**
- `id`: Çiftlik başvurusu ID'si (örn: 1)

**Body (raw JSON - Zorunlu):**
```json
{
  "reason": "Denetim sırasında eksiklikler tespit edildi."
}
```

**Örnek URL:**
```
POST {{base_url}}/api/ziraat/farms/reject/1
```

**Beklenen Response:**
```json
{
  "success": true,
  "message": "Çiftlik başvurusu reddedildi"
}
```

---

## 🚨 5. HATA DURUMLARI

### 5.1 401 Unauthorized
**Sebep:** Token eksik veya geçersiz

**Response:**
```json
{
  "success": false,
  "message": "Giriş yapmanız gerekiyor"
}
```

**Çözüm:**
1. Login endpoint'ini tekrar çağırın
2. Token'ın environment'a kaydedildiğinden emin olun
3. Authorization header'ında `Bearer ` öneki olduğundan emin olun

---

### 5.2 403 Forbidden
**Sebep:** Kullanıcının rolü `ziraat_yoneticisi` değil

**Response:**
```json
{
  "success": false,
  "message": "Bu işlem için yetkiniz yok"
}
```

**Çözüm:**
1. Veritabanında kullanıcının rolünü kontrol edin
2. `ziraat_yoneticisi` rolüne sahip bir kullanıcı ile giriş yapın

---

### 5.3 404 Not Found
**Sebep:** Endpoint bulunamadı

**Response:**
```json
{
  "success": false,
  "message": "Endpoint bulunamadı",
  "path": "/api/ziraat/..."
}
```

**Çözüm:**
1. **Server'ı yeniden başlatın** (en önemli!)
   - Terminal'de Ctrl+C ile durdurun
   - `node server.js` ile tekrar başlatın
   - "🚀 Server 5000 portunda çalışıyor" mesajını görün

2. **URL'yi kontrol edin:**
   - `GET {{base_url}}/api/ziraat/dashboard/stats` doğru mu?
   - `{{base_url}}` değişkeni `http://localhost:5000` olmalı

3. **Controller dosyasının var olduğundan emin olun:**
   - `server/src/controllers/ziraatController.js` dosyası var mı?
   - Dosyada syntax hatası var mı?

4. **Route dosyasının doğru olduğundan emin olun:**
   - `server/src/routes/ziraatRoutes.js` dosyası var mı?
   - `server.js`'de route kayıtlı mı: `app.use('/api/ziraat', require('./src/routes/ziraatRoutes.js'));`

5. **Health check endpoint'ini test edin:**
   - `GET {{base_url}}/api/health` çalışıyor mu?
   - Çalışıyorsa server ayakta demektir

**⚠️ EN YAYGIN SORUN:** Server yeniden başlatılmamış! Controller dosyası değiştiğinde MUTLAKA server'ı yeniden başlatın.

---

### 5.4 500 Internal Server Error
**Sebep:** Sunucu hatası

**Response:**
```json
{
  "success": false,
  "message": "Sunucu hatası"
}
```

**Çözüm:**
1. Server log'larını kontrol edin
2. Veritabanı bağlantısını kontrol edin
3. Controller fonksiyonlarını kontrol edin

---

## 📝 6. POSTMAN COLLECTION YAPISI

### Önerilen Collection Yapısı:

```
Ziraat Dashboard API
├── 1. Authentication
│   └── Login
├── 2. Dashboard
│   └── Get Dashboard Stats
├── 3. Products
│   ├── Get Product Applications
│   ├── Approve Product
│   └── Reject Product
├── 4. Farms
│   ├── Get Farm Applications
│   ├── Approve Farm
│   └── Reject Farm
├── 5. Farmers
│   └── Get Registered Farmers
├── 6. Products List
│   └── Get Dashboard Products
└── 7. Activities
    └── Get Activity Log
```

---

## ⚡ 7. HIZLI TEST ADIMLARI

### ⚠️ ÖNEMLİ: Server'ı Yeniden Başlatın!
**Controller dosyası değiştiyse veya yeni oluşturulduysa:**

1. Terminal'de çalışan server'ı **durdurun** (Ctrl+C)
2. Server'ı **tekrar başlatın**:
   ```bash
   cd server
   node server.js
   ```
3. "🚀 Server 5000 portunda çalışıyor" mesajını görmelisiniz
4. Şimdi Postman'de test edebilirsiniz

**Neden gerekli?**
- Node.js, dosya değişikliklerini otomatik algılamaz
- Controller veya route dosyaları değiştiğinde server yeniden başlatılmalı
- Aksi halde **404 Not Found** hatası alırsınız

---

### Adım 1: Login
1. Login request'ini çalıştırın
2. Token'ın environment'a kaydedildiğini kontrol edin

### Adım 2: GET Request'leri Test Edin
1. Dashboard Stats
2. Product Applications
3. Farm Applications
4. Registered Farmers
5. Dashboard Products
6. Activity Log

### Adım 3: POST Request'leri Test Edin
1. Approve Product (bir ürün ID'si ile)
2. Reject Product (bir ürün ID'si ile, reason ile)
3. Approve Farm (bir çiftlik ID'si ile)
4. Reject Farm (bir çiftlik ID'si ile, reason ile)

### Adım 4: Hata Durumlarını Test Edin
1. Token olmadan request gönderin (401 beklenir)
2. Yanlış token ile request gönderin (401 beklenir)
3. Yanlış rol ile giriş yapın (403 beklenir)
4. Var olmayan ID ile onaylama/reddetme yapın (404 beklenir)

---

## 📋 8. ENDPOINT KARŞILAŞTIRMA

### ✅ GERÇEK ENDPOINT'LER (Routes Dosyasındaki):

**GET Endpoint'leri:**
- ✅ `GET /api/ziraat/dashboard/stats` - Dashboard istatistikleri
- ✅ `GET /api/ziraat/products/applications` - Ürün başvuruları listesi
- ✅ `GET /api/ziraat/farms/applications` - Çiftlik başvuruları listesi
- ✅ `GET /api/ziraat/farmers/registered` - Kayıtlı çiftçiler
- ✅ `GET /api/ziraat/dashboard/products` - Dashboard ürünleri (⚠️ `/products` DEĞİL!)
- ✅ `GET /api/ziraat/activity-log` - Aktivite logları

**POST Endpoint'leri:**
- ✅ `POST /api/ziraat/products/approve/:id` - Ürün onayla
- ✅ `POST /api/ziraat/products/reject/:id` - Ürün reddet
- ✅ `POST /api/ziraat/farms/approve/:id` - Çiftlik onayla
- ✅ `POST /api/ziraat/farms/reject/:id` - Çiftlik reddet

**❌ OLMAYAN ENDPOINT'LER:**
- ❌ `GET /api/ziraat/products` - **BU ENDPOINT YOK!**
  - Bunun yerine kullanın: `/api/ziraat/dashboard/products`
  - Veya: `/api/ziraat/products/applications`

**⚠️ ÖNEMLİ:** 
- `/api/ziraat/products` endpoint'i yok!
- Ürünler için 2 seçenek var:
  1. `/api/ziraat/products/applications` - Ürün başvuruları
  2. `/api/ziraat/dashboard/products` - Dashboard ürünleri

---

## 🎯 9. TEST CHECKLIST

- [ ] Login başarılı ve token alındı
- [ ] Dashboard Stats endpoint çalışıyor
- [ ] Product Applications endpoint çalışıyor (filtreleme ile)
- [ ] Farm Applications endpoint çalışıyor (filtreleme ile)
- [ ] Registered Farmers endpoint çalışıyor
- [ ] Dashboard Products endpoint çalışıyor
- [ ] Activity Log endpoint çalışıyor
- [ ] Approve Product endpoint çalışıyor
- [ ] Reject Product endpoint çalışıyor (reason ile)
- [ ] Approve Farm endpoint çalışıyor
- [ ] Reject Farm endpoint çalışıyor (reason ile)
- [ ] 401 hatası doğru dönüyor (token yok)
- [ ] 403 hatası doğru dönüyor (yanlış rol)
- [ ] 404 hatası doğru dönüyor (yanlış endpoint)

---

## 💡 10. İPUÇLARI

### 10.1 Hızlı Referans: Hangi Request'te Hangi Kısımlar?

| Request Tipi | Method | URL | Headers | Body | Params | Tests |
|--------------|--------|-----|---------|------|--------|-------|
| **Login** | `POST` | ✅ `{{base_url}}/api/auth/login` | ✅ `Content-Type` | ✅ JSON (email/password) | ❌ | ✅ Token kaydet |
| **GET Dashboard Stats** | `GET` | ✅ `{{base_url}}/api/ziraat/dashboard/stats` | ✅ `Authorization` | ❌ | ❌ | ❌ |
| **GET Products** | `GET` | ✅ `{{base_url}}/api/ziraat/products/applications` | ✅ `Authorization` | ❌ | ✅ (opsiyonel: page, limit, status) | ❌ |
| **POST Approve** | `POST` | ✅ `{{base_url}}/api/ziraat/products/approve/1` | ✅ `Authorization` | ⚠️ Opsiyonel JSON (note) | ❌ | ❌ |
| **POST Reject** | `POST` | ✅ `{{base_url}}/api/ziraat/products/reject/1` | ✅ `Authorization` | ✅ **Zorunlu** JSON (reason) | ❌ | ❌ |

**İşaretler:**
- ✅ = Kullanılmalı
- ❌ = Kullanılmaz/Boş bırakılabilir
- ⚠️ = Opsiyonel (isteğe bağlı)

---

### 10.2 Postman'de Header Nasıl Eklenir?

**Headers sekmesinde:**
1. **Key** kolonuna header adını yazın (örn: `Authorization`)
2. **Value** kolonuna değerini yazın (örn: `Bearer {{token}}`)
3. Otomatik olarak eklenir

**Önemli Header'lar:**
- `Authorization: Bearer {{token}}` → Tüm ziraat endpoint'lerinde zorunlu
- `Content-Type: application/json` → POST request'lerde zorunlu

---

### 10.3 Postman'de Body Nasıl Doldurulur?

**Body sekmesinde:**
1. **Radio butonlardan** → `raw` seçin
2. **Dropdown'dan** → `JSON` seçin
3. **Metin kutusuna** JSON yazın

**Örnek:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**⚠️ DİKKAT:** 
- JSON formatında yazın (tırnaklar, virgüller doğru olmalı)
- Body boşsa, `raw` seçili olsa bile boş bırakılabilir (GET request'lerde)

---

### 10.4 Postman'de Query Parametreleri Nasıl Eklenir?

**Params sekmesinde:**
1. **Key** kolonuna parametre adını yazın (örn: `page`)
2. **Value** kolonuna değerini yazın (örn: `1`)
3. **Checkbox** işaretleyin (aktif olması için)
4. URL otomatik olarak güncellenir: `?page=1`

**Birden fazla parametre:**
- Her parametre için yeni satır ekleyin
- URL otomatik olarak: `?page=1&limit=10&status=beklemede` olur

---

1. **Pre-request Script:** Her request'te token'ın güncel olduğundan emin olmak için pre-request script ekleyebilirsiniz:
```javascript
// Token'ın var olduğunu kontrol et
if (!pm.environment.get("token")) {
    console.warn("⚠️ Token bulunamadı! Önce login yapın.");
}
```

2. **Test Script:** Her request'te response'u kontrol edin:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});
```

3. **Collection Runner:** Tüm request'leri otomatik çalıştırmak için Collection Runner kullanın (Postman'de Runner sekmesi)

4. **Environment Değiştirme:** Farklı ortamlar için (dev, staging, prod) farklı environment'lar oluşturun

---

**Başarılar! 🚀**

