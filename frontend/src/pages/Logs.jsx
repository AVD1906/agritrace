import React, { useEffect, useState } from "react";

const API = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [batchId, setBatchId] = useState("");

  const [form, setForm] = useState({
    batch_id: "",
    action: "",
  });

  //  FETCH LOGS
  const fetchLogs = async () => {
    if (!batchId) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/logs/${batchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("FETCH LOGS:", data);

      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setLogs([]);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [batchId]);

  //  CREATE LOG
  const addLog = async () => {
    if (!form.batch_id || !form.action) {
      alert("Fill required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batch_id: Number(form.batch_id),
          action: form.action,
        }),
      });

      const data = await res.json();
      console.log("CREATE LOG:", data);

      setForm({
        batch_id: "",
        action: "",
      });

      fetchLogs();
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Logs</h1>

      {/* SELECT BATCH */}
      <input
        placeholder="Enter Batch ID"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
        className="p-2 bg-white/10 rounded"
      />

      {/* CREATE LOG */}
      <div className="bg-white/10 p-4 rounded grid md:grid-cols-3 gap-3">

        <input
          placeholder="Batch ID"
          value={form.batch_id}
          onChange={(e) =>
            setForm({ ...form, batch_id: e.target.value })
          }
          className="p-2 bg-white/10 rounded"
        />

        <input
          placeholder="Action"
          value={form.action}
          onChange={(e) =>
            setForm({ ...form, action: e.target.value })
          }
          className="p-2 bg-white/10 rounded"
        />

        <button
          onClick={addLog}
          className="bg-green-600 text-white rounded"
        >
          Add Log
        </button>
      </div>

      {/* LIST */}
      {logs.length === 0 ? (
        <p>No logs found</p>
      ) : (
        logs.map((l) => (
          <div key={l.audit_id} className="bg-white/10 p-3 rounded">
            
            <p className="font-semibold">{l.action}</p>

            {/*  THIS IS THE FIX */}
            <p className="text-sm text-gray-300">
              {l.details} | User: {l.user_id}
            </p>

            <p className="text-xs text-gray-400">
              {l.timestamp}
            </p>

          </div>
        ))
      )}
    </div>
  );
}