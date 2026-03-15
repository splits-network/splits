"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScrollReveal } from "@splits-network/basel-ui";

/**
 * Basel 404 — Portal (Splits Network)
 *
 * Editorial design: split-screen hero with diagonal clip-path,
 * typography-driven hierarchy, quick-link navigation cards.
 */
export default function NotFound() {
    const mainRef = useRef<HTMLDivElement>(null);
    useScrollReveal(mainRef);

    return (
        <div ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Hero Section ──────────────────────────────────────── */}
            <section className="relative min-h-[70vh] flex items-center bg-base-300 text-base-content overflow-hidden">
                {/* Diagonal clip-path panel */}
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                    aria-hidden="true"
                />

                {/* Top accent line */}
                <div
                    className="absolute top-0 left-0 right-0 h-1 bg-primary"
                    aria-hidden="true"
                />

                <div className="relative  container mx-auto px-6 lg:px-12">
                    <div className="max-w-2xl">
                        {/* Kicker */}
                        <p className="scroll-reveal fade-up text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            Not Found
                        </p>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-6 stagger-children">
                            <span className="scroll-reveal fade-up inline-block">
                                This page doesn&apos;t exist
                            </span>{" "}
                            <span className="scroll-reveal fade-up inline-block">
                                in your{" "}
                                <span className="text-primary">pipeline</span>.
                            </span>
                        </h1>

                        {/* Body */}
                        <p className="scroll-reveal fade-up text-lg leading-relaxed text-base-content/70 max-w-xl mb-8">
                            The URL you followed doesn&apos;t match any page in
                            Splits Network. This usually means the link is
                            outdated, the resource was moved, or the address was
                            entered incorrectly. Your dashboard and active roles
                            are exactly where you left them.
                        </p>

                        {/* CTAs */}
                        <div className="scroll-reveal fade-up flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/portal/dashboard"
                                className="btn btn-primary btn-md w-full sm:w-auto gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-grid-2" />
                                Go to Dashboard
                            </Link>
                            <Link
                                href="/portal/roles"
                                className="btn btn-ghost btn-md w-full sm:w-auto gap-2 text-base-content"
                            >
                                <i className="fa-duotone fa-regular fa-briefcase" />
                                Browse Roles
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Quick Links Section ──────────────────────────────── */}
            <section className="scroll-reveal fade-up container mx-auto px-6 lg:px-12 py-12 lg:py-16">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6">
                    Pick up where you left off
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Dashboard",
                            icon: "fa-duotone fa-regular fa-grid-2",
                            href: "/portal/dashboard",
                        },
                        {
                            label: "Roles",
                            icon: "fa-duotone fa-regular fa-briefcase",
                            href: "/portal/roles",
                        },
                        {
                            label: "Candidates",
                            icon: "fa-duotone fa-regular fa-users",
                            href: "/portal/candidates",
                        },
                        {
                            label: "Invitations",
                            icon: "fa-duotone fa-regular fa-envelope-open-text",
                            href: "/portal/invitations",
                        },
                    ].map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="border-l-4 border-primary bg-base-200 p-5 hover:bg-base-300 transition-colors group"
                        >
                            <i
                                className={`${link.icon} text-xl text-primary mb-3 block`}
                            />
                            <span className="text-base font-medium text-base-content group-hover:text-primary transition-colors">
                                {link.label}
                            </span>
                        </Link>
                    ))}
                </div>

                {/* ── Footer ───────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-12 pt-6 border-t border-base-300">
                    <p className="text-sm text-base-content/60">
                        Need help? Contact us at{" "}
                        <a
                            href="mailto:support@splits.network"
                            className="text-primary underline"
                        >
                            support@splits.network
                        </a>
                    </p>
                    <p className="text-sm font-mono text-base-content/40 mt-2 sm:mt-0">
                        Error 404 — Page Not Found
                    </p>
                </div>
            </section>
        </div>
    );
}
