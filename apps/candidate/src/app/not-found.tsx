"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Basel 404 — Candidate (Applicant Network)
 *
 * Editorial design: split-screen hero with diagonal clip-path,
 * empowering copy, quick-link navigation cards.
 */
export default function NotFound() {
    const mainRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                mainRef.current
                    .querySelectorAll(".opacity-0")
                    .forEach((el) => ((el as HTMLElement).style.opacity = "1"));
                return;
            }

            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);

            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            const kicker = $1(".nf-kicker");
            if (kicker) {
                tl.fromTo(
                    kicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                );
            }

            const words = $(".nf-headline-word");
            if (words.length) {
                tl.fromTo(
                    words,
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                    },
                    "-=0.3",
                );
            }

            const body = $1(".nf-body");
            if (body) {
                tl.fromTo(
                    body,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.4",
                );
            }

            const ctas = $1(".nf-ctas");
            if (ctas) {
                tl.fromTo(
                    ctas,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.3",
                );
            }

            const links = $1(".nf-links");
            if (links) {
                gsap.fromTo(
                    links,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        ease: "power3.out",
                        delay: 0.8,
                    },
                );
            }
        },
        { scope: mainRef },
    );

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

                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-2xl">
                        {/* Kicker */}
                        <p className="nf-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                            Not Found
                        </p>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-6">
                            <span className="nf-headline-word inline-block opacity-0">
                                This page is gone.
                            </span>{" "}
                            <span className="nf-headline-word inline-block opacity-0">
                                Your{" "}
                                <span className="text-secondary">
                                    opportunities
                                </span>{" "}
                                aren&apos;t.
                            </span>
                        </h1>

                        {/* Body */}
                        <p className="nf-body text-lg leading-relaxed text-neutral-content/70 max-w-xl mb-8 opacity-0">
                            The page you&apos;re looking for doesn&apos;t exist
                            or has been moved. The marketplace is still active,
                            and recruiters are still working roles that match
                            your skills. Head back to open positions or check
                            your profile to make sure you&apos;re visible to the
                            right people.
                        </p>

                        {/* CTAs */}
                        <div className="nf-ctas flex flex-col sm:flex-row gap-3 opacity-0">
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
            <section className="nf-links container mx-auto px-6 lg:px-12 py-12 lg:py-16 opacity-0">
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
