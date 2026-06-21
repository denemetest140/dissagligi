import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../brand/Logo";

export default function Footer({ clinic }) {
  return (
    <footer
      data-testid="footer"
      className="bg-slate-950 text-white pt-16 pb-28 md:pb-12"
    >
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo size={44} theme="dark" />
            <p className="mt-4 text-white/70 text-sm leading-relaxed max-w-md">
              Batman'da modern teknoloji ve uzman hekim kadrosuyla ağız ve diş
              sağlığı hizmetleri sunan premium kliniğiniz.
            </p>
          </div>

          <div>
            <div className="font-semibold mb-3 text-cyan-300 uppercase text-xs tracking-widest">
              Hızlı Erişim
            </div>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#tedaviler" className="hover:text-white">Tedaviler</a></li>
              <li><a href="#doktorlar" className="hover:text-white">Doktorlar</a></li>
              <li><a href="#yorumlar" className="hover:text-white">Yorumlar</a></li>
              <li><a href="#sss" className="hover:text-white">SSS</a></li>
              <li><Link to="/admin/login" className="hover:text-white">Yönetici Girişi</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-3 text-cyan-300 uppercase text-xs tracking-widest">
              İletişim
            </div>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex gap-2 items-start">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                {(clinic?.address) || "Ziya Gökalp Mah., Turgut Özal Bulv. No:5, Batman"}
              </li>
              <li className="flex gap-2 items-start">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <a href="tel:+904882125556">0488 212 55 56</a>
              </li>
              <li className="flex gap-2 items-start">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                info@dentalin.com
              </li>
              <li className="flex gap-2 items-start">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div>Pzt-Cum: 09:00 - 19:00</div>
                  <div>Cumartesi: 09:00 - 17:00</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-white/50 flex flex-col md:flex-row gap-2 justify-between">
          <div>© {new Date().getFullYear()} Dentalin Ağız ve Diş Sağlığı Merkezi. Tüm hakları saklıdır.</div>
          <div>Batman implant • Batman ortodonti • Batman diş kliniği</div>
        </div>
      </div>
    </footer>
  );
}
