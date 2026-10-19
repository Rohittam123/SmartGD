import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/common/Loader.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function AdminRoute() {
  const { isAdmin, firebaseUser, profile, authLoading } = useAuth();

  if (authLoading) {
    return <Loader fullScreen label="Checking admin access..." />;
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (!profile?.username) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
