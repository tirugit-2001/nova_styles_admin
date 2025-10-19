import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("accessToken");

  // if no token → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // otherwise, allow route access
  return children;
};

export default ProtectedRoute;
