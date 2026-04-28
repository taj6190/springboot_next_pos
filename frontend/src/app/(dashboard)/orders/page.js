"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { HiOutlineSearch, HiOutlineEye } from "react-icons/hi";
import Modal from "@/components/Modal";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sel, setSel] = useState(null);

  useEffect(() => { fetch(); }, [page]);
  useEffect(() => { const t = setTimeout(() => { setPage(0); fetch(); }, 300); return () => clearTimeout(t); }, [search]);

  const fetch = async () => {
    const r = await api.get(`/orders?page=${page}&size=15${search ? `&search=${search}` : ""}`);
    setOrders(r.data.data.content); setTotalPages(r.data.data.totalPages);
  };

  const view = async (id) => { const r = await api.get(`/orders/${id}`); setSel(r.data.data); };
  const sc = (s) => s === "COMPLETED" ? "badge-success" : s === "RETURNED" ? "badge-danger" : "badge-warning";

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.5rem" }}>Orders</h1>
      <div style={{ marginBottom: "1rem", position: "relative", maxWidth: 400 }}>
        <HiOutlineSearch size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
        <input className="input" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody>{orders.map((o) => (
            <tr key={o.id}>
              <td style={{ fontWeight: 600, color: "var(--accent)" }}>{o.orderNumber}</td>
              <td>{o.customer?.name || "Walk-in"}</td>
              <td style={{ fontWeight: 700 }}>৳{o.totalAmount?.toFixed(2)}</td>
              <td><span className="badge badge-info">{o.paymentMethod}</span></td>
              <td><span className={`badge ৳{sc(o.status)}`}>{o.status}</span></td>
              <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td><button className="btn btn-ghost" style={{ padding: "0.375rem" }} onClick={() => view(o.id)}><HiOutlineEye size={16} /></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {totalPages > 1 && <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
        <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
        <span style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{page + 1}/{totalPages}</span>
        <button className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
      </div>}
      <Modal isOpen={!!sel} onClose={() => setSel(null)} title={`Order ৳{sel?.orderNumber}`} width="640px">
        {sel && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
            <div><span style={{ color: "var(--text-secondary)" }}>Customer: </span>{sel.customer?.name || "Walk-in"}</div>
            <div><span style={{ color: "var(--text-secondary)" }}>Cashier: </span>{sel.cashierName}</div>
            <div><span style={{ color: "var(--text-secondary)" }}>Payment: </span>{sel.paymentMethod}</div>
            <div><span style={{ color: "var(--text-secondary)" }}>Status: </span><span className={`badge ৳{sc(sel.status)}`}>{sel.status}</span></div>
          </div>
          <div className="table-container"><table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>{sel.items?.map((i) => <tr key={i.id}><td>{i.productName}</td><td>{i.quantity}</td><td>৳{i.unitPrice?.toFixed(2)}</td><td style={{ fontWeight: 600 }}>৳{i.totalPrice?.toFixed(2)}</td></tr>)}</tbody>
          </table></div>
          <div style={{ textAlign: "right", marginTop: "1rem", fontSize: "1.1rem", fontWeight: 800, color: "var(--accent)" }}>Total: ৳{sel.totalAmount?.toFixed(2)}</div>
        </div>}
      </Modal>
    </div>
  );
}
