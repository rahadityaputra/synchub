import { create } from "zustand";
import api from "../lib/api";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

const normalizeProduct = (product) => {
    if (!product) return product;

    return {
        ...product,
        sku: product.sku || product.internalSku || product.internal_sku || "",
    };
};

const normalizeProductList = (products) =>
    Array.isArray(products) ? products.map(normalizeProduct) : [];

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

            set({
                marketplaces: marketsRes.data.data,
                products: normalizeProductList(productsRes.data.data),
                mappings: mappingsRes.data.data,
                orders: ordersRes.data.data,
                syncLogs: syncRes.data.data,
                payloadLogs: payloadRes.data.data,
                queues: queuesRes.data.data,
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
            const detail = res.data.data;

            set({
                currentProduct: detail
                    ? {
                          ...detail,
                          product: normalizeProduct(detail.product),
                      }
                    : detail,
            });
            return detail;
        } catch (err) {
            console.error("Error fetching product detail:", err);
            return null;
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

    fetchOrderDetail: async (id) => {
        try {
            const res = await api.get(`/orders/${id}`);
            set({ currentOrder: res.data.data });
            return res.data.data;
        } catch (err) {
            console.error("Error fetching order detail:", err);
            return null;
        }
    },

    updateProductStock: async (id, stock) => {
        try {
            const res = await api.patch(`/products/${id}/stock`, { stock });
            // Update local state immediately
            set((state) => ({
                products: state.products.map((p) =>
                    p.id === id ? { ...p, stock } : p,
                ),
                currentProduct:
                    state.currentProduct?.product?.id === id
                        ? {
                              ...state.currentProduct,
                              product: {
                                  ...state.currentProduct.product,
                                  stock,
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
                mappings: [res.data.data, ...state.mappings],
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
            set((state) => ({
                products: state.products.map((p) =>
                    p.sku === data.sku ? { ...p, stock: data.stock } : p,
                ),
                currentProduct:
                    state.currentProduct?.product?.sku === data.sku
                        ? {
                              ...state.currentProduct,
                              product: {
                                  ...state.currentProduct.product,
                                  stock: data.stock,
                              },
                          }
                        : state.currentProduct,
            }));
            get().addNotification(
                "info",
                `📦 Stok SKU ${data.sku} disinkronkan ke: ${data.stock}`,
            );
        });

        // Real-time new order
        socket.on("new-order", (data) => {
            get().addNotification(
                "success",
                `🔔 Pesanan baru masuk dari ${data.marketplace}! Kode: ${data.order_code}`,
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
                set({ queues: res.data.data });
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
