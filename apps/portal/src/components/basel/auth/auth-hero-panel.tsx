"use client";

import { useEffect, useRef, useState } from "react";

/* ── Rotating headline phrases ── */
const HEADLINES = [
    "split-fee recruiting.",
    "verified placements.",
    "transparent partnerships.",
    "recruiter-led hiring.",
    "scalable deal flow.",
];

/**
 * Basel Auth Hero Panel — dark editorial branding panel.
 *
 * Right side of the auth split layout. Centered headline with
 * rotating primary-colored phrase and subtitle.
 *
 * Design:
 * - Rectangular (no clip-path) — clean vertical split
 * - Content vertically centered
 * - Typography-driven: kicker -> headline -> subtitle
 * - CSS entrance animations + 3.5s rotating headline via CSS transitions
 * - Desktop only (hidden below lg breakpoint)
 */
export function AuthHeroPanel() {
    const [headlineText, setHeadlineText] = useState(HEADLINES[0]);
    const [transitioning, setTransitioning] = useState(false);
    const headlineIndex = useRef(0);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;

        const interval = setInterval(() => {
            setTransitioning(true);
            setTimeout(() => {
                headlineIndex.current =
                    (headlineIndex.current + 1) % HEADLINES.length;
                setHeadlineText(HEADLINES[headlineIndex.current]);
                setTransitioning(false);
            }, 300);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hidden lg:flex lg:w-2/5 bg-base-300 text-base-content flex-col items-start justify-center px-12 xl:px-16 relative">
            {/* Kicker */}
            <p className="animate-[fadeIn_0.5s_ease-out_0.3s_both] text-md font-semibold uppercase tracking-[0.25em] text-secondary mb-5">
                The Recruiting Marketplace
            </p>

            {/* Main headline with rotating phrase */}
            <h2 className="text-3xl xl:text-4xl font-black leading-[1.05] tracking-tight mb-5">
                <span className="animate-[fadeIn_0.5s_ease-out_0.4s_both] inline-block">
                    The marketplace for
                </span>
                <br />
                <span
                    className={`inline-block text-primary transition-all duration-300 ${
                        transitioning
                            ? "opacity-0 -translate-y-3"
                            : "opacity-100 translate-y-0"
                    }`}
                    style={{
                        animationDelay: "0.5s",
                        animationFillMode: "both",
                    }}
                >
                    {headlineText}
                </span>
            </h2>

            {/* Subtitle */}
            <p className="animate-[fadeIn_0.45s_ease-out_0.55s_both] text-md text-base-content/50 leading-relaxed max-w-sm">
                Connect with hiring companies, submit candidates against pre-set
                terms, and earn your split on every verified placement. One
                pipeline. Full visibility. No guesswork.
            </p>
        </div>
    );
}
