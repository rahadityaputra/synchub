import React, { useState, useEffect } from 'react';
import { useStore } from '../../stores/useStore';
import {
  MonitorPlay,
  CheckCircle2,
  XCircle,
  Link,
  RefreshCw,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Radio,
  Wifi,
  Terminal,
  Activity,
  Bug
} from 'lucide-react';
import axios from 'axios';

function Marketplaces() {
  const { marketplaces, toggleMarketplace, addNotification } = useStore();
  const [showTokens, setShowTokens] = useState({});
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState({});
  
  // Error simulation states
  const [simMode, setSimMode] = useState({
    shopee: 'none',
    tokopedia: 'none',
    lazada: 'none'
  });
  const [simLoading, setSimLoading] = useState({});

  // Mock initial fetch of error states from mock-api if possible, otherwise we default to none
  useEffect(() => {
    marketplaces.forEach(async (m) => {
      try {
        const res = await axios.get(`http://localhost:4000/api/${m.id}/status`);
        if (res.data?.data?.errorMode) {
          setSimMode(prev => ({ ...prev, [m.id]: res.data.data.errorMode }));
        }
      } catch (err) {
        console.warn(`Gagal memuat status error mode untuk ${m.id}`, err.message);
      }
    });
  }, [marketplaces]);

  const handleToggle = async (id) => {
    await toggleMarketplace(id);
  };

  const toggleTokenVisibility = (id) => {
    setShowTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Test API Connection
  const handleTestConnection = async (id) => {
    setTestingId(id);
    setTestResult(prev => ({ ...prev, [id]: null }));
    try {
      // Simulate/Trigger small request
      const res = await axios.get(`http://localhost:4000/api/${id}/status`);
      const latency = Math.round(Math.random() * 20 + 10); // fake latency 10-30ms
      setTestResult(prev => ({
        ...prev,
        [id]: {
          success: true,
          message: `Koneksi Berhasil! Latensi: ${latency}ms, Webhook: ${res.data?.data?.webhookUrl ? 'Aktif' : 'Nonaktif'}`,
        }
      }));
      addNotification('success', `Koneksi ke API ${id.toUpperCase()} berhasil.`);
    } catch (err) {
      setTestResult(prev => ({
        ...prev,
        [id]: {
          success: false,
          message: `Koneksi Gagal: ${err.response?.data?.message || err.message}`,
        }
      }));
      addNotification('error', `Koneksi ke API ${id.toUpperCase()} gagal: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  // Apply simulated error mode
  const handleApplySimulatedError = async (marketplace, mode) => {
    setSimLoading(prev => ({ ...prev, [marketplace]: true }));
    try {
      await axios.post(`http://localhost:4000/api/${marketplace}/simulate-error`, { mode });
      setSimMode(prev => ({ ...prev, [marketplace]: mode }));
      
      if (mode === 'none') {
        addNotification('success', `Mode error simulasi ${marketplace.toUpperCase()} dinonaktifkan (Normal).`);
      } else {
        addNotification('warning', `Simulasi error ${marketplace.toUpperCase()} diubah ke: ${mode.toUpperCase()}`);
      }
    } catch (err) {
      console.error(err);
      addNotification('error', `Gagal mengubah simulasi error: ${err.message}`);
    } finally {
      setSimLoading(prev => ({ ...prev, [marketplace]: false }));
    }
  };

  const getBrandConfig = (id) => {
    switch (id.toLowerCase()) {
      case 'shopee':
        return {
          bgGradient: 'from-orange-900/20 via-orange-950/10 to-slate-900',
          borderColor: 'border-orange-500/20 hover:border-orange-500/40',
          accentColor: 'text-orange-500',
          bgColor: 'bg-orange-500',
          glowColor: 'shadow-orange-500/10',
          logoText: 'Shopee'
        };
      case 'tokopedia':
        return {
          bgGradient: 'from-emerald-900/20 via-emerald-950/10 to-slate-900',
          borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
          accentColor: 'text-emerald-500',
          bgColor: 'bg-emerald-500',
          glowColor: 'shadow-emerald-500/10',
          logoText: 'Tokopedia'
        };
      case 'lazada':
        return {
          bgGradient: 'from-purple-900/20 via-purple-950/10 to-slate-900',
          borderColor: 'border-purple-500/20 hover:border-purple-500/40',
          accentColor: 'text-purple-500',
          bgColor: 'bg-purple-500',
          glowColor: 'shadow-purple-500/10',
          logoText: 'Lazada'
        };
      default:
        return {
          bgGradient: 'from-slate-900 to-slate-900',
          borderColor: 'border-slate-800',
          accentColor: 'text-slate-400',
          bgColor: 'bg-slate-700',
          glowColor: '',
          logoText: 'Kanal'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-white">Manajemen Marketplace</h2>
        <p className="text-xs text-slate-400">Konfigurasi token API, webhook, status kanal, dan simulator kegagalan jaringan</p>
      </div>

      {/* MARKETPLACES GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {marketplaces.map((m) => {
          const config = getBrandConfig(m.id);
          const isTokenVisible = showTokens[m.id];
          const test = testResult[m.id];
          
          return (
            <div
              key={m.id}
              className={`glass-panel bg-gradient-to-br ${config.bgGradient} border ${config.borderColor} rounded-xl p-6 flex flex-col justify-between shadow-lg ${config.glowColor} transition-all duration-300`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white text-xs ${config.bgColor}`}>
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{m.name} API</h3>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {m.id}</span>
                    </div>
                  </div>

                  {/* Status Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${m.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {m.status}
                    </span>
                    <button
                      onClick={() => handleToggle(m.id)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        m.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          m.status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="py-4 space-y-3.5 text-xs">
                  {/* API URL */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">REST Endpoints</span>
                    <span className="font-mono text-slate-300">/api/{m.id.toLowerCase()}/*</span>
                  </div>

                  {/* Webhook Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Webhook Connection</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Wifi size={11} className="animate-pulse" /> {m.webhook}
                    </span>
                  </div>

                  {/* Webhook Secret */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Webhook Secret Key</span>
                      <button
                        onClick={() => toggleTokenVisibility(m.id)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {isTokenVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                    <div className="bg-slate-950 border border-slate-900 rounded p-2 text-[10px] font-mono text-slate-300 select-all truncate">
                      {isTokenVisible ? 'aggregator_secret_123' : '••••••••••••••••••••••••'}
                    </div>
                  </div>
                </div>

                {/* SIMULATE ERROR CONTROLLER */}
                <div className="mt-2 p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                    <Bug size={14} />
                    <span>Simulator Kegagalan API</span>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Error Dropdowns */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      {[
                        { label: 'Normal (Ok)', value: 'none' },
                        { label: '429 Rate Limit', value: 'rate_limit' },
                        { label: '503 Timeout', value: 'timeout' },
                        { label: '500 Server Error', value: 'server_error' },
                        { label: '401 Auth Expired', value: 'auth_failure' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleApplySimulatedError(m.id, opt.value)}
                          disabled={simLoading[m.id]}
                          className={`px-2 py-1.5 rounded font-medium border text-left transition-all truncate ${
                            simMode[m.id] === opt.value
                              ? 'bg-amber-600/10 border-amber-500/40 text-amber-400 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Card */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3 shrink-0">
                {test && (
                  <div
                    className={`p-2.5 rounded-lg text-[10px] border flex gap-1.5 leading-normal ${
                      test.success
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-950/20 border-red-500/20 text-red-400'
                    }`}
                  >
                    <span>{test.success ? '✓' : '⚠️'}</span>
                    <span className="font-medium font-mono">{test.message}</span>
                  </div>
                )}
                
                <button
                  onClick={() => handleTestConnection(m.id)}
                  disabled={testingId === m.id}
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-bold py-2 rounded-lg border border-slate-700 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={12} className={testingId === m.id ? 'animate-spin' : ''} />
                  Test Konektivitas API Channel
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

export default Marketplaces;
