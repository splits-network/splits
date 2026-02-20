"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Basel 404 — Corporate (Employment Networks)
 *
 * Editorial design: split-screen hero with diagonal clip-path,
 * ecosystem-level copy, three destination cards for platform navigation.
 */
export default function NotFound() {
    const mainRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                mainRef.current
                    .querySelectorAll(".opacity-0")
                    .forEach((el) => ((el as HTMLElement).style.opacity = "1"));
                return;
            }

            const $ = (s: string) =>
                mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) =>
                mainRef.current!.querySelector(s);

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

            const cards = $(".nf-card");
            cards.forEach((card, i) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        ease: "power3.out",
                        delay: 0.8 + i * 0.1,
                    },
                );
            });
        },
        { scope: mainRef },
    );

    const destinations = [
        {
            heading: "For Recruiters",
            description:
                "Access split-fee roles, manage candidates, and collaborate with recruiters across the network.",
            cta: "Visit Splits Network",
            href: "https://splits.network",
            icon: "fa-duotone fa-regular fa-users-between-lines",
        },
        {
            heading: "For Job Seekers",
            description:
                "Browse open positions and connect with specialized recruiters who advocate for your next move.",
            cta: "Visit Applicant Network",
            href: "https://applicant.network",
            icon: "fa-duotone fa-regular fa-briefcase",
        },
        {
            heading: "Get in Touch",
            description:
                "Press inquiries, partnership discussions, or general questions about the Employment Networks ecosystem.",
            cta: "Contact Us",
            href: "mailto:support@employment-networks.com",
            icon: "fa-duotone fa-regular fa-envelope",
        },
    ];

    return (
        <div ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Hero Section ──────────────────────────────────────── */}
            <section className="relative min-h-[70vh] flex items-center bg-neutral text-neutral-content overflow-hidden">
                {/* Diagonal clip-path panel */}
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath:
                            "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                    aria-hidden="true"
                />

                {/* Top accent line */}
                <div
                    className="absolute top-0 left-0 right-0 h-1 bg-primary"
                    aria-hidden="true"
                />

                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-2xl">
                        {/* Kicker */}
                        <p className="nf-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4 opacity-0">
                            Not Found
                        </p>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-6">
                            <span className="nf-headline-word inline-block opacity-0">
                                Wrong address.
                            </span>{" "}
                            <span className="nf-headline-word inline-block opacity-0">
                                The{" "}
                                <span className="text-primary">
                                    ecosystem
                                </span>{" "}
                                is still here.
                            </span>
                        </h1>

                        {/* Body */}
                        <p className="nf-body text-lg leading-relaxed text-neutral-content/70 max-w-xl mb-8 opacity-0">
                            This page doesn&apos;t exist, but the networks
                            that connect recruiters, candidates, and hiring
                            companies are running at full capacity. Use the
                            links below to find what you were looking for, or
                            explore the platforms that make up Employment
                            Networks.
                        </p>

                        {/* CTAs */}
                        <div className="nf-ctas flex flex-col sm:flex-row gap-3 opacity-0">
                            <Link
                                href="/"
                                className="btn btn-primary btn-md w-full sm:w-auto gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left" />
                                Back to Home
                            </Link>
                            <a
                                href="https://splits.network"
                                className="btn btn-ghost btn-md w-full sm:w-auto gap-2 text-neutral-content"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                                Explore Splits Network
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Destination Cards ────────────────────────────────── */}
            <section className="container mx-auto px-6 lg:px-12 py-12 lg:py-16">
                <div className="grid md:grid-cols-3 gap-6">
                    {destinations.map((dest) => (
                        <div
                            key={dest.heading}
                            className="nf-card border-t-4 border-primary bg-base-200 p-8 opacity-0"
                        >
                            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-5">
                                <i
                                    className={`${dest.icon} text-xl text-primary`}
                                />
                            </div>
                            <h3 className="text-lg font-black tracking-tight mb-2">
                                {dest.heading}
                            </h3>
                            <p className="text-base text-base-content/60 leading-relaxed mb-6">
                                {dest.description}
                            </p>
                            <a
                                href={dest.href}
                                className="btn btn-primary btn-sm gap-2"
                            >
                                {dest.cta}
                                <i className="fa-duotone fa-regular fa-arrow-right" />
                            </a>
                        </div>
                    ))}
                </div>

                {/* ── Footer ───────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-12 pt-6 border-t border-base-300">
                    <p className="text-sm text-base-content/60">
                        For general inquiries, contact{" "}
                        <a
                            href="mailto:support@employment-networks.com"
                            className="text-primary underline"
                        >
                            support@employment-networks.com
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
