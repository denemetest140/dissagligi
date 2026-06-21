import React, { useState, useEffect } from "react";
import { Phone, MessageCircle, Calendar, Stethoscope, Sparkles, Wind, Star } from "lucide-react";
import { Button } from "../../components/ui/button";
import { waLink, telLink } from "../../lib/api";

const trustItems = [
  { icon: Stethoscope, text: "Uzman Diş Hekimleri" },
  { icon: Sparkles, text: "Modern Teknoloji" },
  { icon: Wind, text: "Kişiye Özel Tedavi" },
  { icon: Calendar, text: "Hızlı Randevu Sistemi" },
];

export default function Hero({ onAppointmentClick }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section
      data-testid="hero-section"
      className="relative min-h-[92vh] md:min-h-[88vh] flex items-center overflow-hidden rounded-b-[40px] md:rounded-b-[80px]"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?crop=entropy&cs=srgb&fm=jpg&q=85&w=2000"
          alt="Dentalin modern diş kliniği Batman"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-cyan-900/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(8,145,178,0.25),transparent_60%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl pt-28 md:pt-32 pb-16">
        <div className="max-w-3xl">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass-dark text-white/90 text-xs sm:text-sm font-medium border border-cyan-400/30 ${mounted ? "float-up" : "opacity-0"}`}
          >
            <Star className="w-3.5 h-3.5 fill-cyan-300 text-cyan-300" />
            Batman'ın Premium Diş Sağlığı Merkezi
          </div>

          <h1
            className={`text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight font-display ${mounted ? "float-up" : "opacity-0"}`}
            style={{ animationDelay: "0.1s" }}
          >
            Batman'da Modern Diş Tedavileri ile{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-white bg-clip-text text-transparent">
              Sağlıklı ve Estetik Gülüşler
            </span>
          </h1>

          <p
            className={`mt-6 text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl leading-relaxed ${mounted ? "float-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            Uzman hekim kadrosu, ileri teknoloji ve kişiye özel tedavi planları ile
            güvenilir ağız ve diş sağlığı hizmetleri.
          </p>

          {/* CTAs */}
          <div
            className={`mt-8 flex flex-wrap gap-3 ${mounted ? "float-up" : "opacity-0"}`}
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              data-testid="hero-randevu-btn"
              onClick={onAppointmentClick}
              className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-full px-7 py-6 text-base font-semibold shadow-[0_14px_40px_rgba(34,211,238,0.5)] transition-transform hover:scale-[1.03]"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Randevu Al
            </Button>
            <Button
              data-testid="hero-whatsapp-btn"
              asChild
              variant="outline"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/30 text-white rounded-full px-7 py-6 text-base font-semibold"
            >
              <a
                href={waLink("Merhaba, Dentalin'den bilgi almak istiyorum.")}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp'tan Yaz
              </a>
            </Button>
            <Button
              data-testid="hero-call-btn"
              asChild
              variant="outline"
              className="bg-transparent hover:bg-white/10 border-white/40 text-white rounded-full px-7 py-6 text-base font-semibold"
            >
              <a href={telLink()}>
                <Phone className="w-5 h-5 mr-2" />
                Hemen Ara
              </a>
            </Button>
          </div>

          {/* Trust badges */}
          <div
            className={`mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 ${mounted ? "float-up" : "opacity-0"}`}
            style={{ animationDelay: "0.4s" }}
          >
            {trustItems.map(({ icon: Icon, text }, i) => (
              <div
                key={i}
                data-testid={`hero-trust-badge-${i}`}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl glass-dark border border-white/15"
              >
                <Icon className="w-5 h-5 text-cyan-300 shrink-0" />
                <span className="text-white text-xs sm:text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
