import React, { useState, useEffect } from 'react';
import { useStore } from '../../stores/useStore';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Edit2,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';

function Products() {
  const { products, updateProductStock, syncProductStock, fetchInitialData } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, low, out
  
  // Edit stock Modal state
  const [editProduct, setEditProduct] = useState(null);
  const [editStockValue, setEditStockValue] = useState(0);
  const [updating, setUpdating] = useState(false);

  // Format currency
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Filter products based on search and selected stock filter
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === 'low') {
      return p.stock > 0 && p.stock < 30;
    }
    if (filter === 'out') {
      return p.stock === 0;
    }
    return true;
  });

  const handleOpenEdit = (p) => {
    setEditProduct(p);
    setEditStockValue(p.stock);
  };

  const handleSaveStock = async () => {
    if (!editProduct) return;
    setUpdating(true);
    const success = await updateProductStock(editProduct.id, editStockValue);
    if (success) {
      setEditProduct(null);
    }
    setUpdating(false);
  };

  const handleManualSync = async (p) => {
    await syncProductStock(p.id);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP CONTROLS & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari nama produk atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                filter === 'low' ? 'bg-amber-600/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stok Rendah (&lt;30)
            </button>
            <button
              onClick={() => setFilter('out')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                filter === 'out' ? 'bg-red-600/20 text-red-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Habis (0)
            </button>
          </div>
          
          <button 
            onClick={fetchInitialData}
            className="p-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>

      </div>

      {/* 2. INVENTORY TABLE */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Internal Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Harga Gudang</th>
                <th className="px-6 py-4 text-center">Stok Gudang</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500 font-medium">
                    Tidak ada produk gudang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock < 30;
                  const isOut = p.stock === 0;
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{p.name}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-300">{p.sku}</td>
                      <td className="px-6 py-4 font-mono text-slate-300">{formatRupiah(p.price)}</td>
                      <td className="px-6 py-4 text-center font-semibold font-mono">
                        <span 
                          className={`px-2.5 py-1 rounded text-xs ${
                            isOut ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            isLow ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isOut ? (
                          <span className="flex items-center justify-center gap-1.5 text-red-400 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="flex items-center justify-center gap-1.5 text-amber-400 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Low Stock
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Healthy
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${p.id}`}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-all"
                            title="Lihat Detail & Riwayat"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 rounded border border-blue-500/10 transition-all"
                            title="Edit Stok"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleManualSync(p)}
                            className="p-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 rounded border border-emerald-500/10 transition-all"
                            title="Sync Semua Marketplace"
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. STOCK EDIT MODAL */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="font-bold text-white text-sm">Update Gudang Stok</span>
              <button 
                onClick={() => setEditProduct(null)} 
                className="text-slate-400 hover:text-white text-sm"
              >
                Tutup
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase font-mono">{editProduct.sku}</span>
                <h4 className="text-sm font-bold text-white leading-snug">{editProduct.name}</h4>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Stok Level Baru</label>
                <input
                  type="number"
                  min="0"
                  value={editStockValue}
                  onChange={(e) => setEditStockValue(Math.max(0, parseInt(e.target.value, 10)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex gap-2.5 items-start text-[11px] text-slate-400">
                <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-normal">
                  Mengubah stok di gudang aggregator akan memicu antrean sinkronisasi stok secara otomatis ke semua SKU marketplace yang terhubung.
                </p>
              </div>

              <button
                onClick={handleSaveStock}
                disabled={updating}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg text-xs transition-all flex items-center justify-center gap-2"
              >
                {updating ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : 'Simpan & Sinkronkan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Products;
