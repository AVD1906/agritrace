import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= REGISTER =================
  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.role) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registered successfully!");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399')"
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 flex w-full max-w-6xl items-center justify-between">

        {/* LEFT */}
        <div className="hidden md:block w-1/2 text-white pr-10">
          <h1 className="text-4xl font-semibold mb-6">AgriTrace</h1>

          <h2 className="text-3xl font-bold mb-4">
            Join the transparent food supply chain.
          </h2>

          <p className="text-gray-300 mb-6">
            Start tracking produce from farm to consumer in minutes.
          </p>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-[420px]">
          <div className="backdrop-blur-xl bg-emerald-900/30 border border-white/20 rounded-2xl shadow-xl p-6">

            {/* TOGGLE */}
            <div className="flex mb-6 bg-white/10 rounded-lg p-1">
              <div
                onClick={() => navigate("/login")}
                className="flex-1 text-center py-2 text-white/40 cursor-pointer hover:text-white/70"
              >
                Login
              </div>

              <div className="flex-1 text-center py-2 bg-emerald-700 text-white rounded-md text-sm">
                Register
              </div>
            </div>

            {/* FORM */}
            <div className="space-y-4">

              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20 outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20 outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20 outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* ROLE */}
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="" className="text-black">Select Role</option>
                <option value="farmer" className="text-black">Farmer</option>
                <option value="processor" className="text-black">Processor</option>
                <option value="distributor" className="text-black">Distributor</option>
                <option value="retailer" className="text-black">Retailer</option>
                <option value="admin" className="text-black">Admin</option>
              </select>

              {/* BUTTON */}
              <button
                onClick={handleRegister}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg shadow-lg"
              >
                Continue →
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}