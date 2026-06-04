import React, { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { Link } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Eye,
  RefreshCw,
  Package,
} from 'lucide-react';

function Orders() {
  const { orders, fetchInitialData } = useStore();
  const [search, setSearch] = useState('');
  const [mktFilter, setMktFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val || 0);

  const statusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CREATED':   return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'PAID':      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'SHIPPED':   return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'DONE':      return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'CANCELLED': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:          return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((o) => {
    if (!o) return false;

    // Backend fields: orderCode, marketplace, status
    const orderCode  = (o.orderCode  || o.marketplace_order_id || '').toLowerCase();
    const marketplace = (o.marketplace || '').toLowerCase();
    const status      = (o.status || '').toLowerCase();

    const matchesSearch =
      !search ||
      orderCode.includes(search.toLowerCase()) ||
      marketplace.includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (mktFilter !== 'all' && marketplace !== mktFilter.toLowerCase()) return false;
    if (statusFilter !== 'all' && status !== statusFilter.toLowerCase()) return false;

    return true;
  });

  return (
    <div className="space-y-6">

      {/* TOP FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Cari kode pesanan atau marketplace..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Marketplace Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase">Channel:</span>
            <select
              value={mktFilter}
              onChange={(e) => setMktFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Semua Marketplace</option>
              <option value="shopee">Shopee</option>
              <option value="tokopedia">Tokopedia</option>
              <option value="lazada">Lazada</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="created">Created</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={fetchInitialData}
            className="p-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Order Code</th>
                <th className="px-6 py-4">Marketplace</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total Qty</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-500 font-medium">
                    Tidak ada pesanan masuk.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const items     = Array.isArray(o.items) ? o.items : [];
                  const totalQty  = items.reduce((sum, item) => sum + (item.qty ?? 0), 0);
                  const orderCode = o.orderCode || o.marketplace_order_id || '-';

                  return (
                    <tr key={o.id} className="hover:bg-slate-900/30 transition-colors">
                      {/* Order Code */}
                      <td className="px-6 py-4 font-mono font-bold text-white">{orderCode}</td>

                      {/* Marketplace */}
                      <td className="px-6 py-4 capitalize font-semibold text-slate-300">{o.marketplace}</td>

                      {/* Items summary */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Package size={12} />
                          <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                        </div>
                      </td>

                      {/* Total Qty */}
                      <td className="px-6 py-4 font-mono text-slate-300">{totalQty}</td>

                      {/* Total Price */}
                      <td className="px-6 py-4 font-mono font-semibold text-white">
                        {formatRupiah(o.totalPrice)}
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusColor(o.status)}`}>
                          {o.status || '-'}
                        </span>
                      </td>

                      {/* Order Date */}
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString('id-ID') : '-'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/orders/${o.id}`}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-all inline-flex items-center gap-1"
                          title="Lihat Detail Pesanan"
                        >
                          <Eye size={14} /> Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Orders;
