import { createContext, useContext, useEffect, useState } from "react";
import { http } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem("sourcemind-token");
    if (!token) {
      setLoading(false);
      return;
    }

    http
      .get("/auth/me")
      .then((response) => setUser(response.data.user))
      .catch(() => {
        window.localStorage.removeItem("sourcemind-token");
      })
      .finally(() => setLoading(false));
  }, []);

  const auth = {
    user,
    loading,
    async login(email, password) {
      const response = await http.post("/auth/login", { email, password });
      window.localStorage.setItem("sourcemind-token", response.data.token);
      setUser(response.data.user);
      return response.data.user;
    },
    async signup(payload) {
      const response = await http.post("/auth/signup", payload);
      window.localStorage.setItem("sourcemind-token", response.data.token);
      setUser(response.data.user);
      return response.data.user;
    },
    logout() {
      window.localStorage.removeItem("sourcemind-token");
      setUser(null);
    }
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
