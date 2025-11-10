import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function PricingPage() {
  const [goldPrices, setGoldPrices] = useState({ "14K": "", "18K": "", "22K": "" });
  const [diamondPrice, setDiamondPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [currentPricing, setCurrentPricing] = useState(null);
  const [loadingPricing, setLoadingPricing] = useState(true);

  const API_BASE = `${API_URL}/api/ornaments/pricing`;

  // 🔹 Fetch current pricing on load
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch(API_BASE, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch pricing");

        setCurrentPricing(data.pricing || data);

        // ✅ Initialize gold prices if available
        if (data.pricing?.goldPrices) {
          setGoldPrices({
            "14K": data.pricing.goldPrices["14K"] || "",
            "18K": data.pricing.goldPrices["18K"] || "",
            "22K": data.pricing.goldPrices["22K"] || "",
          });
        }

        if (data.pricing?.diamondPricePerCarat)
          setDiamondPrice(data.pricing.diamondPricePerCarat);
      } catch (err) {
        console.error("Fetch Pricing Error:", err);
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPricing();
  }, []);

  // 🟡 Update goldPrices state
  const handleGoldChange = (karat, value) => {
    setGoldPrices((prev) => ({ ...prev, [karat]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        goldPrices: {
          "14K": goldPrices["14K"] ? Number(goldPrices["14K"]) : undefined,
          "18K": goldPrices["18K"] ? Number(goldPrices["18K"]) : undefined,
          "22K": goldPrices["22K"] ? Number(goldPrices["22K"]) : undefined,
        },
        diamondPricePerCarat: diamondPrice ? Number(diamondPrice) : undefined,
      };

      const response = await fetch(API_BASE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update pricing");

      setMessage({ type: "success", text: data.message });
      setCurrentPricing(data.pricing);
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
              <p className="text-gray-700 font-semibold">Current Gold Prices (per gram):</p>
              <ul className="list-disc pl-5 text-gray-700">
                {Object.entries(currentPricing.goldPrices || {}).map(([karat, price]) => (
                  <li key={karat}>
                    {karat}: ₹{price}
                  </li>
                ))}
              </ul>
              <p className="text-gray-700 mt-3">
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
          {/* Gold Prices for Each Karat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gold Prices per Gram (₹)
            </label>
            <div className="space-y-3">
              {["14K", "18K", "22K"].map((karat) => (
                <div key={karat} className="flex items-center gap-3">
                  <span className="w-16 font-semibold">{karat}</span>
                  <input
                    type="number"
                    value={goldPrices[karat]}
                    onChange={(e) => handleGoldChange(karat, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 rounded-xl focus:border-yellow-500 outline-none"
                    placeholder={`Enter ${karat} gold price`}
                  />
                </div>
              ))}
            </div>
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
