"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import useCartStore from "@/store/cartStore";
import toast from "react-hot-toast";
import Receipt from "@/components/Receipt";
import Modal from "@/components/Modal";
import { HiOutlineSearch, HiOutlineTrash, HiOutlinePlus, HiOutlineMinus, HiOutlineShoppingCart, HiOutlineTicket, HiOutlinePause, HiOutlinePlay, HiOutlinePhotograph, HiOutlineClock, HiOutlineX } from "react-icons/hi";

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountReceived, setAmountReceived] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValid, setCouponValid] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [heldOrders, setHeldOrders] = useState([]);
  const [showHeld, setShowHeld] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selCat, setSelCat] = useState(null);

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState(null);
  const [productVariants, setProductVariants] = useState([]);

  const cart = useCartStore();
  const searchRef = useRef(null);
  const barcodeBuffer = useRef("");
  const barcodeTimer = useRef(null);

  useEffect(() => { fetchProducts(); fetchCustomers(); fetchCategories(); }, []);
  useEffect(() => { const t = setTimeout(() => fetchProducts(), 300); return () => clearTimeout(t); }, [search, selCat]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "Enter" && barcodeBuffer.current.length >= 4) { scanBarcode(barcodeBuffer.current); barcodeBuffer.current = ""; return; }
      if (e.key.length === 1) { barcodeBuffer.current += e.key; clearTimeout(barcodeTimer.current); barcodeTimer.current = setTimeout(() => { barcodeBuffer.current = ""; }, 100); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const scanBarcode = async (code) => {
    try { const res = await api.get(`/products/barcode/${code}`); cart.addItem(res.data.data); toast.success(`${res.data.data.name} scanned!`, { icon: "📦" }); }
    catch { toast.error("Product not found: " + code); }
  };
  const fetchProducts = async () => {
    try { let url = `/products?size=100${search ? `&search=${search}` : ""}`; if (selCat) url += `&categoryId=${selCat}`; const res = await api.get(url); setProducts(res.data.data.content || []); } catch {}
  };
  const fetchCustomers = async () => { try { const res = await api.get("/customers?size=100"); setCustomers(res.data.data.content || []); } catch {} };
  const fetchCategories = async () => { try { const res = await api.get("/categories"); setCategories(res.data.data || []); } catch {} };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try { const res = await api.get(`/coupons/validate?code=${couponCode}&subtotal=${cart.getSubtotal()}`); const d = parseFloat(res.data.data.discountValue); setCouponDiscount(d); setCouponValid(true); toast.success(`Coupon applied! -৳${d.toFixed(2)}`); }
    catch (err) { setCouponDiscount(0); setCouponValid(false); toast.error(err.response?.data?.message || "Invalid coupon"); }
  };
  const removeCoupon = () => { setCouponCode(""); setCouponDiscount(0); setCouponValid(null); };

  const openVariantSelector = async (product) => {
    setSelectedProductForVariants(product);
    try {
      const res = await api.get(`/product-variants/product/${product.id}`);
      setProductVariants(res.data.data.filter(v => v.active));
      setVariantModalOpen(true);
    } catch {
      toast.error("Failed to load variants");
    }
  };

  const selectVariant = (variant) => {
    cart.addItem({
      ...selectedProductForVariants,
      variantId: variant.id,
      variantName: variant.variantName,
      variantSku: variant.sku,
      variantPrice: variant.sellingPrice
    });
    toast.success(`${selectedProductForVariants.name} (${variant.variantName}) added`, { duration: 600, style: { fontSize: "0.8rem", borderRadius: 0 } });
    setVariantModalOpen(false);
  };

  const holdOrder = () => {
    if (cart.items.length === 0) return;
    const held = { id: Date.now(), items: [...cart.items], customerId: cart.customerId, notes: cart.notes, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), total: cart.getSubtotal() + cart.getTax() };
    setHeldOrders(prev => [...prev, held]);
    cart.clearCart(); removeCoupon();
    toast.success(`Order held (#${heldOrders.length + 1})`, { icon: "⏸️" });
  };
  const resumeOrder = (idx) => {
    const held = heldOrders[idx]; cart.clearCart();
    held.items.forEach(i => { for (let n = 0; n < i.quantity; n++) cart.addItem({ id: i.productId, variantId: i.variantId, variantName: i.name.includes("(") ? i.name.split("(")[1].replace(")","").trim() : null, name: i.name.split(" (")[0], sku: i.sku, sellingPrice: i.price, variantPrice: i.price, stock: i.stock, taxRate: i.taxRate }); });
    if (held.customerId) cart.setCustomerId(held.customerId);
    setHeldOrders(prev => prev.filter((_, i) => i !== idx));
    setShowHeld(false);
    toast.success("Order resumed", { icon: "▶️" });
  };
  const deleteHeld = (idx) => { setHeldOrders(prev => prev.filter((_, i) => i !== idx)); toast.success("Held order removed"); };

  const handleCheckout = async () => {
    if (cart.items.length === 0) return toast.error("Cart is empty");
    setProcessing(true);
    try {
      const body = { customerId: cart.customerId || null, items: cart.items.map(i => ({ productId: i.productId, variantId: i.variantId || null, quantity: i.quantity })), paymentMethod, discountAmount: cart.discountAmount || 0, amountReceived: amountReceived ? parseFloat(amountReceived) : null, notes: cart.notes || null, couponCode: couponValid ? couponCode : null };
      const res = await api.post("/orders", body);
      setReceipt(res.data.data); toast.success(`Order #${res.data.data.orderNumber} created!`);
      cart.clearCart(); setAmountReceived(""); removeCoupon(); fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || "Checkout failed"); }
    finally { setProcessing(false); }
  };

  const subtotal = cart.getSubtotal();
  const tax = cart.getTax();
  const total = subtotal + tax - cart.discountAmount - couponDiscount;
  const change = amountReceived ? parseFloat(amountReceived) - total : 0;

  return (
    <div className="animate-fade-in pos-layout">
      {/* === LEFT: Products === */}
      <div className="panel" style={{ borderRight: "1px solid var(--border)" }}>
        {/* Header */}
        <div className="pos-header">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>Point of Sale</h1>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", letterSpacing: "0.5px" }}>SELECT PRODUCTS TO BEGIN</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button className={`pos-btn ${heldOrders.length > 0 ? "pos-btn-active" : "pos-btn-outline"}`} onClick={() => setShowHeld(true)} style={{ position: "relative" }}>
              <HiOutlineClock size={16} /> HELD ORDERS
              {heldOrders.length > 0 && (
                <span className="badge-square">{heldOrders.length}</span>
              )}
            </button>
            <button className="pos-btn pos-btn-outline" onClick={holdOrder} disabled={cart.items.length === 0}>
              <HiOutlinePause size={16} /> HOLD
            </button>
          </div>
        </div>

        {/* Search & Categories */}
        <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", background: "var(--bg-primary)" }}>
          <div style={{ position: "relative", marginBottom: "0.75rem" }}>
            <HiOutlineSearch size={20} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
            <input ref={searchRef} className="pos-input search-input" placeholder="Search product name or scan barcode..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem", flexShrink: 0 }} className="hide-scrollbar">
            <button className={`pos-cat-btn ${!selCat ? "active" : ""}`} onClick={() => setSelCat(null)}>ALL PRODUCTS</button>
            {categories.map(c => <button key={c.id} className={`pos-cat-btn ${selCat === c.id ? "active" : ""}`} onClick={() => setSelCat(c.id)}>{c.name.toUpperCase()}</button>)}
          </div>
        </div>

        {/* Product grid */}
        <div className="product-grid hide-scrollbar">
          {products.map(p => (
            <div key={p.id} className={`pos-product-card ${p.stock <= 0 ? "out-of-stock" : ""}`} onClick={() => { 
              if(p.stock > 0) { 
                if (p.variantCount > 0) {
                  openVariantSelector(p);
                } else {
                  cart.addItem(p); 
                  toast.success(`${p.name} added`, { duration: 600, style: { fontSize: "0.8rem", borderRadius: 0 } }); 
                }
              } 
            }}>
              <div className="product-img-wrapper">
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <HiOutlinePhotograph size={32} color="var(--text-secondary)" style={{ opacity: 0.3 }} />}
                {p.stock <= p.minStock && p.stock > 0 && <span className="stock-alert">LOW STOCK</span>}
                {p.stock <= 0 && <span className="stock-alert empty">OUT OF STOCK</span>}
              </div>
              <div className="product-info">
                <p className="product-name">{p.name}</p>
                {p.brandName && <p className="product-brand">{p.brandName.toUpperCase()}</p>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                  <span className="product-price">৳{p.sellingPrice?.toFixed(2)}</span>
                  <span className="product-stock">{p.stock} {p.unit}</span>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem", color: "var(--text-secondary)", letterSpacing: "1px" }}>NO PRODUCTS FOUND</div>}
        </div>
      </div>

      {/* === RIGHT: Cart === */}
      <div className="panel cart-panel">
        <div className="cart-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <HiOutlineShoppingCart size={20} color="var(--accent)" />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Current Order</h2>
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.5px" }}>{cart.getItemCount()} ITEMS</span>
        </div>

        <div className="cart-items hide-scrollbar">
          {cart.items.length === 0 ? (
            <div className="empty-cart">
              <HiOutlineShoppingCart size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
              <p>CART IS EMPTY</p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>SELECT PRODUCTS OR SCAN BARCODE</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {cart.items.map(item => (
                <div key={item.cartItemId} className="cart-item">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span className="cart-item-name">{item.name}</span>
                    <button onClick={() => cart.removeItem(item.cartItemId)} className="cart-item-delete"><HiOutlineTrash size={14} /></button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="qty-controls">
                      <button onClick={() => cart.updateQuantity(item.cartItemId, item.quantity - 1)}><HiOutlineMinus size={12} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => cart.updateQuantity(item.cartItemId, item.quantity + 1)}><HiOutlinePlus size={12} /></button>
                    </div>
                    <span className="cart-item-price">৳{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="cart-footer">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select className="pos-input" value={cart.customerId || ""} onChange={e => cart.setCustomerId(e.target.value ? Number(e.target.value) : null)} style={{ flex: 1 }}>
              <option value="">WALK-IN CUSTOMER</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()} — {c.phone || c.email}</option>)}
            </select>
          </div>
          
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select className="pos-input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ flex: 1 }}>
              <option value="CASH">CASH</option><option value="CREDIT_CARD">CREDIT CARD</option><option value="DEBIT_CARD">DEBIT CARD</option><option value="MOBILE_PAYMENT">MOBILE PAYMENT</option>
            </select>
            {paymentMethod === "CASH" && <input className="pos-input" type="number" placeholder="RECEIVED" value={amountReceived} onChange={e => setAmountReceived(e.target.value)} style={{ flex: 1 }} />}
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <HiOutlineTicket size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: couponValid ? "var(--success)" : "var(--text-secondary)" }} />
              <input className="pos-input" placeholder="COUPON CODE" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponValid(null); setCouponDiscount(0); }} style={{ paddingLeft: "2rem" }} />
            </div>
            {couponValid ? <button className="pos-btn danger" onClick={removeCoupon}>REMOVE</button> : <button className="pos-btn pos-btn-outline" onClick={applyCoupon}>APPLY</button>}
          </div>

          <div className="totals-section">
            <div className="total-row"><span>SUBTOTAL</span><span>৳{subtotal.toFixed(2)}</span></div>
            <div className="total-row"><span>TAX</span><span>৳{tax.toFixed(2)}</span></div>
            {couponDiscount > 0 && <div className="total-row success"><span>COUPON ({couponCode})</span><span>-${couponDiscount.toFixed(2)}</span></div>}
            <div className="total-row grand-total"><span>TOTAL DUE</span><span>৳{total.toFixed(2)}</span></div>
            {paymentMethod === "CASH" && amountReceived && <div className={`total-row ${change >= 0 ? "success" : "danger"}`}><span>CHANGE</span><span>৳{change.toFixed(2)}</span></div>}
          </div>

          <button className="pos-checkout-btn" onClick={handleCheckout} disabled={processing || cart.items.length === 0}>
            {processing ? "PROCESSING..." : `PAY ৳${total.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* === HELD ORDERS DRAWER === */}
      {showHeld && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }} onClick={() => setShowHeld(false)}>
          <div style={{ flex: 1 }} />
          <div className="held-drawer" onClick={e => e.stopPropagation()}>
            <div className="held-header">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem", letterSpacing: "1px" }}>
                <HiOutlineClock size={20} color="var(--accent)" /> HELD ORDERS
              </h3>
              <button onClick={() => setShowHeld(false)} className="close-btn"><HiOutlineX size={24} /></button>
            </div>

            <div className="held-content hide-scrollbar">
              {heldOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-secondary)", letterSpacing: "1px" }}>
                  <HiOutlineClock size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
                  <p style={{ fontWeight: 700 }}>NO HELD ORDERS</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {heldOrders.map((h, i) => (
                    <div key={h.id} className="held-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                        <div>
                          <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)" }}>ORDER #{i + 1}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginLeft: "0.75rem" }}>{h.time}</span>
                        </div>
                        <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--accent)" }}>৳{h.total.toFixed(2)}</span>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        {h.items.map((item, j) => (
                          <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)", padding: "0.2rem 0" }}>
                            <span>{item.name} <span style={{ color: "var(--text-primary)" }}>× {item.quantity}</span></span>
                            <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="pos-btn pos-btn-active" style={{ flex: 1 }} onClick={() => resumeOrder(i)}>
                          <HiOutlinePlay size={16} /> RESUME ORDER
                        </button>
                        <button className="pos-btn danger" style={{ padding: "0 1rem" }} onClick={() => deleteHeld(i)}>
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === VARIANT SELECTOR MODAL === */}
      <Modal isOpen={variantModalOpen} onClose={() => setVariantModalOpen(false)} title={`Select Variant: ${selectedProductForVariants?.name}`} width="600px">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem", padding: "0.5rem 0" }}>
          {productVariants.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>No active variants found.</div>
          ) : (
            productVariants.map(v => (
              <button 
                key={v.id}
                onClick={() => selectVariant(v)}
                style={{ 
                  background: "var(--bg-secondary)", 
                  border: "1px solid var(--border)", 
                  padding: "1rem", 
                  textAlign: "center", 
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
              >
                {v.imageUrl ? (
                   <img src={v.imageUrl} alt={v.variantName} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                ) : (
                   <div style={{ width: 40, height: 40, background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                     <HiOutlinePhotograph size={20} color="var(--text-secondary)" />
                   </div>
                )}
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{v.variantName}</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--accent)" }}>
                    ৳{v.sellingPrice != null ? v.sellingPrice.toFixed(2) : selectedProductForVariants?.sellingPrice?.toFixed(2)}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </Modal>

      {receipt && <Receipt order={receipt} onClose={() => setReceipt(null)} />}

      {/* POS Specific Styles (No Border Radius, Sharp Premium Design) */}
      <style jsx global>{`
        .pos-layout {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 1.5rem;
          height: calc(100vh - 4rem);
        }
        
        .panel {
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .pos-header {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-primary);
        }

        .pos-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          background: transparent;
          color: var(--text-primary);
        }

        .pos-btn-outline {
          border-color: var(--border);
          background: var(--bg-primary);
        }

        .pos-btn-outline:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }

        .pos-btn-active {
          background: var(--accent);
          color: #fff;
        }

        .pos-btn.danger {
          background: var(--danger);
          color: #fff;
        }

        .pos-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .badge-square {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--danger);
          color: #fff;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 900;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .pos-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          outline: none;
          transition: border-color 0.2s;
        }
        
        .pos-input:focus {
          border-color: var(--accent);
        }

        .search-input {
          padding-left: 2.5rem;
          font-size: 0.9rem;
        }

        .pos-cat-btn {
          padding: 0.5rem 1.25rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .pos-cat-btn:hover {
          color: var(--text-primary);
          border-color: var(--text-primary);
        }

        .pos-cat-btn.active {
          background: var(--text-primary);
          color: var(--bg-primary);
          border-color: var(--text-primary);
        }

        .product-grid {
          flex: 1;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1rem;
          padding: 1.25rem;
          align-content: start;
          background: var(--bg-primary);
        }

        .pos-product-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .pos-product-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .pos-product-card.out-of-stock {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .pos-product-card.out-of-stock:hover {
          transform: none;
          border-color: var(--border);
          box-shadow: none;
        }

        .product-img-wrapper {
          width: 100%;
          aspect-ratio: 1;
          background: var(--bg-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border-bottom: 1px solid var(--border);
        }

        .product-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stock-alert {
          position: absolute;
          top: 0;
          left: 0;
          background: #f59e0b;
          color: #fff;
          font-size: 0.6rem;
          font-weight: 900;
          padding: 0.2rem 0.5rem;
          letter-spacing: 1px;
        }
        .stock-alert.empty {
          background: var(--danger);
        }

        .product-info {
          padding: 0.75rem;
        }

        .product-name {
          font-size: 0.85rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 0.25rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-brand {
          font-size: 0.65rem;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }

        .product-price {
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--accent);
        }

        .product-stock {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-secondary);
          background: var(--bg-hover);
          padding: 0.15rem 0.4rem;
        }

        .cart-panel {
          border-left: 1px solid var(--border);
        }

        .cart-header {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-primary);
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background: var(--bg-secondary);
        }

        .empty-cart {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .cart-item {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .cart-item-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .cart-item-delete {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.2s;
        }
        .cart-item-delete:hover {
          color: var(--danger);
        }

        .qty-controls {
          display: flex;
          align-items: center;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
        }

        .qty-controls button {
          background: transparent;
          border: none;
          color: var(--text-primary);
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .qty-controls button:hover {
          background: var(--bg-hover);
        }
        
        .qty-controls span {
          width: 32px;
          text-align: center;
          font-size: 0.8rem;
          font-weight: 800;
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
        }

        .cart-item-price {
          font-size: 1rem;
          font-weight: 900;
          color: var(--accent);
        }

        .cart-footer {
          border-top: 2px solid var(--text-primary);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: var(--bg-primary);
        }

        .totals-section {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin: 0.5rem 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
        }
        
        .total-row.success { color: var(--success); }
        .total-row.danger { color: var(--danger); }
        
        .grand-total {
          font-size: 1.25rem;
          font-weight: 900;
          color: var(--text-primary);
          border-top: 1px solid var(--border);
          padding-top: 0.5rem;
          margin-top: 0.25rem;
        }

        .pos-checkout-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 1rem;
          font-size: 1.1rem;
          font-weight: 900;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .pos-checkout-btn:hover:not(:disabled) {
          filter: brightness(1.1);
        }
        .pos-checkout-btn:disabled {
          background: var(--border);
          cursor: not-allowed;
        }

        .held-drawer {
          width: 450px;
          background: var(--bg-primary);
          border-left: 2px solid var(--text-primary);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.2s ease-out;
        }

        .held-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.2s;
        }
        .close-btn:hover { color: var(--text-primary); }

        .held-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          background: var(--bg-secondary);
        }

        .held-card {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          padding: 1.25rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
