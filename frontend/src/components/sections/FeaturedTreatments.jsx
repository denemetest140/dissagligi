import React from "react";
import { ArrowRight, Clock, Check, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useSocialProof, trackInteraction } from "../../lib/socialProof";

export default function FeaturedTreatments({ treatments, onAppointmentClick }) {
  const featured = (treatments || []).filter((t) => t.featured).slice(0, 4);
  const { counts, refresh } = useSocialProof();

  const handleClick = async (t) => {
    await trackInteraction(t.slug, "appointment_open");
    refresh();
    onAppointmentClick(t);
  };

  return (
    <section
      id="tedaviler"
      data-testid="treatments-section"
      className="py-20 md:py-28 bg-white"
    >
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="text-sm font-bold text-cyan-700 uppercase tracking-[0.2em]">
              Uzmanlık Alanlarımız
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-display max-w-2xl">
              En Çok Tercih Edilen Tedaviler
            </h2>
          </div>
          <p className="text-slate-600 text-base max-w-md md:text-right">
            Batman'da kişiye özel planlanan modern diş tedavileri ile sağlıklı, doğal
            ve estetik gülüşler.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {featured.map((t, i) => {
            const todayCount = counts[t.slug] || 0;
            return (
              <article
                key={t.id || t.slug}
                data-testid={`featured-treatment-${t.slug}`}
                className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 soft-shadow hover-shadow flex flex-col"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={t.image_url}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur text-[11px] font-semibold text-slate-900 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-600" />
                    {t.duration}
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="text-[10px] uppercase tracking-widest opacity-80">
                      0{i + 1}
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 font-display">
                    {t.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">
                    {t.short_desc}
                  </p>

                  <ul className="mt-4 space-y-1.5">
                    {(t.benefits || []).slice(0, 3).map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-cyan-600 mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Social proof badge — real count, only show when meaningful */}
                  {todayCount >= 2 && (
                    <div
                      data-testid={`social-proof-${t.slug}`}
                      className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="absolute w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <Users className="w-3.5 h-3.5 text-amber-700 relative" />
                      </div>
                      <span className="text-[11px] font-semibold text-amber-900">
                        Bugün <b>{todayCount}</b> kişi bu tedavi hakkında bilgi aldı
                      </span>
                    </div>
                  )}

                  <Button
                    data-testid={`treatment-cta-${t.slug}`}
                    onClick={() => handleClick(t)}
                    className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold group/btn"
                  >
                    Randevu Al
                    <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
