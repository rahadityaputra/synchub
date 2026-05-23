import React, { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { Link } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Link2,
  AlertTriangle
} from 'lucide-react';

function Orders() {
  const { orders, fetchInitialData } = useStore();
  const [search, setSearch] = useState('');
  const [mktFilter, setMktFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.marketplace_order_id.toLowerCase().includes(search.toLowerCase()) || 
                          o.productName.toLowerCase().includes(search.toLowerCase()) ||
                          (o.sku && o.sku.toLowerCase().includes(search.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (mktFilter !== 'all' && o.marketplace.toLowerCase() !== mktFilter.toLowerCase()) {
      return false;
    }

    if (statusFilter !== 'all' && o.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. TOP FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Cari kode pesanan, nama produk, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Drops Filters */}
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
              <option value="confirmed">Confirmed</option>
              <option value="processed">Processed</option>
              <option value="completed">Completed</option>
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

      {/* 2. ORDERS LIST TABLE */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Order Code</th>
                <th className="px-6 py-4">Marketplace</th>
                <th className="px-6 py-4">Ordered Product</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4">Mapping Status</th>
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
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white">{o.marketplace_order_id}</td>
                    <td className="px-6 py-4 capitalize font-semibold text-slate-300">{o.marketplace}</td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200 block truncate">{o.productName}</span>
                        <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-800/50 px-1 rounded border border-slate-800">{o.sku}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">{o.quantity}</td>
                    <td className="px-6 py-4 font-mono font-semibold text-white">{formatRupiah(o.totalPrice)}</td>
                    <td className="px-6 py-4">
                      {o.mapped ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                          <Link2 size={12} />
                          {o.internal_sku}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-bold bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                          <AlertTriangle size={12} />
                          Unmapped SKU
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/orders/${o.id}`}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-all inline-flex items-center"
                        title="Lihat Detail Pesanan & Payload Webhook"
                      >
                        <Eye size={14} className="mr-1" /> Detail
                      </Link>
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

export default Orders;
