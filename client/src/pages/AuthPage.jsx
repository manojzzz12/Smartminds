import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const initialMode = useMemo(
    () => new URLSearchParams(location.search).get("mode") || "login",
    [location.search]
  );
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      if (mode === "signup") {
        await signup(form);
      } else {
        await login(form.email, form.password);
      }
      navigate("/app");
    } catch (error) {
      setStatus(error.response?.data?.message || "Authentication failed.");
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Welcome to SourceMind</p>
        <h1>{mode === "signup" ? "Create your workspace" : "Sign in"}</h1>
        <p className="auth-subtitle">
          A cinematic notebook for research, summaries, chat, and source-grounded thinking.
        </p>
        {mode === "signup" ? (
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        ) : null}
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <button className="primary-button" type="submit">
          {mode === "signup" ? "Create Account" : "Login"}
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
        >
          {mode === "signup" ? "Already have an account?" : "Need an account?"}
        </button>
        {status ? <p className="status-text">{status}</p> : null}
      </form>
    </main>
  );
}
