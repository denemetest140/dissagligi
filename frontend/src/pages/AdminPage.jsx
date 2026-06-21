import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  MessageSquare,
  HelpCircle,
  Image,
  UserCog,
  LogOut,
  Home,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/brand/Logo";
import DashboardTab from "../components/admin/DashboardTab";
import AppointmentsTab from "../components/admin/AppointmentsTab";
import LeadsTab from "../components/admin/LeadsTab";
import DoctorsTab from "../components/admin/DoctorsTab";
import TreatmentsTab from "../components/admin/TreatmentsTab";
import TestimonialsTab from "../components/admin/TestimonialsTab";
import FaqsTab from "../components/admin/FaqsTab";
import BeforeAfterTab from "../components/admin/BeforeAfterTab";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/appointments", label: "Randevular", icon: Calendar },
  { to: "/admin/leads", label: "Potansiyel Müşteriler", icon: Users },
  { to: "/admin/treatments", label: "Tedaviler", icon: Stethoscope },
  { to: "/admin/doctors", label: "Doktorlar", icon: UserCog },
  { to: "/admin/testimonials", label: "Hasta Yorumları", icon: MessageSquare },
  { to: "/admin/before-after", label: "Galeri (Öncesi/Sonrası)", icon: Image },
  { to: "/admin/faqs", label: "SSS", icon: HelpCircle },
];

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="p-5 border-b border-slate-100">
          <Logo size={36} />
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-testid={`admin-nav-${n.label}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cyan-50 text-cyan-800 border border-cyan-100"
                    : "text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Home className="w-4 h-4" /> Siteyi Görüntüle
          </NavLink>
          <button
            data-testid="admin-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Hoş geldiniz</div>
            <div className="font-bold text-slate-900">{user?.name || "Yönetici"}</div>
          </div>
          <button
            data-testid="admin-topbar-logout"
            onClick={handleLogout}
            className="lg:hidden p-2 rounded-full hover:bg-slate-100"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Mobile Nav */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-2 flex gap-1 overflow-x-auto no-scrollbar">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  isActive ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-700"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </div>

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Routes>
            <Route index element={<DashboardTab />} />
            <Route path="appointments" element={<AppointmentsTab />} />
            <Route path="leads" element={<LeadsTab />} />
            <Route path="treatments" element={<TreatmentsTab />} />
            <Route path="doctors" element={<DoctorsTab />} />
            <Route path="testimonials" element={<TestimonialsTab />} />
            <Route path="before-after" element={<BeforeAfterTab />} />
            <Route path="faqs" element={<FaqsTab />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
