import React from "react";
import { Calendar, Phone, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { telLink, waLink } from "../../lib/api";

export default function FinalCTA({ onAppointmentClick }) {
  return (
    <section
      data-testid="final-cta-section"
      className="py-20 md:py-32 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 relative overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-4xl relative text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          İlk Adımı Atın
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white font-display leading-[1.05]">
          Hayalinizdeki{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
            Gülüşe
          </span>{" "}
          Bugün Başlayın
        </h2>
        <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
          Uzman hekimlerimizle tanışın ve size özel tedavi planınızı oluşturun.
          İlk muayene ve fiyat danışmanlığımız <b className="text-white">ücretsiz</b>.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button
            data-testid="final-cta-randevu-btn"
            onClick={onAppointmentClick}
            className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-full px-8 py-6 text-base font-semibold shadow-[0_14px_40px_rgba(34,211,238,0.5)]"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Randevu Al
          </Button>
          <Button
            data-testid="final-cta-whatsapp-btn"
            asChild
            className="bg-[#25D366] hover:bg-[#1eb955] text-white rounded-full px-8 py-6 text-base font-semibold shadow-[0_14px_40px_rgba(37,211,102,0.4)]"
          >
            <a href={waLink("Hayalimdeki gülüş için randevu almak istiyorum.")} target="_blank" rel="noreferrer">
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </a>
          </Button>
          <Button
            data-testid="final-cta-call-btn"
            asChild
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-full px-8 py-6 text-base font-semibold backdrop-blur"
          >
            <a href={telLink()}>
              <Phone className="w-5 h-5 mr-2" />
              Hemen Ara
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
