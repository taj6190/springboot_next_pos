"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineCheck, HiOutlineX, HiOutlineEye } from "react-icons/hi";

export default function PurchaseOrdersPage() {
  const [list, setList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [tp, setTp] = useState(0);
  const [modal, setModal] = useState(false);
  const [f, setF] = useState({ supplierId: "", notes: "", items: [{ productId: "", quantity: "", unitCost: "" }] });

  useEffect(() => { load(); loadMeta(); }, [page]);

  const load = async () => {
    const r = await api.get(`/purchase-orders?page=${page}&size=15`);
    setList(r.data.data.content); setTp(r.data.data.totalPages);
  };
  const loadMeta = async () => {
    const [s, p] = await Promise.all([api.get("/suppliers?size=100"), api.get("/products?size=200")]);
    setSuppliers(s.data.data.content); setProducts(p.data.data.content);
  };

  const addItem = () => setF({ ...f, items: [...f.items, { productId: "", quantity: "", unitCost: "" }] });
  const removeItem = (i) => setF({ ...f, items: f.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, key, val) => setF({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [key]: val } : item) });

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { supplierId: Number(f.supplierId), notes: f.notes, items: f.items.map(i => ({ productId: Number(i.productId), quantity: parseInt(i.quantity), unitCost: parseFloat(i.unitCost) })) };
      await api.post("/purchase-orders", body);
      toast.success("PO created"); setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const receive = async (id) => {
    if (!confirm("Mark as received?")) return;
    try { await api.patch(`/purchase-orders/${id}/receive`); toast.success("Received"); load(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const cancel = async (id) => {
    if (!confirm("Cancel this PO?")) return;
    try { await api.patch(`/purchase-orders/${id}/cancel`); toast.success("Cancelled"); load(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const sc = (s) => s === "ORDERED" ? "badge-info" : s === "RECEIVED" ? "badge-success" : "badge-danger";

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Purchase Orders</h1>
        <button className="btn btn-primary" onClick={() => { setF({ supplierId: "", notes: "", items: [{ productId: "", quantity: "", unitCost: "" }] }); setModal(true); }}><HiOutlinePlus size={18} /> Create PO</button>
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>PO #</th><th>Supplier</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>{list.map((po) => (
            <tr key={po.id}>
              <td style={{ fontWeight: 600, color: "var(--accent)" }}>{po.poNumber}</td>
              <td>{po.supplier?.name}</td>
              <td>{po.items?.length}</td>
              <td style={{ fontWeight: 700 }}>৳{po.totalAmount?.toFixed(2)}</td>
              <td><span className={`badge ৳{sc(po.status)}`}>{po.status}</span></td>
              <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{new Date(po.createdAt).toLocaleDateString()}</td>
              <td><div style={{ display: "flex", gap: "0.375rem" }}>
                {po.status === "ORDERED" && <>
                  <button className="btn btn-ghost" title="Receive" style={{ padding: "0.375rem", color: "var(--success)" }} onClick={() => receive(po.id)}><HiOutlineCheck size={16} /></button>
                  <button className="btn btn-ghost" title="Cancel" style={{ padding: "0.375rem", color: "var(--danger)" }} onClick={() => cancel(po.id)}><HiOutlineX size={16} /></button>
                </>}
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Purchase Order" width="640px">
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Supplier *</label>
            <select className="input" value={f.supplierId} onChange={(e) => setF({ ...f, supplierId: e.target.value })} required>
              <option value="">Select supplier</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Items</label>
            {f.items.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <select className="input" value={item.productId} onChange={(e) => updateItem(i, "productId", e.target.value)} required>
                  <option value="">Product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input className="input" type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} required />
                <input className="input" type="number" step="0.01" placeholder="Unit Cost" value={item.unitCost} onChange={(e) => updateItem(i, "unitCost", e.target.value)} required />
                {f.items.length > 1 && <button type="button" className="btn btn-ghost" style={{ padding: "0.375rem", color: "var(--danger)" }} onClick={() => removeItem(i)}><HiOutlineX size={16} /></button>}
              </div>
            ))}
            <button type="button" className="btn btn-ghost" style={{ fontSize: "0.8rem" }} onClick={addItem}><HiOutlinePlus size={14} /> Add Item</button>
          </div>
          <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Notes</label><textarea className="input" rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Create Purchase Order</button>
        </form>
      </Modal>
    </div>
  );
}
