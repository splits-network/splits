"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScrollReveal } from "@splits-network/basel-ui";

/**
 * Basel 404 — Candidate (Applicant Network)
 *
 * Editorial design: split-screen hero with diagonal clip-path,
 * empowering copy, quick-link navigation cards.
 */
export default function NotFound() {
    const mainRef = useRef<HTMLDivElement>(null);
    useScrollReveal(mainRef);

    return (
        <div ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Hero Section ──────────────────────────────────────── */}
            <section className="relative min-h-[70vh] flex items-center bg-neutral text-neutral-content overflow-hidden">
                {/* Diagonal clip-path panel */}
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-secondary/10"
                    style={{
                        clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                    aria-hidden="true"
                />

                {/* Top accent line */}
                <div
                    className="absolute top-0 left-0 right-0 h-1 bg-secondary"
                    aria-hidden="true"
                />

                <div className="relative  container mx-auto px-6 lg:px-12">
                    <div className="max-w-2xl">
                        {/* Kicker */}
                        <p className="scroll-reveal fade-up text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            Not Found
                        </p>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-6">
                            <span className="scroll-reveal fade-up inline-block">
                                This page is gone.
                            </span>{" "}
                            <span className="scroll-reveal fade-up inline-block">
                                Your{" "}
                                <span className="text-secondary">
                                    opportunities
                                </span>{" "}
                                aren&apos;t.
                            </span>
                        </h1>

                        {/* Body */}
                        <p className="scroll-reveal fade-up text-lg leading-relaxed text-neutral-content/70 max-w-xl mb-8">
                            The page you&apos;re looking for doesn&apos;t exist
                            or has been moved. The marketplace is still active,
                            and recruiters are still working roles that match
                            your skills. Head back to open positions or check
                            your profile to make sure you&apos;re visible to the
                            right people.
                        </p>

                        {/* CTAs */}
                        <div className="scroll-reveal fade-up flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/jobs"
                                className="btn btn-secondary btn-md w-full sm:w-auto gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-magnifying-glass" />
                                View Open Jobs
                            </Link>
                            <Link
                                href="/portal/profile"
                                className="btn btn-ghost btn-md w-full sm:w-auto gap-2 text-neutral-content"
                            >
                                <i className="fa-duotone fa-regular fa-circle-user" />
                                Your Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Quick Links Section ──────────────────────────────── */}
            <section className="scroll-reveal fade-up container mx-auto px-6 lg:px-12 py-12 lg:py-16">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6">
                    Get back on track
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Jobs",
                            icon: "fa-duotone fa-regular fa-magnifying-glass",
                            href: "/jobs",
                        },
                        {
                            label: "Profile",
                            icon: "fa-duotone fa-regular fa-circle-user",
                            href: "/portal/profile",
                        },
                        {
                            label: "Applications",
                            icon: "fa-duotone fa-regular fa-file-lines",
                            href: "/portal/applications",
                        },
                        {
                            label: "Recruiters",
                            icon: "fa-duotone fa-regular fa-user-tie",
                            href: "/portal/recruiters",
                        },
                    ].map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="border-l-4 border-secondary bg-base-200 p-5 hover:bg-base-300 transition-colors group"
                        >
                            <i
                                className={`${link.icon} text-xl text-secondary mb-3 block`}
                            />
                            <span className="text-base font-medium text-base-content group-hover:text-secondary transition-colors">
                                {link.label}
                            </span>
                        </Link>
                    ))}
                </div>

                {/* ── Footer ───────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-12 pt-6 border-t border-base-300">
                    <p className="text-sm text-base-content/60">
                        Questions? Reach us at{" "}
                        <a
                            href="mailto:support@applicant.network"
                            className="text-secondary underline"
                        >
                            support@applicant.network
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
