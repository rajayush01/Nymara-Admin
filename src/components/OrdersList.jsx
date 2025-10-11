import { useEffect, useState } from "react";
import axios from "axios";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ Admin token
        },
      })
      .then((res) => {
        setOrders(res.data || []);
      })
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading orders...</p>;

  if (orders.length === 0)
    return <p className="text-gray-600">No orders found.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-yellow-700 mb-6">📦 Orders</h2>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-yellow-100">
            <tr>
              <th className="p-3 border-b">Order ID</th>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Customer</th>
              <th className="p-3 border-b">Amount</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">City / State</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-yellow-50">
                <td className="p-3 font-mono">{o.oId}</td>
                <td className="p-3">
                  {new Date(o.orderDate).toLocaleDateString()}
                </td>
                <td className="p-3">{o.user?.name || "N/A"}</td>
                <td className="p-3 font-semibold">₹{o.totalAmount}</td>
                <td className="p-3 capitalize">{o.status}</td>
                <td className="p-3">
                  {o.deliveryAddress?.city || "—"},{" "}
                  {o.deliveryAddress?.state || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
