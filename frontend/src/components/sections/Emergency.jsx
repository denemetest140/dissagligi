import React from "react";
import { Phone, AlertCircle, Sparkles } from "lucide-react";
import { telLink } from "../../lib/api";

export default function Emergency({ onQuizClick }) {
  return (
    <section
      data-testid="emergency-section"
      className="py-12 md:py-16 bg-gradient-to-br from-red-600 via-red-700 to-rose-800 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center pulse-red">
              <AlertCircle className="w-8 h-8 md:w-9 md:h-9 text-white" />
            </div>
            <div>
              <div className="text-white/80 text-xs font-bold uppercase tracking-widest">
                Acil Diş Tedavisi
              </div>
              <h3 className="mt-1 text-2xl md:text-4xl font-bold text-white font-display leading-tight">
                Şiddetli Diş Ağrınız mı Var?
              </h3>
              <p className="mt-2 text-white/90 text-sm md:text-base">
                Hafta içi 09:00 — 19:00 arası tek tıkla bizi arayın, hemen yönlendirelim.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              data-testid="emergency-call-btn"
              href={telLink()}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-red-700 rounded-full font-bold text-base shadow-2xl hover:scale-105 transition-transform"
            >
              <Phone className="w-5 h-5" />
              Hemen Ara
            </a>
            <button
              data-testid="emergency-quiz-btn"
              onClick={onQuizClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/15 backdrop-blur text-white border border-white/30 rounded-full font-semibold hover:bg-white/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Tedavi Önerici
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
