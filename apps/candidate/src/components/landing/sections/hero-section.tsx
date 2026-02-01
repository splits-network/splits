"use client";

import { useRef } from "react";
import Link from "next/link";
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
    const trustRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useGSAP(
        () => {
            if (!sectionRef.current) return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const tl = gsap.timeline({ defaults: { ease: easing.smooth } });

            // Headline staggered word reveal
            tl.fromTo(
                headlineRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: duration.hero },
            );

            // Subtext fade up
            tl.fromTo(
                subtextRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: duration.normal },
                "-=0.6",
            );

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
                    "-=0.4",
                );
            }

            // Trust indicators fade in
            const trustItems = trustRef.current?.querySelectorAll("div");
            if (trustItems) {
                tl.fromTo(
                    trustItems,
                    { opacity: 0, y: 10 },
                    {
                        opacity: 0.7,
                        y: 0,
                        duration: duration.fast,
                        stagger: stagger.tight,
                    },
                    "-=0.3",
                );
            }

            // Video parallax fade on scroll
            if (videoRef.current) {
                gsap.to(videoRef.current, {
                    opacity: 0,
                    y: 100,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top top",
                        end: "bottom top",
                        scrub: 1,
                    },
                });
            }
        },
        { scope: sectionRef },
    );

    return (
        <section
            ref={sectionRef}
            className="hero min-h-[85vh] relative overflow-hidden"
        >
            {/* Video Background */}
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-15"
            >
                <source src="/candidate-hero.mp4" type="video/mp4" />
            </video>

            {/* Content */}
            <div className="hero-content text-center max-w-6xl relative z-10 py-20">
                <div className="space-y-8">
                    <h1
                        ref={headlineRef}
                        className="text-5xl md:text-7xl font-bold leading-tight opacity-0"
                    >
                        Find Your Dream Job,
                        <br />
                        <span className="text-secondary">
                            Powered by Expert Recruiters
                        </span>
                    </h1>
                    <p
                        ref={subtextRef}
                        className="text-xl md:text-2xl text-base-content/80 max-w-3xl mx-auto leading-relaxed opacity-0"
                    >
                        Browse thousands of opportunities from top companies.
                        Get matched with specialized recruiters who advocate for
                        you throughout the hiring process.
                    </p>
                    <div
                        ref={ctaRef}
                        className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
                    >
                        <Link
                            href="/public/jobs"
                            className="btn btn-primary btn-lg gap-2 shadow hover:shadow-lg transition-all"
                        >
                            <i className="fa-duotone fa-regular fa-magnifying-glass"></i>
                            Explore Jobs
                        </Link>
                        <Link
                            href="/sign-up"
                            className="btn btn-outline btn-lg gap-2"
                        >
                            <i className="fa-duotone fa-regular fa-user-plus"></i>
                            Create Your Profile
                        </Link>
                    </div>
                    <div
                        ref={trustRef}
                        className="flex items-center justify-center gap-8 pt-8 text-sm"
                    >
                        <div className="flex items-center gap-2 opacity-0">
                            <i className="fa-duotone fa-regular fa-check-circle text-success"></i>
                            <span>Free to use</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0">
                            <i className="fa-duotone fa-regular fa-check-circle text-success"></i>
                            <span>Expert guidance</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0">
                            <i className="fa-duotone fa-regular fa-check-circle text-success"></i>
                            <span>Top companies</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
