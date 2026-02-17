import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import StudentDash from "./pages/StudentDash";
import StaffDash from "./pages/StaffDash";

function ProtectedRoute({ children, requireStaff = false }) {
  const raw = localStorage.getItem("user");
  if (!raw) return <Navigate to="/login" replace />;
  const user = JSON.parse(raw);
  if (requireStaff && !user.is_staff) return <Navigate to="/student" replace />;
  if (!requireStaff && user.is_staff) return <Navigate to="/staff" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute requireStaff={false}>
              <StudentDash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute requireStaff={true}>
              <StaffDash />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}