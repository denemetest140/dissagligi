import React from "react";
import { GraduationCap, Award, Calendar } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function Doctors({ doctors, onAppointmentClick }) {
  return (
    <section
      id="doktorlar"
      data-testid="doctors-section"
      className="py-20 md:py-28 bg-white"
    >
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12">
          <div className="text-sm font-bold text-cyan-700 uppercase tracking-[0.2em]">
            Uzman Kadromuz
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-display">
            Hekimlerimizle Tanışın
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Alanında uzman, sürekli kendini geliştiren ve hasta odaklı yaklaşıma sahip
            hekim kadromuzla tanışın.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {(doctors || []).map((d, i) => (
            <article
              key={d.id || i}
              data-testid={`doctor-card-${i}`}
              className="group bg-gradient-to-b from-slate-50 to-white rounded-3xl overflow-hidden border border-slate-100 soft-shadow hover-shadow"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-200">
                <img
                  src={d.image_url}
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="text-[10px] uppercase tracking-widest opacity-90 mb-1">
                    {d.title}
                  </div>
                  <h3 className="text-xl font-bold font-display">{d.name}</h3>
                  <div className="text-cyan-300 text-sm font-medium mt-0.5">
                    {d.specialty}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                    <span>{d.education}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                    <span>{d.experience_years}+ yıl deneyim</span>
                  </div>
                </div>

                <Button
                  data-testid={`doctor-appointment-btn-${i}`}
                  onClick={() => onAppointmentClick(null, d)}
                  className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-semibold"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Randevu Oluştur
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
