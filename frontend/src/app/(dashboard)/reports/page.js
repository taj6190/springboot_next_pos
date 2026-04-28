"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { HiOutlineDocumentReport, HiOutlineDownload } from "react-icons/hi";

export default function ReportsPage() {
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0,10); });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0,10));
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [preset, setPreset] = useState("month");

  useEffect(() => { load(); }, [from, to]);

  const load = async () => {
    try {
      const [s, d] = await Promise.all([
        api.get(`/reports/summary?from=${from}&to=${to}`),
        api.get(`/reports/daily?from=${from}&to=${to}`),
      ]);
      setSummary(s.data.data);
      setDaily(d.data.data || []);
    } catch (e) { console.error(e); }
  };

  const setPresetRange = (p) => {
    setPreset(p);
    const now = new Date();
    const f = new Date();
    if (p === "today") { f.setDate(now.getDate()); }
    else if (p === "week") { f.setDate(now.getDate() - 7); }
    else if (p === "month") { f.setDate(now.getDate() - 30); }
    else if (p === "quarter") { f.setDate(now.getDate() - 90); }
    else if (p === "year") { f.setFullYear(now.getFullYear() - 1); }
    setFrom(f.toISOString().slice(0,10));
    setTo(now.toISOString().slice(0,10));
  };

  const exportCSV = () => {
    let csv = "Date,Revenue,Expenses,Profit\n";
    daily.forEach(d => { csv += `${d.date},${d.revenue},${d.expenses},${d.profit}\n`; });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `report_${from}_${to}.csv`; a.click();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>📊 Reports</h1>
        <button className="btn btn-ghost" onClick={exportCSV}><HiOutlineDownload size={16} /> Export CSV</button>
      </div>

      {/* Date Filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        {["today","week","month","quarter","year"].map(p => (
          <button key={p} className={`btn ৳{preset === p ? "btn-primary" : "btn-ghost"}`} style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem", textTransform: "capitalize" }} onClick={() => setPresetRange(p)}>{p}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input className="input" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPreset(""); }} style={{ width: "auto", fontSize: "0.8rem" }} />
          <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>to</span>
          <input className="input" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPreset(""); }} style={{ width: "auto", fontSize: "0.8rem" }} />
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Revenue", value: `৳${parseFloat(summary.revenue || 0).toFixed(2)}`, color: "#6366f1" },
            { label: "Expenses", value: `৳${parseFloat(summary.expenses || 0).toFixed(2)}`, color: "#ef4444" },
            { label: "Profit", value: `৳${parseFloat(summary.profit || 0).toFixed(2)}`, color: parseFloat(summary.profit || 0) >= 0 ? "#22c55e" : "#ef4444" },
            { label: "Avg Order Value", value: `৳${parseFloat(summary.avgOrderValue || 0).toFixed(2)}`, color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>{s.label}</p>
              <p style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{summary.orders} orders</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>Revenue vs Expenses</h3>
          <div style={{ height: 280 }}>
            {daily.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fill: "var(--text-secondary)", fontSize: 9 }} tickFormatter={v => v?.slice(5)} />
                  <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: "0.8rem" }} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[3,3,0,0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[3,3,0,0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>No data</div>}
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>Profit Trend</h3>
          <div style={{ height: 280 }}>
            {daily.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fill: "var(--text-secondary)", fontSize: 9 }} tickFormatter={v => v?.slice(5)} />
                  <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: "0.8rem" }} />
                  <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 3 }} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            ) : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>No data</div>}
          </div>
        </div>
      </div>

      {/* Daily Table */}
      {daily.length > 0 && (
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Revenue</th><th>Expenses</th><th>Profit</th></tr></thead>
            <tbody>{daily.map(d => (
              <tr key={d.date}>
                <td style={{ fontWeight: 500 }}>{d.date}</td>
                <td style={{ color: "#6366f1", fontWeight: 600 }}>৳{parseFloat(d.revenue).toFixed(2)}</td>
                <td style={{ color: "#ef4444", fontWeight: 600 }}>৳{parseFloat(d.expenses).toFixed(2)}</td>
                <td style={{ color: parseFloat(d.profit) >= 0 ? "#22c55e" : "#ef4444", fontWeight: 700 }}>৳{parseFloat(d.profit).toFixed(2)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
