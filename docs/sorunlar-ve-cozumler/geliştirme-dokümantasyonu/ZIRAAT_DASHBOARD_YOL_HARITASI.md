# 🗺️ ZİRAAT DASHBOARD - GELİŞTİRME YOL HARİTASI

**Tarih:** 19 Kasım 2024  
**Sayfa:** `src/pages/admin/ziraat/dashboard/DashboardPage.tsx`  
**Hedef:** Statik verileri API'ye bağlama ve tam fonksiyonel dashboard oluşturma

---

## 📊 MEVCUT DURUM ANALİZİ

### ✅ Mevcut Özellikler (Statik)
- SummaryCards - Ürün ve çiftlik özet istatistikleri
- Product Approval Section - Ürün onayları tablosu
- Farm Approval Section - Çiftlik onayları tablosu
- ActivityFeed - Aktivite akışı
- RegisteredFarmersTable - Kayıtlı çiftçiler tablosu
- ProductsTable - Ürünler tablosu
- ApplicationDetailModal - Başvuru detay modalı

### ❌ Eksik Özellikler
- Backend API endpoint'leri yok
- Frontend servis katmanı yok
- Statik veriler kullanılıyor (data/ klasöründen)
- Onaylama/Reddetme işlemleri sadece console.log
- Gerçek zamanlı veri güncellemesi yok

---

## 🎯 GELİŞTİRME PLANI

### AŞAMA 1: BACKEND API'LERİ (3-4 saat)

#### 1.1 Ziraat Admin Controller Oluştur (1 saat)
**Dosya:** `server/src/controllers/ziraatController.js`

**Gerekli Fonksiyonlar:**

1. **`getDashboardStats`** - Dashboard özet istatistikleri
   - Ürün onay istatistikleri (bekleyen, onaylanan, reddedilen)
   - Çiftlik onay istatistikleri (yeni başvuru, denetimde, onaylanan)
   - Toplam kayıtlı çiftçi sayısı
   - Toplam ürün sayısı

2. **`getProductApplications`** - Ürün başvuruları listesi
   - Filtreleme: durum, kategori, tarih
   - Sayfalama
   - Arama

3. **`getFarmApplications`** - Çiftlik başvuruları listesi
   - Filtreleme: durum, şehir, tarih
   - Sayfalama
   - Arama

4. **`approveProduct`** - Ürün başvurusunu onayla
   - Ürün durumunu güncelle
   - Bildirim oluştur
   - Aktivite log ekle

5. **`rejectProduct`** - Ürün başvurusunu reddet
   - Red nedeni kaydet
   - Bildirim oluştur
   - Aktivite log ekle

6. **`approveFarm`** - Çiftlik başvurusunu onayla
   - Çiftlik durumunu güncelle
   - Bildirim oluştur
   - Aktivite log ekle

7. **`rejectFarm`** - Çiftlik başvurusunu reddet
   - Red nedeni kaydet
   - Bildirim oluştur
   - Aktivite log ekle

8. **`getRegisteredFarmers`** - Kayıtlı çiftçiler listesi
   - Filtreleme ve arama
   - Sayfalama

9. **`getDashboardProducts`** - Dashboard ürünleri
   - Filtreleme ve arama

10. **`getActivityLog`** - Aktivite logları
    - Filtreleme: tip, tarih
    - Sayfalama

#### 1.2 Ziraat Admin Routes Oluştur (15 dk)
**Dosya:** `server/src/routes/ziraatRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getProductApplications,
    getFarmApplications,
    approveProduct,
    rejectProduct,
    approveFarm,
    rejectFarm,
    getRegisteredFarmers,
    getDashboardProducts,
    getActivityLog
} = require('../controllers/ziraatController');
const { auth, checkRole } = require('../middleware/auth');

router.use(auth);
router.use(checkRole('ziraat_yoneticisi'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/products/applications', getProductApplications);
router.get('/farms/applications', getFarmApplications);
router.post('/products/:id/approve', approveProduct);
router.post('/products/:id/reject', rejectProduct);
router.post('/farms/:id/approve', approveFarm);
router.post('/farms/:id/reject', rejectFarm);
router.get('/farmers', getRegisteredFarmers);
router.get('/products', getDashboardProducts);
router.get('/activities', getActivityLog);

module.exports = router;
```

#### 1.3 server.js'e Route Ekle (5 dk)
**Dosya:** `server/src/app.js` veya `server/server.js`

```javascript
// Mevcut routes'a ekle
app.use('/api/ziraat', require('./src/routes/ziraatRoutes'));
```

#### 1.4 Postman Test (30 dk)
Tüm endpoint'leri test et:
- GET /api/ziraat/dashboard/stats
- GET /api/ziraat/products/applications
- GET /api/ziraat/farms/applications
- POST /api/ziraat/products/:id/approve
- POST /api/ziraat/products/:id/reject
- POST /api/ziraat/farms/:id/approve
- POST /api/ziraat/farms/:id/reject
- GET /api/ziraat/farmers
- GET /api/ziraat/products
- GET /api/ziraat/activities

---

### AŞAMA 2: FRONTEND SERVİS KATMANI (1 saat)

#### 2.1 ziraatService.ts Oluştur (45 dk)
**Dosya:** `src/services/ziraatService.ts`

```typescript
import api from './api';

export interface DashboardStats {
    productSummary: {
        pending: number;
        approved: number;
        revision: number;
    };
    farmSummary: {
        newApplications: number;
        inspections: number;
        approved: number;
    };
    totalFarmers: number;
    totalProducts: number;
}

export interface ProductApplication {
    id: string;
    name: string;
    applicant: string;
    status: string;
    lastUpdate: string;
    applicationNumber: string;
    sector: string;
    establishmentYear: number;
    employeeCount: string;
    email: string;
    applicationDate: string;
    taxNumber: string;
    description: string;
    documents: Array<{ name: string; url?: string }>;
}

export interface FarmApplication {
    id: string;
    name: string;
    owner: string;
    status: string;
    inspectionDate: string;
    applicationNumber: string;
    sector: string;
    establishmentYear: number;
    employeeCount: string;
    email: string;
    applicationDate: string;
    taxNumber: string;
    description: string;
    documents: Array<{ name: string; url?: string }>;
}

export const ziraatService = {
    /**
     * Dashboard özet istatistikleri
     */
    getDashboardStats: async (): Promise<{ success: boolean; stats: DashboardStats }> => {
        const response = await api.get('/ziraat/dashboard/stats');
        return response.data;
    },

    /**
     * Ürün başvuruları listesi
     */
    getProductApplications: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }): Promise<{ success: boolean; applications: ProductApplication[]; pagination: any }> => {
        const response = await api.get('/ziraat/products/applications', { params });
        return response.data;
    },

    /**
     * Çiftlik başvuruları listesi
     */
    getFarmApplications: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }): Promise<{ success: boolean; applications: FarmApplication[]; pagination: any }> => {
        const response = await api.get('/ziraat/farms/applications', { params });
        return response.data;
    },

    /**
     * Ürün başvurusunu onayla
     */
    approveProduct: async (id: string, data?: { note?: string }): Promise<{ success: boolean; message: string }> => {
        const response = await api.post(`/ziraat/products/${id}/approve`, data);
        return response.data;
    },

    /**
     * Ürün başvurusunu reddet
     */
    rejectProduct: async (id: string, data: { reason: string }): Promise<{ success: boolean; message: string }> => {
        const response = await api.post(`/ziraat/products/${id}/reject`, data);
        return response.data;
    },

    /**
     * Çiftlik başvurusunu onayla
     */
    approveFarm: async (id: string, data?: { note?: string }): Promise<{ success: boolean; message: string }> => {
        const response = await api.post(`/ziraat/farms/${id}/approve`, data);
        return response.data;
    },

    /**
     * Çiftlik başvurusunu reddet
     */
    rejectFarm: async (id: string, data: { reason: string }): Promise<{ success: boolean; message: string }> => {
        const response = await api.post(`/ziraat/farms/${id}/reject`, data);
        return response.data;
    },

    /**
     * Kayıtlı çiftçiler listesi
     */
    getRegisteredFarmers: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{ success: boolean; farmers: any[]; pagination: any }> => {
        const response = await api.get('/ziraat/farmers', { params });
        return response.data;
    },

    /**
     * Dashboard ürünleri
     */
    getDashboardProducts: async (params?: {
        search?: string;
    }): Promise<{ success: boolean; products: any[] }> => {
        const response = await api.get('/ziraat/products', { params });
        return response.data;
    },

    /**
     * Aktivite logları
     */
    getActivityLog: async (params?: {
        page?: number;
        limit?: number;
        type?: string;
    }): Promise<{ success: boolean; activities: any[]; pagination: any }> => {
        const response = await api.get('/ziraat/activities', { params });
        return response.data;
    },
};
```

#### 2.2 Test (15 dk)
Servis fonksiyonlarını test et (console.log ile)

---

### AŞAMA 3: DASHBOARD SAYFASI GÜNCELLEMESİ (2-3 saat)

#### 3.1 DashboardPage.tsx Güncelle (2 saat)

**Yapılacaklar:**

1. **Import'ları ekle:**
```typescript
import { useState, useEffect } from 'react';
import { ziraatService } from '../../../services/ziraatService';
```

2. **State'leri güncelle:**
```typescript
const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
const [productApplications, setProductApplications] = useState<ProductApplication[]>([]);
const [farmApplications, setFarmApplications] = useState<FarmApplication[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

3. **useEffect ile veri yükleme:**
```typescript
useEffect(() => {
    loadDashboardData();
}, []);

const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
        // Paralel olarak tüm verileri yükle
        const [statsRes, productsRes, farmsRes] = await Promise.all([
            ziraatService.getDashboardStats(),
            ziraatService.getProductApplications({ limit: 3 }),
            ziraatService.getFarmApplications({ limit: 3 })
        ]);

        setDashboardStats(statsRes.stats);
        setProductApplications(productsRes.applications);
        setFarmApplications(farmsRes.applications);
    } catch (err: any) {
        setError(err.response?.data?.message || 'Veriler yüklenemedi');
        console.error('Dashboard veri yükleme hatası:', err);
    } finally {
        setLoading(false);
    }
};
```

4. **SummaryCards'i güncelle:**
```typescript
<SummaryCards 
    productSummary={dashboardStats?.productSummary || productSummary} 
    farmSummary={dashboardStats?.farmSummary || farmSummary} 
/>
```

5. **Product Approval Rows'u güncelle:**
```typescript
// Statik productApprovalRows yerine:
{productApplications.map((row) => (
    <tr
        key={row.id}
        onClick={() => handleProductRowClick(row)}
        className="cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10"
    >
        <td className="px-4 py-3 font-medium text-content-light dark:text-content-dark">{row.name}</td>
        <td className="px-4 py-3 text-subtle-light dark:text-subtle-dark">{row.applicant}</td>
        <td className="px-4 py-3">
            <span className={getStatusClass(row.status)}>{row.status}</span>
        </td>
        <td className="px-4 py-3 text-subtle-light dark:text-subtle-dark">{row.lastUpdate}</td>
    </tr>
))}
```

6. **Farm Approval Rows'u güncelle:**
```typescript
// Statik farmApprovalRows yerine:
{farmApplications.map((row) => (
    <tr
        key={row.id}
        onClick={() => handleFarmRowClick(row)}
        className="cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10"
    >
        <td className="px-4 py-3 font-medium text-content-light dark:text-content-dark">{row.name}</td>
        <td className="px-4 py-3 text-subtle-light dark:text-subtle-dark">{row.owner}</td>
        <td className="px-4 py-3">
            <span className={getStatusClass(row.status)}>{row.status}</span>
        </td>
        <td className="px-4 py-3 text-subtle-light dark:text-subtle-dark">{row.inspectionDate}</td>
    </tr>
))}
```

7. **handleApprove ve handleReject fonksiyonlarını güncelle:**
```typescript
const handleApprove = async () => {
    try {
        if (selectedProduct) {
            await ziraatService.approveProduct(selectedProduct.id);
            alert('Ürün başvurusu onaylandı');
        } else if (selectedFarm) {
            await ziraatService.approveFarm(selectedFarm.id);
            alert('Çiftlik başvurusu onaylandı');
        }
        
        // Verileri yeniden yükle
        await loadDashboardData();
        
        setIsProductModalOpen(false);
        setIsFarmModalOpen(false);
        setSelectedProduct(null);
        setSelectedFarm(null);
    } catch (err: any) {
        alert(err.response?.data?.message || 'Onaylama başarısız');
    }
};

const handleReject = async (reason: string) => {
    try {
        if (selectedProduct) {
            await ziraatService.rejectProduct(selectedProduct.id, { reason });
            alert('Ürün başvurusu reddedildi');
        } else if (selectedFarm) {
            await ziraatService.rejectFarm(selectedFarm.id, { reason });
            alert('Çiftlik başvurusu reddedildi');
        }
        
        // Verileri yeniden yükle
        await loadDashboardData();
        
        setIsProductModalOpen(false);
        setIsFarmModalOpen(false);
        setSelectedProduct(null);
        setSelectedFarm(null);
    } catch (err: any) {
        alert(err.response?.data?.message || 'Reddetme başarısız');
    }
};
```

8. **Loading ve Error state'lerini ekle:**
```typescript
if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="mb-4 text-2xl">Yükleniyor...</div>
                <div className="text-subtle-light dark:text-subtle-dark">Dashboard verileri yükleniyor</div>
            </div>
        </div>
    );
}

if (error) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="mb-4 text-2xl text-red-600">Hata</div>
                <div className="text-subtle-light dark:text-subtle-dark">{error}</div>
                <button 
                    onClick={loadDashboardData}
                    className="mt-4 rounded bg-primary px-4 py-2 text-white"
                >
                    Tekrar Dene
                </button>
            </div>
        </div>
    );
}
```

#### 3.2 ApplicationDetailModal Güncelle (30 dk)
- Reddetme için reason input alanı ekle
- Loading state ekle
- Error handling ekle

#### 3.3 RegisteredFarmersTable ve ProductsTable Güncelle (30 dk)
- API'ye bağla
- Loading state ekle
- Error handling ekle

---

### AŞAMA 4: VERİTABANI SORGULARI (2 saat)

#### 4.1 Dashboard Stats Query
```sql
-- Ürün onay istatistikleri
SELECT 
    COUNT(*) FILTER (WHERE durum = 'beklemede') as pending,
    COUNT(*) FILTER (WHERE durum = 'onaylandi') as approved,
    COUNT(*) FILTER (WHERE durum = 'revizyon') as revision
FROM urun_basvurulari;

-- Çiftlik onay istatistikleri
SELECT 
    COUNT(*) FILTER (WHERE durum = 'yeni') as newApplications,
    COUNT(*) FILTER (WHERE durum = 'denetimde') as inspections,
    COUNT(*) FILTER (WHERE durum = 'onaylandi') as approved
FROM ciftlik_basvurulari;

-- Toplam kayıtlı çiftçi
SELECT COUNT(*) FROM ciftlikler WHERE durum = 'aktif';

-- Toplam ürün
SELECT COUNT(*) FROM urunler WHERE durum = 'aktif';
```

#### 4.2 Product Applications Query
```sql
SELECT 
    u.id,
    u.baslik as name,
    f.ad as applicant,
    u.durum as status,
    u.guncelleme_tarihi as lastUpdate,
    u.basvuru_no as applicationNumber,
    f.sektor as sector,
    f.kurulus_yili as establishmentYear,
    f.calisan_sayisi as employeeCount,
    k.eposta as email,
    u.olusturma_tarihi as applicationDate,
    f.vergi_no as taxNumber,
    u.aciklama as description
FROM urun_basvurulari u
JOIN firmalar f ON u.firma_id = f.id
JOIN kullanicilar k ON f.kullanici_id = k.id
WHERE u.durum IN ('beklemede', 'onaylandi', 'revizyon')
ORDER BY u.olusturma_tarihi DESC
LIMIT $1 OFFSET $2;
```

#### 4.3 Farm Applications Query
```sql
SELECT 
    c.id,
    c.ad as name,
    CONCAT(k.ad, ' ', k.soyad) as owner,
    c.durum as status,
    c.denetim_tarihi as inspectionDate,
    c.basvuru_no as applicationNumber,
    c.sektor as sector,
    c.kurulus_yili as establishmentYear,
    c.calisan_sayisi as employeeCount,
    k.eposta as email,
    c.olusturma_tarihi as applicationDate,
    c.vergi_no as taxNumber,
    c.aciklama as description
FROM ciftlik_basvurulari c
JOIN kullanicilar k ON c.kullanici_id = k.id
WHERE c.durum IN ('yeni', 'denetimde', 'onaylandi', 'reddedildi')
ORDER BY c.olusturma_tarihi DESC
LIMIT $1 OFFSET $2;
```

---

### AŞAMA 5: TEST VE İYİLEŞTİRME (1 saat)

#### 5.1 Unit Test (30 dk)
- Servis fonksiyonlarını test et
- Controller fonksiyonlarını test et

#### 5.2 Integration Test (30 dk)
- Tüm akışı test et
- Edge case'leri test et

---

## ✅ KONTROL LİSTESİ

### Backend ✅
- [ ] ziraatController.js oluşturuldu
- [ ] ziraatRoutes.js oluşturuldu
- [ ] server.js'e route eklendi
- [ ] Tüm endpoint'ler test edildi
- [ ] Veritabanı sorguları optimize edildi
- [ ] Error handling eklendi
- [ ] Validation eklendi

### Frontend ✅
- [ ] ziraatService.ts oluşturuldu
- [ ] DashboardPage.tsx API'ye bağlandı
- [ ] Loading state eklendi
- [ ] Error handling eklendi
- [ ] ApplicationDetailModal güncellendi
- [ ] RegisteredFarmersTable API'ye bağlandı
- [ ] ProductsTable API'ye bağlandı
- [ ] ActivityFeed API'ye bağlandı

### Test ✅
- [ ] Tüm endpoint'ler Postman'de test edildi
- [ ] Frontend'de tüm akışlar test edildi
- [ ] Onaylama/Reddetme işlemleri test edildi
- [ ] Sayfalama test edildi
- [ ] Filtreleme test edildi
- [ ] Arama test edildi

---

## 🚨 SORUN GİDERME

### API 401 Unauthorized
- Token'ın geçerli olduğundan emin ol
- Rol kontrolünü kontrol et (ziraat_yoneticisi)

### Veriler Yüklenmiyor
- Network tab'ında istekleri kontrol et
- Backend log'larını kontrol et
- Veritabanı bağlantısını kontrol et

### Onaylama/Reddetme Çalışmıyor
- Modal'dan reason gönderildiğinden emin ol
- Backend'de transaction kullanıldığından emin ol
- Bildirim oluşturulduğundan emin ol

---

## 📊 ENDPOINT LİSTESİ

### Ziraat Admin (10 endpoint)
- GET /api/ziraat/dashboard/stats
- GET /api/ziraat/products/applications
- GET /api/ziraat/farms/applications
- POST /api/ziraat/products/:id/approve
- POST /api/ziraat/products/:id/reject
- POST /api/ziraat/farms/:id/approve
- POST /api/ziraat/farms/:id/reject
- GET /api/ziraat/farmers
- GET /api/ziraat/products
- GET /api/ziraat/activities

**TOPLAM: 10 endpoint**

---

## 🎯 SONRAKİ ADIMLAR

1. **Real-time Updates:** WebSocket ile gerçek zamanlı güncellemeler
2. **Bildirim Sistemi:** Onaylama/Reddetme sonrası bildirim gönderme
3. **Export Özellikleri:** Excel/PDF export
4. **Gelişmiş Filtreleme:** Tarih aralığı, çoklu durum filtreleme
5. **Bulk Operations:** Toplu onaylama/reddetme
6. **Audit Log:** Tüm işlemlerin detaylı loglanması

---

**Başarılar! 💪**

