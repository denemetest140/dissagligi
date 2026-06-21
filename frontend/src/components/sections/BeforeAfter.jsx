import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";

const categories = [
  { id: "all", label: "Tümü" },
  { id: "implant", label: "İmplant" },
  { id: "ortodonti", label: "Ortodonti" },
  { id: "gulus_tasarimi", label: "Gülüş Tasarımı" },
  { id: "beyazlatma", label: "Beyazlatma" },
];

function Slider({ before, after, title }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-200 aspect-[4/3] select-none soft-shadow group">
      <img
        src={after}
        alt={`${title} - sonrası`}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <img
          src={before}
          alt={`${title} - öncesi`}
          className="absolute inset-0 h-full object-cover"
          style={{ width: `${100 / (pos / 100)}%`, maxWidth: "none" }}
          loading="lazy"
        />
      </div>
      <div
        className="absolute top-0 bottom-0 w-[3px] bg-cyan-500 shadow-[0_0_30px_rgba(8,145,178,0.6)]"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-white border-4 border-cyan-500 rounded-full shadow-xl flex items-center justify-center pointer-events-none"
        style={{ left: `${pos}%`, transform: "translate(-50%, -50%)" }}
      >
        <div className="flex gap-0.5">
          <div className="w-0 h-0 border-y-4 border-y-transparent border-r-[6px] border-r-cyan-600" />
          <div className="w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-cyan-600" />
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        aria-label={`${title} öncesi sonrası slider`}
      />
      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider">
        Önce
      </div>
      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-cyan-600 text-white text-[10px] font-bold uppercase tracking-wider">
        Sonra
      </div>
    </div>
  );
}

export default function BeforeAfter() {
  const [cat, setCat] = useState("all");
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/public/before-after", { params: { category: cat } }).then((r) => setItems(r.data));
  }, [cat]);

  return (
    <section
      id="oncesi-sonrasi"
      data-testid="before-after-section"
      className="py-20 md:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50"
    >
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-10">
          <div className="text-sm font-bold text-cyan-700 uppercase tracking-[0.2em]">
            Gerçek Sonuçlar
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-display">
            Öncesi & Sonrası
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Hastalarımızın izniyle paylaştığımız gerçek tedavi sonuçları. Slider'ı
            hareket ettirerek farkı kendiniz görün.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((c) => (
            <button
              key={c.id}
              data-testid={`ba-filter-${c.id}`}
              onClick={() => setCat(c.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                cat === c.id
                  ? "bg-slate-900 text-white shadow-lg"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-cyan-600 hover:text-cyan-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="text-center text-slate-500 py-16">Bu kategori için yakında içerik eklenecek.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => (
              <div key={it.id} data-testid={`ba-card-${it.id}`}>
                <Slider before={it.before_url} after={it.after_url} title={it.title} />
                <div className="mt-4">
                  <h3 className="font-bold text-slate-900 text-lg">{it.title}</h3>
                  {it.description && (
                    <p className="text-sm text-slate-600 mt-1">{it.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
