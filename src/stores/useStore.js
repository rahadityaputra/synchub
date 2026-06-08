import { create } from "zustand";
import api from "../lib/api";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";

const normalizeProduct = (product) => {
    if (!product) return product;

    const images = Array.isArray(product.images)
        ? product.images
        : Array.isArray(product.imageUrls)
          ? product.imageUrls
          : Array.isArray(product.media)
            ? product.media
            : [];

    return {
        ...product,
        internalSku:
            product.internalSku || product.internal_sku || product.sku || "",
        sku: product.sku || product.internalSku || product.internal_sku || "",
        description: product.description || "",
        category: product.category || "",
        brand: product.brand || "",
        price: Number(product.price ?? 0),
        stock: Number(product.stock ?? 0),
        weight: Number(product.weight ?? 0),
        status: product.status || "ACTIVE",
        images,
        thumbnail: images[0] || product.thumbnail || "",
        createdAt: product.createdAt || product.created_at || null,
        updatedAt: product.updatedAt || product.updated_at || null,
    };
};

const normalizeProductDetail = (detail) => {
    if (!detail) return detail;

    // Backend may return product as nested { product: {...}, mappings: [...] }
    // or as a flat object { id, name, marketplaceMappings: [...], ... }
    const productData = detail.product || detail;

    // Support both field names: mappings / marketplaceMappings
    const rawMappings =
        detail.mappings ||
        detail.marketplaceMappings ||
        detail.product?.mappings ||
        detail.product?.marketplaceMappings ||
        [];

    return {
        ...detail,
        product: normalizeProduct(productData),
        mappings: normalizeMappingList(rawMappings),
        orderHistory: Array.isArray(detail.orderHistory) ? detail.orderHistory : [],
        syncHistory: Array.isArray(detail.syncHistory) ? detail.syncHistory : [],
        activityLogs: Array.isArray(detail.activityLogs) ? detail.activityLogs : [],
    };
};

const normalizeProductList = (products) =>
    Array.isArray(products) ? products.map(normalizeProduct) : [];

const normalizeMapping = (mapping) => {
    if (!mapping) return mapping;

    return {
        ...mapping,
        marketplace: mapping.marketplace || "",
        marketplaceSku: mapping.marketplaceSku || mapping.marketplace_sku || "",
        marketplace_sku:
            mapping.marketplace_sku || mapping.marketplaceSku || "",
        internalSku: mapping.internalSku || mapping.internal_sku || "",
        internal_sku: mapping.internal_sku || mapping.internalSku || "",
        productId: mapping.productId || mapping.product_id || null,
        product_id: mapping.product_id || mapping.productId || null,
        marketplaceProductId:
            mapping.marketplaceProductId ||
            mapping.marketplace_product_id ||
            null,
        marketplace_product_id:
            mapping.marketplace_product_id ||
            mapping.marketplaceProductId ||
            null,
        createdAt: mapping.createdAt || mapping.created_at || null,
        created_at: mapping.created_at || mapping.createdAt || null,
        updatedAt: mapping.updatedAt || mapping.updated_at || null,
        updated_at: mapping.updated_at || mapping.updatedAt || null,
    };
};

const normalizeMappingList = (mappings) =>
    Array.isArray(mappings) ? mappings.map(normalizeMapping) : [];

const normalizeSyncLog = (log) => {
    if (!log) return log;

    const requestPayload = log.requestPayload || {};
    const responsePayload = log.responsePayload || {};

    return {
        ...log,
        productId: log.productId || log.product_id || null,
        marketplace: log.marketplace || requestPayload.marketplace || "",
        action: log.action || "",
        requestPayload,
        responsePayload,
        sku:
            log.sku ||
            requestPayload.marketplace_sku ||
            requestPayload.marketplaceSku ||
            responsePayload.marketplace_sku ||
            responsePayload.marketplaceSku ||
            "",
        internalSku:
            log.internalSku ||
            log.internal_sku ||
            requestPayload.internal_sku ||
            requestPayload.internalSku ||
            responsePayload.internal_sku ||
            responsePayload.internalSku ||
            "",
        internal_sku:
            log.internal_sku ||
            log.internalSku ||
            requestPayload.internal_sku ||
            requestPayload.internalSku ||
            responsePayload.internal_sku ||
            responsePayload.internalSku ||
            "",
        status: log.status || "PENDING",
        error: log.error || log.errorMessage || null,
        errorMessage: log.errorMessage || log.error || null,
        timestamp:
            log.timestamp ||
            log.createdAt ||
            log.created_at ||
            responsePayload.updatedAt ||
            null,
        createdAt: log.createdAt || log.created_at || null,
        updatedAt: log.updatedAt || log.updated_at || null,
    };
};

const normalizeSyncLogList = (logs) =>
    Array.isArray(logs) ? logs.map(normalizeSyncLog) : [];

export const useStore = create((set, get) => ({
    // State variables
    socket: null,
    socketConnected: false,
    marketplaces: [],
    products: [],
    mappings: [],
    orders: [],
    syncLogs: [],
    payloadLogs: [],
    queues: [],
    notifications: [],
    activityFeed: [],
    currentProduct: null,
    currentOrder: null,
    loading: false,
    error: null,

    // Fetch initial data
    fetchInitialData: async () => {
        set({ loading: true });
        try {
            const [
                marketsRes,
                productsRes,
                mappingsRes,
                ordersRes,
                syncRes,
                payloadRes,
                queuesRes,
            ] = await Promise.all([
                api.get("/marketplaces"),
                api.get("/products"),
                api.get("/mappings"),
                api.get("/orders"),
                api.get("/sync-logs"),
                api.get("/payload-logs"),
                api.get("/queues"),
            ]);
            console.log("Initial data fetched:", {
                marketplaces: marketsRes.data?.data,
                products: productsRes.data?.data,
                mappings: mappingsRes.data?.data,
                orders: ordersRes.data?.data,
                syncLogs: syncRes.data?.data?.[0],
                payloadLogs: payloadRes.data?.data,
                queues: queuesRes.data?.data,
            });
            set({
                marketplaces: marketsRes.data?.data || [],
                products: normalizeProductList(productsRes.data?.data),
                mappings: normalizeMappingList(mappingsRes.data?.data),
                orders: ordersRes.data?.data || [],
                syncLogs: normalizeSyncLogList(syncRes.data?.data),
                payloadLogs: payloadRes.data?.data || [],
                queues: Array.isArray(queuesRes.data?.data) ? queuesRes.data.data : (Array.isArray(queuesRes.data) ? queuesRes.data : []),
                loading: false,
            });
        } catch (err) {
            console.error(
                "Error fetching E-Commerce Aggregator initial data:",
                err,
            );
            set({ error: err.message, loading: false });
        }
    },

    // Manual API calls
    fetchProductDetail: async (id) => {
        try {
            const res = await api.get(`/products/${id}`);
            const detail = normalizeProductDetail(res.data.data);

            set({ currentProduct: detail });
            return detail;
        } catch (err) {
            console.error("Error fetching product detail:", err);
            return null;
        }
    },

    uploadProductImages: async (files, onProgress) => {
        try {
            const formData = new FormData();

            files.forEach((file) => {
                formData.append("images", file);
            });

            const res = await api.post("/products/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (event) => {
                    if (!onProgress || !event.total) return;

                    const progress = Math.round(
                        (event.loaded * 100) / event.total,
                    );
                    onProgress(progress);
                },
            });

            return Array.isArray(res.data?.images)
                ? res.data.images
                : Array.isArray(res.data?.data?.images)
                  ? res.data.data.images
                  : [];
        } catch (err) {
            console.error("Error uploading product images:", err);
            get().addNotification(
                "error",
                `Gagal mengunggah gambar: ${err.response?.data?.message || err.message}`,
            );
            return [];
        }
    },

    createProduct: async (productData) => {
        try {
            const res = await api.post("/products", productData);
            const createdProduct = normalizeProduct(
                res.data.data?.product || res.data.data || productData,
            );

            set((state) => ({
                products: [createdProduct, ...state.products],
            }));

            get().addNotification(
                "success",
                `Produk berhasil ditambahkan: ${createdProduct.name}`,
            );
            return createdProduct;
        } catch (err) {
            console.error("Error creating product:", err);
            get().addNotification(
                "error",
                `Gagal menambahkan produk: ${err.response?.data?.message || err.message}`,
            );
            return null;
        }
    },

    updateProduct: async (id, productData) => {
        try {
            const res = await api.patch(`/products/${id}`, productData);
            const updatedProduct = normalizeProduct(
                res.data.data?.product || res.data.data || productData,
            );

            set((state) => ({
                products: state.products.map((product) =>
                    product.id === updatedProduct.id || product.id === id
                        ? { ...product, ...updatedProduct }
                        : product,
                ),
                currentProduct:
                    state.currentProduct?.product?.id === updatedProduct.id ||
                    state.currentProduct?.product?.id === id
                        ? {
                              ...state.currentProduct,
                              product: {
                                  ...state.currentProduct.product,
                                  ...updatedProduct,
                              },
                          }
                        : state.currentProduct,
            }));

            get().addNotification(
                "success",
                `Produk diperbarui: ${updatedProduct.name}`,
            );
            return updatedProduct;
        } catch (err) {
            console.error("Error updating product:", err);
            get().addNotification(
                "error",
                `Gagal memperbarui produk: ${err.response?.data?.message || err.message}`,
            );
            return null;
        }
    },

    archiveProduct: async (id) => {
        return get().updateProduct(id, { status: "ARCHIVED" });
    },

    fetchOrderDetail: async (id) => {
        try {
            const res = await api.get(`/orders/${id}`);
            const raw = res.data.data;

            if (!raw) {
                set({ currentOrder: null });
                return null;
            }

            set({ currentOrder: raw });
            return raw;
        } catch (err) {
            console.error("Error fetching order detail:", err);
            set({ currentOrder: null });
            return null;
        }
    },

    updateProductStock: async (id, stock) => {
        try {
            const res = await api.patch(`/products/${id}/stock`, { stock });
            // Update local state immediately
            set((state) => ({
                products: state.products.map((p) =>
                    p.id === id ? { ...p, stock: Number(stock) } : p,
                ),
                currentProduct:
                    state.currentProduct?.product?.id === id
                        ? {
                              ...state.currentProduct,
                              product: {
                                  ...state.currentProduct.product,
                                  stock: Number(stock),
                              },
                          }
                        : state.currentProduct,
            }));
            get().addNotification(
                "success",
                `Stok diperbarui manual: ${stock}`,
            );
            return res.data.success;
        } catch (err) {
            console.error("Error updating stock:", err);
            get().addNotification(
                "error",
                `Gagal memperbarui stok: ${err.message}`,
            );
            return false;
        }
    },

    syncProductStock: async (id) => {
        try {
            const res = await api.post(`/sync/stock/${id}`);
            get().addNotification(
                "info",
                "Sinkronisasi stok manual dimasukkan ke antrean.",
            );
            return res.data.success;
        } catch (err) {
            console.error("Error triggering sync:", err);
            get().addNotification(
                "error",
                `Gagal memicu sinkronisasi: ${err.message}`,
            );
            return false;
        }
    },

    createMapping: async (mappingData) => {
        try {
            const res = await api.post("/mappings", mappingData);
            set((state) => ({
                mappings: [normalizeMapping(res.data.data), ...state.mappings],
            }));
            // Re-fetch unmapped and products to align
            get().fetchInitialData();
            get().addNotification("success", "Mapping baru berhasil dibuat.");
            return res.data.success;
        } catch (err) {
            console.error("Error creating mapping:", err);
            get().addNotification(
                "error",
                `Gagal membuat mapping: ${err.response?.data?.message || err.message}`,
            );
            return false;
        }
    },

    deleteMapping: async (id) => {
        try {
            const res = await api.delete(`/mappings/${id}`);
            set((state) => ({
                mappings: state.mappings.filter((m) => m.id !== id),
            }));
            get().addNotification("success", "Mapping berhasil dihapus.");
            return res.data.success;
        } catch (err) {
            console.error("Error deleting mapping:", err);
            get().addNotification(
                "error",
                `Gagal menghapus mapping: ${err.message}`,
            );
            return false;
        }
    },

    retryQueueJob: async (id) => {
        try {
            const res = await api.post(`/queues/${id}/retry`);
            get().addNotification(
                "info",
                `Mencoba kembali pekerjaan antrean ${id}`,
            );
            return res.data.success;
        } catch (err) {
            console.error("Error retrying queue job:", err);
            get().addNotification(
                "error",
                `Gagal mengulangi pekerjaan: ${err.message}`,
            );
            return false;
        }
    },

    toggleMarketplace: async (id) => {
        try {
            const res = await api.patch(`/marketplaces/${id}/toggle`);
            set((state) => ({
                marketplaces: state.marketplaces.map((m) =>
                    m.id === id ? { ...m, status: res.data.data.status } : m,
                ),
            }));
            get().addNotification(
                "info",
                `${res.data.data.name} status diubah ke ${res.data.data.status}`,
            );
            return res.data.success;
        } catch (err) {
            console.error("Error toggling marketplace:", err);
            get().addNotification(
                "error",
                `Gagal mengubah status marketplace: ${err.message}`,
            );
            return false;
        }
    },

    // Notification management
    addNotification: (type, message) => {
        const id = Date.now().toString();
        set((state) => ({
            notifications: [
                { id, type, message, timestamp: new Date() },
                ...state.notifications,
            ].slice(0, 20),
        }));
        // Auto remove after 5 seconds
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            }));
        }, 5000);
    },

    // Initialize socket.io connection
    initSocket: () => {
        if (get().socket) return;

        const socket = io(SOCKET_URL);

        socket.on("connect", () => {
            set({ socketConnected: true });
            console.log("[SOCKET] Connected to E-Commerce Aggregator Backend");
        });

        socket.on("disconnect", () => {
            set({ socketConnected: false });
            console.log(
                "[SOCKET] Disconnected from E-Commerce Aggregator Backend",
            );
        });

        // Real-time stock update
        socket.on("stock-updated", (data) => {
            console.log("[SOCKET] stock-updated payload:", data);
            
            const productId = data.productId || data.product_id || data.id || null;
            
            // Try to find the product in local state as fallback
            const localProduct = get().products.find(p => p.id === productId) || {};

            // Normalize field names — backend may use snake_case or camelCase
            const sku =
                data.sku ||
                data.marketplace_sku ||
                data.marketplaceSku ||
                data.internalSku ||
                data.internal_sku ||
                localProduct.sku ||
                localProduct.internalSku ||
                "–";
                
            const newStock = data.stock ?? data.newStock ?? data.updatedStock ?? data.quantity ?? localProduct.stock;
            const marketplace = data.marketplace || data.marketplaceName || null;

            set((state) => ({
                products: state.products.map((p) =>
                    p.sku === sku || p.id === productId
                        ? { ...p, stock: Number(newStock) }
                        : p,
                ),
                currentProduct:
                    state.currentProduct &&
                    ((sku && sku !== "–" && state.currentProduct.product?.sku === sku) ||
                     (productId && state.currentProduct.product?.id === productId))
                        ? {
                              ...state.currentProduct,
                              product: {
                                  ...state.currentProduct.product,
                                  stock: Number(newStock),
                              },
                          }
                        : state.currentProduct,
            }));

            const toLabel = marketplace
                ? `marketplace ${marketplace}`
                : `semua marketplace`;
            get().addNotification(
                "info",
                `📦 Stok SKU ${sku} diperbarui menjadi ${newStock ?? "–"} (${toLabel})`,
            );
        });

        // Real-time new order
        socket.on("new-order", (data) => {
            console.log("[SOCKET] new-order:", data);
            // Backend may use snake_case or camelCase for order ID
            const orderId =
                data.order_id ||
                data.orderId ||
                data.id ||
                "–";
            const marketplace =
                data.marketplace ||
                data.marketplaceName ||
                data.source ||
                "marketplace";
            get().addNotification(
                "success",
                `🛒 Pesanan baru masuk dari ${marketplace}! Kode: ${orderId}`,
            );
        });

        // Real-time sync failure
        socket.on("sync-failed", (data) => {
            get().addNotification(
                "error",
                `⚠️ Sinkronisasi ${data.marketplace} Gagal: ${data.message}`,
            );
        });

        // Real-time queue jobs update
        socket.on("queue-updated", () => {
            // Re-fetch queues list to see new statuses
            api.get("/queues").then((res) => {
                set({ queues: Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []) });
            });
        });

        // Real-time logs and mappings updates
        socket.on("sync-log-update", () => {
            api.get("/sync-logs").then((res) => {
                set({ syncLogs: res.data.data });
            });
        });

        socket.on("payload-log-update", () => {
            api.get("/payload-logs").then((res) => {
                set({ payloadLogs: res.data.data });
            });
        });

        socket.on("order-update", () => {
            api.get("/orders").then((res) => {
                set({ orders: res.data.data });
            });
        });

        socket.on("marketplace-update", (updatedMarket) => {
            set((state) => ({
                marketplaces: state.marketplaces.map((m) =>
                    m.id === updatedMarket.id ? updatedMarket : m,
                ),
            }));
        });

        socket.on("activity-feed", (activity) => {
            set((state) => ({
                activityFeed: [activity, ...state.activityFeed].slice(0, 50),
            }));
        });

        set({ socket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, socketConnected: false });
        }
    },
}));
