import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const empty = {
  name: "",
  title: "Uzm. Dt.",
  specialty: "",
  education: "",
  experience_years: 5,
  bio: "",
  image_url: "",
  certifications: [],
  order: 0,
  active: true,
};

export default function DoctorsTab() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/admin/doctors").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    try {
      const payload = {
        ...form,
        experience_years: Number(form.experience_years) || 0,
        order: Number(form.order) || 0,
        certifications: typeof form.certifications === "string"
          ? form.certifications.split(",").map((s) => s.trim()).filter(Boolean)
          : form.certifications,
      };
      if (editing) await api.patch(`/admin/doctors/${editing}`, payload);
      else await api.post("/admin/doctors", payload);
      toast.success(editing ? "Doktor güncellendi" : "Doktor eklendi");
      setOpen(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const onEdit = (d) => {
    setEditing(d.id);
    setForm({ ...d, certifications: (d.certifications || []).join(", ") });
    setOpen(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bu doktoru silmek istediğinize emin misiniz?")) return;
    await api.delete(`/admin/doctors/${id}`);
    toast.success("Doktor silindi");
    load();
  };

  return (
    <div className="space-y-5" data-testid="admin-doctors">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">Doktorlar</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} doktor</p>
        </div>
        <Button
          data-testid="add-doctor-btn"
          onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}
          className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full"
        >
          <Plus className="w-4 h-4 mr-1" /> Doktor Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl border border-slate-100 soft-shadow overflow-hidden">
            <div className="aspect-[4/3] bg-slate-100">
              {d.image_url && (
                <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-4">
              <div className="font-bold text-slate-900">{d.name}</div>
              <div className="text-xs text-cyan-700 font-medium">{d.specialty}</div>
              <div className="text-xs text-slate-500 mt-1">{d.experience_years}+ yıl</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(d)} className="rounded-full">
                  <Pencil className="w-3 h-3 mr-1" /> Düzenle
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(d.id)} className="text-red-600 hover:bg-red-50 rounded-full">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Doktoru Düzenle" : "Yeni Doktor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Unvan</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Uzm. Dt." />
              </div>
              <div>
                <Label>Ad Soyad</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Uzmanlık</Label>
              <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
            </div>
            <div>
              <Label>Eğitim</Label>
              <Input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Deneyim (yıl)</Label>
                <Input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
              </div>
              <div>
                <Label>Sıra</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Görsel URL</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div>
              <Label>Sertifikalar (virgül ile)</Label>
              <Input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} />
            </div>
            <div>
              <Label>Biyografi</Label>
              <Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
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
