"use client";
import { useRef, useEffect, useState } from "react";
import api from "@/lib/api";

/**
 * Thermal Receipt Component — 80mm POS printer format
 * Fetches store settings dynamically for header/footer.
 */
export default function Receipt({ order, onClose }) {
  const receiptRef = useRef(null);
  const [store, setStore] = useState({ storeName: "POS System", tagline: "Your Trusted Supershop", address: "123 Main Street, Dhaka", phone: "+880 1700-000000", receiptFooter: "Thank you for shopping!", returnPolicy: "Exchange/Return within 7 days with receipt", currencySymbol: "৳" });

  useEffect(() => {
    api.get("/settings").then(r => setStore(r.data.data)).catch(() => {});
  }, []);

  const cs = store.currencySymbol || "৳";

  const handlePrint = () => {
    const content = receiptRef.current;
    const printWindow = window.open("", "_blank", "width=320,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${order.orderNumber}</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', Consolas, monospace; font-size: 12px; line-height: 1.4; width: 80mm; padding: 4mm; color: #000; background: #fff; }
            .row { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>৳{content.innerHTML}
          <script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);};<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!order) return null;

  const now = new Date(order.createdAt);
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const totalQty = order.items?.reduce((a, i) => a + i.quantity, 0) || 0;

  const S = { divider: { border: "none", borderTop: "1px dashed #000", margin: "6px 0" }, solidDiv: { border: "none", borderTop: "2px solid #000", margin: "6px 0" }, row: { display: "flex", justifyContent: "space-between" }, center: { textAlign: "center" } };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, animation: "fadeIn 0.15s ease-out" }}>
      <div style={{ background: "var(--bg-secondary)", borderRadius: 16, padding: "1.5rem", maxWidth: 420, width: "90%", maxHeight: "90vh", overflow: "auto", animation: "scaleIn 0.2s ease-out" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>🧾 Receipt</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ fontSize: "0.8rem", padding: "0.375rem 1rem" }}>🖨️ Print</button>
            <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: "0.8rem", padding: "0.375rem 0.75rem" }}>Close</button>
          </div>
        </div>

        {/* Receipt Preview — white paper */}
        <div style={{ background: "#fff", color: "#000", borderRadius: 8, padding: "16px", fontFamily: "'Courier New', Consolas, monospace", fontSize: "12px", lineHeight: 1.5, maxWidth: 300, margin: "0 auto", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
          <div ref={receiptRef}>
            {/* Header */}
            <div style={S.center}>
              <p style={{ fontSize: 16, fontWeight: "bold", letterSpacing: 1 }}>{store.storeName}</p>
              <p style={{ fontSize: 10 }}>{store.tagline}</p>
              <p style={{ fontSize: 10 }}>{store.address}</p>
              <p style={{ fontSize: 10 }}>Tel: {store.phone}</p>
            </div>

            <hr style={S.solidDiv} />

            <div style={{ fontSize: 11 }}>
              <div style={S.row}><span>Receipt:</span><span style={{ fontWeight: "bold" }}>{order.orderNumber}</span></div>
              <div style={S.row}><span>Date:</span><span>{dateStr}</span></div>
              <div style={S.row}><span>Time:</span><span>{timeStr}</span></div>
              <div style={S.row}><span>Cashier:</span><span>{order.cashierName || "Admin"}</span></div>
              {order.customer && <div style={S.row}><span>Customer:</span><span>{order.customer.name}</span></div>}
            </div>

            <hr style={S.divider} />

            {/* Column headers */}
            <div style={{ display: "flex", fontWeight: "bold", fontSize: 10, marginBottom: 3 }}>
              <span style={{ flex: 2.5 }}>Item</span>
              <span style={{ flex: 0.5, textAlign: "center" }}>Qty</span>
              <span style={{ flex: 1, textAlign: "right" }}>Price</span>
              <span style={{ flex: 1, textAlign: "right" }}>Total</span>
            </div>
            <hr style={{ ...S.divider, margin: "3px 0" }} />

            {/* Items */}
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: "flex", fontSize: 11, marginBottom: 2 }}>
                <span style={{ flex: 2.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.productName}</span>
                <span style={{ flex: 0.5, textAlign: "center" }}>{item.quantity}</span>
                <span style={{ flex: 1, textAlign: "right" }}>{item.unitPrice?.toFixed(2)}</span>
                <span style={{ flex: 1, textAlign: "right" }}>{item.totalPrice?.toFixed(2)}</span>
              </div>
            ))}

            <hr style={S.divider} />

            {/* Totals */}
            <div style={{ fontSize: 11 }}>
              <div style={S.row}><span>Subtotal:</span><span>{cs}{order.subtotal?.toFixed(2)}</span></div>
              {order.taxAmount > 0 && <div style={S.row}><span>Tax:</span><span>{cs}{order.taxAmount?.toFixed(2)}</span></div>}
              {order.discountAmount > 0 && <div style={S.row}><span>Discount:</span><span>-{cs}{order.discountAmount?.toFixed(2)}</span></div>}
              {order.couponCode && <div style={S.row}><span>Coupon ({order.couponCode}):</span><span>-{cs}{order.couponDiscount?.toFixed(2)}</span></div>}
            </div>

            <hr style={S.solidDiv} />

            <div style={{ ...S.row, fontWeight: "bold", fontSize: 16, padding: "2px 0" }}>
              <span>TOTAL</span>
              <span>{cs}{order.totalAmount?.toFixed(2)}</span>
            </div>

            <hr style={S.divider} />

            {/* Payment */}
            <div style={{ fontSize: 11 }}>
              <div style={S.row}><span>Payment:</span><span>{order.paymentMethod?.replace(/_/g, " ")}</span></div>
              {order.amountReceived > 0 && <div style={S.row}><span>Paid:</span><span>{cs}{order.amountReceived?.toFixed(2)}</span></div>}
              {order.changeAmount > 0 && <div style={{ ...S.row, fontWeight: "bold" }}><span>Change:</span><span>{cs}{order.changeAmount?.toFixed(2)}</span></div>}
            </div>

            <hr style={S.divider} />

            {/* Footer */}
            <div style={{ ...S.center, fontSize: 10, marginTop: 4 }}>
              <p style={{ fontWeight: "bold", marginBottom: 3 }}>Items: {totalQty} | Products: {order.items?.length}</p>
              <p style={{ marginBottom: 6 }}>━━━━━━━━━━━━━━━━━━━━━━</p>
              <p style={{ fontWeight: "bold", fontSize: 12 }}>{store.receiptFooter}</p>
              <p style={{ marginTop: 4, fontSize: 9 }}>{store.returnPolicy}</p>
              {store.website && <p style={{ marginTop: 4, fontSize: 9 }}>{store.website}</p>}
              <p style={{ marginTop: 8, fontSize: 20, letterSpacing: 3, fontFamily: "monospace" }}>
                ||||| {order.orderNumber} |||||
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
