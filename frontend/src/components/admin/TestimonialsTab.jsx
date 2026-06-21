import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Plus, Trash2, Star, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const empty = {
  patient_name: "",
  location: "Batman",
  rating: 5,
  text: "",
  treatment: "",
  image_url: "",
  video_url: "",
  approved: true,
};

export default function TestimonialsTab() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/admin/testimonials").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    try {
      await api.post("/admin/testimonials", {
        ...form,
        rating: Number(form.rating) || 5,
      });
      toast.success("Yorum eklendi");
      setOpen(false);
      setForm(empty);
      load();
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const toggleApproved = async (t) => {
    await api.patch(`/admin/testimonials/${t.id}`, { ...t, approved: !t.approved });
    load();
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bu yorumu silmek istiyor musunuz?")) return;
    await api.delete(`/admin/testimonials/${id}`);
    toast.success("Yorum silindi");
    load();
  };

  return (
    <div className="space-y-5" data-testid="admin-testimonials">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">Hasta Yorumları</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} yorum</p>
        </div>
        <Button data-testid="add-testimonial-btn" onClick={() => setOpen(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full">
          <Plus className="w-4 h-4 mr-1" /> Yorum Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-100 soft-shadow p-5">
            <div className="flex items-center justify-between">
              <div className="flex">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <button
                onClick={() => toggleApproved(t)}
                className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full ${
                  t.approved ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                }`}
              >
                {t.approved ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {t.approved ? "Onaylı" : "Onay Bekliyor"}
              </button>
            </div>
            <p className="text-sm text-slate-700 mt-3 line-clamp-4">"{t.text}"</p>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs flex justify-between">
              <div>
                <div className="font-bold text-slate-900">{t.patient_name}</div>
                <div className="text-cyan-700">{t.treatment}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => onDelete(t.id)} className="text-red-600 hover:bg-red-50 h-8 w-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Yorum</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Hasta Adı</Label>
                <Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} />
              </div>
              <div>
                <Label>Konum</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tedavi</Label>
                <Input value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
              </div>
              <div>
                <Label>Puan (1-5)</Label>
                <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Yorum</Label>
              <Textarea rows={4} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.approved} onCheckedChange={(v) => setForm({ ...form, approved: v })} />
              <Label>Onayla (Sitede Göster)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={onSave} className="bg-cyan-600 text-white">Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
