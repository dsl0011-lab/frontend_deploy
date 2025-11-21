import { Navigate } from "react-router-dom";

export default function RequireRole({ role, user, children }) {
  
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role && user.role !== "A") return <Navigate to="/" replace />;
  return children;
}