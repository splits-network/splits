"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useScrollReveal } from "@splits-network/basel-ui";
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
    useScrollReveal(shellRef);

    return (
        <div
            ref={shellRef}
            className="min-h-[calc(100svh-var(--header-h))] flex"
        >
            {/* ── Left Panel — Form Area ── */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-base-100">
                <div className="w-full max-w-md mx-auto">
                    {/* Logo */}
                    <div className="scroll-reveal scale-in mb-2">
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
                    <div className="scroll-reveal fade-in w-12 h-0.5 bg-primary mb-10" />

                    {/* Form content slot */}
                    <div className="scroll-reveal fade-up">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="scroll-reveal fade-in mt-12 pt-6 border-t border-base-300">
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
