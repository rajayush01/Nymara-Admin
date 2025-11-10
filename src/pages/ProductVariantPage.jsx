import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

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

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductVariantPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/ornaments/${id}?currency=${currency}`,
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
    if (id) fetchProduct();
  }, [id, currency]);

  if (!product) return <p>Loading...</p>;

  // ✅ Compute display price
  const displayPrice =
    product.prices?.[currency]?.symbol + product.prices?.[currency]?.amount ||
    (currency === "INR" ? `₹${product.price}` : `${product.currency}${product.displayPrice}`);

  // ✅ Thumbnails
  const thumbnails = [product.coverImage, ...(product.images || [])].filter(Boolean);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

      {/* Currency Selector */}
      <div className="mb-4">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          {CURRENCY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code} ({c.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Images + Details */}
      <div className="flex gap-6">
        {/* Images */}
        <div className="flex-1">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-96 object-contain border rounded"
            />
          ) : (
            <p>No Image</p>
          )}
          <div className="flex gap-2 mt-3">
            {thumbnails.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`thumb-${idx}`}
                className={`w-20 h-20 object-cover rounded border cursor-pointer ${
                  selectedImage === img ? "border-yellow-500" : ""
                }`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-3">
          <p>
            <span className="font-semibold">Type:</span> {product.type}
          </p>
          <p>
            <span className="font-semibold">Category:</span>{" "}
            {product.category?.join(", ")}
          </p>
          <p>
            <span className="font-semibold">Gender:</span> {product.gender}
          </p>
          <p>
            <span className="font-semibold">Weight:</span> {product.weight} g
          </p>
          <p>
            <span className="font-semibold">Purity:</span> {product.purity}
          </p>

          {/* Price */}
          <p className="text-lg">
            <span className="font-semibold">Price:</span>{" "}
            <span className="text-green-600 font-bold">{displayPrice}</span>
          </p>

          <p>
            <span className="font-semibold">Stock:</span> {product.stock}
          </p>
          <p>
            <span className="font-semibold">Description:</span>{" "}
            {product.description || "No description"}
          </p>

          {/* ✅ Variant Links */}
          {product.variantLinks && Object.keys(product.variantLinks).length > 0 && (
            <div>
              <p className="font-semibold mb-2">Available Variants:</p>
              <div className="flex gap-4">
                {Object.entries(product.variantLinks).map(([variant, linkedId]) =>
                  linkedId ? (
                    <button
                      key={variant}
                      onClick={() => (window.location.href = `/product/${linkedId}`)}
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
        </div>
      </div>
    </div>
  );
}
