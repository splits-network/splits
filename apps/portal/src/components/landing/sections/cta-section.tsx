"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing } from "../shared/animation-utils";
import { AuthenticatedCTAWrapper } from "@/components/auth/authenticated-cta-wrapper";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const footerTextRef = useRef<HTMLParagraphElement>(null);

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
                id="pricing"
                className="py-24 bg-neutral text-neutral-content overflow-hidden relative"
            >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div ref={contentRef} className="opacity-0">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Your next split placement
                            <br />
                            <span className="text-primary">
                                could close next week
                            </span>
                        </h2>
                        <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
                            Stop juggling spreadsheets and email threads. Give
                            your split placements a proper home.
                        </p>
                    </div>

                    <div
                        ref={buttonsRef}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
                    >
                        <Link
                            href="/sign-up"
                            className="cta-btn btn btn-lg btn-primary shadow-lg opacity-0"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <i className="fa-duotone fa-regular fa-user-tie"></i>
                            Join as a Recruiter
                        </Link>
                        <Link
                            href="/sign-up"
                            className="cta-btn btn btn-lg btn-secondary shadow-lg opacity-0"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <i className="fa-duotone fa-regular fa-building"></i>
                            Post Roles as a Company
                        </Link>
                    </div>

                    <p
                        ref={footerTextRef}
                        className="text-sm opacity-0 max-w-xl mx-auto text-neutral-content/60"
                    >
                        Join recruiters and companies building transparent
                        partnerships on Splits Network.
                    </p>
                </div>
            </section>
        </AuthenticatedCTAWrapper>
    );
}
