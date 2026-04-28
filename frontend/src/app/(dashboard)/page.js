"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import { HiOutlineShoppingCart, HiOutlineCube, HiOutlineExclamation, HiOutlineUserGroup, HiOutlineCash, HiOutlineTrendingUp, HiOutlineTrendingDown } from "react-icons/hi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [salesChart, setSalesChart] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, topRes, chartRes, lowRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/top-products?limit=5"),
        api.get("/dashboard/sales-chart?days=14"),
        api.get("/products/low-stock"),
      ]);
      setStats(statsRes.data.data);
      setTopProducts(topRes.data.data || []);
      setSalesChart(chartRes.data.data || []);
      setLowStock(lowRes.data.data || []);
    } catch (err) { console.error("Dashboard error:", err); }
  };

  const statCards = stats ? [
    { label: "Today Revenue", value: `৳${(stats.todayRevenue || 0).toFixed(2)}`, icon: HiOutlineCash, color: "#6366f1" },
    { label: "This Month", value: `৳${(stats.monthRevenue || 0).toFixed(2)}`, icon: HiOutlineCash, color: "#a855f7" },
    { label: "Total Orders", value: stats.totalOrders, icon: HiOutlineShoppingCart, color: "#22c55e" },
    { label: "Products", value: stats.totalProducts, icon: HiOutlineCube, color: "#3b82f6" },
    { label: "Low Stock", value: stats.lowStockProducts, icon: HiOutlineExclamation, color: stats.lowStockProducts > 0 ? "#ef4444" : "#22c55e" },
    { label: "Customers", value: stats.totalCustomers, icon: HiOutlineUserGroup, color: "#f59e0b" },
    { label: "Month Expenses", value: `৳${(stats.monthExpenses || 0).toFixed(2)}`, icon: HiOutlineCash, color: "#ef4444" },
    { label: "Month Profit", value: `৳${(stats.monthProfit || 0).toFixed(2)}`, icon: (stats.monthProfit || 0) >= 0 ? HiOutlineTrendingUp : HiOutlineTrendingDown, color: (stats.monthProfit || 0) >= 0 ? "#22c55e" : "#ef4444" },
    { label: "Total Revenue", value: `৳${(stats.totalRevenue || 0).toFixed(2)}`, icon: HiOutlineCash, color: "#ec4899" },
    { label: "Total Expenses", value: `৳${(stats.totalExpenses || 0).toFixed(2)}`, icon: HiOutlineCash, color: "#f97316" },
  ] : [];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Welcome back, {user?.fullName}</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 500, marginBottom: "0.25rem" }}>{s.label}</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.value}</p>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        {/* Sales Chart */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>Sales (Last 14 Days)</h3>
          <div style={{ height: 250 }}>
            {salesChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fill: "var(--text-secondary)", fontSize: 10 }} tickFormatter={(v) => v?.slice(5)} />
                  <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>No sales data yet</div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>Top Products</h3>
          {topProducts.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {topProducts.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", borderRadius: 8, background: "var(--bg-primary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700 }}>{i + 1}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>{p.productName}</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{p.totalQuantity} sold</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>No data yet</div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="card" style={{ padding: "1.25rem", borderColor: "rgba(239, 68, 68, 0.3)" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", color: "#ef4444" }}>⚠️ Low Stock Alerts ({lowStock.length})</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem" }}>
            {lowStock.slice(0, 8).map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", borderRadius: 8, background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>{p.name}</span>
                <span className="badge badge-danger" style={{ fontSize: "0.7rem" }}>{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
