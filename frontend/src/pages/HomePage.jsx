import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/sections/Navbar";
import Hero from "../components/sections/Hero";
import TrustStats from "../components/sections/TrustStats";
import FeaturedTreatments from "../components/sections/FeaturedTreatments";
import BeforeAfter from "../components/sections/BeforeAfter";
import Doctors from "../components/sections/Doctors";
import Testimonials from "../components/sections/Testimonials";
import WhyDentalin from "../components/sections/WhyDentalin";
import Emergency from "../components/sections/Emergency";
import Faqs from "../components/sections/Faqs";
import ContactMap from "../components/sections/ContactMap";
import FinalCTA from "../components/sections/FinalCTA";
import MobileBottomNav from "../components/sections/MobileBottomNav";
import FloatingButtons from "../components/sections/FloatingButtons";
import Footer from "../components/sections/Footer";
import AppointmentDialog from "../components/sections/AppointmentDialog";
import QuizDialog from "../components/sections/QuizDialog";
import Seo from "../components/sections/Seo";
import { api } from "../lib/api";

export default function HomePage() {
  const [treatments, setTreatments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [clinic, setClinic] = useState(null);

  const [aptOpen, setAptOpen] = useState(false);
  const [presetTreatment, setPresetTreatment] = useState(null);
  const [quizOpen, setQuizOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/public/treatments"),
      api.get("/public/doctors"),
      api.get("/public/testimonials"),
      api.get("/public/faqs"),
      api.get("/public/clinic-info"),
    ])
      .then(([t, d, te, f, c]) => {
        setTreatments(t.data);
        setDoctors(d.data);
        setTestimonials(te.data);
        setFaqs(f.data);
        setClinic(c.data);
      })
      .catch(() => {});
  }, []);

  const openAppointment = useCallback(
    (treatment, doctor) => {
      setPresetTreatment(treatment || null);
      setAptOpen(true);
    },
    []
  );

  const openWithSlug = useCallback(
    (slug) => {
      const t = treatments.find((x) => x.slug === slug);
      setPresetTreatment(t || null);
      setAptOpen(true);
    },
    [treatments]
  );

  return (
    <div id="top" className="bg-white">
      <Seo />
      <Navbar onAppointmentClick={() => openAppointment()} />
      <Hero onAppointmentClick={() => openAppointment()} />
      <TrustStats />
      <FeaturedTreatments treatments={treatments} onAppointmentClick={openAppointment} />
      <BeforeAfter />
      <Doctors doctors={doctors} onAppointmentClick={openAppointment} />
      <Testimonials items={testimonials} />
      <WhyDentalin />
      <Emergency onQuizClick={() => setQuizOpen(true)} />
      <Faqs items={faqs} />
      <ContactMap clinic={clinic} />
      <FinalCTA onAppointmentClick={() => openAppointment()} />
      <Footer clinic={clinic} />

      <MobileBottomNav onAppointmentClick={() => openAppointment()} />
      <FloatingButtons />

      <AppointmentDialog
        open={aptOpen}
        onOpenChange={setAptOpen}
        treatments={treatments}
        presetTreatment={presetTreatment}
      />
      <QuizDialog
        open={quizOpen}
        onOpenChange={setQuizOpen}
        onResultRequestAppointment={openWithSlug}
      />
    </div>
  );
}
