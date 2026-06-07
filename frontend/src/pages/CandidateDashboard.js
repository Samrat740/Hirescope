import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line no-unused-vars
function parseResult(text) {
  const sections = { strengths: [], weaknesses: [], verdict: "", metrics: [] };
  if (!text) return sections;

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

const dashboardCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: #f8fafc;
    color: #0f172a;
  }

  .cd-root {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
    font-family: 'Inter', sans-serif;
  }

  /* HEADER BAR */
  .cd-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 70px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  }

  .cd-logo {
    font-size: 20px;
    font-weight: 700;
    color: #2563eb;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  .cd-logo-dot {
    width: 10px;
    height: 10px;
    background: #2563eb;
    border-radius: 50%;
  }

  .cd-nav-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .cd-logo-text-desktop {
    display: inline;
  }

  .cd-logo-text-mobile {
    display: none;
  }

  .cd-practice-btn {
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    margin-right: 10px;
    transition: all 0.2s;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cd-practice-btn:hover {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
  }

  /* PROFILE TOGGLER IN HEADER */
  .cd-profile-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    border-radius: 9999px;
    cursor: pointer;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
    user-select: none;
  }

  .cd-profile-trigger:hover {
    background: #e2e8f0;
    border-color: #cbd5e1;
  }

  .cd-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    background: #2563eb;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
  }

  .cd-username {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
  }

  .cd-logout-btn {
    background: transparent;
    color: #64748b;
    border: none;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .cd-logout-btn:hover {
    color: #ef4444;
    background: #fef2f2;
  }

  @media (max-width: 768px) {
    .cd-nav {
      height: 60px;
      padding: 0 12px;
    }
    .cd-logo {
      font-size: 16px;
      gap: 6px;
    }
    .cd-logo-dot {
      width: 8px;
      height: 8px;
    }
    .cd-nav-right {
      gap: 8px;
    }
    .cd-username {
      display: none;
    }
    .cd-profile-trigger {
      padding: 4px;
      background: transparent;
      border: none;
    }
    .cd-practice-btn {
      display: none;
    }
    .cd-logout-btn {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .cd-logo {
      font-size: 14.5px;
    }
    .cd-logo-text-desktop {
      display: none;
    }
    .cd-logo-text-mobile {
      display: inline;
    }
  }

  /* DROPDOWN MENU */
  .cd-dropdown-backdrop {
    position: fixed;
    inset: 0;
    z-index: 150;
    background: transparent;
  }

  .cd-dropdown-menu {
    position: absolute;
    top: 45px;
    right: 0;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    width: 220px;
    z-index: 160;
    padding: 6px 0;
    display: flex;
    flex-direction: column;
  }

  .cd-dropdown-item {
    background: transparent;
    border: none;
    padding: 10px 16px;
    text-align: left;
    font-size: 13.5px;
    font-weight: 500;
    color: #334155;
    cursor: pointer;
    width: 100%;
    transition: background 0.15s, color 0.15s;
    font-family: inherit;
    outline: none;
  }

  .cd-dropdown-item:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  .cd-dropdown-item-danger {
    color: #ef4444;
  }

  .cd-dropdown-item-danger:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  .cd-dropdown-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 4px 0;
  }

  /* MAIN LAYOUT: TWO PANELS (SIDEBAR + MAIN CONTENT) */
  .cd-workspace {
    display: flex;
    flex: 1;
    height: calc(100vh - 70px);
    overflow: hidden;
  }

  /* LEFT SIDEBAR */
  .cd-sidebar {
    width: 350px;
    border-right: 1px solid #e2e8f0;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;
  }

  /* CATEGORIES TABS AT UPPER SIDEBAR */
  .cd-sidebar-tabs {
    display: flex;
    padding: 16px;
    gap: 8px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .cd-sidebar-tab {
    flex: 1;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    padding: 8px 12px;
    font-size: 13.5px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    border-radius: 6px;
    text-align: center;
    transition: all 0.2s;
    outline: none;
  }

  .cd-sidebar-tab:hover {
    background: #f1f5f9;
    color: #334155;
  }

  .cd-sidebar-tab.active {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
    box-shadow: 0 2px 4px 0 rgba(37, 99, 235, 0.15);
  }

  /* JOB LISTING SCROLLABLE PANEL */
  .cd-job-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* CUSTOM SCROLLBARS */
  .cd-job-list::-webkit-scrollbar, .cd-details-panel::-webkit-scrollbar, .cd-profile-container::-webkit-scrollbar {
    width: 6px;
  }
  .cd-job-list::-webkit-scrollbar-track, .cd-details-panel::-webkit-scrollbar-track, .cd-profile-container::-webkit-scrollbar-track {
    background: transparent;
  }
  .cd-job-list::-webkit-scrollbar-thumb, .cd-details-panel::-webkit-scrollbar-thumb, .cd-profile-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  /* JOB LIST ITEM */
  .cd-job-item {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .cd-job-item:hover {
    border-color: #93c5fd;
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .cd-job-item.active {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .cd-job-item.active::before {
    content: '';
    position: absolute;
    left: -1px;
    top: 12px;
    bottom: 12px;
    width: 4px;
    background: #2563eb;
    border-radius: 0 4px 4px 0;
  }

  .cd-job-item-title {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 6px 0;
  }

  .cd-job-item-brief {
    font-size: 13px;
    color: #64748b;
    margin: 0 0 12px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .cd-job-item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #94a3b8;
  }

  /* RIGHT DETAILS PANEL */
  .cd-details-panel {
    flex: 1;
    background: #f8fafc;
    overflow-y: auto;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .cd-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #94a3b8;
    text-align: center;
    gap: 12px;
  }

  .cd-placeholder-icon {
    font-size: 40px;
    color: #cbd5e1;
  }

  /* JOB DETAILS CONTENT CARD */
  .cd-details-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 28px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  }

  .cd-details-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 20px;
    margin-bottom: 20px;
    gap: 16px;
  }

  .cd-details-title {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 6px 0;
  }

  .cd-details-meta {
    font-size: 12.5px;
    color: #64748b;
  }

  /* STATUS PILL */
  .cd-status-pill {
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 11.5px;
    font-weight: 600;
    text-transform: capitalize;
    display: inline-block;
    border: 1px solid transparent;
    white-space: nowrap;
  }

  /* ACTION PANEL */
  .cd-action-box {
    margin-top: 24px;
    padding: 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  /* PROFILE VIEW PAGE */
  .cd-profile-container {
    flex: 1;
    overflow-y: auto;
    background: #f8fafc;
    padding: 32px 16px;
    display: flex;
    justify-content: center;
  }

  .cd-profile-card {
    max-width: 760px;
    width: 100%;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 28px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 28px;
    height: fit-content;
  }

  .cd-profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 16px;
  }

  .cd-profile-title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .cd-back-btn {
    background: transparent;
    color: #2563eb;
    border: 1px solid #2563eb;
    padding: 6px 14px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    outline: none;
  }

  .cd-back-btn:hover {
    background: #eff6ff;
  }

  /* PROFILE CATEGORIES / SECTIONS */
  .cd-profile-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .cd-section-title {
    font-size: 13.5px;
    font-weight: 700;
    color: #1e3a8a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #dbeafe;
    padding-bottom: 6px;
    margin: 0;
  }

  .cd-profile-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  @media (max-width: 600px) {
    .cd-profile-info-grid {
      grid-template-columns: 1fr;
    }
  }

  .cd-info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .cd-info-label {
    font-size: 11.5px;
    font-weight: 600;
    color: #64748b;
  }

  .cd-info-value {
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
    background: #f8fafc;
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }

  /* BUTTONS & INPUTS */
  .cd-btn {
    background: #2563eb;
    color: #ffffff;
    border: 1px solid #2563eb;
    padding: 8px 16px;
    font-size: 13.5px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    outline: none;
  }

  .cd-btn:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
  }

  .cd-btn-secondary {
    background: #ffffff;
    color: #475569;
    border: 1px solid #cbd5e1;
    padding: 8px 16px;
    font-size: 13.5px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    outline: none;
  }

  .cd-btn-secondary:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #1f2937;
  }

  .cd-btn:disabled, .cd-btn-secondary:disabled {
    background: #e2e8f0;
    border-color: #e2e8f0;
    color: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* FORM STYLING */
  .cd-form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .cd-input, .cd-textarea, .cd-file-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-family: inherit;
    font-size: 13.5px;
    color: #0f172a;
    outline: none;
    transition: border-color 0.2s;
  }

  .cd-input:focus, .cd-textarea:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }

  .cd-textarea {
    resize: vertical;
    min-height: 80px;
    line-height: 1.4;
  }

  /* CHIPS & LISTS */
  .cd-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .cd-chip {
    background: #eff6ff;
    color: #1e40af;
    border: 1px solid #bfdbfe;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 12.5px;
    font-weight: 500;
  }

  .cd-bullet-list {
    margin: 0;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13.5px;
    color: #334155;
    line-height: 1.45;
  }

  /* OVERLAY / SPINNER */
  .cd-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(1.5px);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .cd-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #eff6ff;
    border-top: 3px solid #2563eb;
    border-radius: 50%;
    animation: cdSpin 0.8s linear infinite;
  }

  .cd-loading-text {
    font-size: 13.5px;
    font-weight: 600;
    color: #334155;
    text-align: center;
  }

  @keyframes cdSpin { to { transform: rotate(360deg); } }

  /* MOBILE RESPONSIVE STYLES */
  .cd-mobile-back-btn {
    display: none;
    align-self: flex-start;
    background: transparent;
    border: none;
    color: #2563eb;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-bottom: 12px;
    align-items: center;
    gap: 6px;
    outline: none;
  }

  @media (max-width: 768px) {
    .cd-mobile-back-btn {
      display: flex;
    }

    .cd-workspace {
      height: calc(100vh - 70px) !important;
      overflow: hidden;
      width: 100%;
    }

    .cd-workspace.mobile-show-list .cd-sidebar {
      width: 100% !important;
      display: flex !important;
    }
    .cd-workspace.mobile-show-list .cd-details-panel {
      display: none !important;
    }

    .cd-workspace.mobile-show-detail .cd-sidebar {
      display: none !important;
    }
    .cd-workspace.mobile-show-detail .cd-details-panel {
      width: 100% !important;
      display: flex !important;
      padding: 16px !important;
    }

    .cd-details-card {
      padding: 20px !important;
    }

    .cd-username {
      display: none;
    }

    .cd-nav {
      padding: 0 16px !important;
    }

    .cd-profile-container {
      padding: 16px 8px !important;
    }
    .cd-profile-card {
      padding: 18px !important;
      gap: 20px !important;
    }
    .cd-profile-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .cd-back-btn {
      width: 100%;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .cd-logo {
      font-size: 17px !important;
    }
    .cd-logo-dot {
      width: 8px !important;
      height: 8px !important;
    }
    .cd-logout-btn {
      padding: 6px 10px !important;
      font-size: 12.5px !important;
    }
    .cd-profile-trigger {
      padding: 4px !important;
    }
  }
`;

function CandidateDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);

  const [activeTab, setActiveTab] = useState("openings"); // "openings" or "applications"
  const [showProfile, setShowProfile] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [viewingDetailOnMobile, setViewingDetailOnMobile] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [practiceRole, setPracticeRole] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form Fields
  const [contact, setContact] = useState("");
  const [education, setEducation] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [resume, setResume] = useState(null);
  const [skillsText, setSkillsText] = useState("");
  const [projectsText, setProjectsText] = useState("");
  const [experienceText, setExperienceText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [hasParsedOnboarding, setHasParsedOnboarding] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const populateProfileForm = (profileData) => {
    setContact(profileData.contact || "");
    setEducation(profileData.education || "");
    setCgpa(profileData.cgpa || "");
    setSkillsText(profileData.skills ? profileData.skills.join("\n") : "");
    setProjectsText(profileData.projects ? profileData.projects.join("\n") : "");
    setExperienceText(profileData.experience ? profileData.experience.join("\n") : "");
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      const [profileRes, jobsRes, appsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/profile/`, { headers }),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/chat/jobs/`, { headers }),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/chat/applications/my-applications/`, { headers })
      ]);

      setUser(profileRes.data);
      setJobs(jobsRes.data);
      setMyApps(appsRes.data);

      populateProfileForm(profileRes.data);

      if (!profileRes.data.contact) {
        // If profile is not complete, auto switch to Profile tab in edit mode
        setShowProfile(true);
        setIsEditing(true);
      } else {
        if (jobsRes.data.length > 0) {
          setSelectedJobId(jobsRes.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleUploadAndParseResume = async () => {
    if (!resume) {
      setError("Please select your resume PDF first.");
      return;
    }

    setError("");
    setParsingResume(true);

    const formData = new FormData();
    formData.append("resume", resume);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/profile/parse-resume/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Pre-fill fields if they are empty
      if (!contact && res.data.contact) setContact(res.data.contact);
      if (!education && res.data.education) setEducation(res.data.education);
      if (!cgpa && res.data.cgpa) setCgpa(res.data.cgpa);

      // Populates skills, projects, experience
      if (res.data.skills) {
        setSkillsText(res.data.skills.join("\n"));
      }
      if (res.data.projects) {
        setProjectsText(res.data.projects.join("\n"));
      }
      if (res.data.experience) {
        setExperienceText(res.data.experience.join("\n"));
      }

      setHasParsedOnboarding(true);
    } catch (err) {
      console.error(err);
      setError("AI was unable to parse the resume. Please fill your details manually.");
      setHasParsedOnboarding(true); // Let them proceed manually
    } finally {
      setParsingResume(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!contact || !education || !cgpa) {
      setError("Please fill all profile fields.");
      return;
    }

    if (!user.resume_url && !resume) {
      setError("Please select your resume PDF for initial setup.");
      return;
    }

    setError("");
    setSubmitting(true);

    const formData = new FormData();
    formData.append("contact", contact);
    formData.append("education", education);
    formData.append("cgpa", cgpa);
    if (resume) {
      formData.append("resume", resume);
    }

    const skillsList = skillsText.split("\n").map(s => s.trim()).filter(Boolean);
    const projectsList = projectsText.split("\n").map(p => p.trim()).filter(Boolean);
    const expList = experienceText.split("\n").map(exp => exp.trim()).filter(Boolean);

    formData.append("skills", JSON.stringify(skillsList));
    formData.append("projects", JSON.stringify(projectsList));
    formData.append("experience", JSON.stringify(expList));

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/profile/update/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUser(res.data.user);
      populateProfileForm(res.data.user);
      setIsEditing(false);
      setResume(null);
      setHasParsedOnboarding(false);
      setShowProfile(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!user.contact) {
      alert("Please complete your profile details before applying.");
      setShowProfile(true);
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/applications/apply/`,
        { job_id: jobId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const appsRes = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/applications/my-applications/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMyApps(appsRes.data);
      alert("Application submitted successfully!");

      const remainingOpenings = jobs.filter(job => job.id !== jobId && !appsRes.data.some(app => app.job_id === job.id));
      if (remainingOpenings.length > 0) {
        setSelectedJobId(remainingOpenings[0].id);
      } else {
        setSelectedJobId(null);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Error applying for this job.");
    } finally {
      setSubmitting(false);
    }
  };

  const getJobApplication = (jobId) => {
    return myApps.find(app => app.job_id === jobId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "applied": return { background: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe" };
      case "shortlisted": return { background: "#f5f3ff", color: "#5b21b6", borderColor: "#ddd6fe" }; // Purple
      case "interview_scheduled": return { background: "#fff7ed", color: "#c2410c", borderColor: "#ffedd5" }; // Orange
      case "interview_completed": return { background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }; // Green
      case "interview_cleared": return { background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }; // Green
      case "rejected": return { background: "#fef2f2", color: "#991b1b", borderColor: "#fca5a5" }; // Red
      default: return { background: "#f1f5f9", color: "#475569", borderColor: "#cbd5e1" };
    }
  };

  const getApplicationResultLabel = (app) => {
    if (app.status === "rejected" && app.reason) {
      return app.reason;
    }
    if (app.status === "interview_cleared") {
      return "Interview Cleared";
    }
    if (app.status === "interview_scheduled") {
      return "Interview Scheduled";
    }
    if (app.status === "shortlisted") {
      return "Shortlisted";
    }
    if (app.status === "applied") {
      return "Applied";
    }
    return app.status.replace("_", " ");
  };

  const getApplicationResultStyle = (app) => {
    return getStatusColor(app.status);
  };

  const renderStatusTracker = (app) => {
    let currentStepIndex = 0;
    let finalResultText = "Final Outcome";
    let isAccept = false;
    let isReject = false;
    let rejectReason = "";

    if (app.status === "applied") {
      currentStepIndex = 0;
    } else if (app.status === "shortlisted") {
      currentStepIndex = 1;
    } else if (app.status === "interview_scheduled") {
      currentStepIndex = 2;
    } else if (app.status === "interview_cleared") {
      currentStepIndex = 3;
      isAccept = true;
      finalResultText = "Interview Cleared";
    } else if (app.status === "rejected") {
      isReject = true;
      rejectReason = app.reason || "Rejected";
      finalResultText = rejectReason;
      if (app.reason === "Profile not shortlisted") {
        currentStepIndex = 1;
      } else {
        currentStepIndex = 3;
      }
    }

    const steps = [
      {
        label: "Applied",
        active: currentStepIndex >= 0,
        completed: currentStepIndex > 0
      },
      {
        label: (app.status === "rejected" && app.reason === "Profile not shortlisted") ? "Profile Rejected" : "Profile Shortlisted",
        active: currentStepIndex >= 1,
        completed: currentStepIndex > 1,
        isRed: app.status === "rejected" && app.reason === "Profile not shortlisted"
      },
      {
        label: (app.status === "rejected" && (app.reason === "Interview not cleared" || app.reason === "Interview unattempted"))
          ? (app.reason === "Interview unattempted" ? "Interview Unattempted" : "Interview Failed")
          : app.status === "interview_scheduled"
            ? "Interview Scheduled"
            : currentStepIndex > 2
              ? "Interview Completed"
              : "AI Interview",
        active: currentStepIndex >= 2,
        completed: currentStepIndex > 2,
        isRed: app.status === "rejected" && (app.reason === "Interview not cleared" || app.reason === "Interview unattempted")
      },
      {
        label: finalResultText,
        active: currentStepIndex >= 3,
        completed: isAccept,
        isRed: isReject && currentStepIndex === 3,
        isGreen: isAccept
      }
    ];

    if (isMobile) {
      // Mobile Vertical Stepper Layout
      return (
        <div style={{
          margin: "12px 0 24px 0",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02)"
        }}>
          <h3 style={{ fontSize: "14.5px", fontWeight: "700", color: "#1e293b", margin: "0 0 20px 0" }}>
            Application Status Tracker
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {steps.map((step, idx) => {
              const isCompleted = step.completed;
              const isActive = step.active && !step.completed;

              let circleBorderColor = "#cbd5e1";
              let circleBg = "#ffffff";
              let circleTextColor = "#64748b";

              if (isCompleted) {
                circleBorderColor = "#2563eb";
                circleBg = "#2563eb";
                circleTextColor = "#ffffff";
              } else if (isActive) {
                if (step.isRed) {
                  circleBorderColor = "#ef4444";
                  circleTextColor = "#ef4444";
                } else if (step.isGreen) {
                  circleBorderColor = "#10b981";
                  circleTextColor = "#10b981";
                } else {
                  circleBorderColor = "#2563eb";
                  circleTextColor = "#2563eb";
                }
              }

              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                  {/* Step Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: `2px solid ${circleBorderColor}`,
                      background: circleBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: circleTextColor,
                      boxShadow: isActive ? "0 0 0 4px #eff6ff" : "none",
                      flexShrink: 0
                    }}>
                      {isCompleted ? "✓" : idx + 1}
                    </div>
                    <span style={{
                      fontSize: "13px",
                      fontWeight: (isActive || isCompleted) ? "600" : "500",
                      color: isCompleted ? "#0f172a" : circleTextColor,
                    }}>
                      {step.label}
                    </span>
                  </div>

                  {/* Vertical Line Segment */}
                  {idx < 3 && (
                    <div style={{
                      width: "3px",
                      height: "24px",
                      background: isCompleted ? "#2563eb" : "#e2e8f0",
                      marginLeft: "14px",
                      marginTop: "4px",
                      marginBottom: "4px"
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {(app.status === "interview_cleared" || (app.status === "rejected" && (app.reason === "Interview not cleared" || app.reason === "Interview unattempted"))) && (
            <div style={{
              marginTop: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              background: isAccept ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${isAccept ? "#bbf7d0" : "#fca5a5"}`,
              borderRadius: "8px",
              padding: "16px"
            }}>
              <span style={{ fontSize: "13px", color: isAccept ? "#166534" : "#991b1b", fontWeight: "500", lineHeight: "1.4" }}>
                {isAccept
                  ? "Congratulations! You cleared the AI screening interview. Our HR team will reach out to you shortly."
                  : app.reason === "Interview unattempted"
                    ? "The deadline for the interview has passed, and the interview was not attempted."
                    : "Thank you for taking the interview. Unfortunately, you did not clear this round. Keep exploring other openings!"
                }
              </span>
              {(isAccept || app.reason === "Interview not cleared") && (
                <button
                  className="cd-btn"
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "13px",
                    background: isAccept ? "#10b981" : "#ef4444",
                    borderColor: isAccept ? "#10b981" : "#ef4444",
                    color: "#ffffff",
                    fontWeight: "600"
                  }}
                  onClick={() => navigate("/result")}
                >
                  View Scorecard →
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    // Desktop Horizontal Stepper Layout (with centered labels and no absolute overflow)
    return (
      <div style={{
        margin: "12px 0 24px 0",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02)"
      }}>
        <h3 style={{ fontSize: "14.5px", fontWeight: "700", color: "#1e293b", margin: "0 0 24px 0" }}>
          Application Status Tracker
        </h3>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", width: "100%" }}>
          {/* Background Line */}
          <div style={{
            position: "absolute",
            top: "16px",
            left: "12.5%",
            right: "12.5%",
            height: "4px",
            background: "#e2e8f0",
            zIndex: 1
          }} />

          {/* Active Progress Line */}
          <div style={{
            position: "absolute",
            top: "16px",
            left: "12.5%",
            width: `${(currentStepIndex / 3) * 75}%`,
            height: "4px",
            background: "#2563eb",
            transition: "width 0.5s ease",
            zIndex: 2
          }} />

          {steps.map((step, idx) => {
            const isCompleted = step.completed;
            const isActive = step.active && !step.completed;

            let circleBorderColor = "#cbd5e1";
            let circleBg = "#ffffff";
            let circleTextColor = "#64748b";

            if (isCompleted) {
              circleBorderColor = "#2563eb";
              circleBg = "#2563eb";
              circleTextColor = "#ffffff";
            } else if (isActive) {
              if (step.isRed) {
                circleBorderColor = "#ef4444";
                circleTextColor = "#ef4444";
              } else if (step.isGreen) {
                circleBorderColor = "#10b981";
                circleTextColor = "#10b981";
              } else {
                circleBorderColor = "#2563eb";
                circleTextColor = "#2563eb";
              }
            }

            return (
              <div key={idx} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 3,
                width: "25%",
                textAlign: "center"
              }}>
                {/* Step Circle */}
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: `2px solid ${circleBorderColor}`,
                  background: circleBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: circleTextColor,
                  boxShadow: isActive ? "0 0 0 4px #eff6ff" : "none",
                  transition: "all 0.3s ease"
                }}>
                  {isCompleted ? "✓" : idx + 1}
                </div>

                {/* Step Label (centered directly below circle, word wrap enabled) */}
                <span style={{
                  fontSize: "12.5px",
                  fontWeight: (isActive || isCompleted) ? "600" : "500",
                  color: isCompleted ? "#0f172a" : circleTextColor,
                  marginTop: "12px",
                  maxWidth: "90%",
                  wordBreak: "break-word",
                  lineHeight: "1.4"
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {(app.status === "interview_cleared" || (app.status === "rejected" && (app.reason === "Interview not cleared" || app.reason === "Interview unattempted"))) && (
          <div style={{
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: isAccept ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${isAccept ? "#bbf7d0" : "#fca5a5"}`,
            borderRadius: "8px",
            padding: "16px 20px"
          }}>
            <span style={{ fontSize: "13.5px", color: isAccept ? "#166534" : "#991b1b", fontWeight: "500", lineHeight: "1.4" }}>
              {isAccept
                ? "Congratulations! You cleared the AI screening interview. Our HR team will reach out to you shortly."
                : app.reason === "Interview unattempted"
                  ? "The deadline for the interview has passed, and the interview was not attempted."
                  : "Thank you for taking the interview. Unfortunately, you did not clear this round. Keep exploring other openings!"
              }
            </span>
            {(isAccept || app.reason === "Interview not cleared") && (
              <button
                className="cd-btn"
                style={{
                  width: "auto",
                  padding: "8px 16px",
                  fontSize: "13px",
                  background: isAccept ? "#10b981" : "#ef4444",
                  borderColor: isAccept ? "#10b981" : "#ef4444",
                  color: "#ffffff",
                  fontWeight: "600",
                  marginLeft: "16px",
                  whiteSpace: "nowrap"
                }}
                onClick={() => navigate("/result")}
              >
                View Scorecard →
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredJobs = activeTab === "openings"
    ? jobs.filter(job => !getJobApplication(job.id))
    : jobs.filter(job => getJobApplication(job.id));

  const activeJob = jobs.find(job => job.id === selectedJobId);

  const isDeadlinePassed = (lastDateStr) => {
    if (!lastDateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(lastDateStr + "T00:00:00");
    deadline.setHours(0, 0, 0, 0);
    return today > deadline;
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(x => x[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashboardCSS }} />
      <div className="cd-root">
        {(loading || submitting || parsingResume) && (
          <div className="cd-overlay">
            <div className="cd-spinner" />
            <p className="cd-loading-text">
              {loading ? "Loading Dashboard..." : parsingResume ? "AI is parsing your resume to extract skills, projects, and experience..." : "Processing..."}
              <br />
              Please wait while we sync with the server.
            </p>
          </div>
        )}

        <nav className="cd-nav">
          <div className="cd-logo" onClick={() => setShowProfile(false)}>
            <span className="cd-logo-dot" />
            <span className="cd-logo-text-desktop">HireScope Careers</span>
            <span className="cd-logo-text-mobile">HireScope</span>
          </div>
          <div className="cd-nav-right">
            <button
              className="cd-practice-btn"
              onClick={() => setShowMockModal(true)}
            >
              Practice Mock Interview
            </button>
            {user && (
              <div style={{ position: "relative" }}>
                <div className="cd-profile-trigger" onClick={() => {
                  if (window.innerWidth <= 768) {
                    setShowDropdown(!showDropdown);
                  } else {
                    setShowProfile(true);
                    setIsEditing(false);
                  }
                }}>
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="cd-avatar" />
                  ) : (
                    <div className="cd-avatar">{getInitials(user.name)}</div>
                  )}
                  <span className="cd-username">{user.name}</span>
                </div>

                {showDropdown && (
                  <>
                    <div 
                      className="cd-dropdown-backdrop" 
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="cd-dropdown-menu">
                      <button 
                        className="cd-dropdown-item"
                        onClick={() => {
                          setShowDropdown(false);
                          setShowMockModal(true);
                        }}
                      >
                        Practice Mock Interview
                      </button>
                      <button 
                        className="cd-dropdown-item"
                        onClick={() => {
                          setShowDropdown(false);
                          setShowProfile(true);
                          setIsEditing(false);
                        }}
                      >
                        Account Settings
                      </button>
                      <div className="cd-dropdown-divider" />
                      <button 
                        className="cd-dropdown-item cd-dropdown-item-danger"
                        onClick={() => {
                          setShowDropdown(false);
                          handleLogout();
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            <button className="cd-logout-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </nav>

        {showMockModal && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(2.5px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}>
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              maxWidth: "460px",
              width: "100%",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              fontFamily: "Inter, sans-serif"
            }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                Start Practice Mock Interview
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
                Practice makes perfect! Enter the job role you want to practice for. The AI will customize the interview questions based on this role and your profile (skills, projects, experience).
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#334155" }}>Target Job Role</label>
                <input
                  type="text"
                  placeholder="e.g. React Frontend Engineer"
                  value={practiceRole}
                  onChange={(e) => setPracticeRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    outline: "none"
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  type="button"
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setShowMockModal(false);
                    setPracticeRole("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={{
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                  disabled={!practiceRole.trim()}
                  onClick={() => {
                    setShowMockModal(false);
                    navigate(`/interview?is_practice=true&job_role=${encodeURIComponent(practiceRole.trim())}`);
                  }}
                >
                  Start Practice
                </button>
              </div>
            </div>
          </div>
        )}

        {showProfile ? (
          <div className="cd-profile-container">
            <div className="cd-profile-card">
              <div className="cd-profile-header">
                <h2 className="cd-profile-title">My Profile & Resume</h2>
                <button className="cd-back-btn" onClick={() => setShowProfile(false)}>
                  ← Back to Dashboard
                </button>
              </div>

              {error && (
                <div style={{ border: "1px solid #fca5a5", background: "#fef2f2", color: "#991b1b", padding: 12, borderRadius: 6, fontSize: 13, fontWeight: "bold" }}>
                  {error}
                </div>
              )}

              {isEditing || !user.contact ? (
                <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="cd-profile-section">
                    <h3 className="cd-section-title">Personal Details</h3>
                    <div className="cd-profile-info-grid">
                      <div className="cd-form-group">
                        <label className="cd-info-label">Contact Number</label>
                        <input
                          type="text"
                          className="cd-input"
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          placeholder="e.g. +91 9876543210"
                          required
                        />
                      </div>

                      <div className="cd-form-group">
                        <label className="cd-info-label">Education Qualification</label>
                        <input
                          type="text"
                          className="cd-input"
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          placeholder="e.g. B.Tech Computer Science"
                          required
                        />
                      </div>

                      <div className="cd-form-group">
                        <label className="cd-info-label">College CGPA / Percentage</label>
                        <input
                          type="text"
                          className="cd-input"
                          value={cgpa}
                          onChange={(e) => setCgpa(e.target.value)}
                          placeholder="e.g. 8.9 / 10.0"
                          required
                        />
                      </div>

                      <div className="cd-form-group">
                        <label className="cd-info-label">
                          Resume PDF File {user.resume_url && "(Leave blank to keep existing)"}
                        </label>
                        <input
                          type="file"
                          className="cd-file-input"
                          accept=".pdf"
                          onChange={handleFileChange}
                          required={!user.resume_url}
                        />
                      </div>
                    </div>
                  </div>

                  {(!user.contact ? hasParsedOnboarding : true) && (
                    <div className="cd-profile-section">
                      <h3 className="cd-section-title">Skills & Experience</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div className="cd-form-group">
                          <label className="cd-info-label">Skills (One per line)</label>
                          <textarea
                            className="cd-textarea"
                            value={skillsText}
                            onChange={(e) => setSkillsText(e.target.value)}
                            placeholder="React&#10;Node.js&#10;Python"
                          />
                        </div>

                        <div className="cd-form-group">
                          <label className="cd-info-label">Key Projects (One per line)</label>
                          <textarea
                            className="cd-textarea"
                            value={projectsText}
                            onChange={(e) => setProjectsText(e.target.value)}
                            placeholder="E-Commerce Website built with MERN stack&#10;Weather Forecasting App using OpenWeather API"
                          />
                        </div>

                        <div className="cd-form-group">
                          <label className="cd-info-label">Professional Experience (One per line)</label>
                          <textarea
                            className="cd-textarea"
                            value={experienceText}
                            onChange={(e) => setExperienceText(e.target.value)}
                            placeholder="Frontend Intern at Tech Corp (6 months)&#10;Freelance Web Developer (1 year)"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                    {!user.contact && !hasParsedOnboarding ? (
                      <button
                        type="button"
                        className="cd-btn"
                        onClick={handleUploadAndParseResume}
                        disabled={!resume}
                      >
                        Upload & Parse Resume
                      </button>
                    ) : (
                      <button type="submit" className="cd-btn">
                        Save Profile & Sync
                      </button>
                    )}
                    {user.contact && (
                      <button
                        type="button"
                        className="cd-btn-secondary"
                        onClick={() => {
                          setIsEditing(false);
                          setError("");
                          populateProfileForm(user);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="cd-profile-section">
                    <h3 className="cd-section-title">Personal Details</h3>
                    <div className="cd-profile-info-grid">
                      <div className="cd-info-item">
                        <span className="cd-info-label">Email Address</span>
                        <span className="cd-info-value">{user.email}</span>
                      </div>
                      <div className="cd-info-item">
                        <span className="cd-info-label">Contact Number</span>
                        <span className="cd-info-value">{user.contact}</span>
                      </div>
                      <div className="cd-info-item">
                        <span className="cd-info-label">Education</span>
                        <span className="cd-info-value">{user.education}</span>
                      </div>
                      <div className="cd-info-item">
                        <span className="cd-info-label">College CGPA</span>
                        <span className="cd-info-value">{user.cgpa}</span>
                      </div>
                      {user.resume_url && (
                        <div className="cd-info-item" style={{ gridColumn: "1 / -1" }}>
                          <span className="cd-info-label">Uploaded Resume</span>
                          <div style={{ marginTop: "4px" }}>
                            <a href={user.resume_url} target="_blank" rel="noopener noreferrer" className="cd-back-btn" style={{ textDecoration: "none", fontSize: "12.5px", display: "inline-block" }}>
                              View Current Resume PDF 📄
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="cd-profile-section">
                    <h3 className="cd-section-title">Skills & Experience</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <span className="cd-info-label" style={{ display: "block", marginBottom: "6px" }}>Identified Skills</span>
                        <div className="cd-chips">
                          {user.skills && user.skills.length > 0 ? (
                            user.skills.map((s) => <span key={s} className="cd-chip">{s}</span>)
                          ) : (
                            <span style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>No skills specified</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="cd-info-label" style={{ display: "block", marginBottom: "6px" }}>Key Projects</span>
                        {user.projects && user.projects.length > 0 ? (
                          <ul className="cd-bullet-list">
                            {user.projects.map((p, idx) => <li key={idx}>{p}</li>)}
                          </ul>
                        ) : (
                          <span style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>No projects listed</span>
                        )}
                      </div>

                      <div>
                        <span className="cd-info-label" style={{ display: "block", marginBottom: "6px" }}>Professional Experience</span>
                        {user.experience && user.experience.length > 0 ? (
                          <ul className="cd-bullet-list">
                            {user.experience.map((exp, idx) => <li key={idx}>{exp}</li>)}
                          </ul>
                        ) : (
                          <span style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>No professional experience listed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <button className="cd-btn" onClick={() => setIsEditing(true)}>
                      Edit Profile Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`cd-workspace ${viewingDetailOnMobile ? "mobile-show-detail" : "mobile-show-list"}`}>
            <aside className="cd-sidebar">
              <div className="cd-sidebar-tabs">
                <button
                  className={`cd-sidebar-tab ${activeTab === "openings" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("openings");
                    setViewingDetailOnMobile(false);
                    const openings = jobs.filter(job => !getJobApplication(job.id));
                    if (openings.length > 0) {
                      setSelectedJobId(openings[0].id);
                    } else {
                      setSelectedJobId(null);
                    }
                  }}
                >
                  💼 Openings
                </button>
                <button
                  className={`cd-sidebar-tab ${activeTab === "applications" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("applications");
                    setViewingDetailOnMobile(false);
                    const applied = jobs.filter(job => getJobApplication(job.id));
                    if (applied.length > 0) {
                      setSelectedJobId(applied[0].id);
                    } else {
                      setSelectedJobId(null);
                    }
                  }}
                >
                  📨 Applications
                </button>
              </div>

              <div className="cd-job-list">
                {filteredJobs.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "13.5px", marginTop: "32px" }}>
                    No job postings found.
                  </div>
                ) : (
                  filteredJobs.map((job) => {
                    const app = getJobApplication(job.id);
                    const isSelected = selectedJobId === job.id;
                    return (
                      <div
                        key={job.id}
                        className={`cd-job-item ${isSelected ? "active" : ""}`}
                        onClick={() => {
                          setSelectedJobId(job.id);
                          setViewingDetailOnMobile(true);
                        }}
                      >
                        <h4 className="cd-job-item-title">{job.title}</h4>
                        <p className="cd-job-item-brief">
                          {job.description ? job.description : ""}
                        </p>
                        <div className="cd-job-item-footer">
                          <span>
                            Posted: {new Date(job.created_at).toLocaleDateString()}
                          </span>
                          {app ? (
                            <span className="cd-status-pill" style={getApplicationResultStyle(app)}>
                              {getApplicationResultLabel(app)}
                            </span>
                          ) : isDeadlinePassed(job.last_date) ? (
                            <span className="cd-status-pill" style={{ background: "#fef2f2", color: "#dc2626", borderColor: "#fca5a5" }}>
                              Closed
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            <main className="cd-details-panel">
              {activeJob ? (
                <>
                  <button className="cd-mobile-back-btn" onClick={() => setViewingDetailOnMobile(false)}>
                    ← Back to Listings
                  </button>
                  <div className="cd-details-card">
                    <div className="cd-details-header">
                      <div>
                        <h1 className="cd-details-title">{activeJob.title}</h1>
                        <div className="cd-details-meta">
                          Posted on: {new Date(activeJob.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {(() => {
                        const app = getJobApplication(activeJob.id);
                        if (app) {
                          return (
                            <span className="cd-status-pill" style={getApplicationResultStyle(app)}>
                              {getApplicationResultLabel(app)}
                            </span>
                          );
                        }
                        if (isDeadlinePassed(activeJob.last_date)) {
                          return (
                            <span className="cd-status-pill" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" }}>
                              Closed
                            </span>
                          );
                        }
                        return (
                          <span className="cd-status-pill" style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #cbd5e1" }}>
                            Not Applied
                          </span>
                        );
                      })()}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      {/* Job Overview Grid */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "16px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "16px",
                        marginTop: "4px"
                      }}>
                        {activeJob.domain && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "10.5px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Domain</span>
                            <span style={{ fontSize: "13.5px", color: "#0f172a", fontWeight: 500 }}>{activeJob.domain}</span>
                          </div>
                        )}
                        {activeJob.job_type && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "10.5px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Job Type</span>
                            <span style={{ fontSize: "13.5px", color: "#0f172a", fontWeight: 500 }}>{activeJob.job_type}</span>
                          </div>
                        )}
                        {activeJob.experience_level && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "10.5px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Experience Level</span>
                            <span style={{ fontSize: "13.5px", color: "#0f172a", fontWeight: 500 }}>{activeJob.experience_level}</span>
                          </div>
                        )}
                        {activeJob.location && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "10.5px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Location</span>
                            <span style={{ fontSize: "13.5px", color: "#0f172a", fontWeight: 500 }}>{activeJob.location}</span>
                          </div>
                        )}
                        {activeJob.education && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "10.5px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Education Required</span>
                            <span style={{ fontSize: "13.5px", color: "#0f172a", fontWeight: 500 }}>{activeJob.education}</span>
                          </div>
                        )}
                        {activeJob.last_date && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "10.5px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Application Deadline</span>
                            <span style={{
                              fontSize: "13.5px",
                              color: isDeadlinePassed(activeJob.last_date) ? "#ef4444" : "#2563eb",
                              fontWeight: 600
                            }}>
                              {new Date(activeJob.last_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Required Skills tags */}
                      {activeJob.skills && (
                        <div>
                          <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", margin: "0 0 8px 0" }}>Required Skills</h3>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {activeJob.skills.split(",").map(skill => skill.trim()).filter(Boolean).map((skill, idx) => (
                              <span key={idx} style={{
                                fontSize: "12px",
                                background: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                color: "#1e40af",
                                fontWeight: 500
                              }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", margin: "0 0 10px 0" }}>Job Description</h3>
                        <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.65", whiteSpace: "pre-line" }}>
                          {activeJob.description}
                        </p>
                      </div>

                      <div className="cd-action-box">
                        {(() => {
                          const app = getJobApplication(activeJob.id);
                          if (!app) {
                            const deadlinePassed = isDeadlinePassed(activeJob.last_date);
                            return (
                              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {deadlinePassed ? (
                                  <>
                                    <p style={{ margin: 0, fontSize: "13.5px", color: "#ef4444", fontWeight: 600 }}>
                                      ⚠️ Application deadline has passed for this position. We are no longer accepting submissions.
                                    </p>
                                    <button
                                      className="cd-btn"
                                      disabled={true}
                                      style={{ background: "#cbd5e1", borderColor: "#cbd5e1", color: "#64748b", cursor: "not-allowed" }}
                                    >
                                      Application Closed
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <p style={{ margin: 0, fontSize: "13.5px", color: "#475569" }}>
                                      You have not applied for this role yet. Click the button below to submit your details and resume.
                                    </p>
                                    <button
                                      className="cd-btn"
                                      disabled={!user?.contact}
                                      onClick={() => handleApply(activeJob.id)}
                                    >
                                      {user?.contact ? "Apply for this Job" : "Complete Profile to Apply"}
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                              {renderStatusTracker(app)}

                              {app.status === "interview_scheduled" && (() => {
                                const now = new Date();
                                const startTime = app.interview_start ? new Date(app.interview_start) : null;
                                const endTime = app.interview_end ? new Date(app.interview_end) : null;
                                const isTooEarly = startTime && now < startTime;

                                return (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <p style={{ fontSize: "13.5px", margin: 0, fontWeight: "600", color: "#b45309" }}>
                                      AI screening interview scheduled!
                                    </p>
                                    {startTime && endTime && (
                                      <div style={{ fontSize: "13px", color: "#475569", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                        <strong>Interview Window:</strong>
                                        <div style={{ marginTop: "4px" }}>Start: {startTime.toLocaleString()}</div>
                                        <div>End: {endTime.toLocaleString()}</div>
                                      </div>
                                    )}
                                    {isTooEarly ? (
                                      <div style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic", padding: "8px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px" }}>
                                        🕒 The interview has not started yet. Please wait until the start time.
                                      </div>
                                    ) : (
                                      <button className="cd-btn" style={{ background: "#d97706", borderColor: "#d97706" }} onClick={() => navigate(`/interview?app_id=${app.id}`)}>
                                        Start AI Interview
                                      </button>
                                    )}
                                  </div>
                                );
                              })()}



                              {app.status === "shortlisted" && (
                                <p style={{ fontSize: "13.5px", fontStyle: "italic", margin: 0, color: "#10b981", fontWeight: "500" }}>
                                  Profile shortlisted. Interview schedule pending.
                                </p>
                              )}

                              {app.status === "rejected" && (
                                <p style={{ fontSize: "13.5px", fontStyle: "italic", margin: 0, color: "#dc2626", fontWeight: "500" }}>
                                  Application closed.
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="cd-placeholder">
                  <div className="cd-placeholder-icon">💼</div>
                  <h3 style={{ margin: 0, color: "#64748b" }}>Select a Job</h3>
                  <p style={{ margin: 0, fontSize: "13.5px", color: "#94a3b8" }}>
                    Select a job listing from the sidebar to view full descriptions and apply.
                  </p>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </>
  );
}

export default CandidateDashboard;
