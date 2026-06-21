import React from "react";
import { Check, X } from "lucide-react";

const advantages = [
  "Modern dijital röntgen ve 3D tarayıcı",
  "Alanında uzman, sertifikalı hekim kadrosu",
  "Kişiye özel tedavi planlaması",
  "Hastane standardı steril ortam",
  "Aynı gün/ertesi gün hızlı randevu sistemi",
  "Tedavi sonrası ücretsiz kontrol takibi",
  "Ücretsiz ilk muayene ve danışmanlık",
  "12 aya varan taksit imkanı",
];

const others = [
  "Eski teknoloji, manuel röntgen",
  "Genel uygulamalar, kişiselleştirme yok",
  "Standart yaklaşım",
  "Sınırlı sterilizasyon kontrolü",
  "Uzun randevu beklemesi",
  "Tek seferlik tedavi, takip yok",
  "Ücretli muayene",
  "Peşin veya kısıtlı taksit",
];

export default function WhyDentalin() {
  return (
    <section
      data-testid="why-dentalin-section"
      className="py-20 md:py-28 bg-white"
    >
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12">
          <div className="text-sm font-bold text-cyan-700 uppercase tracking-[0.2em]">
            Fark Yaratıyoruz
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-display">
            Neden Dentalin?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* Dentalin */}
          <div className="relative bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-800 text-white rounded-3xl p-8 md:p-10 overflow-hidden cyan-shadow">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                DENTALIN
              </div>
              <h3 className="text-2xl md:text-3xl font-bold font-display mb-6">
                Modern Diş Hekimliği
              </h3>
              <ul className="space-y-3">
                {advantages.map((a, i) => (
                  <li key={i} className="flex items-start gap-3" data-testid={`dentalin-adv-${i}`}>
                    <div className="w-6 h-6 rounded-full bg-white text-cyan-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                    <span className="text-white/95 leading-relaxed">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Others */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold mb-4">
              DİĞER KLİNİKLER
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-slate-700 mb-6">
              Geleneksel Yaklaşım
            </h3>
            <ul className="space-y-3">
              {others.map((o, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <span className="text-slate-600 leading-relaxed">{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
