"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export function HeroSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subtextRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const platformsRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!sectionRef.current) return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const tl = gsap.timeline({ defaults: { ease: easing.smooth } });

            // Headline reveal
            tl.fromTo(
                headlineRef.current,
                { opacity: 0, y: 60 },
                { opacity: 1, y: 0, duration: duration.hero },
            );

            // Subtext fade up
            tl.fromTo(
                subtextRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: duration.normal },
                "-=0.6",
            );

            // Platform badges stagger in
            const platforms = platformsRef.current?.querySelectorAll(".platform-badge");
            if (platforms) {
                tl.fromTo(
                    platforms,
                    { opacity: 0, scale: 0.8, y: 20 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: duration.normal,
                        stagger: stagger.normal,
                        ease: easing.bounce,
                    },
                    "-=0.4",
                );
            }

            // CTA buttons pop in
            const buttons = ctaRef.current?.querySelectorAll("a");
            if (buttons) {
                tl.fromTo(
                    buttons,
                    { opacity: 0, y: 20, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.normal,
                        stagger: stagger.normal,
                        ease: easing.bounce,
                    },
                    "-=0.3",
                );
            }
        },
        { scope: sectionRef },
    );

    const handleSmoothScroll = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    return (
        <section
            ref={sectionRef}
            className="min-h-[90vh] relative overflow-hidden flex items-center"
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5"></div>

            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10 py-20">
                <div className="max-w-5xl mx-auto text-center">
                    <h1
                        ref={headlineRef}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 opacity-0"
                    >
                        The Future of{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            Recruiting
                        </span>
                    </h1>

                    <p
                        ref={subtextRef}
                        className="text-xl md:text-2xl text-base-content/70 mb-10 max-w-3xl mx-auto leading-relaxed opacity-0"
                    >
                        Employment Networks powers modern recruiting through two
                        innovative platforms—connecting recruiters, companies,
                        and candidates in one seamless ecosystem.
                    </p>

                    <div
                        ref={platformsRef}
                        className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
                    >
                        <div className="platform-badge flex items-center gap-3 bg-base-200 rounded-2xl px-6 py-4 opacity-0">
                            <img
                                src="/splits.png"
                                alt="Splits Network"
                                className="h-8"
                            />
                            <div className="text-left">
                                <div className="font-semibold">Splits Network</div>
                                <div className="text-sm text-base-content/60">
                                    For Recruiters & Companies
                                </div>
                            </div>
                        </div>
                        <div className="platform-badge flex items-center gap-3 bg-base-200 rounded-2xl px-6 py-4 opacity-0">
                            <img
                                src="/applicant.png"
                                alt="Applicant Network"
                                className="h-8"
                            />
                            <div className="text-left">
                                <div className="font-semibold">Applicant Network</div>
                                <div className="text-sm text-base-content/60">
                                    For Job Seekers
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        ref={ctaRef}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <a
                            href="#for-recruiters"
                            onClick={(e) => handleSmoothScroll(e, "#for-recruiters")}
                            className="btn btn-primary btn-lg gap-2 shadow-lg opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-user-tie"></i>
                            I&apos;m a Recruiter
                        </a>
                        <a
                            href="#for-candidates"
                            onClick={(e) => handleSmoothScroll(e, "#for-candidates")}
                            className="btn btn-secondary btn-lg gap-2 shadow-lg opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-user"></i>
                            I&apos;m Looking for a Job
                        </a>
                        <a
                            href="#for-companies"
                            onClick={(e) => handleSmoothScroll(e, "#for-companies")}
                            className="btn btn-outline btn-lg gap-2 opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-building"></i>
                            I&apos;m Hiring
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
