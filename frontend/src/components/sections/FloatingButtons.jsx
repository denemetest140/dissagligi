import React, { useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";
import { telLink, waLink } from "../../lib/api";

const waMessages = [
  { label: "İmplant tedavisi", msg: "İmplant tedavisi hakkında bilgi almak istiyorum." },
  { label: "Ortodonti fiyat", msg: "Ortodonti tedavisi için fiyat öğrenmek istiyorum." },
  { label: "Randevu", msg: "Randevu oluşturmak istiyorum." },
  { label: "Genel bilgi", msg: "Klinik hakkında bilgi almak istiyorum." },
];

export default function FloatingButtons() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Call (mobile only — bottom-right above nav) */}
      <a
        data-testid="floating-call-btn"
        href={telLink()}
        className="fixed bottom-24 left-4 md:bottom-28 md:left-8 z-40 w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        aria-label="Hemen Ara"
      >
        <Phone className="w-6 h-6" />
      </a>

      {/* WhatsApp expandable */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40">
        {open && (
          <div
            data-testid="whatsapp-quick-messages"
            className="absolute bottom-16 right-0 mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden float-up"
          >
            <div className="px-4 py-3 bg-[#075E54] text-white">
              <div className="text-sm font-bold">WhatsApp Destek</div>
              <div className="text-[11px] text-white/80">Genelde dakikalar içinde yanıt veririz</div>
            </div>
            <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
              {waMessages.map((m, i) => (
                <a
                  key={i}
                  data-testid={`wa-quick-${i}`}
                  href={waLink(m.msg)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{m.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">"{m.msg}"</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        <button
          data-testid="floating-whatsapp-btn"
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.5)] hover:scale-110 transition-transform"
          aria-label="WhatsApp"
        >
          {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>
    </>
  );
}
