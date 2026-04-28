import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API = "http://localhost:5000/api";

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();

  // 🔥 TOKEN
  const token = localStorage.getItem("token");

  let role = "User";
  let email = "";

  if (token) {
    try {
      const decoded = jwtDecode(token);

      // ✅ FULL CORRECT ROLE MAP
      const roleMap = {
        1: "Admin",
        2: "Farmer",
        3: "Processor",
        4: "Distributor",
        5: "Retailer",
      };

      role = roleMap[decoded.role_id] || "User";
      email = decoded.email || "";

    } catch (err) {
      console.error("Token decode error:", err);
    }
  }

  // 🔔 FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Notification error:", err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Products", path: "/products" },
    { name: "Batches", path: "/batches" },
    { name: "Logs", path: "/logs" },
    { name: "Locations", path: "/locations" },
    { name: "Reports", path: "/reports" },
    { name: "Audit Logs", path: "/audit-logs" },
    { name: "Notifications", path: "/notifications" },
    { name: "Certificates", path: "/certificates" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0b1f3a] via-[#1f4d3d] to-[#022c22] text-white">

      {/* SIDEBAR */}
      <div className="w-64 p-5 bg-[#020617]/70 backdrop-blur-xl border-r border-white/10 shadow-xl">

        <h1 className="text-2xl font-bold text-green-400 mb-8">
          AgriTrace
        </h1>

        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                    : "hover:bg-white/10"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="mt-10 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
          <p className="text-sm text-gray-300">Signed in as</p>

          <p className="text-green-400 font-semibold">
            {role}
          </p>

          {email && (
            <p className="text-xs text-gray-400 mt-1">
              {email}
            </p>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 relative">

        {/* 🔔 NOTIFICATION */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={() => {
              setOpen(!open);
              fetchNotifications();
            }}
            className="bg-white/10 backdrop-blur-md p-2 rounded-full hover:bg-white/20 transition"
          >
            🔔
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-72 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-lg">

              {notifications.length === 0 ? (
                <p className="text-gray-300 text-sm">No notifications</p>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.notification_id}
                    className="p-2 hover:bg-white/20 rounded"
                  >
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}

              <Link
                to="/notifications"
                className="block text-center text-green-400 text-sm mt-2 hover:underline"
              >
                View all
              </Link>

            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}