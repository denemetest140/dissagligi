import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";

export default function Faqs({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <section
      id="sss"
      data-testid="faqs-section"
      className="py-20 md:py-28 bg-slate-50"
    >
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-12">
          <div className="text-sm font-bold text-cyan-700 uppercase tracking-[0.2em]">
            Sıkça Sorulan Sorular
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-display">
            Aklınızdaki Sorular
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {items.map((f, i) => (
            <AccordionItem
              key={f.id || i}
              value={`item-${i}`}
              data-testid={`faq-item-${i}`}
              className="bg-white border border-slate-200 rounded-2xl px-5 soft-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline py-5">
                {f.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pb-5">
                {f.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
