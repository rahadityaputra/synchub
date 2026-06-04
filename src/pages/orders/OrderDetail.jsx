import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../stores/useStore';
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Hash,
  Calendar,
  DollarSign,
  Tag,
  Layers,
} from 'lucide-react';

function OrderDetail() {
  const { id } = useParams();
  const { fetchOrderDetail, currentOrder } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchOrderDetail(id).then(() => setLoading(false));
  }, [id, fetchOrderDetail]);

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  const formatDate = (val) =>
    val
      ? new Date(val).toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-';

  const statusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CREATED': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'PAID':    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'SHIPPED': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'DONE':    return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'CANCELLED': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
        <span className="h-5 w-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mr-2" />
        Memuat detail pesanan...
      </div>
    );
  }

  if (!currentOrder) {
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

  const order = currentOrder;
  const items = order.items || [];

  return (
    <div className="space-y-6">

      {/* Back */}
      <Link to="/orders" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold">
        <ArrowLeft size={16} /> Kembali ke Pesanan
      </Link>

      {/* Header card */}
      <div className="glass-panel p-6 rounded-xl space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <ShoppingCart size={22} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">
                {order.marketplace} Order
              </span>
              <h3 className="text-base font-bold text-white leading-snug font-mono">
                {order.orderCode}
              </h3>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        {/* Info grid */}
        <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 flex items-center gap-1"><Hash size={11} /> Order ID</span>
            <span className="font-semibold text-white font-mono">#{order.id}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 flex items-center gap-1"><DollarSign size={11} /> Total Pembayaran</span>
            <span className="font-bold text-white font-mono">{formatRupiah(order.totalPrice)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 flex items-center gap-1"><Tag size={11} /> Marketplace</span>
            <span className="font-semibold text-white">{order.marketplace}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 flex items-center gap-1"><Calendar size={11} /> Dibuat</span>
            <span className="font-semibold text-slate-300 font-mono">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 flex items-center gap-1"><Calendar size={11} /> Diperbarui</span>
            <span className="font-semibold text-slate-300 font-mono">{formatDate(order.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layers size={18} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">
            Item Pesanan
            <span className="ml-2 text-xs font-mono text-slate-500">({items.length} item)</span>
          </h3>
        </div>

        {items.length === 0 ? (
          <div className="text-center text-slate-500 py-6 text-xs">
            Tidak ada item dalam pesanan ini.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs gap-4 flex-wrap"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                    <Package size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white font-mono">
                      Product ID: <span className="text-blue-400">#{item.productId}</span>
                    </div>
                    <div className="text-slate-500 font-mono text-[10px]">
                      Order Item ID: {item.id} &nbsp;·&nbsp; Order ID: {item.orderId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-slate-500 text-[10px] mb-0.5">Qty</div>
                    <div className="font-bold text-white">{item.qty}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-500 text-[10px] mb-0.5">Harga Satuan</div>
                    <div className="font-bold text-white font-mono">{formatRupiah(item.price)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-500 text-[10px] mb-0.5">Subtotal</div>
                    <div className="font-bold text-emerald-400 font-mono">
                      {formatRupiah(Number(item.price) * item.qty)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total row */}
        {items.length > 0 && (
          <div className="flex justify-end border-t border-slate-800 pt-3">
            <div className="text-xs flex items-center gap-3">
              <span className="text-slate-400">Grand Total:</span>
              <span className="text-base font-bold text-white font-mono">
                {formatRupiah(order.totalPrice)}
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default OrderDetail;
