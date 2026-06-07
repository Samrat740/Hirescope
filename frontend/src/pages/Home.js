import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: #f8fafc;
    color: #0f172a;
  }

  .hs-root {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: radial-gradient(circle at 100% 0%, #eff6ff 0%, #ffffff 50%, #f8fafc 100%);
    font-family: 'Inter', sans-serif;
  }

  /* NAVBAR */
  .hs-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 70px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.03);
  }

  @media (max-width: 640px) {
    .hs-nav {
      padding: 0 20px;
    }
  }

  .hs-logo {
    font-size: 20px;
    font-weight: 700;
    color: #2563eb;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }

  .hs-logo-dot {
    width: 10px;
    height: 10px;
    background: #2563eb;
    border-radius: 50%;
  }

  .hs-nav-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .hs-nav-link {
    font-size: 14px;
    font-weight: 500;
    color: #475569;
    text-decoration: none;
    transition: color 0.2s;
  }

  .hs-nav-link:hover {
    color: #2563eb;
  }

  @media (max-width: 480px) {
    .hs-nav-link {
      display: none;
    }
  }

  .hs-nav-btn {
    font-size: 13.5px;
    font-weight: 600;
    color: #2563eb;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
  }

  .hs-nav-btn:hover {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.12);
  }

  /* HERO & MAIN CONTAINER */
  .hs-main {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 60px 40px;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    align-items: center;
    gap: 60px;
  }

  @media (max-width: 1024px) {
    .hs-main {
      grid-template-columns: 1fr;
      padding: 40px 20px;
      gap: 40px;
      text-align: center;
    }
  }

  /* LEFT SIDE (HERO INFO) */
  .hs-hero-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  @media (max-width: 1024px) {
    .hs-hero-left {
      align-items: center;
    }
  }

  .hs-badge {
    background: #eff6ff;
    color: #1e40af;
    border: 1px solid #bfdbfe;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 6px 12px;
    border-radius: 20px;
    margin-bottom: 20px;
    display: inline-block;
  }

  .hs-h1 {
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 800;
    color: #0f172a;
    line-height: 1.25;
    margin: 0 0 16px 0;
    letter-spacing: -0.5px;
    text-align: left;
  }

  @media (max-width: 1024px) {
    .hs-h1 {
      text-align: center;
    }
  }

  .hs-h1 span {
    color: #2563eb;
  }

  .hs-tagline {
    font-size: 15.5px;
    color: #475569;
    line-height: 1.6;
    margin: 0 0 32px 0;
    max-width: 520px;
    text-align: left;
  }

  @media (max-width: 1024px) {
    .hs-tagline {
      text-align: center;
    }
  }

  /* LOGIN CARD */
  .hs-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 16px;
    text-align: left;
  }

  @media (max-width: 480px) {
    .hs-card {
      padding: 16px;
      gap: 12px;
    }
    .hs-google-btn, .hs-test-btn {
      padding: 10px 14px;
      font-size: 13px;
    }
    .hs-mockup-content {
      padding: 14px;
    }
    .hs-chat-text {
      font-size: 11.5px;
      padding: 6px 10px;
    }
    .hs-chat-avatar {
      width: 24px;
      height: 24px;
      font-size: 10px;
    }
    .hs-scorecard-title {
      font-size: 11px;
    }
    .hs-scorecard-desc {
      font-size: 9.5px;
    }
    .hs-score-badge {
      font-size: 12px;
    }
  }

  .hs-card-title {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    margin: 0;
  }

  .hs-divider {
    height: 1px;
    background: #e2e8f0;
    width: 100%;
  }

  /* BUTTONS */
  .hs-google-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #ffffff;
    color: #334155;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid #cbd5e1;
    padding: 11px 20px;
    cursor: pointer;
    width: 100%;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .hs-google-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.03);
  }

  .hs-google-btn svg {
    width: 18px;
    height: 18px;
  }

  .hs-test-btn {
    width: 100%;
    background: #2563eb;
    color: #ffffff;
    font-family: inherit;
    font-size: 13.5px;
    font-weight: 600;
    border: 1px solid #2563eb;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .hs-test-btn:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.15);
  }

  .hs-terms {
    font-size: 11px;
    color: #64748b;
    text-align: center;
    line-height: 1.5;
    margin: 0;
  }

  /* RIGHT SIDE: PREMIUM UI PREVIEW */
  .hs-preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
  }

  .hs-mockup {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 440px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .hs-mockup-header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hs-mockup-dots {
    display: flex;
    gap: 6px;
  }

  .hs-mockup-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #cbd5e1;
  }

  .hs-mockup-dot:nth-child(1) { background: #fca5a5; }
  .hs-mockup-dot:nth-child(2) { background: #fde68a; }
  .hs-mockup-dot:nth-child(3) { background: #a7f3d0; }

  .hs-mockup-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .hs-chat-bubble {
    display: flex;
    gap: 12px;
    max-width: 85%;
  }

  .hs-chat-bubble.bot {
    align-self: flex-start;
  }

  .hs-chat-bubble.user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .hs-chat-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #e2e8f0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: bold;
  }

  .hs-chat-avatar.bot {
    background: #dbeafe;
    color: #2563eb;
  }

  .hs-chat-avatar.user {
    background: #e0f2fe;
    color: #0369a1;
  }

  .hs-chat-text {
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 12.5px;
    line-height: 1.45;
  }

  .hs-chat-bubble.bot .hs-chat-text {
    background: #f1f5f9;
    color: #334155;
    border-top-left-radius: 2px;
  }

  .hs-chat-bubble.user .hs-chat-text {
    background: #2563eb;
    color: #ffffff;
    border-top-right-radius: 2px;
  }

  .hs-mockup-scorecard {
    border: 1px solid #bfdbfe;
    background: #f0f9ff;
    padding: 12px 14px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }

  .hs-scorecard-left {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .hs-scorecard-title {
    font-size: 12px;
    font-weight: 600;
    color: #1e40af;
  }

  .hs-scorecard-desc {
    font-size: 10.5px;
    color: #64748b;
  }

  .hs-score-badge {
    background: #2563eb;
    color: #ffffff;
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 13px;
  }

  /* FEATURES STRIP BELOW */
  .hs-features-section {
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    width: 100%;
    padding: 60px 40px;
  }

  @media (max-width: 640px) {
    .hs-features-section {
      padding: 40px 20px;
    }
  }

  .hs-features-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }

  @media (max-width: 768px) {
    .hs-features-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }

  .hs-feat-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.2s;
    text-align: left;
  }

  .hs-feat-card:hover {
    border-color: #cbd5e1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.03);
  }

  .hs-feat-icon-container {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2563eb;
  }

  .hs-feat-title {
    font-size: 14.5px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .hs-feat-desc {
    font-size: 12.5px;
    color: #64748b;
    line-height: 1.5;
    margin: 0;
  }
`;

function InjectStyles() {
  return <style dangerouslySetInnerHTML={{ __html: globalCSS }} />;
}

function Home() {
  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/google/`,
        {
          id_token: credentialResponse.credential,
        }
      );

      localStorage.setItem("token", res.data.access);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/candidate-dashboard";
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const features = [
    {
      title: "Applicant Tracking & Pipelines",
      desc: "Create and publish job openings, track candidate progress through custom recruitment pipelines, and manage all applicants seamlessly.",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      title: "AI-Powered Screening",
      desc: "Automate resume screening with instant PDF parsing that extracts skills and experience, and ranks candidates using custom concept matching.",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      title: "Automated Conversational Interviews",
      desc: "Conduct adaptive, role-specific screening interviews at scale and get multi-dimensional evaluation scorecards automatically.",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <InjectStyles />
      <div className="hs-root">
        
        {/* NAV */}
        <nav className="hs-nav">
          <div className="hs-logo">
            <span className="hs-logo-dot" />
            HireScope
          </div>
          <div className="hs-nav-right">
            <span className="hs-nav-link" style={{ cursor: "default" }}>How it works</span>
            <span 
              onClick={() => window.location.href = "/hr-login"} 
              className="hs-nav-btn"
              style={{ cursor: "pointer" }}
            >
              Company Official Login
            </span>
          </div>
        </nav>

        {/* HERO */}
        <main className="hs-main">
          <div className="hs-hero-left">
            <div className="hs-badge">All-in-One Recruitment Platform</div>
            <h1 className="hs-h1">
              End-to-End Hiring.<br />
              <span>Simplified.</span>
            </h1>
            <p className="hs-tagline">
              Manage your entire recruitment lifecycle in one place. Streamline job listings, parse resumes, conduct automated AI screenings, and collaborate on scorecards.
            </p>

            {/* SIGN IN CARD */}
            <div className="hs-card">
              <p className="hs-card-title">Get started as a candidate</p>
              <div className="hs-divider" />
              
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => console.log("Login Failed")}
                render={({ onClick }) => (
                  <button className="hs-google-btn" onClick={onClick}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Start with Google Account
                  </button>
                )}
              />

              <button
                id="test-candidate-login"
                className="hs-test-btn"
                onClick={async () => {
                  try {
                    const res = await axios.post(
                      `${process.env.REACT_APP_BACKEND_URL}/api/auth/google/`,
                      { id_token: "test-token" }
                    );
                    localStorage.setItem("token", res.data.access);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    window.location.href = "/candidate-dashboard";
                  } catch (err) {
                    console.error("Test login failed", err);
                  }
                }}
              >
                Dev Candidate Login (Test Bypass)
              </button>

              <p className="hs-terms">
                By logging in, you agree to our Terms of Service and data privacy policies.
              </p>
            </div>
          </div>

          {/* MOCKUP ILLUSTRATION */}
          <div className="hs-preview-container">
            <div className="hs-mockup">
              <div className="hs-mockup-header">
                <div className="hs-mockup-dots">
                  <span className="hs-mockup-dot" />
                  <span className="hs-mockup-dot" />
                  <span className="hs-mockup-dot" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>screener.hirescope.com/interview</span>
              </div>
              <div className="hs-mockup-content">
                
                <div className="hs-chat-bubble bot">
                  <div className="hs-chat-avatar bot">AI</div>
                  <div className="hs-chat-text">
                    Hello Samrat! Can you describe a project where you built custom REST APIs and how you secured them?
                  </div>
                </div>

                <div className="hs-chat-bubble user">
                  <div className="hs-chat-avatar user">SG</div>
                  <div className="hs-chat-text">
                    I developed a backend for a job screening portal using Django REST Framework. I implemented JWT token auth for route security and access control.
                  </div>
                </div>

                <div className="hs-chat-bubble bot">
                  <div className="hs-chat-avatar bot">AI</div>
                  <div className="hs-chat-text">
                    Excellent. How did you structure the token expiration and refreshing workflow?
                  </div>
                </div>

                <div className="hs-mockup-scorecard">
                  <div className="hs-scorecard-left">
                    <span className="hs-scorecard-title">Concept Matching Report</span>
                    <span className="hs-scorecard-desc">Python, Django REST Framework, Web Security</span>
                  </div>
                  <span className="hs-score-badge">92% Match</span>
                </div>

              </div>
            </div>
          </div>
        </main>

        {/* FEATURES */}
        <section className="hs-features-section">
          <div className="hs-features-grid">
            {features.map((f) => (
              <div className="hs-feat-card" key={f.title}>
                <div className="hs-feat-icon-container">{f.icon}</div>
                <h4 className="hs-feat-title">{f.title}</h4>
                <p className="hs-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}

export default Home;