import { Route, Routes } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";

import Landing from "../pages/Landing.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import CompleteProfile from "../pages/auth/CompleteProfile.jsx";
import VerifyEmail from "../pages/auth/VerifyEmail.jsx";

import Dashboard from "../pages/dashboard/Dashboard.jsx";
import Profile from "../pages/dashboard/Profile.jsx";
import SearchUsers from "../pages/dashboard/SearchUsers.jsx";
import PublicUserProfile from "../pages/dashboard/PublicUserProfile.jsx";
import CreateRoom from "../pages/dashboard/CreateRoom.jsx";
import JoinRoom from "../pages/dashboard/JoinRoom.jsx";
import Room from "../pages/dashboard/Room.jsx";
import Reports from "../pages/dashboard/Reports.jsx";
import Leaderboard from "../pages/dashboard/Leaderboard.jsx";
import Practice from "../pages/dashboard/Practice.jsx";
import Notifications from "../pages/dashboard/Notifications.jsx";
import Mentor from "../pages/dashboard/Mentor.jsx";

import AdminPanel from "../pages/admin/AdminPanel.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users" element={<SearchUsers />} />
          <Route path="/users/:username" element={<PublicUserProfile />} />
          <Route path="/rooms/create" element={<CreateRoom />} />
          <Route path="/rooms/join" element={<JoinRoom />} />
          <Route path="/rooms/:roomId" element={<Room />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/mentor" element={<Mentor />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>
    </Routes>
  );
}
