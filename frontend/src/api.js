const API = "http://localhost:5000/api";

// 🔥 Helper to get token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ================= PRODUCTS =================
export const getProducts = async () => {
  const res = await fetch(`${API}/products`, {
    headers: getAuthHeaders(),
  });

  return res.json();
};

export const createProduct = async (data) => {
  const res = await fetch(`${API}/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return res.json(); // 🔥 IMPORTANT
};

// ================= LOCATIONS =================
export const getLocations = async () => {
  const res = await fetch(`${API}/locations`, {
    headers: getAuthHeaders(),
  });

  return res.json();
};

export const createLocation = async (data) => {
  const res = await fetch(`${API}/locations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return res.json();
};

// ================= BATCHES =================
export const createBatch = async (data) => {
  const res = await fetch(`${API}/batches`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return res.json();
};

// ================= LOGS =================
export const getLogs = async () => {
  const res = await fetch(`${API}/logs`, {
    headers: getAuthHeaders(),
  });

  return res.json();
};

// ================= REPORTS =================
export const getReports = async () => {
  const res = await fetch(`${API}/reports`, {
    headers: getAuthHeaders(),
  });

  return res.json();
};