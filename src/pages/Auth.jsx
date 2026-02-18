import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    position: "relative",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "48px 44px",
    width: "100%",
    maxWidth: 420,
    position: "relative",
    zIndex: 1,
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 32,
  },
  logoIcon: {
    width: 38,
    height: 38,
    background: "var(--accent)",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  logoText: {
    fontFamily: "Syne, sans-serif",
    fontWeight: 800,
    fontSize: 20,
    color: "var(--text)",
    letterSpacing: "-0.03em",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 6,
    color: "var(--text)",
  },
  sub: {
    color: "var(--text-muted)",
    fontSize: 14,
    marginBottom: 32,
  },
  tabs: {
    display: "flex",
    background: "var(--surface2)",
    borderRadius: "var(--radius-sm)",
    padding: 4,
    marginBottom: 28,
    gap: 4,
  },
  tab: (active) => ({
    flex: 1,
    padding: "8px 0",
    border: "none",
    borderRadius: 6,
    background: active ? "var(--accent)" : "transparent",
    color: active ? "#fff" : "var(--text-muted)",
    fontWeight: 600,
    fontSize: 14,
    transition: "all 0.2s",
  }),
  field: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-muted)",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text)",
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s",
  },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
    marginTop: 4,
  },
  checkbox: {
    width: 16,
    height: 16,
    accentColor: "var(--accent)",
    cursor: "pointer",
  },
  checkLabel: {
    fontSize: 14,
    color: "var(--text-muted)",
    cursor: "pointer",
  },
  btn: {
    width: "100%",
    padding: "14px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontSize: 15,
    fontWeight: 600,
    transition: "opacity 0.2s, transform 0.1s",
  },
  error: {
    background: "rgba(255,92,92,0.1)",
    border: "1px solid rgba(255,92,92,0.3)",
    color: "var(--red)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  },
};

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (err || !data) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));
    navigate(data.is_staff ? "/staff" : "/student");
    setLoading(false);
  }

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      setError("An account with this email already exists.");
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from("users")
      .insert([{ email, password, is_staff: isStaff }])
      .select()
      .single();

    if (err || !data) {
      setError("Could not create account. Please try again.");
      setLoading(false);
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));
    navigate(data.is_staff ? "/staff" : "/student");
    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🖨️</div>
          <span style={styles.logoText}>GetYourPrint</span>
        </div>
        <h1 style={styles.title}>{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p style={styles.sub}>
          {mode === "login"
            ? "Sign in to manage your print jobs"
            : "Join the campus printing system"}
        </p>

        <div style={styles.tabs}>
          <button style={styles.tab(mode === "login")} onClick={() => { setMode("login"); setError(""); }}>
            Log In
          </button>
          <button style={styles.tab(mode === "signup")} onClick={() => { setMode("signup"); setError(""); }}>
            Sign Up
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={mode === "login" ? handleLogin : handleSignup}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {mode === "signup" && (
            <div style={styles.checkRow}>
              <input
                id="staff"
                type="checkbox"
                style={styles.checkbox}
                checked={isStaff}
                onChange={(e) => setIsStaff(e.target.checked)}
              />
              <label htmlFor="staff" style={styles.checkLabel}>
                Register as staff member
              </label>
            </div>
          )}

          <button
            style={styles.btn}
            type="submit"
            disabled={loading}
            onMouseOver={(e) => (e.target.style.opacity = "0.88")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}