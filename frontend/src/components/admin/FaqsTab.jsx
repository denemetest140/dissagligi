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
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const empty = { question: "", answer: "", order: 0, active: true };

export default function FaqsTab() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/admin/faqs").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editing) await api.patch(`/admin/faqs/${editing}`, payload);
      else await api.post("/admin/faqs", payload);
      toast.success("Kaydedildi");
      setOpen(false); setEditing(null); setForm(empty); load();
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bu SSS'i silmek istiyor musunuz?")) return;
    await api.delete(`/admin/faqs/${id}`);
    toast.success("Silindi"); load();
  };

  return (
    <div className="space-y-5" data-testid="admin-faqs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">Sıkça Sorulan Sorular</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} soru</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} data-testid="add-faq-btn" className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full">
          <Plus className="w-4 h-4 mr-1" /> Soru Ekle
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 soft-shadow divide-y divide-slate-100">
        {items.map((f) => (
          <div key={f.id} className="p-4 flex items-start gap-3">
            <div className="flex-1">
              <div className="font-semibold text-slate-900">{f.question}</div>
              <div className="text-sm text-slate-600 mt-1">{f.answer}</div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(f.id); setForm(f); setOpen(true); }} className="h-8 w-8">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onDelete(f.id)} className="text-red-600 hover:bg-red-50 h-8 w-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Düzenle" : "Yeni SSS"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Soru</Label>
              <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </div>
            <div>
              <Label>Cevap</Label>
              <Textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            </div>
            <div>
              <Label>Sıra</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
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
