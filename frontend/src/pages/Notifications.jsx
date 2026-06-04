import { useEffect, useState } from "react";

const API = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("NOTIFICATIONS:", data);

      setNotifications(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Notification error:", err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>

      <div className="bg-white/10 p-4 rounded">
        {notifications.length === 0 ? (
          <p className="text-gray-400">No notifications</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.notification_id}
                className="bg-white/10 border border-white/20 p-4 rounded-lg"
              >
                <p className="text-white">{n.message}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}