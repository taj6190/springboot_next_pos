"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineBan, HiOutlineSearch } from "react-icons/hi";

export default function CouponsPage() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [tp, setTp] = useState(0);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [f, setF] = useState({ code: "", description: "", discountType: "PERCENTAGE", discountValue: "", minPurchase: "", maxDiscount: "", usageLimit: "", startDate: "", endDate: "" });

  useEffect(() => { load(); }, [page]);
  useEffect(() => { const t = setTimeout(() => { setPage(0); load(); }, 300); return () => clearTimeout(t); }, [search]);

  const load = async () => {
    const r = await api.get(`/coupons?page=${page}&size=15${search ? `&search=${search}` : ""}`);
    setList(r.data.data.content); setTp(r.data.data.totalPages);
  };

  const save = async (e) => {
    e.preventDefault();
    const body = { ...f, discountValue: parseFloat(f.discountValue), minPurchase: f.minPurchase ? parseFloat(f.minPurchase) : null, maxDiscount: f.maxDiscount ? parseFloat(f.maxDiscount) : null, usageLimit: f.usageLimit ? parseInt(f.usageLimit) : null, startDate: f.startDate || null, endDate: f.endDate || null };
    try {
      if (edit) { await api.put(`/coupons/${edit.id}`, body); toast.success("Updated"); }
      else { await api.post("/coupons", body); toast.success("Created"); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const toggle = async (id) => { await api.patch(`/coupons/${id}/toggle`); toast.success("Toggled"); load(); };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Coupons & Discounts</h1>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setF({ code: "", description: "", discountType: "PERCENTAGE", discountValue: "", minPurchase: "", maxDiscount: "", usageLimit: "", startDate: "", endDate: "" }); setModal(true); }}><HiOutlinePlus size={18} /> Create Coupon</button>
      </div>
      <div style={{ marginBottom: "1rem", position: "relative", maxWidth: 400 }}>
        <HiOutlineSearch size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
        <input className="input" placeholder="Search coupons..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Code</th><th>Description</th><th>Type</th><th>Value</th><th>Min Purchase</th><th>Usage</th><th>Status</th><th>Valid</th><th>Actions</th></tr></thead>
          <tbody>{list.map((c) => (
            <tr key={c.id}>
              <td style={{ fontWeight: 700, color: "var(--accent)", letterSpacing: "0.05em" }}>{c.code}</td>
              <td style={{ fontSize: "0.85rem" }}>{c.description || "—"}</td>
              <td><span className="badge badge-info">{c.discountType === "PERCENTAGE" ? "%" : "৳"}</span></td>
              <td style={{ fontWeight: 600 }}>{c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `৳${c.discountValue?.toFixed(2)}`}</td>
              <td style={{ fontSize: "0.85rem" }}>{c.minPurchase ? `৳${c.minPurchase?.toFixed(2)}` : "None"}</td>
              <td style={{ fontSize: "0.85rem" }}>{c.usageCount}{c.usageLimit ? `/${c.usageLimit}` : "/∞"}</td>
              <td><span className={`badge ৳{c.active ? "badge-success" : "badge-danger"}`}>{c.active ? "Active" : "Inactive"}</span></td>
              <td><span className={`badge ৳{c.valid ? "badge-success" : "badge-danger"}`}>{c.valid ? "Valid" : "Expired"}</span></td>
              <td><div style={{ display: "flex", gap: "0.375rem" }}>
                <button className="btn btn-ghost" style={{ padding: "0.375rem" }} onClick={() => { setEdit(c); setF({ code: c.code, description: c.description || "", discountType: c.discountType, discountValue: c.discountValue, minPurchase: c.minPurchase || "", maxDiscount: c.maxDiscount || "", usageLimit: c.usageLimit || "", startDate: c.startDate ? c.startDate.slice(0, 16) : "", endDate: c.endDate ? c.endDate.slice(0, 16) : "" }); setModal(true); }}><HiOutlinePencil size={16} /></button>
                <button className="btn btn-ghost" style={{ padding: "0.375rem", color: c.active ? "var(--danger)" : "var(--success)" }} onClick={() => toggle(c.id)}><HiOutlineBan size={16} /></button>
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
      <Modal isOpen={modal} onClose={() => setModal(false)} title={edit ? "Edit Coupon" : "Create Coupon"}>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Code *</label><input className="input" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" required style={{ textTransform: "uppercase", letterSpacing: "0.1em" }} /></div>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Discount Type *</label><select className="input" value={f.discountType} onChange={(e) => setF({ ...f, discountType: e.target.value })}><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED_AMOUNT">Fixed Amount ($)</option></select></div>
          </div>
          <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Description</label><input className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="e.g. Summer sale 20% off" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Value *</label><input className="input" type="number" step="0.01" value={f.discountValue} onChange={(e) => setF({ ...f, discountValue: e.target.value })} required /></div>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Min Purchase</label><input className="input" type="number" step="0.01" value={f.minPurchase} onChange={(e) => setF({ ...f, minPurchase: e.target.value })} /></div>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Max Discount</label><input className="input" type="number" step="0.01" value={f.maxDiscount} onChange={(e) => setF({ ...f, maxDiscount: e.target.value })} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Usage Limit</label><input className="input" type="number" value={f.usageLimit} onChange={(e) => setF({ ...f, usageLimit: e.target.value })} placeholder="∞" /></div>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Start Date</label><input className="input" type="datetime-local" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></div>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>End Date</label><input className="input" type="datetime-local" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} /></div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>{edit ? "Update" : "Create"} Coupon</button>
        </form>
      </Modal>
    </div>
  );
}
