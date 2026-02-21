"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

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
 * - GSAP power3.out stagger entrance + 3.5s rotating headline
 * - Desktop only (hidden below lg breakpoint)
 */
export function AuthHeroPanel() {
    const panelRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLSpanElement>(null);
    const headlineIndex = useRef(0);

    useEffect(() => {
        if (
            !panelRef.current ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            if (panelRef.current) {
                panelRef.current
                    .querySelectorAll("[class*='opacity-0']")
                    .forEach((el) => {
                        (el as HTMLElement).style.opacity = "1";
                    });
            }
            return;
        }

        let rotationInterval: ReturnType<typeof setInterval> | null = null;

        const ctx = gsap.context(() => {
            const $ = (s: string) => panelRef.current!.querySelectorAll(s);
            const $1 = (s: string) => panelRef.current!.querySelector(s);

            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
                delay: 0.3,
            });

            const kicker = $1(".hero-kicker");
            if (kicker) {
                tl.fromTo(
                    kicker,
                    { opacity: 0, x: -16 },
                    { opacity: 1, x: 0, duration: 0.5 },
                );
            }

            const words = $(".hero-word");
            if (words.length) {
                tl.fromTo(
                    words,
                    { opacity: 0, y: 24 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 },
                    "-=0.25",
                );
            }

            const subtitle = $1(".hero-subtitle");
            if (subtitle) {
                tl.fromTo(
                    subtitle,
                    { opacity: 0, y: 14 },
                    { opacity: 1, y: 0, duration: 0.45 },
                    "-=0.2",
                );
            }

            if (headlineRef.current) {
                const rotateHeadline = () => {
                    headlineIndex.current =
                        (headlineIndex.current + 1) % HEADLINES.length;

                    const rl = gsap.timeline();
                    rl.to(headlineRef.current, {
                        opacity: 0,
                        y: -12,
                        duration: 0.3,
                        ease: "power2.in",
                    });
                    rl.call(() => {
                        if (headlineRef.current) {
                            headlineRef.current.textContent =
                                HEADLINES[headlineIndex.current];
                        }
                    });
                    rl.to(headlineRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        ease: "power3.out",
                    });
                };

                rotationInterval = setInterval(rotateHeadline, 3500);
            }
        }, panelRef);

        return () => {
            if (rotationInterval) clearInterval(rotationInterval);
            ctx.revert();
        };
    }, []);

    return (
        <div
            ref={panelRef}
            className="hidden lg:flex lg:w-2/5 bg-neutral text-neutral-content flex-col items-start justify-center px-12 xl:px-16 relative"
        >
            {/* Kicker */}
            <p className="hero-kicker opacity-0 text-md font-semibold uppercase tracking-[0.25em] text-secondary mb-5">
                Applicant Network
            </p>

            {/* Main headline with rotating phrase */}
            <h2 className="text-3xl xl:text-4xl font-black leading-[1.05] tracking-tight mb-5">
                <span className="hero-word inline-block opacity-0">
                    Your career,
                </span>
                <br />
                <span
                    ref={headlineRef}
                    className="hero-word inline-block opacity-0 text-primary"
                >
                    {HEADLINES[0]}
                </span>
            </h2>

            {/* Subtitle */}
            <p className="hero-subtitle opacity-0 text-md text-neutral-content/50 leading-relaxed max-w-sm">
                Multiple recruiters work on your behalf, each bringing their own
                network and expertise. You see where your profile stands, who&apos;s
                representing you, and what&apos;s next &mdash; without the guesswork.
            </p>
        </div>
    );
}
