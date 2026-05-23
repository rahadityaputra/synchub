import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useStore } from "../stores/useStore";
import mockApi from "../lib/mockApi";
import {
  LayoutDashboard,
  Package,
  Link2,
  ShoppingCart,
  History,
  Code,
  Cpu,
  BarChart3,
  MonitorPlay,
  Wifi,
  WifiOff,
  Bell,
  Play,
  Menu,
  X,
} from "lucide-react";

function MainLayout() {
  const { socketConnected, notifications, activityFeed, products } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Simulator State
  const [simMarketplace, setSimMarketplace] = useState("shopee");
  const [simProduct, setSimProduct] = useState("");
  const [simQty, setSimQty] = useState(1);
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Package },
    {
      name: "SKU Mappings",
      path: "/mappings",
      icon: Link2,
    },
    { name: "Orders", path: "/orders", icon: ShoppingCart },
    { name: "Sync Logs", path: "/sync-logs", icon: History },
    { name: "Payload Logs", path: "/payload-logs", icon: Code },
    { name: "Queues", path: "/queues", icon: Cpu },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Marketplaces", path: "/marketplaces", icon: MonitorPlay },
  ];

  // Trigger simulation order
  const handleSimulateOrder = async () => {
    if (!simProduct) {
      alert("Silakan pilih produk untuk simulasi!");
      return;
    }
    setSimLoading(true);
    setSimResult(null);
    try {
      // Login to mock API first
      const loginRes = await mockApi.post("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
      const token = loginRes.data.data.token;

      // Post order to mock API (this triggers webhook -> queue -> sync!)
      const orderRes = await mockApi.post(
        `/${simMarketplace.toLowerCase()}/orders`,
        {
          productId: simProduct,
          quantity: simQty,
          shippingAddress: {
            name: "Budi Santoso",
            street: "Jl. Pemuda No. 123",
            city: "Surabaya",
            postalCode: "60111",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSimResult({
        success: true,
        message: `Order ${orderRes.data.data.order.marketplace_order_id} sukses dibuat!`,
      });
    } catch (err) {
      console.error(err);
      setSimResult({
        success: false,
        message: `Simulasi gagal: ${err.response?.data?.message || err.message}`,
      });
    } finally {
      setSimLoading(false);
    }
  };

  // Products available for selected simulated marketplace
  const getSimMarketplaceProducts = () => {
    // We hardcode native products matching mock-api database for seeding simplicity
    if (simMarketplace === "shopee") {
      return [
        {
          id: "SHP-ELEC-001-ID",
          sku: "SHP-ELEC-001",
          name: "Wireless Bluetooth Earbuds Pro (SHP-ELEC-001)",
        },
        {
          id: "SHP-FASH-002-ID",
          sku: "SHP-FASH-002",
          name: "Slim Fit Cotton Polo Shirt (SHP-FASH-002)",
        },
        {
          id: "SHP-HOME-003-ID",
          sku: "SHP-HOME-003",
          name: "Ceramic Non-Stick Frying Pan (SHP-HOME-003)",
        },
        {
          id: "SHP-SPORT-004-ID",
          sku: "SHP-SPORT-004",
          name: "[UNMAPPED] Running Shoes Lightweight (SHP-SPORT-004)",
        },
        {
          id: "SHP-BEAUTY-005-ID",
          sku: "SHP-BEAUTY-005",
          name: "[UNMAPPED] Vitamin C Serum 30ml (SHP-BEAUTY-005)",
        },
      ];
    } else if (simMarketplace === "tokopedia") {
      return [
        {
          id: "TOK-ELEC-001-ID",
          sku: "TOK-ELEC-001",
          name: "Mechanical Gaming Keyboard RGB (TOK-ELEC-001)",
        },
        {
          id: "TOK-BOOK-005-ID",
          sku: "TOK-BOOK-005",
          name: "Clean Code Handbook (TOK-BOOK-005)",
        },
        {
          id: "TOK-FOOD-003-ID",
          sku: "TOK-FOOD-003",
          name: "Premium Arabica Coffee Beans (TOK-FOOD-003)",
        },
        {
          id: "TOK-FURN-002-ID",
          sku: "TOK-FURN-002",
          name: "[UNMAPPED] Ergonomic Office Chair (TOK-FURN-002)",
        },
        {
          id: "TOK-AUTO-004-ID",
          sku: "TOK-AUTO-004",
          name: "[UNMAPPED] Car Dash Camera (TOK-AUTO-004)",
        },
      ];
    } else {
      return [
        {
          id: "LZD-ELEC-001-ID",
          sku: "LZD-ELEC-001",
          name: "Smart Watch Fitness AMOLED (LZD-ELEC-001)",
        },
        {
          id: "LZD-HOME-003-ID",
          sku: "LZD-HOME-003",
          name: "Robot Vacuum Cleaner LiDAR (LZD-HOME-003)",
        },
        {
          id: "LZD-FASH-002-ID",
          sku: "LZD-FASH-002",
          name: "Genuine Leather Wallet RFID (LZD-FASH-002)",
        },
        {
          id: "LZD-BABY-004-ID",
          sku: "LZD-BABY-004",
          name: "[UNMAPPED] Baby Stroller Lightweight (LZD-BABY-004)",
        },
        {
          id: "LZD-ELEC-006-ID",
          sku: "LZD-ELEC-006",
          name: "[UNMAPPED] USB-C Hub 10-in-1 (LZD-ELEC-006)",
        },
      ];
    }
  };

  // Helper to trigger mock products to load native product IDs
  // Since the mock product IDs are uuid-v4 generated at runtime on startup,
  // we fetch the actual product lists from the mock server dynamically so we don't send incorrect/unknown IDs!
  const [mockProducts, setMockProducts] = useState([]);
  React.useEffect(() => {
    if (simulatorOpen) {
      mockApi
        .get(`/${simMarketplace.toLowerCase()}/products`)
        .then((res) => {
          const list = res.data.data.products || res.data.data || [];
          setMockProducts(list);
          if (list.length > 0)
            setSimProduct(list[0].item_id || list[0].product_id || list[0].id);
        })
        .catch((err) =>
          console.error("Gagal mengambil produk mock untuk simulator", err),
        );
    }
  }, [simMarketplace, simulatorOpen]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* 1. SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out z-20`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shrink-0">
              EA
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg tracking-wider text-white truncate">
                AGGREGATOR
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-200"
                    }
                  />
                  {sidebarOpen && <span className="truncate">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Simulator Button */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => setSimulatorOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-lg shadow-emerald-900/20 transition-all"
          >
            <Play size={14} />
            {sidebarOpen ? "ORDER SIMULATOR" : "SIM"}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          <h1 className="text-lg font-semibold text-white">
            {menuItems.find((item) => location.pathname.startsWith(item.path))
              ?.name || "Dashboard"}
          </h1>

          <div className="flex items-center gap-6">
            {/* Real-time sync socket state */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
              {socketConnected ? (
                <>
                  <Wifi size={14} className="text-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-medium">
                    Realtime: Connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff size={14} className="text-red-400" />
                  <span className="text-slate-400 font-medium font-mono">
                    Realtime: Offline
                  </span>
                </>
              )}
            </div>

            {/* Notification Bell Badge */}
            <div className="relative">
              <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                <Bell size={18} />
              </button>
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-blue-500 border border-slate-900"></span>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-sm font-bold text-white uppercase">
                AD
              </div>
              <span className="text-sm font-medium text-slate-300 hidden md:block">
                Admin CTO
              </span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>

      {/* 3. SIMULATOR MODAL PANEL */}
      {simulatorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <Play size={18} className="text-emerald-400" />
                <span className="font-bold text-white text-base">
                  E-Commerce Webhook Simulator
                </span>
              </div>
              <button
                onClick={() => {
                  setSimulatorOpen(false);
                  setSimResult(null);
                }}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Gunakan panel ini untuk mensimulasikan pembelian langsung di
                marketplace. Mock API akan membuat transaksi baru, memicu
                webhook, dan mengirimkan payload order ke aggregator.
              </p>

              {/* Marketplace Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">
                  Pilih Marketplace
                </label>
                <select
                  value={simMarketplace}
                  onChange={(e) => setSimMarketplace(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="shopee">Shopee</option>
                  <option value="tokopedia">Tokopedia</option>
                  <option value="lazada">Lazada</option>
                </select>
              </div>

              {/* Product Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">
                  Pilih Produk
                </label>
                <select
                  value={simProduct}
                  onChange={(e) => setSimProduct(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {mockProducts.length === 0 ? (
                    <option value="">
                      Mengambil data dari marketplace mock...
                    </option>
                  ) : (
                    mockProducts.map((p) => {
                      const id = p.item_id || p.product_id || p.id;
                      const sku = p.model_sku || p.sku || p.seller_sku;
                      const name = p.item_name || p.name;
                      return (
                        <option key={id} value={id}>
                          {name} ({sku}) - Stock:{" "}
                          {p.stock !== undefined ? p.stock : p.available}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {/* Quantity Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">
                  Kuantitas Pembelian
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={simQty}
                  onChange={(e) => setSimQty(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Submit simulation */}
              <button
                onClick={handleSimulateOrder}
                disabled={simLoading || !simProduct}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg text-sm transition-all flex items-center justify-center gap-2"
              >
                {simLoading ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Play size={16} />
                )}
                Kirim Transaksi Pembelian
              </button>

              {/* Result display */}
              {simResult && (
                <div
                  className={`p-3 rounded-lg text-xs flex gap-2 items-start border ${
                    simResult.success
                      ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
                      : "bg-red-950/20 border-red-500/20 text-red-400"
                  }`}
                >
                  <span>{simResult.success ? "✅" : "❌"}</span>
                  <div className="flex-1 leading-normal font-medium">
                    {simResult.message}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => {
                  setSimulatorOpen(false);
                  setSimResult(null);
                }}
                className="text-xs font-bold text-slate-400 hover:text-white px-4 py-2"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. REAL-TIME TOAST NOTIFICATION STACK */}
      <div className="fixed bottom-5 right-5 space-y-2 z-50 w-full max-w-sm pointer-events-none">
        {notifications.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 transition-all duration-300 transform translate-y-0 scale-100 ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200"
                : toast.type === "error"
                  ? "bg-red-950/90 border-red-500/30 text-red-200"
                  : "bg-blue-950/90 border-blue-500/30 text-blue-200"
            }`}
          >
            <div className="text-base shrink-0 mt-0.5">
              {toast.type === "success"
                ? "🔔"
                : toast.type === "error"
                  ? "⚠️"
                  : "ℹ️"}
            </div>
            <div className="flex-1 text-xs leading-normal font-semibold">
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainLayout;
