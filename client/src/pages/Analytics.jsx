import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  Filter,
  TrendingUp,
  AlertTriangle,
  Award,
  Layers,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyticsService } from '../services/api';
import { formatCurrency, formatCompactCurrency, formatNumber, formatPercent } from '../utils/formatters';

export default function Analytics() {
  const { refreshTrigger, setAlert } = useOutletContext();

  // Filters
  const [category, setCategory] = useState('All');
  const [region, setRegion] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Analytics states
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [profitAnalytics, setProfitAnalytics] = useState(null);
  const [activePipelineTab, setActivePipelineTab] = useState('category');
  const [showPipelineCode, setShowPipelineCode] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'All') params.category = category;
      if (region !== 'All') params.region = region;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [resCat, resRegion, resMonthly, resTop, resProfit] = await Promise.all([
        analyticsService.getCategoryAnalytics(params),
        analyticsService.getRegionAnalytics(params),
        analyticsService.getMonthlyAnalytics(params),
        analyticsService.getTopProducts(params),
        analyticsService.getProfitAnalytics(params),
      ]);

      setCategoryData(resCat.data || []);
      setRegionData(resRegion.data || []);
      setMonthlyData(resMonthly.data || []);
      setTopProducts(resTop.data || []);
      setProfitAnalytics(resProfit.data || null);
    } catch (err) {
      console.error('Analytics loading error:', err);
      setAlert({
        type: 'error',
        message: `Aggregation error: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [category, region, startDate, endDate, refreshTrigger]);

  const topCategory = categoryData[0] || null;
  const topRegion = [...regionData].sort((a, b) => b.totalProfit - a.totalProfit)[0] || null;

  // Pipeline execution query definitions
  const pipelineCodeSamples = {
    category: `// Category Aggregation Pipeline
[
  { 
    $match: { 
      ${category !== 'All' ? `category: "${category}",` : ''} 
      ${region !== 'All' ? `region: "${region}"` : ''} 
    } 
  },
  {
    $group: {
      _id: "$category",
      totalSales: { $sum: "$sales" },
      totalProfit: { $sum: "$profit" },
      avgSales: { $avg: "$sales" },
      orderCount: { $sum: 1 }
    }
  },
  {
    $project: {
      category: "$_id",
      totalSales: { $round: ["$totalSales", 2] },
      totalProfit: { $round: ["$totalProfit", 2] },
      profitMargin: { 
        $round: [{ $multiply: [{ $divide: ["$totalProfit", "$totalSales"] }, 100] }, 1] 
      }
    }
  },
  { $sort: { totalSales: -1 } }
]`,
    region: `// Region Profitability Pipeline
[
  { $match: { ...activeFilters } },
  {
    $group: {
      _id: "$region",
      totalSales: { $sum: "$sales" },
      totalProfit: { $sum: "$profit" },
      orderCount: { $sum: 1 }
    }
  },
  {
    $project: {
      region: "$_id",
      totalSales: { $round: ["$totalSales", 2] },
      totalProfit: { $round: ["$totalProfit", 2] }
    }
  },
  { $sort: { totalProfit: -1 } }
]`,
    monthly: `// Monthly Sales Trend Pipeline
[
  { $match: { ...activeFilters } },
  {
    $group: {
      _id: {
        year: { $year: "$orderDate" },
        month: { $month: "$orderDate" }
      },
      totalSales: { $sum: "$sales" },
      totalProfit: { $sum: "$profit" },
      orderCount: { $sum: 1 }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } }
]`,
    topProducts: `// Top 10 Products by Revenue Pipeline
[
  { $match: { ...activeFilters } },
  {
    $group: {
      _id: "$product",
      category: { $first: "$category" },
      totalSales: { $sum: "$sales" },
      totalProfit: { $sum: "$profit" },
      unitsSold: { $sum: "$quantity" }
    }
  },
  { $sort: { totalSales: -1 } },
  { $limit: 10 }
]`,
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Data Processing & Aggregation Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Multidimensional OLAP analysis implemented directly on MongoDB documents
          </p>
        </div>

        {/* Dynamic Multi-Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-1.5 px-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-300">Filters:</span>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Food">Food</option>
            <option value="Books">Books</option>
          </select>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
          </select>

          {/* Date Range Inputs */}
          <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
              title="Start Date"
            />
            <span className="text-slate-500 text-xs">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
              title="End Date"
            />
          </div>

          {(category !== 'All' || region !== 'All' || startDate || endDate) && (
            <button
              onClick={() => {
                setCategory('All');
                setRegion('All');
                setStartDate('');
                setEndDate('');
              }}
              className="px-2 py-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner message="Executing MongoDB Aggregation Pipeline stages ($match -> $group -> $sort)..." />}

      {/* Highlights / Calculated Champions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Highest-Selling Category
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              {topCategory ? topCategory.category : 'N/A'}
            </h3>
            <p className="text-xs text-cyan-400 font-mono mt-1">
              {topCategory ? formatCurrency(topCategory.totalSales) : '$0'} Revenue
            </p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Most Profitable Region
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              {topRegion ? topRegion.region : 'N/A'}
            </h3>
            <p className="text-xs text-emerald-400 font-mono mt-1">
              {topRegion ? formatCurrency(topRegion.totalProfit) : '$0'} Net Profit
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Low-Profit SKUs Flagged
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              {profitAnalytics ? profitAnalytics.lowProfitProducts.length : 0} Products
            </h3>
            <p className="text-xs text-amber-400 font-mono mt-1">Margin &lt; 10%</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Aggregation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Category Sales vs Profit Comparison</h3>
              <p className="text-[11px] text-slate-400">Aggregated via $group: "$category"</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              $group • $sum
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => formatCompactCurrency(val)}
                />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="totalSales" name="Sales" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalProfit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Region Breakdown Chart */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Regional Territory Performance</h3>
              <p className="text-[11px] text-slate-400">Aggregated via $group: "$region"</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              $group • $sum
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="region" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => formatCompactCurrency(val)}
                />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="totalSales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalProfit" name="Profit" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low-Profit Products Table Section */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Low-Profit Products Detection (Margin &lt; 10%)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Identifies items with razor-thin or negative operating margin using $project expressions
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            $cond • $divide
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Total Revenue</th>
                <th className="py-2.5 px-3 text-right">Net Profit</th>
                <th className="py-2.5 px-3 text-right">Profit Margin</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {profitAnalytics && profitAnalytics.lowProfitProducts.length > 0 ? (
                profitAnalytics.lowProfitProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/40">
                    <td className="py-2.5 px-3 font-medium text-slate-200">{p.product}</td>
                    <td className="py-2.5 px-3 text-slate-400">{p.category}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(p.totalSales)}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-semibold ${
                        p.totalProfit >= 0 ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(p.totalProfit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          p.margin < 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {p.margin}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[11px] text-slate-400">
                        {p.margin < 0 ? 'Loss Leader' : 'Thin Margin'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-500">
                    All products are currently operating at healthy profit margins.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive MongoDB Aggregation Pipeline Visualizer */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              MongoDB Aggregation Pipeline Query Inspector
            </h3>
          </div>
          <button
            onClick={() => setShowPipelineCode((prev) => !prev)}
            className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300"
          >
            <span>{showPipelineCode ? 'Hide Code' : 'Show Code'}</span>
            {showPipelineCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-xs text-slate-400">
          This panel displays the exact Mongoose Aggregation Pipeline executed by the backend server for these analytics queries.
        </p>

        {showPipelineCode && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'category', label: '1. Category Aggregation' },
                { id: 'region', label: '2. Regional Territory' },
                { id: 'monthly', label: '3. Monthly Sales Trends' },
                { id: 'topProducts', label: '4. Top 10 Products' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePipelineTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                    activePipelineTab === tab.id
                      ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
              <code>{pipelineCodeSamples[activePipelineTab]}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

