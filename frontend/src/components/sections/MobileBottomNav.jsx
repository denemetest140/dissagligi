import React from "react";
import { Home, Stethoscope, Users, Calendar, MapPin } from "lucide-react";

const items = [
  { id: "top", icon: Home, label: "Ana Sayfa", target: "#top" },
  { id: "tedaviler", icon: Stethoscope, label: "Tedaviler", target: "#tedaviler" },
  { id: "doktorlar", icon: Users, label: "Doktorlar", target: "#doktorlar" },
  { id: "randevu", icon: Calendar, label: "Randevu", target: "appointment" },
  { id: "iletisim", icon: MapPin, label: "İletişim", target: "#iletisim" },
];

export default function MobileBottomNav({ onAppointmentClick }) {
  const handleClick = (target) => {
    if (target === "appointment") {
      onAppointmentClick();
    } else if (target === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      data-testid="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-safe pt-2 px-3 bg-white/85 backdrop-blur-2xl border-t border-slate-200/60 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]"
    >
      <div className="flex justify-around items-stretch">
        {items.map(({ id, icon: Icon, label, target }) => {
          const isRandevu = id === "randevu";
          return (
            <button
              key={id}
              data-testid={`bottom-nav-${id}`}
              onClick={() => handleClick(target)}
              className="flex flex-col items-center gap-0.5 px-2 py-2 group"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isRandevu
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/40 -mt-4 scale-110"
                    : "text-slate-500 group-active:bg-slate-100"
                }`}
              >
                <Icon className={isRandevu ? "w-6 h-6" : "w-5 h-5"} />
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  isRandevu ? "text-cyan-700" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
