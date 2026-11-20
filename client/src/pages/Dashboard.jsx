import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Package,
  Globe,
  ShoppingCart,
  Database,
  BarChart,
  Calendar,
  Sparkles,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
} from 'recharts';
import KPICard from '../components/KPICard';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyticsService } from '../services/api';
import { formatCurrency, formatCompactCurrency, formatNumber, formatPercent } from '../utils/formatters';

const PIE_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

export default function Dashboard() {
  const { refreshTrigger, setAlert } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedRegion !== 'All') params.region = selectedRegion;

      const [resOverview, resMonthly, resCat, resRegion, resTop] = await Promise.all([
        analyticsService.getOverview(params),
        analyticsService.getMonthlyAnalytics(params),
        analyticsService.getCategoryAnalytics(params),
        analyticsService.getRegionAnalytics(params),
        analyticsService.getTopProducts(params),
      ]);

      setOverview(resOverview.data);
      setMonthlyData(resMonthly.data || []);
      setCategoryData(resCat.data || []);
      setRegionData(resRegion.data || []);
      setTopProducts(resTop.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setAlert({
        type: 'error',
        message: `Failed to fetch analytics from MongoDB: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger, selectedCategory, selectedRegion]);

  const isEmpty = !loading && (!overview || overview.totalRecords === 0);

  // Custom tooltips for recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs">
          <p className="font-semibold text-slate-200 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="flex items-center space-x-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="capitalize">{entry.name}:</span>
              <span className="font-mono font-bold text-white">
                {entry.name.toLowerCase().includes('profit') || entry.name.toLowerCase().includes('sales') || entry.name.toLowerCase().includes('revenue')
                  ? formatCurrency(entry.value)
                  : formatNumber(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Executive Analytics Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time big data processing & aggregations powered by MongoDB Aggregation Pipeline
          </p>
        </div>

        {/* Global Dashboard Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/70 p-2 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-1.5 px-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">Filter:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Food">Food</option>
            <option value="Books">Books</option>
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
          </select>
        </div>
      </div>

      {loading && <LoadingSpinner message="Calculating real-time aggregations from MongoDB..." />}

      {/* Empty State Banner */}
      {isEmpty && (
        <div className="glass-card rounded-2xl p-10 text-center space-y-4 max-w-xl mx-auto border-dashed border-slate-700">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">No Dataset Detected in MongoDB</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Your sales collection is currently empty. Generate sample records or upload a CSV file to trigger real-time MongoDB aggregations.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/data"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all"
            >
              Go to Data Management
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      {!isEmpty && overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard
            title="Total Records"
            value={formatNumber(overview.totalRecords)}
            icon={Database}
            gradient="from-cyan-500/20 to-blue-500/5"
            borderGlow="hover:border-cyan-500/40"
            iconColor="text-cyan-400"
            iconBg="bg-cyan-500/10 border-cyan-500/20"
            subtitle="Indexed Collection"
            badgeText="In DB"
            badgeType="positive"
          />

          <KPICard
            title="Total Sales"
            value={formatCompactCurrency(overview.totalSales)}
            icon={DollarSign}
            gradient="from-blue-500/20 to-indigo-500/5"
            borderGlow="hover:border-blue-500/40"
            iconColor="text-blue-400"
            iconBg="bg-blue-500/10 border-blue-500/20"
            subtitle="Cumulative Gross"
            badgeText="Revenue"
            badgeType="positive"
          />

          <KPICard
            title="Total Profit"
            value={formatCompactCurrency(overview.totalProfit)}
            icon={TrendingUp}
            gradient="from-emerald-500/20 to-teal-500/5"
            borderGlow="hover:border-emerald-500/40"
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10 border-emerald-500/20"
            subtitle={`Margin: ${overview.totalSales > 0 ? ((overview.totalProfit / overview.totalSales) * 100).toFixed(1) : 0}%`}
            badgeText="Net Profit"
            badgeType="positive"
          />

          <KPICard
            title="Avg Order Value"
            value={formatCurrency(overview.avgOrderValue)}
            icon={ShoppingCart}
            gradient="from-violet-500/20 to-purple-500/5"
            borderGlow="hover:border-violet-500/40"
            iconColor="text-violet-400"
            iconBg="bg-violet-500/10 border-violet-500/20"
            subtitle="Per Transaction"
            badgeText="Ticket"
            badgeType="neutral"
          />

          <KPICard
            title="Total Products"
            value={formatNumber(overview.totalProducts)}
            icon={Package}
            gradient="from-amber-500/20 to-orange-500/5"
            borderGlow="hover:border-amber-500/40"
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10 border-amber-500/20"
            subtitle="Distinct Catalog SKUs"
            badgeText="Unique"
            badgeType="neutral"
          />

          <KPICard
            title="No. of Regions"
            value={formatNumber(overview.totalRegions)}
            icon={Globe}
            gradient="from-rose-500/20 to-pink-500/5"
            borderGlow="hover:border-rose-500/40"
            iconColor="text-rose-400"
            iconBg="bg-rose-500/10 border-rose-500/20"
            subtitle="Global Territories"
            badgeText="Zones"
            badgeType="neutral"
          />
        </div>
      )}

      {/* Visualizations Section */}
      {!isEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Monthly Sales Trend (Line Chart) */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">1. Monthly Sales & Profit Trend</h4>
                <p className="text-[11px] text-slate-400">Aggregated with $group by year & month</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                LineChart
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => formatCompactCurrency(val)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="totalSales"
                    name="Sales"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ fill: '#06b6d4', r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalProfit"
                    name="Profit"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Sales by Category (Pie Chart) */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">2. Sales by Category Distribution</h4>
                <p className="text-[11px] text-slate-400">Category revenue share via $group & $sum</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PieChart
              </span>
            </div>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Pie
                    data={categoryData}
                    dataKey="totalSales"
                    nameKey="category"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Sales by Region (Bar Chart) */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">3. Sales Revenue by Region</h4>
                <p className="text-[11px] text-slate-400">Territory performance benchmark</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                BarChart
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={regionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="region" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => formatCompactCurrency(val)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="totalSales" name="Sales Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Profit by Category (Bar Chart) */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">4. Net Profit by Category</h4>
                <p className="text-[11px] text-slate-400">Profitability comparison across segments</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                BarChart
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => formatCompactCurrency(val)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="totalProfit" name="Net Profit" fill="#10b981" radius={[6, 6, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Top 10 Products by Revenue (Horizontal Bar Chart) */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">5. Top 10 Products by Gross Revenue</h4>
                <p className="text-[11px] text-slate-400">
                  Calculated with $group by product, $sort totalSales: -1, and $limit: 10
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Horizontal BarChart
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 90, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => formatCompactCurrency(val)}
                  />
                  <YAxis
                    type="category"
                    dataKey="product"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    width={180}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar
                    dataKey="totalSales"
                    name="Revenue ($)"
                    fill="#06b6d4"
                    radius={[0, 6, 6, 0]}
                  />
                  <Bar
                    dataKey="totalProfit"
                    name="Profit ($)"
                    fill="#3b82f6"
                    radius={[0, 6, 6, 0]}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

