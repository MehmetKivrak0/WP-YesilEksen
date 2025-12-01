const express = require('express');
const router = express.Router();

const {
    getDashboardStats,
    getCompanyApplications,
    approveCompany,
    rejectCompany,
    getRegisteredCompanies,
    getDashboardProducts,
    getActivityLog,
    getCompanyLogs,
    getAllCompanyLogs,
    updateDocumentStatus,
    updateCompany
} = require('../controllers/sanayiController');
const { auth, checkRole } = require('../middleware/auth');

router.use(auth);
router.use(checkRole('sanayi_yoneticisi'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/companies/applications', getCompanyApplications);
router.get('/companies/logs/all', getAllCompanyLogs);
router.post('/companies/approve/:id', approveCompany);
router.post('/companies/reject/:id', rejectCompany);
router.get('/companies/registered', getRegisteredCompanies);
router.put('/companies/:id', updateCompany);
router.get('/dashboard/products', getDashboardProducts);
router.get('/activity-log', getActivityLog);
router.get('/companies/:id/logs', getCompanyLogs);
router.put('/documents/:belgeId', updateDocumentStatus);

module.exports = router;

