# Dentalin — Batman Diş Sağlığı Merkezi (Patient Acquisition System)

## Original problem
Convert the Dentalin clinic site into a Turkish, mobile-app-feel, conversion-optimized patient acquisition system (not a "corporate site"). Premium hospital quality (Acıbadem/Memorial tier). Core goals: increase online appointments, WhatsApp leads, phone calls, implant + orthodontic leads.

## Stack (delivered)
- Frontend: React + Tailwind + shadcn/ui + Framer Motion + Lucide
- Backend: FastAPI + Motor (MongoDB) + bcrypt + PyJWT
- Auth: JWT (Bearer in localStorage + httpOnly cookie). Single admin role.
- Language: Turkish throughout.

## User personas
1. **Prospective patient** — wants to book quickly, see proof, contact via WhatsApp.
2. **Mobile visitor** — needs sticky bottom nav, floating WA/Call, app-feel.
3. **Clinic admin** — manages appointments, leads, content (doctors/treatments/cases/FAQs/testimonials).

## Implemented (2026-06-21)
- Hero with 3 CTAs (Randevu Al, WhatsApp, Hemen Ara) + 4 trust badges
- Animated TrustStats (5000+, 10000+, 10+, 98%)
- Featured Treatments grid (6 seeded, 4 featured)
- **Before/After "Case Study Sales Module"**: 8 cases with patient name, age, problem, duration, sessions, doctor, result, quote, trust badges (Klinik Arşivinden / Doktor Onaylı / Temsili Klinik Vaka), zoom-on-hover compare slider, animated category filter, per-case WhatsApp + appointment CTAs, bottom mega-CTA
- Doctors grid (4 seeded) with appointment CTA per card
- Marquee Testimonials (6 seeded) dark section
- WhyDentalin comparison table
- Emergency red section with pulse + Quiz launcher
- 6 FAQs accordion
- Contact + Google Maps iframe + WhatsApp + directions
- Final CTA section
- Mobile bottom nav (Ana Sayfa / Tedaviler / Doktorlar / Randevu / İletişim)
- Floating WhatsApp (expandable quick messages) + Call button
- 3-step Appointment dialog (treatment → date+time → contact)
- Rule-based Quiz dialog (6 questions → recommendation + appointment prefill)
- SEO meta + Schema.org Dentist JSON-LD
- Admin: login, dashboard stats, appointments (filter + status), leads (status), CRUD for doctors, treatments, testimonials, FAQs, before/after case studies

## Backlog (P0/P1/P2)
- P1: Email/SMS notifications on new appointment (Resend / Twilio)
- P1: Real clinic photos & before/after replacement
- P2: AI treatment recommender (LLM-powered upgrade of quiz)
- P2: Multi-language (en/ar/ku)
- P2: PWA manifest + offline shell
- P2: Calendar slot availability + admin block-time UI
- P2: Lighthouse perf budget pass (image CDN, blurhash placeholders)
