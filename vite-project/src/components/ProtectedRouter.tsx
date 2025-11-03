import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("accessToken");

  // ✅ Client-side route protection check
  // Note: Actual authentication is handled by HTTP-only cookies sent automatically
  // This localStorage check is just for client-side routing convenience
  // Backend will verify authentication via cookies on each request
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // otherwise, allow route access
  return children;
};

export default ProtectedRoute;
