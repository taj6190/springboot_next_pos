"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { HiOutlineCog, HiOutlineSave } from "react-icons/hi";

export default function SettingsPage() {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => { const r = await api.get("/settings"); setS(r.data.data); };

  const save = async () => {
    setSaving(true);
    try { await api.put("/settings", s); toast.success("Settings saved!"); }
    catch (err) { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  if (!s) return <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><div className="spinner" /></div>;

  const Field = ({ label, field, type = "text", rows, hint }) => (
    <div>
      <label className="form-label">{label}</label>
      {rows ? (
        <textarea className="input" rows={rows} value={s[field] || ""} onChange={e => setS({ ...s, [field]: e.target.value })} />
      ) : (
        <input className="input" type={type} value={s[field] || ""} onChange={e => setS({ ...s, [field]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value })} />
      )}
      {hint && <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: 2 }}>{hint}</p>}
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}><HiOutlineCog size={24} /> Settings</h1>
        <button className="btn btn-primary" onClick={save} disabled={saving}><HiOutlineSave size={16} /> {saving ? "Saving..." : "Save Changes"}</button>
      </div>

      {/* Store Information */}
      <div className="card" style={{ marginBottom: "1rem", padding: "1.25rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>🏪 Store Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
          <Field label="Store Name" field="storeName" />
          <Field label="Tagline" field="tagline" hint="Shown on receipt header" />
          <Field label="Address" field="address" />
          <Field label="Phone" field="phone" />
          <Field label="Email" field="email" type="email" />
          <Field label="Website" field="website" />
        </div>
      </div>

      {/* Financial Settings */}
      <div className="card" style={{ marginBottom: "1rem", padding: "1.25rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>💰 Financial</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.875rem" }}>
          <Field label="Default Tax Rate (%)" field="defaultTaxRate" type="number" hint="Applied to new products" />
          <Field label="Currency" field="currency" hint="e.g. USD, BDT, EUR" />
          <Field label="Currency Symbol" field="currencySymbol" hint="e.g. $, ৳, €" />
        </div>
      </div>

      {/* Receipt & Inventory */}
      <div className="card" style={{ marginBottom: "1rem", padding: "1.25rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>🧾 Receipt & Inventory</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <Field label="Receipt Footer Message" field="receiptFooter" rows={2} hint="Printed at bottom of every receipt" />
          <Field label="Return Policy" field="returnPolicy" rows={2} hint="Printed on receipts" />
          <Field label="Low Stock Threshold" field="lowStockThreshold" type="number" hint="Products below this quantity trigger alerts" />
        </div>
      </div>
    </div>
  );
}
