import { useState, useEffect } from "react";

const subCategoryOptions = {
  rings: [
    "engagement",
    "wedding",
    "eternity",
    "cocktail",
    "gemstone",
    "gold",
    "fashion",
  ],
  earrings: ["studs", "hoops", "gemstone", "gold", "fashion"],
  necklaces: ["tennis", "pendants", "gemstone", "gold", "fashion"],
  bracelets: ["tennis", "bangles", "gemstone", "gold", "fashion"],
  mens: [
    "mens rings",
    "mens earrings",
    "mens necklaces",
    "mens bracelets",
    "cufflinks",
  ],
  "loose-diamonds": [],
};

const categoryOptions = [
  "rings",
  "earrings",
  "necklaces",
  "bracelets",
  "mens",
  "loose-diamonds",
];
const categoryTypeOptions = ["Gold", "Diamond", "Gemstone", "Fashion"];

// 🔹 Supported currencies with flags
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

// 🔹 Variants as linked products
const VARIANT_TYPES = [
  "Yellow Gold",
  "White Gold",
  "Rose Gold",
  "Silver",
  "Platinum",
];

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductForm({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "rings",
    category: "rings", // 🟢 now a simple string, not array
    subCategory: "", // 🟢 also a string
    categoryType: "Gold", // 🟢 matches backend field
    gender: "Unisex",
    weight: "",
    purity: "",
    price: "",
    originalPrice: "", // 🆕 added
    discount: "", // 🆕 added
    makingCharges: 0,
    stoneDetails: "",
    description: "",
    stock: 1,
    isFeatured: false,
    metalType: "",
    stoneType: "",
    style: "",
    size: "",
    color: "",
    rating: 0,
  });

  const [model3D, setModel3D] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [makingChargesByCountry, setMakingChargesByCountry] = useState({});
  // 🆕 Variant Controls

  const [variants, setVariants] = useState([]);

  // 🆕 Variant-specific images
  const [variantCoverImage, setVariantCoverImage] = useState(null);
  const [variantCoverPreview, setVariantCoverPreview] = useState(null);
  const [variantImages, setVariantImages] = useState([]);

  // 💎 NEW: Diamond Details (main)
  const [diamondDetails, setDiamondDetails] = useState({
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
  });

  // 💎 NEW: Side Diamond Details (optional)
  const [sideDiamondDetails, setSideDiamondDetails] = useState({
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
  });

  const [prices, setPrices] = useState({});
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 New: hold linked product IDs for each variant

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    const { price, originalPrice } = formData;
    if (price && originalPrice && originalPrice > price) {
      const calcDiscount = Math.round(
        ((originalPrice - price) / originalPrice) * 100
      );
      setFormData((prev) => ({ ...prev, discount: calcDiscount }));
    }
  }, [formData.price, formData.originalPrice]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 💎 NEW: handle changes in diamond detail fields
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
      [code]: { amount: value ? Number(value) : 0, symbol },
    }));
  };

  const handleMakingChargeChange = (code, symbol, value) => {
    setMakingChargesByCountry((prev) => ({
      ...prev,
      [code]: {
        amount: value ? Number(value) : 0,
        currency: code,
        symbol,
      },
    }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleImagesChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleModel3DChange = (e) => setModel3D(e.target.files[0]); // 🟢 New

  const handleSubmit = async () => {
    if (!formData.name || !formData.weight || !formData.price) {
      alert("Please fill all required fields: Name, Weight, Price");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value);
        }
      });

      if (Object.keys(prices).length > 0) {
        data.append("prices", JSON.stringify(prices));
      }

      if (Object.keys(makingChargesByCountry).length > 0) {
        data.append(
          "makingChargesByCountry",
          JSON.stringify(makingChargesByCountry)
        );
      }

      if (coverImage) data.append("coverImage", coverImage);
      if (images.length > 0)
        images.forEach((img) => data.append("images", img));

      if (model3D) data.append("model3D", model3D);
      if (videoFile) data.append("videoFile", videoFile);

      // ✅ Add variant links (ObjectId refs)

      if (formData.categoryType === "Diamond") {
        const hasSideDetails = Object.values(sideDiamondDetails).some(
          (v) => v && v !== ""
        );

        data.append("diamondDetails", JSON.stringify(diamondDetails));
        data.append(
          "sideDiamondDetails",
          JSON.stringify(hasSideDetails ? sideDiamondDetails : diamondDetails)
        );
      } // ✅ Add embedded variants

      if (variants.length > 0) {
        const variantData = variants.map((v) => ({
          color: v.color,
          metalType: v.metalType,
          size: v.size,
        }));

        // Attach structured JSON
        data.append("variants", JSON.stringify(variantData));

        // Attach each variant’s files under unique keys
        variants.forEach((v, index) => {
          if (v.coverImage) {
            data.append(`variant${index}_cover`, v.coverImage);
          }

          if (v.images?.length > 0) {
            v.images.forEach((img) => {
              data.append(`variant${index}_images`, img);
            });
          }
        });
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/ornaments/add`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const text = await response.text(); // get raw response
      let resData;
      try {
        resData = JSON.parse(text);
      } catch {
        console.error("❌ Server returned non-JSON response:", text);
        throw new Error("Server returned invalid JSON or Cloudinary error");
      }

      if (!response.ok)
        throw new Error(resData.message || "Failed to add product");

      alert("✅ Product added successfully!");
      onSave?.();
      onClose?.();
    } catch (err) {
      console.error("Add Product Error:", err);
      alert("❌ Failed to add product: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">✨ Add New Product</h2>
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              else console.warn("⚠️ onClose not passed to ProductForm");
            }}
            className="text-white hover:bg-white/20 px-3 py-1 rounded-lg"
          >
            ❌
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* Cover Image */}
          <div className="w-full h-64 border-2 border-dashed border-amber-500 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-100 shadow-sm">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400">Upload Cover Image</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="mt-3"
          />

          {/* 🧩 Variant Manager */}
          <div className="border border-amber-300 rounded-xl p-4 bg-amber-50 mb-8">
            <h3 className="font-semibold text-lg mb-3 text-amber-700">
              🧩 Product Variants
            </h3>

            {variants.map((variant, index) => (
              <div
                key={index}
                className="border border-gray-300 p-4 rounded-xl mb-4 bg-white"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-700">
                    Variant {index + 1}
                  </h4>
                  <button
                    onClick={() =>
                      setVariants((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-red-600 hover:underline text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["color", "metalType", "size"].map((field) => (
                    <div key={field}>
                      <label className="text-sm font-medium capitalize">
                        {field}
                      </label>
                      <input
                        type="text"
                        value={variant[field]}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index][field] = e.target.value;
                          setVariants(newVariants);
                        }}
                        className="w-full px-4 py-2 border-2 rounded-xl focus:border-yellow-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Variant Images */}
                <div className="mt-4">
                  <label className="block text-sm font-medium">
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[index].coverImage = e.target.files[0];
                      setVariants(newVariants);
                    }}
                    className="mt-2"
                  />
                  {variant.coverImage && (
                    <img
                      src={URL.createObjectURL(variant.coverImage)}
                      alt="Variant Cover"
                      className="w-32 h-32 object-cover mt-2 rounded-lg"
                    />
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium">
                    Gallery Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[index].images = Array.from(e.target.files);
                      setVariants(newVariants);
                    }}
                    className="mt-2"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={() =>
                setVariants((prev) => [
                  ...prev,
                  {
                    color: "",
                    metalType: "",
                    size: "",
                    coverImage: null,
                    images: [],
                  },
                ])
              }
              className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              ➕ Add Variant
            </button>
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-medium">
              Additional Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              3D Model (.glb / .usdz)
            </label>
            <input
              type="file"
              accept=".glb,.usdz"
              onChange={handleModel3DChange}
            />
          </div>

          {/* 🖼 Variant Images (if not base product) */}

          {/* Product Video (MP4) */}
          <div>
            <label className="block text-sm font-medium">
              Product Video (MP4)
            </label>
            <input
              type="file"
              accept="video/mp4"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setVideoFile(file);
                  setVideoPreview(URL.createObjectURL(file));
                }
              }}
              className="mt-2"
            />

            {videoPreview && (
              <video
                src={videoPreview}
                controls
                className="mt-4 rounded-lg border shadow-md w-full max-h-64 object-cover"
              />
            )}
          </div>

          {/* Product Fields */}
          {/* ... your name, type, category, gender, price, stock, etc. (unchanged) */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Product Name *
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium">
                Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              >
                {Object.keys(subCategoryOptions).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              >
                {["Men", "Women", "Unisex"].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Category - Using formData.category[0] for value is correct if it's an array of length 1 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* SubCategory - Using formData.subCategory[0] for value is correct if it's an array of length 1 */}
            <div>
              <label
                htmlFor="subCategory"
                className="block text-sm font-medium"
              >
                Sub Category
              </label>
              <select
                id="subCategory"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              >
                <option value="">-- Select Sub Category --</option>
                {(subCategoryOptions[formData.category] || []).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="categoryType"
                className="block text-sm font-medium"
              >
                Category Type *
              </label>
              <select
                id="categoryType"
                name="categoryType"
                value={formData.categoryType}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              >
                {["Gold", "Diamond", "Gemstone", "Fashion"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Purity */}
            <div>
              <label htmlFor="purity" className="block text-sm font-medium">
                Purity
              </label>
              <input
                id="purity"
                name="purity"
                value={formData.purity}
                onChange={handleChange}
                placeholder="e.g. 22K"
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              />
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium">
                Weight *
              </label>
              <input
                id="weight"
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Metal Type */}
              <div>
                <label className="block text-sm font-medium">Metal Type</label>
                <select
                  name="metalType"
                  value={formData.metalType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
                >
                  <option value="">-- Select Metal Type --</option>
                  {METAL_TYPES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stone Type */}
              <div>
                <label className="block text-sm font-medium">Stone Type</label>
                <select
                  name="stoneType"
                  value={formData.stoneType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
                >
                  <option value="">-- Select Stone Type --</option>
                  {STONE_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium">Style</label>
                <select
                  name="style"
                  value={formData.style}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
                >
                  <option value="">-- Select Style --</option>
                  {STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium">Size</label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="e.g., 6, 7, 16 inch"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g., Rose Gold, D-Color, Blue"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
                />
              </div>
            </div>

            {/* ⭐ Product Rating (Admin Input) */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, rating: star }))
                    }
                    className={`text-3xl ${
                      star <= formData.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    } hover:scale-110 transition-transform`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-gray-600">
                  {formData.rating} / 5
                </span>
              </div>
            </div>

            {/* Base Price (INR) */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium">
                Base Price (INR) *
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              />
            </div>

            {/* 🆕 Original Price (MRP) */}
            <div>
              <label
                htmlFor="originalPrice"
                className="block text-sm font-medium"
              >
                Original Price (INR)
              </label>
              <input
                id="originalPrice"
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="Enter MRP or old price"
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              />
            </div>

            {/* 🆕 Discount (%) */}
            <div>
              <label htmlFor="discount" className="block text-sm font-medium">
                Discount (%)
              </label>
              <input
                id="discount"
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="Optional (auto-calculated if left blank)"
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              />
            </div>

            {/* Making Charges */}
            <div>
              <label
                htmlFor="makingCharges"
                className="block text-sm font-medium"
              >
                Making Charges
              </label>
              <input
                id="makingCharges"
                type="number"
                name="makingCharges"
                value={formData.makingCharges}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              />
            </div>

            {/* Stock */}
            <div>
              <label htmlFor="stock" className="block text-sm font-medium">
                Stock *
              </label>
              <input
                id="stock"
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              />
            </div>
          </div>

          {/* 🔹 Multi-Currency Prices */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Prices for Other Currencies
            </h3>
            {currencyList.map(({ code, symbol, flag, country }) => (
              <div key={code} className="flex items-center gap-3 mb-3">
                <div className="w-40 flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
                  <span className="text-xl">{flag}</span>
                  <span className="font-medium">
                    {code} ({symbol})
                  </span>
                </div>
                <input
                  type="number"
                  placeholder={`Enter ${country} price`}
                  value={prices[code]?.amount || ""}
                  onChange={(e) =>
                    handlePriceChange(code, symbol, e.target.value)
                  }
                  className="flex-1 px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
                />
              </div>
            ))}
          </div>

          {/* 🔹 Making Charges by Country */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">
              Making Charges by Country
            </h3>
            {currencyList.map(({ code, symbol, flag, country }) => (
              <div key={code} className="flex items-center gap-3 mb-3">
                <div className="w-40 flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
                  <span className="text-xl">{flag}</span>
                  <span className="font-medium">
                    {code} ({symbol})
                  </span>
                </div>
                <input
                  type="number"
                  placeholder={`Enter making charge (${country})`}
                  value={makingChargesByCountry[code]?.amount || ""}
                  onChange={(e) =>
                    handleMakingChargeChange(code, symbol, e.target.value)
                  }
                  className="flex-1 px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
                />
              </div>
            ))}
          </div>

          {/* 🔹 Variant Links */}

          {/* Description, StoneDetails, Featured */}
          {/* ... same as before */}

          <>
            {/* Stone Details */}
            <div>
              <label
                htmlFor="stoneDetails"
                className="block text-sm font-medium"
              >
                Stone Details
              </label>
              <input
                id="stoneDetails"
                name="stoneDetails"
                value={formData.stoneDetails}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-yellow-500"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl rounded-xl focus:border-yellow-500"
              ></textarea>
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3">
              <input
                id="isFeatured"
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 text-yellow-500 border-2 rounded"
              />
              <label
                htmlFor="isFeatured"
                className="text-sm font-medium text-gray-700"
              >
                Featured Product
              </label>
            </div>
          </>

          {/* 💎 Only show diamond detail sections for Diamond categoryType */}
          {/* 💎 Show Diamond/Gemstone/Fashion detail sections */}
          {["Diamond", "Gemstone", "Fashion"].includes(
            formData.categoryType
          ) && (
            <div className="space-y-6">
              {/* Main Diamond Details */}
              <div className="border p-4 rounded-xl bg-gray-50">
                <h3 className="font-semibold mb-3">Main Diamond Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(diamondDetails).map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        type="text"
                        name={key}
                        value={diamondDetails[key]}
                        onChange={(e) => handleDiamondChange(e, false)}
                        className="w-full px-4 py-2 border-2 rounded-lg focus:border-yellow-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Diamond Details */}
              <div className="border p-4 rounded-xl bg-gray-50">
                <h3 className="font-semibold mb-3">
                  Side Diamond Details (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(sideDiamondDetails).map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        type="text"
                        name={key}
                        value={sideDiamondDetails[key]}
                        onChange={(e) => handleDiamondChange(e, true)}
                        className="w-full px-4 py-2 border-2 rounded-lg focus:border-yellow-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-zinc-200 rounded-xl hover:bg-zinc-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl"
            >
              {isSubmitting ? "Adding..." : "✨ Add Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
