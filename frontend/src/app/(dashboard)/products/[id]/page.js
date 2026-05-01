"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineTag, HiOutlineCube, HiOutlineColorSwatch, HiOutlinePhotograph
} from "react-icons/hi";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Variant modal
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const emptyVariantForm = {
    productId: Number(id),
    variantName: "",
    barcode: "",
    option1Name: "",
    option1Value: "",
    option2Name: "",
    option2Value: "",
    costPrice: "",
    sellingPrice: "",
    mrp: "",
    stock: "0",
    weight: "",
    weightUnit: "g",
  };
  const [variantForm, setVariantForm] = useState(emptyVariantForm);

  useEffect(() => {
    fetchProduct();
    fetchVariants();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.data);
    } catch (err) {
      toast.error("Failed to load product");
      router.push("/products");
    } finally { setLoading(false); }
  };

  const fetchVariants = async () => {
    try {
      const res = await api.get(`/product-variants/product/${id}`);
      setVariants(res.data.data || []);
    } catch {}
  };

  const openCreateVariant = () => {
    setEditingVariant(null);
    setVariantForm({ ...emptyVariantForm });
    setVariantModalOpen(true);
  };

  const openEditVariant = (v) => {
    setEditingVariant(v);
    setVariantForm({
      productId: Number(id),
      variantName: v.variantName,
      barcode: v.barcode || "",
      option1Name: v.option1Name || "",
      option1Value: v.option1Value || "",
      option2Name: v.option2Name || "",
      option2Value: v.option2Value || "",
      costPrice: v.costPrice || "",
      sellingPrice: v.sellingPrice || "",
      mrp: v.mrp || "",
      stock: v.stock || "0",
      weight: v.weight || "",
      weightUnit: v.weightUnit || "g",
    });
    setVariantModalOpen(true);
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    const body = {
      ...variantForm,
      productId: Number(id),
      costPrice: variantForm.costPrice ? parseFloat(variantForm.costPrice) : null,
      sellingPrice: variantForm.sellingPrice ? parseFloat(variantForm.sellingPrice) : null,
      mrp: variantForm.mrp ? parseFloat(variantForm.mrp) : null,
      stock: variantForm.stock ? parseInt(variantForm.stock) : 0,
      weight: variantForm.weight ? parseFloat(variantForm.weight) : null,
    };
    try {
      if (editingVariant) {
        await api.put(`/product-variants/${editingVariant.id}`, body);
        toast.success("Variant updated");
      } else {
        await api.post("/product-variants", body);
        toast.success("Variant created");
      }
      setVariantModalOpen(false);
      fetchVariants();
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!confirm("Deactivate this variant?")) return;
    try {
      await api.delete(`/product-variants/${variantId}`);
      toast.success("Variant deactivated");
      fetchVariants();
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  // Auto-generate variant name from options
  const autoName = () => {
    const parts = [];
    if (variantForm.option1Value) parts.push(variantForm.option1Value);
    if (variantForm.option2Value) parts.push(variantForm.option2Value);
    if (parts.length > 0) {
      setVariantForm({ ...variantForm, variantName: parts.join(" / ") });
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><div className="spinner" /></div>
  );
  if (!product) return null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <button className="btn btn-ghost" style={{ padding: "0.5rem" }} onClick={() => router.push("/products")}>
          <HiOutlineArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{product.name}</h1>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", alignItems: "center" }}>
            <span className="badge badge-info">{product.sku}</span>
            {product.brandName && <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>by {product.brandName}</span>}
            {product.categoryName && <span className="badge badge-info">{product.categoryName}</span>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent)" }}>৳{product.sellingPrice?.toFixed(2)}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Cost: ৳{product.costPrice?.toFixed(2)}</div>
        </div>
      </div>

      {/* Product Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-secondary)", marginBottom: 4 }}>Stock</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: product.lowStock ? "var(--danger)" : "var(--text-primary)" }}>{product.stock}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-secondary)", marginBottom: 4 }}>Variants</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{variants.length}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-secondary)", marginBottom: 4 }}>Tax Group</div>
          <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{product.taxGroupName || `${product.taxRate || 0}%`}</div>
        </div>
        {product.mrp && (
          <div className="stat-card">
            <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-secondary)", marginBottom: 4 }}>MRP</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>৳{product.mrp?.toFixed(2)}</div>
          </div>
        )}
        {product.hsCode && (
          <div className="stat-card">
            <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-secondary)", marginBottom: 4 }}>HS Code</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, fontFamily: "monospace" }}>{product.hsCode}</div>
          </div>
        )}
      </div>

      {/* ============ VARIANTS SECTION ============ */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <HiOutlineColorSwatch size={20} />
            <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Product Variants</h2>
            <span className="badge badge-info" style={{ fontSize: "0.65rem" }}>{variants.length} variant{variants.length !== 1 ? "s" : ""}</span>
          </div>
          <button className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }} onClick={openCreateVariant}>
            <HiOutlinePlus size={16} /> Add Variant
          </button>
        </div>

        {variants.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-secondary)" }}>
            <HiOutlineCube size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
            <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>No variants yet</p>
            <p style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
              Add variants like shade, size, or colour to this product.
            </p>
            <button className="btn btn-ghost" style={{ marginTop: "1rem", fontSize: "0.75rem" }} onClick={openCreateVariant}>
              <HiOutlinePlus size={14} /> Create First Variant
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>Image</th>
                  <th>Variant</th>
                  <th>SKU</th>
                  <th>Option 1</th>
                  <th>Option 2</th>
                  <th>Stock</th>
                  <th>Cost</th>
                  <th>Price</th>
                  <th>MRP</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ width: 40, height: 40, background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {v.imageUrl ? (
                          <img src={v.imageUrl} alt={v.variantName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <HiOutlinePhotograph size={18} color="var(--text-secondary)" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>{v.variantName}</p>
                        {v.barcode && <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>BC: {v.barcode}</p>}
                      </div>
                    </td>
                    <td><span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--text-secondary)" }}>{v.sku}</span></td>
                    <td>
                      {v.option1Name ? (
                        <div>
                          <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5 }}>{v.option1Name}</p>
                          <span className="badge badge-info" style={{ fontSize: "0.7rem" }}>{v.option1Value}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td>
                      {v.option2Name ? (
                        <div>
                          <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5 }}>{v.option2Name}</p>
                          <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>{v.option2Value}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td><span className={`badge ${v.stock <= 5 ? "badge-danger" : "badge-success"}`}>{v.stock || 0}</span></td>
                    <td>{v.costPrice != null ? `৳${Number(v.costPrice).toFixed(2)}` : <span style={{ color: "var(--text-secondary)" }}>inherit</span>}</td>
                    <td style={{ fontWeight: 600 }}>{v.sellingPrice != null ? `৳${Number(v.sellingPrice).toFixed(2)}` : <span style={{ color: "var(--text-secondary)" }}>inherit</span>}</td>
                    <td>{v.mrp != null ? `৳${Number(v.mrp).toFixed(2)}` : "—"}</td>
                    <td><span className={`badge ${v.active ? "badge-success" : "badge-danger"}`}>{v.active ? "Active" : "Inactive"}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <button className="btn btn-ghost" style={{ padding: "0.375rem" }} onClick={() => openEditVariant(v)}><HiOutlinePencil size={15} /></button>
                        <button className="btn btn-ghost" style={{ padding: "0.375rem", color: "var(--danger)" }} onClick={() => handleDeleteVariant(v.id)}><HiOutlineTrash size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============ VARIANT MODAL ============ */}
      <Modal isOpen={variantModalOpen} onClose={() => setVariantModalOpen(false)} title={editingVariant ? "Edit Variant" : "Add Variant"} width="580px">
        <form onSubmit={handleVariantSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Option axes */}
          <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", padding: "1rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
              Option Axes (e.g. Shade, Size)
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div>
                <label className="form-label" style={{ fontSize: "0.65rem" }}>Option 1 Name</label>
                <input className="input" value={variantForm.option1Name} onChange={(e) => setVariantForm({ ...variantForm, option1Name: e.target.value })} placeholder="e.g. Shade" />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "0.65rem" }}>Option 1 Value</label>
                <input className="input" value={variantForm.option1Value} onChange={(e) => setVariantForm({ ...variantForm, option1Value: e.target.value })} placeholder="e.g. Ruby Red" />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "0.65rem" }}>Option 2 Name</label>
                <input className="input" value={variantForm.option2Name} onChange={(e) => setVariantForm({ ...variantForm, option2Name: e.target.value })} placeholder="e.g. Size" />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "0.65rem" }}>Option 2 Value</label>
                <input className="input" value={variantForm.option2Value} onChange={(e) => setVariantForm({ ...variantForm, option2Value: e.target.value })} placeholder="e.g. 5ml" />
              </div>
            </div>
            <button type="button" className="btn btn-ghost" style={{ marginTop: "0.5rem", padding: "0.25rem 0.75rem", fontSize: "0.7rem" }} onClick={autoName}>
              <HiOutlineTag size={13} /> Auto-generate Name from Options
            </button>
          </div>

          {/* Core fields */}
          <div>
            <label className="form-label">Variant Name *</label>
            <input className="input" value={variantForm.variantName} onChange={(e) => setVariantForm({ ...variantForm, variantName: e.target.value })} placeholder="e.g. Ruby Red / 5ml" required />
          </div>

          <div>
            <label className="form-label">Barcode</label>
            <input className="input" value={variantForm.barcode} onChange={(e) => setVariantForm({ ...variantForm, barcode: e.target.value })} placeholder="Unique barcode for this variant" />
          </div>

          {/* Pricing & Stock */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.5rem" }}>
            <div>
              <label className="form-label" style={{ fontSize: "0.65rem" }}>Stock</label>
              <input className="input" type="number" value={variantForm.stock} onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: "0.65rem" }}>Cost Price</label>
              <input className="input" type="number" step="0.01" value={variantForm.costPrice} onChange={(e) => setVariantForm({ ...variantForm, costPrice: e.target.value })} placeholder="Inherit" />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: "0.65rem" }}>Selling Price</label>
              <input className="input" type="number" step="0.01" value={variantForm.sellingPrice} onChange={(e) => setVariantForm({ ...variantForm, sellingPrice: e.target.value })} placeholder="Inherit" />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: "0.65rem" }}>MRP</label>
              <input className="input" type="number" step="0.01" value={variantForm.mrp} onChange={(e) => setVariantForm({ ...variantForm, mrp: e.target.value })} placeholder="Optional" />
            </div>
          </div>
          <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "-0.5rem" }}>Leave price fields empty to inherit from the parent product.</p>

          {/* Weight */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div>
              <label className="form-label" style={{ fontSize: "0.65rem" }}>Weight</label>
              <input className="input" type="number" step="0.001" value={variantForm.weight} onChange={(e) => setVariantForm({ ...variantForm, weight: e.target.value })} />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: "0.65rem" }}>Weight Unit</label>
              <select className="input" value={variantForm.weightUnit} onChange={(e) => setVariantForm({ ...variantForm, weightUnit: e.target.value })}>
                <option value="g">Gram</option>
                <option value="kg">Kilogram</option>
                <option value="ml">ml</option>
                <option value="L">Liter</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            {editingVariant ? "Update" : "Create"} Variant
          </button>
        </form>
      </Modal>
    </div>
  );
}
