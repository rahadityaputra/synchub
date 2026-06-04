import React from "react";
import { useStore } from "../../stores/useStore";
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";

function SyncLogs() {
  const { syncLogs, fetchInitialData } = useStore();

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString("id-ID") : "-";

  const getRequestSku = (log) =>
    log.sku ||
    log.requestPayload?.marketplace_sku ||
    log.requestPayload?.marketplaceSku ||
    "-";

  const getInternalSku = (log) =>
    log.internalSku ||
    log.internal_sku ||
    log.requestPayload?.internal_sku ||
    log.requestPayload?.internalSku ||
    "-";

  const getErrorMessage = (log) => log.errorMessage || log.error || "-";

  return (
    <div className="space-y-6">
      {/* 1. TOP CONTROLS */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Log Sinkronisasi Stok
          </h3>
          <p className="text-xs text-slate-400">
            Jejak audit sinkronisasi stok aggregator ke API marketplace
          </p>
        </div>

        <button
          onClick={fetchInitialData}
          className="p-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
          title="Refresh Data"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* 2. LOG TABLE */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Sync ID</th>
                <th className="px-6 py-4">Product ID</th>
                <th className="px-6 py-4">Marketplace</th>
                <th className="px-6 py-4">Target SKU</th>
                <th className="px-6 py-4">Internal SKU</th>
                <th className="px-6 py-4">Action Detail</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Waktu Sync</th>
                <th className="px-6 py-4">Error / Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {syncLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-10 text-slate-500 font-medium font-sans"
                  >
                    Belum ada log sinkronisasi stok.
                  </td>
                </tr>
              ) : (
                syncLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-400">
                      {log.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-300 font-sans">
                      {log.productId ?? "-"}
                    </td>
                    <td className="px-6 py-4 capitalize font-semibold text-slate-300 font-sans">
                      {log.marketplace}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {getRequestSku(log)}
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-400">
                      {getInternalSku(log)}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-sans">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          log.status === "SUCCESS"
                            ? "text-emerald-400"
                            : log.status === "FAILED"
                              ? "text-red-400"
                              : "text-amber-400"
                        }`}
                      >
                        {log.status === "SUCCESS" ? (
                          <CheckCircle size={12} />
                        ) : log.status === "FAILED" ? (
                          <XCircle size={12} />
                        ) : (
                          <Clock size={12} className="animate-spin" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-sans">
                      {formatDate(log.timestamp || log.createdAt)}
                    </td>
                    <td
                      className="px-6 py-4 text-red-400 font-sans truncate max-w-xs"
                      title={getErrorMessage(log)}
                    >
                      {getErrorMessage(log)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SyncLogs;
