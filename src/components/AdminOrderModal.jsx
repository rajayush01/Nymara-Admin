import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOrderModal({
  open,
  onClose,
  order,
  token,
  onStatusUpdated,
}) {
  const [status, setStatus] = useState(order?.status || "");
  const [deliveryLink, setDeliveryLink] = useState(order?.deliveryLink || "");
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens with new order
  useEffect(() => {
    if (open && order) {
      setStatus(order.status || "");
      setDeliveryLink(order.deliveryLink || "");
    }
  }, [open, order?.orderId]);

  if (!order) return null;

  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.put(
        `/api/admin/orders/${order.orderId}/status`,
        { status, deliveryLink }, // ✅ send both status + deliveryLink
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        onStatusUpdated(order.orderId, status); // notify parent
      }
    } catch (err) {
      console.error(
        "❌ Error updating order:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white shadow-xl overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center border-b p-4">
            <Dialog.Title className="text-xl font-semibold">
              Order {order.orderId}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Status + Delivery Update */}
            <div className="flex flex-col gap-3">
              {/* Status */}
              <div className="flex items-center gap-3">
                <label className="font-medium">Update Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              {/* Delivery Link */}
              <div className="flex items-center gap-3">
                <label className="font-medium">Delivery Link:</label>
                <input
                  type="text"
                  value={deliveryLink}
                  onChange={(e) => setDeliveryLink(e.target.value)}
                  placeholder="https://tracking-url.com/..."
                  className="border rounded p-2 flex-1"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={loading}
                className="self-start bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(order.date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Payment:</span>{" "}
                {order.paymentStatus}
              </p>
              {order.deliveryLink && (
                <p>
                  <span className="font-medium">Delivery Link:</span>{" "}
                  <a
                    href={order.deliveryLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Track Package
                  </a>
                </p>
              )}
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="font-semibold mb-2">Customer</h3>
              <p>
                <span className="font-medium">ID:</span>{" "}
                {order.customer.customerId}
              </p>
              <p>
                <span className="font-medium">Name:</span> {order.customer.name}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {order.customer.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {order.customer.phone}
              </p>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <p>{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.phone}</p>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="font-semibold mb-2">Order Items</h3>
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">SKU</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Qty</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="p-2 border">{item.productSKU}</td>
                      <td className="p-2 border">{item.productName}</td>
                      <td className="p-2 border">{item.quantity}</td>
                      <td className="p-2 border">
                        {item.currency} {item.displayPrice}
                      </td>
                      <td className="p-2 border font-medium">
                        {item.currency} {item.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end mt-4">
              <div className="text-right">
                <p>
                  <span className="font-medium">Items:</span>{" "}
                  {order.orderSummary.totalItems}
                </p>
                <p className="text-lg font-semibold">
                  Total: {order.orderSummary.currency}{" "}
                  {order.orderSummary.totalAmount}
                </p>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
