import React, { useState } from 'react';
import { useStore } from '../../stores/useStore';
import {
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCw,
  Search,
  Eye,
  Activity,
  Layers,
  Check,
  AlertCircle
} from 'lucide-react';

function Queues() {
  const { queues, retryQueueJob, socketConnected } = useStore();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [retryLoadingId, setRetryLoadingId] = useState(null);

  // Computations
  const safeQueues = Array.isArray(queues) ? queues : [];
  const stats = {
    total: safeQueues.length,
    pending: safeQueues.filter(q => q.status === 'PENDING').length,
    processing: safeQueues.filter(q => q.status === 'PROCESSING').length,
    success: safeQueues.filter(q => q.status === 'SUCCESS').length,
    failed: safeQueues.filter(q => q.status === 'FAILED').length,
  };

  // Filter and search
  const filteredJobs = safeQueues
    .filter(job => {
      const matchStatus = statusFilter === 'ALL' || job.status === statusFilter;
      const jsonStr = JSON.stringify(job).toLowerCase();
      const matchSearch = jsonStr.includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  const handleRetry = async (id) => {
    setRetryLoadingId(id);
    await retryQueueJob(id);
    setRetryLoadingId(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock size={12} /> PENDING
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <RotateCw size={12} className="animate-spin" /> PROCESSING
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} /> SUCCESS
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle size={12} /> FAILED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Antrean</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Pending</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-white">{stats.pending}</span>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Processing</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-white">{stats.processing}</span>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Success</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-white">{stats.success}</span>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Failed</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-white">{stats.failed}</span>
          </div>
        </div>
      </div>

      {/* 2. FILTERS & SEARCH */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari job berdasarkan SKU, ID, marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === status
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 3. QUEUE TABLE */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold">
                <th className="p-4">ID / Tanggal</th>
                <th className="p-4">Tipe Job</th>
                <th className="p-4">Status</th>
                <th className="p-4">Detail Payload</th>
                <th className="p-4 text-center">Percobaan</th>
                <th className="p-4">Error Terakhir</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    Tidak ada pekerjaan antrean yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-900/30 transition-all">
                    {/* ID & Date */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-bold text-slate-200">{job.id}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        {new Date(job.createdAt).toLocaleString('id-ID')}
                      </div>
                    </td>

                    {/* Job Type */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-slate-800/80 text-blue-400 border border-slate-700/50 px-2 py-0.5 rounded font-mono font-bold">
                        {job.type}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4 whitespace-nowrap">
                      {getStatusBadge(job.status)}
                    </td>

                    {/* Payload Details */}
                    <td className="p-4 max-w-xs truncate font-mono text-slate-300">
                      {job.type === 'ORDER_CREATED' ? (
                        <span>
                          🛒 Order {job.payload.order?.marketplace_order_id} ({job.payload.marketplace})
                        </span>
                      ) : (
                        <span>
                          🔄 Sync {job.payload.sku} ({job.payload.marketplace}) &rarr; {job.payload.stock} pcs
                        </span>
                      )}
                    </td>

                    {/* Attempts */}
                    <td className="p-4 text-center whitespace-nowrap font-bold text-slate-200">
                      {job.attempts} / {job.maxAttempts || 3}
                    </td>

                    {/* Error message */}
                    <td className="p-4 max-w-xs truncate text-red-400/90 font-medium">
                      {job.error ? job.error : <span className="text-slate-500 font-normal">-</span>}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                          title="Detail Pekerjaan"
                        >
                          <Eye size={14} />
                        </button>
                        {job.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetry(job.id)}
                            disabled={retryLoadingId === job.id}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all disabled:opacity-50"
                            title="Mencoba Kembali"
                          >
                            <RotateCw size={12} className={retryLoadingId === job.id ? 'animate-spin' : ''} />
                            <span>Retry</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL DETIL PEKERJAAN */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
              <span className="font-bold text-white text-sm">Detil Pekerjaan Queue {selectedJob.id}</span>
              <button 
                onClick={() => setSelectedJob(null)} 
                className="p-1 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Tutup
              </button>
            </div>
            
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Status</span>
                  {getStatusBadge(selectedJob.status)}
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tipe Pekerjaan</span>
                  <span className="font-bold text-white font-mono">{selectedJob.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Dibuat</span>
                  <span className="text-slate-200">{new Date(selectedJob.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Diperbarui</span>
                  <span className="text-slate-200">{new Date(selectedJob.updatedAt || selectedJob.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Upaya Percobaan</span>
                  <span className="text-slate-200 font-bold">{selectedJob.attempts} / {selectedJob.maxAttempts || 3}</span>
                </div>
              </div>

              {selectedJob.error && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-xs">
                  <span className="font-bold text-red-400 block mb-1">Pesan Error:</span>
                  <code className="text-red-300 font-mono block break-words whitespace-pre-wrap">{selectedJob.error}</code>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Payload JSON</span>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[10px] text-emerald-400 overflow-x-auto font-mono max-h-52">
                  {JSON.stringify(selectedJob.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
              <span className="text-[10px] text-slate-500">ID: {selectedJob.id}</span>
              <div className="flex gap-2">
                {selectedJob.status === 'FAILED' && (
                  <button
                    onClick={() => {
                      handleRetry(selectedJob.id);
                      setSelectedJob(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                  >
                    <RotateCw size={12} />
                    <span>Retry Job</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedJob(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Queues;
