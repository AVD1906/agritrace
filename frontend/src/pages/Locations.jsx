import React, { useEffect, useState } from "react";
import { getLocations, createLocation } from "../api";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "Farm",
    address: "",
  });

  //  FETCH LOCATIONS
  const fetchLocations = async () => {
    try {
      const data = await getLocations();
      console.log("LOCATIONS:", data);

      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setLocations([]);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // ADD LOCATION
  const addLocation = async () => {
    if (!form.name || !form.address) {
      alert("Name and address required");
      return;
    }

    try {
      await createLocation(form);

      setForm({
        name: "",
        type: "Farm",
        address: "",
      });

      fetchLocations();
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Locations</h1>

      {/* FORM */}
      <div className="bg-white/10 p-4 rounded grid md:grid-cols-4 gap-3">
        
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="p-2 bg-white/10 rounded"
        />

        <select
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value })
          }
          className="p-2 bg-white/10 rounded"
        >
          <option>Farm</option>
          <option>Processing</option>
          <option>Distribution</option>
          <option>Retail</option>
        </select>

        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
          className="p-2 bg-white/10 rounded"
        />

        <button
          onClick={addLocation}
          className="bg-green-600 text-white rounded"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      {locations.length === 0 ? (
        <p>No locations found</p>
      ) : (
        locations.map((l) => (
          <div
            key={l.location_id || l.id}
            className="bg-white/10 p-3 rounded"
          >
            <p className="font-semibold">{l.name}</p>
            <p className="text-sm text-gray-300">{l.type}</p>
            <p className="text-xs text-gray-400">{l.address}</p>
          </div>
        ))
      )}
    </div>
  );
}