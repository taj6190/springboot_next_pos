"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from "react-icons/hi";

export default function SuppliersPage() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [tp, setTp] = useState(0);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [f, setF] = useState({ name: "", email: "", phone: "", company: "", contactPerson: "", address: "", notes: "" });

  useEffect(() => { load(); }, [page]);
  useEffect(() => { const t = setTimeout(() => { setPage(0); load(); }, 300); return () => clearTimeout(t); }, [search]);

  const load = async () => {
    const r = await api.get(`/suppliers?page=${page}&size=15${search ? `&search=${search}` : ""}`);
    setList(r.data.data.content); setTp(r.data.data.totalPages);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (edit) { await api.put(`/suppliers/${edit.id}`, f); toast.success("Updated"); }
      else { await api.post("/suppliers", f); toast.success("Created"); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const del = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/suppliers/${id}`); toast.success("Deleted"); load(); };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Suppliers</h1>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setF({ name: "", email: "", phone: "", company: "", contactPerson: "", address: "", notes: "" }); setModal(true); }}><HiOutlinePlus size={18} /> Add Supplier</button>
      </div>
      <div style={{ marginBottom: "1rem", position: "relative", maxWidth: 400 }}>
        <HiOutlineSearch size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
        <input className="input" placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Name</th><th>Company</th><th>Contact</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
          <tbody>{list.map((s) => (
            <tr key={s.id}>
              <td style={{ fontWeight: 600 }}>{s.name}</td>
              <td>{s.company || "—"}</td>
              <td>{s.contactPerson || "—"}</td>
              <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{s.email || "—"}</td>
              <td>{s.phone || "—"}</td>
              <td><div style={{ display: "flex", gap: "0.375rem" }}>
                <button className="btn btn-ghost" style={{ padding: "0.375rem" }} onClick={() => { setEdit(s); setF({ name: s.name, email: s.email || "", phone: s.phone || "", company: s.company || "", contactPerson: s.contactPerson || "", address: s.address || "", notes: s.notes || "" }); setModal(true); }}><HiOutlinePencil size={16} /></button>
                <button className="btn btn-ghost" style={{ padding: "0.375rem", color: "var(--danger)" }} onClick={() => del(s.id)}><HiOutlineTrash size={16} /></button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={edit ? "Edit Supplier" : "Add Supplier"}>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Name *</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Company</label><input className="input" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} /></div>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Contact Person</label><input className="input" value={f.contactPerson} onChange={(e) => setF({ ...f, contactPerson: e.target.value })} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Email</label><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Phone</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>{edit ? "Update" : "Create"}</button>
        </form>
      </Modal>
    </div>
  );
}
