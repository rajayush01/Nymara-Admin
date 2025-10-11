import { useState } from "react";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";

export default function Products() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Products</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
        >
          + Add Product
        </button>
      </div>

      {/* Product List */}
      <ProductList />

      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[600px] relative">
            {/* Close button */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl"
            >
              ✖
            </button>

            <ProductForm />
          </div>
        </div>
      )}
    </div>
  );
}
