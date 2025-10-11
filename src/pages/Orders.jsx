import { useEffect, useState } from "react";
import axios from "axios";
import AdminOrderModal from "../components/AdminOrderModal.jsx"

const mockOrders = [
  {
    _id: "mock1",
    orderId: "OD101",
    customer: { name: "Amit Kumar", customerId: "BOF001", email: "amit@example.com", phone: "9999999999" },
    totalAmount: 2999,
    status: "Pending",
    paymentStatus: "Pending",
    orderDate: new Date("2025-09-20"),
    orderItems: [{ productName: "Ring", productSKU: "SKU101", quantity: 1, displayPrice: 2999, total: 2999, currency: "₹" }],
    shippingAddress: { city: "Mumbai", state: "MH", addressLine1: "123 Street", pincode: "400001" },
    billUrl: "",
    orderSummary: { totalItems: 2, totalAmount: 2999, currency: "₹" }
  },
  {
    _id: "mock2",
    orderId: "OD102",
    customer: { name: "Priya Sharma", customerId: "BOF002", email: "priya@example.com", phone: "8888888888" },
    totalAmount: 7499,
    status: "Confirmed",
    paymentStatus: "Paid",
    orderDate: new Date("2025-09-22"),
    orderItems: [{ productName: "Necklace", productSKU: "SKU202", quantity: 1, displayPrice: 7499, total: 7499, currency: "₹" }],
    shippingAddress: { city: "Delhi", state: "DL", addressLine1: "456 Road", pincode: "110001" },
    billUrl: "https://example.com/bill-OD102.pdf",
    orderSummary: { totalItems: 1, totalAmount: 7499, currency: "₹" }
  }
];

const API_URL = import.meta.env.VITE_API_URL;


export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch orders (API or mock fallback)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/orders`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.data?.orders?.length > 0) {
          setOrders(res.data.orders);
        } else {
          console.warn("⚠️ No API data, using mock orders");
          setOrders(mockOrders);
        }
      } catch (err) {
        console.error("❌ Error fetching orders:", err.response?.data || err.message);
        setOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle bill upload (mock/local)
  const handleUploadBill = (id) => {
    const link = prompt("Enter bill URL:");
    if (link) {
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, billUrl: link } : o))
      );
    }
  };

  // Handle status update from modal
  const handleStatusUpdated = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId ? { ...o, status: newStatus } : o
      )
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <>
          <table className="w-full border border-gray-200 shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Order ID</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">City/State</th>
                <th className="p-2">Date</th>
                <th className="p-2">Items</th>
                <th className="p-2">Bill</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedOrder(order)} // ✅ open modal on row click
                >
                  <td className="p-2">{order.orderId}</td>
                  <td className="p-2">{order.customer?.name || order.customerName}</td>
                  <td className="p-2 font-medium">₹{order.totalAmount}</td>
                  <td
                    className={`p-2 font-semibold ${
                      order.status === "Confirmed"
                        ? "text-green-600"
                        : order.status === "Pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.status}
                  </td>
                  <td className="p-2">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}
                  </td>
                  <td className="p-2">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    {order.orderItems?.length || order.items?.length || 0} items
                  </td>
                  <td className="p-2">
                    {order.billUrl ? (
                      <a
                        href={order.billUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                        onClick={(e) => e.stopPropagation()} // prevent modal open
                      >
                        View Bill
                      </a>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUploadBill(order._id);
                        }}
                        className="text-sm bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Upload Bill
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ Admin Order Modal */}
          <AdminOrderModal
            open={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
            order={selectedOrder}
            token={localStorage.getItem("token")}
            onStatusUpdated={handleStatusUpdated}
          />
        </>
      )}
    </div>
  );
}
