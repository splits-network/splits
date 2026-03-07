"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScrollReveal } from "@splits-network/basel-ui";

export function HeroSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <section
            ref={sectionRef}
            className="hero min-h-[90vh] relative overflow-hidden hero-entrance"
        >
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-contain opacity-25"
            >
                <source src="/ads.mp4" type="video/mp4" />
            </video>

            {/* Overlay */}
            <div className="absolute inset-0 bg-base-100/75"></div>

            {/* Content */}
            <div className="hero-content text-center max-w-5xl relative  py-20">
                <div className="space-y-8">
                    {/* Headline with emphasis on "everyone wins" */}
                    <h1 className="scroll-reveal fade-up text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight">
                        A recruiting network where
                        <br />
                        <span className="text-secondary">everyone wins</span> on
                        the placement
                    </h1>

                    {/* Subtitle */}
                    <p className="scroll-reveal fade-up hero-subtitle text-lg md:text-xl text-base-content/80 max-w-2xl mx-auto leading-relaxed">
                        Companies post roles. Recruiters bring candidates. When
                        someone gets hired, everyone gets their split.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 stagger-children">
                        <Link
                            href="/sign-up"
                            className="scroll-reveal fade-up btn btn-primary btn-lg"
                        >
                            <i className="fa-duotone fa-regular fa-user-tie"></i>
                            Join as a Recruiter
                        </Link>
                        <Link
                            href="#for-companies"
                            className="scroll-reveal fade-up btn btn-outline btn-lg"
                        >
                            <i className="fa-duotone fa-regular fa-building"></i>
                            Post Roles as a Company
                        </Link>
                    </div>

                    {/* Tagline */}
                    <div className="scroll-reveal fade-in text-sm text-base-content/60 pt-4">
                        Built by recruiters. Designed for transparent splits.
                    </div>
                </div>
            </div>
        </section>
    );
}
