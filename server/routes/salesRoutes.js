const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadSalesCSV,
  generateData,
  getSales,
  getSaleById,
  deleteSale,
  deleteAllSales,
  exportSalesCSV,
} = require('../controllers/salesController');

// Export CSV endpoint
router.get('/export', exportSalesCSV);

// Generate synthetic data
router.post('/generate', generateData);

// Upload CSV dataset
router.post('/upload', upload.single('file'), uploadSalesCSV);

// List all sales (paginated, filtered, sorted)
router.get('/', getSales);

// Delete all sales
router.delete('/', deleteAllSales);

// Single sale operations
router.get('/:id', getSaleById);
router.delete('/:id', deleteSale);

module.exports = router;

