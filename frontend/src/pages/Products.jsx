import React, { useEffect, useState } from "react";
import { getProducts, createProduct } from "../api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", category: "" });

  // ================= FETCH =================
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      console.log("PRODUCTS:", data);

      const list = Array.isArray(data) ? data : [];

      const formatted = list.map((p) => ({
        id: p.product_id,
        name: p.product_name,
        category: p.category,
      }));

      setProducts(formatted);

    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= ADD =================
  const addProduct = async () => {
    if (!form.name || !form.category) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await createProduct({
        name: form.name,
        category: form.category,
      });

      console.log("ADD PRODUCT:", res);

      setForm({ name: "", category: "" });

      await fetchProducts(); // 🔥 refresh

    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Products</h1>

      {/* FORM */}
      <div className="bg-white/10 p-4 rounded grid md:grid-cols-3 gap-3">

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="p-2 bg-white/10 rounded"
        />

        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="p-2 bg-white/10 rounded"
        />

        <button
          onClick={addProduct}
          className="bg-green-600 text-white rounded"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        products.map((p) => (
          <div key={p.id} className="bg-white/10 p-3 rounded">
            {p.name} ({p.category})
          </div>
        ))
      )}
    </div>
  );
}