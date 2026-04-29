"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCalculator, HiOutlineX } from "react-icons/hi";

const TAX_TYPES = ["VAT", "SUPPLEMENTARY_DUTY", "CUSTOMS_DUTY", "OTHER"];

export default function TaxGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyTax = { name: "", type: "VAT", rate: "", description: "", isCompound: false, sortOrder: 0 };
  const emptyForm = { name: "", description: "", taxes: [{ ...emptyTax }] };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchGroups(); }, [page]);

  const fetchGroups = async () => {
    try {
      const res = await api.get(`/tax-groups?page=${page}&size=20`);
      setGroups(res.data.data.content); setTotalPages(res.data.data.totalPages);
    } catch (err) { toast.error("Failed to load tax groups"); }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (g) => {
    setEditing(g);
    setForm({
      name: g.name, description: g.description || "",
      taxes: g.taxes.length > 0 ? g.taxes.map(t => ({
        name: t.name, type: t.type, rate: t.rate, description: t.description || "",
        isCompound: t.isCompound || false, sortOrder: t.sortOrder || 0
      })) : [{ ...emptyTax }]
    });
    setModalOpen(true);
  };

  const addTaxEntry = () => {
    setForm({ ...form, taxes: [...form.taxes, { ...emptyTax, sortOrder: form.taxes.length }] });
  };
  const removeTaxEntry = (idx) => {
    if (form.taxes.length <= 1) return;
    setForm({ ...form, taxes: form.taxes.filter((_, i) => i !== idx) });
  };
  const updateTaxEntry = (idx, field, value) => {
    const taxes = [...form.taxes];
    taxes[idx] = { ...taxes[idx], [field]: value };
    setForm({ ...form, taxes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      name: form.name, description: form.description,
      taxes: form.taxes.map((t, i) => ({
        name: t.name, type: t.type, rate: parseFloat(t.rate),
        description: t.description, isCompound: t.isCompound, sortOrder: i
      }))
    };
    try {
      if (editing) { await api.put(`/tax-groups/${editing.id}`, body); toast.success("Tax group updated"); }
      else { await api.post("/tax-groups", body); toast.success("Tax group created"); }
      setModalOpen(false); fetchGroups();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this tax group?")) return;
    try { await api.delete(`/tax-groups/${id}`); toast.success("Tax group deactivated"); fetchGroups(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const formatType = (type) => type?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || type;

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Tax Groups</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Configure VAT, Supplementary Duty & customs rates</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus size={18} /> Add Tax Group</button>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1rem" }}>
        {groups.map((g) => (
          <div key={g.id} className="card animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 44, height: 44, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HiOutlineCalculator size={22} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{g.name}</h3>
                  {g.description && <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>{g.description}</p>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent)" }}>{g.totalRate}%</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>Total Rate</div>
              </div>
            </div>

            {/* Tax entries */}
            {g.taxes.length > 0 && (
              <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", padding: "0.75rem", marginBottom: "0.75rem" }}>
                {g.taxes.map((t, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.375rem 0", borderBottom: i < g.taxes.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "0.8rem" }}>{t.name}</span>
                      <span className={`badge ${t.type === "VAT" ? "badge-info" : t.type === "SUPPLEMENTARY_DUTY" ? "badge-warning" : "badge-success"}`} style={{ marginLeft: 8, fontSize: "0.6rem" }}>{formatType(t.type)}</span>
                      {t.isCompound && <span className="badge badge-warning" style={{ marginLeft: 4, fontSize: "0.6rem" }}>Compound</span>}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{t.rate}%</span>
                  </div>
                ))}
              </div>
            )}

            {g.taxes.length === 0 && (
              <div style={{ background: "var(--bg-primary)", padding: "1rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                No tax entries — exempt group
              </div>
            )}

            <div style={{ display: "flex", gap: "0.375rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
              <button className="btn btn-ghost" style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }} onClick={() => openEdit(g)}><HiOutlinePencil size={14} /> Edit</button>
              <button className="btn btn-ghost" style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", color: "var(--danger)" }} onClick={() => handleDelete(g.id)}><HiOutlineTrash size={14} /> Deactivate</button>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          <HiOutlineCalculator size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
          <p>No tax groups configured. Create one to enable tax calculations.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
          <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
          <span style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Tax Group" : "Add Tax Group"} width="620px">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div><label className="form-label">Group Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Cosmetics Tax (VAT + SD)" required /></div>
          <div><label className="form-label">Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <label className="form-label" style={{ margin: 0 }}>Tax Entries</label>
              <button type="button" className="btn btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }} onClick={addTaxEntry}><HiOutlinePlus size={14} /> Add Tax</button>
            </div>
            {form.taxes.map((t, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 28px", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "end" }}>
                <div><label className="form-label" style={{ fontSize: "0.65rem" }}>Name</label><input className="input" value={t.name} onChange={(e) => updateTaxEntry(idx, "name", e.target.value)} placeholder="VAT" required /></div>
                <div><label className="form-label" style={{ fontSize: "0.65rem" }}>Type</label>
                  <select className="input" value={t.type} onChange={(e) => updateTaxEntry(idx, "type", e.target.value)}>
                    {TAX_TYPES.map(type => <option key={type} value={type}>{formatType(type)}</option>)}
                  </select>
                </div>
                <div><label className="form-label" style={{ fontSize: "0.65rem" }}>Rate %</label><input className="input" type="number" step="0.01" value={t.rate} onChange={(e) => updateTaxEntry(idx, "rate", e.target.value)} required /></div>
                <button type="button" style={{ border: "none", background: "none", cursor: "pointer", color: "var(--danger)", padding: "0.5rem" }} onClick={() => removeTaxEntry(idx)} disabled={form.taxes.length <= 1}><HiOutlineX size={16} /></button>
                <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input type="checkbox" id={`compound-${idx}`} checked={t.isCompound} onChange={(e) => updateTaxEntry(idx, "isCompound", e.target.checked)} />
                  <label htmlFor={`compound-${idx}`} style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Compound (calculated on subtotal + previous taxes)</label>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>{editing ? "Update" : "Create"} Tax Group</button>
        </form>
      </Modal>
    </div>
  );
}
