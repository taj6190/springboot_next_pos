"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import { HiOutlineLockClosed, HiOutlineUser } from "react-icons/hi";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error("Please fill in all fields");
    setLoading(true);
    try {
      await login(username, password);
      toast.success("Welcome back!");
      router.push("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: "10%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "rgba(99,102,241,0.08)", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "rgba(139,92,246,0.06)", filter: "blur(100px)" }} />

      <div className="animate-scale-in" style={{ width: "100%", maxWidth: 420, padding: "2.5rem", background: "rgba(30,41,59,0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 20, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", fontWeight: 800, color: "#fff", marginBottom: "1rem", boxShadow: "0 8px 32px rgba(99,102,241,0.4)" }}>P</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, background: "linear-gradient(135deg, #e2e8f0, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>POS System</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem", display: "block" }}>Username</label>
            <div style={{ position: "relative" }}>
              <HiOutlineUser size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" style={{ paddingLeft: "2.5rem" }} autoFocus />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem", display: "block" }}>Password</label>
            <div style={{ position: "relative" }}>
              <HiOutlineLockClosed size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" style={{ paddingLeft: "2.5rem" }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem", fontWeight: 600, marginTop: "0.5rem" }}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "1.5rem" }}>
          Default: <span style={{ color: "var(--accent)" }}>admin</span> / <span style={{ color: "var(--accent)" }}>admin123</span>
        </p>
      </div>
    </div>
  );
}
