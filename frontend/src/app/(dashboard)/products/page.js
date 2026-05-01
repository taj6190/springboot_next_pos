"use client";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineColorSwatch, HiOutlinePencil, HiOutlinePhotograph, HiOutlinePlus, HiOutlineSearch, HiOutlineTrash } from "react-icons/hi";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(null);
  const fileRef = useRef(null);
  const emptyForm = { name: "", barcode: "", description: "", costPrice: "", sellingPrice: "", mrp: "", stock: "", minStock: "5", categoryId: "", brandId: "", unit: "pcs", weight: "", weightUnit: "g", soldByWeight: false, taxRate: "0", taxGroupId: "", hsCode: "", expiryTracking: false };
  const [form, setForm] = useState(emptyForm);
  const [brands, setBrands] = useState([]);
  const [taxGroups, setTaxGroups] = useState([]);

  useEffect(() => { fetchProducts(); fetchCategories(); fetchBrands(); fetchTaxGroups(); }, [page]);
  useEffect(() => { const t = setTimeout(() => { setPage(0); fetchProducts(); }, 300); return () => clearTimeout(t); }, [search]);

  const fetchProducts = async () => {
    const res = await api.get(`/products?page=${page}&size=15${search ? `&search=${search}` : ""}`);
    setProducts(res.data.data.content); setTotalPages(res.data.data.totalPages);
  };
  const fetchCategories = async () => { const r = await api.get("/categories"); setCategories(r.data.data); };
  const fetchBrands = async () => { const r = await api.get("/brands"); setBrands(r.data.data || []); };
  const fetchTaxGroups = async () => {
    try { const r = await api.get("/tax-groups?size=100"); setTaxGroups(r.data.data.content || []); } catch {}
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, barcode: p.barcode || "", description: p.description || "", costPrice: p.costPrice, sellingPrice: p.sellingPrice, mrp: p.mrp || "", stock: p.stock, minStock: p.minStock, categoryId: p.categoryId || "", brandId: p.brandId || "", unit: p.unit || "pcs", weight: p.weight || "", weightUnit: p.weightUnit || "g", soldByWeight: p.soldByWeight || false, taxRate: p.taxRate || "0", taxGroupId: p.taxGroupId || "", hsCode: p.hsCode || "", expiryTracking: p.expiryTracking || false });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { ...form, costPrice: parseFloat(form.costPrice), sellingPrice: parseFloat(form.sellingPrice), mrp: form.mrp ? parseFloat(form.mrp) : null, stock: parseInt(form.stock || "0"), minStock: parseInt(form.minStock || "5"), categoryId: form.categoryId ? Number(form.categoryId) : null, brandId: form.brandId ? Number(form.brandId) : null, taxRate: parseFloat(form.taxRate || "0"), taxGroupId: form.taxGroupId ? Number(form.taxGroupId) : null, weight: form.weight ? parseFloat(form.weight) : null, hsCode: form.hsCode || null };
    try {
      if (editing) { await api.put(`/products/${editing.id}`, body); toast.success("Product updated"); }
      else { await api.post("/products", body); toast.success("Product created"); }
      setModalOpen(false); fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try { await api.delete(`/products/${id}`); toast.success("Deleted"); fetchProducts(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleImageUpload = async (productId, file) => {
    if (!file) return;
    setUploading(productId);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post(`/products/${productId}/image`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Image uploaded!");
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || "Upload failed"); }
    finally { setUploading(null); }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus size={18} /> Add Product</button>
      </div>

      <div style={{ marginBottom: "1rem", position: "relative", maxWidth: 400 }}>
        <HiOutlineSearch size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
        <input className="input" placeholder="Search by name, SKU, barcode, HS Code..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th style={{width:60}}>Image</th><th>Product</th><th>Brand</th><th>Category</th><th>Cost</th><th>Price</th><th>MRP</th><th>Stock</th><th>Tax</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ width: 44, height: 44, overflow: "hidden", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
                    onClick={() => { fileRef.current?.setAttribute("data-id", p.id); fileRef.current?.click(); }}>
                    {uploading === p.id ? (
                      <div style={{ width: 20, height: 20, border: "2px solid var(--accent)", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    ) : p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <HiOutlinePhotograph size={20} color="var(--text-secondary)" />
                    )}
                  </div>
                </td>
                <td>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>{p.name}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{p.sku}</p>
                    {p.hsCode && <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>HS: {p.hsCode}</p>}
                  </div>
                </td>
                <td style={{ fontSize: "0.85rem" }}>{p.brandName || "—"}</td>
                <td><span className="badge badge-info">{p.categoryName || "—"}</span></td>
                <td>৳{p.costPrice?.toFixed(2)}</td>
                <td style={{ fontWeight: 600, color: "var(--accent)" }}>৳{p.sellingPrice?.toFixed(2)}</td>
                <td>{p.mrp ? `৳${p.mrp.toFixed(2)}` : "—"}</td>
                <td>
                  <span className={`badge ${p.lowStock ? "badge-danger" : "badge-success"}`}>{p.stock}</span>
                  {p.variantCount > 0 && <span className="badge badge-info" style={{ marginLeft: 4, fontSize: "0.6rem" }}>{p.variantCount}V</span>}
                </td>
                <td>
                  {p.taxGroupName ? (
                    <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>{p.taxGroupName}</span>
                  ) : p.taxRate > 0 ? (
                    <span style={{ fontSize: "0.8rem" }}>{p.taxRate}%</span>
                  ) : "—"}
                </td>
                <td><span className={`badge ${p.active ? "badge-success" : "badge-danger"}`}>{p.active ? "Active" : "Inactive"}</span></td>
                <td>
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <button className="btn btn-primary" style={{ padding: "0.375rem 0.5rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }} onClick={() => router.push(`/products/${p.id}`)}>
                      <HiOutlineColorSwatch size={14} /> Variants
                    </button>
                    <button className="btn btn-ghost" style={{ padding: "0.375rem" }} onClick={() => openEdit(p)}><HiOutlinePencil size={16} /></button>
                    <button className="btn btn-ghost" style={{ padding: "0.375rem", color: "var(--danger)" }} onClick={() => handleDelete(p.id)}><HiOutlineTrash size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => {
        const id = e.target.getAttribute("data-id");
        if (id && e.target.files[0]) handleImageUpload(Number(id), e.target.files[0]);
        e.target.value = "";
      }} />

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
          <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
          <span style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Product" : "Add Product"} width="620px">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label className="form-label">Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="form-label">Brand *</label><select className="input" value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} required><option value="">Select brand...</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label className="form-label">Barcode</label><input className="input" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></div>
            <div><label className="form-label">Category</label><select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">None</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <div><label className="form-label">Cost Price *</label><input className="input" type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} required /></div>
            <div><label className="form-label">Selling Price *</label><input className="input" type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} required /></div>
            <div><label className="form-label">MRP</label><input className="input" type="number" step="0.01" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} placeholder="Optional" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <div><label className="form-label">Stock</label><input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            <div><label className="form-label">Min Stock Alert</label><input className="input" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} /></div>
            <div><label className="form-label">HS Code</label><input className="input" value={form.hsCode} onChange={(e) => setForm({ ...form, hsCode: e.target.value })} placeholder="e.g., 3304.10" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label className="form-label">Tax Group</label>
              <select className="input" value={form.taxGroupId} onChange={(e) => setForm({ ...form, taxGroupId: e.target.value })}>
                <option value="">None (use flat rate)</option>
                {taxGroups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.totalRate}%)</option>)}
              </select>
            </div>
            <div><label className="form-label">Flat Tax % {form.taxGroupId && <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>(overridden by group)</span>}</label><input className="input" type="number" step="0.1" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} disabled={!!form.taxGroupId} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <div><label className="form-label">Unit</label><select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}><option value="pcs">Pieces</option><option value="kg">Kilogram</option><option value="g">Gram</option><option value="L">Liter</option><option value="ml">Milliliter</option><option value="box">Box</option><option value="pack">Pack</option><option value="dozen">Dozen</option></select></div>
            <div><label className="form-label">Weight</label><input className="input" type="number" step="0.001" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></div>
            <div><label className="form-label">Weight Unit</label><select className="input" value={form.weightUnit} onChange={(e) => setForm({ ...form, weightUnit: e.target.value })}><option value="g">Gram</option><option value="kg">Kilogram</option><option value="ml">ml</option><option value="L">Liter</option></select></div>
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" id="soldByWeight" checked={form.soldByWeight} onChange={(e) => setForm({ ...form, soldByWeight: e.target.checked })} />
              <label htmlFor="soldByWeight" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Sold by weight</label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" id="expiryTracking" checked={form.expiryTracking} onChange={(e) => setForm({ ...form, expiryTracking: e.target.checked })} />
              <label htmlFor="expiryTracking" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Enable expiry tracking</label>
            </div>
          </div>
          <div><label className="form-label">Description</label><textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>{editing ? "Update" : "Create"} Product</button>
        </form>
      </Modal>
    </div>
  );
}

