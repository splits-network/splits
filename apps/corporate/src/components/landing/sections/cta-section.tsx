"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);

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

            // Cards pop in with stagger
            const cards = cardsRef.current?.querySelectorAll(".cta-card");
            if (cards) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, scale: 0.9, y: 20 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.bounce,
                        stagger: stagger.loose,
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
                footerRef.current,
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
        <section
            ref={sectionRef}
            id="contact"
            className="py-24 bg-gradient-to-br from-primary to-secondary text-white overflow-hidden relative"
        >
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div
                    ref={contentRef}
                    className="text-center mb-12 opacity-0 max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Ready to transform how you recruit?
                    </h2>
                    <p className="text-xl opacity-90">
                        Join the ecosystem that&apos;s making recruiting work
                        for everyone
                    </p>
                </div>

                <div
                    ref={cardsRef}
                    className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12"
                >
                    {/* Recruiters Card */}
                    <div className="cta-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 opacity-0">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-user-tie text-xl"></i>
                            </div>
                            <div>
                                <div className="font-bold">Recruiters</div>
                                <div className="text-xs opacity-70">
                                    Splits Network
                                </div>
                            </div>
                        </div>
                        <p className="text-sm opacity-80 mb-6">
                            Join a collaborative marketplace with curated roles
                            and transparent splits.
                        </p>
                        <a
                            href="https://splits.network/sign-up"
                            className="btn btn-sm bg-white text-primary hover:bg-white/90 border-0 w-full"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            Join Network
                            <i className="fa-duotone fa-regular fa-arrow-right"></i>
                        </a>
                    </div>

                    {/* Companies Card */}
                    <div className="cta-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 opacity-0">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-building text-xl"></i>
                            </div>
                            <div>
                                <div className="font-bold">Companies</div>
                                <div className="text-xs opacity-70">
                                    Splits Network
                                </div>
                            </div>
                        </div>
                        <p className="text-sm opacity-80 mb-6">
                            Access a network of recruiters with full pipeline
                            visibility and pay-on-hire.
                        </p>
                        <a
                            href="https://splits.network/sign-up"
                            className="btn btn-sm bg-white text-primary hover:bg-white/90 border-0 w-full"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            Post a Role
                            <i className="fa-duotone fa-regular fa-arrow-right"></i>
                        </a>
                    </div>

                    {/* Candidates Card */}
                    <div className="cta-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 opacity-0">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-user text-xl"></i>
                            </div>
                            <div>
                                <div className="font-bold">Candidates</div>
                                <div className="text-xs opacity-70">
                                    Applicant Network
                                </div>
                            </div>
                        </div>
                        <p className="text-sm opacity-80 mb-6">
                            Get matched with expert recruiters and never get
                            ghosted again. Free forever.
                        </p>
                        <a
                            href="https://applicant.network/sign-up"
                            className="btn btn-sm bg-white text-secondary hover:bg-white/90 border-0 w-full"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            Create Profile
                            <i className="fa-duotone fa-regular fa-arrow-right"></i>
                        </a>
                    </div>
                </div>

                <div
                    ref={footerRef}
                    className="text-center opacity-0"
                >
                    <p className="text-sm opacity-70 mb-4">
                        Questions? Reach out to us directly.
                    </p>
                    <a
                        href="mailto:hello@employment-networks.com"
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-envelope"></i>
                        hello@employment-networks.com
                    </a>
                </div>
            </div>
        </section>
    );
}
