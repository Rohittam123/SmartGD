
import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Topbar from "../components/dashboard/Topbar.jsx";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#050509] text-white">
      <div className="grid min-h-screen grid-cols-[280px,1fr] overflow-hidden">
        <Sidebar />
        <div className="flex min-h-screen flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

