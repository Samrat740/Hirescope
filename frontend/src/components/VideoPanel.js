import { useEffect, useRef, useState } from "react";

function VideoPanel() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setOn(true);
      })
      .catch(() => {});
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  return (
    <div style={styles.wrap}>
      <div style={styles.labelRow}>
        <span style={styles.labelText}>Camera</span>
        {on && (
          <div style={styles.livePill}>
            <span style={styles.liveRedDot} />
            LIVE
          </div>
        )}
      </div>

      <div className="vp-frame" style={styles.frame}>
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{ ...styles.video, opacity: on ? 1 : 0 }}
        />
        {!on && (
          <div style={styles.offState}>
            <span style={styles.offIcon}>📷</span>
            <p style={styles.offText}>Camera unavailable</p>
          </div>
        )}
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 8 },
  labelRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  labelText: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px" },
  livePill: {
    display: "flex", alignItems: "center", gap: 5,
    background: "#fef2f2", border: "1px solid #fca5a5",
    borderRadius: 20, padding: "3px 10px",
    fontSize: 10, fontWeight: 700, color: "#dc2626", letterSpacing: ".5px",
  },
  liveRedDot: {
    width: 6, height: 6, borderRadius: "50%", background: "#ef4444",
    display: "inline-block", animation: "blink 1s infinite",
  },
  frame: {
    width: "100%", aspectRatio: "4/3",
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 8, overflow: "hidden", position: "relative",
  },
  video: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  offState: {
    position: "absolute", inset: 0,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 6,
  },
  offIcon: { fontSize: 26, opacity: .3 },
  offText: { fontSize: 12, color: "#94a3b8", margin: 0, fontWeight: 500 },
};

export default VideoPanel;