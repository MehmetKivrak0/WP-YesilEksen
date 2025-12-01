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

router.get('/dashboard/stats', getDashboardStats);
router.get('/products/applications', getProductApplications);
router.get('/farms/applications', getFarmApplications);
router.post('/products/approve/:id', approveProduct);
router.post('/products/reject/:id', rejectProduct);
router.post('/farms/approve/:id', approveFarm);
router.post('/farms/reject/:id', rejectFarm);
router.post('/farms/reject-and-delete/:id', rejectFarmAndDelete);
// Özel route'ları genel route'lardan önce tanımla (belge-eksik, logs/all)
router.post('/farms/belge-eksik/:id', sendBelgeEksikMessage);
router.get('/farms/:id/updated-documents', getUpdatedDocuments);
router.get('/farms/logs/all', getAllFarmLogs);
router.get('/farms/:id/logs', getFarmLogs);
router.get('/farmers/registered', getRegisteredFarmers);
router.get('/farmers/:id', getFarmerDetails);
router.get('/dashboard/products', getDashboardProducts);
router.get('/activity-log', getActivityLog);
router.put('/documents/:belgeId', updateDocumentStatus);
router.put('/farms/status/:id', updateFarmApplicationStatus);
router.post('/farms/sync-users', syncAllActiveFarmUsers);

module.exports = router;

