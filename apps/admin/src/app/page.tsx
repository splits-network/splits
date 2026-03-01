"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BaselHeader } from "@splits-network/basel-ui";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Platform data ──────────────────────────────────────────────────────── */

const platforms = [
    {
        name: "Splits Network",
        description:
            "The split-fee recruiting marketplace for recruiters and companies. Post roles, manage pipelines, and earn transparent splits.",
        href: "https://splits.network",
        color: "primary" as const,
        icon: "fa-duotone fa-regular fa-network-wired",
        features: [
            "Split-fee marketplace",
            "Built-in ATS & pipeline tools",
            "Transparent placement tracking",
        ],
    },
    {
        name: "Applicant Network",
        description:
            "The candidate portal for job seekers. Apply to roles, track your progress, and connect with recruiters who advocate for you.",
        href: "https://applicant.network",
        color: "secondary" as const,
        icon: "fa-duotone fa-regular fa-user",
        features: [
            "One-click applications",
            "Real-time status tracking",
            "100% free for candidates",
        ],
    },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function HomePage() {
    const mainRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

            if (prefersReducedMotion) {
                mainRef.current
                    .querySelectorAll(".opacity-0")
                    .forEach((el) => ((el as HTMLElement).style.opacity = "1"));
                return;
            }

            const $ = (sel: string) =>
                mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => mainRef.current!.querySelector(sel);

            /* Header */
            gsap.fromTo(
                $1(".header-bar"),
                { opacity: 0, y: -30 },
                { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", clearProps: "transform" },
            );

            /* Hero */
            const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
            heroTl
                .fromTo(
                    $1(".hero-kicker"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, clearProps: "transform" },
                )
                .fromTo(
                    $(".hero-headline-word"),
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1, y: 0, rotateX: 0,
                        duration: 1, stagger: 0.12, clearProps: "transform",
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".hero-body"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7, clearProps: "transform" },
                    "-=0.5",
                )
                .fromTo(
                    $(".hero-cta"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, clearProps: "transform" },
                    "-=0.3",
                );

            /* Platform cards */
            gsap.fromTo(
                $(".platform-card"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1, y: 0, duration: 0.7, stagger: 0.15,
                    ease: "power3.out", clearProps: "transform",
                    scrollTrigger: { trigger: $1(".platforms-grid"), start: "top 85%" },
                },
            );

            /* Footer */
            gsap.fromTo(
                $1(".footer-content"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: 0.6,
                    ease: "power2.out", clearProps: "transform",
                    scrollTrigger: { trigger: $1(".footer-content"), start: "top 90%" },
                },
            );
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100 flex flex-col">
            {/* ── Header ──────────────────────────────────────────── */}
            <BaselHeader
                logo={
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Employment Networks"
                            className="h-8 w-auto"
                        />
                        <span className="text-base-content/40 text-sm font-semibold uppercase tracking-widest">
                            Admin
                        </span>
                    </div>
                }
                actions={
                    <Link href="/sign-in" className="btn btn-primary btn-sm">
                        <i className="fa-duotone fa-regular fa-lock" />
                        Sign In
                    </Link>
                }
                position="sticky"
                accentLine={true}
            />

            {/* ── Hero ────────────────────────────────────────────── */}
            <section className="hero-section flex-1 flex items-center py-28 lg:py-36">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6 opacity-0">
                            Internal Platform
                        </p>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="hero-headline-word inline-block opacity-0 text-base-content">
                                Employment Networks
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-primary">
                                Administration
                            </span>
                        </h1>

                        <p className="hero-body text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl mb-10 opacity-0">
                            This is the internal administration portal for Employment Networks.
                            Looking for our platforms? Visit Splits Network for recruiters and
                            companies, or Applicant Network for job seekers.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://splits.network"
                                className="hero-cta btn btn-primary btn-lg shadow-lg opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-network-wired" />
                                Splits Network
                            </a>
                            <a
                                href="https://applicant.network"
                                className="hero-cta btn btn-secondary btn-lg shadow-lg opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-user" />
                                Applicant Network
                            </a>
                            <Link
                                href="/sign-in"
                                className="hero-cta btn btn-ghost btn-lg opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-lock" />
                                Admin Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Platforms ────────────────────────────────────────── */}
            <section className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="platforms-grid grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {platforms.map((p, i) => (
                            <div
                                key={i}
                                className={`platform-card border-l-4 ${
                                    p.color === "primary"
                                        ? "border-primary"
                                        : "border-secondary"
                                } bg-base-100 p-8 lg:p-10 opacity-0`}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div
                                        className={`w-12 h-12 flex items-center justify-center ${
                                            p.color === "primary"
                                                ? "bg-primary text-primary-content"
                                                : "bg-secondary text-secondary-content"
                                        }`}
                                    >
                                        <i className={`${p.icon} text-xl`} />
                                    </div>
                                    <h2 className="text-2xl font-black">{p.name}</h2>
                                </div>

                                <p className="text-base-content/70 leading-relaxed mb-6">
                                    {p.description}
                                </p>

                                <ul className="space-y-2 mb-8">
                                    {p.features.map((feat, j) => (
                                        <li
                                            key={j}
                                            className="flex items-center gap-3 text-base-content/80"
                                        >
                                            <i
                                                className={`fa-duotone fa-regular fa-check text-sm ${
                                                    p.color === "primary"
                                                        ? "text-primary"
                                                        : "text-secondary"
                                                }`}
                                            />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href={p.href}
                                    className={`btn ${
                                        p.color === "primary"
                                            ? "btn-primary"
                                            : "btn-secondary"
                                    } w-full`}
                                >
                                    Visit {p.name}
                                    <i className="fa-duotone fa-regular fa-arrow-right" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Footer ──────────────────────────────────────────── */}
            <footer className="py-16 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="footer-content max-w-3xl mx-auto text-center opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            Authorized Personnel Only
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black leading-[0.95] tracking-tight mb-4">
                            Admin Access
                        </h2>
                        <p className="opacity-70 leading-relaxed mb-8 max-w-lg mx-auto">
                            This portal is restricted to Employment Networks platform
                            administrators. If you need access, contact your system administrator.
                        </p>
                        <Link href="/sign-in" className="btn btn-primary btn-lg shadow-lg">
                            <i className="fa-duotone fa-regular fa-lock" />
                            Sign In to Administration
                        </Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
