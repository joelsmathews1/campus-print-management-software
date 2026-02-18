import { useNavigate } from "react-router-dom";

const s = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    height: 64,
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: "Syne, sans-serif",
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: "-0.03em",
  },
  logoIcon: {
    fontSize: 20,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  badge: (isStaff) => ({
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    background: isStaff ? "rgba(108,99,255,0.15)" : "rgba(62,207,142,0.15)",
    color: isStaff ? "var(--accent)" : "var(--green)",
    border: `1px solid ${isStaff ? "rgba(108,99,255,0.3)" : "rgba(62,207,142,0.3)"}`,
  }),
  email: {
    fontSize: 13,
    color: "var(--text-muted)",
  },
  logoutBtn: {
    padding: "7px 16px",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text-muted)",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.2s",
  },
};

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  function logout() {
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav style={s.nav}>
      <div style={s.logo}>
        <span style={s.logoIcon}>🖨️</span>
        GetYourPrint
      </div>
      <div style={s.right}>
        <span style={s.email}>{user.email}</span>
        <span style={s.badge(user.is_staff)}>{user.is_staff ? "Staff" : "Student"}</span>
        <button
          style={s.logoutBtn}
          onClick={logout}
          onMouseOver={(e) => {
            e.target.style.borderColor = "var(--accent)";
            e.target.style.color = "var(--accent)";
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.color = "var(--text-muted)";
          }}
        >
          Log out
        </button>
      </div>
    </nav>
  );
}