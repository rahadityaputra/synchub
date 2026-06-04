import React, { useEffect, useState } from "react";
import { useStore } from "../../stores/useStore";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  MonitorPlay,
  AlertTriangle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import api from "../../lib/api";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

function Dashboard() {
  const { orders, queues, syncLogs, activityFeed, marketplaces } = useStore();
  const [chartData, setChartData] = useState({
    dailySales: [],
    comparison: [],
  });
  const [topProducts, setTopProducts] = useState([]);

  const [summaryData, setSummaryData] = useState({
    total_orders: 0,
    total_revenue: 0,
    active_marketplaces: 0,
    failed_sync_count: 0
  });
  const [liveActivities, setLiveActivities] = useState([]);

  useEffect(() => {
    api
      .get("/analytics/sales?range=7d")
      .then((res) => {
        const nextData = res.data?.data;
        setChartData({
          dailySales: Array.isArray(nextData?.dailySales) ? nextData.dailySales : [],
          comparison: Array.isArray(nextData?.comparison) ? nextData.comparison : [],
        });
      })
      .catch((err) => console.error(err));

    api
      .get("/analytics/top-products?range=7d")
      .then((res) => {
        setTopProducts(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch((err) => console.error(err));

    api
      .get("/analytics/summary?range=7d")
      .then((res) => {
        if (res.data?.data) {
          setSummaryData(res.data.data);
        }
      })
      .catch((err) => console.error(err));

    api
      .get("/analytics/activities?range=7d")
      .then((res) => {
        setLiveActivities(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch((err) => console.error(err));
  }, [orders, queues, syncLogs]); // update charts when global state changes

  const { 
    total_orders: totalOrders, 
    total_revenue: totalRevenue, 
    active_marketplaces: activeMarketplaces, 
    failed_sync_count: failedSyncCount,
    orders_growth: ordersGrowth = 0,
    revenue_growth: revenueGrowth = 0
  } = summaryData;

  const formatRupiah = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const renderGrowth = (growth) => {
    if (growth > 0) {
      return (
        <span className="text-emerald-400 text-xs font-bold flex items-center">
          +{growth}% <ArrowUpRight size={12} className="ml-0.5" />
        </span>
      );
    } else if (growth < 0) {
      return (
        <span className="text-red-400 text-xs font-bold flex items-center">
          {growth}% <ArrowUpRight size={12} className="ml-0.5 transform rotate-90" />
        </span>
      );
    }
    return (
      <span className="text-slate-400 text-xs font-bold flex items-center">
        0%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Card */}
        <div className="glass-panel glass-panel-hover p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {totalOrders}
              </span>
              {renderGrowth(ordersGrowth)}
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
            <ShoppingCart size={20} />
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="glass-panel glass-panel-hover p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">
                {formatRupiah(totalRevenue)}
              </span>
              {renderGrowth(revenueGrowth)}
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Active Marketplace Card */}
        <div className="glass-panel glass-panel-hover p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Channel
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {activeMarketplaces}
              </span>
              <span className="text-slate-400 text-xs font-medium">
                / {marketplaces.length}
              </span>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
            <MonitorPlay size={20} />
          </div>
        </div>

        {/* Failed Sync Card */}
        <div className="glass-panel glass-panel-hover p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Failed Sync
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {failedSyncCount}
              </span>
              {failedSyncCount > 0 && (
                <span className="text-red-400 text-xs font-bold animate-pulse">
                  Action Required
                </span>
              )}
            </div>
          </div>
          <div className="p-3 bg-red-500/10 rounded-lg text-red-400 border border-red-500/20">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* 2. CHARTS SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (Line area) */}
        <div className="glass-panel p-6 rounded-xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">
                Tren Penjualan (7 Hari Terakhir)
              </h3>
              <p className="text-xs text-slate-400">
                Total nilai penjualan dan volume pesanan harian
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <TrendingUp size={14} className="text-blue-400" />
              <span>Revenue Sync: Realtime</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData.dailySales}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                  formatter={(value, name) => [
                    name === "sales" ? formatRupiah(value) : value,
                    name === "sales" ? "Revenue" : "Orders",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="sales"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Marketplace comparison */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Komparasi Order Channel
            </h3>
            <p className="text-xs text-slate-400">
              Kontribusi order berdasarkan marketplace
            </p>
          </div>

          <div className="h-56 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.comparison}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.comparison.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-slate-400 text-xs uppercase tracking-wider">
                Total
              </span>
              <span className="text-white text-xl font-bold">
                {totalOrders}
              </span>
            </div>
          </div>

          {/* Custom Legends */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {chartData.comparison.map((entry, idx) => (
              <div
                key={entry.name}
                className="flex flex-col items-center bg-slate-800/35 border border-slate-800/60 p-2 rounded-lg"
              >
                <span
                  className="w-2 h-2 rounded-full mb-1"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></span>
                <span className="text-slate-400 font-semibold">
                  {entry.name}
                </span>
                <span className="text-white font-bold mt-0.5">
                  {entry.value} orders
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. ACTIVITY FEED AND QUEUE LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Activity Feed */}
        <div className="glass-panel p-6 rounded-xl lg:col-span-2 space-y-4 flex flex-col h-[400px]">
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Realtime Activity Feed
              </h3>
              <p className="text-xs text-slate-400">
                Log sinkronisasi stok dan webhook order langsung
              </p>
            </div>
            <Clock size={16} className="text-blue-400" />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {(() => {
              // Merge: real-time WS feed on top, then historical API activities
              const wsIds = new Set(activityFeed.map((a) => a.id));
              const merged = [
                ...activityFeed,
                ...liveActivities.filter((a) => !wsIds.has(a.id))
              ];
              const getEmoji = (type) => {
                if (type === 'queue_success' || type === 'update-stock') return '✅';
                if (type === 'queue_failed') return '❌';
                if (type === 'new-order' || type === 'order_created' || type === 'enqueue-stock-sync') return '🔔';
                if (type === 'stock_updated' || type === 'stock_manual_update') return '📦';
                if (type === 'queue_processing') return '⚙️';
                return '⚙️';
              };
              return merged.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10">
                  <Clock size={32} className="opacity-30 mb-2" />
                  <span className="text-xs">Menunggu aktivitas masuk...</span>
                  <span className="text-[10px] text-slate-600 mt-1">
                    Gunakan ORDER SIMULATOR untuk memicu webhook!
                  </span>
                </div>
              ) : (
                merged.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 hover:border-slate-800 transition-all text-xs"
                  >
                    <span className="text-base shrink-0 mt-0.5">{getEmoji(activity.type)}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-slate-200 leading-normal font-semibold">{activity.message}</p>
                        {activity.status && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            activity.status === 'SUCCESS' || activity.status === 'PENDING'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : activity.status === 'FAILED'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                              : 'bg-slate-700/50 text-slate-400 border border-slate-700'
                          }`}>{activity.status}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {activity.marketplace && (
                          <span className="text-[10px] text-blue-400 font-mono">{activity.marketplace}</span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              );
            })()}
          </div>
        </div>

        {/* Top Sold Products */}
        <div className="glass-panel p-6 rounded-xl space-y-4 flex flex-col h-[400px]">
          <div className="shrink-0">
            <h3 className="text-sm font-semibold text-white">
              Produk Terlaris
            </h3>
            <p className="text-xs text-slate-400">
              5 produk dengan volume penjualan tertinggi
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {topProducts.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-10">
                Mengambil data penjualan...
              </div>
            ) : (
              topProducts.map((p, idx) => (
                <div
                  key={p.sku}
                  className="flex items-center justify-between border-b border-slate-800/60 pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1 max-w-[70%]">
                    <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-700">
                      {p.sku}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200 truncate block mt-1">
                      {p.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">
                      {p.sold} Unit
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatRupiah(p.revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
