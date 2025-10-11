import { NavLink } from "react-router-dom";
import {
  ShoppingCart,
  Gem,
  Users,
  IndianRupee,
  RefreshCcw,
  BarChart3,
} from "lucide-react";

export default function AdminSidebar() {
  const tabs = [
  { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { path: "/admin/products", label: "Products", icon: Gem },
  { path: "/admin/customers", label: "Customers", icon: Users },
  { path: "/admin/pricing", label: "Pricing", icon: IndianRupee },
  { path: "/admin/refunds", label: "Refunds", icon: RefreshCcw },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];


  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-yellow-50 to-yellow-100 shadow-xl border-r border-yellow-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-yellow-200">
        <h1 className="text-2xl font-bold text-yellow-700 tracking-wide">
          Admin Dashboard
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 p-4 flex-1">
        {tabs.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium ${
                isActive
                  ? "bg-yellow-600 text-white shadow-md"
                  : "text-yellow-700 hover:bg-yellow-200"
              }`
            }
          >
            <Icon size={20} /> {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 text-xs text-gray-500 border-t border-yellow-200">
        © {new Date().getFullYear()} BOF Jewels
      </div>
    </aside>
  );
}
