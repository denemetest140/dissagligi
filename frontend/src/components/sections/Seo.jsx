import React, { useEffect } from "react";

export default function Seo() {
  useEffect(() => {
    document.title = "Dentalin Batman | Diş Hekimi, İmplant, Ortodonti, Gülüş Tasarımı";
    const ensureMeta = (name, content, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    ensureMeta(
      "description",
      "Batman'ın premium ağız ve diş sağlığı merkezi. İmplant, ortodonti, gülüş tasarımı, beyazlatma. Uzman hekimler, modern teknoloji, hızlı randevu."
    );
    ensureMeta(
      "keywords",
      "Batman implant, Batman ortodonti, Batman diş kliniği, Batman diş hekimi, Batman gülüş tasarımı, Dentalin"
    );
    ensureMeta("theme-color", "#0891B2");
    ensureMeta("og:title", "Dentalin Batman | Modern Diş Tedavileri", "property");
    ensureMeta("og:type", "website", "property");
    ensureMeta(
      "og:description",
      "Batman'ın premium diş sağlığı merkezinde modern tedaviler. Hemen randevu alın.",
      "property"
    );

    const id = "schema-medical-clinic";
    let s = document.getElementById(id);
    if (!s) {
      s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = id;
      document.head.appendChild(s);
    }
    s.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Dentist",
      name: "Dentalin Ağız ve Diş Sağlığı Merkezi",
      image:
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?crop=entropy&cs=srgb&fm=jpg",
      url: window.location.origin,
      telephone: "+904882125556",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Ziya Gökalp Mahallesi, Turgut Özal Bulvarı No:5",
        addressLocality: "Batman",
        addressCountry: "TR",
      },
      openingHours: ["Mo-Fr 09:00-19:00", "Sa 09:00-17:00"],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "500",
      },
      medicalSpecialty: [
        "Implantology",
        "Orthodontics",
        "Cosmetic Dentistry",
        "Endodontics",
      ],
    });
  }, []);
  return null;
}
