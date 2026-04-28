import { create } from "zustand";

const useCartStore = create((set, get) => ({
  items: [],
  customerId: null,
  discountAmount: 0,
  notes: "",

  addItem: (product) => {
    const items = get().items;
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return;
      set({ items: items.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      set({ items: [...items, { productId: product.id, name: product.name, sku: product.sku, price: product.sellingPrice, stock: product.stock, quantity: 1, taxRate: product.taxRate || 0 }] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.productId !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    set({ items: get().items.map((i) => i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i) });
  },

  setCustomerId: (id) => set({ customerId: id }),
  setDiscount: (amount) => set({ discountAmount: amount }),
  setNotes: (notes) => set({ notes }),

  getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  getTax: () => get().items.reduce((sum, i) => sum + (i.price * i.quantity * i.taxRate / 100), 0),
  getTotal: () => get().getSubtotal() + get().getTax() - get().discountAmount,
  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  clearCart: () => set({ items: [], customerId: null, discountAmount: 0, notes: "" }),
}));

export default useCartStore;
