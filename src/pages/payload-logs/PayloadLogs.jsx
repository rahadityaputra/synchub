import React, { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { RefreshCw, Code, FileJson, Calendar, Eye } from 'lucide-react';

function PayloadLogs() {
  const { payloadLogs, fetchInitialData } = useStore();
  const [selectedPayload, setSelectedPayload] = useState(null);

  return (
    <div className="space-y-6">
      
      {/* 1. TOP CONTROLS */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white">Log Webhook Payload</h3>
          <p className="text-xs text-slate-400">Arsip data raw JSON webhook yang diterima dari Shopee, Tokopedia, dan Lazada</p>
        </div>
        
        <button
          onClick={fetchInitialData}
          className="p-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
          title="Refresh Data"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* 2. GRID / LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payloadLogs.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-500 text-xs font-semibold">
            Belum ada webhook log diterima. Minta pesanan dari simulator!
          </div>
        ) : (
          payloadLogs.map((log) => (
            <div 
              key={log.id} 
              className="glass-panel p-5 rounded-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-bold">
                    {log.id}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(log.timestamp || log.createdAt || log.created_at).toLocaleTimeString('id-ID')}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] text-blue-400 font-semibold font-mono uppercase">
                    {log.event}
                  </span>
                  <h4 className="text-xs font-bold text-white capitalize leading-snug">
                    {log.marketplace} Webhook Message
                  </h4>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-800/60 mt-4">
                <span className="text-[10px] text-slate-400">
                  Data: {log.payload?.data?.order?.sku || log.payload?.sku || 'Test payload'}
                </span>
                <button
                  onClick={() => setSelectedPayload(log)}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300"
                >
                  <Eye size={12} /> Inspect JSON
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. JSON VIEWER MODAL */}
      {selectedPayload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson size={18} className="text-blue-400" />
                <span className="font-bold text-white text-sm">Payload Inspector ({selectedPayload.id})</span>
              </div>
              <button 
                onClick={() => setSelectedPayload(null)} 
                className="text-slate-400 hover:text-white text-sm"
              >
                Tutup
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-4 text-xs bg-slate-950 p-3 rounded-lg border border-slate-850">
                <div>
                  <span className="text-slate-500 mr-2">Marketplace:</span>
                  <span className="font-bold text-white capitalize">{selectedPayload.marketplace}</span>
                </div>
                <div>
                  <span className="text-slate-500 mr-2">Event:</span>
                  <span className="font-bold text-white font-mono">{selectedPayload.event}</span>
                </div>
                <div>
                  <span className="text-slate-500 mr-2">Waktu Diterima:</span>
                  <span className="font-bold text-white font-mono">{new Date(selectedPayload.timestamp || selectedPayload.createdAt || selectedPayload.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Raw JSON Payload</label>
                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-850 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96">
                  {JSON.stringify(selectedPayload, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedPayload(null)}
                className="text-xs font-bold text-slate-400 hover:text-white px-4 py-2"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default PayloadLogs;
