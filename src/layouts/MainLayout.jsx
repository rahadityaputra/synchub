import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useStore } from "../stores/useStore";
import { useAuth } from "../stores/useAuth";
import {
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Package,
  Link2,
  ShoppingCart,
  History,
  Code,
  Cpu,
  BarChart3,
  Wifi,
  WifiOff,
  Bell,
  Menu,
  X,
} from "lucide-react";

function MainLayout() {
  const { socketConnected, notifications } = useStore();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const location = useLocation();
  const displayName = user?.name || user?.fullName || user?.email || "User";
  const profileInitials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || "U";

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
  ];

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
            <div className="relative border-l border-slate-800 pl-3">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 border border-blue-500 shadow-sm flex items-center justify-center text-sm font-bold text-white uppercase shrink-0">
                  {profileInitials}
                </div>
                <span className="text-sm font-medium text-slate-300 hidden md:block">
                  {displayName}
                </span>
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-sm text-white font-medium truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {user?.email || "No email"}
                      </p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <UserIcon size={16} className="text-slate-400" />
                        My Profile
                      </Link>
                    </div>
                    <div className="p-1 border-t border-slate-700">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>

      {/* 3. REAL-TIME TOAST NOTIFICATION STACK */}
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
