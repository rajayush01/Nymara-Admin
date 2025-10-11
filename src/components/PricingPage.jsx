import { useState, useEffect } from "react";

export default function PricingPage() {
  const [goldPrice, setGoldPrice] = useState("");
  const [diamondPrice, setDiamondPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [currentPricing, setCurrentPricing] = useState(null);
  const [loadingPricing, setLoadingPricing] = useState(true);

  // 🔹 Fetch current pricing on load
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch("/api/pricing");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch pricing");
        setCurrentPricing(data);
      } catch (err) {
        console.error("Fetch Pricing Error:", err);
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPricing();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/pricing/update", {
        method: "PUT", // or POST depending on your backend
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goldPricePerGram: goldPrice ? Number(goldPrice) : undefined,
          diamondPricePerCarat: diamondPrice ? Number(diamondPrice) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update pricing");
      }

      setMessage({ type: "success", text: data.message });
      setGoldPrice("");
      setDiamondPrice("");
      setCurrentPricing(data.pricing); // ✅ update current pricing after save
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">💎 Update Pricing</h2>

        {/* Current Pricing */}
        <div className="mb-6 p-4 bg-gray-100 rounded-xl border">
          {loadingPricing ? (
            <p className="text-gray-500">Loading current pricing...</p>
          ) : currentPricing ? (
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Gold Price per Gram:</span>{" "}
                ₹{currentPricing.goldPricePerGram}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Diamond Price per Carat:</span>{" "}
                ₹{currentPricing.diamondPricePerCarat}
              </p>
            </div>
          ) : (
            <p className="text-red-500">⚠️ No pricing data found</p>
          )}
        </div>

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

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gold Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gold Price per Gram (₹)
            </label>
            <input
              type="number"
              value={goldPrice}
              onChange={(e) => setGoldPrice(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 outline-none"
              placeholder="Enter gold price per gram"
            />
          </div>

          {/* Diamond Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diamond Price per Carat (₹)
            </label>
            <input
              type="number"
              value={diamondPrice}
              onChange={(e) => setDiamondPrice(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 outline-none"
              placeholder="Enter diamond price per carat"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-semibold rounded-xl shadow hover:from-yellow-600 hover:to-amber-700 transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Pricing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
