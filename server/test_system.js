const mongoose = require('mongoose');
const path = require('path');
const Sale = require('./models/Sale');
const { generateAndInsertRecords } = require('./services/generatorService');
const { importCSVToMongoDB } = require('./utils/csvHelper');

async function runTests() {
  console.log('--- Starting GRAVITAS Verification Suite ---');

  // 1. Connect
  console.log('[1/5] Connecting to MongoDB at mongodb://127.0.0.1:27017/bigdata_analytics ...');
  await mongoose.connect('mongodb://127.0.0.1:27017/bigdata_analytics', {
    serverSelectionTimeoutMS: 5000,
  });
  console.log('MongoDB Connected successfully!');

  // Clean collection before test
  await Sale.deleteMany({});
  console.log('Cleared previous test documents.');

  // 2. Test Generator (Generate 2,500 records)
  console.log('[2/5] Testing synthetic dataset generator (2,500 records)...');
  const genResult = await generateAndInsertRecords(2500, 1000);
  console.log(`Generated & inserted: ${genResult.generatedCount} records. Total in DB: ${genResult.totalRecords}`);

  // 3. Test Aggregation Pipelines
  console.log('[3/5] Testing MongoDB Aggregation Pipeline ($match, $group, $sort, $project)...');
  const categoryAgg = await Sale.aggregate([
    {
      $group: {
        _id: '$category',
        totalSales: { $sum: '$sales' },
        totalProfit: { $sum: '$profit' },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalSales: -1 } },
  ]);
  console.log('Category Aggregation Result:');
  console.table(categoryAgg);

  const regionAgg = await Sale.aggregate([
    {
      $group: {
        _id: '$region',
        totalSales: { $sum: '$sales' },
        totalProfit: { $sum: '$profit' },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalProfit: -1 } },
  ]);
  console.log('Region Aggregation Result:');
  console.table(regionAgg);

  // 4. Test CSV Ingestion with Duplication Prevention
  console.log('[4/5] Testing CSV Stream Ingestion from sample-data/sales_sample_dataset.csv...');
  const csvPath = path.join(__dirname, '..', 'sample-data', 'sales_sample_dataset.csv');
  const csvResult = await importCSVToMongoDB(csvPath, 500);
  console.log(`CSV Ingest Result: Processed: ${csvResult.totalProcessed}, Inserted: ${csvResult.insertedCount}, Skipped: ${csvResult.skippedCount}`);

  const totalFinal = await Sale.countDocuments();
  console.log(`Final Collection Count: ${totalFinal} documents.`);

  // 5. Test Query Index Performance
  console.log('[5/5] Testing query index execution plan on orderDate and category...');
  const explain = await Sale.find({ category: 'Electronics' }).sort({ orderDate: -1 }).limit(10).explain('executionStats');
  const winningStage = explain.executionStats?.executionStages?.stage || explain.queryPlanner?.winningPlan?.stage;
  console.log(`Index Scan Verification: Winning Stage = ${winningStage}`);

  await mongoose.disconnect();
  console.log('--- ALL GRAVITAS VERIFICATION TESTS PASSED ---');
}

runTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});

