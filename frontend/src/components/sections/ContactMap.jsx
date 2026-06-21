import React from "react";
import { MapPin, Phone, Mail, Clock, Navigation, MessageCircle } from "lucide-react";
import { CLINIC_DEFAULT, telLink, waLink } from "../../lib/api";

export default function ContactMap({ clinic }) {
  const info = clinic || CLINIC_DEFAULT;
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
    info.maps_query || "Dentalin Batman"
  )}&output=embed`;
  const mapsDir = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    info.maps_query || info.address
  )}`;

  return (
    <section
      id="iletisim"
      data-testid="contact-section"
      className="py-20 md:py-28 bg-white"
    >
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12">
          <div className="text-sm font-bold text-cyan-700 uppercase tracking-[0.2em]">
            Bize Ulaşın
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-display">
            Adres & İletişim
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Map */}
          <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-slate-200 soft-shadow bg-slate-100 aspect-[4/3] lg:aspect-auto lg:min-h-[450px]">
            <iframe
              data-testid="contact-map"
              title="Dentalin Konum"
              src={mapsEmbed}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 450 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 md:p-8">
              <h3 className="text-xl font-bold font-display mb-5">{info.name}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3" data-testid="contact-address">
                  <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-white/90 leading-relaxed">
                    {info.address}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <a
                    href={telLink()}
                    data-testid="contact-phone-link"
                    className="text-sm text-white/90 hover:text-cyan-300 transition-colors font-semibold"
                  >
                    {info.phone_display}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <a
                    href={`mailto:${info.email}`}
                    className="text-sm text-white/90 hover:text-cyan-300 transition-colors"
                  >
                    {info.email}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-white/90 leading-relaxed">
                    <div>Pzt - Cum: {info.hours.hafta_ici}</div>
                    <div>Cumartesi: {info.hours.cumartesi}</div>
                    <div>Pazar: {info.hours.pazar}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                data-testid="contact-directions-btn"
                href={mapsDir}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-cyan-50 border border-cyan-100 hover:bg-cyan-100 transition-colors"
              >
                <Navigation className="w-5 h-5 text-cyan-700" />
                <span className="text-sm font-semibold text-cyan-900">Yol Tarifi</span>
              </a>
              <a
                data-testid="contact-whatsapp-btn"
                href={waLink("Merhaba, randevu hakkında bilgi almak istiyorum.")}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-green-700" />
                <span className="text-sm font-semibold text-green-900">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
