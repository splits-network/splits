"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";
import { portalFaqs } from "./faq-data";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const faqs = portalFaqs;

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
    index: number;
}

function FAQItem({ question, answer, isOpen, onClick, index }: FAQItemProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const answerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!contentRef.current || !answerRef.current) return;

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        if (isOpen) {
            // Measure the content height
            const height = answerRef.current.scrollHeight;

            gsap.to(contentRef.current, {
                height: height,
                duration: prefersReducedMotion ? 0 : 0.3,
                ease: "power2.out",
            });

            gsap.to(answerRef.current, {
                opacity: 1,
                y: 0,
                duration: prefersReducedMotion ? 0 : 0.3,
                ease: "power2.out",
                delay: 0.1,
            });
        } else {
            gsap.to(contentRef.current, {
                height: 0,
                duration: prefersReducedMotion ? 0 : 0.25,
                ease: "power2.in",
            });

            gsap.to(answerRef.current, {
                opacity: 0,
                y: -10,
                duration: prefersReducedMotion ? 0 : 0.15,
                ease: "power2.in",
            });
        }
    }, [isOpen]);

    return (
        <div className="faq-item card bg-base-100 shadow opacity-0 overflow-hidden">
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
                ref={contentRef}
                className="overflow-hidden"
                style={{ height: 0 }}
            >
                <div
                    ref={answerRef}
                    className="px-6 pb-6 opacity-0 -translate-y-2"
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
    const headingRef = useRef<HTMLDivElement>(null);
    const faqContainerRef = useRef<HTMLDivElement>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useGSAP(
        () => {
            if (!sectionRef.current) return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade in
            gsap.fromTo(
                headingRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.normal,
                    ease: easing.smooth,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                    },
                },
            );

            // FAQ items stagger in
            const faqItems =
                faqContainerRef.current?.querySelectorAll(".faq-item");
            if (faqItems) {
                gsap.fromTo(
                    faqItems,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                        scrollTrigger: {
                            trigger: faqContainerRef.current,
                            start: "top 75%",
                        },
                    },
                );
            }
        },
        { scope: sectionRef },
    );

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section ref={sectionRef} className="py-24 bg-base-200">
            <div className="container mx-auto px-4">
                {/* Heading */}
                <div ref={headingRef} className="text-center mb-12 opacity-0">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Questions? We've got answers.
                    </h2>
                    <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                        Everything you need to know about Splits Network
                    </p>
                </div>

                {/* FAQ Items */}
                <div
                    ref={faqContainerRef}
                    className="max-w-3xl mx-auto space-y-4"
                >
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
