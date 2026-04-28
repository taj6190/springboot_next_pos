import { create } from "zustand";
import Cookies from "js-cookie";
import api from "@/lib/api";

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  // Computed
  get isAdmin() { return get().user?.role === "ADMIN"; },
  get isManager() { return get().user?.role === "MANAGER"; },
  get isAdminOrManager() { return ["ADMIN", "MANAGER"].includes(get().user?.role); },

  checkAuth: async () => {
    const token = Cookies.get("accessToken");
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data.data, loading: false });
    } catch {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      set({ user: null, loading: false });
    }
  },

  login: async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    const { accessToken, refreshToken, user } = res.data.data;
    Cookies.set("accessToken", accessToken, { expires: 1 });
    Cookies.set("refreshToken", refreshToken, { expires: 7 });
    set({ user });
    return user;
  },

  logout: () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    set({ user: null });
    if (typeof window !== "undefined") window.location.href = "/login";
  },
}));

export default useAuthStore;
