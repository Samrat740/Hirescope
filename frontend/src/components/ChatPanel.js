import { useEffect, useRef } from "react";

function ChatPanel({ messages, isThinking, started, onStart, warning }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <div style={styles.outer}>
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <div style={styles.statusDot} />
          <span style={styles.topLabel}>Live Conversation</span>
          {warning && (
            <span style={{
              marginLeft: "12px",
              padding: "4px 10px",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "20px",
              fontSize: "11.5px",
              fontWeight: "600",
              color: "#dc2626",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              animation: "pulse 2s infinite"
            }}>
              ⚠️ {warning}
            </span>
          )}
        </div>
        <span style={styles.msgCount}>{messages.length} messages</span>
      </div>

      <div style={styles.feed}>
        {!started && (
        <div style={styles.startWrap}>
          <button style={styles.startBtn} onClick={onStart}>
            Start Interview
          </button>
        </div>
      )}

        {messages.map((msg, i) => (
          <div key={i} style={{ ...styles.row, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && <div style={styles.aiDot}>AI</div>}
            <div style={msg.role === "user" ? styles.userBubble : styles.aiBubble}>
              <span style={msg.role === "user" ? styles.userLabel : styles.aiLabel}>
                {msg.role === "user" ? "You" : "Interviewer"}
              </span>
              <p style={styles.text}>{msg.content}</p>
            </div>
            {msg.role === "user" && <div style={styles.meDot}>Me</div>}
          </div>
        ))}

        {isThinking && (
          <div style={{ ...styles.row, justifyContent: "flex-start" }}>
            <div style={styles.aiDot}>AI</div>
            <div style={styles.aiBubble}>
              <span style={styles.aiLabel}>Interviewer</span>
              <div style={styles.dots}>
                <span style={{ ...styles.dot, animationDelay: "0s" }} />
                <span style={{ ...styles.dot, animationDelay: ".18s" }} />
                <span style={{ ...styles.dot, animationDelay: ".36s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-5px);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      `}</style>
    </div>
  );
}

const styles = {
  outer: {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,   // IMPORTANT
  background: "#fff"
},
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px", borderBottom: "1px solid #e2e8f0", background: "#fff",
  },
  topLeft: { display: "flex", alignItems: "center", gap: 7 },
  statusDot: {
    width: 9, height: 9, borderRadius: "50%",
    background: "#22c55e",
    animation: "pulse 2s infinite",
  },
  topLabel: { fontSize: 13.5, fontWeight: 600, color: "#0f172a" },
  msgCount: {
    fontSize: 11.5, fontWeight: 600, color: "#1e40af",
    background: "#eff6ff", border: "1px solid #bfdbfe",
    borderRadius: 20, padding: "3px 10px",
  },
  feed: {
    flex: 1, overflowY: "auto", padding: "20px",
    display: "flex", flexDirection: "column", gap: 14,
  },
  empty: { margin: "auto", textAlign: "center", padding: 40 },
  emptyText: { fontSize: 14, color: "#bbb", margin: 0 },
  row: {
    display: "flex", alignItems: "flex-end", gap: 7,
    animation: "fadeUp .28s ease forwards",
  },
  aiDot: {
    width: 32, height: 32, minWidth: 32, borderRadius: "50%",
    background: "#2563eb",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700, color: "#ffffff",
  },
  meDot: {
    width: 32, height: 32, minWidth: 32, borderRadius: "50%",
    background: "#64748b",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700, color: "#ffffff",
  },
  aiBubble: {
    maxWidth: "65%", background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "4px 12px 12px 12px", padding: "12px 16px",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.02)",
  },
  userBubble: {
    maxWidth: "65%", background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "12px 4px 12px 12px", padding: "12px 16px",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.02)",
  },
  aiLabel: {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#2563eb", marginBottom: 5,
    textTransform: "uppercase", letterSpacing: ".5px",
  },
  userLabel: {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#64748b", marginBottom: 5,
    textTransform: "uppercase", letterSpacing: ".5px", textAlign: "right",
  },
  text: { margin: 0, fontSize: 14, lineHeight: 1.6, color: "#334155" },
  dots: { display: "flex", gap: 5, alignItems: "center", height: 18 },
  dot: {
    width: 7, height: 7, borderRadius: "50%", background: "#2563eb",
    display: "inline-block", animation: "bounce .9s infinite ease-in-out",
  },
  startWrap: {
  margin: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
},

startBtn: {
  background: "#2563eb",
  color: "#ffffff",
  border: "1px solid #2563eb",
  padding: "12px 24px",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 6,
  cursor: "pointer",
  transition: "all 0.2s",
  boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.15), 0 2px 4px -1px rgba(37, 99, 235, 0.1)",
},
};

export default ChatPanel;