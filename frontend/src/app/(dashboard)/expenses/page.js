"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineCash } from "react-icons/hi";

const CATEGORIES = ["RENT","UTILITIES","SALARY","SUPPLIES","MARKETING","MAINTENANCE","TRANSPORT","FOOD","INSURANCE","TAX","OTHER"];
const catColors = { RENT: "#ef4444", UTILITIES: "#f59e0b", SALARY: "#3b82f6", SUPPLIES: "#8b5cf6", MARKETING: "#ec4899", MAINTENANCE: "#6366f1", TRANSPORT: "#14b8a6", FOOD: "#22c55e", INSURANCE: "#06b6d4", TAX: "#f97316", OTHER: "#64748b" };

export default function ExpensesPage() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [tp, setTp] = useState(0);
  const [summary, setSummary] = useState({});
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [f, setF] = useState({ title: "", description: "", amount: "", category: "OTHER", expenseDate: new Date().toISOString().slice(0,10), vendor: "" });

  useEffect(() => { load(); loadSummary(); }, [page]);
  useEffect(() => { const t = setTimeout(() => { setPage(0); load(); }, 300); return () => clearTimeout(t); }, [search]);

  const load = async () => {
    const r = await api.get(`/expenses?page=${page}&size=15${search ? `&search=${search}` : ""}`);
    setList(r.data.data.content); setTp(r.data.data.totalPages);
  };
  const loadSummary = async () => { const r = await api.get("/expenses/summary"); setSummary(r.data.data); };

  const save = async (e) => {
    e.preventDefault();
    const body = { ...f, amount: parseFloat(f.amount) };
    try {
      if (edit) { await api.put(`/expenses/${edit.id}`, body); toast.success("Updated"); }
      else { await api.post("/expenses", body); toast.success("Expense added"); }
      setModal(false); load(); loadSummary();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const del = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/expenses/${id}`); toast.success("Deleted"); load(); loadSummary(); };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Expenses</h1>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setF({ title: "", description: "", amount: "", category: "OTHER", expenseDate: new Date().toISOString().slice(0,10), vendor: "" }); setModal(true); }}><HiOutlinePlus size={18} /> Add Expense</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Today", value: summary.todayExpenses, color: "#ef4444" },
          { label: "This Week", value: summary.weekExpenses, color: "#f59e0b" },
          { label: "This Month", value: summary.monthExpenses, color: "#3b82f6" },
          { label: "Total", value: summary.totalExpenses, color: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "1rem 1.25rem" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>{s.label}</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 800, color: s.color }}>৳{(s.value || 0).toFixed ? (s.value || 0).toFixed(2) : "0.00"}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "1rem", position: "relative", maxWidth: 400 }}>
        <HiOutlineSearch size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
        <input className="input" placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Vendor</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>{list.map((e) => (
            <tr key={e.id}>
              <td><div><p style={{ fontWeight: 600 }}>{e.title}</p>{e.description && <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{e.description}</p>}</div></td>
              <td><span style={{ display: "inline-block", padding: "0.15rem 0.5rem", borderRadius: 6, fontSize: "0.7rem", fontWeight: 600, background: catColors[e.category] + "22", color: catColors[e.category] }}>{e.category}</span></td>
              <td style={{ fontWeight: 700, color: "#ef4444" }}>৳{parseFloat(e.amount).toFixed(2)}</td>
              <td style={{ fontSize: "0.85rem" }}>{e.vendor || "—"}</td>
              <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{e.expenseDate}</td>
              <td><div style={{ display: "flex", gap: "0.375rem" }}>
                <button className="btn btn-ghost" style={{ padding: "0.375rem" }} onClick={() => { setEdit(e); setF({ title: e.title, description: e.description || "", amount: e.amount, category: e.category, expenseDate: e.expenseDate, vendor: e.vendor || "" }); setModal(true); }}><HiOutlinePencil size={16} /></button>
                <button className="btn btn-ghost" style={{ padding: "0.375rem", color: "var(--danger)" }} onClick={() => del(e.id)}><HiOutlineTrash size={16} /></button>
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

      <Modal isOpen={modal} onClose={() => setModal(false)} title={edit ? "Edit Expense" : "Add Expense"}>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div><label className="form-label">Title *</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required placeholder="e.g. Electricity Bill" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label className="form-label">Amount *</label><input className="input" type="number" step="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} required /></div>
            <div><label className="form-label">Category</label><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label className="form-label">Date</label><input className="input" type="date" value={f.expenseDate} onChange={(e) => setF({ ...f, expenseDate: e.target.value })} /></div>
            <div><label className="form-label">Vendor</label><input className="input" value={f.vendor} onChange={(e) => setF({ ...f, vendor: e.target.value })} placeholder="e.g. DESCO" /></div>
          </div>
          <div><label className="form-label">Description</label><textarea className="input" rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>{edit ? "Update" : "Add"} Expense</button>
        </form>
      </Modal>
    </div>
  );
}
