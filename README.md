# 🎯 HireScope – AI-Powered Recruitment & Candidate Screening Platform

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)]()
[![Django](https://img.shields.io/badge/Backend-Django-092E20?logo=django&logoColor=white)]()
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)]()
[![HuggingFace](https://img.shields.io/badge/AI-HuggingFace%20LLaMA%203-FFD21E?logo=huggingface&logoColor=black)]()

> An AI-powered hiring management system that automates the recruitment pipeline, screens candidate resumes using LLMs, and conducts voice-based, adaptive screening interviews.

---

## 🌐 Live Links

| Platform | URL |
|---|---|
| **Frontend App** | https://hrmscope.vercel.app/ |
| **Backend API** | https://hirescope-0mxr.onrender.com |

---

## 🧠 What is HireScope?

HireScope streamlines candidate evaluation at scale. Instead of manual resume screening and tedious initial phone calls, HireScope leverages AI to:
1. **Parse & Screen Resumes:** Automatically extract candidate education, experience, and skills from uploaded PDFs.
2. **Conduct Voice-Based Interviews:** Simulates a real screening interview using an adaptive AI interviewer that speaks and listens, evaluating soft skills (clarity, empathy, fluency) alongside technical background.
3. **Automate Pipeline & Shortlisting:** Provides recruiters with an administrative interface to manage jobs, schedule interviews, and run AI candidate ranking against Job Descriptions.

---

## ✨ Features

### 🎤 Voice-Based Screening Interview
* **Speech-to-Text:** Browser-native speech recognition captures candidate spoken answers in real-time.
* **Text-to-Speech:** Delivers the AI interviewer's questions aloud for a natural, voice-driven experience.
* **Adaptive AI Interviewer:** Follows up dynamically based on candidate responses using LLaMA 3, maintaining full context across a 5-question session.

### 👁️ AI Proctoring & Cheating Detection
* **Real-time Face Verification:** Uses TensorFlow.js (`blazeface`) to verify candidate presence and alert if multiple faces or no faces are visible.
* **Eye-Tracking & Focus Monitoring:** Tracks eye contact and head orientation using facial landmarks, warning the candidate if they look away from the screen.
* **Unauthorized Device Detection:** Uses Object Detection (`coco-ssd`) to detect cell phones in the camera frame and warns the candidate to remove unauthorized devices.

### 📂 AI Resume Parsing & Concept Extraction
* Candidate uploads a PDF resume upon profile creation.
* Backend parses text and calls LLaMA 3 to extract structured properties: contact, education, CGPA, skills, projects, and experiences.

### 💼 Recruiter Dashboard (Recruitment Board)
* **Job Posting Management:** Recruiter can create, list, and delete job postings with specified experience levels, domains, last date to apply, and required skills.
* **Application Tracker:** View candidates, track application status (`applied`, `shortlisted`, `interview_scheduled`, `interview_completed`, `rejected`).
* **AI Shortlist Matcher:** Recruiters can run the "AI Shortlist Tool" which ranks applicants against the job description using LLaMA 3.
* **Interview Scheduler:** Schedule or cancel interviews for applicants, complete with automated notifications/status changes.
* **Evaluation Scorecard:** View multi-dimensional candidate evaluation logs.

### 📊 Automated Evaluation & Verdicts
After the interview, the AI generates a structured scorecard evaluating:
* **Clarity** (Out of 10)
* **Warmth** & Empathy (Out of 10)
* **Patience** (Out of 10)
* **Simplicity** of Explanation (Out of 10)
* **English Fluency** (Out of 10)
* **Strengths & Weaknesses** with conversation evidence.
* **Final Verdict:** Automated decision (`SHORTLISTED` / `REJECTED`).

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Web Speech API (Speech Recognition & Synthesis), Axios, Google OAuth |
| **Backend** | Django, Django REST Framework, Gunicorn |
| **Database** | MongoDB (via MongoEngine), SQLite (internal Django sessions) |
| **AI Model** | HuggingFace (LLaMA 3 8B Instruct API) |
| **File Storage** | Cloudinary (for PDF resume uploads) |

---

## 📁 Project Structure

```
Hirescope/
├── Backend/
│   ├── core/           # Project settings, WSGI/ASGI, routing config
│   ├── users/          # Candidate/HR authentication and profile updates
│   ├── chat/           # Interview sessions, AI evaluations, and job views
│   └── manage.py
│
└── frontend/
    └── src/
        ├── components/ # Video panels, chat interfaces, and reusable UI
        ├── pages/      # Dashboards (Candidate, HR), Home page, Interview rooms
        ├── services/   # Axios API integrations
        └── App.js      # App routing and layout
```

---

## ⚙️ Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Samrat740/Hirescope.git
cd Hirescope
```

### 2. Set up the backend
```bash
cd Backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

### 3. Configure Backend Environment
Create a `.env` file in the `Backend/` directory:
```env
SECRET_KEY=your_django_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
HF_API_KEY=your_huggingface_api_key
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Development variables
DEBUG=True
HR_EMAIL=hr@hirescope.com
HR_PASSWORD=hrpassword
```

### 4. Run the backend
```bash
python manage.py runserver
```

### 5. Set up the frontend
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
REACT_APP_BACKEND_URL=http://localhost:8000
```

### 6. Run the frontend
```bash
npm start
```
The application will open at `http://localhost:3000`.

---

## 🚀 Deployment

### Backend (Render)
1. Set up a **Web Service** pointing to the `Backend` root directory.
2. Build Command:
   ```bash
   pip install -r requirements.txt && python manage.py collectstatic --no-input
   ```
3. Start Command:
   ```bash
   gunicorn core.wsgi:application
   ```
4. Define your production environment variables (set `DEBUG=False`).

### Frontend (Vercel)
1. Add a project pointing to the `frontend` directory.
2. Configure environment variables:
   * Set `REACT_APP_BACKEND_URL` to your Render service URL (e.g., `https://hirescope-api.onrender.com`).
   * Set `REACT_APP_GOOGLE_CLIENT_ID`.
3. Whitelist the deployed Vercel domain under **Authorized JavaScript Origins** in the Google Cloud Console.

---

## 🔌 API Reference

### Authentication
* `POST /api/auth/google/`: Authenticate/register candidate using Google OAuth ID tokens. Returns JWT access tokens.
* `POST /api/auth/hr-login/`: Authenticate HR recruiter using email and password.
* `GET /api/auth/profile/`: Get details of the authenticated user.

### Candidate Profiles & Resumes
* `POST /api/users/profile/update/`: Update candidate contact details and upload/parse resume.
* `POST /api/users/profile/parse-resume/`: Extract details from PDF resume.

### Recruitment & Interviews
* `POST /api/chat/message/`: Post candidate response to the AI interviewer and receive dynamic follow-up response.
* `POST /api/chat/jobs/create/`: Create a new job posting (HR Recruiter only).
* `GET /api/chat/jobs/list/`: List all job postings.
* `POST /api/chat/hr/shortlist/`: Rank applicants for a specific job using LLaMA 3.
* `POST /api/chat/hr/schedule/`: Schedule interviews for applicants.

---

## ⚠️ Edge Cases Handled
* Vague or empty candidate answers are prompt-guided by the AI.
* Audio input issues (microphone permissions/silence) alert candidates.
* Resilient token checking and route-based JWT verification.
* Graceful fallback parsing in cases of irregular JSON outputs from the LLM.

---

## 🔮 Future HRMS Roadmap
* [ ] **Employee Management:** Operationalize directory of active hired employees.
* [ ] **Attendance Tracking:** Actual daily login/logout check-in registers.
* [ ] **Payroll Automation:** Payslip logging, allowances, and deduction engines.
* [ ] **Performance Appraisal Log:** Recurring performance review and manager rating boards.