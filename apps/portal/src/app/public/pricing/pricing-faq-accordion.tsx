"use client";

import { useState } from "react";

interface PricingFaqAccordionProps {
    faqs: { question: string; answer: string }[];
}

export function PricingFaqAccordion({ faqs }: PricingFaqAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    className="bg-base-200 rounded-xl overflow-hidden shadow-sm"
                >
                    <button
                        onClick={() =>
                            setOpenIndex(openIndex === index ? null : index)
                        }
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-base-300 transition-colors"
                    >
                        <span className="text-xl font-medium pr-4">
                            {faq.question}
                        </span>
                        <i
                            className={`fa-duotone fa-regular fa-plus text-lg text-primary transition-transform duration-300 flex-shrink-0 ${openIndex === index ? "rotate-45" : ""}`}
                        ></i>
                    </button>
                    <div
                        className="overflow-hidden transition-all duration-300"
                        style={{
                            maxHeight: openIndex === index ? "500px" : "0px",
                            opacity: openIndex === index ? 1 : 0,
                        }}
                    >
                        <div className="px-6 pb-6 text-base-content/70">
                            {faq.answer}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
