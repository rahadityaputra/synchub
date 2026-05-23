import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../stores/useStore';
import {
  ArrowLeft,
  Package,
  Link2,
  History,
  ShoppingCart,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

function ProductDetail() {
  const { id } = useParams();
  const { fetchProductDetail, currentProduct, syncProductStock } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProductDetail(id).then(() => setLoading(false));
  }, [id, fetchProductDetail]);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleManualSync = async () => {
    if (currentProduct?.product?.id) {
      await syncProductStock(currentProduct.product.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
        <span className="h-5 w-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mr-2"></span>
        Memuat detail produk...
      </div>
    );
  }

  if (!currentProduct || !currentProduct.product) {
    return (
      <div className="space-y-4">
        <Link to="/products" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs">
          <ArrowLeft size={16} /> Kembali
        </Link>
        <div className="p-6 bg-red-950/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
          Produk tidak ditemukan atau gagal dimuat.
        </div>
      </div>
    );
  }

  const { product, mappings, orderHistory, syncHistory } = currentProduct;

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link to="/products" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold">
          <ArrowLeft size={16} /> Kembali ke Inventori
        </Link>
        <button
          onClick={handleManualSync}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/20 transition-all"
        >
          <RefreshCw size={14} /> Sinkronisasi Stok Sekarang
        </button>
      </div>

      {/* Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Product Info */}
        <div className="glass-panel p-6 rounded-xl space-y-5 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <Package size={22} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{product.sku}</span>
              <h3 className="text-base font-bold text-white leading-snug">{product.name}</h3>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Harga Gudang:</span>
              <span className="font-semibold text-white font-mono">{formatRupiah(product.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stok Aggregator:</span>
              <span className="font-bold text-white font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {product.stock} Unit
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Integrasi Channel:</span>
              <span className="font-semibold text-blue-400">{mappings.length} Marketplace</span>
            </div>
          </div>
        </div>

        {/* Right Side: Channel Mappings */}
        <div className="glass-panel p-6 rounded-xl lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Marketplace SKU Connections</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/30 font-semibold uppercase">
                  <th className="px-4 py-3">Marketplace</th>
                  <th className="px-4 py-3">Marketplace SKU</th>
                  <th className="px-4 py-3 text-center">Status Koneksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {mappings.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-slate-500">
                      Produk ini belum dihubungkan ke SKU marketplace mana pun.
                    </td>
                  </tr>
                ) : (
                  mappings.map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-3 font-semibold text-slate-300 capitalize">{m.marketplace}</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">{m.marketplace_sku}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                          <CheckCircle size={12} />
                          Connected & Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Logs and Order History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sync History Logs */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Log Sinkronisasi Stok Channel</h3>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
            {syncHistory.length === 0 ? (
              <div className="text-center text-slate-500 py-10 text-xs">Belum ada riwayat sinkronisasi stok.</div>
            ) : (
              syncHistory.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white capitalize">{log.marketplace}</span>
                      <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{log.sku}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{log.action}</span>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <span 
                      className={`inline-flex items-center gap-1 font-bold ${
                        log.status === 'SUCCESS' ? 'text-emerald-400' :
                        log.status === 'FAILED' ? 'text-red-400' : 'text-amber-400'
                      }`}
                    >
                      {log.status === 'SUCCESS' ? <CheckCircle size={12} /> :
                       log.status === 'FAILED' ? <XCircle size={12} /> : <RefreshCw size={12} className="animate-spin" />}
                      {log.status}
                    </span>
                    <span className="text-[9px] text-slate-500 block font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Pesanan Terkait</h3>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
            {orderHistory.length === 0 ? (
              <div className="text-center text-slate-500 py-10 text-xs">Belum ada pesanan masuk untuk produk ini.</div>
            ) : (
              orderHistory.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-white font-mono">{order.marketplace_order_id}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="capitalize">{order.marketplace}</span>
                      <span>•</span>
                      <span>{order.quantity} Item</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-xs font-bold text-white font-mono">{formatRupiah(order.totalPrice)}</span>
                    <span className="text-[9px] text-slate-500 block font-mono">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default ProductDetail;
