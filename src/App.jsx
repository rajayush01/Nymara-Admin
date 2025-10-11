import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import PricingPage from "./pages/PricingPage";
import RefundsPage from "./pages/RefundsPage";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import AdminSidebar from "./components/AdminSidebar";
import ProductVariantPage from "./pages/ProductVariantPage";

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.isAdmin) return <Navigate to="/login" replace />;
  return children;
};

const AdminLayout = () => (
  <div className="min-h-screen flex bg-gray-50 text-gray-800">
    <AdminSidebar />
    <main className="flex-1 p-8">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductVariantPage />} />

        {/* Admin routes (all start with /admin) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="refunds" element={<RefundsPage />} />
          <Route path="analytics" element={<Analytics />} />

          {/* Default admin landing → orders */}
          <Route index element={<Navigate to="orders" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
