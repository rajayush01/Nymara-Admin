import { useState, useEffect } from "react";
import axios from "axios";

// 🏷️ Currency options
const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹", flag: "🇮🇳" },
  { code: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "CAD", symbol: "CA$", flag: "🇨🇦" },
  { code: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "AED", symbol: "د.إ", flag: "🇦🇪" },
  { code: "AUD", symbol: "A$", flag: "🇦🇺" },
  { code: "SGD", symbol: "S$", flag: "🇸🇬" },
  { code: "JPY", symbol: "¥", flag: "🇯🇵" },
];

// 🎨 Variant color palette
const VARIANT_COLORS = {
  "Yellow Gold": "bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-600 shadow-inner",
  "White Gold": "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 shadow-inner",
  "Rose Gold": "bg-gradient-to-r from-[#b76e79] via-pink-200 to-[#b76e79] shadow-inner",
  "Silver": "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-400 shadow-inner",
  "Platinum": "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 shadow-inner",
};

const displayVal = (val) => (Array.isArray(val) ? val.join(", ") : val || "—");

const API_URL = import.meta.env.VITE_API_URL;


export default function ProductDetailsModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [variantGallery, setVariantGallery] = useState([]);
  const [activeVariant, setActiveVariant] = useState(null);
  const [currency, setCurrency] = useState("INR");

  // 🔹 Fetch product details
  const fetchProduct = async (id = productId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/ornaments/${id}?currency=${currency}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const ornament = res.data.ornament;
      setProduct(ornament);

      // ✅ Default gallery = base product (fallback safe)
      const baseGallery = [
        ornament.displayCoverImage || ornament.coverImage,
        ...(ornament.displayImages || ornament.images || []),
      ].filter(Boolean);

      setVariantGallery(baseGallery);
      setSelectedImage(baseGallery[0] || null);
      setActiveVariant(null);
    } catch (err) {
      console.error("❌ Failed to fetch product details:", err);
    }
  };

  useEffect(() => {
    if (productId) fetchProduct(productId);
  }, [productId, currency]);

  if (!product) return null;

  // 🪙 Price calculation (base or variant)
  const curr = currency.toUpperCase();

  const basePrice = product.prices?.[curr]?.amount ?? product.price ?? 0;
  const makingCharge =
    product.makingChargesByCountry?.[curr]?.amount ?? product.makingCharges ?? 0;

  const symbol =
    product.prices?.[curr]?.symbol ||
    product.makingChargesByCountry?.[curr]?.symbol ||
    "₹";

  // 🧮 If variant has its own price, use that
  const variantPrice = activeVariant?.price ?? 0;
  const displayPrice = variantPrice > 0 ? variantPrice : basePrice + makingCharge;

  const totalPrice = basePrice + makingCharge;

  // 🧩 Diamond detail renderer
  const renderDiamondDetails = (details, title) => {
    if (!details || Object.keys(details).length === 0) return null;
    return (
      <div className="border p-4 rounded-xl bg-gray-50 mt-4">
        <h3 className="font-semibold mb-2 text-lg">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {Object.entries(details).map(([key, val]) => (
            <p key={key}>
              <span className="font-medium capitalize">
                {key.replace(/([A-Z])/g, " $1")}:
              </span>{" "}
              {val || "—"}
            </p>
          ))}
        </div>
      </div>
    );
  };

  // 🧠 Gallery to display (variant > base)
  const thumbnails = variantGallery.filter(Boolean);

  // 🧩 Active display fields
  const displayMetalType = activeVariant?.metalType || product.metalType;
  const displayColor = activeVariant?.color || product.color;
  const displaySize = activeVariant?.size || product.size;

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
            X
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Images & Variants */}
          <div>
            {/* Main Image */}
            <div className="w-full h-96 border rounded-xl overflow-hidden flex items-center justify-center bg-gray-100">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-300"
                />
              ) : (
                <span className="text-gray-400">No image</span>
              )}
            </div>

            {/* Gallery */}
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {thumbnails.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                    selectedImage === img
                      ? "border-yellow-500"
                      : "border-transparent"
                  } hover:scale-105 transition-transform`}
                />
              ))}
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mt-6">
                <p className="font-semibold mb-2">Available Variants:</p>
                <div className="flex gap-3 flex-wrap">
                  {product.variants.map((variant, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <button
                        onClick={() => {
                          const variantImgs = [
                            variant.coverImage,
                            ...(variant.images || []),
                          ].filter(Boolean);

                          setSelectedImage(variantImgs[0] || product.coverImage);
                          setVariantGallery(
                            variantImgs.length > 0 ? variantImgs : variantGallery
                          );
                          setActiveVariant(variant);
                        }}
                        title={variant.metalType || variant.color || "Variant"}
                        className={`w-10 h-10 rounded-full border-2 hover:scale-110 transition ${
                          VARIANT_COLORS[variant.metalType] || "bg-gray-300"
                        } ${
                          activeVariant?.metalType === variant.metalType
                            ? "ring-2 ring-yellow-500"
                            : ""
                        }`}
                      />
                      <span className="text-xs mt-1 text-gray-600 text-center w-16 truncate">
                        {variant.metalType || variant.color || "Variant"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

            {/* Basic Info */}
            <p><span className="font-semibold">SKU:</span> {product.sku}</p>
            <p>
              <span className="font-semibold">Product ID:</span>{" "}
              <button
                onClick={() => navigator.clipboard.writeText(product._id)}
                className="text-blue-600 underline hover:text-blue-800"
                title="Copy Product ID"
              >
                {product._id}
              </button>
            </p>

            <p><span className="font-semibold">Category:</span> {displayVal(product.category)}</p>
            <p><span className="font-semibold">Sub Category:</span> {displayVal(product.subCategory)}</p>
            <p><span className="font-semibold">Gender:</span> {product.gender}</p>
            <p><span className="font-semibold">Weight:</span> {product.weight} g</p>
            <p><span className="font-semibold">Purity:</span> {product.purity || "—"}</p>
            <p><span className="font-semibold">Metal Type:</span> {displayMetalType || "N/A"}</p>
            <p><span className="font-semibold">Color:</span> {displayColor || "N/A"}</p>
            <p><span className="font-semibold">Size:</span> {displaySize || "N/A"}</p>

            {/* 🪙 Price Section */}
            <div className="mt-4">
              <p className="font-semibold mb-1">Price (with Making Charges):</p>
              <div className="flex items-baseline gap-2">
                <span className="text-green-600 font-bold text-xl">
                  {symbol}
                  {displayPrice.toLocaleString()}
                </span>
                {product.originalPrice > displayPrice && (
                  <span className="text-gray-400 line-through text-sm">
                    {symbol}
                    {product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="text-red-500 font-semibold text-sm">
                    ({product.discount}% OFF)
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-700 mt-1">
                Base: {symbol}
                {basePrice.toLocaleString()} + Making: {symbol}
                {makingCharge.toLocaleString()}
              </p>
            </div>

            <p><span className="font-semibold">Stock:</span> {product.stock}</p>
            <p><span className="font-semibold">Featured:</span> {product.isFeatured ? "Yes" : "No"}</p>
            <p><span className="font-semibold">Rating:</span> {product.rating} ⭐</p>
            <p><span className="font-semibold">Description:</span> {product.description || "No description"}</p>

            {product.categoryType === "Diamond" && (
              <>
                {renderDiamondDetails(product.diamondDetails, "Main Diamond Details")}
                {renderDiamondDetails(product.sideDiamondDetails, "Side Diamond Details")}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
