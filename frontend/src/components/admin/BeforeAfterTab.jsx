import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
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
  patient_name: "",
  patient_age: "",
  problem: "",
  treatment_duration: "",
  doctor_name: "",
  result_summary: "",
  patient_quote: "",
  is_representative: true,
  sessions: "",
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
      await api.post("/admin/before-after", {
        ...form,
        order: Number(form.order) || 0,
        patient_age: form.patient_age ? Number(form.patient_age) : null,
      });
      toast.success("Vaka eklendi");
      setOpen(false); setForm(empty); load();
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bu vakayı silmek istiyor musunuz?")) return;
    await api.delete(`/admin/before-after/${id}`);
    toast.success("Silindi"); load();
  };

  return (
    <div className="space-y-5" data-testid="admin-before-after">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">Vaka Çalışmaları</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} vaka</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full">
          <Plus className="w-4 h-4 mr-1" /> Vaka Ekle
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
              {b.patient_name && (
                <div className="text-xs text-slate-500 mt-0.5">
                  {b.patient_name}{b.patient_age ? `, ${b.patient_age} yaş` : ""}
                </div>
              )}
              <Button size="sm" variant="ghost" onClick={() => onDelete(b.id)} className="text-red-600 hover:bg-red-50 mt-2">
                <Trash2 className="w-3 h-3 mr-1" /> Sil
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Vaka Çalışması</DialogTitle>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Öncesi Görsel URL</Label>
                <Input value={form.before_url} onChange={(e) => setForm({ ...form, before_url: e.target.value })} />
              </div>
              <div>
                <Label>Sonrası Görsel URL</Label>
                <Input value={form.after_url} onChange={(e) => setForm({ ...form, after_url: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Hasta Adı (örn. Ahmet K.)</Label>
                <Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} />
              </div>
              <div>
                <Label>Hasta Yaşı</Label>
                <Input type="number" value={form.patient_age} onChange={(e) => setForm({ ...form, patient_age: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Sorun</Label>
              <Textarea rows={2} value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} />
            </div>
            <div>
              <Label>Sonuç Özeti</Label>
              <Textarea rows={2} value={form.result_summary} onChange={(e) => setForm({ ...form, result_summary: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tedavi Süresi</Label>
                <Input value={form.treatment_duration} onChange={(e) => setForm({ ...form, treatment_duration: e.target.value })} placeholder="5 gün" />
              </div>
              <div>
                <Label>Seans</Label>
                <Input value={form.sessions} onChange={(e) => setForm({ ...form, sessions: e.target.value })} placeholder="2 seans" />
              </div>
            </div>
            <div>
              <Label>Hekim</Label>
              <Input value={form.doctor_name} onChange={(e) => setForm({ ...form, doctor_name: e.target.value })} />
            </div>
            <div>
              <Label>Hasta Yorumu (opsiyonel)</Label>
              <Textarea rows={2} value={form.patient_quote} onChange={(e) => setForm({ ...form, patient_quote: e.target.value })} />
            </div>
            <div>
              <Label>Açıklama (opsiyonel)</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <Switch checked={form.is_representative} onCheckedChange={(v) => setForm({ ...form, is_representative: v })} />
              <div>
                <Label>Temsili Klinik Vaka</Label>
                <div className="text-[11px] text-amber-800">
                  Gerçek foto yoksa açık tutun. Vakada "Temsili" rozeti gösterilir.
                </div>
              </div>
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
