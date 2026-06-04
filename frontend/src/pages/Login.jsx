import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data); // 🔍 debug

      //  IMPORTANT CHECK
      if (res.ok && data.token) {
        // STORE TOKEN
        localStorage.setItem("token", data.token);

        console.log("TOKEN STORED:", data.token);

        // optional: store user also
        localStorage.setItem("user", JSON.stringify(data.user || {}));

        // redirect
        navigate("/dashboard");
      } else {
        alert(data.message || "Login failed");
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef')"
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 flex w-full max-w-6xl items-center justify-between">

        {/* LEFT */}
        <div className="hidden md:block w-1/2 text-white pr-10">
          <h1 className="text-4xl font-semibold mb-6">AgriTrace</h1>

          <h2 className="text-3xl font-bold mb-4">
            Welcome back to AgriTrace.
          </h2>

          <p className="text-gray-300">
            Continue managing your supply chain with full transparency.
          </p>
        </div>

        {/* RIGHT CARD */}
        <div className="w-full md:w-[420px]">

          <div className="backdrop-blur-xl bg-emerald-900/30 border border-white/20 rounded-2xl shadow-xl p-6">

            {/* TOGGLE */}
            <div className="flex mb-6 bg-white/10 rounded-lg p-1">

              <div className="flex-1 text-center py-2 bg-emerald-700 text-white rounded-md text-sm">
                Login
              </div>

              <div
                onClick={() => navigate("/register")}
                className="flex-1 text-center py-2 text-white/40 cursor-pointer hover:text-white/70"
              >
                Register
              </div>

            </div>

            {/* FORM */}
            <div className="space-y-4">

              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg 
                bg-white/10 text-white placeholder-gray-300
                border border-white/20
                focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg 
                bg-white/10 text-white placeholder-gray-300
                border border-white/20
                focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg shadow-lg"
              >
                {loading ? "Logging in..." : "Continue →"}
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}