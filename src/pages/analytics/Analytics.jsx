import React, { useEffect, useState } from "react";
import { useStore } from "../../stores/useStore";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  MonitorPlay,
  ArrowUpRight,
  TrendingDown,
  Percent,
  Calendar,
  Layers,
  ShoppingBag,
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
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import api from "../../lib/api";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

function Analytics() {
  const { orders, marketplaces, queues } = useStore();
  const [chartData, setChartData] = useState({
    dailySales: [],
    comparison: [],
  });
  const [topProducts, setTopProducts] = useState([]);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    api
      .get("/analytics/sales")
      .then((res) => setChartData(res.data.data))
      .catch((err) => console.error(err));

    api
      .get("/analytics/top-products")
      .then((res) => setTopProducts(res.data.data))
      .catch((err) => console.error(err));
  }, [orders, queues]);

  const totalOrders = orders.length + 37;
  const totalRevenue =
    orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0) + 45000000;
  const activeMarketplaces = marketplaces.filter(
    (m) => m.status === "ACTIVE",
  ).length;
  const averageOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const formatRupiah = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Analisis & Laporan</h2>
          <p className="text-xs text-slate-400">
            Analisis performa penjualan multi-channel terpadu
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-xs self-start">
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${timeRange === "7d" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-not-allowed opacity-50 ${timeRange === "30d" ? "bg-blue-600 text-white font-bold" : "text-slate-400"}`}
            disabled
          >
            30 Hari
          </button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Card */}
        <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Volume Pesanan
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {totalOrders}
              </span>
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-0.5">
                +14.8% <ArrowUpRight size={12} />
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Pesanan terakumulasi
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
            <ShoppingCart size={20} />
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Omset
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">
                {formatRupiah(totalRevenue)}
              </span>
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-0.5">
                +8.2% <ArrowUpRight size={12} />
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Gabungan seluruh marketplace
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
            <DollarSign size={20} />
          </div>
        </div>

        {/* AOV Card */}
        <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Rata-Rata Nilai Pesanan (AOV)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white">
                {formatRupiah(averageOrderValue)}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Total Revenue / Volume Pesanan
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
            <Percent size={20} />
          </div>
        </div>

        {/* Active Marketplaces Card */}
        <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Integrasi Toko
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {activeMarketplaces}
              </span>
              <span className="text-slate-400 text-xs">
                / {marketplaces.length} Aktif
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Kanal penjualan tersambung
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
            <MonitorPlay size={20} />
          </div>
        </div>
      </div>

      {/* 3. SALES CHARTS DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Orders line + Area */}
        <div className="glass-panel p-6 rounded-xl lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Grafik Perkembangan Penjualan
            </h3>
            <p className="text-xs text-slate-400">
              Visualisasi harian performa omset dan jumlah pesanan
            </p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData.dailySales}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorSalesDetail"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.3}
                />
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
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="sales"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSalesDetail)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Market Breakdown */}
        <div className="glass-panel p-6 rounded-xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Komposisi Transaksi Marketplace
            </h3>
            <p className="text-xs text-slate-400">
              Proporsi pesanan per kanal marketplace
            </p>
          </div>

          <div className="h-48 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.comparison}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
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
              <span className="text-slate-400 text-[10px] uppercase tracking-wider">
                Volume Order
              </span>
              <span className="text-white text-2xl font-bold">
                {totalOrders}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {chartData.comparison.map((entry, idx) => {
              const percentage =
                totalOrders > 0
                  ? Math.round((entry.value / totalOrders) * 100)
                  : 0;
              return (
                <div
                  key={entry.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/40"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></span>
                    <span className="text-slate-300 font-semibold">
                      {entry.name}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-slate-400 font-mono">
                      {entry.value} Pesanan
                    </span>
                    <span className="text-white font-bold font-mono">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. PRODUCT AND REVENUE COMPARISONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sold Products List */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Analisis Produk Terlaris
            </h3>
            <p className="text-xs text-slate-400">
              Daftar produk dengan performa penjualan tertinggi
            </p>
          </div>

          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <div className="text-center text-slate-500 py-10 text-xs">
                Memuat data produk...
              </div>
            ) : (
              topProducts.map((p, idx) => {
                const percentageOfTotal =
                  totalRevenue > 0
                    ? Math.min(
                        100,
                        Math.round((p.revenue / totalRevenue) * 100),
                      )
                    : 0;
                return (
                  <div key={p.sku} className="space-y-2">
                    <div className="flex justify-between items-start text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-blue-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold text-slate-200">
                            {p.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block pl-7">
                          {p.sku}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-200 font-bold font-mono">
                          {p.sold} Terjual
                        </span>
                        <span className="text-slate-400 font-mono block text-[10px]">
                          {formatRupiah(p.revenue)}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, percentageOfTotal)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Revenue contribution by product (Bar chart representation) */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Pendapatan Berdasarkan Produk
            </h3>
            <p className="text-xs text-slate-400">
              Komparasi nominal omset kotor 5 produk terlaris
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.2}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  fontSize={9}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                />
                <YAxis
                  dataKey="sku"
                  type="category"
                  stroke="#64748b"
                  fontSize={9}
                  tickLine={false}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                  formatter={(value) => [formatRupiah(value), "Revenue"]}
                />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                  {topProducts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
