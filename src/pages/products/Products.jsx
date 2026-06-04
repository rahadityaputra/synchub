import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../../stores/useStore";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Filter,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const STOCK_FILTERS = [
  { label: "Semua", value: "all" },
  { label: "Stok Rendah", value: "low" },
  { label: "Habis", value: "out" },
  { label: "Tersedia", value: "available" },
];

const STATUS_FILTERS = ["all", "ACTIVE", "DRAFT", "ARCHIVED"];
const PAGE_SIZE_OPTIONS = [10, 25, 50];

function Products() {
  const {
    products,
    updateProductStock,
    syncProductStock,
    fetchInitialData,
    archiveProduct,
    loading,
  } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [actionState, setActionState] = useState({ id: null, action: null });
  const [archiveTarget, setArchiveTarget] = useState(null);

  const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);
  const limitParam = Number.parseInt(searchParams.get("limit") || "10", 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const limit = Number.isNaN(limitParam) || limitParam < 1 ? 10 : limitParam;

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value || 0);

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("id-ID", { dateStyle: "medium" })
      : "-";

  const setPageParams = (nextPage, nextLimit = limit) => {
    setSearchParams({ page: String(nextPage), limit: String(nextLimit) });
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPageParams(1);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    setPageParams(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPageParams(1);
  };

  const handleStockChange = (value) => {
    setStockFilter(value);
    setPageParams(1);
  };

  const handleLimitChange = (value) => {
    setPageParams(1, value);
  };

  const handleRunAction = async (id, action, runner) => {
    setActionState({ id, action });
    try {
      await runner();
    } finally {
      setActionState({ id: null, action: null });
    }
  };

  const handleArchive = async (product) => {
    setArchiveTarget(product);
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;

    const product = archiveTarget;
    setArchiveTarget(null);

    await handleRunAction(product.id, "archive", () =>
      archiveProduct(product.id),
    );
  };

  const handleSync = async (product) => {
    await handleRunAction(product.id, "sync", () =>
      syncProductStock(product.id),
    );
  };

  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));

  const filteredProducts = products.filter((product) => {
    const productSku = product.sku || product.internalSku || "";
    const searchValue = search.toLowerCase();
    const matchesSearch =
      product.name?.toLowerCase().includes(searchValue) ||
      productSku.toLowerCase().includes(searchValue) ||
      product.brand?.toLowerCase().includes(searchValue) ||
      product.category?.toLowerCase().includes(searchValue);

    if (!matchesSearch) return false;
    if (categoryFilter !== "all" && product.category !== categoryFilter)
      return false;
    if (statusFilter !== "all" && product.status !== statusFilter) return false;

    if (stockFilter === "low") {
      return product.stock > 0 && product.stock < 30;
    }

    if (stockFilter === "out") {
      return product.stock === 0;
    }

    if (stockFilter === "available") {
      return product.stock > 0;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((left, right) => {
    return (
      new Date(right.createdAt || right.updatedAt || 0) -
      new Date(left.createdAt || left.updatedAt || 0)
    );
  });

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / limit));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const visibleProducts = sortedProducts.slice(startIndex, startIndex + limit);

  useEffect(() => {
    if (page > totalPages) {
      setSearchParams(
        { page: String(totalPages), limit: String(limit) },
        { replace: true },
      );
    }
  }, [limit, page, setSearchParams, totalPages]);

  const pageNumbers = [];
  const firstPage = Math.max(1, safePage - 2);
  const lastPage = Math.min(totalPages, firstPage + 4);

  for (let current = firstPage; current <= lastPage; current += 1) {
    pageNumbers.push(current);
  }

  const showSkeleton = loading && products.length === 0;
  const showEmpty = !showSkeleton && filteredProducts.length === 0;
  const archiveBusy =
    actionState.id === archiveTarget?.id && actionState.action === "archive";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300">
            <Sparkles size={12} />
            Product Inventory System
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Produk</h1>
            <p className="text-xs text-slate-400">
              Kelola inventori, gambar produk, status, dan sinkronisasi
              marketplace dari satu layar.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchInitialData}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <Link
            to="/products/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            <Plus size={14} />
            Tambah Produk
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
        <label className="relative xl:col-span-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Cari nama, SKU, brand, kategori..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors focus:border-blue-500"
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:col-span-3">
          <select
            value={categoryFilter}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="all">Semua kategori</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
          >
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "Semua status" : status}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(event) => handleStockChange(event.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
          >
            {STOCK_FILTERS.map((stock) => (
              <option key={stock.value} value={stock.value}>
                {stock.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-blue-400" />
          <span>{filteredProducts.length} produk ditemukan</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Per halaman</span>
          <select
            value={limit}
            onChange={(event) =>
              handleLimitChange(Number.parseInt(event.target.value, 10))
            }
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-4">Thumbnail</th>
                <th className="px-4 py-4">Product Name</th>
                <th className="px-4 py-4">Internal SKU</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Brand</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Stock</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Created</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {showSkeleton ? (
                Array.from({ length: Math.min(limit, 8) }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-12 w-12 rounded-lg bg-slate-800" />
                    </td>
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-4">
                        <div className="h-4 rounded bg-slate-800" />
                      </td>
                    ))}
                    <td className="px-4 py-4 text-right">
                      <div className="ml-auto h-8 w-24 rounded bg-slate-800" />
                    </td>
                  </tr>
                ))
              ) : showEmpty ? (
                <tr>
                  <td colSpan="10" className="px-4 py-16 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-dashed border-slate-800 bg-slate-950/70 p-8 text-center">
                      <div className="rounded-full border border-slate-800 bg-slate-900 p-4 text-blue-400">
                        <ShoppingBag size={22} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-white">
                          Tidak ada produk ditemukan
                        </h3>
                        <p className="text-xs text-slate-400">
                          Coba ubah kata kunci pencarian atau filter kategori
                          dan status.
                        </p>
                      </div>
                      <Link
                        to="/products/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                      >
                        <Plus size={14} />
                        Tambah produk baru
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleProducts.map((product) => {
                  const sku = product.internalSku || product.sku || "-";
                  const thumbnail = product.thumbnail || product.images?.[0];
                  const isLow = product.stock > 0 && product.stock < 30;
                  const isOut = product.stock === 0;
                  const isArchived = product.status === "ARCHIVED";
                  const archiveBusy =
                    actionState.id === product.id &&
                    actionState.action === "archive";
                  const syncBusy =
                    actionState.id === product.id &&
                    actionState.action === "sync";

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="px-4 py-4">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg border border-slate-800 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-600">
                            <Package size={16} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-xs space-y-1">
                          <div className="font-semibold text-white line-clamp-1">
                            {product.name}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-2">
                            {product.description || "No description yet"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-300">
                        {sku}
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {product.category || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {product.brand || "-"}
                      </td>
                      <td className="px-4 py-4 font-mono font-semibold text-white">
                        {formatRupiah(product.price)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex min-w-[3rem] items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                            isOut
                              ? "border-red-500/20 bg-red-500/10 text-red-400"
                              : isLow
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                            product.status === "ACTIVE"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : product.status === "DRAFT"
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                : "border-slate-700 bg-slate-800 text-slate-300"
                          }`}
                        >
                          {product.status || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-400">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${product.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                            title="Detail"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            to={`/products/${product.id}/edit`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleArchive(product)}
                            disabled={isArchived || archiveBusy}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 text-[11px] font-semibold text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Archive"
                          >
                            {archiveBusy ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Archive size={14} />
                            )}
                            {isArchived ? "Archived" : "Archive"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSync(product)}
                            disabled={syncBusy}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Sync Marketplace"
                          >
                            {syncBusy ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <RefreshCw size={14} />
                            )}
                            Sync
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

      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="border-b border-slate-800 bg-slate-950 px-5 py-4">
              <h3 className="text-sm font-semibold text-white">
                Konfirmasi Archive Produk
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Produk ini akan dipindahkan ke status ARCHIVED dan tidak aktif
                lagi untuk sinkronisasi.
              </p>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">
                  Produk
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {archiveTarget.name}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  SKU: {archiveTarget.internalSku || archiveTarget.sku || "-"}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setArchiveTarget(null)}
                  className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmArchive}
                  disabled={archiveBusy}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {archiveBusy ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Archive size={14} />
                  )}
                  Archive Produk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showSkeleton && filteredProducts.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>
            Menampilkan {startIndex + 1} -{" "}
            {Math.min(
              startIndex + visibleProducts.length,
              sortedProducts.length,
            )}{" "}
            dari {sortedProducts.length} produk
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPageParams(safePage - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              Prev
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPageParams(pageNumber)}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition-all ${
                  pageNumber === safePage
                    ? "bg-blue-600 text-white"
                    : "border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setPageParams(safePage + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Products;
