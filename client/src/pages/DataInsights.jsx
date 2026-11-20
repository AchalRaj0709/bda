import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Lightbulb,
  TrendingUp,
  Award,
  Calendar,
  AlertTriangle,
  Percent,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyticsService } from '../services/api';
import { formatCurrency, formatCompactCurrency, formatNumber } from '../utils/formatters';

export default function DataInsights() {
  const { refreshTrigger, setAlert } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [insightsData, setInsightsData] = useState(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getInsights();
      setInsightsData(res.data);
    } catch (err) {
      console.error('Insights fetch error:', err);
      setAlert({
        type: 'error',
        message: `Failed to load computed insights: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [refreshTrigger]);

  if (loading) {
    return <LoadingSpinner message="Calculating business intelligence heuristics from MongoDB..." />;
  }

  const {
    topCategory = { name: 'N/A', sales: 0 },
    topRegion = { name: 'N/A', profit: 0 },
    peakMonth = { period: 'N/A', sales: 0 },
    overallMargin = '0.0%',
    totalSales = 0,
    totalProfit = 0,
    totalRecords = 0,
    lowMarginProducts = [],
    bulletInsights = [],
  } = insightsData || {};

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <span>Data Insights & Heuristic Intelligence</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated business rule evaluations computed on the backend (Zero third-party AI APIs required)
        </p>
      </div>

      {/* Primary 5 Business Question Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Question 1: Highest Revenue Category */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
              Question 1
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-medium">Which category generated highest revenue?</h4>
            <h3 className="text-2xl font-bold text-white mt-1">{topCategory.name}</h3>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Revenue: <span className="text-cyan-400 font-semibold">{formatCurrency(topCategory.sales)}</span>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Outperformed other categories across nationwide orders.
          </div>
        </div>

        {/* Question 2: Highest Profit Region */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
              Question 2
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-medium">Which region generated the highest profit?</h4>
            <h3 className="text-2xl font-bold text-white mt-1">{topRegion.name} Region</h3>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Net Profit: <span className="text-emerald-400 font-semibold">{formatCurrency(topRegion.profit)}</span>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Yields the best operational margins and return on inventory.
          </div>
        </div>

        {/* Question 3: Peak Sales Month */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider">
              Question 3
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-medium">What month recorded the highest sales?</h4>
            <h3 className="text-2xl font-bold text-white mt-1">{peakMonth.period}</h3>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Peak Sales: <span className="text-blue-400 font-semibold">{formatCurrency(peakMonth.sales)}</span>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Seasonal spike driven by holiday and promotional purchases.
          </div>
        </div>

        {/* Question 4: Overall Profit Margin */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-violet-400 uppercase tracking-wider">
              Question 4
            </span>
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-medium">What is the overall profit margin?</h4>
            <h3 className="text-2xl font-bold text-white mt-1">{overallMargin}</h3>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Net Profit: <span className="text-violet-400 font-semibold">{formatCurrency(totalProfit)}</span> of{' '}
              {formatCompactCurrency(totalSales)}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Formula: <code className="text-slate-300 font-mono">(Total Profit ÷ Total Sales) × 100</code>
          </div>
        </div>

        {/* Question 5: Low-Profit Margin Products Count */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 relative overflow-hidden md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
              Question 5
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-medium">Which products have low profit margins?</h4>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {lowMarginProducts.slice(0, 4).map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-200 truncate max-w-[170px]">{p.product}</p>
                    <p className="text-[10px] text-slate-500">{p.category}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    {p.margin}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Recommended action: Review supply chain costs or taper promotional discounts.
          </div>
        </div>
      </div>

      {/* Executive Summary & Strategic Takeaways */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">
            Automated Executive Takeaways & Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bulletInsights.map((insight, idx) => {
            const isWarning = insight.type === 'warning';
            const isPositive = insight.type === 'positive';
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isWarning
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : isPositive
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`mt-0.5 p-1 rounded-full ${
                      isWarning
                        ? 'text-amber-400 bg-amber-500/10'
                        : isPositive
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-cyan-400 bg-cyan-500/10'
                    }`}
                  >
                    {isWarning ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {insight.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

