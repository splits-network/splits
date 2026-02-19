"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { AuthHeroPanel } from "./auth-hero-panel";

interface AuthShellProps {
    children: React.ReactNode;
}

/**
 * Basel Auth Shell — split-panel wrapper for all auth pages.
 *
 * Left:  White form area (bg-base-100) — full width on mobile, ~60% on desktop
 * Right: Dark branding panel (bg-neutral) — hidden below lg breakpoint
 *
 * Design:
 * - Sharp corners everywhere (rounded-none)
 * - DaisyUI semantic tokens only
 * - GSAP power3.out entrance animations for logo + form content
 */
export function AuthShell({ children }: AuthShellProps) {
    const shellRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (
            !shellRef.current ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
            return;

        const ctx = gsap.context(() => {
            const $1 = (s: string) => shellRef.current!.querySelector(s);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            /* Logo: scale + fade */
            const logo = $1(".auth-logo");
            if (logo) {
                tl.fromTo(
                    logo,
                    { opacity: 0, scale: 0.92 },
                    { opacity: 1, scale: 1, duration: 0.55 },
                );
            }

            /* Accent rule under logo */
            const rule = $1(".auth-logo-rule");
            if (rule) {
                tl.fromTo(
                    rule,
                    { scaleX: 0, transformOrigin: "left" },
                    { scaleX: 1, duration: 0.4 },
                    "-=0.25",
                );
            }

            /* Form content: slide up + fade */
            const form = $1(".auth-form-content");
            if (form) {
                tl.fromTo(
                    form,
                    { opacity: 0, y: 24 },
                    { opacity: 1, y: 0, duration: 0.55 },
                    "-=0.2",
                );
            }

            /* Footer line: fade in */
            const footer = $1(".auth-footer");
            if (footer) {
                tl.fromTo(
                    footer,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.4 },
                    "-=0.15",
                );
            }
        }, shellRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={shellRef}
            className="min-h-[calc(100svh-var(--header-h))] flex"
        >
            {/* ── Left Panel — Form Area ── */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-base-100">
                <div className="w-full max-w-md mx-auto">
                    {/* Logo */}
                    <div className="auth-logo opacity-0 mb-2">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/icon.png"
                                alt="Splits Network"
                                width={160}
                                height={52}
                                className="h-10 w-auto"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Accent rule */}
                    <div className="auth-logo-rule w-12 h-0.5 bg-primary mb-10 origin-left scale-x-0" />

                    {/* Form content slot */}
                    <div className="auth-form-content opacity-0">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="auth-footer opacity-0 mt-12 pt-6 border-t border-base-300">
                        <p className="text-xs text-base-content/40 leading-relaxed">
                            &copy; {new Date().getFullYear()} Splits Network.
                            All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Right Panel — Hero / Branding (desktop only) ── */}
            <AuthHeroPanel />
        </div>
    );
}
