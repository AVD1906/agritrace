import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function TracePage() {
  const { batchId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/trace/${batchId}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Batch not found or invalid QR code.");
        setLoading(false);
      });
  }, [batchId]);

  if (loading) return (
    <div style={styles.center}>
      <p style={styles.loading}>Loading trace data...</p>
    </div>
  );

  if (error) return (
    <div style={styles.center}>
      <p style={styles.error}>{error}</p>
    </div>
  );

  const { batch, timeline, certifications } = data;

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>🌿 AgriTrace</div>
        <span style={styles.tagline}>Farm to Table — Verified Supply Chain</span>
      </div>

      {/* Batch Info */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h1 style={styles.productName}>{batch.product_name}</h1>
            <p style={styles.batchId}>Batch #{batch.batch_id}</p>
          </div>
          <span style={{
            ...styles.statusPill,
            background: batch.status === "Verified" ? "#0d1f14" : "#1f1a0d",
            color: batch.status === "Verified" ? "#86efac" : "#fcd34d",
          }}>
            {batch.status}
          </span>
        </div>
        <div style={styles.batchMeta}>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Quantity</span>
            <span style={styles.metaValue}>{batch.quantity} units</span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Harvest Date</span>
            <span style={styles.metaValue}>{new Date(batch.harvest_date).toLocaleDateString()}</span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Expiry Date</span>
            <span style={styles.metaValue}>{batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : "—"}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Supply Chain Journey</h2>
        <div style={styles.timeline}>
          {timeline.map((log, index) => (
            <div key={log.log_id} style={styles.timelineItem}>
              <div style={styles.timelineLeft}>
                <div style={styles.dot} />
                {index < timeline.length - 1 && <div style={styles.line} />}
              </div>
              <div style={styles.timelineContent}>
                <div style={styles.timelineStage}>{log.stage}</div>
                <div style={styles.timelineTime}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                {log.status && (
                  <span style={{
                    ...styles.stagePill,
                    background: log.status === "Completed" ? "#0d1f14" : "#0c1a2e",
                    color: log.status === "Completed" ? "#86efac" : "#93c5fd",
                  }}>
                    {log.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      {certifications.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Certifications</h2>
          {certifications.map((cert) => (
            <div key={cert.cert_id} style={styles.certItem}>
              <div style={styles.certLeft}>
                <span style={styles.certIcon}>✅</span>
                <div>
                  <div style={styles.certIssuer}>{cert.issued_by}</div>
                  <div style={styles.certDate}>
                    Issued: {new Date(cert.issue_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <span style={{
                ...styles.stagePill,
                background: cert.status === "Valid" ? "#0d1f14" : "#1f0d0d",
                color: cert.status === "Valid" ? "#86efac" : "#fca5a5",
              }}>
                {cert.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={styles.footer}>
        Powered by AgriTrace — Transparent Food Supply Chain
      </div>

    </div>
  );
}

const styles = {
  page: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "24px 16px",
    fontFamily: "Inter, sans-serif",
    background: "#0f1117",
    minHeight: "100vh",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#0f1117",
  },
  loading: { color: "#6b7280", fontSize: 16 },
  error: { color: "#f87171", fontSize: 16 },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  logo: { fontSize: 20, fontWeight: 700, color: "#86efac" },
  tagline: { fontSize: 12, color: "#4b5563" },
  card: {
    background: "#161b22",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    border: "1px solid #1f2937",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  productName: { fontSize: 22, fontWeight: 700, color: "#f9fafb", margin: 0 },
  batchId: { fontSize: 13, color: "#4b5563", marginTop: 4 },
  statusPill: {
    fontSize: 12,
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: 20,
  },
  batchMeta: { display: "flex", gap: 24 },
  metaItem: { display: "flex", flexDirection: "column", gap: 2 },
  metaLabel: {
    fontSize: 11,
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  metaValue: { fontSize: 14, fontWeight: 500, color: "#d1d5db" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#f9fafb",
    marginBottom: 16,
    marginTop: 0,
  },
  timeline: { display: "flex", flexDirection: "column" },
  timelineItem: { display: "flex", gap: 12, marginBottom: 4 },
  timelineLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "#16a34a",
    flexShrink: 0,
    marginTop: 3,
  },
  line: {
    width: 2,
    flex: 1,
    background: "#1f2937",
    minHeight: 24,
    margin: "4px 0",
  },
  timelineContent: { paddingBottom: 20 },
  timelineStage: { fontSize: 14, fontWeight: 600, color: "#e5e7eb" },
  timelineTime: { fontSize: 12, color: "#4b5563", marginTop: 2 },
  stagePill: {
    fontSize: 11,
    fontWeight: 500,
    padding: "2px 8px",
    borderRadius: 20,
    marginTop: 4,
    display: "inline-block",
  },
  certItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #1f2937",
  },
  certLeft: { display: "flex", alignItems: "center", gap: 10 },
  certIcon: { fontSize: 18 },
  certIssuer: { fontSize: 14, fontWeight: 500, color: "#e5e7eb" },
  certDate: { fontSize: 12, color: "#4b5563", marginTop: 2 },
  footer: { textAlign: "center", fontSize: 12, color: "#374151", marginTop: 24 },
};