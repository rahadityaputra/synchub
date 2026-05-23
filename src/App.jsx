import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useStore } from "./stores/useStore";

// Layout
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import ProductDetail from "./pages/products/ProductDetail";
import Mappings from "./pages/mappings/Mappings";
import Orders from "./pages/orders/Orders";
import OrderDetail from "./pages/orders/OrderDetail";
import SyncLogs from "./pages/sync-logs/SyncLogs";
import PayloadLogs from "./pages/payload-logs/PayloadLogs";
import Queues from "./pages/queues/Queues";
import Analytics from "./pages/analytics/Analytics";
import Marketplaces from "./pages/marketplaces/Marketplaces";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function App() {
  const { initSocket, disconnectSocket, fetchInitialData } = useStore();

  useEffect(() => {
    // Fetch initial state
    fetchInitialData();

    // Establish Socket.IO connections
    initSocket();

    return () => {
      disconnectSocket();
    };
  }, [initSocket, disconnectSocket, fetchInitialData]);

  return (
    <Router>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Default Redirect to Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Main Pages */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="mappings" element={<Mappings />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="sync-logs" element={<SyncLogs />} />
          <Route path="payload-logs" element={<PayloadLogs />} />
          <Route path="queues" element={<Queues />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="marketplaces" element={<Marketplaces />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
