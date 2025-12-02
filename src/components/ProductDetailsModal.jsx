import { useState, useEffect, useCallback } from "react";
import axios from "axios";

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

const VARIANT_COLORS = {
 "18K Gold": "bg-yellow-400",
  "18K White Gold": "bg-gray-200",
  "18K Rose Gold": "bg-rose-300",

  "14K Gold": "bg-yellow-300",
  "14K White Gold": "bg-gray-100",
  "14K Rose Gold": "bg-rose-200",

  "Platinum": "bg-gray-400",
  "925 Sterling Silver": "bg-gray-300",

  "Gold Vermeil": "bg-yellow-200"
};

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductDetailsModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [variantsList, setVariantsList] = useState([]);
  const [activeVariantIdx, setActiveVariantIdx] = useState(-1); // -1 = base product
  const [activeVariant, setActiveVariant] = useState(null);

  const [gallery, setGallery] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(false);

  /* ---------------- PRICE HELPERS ---------------- */
  const getPriceForCurrency = (v, currencyCode) => {
    if (!v) return 0;
    if (typeof v.displayPrice === "number") return v.displayPrice;
    if (v.prices?.[currencyCode]?.amount)
      return Number(v.prices[currencyCode].amount);
    if (typeof v.price === "number") return v.price;
    if (!isNaN(Number(v.price))) return Number(v.price);
    return 0;
  };

  const getMakingForCurrency = (v, currencyCode) => {
    if (!v) return 0;
    if (typeof v.convertedMakingCharge === "number")
      return v.convertedMakingCharge;
    if (v.makingChargesByCountry?.[currencyCode]?.amount)
      return Number(v.makingChargesByCountry[currencyCode].amount);
    if (typeof v.makingCharges === "number") return v.makingCharges;
    if (!isNaN(Number(v.makingCharges))) return Number(v.makingCharges);
    return 0;
  };

  /* ---------------- FETCH PRODUCT ---------------- */
  const fetchProduct = useCallback(
    async (id, curr) => {
      if (!id) return;
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/api/ornaments/${id}?currency=${curr}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { ornament, type } = res.data;
        if (!ornament) return;

        /* -------- IF OPENING A VARIANT -------- */
        // if (type === "variant") {
        //   setProduct(ornament.parentProduct || ornament);
        //   setActiveVariantIdx(-1);
        //   setActiveVariant(ornament);

        //   const imgs = [ornament.coverImage, ...(ornament.images || [])].filter(Boolean);
        //   setGallery(imgs);
        //   setSelectedImage(imgs[0] || null);

        //   setVariantsList(ornament.variants || []);
        //   return;
        // }

        if (type === "variant") {
  setProduct(ornament);        // variant itself becomes product
  setActiveVariantIdx(-1);
  setActiveVariant(ornament);

  const imgs = [ornament.coverImage, ...(ornament.images || [])].filter(Boolean);
  setGallery(imgs);
  setSelectedImage(imgs[0] || null);

  setVariantsList(ornament.variants || []);
  return;
}


        /* -------- MAIN PRODUCT -------- */
        setProduct(ornament);

        const baseImgs = [ornament.coverImage, ...(ornament.images || [])].filter(Boolean);
        setGallery(baseImgs);
        setSelectedImage(baseImgs[0] || null);

        setActiveVariantIdx(-1);    // default = base
        setActiveVariant(ornament);

        setVariantsList(ornament.variants || []);
      } catch (err) {
        console.error("fetchProduct error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ------------ WHEN VARIANTS/INDEX CHANGE ------------ */
  useEffect(() => {
    if (!product) return;

    // BASE PRODUCT selected
    if (activeVariantIdx === -1) {
      setActiveVariant(product);
      const imgs = [product.coverImage, ...(product.images || [])].filter(Boolean);
      setGallery(imgs);
      setSelectedImage(imgs[0] || null);
      return;
    }

    // VARIANT SELECTED
    const v = variantsList[activeVariantIdx];
    if (v) {
      setActiveVariant(v);
      const imgs = [v.coverImage, ...(v.images || [])].filter(Boolean);
      setGallery(imgs);
      setSelectedImage(imgs[0] || null);
    }
  }, [variantsList, activeVariantIdx, product]);

  /* ---------------- TRIGGER FETCH ---------------- */
  useEffect(() => {
    if (productId) fetchProduct(productId, currency);
  }, [productId, currency]);

  // ----------------- FIXED PRICE VARIABLES -----------------
// const symbol = v.currency || "₹";

// // Use backend computed total price (totalConvertedPrice OR price)
// const total = Number(
//   v.totalConvertedPrice ??
//   v.price ??
//   0
// );

// // Making charge from backend
// const making = Number(
//   v.convertedMakingCharge ??
//   v.makingChargesByCountry?.[currency]?.amount ??
//   v.makingCharges ??
//   0
// );

// // Base price = total - making
// const basePrice = total - making;

// // Gold value (backend-calculated goldTotal must be added in your backend response)
// const gold = Number(v.goldTotal ?? 0);

// // Main diamond price
// const mainDiamond =
//   Number(v.diamondDetails?.carat || 0) *
//   Number(v.diamondDetails?.count || 0) *
//   Number(v.diamondDetails?.pricePerCarat || 0);

// // Side diamonds
// const sideDiamond = (v.sideDiamondDetails || []).reduce(
//   (sum, d) =>
//     sum +
//     Number(d.carat || 0) *
//     Number(d.count || 0) *
//     Number(d.pricePerCarat || 0),
//   0
// );

/* ---------------- FIXED PRICE VARIABLES ---------------- */

// <--- ADD THIS FIRST ---
// const v = activeVariant || product;
// if (!v) return null;

// const symbol = v.currency || "₹";

// // Use backend computed total price (totalConvertedPrice OR price)
// const total = Number(
//   v.totalConvertedPrice ??
//   v.price ??
//   0
// );

// // Making charge from backend
// const making = Number(
//   v.convertedMakingCharge ??
//   v.makingChargesByCountry?.[currency]?.amount ??
//   v.makingCharges ??
//   0
// );

// // Base price = total - making
// const basePrice = total - making;

// // Gold value (backend-calculated goldTotal must be added in your backend response)
// const gold = Number(v.goldTotal ?? 0);

// // Main diamond price
// const mainDiamond =
//   Number(v.diamondDetails?.carat || 0) *
//   Number(v.diamondDetails?.count || 0) *
//   Number(v.diamondDetails?.pricePerCarat || 0);

// // Side diamonds
// const sideDiamond = (v.sideDiamondDetails || []).reduce(
//   (sum, d) =>
//     sum +
//     Number(d.carat || 0) *
//     Number(d.count || 0) *
//     Number(d.pricePerCarat || 0),
//   0
// );

// Always pick active variant → backend already sends full pricing
// const v = activeVariant || product;
// if (!v) return null;



// // All values come from backend dynamic pricing
// const symbol = v.currency || "₹";



// // const gold = Number(v.goldTotal ?? 0);
// // const mainDiamond = Number(v.mainDiamondTotal ?? 0);
// // const gemstones = Number(v.gemstonesTotal ?? 0);
// // const sideDiamond = Number(v.sideDiamondTotal ?? 0);
// // const basePrice = Number(v.basePrice ?? 0);                    // backend base total

// const gold = Number(v.goldTotal || 0);
// const mainDiamond = Number(v.mainDiamondTotal || 0);
// const sideDiamond = Number(v.sideDiamondTotal || 0);
// const gemstones = Number(v.gemstonesTotal || 0);

// const making = Number(v.makingCharges || v.convertedMakingCharge || 0);

// const basePrice =
//   Number(v.basePrice) ||
//   gold + mainDiamond + sideDiamond + gemstones;

// const displayPrice = basePrice; // INR price = base
// const total = basePrice + making;
const v = activeVariant || product;
if (!v) return null;

const isINR = currency === "INR";

let symbol = "₹";
let displayPrice = 0;
let making = 0;
let total = 0;

// Values only for INR breakdown
let gold = 0;
let mainDiamond = 0;
let sideDiamond = 0;
let gemstones = 0;
let basePrice = 0;

/* ------------------------------------
   FOREIGN CURRENCY (just mapped data)
------------------------------------ */
if (!isINR) {
  // displayPrice = Number(v.prices?.[currency]?.amount || 0);
  // making = Number(v.makingChargesByCountry?.[currency]?.amount || 0);

  // symbol = v.prices?.[currency]?.symbol || symbol;

  // total = displayPrice + making;

  
  displayPrice = Number(v.displayPrice || 0);
  making = Number(v.convertedMakingCharge || 0);

  symbol = v.currency || symbol;

  total = displayPrice + making;


}

/* ------------------------------------
   INR MODE (full breakdown)
------------------------------------ */
else {
  gold = Number(v.goldTotal || 0);
  mainDiamond = Number(v.mainDiamondTotal || 0);
  sideDiamond = Number(v.sideDiamondTotal || 0);
  gemstones = Number(v.gemstonesTotal || 0);

  making = Number(v.makingCharges || v.convertedMakingCharge || 0);

  basePrice =
    Number(v.basePrice) ||
    gold + mainDiamond + sideDiamond + gemstones;

  displayPrice = basePrice;
  total = basePrice + making;

  symbol = "₹";
}

// ----------------------------------------
// METAL PRICE PICKER (for Gold/Silver/Platinum/Vermeil)
// ----------------------------------------
const metalPrice =
  Number(v.goldTotal || 0) +
  Number(v.silverTotal || 0) +
  Number(v.platinumTotal || 0) +
  Number(v.vermeilTotal || 0);

// Dynamic label based on metal type
let metalLabel = "Metal Price";

if (v.metal?.metalType?.includes("Gold")) metalLabel = "Gold Price";
if (v.metal?.metalType === "Platinum") metalLabel = "Platinum Price";
if (v.metal?.metalType?.includes("Silver")) metalLabel = "Silver Price";
if (v.metal?.metalType === "Gold Vermeil") metalLabel = "Gold Vermeil Price";







  /* ---------------- SAFE PRICE CALC ---------------- */
  // const v = activeVariant || product;
  // if (!v) return null;

  // const symbol = v.currency || "₹";
  // const rawPrice = getPriceForCurrency(v, currency);
  // const rawMaking = getMakingForCurrency(v, currency);

  // const totalPrice =
  //   typeof v.totalConvertedPrice === "number"
  //     ? v.totalConvertedPrice
  //     : Number(rawPrice || 0) + Number(rawMaking || 0);

  // const originalPrice =
  //   typeof v.originalPrice === "number"
  //     ? v.originalPrice
  //     : v.originalPrice && !isNaN(Number(v.originalPrice))
  //     ? Number(v.originalPrice)
  //     : null;

  // const discount =
  //   typeof v.discount === "number"
  //     ? v.discount
  //     : Number(v.discount || 0);

  /* ---------------- RENDER ---------------- */
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{product.name}</h2>
            <div className="text-sm text-white/90">
              {product.sku} • {product.category} • {product.subCategory}
            </div>
          </div>

          <div className="flex items-center gap-3">

            {/* Prev/Next only when variant selected */}
            {variantsList.length > 0 && activeVariantIdx !== -1 && (
              <>
                <button
                  onClick={() =>
                    setActiveVariantIdx(
                      (activeVariantIdx - 1 + variantsList.length) %
                        variantsList.length
                    )
                  }
                  className="px-3 py-1 bg-white/20 text-white rounded"
                >
                  Prev
                </button>

                <button
                  onClick={() =>
                    setActiveVariantIdx(
                      (activeVariantIdx + 1) % variantsList.length
                    )
                  }
                  className="px-3 py-1 bg-white/20 text-white rounded"
                >
                  Next
                </button>
              </>
            )}

            <button onClick={onClose} className="text-white">X</button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT SIDE — IMAGES */}
          <div>
            <div className="w-full h-96 bg-gray-100 border rounded-xl flex items-center justify-center overflow-hidden">
              {selectedImage ? (
                <img src={selectedImage} className="w-full h-full object-contain" />
              ) : (
                <span>No Image</span>
              )}
            </div>

            <div className="flex gap-3 mt-4 overflow-x-auto">
              {(gallery || []).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-lg object-cover cursor-pointer border-2 ${
                    selectedImage === img ? "border-yellow-500" : "border-transparent"
                  }`}
                />
              ))}
            </div>

            {/* Variant Selector */}
            {variantsList.length > 0 && (
              <div className="mt-6">
                <p className="font-semibold mb-2">Available Variants</p>

                <div className="flex gap-3 flex-wrap">
                  {variantsList.map((variant, idx) => (
                    <div key={variant._id} className="flex flex-col items-center">

                      <button
                        onClick={() => setActiveVariantIdx(idx)}
                        className={`w-10 h-10 rounded-full border ${
                          VARIANT_COLORS[variant.metal?.metalType] || "bg-gray-300"
                        } ${
                          activeVariantIdx === idx
                            ? "ring-2 ring-yellow-500"
                            : ""
                        }`}
                        title={variant.metal?.metalType}
                      ></button>

                      <span className="text-xs mt-1 w-20 text-center truncate">
                        {variant.metal?.metalType}
                      </span>

                    </div>
                  ))}
                </div>

                {/* RESET TO BASE BUTTON */}
                {activeVariantIdx !== -1 && (
                  <button
                    onClick={() => setActiveVariantIdx(-1)}
                    className="mt-3 px-4 py-1 bg-gray-200 rounded text-sm"
                  >
                    Show Base Product
                  </button>
                )}

              </div>
            )}
          </div>

          {/* RIGHT SIDE — DETAILS */}
          <div className="space-y-4">

            {/* Currency Selector */}
            <div className="flex items-center gap-3">
              <label className="font-semibold">Currency:</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Section */}
            <div>
  <p><b>Price:</b></p>

  <div className="text-green-600 font-bold text-2xl">
    {symbol}{total.toLocaleString()}
  </div>

  {/* FOREIGN CURRENCY — SHOW ONLY WHAT BACKEND MAPS */}
  {!isINR && (
    <div className="text-sm mt-3 space-y-1 border p-3 rounded bg-gray-50">
      <div>
        Price: <b>{symbol}{displayPrice.toLocaleString()}</b>
      </div>

      <div>
        Making Charges: <b>{symbol}{making.toLocaleString()}</b>
      </div>

      <hr />

      <div className="text-lg">
        Total: <b>{symbol}{total.toLocaleString()}</b>
      </div>
    </div>
  )}

  {/* INR ONLY — FULL BREAKDOWN */}
  {isINR && (
    <div className="text-sm mt-3 space-y-1 border p-3 rounded bg-gray-50">

      <div>
  {metalLabel}: <b>₹{metalPrice.toLocaleString()}</b>
</div>


      <div>
        Main Diamond: <b>₹{mainDiamond.toLocaleString()}</b>
      </div>

      {sideDiamond > 0 && (
        <div>
          Side Diamonds: <b>₹{sideDiamond.toLocaleString()}</b>
        </div>
      )}

      {gemstones > 0 && (
        <div>
          Gemstones: <b>₹{gemstones.toLocaleString()}</b>
        </div>
      )}

      <div>
        Making Charges: <b>₹{making.toLocaleString()}</b>
      </div>

      <hr />

      <div>
        Base Price: <b>₹{basePrice.toLocaleString()}</b>
      </div>

      <div className="text-lg">
        Total: <b>₹{(basePrice + making).toLocaleString()}</b>
      </div>

    </div>
  )}
</div>



            {/* Basic Info */}
            <div>
              <p><b>SKU:</b> {product.sku}</p>
              <p><b>Category:</b> {product.category} • {product.subCategory}</p>
              <p><b>Gender:</b> {product.gender}</p>
            </div>

            <div>
              <p><b>Description:</b></p>
              <p className="text-sm text-gray-700">{product.description || "-"}</p>
            </div>

            {/* Main Diamond Details */}
{v?.diamondDetails && (v.diamondDetails.carat > 0 || v.diamondDetails.count > 0) && (
  <div className="border p-3 bg-gray-50 rounded-lg">
    <h4 className="font-semibold mb-2">Main Diamond</h4>
    <p><b>Carat:</b> {v.diamondDetails.carat}</p>
    <p><b>Count:</b> {v.diamondDetails.count}</p>
    <p><b>Color:</b> {v.diamondDetails.color || "-"}</p>
    <p><b>Clarity:</b> {v.diamondDetails.clarity || "-"}</p>
    <p><b>Cut:</b> {v.diamondDetails.cut || "-"}</p>
    <p><b>Price/Carat:</b> {v.diamondDetails.pricePerCarat}</p>
  </div>
)}

{/* Side Diamonds */}
{v?.sideDiamondDetails?.length > 0 && (
  <div className="border p-3 bg-gray-50 rounded-lg">
    <h4 className="font-semibold mb-2">Side Diamonds</h4>
    {v.sideDiamondDetails.map((d, i) => (
      <div key={i} className="mb-2 border-b pb-2 last:border-b-0">
        <p><b>Carat:</b> {d.carat}</p>
        <p><b>Count:</b> {d.count}</p>
        <p><b>Color:</b> {d.color || "-"}</p>
        <p><b>Clarity:</b> {d.clarity || "-"}</p>
        <p><b>Cut:</b> {d.cut || "-"}</p>
        <p><b>Price/Carat:</b> {d.pricePerCarat}</p>
      </div>
    ))}
  </div>
)}


            {/* Metal Info */}
            {v?.metal && (
              <div className="border p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Metal</h4>
                <p><b>Type:</b> {v.metal.metalType}</p>
                <p><b>Purity:</b> {v.metal.purity}</p>
                <p><b>Weight:</b> {v.metal.weight} g</p>
              </div>
            )}

            {/* Stones */}
          {/* Gemstones */}
{v?.gemstoneDetails?.length > 0 && (
  <div className="border p-3 bg-gray-50 rounded-lg">
    <h4 className="font-semibold mb-2">Gemstones</h4>

    {v.gemstoneDetails.map((g, i) => (
      <div key={i} className="mb-2 border-b pb-2 last:border-b-0">
        <p><b>Stone:</b> {g.stoneType}</p>
        <p><b>Carat:</b> {g.carat}</p>

        {g.pricePerCarat > 0 && (
          <p><b>Price/Carat:</b> {g.pricePerCarat}</p>
        )}
      </div>
    ))}
  </div>
)}


          </div>
        </div>
      </div>
    </div>
  );
}
