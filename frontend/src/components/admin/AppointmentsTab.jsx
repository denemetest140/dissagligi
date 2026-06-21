import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Trash2, Phone, Mail, MessageSquare, Calendar } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";

const statuses = [
  { v: "all", label: "Tümü" },
  { v: "pending", label: "Bekleyen" },
  { v: "confirmed", label: "Onaylanan" },
  { v: "completed", label: "Tamamlanan" },
  { v: "cancelled", label: "İptal" },
];

const statusOptions = statuses.filter((s) => s.v !== "all");

export default function AppointmentsTab() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = () => {
    api
      .get("/admin/appointments", {
        params: filter === "all" ? {} : { status_filter: filter },
      })
      .then((r) => setItems(r.data));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/appointments/${id}`, { status });
      toast.success("Durum güncellendi");
      load();
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Bu randevuyu silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/admin/appointments/${id}`);
      toast.success("Randevu silindi");
      load();
    } catch {
      toast.error("Silme başarısız");
    }
  };

  return (
    <div className="space-y-5" data-testid="admin-appointments">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">Randevular</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} randevu</p>
        </div>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button
              key={s.v}
              data-testid={`apt-filter-${s.v}`}
              onClick={() => setFilter(s.v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                filter === s.v
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 soft-shadow overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Henüz randevu yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs uppercase text-slate-500 tracking-wider">
                  <th className="px-4 py-3">Hasta</th>
                  <th className="px-4 py-3">İletişim</th>
                  <th className="px-4 py-3">Tedavi</th>
                  <th className="px-4 py-3">Tarih/Saat</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{it.name}</div>
                      {it.notes && (
                        <div className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={it.notes}>
                          <MessageSquare className="inline w-3 h-3 mr-1" /> {it.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <a href={`tel:${it.phone}`} className="flex items-center gap-1 hover:text-cyan-700">
                        <Phone className="w-3 h-3" /> {it.phone}
                      </a>
                      {it.email && (
                        <a
                          href={`mailto:${it.email}`}
                          className="flex items-center gap-1 hover:text-cyan-700 mt-1"
                        >
                          <Mail className="w-3 h-3" /> {it.email}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{it.treatment_name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                        {it.preferred_date}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{it.preferred_time}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={it.status}
                        onValueChange={(v) => updateStatus(it.id, v)}
                      >
                        <SelectTrigger
                          className="h-8 text-xs w-32"
                          data-testid={`apt-status-${it.id}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s.v} value={s.v}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`apt-delete-${it.id}`}
                        onClick={() => remove(it.id)}
                        className="text-red-600 hover:bg-red-50 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
