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

// 🔹 Currency options
const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "GBP", symbol: "£" },
  { code: "CAD", symbol: "CA$" },
  { code: "EUR", symbol: "€" },
  { code: "AED", symbol: "د.إ" },    // 🇦🇪 UAE Dirham
  { code: "AUD", symbol: "A$" },     // 🇦🇺 Australian Dollar
  { code: "SGD", symbol: "S$" },     // 🇸🇬 Singapore Dollar
  { code: "JPY", symbol: "¥" },
];

const API_URL = import.meta.env.VITE_API_URL;

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
  const [currency, setCurrency] = useState("INR"); // ✅ currency state

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        category,
        type,
        subCategory,
        gender,
        minPrice,
        maxPrice,
        sort,
        currency, // ✅ pass currency
        page,
        limit: 8,
      };

      const token = localStorage.getItem("token"); // ✅ get token

      const res = await axios.get(`${API_URL}/api/ornaments/`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data.ornaments || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch Products Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Single useEffect to handle all filter changes and pagination
  useEffect(() => {
    // Reset to page 1 when any filter changes (but not when page itself changes)
    setPage(1);
  }, [search, category, subCategory, type, gender, minPrice, maxPrice, sort, currency]);

  // ✅ Separate useEffect to fetch products whenever page changes or on mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, category, subCategory, type, gender, minPrice, maxPrice, sort, currency]);

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${API_URL}/api/ornaments/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchProducts();
    } catch (err) {
      console.error("Delete Product Error:", err.response?.data || err.message);
      alert("❌ Failed to delete product");
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
          className="border p-2 rounded flex-1 min-w-[150px]"
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
          disabled={!type || !SUBCATEGORY_MAP[type]}
        >
          <option value="">All Subcategories</option>
          {type && SUBCATEGORY_MAP[type] && SUBCATEGORY_MAP[type].map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>

        <select value={gender} onChange={(e) => setGender(e.target.value)} className="border p-2 rounded">
          <option value="">All Genders</option>
          {GENDER_OPTIONS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="border p-2 rounded w-24"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border p-2 rounded w-24"
        />

        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border p-2 rounded">
          <option value="">Sort By</option>
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* ✅ Currency Dropdown */}
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="border p-2 rounded">
          {CURRENCY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-xl transition"
              onClick={() => setViewingProductId(p._id)}
            >
              {p.coverImage || (p.images && p.images.length > 0) ? (
                <img
                  src={p.coverImage || (p.images && p.images[0])}
                  alt={p.name}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="h-40 w-full bg-gray-200 flex items-center justify-center">
                  No Image
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  {/* ✅ Updated price display with originalPrice + discount */}
                  <div className="mt-1">
                    <span className="text-gray-800 font-semibold text-lg">
                      {p.currency}{p.displayPrice?.toLocaleString()}
                    </span>

                    {p.originalPrice && p.originalPrice > p.displayPrice && (
                      <span className="text-gray-400 line-through ml-2 text-sm">
                        {p.currency}{p.originalPrice?.toLocaleString()}
                      </span>
                    )}

                    {p.discount > 0 && (
                      <span className="text-red-500 text-sm font-medium ml-2">
                        ({p.discount}% OFF)
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    {[ 
                      Array.isArray(p.category) ? p.category.join(", ") : p.category,
                      p.type,
                      p.gender,
                      Array.isArray(p.subCategory) ? p.subCategory.join(", ") : p.subCategory
                    ]
                      .filter(Boolean)
                      .join(" | ")}     
                  </p>

                  <p className="text-gray-700 mt-2 line-clamp-2">{p.description}</p>
                  <p className="text-gray-500 mt-1">Stock: {p.stock}</p>
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProduct(p);
                    }}
                    className="px-3 py-1 bg-yellow-200 rounded hover:bg-yellow-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProduct(p._id);
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            ◀ Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-2 border rounded ${          
                page === i + 1 ? "bg-yellow-400 text-white font-bold" : "hover:bg-gray-100"
              }`}      
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Next ▶
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={fetchProducts}
        />
      )}

      {/* Product Details Modal */}
      {viewingProductId && (
        <ProductDetailsModal
          productId={viewingProductId}
          onClose={() => setViewingProductId(null)}
        />
      )}
    </div>
  );
}