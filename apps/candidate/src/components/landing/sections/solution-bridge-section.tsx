"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const promises = [
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "A recruiter in your corner",
        text: "Someone who knows your industry and actually advocates for you",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Real communication",
        text: "Status updates, feedback, and responses—not radio silence",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Curated opportunities",
        text: "Roles that match your skills and goals, not keyword spam",
    },
];

export function SolutionBridgeSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const promisesRef = useRef<HTMLDivElement>(null);

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

            // Promise cards stagger in
            const cards = promisesRef.current?.querySelectorAll(".promise-card");
            if (cards) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.bounce,
                        stagger: stagger.loose,
                        scrollTrigger: {
                            trigger: promisesRef.current,
                            start: "top 80%",
                        },
                    },
                );

                // Icons pop in
                const icons =
                    promisesRef.current?.querySelectorAll(".promise-icon");
                if (icons) {
                    gsap.fromTo(
                        icons,
                        { scale: 0 },
                        {
                            scale: 1,
                            duration: duration.fast,
                            ease: easing.bounce,
                            stagger: stagger.loose,
                            delay: 0.2,
                            scrollTrigger: {
                                trigger: promisesRef.current,
                                start: "top 80%",
                            },
                        },
                    );
                }
            }
        },
        { scope: sectionRef },
    );

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
                    <p className="text-sm uppercase tracking-wider text-secondary mb-3">
                        There&apos;s a Better Way
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        What if your job search had{" "}
                        <span className="text-secondary">backup?</span>
                    </h2>
                    <p className="text-lg text-base-content/70">
                        Imagine having an expert recruiter working alongside
                        you—opening doors, prepping you for interviews, and
                        making sure you never get ghosted again.
                    </p>
                </div>

                <div
                    ref={promisesRef}
                    className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
                >
                    {promises.map((promise, index) => (
                        <div
                            key={index}
                            className="promise-card text-center p-8 bg-base-200 rounded-2xl opacity-0"
                        >
                            <div className="promise-icon w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                                <i
                                    className={`${promise.icon} text-2xl text-secondary`}
                                ></i>
                            </div>
                            <h3 className="font-bold text-xl mb-3">
                                {promise.title}
                            </h3>
                            <p className="text-base-content/70">
                                {promise.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
