import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";

export default function Layout({ children }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let role = "User";
  let email = "";
  let name = "";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      const roleMap = {
        1: "Admin",
        2: "Farmer",
        3: "Processor",
        4: "Distributor",
        5: "Retailer",
      };
      role = roleMap[decoded.role_id] || "User";
      email = decoded.email || "";
      name = decoded.name || email.split("@")[0] || "User";
    } catch (err) {
      console.error("Token decode error:", err);
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.length;

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "⊞" },
    { name: "Products", path: "/products", icon: "📦" },
    { name: "Batches", path: "/batches", icon: "🗂" },
    { name: "Logs", path: "/logs", icon: "📋" },
    { name: "Locations", path: "/locations", icon: "📍" },
    { name: "Certificates", path: "/certificates", icon: "🏅" },
  ];

  const adminItems = [
    { name: "Reports", path: "/reports", icon: "📊" },
    { name: "Audit Logs", path: "/audit-logs", icon: "🔍" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={s.shell}>
      {/* ===== SIDEBAR ===== */}
      <aside style={s.sidebar}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <span style={s.logoIcon}>🌿</span>
          <span style={s.logoText}>AgriTrace</span>
        </div>

        {/* Role badge */}
        <div style={s.roleBadge}>
          <span style={s.roleAvatar}>{name[0]?.toUpperCase()}</span>
          <div>
            <div style={s.roleName}>{name}</div>
            <div style={s.roleTag}>{role}</div>
          </div>
        </div>

        <div style={s.divider} />

        {/* Main nav */}
        <div style={s.navSection}>
          <div style={s.navLabel}>Menu</div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  ...s.navItem,
                  ...(isActive ? s.navItemActive : {}),
                }}
              >
                <span style={s.navIcon}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin nav */}
        {role === "Admin" && (
          <div style={{ ...s.navSection, marginTop: 8 }}>
            <div style={s.navLabel}>Admin</div>
            {adminItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    ...s.navItem,
                    ...(isActive ? s.navItemActive : {}),
                  }}
                >
                  <span style={s.navIcon}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Logout */}
        <button onClick={handleLogout} style={s.logoutBtn}>
          <span>↩</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* ===== MAIN ===== */}
      <div style={s.main}>
        {/* Topbar */}
        <div style={s.topbar}>
          <div style={s.topbarLeft}>
            <div style={s.pageTitle}>
              {menuItems.concat(adminItems).find(
                (i) => i.path === location.pathname
              )?.name || "AgriTrace"}
            </div>
          </div>
          <div style={s.topbarRight}>
            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  fetchNotifications();
                }}
                style={s.iconBtn}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={s.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div style={s.notifDropdown}>
                  <div style={s.notifHeader}>Notifications</div>
                  {notifications.length === 0 ? (
                    <div style={s.notifEmpty}>No notifications</div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div key={n.notification_id} style={s.notifItem}>
                        <div style={s.notifMsg}>{n.message}</div>
                        <div style={s.notifTime}>
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                  <Link
                    to="/notifications"
                    style={s.notifViewAll}
                    onClick={() => setNotifOpen(false)}
                  >
                    View all →
                  </Link>
                </div>
              )}
            </div>

            {/* Role pill */}
            <div style={s.topRolePill}>{role}</div>
          </div>
        </div>

        {/* Page content */}
        <div style={s.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

const s = {
  shell: {
    display: "flex",
    minHeight: "100vh",
    background: "#0f1117",
    fontFamily: "'Inter', sans-serif",
  },
  sidebar: {
    width: 220,
    minHeight: "100vh",
    background: "#0d1321",
    borderRight: "1px solid #1f2937",
    display: "flex",
    flexDirection: "column",
    padding: "20px 12px",
    flexShrink: 0,
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    paddingLeft: 4,
  },
  logoIcon: { fontSize: 20 },
  logoText: {
    fontSize: 17,
    fontWeight: 700,
    color: "#f9fafb",
    letterSpacing: "-0.3px",
  },
  roleBadge: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#161b22",
    border: "1px solid #1f2937",
    borderRadius: 10,
    padding: "10px 12px",
    marginBottom: 16,
  },
  roleAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#16a34a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  roleName: { fontSize: 13, fontWeight: 600, color: "#f9fafb" },
  roleTag: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  divider: {
    height: 1,
    background: "#1f2937",
    margin: "4px 0 12px",
  },
  navSection: { display: "flex", flexDirection: "column", gap: 2 },
  navLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#374151",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "4px 8px 6px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 8,
    color: "#6b7280",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.15s",
  },
  navItemActive: {
    background: "#14532d",
    color: "#86efac",
  },
  navIcon: { fontSize: 14, width: 18, textAlign: "center" },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 8,
    color: "#4b5563",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    marginTop: 8,
    width: "100%",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  topbar: {
    height: 56,
    background: "#0d1117",
    borderBottom: "1px solid #1f2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    flexShrink: 0,
  },
  topbarLeft: {},
  pageTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#f9fafb",
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    position: "relative",
    background: "#161b22",
    border: "1px solid #1f2937",
    borderRadius: 8,
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 16,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    background: "#dc2626",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 10,
    padding: "1px 5px",
    minWidth: 16,
    textAlign: "center",
  },
  notifDropdown: {
    position: "absolute",
    right: 0,
    top: 44,
    width: 280,
    background: "#161b22",
    border: "1px solid #1f2937",
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    zIndex: 100,
    overflow: "hidden",
  },
  notifHeader: {
    fontSize: 13,
    fontWeight: 600,
    color: "#f9fafb",
    padding: "12px 16px 8px",
    borderBottom: "1px solid #1f2937",
  },
  notifEmpty: {
    fontSize: 13,
    color: "#4b5563",
    padding: "16px",
    textAlign: "center",
  },
  notifItem: {
    padding: "10px 16px",
    borderBottom: "1px solid #1f2937",
  },
  notifMsg: { fontSize: 13, color: "#d1d5db" },
  notifTime: { fontSize: 11, color: "#4b5563", marginTop: 2 },
  notifViewAll: {
    display: "block",
    textAlign: "center",
    fontSize: 12,
    color: "#16a34a",
    textDecoration: "none",
    padding: "10px",
    fontWeight: 500,
  },
  topRolePill: {
    fontSize: 12,
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: 20,
    background: "#14532d",
    color: "#86efac",
  },
  content: {
    flex: 1,
    padding: "24px",
    background: "#0f1117",
    overflowY: "auto",
  },
};