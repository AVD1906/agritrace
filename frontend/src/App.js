import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import TracePage from "./pages/TracePage";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Batches from "./pages/Batches";
import Logs from "./pages/Logs";
import Locations from "./pages/Locations";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Notifications from "./pages/Notifications"; 
import Certificates from "./pages/Certificates";

function App() {
  return (
    <Router>
      <Routes>

        {/* DEFAULT */}
        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* MAIN APP */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/batches" element={<Layout><Batches /></Layout>} />
        <Route path="/logs" element={<Layout><Logs /></Layout>} />
        <Route path="/locations" element={<Layout><Locations /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/audit-logs" element={<Layout><Audit /></Layout>} />
        <Route path="/trace/:batchId" element={<TracePage />} />
        <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
        <Route path="/certificates" element={<Layout><Certificates /></Layout>} />

      </Routes>
    </Router>
  );
}

export default App;