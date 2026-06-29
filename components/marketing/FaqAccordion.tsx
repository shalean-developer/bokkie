"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
};

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white">
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <article key={faq.question}>
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-start justify-between gap-4 px-4 sm:px-5 py-4 sm:py-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900 text-sm sm:text-base pr-2">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1"
              >
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
