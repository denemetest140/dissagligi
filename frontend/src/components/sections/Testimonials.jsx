import React from "react";
import { Star, Quote } from "lucide-react";

export default function Testimonials({ items }) {
  const list = items && items.length ? items : [];
  // Duplicate for seamless marquee
  const doubled = [...list, ...list];

  return (
    <section
      id="yorumlar"
      data-testid="testimonials-section"
      className="py-20 md:py-28 bg-slate-950 text-white overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(8,145,178,0.18),transparent_60%)]" />
      <div className="relative">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl text-center">
          <div className="text-sm font-bold text-cyan-400 uppercase tracking-[0.2em]">
            Hasta Yorumları
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Hastalarımız Ne Söylüyor?
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-white/70 text-sm">4.9 / 5 — 500+ Google yorumu</span>
          </div>
        </div>

        <div className="mt-12 overflow-hidden">
          <div className="flex gap-5 marquee-track w-max">
            {doubled.map((t, i) => (
              <article
                key={i}
                data-testid={`testimonial-card-${i}`}
                className="w-[320px] sm:w-[380px] shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-cyan-500/30" />
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(t.rating || 5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed">"{t.text}"</p>
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="font-bold text-white">{t.patient_name}</div>
                  <div className="text-xs text-cyan-300">
                    {t.treatment} • {t.location || "Batman"}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
