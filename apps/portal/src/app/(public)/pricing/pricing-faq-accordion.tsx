"use client";

import { useState } from "react";

interface PricingFaqAccordionProps {
    faqs: { question: string; answer: string }[];
}

export function PricingFaqAccordion({ faqs }: PricingFaqAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="max-w-4xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    className="faq-card border border-base-content/10 bg-base-100/5 overflow-hidden opacity-0"
                >
                    <button
                        onClick={() =>
                            setOpenIndex(openIndex === index ? null : index)
                        }
                        className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-base-content/5 transition-colors"
                    >
                        <span className="text-base font-bold pr-4 text-neutral-content">
                            {faq.question}
                        </span>
                        <i
                            className={`fa-duotone fa-regular fa-chevron-down text-sm text-primary transition-transform duration-300 flex-shrink-0 ${openIndex === index ? "rotate-180" : ""}`}
                        />
                    </button>
                    <div
                        className="overflow-hidden transition-all duration-300"
                        style={{
                            maxHeight: openIndex === index ? "500px" : "0px",
                            opacity: openIndex === index ? 1 : 0,
                        }}
                    >
                        <div className="px-5 pb-5 md:px-6 md:pb-6 text-sm leading-relaxed text-neutral-content/65">
                            {faq.answer}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
