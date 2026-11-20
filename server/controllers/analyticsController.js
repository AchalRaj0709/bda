const Sale = require('../models/Sale');

/**
 * Helper to build a $match query from request query params
 */
const buildMatchStage = (queryParams) => {
  const { category, region, startDate, endDate } = queryParams;
  const match = {};

  if (category && category !== 'All') {
    match.category = category;
  }

  if (region && region !== 'All') {
    match.region = region;
  }

  if (startDate || endDate) {
    match.orderDate = {};
    if (startDate) match.orderDate.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.orderDate.$lte = end;
    }
  }

  return match;
};

/**
 * @desc   Get KPI Overview (Total records, sales, profit, avg order value, unique products, regions)
 * @route  GET /api/analytics/overview
 */
const getOverview = async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalSales: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          totalQuantity: { $sum: '$quantity' },
          avgOrderValue: { $avg: '$sales' },
          uniqueProducts: { $addToSet: '$product' },
          uniqueRegions: { $addToSet: '$region' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRecords: 1,
          totalSales: { $round: ['$totalSales', 2] },
          totalProfit: { $round: ['$profit', 2] },
          totalProfit: { $round: ['$totalProfit', 2] },
          avgOrderValue: { $round: ['$avgOrderValue', 2] },
          totalProducts: { $size: '$uniqueProducts' },
          totalRegions: { $size: '$uniqueRegions' },
        },
      },
    ];

    const results = await Sale.aggregate(pipeline);
    const data = results[0] || {
      totalRecords: 0,
      totalSales: 0,
      totalProfit: 0,
      avgOrderValue: 0,
      totalProducts: 0,
      totalRegions: 0,
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get Sales & Profit by Category
 * @route  GET /api/analytics/category
 */
const getCategoryAnalytics = async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$category',
          totalSales: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          orderCount: { $sum: 1 },
          avgSales: { $avg: '$sales' },
        },
      },
      {
        $project: {
          category: '$_id',
          _id: 0,
          totalSales: { $round: ['$totalSales', 2] },
          totalProfit: { $round: ['$totalProfit', 2] },
          orderCount: 1,
          avgSales: { $round: ['$avgSales', 2] },
          profitMargin: {
            $cond: [
              { $gt: ['$totalSales', 0] },
              { $round: [{ $multiply: [{ $divide: ['$totalProfit', '$totalSales'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { totalSales: -1 } },
    ];

    const data = await Sale.aggregate(pipeline);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get Sales & Profit by Region
 * @route  GET /api/analytics/region
 */
const getRegionAnalytics = async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$region',
          totalSales: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          region: '$_id',
          _id: 0,
          totalSales: { $round: ['$totalSales', 2] },
          totalProfit: { $round: ['$totalProfit', 2] },
          orderCount: 1,
          profitMargin: {
            $cond: [
              { $gt: ['$totalSales', 0] },
              { $round: [{ $multiply: [{ $divide: ['$totalProfit', '$totalSales'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { totalSales: -1 } },
    ];

    const data = await Sale.aggregate(pipeline);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get Monthly Sales & Profit Trend
 * @route  GET /api/analytics/monthly
 */
const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' },
          },
          totalSales: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' },
                ],
              },
            ],
          },
          totalSales: { $round: ['$totalSales', 2] },
          totalProfit: { $round: ['$totalProfit', 2] },
          orderCount: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ];

    const data = await Sale.aggregate(pipeline);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get Top 10 Products by Revenue
 * @route  GET /api/analytics/top-products
 */
const getTopProducts = async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const limit = parseInt(req.query.limit, 10) || 10;

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$product',
          category: { $first: '$category' },
          totalSales: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          unitsSold: { $sum: '$quantity' },
          orders: { $sum: 1 },
        },
      },
      {
        $project: {
          product: '$_id',
          category: 1,
          _id: 0,
          totalSales: { $round: ['$totalSales', 2] },
          totalProfit: { $round: ['$totalProfit', 2] },
          unitsSold: 1,
          orders: 1,
          margin: {
            $cond: [
              { $gt: ['$totalSales', 0] },
              { $round: [{ $multiply: [{ $divide: ['$totalProfit', '$totalSales'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: limit },
    ];

    const data = await Sale.aggregate(pipeline);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get Profit & Margin Analytics (including low-profit products)
 * @route  GET /api/analytics/profit
 */
const getProfitAnalytics = async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);

    // Group by product to identify low-profit or loss-making products
    const productMarginsPipeline = [
      { $match: match },
      {
        $group: {
          _id: '$product',
          category: { $first: '$category' },
          totalSales: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          orders: { $sum: 1 },
        },
      },
      {
        $project: {
          product: '$_id',
          category: 1,
          _id: 0,
          totalSales: { $round: ['$totalSales', 2] },
          totalProfit: { $round: ['$totalProfit', 2] },
          margin: {
            $cond: [
              { $gt: ['$totalSales', 0] },
              { $round: [{ $multiply: [{ $divide: ['$totalProfit', '$totalSales'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { margin: 1 } },
    ];

    const allProducts = await Sale.aggregate(productMarginsPipeline);
    const lowProfitProducts = allProducts.filter((p) => p.margin < 10).slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        lowProfitProducts,
        totalAnalyzed: allProducts.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Generate Data Insights (Calculated business metrics, best category, best region, peak month)
 * @route  GET /api/analytics/insights
 */
const getInsights = async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);

    const [categoryStats, regionStats, monthlyStats, overallStats, lowMarginProducts] = await Promise.all([
      Sale.aggregate([
        { $match: match },
        { $group: { _id: '$category', sales: { $sum: '$sales' }, profit: { $sum: '$profit' } } },
        { $sort: { sales: -1 } },
      ]),
      Sale.aggregate([
        { $match: match },
        { $group: { _id: '$region', profit: { $sum: '$profit' }, sales: { $sum: '$sales' } } },
        { $sort: { profit: -1 } },
      ]),
      Sale.aggregate([
        { $match: match },
        {
          $group: {
            _id: { y: { $year: '$orderDate' }, m: { $month: '$orderDate' } },
            sales: { $sum: '$sales' },
            profit: { $sum: '$profit' },
          },
        },
        { $sort: { sales: -1 } },
        { $limit: 1 },
      ]),
      Sale.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$sales' },
            totalProfit: { $sum: '$profit' },
            totalRecords: { $sum: 1 },
          },
        },
      ]),
      Sale.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$product',
            category: { $first: '$category' },
            sales: { $sum: '$sales' },
            profit: { $sum: '$profit' },
          },
        },
        {
          $project: {
            product: '$_id',
            category: 1,
            margin: {
              $cond: [
                { $gt: ['$sales', 0] },
                { $multiply: [{ $divide: ['$profit', '$sales'] }, 100] },
                0,
              ],
            },
            sales: 1,
            profit: 1,
          },
        },
        { $sort: { margin: 1 } },
        { $limit: 5 },
      ]),
    ]);

    const overall = overallStats[0] || { totalSales: 0, totalProfit: 0, totalRecords: 0 };
    const overallMargin = overall.totalSales > 0
      ? ((overall.totalProfit / overall.totalSales) * 100).toFixed(1)
      : 0;

    const topCategory = categoryStats[0]
      ? { name: categoryStats[0]._id, sales: categoryStats[0].sales.toFixed(2) }
      : { name: 'N/A', sales: 0 };

    const topRegion = regionStats[0]
      ? { name: regionStats[0]._id, profit: regionStats[0].profit.toFixed(2) }
      : { name: 'N/A', profit: 0 };

    const peakMonth = monthlyStats[0]
      ? {
          period: `${monthlyStats[0]._id.y}-${monthlyStats[0]._id.m.toString().padStart(2, '0')}`,
          sales: monthlyStats[0].sales.toFixed(2),
        }
      : { period: 'N/A', sales: 0 };

    // Format low profit products
    const lowMarginList = lowMarginProducts.map((p) => ({
      product: p.product,
      category: p.category,
      margin: p.margin.toFixed(1) + '%',
      profit: p.profit.toFixed(2),
      sales: p.sales.toFixed(2),
    }));

    // Auto-generate key bullet insights
    const bulletInsights = [
      {
        type: 'positive',
        title: 'Top Performing Category',
        detail: `${topCategory.name} generated the highest revenue totaling $${Number(topCategory.sales).toLocaleString()}.`,
      },
      {
        type: 'positive',
        title: 'Most Profitable Territory',
        detail: `The ${topRegion.name} region delivered maximum net profitability at $${Number(topRegion.profit).toLocaleString()}.`,
      },
      {
        type: 'neutral',
        title: 'Peak Sales Period',
        detail: `Highest monthly volume occurred in ${peakMonth.period} reaching $${Number(peakMonth.sales).toLocaleString()}.`,
      },
      {
        type: overallMargin >= 20 ? 'positive' : 'warning',
        title: 'Overall Operating Profit Margin',
        detail: `Global portfolio margin stands at ${overallMargin}%, reflecting ${overallMargin >= 20 ? 'healthy' : 'tight'} pricing power.`,
      },
      {
        type: 'warning',
        title: 'Products Needing Margin Attention',
        detail: `${lowMarginList.length} products have compressed profit margins (< 10%) due to promotional discounting or high fulfillment costs.`,
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        topCategory,
        topRegion,
        peakMonth,
        overallMargin: `${overallMargin}%`,
        totalSales: overall.totalSales,
        totalProfit: overall.totalProfit,
        totalRecords: overall.totalRecords,
        lowMarginProducts: lowMarginList,
        bulletInsights,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getCategoryAnalytics,
  getRegionAnalytics,
  getMonthlyAnalytics,
  getTopProducts,
  getProfitAnalytics,
  getInsights,
};

