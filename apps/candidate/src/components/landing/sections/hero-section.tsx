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
            className="hero min-h-[85vh] relative overflow-hidden"
        >
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-15"
            >
                <source src="/candidate-hero.mp4" type="video/mp4" />
            </video>

            {/* Content */}
            <div className="hero-content text-center max-w-6xl relative  py-20">
                <div className="space-y-8">
                    <h1 className="scroll-reveal fade-up text-5xl md:text-7xl font-bold leading-tight">
                        Find Your Dream Job,
                        <br />
                        <span className="text-secondary">
                            Powered by Expert Recruiters
                        </span>
                    </h1>
                    <p className="scroll-reveal fade-up text-xl md:text-2xl text-base-content/80 max-w-3xl mx-auto leading-relaxed">
                        Browse thousands of opportunities from top companies.
                        Get matched with specialized recruiters who advocate for
                        you throughout the hiring process.
                    </p>
                    <div className="scroll-reveal fade-up stagger-children flex flex-col sm:flex-row gap-4 justify-center pt-6">
                        <Link
                            href="/jobs"
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
                    <div className="scroll-reveal fade-in stagger-children flex items-center justify-center gap-8 pt-8 text-sm">
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-check-circle text-success"></i>
                            <span>Free to use</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-check-circle text-success"></i>
                            <span>Expert guidance</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-check-circle text-success"></i>
                            <span>Top companies</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
