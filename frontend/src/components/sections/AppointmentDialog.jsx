import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { ChevronRight, ChevronLeft, Check, Calendar, Clock, User, Phone, Loader2 } from "lucide-react";
import { api, formatApiError } from "../../lib/api";
import { toast } from "sonner";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

function getNextDays(count = 14) {
  const out = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const isSunday = d.getDay() === 0;
    if (isSunday) continue;
    out.push(d);
  }
  return out.slice(0, count);
}

const dayLabels = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const monthLabels = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export default function AppointmentDialog({ open, onOpenChange, treatments, presetTreatment }) {
  const [step, setStep] = useState(1);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(presetTreatment ? 2 : 1);
      setSelectedTreatment(presetTreatment || null);
      setSelectedDate(null);
      setSelectedTime("");
      setForm({ name: "", phone: "", email: "", notes: "" });
      setDone(false);
    }
  }, [open, presetTreatment]);

  const days = getNextDays(14);

  const canNext1 = !!selectedTreatment;
  const canNext2 = !!selectedDate && !!selectedTime;
  const canSubmit = form.name.trim().length >= 2 && form.phone.trim().length >= 10;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/public/appointments", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        treatment_slug: selectedTreatment.slug,
        treatment_name: selectedTreatment.name,
        preferred_date: selectedDate.toISOString().slice(0, 10),
        preferred_time: selectedTime,
        notes: form.notes.trim() || null,
      });
      setDone(true);
      toast.success("Randevu talebiniz alındı! En kısa sürede sizi arayacağız.");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0 max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-2xl font-bold font-display text-slate-900">
            {done ? "Talebiniz Alındı" : "Randevu Al"}
          </DialogTitle>
          {!done && (
            <div className="mt-4 flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                      step >= s
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-1 rounded-full ${
                        step > s ? "bg-cyan-600" : "bg-slate-100"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {done ? (
            <div className="text-center py-8" data-testid="appointment-success">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Teşekkür ederiz, {form.name}!
              </h3>
              <p className="mt-2 text-slate-600">
                Randevu talebiniz başarıyla alındı. Klinik ekibimiz en geç 2 saat
                içinde sizinle iletişime geçecek.
              </p>
              <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-left text-sm space-y-1">
                <div><span className="text-slate-500">Tedavi:</span> <b>{selectedTreatment?.name}</b></div>
                <div><span className="text-slate-500">Tarih:</span> <b>{selectedDate?.toLocaleDateString("tr-TR")}</b></div>
                <div><span className="text-slate-500">Saat:</span> <b>{selectedTime}</b></div>
              </div>
            </div>
          ) : step === 1 ? (
            <div data-testid="appointment-step-1">
              <p className="text-sm text-slate-600 mb-4">İlgilendiğiniz tedaviyi seçin</p>
              <div className="grid grid-cols-2 gap-3">
                {(treatments || []).map((t) => (
                  <button
                    key={t.id}
                    data-testid={`apt-treatment-${t.slug}`}
                    onClick={() => setSelectedTreatment(t)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedTreatment?.id === t.id
                        ? "border-cyan-600 bg-cyan-50"
                        : "border-slate-200 hover:border-cyan-300"
                    }`}
                  >
                    <div className="font-semibold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {t.duration}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : step === 2 ? (
            <div data-testid="appointment-step-2">
              <p className="text-sm text-slate-600 mb-3">Uygun tarih seçin</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                {days.map((d, i) => {
                  const sel = selectedDate?.toDateString() === d.toDateString();
                  return (
                    <button
                      key={i}
                      data-testid={`apt-date-${i}`}
                      onClick={() => setSelectedDate(d)}
                      className={`shrink-0 w-16 py-3 rounded-2xl border-2 transition-all text-center ${
                        sel
                          ? "border-cyan-600 bg-cyan-600 text-white"
                          : "border-slate-200 hover:border-cyan-300 text-slate-700"
                      }`}
                    >
                      <div className="text-[10px] uppercase opacity-80">{dayLabels[d.getDay()]}</div>
                      <div className="text-xl font-bold">{d.getDate()}</div>
                      <div className="text-[10px] opacity-80">{monthLabels[d.getMonth()]}</div>
                    </button>
                  );
                })}
              </div>

              <p className="text-sm text-slate-600 mb-3 mt-5">Saat seçin</p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    data-testid={`apt-time-${t}`}
                    onClick={() => setSelectedTime(t)}
                    disabled={!selectedDate}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40 ${
                      selectedTime === t
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:border-cyan-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4" data-testid="appointment-step-3">
              <p className="text-sm text-slate-600">İletişim bilgilerinizi girin</p>
              <div>
                <Label htmlFor="apt-name">Ad Soyad *</Label>
                <div className="relative mt-1">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="apt-name"
                    data-testid="apt-name-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ahmet Yılmaz"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="apt-phone">Telefon *</Label>
                <div className="relative mt-1">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="apt-phone"
                    data-testid="apt-phone-input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0555 555 55 55"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="apt-email">E-posta (isteğe bağlı)</Label>
                <Input
                  id="apt-email"
                  data-testid="apt-email-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <Label htmlFor="apt-notes">Notunuz (isteğe bağlı)</Label>
                <Textarea
                  id="apt-notes"
                  data-testid="apt-notes-input"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Şikayetinizi kısaca anlatabilirsiniz"
                  rows={3}
                />
              </div>
              <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-100 text-sm text-cyan-900">
                <div className="font-semibold mb-1">Özet</div>
                <div>
                  <Calendar className="inline w-3.5 h-3.5 mr-1" />
                  {selectedTreatment?.name} • {selectedDate?.toLocaleDateString("tr-TR")} • {selectedTime}
                </div>
              </div>
            </div>
          )}
        </div>

        {!done && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-between gap-2">
            <Button
              data-testid="apt-back-btn"
              variant="ghost"
              onClick={() => (step > 1 ? setStep(step - 1) : onOpenChange(false))}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {step === 1 ? "İptal" : "Geri"}
            </Button>
            {step < 3 ? (
              <Button
                data-testid="apt-next-btn"
                onClick={() => setStep(step + 1)}
                disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full px-6"
              >
                Devam
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                data-testid="apt-submit-btn"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full px-6"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Randevuyu Onayla
              </Button>
            )}
          </div>
        )}
        {done && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
            <Button
              data-testid="apt-close-btn"
              onClick={() => onOpenChange(false)}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6"
            >
              Kapat
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
