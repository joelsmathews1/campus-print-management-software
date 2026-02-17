import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "var(--yellow)", bg: "rgba(245,200,66,0.1)", border: "rgba(245,200,66,0.3)" },
  printing: { label: "Printing", color: "var(--accent)", bg: "rgba(108,99,255,0.1)", border: "rgba(108,99,255,0.3)" },
  completed: { label: "Completed", color: "var(--green)", bg: "rgba(62,207,142,0.1)", border: "rgba(62,207,142,0.3)" },
};

const s = {
  page: { minHeight: "100vh", background: "var(--bg)" },
  main: { maxWidth: 860, margin: "0 auto", padding: "40px 24px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 },
  panel: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 28,
  },
  panelTitle: { fontSize: 18, fontWeight: 700, marginBottom: 6, color: "var(--text)" },
  panelSub: { fontSize: 13, color: "var(--text-muted)", marginBottom: 24 },
  dropzone: (drag) => ({
    border: `2px dashed ${drag ? "var(--accent)" : "var(--border)"}`,
    borderRadius: 12,
    padding: "28px 20px",
    textAlign: "center",
    background: drag ? "rgba(108,99,255,0.06)" : "var(--surface2)",
    transition: "all 0.2s",
    cursor: "pointer",
    marginBottom: 16,
  }),
  dropIcon: { fontSize: 32, marginBottom: 8 },
  dropText: { fontSize: 14, color: "var(--text-muted)" },
  fileName: { fontSize: 13, color: "var(--accent)", marginTop: 6, fontWeight: 500 },
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
    padding: "11px 14px",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 15,
    marginBottom: 16,
    outline: "none",
  },
  submitBtn: {
    width: "100%",
    padding: "13px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    transition: "opacity 0.2s",
  },
  jobsList: { display: "flex", flexDirection: "column", gap: 12 },
  jobCard: {
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  jobLeft: { display: "flex", flexDirection: "column", gap: 4 },
  jobName: { fontSize: 14, fontWeight: 500, color: "var(--text)" },
  jobMeta: { fontSize: 12, color: "var(--text-muted)" },
  statusPill: (status) => ({
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    background: STATUS_CONFIG[status]?.bg || "rgba(255,255,255,0.05)",
    color: STATUS_CONFIG[status]?.color || "var(--text-muted)",
    border: `1px solid ${STATUS_CONFIG[status]?.border || "var(--border)"}`,
    whiteSpace: "nowrap",
  }),
  success: {
    background: "rgba(62,207,142,0.1)",
    border: "1px solid rgba(62,207,142,0.3)",
    color: "var(--green)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  },
  error: {
    background: "rgba(255,92,92,0.1)",
    border: "1px solid rgba(255,92,92,0.3)",
    color: "var(--red)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  },
  empty: {
    textAlign: "center",
    padding: "40px 20px",
    color: "var(--text-muted)",
    fontSize: 14,
  },
  sectionTitle: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  sectionSub: { color: "var(--text-muted)", fontSize: 14, marginBottom: 24 },
  fileInput: { display: "none" },
};

export default function StudentDash() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [file, setFile] = useState(null);
  const [copies, setCopies] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    const { data } = await supabase
      .from("print_job")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setJobs(data || []);
    setLoading(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDrag(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") setFile(dropped);
    else setMsg({ type: "error", text: "Only PDF files are supported." });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return setMsg({ type: "error", text: "Please select a PDF file." });
    setUploading(true);
    setMsg(null);

    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("print-files")
      .upload(fileName, file, { contentType: "application/pdf" });

    if (uploadErr) {
      setMsg({ type: "error", text: "File upload failed. " + uploadErr.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("print-files").getPublicUrl(fileName);

    const { error: insertErr } = await supabase.from("print_job").insert([
      {
        user_id: user.id,
        file_url: urlData.publicUrl,
        copies: parseInt(copies),
        status: "pending",
      },
    ]);

    if (insertErr) {
      setMsg({ type: "error", text: "Could not submit print job." });
    } else {
      setMsg({ type: "success", text: "Print job submitted successfully!" });
      setFile(null);
      setCopies(1);
      fetchJobs();
    }
    setUploading(false);
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

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.main}>
        <div style={s.grid}>
          {/* Submit Panel */}
          <div style={s.panel}>
            <h2 style={s.panelTitle}>New Print Job</h2>
            <p style={s.panelSub}>Upload a PDF and set the number of copies</p>

            {msg && <div style={msg.type === "error" ? s.error : s.success}>{msg.text}</div>}

            <form onSubmit={handleSubmit}>
              <div
                style={s.dropzone(drag)}
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
              >
                <div style={s.dropIcon}>{file ? "📄" : "☁️"}</div>
                <p style={s.dropText}>
                  {file ? "File selected" : "Drag & drop a PDF or click to browse"}
                </p>
                {file && <p style={s.fileName}>{file.name}</p>}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  style={s.fileInput}
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <label style={s.label}>Number of Copies</label>
              <input
                style={s.input}
                type="number"
                min={1}
                max={100}
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />

              <button style={s.submitBtn} type="submit" disabled={uploading}>
                {uploading ? "Uploading…" : "Submit Print Request"}
              </button>
            </form>
          </div>

          {/* Stats Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {["pending", "printing", "completed"].map((status) => {
              const count = jobs.filter((j) => j.status === status).length;
              const cfg = STATUS_CONFIG[status];
              return (
                <div
                  key={status}
                  style={{
                    ...s.panel,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                      {cfg.label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Syne", color: cfg.color }}>
                      {count}
                    </div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {status === "pending" ? "⏳" : status === "printing" ? "🖨️" : "✅"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Jobs Table */}
        <h2 style={s.sectionTitle}>My Print Jobs</h2>
        <p style={s.sectionSub}>Track the status of all your submitted jobs</p>

        {loading ? (
          <div style={s.empty}>Loading jobs…</div>
        ) : jobs.length === 0 ? (
          <div style={{ ...s.panel, ...s.empty }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗂️</div>
            No print jobs yet. Submit your first one above!
          </div>
        ) : (
          <div style={s.jobsList}>
            {jobs.map((job) => (
              <div key={job.id} style={s.jobCard}>
                <div style={s.jobLeft}>
                  <span style={s.jobName}>{getFileName(job.file_url)}</span>
                  <span style={s.jobMeta}>
                    {copies !== job.copies ? `${job.copies} ${job.copies === 1 ? "copy" : "copies"}` : `${job.copies} ${job.copies === 1 ? "copy" : "copies"}`} · {formatDate(job.created_at)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <a
                    href={job.file_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "underline" }}
                  >
                    View PDF
                  </a>
                  <span style={s.statusPill(job.status)}>
                    {STATUS_CONFIG[job.status]?.label || job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}