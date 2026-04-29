"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineOfficeBuilding, HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi";

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [users, setUsers] = useState([]);
  const emptyForm = { name: "", code: "", address: "", phone: "", email: "", managerId: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchStores(); fetchUsers(); }, [page]);
  useEffect(() => { const t = setTimeout(() => { setPage(0); fetchStores(); }, 300); return () => clearTimeout(t); }, [search]);

  const fetchStores = async () => {
    try {
      const res = await api.get(`/stores?page=${page}&size=15${search ? `&search=${search}` : ""}`);
      setStores(res.data.data.content); setTotalPages(res.data.data.totalPages);
    } catch (err) { toast.error("Failed to load stores"); }
  };

  const fetchUsers = async () => {
    try { const r = await api.get("/users"); setUsers(r.data.data?.content || r.data.data || []); } catch {}
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, code: s.code, address: s.address || "", phone: s.phone || "", email: s.email || "", managerId: s.managerId || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { ...form, managerId: form.managerId ? Number(form.managerId) : null };
    try {
      if (editing) { await api.put(`/stores/${editing.id}`, body); toast.success("Store updated"); }
      else { await api.post("/stores", body); toast.success("Store created"); }
      setModalOpen(false); fetchStores();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this store?")) return;
    try { await api.delete(`/stores/${id}`); toast.success("Store deactivated"); fetchStores(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Stores</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Manage your retail locations</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus size={18} /> Add Store</button>
      </div>

      <div style={{ marginBottom: "1rem", position: "relative", maxWidth: 400 }}>
        <HiOutlineSearch size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
        <input className="input" placeholder="Search stores..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
        {stores.map((s) => (
          <div key={s.id} className="card animate-fade-in" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 44, height: 44, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HiOutlineOfficeBuilding size={22} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{s.name}</h3>
                  <span className="badge badge-info" style={{ marginTop: 4 }}>{s.code}</span>
                </div>
              </div>
              <span className={`badge ${s.active ? "badge-success" : "badge-danger"}`}>{s.active ? "Active" : "Inactive"}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {s.address && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><HiOutlineLocationMarker size={14} /> {s.address}</div>}
              {s.phone && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><HiOutlinePhone size={14} /> {s.phone}</div>}
              {s.email && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><HiOutlineMail size={14} /> {s.email}</div>}
              {s.managerName && <div style={{ fontSize: "0.75rem" }}>Manager: <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.managerName}</span></div>}
            </div>

            <div style={{ display: "flex", gap: "0.375rem", marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
              <button className="btn btn-ghost" style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }} onClick={() => openEdit(s)}><HiOutlinePencil size={14} /> Edit</button>
              <button className="btn btn-ghost" style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", color: "var(--danger)" }} onClick={() => handleDelete(s.id)}><HiOutlineTrash size={14} /> Deactivate</button>
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          <HiOutlineOfficeBuilding size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
          <p>No stores found. Create your first store to get started.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
          <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
          <span style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Store" : "Add Store"} width="500px">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label className="form-label">Store Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="form-label">Code *</label><input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., DHAKA-01" required /></div>
          </div>
          <div><label className="form-label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label className="form-label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="form-label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div>
            <label className="form-label">Manager</label>
            <select className="input" value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })}>
              <option value="">None</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>{editing ? "Update" : "Create"} Store</button>
        </form>
      </Modal>
    </div>
  );
}
