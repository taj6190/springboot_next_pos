"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [tree, setTree] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", parentId: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [all, treeRes] = await Promise.all([api.get("/categories"), api.get("/categories/tree")]);
    setCategories(all.data.data); setTree(treeRes.data.data);
  };

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", parentId: "" }); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || "", parentId: c.parentId || "" }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { ...form, parentId: form.parentId ? Number(form.parentId) : null };
    try {
      if (editing) { await api.put(`/categories/${editing.id}`, body); toast.success("Updated"); }
      else { await api.post("/categories", body); toast.success("Created"); }
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try { await api.delete(`/categories/${id}`); toast.success("Deleted"); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const renderCategory = (cat, depth = 0) => (
    <div key={cat.id}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", paddingLeft: `${1 + depth * 1.5}rem`, borderBottom: "1px solid rgba(51,65,85,0.3)", transition: "background 0.15s" }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(51,65,85,0.2)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {depth > 0 && <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>└─</span>}
          <span style={{ fontWeight: depth === 0 ? 700 : 500, fontSize: "0.9rem" }}>{cat.name}</span>
          {cat.description && <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>— {cat.description}</span>}
        </div>
        <div style={{ display: "flex", gap: "0.375rem" }}>
          <button className="btn btn-ghost" style={{ padding: "0.375rem" }} onClick={() => openEdit(cat)}><HiOutlinePencil size={16} /></button>
          <button className="btn btn-ghost" style={{ padding: "0.375rem", color: "var(--danger)" }} onClick={() => handleDelete(cat.id)}><HiOutlineTrash size={16} /></button>
        </div>
      </div>
      {cat.children?.map((child) => renderCategory(child, depth + 1))}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Categories</h1>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus size={18} /> Add Category</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {tree.length > 0 ? tree.map((cat) => renderCategory(cat)) : (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>No categories yet</div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Parent Category</label><select className="input" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}><option value="">None (Root)</option>{categories.filter(c => !editing || c.id !== editing.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Description</label><textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>{editing ? "Update" : "Create"} Category</button>
        </form>
      </Modal>
    </div>
  );
}
