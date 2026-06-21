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
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

const empty = {
  slug: "",
  name: "",
  short_desc: "",
  long_desc: "",
  duration: "",
  benefits: [],
  image_url: "",
  featured: false,
  order: 0,
  active: true,
};

export default function TreatmentsTab() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/admin/treatments").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    try {
      const payload = {
        ...form,
        order: Number(form.order) || 0,
        benefits: typeof form.benefits === "string"
          ? form.benefits.split(",").map((s) => s.trim()).filter(Boolean)
          : form.benefits,
      };
      if (editing) await api.patch(`/admin/treatments/${editing}`, payload);
      else await api.post("/admin/treatments", payload);
      toast.success("Kaydedildi");
      setOpen(false); setEditing(null); setForm(empty); load();
    } catch (e) {
      toast.error(e.response?.data?.detail?.toString() || "İşlem başarısız");
    }
  };

  const onEdit = (t) => {
    setEditing(t.id);
    setForm({ ...t, benefits: (t.benefits || []).join(", ") });
    setOpen(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bu tedaviyi silmek istiyor musunuz?")) return;
    await api.delete(`/admin/treatments/${id}`);
    toast.success("Tedavi silindi");
    load();
  };

  return (
    <div className="space-y-5" data-testid="admin-treatments">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">Tedaviler</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} tedavi</p>
        </div>
        <Button
          data-testid="add-treatment-btn"
          onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}
          className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full"
        >
          <Plus className="w-4 h-4 mr-1" /> Tedavi Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-100 soft-shadow overflow-hidden">
            <div className="aspect-[16/9] bg-slate-100 relative">
              {t.image_url && (<img src={t.image_url} alt={t.name} className="w-full h-full object-cover" />)}
              {t.featured && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-cyan-600 text-white text-[10px] font-bold uppercase flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" /> Öne Çıkan
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="font-bold text-slate-900">{t.name}</div>
              <div className="text-xs text-slate-500 mt-1 line-clamp-2">{t.short_desc}</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(t)} className="rounded-full">
                  <Pencil className="w-3 h-3 mr-1" /> Düzenle
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(t.id)} className="text-red-600 hover:bg-red-50 rounded-full">
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
            <DialogTitle>{editing ? "Tedaviyi Düzenle" : "Yeni Tedavi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="implant" />
              </div>
              <div>
                <Label>İsim</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Kısa Açıklama</Label>
              <Input value={form.short_desc} onChange={(e) => setForm({ ...form, short_desc: e.target.value })} />
            </div>
            <div>
              <Label>Uzun Açıklama</Label>
              <Textarea rows={3} value={form.long_desc} onChange={(e) => setForm({ ...form, long_desc: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Süre</Label>
                <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="2-6 ay" />
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
              <Label>Avantajlar (virgül ile)</Label>
              <Input value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={!!form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              <Label>Öne Çıkar (Ana Sayfada Göster)</Label>
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
