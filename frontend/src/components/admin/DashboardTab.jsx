import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Calendar, Users, Stethoscope, CheckCircle, Clock, TrendingUp } from "lucide-react";

function Card({ label, value, icon: Icon, accent = "cyan" }) {
  const colors = {
    cyan: "from-cyan-500 to-cyan-700 shadow-cyan-500/30",
    blue: "from-blue-500 to-blue-700 shadow-blue-500/30",
    green: "from-green-500 to-green-700 shadow-green-500/30",
    amber: "from-amber-500 to-amber-700 shadow-amber-500/30",
    purple: "from-purple-500 to-purple-700 shadow-purple-500/30",
    slate: "from-slate-700 to-slate-900 shadow-slate-500/30",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 soft-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</div>
          <div className="mt-2 text-3xl font-bold text-slate-900 font-display">{value}</div>
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[accent]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/admin/appointments").then((r) => setRecent(r.data.slice(0, 5))).catch(() => {});
  }, []);

  if (!stats) return <div className="text-slate-500">Yükleniyor…</div>;

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">Genel Bakış</h1>
        <p className="text-slate-500 text-sm mt-1">Klinik istatistikleri ve son aktiviteler</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card label="Toplam Randevu" value={stats.appointments.total} icon={Calendar} accent="cyan" />
        <Card label="Bekleyen" value={stats.appointments.pending} icon={Clock} accent="amber" />
        <Card label="Onaylanan" value={stats.appointments.confirmed} icon={CheckCircle} accent="green" />
        <Card label="Son 7 Gün" value={stats.appointments.last_7_days} icon={TrendingUp} accent="blue" />
        <Card label="Toplam Lead" value={stats.leads.total} icon={Users} accent="purple" />
        <Card label="Yeni Lead" value={stats.leads.new} icon={Users} accent="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 soft-shadow">
          <h2 className="font-bold text-slate-900 mb-4">Son Randevu Talepleri</h2>
          {recent.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-6">Henüz randevu yok</div>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{r.name}</div>
                    <div className="text-xs text-slate-500">
                      {r.treatment_name} • {r.preferred_date} {r.preferred_time}
                    </div>
                  </div>
                  <div
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      r.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : r.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : r.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {r.status === "pending"
                      ? "Bekliyor"
                      : r.status === "confirmed"
                      ? "Onaylandı"
                      : r.status === "completed"
                      ? "Tamamlandı"
                      : "İptal"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 soft-shadow">
          <h2 className="font-bold text-slate-900 mb-4">İçerik Özeti</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Aktif Doktor</span>
              <span className="font-bold text-slate-900">{stats.doctors}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Aktif Tedavi</span>
              <span className="font-bold text-slate-900">{stats.treatments}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Dönüşen Lead</span>
              <span className="font-bold text-green-700">{stats.leads.converted}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Tamamlanan Tedavi</span>
              <span className="font-bold text-blue-700">{stats.appointments.completed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
