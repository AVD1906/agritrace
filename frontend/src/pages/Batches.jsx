import React, { useEffect, useState } from "react";
import { getProducts, getLocations, createBatch } from "../api";

const API = "http://localhost:5000/api";

export default function Batches() {
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [batches, setBatches] = useState([]);

  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    location_id: "",
    date: "",
  });

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      // PRODUCTS
      const p = await getProducts();
      const formattedProducts = (p || []).map((item) => ({
        id: item.product_id,
        name: item.product_name || item.name,
      }));
      setProducts(formattedProducts);

      // LOCATIONS
      const l = await getLocations();
      const formattedLocations = (l || []).map((item) => ({
        id: item.location_id,
        name: item.name,
      }));
      setLocations(formattedLocations);

      // BATCHES
      const res = await fetch(`${API}/batches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const b = await res.json();

      const list = Array.isArray(b)
        ? b
        : Array.isArray(b?.data)
        ? b.data
        : [];

      setBatches(list);

    } catch (err) {
      console.error("Error fetching data:", err);
      setBatches([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= ADD BATCH =================
  const addBatch = async () => {
    if (!form.product_id || !form.quantity || !form.location_id || !form.date) {
      alert("Fill all required fields");
      return;
    }

    try {
      await createBatch({
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        location_id: Number(form.location_id),
        date: form.date, // 🔥 mapped to harvest_date in backend
      });

      // reset form
      setForm({
        product_id: "",
        quantity: "",
        location_id: "",
        date: "",
      });

      await fetchData(); // 🔥 refresh UI

    } catch (err) {
      console.error("Error adding batch:", err);
      alert("Failed to add batch");
    }
  };

  // ================= VERIFY =================
  const verifyBatch = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API}/batches/verify/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchData(); // 🔥 refresh

    } catch (err) {
      console.error("Verify error:", err);
    }
  };

  // helper
  const getName = (list, id) =>
    list.find((i) => String(i.id) === String(id))?.name || id;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Batches</h1>

      {/* ================= FORM ================= */}
      <div className="bg-white/10 p-4 rounded grid md:grid-cols-5 gap-3">

        {/* PRODUCT */}
        <select
          value={form.product_id}
          onChange={(e) =>
            setForm({ ...form, product_id: e.target.value })
          }
          className="p-2 bg-white/10 rounded"
        >
          <option value="">Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* QUANTITY */}
        <input
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
          className="p-2 bg-white/10 rounded"
        />

        {/* LOCATION */}
        <select
          value={form.location_id}
          onChange={(e) =>
            setForm({ ...form, location_id: e.target.value })
          }
          className="p-2 bg-white/10 rounded"
        >
          <option value="">Location</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        {/* DATE */}
        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
          className="p-2 bg-white/10 rounded"
        />

        {/* ADD BUTTON */}
        <button
          onClick={addBatch}
          className="bg-green-600 hover:bg-green-500 text-white rounded"
        >
          Add
        </button>
      </div>

      {/* ================= LIST ================= */}
      <div className="relative pl-6 space-y-6">
        <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-white/20"></div>

        {batches.map((b) => (
          <div key={b.batch_id} className="relative">

            <div className="absolute -left-[10px] top-5 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>

            <div className="bg-white/10 p-4 rounded ml-4">

              <p className="font-semibold text-lg">
                {getName(products, b.product_id)}
              </p>

              <p className="text-sm text-gray-300">
                Qty: {b.quantity}
                {b.location_id && ` | ${getName(locations, b.location_id)}`}
              </p>

              {/* STATUS */}
              <p className="text-sm mt-1">
                Status:{" "}
                <span
                  className={
                    b.status === "Verified"
                      ? "text-green-400"
                      : b.status === "Rejected"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }
                >
                  {b.status || "Pending"}
                </span>
              </p>

              {/* VERIFY BUTTON */}
              {b.status !== "Verified" && (
                <button
                  onClick={() => verifyBatch(b.batch_id)}
                  className="bg-blue-600 px-3 py-1 rounded mt-2"
                >
                  Verify
                </button>
              )}

              <p className="text-xs text-gray-400 mt-1">
                {b.harvest_date || b.created_at || "No date"}
              </p>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}