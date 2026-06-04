import React, { useEffect, useState } from "react";

const API = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";

export default function Audit() {
  const [logs, setLogs] = useState([]);

  //  FETCH ALL LOGS (ADMIN)
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("AUDIT LOGS:", data);

      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setLogs([]);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      {logs.length === 0 ? (
        <p>No logs found</p>
      ) : (
        logs.map((l) => (
          <div
            key={l.audit_id}
            className="bg-white/10 p-3 rounded mt-3"
          >
            <p className="font-semibold">{l.action}</p>

            <p className="text-sm text-gray-300">
              {l.details}
            </p>

            <p className="text-sm text-gray-400">
              User: {l.user_id}
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