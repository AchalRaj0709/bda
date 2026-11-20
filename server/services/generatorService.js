const fs = require('fs');
const path = require('path');
const Sale = require('../models/Sale');

const CATEGORIES = {
  Electronics: [
    { name: '4K Ultra HD Smart TV', basePrice: 650, margin: 0.18 },
    { name: 'Wireless Noise-Canceling Headphones', basePrice: 199, margin: 0.28 },
    { name: 'Gaming Laptop Pro 16"', basePrice: 1450, margin: 0.15 },
    { name: 'Smartwatch Fitness Tracker', basePrice: 120, margin: 0.32 },
    { name: 'Bluetooth Portable Speaker', basePrice: 65, margin: 0.25 },
    { name: 'Mechanical Keyboard RGB', basePrice: 85, margin: 0.30 },
    { name: 'Wireless Ergonomic Mouse', basePrice: 45, margin: 0.35 },
    { name: 'Tablet 10-inch WiFi', basePrice: 320, margin: 0.20 },
    { name: 'USB-C Fast Charging Hub', basePrice: 35, margin: 0.40 },
    { name: 'Noise-Isolating Earbuds', basePrice: 49, margin: 0.30 },
  ],
  Furniture: [
    { name: 'Ergonomic Office Chair', basePrice: 220, margin: 0.22 },
    { name: 'Electric Standing Desk', basePrice: 450, margin: 0.19 },
    { name: 'Solid Oak Dining Table', basePrice: 780, margin: 0.16 },
    { name: 'Memory Foam Queen Mattress', basePrice: 550, margin: 0.24 },
    { name: 'Mid-Century Modern Sofa', basePrice: 890, margin: 0.14 },
    { name: '5-Tier Bookshelf Storage', basePrice: 110, margin: 0.26 },
    { name: 'Wooden Coffee Table', basePrice: 140, margin: 0.25 },
    { name: 'Adjustable Recliner Armchair', basePrice: 380, margin: 0.18 },
  ],
  Clothing: [
    { name: 'Organic Cotton Crewneck T-Shirt', basePrice: 24, margin: 0.45 },
    { name: 'Slim-Fit Stretch Denim Jeans', basePrice: 58, margin: 0.40 },
    { name: 'Waterproof Winter Parka Jacket', basePrice: 180, margin: 0.32 },
    { name: 'Breathable Running Athletic Shoes', basePrice: 95, margin: 0.35 },
    { name: 'Wool Blend Knit Sweater', basePrice: 70, margin: 0.38 },
    { name: 'Casual Linen Button-Down Shirt', basePrice: 48, margin: 0.42 },
    { name: 'Performance Fleece Hoodie', basePrice: 52, margin: 0.36 },
  ],
  Food: [
    { name: 'Single-Origin Colombian Coffee Beans', basePrice: 22, margin: 0.28 },
    { name: 'Organic Cold-Pressed Olive Oil 1L', basePrice: 19, margin: 0.25 },
    { name: 'Artisanal Dark Chocolate Box', basePrice: 16, margin: 0.34 },
    { name: 'Raw Clover Honey 500g', basePrice: 14, margin: 0.30 },
    { name: 'Organic Rolled Oats Granola 1kg', basePrice: 12, margin: 0.32 },
    { name: 'Himalayan Pink Rock Salt Grinder', basePrice: 9, margin: 0.40 },
    { name: 'Matcha Green Tea Powder 100g', basePrice: 26, margin: 0.35 },
  ],
  Books: [
    { name: 'Designing Data-Intensive Applications', basePrice: 45, margin: 0.35 },
    { name: 'Clean Code: Handbook of Agile Craft', basePrice: 42, margin: 0.38 },
    { name: 'Introduction to Algorithms (CLRS)', basePrice: 85, margin: 0.25 },
    { name: 'Deep Learning with Python', basePrice: 50, margin: 0.32 },
    { name: 'System Design Interview Guide', basePrice: 38, margin: 0.40 },
    { name: 'The Pragmatic Programmer 20th Ed', basePrice: 44, margin: 0.36 },
    { name: 'Database System Concepts', basePrice: 75, margin: 0.28 },
  ],
};

const REGIONS = ['North', 'South', 'East', 'West', 'Central'];

/**
 * Generate a randomized realistic sale object
 */
const generateRandomSale = (index, timestampBase = null) => {
  const categoriesKeys = Object.keys(CATEGORIES);
  const category = categoriesKeys[Math.floor(Math.random() * categoriesKeys.length)];
  const products = CATEGORIES[category];
  const prodObj = products[Math.floor(Math.random() * products.length)];
  const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];

  // Random quantity between 1 and 8
  const quantity = Math.floor(Math.random() * 7) + 1;

  // Price variance (+- 12%)
  const priceVariance = (Math.random() * 0.24 - 0.12);
  const unitPrice = prodObj.basePrice * (1 + priceVariance);
  const sales = parseFloat((unitPrice * quantity).toFixed(2));

  // Margin variance (+- 8%), occasionally slight loss on discount promotions (5% chance)
  const isLoss = Math.random() < 0.05;
  const marginVariance = (Math.random() * 0.16 - 0.08);
  const effectiveMargin = isLoss ? -0.06 : (prodObj.margin + marginVariance);
  const profit = parseFloat((sales * effectiveMargin).toFixed(2));

  // Date within the last 2 years (2025 - 2026)
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 700);
  const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${index.toString().padStart(6, '0')}`;

  return {
    orderId,
    product: prodObj.name,
    category,
    region,
    quantity,
    sales,
    profit,
    orderDate,
  };
};

/**
 * Generate N records directly into MongoDB
 */
const generateAndInsertRecords = async (count = 10000, batchSize = 2000) => {
  const existingCount = await Sale.countDocuments();
  let inserted = 0;

  for (let i = 0; i < count; i += batchSize) {
    const currentBatchSize = Math.min(batchSize, count - i);
    const batch = [];
    for (let j = 0; j < currentBatchSize; j++) {
      batch.push(generateRandomSale(existingCount + i + j + 1));
    }
    await Sale.insertMany(batch, { ordered: false });
    inserted += currentBatchSize;
  }

  const newTotal = await Sale.countDocuments();
  return {
    generatedCount: count,
    totalRecords: newTotal,
  };
};

/**
 * Generate a CSV file for download/sample testing
 */
const generateSampleCSVFile = (filePath, count = 2000) => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath, { encoding: 'utf8' });
    writeStream.write('orderId,product,category,region,quantity,sales,profit,orderDate\n');

    for (let i = 1; i <= count; i++) {
      const sale = generateRandomSale(i);
      const isoDate = sale.orderDate.toISOString().split('T')[0];
      // escape product name if it has commas
      const escapedProduct = sale.product.includes(',') ? `"${sale.product}"` : sale.product;
      const line = `${sale.orderId},${escapedProduct},${sale.category},${sale.region},${sale.quantity},${sale.sales},${sale.profit},${isoDate}\n`;
      writeStream.write(line);
    }

    writeStream.end();
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', (err) => reject(err));
  });
};

module.exports = {
  CATEGORIES,
  REGIONS,
  generateRandomSale,
  generateAndInsertRecords,
  generateSampleCSVFile,
};

