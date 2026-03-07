"use client";

import { useRef, useState, useEffect } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";
import { portalFaqs } from "./faq-data";

const faqs = portalFaqs;

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setHeight(isOpen ? contentRef.current.scrollHeight : 0);
        }
    }, [isOpen]);

    return (
        <div className="scroll-reveal fade-up card bg-base-100 shadow overflow-hidden">
            <button
                onClick={onClick}
                className="w-full text-left p-6 flex items-center justify-between gap-4 hover:bg-base-200/50 transition-colors"
            >
                <span className="text-lg font-medium">{question}</span>
                <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                    }`}
                >
                    <i className="fa-duotone fa-regular fa-plus text-primary text-sm"></i>
                </span>
            </button>
            <div
                className="overflow-hidden transition-[height] duration-300 ease-out"
                style={{ height }}
            >
                <div
                    ref={contentRef}
                    className={`px-6 pb-6 transition-all duration-300 ease-out ${
                        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                >
                    <p className="text-base-content/70 leading-relaxed">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function FAQSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useScrollReveal(sectionRef);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section ref={sectionRef} className="py-24 bg-base-200">
            <div className="container mx-auto px-4">
                {/* Heading */}
                <div className="scroll-reveal fade-up text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Questions? We've got answers.
                    </h2>
                    <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                        Everything you need to know about Splits Network
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="max-w-3xl mx-auto space-y-4 stagger-children">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
