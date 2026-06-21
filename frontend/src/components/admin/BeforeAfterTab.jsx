import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const empty = {
  title: "",
  category: "implant",
  before_url: "",
  after_url: "",
  description: "",
  order: 0,
  active: true,
};

const catLabels = {
  implant: "İmplant",
  ortodonti: "Ortodonti",
  gulus_tasarimi: "Gülüş Tasarımı",
  beyazlatma: "Beyazlatma",
};

export default function BeforeAfterTab() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/admin/before-after").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    try {
      await api.post("/admin/before-after", { ...form, order: Number(form.order) || 0 });
      toast.success("Eklendi");
      setOpen(false); setForm(empty); load();
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bu görseli silmek istiyor musunuz?")) return;
    await api.delete(`/admin/before-after/${id}`);
    toast.success("Silindi"); load();
  };

  return (
    <div className="space-y-5" data-testid="admin-before-after">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">Öncesi / Sonrası Galeri</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} görsel</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full">
          <Plus className="w-4 h-4 mr-1" /> Görsel Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-100 soft-shadow overflow-hidden">
            <div className="grid grid-cols-2 gap-px bg-slate-200">
              <img src={b.before_url} alt="Öncesi" className="aspect-square w-full object-cover bg-slate-100" />
              <img src={b.after_url} alt="Sonrası" className="aspect-square w-full object-cover bg-slate-100" />
            </div>
            <div className="p-4">
              <div className="text-xs text-cyan-700 uppercase tracking-widest font-bold">
                {catLabels[b.category]}
              </div>
              <div className="font-semibold text-slate-900 mt-1">{b.title}</div>
              <Button size="sm" variant="ghost" onClick={() => onDelete(b.id)} className="text-red-600 hover:bg-red-50 mt-2">
                <Trash2 className="w-3 h-3 mr-1" /> Sil
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Öncesi/Sonrası</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Başlık</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(catLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Öncesi Görsel URL</Label>
              <Input value={form.before_url} onChange={(e) => setForm({ ...form, before_url: e.target.value })} />
            </div>
            <div>
              <Label>Sonrası Görsel URL</Label>
              <Input value={form.after_url} onChange={(e) => setForm({ ...form, after_url: e.target.value })} />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
