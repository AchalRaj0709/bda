import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle,
} from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { salesService } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';

export default function DataManagement() {
  const { refreshTrigger, setRefreshTrigger, setAlert } = useOutletContext();

  // Data states
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [category, setCategory] = useState('All');
  const [region, setRegion] = useState('All');
  const [sortBy, setSortBy] = useState('orderDate');
  const [order, setOrder] = useState('desc');

  // CSV Upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewRows, setPreviewRows] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Single delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch sales records
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        sortBy,
        order,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category !== 'All') params.category = category;
      if (region !== 'All') params.region = region;

      const res = await salesService.getSales(params);
      setSales(res.data || []);
      setTotalRecords(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch sales records:', err);
      setAlert({
        type: 'error',
        message: `Failed to load records: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [page, limit, debouncedSearch, category, region, sortBy, order, refreshTrigger]);

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setAlert({
          type: 'error',
          message: 'Invalid file format. Please upload a CSV file (.csv).',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  // Preview CSV
  const handlePreviewCSV = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await salesService.previewCSV(formData);
      setPreviewRows(res.preview || []);
      setIsPreviewModalOpen(true);
    } catch (err) {
      setAlert({
        type: 'error',
        message: `CSV Preview Failed: ${err.message}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Import CSV to MongoDB
  const handleImportCSV = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await salesService.uploadCSV(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      setAlert({
        type: 'success',
        message: res.message || `Successfully imported ${res.stats?.insertedCount || 0} records into MongoDB!`,
      });

      setSelectedFile(null);
      setPreviewRows(null);
      setIsPreviewModalOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setAlert({
        type: 'error',
        message: `Import Error: ${err.message}`,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete single record
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await salesService.deleteSale(deleteTarget._id);
      setAlert({
        type: 'success',
        message: `Deleted record ${deleteTarget.orderId} from MongoDB.`,
      });
      setDeleteTarget(null);
      fetchSalesData();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setAlert({
        type: 'error',
        message: `Delete failed: ${err.message}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export filtered CSV
  const handleExportCSV = () => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (category !== 'All') params.category = category;
    if (region !== 'All') params.region = region;
    window.open(salesService.getExportUrl(params), '_blank');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Big Data Management & Operations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Bulk CSV ingestion, dataset generation, streaming export, and paginated document queries
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            disabled={totalRecords === 0}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-500/50 text-xs font-semibold transition-all disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* CSV Ingestion Panel */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Ingest CSV Dataset (Multer + Streaming Parser)</h3>
              <p className="text-xs text-slate-400">
                Upload CSV files with headers: orderId, product, category, region, quantity, sales, profit, orderDate
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            BulkWrite Supported
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <div className="relative border-2 border-dashed border-slate-700/80 hover:border-cyan-500/50 rounded-xl p-4 transition-colors bg-slate-950/40 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center space-x-3">
                <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
                <div className="text-left">
                  <p className="text-xs font-medium text-slate-200">
                    {selectedFile ? selectedFile.name : 'Choose a CSV file or drag & drop here'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Supports up to 100,000+ rows'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handlePreviewCSV}
              disabled={!selectedFile || isUploading}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-40 transition-colors"
            >
              <Eye className="w-4 h-4 text-slate-400" />
              <span>Preview</span>
            </button>

            <button
              onClick={handleImportCSV}
              disabled={!selectedFile || isUploading}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-40 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Importing...' : 'Import to DB'}</span>
            </button>
          </div>
        </div>

        {isUploading && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Streaming into MongoDB bulkWrite buffer...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress || 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
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
            onChange={(e) => {
              setRegion(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setCategory('All');
              setRegion('All');
              setSortBy('orderDate');
              setOrder('desc');
              setPage(1);
            }}
            className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sales Records Paginated Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Order ID</th>
                <th
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-cyan-400"
                  onClick={() => handleSort('product')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Product</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Region</th>
                <th className="py-3.5 px-4 font-semibold text-center">Qty</th>
                <th
                  className="py-3.5 px-4 font-semibold text-right cursor-pointer hover:text-cyan-400"
                  onClick={() => handleSort('sales')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Sales</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 font-semibold text-right cursor-pointer hover:text-cyan-400"
                  onClick={() => handleSort('profit')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Profit</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 font-semibold text-right cursor-pointer hover:text-cyan-400"
                  onClick={() => handleSort('orderDate')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center">
                    <LoadingSpinner message="Querying MongoDB with indexed pagination..." />
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500">
                    No matching sales records found in MongoDB.
                  </td>
                </tr>
              ) : (
                sales.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-cyan-400 font-medium">
                      {item.orderId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">{item.product}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
                        {item.region}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-100">
                      {formatCurrency(item.sales)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-semibold ${
                        item.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(item.profit)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {formatDate(item.orderDate)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete record from MongoDB"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalRecords}
            pageSize={limit}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(sz) => {
              setLimit(sz);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* CSV Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="CSV Dataset Preview (First 10 Records)"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Reviewing raw file columns before writing into MongoDB collection.
          </p>

          <div className="overflow-x-auto max-h-80 border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 font-mono text-slate-400 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">orderId</th>
                  <th className="py-2.5 px-3">product</th>
                  <th className="py-2.5 px-3">category</th>
                  <th className="py-2.5 px-3">region</th>
                  <th className="py-2.5 px-3 text-center">qty</th>
                  <th className="py-2.5 px-3 text-right">sales</th>
                  <th className="py-2.5 px-3 text-right">profit</th>
                  <th className="py-2.5 px-3 text-right">orderDate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                {previewRows &&
                  previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-cyan-400">{row.orderId || row.orderid || row.id}</td>
                      <td className="py-2 px-3 text-slate-200">{row.product || row.productname}</td>
                      <td className="py-2 px-3">{row.category}</td>
                      <td className="py-2 px-3">{row.region}</td>
                      <td className="py-2 px-3 text-center">{row.quantity || row.qty}</td>
                      <td className="py-2 px-3 text-right">${row.sales || row.revenue}</td>
                      <td className="py-2 px-3 text-right text-emerald-400">${row.profit}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{row.orderDate || row.date}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Close Preview
            </button>
            <button
              onClick={handleImportCSV}
              disabled={isUploading}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Importing...' : 'Proceed with Import'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Single Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Record Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to permanently delete order{' '}
            <span className="font-mono text-cyan-400 font-semibold">{deleteTarget?.orderId}</span> (
            {deleteTarget?.product}) from MongoDB?
          </p>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              {isDeleting ? 'Deleting...' : 'Delete Record'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

