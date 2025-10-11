import { useEffect, useState } from "react";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // 🔹 Dummy fallback data
  const dummyRefunds = [
    {
      _id: "rf_001",
      orderId: { oId: "ORD123", totalAmount: 5000 },
      userId: { name: "John Doe", email: "john@example.com" },
      refundAmount: 2000,
      reason: "Damaged product",
      status: "Pending",
    },
    {
      _id: "rf_002",
      orderId: { oId: "ORD124", totalAmount: 8000 },
      userId: { name: "Jane Smith", email: "jane@example.com" },
      refundAmount: 5000,
      reason: "Wrong item delivered",
      status: "Approved",
    },
    {
      _id: "rf_003",
      orderId: { oId: "ORD125", totalAmount: 12000 },
      userId: { name: "Raj Patel", email: "raj@example.com" },
      refundAmount: 12000,
      reason: "Order canceled",
      status: "Processed",
    },
  ];

  // 🔹 Fetch all refunds (simulated)
  const fetchRefunds = async () => {
    try {
      setLoading(true);

      // 👉 For now, we just simulate fetch delay and load dummy data
      await new Promise((res) => setTimeout(res, 800));
      setRefunds(dummyRefunds);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  // 🔹 Update refund status (local only for now)
  const updateStatus = async (refundId, status) => {
    setRefunds((prev) =>
      prev.map((r) => (r._id === refundId ? { ...r, status } : r))
    );
    setMessage({ type: "success", text: `Status updated to ${status}` });
  };

  // 🔹 Process Razorpay refund (simulated)
  const processRefund = async (refundId) => {
    setRefunds((prev) =>
      prev.map((r) =>
        r._id === refundId ? { ...r, status: "Processed" } : r
      )
    );
    setMessage({ type: "success", text: "Refund processed successfully" });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">💸 Refund Requests</h1>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <p>Loading refunds...</p>
      ) : refunds.length === 0 ? (
        <p className="text-gray-500">No refund requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-xl shadow">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="p-3 border-b">Refund ID</th>
                <th className="p-3 border-b">Order</th>
                <th className="p-3 border-b">User</th>
                <th className="p-3 border-b">Amount</th>
                <th className="p-3 border-b">Reason</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((refund) => (
                <tr key={refund._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm">{refund._id}</td>
                  <td className="p-3 text-sm">
                    {refund.orderId?.oId} <br />
                    <span className="text-gray-500 text-xs">
                      ₹{refund.orderId?.totalAmount}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {refund.userId?.name} <br />
                    <span className="text-gray-500 text-xs">
                      {refund.userId?.email}
                    </span>
                  </td>
                  <td className="p-3 text-sm font-semibold text-emerald-600">
                    ₹{refund.refundAmount}
                  </td>
                  <td className="p-3 text-sm">{refund.reason}</td>
                  <td className="p-3 text-sm font-medium">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        refund.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : refund.status === "Approved"
                          ? "bg-blue-100 text-blue-700"
                          : refund.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {refund.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm space-x-2">
                    {/* Status Update */}
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={refund.status}
                      onChange={(e) => updateStatus(refund._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Processed">Processed</option>
                    </select>

                    {/* Process Refund Button */}
                    {refund.status === "Approved" && (
                      <button
                        onClick={() => processRefund(refund._id)}
                        className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm rounded hover:from-emerald-600 hover:to-green-700"
                      >
                        Process Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
