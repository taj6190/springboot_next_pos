"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineCheck, HiOutlineX, HiOutlineSearch, HiOutlineEye } from "react-icons/hi";

const statusColors = { PENDING: "#f59e0b", APPROVED: "#3b82f6", REJECTED: "#ef4444", REFUNDED: "#22c55e" };

export default function ReturnsPage() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(0);
  const [tp, setTp] = useState(0);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ orderId: "", reason: "", refundMethod: "CASH", items: [{ productId: "", quantity: 1, reason: "", restock: true }] });
  const [orders, setOrders] = useState([]);

  useEffect(() => { load(); loadOrders(); }, [page]);
  useEffect(() => { const t = setTimeout(() => { setPage(0); load(); }, 300); return () => clearTimeout(t); }, [search]);

  const load = async () => {
    const r = await api.get(`/returns?page=${page}&size=15${search ? `&search=${search}` : ""}`);
    setList(r.data.data.content); setTp(r.data.data.totalPages);
  };
  const loadOrders = async () => { try { const r = await api.get("/orders?size=50"); setOrders(r.data.data.content || []); } catch {} };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: "", quantity: 1, reason: "", restock: true }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, val) => { const items = [...form.items]; items[i] = { ...items[i], [field]: val }; setForm({ ...form, items }); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, orderId: Number(form.orderId), items: form.items.map(i => ({ ...i, productId: Number(i.productId), quantity: Number(i.quantity) })) };
      await api.post("/returns", body);
      toast.success("Return created"); setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const approve = async (id) => { await api.post(`/returns/${id}/approve`); toast.success("Approved & refunded"); load(); };
  const reject = async (id) => { const reason = prompt("Rejection reason:"); if (reason !== null) { await api.post(`/returns/${id}/reject`, { reason }); toast.success("Rejected"); load(); } };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>🔄 Returns & Refunds</h1>
        <button className="btn btn-primary" onClick={() => { setForm({ orderId: "", reason: "", refundMethod: "CASH", items: [{ productId: "", quantity: 1, reason: "", restock: true }] }); setModal(true); }}><HiOutlinePlus size={18} /> New Return</button>
      </div>

      <div style={{ marginBottom: "1rem", position: "relative", maxWidth: 400 }}>
        <HiOutlineSearch size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
        <input className="input" placeholder="Search returns..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>Return #</th><th>Order</th><th>Status</th><th>Refund</th><th>Reason</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>{list.map(r => (
            <tr key={r.id}>
              <td style={{ fontWeight: 600, fontSize: "0.85rem" }}>{r.returnNumber}</td>
              <td><span className="badge badge-info">{r.orderNumber}</span></td>
              <td><span style={{ display: "inline-block", padding: "0.15rem 0.5rem", borderRadius: 6, fontSize: "0.7rem", fontWeight: 600, background: statusColors[r.status] + "22", color: statusColors[r.status] }}>{r.status}</span></td>
              <td style={{ fontWeight: 700 }}>৳{parseFloat(r.refundAmount || 0).toFixed(2)}</td>
              <td style={{ fontSize: "0.8rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason || "—"}</td>
              <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{r.createdAt?.slice(0,10)}</td>
              <td><div style={{ display: "flex", gap: "0.25rem" }}>
                {r.status === "PENDING" && <>
                  <button className="btn btn-success" style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }} onClick={() => approve(r.id)}><HiOutlineCheck size={14} /> Approve</button>
                  <button className="btn btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }} onClick={() => reject(r.id)}><HiOutlineX size={14} /></button>
                </>}
                <button className="btn btn-ghost" style={{ padding: "0.25rem 0.375rem" }} onClick={() => setDetail(r)}><HiOutlineEye size={14} /></button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {tp > 1 && <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
        <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
        <span style={{ padding: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{page + 1}/{tp}</span>
        <button className="btn btn-ghost" disabled={page >= tp - 1} onClick={() => setPage(page + 1)}>Next</button>
      </div>}

      {/* Create Return Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Return" width="560px">
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div><label className="form-label">Order *</label>
            <select className="input" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} required>
              <option value="">Select order...</option>
              {orders.map(o => <option key={o.id} value={o.id}>{o.orderNumber} — ৳{o.totalAmount?.toFixed(2)}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label className="form-label">Reason</label><input className="input" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Defective, wrong item, etc." /></div>
            <div><label className="form-label">Refund Method</label><select className="input" value={form.refundMethod} onChange={e => setForm({ ...form, refundMethod: e.target.value })}><option value="CASH">Cash</option><option value="ORIGINAL_METHOD">Original Method</option><option value="STORE_CREDIT">Store Credit</option></select></div>
          </div>
          <div><label className="form-label">Items to Return</label>
            {form.items.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr auto", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "end" }}>
                <div><label className="form-label" style={{ fontSize: "0.7rem" }}>Product ID</label><input className="input" type="number" value={item.productId} onChange={e => updateItem(i, "productId", e.target.value)} required placeholder="ID" /></div>
                <div><label className="form-label" style={{ fontSize: "0.7rem" }}>Qty</label><input className="input" type="number" min="1" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} /></div>
                <div><label className="form-label" style={{ fontSize: "0.7rem" }}>Reason</label><input className="input" value={item.reason} onChange={e => updateItem(i, "reason", e.target.value)} /></div>
                {form.items.length > 1 && <button type="button" className="btn btn-ghost" style={{ padding: "0.375rem", color: "var(--danger)" }} onClick={() => removeItem(i)}>✕</button>}
              </div>
            ))}
            <button type="button" className="btn btn-ghost" style={{ fontSize: "0.75rem" }} onClick={addItem}><HiOutlinePlus size={14} /> Add Item</button>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Create Return</button>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`Return ৳{detail?.returnNumber}`}>
        {detail && <div style={{ fontSize: "0.85rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
            <p><strong>Order:</strong> {detail.orderNumber}</p>
            <p><strong>Status:</strong> <span style={{ color: statusColors[detail.status] }}>{detail.status}</span></p>
            <p><strong>Refund:</strong> ৳{parseFloat(detail.refundAmount || 0).toFixed(2)}</p>
            <p><strong>Method:</strong> {detail.refundMethod || "—"}</p>
            <p><strong>Reason:</strong> {detail.reason || "—"}</p>
            <p><strong>Notes:</strong> {detail.notes || "—"}</p>
          </div>
          <h4 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Items</h4>
          <div className="table-container"><table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Restock</th></tr></thead>
            <tbody>{detail.items?.map((i, idx) => (
              <tr key={idx}><td>{i.productName}</td><td>{i.quantity}</td><td>৳{parseFloat(i.unitPrice).toFixed(2)}</td><td>{i.restock ? "✅" : "❌"}</td></tr>
            ))}</tbody></table></div>
        </div>}
      </Modal>
    </div>
  );
}
