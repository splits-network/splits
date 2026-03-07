"use client";

import { useRef, useState } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";
import { candidateFaqs } from "./faq-data";

const faqs = candidateFaqs;

export function FAQSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useScrollReveal(sectionRef);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-base-100 overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div className="scroll-reveal fade-up text-center mb-16 max-w-3xl mx-auto">
                    <p className="text-sm uppercase tracking-wider text-primary mb-3">
                        Common Questions
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-base-content/70">
                        Everything you need to know about getting started
                    </p>
                </div>

                <div className="stagger-children max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="scroll-reveal fade-up bg-base-200 rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-base-300 transition-colors"
                            >
                                <span className="font-semibold text-lg pr-4">
                                    {faq.question}
                                </span>
                                <i
                                    className={`fa-duotone fa-regular fa-plus text-lg text-primary transition-transform duration-300 flex-shrink-0 ${openIndex === index ? "rotate-45" : ""}`}
                                ></i>
                            </button>
                            <div
                                className="overflow-hidden transition-all duration-300 ease-in-out"
                                style={{
                                    maxHeight: openIndex === index ? "500px" : "0px",
                                    opacity: openIndex === index ? 1 : 0,
                                }}
                            >
                                <div className="px-6 pb-6 text-base-content/70 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
