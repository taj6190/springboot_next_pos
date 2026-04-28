"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from "react-icons/hi";

export default function CustomersPage() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [tp, setTp] = useState(0);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [f, setF] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => { load(); }, [page]);
  useEffect(() => { const t = setTimeout(() => { setPage(0); load(); }, 300); return () => clearTimeout(t); }, [search]);

  const load = async () => {
    const r = await api.get(`/customers?page=${page}&size=15${search ? `&search=${search}` : ""}`);
    setList(r.data.data.content); setTp(r.data.data.totalPages);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (edit) { await api.put(`/customers/${edit.id}`, f); toast.success("Updated"); }
      else { await api.post("/customers", f); toast.success("Created"); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const del = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/customers/${id}`); toast.success("Deleted"); load(); };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Customers</h1>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setF({ name: "", email: "", phone: "", address: "" }); setModal(true); }}><HiOutlinePlus size={18} /> Add Customer</button>
      </div>
      <div style={{ marginBottom: "1rem", position: "relative", maxWidth: 400 }}>
        <HiOutlineSearch size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
        <input className="input" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Loyalty</th><th>Total Spent</th><th>Actions</th></tr></thead>
          <tbody>{list.map((c) => (
            <tr key={c.id}>
              <td style={{ fontWeight: 600 }}>{c.name}</td>
              <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{c.email || "—"}</td>
              <td>{c.phone || "—"}</td>
              <td><span className="badge badge-info">{c.loyaltyPoints} pts</span></td>
              <td style={{ fontWeight: 600, color: "var(--accent)" }}>৳{c.totalPurchases?.toFixed(2)}</td>
              <td><div style={{ display: "flex", gap: "0.375rem" }}>
                <button className="btn btn-ghost" style={{ padding: "0.375rem" }} onClick={() => { setEdit(c); setF({ name: c.name, email: c.email || "", phone: c.phone || "", address: c.address || "" }); setModal(true); }}><HiOutlinePencil size={16} /></button>
                <button className="btn btn-ghost" style={{ padding: "0.375rem", color: "var(--danger)" }} onClick={() => del(c.id)}><HiOutlineTrash size={16} /></button>
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
      <Modal isOpen={modal} onClose={() => setModal(false)} title={edit ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Name *</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Email</label><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Phone</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          </div>
          <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Address</label><input className="input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>{edit ? "Update" : "Create"}</button>
        </form>
      </Modal>
    </div>
  );
}
