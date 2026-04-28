"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from "react-icons/hi";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => { const r = await api.get("/brands"); setBrands(r.data.data || []); };

  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  const save = async (e) => {
    e.preventDefault();
    try {
      if (edit) { await api.put(`/brands/${edit.id}`, form); toast.success("Brand updated"); }
      else { await api.post("/brands", form); toast.success("Brand created"); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const del = async (id) => {
    if (!confirm("Deactivate this brand?")) return;
    await api.delete(`/brands/${id}`); toast.success("Brand deactivated"); load();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Brands</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{brands.length} brands registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setForm({ name: "", description: "" }); setModal(true); }}><HiOutlinePlus size={18} /> Add Brand</button>
      </div>

      <div style={{ marginBottom: "1rem", position: "relative", maxWidth: 400 }}>
        <HiOutlineSearch size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
        <input className="input" placeholder="Search brands..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
        {filtered.map((b) => (
          <div key={b.id} className="card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: "1rem" }}>{b.name}</p>
              {b.description && <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>{b.description}</p>}
            </div>
            <div style={{ display: "flex", gap: "0.375rem" }}>
              <button className="btn btn-ghost" style={{ padding: "0.375rem" }} onClick={() => { setEdit(b); setForm({ name: b.name, description: b.description || "" }); setModal(true); }}><HiOutlinePencil size={16} /></button>
              <button className="btn btn-ghost" style={{ padding: "0.375rem", color: "var(--danger)" }} onClick={() => del(b.id)}><HiOutlineTrash size={16} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ color: "var(--text-secondary)", gridColumn: "1/-1", textAlign: "center", padding: "2rem" }}>No brands found. Create one to get started.</p>}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={edit ? "Edit Brand" : "Add Brand"}>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div><label className="form-label">Brand Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Nestle, Unilever, Samsung" /></div>
          <div><label className="form-label">Description</label><textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" /></div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>{edit ? "Update" : "Create"} Brand</button>
        </form>
      </Modal>
    </div>
  );
}
