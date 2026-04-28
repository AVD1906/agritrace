import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function Certificates() {
  const [batchId, setBatchId] = useState("");
  const [name, setName] = useState("");
  const [certs, setCerts] = useState([]);

  // ================= FETCH =================
  const fetchCertificates = async () => {
    if (!batchId) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/certifications/${batchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("CERTS FROM DB:", data);

      setCerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCerts([]);
    }
  };

  // AUTO LOAD
  useEffect(() => {
    fetchCertificates();
  }, [batchId]);

  // ================= ADD =================
  const addCertificate = async () => {
    if (!batchId || !name.trim()) {
      alert("Fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/certifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batch_id: Number(batchId),
          name: name.trim(),
        }),
      });

      const data = await res.json();
      console.log("ADD CERT RESPONSE:", data);

      if (!res.ok) {
        alert(data.message || "Failed to add certificate");
        return;
      }

      setName("");

      // 🔥 REAL FIX: reload from DB
      await fetchCertificates();

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Certificates</h1>

      {/* BATCH INPUT */}
      <input
        placeholder="Enter Batch ID"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
        className="p-2 bg-white/10 rounded"
      />

      {/* ADD CERT */}
      <div className="bg-white/10 p-4 rounded flex gap-3">
        <input
          placeholder="Certificate Name (use | to separate)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 bg-white/10 rounded flex-1"
        />

        <button
          onClick={addCertificate}
          className="bg-green-600 px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      {certs.length === 0 ? (
        <p>No certificates</p>
      ) : (
        certs.map((c) => (
          <div key={c.cert_id} className="bg-white/10 p-3 rounded">

            {(c.issued_by || "").split("|").map((item, index) => (
              <p key={index} className="font-semibold">
                <span className="text-green-400 mr-2">●</span>
                {item.trim()}
              </p>
            ))}

            <p className="text-xs text-gray-400 mt-1">
              Batch: {c.batch_id}
            </p>

            <p className="text-xs text-gray-400">
              Date: {c.issue_date}
            </p>

            <p className="text-xs text-green-400">
              Status: {c.status || "Valid"}
            </p>

          </div>
        ))
      )}
    </div>
  );
}