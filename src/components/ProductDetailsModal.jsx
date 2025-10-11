import { useState, useEffect } from "react";
import axios from "axios";

// Supported currencies
const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹", flag: "🇮🇳" },
  { code: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "CAD", symbol: "CA$", flag: "🇨🇦" },
  { code: "EUR", symbol: "€", flag: "🇪🇺" },
];

// Variant colors
const VARIANT_COLORS = {
  "Yellow Gold": "bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-600 shadow-inner",
  "White Gold": "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 shadow-inner",
  "Rose Gold": "bg-gradient-to-r from-[#b76e79] via-pink-200 to-[#b76e79] shadow-inner",
  "Silver": "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-400 shadow-inner",
  "Platinum": "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 shadow-inner",
};

// Utility — safely display string or array
const displayVal = (val) =>
  Array.isArray(val) ? val.join(", ") : val || "—";

export default function ProductDetailsModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currency, setCurrency] = useState("INR");

  const fetchProduct = async (id = productId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/ornaments/${id}?currency=${currency}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const ornament = res.data.ornament;
      setProduct(ornament);
      setSelectedImage(ornament.coverImage || ornament.images?.[0] || null);
    } catch (err) {
      console.error("❌ Failed to fetch product details:", err);
    }
  };

  useEffect(() => {
    if (productId) fetchProduct(productId);
  }, [productId, currency]);

  if (!product) return null;

  // ✅ Price Display
  const getDisplayPrice = () => {
    const curr = currency.toUpperCase();
    if (curr === "INR") return `₹${product.price}`;
    if (product.prices && product.prices[curr]) {
      return `${product.prices[curr].symbol}${product.prices[curr].amount}`;
    }
    return "Not available";
  };

  const displayPrice = getDisplayPrice();
  const thumbnails = [product.coverImage, ...(product.images || [])].filter(Boolean);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-yellow-500 to-amber-600">
          <h2 className="text-xl font-bold text-white">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 px-3 py-1 rounded-lg"
          >
            ❌
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Images */}
          <div>
            <div className="w-full h-96 border rounded-xl overflow-hidden flex items-center justify-center bg-gray-100">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400">No image</span>
              )}
            </div>

            <div className="flex gap-3 mt-4 overflow-x-auto">
              {thumbnails.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                    selectedImage === img ? "border-yellow-500" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-4">
            {/* Currency Selector */}
            <div className="flex items-center gap-3">
              <label className="font-semibold">Currency:</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 border-2 rounded-lg focus:border-yellow-500"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Variants */}
            {product.variantLinks &&
              Object.keys(product.variantLinks).length > 0 && (
                <div>
                  <p className="font-semibold mb-2">Available Variants:</p>
                  <div className="flex gap-4">
                    {Object.entries(product.variantLinks).map(([variant, id]) =>
                      id ? (
                        <button
                          key={variant}
                          onClick={() => window.open(`/product/${id}`, "_blank")}
                          title={variant}
                          className={`w-10 h-10 rounded-full border-2 border-gray-300 hover:scale-110 transition ${
                            VARIANT_COLORS[variant] || "bg-gray-300"
                          }`}
                        />
                      ) : null
                    )}
                  </div>
                </div>
              )}

            {/* Info */}
            <p><span className="font-semibold">SKU:</span> {product.sku}</p>
           
            <p><span className="font-semibold">Category:</span> {displayVal(product.category)}</p>
            <p><span className="font-semibold">Sub Category:</span> {displayVal(product.subCategory)}</p>
            <p><span className="font-semibold">Gender:</span> {product.gender}</p>
            <p><span className="font-semibold">Weight:</span> {product.weight} g</p>
            <p><span className="font-semibold">Purity:</span> {product.purity || "—"}</p>
            <p><span className="font-semibold">Metal Type:</span> {product.metalType || "N/A"}</p>
            <p><span className="font-semibold">Stone Type:</span> {product.stoneType || "N/A"}</p>
            <p><span className="font-semibold">Style:</span> {product.style || "N/A"}</p>
            <p><span className="font-semibold">Size:</span> {product.size || "N/A"}</p>
            <p><span className="font-semibold">Color:</span> {product.color || "N/A"}</p>

            {/* Price */}
           {/* 🪙 Price Section (Enhanced) */}
<div className="mt-4">
  <p className="font-semibold mb-1">Price:</p>

  <div className="flex items-baseline gap-2">
    {/* ✅ Current Price */}
    <span className="text-green-600 font-bold text-xl">
      {product.currency || "₹"}
      {product.displayPrice?.toLocaleString() || product.price?.toLocaleString()}
    </span>

    {/* ✅ Original Price */}
    {product.originalPrice && product.originalPrice > product.displayPrice && (
      <span className="text-gray-400 line-through text-sm">
        {product.currency || "₹"}
        {product.originalPrice?.toLocaleString()}
      </span>
    )}

    {/* ✅ Discount % */}
    {product.discount > 0 && (
      <span className="text-red-500 font-semibold text-sm">
        ({product.discount}% OFF)
      </span>
    )}
  </div>

  {/* ✅ Savings info */}
  {product.originalPrice > product.displayPrice && (
    <p className="text-sm text-green-700 mt-1">
      You save {product.currency || "₹"}
      {(product.originalPrice - product.displayPrice).toLocaleString()}!
    </p>
  )}
</div>


            <p><span className="font-semibold">Making Charges:</span> ₹{product.makingCharges}</p>
            <p><span className="font-semibold">Stock:</span> {product.stock}</p>
            <p><span className="font-semibold">Featured:</span> {product.isFeatured ? "Yes" : "No"}</p>
            <p><span className="font-semibold">Rating:</span> {product.rating} ⭐ ({product.reviews} reviews)</p>
            <p><span className="font-semibold">Description:</span> {product.description || "No description"}</p>
            {product.stoneDetails && (
              <p><span className="font-semibold">Stone Details:</span> {product.stoneDetails}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
