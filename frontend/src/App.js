import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Interview from "./pages/Interview";
import Result from "./pages/Result";
import HRLogin from "./pages/HRLogin";
import HRDashboard from "./pages/HRDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import { Navigate } from "react-router-dom";

/* ✅ Protected Route with Role Checks */
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const role = user.role || "candidate";
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === "hr" ? "/hr-dashboard" : "/candidate-dashboard"} replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hr-login" element={<HRLogin />} />

        <Route
          path="/candidate-dashboard"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <Interview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/result"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <Result />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr-dashboard"
          element={
            <ProtectedRoute allowedRoles={["hr"]}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;