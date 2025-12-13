// EditProductModal.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

/* ---------- Constants (confirmed) ---------- */
const METAL_TYPES = [
"18K Gold",
 "18K White Gold", 
 "18K Rose Gold",
  "14K Gold", 
  "14K White Gold", 
  "14K Rose Gold",
   "Platinum",
    "925 Sterling Silver", 
    "Gold Vermeil",
];

const PURITIES = ["18K", "22K", "14K"]; // No 24K as requested

const CATEGORY_OPTIONS = [
  "rings",
  "earrings",
  "necklaces",
  "bracelets",
  "mens",
  "loose-diamonds",
];

const SUBCATEGORY_MAP = {
  rings: ["engagement", "wedding", "eternity", "cocktail", "gemstone", "gold", "fashion"],
  earrings: ["studs", "hoops", "gemstone", "gold", "fashion"],
  necklaces: ["tennis", "pendants", "gemstone", "gold", "fashion"],
  bracelets: ["tennis", "bangles", "gemstone", "gold", "fashion"],
  mens: ["rings", "earrings", "necklaces", "bracelets", "cufflinks"],
  "loose-diamonds": [],
};

const DIAMOND_COLORS = ["D","E","F","G","H","I","J","K","L","M","N","O","P"];
const DIAMOND_CLARITIES = ["IF","VVS1","VVS2","VS1","VS2","SI1","SI2","I1","I2","I3"];
const DIAMOND_CUTS = ["Excellent","Very Good","Good","Fair","Poor"];

/* ---------- Component ---------- */
export default function EditProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({});
  const [prices, setPrices] = useState({}); // computed price map by currency (if provided)
  const [makingChargesByCountry, setMakingChargesByCountry] = useState({});
  const [stones, setStones] = useState([]); // gemstoneDetails
  const [metal, setMetal] = useState({ weight: 0, purity: "", metalType: "" });

  // Diamonds
  const [diamondDetails, setDiamondDetails] = useState({
    carat: 0,
    count: 0,
    color: "",
    clarity: "",
    cut: "",
    pricePerCarat: 0,
    useAuto: true,
  });
  const [sideDiamondDetails, setSideDiamondDetails] = useState([]);

  const [variantList, setVariantList] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImagesFiles, setNewImagesFiles] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [imagesToAdd, setImagesToAdd] = useState([]);

  const [coverFile, setCoverFile] = useState(null);
  const [model3DFile, setModel3DFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  // frontend-only variants search
  const [allVariantsCache, setAllVariantsCache] = useState([]);
  const [variantSearchQuery, setVariantSearchQuery] = useState("");
  const [variantSearchResults, setVariantSearchResults] = useState([]);
  const [variantSearchLoading, setVariantSearchLoading] = useState(false);
  const [variantFilterFields, setVariantFilterFields] = useState({
    byName: true, bySku: true, byMetal: true, byLabel: true, byColor: true,
  });

  // Pricing fetched from backend (matches controllers/pricingController.js)
  const [pricingModel, setPricingModel] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  /* ---------- INIT FROM PRODUCT ---------- */
  useEffect(() => {
    if (!product) return;

    setForm({
      name: product.name || "",
      description: product.description || "",
      categoryType: product.categoryType || "Gold",
      category: product.category || "rings",
      subCategory: product.subCategory || "",
      gender: product.gender || "Unisex",
      price: product.price ?? 0,
      originalPrice: product.originalPrice ?? 0,
      discount: product.discount ?? 0,
      makingCharges: product.makingCharges ?? 0,
      stock: product.stock ?? 1,
      isFeatured: !!product.isFeatured,
      color: product.color || "",
      size: product.size || "",
      variantLabel: product.variantLabel || "",
    });

    setPrices(product.prices || {});
    setMakingChargesByCountry(product.makingChargesByCountry || {});
    setStones(product.gemstoneDetails || []);
    setMetal(product.metal || { weight: 0, purity: "", metalType: "" });

    setDiamondDetails(
      product.diamondDetails || {
        carat: 0, count: 0, color: "", clarity: "", cut: "", pricePerCarat: 0, useAuto: true,
      }
    );

    // ⭐ Load backend manual override totals if present
setForm((f) => ({
  ...f,
  mainDiamondTotal:
    product.mainDiamondTotal !== null && product.mainDiamondTotal !== undefined
      ? product.mainDiamondTotal
      : "",
  sideDiamondTotal:
    product.sideDiamondTotal !== null && product.sideDiamondTotal !== undefined
      ? product.sideDiamondTotal
      : "",
}));



    setSideDiamondDetails(product.sideDiamondDetails || []);

    // normalize variants -> array [{label,id}]
    const variantsArr = [];
    if (product.variants) {
      if (Array.isArray(product.variants)) {
        product.variants.forEach((v) => {
          if (v._id) variantsArr.push({ label: v.label || v.name || "", id: v._id });
          else if (typeof v === "object" && v.label && v.id) variantsArr.push(v);
        });
      } else if (typeof product.variants === "object") {
        Object.entries(product.variants).forEach(([label, id]) => variantsArr.push({ label, id }));
      }
    }
    setVariantList(variantsArr);

    setExistingImages(product.images || []);
    setNewImagesFiles([]);
    setImagesToRemove([]);
    setImagesToAdd([]);

    setCoverFile(null);
    setModel3DFile(null);
    setVideoFile(null);
  }, [product]);

  /* ---------- Load pricing model once (backend) ---------- */
  useEffect(() => {
    let cancelled = false;
    const loadPricing = async () => {
      setPricingLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/ornaments/pricing`);
        if (cancelled) return;
        if (res.data?.success && res.data?.pricing) {
          setPricingModel(res.data.pricing);
        } else if (res.data?.pricing) {
          setPricingModel(res.data.pricing);
        } else {
          setPricingModel(null);
        }
      } catch (err) {
        console.warn("Failed to load pricing:", err);
        setPricingModel(null);
      } finally {
        if (!cancelled) setPricingLoading(false);
      }
    };
    loadPricing();
    return () => { cancelled = true; };
  }, []);

  /* ---------- load variants cache once (frontend search) ---------- */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setVariantSearchLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/ornaments`, {
          params: { isVariant: true, limit: 500 },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        const list = res.data?.ornaments || [];
        setAllVariantsCache(list);
      } catch (err) {
        console.error("Failed to fetch variants cache:", err);
        setAllVariantsCache([]);
      } finally {
        if (!cancelled) setVariantSearchLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  /* ---------- local filtering of cached variants ---------- */
  useEffect(() => {
    if (!variantSearchQuery) {
      setVariantSearchResults([]);
      return;
    }
    const q = variantSearchQuery.trim().toLowerCase();
    const fields = variantFilterFields;
    const filtered = allVariantsCache.filter((v) => {
      try {
        if (fields.byName && v.name && v.name.toLowerCase().includes(q)) return true;
        if (fields.bySku && v.sku && String(v.sku).toLowerCase().includes(q)) return true;
        if (fields.byMetal && v.metal?.metalType && v.metal.metalType.toLowerCase().includes(q)) return true;
        if (fields.byLabel && v.variantLabel && v.variantLabel.toLowerCase().includes(q)) return true;
        if (fields.byColor && v.color && v.color.toLowerCase().includes(q)) return true;
        return false;
      } catch (e) {
        return false;
      }
    });
    setVariantSearchResults(filtered.slice(0, 50));
  }, [variantSearchQuery, allVariantsCache, variantFilterFields]);

  /* ---------- form helpers ---------- */
  // const handleFormChange = (e) => {
  //   const { name, value, checked, type } = e.target;
  //   setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : (type === "number" ? (value === "" ? "" : Number(value)) : value) }));
  // };

  const handleFormChange = (e) => {
  const { name, value, checked, type } = e.target;

  // prevent override fields from being auto-number processed
  if (name === "mainDiamondTotal" || name === "sideDiamondTotal") {
    setForm((p) => ({ ...p, [name]: value }));
    return;
  }

  setForm((p) => ({
    ...p,
    [name]:
      type === "checkbox"
        ? checked
        : type === "number"
        ? (value === "" ? "" : Number(value))
        : value,
  }));
};


  const updateMetal = (k, v) => setMetal((m) => ({ ...m, [k]: v }));
  const addStone = () => {
    setStones((s) => [...s, { stoneType: "", carat: 0, count: 1, pricePerCarat: 0, useAuto: true, color: "", clarity: "", cut: "" }]);
  };
  const updateStone = (idx, k, v) => setStones((s) => s.map((st, i) => (i === idx ? { ...st, [k]: v } : st)));
  const removeStone = (idx) => setStones((s) => s.filter((_, i) => i !== idx));

  const updateMainDiamond = (k, v) => setDiamondDetails((d) => ({ ...d, [k]: v }));
  const addSideDiamond = () => setSideDiamondDetails((s) => [...s, { carat: 0, count: 1, color: "", clarity: "", cut: "", pricePerCarat: 0, useAuto: true }]);
  const updateSideDiamond = (idx, k, v) => setSideDiamondDetails((s) => s.map((it, i) => (i === idx ? { ...it, [k]: v } : it)));
  const removeSideDiamond = (idx) => setSideDiamondDetails((s) => s.filter((_, i) => i !== idx));

  // price and making handlers
  const handlePriceCurrency = (code, symbol, amount) =>
    setPrices((p) => ({ ...p, [code]: { amount: Number(amount) || 0, symbol } }));
  const handleMakingCharge = (code, symbol, amount) =>
    setMakingChargesByCountry((p) => ({ ...p, [code]: { amount: Number(amount) || 0, symbol, currency: code } }));

  // media handlers
  const onCoverFileChange = (e) => setCoverFile(e.target.files?.[0] || null);
  const onNewImagesChange = (e) => setNewImagesFiles(Array.from(e.target.files || []));
  const markImageToRemove = (url) => setImagesToRemove((p) => (p.includes(url) ? p.filter((x) => x !== url) : [...p, url]));
  const addImageUrlToAdd = (url) => { if (!url) return; setImagesToAdd((p) => [...p, url]); };
  const onModel3DChange = (e) => setModel3DFile(e.target.files?.[0] || null);
  const onVideoChange = (e) => setVideoFile(e.target.files?.[0] || null);

  // variant linking helpers (same as before)
  const addVariantLinkFromInput = (inputValue) => {
    if (!inputValue) return;
    const parts = inputValue.split(":");
    let label = parts.length > 1 ? parts[0].trim() : "";
    let id = parts.length > 1 ? parts[1].trim() : parts[0].trim();
    if (!id) return;
    if (variantList.some((v) => String(v.id) === id)) return alert("Variant already linked");
    setVariantList((v) => [...v, { label: label || id, id }]);
  };
  const addVariantLinkFromObject = (variantObj) => {
    if (!variantObj || !variantObj._id) return;
    const label = variantObj.metal?.metalType || variantObj.variantLabel || variantObj.name || variantObj._id;
    if (variantList.some((v) => String(v.id) === variantObj._id)) return alert("Variant already linked");
    setVariantList((v) => [...v, { label, id: variantObj._id }]);
  };
  const removeVariantLink = (id) => setVariantList((v) => v.filter((x) => String(x.id) !== String(id)));

  /* ---------- Pricing calculation (mirrors controllers/pricingController.js) ---------- */
  const parsePurityFromMetal = (m) => {
    const purityMatch =
      (m?.purity || "").toUpperCase().match(/(\d+K)/) ||
      (m?.metalType || "").toUpperCase().match(/(\d+K)/);
    return purityMatch ? purityMatch[1] : null;
  };

  const calcGoldPrice = (metalObj, goldRates = {}) => {
    const purity = parsePurityFromMetal(metalObj);
    const rate = purity ? Number(goldRates?.[purity] || 0) : 0;
    const weight = Number(metalObj?.weight || 0);
    return weight * rate;
  };

  const calcDiamondPriceForDiamondCategory = (metalObj, diamondRate = 0) => {
    const weight = Number(metalObj?.weight || 0);
    return weight * Number(diamondRate || 0);
  };

  const calcGemstonePrice = (stonesArr = [], gemstoneRates = {}) => {
    let total = 0;
    stonesArr.forEach((st) => {
      const stoneType = st.stoneType || st.type || st.gemstoneType || st.name || "";
      if (!stoneType) return;
      const rate = Number(gemstoneRates?.[stoneType] || 0);
      const carat = Number(st.carat || st.weight || 0);
      const count = Number(st.count || 1);
      total += rate * carat * count;
    });
    return total;
  };

  const calcCompositePrice = (item, pricing) => {
    let goldCost = 0, diamondCost = 0, gemstoneCost = 0;

    if (pricing?.goldPrices) {
      goldCost = calcGoldPrice(item.metal || {}, pricing.goldPrices);
    }

    if (pricing?.diamondPricePerCarat) {
      const d = item.diamondDetails || {};
      diamondCost += Number(d.carat || 0) * Number(d.count || 0) * Number(pricing.diamondPricePerCarat || 0);
      (item.sideDiamondDetails || []).forEach((s) => {
        diamondCost += Number(s.carat || 0) * Number(s.count || 0) * Number(pricing.diamondPricePerCarat || 0);
      });
    }

    if (pricing?.gemstonePrices) {
      gemstoneCost = calcGemstonePrice(item.gemstoneDetails || item.stones || [], pricing.gemstonePrices);
    }

    return goldCost + diamondCost + gemstoneCost;
  };

  /* ---------- Auto-recompute price when relevant inputs change ---------- */
  useEffect(() => {
    // Recompute whenever pricingModel or key inputs change
    const doCompute = () => {

       if (!pricingModel) return;
      const categoryType = form.categoryType || product?.categoryType || "Gold";
      const currentPricing = pricingModel || {};
      let computed = 0;

      if (categoryType === "Gold") {
        computed = calcGoldPrice(metal, currentPricing.goldPrices || {});
      } else if (categoryType === "Diamond") {
        computed = calcDiamondPriceForDiamondCategory(metal, currentPricing.diamondPricePerCarat || 0);
      } else if (categoryType === "Gemstone") {
        computed = calcGemstonePrice(stones, currentPricing.gemstonePrices || {});
      } else if (categoryType === "Composite") {
        // build a small item-shape to pass into calcCompositePrice
        const itemShape = {
          metal,
          diamondDetails,
          sideDiamondDetails,
          gemstoneDetails: stones,
          stones,
        };
        computed = calcCompositePrice(itemShape, currentPricing);
      } else {
        // fallback: keep previous price
        computed = Number(form.price || 0);
      }

      // include making charges
const making = Number(form.makingCharges || 0);
const finalPrice = Number(computed || 0) + making;

// Only update final auto price — keep originalPrice & discount as user-entered
setForm((f) => ({
  ...f,
  price: finalPrice
}));

    };

    doCompute();
    // run when any dependency that affects price changes:
  }, [
    form.categoryType,
    metal,
    diamondDetails,
    sideDiamondDetails,
    stones,
    form.makingCharges,
    pricingModel,
    product?._id,
  ]);

  /* ---------- compute small previews ---------- */
  const mainDiamondPreview = useMemo(() => {
    const carat = Number(diamondDetails.carat || 0);
    const count = Number(diamondDetails.count || 0);
    const ppc = diamondDetails.useAuto ? Number(pricingModel?.diamondPricePerCarat || diamondDetails.pricePerCarat || 0) : Number(diamondDetails.pricePerCarat || 0);
    return carat * count * ppc;
  }, [diamondDetails, pricingModel]);

  const sideDiamondPreview = useMemo(() => {
    const rate = Number(pricingModel?.diamondPricePerCarat || 0);
    return (sideDiamondDetails || []).reduce((sum, s) => sum + Number(s.carat || 0) * Number(s.count || 0) * (s.useAuto ? rate : Number(s.pricePerCarat || 0)), 0);
  }, [sideDiamondDetails, pricingModel]);

  const gemstonesPreview = useMemo(() => {
    return calcGemstonePrice(stones, pricingModel?.gemstonePrices || {});
  }, [stones, pricingModel]);

  /* ---------- SAVE (same approach, keep using FormData) ---------- */
  const handleSave = async (e) => {
    e?.preventDefault();
    if (!product?._id) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();

      // core form fields
      Object.entries(form).forEach(([k, v]) => {
  if (v === undefined || v === null) return;

  // ❗ Prevent double-append of diamond totals
  if (k === "mainDiamondTotal" || k === "sideDiamondTotal") return;

  fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
});


      // metal, stones, diamonds
      fd.append("metal", JSON.stringify(metal));
      fd.append("stones", JSON.stringify(stones));
      fd.append("diamondDetails", JSON.stringify(diamondDetails));
      fd.append("sideDiamondDetails", JSON.stringify(sideDiamondDetails));
      // MANUAL OVERRIDE TOTALS (fix for backend override)
// MAIN OVERRIDE
// Send null if empty, number if manual
if (form.mainDiamondTotal === "" || form.mainDiamondTotal === null) {
  fd.append("mainDiamondTotal", "null");   // send null as string
} else {
  fd.append("mainDiamondTotal", String(form.mainDiamondTotal));
}


// Send null if empty, number if manual
if (form.sideDiamondTotal === "" || form.sideDiamondTotal === null) {
  fd.append("sideDiamondTotal", "null");
} else {
  fd.append("sideDiamondTotal", String(form.sideDiamondTotal));
}





      // prices/making charges
      fd.append("prices", JSON.stringify(prices));
      fd.append("makingChargesByCountry", JSON.stringify(makingChargesByCountry));

      // variants map (only for base products)
      if (!product.isVariant) {
        const map = {};
        variantList.forEach((v) => { if (v.label && v.id) map[v.label] = v.id; });
        fd.append("variants", JSON.stringify(map));
      }

      // images & media
      if (coverFile) fd.append("coverImage", coverFile);
      if (newImagesFiles.length) newImagesFiles.forEach((f) => fd.append("images", f));
      if (model3DFile) fd.append("model3D", model3DFile);
      if (videoFile) fd.append("videoFile", videoFile);

      if (imagesToAdd.length) fd.append("addImage", JSON.stringify(imagesToAdd));
      if (imagesToRemove.length) fd.append("removeImage", JSON.stringify(imagesToRemove));

      console.log("========== DEBUG FORM PAYLOAD ==========");
console.log("mainDiamondTotal (raw):", form.mainDiamondTotal, "type:", typeof form.mainDiamondTotal);
console.log("sideDiamondTotal (raw):", form.sideDiamondTotal, "type:", typeof form.sideDiamondTotal);

console.log("diamondDetails:", diamondDetails);
console.log("sideDiamondDetails:", sideDiamondDetails);

console.log("Sending FormData entries:");
for (let pair of fd.entries()) {
  console.log(pair[0], "=>", pair[1]);
}
console.log("=========================================");

      

      // call update endpoint
      const res = await axios.put(`${API_URL}/api/ornaments/edit/${product._id}`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        alert(res.data.message || "Updated");
        onSave?.();
        onClose?.();
      } else {
        alert("Update returned unexpected response");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-auto" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="bg-white rounded-2xl w-full max-w-6xl my-8 shadow-xl">
        <div className="flex items-center justify-between p-4 bg-yellow-600 text-white rounded-t-2xl">
          <h3 className="text-lg font-semibold">Edit Product — {product?.name}</h3>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1 bg-white/20 rounded">Close</button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* BASIC ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

           <div className="flex flex-col">

              <label className="text-sm font-semibold text-gray-700 mb-1">Product Name</label>
            <input name="name" value={form.name || ""} onChange={handleFormChange} className="border p-2 rounded" placeholder="Name" />
           </div>

           <div className="flex flex-col">

              <label className="text-sm font-semibold text-gray-700 mb-1">Ornament Type </label>

            <select name="categoryType" value={form.categoryType || ""} onChange={handleFormChange} className="border p-2 rounded">
              <option>Gold</option><option>Diamond</option><option>Gemstone</option><option>Fashion</option><option>Composite</option>
            </select>
           </div>

           <div className="flex flex-col">

              <label className="text-sm font-semibold text-gray-700 mb-1">Category Type</label>

            <select name="category" value={form.category || "rings"} onChange={handleFormChange} className="border p-2 rounded">
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
           </div>

           <div className="flex flex-col">

              <label className="text-sm font-semibold text-gray-700 mb-1">SubCategory Type</label>

            <select name="subCategory" value={form.subCategory || ""} onChange={handleFormChange} className="border p-2 rounded">
              <option value="">— select subcategory —</option>
              {(SUBCATEGORY_MAP[form.category] || []).map((sc) => <option key={sc} value={sc}>{sc}</option>)}
            </select>
           </div>

           <div className="flex flex-col">

              <label className="text-sm font-semibold text-gray-700 mb-1">Gender</label>

            <select name="gender" value={form.gender || "Unisex"} onChange={handleFormChange} className="border p-2 rounded">
              <option>Men</option><option>Women</option><option>Unisex</option>
            </select>

           </div>

            <div className="flex gap-2">
             <div className="flex flex-col">

              <label className="text-sm font-semibold text-gray-700 mb-1">Selling Price</label>
              <input name="price" type="number" value={form.price || 0} onChange={handleFormChange} placeholder="Price (INR)" className="border p-2 rounded flex-1" />
             </div>
             <div className="flex flex-col">

              <label className="text-sm font-semibold text-gray-700 mb-1">Original Price</label>
              <input name="originalPrice" type="number" value={form.originalPrice || 0} onChange={handleFormChange} placeholder="Original Price" className="border p-2 rounded w-40" />
             </div>
            </div>

           <div className="flex flex-col">

              <label className="text-sm font-semibold text-gray-700 mb-1">Stock</label>

            <input name="stock" type="number" value={form.stock || 1} onChange={handleFormChange} placeholder="Stock" className="border p-2 rounded" />
           </div>

            <label className="flex items-center gap-2"><input name="isFeatured" type="checkbox" checked={!!form.isFeatured} onChange={handleFormChange} /> Featured</label>
          </div>

          {/* METAL */}
          <div className="border p-4 rounded">
            <h4 className="font-semibold mb-2">Metal</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <select value={metal.metalType || ""} onChange={(e) => updateMetal("metalType", e.target.value)} className="border p-2 rounded">
                <option value="">— metal type —</option>
                {METAL_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>

             <div className="flex flex-col">

              <label className="text-sm font-semibold text-gray-700 mb-1">Purity</label>

              <select value={metal.purity || ""} onChange={(e) => updateMetal("purity", e.target.value)} className="border p-2 rounded">
                <option value="">— purity —</option>
                {PURITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
             </div>

             <div className="flex flex-col">

              <label className="text-sm font-semibold text-gray-700 mb-1">Weight</label>

              <input value={metal.weight || ""} onChange={(e) => updateMetal("weight", e.target.value)} placeholder="Weight (g)" className="border p-2 rounded" />
             </div>

             {/* <div className="flex flex-col">

              <label className="text-sm font-semibold text-gray-700 mb-1">Making Charges</label>

              <input name="makingCharges" type="number" value={form.makingCharges || 0} onChange={handleFormChange} placeholder="Making Charges (INR)" className="border p-2 rounded" />
             </div> */}

             <div className="flex flex-col">
  <label className="text-sm font-semibold text-gray-700 mb-1">
    Making Charges
  </label>

  <input
    name="makingCharges"
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    value={form.makingCharges ?? ""}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, "");
      handleFormChange({
        target: { name: "makingCharges", value }
      });
    }}
    placeholder="Making Charges (INR)"
    className="border p-2 rounded"
  />
</div>

            </div>
            <div className="mt-2 text-sm text-gray-700">
              Computed metal price preview: <b>₹{Number(calcGoldPrice(metal, pricingModel?.goldPrices || {})).toLocaleString()}</b>
            </div>
          </div>

          {/* GEMSTONES */}
          <div className="border p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Gemstones</h4>
              <button type="button" onClick={addStone} className="px-2 py-1 bg-yellow-500 text-white rounded">+ Add</button>
            </div>

            {stones.map((s, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2 p-2 bg-gray-50 rounded">
                <input value={s.stoneType} onChange={(e) => updateStone(idx, "stoneType", e.target.value)} placeholder="Stone Type" className="border p-2 rounded" />
                <input value={s.carat} onChange={(e) => updateStone(idx, "carat", e.target.value)} placeholder="Carat" className="border p-2 rounded" />
                <input value={s.count} onChange={(e) => updateStone(idx, "count", e.target.value)} placeholder="Count" className="border p-2 rounded" />
                <input value={s.pricePerCarat} onChange={(e) => updateStone(idx, "pricePerCarat", e.target.value)} placeholder="Price Per Carat (manual)" className="border p-2 rounded" />
                <label className="flex items-center gap-2"><input type="checkbox" checked={s.useAuto !== false} onChange={(e) => updateStone(idx, "useAuto", e.target.checked)} /> Use auto</label>
                <div className="col-span-full flex justify-end"><button type="button" onClick={() => removeStone(idx)} className="text-red-500">Remove</button></div>
              </div>
            ))}

            <div className="mt-2 text-sm text-gray-700">Gemstone cost preview (auto rates): <b>₹{Number(gemstonesPreview).toLocaleString()}</b></div>
          </div>

          {/* DIAMONDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-4 rounded">
              <h4 className="font-semibold mb-2">Main Diamond</h4>
              <div className="grid grid-cols-2 gap-2">
                <input value={diamondDetails.carat || ""} onChange={(e) => updateMainDiamond("carat", e.target.value)} placeholder="Carat" className="border p-2 rounded" />
                <input value={diamondDetails.count || ""} onChange={(e) => updateMainDiamond("count", e.target.value)} placeholder="Count" className="border p-2 rounded" />

                <select value={diamondDetails.color || ""} onChange={(e) => updateMainDiamond("color", e.target.value)} className="border p-2 rounded">
                  <option value="">Color</option>
                  {DIAMOND_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <select value={diamondDetails.clarity || ""} onChange={(e) => updateMainDiamond("clarity", e.target.value)} className="border p-2 rounded">
                  <option value="">Clarity</option>
                  {DIAMOND_CLARITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <select value={diamondDetails.cut || ""} onChange={(e) => updateMainDiamond("cut", e.target.value)} className="border p-2 rounded">
                  <option value="">Cut</option>
                  {DIAMOND_CUTS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <input value={diamondDetails.pricePerCarat || ""} onChange={(e) => updateMainDiamond("pricePerCarat", e.target.value)} placeholder="Price Per Carat (manual)" className="border p-2 rounded" />

                <label className="flex items-center gap-2 col-span-full">
                  <input type="checkbox" checked={diamondDetails.useAuto !== false} onChange={(e) => updateMainDiamond("useAuto", e.target.checked)} /> Use auto pricing (backend diamondPricePerCarat)
                </label>
              </div>

              <div className="mt-2 text-sm text-gray-700">Main diamond preview: <b>₹{Number(mainDiamondPreview).toLocaleString()}</b></div>
              <div className="mt-2">
  <label className="text-sm">Manual Main Diamond Total Override (INR)</label>
  <input
    type="text"
    inputMode="numeric"
    value={form.mainDiamondTotal ?? ""}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        mainDiamondTotal: e.target.value.trim()
      }))
    }
    placeholder="Leave empty to use auto calculation"
    className="border p-2 rounded w-full mt-1"
  />
</div>

              <div className="mt-2">
  <label className="text-sm">Manual Main Diamond Total Override (INR)</label>
 <input
  type="text"
  inputMode="numeric"
  value={form.mainDiamondTotal ?? ""}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      mainDiamondTotal: e.target.value.trim()
    }))
  }
/>

</div>

            </div>

            <div className="border p-4 rounded">
              <h4 className="font-semibold mb-2">Side Diamonds</h4>
              <div className="space-y-2">
                {sideDiamondDetails.map((s, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={s.carat || ""} onChange={(e) => updateSideDiamond(idx, "carat", e.target.value)} placeholder="Carat" className="border p-2 rounded" />
                      <input value={s.count || ""} onChange={(e) => updateSideDiamond(idx, "count", e.target.value)} placeholder="Count" className="border p-2 rounded" />
                      <input value={s.pricePerCarat || ""} onChange={(e) => updateSideDiamond(idx, "pricePerCarat", e.target.value)} placeholder="Price Per Carat (manual)" className="border p-2 rounded" />
                      <input value={s.clarity || ""} onChange={(e) => updateSideDiamond(idx, "clarity", e.target.value)} placeholder="Clarity" className="border p-2 rounded" />
                      <input value={s.color || ""} onChange={(e) => updateSideDiamond(idx, "color", e.target.value)} placeholder="Color" className="border p-2 rounded" />
                      <input value={s.cut || ""} onChange={(e) => updateSideDiamond(idx, "cut", e.target.value)} placeholder="Cut" className="border p-2 rounded" />
                      <label className="flex items-center gap-2"><input type="checkbox" checked={s.useAuto !== false} onChange={(e) => updateSideDiamond(idx, "useAuto", e.target.checked)} /> Auto</label>
                    </div>
                    <div className="mt-2 flex justify-end"><button type="button" onClick={() => removeSideDiamond(idx)} className="text-red-500">Remove</button></div>
                  </div>
                ))}

                <div className="pt-2"><button type="button" onClick={addSideDiamond} className="px-3 py-1 bg-yellow-500 text-white rounded">+ Add Side Diamond</button></div>
                <div className="mt-2 text-sm text-gray-700">Side diamond preview total: <b>₹{Number(sideDiamondPreview).toLocaleString()}</b></div>
                <div className="mt-2">
  <label className="text-sm">Manual Side Diamond Total Override (INR)</label>
  <input
    type="text"
    inputMode="numeric"
    value={form.sideDiamondTotal ?? ""}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        sideDiamondTotal: e.target.value.trim()
      }))
    }
    placeholder="Leave empty to use auto calculation"
    className="border p-2 rounded w-full mt-1"
  />
</div>


                <div className="mt-2">
  <label className="text-sm">Manual Side Diamond Total Override (INR)</label>
<input
  type="text"
  inputMode="numeric"
  value={form.sideDiamondTotal ?? ""}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      sideDiamondTotal: e.target.value.trim()
    }))
  }
/>

</div>

              </div>
            </div>
          </div>

          {/* PRICES & MAKING (currency prices / making charges) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-3 rounded">
              <h4 className="font-semibold mb-2">Currency Prices</h4>
              {Object.entries(prices || {}).length === 0 && <p className="text-sm text-gray-500">No additional prices set</p>}
              {Object.entries(prices || {}).map(([code, info]) => (
                <div key={code} className="flex gap-2 items-center mb-2">
                  <div className="w-20 font-medium">{code}</div>
                  <input value={info.amount} onChange={(e) => handlePriceCurrency(code, info.symbol, e.target.value)} className="border p-2 rounded flex-1" />
                </div>
              ))}
            </div>

            <div className="border p-3 rounded">
              <h4 className="font-semibold mb-2">Making Charges by Country</h4>
              {Object.entries(makingChargesByCountry || {}).length === 0 && <p className="text-sm text-gray-500">No overrides set</p>}
              {Object.entries(makingChargesByCountry || {}).map(([code, info]) => (
                <div key={code} className="flex gap-2 items-center mb-2">
                  <div className="w-20 font-medium">{code}</div>
                  <input value={info.amount} onChange={(e) => handleMakingCharge(code, info.symbol, e.target.value)} className="border p-2 rounded flex-1" />
                </div>
              ))}
            </div>
          </div>

          {/* VARIANT LINKS (unchanged) */}
          {!product.isVariant && (
            <div className="border p-4 rounded">
              <h4 className="font-semibold mb-2">Variant Links</h4>

              <div className="mb-3">
                <input id="variantLinkInput" placeholder="label:id OR id" className="border p-2 rounded w-full" />
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => { const el = document.getElementById("variantLinkInput"); addVariantLinkFromInput(el?.value?.trim()); if (el) el.value = ""; }} className="px-3 py-1 bg-green-500 text-white rounded">Add</button>
                  <small className="text-xs text-gray-500">Use label:id or paste variant id</small>
                </div>
              </div>

              <div className="border p-3 rounded bg-gray-50 mb-3">
                <div className="flex gap-2 items-center mb-2">
                  <input value={variantSearchQuery} onChange={(e) => setVariantSearchQuery(e.target.value)} placeholder="Search cached variants (name / sku / metal / label / color)" className="border p-2 rounded flex-1" />
                  <button type="button" onClick={() => setVariantSearchQuery("")} className="px-3 py-1 bg-gray-200 rounded">Clear</button>
                </div>

                <div className="flex gap-2 text-xs mb-2">
                  <label className="flex items-center gap-1"><input type="checkbox" checked={variantFilterFields.byName} onChange={(e) => setVariantFilterFields(f => ({ ...f, byName: e.target.checked }))} /> Name</label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={variantFilterFields.bySku} onChange={(e) => setVariantFilterFields(f => ({ ...f, bySku: e.target.checked }))} /> SKU</label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={variantFilterFields.byMetal} onChange={(e) => setVariantFilterFields(f => ({ ...f, byMetal: e.target.checked }))} /> Metal</label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={variantFilterFields.byLabel} onChange={(e) => setVariantFilterFields(f => ({ ...f, byLabel: e.target.checked }))} /> Label</label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={variantFilterFields.byColor} onChange={(e) => setVariantFilterFields(f => ({ ...f, byColor: e.target.checked }))} /> Color</label>
                </div>

                <div className="max-h-60 overflow-auto bg-white rounded">
                  {variantSearchLoading && <div className="p-2 text-sm text-gray-500">Loading variants...</div>}
                  {!variantSearchLoading && variantSearchResults.length === 0 && variantSearchQuery && <div className="p-2 text-sm text-gray-500">No matches</div>}

                  {variantSearchResults.map((v) => (
                    <div key={v._id} className="flex items-center justify-between p-2 border-b">
                      <div>
                        <div className="font-medium">{v.name}</div>
                        <div className="text-xs text-gray-500">{v._id} • {v.metal?.metalType || v.variantLabel || ""}</div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => addVariantLinkFromObject(v)} className="px-3 py-1 bg-green-600 text-white rounded">Link</button>
                        <a href={`/admin/variant/${v._id}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-gray-200 rounded">Open</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {variantList.length === 0 && <div className="text-sm text-gray-500">No variants linked</div>}
                {variantList.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2 bg-white border rounded">
                    <div>
                      <div className="font-medium">{v.label}</div>
                      <div className="text-xs text-gray-500">{v.id}</div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`/admin/variant/${v.id}`} target="_blank" rel="noreferrer" className="px-2 py-1 bg-gray-200 rounded text-xs">Open</a>
                      <button type="button" onClick={() => removeVariantLink(v.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEDIA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Replace Cover Image</label>
              <input type="file" accept="image/*" onChange={onCoverFileChange} />
            </div>

            <div>
              <label className="block text-sm font-medium">Gallery (replace)</label>
              <input type="file" accept="image/*" multiple onChange={onNewImagesChange} />
              <div className="mt-2 flex gap-2 overflow-auto">
                {existingImages.map((url) => (
                  <div key={url} className="relative">
                    <img src={url} alt="exist" className="w-20 h-20 object-cover rounded" />
                    <label className="absolute top-0 right-0 bg-white p-1 rounded">
                      <input type="checkbox" checked={imagesToRemove.includes(url)} onChange={() => markImageToRemove(url)} />
                    </label>
                  </div>
                ))}
                {newImagesFiles.map((f, i) => (<img key={`new-${i}`} src={URL.createObjectURL(f)} className="w-20 h-20 rounded object-cover" alt="new" />))}
              </div>

              <div className="mt-2">
                <input id="imgUrlInput" placeholder="Add image URL to append" className="border p-2 rounded w-full" />
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => { const el = document.getElementById("imgUrlInput"); addImageUrlToAdd(el?.value?.trim()); if (el) el.value = ""; }} className="px-3 py-1 bg-green-500 text-white rounded">Append</button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">3D Model (.glb/.usdz)</label>
              <input type="file" accept=".glb,.usdz" onChange={onModel3DChange} />
              <label className="block text-sm font-medium mt-3">Product Video (MP4)</label>
              <input type="file" accept="video/mp4" onChange={onVideoChange} />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-yellow-500 text-white rounded">{isSaving ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
