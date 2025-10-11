import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import OrdersList from "../components/OrdersList";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import PricingPage from "../components/PricingPage";
import Analytics from "../pages/Analytics"; // ✅ Add analytics page

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");

  // 🔹 Map tab keys to titles
  const pageTitles = {
    orders: "📦 Orders",
    products: "💍 Products",
    pricing: "💎 Pricing",
    analytics: "📊 Analytics",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {pageTitles[activeTab] || "Dashboard"}
          </h1>
        </div>

        {/* Content */}
        {activeTab === "orders" && <OrdersList />}

        {activeTab === "products" && (
          <div className="space-y-8">
            <ProductForm />
            <ProductList />
          </div>
        )}

        {activeTab === "pricing" && <PricingPage />}

        {activeTab === "analytics" && <Analytics />}
      </main>
    </div>
  );
}
