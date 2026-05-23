import React, { useEffect, useState } from 'react';
import { useStore } from '../../stores/useStore';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  MonitorPlay,
  AlertTriangle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
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
  Bar
} from 'recharts';
import axios from 'axios';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

function Dashboard() {
  const { orders, marketplaces, queues, syncLogs, activityFeed } = useStore();
  const [chartData, setChartData] = useState({ dailySales: [], comparison: [] });
  const [topProducts, setTopProducts] = useState([]);

  // Fetch chart data on load
  useEffect(() => {
    axios.get('http://localhost:3000/api/analytics/sales')
      .then(res => setChartData(res.data.data))
      .catch(err => console.error(err));

    axios.get('http://localhost:3000/api/analytics/top-products')
      .then(res => setTopProducts(res.data.data))
      .catch(err => console.error(err));
  }, [orders, queues]); // update charts when orders or queues change

  // Computations
  const totalOrders = orders.length + 37; // base seed + live
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0) + 45000000; // base seed + live
  const activeMarketplaces = marketplaces.filter(m => m.status === 'ACTIVE').length;
  const failedSyncCount = syncLogs.filter(l => l.status === 'FAILED').length;

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Orders Card */}
        <div className="glass-panel glass-panel-hover p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{totalOrders}</span>
              <span className="text-emerald-400 text-xs font-bold flex items-center">
                +12% <ArrowUpRight size={12} />
              </span>
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
            <ShoppingCart size={20} />
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="glass-panel glass-panel-hover p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">{formatRupiah(totalRevenue)}</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Active Marketplace Card */}
        <div className="glass-panel glass-panel-hover p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Channel</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{activeMarketplaces}</span>
              <span className="text-slate-400 text-xs font-medium">/ {marketplaces.length}</span>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
            <MonitorPlay size={20} />
          </div>
        </div>

        {/* Failed Sync Card */}
        <div className="glass-panel glass-panel-hover p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failed Sync</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{failedSyncCount}</span>
              {failedSyncCount > 0 && (
                <span className="text-red-400 text-xs font-bold animate-pulse">Action Required</span>
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
              <h3 className="text-sm font-semibold text-white">Tren Penjualan (7 Hari Terakhir)</h3>
              <p className="text-xs text-slate-400">Total nilai penjualan dan volume pesanan harian</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <TrendingUp size={14} className="text-blue-400" />
              <span>Revenue Sync: Realtime</span>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.dailySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  formatter={(value, name) => [name === 'sales' ? formatRupiah(value) : value, name === 'sales' ? 'Revenue' : 'Orders']}
                />
                <Area type="monotone" dataKey="sales" name="sales" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Marketplace comparison */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Komparasi Order Channel</h3>
            <p className="text-xs text-slate-400">Kontribusi order berdasarkan marketplace</p>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Total</span>
              <span className="text-white text-xl font-bold">{totalOrders}</span>
            </div>
          </div>

          {/* Custom Legends */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {chartData.comparison.map((entry, idx) => (
              <div key={entry.name} className="flex flex-col items-center bg-slate-800/35 border border-slate-800/60 p-2 rounded-lg">
                <span className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-400 font-semibold">{entry.name}</span>
                <span className="text-white font-bold mt-0.5">{entry.value} orders</span>
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
              <h3 className="text-sm font-semibold text-white">Realtime Activity Feed</h3>
              <p className="text-xs text-slate-400">Log sinkronisasi stok dan webhook order langsung</p>
            </div>
            <Clock size={16} className="text-blue-400" />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {activityFeed.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10">
                <Clock size={32} className="opacity-30 mb-2" />
                <span className="text-xs">Menunggu aktivitas masuk...</span>
                <span className="text-[10px] text-slate-600 mt-1">Gunakan ORDER SIMULATOR untuk memicu webhook!</span>
              </div>
            ) : (
              activityFeed.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 hover:border-slate-800 transition-all text-xs"
                >
                  <span className="text-base shrink-0 mt-0.5">
                    {activity.type === 'queue_success' ? '✅' :
                     activity.type === 'queue_failed' ? '❌' :
                     activity.type === 'new-order' || activity.type === 'order_created' ? '🔔' :
                     activity.type === 'stock_updated' || activity.type === 'stock_manual_update' ? '📦' :
                     activity.type === 'queue_processing' ? '⚙️' : '⚙️'}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-slate-200 leading-normal font-semibold">{activity.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Sold Products */}
        <div className="glass-panel p-6 rounded-xl space-y-4 flex flex-col h-[400px]">
          <div className="shrink-0">
            <h3 className="text-sm font-semibold text-white">Produk Terlaris</h3>
            <p className="text-xs text-slate-400">5 produk dengan volume penjualan tertinggi</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {topProducts.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-10">Mengambil data penjualan...</div>
            ) : (
              topProducts.map((p, idx) => (
                <div key={p.sku} className="flex items-center justify-between border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1 max-w-[70%]">
                    <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-700">
                      {p.sku}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200 truncate block mt-1">{p.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">{p.sold} Unit</span>
                    <span className="text-[10px] text-slate-400 font-mono">{formatRupiah(p.revenue)}</span>
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
