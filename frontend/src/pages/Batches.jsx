import React, { useEffect, useState } from "react";
import { getProducts, getLocations, createBatch } from "../api";

const API = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";

const statusStyle = (status) => {
  if (status === "Verified") return { background: "#0d1f14", color: "#86efac" };
  if (status === "Rejected") return { background: "#1f0d0d", color: "#fca5a5" };
  return { background: "#1f1a0d", color: "#fcd34d" };
};

export default function Batches() {
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);

  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    location_id: "",
    date: "",
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const p = await getProducts();
      setProducts((p || []).map((item) => ({
        id: item.product_id,
        name: item.product_name || item.name,
      })));

      const l = await getLocations();
      setLocations((l || []).map((item) => ({
        id: item.location_id,
        name: item.name,
      })));

      const res = await fetch(`${API}/batches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const b = await res.json();
      setBatches(Array.isArray(b) ? b : Array.isArray(b?.data) ? b.data : []);

    } catch (err) {
      console.error("Error fetching data:", err);
      setBatches([]);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
        date: form.date,
      });
      setForm({ product_id: "", quantity: "", location_id: "", date: "" });
      await fetchData();
    } catch (err) {
      console.error("Error adding batch:", err);
      alert("Failed to add batch");
    }
  };

  const verifyBatch = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/batches/verify/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (err) {
      console.error("Verify error:", err);
    }
  };

  const downloadCertificate = (batchId) => {
    const token = localStorage.getItem("token");
    fetch(`${API}/batches/${batchId}/certificate`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `AgriTrace-Certificate-Batch-${batchId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => console.error("Certificate error:", err));
  };

  const getName = (list, id) =>
    list.find((i) => String(i.id) === String(id))?.name || `#${id}`;

  return (
    <div style={s.page}>
      {/* ===== HEADER ===== */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Batches</h1>
          <p style={s.pageSubtitle}>{batches.length} total batches</p>
        </div>
      </div>

      {/* ===== ADD FORM ===== */}
      <div style={s.formCard}>
        <div style={s.formTitle}>New Batch</div>
        <div style={s.formRow}>
          <select
            value={form.product_id}
            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            style={s.input}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <input
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            style={s.input}
          />

          <select
            value={form.location_id}
            onChange={(e) => setForm({ ...form, location_id: e.target.value })}
            style={s.input}
          >
            <option value="">Select Location</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={s.input}
          />

          <button onClick={addBatch} style={s.addBtn}>
            + Add Batch
          </button>
        </div>
      </div>

      {/* ===== BATCH GRID ===== */}
      <div style={s.grid}>
        {batches.map((b) => (
          <div key={b.batch_id} style={s.card}>
            {/* Card top */}
            <div style={s.cardTop}>
              <div style={s.cardTopLeft}>
                <div style={s.productName}>{b.product_name || getName(products, b.product_id)}</div>
                <div style={s.batchId}>Batch #{b.batch_id}</div>
              </div>
              <span style={{ ...s.statusPill, ...statusStyle(b.status) }}>
                {b.status || "Pending"}
              </span>
            </div>

            {/* Meta */}
            <div style={s.metaRow}>
              <div style={s.metaItem}>
                <span style={s.metaLabel}>Qty</span>
                <span style={s.metaValue}>{b.quantity}</span>
              </div>
              <div style={s.metaItem}>
                <span style={s.metaLabel}>Location</span>
                <span style={s.metaValue}>{getName(locations, b.location_id)}</span>
              </div>
              <div style={s.metaItem}>
                <span style={s.metaLabel}>Harvest</span>
                <span style={s.metaValue}>
                  {b.harvest_date ? new Date(b.harvest_date).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={s.actions}>
              {b.status !== "Verified" && (
                <button
                  onClick={() => verifyBatch(b.batch_id)}
                  style={s.verifyBtn}
                >
                  Verify
                </button>
              )}
              <button
                onClick={() => window.open(`/trace/${b.batch_id}`, "_blank")}
                style={s.outlineBtn}
              >
                View Trace
              </button>
              {b.qr_code && (
                <button
                  onClick={() => setSelectedQR(selectedQR === b.batch_id ? null : b.batch_id)}
                  style={s.outlineBtn}
                >
                  {selectedQR === b.batch_id ? "Hide QR" : "QR Code"}
                </button>
              )}
              {b.status === "Verified" && (
                <button
                  onClick={() => downloadCertificate(b.batch_id)}
                  style={s.certBtn}
                >
                  📄 Certificate
                </button>
              )}
            </div>

            {/* QR inline */}
            {selectedQR === b.batch_id && b.qr_code && (
              <div style={s.qrInline}>
                <img src={b.qr_code} alt="QR" style={s.qrImg} />
                <span style={s.qrLabel}>Scan to trace</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== QR MODAL ===== */}
      {selectedQR && (
        <div style={s.modalOverlay} onClick={() => setSelectedQR(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <p style={s.modalTitle}>Scan to Trace Batch</p>
            <img
              src={batches.find((b) => b.batch_id === selectedQR)?.qr_code}
              alt="QR Code"
              style={{ width: 200, height: 200 }}
            />
            <p style={{ color: "#6b7280", fontSize: 13 }}>Batch #{selectedQR}</p>
            <button onClick={() => setSelectedQR(null)} style={s.closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: "0" },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#f9fafb", margin: 0 },
  pageSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  formCard: {
    background: "#161b22",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#9ca3af",
    marginBottom: 12,
  },
  formRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  input: {
    padding: "8px 12px",
    border: "1px solid #1f2937",
    borderRadius: 8,
    fontSize: 13,
    color: "#e5e7eb",
    background: "#0f1117",
    outline: "none",
    flex: 1,
    minWidth: 140,
  },
  addBtn: {
    padding: "8px 18px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#161b22",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: 18,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardTopLeft: {},
  productName: { fontSize: 16, fontWeight: 600, color: "#f9fafb" },
  batchId: { fontSize: 12, color: "#4b5563", marginTop: 2 },
  statusPill: {
    fontSize: 11,
    fontWeight: 500,
    padding: "3px 10px",
    borderRadius: 20,
    flexShrink: 0,
  },
  metaRow: {
    display: "flex",
    gap: 16,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottom: "1px solid #1f2937",
  },
  metaItem: { display: "flex", flexDirection: "column", gap: 2 },
  metaLabel: {
    fontSize: 10,
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  metaValue: { fontSize: 13, fontWeight: 500, color: "#d1d5db" },
  actions: { display: "flex", gap: 8, flexWrap: "wrap" },
  verifyBtn: {
    padding: "6px 14px",
    background: "#0c1a2e",
    color: "#93c5fd",
    border: "1px solid #1e3a5f",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
  outlineBtn: {
    padding: "6px 14px",
    background: "#161b22",
    color: "#9ca3af",
    border: "1px solid #374151",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
  certBtn: {
    padding: "6px 14px",
    background: "#0d1f14",
    color: "#86efac",
    border: "1px solid #14532d",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
  qrInline: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid #1f2937",
  },
  qrImg: { width: 100, height: 100, borderRadius: 6 },
  qrLabel: { fontSize: 11, color: "#4b5563" },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modal: {
    background: "#161b22",
    border: "1px solid #1f2937",
    padding: 24,
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: 600, color: "#f9fafb" },
  closeBtn: {
    padding: "8px 20px",
    background: "#0f1117",
    border: "1px solid #374151",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    color: "#9ca3af",
  },
};