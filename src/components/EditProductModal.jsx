import { useState, useEffect } from "react";
import axios from "axios";

// Options (reuse same as Add Form)
const TYPE_OPTIONS = ["Ring", "Necklace", "Chain", "Bracelet", "Earring", "Pendant", "Bangle", "Other"];
const GENDER_OPTIONS = ["Men", "Women", "Unisex"];
const CATEGORY_OPTIONS = ["Gold", "Diamond", "Gemstone", "Fashion"];
const SUBCATEGORY_MAP = {
  Ring: ["Engagement Rings", "Wedding Rings", "Eternity Band", "Cocktail Rings", "Fashion Rings"],
  Earring: ["Studs", "Hoops", "Drops", "Fashion Earrings"],
  Necklace: ["Tennis", "Pendant", "Fashion Necklace"],
  Bracelet: ["Tennis Bracelet", "Bangles", "Fashion Bracelet"],
  Chain: ["Other"],
  Pendant: ["Other"],
  Bangle: ["Other"],
  Other: ["Gemstone", "Gold", "Diamond", "Other"],
};

const CURRENCY_LIST = [
  { code: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "CAD", symbol: "CA$", flag: "🇨🇦" },
  { code: "EUR", symbol: "€", flag: "🇪🇺" },
];

export default function EditProductModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState(product || {});
  const [prices, setPrices] = useState(product?.prices || {});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(product || {});
    setPrices(product?.prices || {});
  }, [product]);

  if (!product) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Auto-calculate discount when price/originalPrice changes
    if (name === "price" || name === "originalPrice") {
      const updatedValue = Number(value);
      const updatedData = { ...formData, [name]: updatedValue };
      if (updatedData.originalPrice && updatedData.price) {
        updatedData.discount = Math.round(
          ((updatedData.originalPrice - updatedData.price) / updatedData.originalPrice) * 100
        );
      }
      setFormData(updatedData);
      return;
    }

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceChange = (code, symbol, value) => {
    setPrices((prev) => ({
      ...prev,
      [code]: { amount: value ? Number(value) : 0, symbol },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Remove sku (cannot be updated)
      const { sku, ...cleanFormData } = formData;

      const payload = {
        ...cleanFormData,
        category: Array.isArray(cleanFormData.category)
          ? cleanFormData.category[0]
          : cleanFormData.category,
        subCategory: Array.isArray(cleanFormData.subCategory)
          ? cleanFormData.subCategory[0]
          : cleanFormData.subCategory,
        prices,
      };

      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/ornaments/edit/${product._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Product updated successfully!");
      onSave();
      onClose();
    } catch (err) {
      console.error("❌ Update Product Error:", err.response?.data || err.message);
      alert("❌ Failed to update product: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-yellow-700 mb-4">✏️ Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Product Name"
            className="border p-2 rounded w-full"
          />

          {/* Type */}
          <select name="type" value={formData.type || ""} onChange={handleChange} className="border p-2 rounded w-full">
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Gender */}
          <select name="gender" value={formData.gender || ""} onChange={handleChange} className="border p-2 rounded w-full">
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Category */}
          <select
            name="category"
            value={formData.category || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            className="border p-2 rounded w-full"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* SubCategory */}
          <select
            name="subCategory"
            value={formData.subCategory || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, subCategory: e.target.value }))}
            className="border p-2 rounded w-full"
          >
            <option value="">-- Select Sub Category --</option>
            {SUBCATEGORY_MAP[formData.type || "Other"]?.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          {/* Weight & Purity */}
          <input
            type="number"
            name="weight"
            value={formData.weight || ""}
            onChange={handleChange}
            placeholder="Weight"
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="purity"
            value={formData.purity || ""}
            onChange={handleChange}
            placeholder="Purity (e.g. 22K)"
            className="border p-2 rounded w-full"
          />

          {/* 🆕 Original Price */}
          <input
            type="number"
            name="originalPrice"
            value={formData.originalPrice || ""}
            onChange={handleChange}
            placeholder="Original Price (INR)"
            className="border p-2 rounded w-full"
          />

          {/* 🆕 Discount */}
          <input
            type="number"
            name="discount"
            value={formData.discount || ""}
            onChange={handleChange}
            placeholder="Discount (%)"
            className="border p-2 rounded w-full"
          />

          {/* Base Price (INR) */}
          <input
            type="number"
            name="price"
            value={formData.price || ""}
            onChange={handleChange}
            placeholder="Base Price (INR)"
            className="border p-2 rounded w-full"
          />

          {/* Multi-Currency Prices */}
          <div>
            <label className="font-semibold">Other Currency Prices</label>
            <div className="space-y-2 mt-2">
              {CURRENCY_LIST.map(({ code, symbol, flag }) => (
                <div key={code} className="flex items-center gap-2">
                  <span className="w-24 flex items-center gap-1">{flag} {code}</span>
                  <input
                    type="number"
                    value={prices[code]?.amount || ""}
                    onChange={(e) => handlePriceChange(code, symbol, e.target.value)}
                    placeholder={`Price in ${code}`}
                    className="flex-1 border p-2 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Stock */}
          <input
            type="number"
            name="stock"
            value={formData.stock || ""}
            onChange={handleChange}
            placeholder="Stock"
            className="border p-2 rounded w-full"
          />

          {/* Making Charges */}
          <input
            type="number"
            name="makingCharges"
            value={formData.makingCharges || ""}
            onChange={handleChange}
            placeholder="Making Charges"
            className="border p-2 rounded w-full"
          />

          {/* Description */}
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Description"
            className="border p-2 rounded w-full"
          ></textarea>

          {/* Featured */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured || false}
              onChange={handleChange}
            />
            Featured Product
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
