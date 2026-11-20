import React from 'react';
import { Menu, Sparkles, Trash2, Database, RefreshCw } from 'lucide-react';

export default function Navbar({
  onToggleSidebar,
  onOpenGenerateModal,
  onOpenClearModal,
  onRefresh,
  totalRecords = 0,
  loading = false,
}) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#080d1a]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20 font-medium">
            MERN Stack
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-medium tracking-wide">
            Big Data Storage & Analysis
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Record count indicator */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Total in DB:</span>
          <span className="font-bold text-white font-mono">
            {totalRecords.toLocaleString()}
          </span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        )}

        {/* Quick Generate Action */}
        <button
          onClick={onOpenGenerateModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-medium shadow-md shadow-cyan-500/10 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Generate</span> Data
        </button>

        {/* Clear Data Action */}
        <button
          onClick={onOpenClearModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors"
          title="Clear all stored dataset in MongoDB"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
}

