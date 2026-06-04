import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import socket from '../services/socket';

const API = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    batches: 0, verified: 0, pending: 0,
    products: 0, logs: 0, certifications: 0,
  });
  const [recentBatches, setRecentBatches] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  let role = "User";
  let name = "";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      const roleMap = { 1: "Admin", 2: "Farmer", 3: "Processor", 4: "Distributor", 5: "Retailer" };
      role = roleMap[decoded.role_id] || "User";
      name = decoded.name || decoded.email?.split("@")[0] || "User";
    } catch (err) {}
  }

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [batchRes, productRes, logRes] = await Promise.all([
        fetch(`${API}/batches`, { headers }),
        fetch(`${API}/products`, { headers }),
        fetch(`${API}/logs`, { headers }),
      ]);
      const [batches, products, logs] = await Promise.all([
        batchRes.json(), productRes.json(), logRes.json(),
      ]);
      const batchList = Array.isArray(batches) ? batches : [];
      const productList = Array.isArray(products) ? products : [];
      const logList = Array.isArray(logs) ? logs : [];

      setStats({
        batches: batchList.length,
        verified: batchList.filter(b => b.status === "Verified").length,
        pending: batchList.filter(b => b.status !== "Verified").length,
        products: productList.length,
        logs: logList.length,
        certifications: 0,
      });

      setRecentBatches(batchList.slice(-5).reverse());
      setRecentLogs([...logList].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    socket.on('batch:updated', () => { fetchData(); });
    return () => { socket.off('batch:updated'); };
  }, []);

  const statusStyle = (status) => {
    if (status === "Verified") return { background: "#0d1f14", color: "#86efac" };
    if (status === "Rejected") return { background: "#1f0d0d", color: "#fca5a5" };
    return { background: "#1f1a0d", color: "#fcd34d" };
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return <div style={{ padding: 24, color: "#4b5563" }}>Loading...</div>;

  const adminCards = [
    { label: "Total Batches", value: stats.batches, color: "#86efac", bg: "#0d1f14" },
    { label: "Verified", value: stats.verified, color: "#86efac", bg: "#0d1f14" },
    { label: "Pending", value: stats.pending, color: "#fcd34d", bg: "#1f1a0d" },
    { label: "Products", value: stats.products, color: "#93c5fd", bg: "#0c1a2e" },
    { label: "Supply Chain Logs", value: stats.logs, color: "#c4b5fd", bg: "#1a0d2e" },
  ];
  const farmerCards = [
    { label: "My Batches", value: stats.batches, color: "#86efac", bg: "#0d1f14" },
    { label: "Verified", value: stats.verified, color: "#86efac", bg: "#0d1f14" },
    { label: "Pending", value: stats.pending, color: "#fcd34d", bg: "#1f1a0d" },
    { label: "Products", value: stats.products, color: "#93c5fd", bg: "#0c1a2e" },
  ];
  const processorCards = [
    { label: "Total Batches", value: stats.batches, color: "#86efac", bg: "#0d1f14" },
    { label: "Verified", value: stats.verified, color: "#86efac", bg: "#0d1f14" },
    { label: "Supply Chain Logs", value: stats.logs, color: "#c4b5fd", bg: "#1a0d2e" },
    { label: "Products", value: stats.products, color: "#93c5fd", bg: "#0c1a2e" },
  ];

  const cardSet = role === "Admin" ? adminCards : role === "Processor" ? processorCards : farmerCards;

  const verifiedPct = stats.batches ? Math.round((stats.verified / stats.batches) * 100) : 0;

  const tipText = {
    Farmer: "Create a new batch after every harvest and generate a QR code to share with processors.",
    Processor: "Add certifications to verified batches to increase trust in the supply chain.",
    Distributor: "Log each distribution event to keep the supply chain timeline accurate.",
    Retailer: "Scan batch QR codes to verify product authenticity before shelving.",
    Admin: "Check the Reports page for full supply chain activity analytics.",
  };

  return (
    <div style={s.page}>

      {/* Greeting row */}
      <div style={s.greeting}>
        <div>
          <h1 style={s.greetTitle}>{getGreeting()}, {name}</h1>
          <p style={s.greetSub}>
            {role === "Admin" ? `${stats.pending} batches need attention`
              : role === "Farmer" ? `You have ${stats.batches} batches tracked`
              : role === "Processor" ? `${stats.logs} supply chain events logged`
              : `Welcome to AgriTrace`}
          </p>
        </div>
        <div style={s.rolePill}>{role}</div>
      </div>

      {/* Stat cards — full width */}
      <div style={{ ...s.cardGrid, gridTemplateColumns: `repeat(${cardSet.length}, 1fr)` }}>
        {cardSet.map((c) => (
          <div key={c.label} style={s.statCard}>
            <div style={{ ...s.statNum, color: c.color, background: c.bg }}>{c.value}</div>
            <div style={s.statLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Quick metrics bar */}
      <div style={s.metricsBar}>
        <div style={s.metricItem}>
          <span style={s.metricValue}>{verifiedPct}%</span>
          <span style={s.metricLabel}>Verified Rate</span>
        </div>
        <div style={s.metricDivider} />
        <div style={s.metricItem}>
          <span style={s.metricValue}>{stats.logs}</span>
          <span style={s.metricLabel}>Total Log Events</span>
        </div>
        <div style={s.metricDivider} />
        <div style={s.metricItem}>
          <span style={s.metricValue}>{stats.products}</span>
          <span style={s.metricLabel}>Products Tracked</span>
        </div>
        <div style={s.metricDivider} />
        <div style={s.metricItem}>
          <span style={s.metricValue}>{stats.verified}/{stats.batches}</span>
          <span style={s.metricLabel}>Batches Verified</span>
        </div>
      </div>

      {/* Main two-column layout */}
      <div style={s.mainGrid}>

        {/* Left — recent batches */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <div style={s.sectionTitle}>Recent Batches</div>
            <a href="/batches" style={s.sectionLink}>View all →</a>
          </div>
          <div style={s.batchList}>
            {recentBatches.length === 0 ? (
              <div style={s.empty}>No batches yet</div>
            ) : recentBatches.map((b) => (
              <div key={b.batch_id} style={s.batchRow}>
                <div style={s.batchLeft}>
                  <div style={s.batchName}>{b.product_name || `Batch #${b.batch_id}`}</div>
                  <div style={s.batchMeta}>
                    Qty: {b.quantity} · {b.harvest_date ? new Date(b.harvest_date).toLocaleDateString() : "—"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ ...s.pill, ...statusStyle(b.status) }}>
                    {b.status || "Pending"}
                  </span>
                  <button onClick={() => window.open(`/trace/${b.batch_id}`, "_blank")} style={s.traceBtn}>
                    Trace
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — recent activity */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <div style={s.sectionTitle}>Recent Activity</div>
            <a href="/logs" style={s.sectionLink}>View all →</a>
          </div>
          <div style={s.batchList}>
            {recentLogs.length === 0 ? (
              <div style={s.empty}>No activity yet</div>
            ) : recentLogs.map((log, i) => (
              <div key={i} style={s.activityRow}>
                <div style={s.activityDot} />
                <div style={{ flex: 1 }}>
                  <div style={s.activityStage}>{log.stage || "Log entry"}</div>
                  <div style={s.activityMeta}>
                    {log.batch_id && <span>Batch #{log.batch_id}</span>}
                    <span style={{ color: "#374151" }}>·</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                {log.status && (
                  <span style={{ ...s.pill, ...statusStyle(log.status === "Completed" ? "Verified" : "Pending"), flexShrink: 0 }}>
                    {log.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tip */}
      <div style={s.tipCard}>
        <span style={s.tipIcon}>💡</span>
        <span style={s.tipText}>{tipText[role] || "Welcome to AgriTrace."}</span>
      </div>

    </div>
  );
}

const s = {
  page: { padding: 0 },
  greeting: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 20,
  },
  greetTitle: { fontSize: 22, fontWeight: 700, color: "#f9fafb", margin: 0 },
  greetSub: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  rolePill: {
    fontSize: 12, fontWeight: 500, padding: "4px 12px",
    borderRadius: 20, background: "#14532d", color: "#86efac",
  },
  cardGrid: {
    display: "grid",
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    background: "#161b22", border: "1px solid #1f2937",
    borderRadius: 12, padding: "18px 16px",
    display: "flex", flexDirection: "column", gap: 8,
  },
  statNum: {
    width: 48, height: 48, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, fontWeight: 700,
  },
  statLabel: { fontSize: 13, color: "#6b7280", fontWeight: 500 },
  metricsBar: {
    display: "flex", alignItems: "center",
    background: "#0d1117", border: "1px solid #1f2937",
    borderRadius: 10, padding: "14px 24px",
    marginBottom: 16, gap: 0,
  },
  metricItem: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4,
  },
  metricValue: { fontSize: 20, fontWeight: 700, color: "#f9fafb" },
  metricLabel: { fontSize: 11, color: "#4b5563" },
  metricDivider: { width: 1, height: 36, background: "#1f2937", flexShrink: 0 },
  mainGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 16, marginBottom: 16,
  },
  section: {
    background: "#161b22", border: "1px solid #1f2937",
    borderRadius: 12, padding: "16px 20px",
  },
  sectionHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "#f9fafb" },
  sectionLink: { fontSize: 13, color: "#16a34a", textDecoration: "none" },
  batchList: { display: "flex", flexDirection: "column" },
  batchRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "10px 0",
    borderBottom: "1px solid #1f2937",
  },
  batchLeft: {},
  batchName: { fontSize: 14, fontWeight: 500, color: "#e5e7eb" },
  batchMeta: { fontSize: 12, color: "#4b5563", marginTop: 2 },
  pill: { fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20 },
  traceBtn: {
    padding: "4px 12px", background: "#0f1117",
    border: "1px solid #374151", borderRadius: 6,
    fontSize: 12, color: "#9ca3af", cursor: "pointer",
  },
  activityRow: {
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "10px 0", borderBottom: "1px solid #1f2937",
  },
  activityDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: "#16a34a", flexShrink: 0, marginTop: 5,
  },
  activityStage: { fontSize: 13, fontWeight: 500, color: "#e5e7eb" },
  activityMeta: {
    fontSize: 11, color: "#4b5563", marginTop: 2,
    display: "flex", gap: 6,
  },
  empty: { fontSize: 13, color: "#4b5563", padding: "16px 0" },
  tipCard: {
    display: "flex", alignItems: "flex-start", gap: 10,
    background: "#0d1f14", border: "1px solid #14532d",
    borderRadius: 10, padding: "12px 16px",
  },
  tipIcon: { fontSize: 16, flexShrink: 0 },
  tipText: { fontSize: 13, color: "#86efac", lineHeight: 1.5 },
};