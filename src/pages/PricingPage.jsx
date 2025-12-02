import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function PricingPage() {
  const [goldPrices, setGoldPrices] = useState({ "14K": "", "18K": "", "22K": "" });
  const [diamondPrice, setDiamondPrice] = useState("");
  // ⭐ Gemstone dynamic price map
  const [gemstonePrices, setGemstonePrices] = useState({});
  // ⭐ Available gemstone types fetched automatically
  const [availableStones, setAvailableStones] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [currentPricing, setCurrentPricing] = useState(null);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [platinumPrice, setPlatinumPrice] = useState("");
  const [silver925Price, setSilver925Price] = useState("");
  const [goldVermeilPrice, setGoldVermeilPrice] = useState("");


  const API_BASE = `${API_URL}/api/ornaments/pricing`;

  const GEMSTONE_TYPES = [
    "Emerald",
    "Ruby",
    "Sapphire",
    "Topaz",
    "Amethyst",
    "Garnet",
    "Opal",
    "Turquoise",
    "Pearl"
  ];


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


        if (data.pricing?.platinumPricePerGram)
          setPlatinumPrice(data.pricing.platinumPricePerGram);

        if (data.pricing?.silver925PricePerGram)
          setSilver925Price(data.pricing.silver925PricePerGram);

        if (data.pricing?.goldVermeilPricePerGram)
          setGoldVermeilPrice(data.pricing.goldVermeilPricePerGram);

        if (data.pricing?.diamondPricePerCarat)
          setDiamondPrice(data.pricing.diamondPricePerCarat);

        if (data.pricing?.gemstonePrices) {
          setGemstonePrices(data.pricing.gemstonePrices);
        }

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

        platinumPricePerGram: platinumPrice ? Number(platinumPrice) : undefined,
        silver925PricePerGram: silver925Price ? Number(silver925Price) : undefined,
        goldVermeilPricePerGram: goldVermeilPrice ? Number(goldVermeilPrice) : undefined,

        diamondPricePerCarat: diamondPrice ? Number(diamondPrice) : undefined,

        // ⭐ ADD THIS
        gemstonePrices:
          Object.keys(gemstonePrices).length > 0 ? gemstonePrices : undefined,
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

              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Platinum:</span> ₹{currentPricing.platinumPricePerGram}
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">925 Silver:</span> ₹{currentPricing.silver925PricePerGram}
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">Gold Vermeil:</span> ₹{currentPricing.goldVermeilPricePerGram}
              </p>

            </div>
          ) : (
            <p className="text-red-500">⚠️ No pricing data found</p>
          )}
        </div>

        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg ${message.type === "success"
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

          {/* NEW — Metal Prices */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Other Metal Prices (₹ per gram)</h3>

            {/* Platinum */}
            <div className="flex items-center gap-3">
              <span className="w-40 font-semibold">Platinum</span>
              <input
                type="number"
                value={platinumPrice}
                onChange={(e) => setPlatinumPrice(e.target.value)}
                className="flex-1 px-4 py-3 border-2 rounded-xl focus:border-yellow-500 outline-none"
                placeholder="Enter platinum price per gram"
              />
            </div>

            {/* 925 Sterling Silver */}
            <div className="flex items-center gap-3">
              <span className="w-40 font-semibold">925 Sterling Silver</span>
              <input
                type="number"
                value={silver925Price}
                onChange={(e) => setSilver925Price(e.target.value)}
                className="flex-1 px-4 py-3 border-2 rounded-xl focus:border-yellow-500 outline-none"
                placeholder="Enter silver price per gram"
              />
            </div>

            {/* Gold Vermeil */}
            <div className="flex items-center gap-3">
              <span className="w-40 font-semibold">Gold Vermeil</span>
              <input
                type="number"
                value={goldVermeilPrice}
                onChange={(e) => setGoldVermeilPrice(e.target.value)}
                className="flex-1 px-4 py-3 border-2 rounded-xl focus:border-yellow-500 outline-none"
                placeholder="Enter gold vermeil price per gram"
              />
            </div>
          </div>


          {/* Gemstone Prices */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gemstone Prices per Carat (₹)
            </label>

            <div className="space-y-3">

              {/* Gemstone Prices */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gemstone Prices per Carat (₹)
                </label>

                <div className="space-y-3">

                  {/* Dropdown */}
                  <div className="flex gap-3 items-center">
                    <select
                      className="px-3 py-2 border rounded"
                      onChange={(e) => {
                        const st = e.target.value;
                        if (st && !gemstonePrices[st]) {
                          setGemstonePrices((prev) => ({ ...prev, [st]: 0 }));

                        }
                      }}
                    >
                      <option value="">Select Gemstone</option>
                      {GEMSTONE_TYPES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Render gemstone inputs */}
                  {Object.entries(gemstonePrices).map(([stone, value]) => (
                    <div key={stone} className="flex items-center gap-3">
                      <span className="w-28 font-semibold">{stone}</span>

                      <input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          setGemstonePrices((prev) => ({
                            ...prev,
                            [stone]: Number(e.target.value),
                          }))
                        }
                        className="flex-1 px-4 py-3 border-2 rounded-xl focus:border-yellow-500 outline-none"
                        placeholder={`Enter ${stone} price`}
                      />

                      <button
                        className="text-red-500 text-sm"
                        onClick={() =>
                          setGemstonePrices((prev) => {
                            const clone = { ...prev };
                            delete clone[stone];
                            return clone;
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional: Add new gemstone manually */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add Gemstone (e.g. Emerald)"
                  className="px-3 py-2 border rounded"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const st = e.target.value.trim();
                      if (st !== "" && !gemstonePrices[st]) {
                        setGemstonePrices((prev) => ({ ...prev, [st]: 0 }));

                      }
                      e.target.value = "";
                    }
                  }}
                />
              </div>

            </div>
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
