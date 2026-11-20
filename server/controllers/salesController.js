const fs = require('fs');
const Sale = require('../models/Sale');
const { previewCSV, importCSVToMongoDB } = require('../utils/csvHelper');
const { generateAndInsertRecords } = require('../services/generatorService');

/**
 * @desc   Upload and parse CSV dataset
 * @route  POST /api/sales/upload
 */
const uploadSalesCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    const filePath = req.file.path;
    const isPreview = req.query.preview === 'true';

    if (isPreview) {
      const previewRows = await previewCSV(filePath, 10);
      return res.status(200).json({
        success: true,
        preview: previewRows,
        filePath: req.file.filename,
      });
    }

    const startTime = Date.now();
    const result = await importCSVToMongoDB(filePath);
    const durationMs = Date.now() - startTime;

    // Clean up uploaded temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to remove temp upload:', err);
    });

    const totalInDB = await Sale.countDocuments();

    res.status(200).json({
      success: true,
      message: `Successfully processed ${result.totalProcessed} records.`,
      stats: {
        totalProcessed: result.totalProcessed,
        insertedCount: result.insertedCount,
        skippedCount: result.skippedCount,
        totalInDB,
        durationSeconds: (durationMs / 1000).toFixed(2),
      },
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * @desc   Generate synthetic dataset
 * @route  POST /api/sales/generate
 */
const generateData = async (req, res, next) => {
  try {
    const count = parseInt(req.body.count, 10) || 10000;
    if (count <= 0 || count > 50000) {
      return res.status(400).json({
        success: false,
        message: 'Count must be between 1 and 50,000 records',
      });
    }

    const startTime = Date.now();
    const result = await generateAndInsertRecords(count);
    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

    res.status(201).json({
      success: true,
      message: `Successfully generated and stored ${result.generatedCount.toLocaleString()} records in MongoDB.`,
      data: {
        generatedCount: result.generatedCount,
        totalRecords: result.totalRecords,
        durationSeconds,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get paginated, filtered, and sorted sales records
 * @route  GET /api/sales
 */
const getSales = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, category, region, startDate, endDate, sortBy = 'orderDate', order = 'desc' } = req.query;

    const query = {};

    if (search) {
      query.product = { $regex: search.trim(), $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (region && region !== 'All') {
      query.region = region;
    }

    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.orderDate.$lte = end;
      }
    }

    const validSortFields = ['sales', 'profit', 'quantity', 'orderDate', 'product', 'category', 'region'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'orderDate';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder };

    const [records, total] = await Promise.all([
      Sale.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Sale.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single sale by ID
 * @route  GET /api/sales/:id
 */
const getSaleById = async (req, res, next) => {
  try {
    const record = await Sale.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete single sale by ID
 * @route  DELETE /api/sales/:id
 */
const deleteSale = async (req, res, next) => {
  try {
    const deleted = await Sale.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete all sales records
 * @route  DELETE /api/sales
 */
const deleteAllSales = async (req, res, next) => {
  try {
    const result = await Sale.deleteMany({});
    res.status(200).json({
      success: true,
      message: `All records cleared successfully. Removed ${result.deletedCount} documents.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Export filtered sales records as CSV
 * @route  GET /api/sales/export
 */
const exportSalesCSV = async (req, res, next) => {
  try {
    const { search, category, region, startDate, endDate } = req.query;
    const query = {};

    if (search) query.product = { $regex: search.trim(), $options: 'i' };
    if (category && category !== 'All') query.category = category;
    if (region && region !== 'All') query.region = region;
    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.orderDate.$lte = end;
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=sales_export_${Date.now()}.csv`);

    res.write('orderId,product,category,region,quantity,sales,profit,orderDate\n');

    const cursor = Sale.find(query).sort({ orderDate: -1 }).cursor();

    cursor.on('data', (doc) => {
      const isoDate = doc.orderDate ? doc.orderDate.toISOString().split('T')[0] : '';
      const prod = doc.product.includes(',') ? `"${doc.product}"` : doc.product;
      res.write(`${doc.orderId},${prod},${doc.category},${doc.region},${doc.quantity},${doc.sales},${doc.profit},${isoDate}\n`);
    });

    cursor.on('end', () => {
      res.end();
    });

    cursor.on('error', (err) => {
      if (!res.headersSent) {
        next(err);
      } else {
        res.end();
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadSalesCSV,
  generateData,
  getSales,
  getSaleById,
  deleteSale,
  deleteAllSales,
  exportSalesCSV,
};

