// // ProductForm.jsx
// import React, { useEffect, useState, useMemo } from "react";

// const API_URL = import.meta.env.VITE_API_URL || "";

// /* --------------------------
//    Helpers / Constants
// -------------------------- */
// const COLOR_GROUPS = ["Yellow", "White", "Rose", "Silver", "Platinum", "Other"];

// const METAL_TYPES = [
//   "18K White Gold",
//   "18K Yellow Gold",
//   "18K Rose Gold",
//   "Platinum",
//   "Sterling Silver",
//   "14K Yellow Gold",
// ];

// const STONE_TYPES = [
//   "Lab-Grown Diamond",
//   "Lab-Grown Sapphire",
//   "Lab-Grown Emerald",
//   "Lab-Grown Ruby",
//   "Pearl",
//   "None",
// ];

// const currencyList = [
//   { code: "USD", symbol: "$", flag: "🇺🇸", country: "United States" },
//   { code: "GBP", symbol: "£", flag: "🇬🇧", country: "United Kingdom" },
//   { code: "CAD", symbol: "CA$", flag: "🇨🇦", country: "Canada" },
//   { code: "EUR", symbol: "€", flag: "🇪🇺", country: "European Union" },
//   { code: "AED", symbol: "د.إ", flag: "🇦🇪", country: "United Arab Emirates" },
//   { code: "AUD", symbol: "A$", flag: "🇦🇺", country: "Australia" },
//   { code: "SGD", symbol: "S$", flag: "🇸🇬", country: "Singapore" },
//   { code: "JPY", symbol: "¥", flag: "🇯🇵", country: "Japan" },
// ];

// const subCategoryOptions = {
//   rings: ["engagement", "wedding", "eternity", "cocktail", "fashion"],
//   earrings: ["studs", "hoops", "drops", "fashion"],
//   necklaces: ["tennis", "pendants", "fashion"],
//   bracelets: ["tennis", "bangles", "fashion"],
//   mens: ["rings", "earrings", "necklaces", "bracelets", "cufflinks"],
//   "loose-diamonds": ["other"],
// };

// /* detect color group from metal string */
// const COLOR_DETECT = (metalType = "") => {
//   if (!metalType) return "Other";
//   const lower = metalType.toLowerCase();
//   if (lower.includes("yellow")) return "Yellow";
//   if (lower.includes("white")) return "White";
//   if (lower.includes("rose") || lower.includes("pink")) return "Rose";
//   if (lower.includes("silver")) return "Silver";
//   if (lower.includes("platinum")) return "Platinum";
//   return "Other";
// };

// /* --------------------------
//    Component
// -------------------------- */
// export default function ProductForm({
//   mode = "base", // "base" | "variant"
//   initial = null,
//   parentId = null, // used when mode === "variant"
//   onSaved = () => {},
//   onClose = () => {},
// }) {
//   const isVariantMode = mode === "variant";

//   /* --------------------------
//      Form State
//      - note: diamondDetails are optional (no forced default)
//   -------------------------- */
//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     categoryType: "Gold",
//     category: "rings",
//     subCategory: "",
//     gender: "Unisex",
//     variantLabel: "Metal Type",
//     metal: { metalType: "", weight: "", purity: "" },
//     price: "",
//     originalPrice: "",
//     discount: "",
//     makingCharges: "",
//     prices: {}, // multi-currency
//     makingChargesByCountry: {},
//     stones: [],
//     diamondDetails: null, // optional
//     sideDiamondDetails: null, // optional
//     stock: 1,
//     isFeatured: false,
//     color: "",
//     size: "",
//     variants: {}, // map label -> objectId
//   });

//   /* --------------------------
//      Media state (supports existing URLs + new File uploads)
//      imagesList is an array of { src: string, isFile: boolean, file?: File, id?:string }
//      - existing images from initial are isFile:false with src=URL
//      - newly selected files are isFile:true with file=File and src=objectURL
//   -------------------------- */
//   const [coverImageFile, setCoverImageFile] = useState(null); // File
//   const [existingCoverUrl, setExistingCoverUrl] = useState(null); // string (from initial)
//   const [coverPreview, setCoverPreview] = useState(null);

//   const [imagesList, setImagesList] = useState([]); // array described above
//   const [model3DFile, setModel3DFile] = useState(null);
//   const [existingModel3DUrl, setExistingModel3DUrl] = useState(null);
//   const [videoFile, setVideoFile] = useState(null);
//   const [existingVideoUrl, setExistingVideoUrl] = useState(null);
//   const [videoPreview, setVideoPreview] = useState(null);

//   // Variant drawer
//   const [variantDrawerOpen, setVariantDrawerOpen] = useState(false);
//   const [variantParentId, setVariantParentId] = useState(parentId || null);

//   // variant form state
//   const [variantForm, setVariantForm] = useState({
//     name: "",
//     description: "",
//     metal: { metalType: "", weight: "", purity: "" },
//     price: "",
//     originalPrice: "",
//     discount: "",
//     makingCharges: "",
//     prices: {},
//     makingChargesByCountry: {},
//     stones: [],
//     diamondDetails: null,
//     sideDiamondDetails: null,
//     stock: 1,
//     isFeatured: false,
//     color: "",
//     size: "",
//     variantLabel: "Metal Type",
//     colorGroup: "",
//   });

//   const [variantCoverFile, setVariantCoverFile] = useState(null);
//   const [variantExistingCoverUrl, setVariantExistingCoverUrl] = useState(null);
//   const [variantImagesList, setVariantImagesList] = useState([]); // same shape as imagesList
//   const [variantVideoFile, setVariantVideoFile] = useState(null);

//   // linking existing
//   const [linkSearchQuery, setLinkSearchQuery] = useState("");
//   const [linkSearchResults, setLinkSearchResults] = useState([]);
//   const [linkLoading, setLinkLoading] = useState(false);

//   // UI
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isCreatingBaseFirst, setIsCreatingBaseFirst] = useState(false);

//   /* --------------------------
//      initialize form when editing (initial may contain URLs)
//   -------------------------- */
//   useEffect(() => {
//     if (!initial) return;
//     console.log("[ProductForm] init from initial", initial);

//     // prepare imagesList: convert initial.images (array of URLs) to our list format
//     const initialImages = (initial.images || []).map((u) => ({ src: u, isFile: false }));

//     // cover
//     const coverUrl = initial.coverImage || null;

//     // model / video
//     const modelUrl = initial.model3D || null;
//     const videoUrl = initial.videoUrl || null;

//     setForm((f) => ({
//       ...f,
//       ...initial,
//       metal: initial.metal || f.metal,
//       stones: initial.stones || f.stones,
//       diamondDetails: initial.diamondDetails || f.diamondDetails,
//       sideDiamondDetails: initial.sideDiamondDetails || f.sideDiamondDetails,
//       prices: initial.prices || f.prices,
//       makingChargesByCountry: initial.makingChargesByCountry || f.makingChargesByCountry,
//       variants: initial.variants || f.variants,
//     }));

//     setVariantParentId(initial._id || parentId || null);

//     setExistingCoverUrl(coverUrl);
//     setImagesList(initialImages);
//     setExistingModel3DUrl(modelUrl);
//     setExistingVideoUrl(videoUrl);

//     // previews
//     setCoverPreview(coverUrl || null);
//     setVideoPreview(videoUrl || null);
//   }, [initial, parentId]);

//   /* --------------------------
//      Previews for file selections
//   -------------------------- */
//   useEffect(() => {
//     if (!coverImageFile) return;
//     const u = URL.createObjectURL(coverImageFile);
//     setCoverPreview(u);
//     return () => URL.revokeObjectURL(u);
//   }, [coverImageFile]);

//   useEffect(() => {
//     const previews = imagesList
//       .filter((it) => it.isFile && it.file)
//       .map((it) => it.src); // already objectURLs
//     // cleanup will be handled when files are removed/replaced since we create objectURL on add
//     return () => {
//       // revoke all file object URLs
//       imagesList.forEach((it) => {
//         if (it.isFile && it.src) URL.revokeObjectURL(it.src);
//       });
//     };
//   }, [imagesList]);

//   useEffect(() => {
//     if (!videoFile) return;
//     const u = URL.createObjectURL(videoFile);
//     setVideoPreview(u);
//     return () => URL.revokeObjectURL(u);
//   }, [videoFile]);

//   /* --------------------------
//      Small helpers
//   -------------------------- */
//   const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
//   const updateMetal = (k, v) => setForm((p) => ({ ...p, metal: { ...p.metal, [k]: v } }));

//   const setVariantField = (k, v) => setVariantForm((p) => ({ ...p, [k]: v }));
//   const updateVariantMetal = (k, v) => setVariantForm((p) => ({ ...p, metal: { ...p.metal, [k]: v } }));

//   const addStoneTo = (target = "base") => {
//     const newStone = { type: "Lab-Grown Diamond", weight: "", count: 1, quality: {}, price: "" };
//     if (target === "base") setForm((p) => ({ ...p, stones: [...(p.stones || []), newStone] }));
//     else setVariantForm((p) => ({ ...p, stones: [...(p.stones || []), newStone] }));
//   };
//   const updateStoneAt = (target, idx, key, value) => {
//     if (target === "base") {
//       setForm((p) => ({ ...p, stones: p.stones.map((s, i) => (i === idx ? { ...s, [key]: value } : s)) }));
//     } else {
//       setVariantForm((p) => ({ ...p, stones: p.stones.map((s, i) => (i === idx ? { ...s, [key]: value } : s)) }));
//     }
//   };
//   const removeStoneAt = (target, idx) => {
//     if (target === "base") setForm((p) => ({ ...p, stones: p.stones.filter((_, i) => i !== idx) }));
//     else setVariantForm((p) => ({ ...p, stones: p.stones.filter((_, i) => i !== idx) }));
//   };

//   /* --------------------------
//      Image helpers (existing + new)
//   -------------------------- */
//   const onAddGalleryFiles = (files) => {
//     // files: FileList or array
//     const list = Array.from(files || []);
//     const mapped = list.map((f) => ({ src: URL.createObjectURL(f), isFile: true, file: f }));
//     setImagesList((p) => [...p, ...mapped]);
//   };

//   const onRemoveGalleryAt = (index) => {
//     setImagesList((p) => {
//       const copy = [...p];
//       const [removed] = copy.splice(index, 1);
//       if (removed && removed.isFile && removed.src) URL.revokeObjectURL(removed.src);
//       return copy;
//     });
//   };

//   const onSetCoverFile = (file) => {
//     // when a new file is chosen, clear existingCoverUrl
//     setCoverImageFile(file || null);
//     if (file) setExistingCoverUrl(null);
//   };

//   const onRemoveCover = () => {
//     if (coverImageFile) {
//       setCoverImageFile(null);
//       setCoverPreview(null);
//     }
//     setExistingCoverUrl(null);
//   };

//   /* --------------------------
//      Multi-currency helpers
//   -------------------------- */
//   const setPriceCurrency = (code, amount, symbol = "") =>
//     setForm((p) => ({ ...p, prices: { ...(p.prices || {}), [code]: { amount: Number(amount || 0), symbol } } }));

//   const setMakingChargeByCountry = (code, amount, symbol = "") =>
//     setForm((p) => ({ ...p, makingChargesByCountry: { ...(p.makingChargesByCountry || {}), [code]: { amount: Number(amount || 0), symbol, currency: code } } }));

//   const setVariantPriceCurrency = (code, amount, symbol = "") =>
//     setVariantForm((p) => ({ ...p, prices: { ...(p.prices || {}), [code]: { amount: Number(amount || 0), symbol } } }));

//   const setVariantMakingChargeByCountry = (code, amount, symbol = "") =>
//     setVariantForm((p) => ({ ...p, makingChargesByCountry: { ...(p.makingChargesByCountry || {}), [code]: { amount: Number(amount || 0), symbol, currency: code } } }));

//   /* --------------------------
//      API helpers
//      - createProduct builds FormData that includes:
//         - JSON fields for objects/arrays
//         - existingImages (URLs to keep), existingCover (URL) and existingModel3D/Video
//         - files under coverImage / images / model3D / videoFile
//   -------------------------- */
//   async function createProduct(payloadForm, payloadMediaFiles, token) {
//     console.log("[createProduct] payloadForm:", payloadForm);
//     const fd = new FormData();

//     // Add simple fields + JSON stringify objects/arrays
//     Object.entries(payloadForm).forEach(([k, v]) => {
//       if (v === undefined || v === null) return;
//       // don't append variants map from UI directly unless meant to (we usually don't during add)
//       if (typeof v === "object") fd.append(k, JSON.stringify(v));
//       else fd.append(k, String(v));
//     });

//     // existing media urls to keep (server must honor these fields)
//     if (existingCoverUrl) fd.append("existingCover", existingCoverUrl);
//     const existingImageUrls = imagesList.filter((it) => !it.isFile).map((it) => it.src);
//     fd.append("existingImages", JSON.stringify(existingImageUrls || []));

//     if (existingModel3DUrl) fd.append("existingModel3D", existingModel3DUrl);
//     if (existingVideoUrl) fd.append("existingVideo", existingVideoUrl);

//     // append new files
//     if (payloadMediaFiles.coverFile) fd.append("coverImage", payloadMediaFiles.coverFile);
//     (payloadMediaFiles.imagesFiles || []).forEach((img) => fd.append("images", img));
//     if (payloadMediaFiles.model3DFile) fd.append("model3D", payloadMediaFiles.model3DFile);
//     if (payloadMediaFiles.videoFile) fd.append("videoFile", payloadMediaFiles.videoFile);

//     console.log("[createProduct] sending to", `${API_URL}/api/ornaments/add`);
//     const res = await fetch(`${API_URL}/api/ornaments/add`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` }, // do not set Content-Type - browser sets it for FormData
//       body: fd,
//     });

//     const text = await res.text();
//     console.log("[createProduct] raw response text:", text);
//     let data;
//     try { data = JSON.parse(text); } catch (e) { throw new Error("Server returned invalid response: " + text); }
//     if (!res.ok) {
//       console.error("[createProduct] server error", data);
//       throw new Error(data.message || "Create failed");
//     }
//     console.log("[createProduct] success:", data);
//     return data;
//   }

//   async function updateBaseVariantsMap(baseId, mergedVariants, token) {
//     console.log("[updateBaseVariantsMap] baseId:", baseId, "mergedVariants:", mergedVariants);
//     const fd = new FormData();
//     fd.append("variants", JSON.stringify(mergedVariants));
//     const res = await fetch(`${API_URL}/api/ornaments/edit/${baseId}`, {
//       method: "PUT",
//       headers: { Authorization: `Bearer ${token}` },
//       body: fd,
//     });
//     const text = await res.text();
//     console.log("[updateBaseVariantsMap] raw:", text);
//     let data;
//     try { data = JSON.parse(text); } catch (e) { throw new Error("Server returned invalid response: " + text); }
//     if (!res.ok) {
//       console.error("[updateBaseVariantsMap] failed", data);
//       throw new Error(data.message || "Update variants failed");
//     }
//     console.log("[updateBaseVariantsMap] success", data);
//     return data;
//   }

//   /* --------------------------
//      createBaseIfNeeded (used before opening variant drawer)
//   -------------------------- */
//   const createBaseIfNeeded = async () => {
//     if (form._id || (initial && initial._id)) {
//       const id = form._id || initial._id;
//       console.log("[createBaseIfNeeded] base exists:", id);
//       return id;
//     }

//     console.log("[createBaseIfNeeded] creating base product...");
//     setIsCreatingBaseFirst(true);
//     try {
//       const token = localStorage.getItem("token");
//       const payloadForm = { ...form, isVariant: false };
//       // don't send variants map during create
//       delete payloadForm.variants;

//       // gather file objects from media lists
//       const imagesFiles = imagesList.filter((it) => it.isFile).map((it) => it.file);
//       const payloadMedia = {
//         coverFile: coverImageFile,
//         imagesFiles,
//         model3DFile,
//         videoFile,
//       };

//       const data = await createProduct(payloadForm, payloadMedia, token);
//       const createdId = data?.product?._id || data?.productId || data?.ornament?._id || data?.baseProduct?._id || data?.mainProduct?._id || data?.id || null;
//       if (!createdId) throw new Error("Could not obtain created base product id from server response.");
//       setForm((p) => ({ ...p, _id: createdId }));
//       setVariantParentId(createdId);
//       setIsCreatingBaseFirst(false);
//       console.log("[createBaseIfNeeded] created id:", createdId);
//       return createdId;
//     } catch (err) {
//       console.error("[createBaseIfNeeded] error:", err);
//       setIsCreatingBaseFirst(false);
//       throw err;
//     }
//   };

//   /* --------------------------
//      Save base (explicit Save Base button)
//   -------------------------- */
//   const handleSaveBase = async () => {
//     console.log("[handleSaveBase] saving", form);
//     setIsSubmitting(true);
//     try {
//       const token = localStorage.getItem("token");
//       const payloadForm = { ...form, isVariant: false };
//       delete payloadForm.variants;
//       const imagesFiles = imagesList.filter((it) => it.isFile).map((it) => it.file);
//       const payloadMedia = {
//         coverFile: coverImageFile,
//         imagesFiles,
//         model3DFile,
//         videoFile,
//       };

//       const createdData = await createProduct(payloadForm, payloadMedia, token);
//       const createdId = createdData?.product?._id || createdData?.ornament?._id || createdData?.baseProduct?._id || createdData?.mainProduct?._id || createdData?.id || null;
//       if (createdId) {
//         setForm((p) => ({ ...p, _id: createdId }));
//       }
//       alert("Base product saved");
//       onSaved?.(createdData);
//     } catch (err) {
//       console.error("[handleSaveBase] error:", err);
//       alert("Failed to save base product: " + err.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* --------------------------
//      Variant create handler (drawer) - creates variant product + links to base
//   -------------------------- */
//   const handleCreateVariant = async () => {
//     if (!variantForm.name) return alert("Variant: provide a name");
//     if (!variantParentId) return alert("Parent product id missing (save base first)");

//     setIsSubmitting(true);
//     console.log("[handleCreateVariant] start", { variantForm, variantParentId });
//     try {
//       const token = localStorage.getItem("token");
//       const payload = { ...variantForm, isVariant: true, parentProduct: variantParentId };

//       const imagesFiles = variantImagesList.filter((it) => it.isFile).map((it) => it.file);
//       const payloadMedia = {
//         coverFile: variantCoverFile,
//         imagesFiles,
//         model3DFile: null,
//         videoFile: variantVideoFile,
//       };

//       const createdData = await createProduct(payload, payloadMedia, token);
//       console.log("[handleCreateVariant] createdData", createdData);

//       const variantObj = createdData?.product || createdData?.ornament || createdData?.variant || createdData?.mainProduct || null;
//       const createdId = variantObj?._id || createdData?.id || null;
//       const newVariantId = createdId || (createdData?.variants && Object.values(createdData.variants)[0]);

//       if (!newVariantId) throw new Error("Could not determine created variant id from response");

//       let label = variantForm.metal?.metalType && variantForm.metal.metalType.trim() !== "" ? variantForm.metal.metalType : (variantForm.colorGroup || variantForm.variantLabel || `variant-${newVariantId}`);

//       // fetch current parent variants map
//       const parentRes = await fetch(`${API_URL}/api/ornaments/${variantParentId}`, { headers: { Authorization: `Bearer ${token}` } });
//       const parentText = await parentRes.text();
//       let parentData;
//       try { parentData = JSON.parse(parentText); } catch { parentData = {}; }
//       const existingMap = (parentData?.ornament?.variants && typeof parentData.ornament.variants === "object") ? parentData.ornament.variants : {};

//       const merged = { ...(existingMap || {}), [label]: newVariantId };
//       await updateBaseVariantsMap(variantParentId, merged, token);

//       setForm((p) => ({ ...p, variants: merged }));
//       setVariantDrawerOpen(false);
//       onSaved?.({ createdVariant: variantObj || newVariantId, parentId: variantParentId });
//       alert("Variant created & linked");
//     } catch (err) {
//       console.error("[handleCreateVariant] error:", err);
//       alert("Failed to create variant: " + err.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* --------------------------
//      Search existing variants (for linking)
//   -------------------------- */
//   const searchVariants = async () => {
//     setLinkLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const q = encodeURIComponent(linkSearchQuery || "");
//       const url = `${API_URL}/api/ornaments?isVariant=true&search=${q}&limit=20`;
//       console.log("[searchVariants] fetching", url);
//       const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
//       const txt = await res.text();
//       let data;
//       try { data = JSON.parse(txt); } catch { data = []; }
//       const results = data?.ornaments || data || [];
//       setLinkSearchResults(results);
//     } catch (err) {
//       console.error("[searchVariants] error:", err);
//       alert("Search failed: " + err.message);
//     } finally {
//       setLinkLoading(false);
//     }
//   };

//   const handleLinkVariant = async (variant) => {
//     if (!variant) return;
//     try {
//       const token = localStorage.getItem("token");
//       const label = variant.metal?.metalType || variant.variantLabel || `variant-${variant._id}`;

//       const parentIdLocal = form._id || variantParentId || (initial && initial._id);
//       if (!parentIdLocal) {
//         alert("No base product selected to link to. Save base first.");
//         return;
//       }

//       const parentRes = await fetch(`${API_URL}/api/ornaments/${parentIdLocal}`, { headers: { Authorization: `Bearer ${token}` } });
//       const parentText = await parentRes.text();
//       const parentData = JSON.parse(parentText || "{}");
//       const existingMap = (parentData?.ornament?.variants && typeof parentData.ornament.variants === "object") ? parentData.ornament.variants : {};
//       const merged = { ...(existingMap || {}), [label]: variant._id };

//       await updateBaseVariantsMap(parentIdLocal, merged, token);
//       setForm((p) => ({ ...p, variants: merged }));
//       alert("Linked variant successfully");
//     } catch (err) {
//       console.error("[handleLinkVariant] error:", err);
//       alert("Failed to link variant: " + err.message);
//     }
//   };

//   /* --------------------------
//      grouped variants display (UI only)
//   -------------------------- */
//   const groupedVariants = useMemo(() => {
//     const map = form.variants || {};
//     const groups = {};
//     Object.entries(map).forEach(([label, id]) => {
//       const group = COLOR_DETECT(label);
//       if (!groups[group]) groups[group] = [];
//       groups[group].push({ label, id });
//     });
//     COLOR_GROUPS.forEach((g) => { if (!groups[g]) groups[g] = []; });
//     return groups;
//   }, [form.variants]);

//   /* --------------------------
//      Render UI
//   -------------------------- */
//   return (
//     <div className="fixed inset-0 z-40 flex items-start justify-center p-6 overflow-auto bg-black/40" onClick={(e) => e.target === e.currentTarget && onClose()}>
//       <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[92vh] overflow-y-auto">
//         {/* header */}
//         <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-t-2xl">
//           <h2 className="text-lg font-semibold text-white">{isVariantMode ? "Create Variant Product" : "Create Base Product"}</h2>
//           <div className="flex items-center gap-2">
//             {!isVariantMode && (
//               <>
//                 <button onClick={async () => { try { await createBaseIfNeeded(); setVariantDrawerOpen(true); } catch (e) { console.error(e); alert("Save base first"); } }} className="px-3 py-1 bg-white/20 text-white rounded">+ Add Variant</button>
//                 <button onClick={() => setVariantDrawerOpen(true)} className="px-3 py-1 bg-white/20 text-white rounded">Link Existing Variant</button>
//               </>
//             )}
//             <button onClick={onClose} className="px-3 py-1 bg-white/20 text-white rounded">Close</button>
//           </div>
//         </div>

//         {/* body */}
//         <div className="p-6 space-y-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* left: media & stones */}
//             <div className="space-y-4">
//               {/* cover */}
//               <div className="border p-3 rounded">
//                 <label className="block text-sm font-medium mb-2">Cover Image</label>
//                 <div className="w-full h-44 bg-gray-50 rounded flex items-center justify-center overflow-hidden border">
//                   {coverPreview ? <img src={coverPreview} alt="cover" className="object-contain w-full h-full" /> : <span className="text-gray-400">No cover</span>}
//                 </div>

//                 <div className="mt-2 flex gap-2 items-center">
//                   <input type="file" accept="image/*" onChange={(e) => onSetCoverFile(e.target.files?.[0] || null)} />
//                   {existingCoverUrl && <button onClick={() => { setExistingCoverUrl(null); setCoverPreview(null); }} className="text-sm text-red-600">Remove existing cover</button>}
//                   {(coverImageFile) && <button onClick={() => { setCoverImageFile(null); setCoverPreview(existingCoverUrl || null); }} className="text-sm text-gray-600">Undo</button>}
//                 </div>
//               </div>

//               {/* gallery */}
//               <div className="border p-3 rounded">
//                 <label className="block text-sm font-medium mb-2">Gallery Images</label>
//                 <div className="grid grid-cols-3 gap-2 mt-2">
//                   {imagesList.map((it, i) => (
//                     <div key={i} className="relative">
//                       <img src={it.src} alt={`img-${i}`} className="h-24 w-full object-cover rounded" />
//                       <button onClick={() => onRemoveGalleryAt(i)} className="absolute right-1 top-1 bg-black/50 text-white px-1 rounded text-xs">X</button>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-2">
//                   <input type="file" accept="image/*" multiple onChange={(e) => onAddGalleryFiles(e.target.files)} />
//                 </div>
//               </div>

//               {/* 3D & video */}
//               <div className="border p-3 rounded space-y-2">
//                 <div>
//                   <label className="block text-sm font-medium">3D Model (.glb/.usdz)</label>
//                   <input type="file" accept=".glb,.usdz" onChange={(e) => { setModel3DFile(e.target.files?.[0] || null); if (e.target.files?.[0]) setExistingModel3DUrl(null); }} />
//                   {existingModel3DUrl && <div className="text-sm text-gray-600 mt-1">Existing model kept. <button onClick={() => setExistingModel3DUrl(null)} className="text-red-600 ml-2">Remove</button></div>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mt-2">Product Video (MP4)</label>
//                   <input type="file" accept="video/mp4" onChange={(e) => { setVideoFile(e.target.files?.[0] || null); if (e.target.files?.[0]) setExistingVideoUrl(null); }} />
//                   {videoPreview && <video src={videoPreview} controls className="mt-2 w-full max-h-44 rounded" />}
//                   {existingVideoUrl && !videoPreview && <div className="text-sm text-gray-700 mt-2">Existing video present. <button onClick={() => setExistingVideoUrl(null)} className="text-red-600 ml-2">Remove</button></div>}
//                 </div>
//               </div>

//               {/* stones */}
//               <div className="border p-3 rounded">
//                 <div className="flex justify-between items-center mb-2">
//                   <h4 className="font-medium">Stones</h4>
//                   <button type="button" onClick={() => addStoneTo("base")} className="px-2 py-1 bg-yellow-500 text-white rounded">+ Add</button>
//                 </div>

//                 {(form.stones || []).map((s, idx) => (
//                   <div key={idx} className="border p-2 rounded mb-2 bg-white">
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
//                       <select value={s.type} onChange={(e) => updateStoneAt("base", idx, "type", e.target.value)} className="px-2 py-1 border rounded">
//                         {STONE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
//                       </select>
//                       <input placeholder="Weight (carat)" value={s.weight} onChange={(e) => updateStoneAt("base", idx, "weight", e.target.value)} className="px-2 py-1 border rounded" />
//                       <input placeholder="Count" value={s.count} onChange={(e) => updateStoneAt("base", idx, "count", e.target.value)} className="px-2 py-1 border rounded" />
//                       <input placeholder="Price" value={s.price} onChange={(e) => updateStoneAt("base", idx, "price", e.target.value)} className="px-2 py-1 border rounded" />
//                     </div>
//                     <div className="mt-2 flex justify-end">
//                       <button type="button" onClick={() => removeStoneAt("base", idx)} className="text-red-600">Remove</button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* right: main fields */}
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium">Product Name *</label>
//                 <input value={form.name} onChange={(e) => setField("name", e.target.value)} className="w-full px-3 py-2 border rounded" />
//               </div>

//               {!isVariantMode && (
//                 <>
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-sm font-medium">Category Type</label>
//                       <select value={form.categoryType} onChange={(e) => setField("categoryType", e.target.value)} className="w-full px-3 py-2 border rounded">
//                         <option>Gold</option>
//                         <option>Diamond</option>
//                         <option>Gemstone</option>
//                         <option>Fashion</option>
//                         <option>Composite</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium">Category</label>
//                       <select value={form.category} onChange={(e) => setField("category", e.target.value)} className="w-full px-3 py-2 border rounded">
//                         <option value="rings">rings</option>
//                         <option value="earrings">earrings</option>
//                         <option value="necklaces">necklaces</option>
//                         <option value="bracelets">bracelets</option>
//                         <option value="mens">mens</option>
//                         <option value="loose-diamonds">loose-diamonds</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-sm font-medium">Sub Category</label>
//                       <select value={form.subCategory || ""} onChange={(e) => setField("subCategory", e.target.value)} className="w-full px-3 py-2 border rounded">
//                         <option value="">-- select subcategory --</option>
//                         {(subCategoryOptions[form.category] || []).map((sc) => <option key={sc} value={sc}>{sc}</option>)}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium">Variant Label (UI)</label>
//                       <input value={form.variantLabel} onChange={(e) => setField("variantLabel", e.target.value)} className="w-full px-3 py-2 border rounded" />
//                     </div>
//                   </div>
//                 </>
//               )}

//               <div className="border p-3 rounded">
//                 <div className="grid grid-cols-3 gap-2">
//                   <select value={form.metal.metalType} onChange={(e) => updateMetal("metalType", e.target.value)} className="px-2 py-2 border rounded">
//                     <option value="">-- Select Metal --</option>
//                     {METAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
//                   </select>
//                   <input placeholder="Weight (g)" value={form.metal.weight} onChange={(e) => updateMetal("weight", e.target.value)} className="px-2 py-2 border rounded" />
//                   <input placeholder="Purity (e.g., 18K)" value={form.metal.purity} onChange={(e) => updateMetal("purity", e.target.value)} className="px-2 py-2 border rounded" />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-2">
//                 <input placeholder="Price (INR)" value={form.price} onChange={(e) => setField("price", e.target.value)} className="px-2 py-2 border rounded" />
//                 <input placeholder="Original Price (INR)" value={form.originalPrice} onChange={(e) => setField("originalPrice", e.target.value)} className="px-2 py-2 border rounded" />
//                 <input placeholder="Discount (%)" value={form.discount} onChange={(e) => setField("discount", e.target.value)} className="px-2 py-2 border rounded" />
//                 <input placeholder="Making Charges" value={form.makingCharges} onChange={(e) => setField("makingCharges", e.target.value)} className="px-2 py-2 border rounded" />
//               </div>

//               <div className="flex items-center gap-3">
//                 <label className="block text-sm font-medium">Stock</label>
//                 <input type="number" value={form.stock} onChange={(e) => setField("stock", Number(e.target.value))} className="px-2 py-2 border rounded w-24" />
//                 <label className="ml-4 flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setField("isFeatured", e.target.checked)} /> <span className="text-sm">isFeatured</span></label>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Description</label>
//                 <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} className="w-full px-3 py-2 border rounded" rows={4}></textarea>
//               </div>

//               {/* grouped variants */}
//               {!isVariantMode && (
//                 <div className="border p-3 rounded bg-gray-50">
//                   <h4 className="font-medium mb-2">Variants (grouped)</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                     {Object.entries(groupedVariants).map(([group, items]) => (
//                       <div key={group} className="border rounded p-2 bg-white">
//                         <div className="font-semibold mb-2">{group} ({items.length})</div>
//                         {items.map((it) => (
//                           <div key={it.id} className="text-sm flex items-center justify-between">
//                             <div>{it.label}</div>
//                             <div className="text-xs text-gray-500 truncate">{it.id}</div>
//                           </div>
//                         ))}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* prices & making charges multi-currency */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="border p-3 rounded">
//               <h4 className="font-semibold mb-2">Prices (other currencies)</h4>
//               {currencyList.map(({ code, symbol, flag }) => (
//                 <div key={code} className="flex items-center gap-3 mb-2">
//                   <div className="w-36 flex items-center gap-2 px-3 py-2 border rounded bg-gray-50">{flag} <span className="font-medium">{code}</span></div>
//                   <input value={form.prices?.[code]?.amount || ""} onChange={(e) => setPriceCurrency(code, e.target.value, symbol)} placeholder={`Price in ${code}`} className="flex-1 px-3 py-2 border rounded" />
//                 </div>
//               ))}
//             </div>

//             <div className="border p-3 rounded">
//               <h4 className="font-semibold mb-2">Making Charges by Country</h4>
//               {currencyList.map(({ code, symbol, flag }) => (
//                 <div key={code} className="flex items-center gap-3 mb-2">
//                   <div className="w-36 flex items-center gap-2 px-3 py-2 border rounded bg-gray-50">{flag} <span className="font-medium">{code}</span></div>
//                   <input value={form.makingChargesByCountry?.[code]?.amount || ""} onChange={(e) => setMakingChargeByCountry(code, e.target.value, symbol)} placeholder={`Making (${code})`} className="flex-1 px-3 py-2 border rounded" />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* footer */}
//         <div className="flex justify-end gap-3 p-4 border-t">
//           {!isVariantMode && (
//             <button onClick={handleSaveBase} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 rounded">Save Base</button>
//           )}

//           {isVariantMode ? (
//             <button onClick={async () => {
//               if (!variantParentId) return alert("parentId required for variant mode");
//               setIsSubmitting(true);
//               try {
//                 const token = localStorage.getItem("token");
//                 const payload = { ...form, isVariant: true, parentProduct: variantParentId };
//                 const imagesFiles = imagesList.filter((it) => it.isFile).map((it) => it.file);
//                 const payloadMedia = { coverFile: coverImageFile, imagesFiles, model3DFile, videoFile };
//                 const data = await createProduct(payload, payloadMedia, token);
//                 onSaved?.(data);
//                 alert("Variant created");
//               } catch (err) {
//                 console.error(err);
//                 alert("Failed to create variant: " + err.message);
//               } finally {
//                 setIsSubmitting(false);
//               }
//             }} className="px-4 py-2 bg-yellow-500 text-white rounded">
//               {isSubmitting ? "Saving..." : "Create Variant"}
//             </button>
//           ) : (
//             <button onClick={() => { alert("Use Save Base to persist, or Create Variant to add variants"); }} className="px-4 py-2 bg-yellow-500 text-white rounded">{isSubmitting ? "..." : "Save & Continue"}</button>
//           )}
//         </div>
//       </div>

//       {/* Variant right drawer */}
//       {variantDrawerOpen && (
//         <div className="fixed right-0 top-0 bottom-0 w-full md:w-2/5 bg-white shadow-2xl z-50 overflow-auto">
//           <div className="p-4 border-b flex items-center justify-between">
//             <h3 className="font-semibold">Create / Link Variant</h3>
//             <div className="flex items-center gap-2">
//               <button onClick={() => setVariantDrawerOpen(false)} className="px-3 py-1 rounded bg-gray-200">Close</button>
//             </div>
//           </div>

//           <div className="p-4 space-y-3">
//             {/* variant form */}
//             <div>
//               <label className="block text-sm font-medium">Variant Name</label>
//               <input value={variantForm.name} onChange={(e) => setVariantField("name", e.target.value)} className="w-full px-3 py-2 border rounded" />
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Metal Type</label>
//               <select value={variantForm.metal.metalType} onChange={(e) => updateVariantMetal("metalType", e.target.value)} className="w-full px-3 py-2 border rounded">
//                 <option value="">-- Select --</option>
//                 {METAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
//               </select>
//             </div>

//             <div className="grid grid-cols-2 gap-2">
//               <input placeholder="Weight (g)" value={variantForm.metal.weight} onChange={(e) => updateVariantMetal("weight", e.target.value)} className="px-2 py-2 border rounded" />
//               <input placeholder="Purity" value={variantForm.metal.purity} onChange={(e) => updateVariantMetal("purity", e.target.value)} className="px-2 py-2 border rounded" />
//             </div>

//             <div className="grid grid-cols-2 gap-2">
//               <input placeholder="Price" value={variantForm.price} onChange={(e) => setVariantField("price", e.target.value)} className="px-2 py-2 border rounded" />
//               <input placeholder="Original Price" value={variantForm.originalPrice} onChange={(e) => setVariantField("originalPrice", e.target.value)} className="px-2 py-2 border rounded" />
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Color Group (auto-detect or override)</label>
//               <div className="flex gap-2 items-center">
//                 <select value={variantForm.colorGroup || COLOR_DETECT(variantForm.metal.metalType)} onChange={(e) => setVariantField("colorGroup", e.target.value)} className="px-2 py-2 border rounded">
//                   {COLOR_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
//                 </select>
//                 <div className="text-sm text-gray-500">Auto: {COLOR_DETECT(variantForm.metal.metalType)}</div>
//               </div>
//             </div>

//             {/* variant media */}
//             <div>
//               <label className="block text-sm font-medium">Variant Cover</label>
//               <input type="file" accept="image/*" onChange={(e) => setVariantCoverFile(e.target.files?.[0] || null)} className="mt-2" />
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Variant Gallery</label>
//               <input type="file" accept="image/*" multiple onChange={(e) => {
//                 const files = Array.from(e.target.files || []);
//                 const mapped = files.map((f) => ({ src: URL.createObjectURL(f), isFile: true, file: f }));
//                 setVariantImagesList((p) => [...p, ...mapped]);
//               }} className="mt-2" />
//               <div className="grid grid-cols-3 gap-2 mt-2">
//                 {variantImagesList.map((u, i) => <img key={i} src={u.src} className="w-full h-20 object-cover rounded" />)}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Variant Video (MP4)</label>
//               <input type="file" accept="video/mp4" onChange={(e) => setVariantVideoFile(e.target.files?.[0] || null)} className="mt-2" />
//             </div>

//             <div className="flex justify-between gap-2 pt-2">
//               <button onClick={() => setVariantDrawerOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
//               <button onClick={handleCreateVariant} disabled={isSubmitting} className="px-4 py-2 bg-yellow-500 text-white rounded">{isSubmitting ? "Creating..." : "Create & Link Variant"}</button>
//             </div>

//             <hr />

//             {/* Link existing */}
//             <div>
//               <div className="flex gap-2">
//                 <input value={linkSearchQuery} onChange={(e) => setLinkSearchQuery(e.target.value)} placeholder="Search existing variants by name / sku / metal" className="flex-1 px-3 py-2 border rounded" />
//                 <button onClick={searchVariants} className="px-3 py-2 bg-blue-500 text-white rounded">{linkLoading ? "..." : "Search"}</button>
//               </div>

//               <div className="mt-3 max-h-60 overflow-auto">
//                 {linkSearchResults.map((r) => (
//                   <div key={r._id} className="flex items-center justify-between p-2 border-b">
//                     <div>
//                       <div className="font-medium">{r.name}</div>
//                       <div className="text-xs text-gray-500">{r._id} • {r.metal?.metalType}</div>
//                     </div>
//                     <div className="flex gap-2">
//                       <button onClick={() => handleLinkVariant(r)} className="px-3 py-1 bg-green-600 text-white rounded">Link</button>
//                       <a href={`/admin/variant/${r._id}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-gray-200 rounded">Open</a>
//                     </div>
//                   </div>
//                 ))}
//                 {linkSearchResults.length === 0 && <div className="text-sm text-gray-500 mt-2">No results</div>}
//               </div>
//             </div>

//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// ProductForm.jsx (Part 1/3)
// Imports + top-level state, pricing fetch, helpers, media handlers, API helpers

// ProductForm.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

/* --------------------------
   Constants & helpers
-------------------------- */
const COLOR_GROUPS = ["Yellow", "White", "Rose", "Silver", "Platinum", "Other"];

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

const STONE_TYPES = [
  "Emerald",
  "Ruby",
  "Sapphire",
  "Topaz",
  "Garnet",
  "Opal",
  
];


const currencyList = [
  { code: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "CAD", symbol: "CA$", flag: "🇨🇦" },
  { code: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "AED", symbol: "د.إ", flag: "🇦🇪" },
  { code: "AUD", symbol: "A$", flag: "🇦🇺" },
  { code: "SGD", symbol: "S$", flag: "🇸🇬" },
  { code: "JPY", symbol: "¥", flag: "🇯🇵" },
];

const subCategoryOptions = {
  rings: ["engagement", "wedding", "eternity", "cocktail", "fashion"],
  earrings: ["studs", "hoops", "drops", "fashion"],
  necklaces: ["tennis", "pendants", "fashion"],
  bracelets: ["tennis", "bangles", "fashion"],
  mens: ["rings", "earrings", "necklaces", "bracelets", "cufflinks"],
  "loose-diamonds": ["other"],
};

const COLOR_DETECT = (metalType = "") => {
  if (!metalType) return "Other";
  const lower = metalType.toLowerCase();
  if (lower.includes("yellow")) return "Yellow";
  if (lower.includes("white")) return "White";
  if (lower.includes("rose") || lower.includes("pink")) return "Rose";
  if (lower.includes("silver")) return "Silver";
  if (lower.includes("platinum")) return "Platinum";
  return "Other";
};

// derived totals for UI & consistent calculations



/* --------------------------
   Component
-------------------------- */
export default function ProductForm({
  mode = "base", // "base" | "variant"
  initial = null,
  parentId = null, // used when mode === "variant"
  onSaved = () => {},
  onClose = () => {},
}) {
  const isVariantMode = mode === "variant";

  /* --------------------------
     Form state (base)
  -------------------------- */
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryType: "Gold",
    category: "rings",
    subCategory: "",
    gender: "Unisex",
    variantLabel: "Metal Type",
    metal: { metalType: "", weight: "", purity: "" },
    price: "",
    originalPrice: "",
    discount: "",
    makingCharges: "",
    prices: {},
    makingChargesByCountry: {},
     gemstoneDetails: [],
     mainDiamondTotal: "",
sideDiamondTotal: "",

    
    diamondDetails: null,
    sideDiamondDetails: [],
    stock: 1,
    isFeatured: false,
    color: "",
    size: "",
    // Option 2: variants as map label => objectId
    variants: {}, // e.g. { "18K Yellow Gold": "69287081..." }
    // media urls (existing)
    coverImage: null,
    images: [],
    model3D: null,
    videoUrl: null,
  });

  /* --------------------------
     Media state (files + existing urls)
  -------------------------- */
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [imagesList, setImagesList] = useState([]); // items: { src, isFile, file }
  const [model3DFile, setModel3DFile] = useState(null);
  const [existingModel3DUrl, setExistingModel3DUrl] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [computedTotals, setComputedTotals] = useState({
  goldTotal: 0,
  mainTotal: 0,
  sideTotal: 0,
  stonesTotal: 0,
  making: 0,
  baseTotal: 0,       // gold + main + side + stones
  estimatedTotal: 0,  // baseTotal + making
});

  /* --------------------------
     Variant UI & create state
  -------------------------- */
  const [variantDrawerOpen, setVariantDrawerOpen] = useState(false);
  const [variantParentId, setVariantParentId] = useState(parentId || null);

  const [variantForm, setVariantForm] = useState({
    name: "",
    description: "",
    metal: { metalType: "", weight: "", purity: "" },
    price: "",
    originalPrice: "",
    discount: "",
    makingCharges: "",
    prices: {},
    makingChargesByCountry: {},
    gemstoneDetails: [],
    diamondDetails: null,
    sideDiamondDetails: [],
    stock: 1,
    isFeatured: false,
    color: "",
    size: "",
    variantLabel: "Metal Type",
  });

  const [variantCoverFile, setVariantCoverFile] = useState(null);
  const [variantImagesList, setVariantImagesList] = useState([]);
  const [variantVideoFile, setVariantVideoFile] = useState(null);

  /* --------------------------
     Link existing variant search
  -------------------------- */
  const [linkSearchQuery, setLinkSearchQuery] = useState("");
  const [linkSearchResults, setLinkSearchResults] = useState([]);
  const [linkLoading, setLinkLoading] = useState(false);

  /* --------------------------
     UI state
  -------------------------- */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingBaseFirst, setIsCreatingBaseFirst] = useState(false);

  /* --------------------------
     Pricing (from backend)
  -------------------------- */
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [useAutoComposite, setUseAutoComposite] = useState(true);

  /* --------------------------
     Utilities
  -------------------------- */
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const updateMetal = (k, v) => setForm((p) => ({ ...p, metal: { ...p.metal, [k]: v } }));

  const setVariantField = (k, v) => setVariantForm((p) => ({ ...p, [k]: v }));
  const updateVariantMetal = (k, v) => setVariantForm((p) => ({ ...p, metal: { ...p.metal, [k]: v } }));

  /* --------------------------
     Initialize from initial prop
  -------------------------- */
  useEffect(() => {
    if (!initial) return;

    const initialImages = (initial.images || []).map((u) => ({ src: u, isFile: false }));
    const coverUrl = initial.coverImage || null;
    const modelUrl = initial.model3D || null;
    const videoUrl = initial.videoUrl || null;

    setForm((f) => ({
      ...f,
      ...initial,
      metal: initial.metal || f.metal,
     
      diamondDetails: initial.diamondDetails || f.diamondDetails,
      sideDiamondDetails: initial.sideDiamondDetails || f.sideDiamondDetails || [],
      prices: initial.prices || f.prices,
      makingChargesByCountry: initial.makingChargesByCountry || f.makingChargesByCountry,
      variants: initial.variants || f.variants,
      coverImage: coverUrl,
      images: initial.images || [],
      model3D: modelUrl,
      videoUrl: videoUrl,
    }));

    setVariantParentId(initial._id || parentId || null);

    setExistingCoverUrl(coverUrl);
    setImagesList(initialImages);
    setExistingModel3DUrl(modelUrl);
    setExistingVideoUrl(videoUrl);

    setCoverPreview(coverUrl || null);
    setVideoPreview(videoUrl || null);
  }, [initial, parentId]);

  /* --------------------------
     Pricing fetch
  -------------------------- */
useEffect(() => {
  let cancelled = false;
  const load = async () => {
    setPricingLoading(true);
    try {
      console.log("[Pricing] fetch ->", `${API_URL}/api/ornaments/pricing`);
      const res = await fetch(`${API_URL}/api/ornaments/pricing`);
      const txt = await res.text();
      console.log("[Pricing] raw response text:", txt);
      const data = JSON.parse(txt || "{}");
      const p = data?.pricing || data;
      console.log("[Pricing] parsed pricing payload:", p);
      if (!cancelled) setPricing(p || null);
    } catch (err) {
      console.error("[ProductForm] fetch pricing error", err);
      if (!cancelled) setPricing(null);
    } finally {
      if (!cancelled) setPricingLoading(false);
    }
  };
  load();
  return () => { cancelled = true; };
}, []);

  /* --------------------------
     Previews cleanup
  -------------------------- */
  useEffect(() => {
    if (!coverImageFile) return;
    const u = URL.createObjectURL(coverImageFile);
    setCoverPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [coverImageFile]);

  useEffect(() => {
    const cleanup = () => {
      imagesList.forEach((it) => {
        if (it.isFile && it.src) URL.revokeObjectURL(it.src);
      });
    };
    return cleanup;
  }, [imagesList]);

  useEffect(() => {
    if (!videoFile) return;
    const u = URL.createObjectURL(videoFile);
    setVideoPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [videoFile]);

  /* --------------------------
     Image helpers
  -------------------------- */
  const onAddGalleryFiles = (files) => {
    const list = Array.from(files || []);
    const mapped = list.map((f) => ({ src: URL.createObjectURL(f), isFile: true, file: f }));
    setImagesList((p) => [...p, ...mapped]);
  };

  const onRemoveGalleryAt = (index) => {
    setImagesList((p) => {
      const copy = [...p];
      const [removed] = copy.splice(index, 1);
      if (removed && removed.isFile && removed.src) URL.revokeObjectURL(removed.src);
      return copy;
    });
  };

  const onSetCoverFile = (file) => {
    setCoverImageFile(file || null);
    if (file) setExistingCoverUrl(null);
  };

  const onRemoveCover = () => {
    if (coverImageFile) {
      setCoverImageFile(null);
      setCoverPreview(null);
    }
    setExistingCoverUrl(null);
  };

  /* --------------------------
     Multi-currency helpers
  -------------------------- */
  const setPriceCurrency = (code, amount, symbol = "") =>
    setForm((p) => ({ ...p, prices: { ...(p.prices || {}), [code]: { amount: Number(amount || 0), symbol } } }));

  const setMakingChargeByCountry = (code, amount, symbol = "") =>
    setForm((p) => ({ ...p, makingChargesByCountry: { ...(p.makingChargesByCountry || {}), [code]: { amount: Number(amount || 0), symbol, currency: code } } }));

  /* --------------------------
     API helpers
  -------------------------- */
  async function createProduct(payloadForm, payloadMediaFiles, token) {
    const fd = new FormData();

  Object.entries(payloadForm).forEach(([k, v]) => {

    // Manual diamond totals must be sent as raw numbers
if (k === "mainDiamondTotal" || k === "sideDiamondTotal") {
  if (v !== "" && v !== null && v !== undefined) {
    fd.append(k, String(v));
  }
  return;
}

  if (v === undefined || v === null) return;

  // FIX #1 - Prevent sending "stones"
  if (k === "stones") return;

  // FIX #2 - gemstoneDetails -> stones
  if (k === "gemstoneDetails") {
    fd.append("stones", JSON.stringify(v));
    return;
  }

  if (typeof v === "object") fd.append(k, JSON.stringify(v));
  else fd.append(k, String(v));
});



    // existing media
    if (existingCoverUrl) fd.append("existingCover", existingCoverUrl);
    const existingImageUrls = imagesList.filter((it) => !it.isFile).map((it) => it.src);
    fd.append("existingImages", JSON.stringify(existingImageUrls || []));

    if (existingModel3DUrl) fd.append("existingModel3D", existingModel3DUrl);
    if (existingVideoUrl) fd.append("existingVideo", existingVideoUrl);

    // files
    if (payloadMediaFiles.coverFile) fd.append("coverImage", payloadMediaFiles.coverFile);
    (payloadMediaFiles.imagesFiles || []).forEach((img) => fd.append("images", img));
    if (payloadMediaFiles.model3DFile) fd.append("model3D", payloadMediaFiles.model3DFile);
    if (payloadMediaFiles.videoFile) fd.append("videoFile", payloadMediaFiles.videoFile);

    const res = await fetch(`${API_URL}/api/ornaments/add`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new Error("Server returned invalid response: " + text); }
    if (!res.ok) throw new Error(data.message || "Create failed");
    return data;
  }

  async function updateBaseVariantsMap(baseId, mergedVariants, token) {
    const fd = new FormData();
    fd.append("variants", JSON.stringify(mergedVariants));
    const res = await fetch(`${API_URL}/api/ornaments/edit/${baseId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new Error("Server returned invalid response: " + text); }
    if (!res.ok) throw new Error(data.message || "Update variants failed");
    return data;
  }

  /* --------------------------
     createBaseIfNeeded (used before creating/linking variants)
  -------------------------- */
  const createBaseIfNeeded = async () => {
    if (form._id || (initial && initial._id)) {
      const id = form._id || initial._id;
      setVariantParentId(id);
      return id;
    }

    setIsCreatingBaseFirst(true);
    try {
      const token = localStorage.getItem("token");
      const payloadForm = { ...form, isVariant: false };
      delete payloadForm.variants; // don't send map on initial create

      const imagesFiles = imagesList.filter((it) => it.isFile).map((it) => it.file);
      const payloadMedia = {
        coverFile: coverImageFile,
        imagesFiles,
        model3DFile,
        videoFile,
      };

      const data = await createProduct(payloadForm, payloadMedia, token);
      const createdId = data?.product?._id || data?.productId || data?.ornament?._id || data?.id || null;
      if (!createdId) throw new Error("Could not obtain created base product id from server response.");
      setForm((p) => ({ ...p, _id: createdId }));
      setVariantParentId(createdId);
      return createdId;
    } catch (err) {
      console.error("[createBaseIfNeeded] error:", err);
      throw err;
    } finally {
      setIsCreatingBaseFirst(false);
    }
  };

  /* --------------------------
     Handling Save Base (explicit)
  -------------------------- */
  const handleSaveBase = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payloadForm = { ...form, isVariant: false };
      // keep variants map when saving base
      const imagesFiles = imagesList.filter((it) => it.isFile).map((it) => it.file);
      const payloadMedia = { coverFile: coverImageFile, imagesFiles, model3DFile, videoFile };

      // If form._id present, use edit endpoint; else add
      if (form._id) {
        // Edit: use your existing edit endpoint (assumed: /api/ornaments/edit/:id)
        const fd = new FormData();
        Object.entries(payloadForm).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "object") fd.append(k, JSON.stringify(v));
          else fd.append(k, String(v));
        });
        if (existingCoverUrl) fd.append("existingCover", existingCoverUrl);
        fd.append("existingImages", JSON.stringify(imagesList.filter((it) => !it.isFile).map((it) => it.src)));
        if (existingModel3DUrl) fd.append("existingModel3D", existingModel3DUrl);
        if (existingVideoUrl) fd.append("existingVideo", existingVideoUrl);
        if (payloadMedia.coverFile) fd.append("coverImage", payloadMedia.coverFile);
        (payloadMedia.imagesFiles || []).forEach((img) => fd.append("images", img));
        if (payloadMedia.model3DFile) fd.append("model3D", payloadMedia.model3DFile);
        if (payloadMedia.videoFile) fd.append("videoFile", payloadMedia.videoFile);

        const res = await fetch(`${API_URL}/api/ornaments/edit/${form._id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const text = await res.text();
        const data = JSON.parse(text || "{}");
        if (!res.ok) throw new Error(data.message || "Edit failed");
        onSaved?.(data);
        alert("Base updated");
      } else {
        // Create
        const data = await createProduct(payloadForm, payloadMedia, token);
        const createdId = data?.product?._id || data?.ornament?._id || data?.id || null;
        if (createdId) setForm((p) => ({ ...p, _id: createdId }));
        onSaved?.(data);
        alert("Base created");
      }
    } catch (err) {
      console.error("handleSaveBase error", err);
      alert("Failed to save base: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  /* --------------------------
     Variant create handler
     - Creates variant product and merges into base variants map by chosen label
  -------------------------- */
  const handleCreateVariant = async (labelForMap = null) => {
    if (!variantParentId) {
      try {
        await createBaseIfNeeded();
      } catch (err) {
        return alert("Save base product first before creating a variant");
      }
    }

    if (!variantForm.name) return alert("Provide variant name");

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { ...variantForm, isVariant: true, parentProduct: variantParentId };

      const imagesFiles = variantImagesList.filter((it) => it.isFile).map((it) => it.file);
      const payloadMedia = { coverFile: variantCoverFile, imagesFiles, model3DFile: null, videoFile: variantVideoFile };

      const createdData = await createProduct(payload, payloadMedia, token);

      const variantObj = createdData?.product || createdData?.ornament || createdData?.variant || null;
      const createdId = variantObj?._id || createdData?.id || null;
      if (!createdId) throw new Error("Could not determine created variant id from server response");

      // decide label to store in map: passed labelForMap OR variant metal type OR variant name
      const label = labelForMap || (variantForm.metal?.metalType && variantForm.metal.metalType.trim()) || variantForm.name || `variant-${createdId}`;

      // fetch current base map to merge safely (call backend read)
      const parentRes = await fetch(`${API_URL}/api/ornaments/${variantParentId}`);
      const text = await parentRes.text();
      let parentData = {};
      try { parentData = JSON.parse(text || "{}"); } catch {}
      const existingMap = (parentData?.ornament?.variants && typeof parentData.ornament.variants === "object") ? parentData.ornament.variants : {};

      const merged = { ...(existingMap || {}), [label]: createdId };

      await updateBaseVariantsMap(variantParentId, merged, token);

      // update local form map
      setForm((p) => ({ ...p, variants: merged }));
      // reset variant form
      setVariantForm({
        name: "",
        description: "",
        metal: { metalType: "", weight: "", purity: "" },
        price: "",
        originalPrice: "",
        discount: "",
        makingCharges: "",
        prices: {},
        makingChargesByCountry: {},
        stones: [],
        diamondDetails: null,
        sideDiamondDetails: [],
        stock: 1,
        isFeatured: false,
        color: "",
        size: "",
        variantLabel: "Metal Type",
      });
      setVariantDrawerOpen(false);
      onSaved?.({ createdVariant: variantObj, parentId: variantParentId });
      alert("Variant created and linked");
    } catch (err) {
      console.error("handleCreateVariant error", err);
      alert("Failed to create variant: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  /* --------------------------
     Link existing variant (search & attach)
     - Attaches existing variant id to base's variants map under label
  -------------------------- */
  const searchVariants = async () => {
    setLinkLoading(true);
    try {
      const token = localStorage.getItem("token");
      const q = encodeURIComponent(linkSearchQuery || "");
      const url = `${API_URL}/api/ornaments?isVariant=true&search=${q}&limit=20`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const txt = await res.text();
      const data = JSON.parse(txt || "{}");
      const results = data?.ornaments || data || [];
      setLinkSearchResults(results);
    } catch (err) {
      console.error("searchVariants error", err);
      alert("Search failed: " + (err.message || err));
    } finally {
      setLinkLoading(false);
    }
  };

  const handleLinkVariant = async (variantObj, labelForMap = null) => {
    if (!variantObj || !variantObj._id) return;
    try {
      if (!variantParentId) await createBaseIfNeeded();

      const token = localStorage.getItem("token");
      // choose label
      const label = labelForMap || variantObj.metal?.metalType || variantObj.variantLabel || variantObj.name || variantObj._id;

      // fetch parent current map then merge
      const parentRes = await fetch(`${API_URL}/api/ornaments/${variantParentId}`, { headers: { Authorization: `Bearer ${token}` }});
      const txt = await parentRes.text();
      const parentData = JSON.parse(txt || "{}");
      const existingMap = (parentData?.ornament?.variants && typeof parentData.ornament.variants === "object") ? parentData.ornament.variants : {};

      const merged = { ...(existingMap || {}), [label]: variantObj._id };

      await updateBaseVariantsMap(variantParentId, merged, token);

      setForm((p) => ({ ...p, variants: merged }));
      alert("Linked variant successfully");
    } catch (err) {
      console.error("handleLinkVariant error", err);
      alert("Failed to link variant: " + (err.message || err));
    }
  };

  /* --------------------------
     Unlink a variant label
     - Remove the label -> id entry from base variants map
  -------------------------- */
  const handleUnlinkVariant = async (label) => {
    try {
      if (!variantParentId) return alert("No parent id");
      const token = localStorage.getItem("token");

      // get current map
      const parentRes = await fetch(`${API_URL}/api/ornaments/${variantParentId}`, { headers: { Authorization: `Bearer ${token}` }});
      const txt = await parentRes.text();
      const parentData = JSON.parse(txt || "{}");
      const existingMap = (parentData?.ornament?.variants && typeof parentData.ornament.variants === "object") ? parentData.ornament.variants : {};

      const newMap = { ...(existingMap || {}) };
      delete newMap[label];

      await updateBaseVariantsMap(variantParentId, newMap, token);
      setForm((p) => ({ ...p, variants: newMap }));
      alert("Variant unlinked");
    } catch (err) {
      console.error("handleUnlinkVariant error", err);
      alert("Failed to unlink variant: " + (err.message || err));
    }
  };

  /* --------------------------
     groupedVariants derived from form.variants map
     returns groups for UI with label+id
  -------------------------- */
  const groupedVariants = useMemo(() => {
    const map = form.variants || {};
    const groups = {};
    Object.entries(map).forEach(([label, id]) => {
      const group = COLOR_DETECT(label);
      if (!groups[group]) groups[group] = [];
      groups[group].push({ label, id });
    });
    // ensure all groups exist
    COLOR_GROUPS.forEach((g) => { if (!groups[g]) groups[g] = []; });
    return groups;
  }, [form.variants]);

  /* --------------------------
     Composite pricing (frontend auto-calc)
     When useAutoComposite is true, compute price = gold + diamonds + side + stones + making
     - Assumes pricing.goldPrices is either an object or Map
  -------------------------- */
   useEffect(() => {
  if (!pricing) return;

 // --------------------------------------------------------------
// GOLD PRICE (Correct purity detection + gold rate)
// --------------------------------------------------------------

console.log("🟡 [Frontend] metal=", form.metal);
console.log("🟡 [Frontend] backend goldPrices=", pricing?.goldPrices);

// 1) Extract purity from metal type OR purity field
let purity = "";

// Try purity field directly
if (form.metal?.purity) {
  purity = form.metal.purity.toUpperCase().trim();
}

// If still empty → extract from "18K White Gold"
if (!purity && form.metal?.metalType) {
  const match = form.metal.metalType.toUpperCase().match(/(\d+K)/);
  if (match) purity = match[1];
}

console.log("🟢 Detected purity:", purity);

// 2) Lookup gold rate from backend
let goldRate = 0;

if (pricing?.goldPrices instanceof Map) {
  goldRate = Number(pricing.goldPrices.get(purity) || 0);
} else if (pricing?.goldPrices && typeof pricing.goldPrices === "object") {
  goldRate = Number(pricing.goldPrices[purity] || 0);
}

console.log("💰 Gold Rate Per Gram:", goldRate);

// 3) Weight × Rate
const weight = Number(form.metal?.weight || 0);
const goldTotal = weight * goldRate;

console.log("⚖️ Weight:", weight);
console.log("💵 Gold Total:", goldTotal);

  // ------------------------------------------------------------
  // 3️⃣ DIAMONDS
  // ------------------------------------------------------------
  const main = form.diamondDetails || {};

  // AUTO totals
const autoMainTotal =
  Number(main.carat || 0) *
  Number(main.count || 0) *
  Number(main.pricePerCarat || pricing?.diamondPricePerCarat || 0);

const autoSideTotal = (form.sideDiamondDetails || []).reduce((acc, s) => {
  const ppc = Number(s.pricePerCarat || pricing?.diamondPricePerCarat || 0);
  return acc + Number(s.carat || 0) * Number(s.count || 0) * ppc;
}, 0);

// FINAL totals (manual override > auto)
const mainTotal = form.mainDiamondTotal
  ? Number(form.mainDiamondTotal)
  : autoMainTotal;

const sideTotal = form.sideDiamondTotal
  ? Number(form.sideDiamondTotal)
  : autoSideTotal;


  const stonesTotal = (form.gemstoneDetails || []).reduce(
  (acc, st) =>
    acc +
    Number(st.carat || 0) *
      Number(st.count || 1) *
      Number(st.pricePerCarat || pricing?.gemstonePrices?.[st.stoneType] || 0),
  0
);


  // ------------------------------------------------------------
  // 4️⃣ MAKING CHARGES
  // ------------------------------------------------------------
  const making = Number(form.makingCharges || 0);

  // ------------------------------------------------------------
  // 5️⃣ AUTO TOTAL (gold + diamonds + stones + making)
  // ------------------------------------------------------------
  const autoTotal =
    Number(goldTotal) +
    Number(mainTotal) +
    Number(sideTotal) +
    Number(stonesTotal) +
    Number(making);

  console.log("🧮 [Frontend] Auto Total:", autoTotal);

   setComputedTotals({
    goldTotal: Number(goldTotal),
    mainTotal: Number(mainTotal),
    sideTotal: Number(sideTotal),
    stonesTotal: Number(stonesTotal),
    making: Number(making),
    baseTotal: Number(goldTotal + mainTotal + sideTotal + stonesTotal),
    estimatedTotal: Number(autoTotal),
  });

  // ------------------------------------------------------------
  // 6️⃣ FINAL PRICE LOGIC (IMPORTANT FIX)
  // ------------------------------------------------------------

  setForm((prev) => {
    let finalPrice = autoTotal;

    // ❌ earlier: manual price *overwrote* everything
    // ✅ now: manual price replaces ONLY product base price,
    //        making charges STILL added separately.
// Manual override = final selling price
if (!useAutoComposite && prev.price !== "") {
  finalPrice = Number(prev.price);
}

    // ORIGINAL PRICE
    const original = prev.originalPrice
      ? Number(prev.originalPrice)
      : finalPrice;

    // DISCOUNT
    const discount =
      original > finalPrice
        ? Math.round(((original - finalPrice) / original) * 100)
        : 0;

    return {
      ...prev,
      price: finalPrice,
      originalPrice: original,
      discount,
    };
  });
}, [
  form.metal?.weight,
  form.metal?.purity,
  form.diamondDetails,
  JSON.stringify(form.sideDiamondDetails),
  JSON.stringify(form.gemstoneDetails),

  form.makingCharges,
  pricing,
  useAutoComposite,
]);


  /* --------------------------
     Final render
  -------------------------- */
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-6 overflow-auto bg-black/40" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[92vh] overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-white">{isVariantMode ? "Create Variant Product" : "Create Base Product"}</h2>
          <div className="flex items-center gap-2">
            {!isVariantMode && (
              <>
                <button onClick={async () => { try { await createBaseIfNeeded(); setVariantDrawerOpen(true); } catch (e) { console.error(e); alert("Save base first"); } }} className="px-3 py-1 bg-white/20 text-white rounded">+ Add Variant</button>
                <button onClick={() => setVariantDrawerOpen(true)} className="px-3 py-1 bg-white/20 text-white rounded">Link Existing Variant</button>
              </>
            )}
            <button onClick={onClose} className="px-3 py-1 bg-white/20 text-white rounded">Close</button>
          </div>
        </div>

        {/* body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* left: media, stones, diamonds */}
            <div className="space-y-4">
              {/* cover */}
              <div className="border p-3 rounded">
                <label className="block text-sm font-medium mb-2">Cover Image</label>
                <div className="w-full h-44 bg-gray-50 rounded flex items-center justify-center overflow-hidden border">
                  {coverPreview ? <img src={coverPreview} alt="cover" className="object-contain w-full h-full" /> : <span className="text-gray-400">No cover</span>}
                </div>

                <div className="mt-2 flex gap-2 items-center">
                  <input type="file" accept="image/*" onChange={(e) => onSetCoverFile(e.target.files?.[0] || null)} />
                  {existingCoverUrl && <button onClick={() => { setExistingCoverUrl(null); setCoverPreview(null); }} className="text-sm text-red-600">Remove existing cover</button>}
                  {(coverImageFile) && <button onClick={() => { setCoverImageFile(null); setCoverPreview(existingCoverUrl || null); }} className="text-sm text-gray-600">Undo</button>}
                </div>
              </div>

              {/* gallery */}
              <div className="border p-3 rounded">
                <label className="block text-sm font-medium mb-2">Gallery Images</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imagesList.map((it, i) => (
                    <div key={i} className="relative">
                      <img src={it.src} alt={`img-${i}`} className="h-24 w-full object-cover rounded" />
                      <button onClick={() => onRemoveGalleryAt(i)} className="absolute right-1 top-1 bg-black/50 text-white px-1 rounded text-xs">X</button>
                    </div>
                  ))}
                </div>

                <div className="mt-2">
                  <input type="file" accept="image/*" multiple onChange={(e) => onAddGalleryFiles(e.target.files)} />
                </div>
              </div>

              {/* 3D & video */}
              <div className="border p-3 rounded space-y-2">
                <div>
                  <label className="block text-sm font-medium">3D Model (.glb/.usdz)</label>
                  <input type="file" accept=".glb,.usdz" onChange={(e) => { setModel3DFile(e.target.files?.[0] || null); if (e.target.files?.[0]) setExistingModel3DUrl(null); }} />
                  {existingModel3DUrl && <div className="text-sm text-gray-600 mt-1">Existing model kept. <button onClick={() => setExistingModel3DUrl(null)} className="text-red-600 ml-2">Remove</button></div>}
                </div>

                <div>
                  <label className="block text-sm font-medium mt-2">Product Video (MP4)</label>
                  <input type="file" accept="video/mp4" onChange={(e) => { setVideoFile(e.target.files?.[0] || null); if (e.target.files?.[0]) setExistingVideoUrl(null); }} />
                  {videoPreview && <video src={videoPreview} controls className="mt-2 w-full max-h-44 rounded" />}
                  {existingVideoUrl && !videoPreview && <div className="text-sm text-gray-700 mt-2">Existing video present. <button onClick={() => setExistingVideoUrl(null)} className="text-red-600 ml-2">Remove</button></div>}
                </div>
              </div>

             
             {/* Gemstones */}
<div className="border p-3 rounded">
  <div className="flex justify-between items-center mb-2">
    <h4 className="font-medium">Gemstones</h4>
    <button
      type="button"
      onClick={() =>
        setForm((p) => ({
          ...p,
          gemstoneDetails: [
            ...(p.gemstoneDetails || []),
            {
              stoneType: "",
              carat: "",
              count: 1,
              pricePerCarat: "",
              useAuto: true,
            },
          ],
        }))
      }
      className="px-2 py-1 bg-yellow-500 text-white rounded"
    >
      + Add Gemstone
    </button>
  </div>

  {(form.gemstoneDetails || []).map((g, idx) => (
    <div key={idx} className="border p-2 rounded mb-2 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">

        {/* Stone Type */}
       <select
  value={g.stoneType}
  onChange={(e) =>
    setForm((p) => ({
      ...p,
      gemstoneDetails: p.gemstoneDetails.map((st, i) =>
        i === idx ? { ...st, stoneType: e.target.value } : st
      ),
    }))
  }
  className="px-2 py-1 border rounded"
>
  <option value="">-- Select Gemstone --</option>   {/* ⭐ FIX ADDED */}
  {STONE_TYPES.map((t) => (
    <option key={t} value={t}>
      {t}
    </option>
  ))}
</select>


        {/* Carat */}
        <input
          placeholder="Carat"
          value={g.carat}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              gemstoneDetails: p.gemstoneDetails.map((st, i) =>
                i === idx ? { ...st, carat: e.target.value } : st
              ),
            }))
          }
          className="px-2 py-1 border rounded"
        />

        {/* Count */}
        <input
          placeholder="Count"
          value={g.count}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              gemstoneDetails: p.gemstoneDetails.map((st, i) =>
                i === idx ? { ...st, count: e.target.value } : st
              ),
            }))
          }
          className="px-2 py-1 border rounded"
        />

        {/* Price Per Carat */}
        <input
          placeholder="Price Per Carat"
          value={g.pricePerCarat}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              gemstoneDetails: p.gemstoneDetails.map((st, i) =>
                i === idx
                  ? { ...st, pricePerCarat: e.target.value, useAuto: e.target.value === "" }
                  : st
              ),
            }))
          }
          className="px-2 py-1 border rounded"
        />
      </div>

      {/* Remove */}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() =>
            setForm((p) => ({
              ...p,
              gemstoneDetails: p.gemstoneDetails.filter((_, i) => i !== idx),
            }))
          }
          className="text-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  ))}
</div>


              {/* main diamond */}
              <div className="border p-3 rounded bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Main Diamond Details</h4>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Auto price</label>
                    <input type="checkbox" checked={Boolean(form.diamondDetails?.useAuto ?? true)} onChange={(e) => setForm((p) => ({ ...p, diamondDetails: { ...(p.diamondDetails || {}), useAuto: e.target.checked } }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="0.01" placeholder="Carat (e.g., 0.5)" value={(form.diamondDetails?.carat ?? "")} onChange={(e) => setForm((p) => ({ ...p, diamondDetails: { ...(p.diamondDetails || {}), carat: e.target.value } }))} className="px-2 py-2 border rounded" />
                  <input type="number" placeholder="Count" value={(form.diamondDetails?.count ?? "")} onChange={(e) => setForm((p) => ({ ...p, diamondDetails: { ...(p.diamondDetails || {}), count: e.target.value } }))} className="px-2 py-2 border rounded" />
                  <input placeholder="Color" value={(form.diamondDetails?.color ?? "")} onChange={(e) => setForm((p) => ({ ...p, diamondDetails: { ...(p.diamondDetails || {}), color: e.target.value } }))} className="px-2 py-2 border rounded" />
                  <input placeholder="Clarity" value={(form.diamondDetails?.clarity ?? "")} onChange={(e) => setForm((p) => ({ ...p, diamondDetails: { ...(p.diamondDetails || {}), clarity: e.target.value } }))} className="px-2 py-2 border rounded" />
                  <input placeholder="Cut" value={(form.diamondDetails?.cut ?? "")} onChange={(e) => setForm((p) => ({ ...p, diamondDetails: { ...(p.diamondDetails || {}), cut: e.target.value } }))} className="px-2 py-2 border rounded" />
                  <input placeholder="Price Per Carat (override, INR)" value={(form.diamondDetails?.pricePerCarat ?? "")} onChange={(e) => setForm((p) => ({ ...p, diamondDetails: { ...(p.diamondDetails || {}), pricePerCarat: e.target.value } }))} className="px-2 py-2 border rounded" />
                </div>

                {/* Manual Main Diamond Total */}
<div className="mt-3">
  <label className="block text-sm font-medium">Manual Main Diamond Total (INR)</label>
  <input
    type="number"
    value={form.mainDiamondTotal}
    onChange={(e) => setField("mainDiamondTotal", e.target.value)}
    placeholder="Enter total manually (optional)"
    className="w-full px-2 py-2 border rounded"
  />
</div>


                <div className="mt-3 text-sm text-gray-600">
                  <div>Pricing source: {pricingLoading ? "loading..." : (pricing ? "Pricing model" : "Unavailable")}</div>
                  <div className="mt-1">Computed main diamond price (preview): <b>₹{Number((form.diamondDetails?.carat || 0) * (form.diamondDetails?.count || 0) * (form.diamondDetails?.pricePerCarat || pricing?.diamondPricePerCarat || 0)).toLocaleString()}</b></div>
                </div>
              </div>

              {/* side diamonds */}
              <div className="border p-3 rounded bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Side Diamonds</h4>
                  <button onClick={() => setForm((p) => ({ ...p, sideDiamondDetails: [...(p.sideDiamondDetails || []), {
  carat: 0,
  count: 1,
  color: "",
  clarity: "",
  cut: "",
  pricePerCarat: null,
  useAuto: true
}
] }))} className="px-2 py-1 bg-yellow-500 text-white rounded">+ Add Side Diamond</button>
                </div>

                {(form.sideDiamondDetails || []).map((s, idx) => (
                  <div key={idx} className="border p-2 rounded mb-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" step="0.01" placeholder="Carat" value={s.carat} onChange={(e) => setForm((p) => ({ ...p, sideDiamondDetails: p.sideDiamondDetails.map((it, i) => i === idx ? { ...it, carat: e.target.value } : it) }))} className="px-2 py-2 border rounded" />
                      <input type="number" placeholder="Count" value={s.count} onChange={(e) => setForm((p) => ({ ...p, sideDiamondDetails: p.sideDiamondDetails.map((it, i) => i === idx ? { ...it, count: e.target.value } : it) }))} className="px-2 py-2 border rounded" />
                      <input placeholder="Price Per Carat (override)" value={s.pricePerCarat || ""} onChange={(e) => setForm((p) => ({ ...p, sideDiamondDetails: p.sideDiamondDetails.map((it, i) => i === idx ? { ...it, pricePerCarat: e.target.value } : it) }))} className="px-2 py-2 border rounded" />
                      <input
  placeholder="Color"
  value={s.color}
  onChange={(e) =>
    setForm(p => ({
      ...p,
      sideDiamondDetails: p.sideDiamondDetails.map((it, i) =>
        i === idx ? { ...it, color: e.target.value } : it
      )
    }))
  }
  className="px-2 py-2 border rounded"
/>

<input
  placeholder="Clarity"
  value={s.clarity}
  onChange={(e) =>
    setForm(p => ({
      ...p,
      sideDiamondDetails: p.sideDiamondDetails.map((it, i) =>
        i === idx ? { ...it, clarity: e.target.value } : it
      )
    }))
  }
  className="px-2 py-2 border rounded"
/>

<input
  placeholder="Cut"
  value={s.cut}
  onChange={(e) =>
    setForm(p => ({
      ...p,
      sideDiamondDetails: p.sideDiamondDetails.map((it, i) =>
        i === idx ? { ...it, cut: e.target.value } : it
      )
    }))
  }
  className="px-2 py-2 border rounded"
/>
{/* Manual Side Diamonds Total */}
<div className="mt-3">
  <label className="block text-sm font-medium">Manual Side Diamonds Total (INR)</label>
  <input
    type="number"
    value={form.sideDiamondTotal}
    onChange={(e) => setField("sideDiamondTotal", e.target.value)}
    placeholder="Enter total manually (optional)"
    className="w-full px-2 py-2 border rounded"
  />
</div>


                      <div className="flex items-center gap-2">
                        <label className="text-sm">Use Auto</label>
                        <input type="checkbox" checked={s.useAuto !== false} onChange={(e) => setForm((p) => ({ ...p, sideDiamondDetails: p.sideDiamondDetails.map((it, i) => i === idx ? { ...it, useAuto: e.target.checked } : it) }))} />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-gray-600">Preview price: ₹{Number((s.carat || 0) * (s.count || 0) * (s.pricePerCarat || pricing?.diamondPricePerCarat || 0)).toLocaleString()}</div>
                      <div>
                        <button onClick={() => setForm((p) => ({ ...p, sideDiamondDetails: p.sideDiamondDetails.filter((_, i) => i !== idx) }))} className="text-red-600">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* right: main fields & composite pricing */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Product Name *</label>
                <input value={form.name} onChange={(e) => setField("name", e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>

              {/* Description */}
<div>
  <label className="block text-sm font-medium">Description</label>
  <textarea
    value={form.description}
    onChange={(e) => setField("description", e.target.value)}
    className="w-full px-3 py-2 border rounded"
    rows={3}
  />
</div>

{/* Color */}
<div>
  <label className="block text-sm font-medium">Color</label>
  <input
    value={form.color}
    onChange={(e) => setField("color", e.target.value)}
    placeholder="e.g., Yellow, Rose, White"
    className="w-full px-3 py-2 border rounded"
  />
</div>

{/* Size */}
<div>
  <label className="block text-sm font-medium">Size</label>
  <input
    value={form.size}
    onChange={(e) => setField("size", e.target.value)}
    placeholder="e.g., 6, 7, 8"
    className="w-full px-3 py-2 border rounded"
  />
</div>

{/* Gender */}
<div>
  <label className="block text-sm font-medium">Gender</label>
  <select
    value={form.gender}
    onChange={(e) => setField("gender", e.target.value)}
    className="w-full px-3 py-2 border rounded"
  >
    <option value="Men">Men</option>
    <option value="Women">Women</option>
    <option value="Unisex">Unisex</option>
  </select>
</div>



              {!isVariantMode && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium">Category Type</label>
                      <select value={form.categoryType} onChange={(e) => setField("categoryType", e.target.value)} className="w-full px-3 py-2 border rounded">
                        <option>Gold</option>
                        <option>Diamond</option>
                        <option>Gemstone</option>
                        <option>Fashion</option>
                        <option>Composite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Category</label>
                      <select value={form.category} onChange={(e) => setField("category", e.target.value)} className="w-full px-3 py-2 border rounded">
                        <option value="rings">rings</option>
                        <option value="earrings">earrings</option>
                        <option value="necklaces">necklaces</option>
                        <option value="bracelets">bracelets</option>
                        <option value="mens">mens</option>
                        <option value="loose-diamonds">loose-diamonds</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium">Sub Category</label>
                      <select value={form.subCategory || ""} onChange={(e) => setField("subCategory", e.target.value)} className="w-full px-3 py-2 border rounded">
                        <option value="">-- select subcategory --</option>
                        {(subCategoryOptions[form.category] || []).map((sc) => <option key={sc} value={sc}>{sc}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Variant Label (UI)</label>
                      <input value={form.variantLabel} onChange={(e) => setField("variantLabel", e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </div>
                  </div>
                </>
              )}

              <div className="border p-3 rounded">
                <div className="grid grid-cols-3 gap-2">
                  <select value={form.metal.metalType} onChange={(e) => updateMetal("metalType", e.target.value)} className="px-2 py-2 border rounded">
                    <option value="">-- Select Metal --</option>
                    {METAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input placeholder="Weight (g)" value={form.metal.weight} onChange={(e) => updateMetal("weight", e.target.value)} className="px-2 py-2 border rounded" />
                  <input placeholder="Purity (e.g., 18K)" value={form.metal.purity} onChange={(e) => updateMetal("purity", e.target.value)} className="px-2 py-2 border rounded" />
                </div>
              </div>

              {/* Manual Pricing Overrides */}
<div className="border p-3 rounded bg-white space-y-3">

  {/* Original Price */}
  <div>
    <label className="block text-sm font-medium">Original Price (INR)</label>
    <input
      type="number"
      value={form.originalPrice}
      onChange={(e) => setField("originalPrice", e.target.value)}
      className="w-full px-3 py-2 border rounded"
      placeholder="Original MRP"
    />
  </div>

  {/* Discount Percentage */}
  <div>
    <label className="block text-sm font-medium">Discount (%)</label>
    <input
      type="number"
      value={form.discount}
      onChange={(e) => setField("discount", e.target.value)}
      className="w-full px-3 py-2 border rounded"
      placeholder="0–100"
    />
  </div>

  {/* Making Charges */}
<div>
  <label className="block text-sm font-medium">Making Charges (INR)</label>
  <input
    type="number"
    value={form.makingCharges}
    onChange={(e) => setField("makingCharges", e.target.value)}
    className="w-full px-3 py-2 border rounded"
    placeholder="Enter making charges"
  />
</div>


  {/* Final Price Override */}
  <div>
    <label className="block text-sm font-medium">Final Selling Price (Override)</label>
    <input
      type="number"
      value={form.price}
      onChange={(e) => setField("price", e.target.value)}
      className="w-full px-3 py-2 border rounded"
      placeholder="Leave empty to use auto-calculated price"
    />
  </div>
</div>


              {/* Composite Pricing Preview */}
              <div className="border p-3 rounded bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Composite Pricing (Frontend)</h4>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Auto Composite</label>
                    <input type="checkbox" checked={useAutoComposite} onChange={(e) => setUseAutoComposite(e.target.checked)} />
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-700 space-y-1">
                 <div>
 {/* GOLD PRICE PREVIEW (fixed) */}
{(() => {
  const rawPurity =
    form.metal?.purity ||
    form.metal?.metalType ||
    "";

  const purityMatch = rawPurity.toUpperCase().match(/(\d+K)/);
  const purity = purityMatch ? purityMatch[1] : "";

  let goldRate = 0;

  if (pricing?.goldPrices instanceof Map) {
    goldRate = Number(pricing.goldPrices.get(purity) || 0);
  } else if (pricing?.goldPrices && typeof pricing.goldPrices === "object") {
    goldRate = Number(pricing.goldPrices[purity] || 0);
  }

  const goldTotal = Number(form.metal?.weight || 0) * goldRate;

  return (
    <div>
      Gold (@ {purity || "-"}): <b>₹{goldTotal.toLocaleString()}</b>
    </div>
  );
})()}

</div>
               <div className="mt-3 text-sm text-gray-700 space-y-1">
  <div>Gold (@ { (form.metal?.purity || form.metal?.metalType || "-") }): <b>₹{Number(computedTotals.goldTotal || 0).toLocaleString()}</b></div>
  <div>Main Diamond: <b>₹{Number(computedTotals.mainTotal || 0).toLocaleString()}</b></div>
  <div>Side Diamonds: <b>₹{Number(computedTotals.sideTotal || 0).toLocaleString()}</b></div>
  <div>Other Stones: <b>₹{Number(computedTotals.stonesTotal || 0).toLocaleString()}</b></div>
  <div>Making Charges: <b>₹{Number(computedTotals.making || 0).toLocaleString()}</b></div>
  <div className="mt-2 text-lg">Estimated Total: <b>₹{Number(computedTotals.estimatedTotal || 0).toLocaleString()}</b></div>
</div>


                </div>
              </div>

              {/* variants summary (map) */}
              {!isVariantMode && (
                <div className="border p-3 rounded bg-white">
                  <h4 className="font-semibold mb-2">Variants (map: label → id)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(form.variants || {}).length === 0 && <div className="text-sm text-gray-500">No variants linked</div>}
                    {Object.entries(form.variants || {}).map(([label, id]) => (
                      <div key={label} className="p-2 border rounded bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium truncate max-w-xs">{label}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{id}</div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <a href={`/admin/variant/${id}`} target="_blank" rel="noreferrer" className="px-2 py-1 bg-gray-200 rounded text-xs">Open</a>
                            <button onClick={() => handleUnlinkVariant(label)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Unlink</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* prices & making charges multi-currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-3 rounded">
              <h4 className="font-semibold mb-2">Prices (other currencies)</h4>
              {currencyList.map(({ code, symbol, flag }) => (
                <div key={code} className="flex items-center gap-3 mb-2">
                  <div className="w-36 flex items-center gap-2 px-3 py-2 border rounded bg-gray-50">{flag} <span className="font-medium">{code}</span></div>
                  <input value={form.prices?.[code]?.amount || ""} onChange={(e) => setPriceCurrency(code, e.target.value, symbol)} placeholder={`Price in ${code}`} className="flex-1 px-3 py-2 border rounded" />
                </div>
              ))}
            </div>

            <div className="border p-3 rounded">
              <h4 className="font-semibold mb-2">Making Charges by Country</h4>
              {currencyList.map(({ code, symbol, flag }) => (
                <div key={code} className="flex items-center gap-3 mb-2">
                  <div className="w-36 flex items-center gap-2 px-3 py-2 border rounded bg-gray-50">{flag} <span className="font-medium">{code}</span></div>
                  <input value={form.makingChargesByCountry?.[code]?.amount || ""} onChange={(e) => setMakingChargeByCountry(code, e.target.value, symbol)} placeholder={`Making (${code})`} className="flex-1 px-3 py-2 border rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex justify-end gap-3 p-4 border-t">
          {!isVariantMode && (
            <button onClick={handleSaveBase} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 rounded">Save Base</button>
          )}

          {isVariantMode ? (
            <button onClick={async () => {
              if (!variantParentId) return alert("parentId required for variant mode");
              setIsSubmitting(true);
              try {
                const token = localStorage.getItem("token");
                const payload = { ...form, isVariant: true, parentProduct: variantParentId };
                const imagesFiles = imagesList.filter((it) => it.isFile).map((it) => it.file);
                const payloadMedia = { coverFile: coverImageFile, imagesFiles, model3DFile, videoFile };
                const data = await createProduct(payload, payloadMedia, token);
                onSaved?.(data);
                alert("Variant created");
              } catch (err) {
                console.error(err);
                alert("Failed to create variant: " + (err.message || err));
              } finally {
                setIsSubmitting(false);
              }
            }} className="px-4 py-2 bg-yellow-500 text-white rounded">
              {isSubmitting ? "Saving..." : "Create Variant"}
            </button>
          ) : (
            <button onClick={() => { alert("Use Save Base to persist, or Create Variant to add variants"); }} className="px-4 py-2 bg-yellow-500 text-white rounded">{isSubmitting ? "..." : "Save & Continue"}</button>
          )}
        </div>
      </div>

      {/* Variant Drawer (right) */}
      {variantDrawerOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-full md:w-2/5 bg-white shadow-2xl z-50 overflow-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Create / Link Variant</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setVariantDrawerOpen(false)} className="px-3 py-1 rounded bg-gray-200">Close</button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Create variant form */}
            <div className="border p-3 rounded space-y-2">
              <h4 className="font-medium">New Variant</h4>
              <input value={variantForm.name} onChange={(e) => setVariantField("name", e.target.value)} placeholder="Variant name" className="w-full px-3 py-2 border rounded" />
              <select value={variantForm.metal.metalType} onChange={(e) => updateVariantMetal("metalType", e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="">-- Select Metal --</option>
                {METAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Weight (g)" value={variantForm.metal.weight} onChange={(e) => updateVariantMetal("weight", e.target.value)} className="px-2 py-2 border rounded" />
                <input placeholder="Purity (e.g., 18K)" value={variantForm.metal.purity} onChange={(e) => updateVariantMetal("purity", e.target.value)} className="px-2 py-2 border rounded" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Price (INR)" value={variantForm.price} onChange={(e) => setVariantField("price", e.target.value)} className="px-2 py-2 border rounded" />
                <input placeholder="Original Price (INR)" value={variantForm.originalPrice} onChange={(e) => setVariantField("originalPrice", e.target.value)} className="px-2 py-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium">Variant Cover</label>
                <input type="file" accept="image/*" onChange={(e) => setVariantCoverFile(e.target.files?.[0] || null)} className="mt-2" />
              </div>

              <div>
                <label className="block text-sm font-medium">Variant Gallery</label>
                <input type="file" accept="image/*" multiple onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const mapped = files.map((f) => ({ src: URL.createObjectURL(f), isFile: true, file: f }));
                  setVariantImagesList((p) => [...p, ...mapped]);
                }} className="mt-2" />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {variantImagesList.map((u, i) => <img key={i} src={u.src} className="w-full h-20 object-cover rounded" />)}
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <button onClick={() => setVariantDrawerOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button onClick={() => handleCreateVariant()} disabled={isSubmitting} className="px-4 py-2 bg-yellow-500 text-white rounded">{isSubmitting ? "Creating..." : "Create & Link Variant"}</button>
              </div>
            </div>

            <hr />

            {/* Link existing */}
            <div>
              <h4 className="font-semibold mb-2">Link Existing Variant</h4>
              <div className="flex gap-2">
                <input value={linkSearchQuery} onChange={(e) => setLinkSearchQuery(e.target.value)} placeholder="Search existing variants by name / sku / metal" className="flex-1 px-3 py-2 border rounded" />
                <button onClick={searchVariants} className="px-3 py-2 bg-blue-500 text-white rounded">{linkLoading ? "..." : "Search"}</button>
              </div>

              <div className="mt-3 max-h-60 overflow-auto">
                {linkSearchResults.map((r) => (
                  <div key={r._id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-gray-500">{r._id} • {r.metal?.metalType}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleLinkVariant(r)} className="px-3 py-1 bg-green-600 text-white rounded">Link</button>
                      <a href={`/admin/variant/${r._id}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-gray-200 rounded">Open</a>
                    </div>
                  </div>
                ))}
                {linkSearchResults.length === 0 && <div className="text-sm text-gray-500 mt-2">No results</div>}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
