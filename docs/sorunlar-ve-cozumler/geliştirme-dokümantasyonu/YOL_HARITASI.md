# 🗺️ YEŞİL-EKSEN - 1 GÜNLÜK GELİŞTİRME YOL HARİTASI

**Tarih:** 19 Kasım 2024  
**Geliştirici:** [Senin Adın]  
**Sorumluluk:** Veritabanı + Auth + Firma + Çiftçi Backend & Frontend

---

## 📊 GENEL BAKIŞ

### Tamamlanacak Özellikler
- ✅ PostgreSQL Veritabanı Kurulumu (57 tablo)
- ✅ Backend API Temel Yapısı
- ✅ Authentication Sistemi (Login/Register)
- ✅ Çiftçi Backend API'leri (5 endpoint)
- ✅ Çiftçi Frontend Entegrasyonu
- ✅ Firma Backend API'leri (2 endpoint)
- ✅ Firma Frontend Entegrasyonu

### Zaman Planı
| Saat | Görev | Durum |
|------|-------|-------|
| 09:00-10:30 | Veritabanı Kurulumu | ⏳ |
| 10:30-12:00 | Backend Temel Yapı | ⏳ |
| 13:00-15:00 | Auth Sistemi | ⏳ |
| 15:00-17:00 | Çiftçi API'leri | ⏳ |
| 17:00-18:00 | Firma API'leri | ⏳ |

---

## 🎯 AŞAMA 1: VERITABANI KURULUMU (1.5 saat)

### 1.1 PostgreSQL Kurulumu (15 dk)
```bash
# PostgreSQL İndirme Linki:
https://www.postgresql.org/download/

# Kurulum Bilgileri:
Port: 5432
Database: yesileksen
User: postgres
Password: [kendi şifren]
```

**Kontrol:**
- [ ] PostgreSQL servisi çalışıyor
- [ ] pgAdmin açılıyor
- [ ] Yeni database oluşturuldu

### 1.2 SQL Dosyasını Çalıştır (30 dk)
```sql
-- pgAdmin > Query Tool aç
-- File > Open: docs/Kullanılan Sql.sql
-- Execute (F5)
```

**Beklenen Sonuç:**
```
Query returned successfully: 
57 tables created
Seed data inserted
```

**Doğrulama:**
```sql
-- Tablo sayısını kontrol et
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Sonuç: 57 olmalı

-- Test kullanıcıları
SELECT * FROM kullanicilar;
-- 3 kullanıcı görmeli (admin, ziraat, sanayi)
```

### 1.3 Test Kullanıcıları Ekle (15 dk)
```sql
-- Test Çiftçi
INSERT INTO kullanicilar (ad, soyad, eposta, sifre_hash, telefon, rol, durum, eposta_dogrulandi, sartlar_kabul, sartlar_kabul_tarihi)
VALUES ('Test', 'Çiftçi', 'ciftci@test.com', crypt('123456', gen_salt('bf')), '+90 532 111 22 33', 'ciftci', 'aktif', TRUE, TRUE, CURRENT_TIMESTAMP);

-- Test Firma
INSERT INTO kullanicilar (ad, soyad, eposta, sifre_hash, telefon, rol, durum, eposta_dogrulandi, sartlar_kabul, sartlar_kabul_tarihi)
VALUES ('Test', 'Firma', 'firma@test.com', crypt('123456', gen_salt('bf')), '+90 532 444 55 66', 'firma', 'aktif', TRUE, TRUE, CURRENT_TIMESTAMP);

-- Test Çiftlik
INSERT INTO ciftlikler (kullanici_id, ad, adres, sehir_id, durum)
SELECT id, 'Test Çiftliği', 'Test Adres, Antalya', 7, 'aktif'
FROM kullanicilar WHERE eposta = 'ciftci@test.com';

-- Test Firma
INSERT INTO firmalar (kullanici_id, ad, vergi_no, adres, sehir_id, durum)
SELECT id, 'Test Firma A.Ş.', '1234567890', 'Test Adres, İstanbul', 34, 'aktif'
FROM kullanicilar WHERE eposta = 'firma@test.com';
```

### 1.4 .env Dosyası Oluştur (10 dk)
**Konum:** Proje root dizini (WebProje-YesilEksen/.env)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yesileksen
DB_USER=postgres
DB_PASSWORD=SENİN_ŞİFREN_BURAYA

# JWT
JWT_SECRET=yesileksen_super_secret_key_2024
JWT_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:5173
```

### 1.5 Database Test (20 dk)
```bash
cd server
npm init -y
npm install express pg bcrypt jsonwebtoken dotenv cors express-validator multer helmet morgan
npm install --save-dev nodemon
```

**server/testConnection.js oluştur:**
```javascript
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database bağlantısı başarılı!');
        console.log('📅 Server zamanı:', result.rows[0].now);
        
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log(`📊 Toplam tablo sayısı: ${tables.rows.length}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Bağlantı hatası:', error.message);
        process.exit(1);
    }
}

testConnection();
```

**Test Et:**
```bash
node testConnection.js
```

**✅ Checkpoint - Aşama 1 Tamamlandı**
- [ ] PostgreSQL çalışıyor
- [ ] 57 tablo oluşturuldu
- [ ] Test kullanıcıları eklendi
- [ ] .env dosyası hazır
- [ ] Database connection test başarılı

---

## 🎯 AŞAMA 2: BACKEND TEMEL YAPI (1.5 saat)

### 2.1 server.js Oluştur (20 dk)
**Dosya:** server/server.js

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config({ path: '../.env' });

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/ciftlik', require('./src/routes/ciftlikRoutes'));
app.use('/api/firma', require('./src/routes/firmaRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: 'Connected'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Sunucu hatası',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint bulunamadı'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
});
```

### 2.2 database.js Güncelle (10 dk)
**Dosya:** server/src/config/database.js

```javascript
const { Pool } = require('pg');
require('dotenv').config({ path: '../../../.env' });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('✅ PostgreSQL havuzuna bağlanıldı');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL havuz hatası:', err);
    process.exit(-1);
});

const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('🔍 Query:', { text, duration: `${duration}ms`, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('❌ Query hatası:', error);
        throw error;
    }
};

module.exports = { pool, query };
```

### 2.3 Auth Middleware (15 dk)
**Dosya:** server/src/middleware/auth.js

**Tam kod için:** `DETAYLI_KODLAR.md` dosyasına bakın.

### 2.4 JWT Helper (10 dk)
**Dosya:** server/src/utils/jwtHelper.js

**Tam kod için:** `DETAYLI_KODLAR.md` dosyasına bakın.

### 2.5 package.json Güncelle (5 dk)
**Dosya:** server/package.json

```json
{
  "name": "yesileksen-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node testConnection.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 2.6 Server Test (10 dk)
```bash
cd server
npm install
npm run dev
```

**Browser'da test:** http://localhost:5000/api/health

**Beklenen Sonuç:**
```json
{
  "status": "OK",
  "timestamp": "2024-11-19T...",
  "database": "Connected"
}
```

**✅ Checkpoint - Aşama 2 Tamamlandı**
- [ ] server.js çalışıyor
- [ ] Database bağlantısı var
- [ ] /api/health OK döndürüyor
- [ ] Middleware'ler kurulu

---

## 🎯 AŞAMA 3: AUTH SİSTEMİ (2 saat)

### 3.1 authController.js (30 dk)
**Dosya:** server/src/controllers/authController.js

**Fonksiyonlar:**
- `register` - Yeni kullanıcı kaydı
- `login` - Kullanıcı girişi
- `getMe` - Mevcut kullanıcı bilgisi
- `logout` - Çıkış

**Tam kod için:** `DETAYLI_KODLAR.md` dosyasına bakın.

### 3.2 authRoutes.js (10 dk)
**Dosya:** server/src/routes/authRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);

module.exports = router;
```

### 3.3 Postman Test (20 dk)

**Test 1 - Register:**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "email": "ahmet@test.com",
  "password": "123456",
  "userType": "farmer",
  "phone": "+90 532 123 45 67",
  "terms": true
}
```

**Test 2 - Login:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "ciftci@test.com",
  "password": "123456"
}
```

**Test 3 - Get Me:**
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer [TOKEN_BURAYA]
```

### 3.4 Frontend API Service (30 dk)

**3.4.1 Frontend .env Oluştur**
**Dosya:** .env (proje root)
```env
VITE_API_URL=http://localhost:5000/api
```

**3.4.2 api.ts Oluştur**
**Dosya:** src/services/api.ts

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/giris';
        }
        return Promise.reject(error);
    }
);

export default api;
```

**3.4.3 authService.ts Oluştur**
**Dosya:** src/services/authService.ts

**Tam kod için:** `DETAYLI_KODLAR.md` dosyasına bakın.

### 3.5 Login Sayfası Güncelle (15 dk)
**Dosya:** src/pages/auth/giris.tsx

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

// handleSubmit fonksiyonunu güncelle
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData);
      const user = response.user;
      
      if (user.rol === 'ciftci') {
        navigate('/ciftlik/panel');
      } else if (user.rol === 'firma') {
        navigate('/firma/panel');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };
```

### 3.6 Register Sayfası Güncelle (10 dk)
**Dosya:** src/pages/auth/kayit.tsx

```typescript
import { authService } from '../../services/authService';

// handleFinalSubmit fonksiyonunu güncelle
const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        phone: formData.phone,
        terms: formData.terms
      });

      alert('Kayıt başarılı! Admin onayı bekleniyor.');
      navigate('/giris');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
};
```

### 3.7 Test Et (5 dk)
```bash
# Frontend'i başlat
npm run dev

# Browser'da aç: http://localhost:5173
# Kayıt ol > Giriş yap > Token localStorage'da olmalı
```

**✅ Checkpoint - Aşama 3 Tamamlandı**
- [ ] Register API çalışıyor
- [ ] Login API çalışıyor
- [ ] Token oluşturuluyor
- [ ] Frontend login çalışıyor
- [ ] Frontend register çalışıyor
- [ ] Token localStorage'da

---

## 🎯 AŞAMA 4: ÇİFTÇİ API'LERİ (2 saat)

### 4.1 ciftlikController.js (45 dk)
**Dosya:** server/src/controllers/ciftlikController.js

**Fonksiyonlar:**
- `getPanelStats` - Panel istatistikleri
- `getMyProducts` - Ürünlerim listesi
- `addProduct` - Yeni ürün ekleme
- `updateProduct` - Ürün güncelleme
- `deleteProduct` - Ürün silme (soft delete)

**Tam kod için:** `DETAYLI_KODLAR.md` dosyasına bakın.

### 4.2 ciftlikRoutes.js (10 dk)
**Dosya:** server/src/routes/ciftlikRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const {
    getPanelStats,
    getMyProducts,
    addProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/ciftlikController');
const { auth, checkRole } = require('../middleware/auth');

router.use(auth);
router.use(checkRole('ciftci'));

router.get('/panel/stats', getPanelStats);
router.get('/urunler', getMyProducts);
router.post('/urun', addProduct);
router.put('/urun/:id', updateProduct);
router.delete('/urun/:id', deleteProduct);

module.exports = router;
```

### 4.3 ciftlikService.ts (15 dk)
**Dosya:** src/services/ciftlikService.ts

```typescript
import api from './api';

export const ciftlikService = {
    getPanelStats: async () => {
        const response = await api.get('/ciftlik/panel/stats');
        return response.data;
    },

    getMyProducts: async (params?: {
        page?: number;
        limit?: number;
        kategori?: string;
        durum?: string;
        search?: string;
    }) => {
        const response = await api.get('/ciftlik/urunler', { params });
        return response.data;
    },

    addProduct: async (data: any) => {
        const response = await api.post('/ciftlik/urun', data);
        return response.data;
    },

    updateProduct: async (id: string, data: any) => {
        const response = await api.put(`/ciftlik/urun/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id: string) => {
        const response = await api.delete(`/ciftlik/urun/${id}`);
        return response.data;
    }
};
```

### 4.4 Postman Test (10 dk)
```http
GET http://localhost:5000/api/ciftlik/panel/stats
Authorization: Bearer [CIFTCI_TOKEN]

GET http://localhost:5000/api/ciftlik/urunler?page=1&limit=6
Authorization: Bearer [CIFTCI_TOKEN]

POST http://localhost:5000/api/ciftlik/urun
Authorization: Bearer [CIFTCI_TOKEN]
Content-Type: application/json

{
  "title": "Test Ürün",
  "miktar": "100",
  "price": "50",
  "category": "Çiftlik Atıkları",
  "desc": "Test açıklama"
}
```

### 4.5 Panel Sayfası Güncelle (20 dk)
**Dosya:** src/pages/ciftlik/ciftci_panel.tsx

```typescript
import { useState, useEffect } from 'react';
import { ciftlikService } from '../../services/ciftlikService';

function CiftciPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await ciftlikService.getPanelStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Stats yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  // stats değişkenini kullan
}
```

### 4.6 Ürünlerim Sayfası Güncelle (20 dk)
**Dosya:** src/pages/ciftlik/urunlerim.tsx

```typescript
import { useEffect } from 'react';
import { ciftlikService } from '../../services/ciftlikService';

// useEffect ekle
useEffect(() => {
  loadProducts();
}, [currentPage, selectedCategories, selectedStatus, searchTerm]);

const loadProducts = async () => {
  setLoading(true);
  try {
    const response = await ciftlikService.getMyProducts({
      page: currentPage,
      limit: itemsPerPage,
      kategori: selectedCategories[0],
      durum: selectedStatus[0],
      search: searchTerm
    });
    setProducts(response.products);
  } catch (error) {
    console.error('Ürünler yüklenemedi:', error);
  } finally {
    setLoading(false);
  }
};
```

**✅ Checkpoint - Aşama 4 Tamamlandı**
- [ ] Panel stats API çalışıyor
- [ ] Ürün listesi API çalışıyor
- [ ] Ürün ekleme API çalışıyor
- [ ] Ürün güncelleme API çalışıyor
- [ ] Ürün silme API çalışıyor
- [ ] Panel sayfası API'ye bağlı
- [ ] Ürünlerim sayfası API'ye bağlı

---

## 🎯 AŞAMA 5: FİRMA API'LERİ (1 saat)

### 5.1 firmaController.js (30 dk)
**Dosya:** server/src/controllers/firmaController.js

**Tam kod için:** `DETAYLI_KODLAR.md` dosyasına bakın.

### 5.2 firmaRoutes.js (5 dk)
**Dosya:** server/src/routes/firmaRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const { getPanelStats, getBasvuruStatus } = require('../controllers/firmaController');
const { auth, checkRole } = require('../middleware/auth');

router.use(auth);
router.use(checkRole('firma'));

router.get('/panel/stats', getPanelStats);
router.get('/basvuru-durum', getBasvuruStatus);

module.exports = router;
```

### 5.3 firmaService.ts (10 dk)
**Dosya:** src/services/firmaService.ts

```typescript
import api from './api';

export const firmaService = {
    getPanelStats: async () => {
        const response = await api.get('/firma/panel/stats');
        return response.data;
    },

    getBasvuruStatus: async () => {
        const response = await api.get('/firma/basvuru-durum');
        return response.data;
    }
};
```

### 5.4 Firma Panel Güncelle (15 dk)
**Dosya:** src/pages/firma/firma_panel.tsx

```typescript
import { useState, useEffect } from 'react';
import { firmaService } from '../../services/firmaService';

function FirmaPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await firmaService.getPanelStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Stats yüklenemedi:', error);
    }
  };

  // stats kullan
}
```

**✅ Checkpoint - Aşama 5 Tamamlandı**
- [ ] Firma panel stats API çalışıyor
- [ ] Firma başvuru durum API çalışıyor
- [ ] Firma panel sayfası API'ye bağlı

---

## ✅ FINAL KONTROL LİSTESİ

### Database ✅
- [ ] PostgreSQL kurulu ve çalışıyor
- [ ] yesileksen database oluşturuldu
- [ ] SQL dosyası çalıştırıldı (57 tablo)
- [ ] Test kullanıcıları eklendi (ciftci@test.com, firma@test.com)
- [ ] Connection test başarılı

### Backend API ✅
- [ ] server.js çalışıyor (npm run dev)
- [ ] /api/health OK döndürüyor
- [ ] /api/auth/register çalışıyor
- [ ] /api/auth/login çalışıyor
- [ ] /api/auth/me çalışıyor
- [ ] /api/ciftlik/panel/stats çalışıyor
- [ ] /api/ciftlik/urunler çalışıyor
- [ ] /api/ciftlik/urun POST çalışıyor
- [ ] /api/ciftlik/urun/:id PUT çalışıyor
- [ ] /api/ciftlik/urun/:id DELETE çalışıyor
- [ ] /api/firma/panel/stats çalışıyor
- [ ] /api/firma/basvuru-durum çalışıyor

### Frontend ✅
- [ ] .env dosyası oluşturuldu (VITE_API_URL)
- [ ] api.ts service oluşturuldu
- [ ] authService.ts oluşturuldu
- [ ] ciftlikService.ts oluşturuldu
- [ ] firmaService.ts oluşturuldu
- [ ] Login sayfası API'ye bağlandı
- [ ] Register sayfası API'ye bağlandı
- [ ] Çiftçi panel API'ye bağlandı
- [ ] Ürünlerim sayfası API'ye bağlandı
- [ ] Firma panel API'ye bağlandı

### Test Senaryoları ✅
- [ ] Test kullanıcısı ile kayıt olundu
- [ ] Test kullanıcısı ile giriş yapıldı
- [ ] Token localStorage'da saklandı
- [ ] Çiftçi paneli açıldı ve istatistikler göründü
- [ ] Ürünlerim sayfası açıldı ve ürünler listelendi
- [ ] Yeni ürün eklendi
- [ ] Ürün güncellendi
- [ ] Ürün silindi
- [ ] Firma paneli açıldı ve istatistikler göründü

---

## 🚨 SORUN GİDERME

### Database Bağlanmıyor
```bash
# PostgreSQL servisi çalışıyor mu kontrol et
# Windows: Services > PostgreSQL

# .env dosyasını kontrol et
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yesileksen
DB_USER=postgres
DB_PASSWORD=DOĞRU_ŞİFRE
```

### CORS Hatası
```javascript
// server.js içinde kontrol et
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
```

### Token Geçersiz
```javascript
// Browser console'da kontrol et
localStorage.getItem('token')

// Token varsa ama geçersizse, yeniden login ol
```

### Port Kullanımda
```bash
# Port 5000 başka bir uygulama kullanıyorsa
# .env dosyasında PORT=5001 değiştir
```

### Module Not Found
```bash
cd server
npm install
```

---

## 📊 TAMAMLANAN ENDPOINT LİSTESİ

### Auth (3 endpoint)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Çiftlik (5 endpoint)
- GET /api/ciftlik/panel/stats
- GET /api/ciftlik/urunler
- POST /api/ciftlik/urun
- PUT /api/ciftlik/urun/:id
- DELETE /api/ciftlik/urun/:id

### Firma (2 endpoint)
- GET /api/firma/panel/stats
- GET /api/firma/basvuru-durum

**TOPLAM: 10 endpoint**

---

## 📌 ARKADAŞINA VERİLECEK BİLGİLER

### API Bilgileri
- **Base URL:** http://localhost:5000/api
- **Frontend URL:** http://localhost:5173
- **Database:** PostgreSQL (localhost:5432/yesileksen)

### Test Kullanıcıları
- **Çiftçi:** ciftci@test.com / 123456
- **Firma:** firma@test.com / 123456
- **Admin (Ziraat):** ziraat@yesileksen.com / Ziraat123!
- **Admin (Sanayi):** sanayi@yesileksen.com / Sanayi123!

### Tamamlanan Özellikler
✅ Veritabanı (57 tablo)  
✅ Authentication (Login/Register)  
✅ Çiftçi Backend API (5 endpoint)  
✅ Çiftçi Frontend (Panel, Ürünlerim)  
✅ Firma Backend API (2 endpoint)  
✅ Firma Frontend (Panel)

### Bekleyen Özellikler (Arkadaşın Yapacak)
⏳ Admin Ziraat API'leri  
⏳ Admin Sanayi API'leri  
⏳ Dosya Upload Sistemi  
⏳ Bildirim Sistemi  
⏳ Teklif/Sipariş Sistemi

---

## 🎯 SON NOTLAR

- Tüm kodlar production-ready değil, development amaçlıdır
- Validation'lar eklenebilir
- Error handling geliştirilebilir
- Logger eklenebilir (Winston)
- Test'ler yazılabilir (Jest)
- API dokümantasyonu oluşturulabilir (Swagger)

**Başarılar! 💪**

