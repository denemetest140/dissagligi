import React, { useState, useEffect } from "react";
import { Menu, X, Calendar, Phone } from "lucide-react";
import { Button } from "../../components/ui/button";
import { telLink } from "../../lib/api";

const navLinks = [
  { label: "Tedaviler", target: "#tedaviler" },
  { label: "Öncesi/Sonrası", target: "#oncesi-sonrasi" },
  { label: "Doktorlar", target: "#doktorlar" },
  { label: "Yorumlar", target: "#yorumlar" },
  { label: "SSS", target: "#sss" },
  { label: "İletişim", target: "#iletisim" },
];

export default function Navbar({ onAppointmentClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (target) => {
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <header
      data-testid="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.05)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a
            href="#top"
            data-testid="nav-logo"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg font-display">D</span>
            </div>
            <div>
              <div className={`font-bold font-display text-lg leading-none ${scrolled ? "text-slate-900" : "text-white"}`}>
                Dentalin
              </div>
              <div className={`text-[10px] font-medium uppercase tracking-widest ${scrolled ? "text-cyan-700" : "text-cyan-300"}`}>
                Diş Sağlığı Merkezi
              </div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <button
                key={l.label}
                data-testid={`nav-${l.label}`}
                onClick={() => scrollTo(l.target)}
                className={`px-3 py-2 text-sm font-semibold rounded-full transition-colors ${
                  scrolled
                    ? "text-slate-700 hover:text-cyan-700 hover:bg-cyan-50"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <a
              data-testid="nav-call"
              href={telLink()}
              className={`flex items-center gap-1.5 text-sm font-semibold ${
                scrolled ? "text-slate-700 hover:text-cyan-700" : "text-white"
              }`}
            >
              <Phone className="w-4 h-4" />
              0488 212 55 56
            </a>
            <Button
              data-testid="nav-randevu-btn"
              onClick={onAppointmentClick}
              className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-semibold"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Randevu Al
            </Button>
          </div>

          <button
            data-testid="nav-mobile-toggle"
            onClick={() => setOpen(!open)}
            className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center ${
              scrolled ? "bg-slate-100 text-slate-700" : "bg-white/10 text-white backdrop-blur"
            }`}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-100">
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <button
                  key={l.label}
                  onClick={() => scrollTo(l.target)}
                  className="text-left px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  {l.label}
                </button>
              ))}
              <Button
                onClick={() => { setOpen(false); onAppointmentClick(); }}
                className="mt-2 bg-cyan-600 text-white rounded-full"
              >
                <Calendar className="w-4 h-4 mr-1" /> Randevu Al
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
