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
    rejectFarmAndDelete,
    sendBelgeEksikMessage,
    sendProductBelgeEksikMessage,
    getUpdatedDocuments,
    getRegisteredFarmers,
    getFarmerDetails,
    getDashboardProducts,
    getActivityLog,
    getFarmLogs,
    getAllFarmLogs,
    updateDocumentStatus,
    updateFarmApplicationStatus,
    syncAllActiveFarmUsers
} = require('../controllers/ziraatController');
const { auth, checkRole } = require('../middleware/auth');
router.use(auth);
router.use(checkRole('ziraat_yoneticisi'));

// Statik route'lar (değişken parametre içermeyenler) - önce tanımlanmalı
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/products', getDashboardProducts);
router.get('/products/applications', getProductApplications);
router.get('/farms/applications', getFarmApplications);
router.get('/activity-log', getActivityLog);
router.get('/farmers/registered', getRegisteredFarmers);
router.get('/farms/logs/all', getAllFarmLogs);
router.post('/farms/sync-users', syncAllActiveFarmUsers);

// Özel route'lar (belge-eksik gibi) - değişken parametre içermeyen spesifik route'lar
router.post('/farms/belge-eksik/:id', sendBelgeEksikMessage);
router.post('/products/belge-eksik/:id', sendProductBelgeEksikMessage);

// Onay/Red route'ları
router.post('/products/approve/:id', approveProduct);
router.post('/products/reject/:id', rejectProduct);
router.post('/farms/approve/:id', approveFarm);
router.post('/farms/reject/:id', rejectFarm);
router.post('/farms/reject-and-delete/:id', rejectFarmAndDelete);

// Değişken parametre içeren route'lar - en son tanımlanmalı
router.get('/farms/:id/updated-documents', getUpdatedDocuments);
router.get('/farms/:id/logs', getFarmLogs);
router.get('/farmers/:id', getFarmerDetails);
router.put('/farms/status/:id', updateFarmApplicationStatus);
router.put('/documents/:belgeId', updateDocumentStatus);

module.exports = router;

