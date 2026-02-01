"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const faqs = [
    {
        question: "Is it really free for candidates?",
        answer: "Absolutely. You'll never pay a dime. Companies pay recruiters when they make a hire—that's how the platform works. Your job search is 100% free.",
    },
    {
        question: "How is this different from LinkedIn or Indeed?",
        answer: "Instead of blasting applications into the void, you get matched with real recruiters who specialize in your field. They advocate for you, prep you for interviews, and keep you updated. It's like having an agent for your career.",
    },
    {
        question: "Will I actually hear back from companies?",
        answer: "That's the whole point. Recruiters on our platform are measured by responsiveness. You'll get status updates within 48 hours, and you'll never be left wondering where your application stands.",
    },
    {
        question: "How do recruiters find me?",
        answer: "You create a profile highlighting your skills, experience, and what you're looking for. Recruiters search our network for candidates who match their roles, and they'll reach out directly when there's a fit.",
    },
    {
        question: "Can I control who sees my profile?",
        answer: "Yes. You decide your visibility settings and approve any company before they see your full details. Your current employer won't stumble across your profile unless you want them to.",
    },
    {
        question: "What if I'm not actively looking but open to opportunities?",
        answer: "Perfect use case. Set your status to 'passively looking' and recruiters will only reach out for roles that are genuinely compelling. No spam, just relevant opportunities.",
    },
];

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
            className="py-24 bg-base-100 overflow-hidden"
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
                        Everything you need to know about getting started
                    </p>
                </div>

                <div
                    ref={faqsRef}
                    className="max-w-3xl mx-auto space-y-4"
                >
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="faq-item bg-base-200 rounded-xl overflow-hidden opacity-0"
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
