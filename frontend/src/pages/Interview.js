import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VideoPanel from "../components/VideoPanel";
import ChatPanel from "../components/ChatPanel";
import MicButton from "../components/MicButton";
import { sendMessage, getProfile } from "../services/api";

const speak = (text) => {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const voice =
    voices.find(v => v.name.includes("Google UK English Female")) ||
    voices.find(v => v.name.includes("Microsoft Zira")) ||
    voices.find(v => v.name.includes("Female")) ||
    voices.find(v => v.lang === "en-US") ||
    voices[0];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  synth.cancel();
  synth.speak(utterance);
};

const EVAL_STEPS = [
  "Evaluating your responses...",
  "Analyzing communication clarity...",
  "Scoring performance metrics...",
  "Generating your report...",
];

function EvaluatingOverlay() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % EVAL_STEPS.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        .eval-overlay {
          position: fixed;
          inset: 0;
          background: #f8fafc;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          font-family: 'Inter', sans-serif;
        }
        .eval-logo {
          font-size: 22px;
          font-weight: 700;
          color: #2563eb;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .eval-logo-dot {
          width: 10px; height: 10px;
          background: #2563eb;
          border-radius: 50%;
        }
        .eval-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 36px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          min-width: 320px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .eval-spinner {
          width: 44px; height: 44px;
          border: 3px solid #eff6ff;
          border-top: 3px solid #2563eb;
          border-radius: 50%;
          animation: evalSpin 0.8s linear infinite;
        }
        .eval-step {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          text-align: center;
          min-height: 24px;
          animation: evalFade 0.4s ease;
        }
        .eval-dots {
          display: flex;
          gap: 8px;
        }
        .eval-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #3b82f6;
          animation: evalBounce 1s infinite ease-in-out;
        }
        .eval-subtext {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }
        @keyframes evalSpin { to { transform: rotate(360deg); } }
        @keyframes evalFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes evalBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
      <div className="eval-overlay">
        <div className="eval-logo">
          <span className="eval-logo-dot" />
          Hirescope
        </div>
        <div className="eval-card">
          <div className="eval-spinner" />
          <div className="eval-step" key={stepIndex}>
            {EVAL_STEPS[stepIndex]}
          </div>
          <div className="eval-dots">
            <span className="eval-dot" style={{ animationDelay: "0s" }} />
            <span className="eval-dot" style={{ animationDelay: "0.2s" }} />
            <span className="eval-dot" style={{ animationDelay: "0.4s" }} />
          </div>
          <div className="eval-subtext">Please wait, this takes a few seconds</div>
        </div>
      </div>
    </>
  );
}

function Interview() {
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [user, setUser] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [cvReady, setCvReady] = useState(false);
  const [proctorWarning, setProctorWarning] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (targetPath) => {
    if (started && !isEvaluating) {
      const confirmLeave = window.confirm(
        "An active interview is in progress. Leaving now will abandon the session. Are you sure you want to leave?"
      );
      if (!confirmLeave) return;
    }
    window.speechSynthesis.cancel();
    navigate(targetPath);
  };

  const query = new URLSearchParams(window.location.search);
  const appId = query.get("app_id");
  const isPractice = query.get("is_practice") === "true";
  const jobRole = query.get("job_role") || "";

  // eslint-disable-next-line no-unused-vars
  const handleLogout = () => {
  window.speechSynthesis.cancel();   // stop any audio
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/");
};

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) navigate("/");
  else { fetchUser(); }

  window.speechSynthesis.onvoiceschanged = () => {};

  return () => {
    window.speechSynthesis.cancel();
  };
}, [navigate]);   // ✅ ADD THIS

  const startInterview = async () => {
    setStarted(true);
    try {
      setIsThinking(true);
      const res = await sendMessage("Hi", null, appId, isPractice, jobRole);
      setChatId(res.chat_id);
      setMessages([{ role: "assistant", content: res.reply }]);
      speak(res.reply);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const fetchUser = async () => {
    try {
      const data = await getProfile();
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const initCV = async () => {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd");
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface");
        console.log("TFJS proctoring models loaded");
        setCvReady(true);
      } catch (err) {
        console.error("Failed to load proctoring CV scripts:", err);
      }
    };
    initCV();
  }, []);

  useEffect(() => {
    if (!cvReady || !started) return;

    let intervalId;
    let cocoModel = null;
    let faceModel = null;

    const startDetection = async () => {
      try {
        cocoModel = await window.cocoSsd.load();
        faceModel = await window.blazeface.load();

        intervalId = setInterval(async () => {
          const video = document.querySelector("video");
          if (!video || video.readyState < 2) return;

          let warningText = "";

          // 1. Face Detection Check
          try {
            const faces = await faceModel.estimateFaces(video, false);
            if (faces.length > 1) {
              warningText = "Multiple faces detected. Please ensure you are alone.";
            } else if (faces.length === 1) {
              const face = faces[0];
              const landmarks = face.landmarks; // [rightEye, leftEye, nose, mouth, rightEar, leftEar]
              if (landmarks && landmarks.length >= 3) {
                const rightEye = landmarks[0];
                const leftEye = landmarks[1];
                const nose = landmarks[2];

                const leftDist = Math.abs(nose[0] - leftEye[0]);
                const rightDist = Math.abs(nose[0] - rightEye[0]);
                const ratio = leftDist / (rightDist || 1);

                if (ratio < 0.42 || ratio > 2.38) {
                  warningText = "Eye contact lost. Please look directly at the screen.";
                }
              }
            } else if (faces.length === 0) {
              warningText = "No face detected. Please face the camera.";
            }
          } catch (e) {
            console.error("Face detection error:", e);
          }

          // 2. Mobile Device Detection Check (only if face is ok to prevent warning spam)
          if (!warningText && cocoModel) {
            try {
              const predictions = await cocoModel.detect(video);
              const phone = predictions.find(p => p.class === "cell phone" && p.score > 0.5);
              if (phone) {
                warningText = "Unauthorised device detected. Please remove all mobile devices.";
              }
            } catch (e) {
              console.error("Object detection error:", e);
            }
          }

          setProctorWarning(warningText);
        }, 1000);
      } catch (err) {
        console.error("Error initializing proctoring models:", err);
      }
    };

    startDetection();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cvReady, started]);

  const handleSend = async (text) => {
  try {
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setIsThinking(true);
 
    const res = await sendMessage(text, chatId, appId, isPractice, jobRole);
    if (!chatId) setChatId(res.chat_id);

    // 🔥 CHECK FIRST (before showing or speaking)
    if (res.reply.includes("Clarity:")) {

      let history = JSON.parse(localStorage.getItem("results")) || [];
      history.push({ result: res.reply, date: new Date().toLocaleString() });
      localStorage.setItem("results", JSON.stringify(history));

      setIsThinking(false);
      setIsEvaluating(true);

      const delay = Math.floor(Math.random() * 2000) + 3000;

      setTimeout(() => {
        window.speechSynthesis.cancel();   // 🔥 ADD THIS
        navigate("/result");
      }, delay);

      return; // ❗ STOP — no chat, no speech
    }

    // ✅ Normal flow (only for questions)
    setMessages([...newMessages, { role: "assistant", content: res.reply }]);
    speak(res.reply);
    setIsThinking(false);

  } catch (err) {
    console.error(err);
    setIsThinking(false);
  }
};

  return (
    <>
      {isEvaluating && <EvaluatingOverlay />}

      <style>{`
        * { box-sizing: border-box; }
        .interview-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', sans-serif;
        }
        .interview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 70px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          flex-shrink: 0;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo { font-size: 18px; font-weight: 700; color: #2563eb; letter-spacing: -0.3px; }
        .results-btn {
          background: #2563eb; color: #ffffff;
          border: 1px solid #2563eb; border-radius: 6px;
          padding: 8px 16px; font-size: 13px;
          font-weight: 600; cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s;
        }
        .results-btn:hover {
          background: #1d4ed8;
          border-color: #1d4ed8;
        }
        .back-dashboard-btn {
          background: transparent;
          color: #2563eb;
          border: 1px solid #2563eb;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .back-dashboard-btn:hover {
          background: #eff6ff;
        }
        .video-section {
          position: relative;
        }
        .proctor-warning-popup {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 12px 16px;
          margin-top: 8px;
          animation: pulse 2s infinite;
          box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.05);
        }
        .proctor-warning-icon {
          font-size: 18px;
          color: #dc2626;
        }
        .proctor-warning-text {
          font-size: 13px;
          font-weight: 600;
          color: #991b1b;
          line-height: 1.4;
        }
        .hs-logo {
          font-size: 20px;
          font-weight: 700;
          color: #2563eb;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: -0.3px;
        }
        .hs-logo-dot {
          width: 10px;
          height: 10px;
          background: #2563eb;
          border-radius: 50%;
        }
        .interview-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .left-panel {
          width: 34%;
          padding: 24px;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow: hidden;
          background: #ffffff;
          flex-shrink: 0;
        }
        .profile-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
        }
        .profile-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #cbd5e1;
          flex-shrink: 0;
        }
        .profile-name { font-size: 14.5px; font-weight: 600; color: #0f172a; margin: 0 0 2px; }
        .profile-email { font-size: 12px; color: #64748b; margin: 0; }
        .right-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #f8fafc;
        }
        .thinking-badge {
          display: flex; align-items: center; gap: 6px;
          background: #eff6ff; border: 1px solid #bfdbfe;
          border-radius: 6px; padding: 10px 14px;
        }
        .think-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #2563eb; display: inline-block;
          animation: thinkBounce .8s infinite ease-in-out;
        }
        .think-label { font-size: 12.5px; font-weight: 600; color: #1e40af; margin-left: 4px; }
        .info-wrap {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .role-card {
          border-radius: 8px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .header-actions-desktop {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .header-menu-mobile-btn {
          display: none;
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #475569;
          padding: 4px;
          align-items: center;
          justify-content: center;
          outline: none;
        }
        .header-dropdown-menu-mobile {
          position: absolute;
          top: 60px;
          right: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          width: 180px;
          z-index: 1000;
          padding: 6px 0;
          display: flex;
          flex-direction: column;
        }
        .header-dropdown-item {
          background: transparent;
          border: none;
          padding: 10px 16px;
          text-align: left;
          font-size: 13.5px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          width: 100%;
          transition: background 0.15s, color 0.15s;
          font-family: inherit;
          outline: none;
        }
        .header-dropdown-item:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        @media (max-width: 768px) {
          .interview-header { padding: 0 16px; height: 60px; }
          .interview-body {
            flex-direction: column;
            overflow: hidden;
            height: calc(100vh - 60px);
          }
          .left-panel {
            width: 100%;
            height: auto;
            max-height: 48%;
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
            padding: 14px 16px;
            gap: 12px;
            overflow-y: auto;
            flex-shrink: 0;
          }
          .info-wrap {
            flex-direction: row;
            gap: 10px;
            width: 100%;
          }
          .profile-card, .role-card {
            flex: 1;
            margin: 0;
          }
          .role-card {
            padding: 10px 12px;
          }
          .vp-frame {
            aspect-ratio: 16/9 !important;
            max-height: 160px !important;
            width: 100% !important;
            max-width: 280px;
            margin: 0 auto;
          }
          .right-panel {
            width: 100%;
            flex: 1;
            min-height: 0;
            overflow: hidden;
          }
          .profile-card { padding: 10px 12px; }
          .profile-avatar { width: 38px; height: 38px; }
          .profile-name { font-size: 13.5px; }
          .profile-email { display: none; }
          .header-actions-desktop {
            display: none;
          }
          .header-menu-mobile-btn {
            display: flex;
          }
        }

        @keyframes thinkBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>

      <div className="interview-page">
        <div className="interview-header" style={{ position: "relative" }}>
          <div className="header-left">
            <div className="hs-logo">
              <span className="hs-logo-dot" />
              Hirescope
            </div>
          </div>
          
          <div className="header-actions-desktop">
            <button
              className="back-dashboard-btn"
              onClick={() => handleNavClick("/candidate-dashboard")}
            >
              ← Back to Dashboard
            </button>

            <button
              className="results-btn"
              onClick={() => handleNavClick("/result")}
            >
              View Results →
            </button>
          </div>

          <button 
            className="header-menu-mobile-btn" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            ☰
          </button>

          {menuOpen && (
            <>
              <div 
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 999,
                  background: "transparent"
                }}
                onClick={() => setMenuOpen(false)}
              />
              <div className="header-dropdown-menu-mobile">
                <button
                  className="header-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    handleNavClick("/candidate-dashboard");
                  }}
                >
                  ← Dashboard
                </button>
                <button
                  className="header-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    handleNavClick("/result");
                  }}
                >
                  Results →
                </button>
              </div>
            </>
          )}
        </div>

        <div className="interview-body">
          <div className="left-panel">
            <div className="info-wrap">
              {user && (
                <div className="profile-card profile-section">
                  <img src={user.image} alt="profile" className="profile-avatar" />
                  <div>
                    <p className="profile-name">{user.name}</p>
                    <p className="profile-email">{user.email}</p>
                  </div>
                </div>
              )}

              <div className="role-card" style={{
                background: isPractice ? "#eff6ff" : "#f8fafc",
                border: `1px solid ${isPractice ? "#bfdbfe" : "#e2e8f0"}`
              }}>
                <span style={{ fontSize: "10.5px", color: isPractice ? "#2563eb" : "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                  {isPractice ? "Practice Interview" : "Official Assessment"}
                </span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                  {isPractice ? jobRole : "Company Assessment Role"}
                </span>
              </div>
            </div>
            <div className="video-section">
              <VideoPanel />
            </div>
            <div className="mic-section">
              <MicButton onSend={handleSend} disabled={!started} />
            </div>
            {isThinking && (
              <div className="thinking-badge">
                <span className="think-dot" style={{ animationDelay: "0s" }} />
                <span className="think-dot" style={{ animationDelay: ".2s" }} />
                <span className="think-dot" style={{ animationDelay: ".4s" }} />
                <span className="think-label">AI is thinking</span>
              </div>
            )}
          </div>

          <div className="right-panel">
            <ChatPanel
              messages={messages}
              isThinking={isThinking}
              started={started}
              onStart={startInterview}
              warning={proctorWarning}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Interview;