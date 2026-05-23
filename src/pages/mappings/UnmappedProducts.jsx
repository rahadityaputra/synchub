import React, { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Link2,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

function UnmappedProducts() {
  const { unmappedProducts, products, resolveUnmapped } = useStore();
  
  // Resolve state
  const [resolveItem, setResolveItem] = useState(null);
  const [internalSku, setInternalSku] = useState('');
  const [resolving, setResolving] = useState(false);

  const handleOpenResolve = (item) => {
    setResolveItem(item);
    if (products.length > 0) setInternalSku(products[0].sku);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolveItem || !internalSku) return;
    setResolving(true);
    
    const success = await resolveUnmapped(resolveItem.id, internalSku);
    if (success) {
      setResolveItem(null);
    }
    setResolving(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link to="/mappings" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold">
          <ArrowLeft size={16} /> Kembali ke Mappings
        </Link>
      </div>

      {/* Intro Banner */}
      <div className="bg-amber-950/20 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex gap-3 text-xs leading-normal">
        <AlertTriangle size={18} className="shrink-0 animate-pulse mt-0.5" />
        <div>
          <h4 className="font-bold text-white mb-0.5">Deteksi SKU Tidak Terdaftar (Unmapped)</h4>
          <p>
            Daftar di bawah ini berisi SKU marketplace yang menerima pesanan (webhook), namun sistem aggregator belum mengenali mapping internalnya. Sambungkan ke SKU internal agar sinkronisasi stok otomatis dapat berjalan kembali.
          </p>
        </div>
      </div>

      {/* Table of Unmapped */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Marketplace</th>
                <th className="px-6 py-4">Marketplace SKU</th>
                <th className="px-6 py-4">Nama Produk di Webhook</th>
                <th className="px-6 py-4">Dideteksi Pada</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {unmappedProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-500 font-medium">
                    Tidak ada SKU unmapped terdeteksi. Semua sinkronisasi berjalan normal!
                  </td>
                </tr>
              ) : (
                unmappedProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-300 capitalize">{item.marketplace}</td>
                    <td className="px-6 py-4 font-mono font-bold text-red-400">{item.sku}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{item.productName}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenResolve(item)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded text-[11px] ml-auto transition-all"
                      >
                        <Link2 size={12} /> Hubungkan Produk
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESOLVE MODAL */}
      {resolveItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="font-bold text-white text-sm">Hubungkan Produk Marketplace</span>
              <button 
                onClick={() => setResolveItem(null)} 
                className="text-slate-400 hover:text-white text-sm"
              >
                Tutup
              </button>
            </div>
            
            <form onSubmit={handleResolveSubmit} className="p-5 space-y-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Marketplace:</span>
                  <span className="font-bold text-slate-300 capitalize">{resolveItem.marketplace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SKU Asal:</span>
                  <span className="font-bold font-mono text-red-400">{resolveItem.sku}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Nama Produk Webhook:</span>
                  <span className="font-medium text-slate-300 leading-normal block">{resolveItem.productName}</span>
                </div>
              </div>

              {/* Internal SKU Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Sambungkan ke SKU Gudang</label>
                <select
                  value={internalSku}
                  onChange={(e) => setInternalSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:border-blue-500 focus:outline-none font-mono"
                  required
                >
                  {products.length === 0 ? (
                    <option value="">Tidak ada produk gudang</option>
                  ) : (
                    products.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} - {p.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="p-3 bg-blue-950/20 border border-blue-500/10 rounded-lg text-[10px] text-slate-400 flex gap-2">
                <HelpCircle size={16} className="text-blue-400 shrink-0" />
                <p className="leading-normal">
                  Setelah terhubung, stok produk marketplace akan disamakan dengan stok internal gudang aggregator secara otomatis.
                </p>
              </div>

              <button
                type="submit"
                disabled={resolving}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg text-xs transition-all flex items-center justify-center gap-2"
              >
                {resolving ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <CheckCircle size={16} />
                )}
                Konfirmasi Hubungkan
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default UnmappedProducts;
