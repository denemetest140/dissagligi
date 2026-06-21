import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Trash2, Phone, Mail } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";

const statusLabels = {
  new: "Yeni",
  contacted: "İletişim Kuruldu",
  converted: "Dönüştürüldü",
  lost: "Kaybedildi",
};

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  converted: "bg-green-100 text-green-800",
  lost: "bg-slate-200 text-slate-700",
};

const sourceLabels = {
  website: "Web Sitesi",
  appointment_form: "Randevu Formu",
  ai_quiz: "AI Quiz",
};

export default function LeadsTab() {
  const [items, setItems] = useState([]);

  const load = () => {
    api.get("/admin/leads").then((r) => setItems(r.data));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/leads/${id}`, { status });
      toast.success("Lead durumu güncellendi");
      load();
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Bu kaydı silmek istiyor musunuz?")) return;
    await api.delete(`/admin/leads/${id}`);
    toast.success("Lead silindi");
    load();
  };

  return (
    <div className="space-y-5" data-testid="admin-leads">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">Potansiyel Müşteriler</h1>
        <p className="text-slate-500 text-sm mt-1">{items.length} lead</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 soft-shadow overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Henüz lead yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs uppercase text-slate-500 tracking-wider">
                  <th className="px-4 py-3">İletişim</th>
                  <th className="px-4 py-3">İlgi</th>
                  <th className="px-4 py-3">Kaynak</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{it.name || "—"}</div>
                      <div className="text-xs text-slate-500 mt-0.5 space-y-0.5">
                        {it.phone && (
                          <a href={`tel:${it.phone}`} className="flex items-center gap-1 hover:text-cyan-700">
                            <Phone className="w-3 h-3" /> {it.phone}
                          </a>
                        )}
                        {it.email && (
                          <a href={`mailto:${it.email}`} className="flex items-center gap-1 hover:text-cyan-700">
                            <Mail className="w-3 h-3" /> {it.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{it.interest || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-700 font-medium">
                        {sourceLabels[it.source] || it.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={it.status} onValueChange={(v) => updateStatus(it.id, v)}>
                        <SelectTrigger
                          className="h-8 w-40 text-xs"
                          data-testid={`lead-status-${it.id}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[it.status]}`}>
                        {statusLabels[it.status]}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(it.id)}
                        data-testid={`lead-delete-${it.id}`}
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
