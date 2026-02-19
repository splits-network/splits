"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing } from "../shared/animation-utils";
import { AuthenticatedCTAWrapper } from "@/components/authenticated-cta-wrapper";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const footerTextRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!sectionRef.current) return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            // Content slide up
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.hero,
                    ease: easing.smooth,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                    },
                },
            );

            // Buttons pop in with stagger
            const buttons = buttonsRef.current?.querySelectorAll(".cta-btn");
            if (buttons) {
                gsap.fromTo(
                    buttons,
                    { opacity: 0, scale: 0.9, y: 20 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.bounce,
                        stagger: 0.15,
                        delay: 0.3,
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top 80%",
                        },
                    },
                );
            }

            // Footer text fade in
            gsap.fromTo(
                footerTextRef.current,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: duration.normal,
                    ease: easing.smooth,
                    delay: 0.6,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                    },
                },
            );
        },
        { scope: sectionRef },
    );

    // Button hover animations
    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        gsap.to(e.currentTarget, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out",
        });
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
        gsap.to(e.currentTarget, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
        });
    };

    return (
        <AuthenticatedCTAWrapper>
            <section
                ref={sectionRef}
                className="py-24 bg-primary text-primary-content overflow-hidden relative"
            >
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div
                        ref={contentRef}
                        className="opacity-0 max-w-4xl mx-auto"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Ready to Take the{" "}
                            <span className="text-secondary">Next Step?</span>
                        </h2>
                        <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
                            Join thousands of candidates who are finding better
                            opportunities with expert recruiter support
                        </p>
                    </div>

                    <div
                        ref={buttonsRef}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
                    >
                        <Link
                            href="/sign-up"
                            className="cta-btn btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg opacity-0"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <i className="fa-duotone fa-regular fa-user-plus"></i>
                            Create Free Account
                        </Link>
                        <Link
                            href="/public/jobs"
                            className="cta-btn btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary opacity-0"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <i className="fa-duotone fa-regular fa-magnifying-glass"></i>
                            Browse Jobs First
                        </Link>
                    </div>

                    <div
                        ref={footerTextRef}
                        className="text-sm opacity-0 max-w-xl mx-auto text-primary-content/70"
                    >
                        <div className="flex items-center justify-center gap-6 flex-wrap">
                            <span className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-check text-secondary"></i>
                                No credit card required
                            </span>
                            <span className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-check text-secondary"></i>
                                Takes less than 2 minutes
                            </span>
                            <span className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-check text-secondary"></i>
                                Free forever
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </AuthenticatedCTAWrapper>
    );
}
