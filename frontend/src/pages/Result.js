import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Parse AI result text ─────────────────────────────────────────── */
function parseResult(text) {
  const sections = { strengths: [], weaknesses: [], verdict: "", metrics: [] };

  const strengthsMatch = text.match(/Strengths:\s*([\s\S]*?)(?=Weaknesses:|Verdict:|Clarity:|$)/i);
  const weaknessesMatch = text.match(/Weaknesses:\s*([\s\S]*?)(?=Strengths:|Verdict:|Clarity:|$)/i);
  const verdictMatch = text.match(/Verdict:\s*([^\n]+)/i);

  if (strengthsMatch)
    sections.strengths = strengthsMatch[1].split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  if (weaknessesMatch)
    sections.weaknesses = weaknessesMatch[1].split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  if (verdictMatch)
    sections.verdict = verdictMatch[1].trim().toUpperCase();

  const scoreLines = text.match(/^(.+?):\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/gm) || [];
  sections.metrics = scoreLines.map(line => {
    const m = line.match(/^(.+?):\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/);
    return { label: m[1].trim(), score: parseFloat(m[2]), total: parseFloat(m[3]) };
  });

  return sections;
}

/* ─── Conversation Side Panel ───────────────────────────────────────── */
function ConversationPanel({ chatId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    setError(null);

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/history/${chatId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(r => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then(data => {
        const msgs = Array.isArray(data) ? data : (data.messages || data.history || []);
        setMessages(msgs);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [chatId]);

  useEffect(() => {
    const onKey = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll when panel open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      <div onClick={onClose} style={pS.backdrop} />
      <div className="conv-drawer" style={pS.drawer}>

        {/* Header */}
        <div style={pS.panelHeader}>
          <div>
            <p style={pS.panelTitle}>Conversation</p>
            <p style={pS.panelSub}>Chat ID: {chatId}</p>
          </div>
          <button onClick={onClose} className="result-close-btn">✕</button>
        </div>

        {/* Body */}
        <div style={pS.panelBody}>
          {loading && (
            <div style={pS.center}>
              <div style={pS.spinner} />
              <p style={pS.centerText}>Loading conversation…</p>
            </div>
          )}

          {error && !loading && (
            <div style={pS.errorBox}>
              <p style={pS.errorTitle}>Failed to load</p>
              <p style={pS.errorMsg}>{error}</p>
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div style={pS.center}>
              <p style={pS.centerText}>No messages found.</p>
            </div>
          )}

          {!loading && !error && messages.map((msg, i) => {
            const role = (msg.role || msg.sender || "").toLowerCase();
            const isUser = role === "user";
            const content = msg.content || msg.message || msg.text || "";
            return (
              <div key={i} style={{ ...pS.msgRow, justifyContent: isUser ? "flex-end" : "flex-start" }}>
                {!isUser && <div style={pS.avatarAI}>AI</div>}
                <div style={{
                  ...pS.bubble,
                  background: isUser ? "#eff6ff" : "#ffffff",
                  color: isUser ? "#1e40af" : "#334155",
                  border: isUser ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                  borderRadius: isUser ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                }}>
                  <p style={{ lineHeight: 1.55, wordBreak: "break-word" }}>{content}</p>
                  {msg.timestamp && (
                    <p style={{ ...pS.ts, color: isUser ? "rgba(30, 64, 175, 0.6)" : "#94a3b8" }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
                {isUser && <div style={pS.avatarUser}>U</div>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ─── Result Card ───────────────────────────────────────────────────── */
function ResultCard({ result, index }) {
  const [open, setOpen] = useState(false);   // closed by default ✓
  const [showChat, setShowChat] = useState(false);
  const parsed = parseResult(result.result);

  const isAccept =
  parsed.verdict &&
  (
    parsed.verdict.includes("SELECT") ||
    parsed.verdict.includes("ACCEPT") ||
    parsed.verdict.includes("PASS") ||
    parsed.verdict.includes("HIRE") ||
    parsed.verdict.includes("SHORTLIST")
  );

  const handleCloseChat = useCallback(() => setShowChat(false), []);

  return (
    <>
      {showChat && (
        <ConversationPanel
          chatId={result.chat || result.chat_id}
          onClose={handleCloseChat}
        />
      )}

      <div style={s.card}>
        {/* Accent bar */}
        <div style={{
          ...s.accentBar,
          background: isAccept
            ? "linear-gradient(180deg,#10b981,#34d399)"
            : parsed.verdict
            ? "linear-gradient(180deg,#ef4444,#f87171)"
            : "linear-gradient(180deg,#3b82f6,#60a5fa)",
        }} />

        <div style={s.cardInner}>
          {/* Card header */}
          <div style={s.cardHeader}>
            <div style={s.cardHeaderLeft}>
              <div style={s.sessionBadge}>{result.is_practice ? "🎯" : `#${index}`}</div>
              <div>
                <p style={s.cardIndex}>{result.is_practice ? `Practice: ${result.practice_job_role || 'General'}` : `Session #${index}`}</p>
                <p style={s.cardDate}>
                  {new Date(result.date + "Z").toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>

            <div className="card-header-right" style={s.cardHeaderRight}>
              {parsed.verdict && (
                <div style={{
                  ...s.verdictPill,
                  background: isAccept ? "#ecfdf5" : "#fef2f2",
                  borderColor: isAccept ? "#a7f3d0" : "#fca5a5",
                  color: isAccept ? "#065f46" : "#991b1b",
                }}>
                  <span style={{ ...s.verdictDot, background: isAccept ? "#10b981" : "#ef4444" }} />
                  {parsed.verdict}
                </div>
              )}

              <div className="btn-group" style={s.btnGroup}>
                <button className="result-chat-btn" onClick={() => setShowChat(true)}>
                  💬 Conversation
                </button>
                <button className="result-view-btn" onClick={() => setOpen(o => !o)}>
                  {open ? "Hide ↑" : "Details ↓"}
                </button>
              </div>
            </div>
          </div>

          {/* Expandable body */}
          <div style={{
            ...s.expandWrap,
            maxHeight: open ? "2000px" : "0px",
            opacity: open ? 1 : 0,
          }}>
            <div style={s.divider} />
            <div style={s.cardBody}>

              {parsed.metrics.length > 0 && (
                <div>
                  <p style={s.sectionLabel}>Score Breakdown</p>
                  <div style={s.metricsGrid}>
                    {parsed.metrics.map((m, i) => {
                      const pct = (m.score / m.total) * 100;
                      const barColor = pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";
                      return (
                        <div key={i} style={s.metricBox}>
                          <p style={s.metricLabel}>{m.label}</p>
                          <p style={s.metricScore}>
                            {m.score}<span style={s.metricTotal}> / {m.total}</span>
                          </p>
                          <div style={s.barBg}>
                            <div style={{ ...s.barFill, width: `${pct}%`, background: barColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {parsed.strengths.length > 0 && (
                <div>
                  <p style={s.sectionLabel}>Strengths</p>
                  <div style={{ ...s.listBox, borderLeft: "3px solid #6ee7b7", background: "#f0fdf4" }}>
                    {parsed.strengths.map((str, i) => (
                      <div key={i} style={s.listItem}>
                        <span style={s.dotGreen} />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsed.weaknesses.length > 0 && (
                <div>
                  <p style={s.sectionLabel}>Weaknesses</p>
                  <div style={{ ...s.listBox, borderLeft: "3px solid #fca5a5", background: "#fff5f5" }}>
                    {parsed.weaknesses.map((w, i) => (
                      <div key={i} style={s.listItem}>
                        <span style={s.dotRed} />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */
function Result() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("company"); // "company" or "practice"

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/results/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => console.error(err));
  }, []);

  const companyResults = results.filter(r => !r.is_practice);
  const practiceResults = results.filter(r => r.is_practice);
  const filteredResults = activeTab === "company" ? companyResults : practiceResults;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Inter, sans-serif; background-color: #f8fafc; }

        .hs-logo {
          font-size: 20px; font-weight: 700; color: #2563eb;
          display: flex; align-items: center; gap: 8px;
        }
        .hs-logo-dot { width: 10px; height: 10px; background: #2563eb; border-radius: 50%; }

        .results-list { display: flex; flex-direction: column; gap: 16px; }

        .results-tabs {
          display: flex;
          gap: 12px;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 24px;
          padding-bottom: 4px;
        }
        .results-tab {
          background: transparent;
          border: none;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          padding: 8px 16px;
          cursor: pointer;
          position: relative;
          outline: none;
          transition: color 0.2s;
        }
        .results-tab:hover {
          color: #334155;
        }
        .results-tab.active {
          color: #2563eb;
        }
        .results-tab.active::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          right: 0;
          height: 2px;
          background: #2563eb;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .result-back-btn {
          background: transparent; color: #2563eb; border: 1px solid #2563eb;
          padding: 8px 16px; border-radius: 6px; cursor: pointer;
          font-family: 'Inter', sans-serif; fontSize: 13px; fontWeight: 600;
          transition: all 0.2s;
        }
        .result-back-btn:hover {
          background-color: #eff6ff;
        }

        .result-chat-btn {
          background: #ffffff; color: #475569;
          border: 1px solid #cbd5e1;
          padding: 6px 12px; border-radius: 6px; cursor: pointer;
          fontSize: 12px; fontWeight: 600; fontFamily: "Inter, sans-serif";
          display: inline-flex; alignItems: center; gap: 4px; white-space: nowrap;
          transition: all 0.2s;
        }
        .result-chat-btn:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
          color: #1e293b;
        }

        .result-view-btn {
          background: #2563eb; color: #fff; border: 1px solid #2563eb;
          padding: 6px 12px; border-radius: 6px; cursor: pointer;
          fontSize: 12px; fontWeight: 600; fontFamily: "Inter, sans-serif"; white-space: nowrap;
          transition: all 0.2s;
        }
        .result-view-btn:hover {
          background-color: #1d4ed8;
          border-color: #1d4ed8;
        }

        .result-close-btn {
          background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;
          width: 30px; height: 30px; border-radius: 6px; cursor: pointer;
          fontSize: 13px; display: flex; alignItems: center; justifyContent: center;
          flex-shrink: 0; transition: all 0.2s;
        }
        .result-close-btn:hover {
          background-color: #e2e8f0;
          color: #0f172a;
        }

        /* Mobile: card header stacks */
        @media (max-width: 560px) {
          .card-header-right {
            flex-direction: column !important;
            align-items: flex-start !important;
            width: 100% !important;
          }
          .btn-group {
            width: 100% !important;
            margin-top: 8px;
          }
          .btn-group button { flex: 1 !important; justify-content: center !important; }
        }

        /* Mobile: drawer becomes bottom sheet */
        @media (max-width: 600px) {
          .conv-drawer {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 88vh !important;
            border-radius: 20px 20px 0 0 !important;
            box-shadow: 0 -8px 40px rgba(0,0,0,0.18) !important;
          }
        }
      `}</style>

      <div style={s.page}>
        <div style={s.header}>
          <div className="hs-logo">
            <span className="hs-logo-dot" />
            Hirescope
          </div>
          <button className="result-back-btn" onClick={() => navigate("/candidate-dashboard")}>← Back</button>
        </div>

        <div style={s.body}>
          <h1 style={s.title}>Interview Results</h1>
          <p style={s.subtitle}>{results.length} session{results.length !== 1 && "s"} completed</p>

          <div className="results-tabs">
            <button
              className={`results-tab ${activeTab === "company" ? "active" : ""}`}
              onClick={() => setActiveTab("company")}
            >
              Company Assessments ({companyResults.length})
            </button>
            <button
              className={`results-tab ${activeTab === "practice" ? "active" : ""}`}
              onClick={() => setActiveTab("practice")}
            >
              Practice Sessions ({practiceResults.length})
            </button>
          </div>

          {filteredResults.length === 0 ? (
            <div style={s.emptyState}>
              <h3 style={{ marginBottom: 6, color: "#475569" }}>No results yet</h3>
              <p style={{ fontSize: 13.5, color: "#64748b" }}>
                {activeTab === "company" 
                  ? "Complete a company screening interview to see your scorecard." 
                  : "Start a practice interview from the dashboard to see your practice scorecard."}
              </p>
            </div>
          ) : (
            <div className="results-list">
              {[...filteredResults].reverse().map((r, i) => (
                <ResultCard key={i} result={r} index={filteredResults.length - i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Card Styles ───────────────────────────────────────────────────── */
const s = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "0 24px", height: 70, background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
  },
  body: { maxWidth: 780, margin: "0 auto", padding: "40px 20px" },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 6, color: "#0f172a" },
  subtitle: { color: "#64748b", marginBottom: 24, fontSize: 14.5 },

  card: {
    background: "#ffffff", borderRadius: 12,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    display: "flex", overflow: "hidden",
  },
  accentBar: { width: 5, flexShrink: 0 },
  cardInner: { flex: 1, minWidth: 0 },

  cardHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px", background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0", gap: 10, flexWrap: "wrap",
  },
  cardHeaderLeft: { display: "flex", alignItems: "center", gap: 10 },
  cardHeaderRight: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },

  sessionBadge: {
    width: 36, height: 36, borderRadius: 8,
    background: "#eff6ff", border: "1px solid #bfdbfe",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 12, color: "#1e40af", flexShrink: 0,
  },
  cardIndex: { fontWeight: 600, fontSize: 14.5, color: "#0f172a" },
  cardDate: { fontSize: 12, color: "#64748b", marginTop: 2 },

  verdictPill: {
    padding: "5px 12px", borderRadius: 20, border: "1px solid",
    fontWeight: 600, fontSize: 11.5,
    display: "inline-flex", alignItems: "center", gap: 6,
  },
  verdictDot: { width: 6, height: 6, borderRadius: "50%" },

  btnGroup: { display: "flex", gap: 6 },

  divider: { height: "1px", background: "#e2e8f0" },
  expandWrap: { overflow: "hidden", transition: "max-height 0.35s ease, opacity 0.3s ease" },
  cardBody: { padding: 20, display: "flex", flexDirection: "column", gap: 20 },

  sectionLabel: {
    fontSize: 11.5, fontWeight: 700, color: "#64748b",
    marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.6px",
  },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 },
  metricBox: { background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" },
  metricLabel: { fontSize: 11.5, color: "#64748b" },
  metricScore: { fontSize: 20, fontWeight: 700, margin: "4px 0 6px", color: "#0f172a" },
  metricTotal: { fontSize: 12.5, color: "#94a3b8" },
  barBg: { height: 5, background: "#e2e8f0", borderRadius: 10 },
  barFill: { height: "100%", borderRadius: 10 },

  listBox: { borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 10 },
  listItem: { display: "flex", gap: 8, fontSize: 13.5, color: "#334155", lineHeight: 1.5 },
  dotGreen: { width: 6, height: 6, background: "#10b981", borderRadius: "50%", marginTop: 7, flexShrink: 0 },
  dotRed: { width: 6, height: 6, background: "#ef4444", borderRadius: "50%", marginTop: 7, flexShrink: 0 },

  emptyState: {
    textAlign: "center", padding: 60, background: "#ffffff",
    borderRadius: 12, border: "1px dashed #cbd5e1", color: "#64748b",
  },
};

/* ─── Panel Styles ──────────────────────────────────────────────────── */
const pS = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.3)", zIndex: 200, backdropFilter: "blur(1.5px)" },
  drawer: {
    position: "fixed", top: 0, right: 0,
    width: 420, height: "100vh",
    background: "#ffffff", zIndex: 201,
    display: "flex", flexDirection: "column",
    boxShadow: "-8px 0 32px rgba(0,0,0,0.06)",
    fontFamily: "Inter, sans-serif",
  },
  panelHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "20px", background: "#ffffff",
    borderBottom: "1px solid #e2e8f0", flexShrink: 0,
  },
  panelTitle: { fontWeight: 700, fontSize: 16.5, color: "#0f172a" },
  panelSub: { fontSize: 11.5, color: "#64748b", marginTop: 3 },
  panelBody: {
    flex: 1, overflowY: "auto", padding: 20,
    display: "flex", flexDirection: "column", gap: 14,
    background: "#f8fafc",
  },
  center: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    flex: 1, gap: 10, padding: 40,
  },
  spinner: {
    width: 28, height: 28,
    border: "3px solid #eff6ff", borderTop: "3px solid #2563eb",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  centerText: { color: "#64748b", fontSize: 13.5 },
  errorBox: {
    background: "#fef2f2", border: "1px solid #fca5a5",
    borderRadius: 8, padding: "14px 16px",
  },
  errorTitle: { fontWeight: 700, color: "#b91c1c", fontSize: 13.5, marginBottom: 4 },
  errorMsg: { fontSize: 12.5, color: "#dc2626" },

  msgRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  avatarAI: {
    width: 28, height: 28, borderRadius: "50%",
    background: "#2563eb",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700, color: "#ffffff", flexShrink: 0,
  },
  avatarUser: {
    width: 28, height: 28, borderRadius: "50%", background: "#64748b",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700, color: "#ffffff", flexShrink: 0,
  },
  bubble: { maxWidth: "75%", padding: "10px 14px", fontSize: 13.5 },
  ts: { fontSize: 10, marginTop: 4 },
};

export default Result;