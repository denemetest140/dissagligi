import React, { useEffect, useRef, useState } from "react";
import { Users, Activity, Award, Smile } from "lucide-react";

const stats = [
  { value: 5000, suffix: "+", label: "Mutlu Hasta", icon: Users },
  { value: 10000, suffix: "+", label: "Başarılı Tedavi", icon: Activity },
  { value: 10, suffix: "+", label: "Yıllık Deneyim", icon: Award },
  { value: 98, suffix: "%", label: "Hasta Memnuniyeti", icon: Smile },
];

function CountUp({ end, duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(Math.floor(eased * end));
            if (t < 1) requestAnimationFrame(tick);
            else setVal(end);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{val.toLocaleString("tr-TR")}</span>;
}

export default function TrustStats() {
  return (
    <section
      data-testid="trust-stats-section"
      className="py-16 md:py-24 bg-gradient-to-b from-white via-slate-50 to-white"
    >
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12">
          <div className="text-sm font-bold text-cyan-700 uppercase tracking-[0.2em]">
            Rakamlarla Dentalin
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-display">
            Güvenin Rakamları
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              data-testid={`stat-card-${i}`}
              className="relative bg-white rounded-3xl p-6 md:p-8 soft-shadow border border-slate-100 hover-shadow group overflow-hidden"
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-cyan-50 rounded-full opacity-60 group-hover:scale-125 transition-transform duration-500" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-slate-900 font-display tabular-nums">
                  <CountUp end={s.value} />
                  <span className="text-cyan-600">{s.suffix}</span>
                </div>
                <div className="mt-2 text-sm md:text-base text-slate-600 font-medium">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
