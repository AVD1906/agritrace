import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from "recharts";

const API = "http://localhost:5000/api";
const COLORS = ["#16a34a", "#f59e0b", "#dc2626", "#3b82f6"];

export default function Reports() {
  const [stats, setStats] = useState({ products: 0, batches: 0, locations: 0, logs: 0 });
  const [batches, setBatches] = useState([]);
  const [logs, setLogs] = useState([]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const [p, b, l, log] = await Promise.all([
        fetch(`${API}/products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/batches`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/locations`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/logs`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [products, batchData, locations, logData] = await Promise.all([
        p.json(), b.json(), l.json(), log.json(),
      ]);
      setStats({
        products: Array.isArray(products) ? products.length : 0,
        batches: Array.isArray(batchData) ? batchData.length : 0,
        locations: Array.isArray(locations) ? locations.length : 0,
        logs: Array.isArray(logData) ? logData.length : 0,
      });
      setBatches(Array.isArray(batchData) ? batchData : []);
      setLogs(Array.isArray(logData) ? logData : []);
    } catch (err) {
      console.error("Report error:", err);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const statusCounts = batches.reduce((acc, b) => {
    const s = b.status || "Pending";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const logsByDay = logs.reduce((acc, log) => {
    const day = new Date(log.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  const lineData = Object.entries(logsByDay).map(([date, count]) => ({ date, count })).slice(-7);

  const productCounts = batches.reduce((acc, b) => {
    const name = b.product_name || "Unknown";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(productCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const verifiedCount = batches.filter(b => b.status === "Verified").length;
  const verifiedPct = batches.length ? Math.round((verifiedCount / batches.length) * 100) : 0;
  const avgQty = batches.length
    ? Math.round(batches.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0) / batches.length)
    : 0;
  const mostRecent = batches.length
    ? new Date(Math.max(...batches.map(b => new Date(b.harvest_date)))).toLocaleDateString()
    : "—";

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  const statCards = [
    { label: "Products", value: stats.products, color: "#86efac", bg: "#0d1f14" },
    { label: "Batches", value: stats.batches, color: "#93c5fd", bg: "#0c1a2e" },
    { label: "Locations", value: stats.locations, color: "#fcd34d", bg: "#1f1a0d" },
    { label: "Supply Chain Logs", value: stats.logs, color: "#c4b5fd", bg: "#1a0d2e" },
  ];

  const statusStyle = (status) => {
    if (status === "Verified") return { background: "#0d1f14", color: "#86efac" };
    if (status === "Rejected") return { background: "#1f0d0d", color: "#fca5a5" };
    return { background: "#1f1a0d", color: "#fcd34d" };
  };

  const tooltipStyle = { background: "#161b22", border: "1px solid #1f2937", color: "#f9fafb" };
  const tickStyle = { fontSize: 11, fill: "#6b7280" };

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>Reports</h1>
        <p style={s.subtitle}>Overview of your AgriTrace data</p>
      </div>

      {/* Stat cards — full width 4 columns */}
      <div style={s.statGrid}>
        {statCards.map((c) => (
          <div key={c.label} style={s.statCard}>
            <div style={{ ...s.statIcon, background: c.bg, color: c.color }}>{c.value}</div>
            <div style={s.statLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Quick stats — full width 4 columns */}
      <div style={s.quickRow}>
        <div style={s.quickCard}>
          <div style={s.quickValue}>{verifiedPct}%</div>
          <div style={s.quickLabel}>Verified Rate</div>
        </div>
        <div style={s.quickCard}>
          <div style={s.quickValue}>{avgQty}</div>
          <div style={s.quickLabel}>Avg Batch Quantity</div>
        </div>
        <div style={s.quickCard}>
          <div style={s.quickValue}>{mostRecent}</div>
          <div style={s.quickLabel}>Most Recent Harvest</div>
        </div>
        <div style={s.quickCard}>
          <div style={s.quickValue}>{verifiedCount}/{batches.length}</div>
          <div style={s.quickLabel}>Batches Verified</div>
        </div>
      </div>

      {/* Charts row — 50/50 */}
      <div style={s.chartGrid}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>Batch Status Breakdown</div>
          <div style={s.chartSubtitle}>Distribution of batch statuses</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={s.empty}>No batch data yet</div>}
        </div>

        <div style={s.chartCard}>
          <div style={s.chartTitle}>Supply Chain Activity</div>
          <div style={s.chartSubtitle}>Log entries over time (last 7 days)</div>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={tickStyle} />
                <YAxis tick={tickStyle} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} dot={{ fill: "#16a34a", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div style={s.empty}>No log data yet</div>}
        </div>
      </div>

      {/* Bar chart — full width */}
      <div style={{ ...s.chartCard, marginTop: 16 }}>
        <div style={s.chartTitle}>Top Products by Batch Count</div>
        <div style={s.chartSubtitle}>Which products have the most batches</div>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={tickStyle} />
              <YAxis tick={tickStyle} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div style={s.empty}>No product data yet</div>}
      </div>

      {/* Bottom — batch table 2/3, activity 1/3 */}
      <div style={s.bottomGrid}>

        <div style={s.chartCard}>
          <div style={s.chartTitle}>All Batches</div>
          <div style={s.chartSubtitle}>Full batch summary</div>
          <table style={s.table}>
            <thead>
              <tr>
                {["Product", "Batch ID", "Qty", "Harvest", "Status"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr><td colSpan={5} style={{ ...s.td, textAlign: "center", color: "#4b5563" }}>No batches</td></tr>
              ) : batches.map((b) => (
                <tr key={b.batch_id} style={s.tr}>
                  <td style={s.td}>{b.product_name || "—"}</td>
                  <td style={{ ...s.td, color: "#4b5563" }}>#{b.batch_id}</td>
                  <td style={s.td}>{b.quantity}</td>
                  <td style={{ ...s.td, color: "#6b7280" }}>
                    {b.harvest_date ? new Date(b.harvest_date).toLocaleDateString() : "—"}
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.pill, ...statusStyle(b.status) }}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={s.chartCard}>
          <div style={s.chartTitle}>Recent Activity</div>
          <div style={s.chartSubtitle}>Latest supply chain log entries</div>
          <div style={s.activityList}>
            {recentLogs.length === 0 ? (
              <div style={s.empty}>No activity yet</div>
            ) : recentLogs.map((log, i) => (
              <div key={i} style={s.activityItem}>
                <div style={s.activityDot} />
                <div style={s.activityContent}>
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
    </div>
  );
}

const s = {
  page: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: "#f9fafb", margin: 0 },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    background: "#161b22",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  statIcon: {
    width: 48, height: 48, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, fontWeight: 700,
  },
  statLabel: { fontSize: 13, color: "#6b7280", fontWeight: 500 },
  quickRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 16,
  },
  quickCard: {
    background: "#0d1117",
    border: "1px solid #1f2937",
    borderRadius: 10,
    padding: "14px 16px",
  },
  quickValue: { fontSize: 20, fontWeight: 700, color: "#f9fafb", marginBottom: 4 },
  quickLabel: { fontSize: 12, color: "#4b5563" },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  chartCard: {
    background: "#161b22",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: "20px 16px",
  },
  chartTitle: { fontSize: 15, fontWeight: 600, color: "#f9fafb", marginBottom: 2 },
  chartSubtitle: { fontSize: 12, color: "#4b5563", marginBottom: 16 },
  empty: { fontSize: 13, color: "#4b5563", textAlign: "center", padding: 40 },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 16,
    marginTop: 16,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", fontSize: 11, fontWeight: 600,
    color: "#4b5563", textTransform: "uppercase",
    letterSpacing: "0.05em", padding: "6px 8px",
    borderBottom: "1px solid #1f2937",
  },
  tr: { borderBottom: "1px solid #1f2937" },
  td: { fontSize: 13, color: "#d1d5db", padding: "10px 8px" },
  pill: {
    fontSize: 11, fontWeight: 500,
    padding: "2px 8px", borderRadius: 20,
    display: "inline-block",
  },
  activityList: { display: "flex", flexDirection: "column" },
  activityItem: {
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "10px 0", borderBottom: "1px solid #1f2937",
  },
  activityDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: "#16a34a", flexShrink: 0, marginTop: 5,
  },
  activityContent: { flex: 1 },
  activityStage: { fontSize: 13, fontWeight: 500, color: "#e5e7eb" },
  activityMeta: { fontSize: 11, color: "#4b5563", marginTop: 2, display: "flex", gap: 6 },
};