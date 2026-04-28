"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineBan } from "react-icons/hi";

export default function UsersPage() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(0);
  const [tp, setTp] = useState(0);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [f, setF] = useState({ username: "", email: "", password: "", fullName: "", phone: "", role: "CASHIER" });

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    const r = await api.get(`/users?page=${page}&size=15`);
    setList(r.data.data.content); setTp(r.data.data.totalPages);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (edit) { await api.put(`/users/${edit.id}`, f); toast.success("Updated"); }
      else { await api.post("/users", f); toast.success("Created"); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const toggle = async (id) => {
    try { await api.patch(`/users/${id}/toggle-status`); toast.success("Toggled"); load(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>User Management</h1>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setF({ username: "", email: "", password: "", fullName: "", phone: "", role: "CASHIER" }); setModal(true); }}><HiOutlinePlus size={18} /> Add User</button>
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>{list.map((u) => (
            <tr key={u.id}>
              <td><div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>{u.fullName?.charAt(0)}</div>
                <div><p style={{ fontWeight: 600, fontSize: "0.85rem" }}>{u.fullName}</p><p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>@{u.username}</p></div>
              </div></td>
              <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{u.email}</td>
              <td><span className={`badge ৳{u.role === "ADMIN" ? "badge-danger" : u.role === "MANAGER" ? "badge-warning" : "badge-info"}`}>{u.role}</span></td>
              <td><span className={`badge ৳{u.active ? "badge-success" : "badge-danger"}`}>{u.active ? "Active" : "Inactive"}</span></td>
              <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td><div style={{ display: "flex", gap: "0.375rem" }}>
                <button className="btn btn-ghost" style={{ padding: "0.375rem" }} onClick={() => { setEdit(u); setF({ username: u.username, email: u.email, password: "", fullName: u.fullName, phone: u.phone || "", role: u.role }); setModal(true); }}><HiOutlinePencil size={16} /></button>
                <button className="btn btn-ghost" style={{ padding: "0.375rem", color: u.active ? "var(--danger)" : "var(--success)" }} onClick={() => toggle(u.id)}><HiOutlineBan size={16} /></button>
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
      <Modal isOpen={modal} onClose={() => setModal(false)} title={edit ? "Edit User" : "Add User"}>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Username *</label><input className="input" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required /></div>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Full Name *</label><input className="input" value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} required /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Email *</label><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>{edit ? "Password (leave blank)" : "Password *"}</label><input className="input" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} {...(!edit && { required: true })} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Phone</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
            <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Role *</label><select className="input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="CASHIER">Cashier</option><option value="MANAGER">Manager</option><option value="ADMIN">Admin</option></select></div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>{edit ? "Update" : "Create"} User</button>
        </form>
      </Modal>
    </div>
  );
}
