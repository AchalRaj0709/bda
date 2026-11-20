const express = require('express');
const router = express.Router();
const {
  getOverview,
  getCategoryAnalytics,
  getRegionAnalytics,
  getMonthlyAnalytics,
  getTopProducts,
  getProfitAnalytics,
  getInsights,
} = require('../controllers/analyticsController');

router.get('/overview', getOverview);
router.get('/category', getCategoryAnalytics);
router.get('/region', getRegionAnalytics);
router.get('/monthly', getMonthlyAnalytics);
router.get('/top-products', getTopProducts);
router.get('/profit', getProfitAnalytics);
router.get('/insights', getInsights);

module.exports = router;

