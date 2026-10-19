import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../components/common/Loader.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function ProtectedRoute() {
  const { isAuthenticated, profile, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <Loader fullScreen label="Securing your GD workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!profile?.username) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
}
