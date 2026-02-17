import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "var(--yellow)", bg: "rgba(245,200,66,0.1)", border: "rgba(245,200,66,0.3)" },
  printing: { label: "Printing", color: "var(--accent)", bg: "rgba(108,99,255,0.1)", border: "rgba(108,99,255,0.3)" },
  completed: { label: "Completed", color: "var(--green)", bg: "rgba(62,207,142,0.1)", border: "rgba(62,207,142,0.3)" },
};

const s = {
  page: { minHeight: "100vh", background: "var(--bg)" },
  main: { maxWidth: 1000, margin: "0 auto", padding: "40px 24px" },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  sub: { color: "var(--text-muted)", fontSize: 14 },
  statsRow: { display: "flex", gap: 16, marginBottom: 36 },
  statCard: (color, bg, border) => ({
    flex: 1,
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  statLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 },
  statNum: (color) => ({ fontSize: 30, fontWeight: 800, fontFamily: "Syne", color }),
  filterRow: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  filterBtn: (active) => ({
    padding: "7px 16px",
    borderRadius: 20,
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "rgba(108,99,255,0.15)" : "transparent",
    color: active ? "var(--accent)" : "var(--text-muted)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  }),
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    overflow: "hidden",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface2)",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid var(--border)",
    fontSize: 14,
    color: "var(--text)",
    verticalAlign: "middle",
  },
  email: {
    fontWeight: 500,
    color: "var(--text)",
  },
  fileName: {
    color: "var(--accent)",
    textDecoration: "none",
    fontSize: 13,
  },
  meta: { fontSize: 12, color: "var(--text-muted)" },
  statusPill: (status) => ({
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    display: "inline-block",
    background: STATUS_CONFIG[status]?.bg || "rgba(255,255,255,0.05)",
    color: STATUS_CONFIG[status]?.color || "var(--text-muted)",
    border: `1px solid ${STATUS_CONFIG[status]?.border || "var(--border)"}`,
  }),
  actionRow: { display: "flex", gap: 6, alignItems: "center" },
  actionBtn: (color) => ({
    padding: "5px 12px",
    borderRadius: 6,
    border: `1px solid ${color}`,
    background: "transparent",
    color: color,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  }),
  deleteBtn: {
    padding: "5px 10px",
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-muted)",
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "var(--text-muted)",
    fontSize: 14,
  },
};

export default function StaffDash() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 15000);
    return () => clearInterval(interval);
  }, []);

  async function fetchJobs() {
    const { data, error } = await supabase
      .from("print_job")
      .select("*, users(email)")
      .order("created_at", { ascending: false });

    if (!error && data) setJobs(data);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await supabase.from("print_job").update({ status }).eq("id", id);
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
  }

  async function deleteJob(id) {
    await supabase.from("print_job").delete().eq("id", id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getFileName(url) {
    try {
      const parts = decodeURIComponent(url).split("/");
      const last = parts[parts.length - 1];
      return last.split("_").slice(1).join("_") || last;
    } catch {
      return "document.pdf";
    }
  }

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.main}>
        <div style={s.header}>
          <h1 style={s.title}>Staff Dashboard</h1>
          <p style={s.sub}>Manage all print requests from students</p>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { key: "pending", label: "Pending", icon: "⏳" },
            { key: "printing", label: "Printing", icon: "🖨️" },
            { key: "completed", label: "Completed", icon: "✅" },
          ].map(({ key, label, icon }) => {
            const cfg = STATUS_CONFIG[key];
            const count = jobs.filter((j) => j.status === key).length;
            return (
              <div key={key} style={s.statCard(cfg.color, cfg.bg, cfg.border)}>
                <div>
                  <div style={s.statLabel}>{label}</div>
                  <div style={s.statNum(cfg.color)}>{count}</div>
                </div>
                <span style={{ fontSize: 26 }}>{icon}</span>
              </div>
            );
          })}
          <div style={s.statCard("var(--text)", "var(--surface2)", "var(--border)")}>
            <div>
              <div style={s.statLabel}>Total</div>
              <div style={s.statNum("var(--text)")}>{jobs.length}</div>
            </div>
            <span style={{ fontSize: 26 }}>📋</span>
          </div>
        </div>

        {/* Filters */}
        <div style={s.filterRow}>
          {["all", "pending", "printing", "completed"].map((f) => (
            <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
            Auto-refreshes every 15s
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div style={s.empty}>Loading print jobs…</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, ...s.empty }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗂️</div>
            No {filter !== "all" ? filter : ""} print jobs found.
          </div>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid var(--border)" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Student</th>
                  <th style={s.th}>File</th>
                  <th style={s.th}>Copies</th>
                  <th style={s.th}>Submitted</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job, i) => (
                  <tr
                    key={job.id}
                    style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--surface2)" }}
                  >
                    <td style={s.td}>
                      <span style={s.email}>{job.users?.email || "Unknown"}</span>
                    </td>
                    <td style={s.td}>
                      <a
                        href={job.file_url}
                        target="_blank"
                        rel="noreferrer"
                        style={s.fileName}
                      >
                        📄 {getFileName(job.file_url)}
                      </a>
                    </td>
                    <td style={s.td}>
                      <span style={{ fontWeight: 600 }}>{job.copies}</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.meta}>{formatDate(job.created_at)}</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.statusPill(job.status)}>
                        {STATUS_CONFIG[job.status]?.label || job.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.actionRow}>
                        {job.status === "pending" && (
                          <button
                            style={s.actionBtn("var(--accent)")}
                            onClick={() => updateStatus(job.id, "printing")}
                            onMouseOver={(e) => { e.target.style.background = "rgba(108,99,255,0.15)"; }}
                            onMouseOut={(e) => { e.target.style.background = "transparent"; }}
                          >
                            Start Printing
                          </button>
                        )}
                        {job.status === "printing" && (
                          <button
                            style={s.actionBtn("var(--green)")}
                            onClick={() => updateStatus(job.id, "completed")}
                            onMouseOver={(e) => { e.target.style.background = "rgba(62,207,142,0.15)"; }}
                            onMouseOut={(e) => { e.target.style.background = "transparent"; }}
                          >
                            Mark Complete
                          </button>
                        )}
                        {job.status === "completed" && (
                          <button
                            style={s.deleteBtn}
                            onClick={() => deleteJob(job.id)}
                            onMouseOver={(e) => { e.target.style.color = "var(--red)"; e.target.style.borderColor = "var(--red)"; }}
                            onMouseOut={(e) => { e.target.style.color = "var(--text-muted)"; e.target.style.borderColor = "var(--border)"; }}
                          >
                            🗑 Delete (Collected)
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}