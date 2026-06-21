import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Sparkles, Check, X, Loader2, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { toast } from "sonner";

const questions = [
  { key: "missing_tooth", q: "Eksik veya çekilmiş diş(ler)iniz var mı?" },
  { key: "crooked_teeth", q: "Dişleriniz çapraşık veya düzensiz mi?" },
  { key: "yellowing", q: "Dişlerinizde sararma veya leke var mı?" },
  { key: "aesthetic", q: "Gülüşünüzün estetik görünümünden memnun musunuz? (Hayır = estetik istiyorum)" },
  { key: "gum_problem", q: "Diş eti çekilmesi veya kanama yaşıyor musunuz?" },
  { key: "damaged_old_filling", q: "Eski dolgu/protezleriniz hasarlı mı?" },
];

export default function QuizDialog({ open, onOpenChange, onResultRequestAppointment }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const reset = () => {
    setStep(0);
    setAnswers({});
    setName("");
    setPhone("");
    setResult(null);
  };

  const handleAnswer = (val) => {
    const next = { ...answers, [questions[step].key]: val };
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(questions.length); // show contact step
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/public/quiz", {
        answers,
        name: name || null,
        phone: phone || null,
      });
      setResult(data);
    } catch {
      toast.error("Bir hata oluştu, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const onCloseHandler = (v) => {
    if (!v) reset();
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={onCloseHandler}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0 max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-600" />
            Size Uygun Tedaviyi Bulalım
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!result ? (
            step < questions.length ? (
              <div data-testid={`quiz-step-${step}`}>
                <div className="text-xs text-cyan-700 font-bold uppercase tracking-widest mb-2">
                  Soru {step + 1} / {questions.length}
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-display leading-snug">
                  {questions[step].q}
                </h3>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    data-testid={`quiz-answer-yes`}
                    onClick={() => handleAnswer(true)}
                    className="p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-600 hover:bg-cyan-50 transition-all group"
                  >
                    <Check className="w-7 h-7 text-cyan-600 mx-auto mb-2" />
                    <div className="font-bold text-slate-900">Evet</div>
                  </button>
                  <button
                    data-testid={`quiz-answer-no`}
                    onClick={() => handleAnswer(false)}
                    className="p-5 rounded-2xl border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all"
                  >
                    <X className="w-7 h-7 text-slate-500 mx-auto mb-2" />
                    <div className="font-bold text-slate-700">Hayır</div>
                  </button>
                </div>
                <div className="mt-5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-600 transition-all"
                    style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div data-testid="quiz-contact-step">
                <p className="text-sm text-slate-600 mb-4">
                  Son adım! Sonucunuzu alıp ücretsiz danışmanlık için iletişim bilgilerinizi
                  bırakın (isteğe bağlı).
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="qz-name">Adınız (isteğe bağlı)</Label>
                    <Input
                      id="qz-name"
                      data-testid="quiz-name-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ahmet"
                    />
                  </div>
                  <div>
                    <Label htmlFor="qz-phone">Telefon (isteğe bağlı)</Label>
                    <Input
                      id="qz-phone"
                      data-testid="quiz-phone-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0555 555 55 55"
                    />
                  </div>
                </div>
                <Button
                  data-testid="quiz-submit-btn"
                  onClick={submit}
                  disabled={loading}
                  className="w-full mt-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Sonucumu Göster
                </Button>
              </div>
            )
          ) : (
            <div className="text-center" data-testid="quiz-result">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/40">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="text-xs text-cyan-700 font-bold uppercase tracking-widest">
                Size En Uygun Tedavi
              </div>
              <h3 className="mt-2 text-3xl font-bold text-slate-900 font-display">
                {result.recommendation_name}
              </h3>
              <p className="mt-3 text-slate-600 max-w-sm mx-auto">
                Cevaplarınıza göre öncelikli olarak bu tedaviyi öneriyoruz. Detaylı plan
                için ücretsiz muayene randevusu oluşturalım.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Button
                  data-testid="quiz-book-btn"
                  onClick={() => {
                    onResultRequestAppointment(result.recommendation);
                    onCloseHandler(false);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full px-6"
                >
                  Bu Tedavi için Randevu Al
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  data-testid="quiz-retake-btn"
                  variant="ghost"
                  onClick={reset}
                  className="rounded-full"
                >
                  Quiz'i Tekrarla
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
