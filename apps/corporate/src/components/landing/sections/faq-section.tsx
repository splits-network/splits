"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";
import { corporateFaqs } from "./faq-data";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const faqs = corporateFaqs;

export function FAQSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const faqsRef = useRef<HTMLDivElement>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

    useGSAP(
        () => {
            if (!sectionRef.current) return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            // Heading animation
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
                        start: "top 75%",
                    },
                },
            );

            // FAQ items stagger in
            const items = faqsRef.current?.querySelectorAll(".faq-item");
            if (items) {
                gsap.fromTo(
                    items,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                        scrollTrigger: {
                            trigger: faqsRef.current,
                            start: "top 80%",
                        },
                    },
                );
            }
        },
        { scope: sectionRef },
    );

    const toggleFAQ = (index: number) => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        // Close currently open item
        if (openIndex !== null && openIndex !== index) {
            const currentContent = contentRefs.current[openIndex];
            if (currentContent) {
                if (prefersReducedMotion) {
                    currentContent.style.height = "0px";
                    currentContent.style.opacity = "0";
                } else {
                    gsap.to(currentContent, {
                        height: 0,
                        opacity: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                    });
                }
            }
        }

        // Toggle clicked item
        const content = contentRefs.current[index];
        if (content) {
            if (openIndex === index) {
                // Close
                if (prefersReducedMotion) {
                    content.style.height = "0px";
                    content.style.opacity = "0";
                } else {
                    gsap.to(content, {
                        height: 0,
                        opacity: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                    });
                }
                setOpenIndex(null);
            } else {
                // Open
                if (prefersReducedMotion) {
                    content.style.height = "auto";
                    content.style.opacity = "1";
                } else {
                    gsap.set(content, { height: "auto", opacity: 1 });
                    const autoHeight = content.offsetHeight;
                    gsap.fromTo(
                        content,
                        { height: 0, opacity: 0 },
                        {
                            height: autoHeight,
                            opacity: 1,
                            duration: duration.fast,
                            ease: easing.smooth,
                        },
                    );
                }
                setOpenIndex(index);
            }
        }
    };

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-base-200 overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div
                    ref={headingRef}
                    className="text-center mb-16 opacity-0 max-w-3xl mx-auto"
                >
                    <p className="text-sm uppercase tracking-wider text-primary mb-3">
                        Common Questions
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-base-content/70">
                        Everything you need to know about our platforms
                    </p>
                </div>

                <div
                    ref={faqsRef}
                    className="max-w-3xl mx-auto space-y-4"
                >
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="faq-item bg-base-100 rounded-xl overflow-hidden shadow-sm opacity-0"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-base-200 transition-colors"
                            >
                                <span className="font-semibold text-lg pr-4">
                                    {faq.question}
                                </span>
                                <i
                                    className={`fa-duotone fa-regular fa-plus text-lg text-primary transition-transform duration-300 flex-shrink-0 ${openIndex === index ? "rotate-45" : ""}`}
                                ></i>
                            </button>
                            <div
                                ref={(el) => {
                                    contentRefs.current[index] = el;
                                }}
                                className="overflow-hidden"
                                style={{ height: 0, opacity: 0 }}
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
