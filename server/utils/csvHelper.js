const fs = require('fs');
const csv = require('csv-parser');
const Sale = require('../models/Sale');

/**
 * Preview first N rows of a CSV file
 */
const previewCSV = (filePath, limit = 10) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = fs.createReadStream(filePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim()
      }))
      .on('data', (data) => {
        if (results.length < limit) {
          results.push(data);
        } else {
          stream.destroy();
          resolve(results);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

/**
 * Clean and normalize a CSV record
 */
const cleanRecord = (row) => {
  // Normalize header keys (case-insensitive mapping)
  const normalized = {};
  for (const key of Object.keys(row)) {
    const cleanKey = key.trim().toLowerCase();
    normalized[cleanKey] = row[key];
  }

  const orderId = normalized.orderid || normalized.order_id || normalized.id || normalized['order id'];
  const product = normalized.product || normalized.productname || normalized['product name'];
  const category = normalized.category;
  const region = normalized.region;
  const quantity = parseInt(normalized.quantity || normalized.qty, 10);
  const sales = parseFloat(normalized.sales || normalized.revenue || normalized.amount);
  const profit = parseFloat(normalized.profit || normalized.margin);
  const rawDate = normalized.orderdate || normalized.order_date || normalized.date || normalized['order date'];

  if (!orderId || !product || !category || !region || isNaN(quantity) || isNaN(sales) || isNaN(profit)) {
    return null;
  }

  const orderDate = rawDate ? new Date(rawDate) : new Date();

  return {
    orderId: String(orderId).trim(),
    product: String(product).trim(),
    category: String(category).trim(),
    region: String(region).trim(),
    quantity: Math.max(1, quantity),
    sales: parseFloat(sales.toFixed(2)),
    profit: parseFloat(profit.toFixed(2)),
    orderDate: isNaN(orderDate.getTime()) ? new Date() : orderDate,
  };
};

/**
 * Stream & batch import CSV records into MongoDB with bulkWrite
 */
const importCSVToMongoDB = (filePath, batchSize = 1000) => {
  return new Promise((resolve, reject) => {
    let totalProcessed = 0;
    let insertedCount = 0;
    let skippedCount = 0;
    let batch = [];
    let isProcessing = false;

    const stream = fs.createReadStream(filePath).pipe(
      csv({
        mapHeaders: ({ header }) => header.trim(),
      })
    );

    const flushBatch = async () => {
      if (batch.length === 0) return;
      isProcessing = true;
      stream.pause();

      const ops = batch.map((doc) => ({
        updateOne: {
          filter: { orderId: doc.orderId },
          update: { $setOnInsert: doc },
          upsert: true,
        },
      }));

      try {
        const result = await Sale.bulkWrite(ops, { ordered: false });
        insertedCount += result.upsertedCount || 0;
        skippedCount += (batch.length - (result.upsertedCount || 0));
        batch = [];
      } catch (err) {
        // If some succeeded and some failed due to unique key
        if (err.result) {
          insertedCount += err.result.nUpserted || 0;
          skippedCount += batch.length - (err.result.nUpserted || 0);
        } else {
          console.error('[BulkWrite Warning]', err.message);
        }
        batch = [];
      } finally {
        isProcessing = false;
        stream.resume();
      }
    };

    stream.on('data', async (row) => {
      totalProcessed++;
      const cleaned = cleanRecord(row);
      if (cleaned) {
        batch.push(cleaned);
      } else {
        skippedCount++;
      }

      if (batch.length >= batchSize && !isProcessing) {
        await flushBatch();
      }
    });

    stream.on('end', async () => {
      try {
        if (batch.length > 0) {
          await flushBatch();
        }
        resolve({
          totalProcessed,
          insertedCount,
          skippedCount,
        });
      } catch (err) {
        reject(err);
      }
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
};

module.exports = {
  previewCSV,
  cleanRecord,
  importCSVToMongoDB,
};

