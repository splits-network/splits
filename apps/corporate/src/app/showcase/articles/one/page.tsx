"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Unsplash images ─────────────────────────────────────────────────────── */
const img = {
    hero: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80",
    collaboration:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
    handshake:
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80",
    dashboard:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
};

/* ─── Article metadata ────────────────────────────────────────────────────── */
const meta = {
    title: "The Future of Recruiting: How Split-Fee Models Are Changing The Industry",
    subtitle: "Why collaborative recruiting is replacing the broken solo model",
    author: "Employment Networks Editorial",
    date: "February 14, 2026",
    readTime: "12 min read",
    category: "Industry Analysis",
};

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function ArticleOnePage() {
    const mainRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const $ = (sel: string) =>
                mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                mainRef.current!.querySelector(sel);

            // ── HERO ────────────────────────────────────────────
            const heroTl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            heroTl
                .fromTo(
                    $1(".hero-kicker"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                )
                .fromTo(
                    $(".hero-headline-word"),
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 1,
                        stagger: 0.12,
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".hero-subtitle"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.5",
                )
                .fromTo(
                    $(".hero-meta-item"),
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    "-=0.3",
                );

            // Hero image parallax
            gsap.fromTo(
                $1(".hero-img-wrap"),
                { opacity: 0, scale: 1.08 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1.4,
                    ease: "power2.out",
                    delay: 0.2,
                },
            );

            gsap.to($1(".hero-img-wrap img"), {
                yPercent: 12,
                ease: "none",
                scrollTrigger: {
                    trigger: $1(".hero-section"),
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            });

            // ── SECTION REVEALS ─────────────────────────────────
            $(".article-block").forEach((block) => {
                gsap.fromTo(
                    block,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: block,
                            start: "top 80%",
                        },
                    },
                );
            });

            // ── SPLIT-SCREEN SECTIONS ───────────────────────────
            $(".split-text-left").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 70%",
                        },
                    },
                );
            });

            $(".split-img-right").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 70%",
                        },
                    },
                );
            });

            $(".split-text-right").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 70%",
                        },
                    },
                );
            });

            $(".split-img-left").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 70%",
                        },
                    },
                );
            });

            // ── PULL QUOTES ─────────────────────────────────────
            $(".pull-quote-block").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, scale: 0.96 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.9,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: quote,
                            start: "top 80%",
                        },
                    },
                );
            });

            // ── INLINE IMAGES ───────────────────────────────────
            $(".inline-image").forEach((imgEl) => {
                gsap.fromTo(
                    imgEl,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: imgEl,
                            start: "top 85%",
                        },
                    },
                );

                // Parallax on the actual image inside
                const innerImg = imgEl.querySelector("img");
                if (innerImg) {
                    gsap.to(innerImg, {
                        yPercent: 10,
                        ease: "none",
                        scrollTrigger: {
                            trigger: imgEl,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        },
                    });
                }
            });

            // ── STATS BAR ──────────────────────────────────────
            gsap.fromTo(
                $(".stat-item"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".stats-bar"),
                        start: "top 85%",
                    },
                },
            );

            // ── CTA ─────────────────────────────────────────────
            gsap.fromTo(
                $1(".final-cta-content"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".final-cta"),
                        start: "top 80%",
                    },
                },
            );
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="overflow-hidden">
            {/* ═══════════════════════════════════════════════════════
                HERO — Split-screen 60/40 with diagonal clip
               ═══════════════════════════════════════════════════════ */}
            <section className="hero-section relative min-h-[92vh] flex items-center bg-base-100">
                {/* Right image panel -- sits behind on mobile, 40% on desktop */}
                <div
                    className="hero-img-wrap absolute inset-0 lg:left-[58%] opacity-0"
                    style={{
                        clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                >
                    <img
                        src={img.hero}
                        alt="Team collaboration in modern office"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral/60 lg:bg-neutral/20"></div>
                </div>

                {/* Content panel -- 60% on desktop */}
                <div className="relative z-10 container mx-auto px-6 lg:px-12 py-28">
                    <div className="max-w-2xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6 opacity-0">
                            <i className="fa-duotone fa-regular fa-newspaper mr-2"></i>
                            {meta.category}
                        </p>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="hero-headline-word inline-block opacity-0 text-base-content lg:text-base-content">
                                The Future
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-base-content lg:text-base-content">
                                of
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-primary">
                                Recruiting.
                            </span>
                        </h1>

                        <p className="hero-subtitle text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl mb-8 opacity-0">
                            {meta.subtitle}
                        </p>

                        <div className="flex flex-wrap items-center gap-6">
                            <span className="hero-meta-item text-xs uppercase tracking-[0.15em] text-base-content/50 opacity-0">
                                <i className="fa-duotone fa-regular fa-user-pen mr-1"></i>
                                {meta.author}
                            </span>
                            <span className="hero-meta-item text-xs uppercase tracking-[0.15em] text-base-content/50 opacity-0">
                                <i className="fa-duotone fa-regular fa-calendar mr-1"></i>
                                {meta.date}
                            </span>
                            <span className="hero-meta-item text-xs uppercase tracking-[0.15em] text-base-content/50 opacity-0">
                                <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                {meta.readTime}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FULL-BLEED HERO IMAGE
               ═══════════════════════════════════════════════════════ */}
            <section className="inline-image relative h-[40vh] md:h-[50vh] overflow-hidden opacity-0">
                <img
                    src={img.hero}
                    alt="Modern recruiting collaboration"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/50"></div>
                <div className="absolute bottom-6 left-6 lg:left-12">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                        The recruiting industry stands at a crossroads
                    </span>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 1 — The Broken Status Quo
                Split-screen editorial (60 text / 40 image)
               ═══════════════════════════════════════════════════════ */}
            <section className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                        {/* Text -- 3 of 5 columns (60%) */}
                        <div className="split-text-left lg:col-span-3 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-error mb-4">
                                01 -- The Industry Problem
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                Recruiting is broken
                                <br />
                                for everyone.
                            </h2>
                            <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                                <p>
                                    For decades, the recruiting industry has operated on a model
                                    built for a different era. Individual recruiters work in
                                    silos, maintaining their own networks and databases.
                                    Companies engage multiple agencies under separate contracts,
                                    each with different terms and visibility levels. Candidates
                                    submit applications into black holes, rarely hearing back.
                                </p>
                                <p>
                                    The result is an ecosystem defined by fragmentation.
                                    Recruiters spend more time on administration than actual
                                    recruiting. Companies lack visibility into their hiring
                                    pipelines. And candidates -- the people the entire industry
                                    is supposed to serve -- are left in the dark.
                                </p>
                                <p>
                                    The numbers paint a clear picture: the average
                                    time-to-fill for a professional role has grown to 44 days.
                                    Recruiter burnout rates hover near 50%. And over 60% of
                                    candidates report being ghosted after at least one
                                    interview. The system is not just inefficient -- it is
                                    fundamentally broken.
                                </p>
                            </div>
                        </div>

                        {/* Image -- 2 of 5 columns (40%) */}
                        <div className="split-img-right lg:col-span-2 opacity-0">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src={img.collaboration}
                                    alt="Team working together"
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-error/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                PULL QUOTE 1
               ═══════════════════════════════════════════════════════ */}
            <section className="pull-quote-block py-20 bg-neutral text-neutral-content opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="border-l-4 border-secondary pl-8 lg:pl-12">
                            <i className="fa-duotone fa-regular fa-quote-left text-4xl text-secondary/30 mb-6 block"></i>
                            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                                &ldquo;The recruiting industry is the last
                                major professional services sector to resist
                                structural collaboration.&rdquo;
                            </blockquote>
                            <cite className="text-sm uppercase tracking-[0.2em] text-neutral-content/50 not-italic">
                                -- Industry Analysis, 2025
                            </cite>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 2 — What Are Split-Fee Models?
                Article body block
               ═══════════════════════════════════════════════════════ */}
            <section className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            02 -- The Model
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            What are split-fee models?
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                Split-fee recruiting is a partnership model where two or more
                                recruiters collaborate on a single placement and share the
                                resulting fee. One recruiter typically holds the job order --
                                the &ldquo;job side&rdquo; -- while another sources and
                                submits candidates -- the &ldquo;candidate side.&rdquo; When
                                a placement is made, the fee is divided according to
                                pre-agreed terms.
                            </p>
                            <p>
                                The concept is not new. Split-fee networks have existed since
                                the 1970s. But historically, they were run through loose
                                associations, phone calls, and handshake agreements. The lack
                                of infrastructure meant disputes were common, transparency
                                was nonexistent, and scaling beyond a handful of trusted
                                partners was impractical.
                            </p>
                            <p>
                                What has changed is technology. Modern split-fee platforms
                                provide the infrastructure that makes collaboration reliable
                                at scale: clear terms set upfront, automated tracking,
                                transparent pipelines, and guaranteed payouts. The split-fee
                                model has finally caught up to its potential.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                INLINE IMAGE — Dashboard / Technology
               ═══════════════════════════════════════════════════════ */}
            <section className="inline-image relative h-[35vh] md:h-[45vh] overflow-hidden opacity-0">
                <img
                    src={img.dashboard}
                    alt="Data analytics and technology platform"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/50"></div>
                <div className="absolute bottom-6 left-6 lg:left-12">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                        Platform technology enables transparent collaboration at scale
                    </span>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 3 — Why Split-Fee Is Growing
                Split-screen editorial (40 image / 60 text)
               ═══════════════════════════════════════════════════════ */}
            <section className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                        {/* Image -- 2 of 5 columns (40%) */}
                        <div className="split-img-left lg:col-span-2 opacity-0">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(0 0, 92% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src={img.handshake}
                                    alt="Professional handshake"
                                    className="w-full h-[520px] object-cover"
                                />
                            </div>
                        </div>

                        {/* Text -- 3 of 5 columns (60%) */}
                        <div className="split-text-right lg:col-span-3 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                03 -- The Growth
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                Why split-fee
                                <br />
                                is growing.
                            </h2>
                            <p className="text-lg text-base-content/70 leading-relaxed mb-10 max-w-lg">
                                The split-fee model addresses fundamental structural
                                problems in recruiting. Four forces are driving adoption
                                across the industry.
                            </p>

                            <div className="space-y-6">
                                {[
                                    {
                                        icon: "fa-duotone fa-regular fa-globe",
                                        title: "Expanded Reach",
                                        body: "Solo recruiters access enterprise-level roles they could never touch alone. Partnering on the fee opens larger markets.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-shield-check",
                                        title: "Reduced Risk",
                                        body: "Companies diversify their sourcing pipeline. Instead of one recruiter, they activate an entire network simultaneously.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-bullseye-arrow",
                                        title: "Specialization",
                                        body: "One partner sources, another closes. Each recruiter contributes their strongest skill to the placement.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-bolt",
                                        title: "Faster Placements",
                                        body: "More eyes on a role means faster candidate flow. Split-fee placements fill 3x faster than traditional solo approaches.",
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-10 h-10 flex-shrink-0 bg-primary/10 flex items-center justify-center">
                                            <i
                                                className={`${item.icon} text-primary`}
                                            ></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-base-content/60 leading-relaxed">
                                                {item.body}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                PULL QUOTE 2
               ═══════════════════════════════════════════════════════ */}
            <section className="pull-quote-block py-20 bg-primary text-primary-content opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <i className="fa-duotone fa-regular fa-quote-left text-4xl text-primary-content/20 mb-6 block"></i>
                        <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                            &ldquo;Split-fee is not about splitting your
                            earnings. It is about multiplying your
                            opportunities.&rdquo;
                        </blockquote>
                        <cite className="text-sm uppercase tracking-[0.2em] text-primary-content/50 not-italic">
                            -- Senior Recruiter, Splits Network Member
                        </cite>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                STATS BAR — Key metrics
               ═══════════════════════════════════════════════════════ */}
            <section className="stats-bar bg-neutral text-neutral-content py-10">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {[
                            { value: "73%", label: "Higher Recruiter Earnings" },
                            { value: "3x", label: "Faster Time-to-Fill" },
                            { value: "40%", label: "Less Admin Overhead" },
                            { value: "92%", label: "Partner Satisfaction" },
                        ].map((stat, i) => (
                            <div key={i} className="stat-item opacity-0">
                                <div className="text-3xl md:text-4xl font-black tracking-tight">
                                    {stat.value}
                                </div>
                                <div className="text-sm uppercase tracking-wider opacity-70 mt-1">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 4 — Technology as the Catalyst
                Article body block
               ═══════════════════════════════════════════════════════ */}
            <section className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            04 -- The Catalyst
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Technology changes
                            <br />
                            the equation.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                The split-fee concept existed for decades without gaining
                                mainstream traction. The missing ingredient was
                                infrastructure. Without a reliable platform to manage
                                agreements, track candidates, and process payouts, the
                                friction cost of collaboration outweighed the benefits.
                            </p>
                            <p>
                                Modern platforms like Splits Network have changed this
                                equation fundamentally. They provide an integrated
                                environment where terms are set upfront, every candidate
                                submission is tracked, pipeline visibility is shared in
                                real time, and payouts are automated upon placement
                                confirmation.
                            </p>
                            <p>
                                The technology layer does more than reduce friction -- it
                                creates trust. When every interaction is logged, every
                                agreement is documented, and every payout is guaranteed,
                                recruiters can collaborate with partners they have never
                                met. The platform becomes the trust layer.
                            </p>
                            <p>
                                AI-powered matching further accelerates the model. Instead
                                of manually searching for the right partner or candidate,
                                algorithms surface optimal matches based on
                                specialization, track record, and real-time availability.
                                The result is faster placements with higher quality
                                matches.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                INLINE IMAGE — Handshake
               ═══════════════════════════════════════════════════════ */}
            <section className="inline-image relative h-[35vh] md:h-[45vh] overflow-hidden opacity-0">
                <img
                    src={img.handshake}
                    alt="Partnership and collaboration"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/50"></div>
                <div className="absolute bottom-6 left-6 lg:left-12">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                        Trust is the foundation of every successful split-fee partnership
                    </span>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 5 — The Data Speaks
                Split-screen editorial (60 text / 40 image)
               ═══════════════════════════════════════════════════════ */}
            <section className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                        {/* Text -- 3 of 5 columns (60%) */}
                        <div className="split-text-left lg:col-span-3 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                                05 -- The Evidence
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                The data speaks
                                <br />
                                for itself.
                            </h2>
                            <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                                <p>
                                    The impact of platform-enabled split-fee recruiting is
                                    measurable across every key metric. Recruiters earn more
                                    because they access roles beyond their individual network.
                                    Companies fill faster because they activate an entire
                                    community of specialists. And candidates get better outcomes
                                    because multiple recruiters are advocating for them
                                    simultaneously.
                                </p>
                                <p>
                                    The 92% partner satisfaction rate is particularly
                                    significant. It suggests that once recruiters experience the
                                    split-fee model on a modern platform, they do not go back
                                    to working solo. The collaborative model becomes the default
                                    operating mode.
                                </p>
                                <p>
                                    These numbers represent a structural shift, not a marginal
                                    improvement. The split-fee market was valued at $4.7 billion
                                    in 2025 and is projected to more than double by 2030 as
                                    platform adoption accelerates across every vertical.
                                </p>
                            </div>
                        </div>

                        {/* Image -- 2 of 5 columns (40%) */}
                        <div className="split-img-right lg:col-span-2 opacity-0">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src={img.dashboard}
                                    alt="Analytics dashboard"
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-secondary/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                PULL QUOTE 3
               ═══════════════════════════════════════════════════════ */}
            <section className="pull-quote-block py-20 bg-neutral text-neutral-content opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="border-l-4 border-secondary pl-8 lg:pl-12">
                            <i className="fa-duotone fa-regular fa-quote-left text-4xl text-secondary/30 mb-6 block"></i>
                            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                                &ldquo;The platform is the trust layer. When
                                everything is tracked and transparent,
                                collaboration becomes effortless.&rdquo;
                            </blockquote>
                            <cite className="text-sm uppercase tracking-[0.2em] text-neutral-content/50 not-italic">
                                -- Hiring Manager, Enterprise Client
                            </cite>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 6 — What This Means for You
                Article body block
               ═══════════════════════════════════════════════════════ */}
            <section className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            06 -- The Takeaway
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            What this means
                            <br />
                            for you.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                <strong className="text-base-content font-bold">
                                    If you are a recruiter:
                                </strong>{" "}
                                The split-fee model gives you access to roles and markets
                                that would take years to build on your own. You keep doing
                                what you do best -- sourcing, screening, advocating -- while
                                partnering with others who complement your strengths. The
                                administrative burden disappears when the platform handles
                                terms, tracking, and payments.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    If you are a company:
                                </strong>{" "}
                                Instead of managing a dozen recruiter contracts with different
                                terms, you post a role once and activate an entire network.
                                Every recruiter working your role operates under the same
                                terms. You see every candidate, every submission, every status
                                update in one pipeline. And you only pay when someone starts.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    If you are a candidate:
                                </strong>{" "}
                                The split-fee model means more recruiters are aware of your
                                profile and actively advocating for you. You get matched with
                                specialists in your field. You receive real communication and
                                feedback. And because the platform tracks everything, you
                                never get ghosted again.
                            </p>
                            <p>
                                The future of recruiting is collaborative, transparent, and
                                platform-enabled. The split-fee model is not a niche strategy
                                anymore -- it is becoming the industry standard. The only
                                question is whether you will be part of building it.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FULL-BLEED IMAGE BREAK
               ═══════════════════════════════════════════════════════ */}
            <section className="inline-image relative h-[40vh] md:h-[50vh] overflow-hidden opacity-0">
                <img
                    src={img.collaboration}
                    alt="Team collaborating on the future of recruiting"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/70 flex items-center justify-center">
                    <p className="text-4xl md:text-5xl lg:text-6xl font-black text-white text-center leading-[0.95] tracking-tight px-6">
                        The future of recruiting
                        <br />
                        <span className="text-secondary">is collaborative.</span>
                    </p>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FINAL CTA
               ═══════════════════════════════════════════════════════ */}
            <section className="final-cta py-28 bg-primary text-primary-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="final-cta-content max-w-4xl mx-auto text-center opacity-0">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                            Ready to transform
                            <br />
                            how you recruit?
                        </h2>
                        <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Join the ecosystem that is making recruiting work
                            for everyone. Get started in minutes.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Join Splits Network
                            </a>
                            <a
                                href="https://applicant.network/sign-up"
                                className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus"></i>
                                Create Candidate Profile
                            </a>
                        </div>

                        <p className="text-sm opacity-60">
                            Questions?{" "}
                            <a
                                href="mailto:hello@employment-networks.com"
                                className="underline hover:opacity-100 transition-opacity"
                            >
                                hello@employment-networks.com
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
