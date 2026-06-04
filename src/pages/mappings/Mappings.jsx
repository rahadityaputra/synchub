import React, { useState } from "react";
import { useStore } from "../../stores/useStore";
import { Link2, Trash2, Plus, RefreshCw } from "lucide-react";

function Mappings() {
  const { mappings, products, createMapping, deleteMapping, fetchInitialData } =
    useStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Mapping State
  const [marketplace, setMarketplace] = useState("shopee");
  const [marketplaceSku, setMarketplaceSku] = useState("");
  const [internalSku, setInternalSku] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "-";

  const handleOpenCreate = () => {
    setMarketplace("shopee");
    setMarketplaceSku("");
    if (products.length > 0) setInternalSku(products[0].sku);
    setCreateModalOpen(true);
  };

  const handleSaveMapping = async (e) => {
    e.preventDefault();
    if (!marketplaceSku.trim() || !internalSku) {
      alert("Semua bidang harus diisi!");
      return;
    }
    setSubmitting(true);
    const success = await createMapping({
      marketplace,
      marketplace_sku: marketplaceSku.trim().toUpperCase(),
      internal_sku: internalSku,
    });
    if (success) {
      setCreateModalOpen(false);
    }
    setSubmitting(false);
  };

  const handleDeleteMapping = async (id) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus mapping SKU ini? Sinkronisasi stok untuk channel ini akan dihentikan.",
      )
    ) {
      await deleteMapping(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. MAPPING MANAGEMENT CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20 shrink-0">
            <Link2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              SKU Mapping Channel
            </h3>
            <p className="text-xs text-slate-400">
              Hubungkan SKU marketplace dengan SKU gudang utama
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all"
          >
            <Plus size={14} /> Tambah Mappings
          </button>

          <button
            onClick={fetchInitialData}
            className="p-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 2. MAPPING TABLE */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Marketplace</th>
                <th className="px-6 py-4">Marketplace SKU</th>
                <th className="px-6 py-4">Internal SKU (Gudang)</th>
                <th className="px-6 py-4">Product ID</th>
                <th className="px-6 py-4">Marketplace Product ID</th>
                <th className="px-6 py-4">Nama Produk Gudang</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4">Updated At</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mappings.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-10 text-slate-500 font-medium"
                  >
                    Tidak ada SKU mapping ditemukan. Klik "Tambah Mappings"
                    untuk menghubungkan.
                  </td>
                </tr>
              ) : (
                mappings.map((m) => {
                  const linkedProduct = products.find(
                    (p) => p.sku === m.internalSku,
                  );
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-300 capitalize">
                        {m.marketplace}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        {m.marketplaceSku}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-blue-400">
                        {m.internalSku}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">
                        {m.productId ?? "-"}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">
                        {m.marketplaceProductId ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-medium">
                        {linkedProduct ? linkedProduct.name : "Unknown Product"}
                      </td>
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {formatDate(m.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {formatDate(m.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                          SYNC ACTIVE
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteMapping(m.id)}
                          className="p-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded border border-red-500/10 transition-all"
                          title="Hapus Koneksi Mapping"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. CREATE MAPPING MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                Hubungkan SKU Baru
              </span>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSaveMapping} className="p-5 space-y-4">
              {/* Marketplace Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Pilih Marketplace
                </label>
                <select
                  value={marketplace}
                  onChange={(e) => setMarketplace(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="shopee">Shopee</option>
                  <option value="tokopedia">Tokopedia</option>
                  <option value="lazada">Lazada</option>
                </select>
              </div>

              {/* Marketplace SKU Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Marketplace SKU
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SHP-ELEC-001"
                  value={marketplaceSku}
                  onChange={(e) => setMarketplaceSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:border-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>

              {/* Internal SKU Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Internal SKU (Gudang)
                </label>
                <select
                  value={internalSku}
                  onChange={(e) => setInternalSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:border-blue-500 focus:outline-none font-mono"
                  required
                >
                  {products.length === 0 ? (
                    <option value="">Tidak ada produk internal</option>
                  ) : (
                    products.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} - {p.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg text-xs transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "Buat Koneksi Mappings"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mappings;
