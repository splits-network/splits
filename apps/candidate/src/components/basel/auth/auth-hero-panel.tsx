"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

const HEADLINES = [
    "represented by specialists.",
    "visible at every stage.",
    "in the right hands.",
    "moving forward.",
    "worth more than one recruiter.",
];

/**
 * Candidate Auth Hero Panel — dark editorial branding panel.
 *
 * Right side of the auth split layout. Centered headline with
 * rotating primary-colored phrase and subtitle.
 *
 * Design:
 * - Rectangular (no clip-path) — clean vertical split
 * - Content vertically centered
 * - Typography-driven: kicker -> headline -> subtitle
 * - CSS scroll-reveal entrance + 3.5s rotating headline with CSS transitions
 * - Desktop only (hidden below lg breakpoint)
 */
export function AuthHeroPanel() {
    const panelRef = useRef<HTMLDivElement>(null);
    const [headlineIndex, setHeadlineIndex] = useState(0);
    const [transitioning, setTransitioning] = useState(false);

    useScrollReveal(panelRef);

    // Rotating headline with CSS transitions
    useEffect(() => {
        const interval = setInterval(() => {
            setTransitioning(true);
            setTimeout(() => {
                setHeadlineIndex((prev) => (prev + 1) % HEADLINES.length);
                setTransitioning(false);
            }, 300);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            ref={panelRef}
            className="hidden lg:flex lg:w-2/5 bg-base-300 text-base-content flex-col items-start justify-center px-12 xl:px-16 relative"
        >
            {/* Kicker */}
            <p className="scroll-reveal fade-up text-md font-semibold uppercase tracking-[0.25em] text-secondary mb-5">
                Applicant Network
            </p>

            {/* Main headline with rotating phrase */}
            <h2 className="text-3xl xl:text-4xl font-black leading-[1.05] tracking-tight mb-5">
                <span className="scroll-reveal fade-up inline-block">
                    Your career,
                </span>
                <br />
                <span
                    className="scroll-reveal fade-up inline-block text-primary transition-all duration-300 ease-in-out"
                    style={{
                        opacity: transitioning ? 0 : 1,
                        transform: transitioning
                            ? "translateY(-12px)"
                            : "translateY(0)",
                    }}
                >
                    {HEADLINES[headlineIndex]}
                </span>
            </h2>

            {/* Subtitle */}
            <p className="scroll-reveal fade-up text-md text-base-content/50 leading-relaxed max-w-sm">
                Multiple recruiters work on your behalf, each bringing their own
                network and expertise. You see where your profile stands,
                who&apos;s representing you, and what&apos;s next &mdash;
                without the guesswork.
            </p>
        </div>
    );
}
