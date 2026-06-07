import { useState } from "react";
import axios from "axios";

const hrLoginCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .hr-root {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 100% 0%, #eff6ff 0%, #ffffff 50%, #f8fafc 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 20px;
  }

  .hr-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    padding: 36px 32px;
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-radius: 12px;
  }

  .hr-logo {
    font-size: 22px;
    font-weight: 700;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 2px;
    user-select: none;
  }

  .hr-logo-dot {
    width: 10px;
    height: 10px;
    background: #2563eb;
    border-radius: 50%;
  }

  .hr-title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    text-align: center;
    margin: 0;
  }

  .hr-subtitle {
    font-size: 13px;
    color: #64748b;
    text-align: center;
    margin: -10px 0 10px;
  }

  .hr-form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .hr-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
  }

  .hr-input {
    width: 100%;
    padding: 12px;
    font-family: inherit;
    font-size: 14px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    outline: none;
    color: #0f172a;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .hr-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }

  .hr-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2563eb;
    color: #ffffff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid #2563eb;
    padding: 12px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 10px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
    outline: none;
  }

  .hr-btn:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.15);
  }

  .hr-btn:active {
    background: #1e40af;
    border-color: #1e40af;
  }

  .hr-btn:disabled {
    background: #e2e8f0;
    border-color: #e2e8f0;
    color: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
  }

  .hr-error {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fca5a5;
    padding: 10px;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    border-radius: 6px;
  }

  .hr-back {
    font-size: 13px;
    color: #2563eb;
    text-align: center;
    font-weight: 600;
    cursor: pointer;
    margin-top: 4px;
    text-decoration: none;
    transition: color 0.2s;
  }

  .hr-back:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }
`;

function HRLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/hr-login/`,
        { email, password }
      );

      localStorage.setItem("token", res.data.access);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/hr-dashboard";
    } catch (err) {
      setError(
        err.response?.data?.error || "Invalid credentials or login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hrLoginCSS }} />
      <div className="hr-root">
        <div className="hr-card">
          <div className="hr-logo">
            <span className="hr-logo-dot" />
            HireScope
          </div>
          <p className="hr-title">Official Portal</p>
          <p className="hr-subtitle">Log in to your account</p>

          {error && <div className="hr-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="hr-form-group">
              <label className="hr-label">Email Address</label>
              <input
                type="email"
                className="hr-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hr@hirescope.com"
                required
              />
            </div>

            <div className="hr-form-group">
              <label className="hr-label">Password</label>
              <input
                type="password"
                className="hr-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="hr-btn" disabled={loading}>
              {loading ? "Logging in..." : "Access Dashboard →"}
            </button>
          </form>

          <p className="hr-back" onClick={() => (window.location.href = "/")}>
            ← Back to Candidate Portal
          </p>
        </div>
      </div>
    </>
  );
}

export default HRLogin;
