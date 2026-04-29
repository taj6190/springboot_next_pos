"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { HiOutlineHome, HiOutlineShoppingCart, HiOutlineCube, HiOutlineTag, HiOutlineClipboardList, HiOutlineUsers, HiOutlineTruck, HiOutlineDocumentText, HiOutlineChartBar, HiOutlineCog, HiOutlineLogout, HiOutlineUserGroup, HiOutlineTicket, HiOutlineCash, HiOutlineDocumentReport, HiOutlineRefresh, HiOutlineColorSwatch, HiOutlineOfficeBuilding, HiOutlineCalculator } from "react-icons/hi";

const navItems = [
  { href: "/", label: "Dashboard", icon: HiOutlineHome, roles: ["ADMIN", "MANAGER"] },
  { href: "/pos", label: "POS Terminal", icon: HiOutlineShoppingCart, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { href: "/products", label: "Products", icon: HiOutlineCube, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { href: "/brands", label: "Brands", icon: HiOutlineColorSwatch, roles: ["ADMIN", "MANAGER"] },
  { href: "/categories", label: "Categories", icon: HiOutlineTag, roles: ["ADMIN", "MANAGER"] },
  { href: "/orders", label: "Orders", icon: HiOutlineClipboardList, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { href: "/customers", label: "Customers", icon: HiOutlineUserGroup, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { href: "/coupons", label: "Coupons", icon: HiOutlineTicket, roles: ["ADMIN", "MANAGER"] },
  { href: "/inventory", label: "Inventory", icon: HiOutlineChartBar, roles: ["ADMIN", "MANAGER"] },
  { href: "/stores", label: "Stores", icon: HiOutlineOfficeBuilding, roles: ["ADMIN", "MANAGER"] },
  { href: "/tax-groups", label: "Tax Groups", icon: HiOutlineCalculator, roles: ["ADMIN", "MANAGER"] },
  { href: "/expenses", label: "Expenses", icon: HiOutlineCash, roles: ["ADMIN", "MANAGER"] },
  { href: "/suppliers", label: "Suppliers", icon: HiOutlineTruck, roles: ["ADMIN", "MANAGER"] },
  { href: "/purchase-orders", label: "Purchase Orders", icon: HiOutlineDocumentText, roles: ["ADMIN", "MANAGER"] },
  { href: "/returns", label: "Returns", icon: HiOutlineRefresh, roles: ["ADMIN", "MANAGER"] },
  { href: "/reports", label: "Reports", icon: HiOutlineDocumentReport, roles: ["ADMIN", "MANAGER"] },
  { href: "/users", label: "Users", icon: HiOutlineUsers, roles: ["ADMIN"] },
  { href: "/settings", label: "Settings", icon: HiOutlineCog, roles: ["ADMIN"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const filtered = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside style={{
      width: "260px", minHeight: "100vh", background: "var(--bg-secondary)",
      borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column",
      position: "fixed", left: 0, top: 0, zIndex: 40
    }}>
      {/* Logo */}
      <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 40, height: 40, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: 800, color: "#fff"
          }}>P</div>
          <div>
            <h1 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>POS System</h1>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Point of Sale</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem", overflowY: "auto" }}>
        {filtered.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: active ? 600 : 400, textDecoration: "none",
              padding: "0.75rem 1rem",
              background: active ? "var(--accent)" : "transparent",
              color: active ? "#fff" : "var(--text-secondary)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}}
            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{
            width: 36, height: 36, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "#fff"
          }}>{user?.fullName?.charAt(0) || "U"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.fullName}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="btn btn-ghost" style={{ width: "100%", fontSize: "0.8rem" }}>
          <HiOutlineLogout size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
