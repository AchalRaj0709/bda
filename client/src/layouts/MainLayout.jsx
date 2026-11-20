import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { salesService, systemService } from '../services/api';
import { Sparkles, Trash2, Database, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState('connected');
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Modal states
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(10000);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Sync state trigger to refresh active page
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const location = useLocation();

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const res = await systemService.getHealth();
      if (res.database && res.database.connected) {
        setDbStatus('connected');
      } else {
        setDbStatus('disconnected');
      }

      // Also get record count from sales
      const salesRes = await salesService.getSales({ limit: 1 });
      setTotalRecords(salesRes.pagination?.total || 0);
    } catch (err) {
      setDbStatus('disconnected');
      console.warn('Backend or MongoDB connection error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, [refreshTrigger, location.pathname]);

  const handleGenerateData = async () => {
    try {
      setIsGenerating(true);
      const res = await salesService.generateData(generateCount);
      setAlert({
        type: 'success',
        message: `Generated and stored ${generateCount.toLocaleString()} records in MongoDB!`,
      });
      setIsGenerateModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setAlert({
        type: 'error',
        message: `Data Generation Failed: ${err.message}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearData = async () => {
    try {
      setIsClearing(true);
      const res = await salesService.deleteAllSales();
      setAlert({
        type: 'success',
        message: res.message || 'All records successfully cleared from MongoDB.',
      });
      setIsClearModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setAlert({
        type: 'error',
        message: `Clear Failed: ${err.message}`,
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        dbStatus={dbStatus}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
          onOpenClearModal={() => setIsClearModalOpen(true)}
          onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
          totalRecords={totalRecords}
          loading={loading}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          {/* Render Active Page passing context */}
          <Outlet context={{ refreshTrigger, setRefreshTrigger, setAlert, totalRecords }} />
        </main>
      </div>

      {/* Generate Synthetic Data Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => !isGenerating && setIsGenerateModalOpen(false)}
        title="Generate Big Data Sales Records"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Rapidly populate your MongoDB collection with realistic sales transactions spanning Electronics, Furniture, Clothing, Food, and Books across 5 regions.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Number of Records to Generate
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1000, 5000, 10000].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setGenerateCount(cnt)}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold transition-all ${
                    generateCount === cnt
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {cnt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <label className="text-[11px] text-slate-400">Or custom quantity (Max 50,000):</label>
              <input
                type="number"
                min="100"
                max="50000"
                step="500"
                value={generateCount}
                onChange={(e) => setGenerateCount(Math.min(50000, Math.max(1, Number(e.target.value))))}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Batched in chunks of 2,000 for high-throughput insertion via Mongoose <code className="text-cyan-400">insertMany</code>.
            </span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateData}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating & Storing...' : `Generate ${generateCount.toLocaleString()} Records`}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Clear Database Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => !isClearing && setIsClearModalOpen(false)}
        title="Confirm Dataset Reset"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>
              This will permanently delete all records currently stored in the MongoDB <code className="text-white">sales</code> collection. This action cannot be undone.
            </span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setIsClearModalOpen(false)}
              disabled={isClearing}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClearData}
              disabled={isClearing}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isClearing ? 'Deleting...' : 'Yes, Delete All Records'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

