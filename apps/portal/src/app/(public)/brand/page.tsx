"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ── Basel color palette data ─────────────────────────────────────────────────

const baselColors = [
    { name: "Primary", token: "primary", cssVar: "--color-primary", hex: "#233876", usage: "Navigation, CTAs, brand anchors", swatch: "bg-primary", text: "text-primary-content" },
    { name: "Secondary", token: "secondary", cssVar: "--color-secondary", hex: "#0f9d8a", usage: "Supporting actions, confirmations", swatch: "bg-secondary", text: "text-secondary-content" },
    { name: "Accent", token: "accent", cssVar: "--color-accent", hex: "#db2777", usage: "Badges, highlights, focal points", swatch: "bg-accent", text: "text-accent-content" },
    { name: "Neutral", token: "neutral", cssVar: "--color-neutral", hex: "#18181b", usage: "Dark surfaces, footers, contrast", swatch: "bg-neutral", text: "text-neutral-content" },
];

const baseSurfaces = [
    { name: "Base 100", token: "base-100", hex: "#ffffff", usage: "Primary page background", swatch: "bg-base-100", text: "text-base-content" },
    { name: "Base 200", token: "base-200", hex: "#f4f4f5", usage: "Cards, recessed surfaces", swatch: "bg-base-200", text: "text-base-content" },
    { name: "Base 300", token: "base-300", hex: "#e4e4e7", usage: "Borders, dividers, muted areas", swatch: "bg-base-300", text: "text-base-content" },
    { name: "Base Content", token: "base-content", hex: "#18181b", usage: "Default text on light surfaces", swatch: "bg-base-content", text: "text-base-100" },
];

const semanticColors = [
    { name: "Success", token: "success", hex: "#16a34a", swatch: "bg-success", text: "text-success-content" },
    { name: "Warning", token: "warning", hex: "#d97706", swatch: "bg-warning", text: "text-warning-content" },
    { name: "Error", token: "error", hex: "#ef4444", swatch: "bg-error", text: "text-error-content" },
    { name: "Info", token: "info", hex: "#0ea5e9", swatch: "bg-info", text: "text-info-content" },
];

const keyFacts = [
    { value: "2025", label: "Year Founded", border: "border-primary", text: "text-primary" },
    { value: "$0", label: "Cost for Companies to Post", border: "border-secondary", text: "text-secondary" },
    { value: "0-100%", label: "Flexible Recruiter Split", border: "border-accent", text: "text-accent" },
    { value: "Cloud-Native", label: "Kubernetes Infrastructure", border: "border-info", text: "text-info" },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function BrandBaselPage() {
    const mainRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) {
                mainRef.current
                    .querySelectorAll("[class*='opacity-0']")
                    .forEach((el) => gsap.set(el, { opacity: 1 }));
                return;
            }

            const $ = (sel: string) => mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => mainRef.current!.querySelector(sel);

            // ── Hero entrance ─────────────────────────────────────
            const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

            heroTl
                .fromTo(
                    $1(".hero-kicker"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                )
                .fromTo(
                    $(".hero-headline-word"),
                    { opacity: 0, y: 80, rotateX: 40 },
                    { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.12 },
                    "-=0.3",
                )
                .fromTo(
                    $1(".hero-subtitle"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.5",
                )
                .fromTo(
                    $(".hero-cta"),
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    "-=0.3",
                );

            // Hero image
            const heroImg = $1(".hero-img-wrap");
            if (heroImg) {
                gsap.fromTo(
                    heroImg,
                    { opacity: 0, scale: 1.08 },
                    { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out", delay: 0.2 },
                );
            }

            // ── Company overview ──────────────────────────────────
            const overviewSection = $1(".overview-section");
            if (overviewSection) {
                gsap.fromTo(
                    $1(".overview-heading"),
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
                        scrollTrigger: { trigger: overviewSection, start: "top 75%" },
                    },
                );
                gsap.fromTo(
                    $(".overview-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: 0.6, stagger: 0.1,
                        scrollTrigger: { trigger: overviewSection, start: "top 70%" },
                    },
                );
                gsap.fromTo(
                    $(".fact-card"),
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1, x: 0, duration: 0.5, stagger: 0.08,
                        scrollTrigger: { trigger: $1(".facts-grid"), start: "top 80%" },
                    },
                );
            }

            // ── Logo section ──────────────────────────────────────
            const logoSection = $1(".logo-section");
            if (logoSection) {
                gsap.fromTo(
                    $1(".logo-heading"),
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 0.7,
                        scrollTrigger: { trigger: logoSection, start: "top 75%" },
                    },
                );
                gsap.fromTo(
                    $(".logo-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: 0.6, stagger: 0.12,
                        scrollTrigger: { trigger: logoSection, start: "top 70%" },
                    },
                );
            }

            // ── Typography section ────────────────────────────────
            const typoSection = $1(".typo-section");
            if (typoSection) {
                gsap.fromTo(
                    $1(".typo-heading"),
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 0.7,
                        scrollTrigger: { trigger: typoSection, start: "top 75%" },
                    },
                );
                gsap.fromTo(
                    $(".typo-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: 0.6, stagger: 0.1,
                        scrollTrigger: { trigger: typoSection, start: "top 70%" },
                    },
                );
            }

            // ── Color palette section ─────────────────────────────
            const colorSection = $1(".color-section");
            if (colorSection) {
                gsap.fromTo(
                    $1(".color-heading"),
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 0.7,
                        scrollTrigger: { trigger: colorSection, start: "top 75%" },
                    },
                );
                gsap.fromTo(
                    $(".color-swatch"),
                    { opacity: 0, y: 20, scale: 0.96 },
                    {
                        opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06,
                        scrollTrigger: { trigger: $1(".color-grid"), start: "top 80%" },
                    },
                );
            }

            // ── Screenshots section ───────────────────────────────
            const screenshotSection = $1(".screenshot-section");
            if (screenshotSection) {
                gsap.fromTo(
                    $1(".screenshot-heading"),
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 0.7,
                        scrollTrigger: { trigger: screenshotSection, start: "top 75%" },
                    },
                );
                gsap.fromTo(
                    $(".screenshot-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: 0.6, stagger: 0.15,
                        scrollTrigger: { trigger: screenshotSection, start: "top 70%" },
                    },
                );
            }

            // ── Contact section ───────────────────────────────────
            const contactSection = $1(".contact-section");
            if (contactSection) {
                gsap.fromTo(
                    $1(".contact-heading"),
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 0.7,
                        scrollTrigger: { trigger: contactSection, start: "top 75%" },
                    },
                );
                gsap.fromTo(
                    $(".contact-card"),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: 0.6, stagger: 0.12,
                        scrollTrigger: { trigger: contactSection, start: "top 70%" },
                    },
                );
            }
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="overflow-hidden">
            {/* ═══════════════════════════════════════════════════════════════
                1. HERO — Split-screen editorial with diagonal clip
            ═══════════════════════════════════════════════════════════════ */}
            <section className="hero-section relative min-h-[70vh] flex items-center bg-base-100">
                {/* Right image panel — abstract brand texture */}
                <div
                    className="hero-img-wrap absolute inset-0 lg:left-[55%] opacity-0"
                    style={{ clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0% 100%)" }}
                >
                    <div className="w-full h-full bg-primary" />
                    <div className="absolute inset-0 bg-primary/80 lg:bg-primary/60" />
                    {/* Subtle diagonal lines as texture */}
                    <div className="absolute inset-0 opacity-10 text-primary-content" style={{
                        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, currentColor 20px, currentColor 21px)",
                    }} />
                </div>

                <div className="relative z-10 container mx-auto px-6 lg:px-12 py-28">
                    <div className="max-w-2xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6 opacity-0">
                            <i className="fa-duotone fa-regular fa-palette mr-2"></i>
                            Press Kit
                        </p>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="hero-headline-word inline-block opacity-0 text-base-content">
                                Brand
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-primary">
                                Guidelines
                            </span>
                        </h1>

                        <p className="hero-subtitle text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl mb-10 opacity-0">
                            Logos, color specifications, typography standards, and
                            company information for press, partners, and editorial use.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <a
                                href="/logo.svg"
                                download="splits-network-logo.svg"
                                className="hero-cta btn btn-primary btn-lg shadow-md opacity-0"
                                style={{ borderRadius: 0 }}
                            >
                                <i className="fa-duotone fa-regular fa-download"></i>
                                Download Logo
                            </a>
                            <a
                                href="mailto:press@splits.network"
                                className="hero-cta btn btn-ghost btn-lg opacity-0"
                                style={{ borderRadius: 0 }}
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                Contact Press
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                2. COMPANY OVERVIEW — Asymmetric editorial grid
            ═══════════════════════════════════════════════════════════════ */}
            <section className="overview-section py-24 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="overview-heading max-w-3xl mb-16 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            The Company
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                            About Splits Network
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
                        {/* About + Boilerplate — 3/5 */}
                        <div className="lg:col-span-3 space-y-10">
                            <div className="overview-card border-l-4 border-primary pl-6 opacity-0">
                                <h3 className="text-xl font-bold text-base-content mb-4">
                                    What We Do
                                </h3>
                                <p className="text-base text-base-content/70 leading-relaxed">
                                    Splits Network is a recruiting marketplace built for
                                    split-fee placements. Companies post roles at no cost.
                                    Specialized recruiters engage based on their expertise.
                                    The platform tracks every interaction, enforces agreed
                                    split terms, and distributes payments on verified
                                    outcomes -- replacing scattered spreadsheets and email
                                    threads with one connected ecosystem.
                                </p>
                            </div>

                            <div className="overview-card border-l-4 border-secondary pl-6 opacity-0">
                                <h3 className="text-xl font-bold text-base-content mb-4">
                                    Press Boilerplate
                                </h3>
                                <div className="bg-neutral text-neutral-content p-6 shadow-md">
                                    <p className="italic leading-relaxed">
                                        Splits Network is a split-fee recruiting marketplace
                                        where companies post open roles and specialized
                                        recruiters compete to fill them. The platform provides
                                        a built-in applicant tracking system, transparent fee
                                        structures, and automated split accounting -- replacing
                                        the manual coordination that has defined collaborative
                                        recruiting for decades. Built by recruiting industry
                                        practitioners, not retrofitted from general-purpose
                                        HR software.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Key Facts — 2/5 */}
                        <div className="lg:col-span-2">
                            <h3 className="text-xl font-bold text-base-content mb-6">
                                At a Glance
                            </h3>
                            <div className="facts-grid space-y-4">
                                {keyFacts.map((fact, i) => (
                                    <div
                                        key={i}
                                        className={`fact-card border-l-4 ${fact.border} bg-base-100 p-5 shadow-sm opacity-0`}
                                    >
                                        <div className={`text-2xl font-black ${fact.text} mb-1`}>
                                            {fact.value}
                                        </div>
                                        <div className="text-sm font-medium text-base-content/50 uppercase tracking-wider">
                                            {fact.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                3. BRAND ASSETS — LOGO MARK
            ═══════════════════════════════════════════════════════════════ */}
            <section className="logo-section py-24 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="logo-heading max-w-3xl mb-16 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            Identity
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                            Logo System
                        </h2>
                        <p className="text-lg text-neutral-content/60 mt-4 leading-relaxed">
                            Brand mark, wordmark, and approved usage contexts
                        </p>
                    </div>

                    {/* Primary logos — light vs dark */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="logo-card bg-base-200/10 border border-neutral-content/10 p-8 shadow-md opacity-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-2 h-6 bg-primary" />
                                <h3 className="text-lg font-bold">
                                    Light Background
                                </h3>
                            </div>
                            <div className="bg-base-100 p-10 flex items-center justify-center min-h-40 mb-4">
                                <Image
                                    src="/logo.svg"
                                    alt="Splits Network logo, standard version for light surfaces"
                                    width={240}
                                    height={60}
                                    className="h-12 w-auto"
                                />
                            </div>
                            <p className="text-sm text-neutral-content/50">
                                Standard version for white and light surfaces
                            </p>
                        </div>

                        <div className="logo-card bg-base-200/10 border border-neutral-content/10 p-8 shadow-md opacity-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-2 h-6 bg-secondary" />
                                <h3 className="text-lg font-bold">
                                    Dark Background
                                </h3>
                            </div>
                            <div className="bg-neutral p-10 border border-neutral-content/20 flex items-center justify-center min-h-40 mb-4">
                                <Image
                                    src="/logo.svg"
                                    alt="Splits Network logo, inverted version for dark surfaces"
                                    width={240}
                                    height={60}
                                    className="h-12 w-auto invert"
                                />
                            </div>
                            <p className="text-sm text-neutral-content/50">
                                Inverted variant for dark and neutral surfaces
                            </p>
                        </div>
                    </div>

                    {/* Usage guidelines */}
                    <div className="logo-card bg-base-200/10 border border-neutral-content/10 p-8 shadow-md mb-12 opacity-0">
                        <h3 className="text-lg font-bold mb-6">
                            Usage Guidelines
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-success/20 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-check text-success text-sm"></i>
                                </div>
                                <p className="text-neutral-content/70 text-base">
                                    Place on solid backgrounds with sufficient contrast ratio
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-success/20 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-check text-success text-sm"></i>
                                </div>
                                <p className="text-neutral-content/70 text-base">
                                    Preserve minimum clear space equal to the height of the brand mark
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-error/20 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-xmark text-error text-sm"></i>
                                </div>
                                <p className="text-neutral-content/70 text-base">
                                    Never distort, rotate, recolor, or add effects to the logo
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SVG download */}
                    <div className="logo-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-base-200/10 border border-neutral-content/10 p-6 shadow-sm opacity-0">
                        <div>
                            <h4 className="text-base font-bold mb-1">Vector Logo</h4>
                            <p className="text-sm text-neutral-content/40">SVG format for print, editorial, and digital media</p>
                        </div>
                        <a
                            href="/logo.svg"
                            download="splits-network-logo.svg"
                            className="btn btn-primary btn-sm shadow-sm"
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-download"></i>
                            Download SVG
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                4. TYPOGRAPHY
            ═══════════════════════════════════════════════════════════════ */}
            <section className="typo-section py-24 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="typo-heading max-w-3xl mb-16 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            Typography
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                            Type System
                        </h2>
                    </div>

                    {/* Font families */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div className="typo-card border-l-4 border-primary bg-base-200 p-8 shadow-sm opacity-0">
                            <div className="flex items-center gap-3 mb-4">
                                <i className="fa-duotone fa-regular fa-font text-primary"></i>
                                <h3 className="text-lg font-bold">
                                    Primary Typeface
                                </h3>
                            </div>
                            <p className="text-2xl font-black text-base-content mb-3">
                                System Sans-Serif
                            </p>
                            <div className="text-sm text-base-content/40 font-mono leading-relaxed mb-4">
                                ui-sans-serif, system-ui, sans-serif
                            </div>
                            <p className="text-sm text-base-content/60">
                                SF Pro on macOS, Segoe UI on Windows, Roboto on Android. No web fonts to load -- renders natively on every platform.
                            </p>
                            <div className="mt-4 border-t border-base-300 pt-4">
                                <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">Application:</span>
                                <p className="text-sm text-base-content/60 mt-1">Headlines, body text, navigation, buttons, form labels.</p>
                            </div>
                        </div>

                        <div className="typo-card border-l-4 border-secondary bg-base-200 p-8 shadow-sm opacity-0">
                            <div className="flex items-center gap-3 mb-4">
                                <i className="fa-duotone fa-regular fa-code text-secondary"></i>
                                <h3 className="text-lg font-bold">
                                    Monospace
                                </h3>
                            </div>
                            <p className="text-2xl font-mono font-bold text-base-content mb-3">
                                System Monospace
                            </p>
                            <div className="text-sm text-base-content/40 font-mono leading-relaxed mb-4">
                                ui-monospace, monospace
                            </div>
                            <p className="text-sm text-base-content/60">
                                SF Mono on macOS, Cascadia Mono on Windows. Reserved for contexts where fixed-width alignment matters.
                            </p>
                            <div className="mt-4 border-t border-base-300 pt-4">
                                <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">Application:</span>
                                <p className="text-sm text-base-content/60 mt-1">Code references, data tokens, technical identifiers.</p>
                            </div>
                        </div>

                        <div className="typo-card border-l-4 border-accent bg-base-200 p-8 shadow-sm opacity-0">
                            <div className="flex items-center gap-3 mb-4">
                                <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-accent"></i>
                                <h3 className="text-lg font-bold">
                                    Wordmark Weight
                                </h3>
                            </div>
                            <p className="text-2xl font-black text-base-content mb-3">
                                System Sans @ 900
                            </p>
                            <div className="text-sm text-base-content/40 leading-relaxed mb-4">
                                Same system stack, maximum weight, tight tracking
                            </div>
                            <p className="text-sm text-base-content/60">
                                The wordmark is set in the same system sans-serif at weight 900. No custom font file -- the brand identity is purely typographic.
                            </p>
                            <div className="mt-4 border-t border-base-300 pt-4">
                                <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">Reproduction:</span>
                                <p className="text-sm text-base-content/60 mt-1">When reproducing externally, use SF Pro Black or Segoe UI at maximum available weight.</p>
                            </div>
                        </div>
                    </div>

                    {/* Type scale */}
                    <div className="typo-card bg-base-200 p-8 shadow-sm mb-12 opacity-0">
                        <h3 className="text-xl font-bold mb-8 border-l-4 border-primary pl-4">
                            Heading Scale
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: "Display", size: "text-5xl md:text-7xl", weight: "font-black", spec: "5xl–7xl / 900", desc: "Hero headlines and page-level titles. Tight tracking, minimal leading." },
                                { label: "Heading 1", size: "text-4xl md:text-5xl", weight: "font-black", spec: "4xl–5xl / 900", desc: "Section headings and primary content divisions." },
                                { label: "Heading 2", size: "text-2xl", weight: "font-bold", spec: "2xl / 700", desc: "Subsection titles, card headers, modal titles." },
                                { label: "Heading 3", size: "text-xl", weight: "font-bold", spec: "xl / 700", desc: "Panel headers, field groups, toolbar labels." },
                                { label: "Heading 4", size: "text-lg", weight: "font-semibold", spec: "lg / 600", desc: "Minor headings, list groups, sidebar labels." },
                            ].map((h, i) => (
                                <div key={i} className={`pb-6 ${i < 4 ? "border-b border-base-300" : ""}`}>
                                    <div className="flex items-baseline justify-between mb-2">
                                        <h4 className={`${h.size} ${h.weight} tracking-tight text-base-content`}>{h.label}</h4>
                                        <span className="text-sm font-medium text-base-content/40 hidden sm:block">{h.spec}</span>
                                    </div>
                                    <p className="text-sm text-base-content/50">{h.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Body text + treatments */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="typo-card bg-base-200 p-8 shadow-sm opacity-0">
                            <h3 className="text-xl font-bold mb-6 border-l-4 border-secondary pl-4">
                                Body Text
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">text-base (16px) — Standard</span>
                                    <p className="text-base text-base-content/70 leading-relaxed mt-2">
                                        The default for all readable content. Paragraphs, descriptions, form labels, and list items.
                                    </p>
                                </div>
                                <div className="border-t border-base-300 pt-4">
                                    <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">text-sm (14px) — Supporting</span>
                                    <p className="text-sm text-base-content/60 mt-2">
                                        Metadata, captions, bylines, and secondary information.
                                    </p>
                                </div>
                                <div className="border-t border-base-300 pt-4">
                                    <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">text-xs (12px) — System</span>
                                    <p className="text-xs text-base-content/50 mt-2">
                                        Reserved for non-human-facing content: timestamps, version numbers, system labels.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="typo-card bg-base-200 p-8 shadow-sm opacity-0">
                            <h3 className="text-xl font-bold mb-6 border-l-4 border-accent pl-4">
                                Text Treatments
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3 block">Buttons &amp; CTAs</span>
                                    <div className="btn btn-primary btn-sm" style={{ borderRadius: 0 }}>
                                        <span className="font-bold uppercase tracking-wider">Primary Button</span>
                                    </div>
                                </div>
                                <div className="border-t border-base-300 pt-4">
                                    <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3 block">Badges</span>
                                    <div className="badge badge-secondary" style={{ borderRadius: 0 }}>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Status Badge</span>
                                    </div>
                                </div>
                                <div className="border-t border-base-300 pt-4">
                                    <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3 block">Links</span>
                                    <span className="text-base text-primary font-semibold underline decoration-2 decoration-primary/30 hover:decoration-primary transition-colors cursor-pointer">
                                        Underlined Link Style
                                    </span>
                                </div>
                                <div className="border-t border-base-300 pt-4">
                                    <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3 block">Kicker / Overline</span>
                                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                                        Section Kicker
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                5. COLOR PALETTE — DaisyUI Semantic Tokens
            ═══════════════════════════════════════════════════════════════ */}
            <section className="color-section py-24 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="color-heading max-w-3xl mb-16 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            Color System
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                            Palette
                        </h2>
                        <p className="text-lg text-base-content/60 mt-4 leading-relaxed">
                            Semantic tokens that adapt across light and dark themes
                        </p>
                    </div>

                    {/* Brand colors */}
                    <h3 className="text-xl font-bold mb-6 border-l-4 border-primary pl-4">
                        Core Brand
                    </h3>
                    <div className="color-grid grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                        {baselColors.map((color) => (
                            <div key={color.name} className="color-swatch bg-base-100 shadow-sm overflow-hidden opacity-0">
                                <div className={`${color.swatch} h-24 flex items-center justify-center`}>
                                    <span className={`text-lg font-bold ${color.text}`}>
                                        {color.name}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <code className="text-xs font-mono text-base-content/60">{color.token}</code>
                                        <code className="text-xs font-mono text-base-content/40">{color.hex}</code>
                                    </div>
                                    <p className="text-sm text-base-content/50">{color.usage}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Base surfaces */}
                    <h3 className="text-xl font-bold mb-6 border-l-4 border-secondary pl-4">
                        Surface Tones
                    </h3>
                    <div className="color-grid grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                        {baseSurfaces.map((color) => (
                            <div key={color.name} className="color-swatch bg-base-100 shadow-sm overflow-hidden opacity-0">
                                <div className={`${color.swatch} h-24 flex items-center justify-center border border-base-300`}>
                                    <span className={`text-lg font-bold ${color.text}`}>
                                        {color.name}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <code className="text-xs font-mono text-base-content/60">{color.token}</code>
                                        <code className="text-xs font-mono text-base-content/40">{color.hex}</code>
                                    </div>
                                    <p className="text-sm text-base-content/50">{color.usage}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Semantic colors */}
                    <h3 className="text-xl font-bold mb-6 border-l-4 border-accent pl-4">
                        Status Indicators
                    </h3>
                    <div className="color-grid grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                        {semanticColors.map((color) => (
                            <div key={color.name} className="color-swatch bg-base-100 shadow-sm overflow-hidden opacity-0">
                                <div className={`${color.swatch} h-24 flex items-center justify-center`}>
                                    <span className={`text-lg font-bold ${color.text}`}>
                                        {color.name}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <code className="text-xs font-mono text-base-content/60">{color.token}</code>
                                        <code className="text-xs font-mono text-base-content/40">{color.hex}</code>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recommended combinations */}
                    <div className="bg-base-100 p-8 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 border-l-4 border-primary pl-4">
                            Approved Pairings
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-primary text-primary-content p-6 text-center shadow-sm">
                                <span className="font-bold text-sm uppercase tracking-wider">Primary + Content</span>
                            </div>
                            <div className="bg-secondary text-secondary-content p-6 text-center shadow-sm">
                                <span className="font-bold text-sm uppercase tracking-wider">Secondary + Content</span>
                            </div>
                            <div className="bg-neutral text-neutral-content p-6 text-center shadow-sm">
                                <span className="font-bold text-sm uppercase tracking-wider">Neutral + Content</span>
                            </div>
                            <div className="bg-accent text-accent-content p-6 text-center shadow-sm">
                                <span className="font-bold text-sm uppercase tracking-wider">Accent + Content</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                6. PRODUCT SCREENSHOTS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="screenshot-section py-24 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="screenshot-heading max-w-3xl mb-16 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            Product
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                            Interface
                        </h2>
                        <p className="text-lg text-neutral-content/60 mt-4 leading-relaxed">
                            High-resolution screenshots available for editorial use on request
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="screenshot-card bg-base-200/10 border border-neutral-content/10 p-6 shadow-md opacity-0">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-6 bg-primary" />
                                <h3 className="text-base font-bold">
                                    Recruiter Dashboard
                                </h3>
                            </div>
                            <div className="border border-neutral-content/10 aspect-video flex items-center justify-center overflow-hidden">
                                <Image
                                    src="/screenshots/light/dashboard-light.png"
                                    alt="Splits Network recruiter dashboard showing pipeline metrics and active roles"
                                    width={640}
                                    height={360}
                                    className="object-contain w-full h-full"
                                />
                            </div>
                        </div>
                        <div className="screenshot-card bg-base-200/10 border border-neutral-content/10 p-6 shadow-md opacity-0">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-6 bg-secondary" />
                                <h3 className="text-base font-bold">
                                    Candidate Pipeline
                                </h3>
                            </div>
                            <div className="border border-neutral-content/10 aspect-video flex items-center justify-center bg-neutral">
                                <div className="text-center">
                                    <i className="fa-duotone fa-regular fa-image text-5xl text-neutral-content/20 mb-3"></i>
                                    <p className="text-sm text-neutral-content/40 font-medium">Available on Request</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <a
                            href="mailto:press@splits.network?subject=Screenshot%20Request"
                            className="btn btn-primary btn-md shadow-md"
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-images"></i>
                            Request Media Assets
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                7. MEDIA CONTACT
            ═══════════════════════════════════════════════════════════════ */}
            <section className="contact-section py-24 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="contact-heading max-w-3xl mx-auto text-center mb-16 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            Contact
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                            Press and Partnerships
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                        {/* Press */}
                        <div className="contact-card border-l-4 border-primary bg-base-200 p-8 shadow-sm opacity-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-newspaper text-primary"></i>
                                </div>
                                <h3 className="text-xl font-bold">
                                    Press and Editorial
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <i className="fa-duotone fa-regular fa-envelope text-primary text-sm"></i>
                                    <a
                                        href="mailto:press@splits.network"
                                        className="text-base text-primary font-semibold underline decoration-2 decoration-primary/30 hover:decoration-primary transition-colors"
                                    >
                                        press@splits.network
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <i className="fa-duotone fa-regular fa-phone text-primary text-sm"></i>
                                    <span className="text-base text-base-content/60">
                                        Direct line available on request
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Partnerships */}
                        <div className="contact-card border-l-4 border-secondary bg-base-200 p-8 shadow-sm opacity-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-handshake text-secondary"></i>
                                </div>
                                <h3 className="text-xl font-bold">
                                    Partnerships
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <i className="fa-duotone fa-regular fa-envelope text-secondary text-sm"></i>
                                    <a
                                        href="mailto:partnerships@splits.network"
                                        className="text-base text-secondary font-semibold underline decoration-2 decoration-secondary/30 hover:decoration-secondary transition-colors"
                                    >
                                        partnerships@splits.network
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <i className="fa-duotone fa-regular fa-handshake text-secondary text-sm"></i>
                                    <Link
                                        href="/partners"
                                        className="text-base text-secondary font-semibold underline decoration-2 decoration-secondary/30 hover:decoration-secondary transition-colors"
                                    >
                                        View Partner Program
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center border-t border-base-300 pt-12 max-w-4xl mx-auto">
                        <p className="text-base text-base-content/60 mb-8 max-w-2xl mx-auto">
                            For custom assets, executive interviews, or materials
                            not listed here, reach the press team directly.
                        </p>
                        <a
                            href="mailto:press@splits.network"
                            className="btn btn-primary btn-lg shadow-md"
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            Contact Press Team
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
