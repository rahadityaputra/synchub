import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../../stores/useStore";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Image as ImageIcon,
  Layers3,
  Link2,
  Loader2,
  Package,
  Play,
  RefreshCw,
  Truck,
  X,
} from "lucide-react";

function ProductDetail() {
  const { id } = useParams();
  const { fetchProductDetail, currentProduct, syncProductStock } = useStore();
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      setLoading(true);
      await fetchProductDetail(id);
      if (active) {
        setLoading(false);
      }
    };

    loadDetail();

    return () => {
      active = false;
    };
  }, [fetchProductDetail, id]);

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value || 0);

  const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString("id-ID") : "-";

  const product = currentProduct?.product || currentProduct;
  const mappings = currentProduct?.mappings || [];
  const syncHistory = currentProduct?.syncHistory || [];
  const orderHistory = currentProduct?.orderHistory || [];
  const activityLogs = currentProduct?.activityLogs || [];

  const images = useMemo(() => {
    const nextImages = Array.isArray(product?.images)
      ? product.images.filter(Boolean)
      : [];
    if (nextImages.length > 0) return nextImages;
    if (product?.thumbnail) return [product.thumbnail];
    return [];
  }, [product?.images, product?.thumbnail]);

  useEffect(() => {
    if (activeImageIndex >= images.length) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, images.length]);

  const handleManualSync = async () => {
    if (!product?.id) return;
    setSyncing(true);
    try {
      await syncProductStock(product.id);
    } finally {
      setSyncing(false);
    }
  };

  const combinedTimeline = useMemo(() => {
    if (Array.isArray(activityLogs) && activityLogs.length > 0) {
      return activityLogs;
    }

    const syncEntries = syncHistory.map((entry) => ({
      id: `sync-${entry.id}`,
      type: "sync",
      title: `${entry.marketplace || "Marketplace"} sync`,
      status: entry.status,
      description:
        entry.action ||
        `Sinkronisasi stok ${entry.stock ?? product?.stock ?? 0}`,
      timestamp: entry.timestamp || entry.createdAt,
    }));

    const orderEntries = orderHistory.map((entry) => ({
      id: `order-${entry.id}`,
      type: "order",
      title: entry.marketplace_order_id || "Order activity",
      status: entry.status || "DONE",
      description: `${entry.marketplace || "Marketplace"} · Qty ${entry.quantity || 0}`,
      timestamp: entry.createdAt || entry.timestamp,
    }));

    return [...syncEntries, ...orderEntries].sort(
      (left, right) =>
        new Date(right.timestamp || 0) - new Date(left.timestamp || 0),
    );
  }, [activityLogs, orderHistory, product?.stock, syncHistory]);

  const stockSyncRows =
    syncHistory.length > 0
      ? syncHistory
      : mappings.map((mapping) => ({
          id: mapping.id,
          marketplace: mapping.marketplace,
          stock: product?.stock ?? 0,
          status: product?.status === "ARCHIVED" ? "Archived" : "Synced",
          timestamp: product?.updatedAt || product?.createdAt,
        }));

  const statusBadgeClass =
    product?.status === "ACTIVE"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : product?.status === "DRAFT"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
        : "border-slate-700 bg-slate-800 text-slate-300";

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-40 rounded bg-slate-800" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <div className="h-72 rounded-xl border border-slate-800 bg-slate-900" />
            <div className="h-80 rounded-xl border border-slate-800 bg-slate-900" />
          </div>
          <div className="space-y-4">
            <div className="h-72 rounded-xl border border-slate-800 bg-slate-900" />
            <div className="h-72 rounded-xl border border-slate-800 bg-slate-900" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-6 text-xs font-semibold text-red-400">
          Produk tidak ditemukan atau gagal dimuat.
        </div>
      </div>
    );
  }

  const currentImage = images[activeImageIndex] || images[0] || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Kembali ke daftar produk
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass}`}
            >
              {product.status || "-"}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300">
              Product Detail
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">{product.name}</h1>
          <p className="max-w-3xl text-xs text-slate-400">
            {product.description || "Tidak ada deskripsi produk."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/products/${product.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20"
          >
            <Play size={14} />
            Edit Produk
          </Link>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {syncing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Sinkronisasi Stok
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="glass-panel rounded-xl p-6 xl:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">
              Product Information
            </h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Internal SKU
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  {product.internalSku || product.sku || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Category
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {product.category || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Brand
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {product.brand || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Price
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  {formatRupiah(product.price)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Stock
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  {product.stock ?? 0} pcs
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Weight
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  {product.weight ?? 0} gram
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Created
                </span>
                <span className="text-xs text-slate-300">
                  {formatDateTime(product.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Updated
                </span>
                <span className="text-xs text-slate-300">
                  {formatDateTime(product.updatedAt)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Description
              </div>
              <p className="text-xs leading-6 text-slate-300">
                {product.description || "Tidak ada deskripsi tambahan."}
              </p>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-xl p-6 xl:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">
              Product Gallery
            </h2>
          </div>

          {images.length > 0 ? (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="h-[22rem] w-full object-cover"
                  onClick={() => setPreviewImage(currentImage)}
                  role="button"
                />
                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex(
                          (value) =>
                            (value - 1 + images.length) % images.length,
                        )
                      }
                      className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700 bg-black/50 text-white hover:bg-black/70"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex(
                          (value) => (value + 1) % images.length,
                        )
                      }
                      className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700 bg-black/50 text-white hover:bg-black/70"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                ) : null}
              </div>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-6">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`overflow-hidden rounded-lg border transition-all ${
                      index === activeImageIndex
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-slate-800"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-20 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 text-center text-xs text-slate-500">
              <div className="rounded-full border border-slate-800 bg-slate-900 p-4 text-blue-400">
                <ImageIcon size={22} />
              </div>
              <p className="mt-3 font-semibold text-slate-200">
                Tidak ada gallery image
              </p>
              <p className="mt-1 max-w-sm leading-6 text-slate-500">
                Produk ini belum memiliki gambar. Gunakan halaman edit untuk
                menambahkan image baru.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="glass-panel rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">
              Marketplace Mapping
            </h2>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Marketplace</th>
                  <th className="px-4 py-3">Marketplace SKU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {mappings.length > 0 ? (
                  mappings.map((mapping) => (
                    <tr key={mapping.id} className="bg-slate-950/50">
                      <td className="px-4 py-3 font-semibold text-slate-200 capitalize">
                        {mapping.marketplace}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {mapping.marketplace_sku}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="2"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Produk ini belum memiliki mapping marketplace.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-panel rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">
              Stock Synchronization
            </h2>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Marketplace</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stockSyncRows.length > 0 ? (
                  stockSyncRows.map((row) => (
                    <tr key={row.id} className="bg-slate-950/50">
                      <td className="px-4 py-3 font-semibold text-slate-200 capitalize">
                        {row.marketplace}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {row.stock}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                            String(row.status).toUpperCase() === "SUCCESS" ||
                            String(row.status).toUpperCase() === "SYNCED"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : String(row.status).toUpperCase() === "FAILED"
                                ? "border-red-500/20 bg-red-500/10 text-red-400"
                                : "border-slate-700 bg-slate-800 text-slate-300"
                          }`}
                        >
                          <CheckCircle2 size={12} />
                          {row.status || "Synced"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Belum ada data sinkronisasi stok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="glass-panel rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Layers3 size={18} className="text-blue-400" />
          <h2 className="text-sm font-semibold text-white">
            Product Activity Logs
          </h2>
        </div>

        <div className="space-y-3">
          {combinedTimeline.length > 0 ? (
            combinedTimeline.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {entry.title || entry.marketplace || "Activity"}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                      {entry.type || "log"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {entry.description || entry.action || "Aktivitas produk"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>{formatDateTime(entry.timestamp)}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                      String(entry.status).toUpperCase() === "SUCCESS" ||
                      String(entry.status).toUpperCase() === "COMPLETED"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : String(entry.status).toUpperCase() === "FAILED"
                          ? "border-red-500/20 bg-red-500/10 text-red-400"
                          : "border-slate-700 bg-slate-800 text-slate-300"
                    }`}
                  >
                    {String(entry.status || "DONE").toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/60 p-8 text-center text-xs text-slate-500">
              Belum ada activity log untuk produk ini.
            </div>
          )}
        </div>
      </section>

      {previewImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-black/60 text-white hover:bg-black"
            >
              <X size={16} />
            </button>
            <img
              src={previewImage}
              alt={product.name}
              className="max-h-[85vh] w-full object-contain bg-black"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ProductDetail;
