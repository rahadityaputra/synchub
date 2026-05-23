import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../stores/useStore';
import {
  ArrowLeft,
  ShoppingCart,
  Link2,
  AlertTriangle,
  Code,
  FileJson,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';

function OrderDetail() {
  const { id } = useParams();
  const { fetchOrderDetail, currentOrder } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchOrderDetail(id).then(() => setLoading(false));
  }, [id, fetchOrderDetail]);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
        <span className="h-5 w-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mr-2"></span>
        Memuat detail pesanan...
      </div>
    );
  }

  if (!currentOrder || !currentOrder.order) {
    return (
      <div className="space-y-4">
        <Link to="/orders" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs">
          <ArrowLeft size={16} /> Kembali
        </Link>
        <div className="p-6 bg-red-950/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
          Pesanan tidak ditemukan atau gagal dimuat.
        </div>
      </div>
    );
  }

  const { order, payloads, syncLogs } = currentOrder;
  const rawPayload = payloads?.[0] || null;

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <div>
        <Link to="/orders" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold">
          <ArrowLeft size={16} /> Kembali ke Pesanan
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Order info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Info Card */}
          <div className="glass-panel p-6 rounded-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                <ShoppingCart size={22} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{order.marketplace} ORDER</span>
                <h3 className="text-base font-bold text-white leading-snug">{order.marketplace_order_id}</h3>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Pesanan:</span>
                  <span className="font-bold text-white capitalize">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Pembayaran:</span>
                  <span className="font-bold text-white font-mono">{formatRupiah(order.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waktu Order:</span>
                  <span className="font-semibold text-slate-300 font-mono">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 sm:border-l sm:border-slate-800 sm:pl-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mapping SKU:</span>
                  {order.mapped ? (
                    <span className="font-bold text-emerald-400 font-mono bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                      Mapped to {order.internal_sku}
                    </span>
                  ) : (
                    <span className="font-bold text-red-400 font-mono bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                      Unmapped SKU
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Item Produk:</span>
                  <span className="font-semibold text-slate-300">{order.productName} ({order.quantity} Pcs)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Webhook Raw Payload */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileJson size={18} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Webhook Payload (JSON)</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Debugging / Raw Webhook</span>
            </div>

            {rawPayload ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] bg-slate-900 px-3 py-1.5 rounded border border-slate-800 font-mono text-slate-400">
                  <span>Event: {rawPayload.event}</span>
                  <span>ID: {rawPayload.id}</span>
                </div>
                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-850 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-72">
                  {JSON.stringify(rawPayload.payload, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-6 text-xs bg-slate-950 rounded-lg border border-slate-850/40">
                Payload webhook tidak ditemukan di database logs.
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Sync status logs & Shipping */}
        <div className="space-y-6">
          
          {/* Shipping detail */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Alamat Pengiriman</h3>
            </div>
            
            {/* Address display - parse from mock payload */}
            {rawPayload?.payload?.data?.order?.shippingAddress ? (
              <div className="text-xs space-y-2 leading-relaxed text-slate-300">
                <div className="font-bold text-white">
                  {rawPayload.payload.data.order.shippingAddress.name}
                </div>
                <div>{rawPayload.payload.data.order.shippingAddress.street}</div>
                <div>
                  {rawPayload.payload.data.order.shippingAddress.city},{' '}
                  {rawPayload.payload.data.order.shippingAddress.postalCode}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">Informasi pengiriman tidak tersedia.</div>
            )}
          </div>

          {/* Stock changes and sync logs */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Link2 size={18} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Marketplace Stock Sync status</h3>
            </div>

            <div className="space-y-3">
              {syncLogs.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">
                  Tidak ada sinkronisasi stok yang dipicu oleh pesanan ini.
                </div>
              ) : (
                syncLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-white capitalize block">{log.marketplace}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{log.sku}</span>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        log.status === 'SUCCESS' ? 'text-emerald-400' :
                        log.status === 'FAILED' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {log.status === 'SUCCESS' ? <CheckCircle size={10} /> :
                         log.status === 'FAILED' ? <XCircle size={10} /> : null}
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default OrderDetail;
