import { useEffect, useState } from "react";
import axios from "axios";
import EditProductModal from "./EditProductModal";
import ProductDetailsModal from "./ProductDetailsModal";

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

const SORT_OPTIONS = [
  { label: "Low to High", value: "price_asc" },
  { label: "High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "GBP", symbol: "£" },
  { code: "CAD", symbol: "CA$" },
  { code: "EUR", symbol: "€" },
  { code: "AED", symbol: "د.إ" },
  { code: "AUD", symbol: "A$" },
  { code: "SGD", symbol: "S$" },
  { code: "JPY", symbol: "¥" },
];

const API_URL = import.meta.env.VITE_API_URL;

// 🔥 Subcategory → backend mapping
const SUB_MAP = {
  "engagement rings": "engagement",
  "wedding rings": "wedding",
  "eternity band": "eternity",
  "cocktail rings": "cocktail",
  "fashion rings": "fashion",

  "studs": "studs",
  "hoops": "hoops",
  "drops": "drops",
  "fashion earrings": "fashion",

  "tennis": "tennis",
  "pendant": "pendants",
  "fashion necklace": "fashion",

  "tennis bracelet": "tennis",
  "bangles": "bangles",
  "fashion bracelet": "fashion",
};

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProductId, setViewingProductId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [type, setType] = useState("");
  const [gender, setGender] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [currency, setCurrency] = useState("INR");

  const normalize = (val) => val?.trim().toLowerCase() || "";

  const fetchProducts = async () => {
    setLoading(true);

    try {
      // Normalize type → backend (Ring → rings)
      const typeNormalized = type ? normalize(type) + "s" : "";

      // Normalize subCategory → backend
      const subNormalized =
        subCategory && SUB_MAP[normalize(subCategory)]
          ? SUB_MAP[normalize(subCategory)]
          : "";

      const params = {
        search,
        category: normalize(category),
        type: typeNormalized,
        subCategory: subNormalized,
        gender,
        minPrice,
        maxPrice,
        sort,
        currency,
        page,
        limit: 50,
      };

      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/ornaments/`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data.ornaments || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, subCategory, type, gender, minPrice, maxPrice, sort, currency]);

  // Fetch after page change or filter change
  useEffect(() => {
    fetchProducts();
  }, [search, category, subCategory, type, gender, minPrice, maxPrice, sort, currency, page]);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await axios.delete(`${API_URL}/api/ornaments/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      fetchProducts();
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err.message);
      alert("❌ Delete failed");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-yellow-700 mb-4">📜 Products</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded flex-1"
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded">
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setSubCategory(""); }}
          className="border p-2 rounded"
        >
          <option value="">All Types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          className="border p-2 rounded"
          disabled={!type}
        >
          <option value="">All Subcategories</option>
          {type &&
            SUBCATEGORY_MAP[type]?.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
        </select>

        <select value={gender} onChange={(e) => setGender(e.target.value)} className="border p-2 rounded">
          <option value="">All Genders</option>
          {GENDER_OPTIONS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="border p-2 rounded w-24" />
        <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="border p-2 rounded w-24" />

        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border p-2 rounded">
          <option value="">Sort By</option>
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="border p-2 rounded">
          {CURRENCY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white shadow rounded cursor-pointer"
              onClick={() => setViewingProductId(p._id)}
            >
              <img
                src={p.displayCoverImage || p.coverImage}
                alt={p.name}
                className="h-40 w-full object-cover"
              />

              <div className="p-4">
                <h3 className="font-semibold">{p.name}</h3>

                <div className="mt-1">
                  <span className="text-lg font-semibold">
                    {p.currency}{p.displayPrice?.toLocaleString()}
                  </span>

                  {p.originalPrice > p.displayPrice && (
                    <span className="ml-2 line-through text-sm text-gray-500">
                      {p.currency}{p.originalPrice?.toLocaleString()}
                    </span>
                  )}

                  {p.discount > 0 && (
                    <span className="ml-2 text-red-500">({p.discount}% OFF)</span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mt-1">{p.category} | {p.type}</p>
                <p className="mt-2 text-gray-700 line-clamp-2">{p.description}</p>

                <div className="flex justify-between mt-4">
                  <button onClick={(e) => { e.stopPropagation(); setEditingProduct(p); }} className="px-3 py-1 bg-yellow-200 rounded hover:bg-yellow-300">
                    Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteProduct(p._id); }} className="px-3 py-1 bg-red-500 text-white rounded">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-2 border rounded">◀ Prev</button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-2 border rounded ${page === i + 1 ? "bg-yellow-400 text-white" : ""}`}>
              {i + 1}
            </button>
          ))}

          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-2 border rounded">Next ▶</button>
        </div>
      )}

      {editingProduct && (
        <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={fetchProducts} />
      )}

      {viewingProductId && (
        <ProductDetailsModal productId={viewingProductId} onClose={() => setViewingProductId(null)} />
      )}
    </div>
  );
}
