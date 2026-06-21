import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MessageCircle,
  Quote,
  ShieldCheck,
  Archive,
  BadgeCheck,
  Info,
  ArrowLeft,
  ArrowRight,
  Move,
} from "lucide-react";
import { api, waLink } from "../../lib/api";
import { trackInteraction } from "../../lib/socialProof";

const categories = [
  { id: "all", label: "Tüm Vakalar" },
  { id: "implant", label: "İmplant" },
  { id: "ortodonti", label: "Ortodonti" },
  { id: "gulus_tasarimi", label: "Gülüş Tasarımı" },
  { id: "beyazlatma", label: "Beyazlatma" },
];

const catLabels = {
  implant: "İmplant",
  ortodonti: "Ortodonti",
  gulus_tasarimi: "Gülüş Tasarımı",
  beyazlatma: "Beyazlatma",
};

// Compare slider with drag + zoom-on-hover on desktop
function CompareSlider({ before, after, title, zoomOnHover = true }) {
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50);
  const [zoom, setZoom] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, x)));
  }, []);

  const onPointerDown = (e) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e) => {
    if (dragging.current) {
      e.preventDefault();
      updateFromClientX(e.clientX);
    }
    if (zoomOnHover && !dragging.current && e.pointerType === "mouse") {
      const rect = e.currentTarget.getBoundingClientRect();
      setZoomOrigin({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      data-testid="case-compare-slider"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={() => zoomOnHover && setZoom(true)}
      onMouseLeave={() => {
        setZoom(false);
        dragging.current = false;
      }}
      className="relative rounded-3xl overflow-hidden bg-slate-100 select-none cursor-ew-resize touch-none aspect-[4/5] sm:aspect-[4/3]"
      style={{ touchAction: "none" }}
    >
      {/* After (base) */}
      <img
        src={after}
        alt={`${title} sonrası`}
        loading="lazy"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out"
        style={{
          transform: zoom ? "scale(1.18)" : "scale(1)",
          transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
        }}
      />
      {/* Before (top with clip-path) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={before}
          alt={`${title} öncesi`}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out"
          style={{
            transform: zoom ? "scale(1.18)" : "scale(1)",
            transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
          }}
        />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-[3px] bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.7)] pointer-events-none"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      />
      {/* Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-[3px] border-cyan-500 shadow-2xl flex items-center justify-center pointer-events-none"
        style={{ left: `${pos}%`, transform: "translate(-50%, -50%)" }}
      >
        <Move className="w-4 h-4 text-cyan-700 rotate-45" />
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest">
        Öncesi
      </div>
      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-cyan-600 text-white text-[10px] font-bold uppercase tracking-widest">
        Sonrası
      </div>

      {/* Mobile hint */}
      <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/95 backdrop-blur text-slate-700 text-[10px] font-semibold shadow-md">
        ← Kaydırarak karşılaştır →
      </div>
    </div>
  );
}

function TrustBadge({ icon: Icon, label, color = "cyan" }) {
  const colors = {
    cyan: "bg-cyan-50 text-cyan-800 border-cyan-200",
    green: "bg-green-50 text-green-800 border-green-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function CaseCard({ item, onAppointmentClick }) {
  const waMsg = `Merhaba, "${item.title}" vakasını gördüm. Bende benzer bir durum var, bilgi almak istiyorum.`;

  const handleWa = () => trackInteraction(item.category, "wa_click");
  const handleApt = () => {
    trackInteraction(item.category, "appointment_open");
    onAppointmentClick(item.category);
  };

  return (
    <motion.article
      data-testid={`case-card-${item.id}`}
      layout
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-[28px] overflow-hidden border border-slate-100 soft-shadow hover-shadow group"
    >
      <CompareSlider
        before={item.before_url}
        after={item.after_url}
        title={item.title}
      />

      <div className="p-5 md:p-6">
        {/* Trust badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <TrustBadge icon={Archive} label="Klinik Arşivinden" color="cyan" />
          <TrustBadge icon={BadgeCheck} label="Doktor Onaylı" color="green" />
          {item.is_representative && (
            <TrustBadge icon={Info} label="Temsili Klinik Vaka" color="amber" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 font-display leading-tight">
          {item.title}
        </h3>

        {/* Category pill */}
        <div className="mt-1.5 text-xs font-bold text-cyan-700 uppercase tracking-widest">
          {catLabels[item.category]}
        </div>

        {/* Patient + Problem */}
        <div className="mt-4 space-y-2.5 text-sm">
          {(item.patient_name || item.patient_age) && (
            <div className="flex items-start gap-2" data-testid="case-patient">
              <User className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <div className="text-slate-700">
                <b>{item.patient_name || "Hasta"}</b>
                {item.patient_age ? `, ${item.patient_age} yaş` : ""}
              </div>
            </div>
          )}
          {item.problem && (
            <div className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <div className="text-slate-700">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mr-1">
                  Sorun:
                </span>
                {item.problem}
              </div>
            </div>
          )}
          {item.result_summary && (
            <div className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <div className="text-slate-700">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mr-1">
                  Sonuç:
                </span>
                {item.result_summary}
              </div>
            </div>
          )}
        </div>

        {/* Meta grid */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {item.treatment_duration && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Clock className="w-4 h-4 text-cyan-700" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Süre
                </div>
                <div className="text-xs font-bold text-slate-900">{item.treatment_duration}</div>
              </div>
            </div>
          )}
          {item.sessions && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Calendar className="w-4 h-4 text-cyan-700" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Seans
                </div>
                <div className="text-xs font-bold text-slate-900">{item.sessions}</div>
              </div>
            </div>
          )}
          {item.doctor_name && (
            <div className="col-span-2 flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Stethoscope className="w-4 h-4 text-cyan-700" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Hekim
                </div>
                <div className="text-xs font-bold text-slate-900">{item.doctor_name}</div>
              </div>
            </div>
          )}
        </div>

        {/* Patient quote */}
        {item.patient_quote && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 relative">
            <Quote className="absolute top-2 right-2 w-5 h-5 text-cyan-300" />
            <p className="text-sm text-slate-700 italic leading-relaxed">
              "{item.patient_quote}"
            </p>
            {item.patient_name && (
              <div className="mt-1.5 text-[11px] text-cyan-800 font-semibold">
                — {item.patient_name}
              </div>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <a
            data-testid={`case-wa-${item.id}`}
            href={waLink(waMsg)}
            target="_blank"
            rel="noreferrer"
            onClick={handleWa}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#1eb955] text-white rounded-full text-sm font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Benzer Sonucu İstiyorum
          </a>
          <button
            data-testid={`case-apt-${item.id}`}
            onClick={handleApt}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Randevu Al
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function BeforeAfter({ onAppointmentClick }) {
  const [cat, setCat] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/public/before-after", { params: { category: cat } })
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, [cat]);

  const handleAptClick = (slugCat) => {
    if (onAppointmentClick) onAppointmentClick(slugCat);
  };

  return (
    <section
      id="oncesi-sonrasi"
      data-testid="before-after-section"
      className="relative py-20 md:py-28 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Gerçek Vakalar — Doktor Onaylı
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-display">
            Sonuçlar{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Konuşuyor
            </span>
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Hastalarımızın izniyle paylaştığımız klinik arşivimizden vaka çalışmaları.
            Slider'ı kaydırın, kendi gözlerinizle görün.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                data-testid={`case-filter-${c.id}`}
                onClick={() => setCat(c.id)}
                className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-cyan-500 hover:text-cyan-700"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="filter-active-pill"
                    className="absolute inset-0 rounded-full bg-slate-900"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-[28px] bg-slate-100 animate-pulse h-[600px]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-slate-500 py-16">
            Bu kategoride yakında yeni vaka çalışmaları eklenecek.
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {items.map((it) => (
                <CaseCard key={it.id} item={it} onAppointmentClick={handleAptClick} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Sticky-style anchor CTA at bottom */}
        <div className="mt-12 max-w-3xl mx-auto bg-gradient-to-br from-slate-900 to-cyan-950 text-white rounded-3xl p-6 md:p-8 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/30 rounded-full blur-3xl" />
          <div className="relative">
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-300 mb-2">
              Sıradaki Vaka Sizinki Olabilir
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display">
              Ben de yaptırmak istiyorum
            </h3>
            <p className="mt-2 text-white/80 max-w-lg mx-auto text-sm md:text-base">
              Ücretsiz muayene + dijital önizleme ile size özel tedavi planınızı
              oluşturalım.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
              <a
                data-testid="case-cta-whatsapp"
                href={waLink(
                  "Öncesi sonrası örneklerini gördüm, bilgi almak istiyorum."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1eb955] text-white rounded-full font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp ile Yaz
              </a>
              <button
                data-testid="case-cta-appointment"
                onClick={() => handleAptClick()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full font-semibold"
              >
                <Calendar className="w-4 h-4" />
                Ücretsiz Muayene
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
