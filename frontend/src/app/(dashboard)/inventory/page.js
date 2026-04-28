"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function InventoryPage() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [tp, setTp] = useState(0);

  useEffect(() => { load(); }, [page]);
  const load = async () => {
    const r = await api.get(`/inventory/logs?page=${page}&size=20`);
    setLogs(r.data.data.content); setTp(r.data.data.totalPages);
  };

  const rc = (r) => {
    if (r === "SALE") return "badge-info";
    if (r === "RETURN") return "badge-warning";
    if (r === "PURCHASE_RECEIVED") return "badge-success";
    return "badge-danger";
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.5rem" }}>Inventory Logs</h1>
      <div className="table-container">
        <table>
          <thead><tr><th>Product</th><th>SKU</th><th>Change</th><th>Stock</th><th>Reason</th><th>By</th><th>Notes</th><th>Date</th></tr></thead>
          <tbody>{logs.map((l) => (
            <tr key={l.id}>
              <td style={{ fontWeight: 600 }}>{l.productName}</td>
              <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{l.productSku}</td>
              <td><span style={{ fontWeight: 700, color: l.quantityChange > 0 ? "var(--success)" : "var(--danger)" }}>{l.quantityChange > 0 ? "+" : ""}{l.quantityChange}</span></td>
              <td style={{ fontSize: "0.8rem" }}>{l.previousStock} → {l.newStock}</td>
              <td><span className={`badge ৳{rc(l.reason)}`}>{l.reason}</span></td>
              <td style={{ fontSize: "0.8rem" }}>{l.userName || "System"}</td>
              <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{l.notes || "—"}</td>
              <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{new Date(l.createdAt).toLocaleString()}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {tp > 1 && <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
        <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
        <span style={{ padding: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{page + 1}/{tp}</span>
        <button className="btn btn-ghost" disabled={page >= tp - 1} onClick={() => setPage(page + 1)}>Next</button>
      </div>}
    </div>
  );
}
