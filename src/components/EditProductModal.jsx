import { useState, useEffect } from "react";
import axios from "axios";

const subCategoryOptions = {
  rings: ["engagement", "wedding", "eternity", "cocktail", "gemstone", "gold", "fashion"],
  earrings: ["studs", "hoops", "gemstone", "gold", "fashion"],
  necklaces: ["tennis", "pendants", "gemstone", "gold", "fashion"],
  bracelets: ["tennis", "bangles", "gemstone", "gold", "fashion"],
  mens: ["mens rings", "mens earrings", "mens necklaces", "mens bracelets", "cufflinks"],
  "loose-diamonds": [],
};

const categoryOptions = ["rings", "earrings", "necklaces", "bracelets", "mens", "loose-diamonds"];
const categoryTypeOptions = ["Gold", "Diamond", "Gemstone", "Fashion"];

const METAL_TYPES = [
  "18K White Gold",
  "18K Yellow Gold",
  "18K Rose Gold",
  "Platinum",
  "Sterling Silver",
  "14K Yellow Gold",
];

const STONE_TYPES = [
  "Lab-Grown Diamond",
  "Lab-Grown Sapphire",
  "Lab-Grown Emerald",
  "Lab-Grown Ruby",
  "Pearl",
  "None",
];

const STYLES = [
  "Solitaire",
  "Halo",
  "Three Stone",
  "Wedding Band",
  "Eternity",
  "Cocktail",
  "Drop",
  "Vintage",
  "Tennis",
  "Cluster",
  "Chain",
  "Signet",
  "Studs",
  "Bangles",
];

const currencyList = [
  { code: "USD", symbol: "$", flag: "🇺🇸", country: "United States" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", country: "United Kingdom" },
  { code: "CAD", symbol: "CA$", flag: "🇨🇦", country: "Canada" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", country: "European Union" },
  { code: "AED", symbol: "د.إ", flag: "🇦🇪", country: "United Arab Emirates" },
  { code: "AUD", symbol: "A$", flag: "🇦🇺", country: "Australia" },
  { code: "SGD", symbol: "S$", flag: "🇸🇬", country: "Singapore" },
  { code: "JPY", symbol: "¥", flag: "🇯🇵", country: "Japan" },
];

const defaultDiamondDetails = {
  stoneType: "Diamond",
  creationMethod: "Lab Grown",
  shape: "",
  diamondColor: "",
  color: "",
  clarity: "",
  cutGrade: "",
  count: "",
  caratWeight: "",
  totalCaratWeight: "",
  setting: "",
};

const API_URL = import.meta.env.VITE_API_URL;

export default function EditProductModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState(product || {});
  const [prices, setPrices] = useState(product?.prices || {});
  const [makingChargesByCountry, setMakingChargesByCountry] = useState(product?.makingChargesByCountry || {});
  const [variants, setVariants] = useState(product?.variants || []);
  const [isSaving, setIsSaving] = useState(false);

  const [diamondDetails, setDiamondDetails] = useState(
    product?.diamondDetails && Object.keys(product.diamondDetails).length > 0
      ? product.diamondDetails
      : defaultDiamondDetails
  );
  
  const [sideDiamondDetails, setSideDiamondDetails] = useState(
    product?.sideDiamondDetails && Object.keys(product.sideDiamondDetails).length > 0
      ? product.sideDiamondDetails
      : defaultDiamondDetails
  );

  const [model3D, setModel3D] = useState(null);
  const [existingModel3D, setExistingModel3D] = useState(product?.model3DUrl || null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(product?.videoUrl || null);

  useEffect(() => {
    setFormData(product || {});
    setPrices(product?.prices || {});
    setMakingChargesByCountry(product?.makingChargesByCountry || {});
    setVariants(product?.variants || []);
    setVideoPreview(product?.videoUrl || null);
    setExistingModel3D(product?.model3DUrl || null);

    setDiamondDetails(
      product?.diamondDetails && Object.keys(product.diamondDetails).length > 0
        ? product.diamondDetails
        : defaultDiamondDetails
    );

    setSideDiamondDetails(
      product?.sideDiamondDetails && Object.keys(product.sideDiamondDetails).length > 0
        ? product.sideDiamondDetails
        : defaultDiamondDetails
    );
  }, [product]);

  useEffect(() => {
    const { price, originalPrice } = formData;
    if (price && originalPrice && originalPrice > price) {
      const calcDiscount = Math.round(((originalPrice - price) / originalPrice) * 100);
      setFormData((prev) => ({ ...prev, discount: calcDiscount }));
    }
  }, [formData.price, formData.originalPrice]);

  if (!product) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDiamondChange = (e, isSide = false) => {
    const { name, value } = e.target;
    if (isSide) {
      setSideDiamondDetails((prev) => ({ ...prev, [name]: value }));
    } else {
      setDiamondDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceChange = (code, symbol, value) => {
    setPrices((prev) => ({
      ...prev,
      [code]: { amount: Number(value) || 0, symbol },
    }));
  };

  const handleMakingChargeChange = (code, symbol, value) => {
    setMakingChargesByCountry((prev) => ({
      ...prev,
      [code]: { amount: Number(value) || 0, symbol, currency: code },
    }));
  };

  const handleModel3DChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModel3D(file);
      setExistingModel3D(null);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((variant, i) => (i === index ? { ...variant, [field]: value } : variant))
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { color: "", metalType: "", size: "" },
    ]);
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.weight || !formData.price) {
      alert("Please fill all required fields: Name, Weight, Price");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      // Add all form fields (excluding image-related fields)
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "sku" || key === "_id" || key === "__v") return;
        // Skip image-related fields
        if (key === "coverImage" || key === "images") return;
        if (value !== undefined && value !== null) {
          data.append(key, value);
        }
      });

      if (Object.keys(prices).length > 0) {
        data.append("prices", JSON.stringify(prices));
      }

      if (Object.keys(makingChargesByCountry).length > 0) {
        data.append("makingChargesByCountry", JSON.stringify(makingChargesByCountry));
      }

      if (model3D) {
        data.append("model3D", model3D);
      }
      
      if (videoFile) {
        data.append("videoFile", videoFile);
      }

      if (["Diamond", "Gemstone", "Fashion"].includes(formData.categoryType)) {
        const hasSideDetails = Object.values(sideDiamondDetails).some((v) => v && v !== "");
        data.append("diamondDetails", JSON.stringify(diamondDetails));
        data.append(
          "sideDiamondDetails",
          JSON.stringify(hasSideDetails ? sideDiamondDetails : diamondDetails)
        );
      }

      if (variants.length > 0) {
        const variantData = variants.map((v) => ({
          color: v.color,
          metalType: v.metalType,
          size: v.size,
        }));
        data.append("variants", JSON.stringify(variantData));
      }

      await axios.put(
        `${API_URL}/api/ornaments/edit/${product._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Product updated successfully!");
      onSave();
      onClose();
    } catch (err) {
      console.error("❌ Update Product Error:", err);
      alert("❌ Failed to update product: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-white">✏️ Edit Product</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-white/20 px-3 py-1 rounded-lg transition-colors"
          >
            X
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* 3D Model */}
          <div>
            <label className="block text-sm font-medium mb-2">3D Model (.glb / .usdz)</label>
            <input
              type="file"
              accept=".glb,.usdz"
              onChange={handleModel3DChange}
              className="text-sm"
            />
            {existingModel3D && !model3D && (
              <p className="mt-2 text-sm text-green-600">✓ Current 3D model will be preserved unless you upload a new one</p>
            )}
          </div>

          {/* Video */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Video (MP4)</label>
            <input
              type="file"
              accept="video/mp4"
              onChange={handleVideoChange}
              className="mt-2 text-sm"
            />
            {videoPreview && (
              <video
                src={videoPreview}
                controls
                className="mt-4 rounded-lg border shadow-md w-full max-h-64 object-cover"
              />
            )}
            {videoPreview && !videoFile && (
              <p className="mt-2 text-xs text-green-600">✓ Current video will be preserved unless you upload a new one</p>
            )}
          </div>

          {/* Product Variants */}
          <div className="border border-amber-300 rounded-xl p-6 bg-amber-50">
            <h3 className="font-semibold text-lg mb-4 text-amber-700">🧩 Product Variants</h3>

            {variants.map((variant, index) => (
              <div
                key={index}
                className="border border-gray-300 p-4 rounded-xl mb-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-700">Variant {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:underline text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <input
                      type="text"
                      value={variant.color || ""}
                      onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Metal Type</label>
                    <select
                      value={variant.metalType || ""}
                      onChange={(e) => handleVariantChange(index, "metalType", e.target.value)}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
                    >
                      <option value="">Select Metal</option>
                      {METAL_TYPES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Size</label>
                    <input
                      type="text"
                      value={variant.size || ""}
                      onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              ➕ Add Variant
            </button>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <select
                name="type"
                value={formData.type || "rings"}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              >
                {Object.keys(subCategoryOptions).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gender *</label>
              <select
                name="gender"
                value={formData.gender || "Unisex"}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              >
                {["Men", "Women", "Unisex"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                name="category"
                value={formData.category || "rings"}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sub Category</label>
              <select
                name="subCategory"
                value={formData.subCategory || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              >
                <option value="">-- Select Sub Category --</option>
                {(subCategoryOptions[formData.category] || []).map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category Type *</label>
              <select
                name="categoryType"
                value={formData.categoryType || "Gold"}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              >
                {categoryTypeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Purity</label>
              <input
                type="text"
                name="purity"
                value={formData.purity || ""}
                onChange={handleChange}
                placeholder="e.g. 22K"
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Weight *</label>
              <input
                type="number"
                name="weight"
                value={formData.weight || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Metal Type</label>
              <select
                name="metalType"
                value={formData.metalType || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              >
                <option value="">-- Select Metal Type --</option>
                {METAL_TYPES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stone Type</label>
              <select
                name="stoneType"
                value={formData.stoneType || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              >
                <option value="">-- Select Stone Type --</option>
                {STONE_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Style</label>
              <select
                name="style"
                value={formData.style || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              >
                <option value="">-- Select Style --</option>
                {STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <input
                type="text"
                name="size"
                value={formData.size || ""}
                onChange={handleChange}
                placeholder="e.g., 6, 7, 16 inch"
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color || ""}
                onChange={handleChange}
                placeholder="e.g., Rose Gold, D-Color, Blue"
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Base Price (INR) *</label>
              <input
                type="number"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Original Price (INR)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice || ""}
                onChange={handleChange}
                placeholder="Enter MRP or old price"
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount || ""}
                onChange={handleChange}
                placeholder="Auto-calculated if left blank"
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Making Charges (INR)</label>
              <input
                type="number"
                name="makingCharges"
                value={formData.makingCharges || 0}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock || 1}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Product Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                  className={`text-3xl ${
                    star <= (formData.rating || 0) ? "text-yellow-400" : "text-gray-300"
                  } hover:scale-110 transition-transform`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Currency Prices */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">💰 Multi-Currency Prices</h3>
            {currencyList.map(({ code, symbol, flag, country }) => (
              <div key={code} className="flex items-center gap-3 mb-3">
                <div className="w-40 flex items-center gap-2 px-3 py-2 border rounded-lg bg-white">
                  <span className="text-xl">{flag}</span>
                  <span className="font-medium text-sm">{code} ({symbol})</span>
                </div>
                <input
                  type="number"
                  placeholder={`Enter making charge (${country})`}
                  value={makingChargesByCountry[code]?.amount || ""}
                  onChange={(e) => handleMakingChargeChange(code, symbol, e.target.value)}
                  className="flex-1 px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Stone Details */}
          <div>
            <label className="block text-sm font-medium mb-2">Stone Details</label>
            <textarea
              name="stoneDetails"
              value={formData.stoneDetails || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Enter stone information, e.g., type, weight, cut, clarity..."
              className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Enter product description..."
              className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured || false}
              onChange={handleChange}
              className="w-5 h-5 text-yellow-500 border-2 rounded cursor-pointer"
            />
            <label className="text-sm font-medium text-gray-700 cursor-pointer">
              Featured Product
            </label>
          </div>

         {/* Diamond Details (Only for Diamond/Gemstone/Fashion) */}
          {["Diamond", "Gemstone", "Fashion"].includes(formData.categoryType) && (
            <div className="space-y-6">
              {/* Main Diamond Details */}
              <div className="border-2 border-yellow-300 rounded-xl p-6 bg-yellow-50">
                <h3 className="font-semibold text-lg mb-4 text-yellow-700">💎 Main Diamond Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(diamondDetails).map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        type="text"
                        name={key}
                        value={diamondDetails[key] || ""}
                        onChange={(e) => handleDiamondChange(e, false)}
                        className="w-full px-4 py-2 border-2 rounded-lg focus:border-yellow-500 focus:outline-none"
                        placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Diamond Details */}
              <div className="border-2 border-amber-300 rounded-xl p-6 bg-amber-50">
                <h3 className="font-semibold text-lg mb-4 text-amber-700">💎 Side Diamond Details (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(sideDiamondDetails).map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        type="text"
                        name={key}
                        value={sideDiamondDetails[key] || ""}
                        onChange={(e) => handleDiamondChange(e, true)}
                        className="w-full px-4 py-2 border-2 rounded-lg focus:border-amber-500 focus:outline-none"
                        placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          

          {/* Submit Button */}
          <div className="text-right">
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-3 rounded-xl text-white font-medium ${
                isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"
              } transition-colors`}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 