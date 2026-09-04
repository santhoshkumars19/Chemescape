const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All report routes require authentication
router.use(authMiddleware);

// --- Teacher and Admin only routes (Strict RBAC) ---
// GET /api/reports (Main reports query)
router.get('/', requireRole('TEACHER', 'ADMIN'), reportController.getAllActivityReports);

// GET /api/reports/stats (Dashboard metric cards)
router.get('/stats', requireRole('TEACHER', 'ADMIN'), reportController.getReportStats);

// GET /api/reports/excel (Excel .xlsx download)
router.get('/excel', requireRole('TEACHER', 'ADMIN'), reportController.exportExcelReport);

// GET /api/reports/user/:userId (Individual user activity history)
router.get('/user/:userId', requireRole('TEACHER', 'ADMIN'), reportController.getUserActivityHistory);

// --- Authenticated user activity logging ---
// POST /api/reports/activity
router.post('/activity', reportController.logUserActivity);

module.exports = router;
