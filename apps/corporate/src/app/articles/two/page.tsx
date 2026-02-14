"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ──────────────────────────────────────────────────────────────────── */

const articleMeta = {
    title: "The Future of Recruiting: How Split-Fee Models Are Changing The Industry",
    subtitle: "Inside the shift from siloed recruiting to networked collaboration",
    date: "February 14, 2026",
    readTime: "12 min read",
    author: "Employment Networks Editorial",
    category: "Industry Analysis",
};

const stats = [
    { value: "73%", label: "Higher Recruiter Earnings" },
    { value: "3x", label: "Faster Time-to-Fill" },
    { value: "40%", label: "Less Admin Overhead" },
    { value: "$4.7B", label: "Split-Fee Market Size" },
];

const sections = [
    { number: "01", title: "The Broken Status Quo" },
    { number: "02", title: "What Are Split-Fee Models?" },
    { number: "03", title: "Why Split-Fee Is Growing" },
    { number: "04", title: "Technology as the Catalyst" },
    { number: "05", title: "The Data Speaks" },
    { number: "06", title: "What This Means for You" },
];

const growthDrivers = [
    {
        icon: "fa-duotone fa-regular fa-globe",
        title: "Expanded Reach",
        text: "Solo recruiters access enterprise-level roles they could never touch alone. By partnering on the fee, they gain entry into larger markets and higher-value placements.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Reduced Risk",
        text: "Companies diversify their sourcing pipeline. Instead of relying on one recruiter, they tap an entire network of specialists simultaneously.",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Deep Specialization",
        text: "Recruiters focus on what they do best. One partner sources, another closes. Each contributes their strongest skill to the placement.",
    },
    {
        icon: "fa-duotone fa-regular fa-bolt",
        title: "Faster Placements",
        text: "More eyes on a role means faster candidate flow. Data shows split-fee placements fill 3x faster than traditional solo approaches.",
    },
];

const impactMetrics = [
    { value: 73, suffix: "%", label: "Higher Recruiter Earnings", description: "compared to solo placements" },
    { value: 3, suffix: "x", label: "Faster Time-to-Fill", description: "versus single-agency search" },
    { value: 40, suffix: "%", label: "Less Admin Overhead", description: "with platform automation" },
    { value: 92, suffix: "%", label: "Partner Satisfaction", description: "among active split-fee users" },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */

export default function ArticleTwoPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            // Hero text stagger
            gsap.from("[data-hero-text]", {
                y: 60,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: "power3.out",
            });

            // Hero image parallax
            gsap.to("[data-hero-image]", {
                yPercent: 15,
                ease: "none",
                scrollTrigger: {
                    trigger: "[data-hero-image]",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });

            // Stats reveal
            gsap.from("[data-stat]", {
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-stats]",
                    start: "top 80%",
                },
            });

            // Table of contents items
            gsap.from("[data-toc-item]", {
                x: -30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-toc]",
                    start: "top 80%",
                },
            });

            // Article sections - staggered reveal
            document.querySelectorAll("[data-article-section]").forEach((el) => {
                gsap.from(el.querySelectorAll("[data-section-text]"), {
                    y: 30,
                    opacity: 0,
                    duration: 0.9,
                    stagger: 0.12,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 75%",
                    },
                });
            });

            // Pull quotes
            document.querySelectorAll("[data-pull-quote]").forEach((el) => {
                gsap.from(el, {
                    x: -30,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                    },
                });
            });

            // Full-bleed images parallax
            document.querySelectorAll("[data-parallax-image]").forEach((img) => {
                gsap.to(img, {
                    yPercent: -8,
                    ease: "none",
                    scrollTrigger: {
                        trigger: img.closest("[data-image-section]"),
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    },
                });
            });

            // Growth driver cards
            gsap.from("[data-driver-card]", {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-drivers]",
                    start: "top 75%",
                },
            });

            // Impact metrics
            gsap.from("[data-impact-cell]", {
                y: 40,
                opacity: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-impact]",
                    start: "top 80%",
                },
            });

            // Counter animations
            document.querySelectorAll("[data-counter]").forEach((el, i) => {
                const target = parseInt(el.getAttribute("data-value") || "0", 10);
                const suffix = el.getAttribute("data-suffix") || "";
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: 2,
                        ease: "power3.out",
                        delay: 0.2 + i * 0.1,
                        scrollTrigger: {
                            trigger: "[data-impact]",
                            start: "top 80%",
                        },
                        onUpdate: function () {
                            const current = Math.floor(this.targets()[0].value);
                            (el as HTMLElement).textContent = current + suffix;
                        },
                    },
                );
            });

            // Divider lines draw-in
            gsap.utils.toArray<HTMLElement>("[data-divider]").forEach((line) => {
                gsap.from(line, {
                    scaleX: 0,
                    transformOrigin: "left center",
                    duration: 1,
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: line,
                        start: "top 90%",
                    },
                });
            });

            // CTA reveal
            gsap.from("[data-cta-content]", {
                y: 40,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: "[data-cta]",
                    start: "top 80%",
                },
            });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="overflow-hidden">
            {/* ─── Hero ────────────────────────────────────────────────────── */}
            <section className="relative min-h-[90vh] flex items-end pb-16 md:pb-24">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div data-hero-image className="w-full h-[120%] -mt-[10%]">
                        <img
                            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80&auto=format&fit=crop"
                            alt="Team collaboration in modern recruiting office"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-neutral opacity-70" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
                    <div className="max-w-4xl">
                        <p
                            data-hero-text
                            className="text-sm uppercase tracking-[0.3em] text-base-300 mb-4 font-medium"
                        >
                            {articleMeta.category}
                        </p>
                        <h1
                            data-hero-text
                            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.95] tracking-tight mb-6"
                        >
                            {articleMeta.title}
                        </h1>
                        <p
                            data-hero-text
                            className="text-lg md:text-xl text-base-300 max-w-2xl leading-relaxed mb-8"
                        >
                            {articleMeta.subtitle}
                        </p>
                        <div data-hero-text className="flex flex-wrap gap-6 items-center text-sm text-base-300/70 uppercase tracking-[0.15em]">
                            <span>{articleMeta.date}</span>
                            <span className="w-1 h-1 bg-base-300/40 rounded-full" />
                            <span>{articleMeta.readTime}</span>
                            <span className="w-1 h-1 bg-base-300/40 rounded-full" />
                            <span>{articleMeta.author}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Stats Bar ───────────────────────────────────────────────── */}
            <section data-stats className="bg-base-200 py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {stats.map((stat) => (
                            <div key={stat.label} data-stat className="text-center">
                                <p className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-sm uppercase tracking-[0.2em] text-base-content/60 mt-2">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Table of Contents ───────────────────────────────────────── */}
            <section data-toc className="py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-2">
                                Contents
                            </p>
                            <h2 className="text-2xl font-bold text-base-content tracking-tight">
                                In This Article
                            </h2>
                        </div>
                        <div className="lg:col-span-3">
                            {sections.map((section) => (
                                <div
                                    key={section.number}
                                    data-toc-item
                                    className="flex items-baseline gap-6 py-4 border-b border-base-300 group cursor-default"
                                >
                                    <span className="text-sm font-bold text-base-content/20 group-hover:text-secondary transition-colors w-8 shrink-0">
                                        {section.number}
                                    </span>
                                    <span className="text-lg font-semibold text-base-content group-hover:text-secondary transition-colors">
                                        {section.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div data-divider className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="h-px bg-base-300" />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                Section 01 - The Broken Status Quo
               ═══════════════════════════════════════════════════════════════ */}
            <section data-article-section className="py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        <div>
                            <span data-section-text className="text-xs uppercase tracking-[0.3em] text-secondary font-medium">
                                Section 01
                            </span>
                        </div>
                        <div className="lg:col-span-3 max-w-3xl">
                            <h2 data-section-text className="text-3xl md:text-4xl font-bold text-base-content tracking-tight leading-tight mb-8">
                                The Broken Status Quo
                            </h2>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed mb-6">
                                For decades, the recruiting industry has operated on a model built for a
                                different era. Individual recruiters work in silos, maintaining their own
                                networks and databases. Companies engage multiple agencies under separate
                                contracts, each with different terms and visibility levels. Candidates
                                submit applications into black holes, rarely hearing back.
                            </p>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed mb-6">
                                The result is an ecosystem defined by fragmentation. Recruiters spend
                                more time on administration than actual recruiting. Companies lack
                                visibility into their hiring pipelines. And candidates -- the people
                                the entire industry is supposed to serve -- are left in the dark.
                            </p>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed">
                                The numbers paint a clear picture: the average time-to-fill for a
                                professional role has grown to 44 days. Recruiter burnout rates hover
                                near 50%. And over 60% of candidates report being ghosted after at
                                least one interview. The system is not just inefficient -- it is
                                fundamentally broken.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Pull Quote 1 ────────────────────────────────────────────── */}
            <section className="bg-neutral text-neutral-content py-20 md:py-24">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <blockquote data-pull-quote className="max-w-4xl mx-auto">
                        <div className="border-l-4 border-secondary pl-8 md:pl-12">
                            <p className="text-2xl md:text-4xl font-bold leading-snug tracking-tight mb-6">
                                &ldquo;The recruiting industry is the last major professional
                                services sector to resist structural collaboration.&rdquo;
                            </p>
                            <cite className="text-sm text-neutral-content/50 not-italic uppercase tracking-[0.2em]">
                                Industry Analysis, 2025
                            </cite>
                        </div>
                    </blockquote>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                Section 02 - What Are Split-Fee Models?
               ═══════════════════════════════════════════════════════════════ */}
            <section data-article-section className="py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        <div>
                            <span data-section-text className="text-xs uppercase tracking-[0.3em] text-secondary font-medium">
                                Section 02
                            </span>
                        </div>
                        <div className="lg:col-span-3 max-w-3xl">
                            <h2 data-section-text className="text-3xl md:text-4xl font-bold text-base-content tracking-tight leading-tight mb-8">
                                What Are Split-Fee Models?
                            </h2>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed mb-6">
                                Split-fee recruiting is a partnership model where two or more recruiters
                                collaborate on a single placement and share the resulting fee. One
                                recruiter typically holds the job order (the &ldquo;job side&rdquo;),
                                while another sources and submits candidates (the
                                &ldquo;candidate side&rdquo;). When a placement is made, the fee is
                                divided according to pre-agreed terms.
                            </p>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed mb-6">
                                The concept is not new -- split-fee networks have existed since the
                                1970s. But historically, they were run through loose associations,
                                phone calls, and handshake agreements. The lack of infrastructure
                                meant disputes were common, transparency was nonexistent, and
                                scaling beyond a handful of trusted partners was impractical.
                            </p>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed">
                                What has changed is technology. Modern split-fee platforms provide
                                the infrastructure that makes collaboration reliable at scale:
                                clear terms set upfront, automated tracking, transparent pipelines,
                                and guaranteed payouts. The split-fee model has finally caught up
                                to its potential.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Full-Bleed Image Break ──────────────────────────────────── */}
            <section data-image-section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
                <div data-parallax-image className="absolute inset-0 -top-[8%] -bottom-[8%]">
                    <img
                        src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&q=80&auto=format&fit=crop"
                        alt="Digital dashboard and analytics"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-neutral opacity-40" />
                <div className="absolute bottom-8 left-8 md:left-12">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/80 font-medium">
                        Platform technology enables transparent collaboration at scale
                    </p>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                Section 03 - Why Split-Fee Is Growing
               ═══════════════════════════════════════════════════════════════ */}
            <section data-article-section className="py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
                        <div>
                            <span data-section-text className="text-xs uppercase tracking-[0.3em] text-secondary font-medium">
                                Section 03
                            </span>
                        </div>
                        <div className="lg:col-span-3 max-w-3xl">
                            <h2 data-section-text className="text-3xl md:text-4xl font-bold text-base-content tracking-tight leading-tight mb-8">
                                Why Split-Fee Is Growing
                            </h2>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed">
                                The split-fee model addresses fundamental structural problems in
                                recruiting. Here are four reasons adoption is accelerating across
                                the industry.
                            </p>
                        </div>
                    </div>

                    <div data-divider className="h-px bg-base-300 mb-16" />

                    {/* Driver cards */}
                    <div data-drivers className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-5xl mx-auto lg:ml-[25%]">
                        {growthDrivers.map((driver) => (
                            <div key={driver.title} data-driver-card>
                                <i className={`${driver.icon} text-secondary text-2xl mb-5 block`} />
                                <h3 className="text-xl font-bold text-base-content mb-3">
                                    {driver.title}
                                </h3>
                                <p className="text-base-content/60 leading-relaxed">
                                    {driver.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Pull Quote 2 ────────────────────────────────────────────── */}
            <section className="py-20 md:py-24">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <blockquote data-pull-quote className="max-w-4xl mx-auto">
                        <div className="border-l-4 border-secondary pl-8 md:pl-12">
                            <p className="text-2xl md:text-4xl font-bold text-base-content leading-snug tracking-tight mb-6">
                                &ldquo;Split-fee is not about splitting your earnings.
                                It is about multiplying your opportunities.&rdquo;
                            </p>
                            <cite className="text-sm text-base-content/50 not-italic uppercase tracking-[0.2em]">
                                Senior Recruiter, Splits Network Member
                            </cite>
                        </div>
                    </blockquote>
                </div>
            </section>

            <div data-divider className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="h-px bg-base-300" />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                Section 04 - Technology as the Catalyst
               ═══════════════════════════════════════════════════════════════ */}
            <section data-article-section className="py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        <div>
                            <span data-section-text className="text-xs uppercase tracking-[0.3em] text-secondary font-medium">
                                Section 04
                            </span>
                        </div>
                        <div className="lg:col-span-3 max-w-3xl">
                            <h2 data-section-text className="text-3xl md:text-4xl font-bold text-base-content tracking-tight leading-tight mb-8">
                                Technology as the Catalyst
                            </h2>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed mb-6">
                                The split-fee concept existed for decades without gaining
                                mainstream traction. The missing ingredient was infrastructure.
                                Without a reliable platform to manage agreements, track candidates,
                                and process payouts, the friction cost of collaboration outweighed
                                the benefits.
                            </p>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed mb-6">
                                Modern platforms like Splits Network have changed this equation
                                fundamentally. They provide an integrated environment where terms
                                are set upfront, every candidate submission is tracked, pipeline
                                visibility is shared in real time, and payouts are automated upon
                                placement confirmation.
                            </p>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed mb-6">
                                The technology layer does more than reduce friction -- it creates
                                trust. When every interaction is logged, every agreement is
                                documented, and every payout is guaranteed, recruiters can
                                collaborate with partners they have never met. The platform
                                becomes the trust layer.
                            </p>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed">
                                AI-powered matching further accelerates the model. Instead of
                                manually searching for the right partner or candidate, algorithms
                                surface optimal matches based on specialization, track record,
                                and real-time availability. The result is faster placements with
                                higher quality matches.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Full-Bleed Image Break ──────────────────────────────────── */}
            <section data-image-section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
                <div data-parallax-image className="absolute inset-0 -top-[8%] -bottom-[8%]">
                    <img
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80&auto=format&fit=crop"
                        alt="Data analytics and metrics dashboard"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-neutral opacity-40" />
                <div className="absolute bottom-8 left-8 md:left-12">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/80 font-medium">
                        Data-driven recruiting replaces intuition with evidence
                    </p>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                Section 05 - The Data Speaks
               ═══════════════════════════════════════════════════════════════ */}
            <section data-article-section className="py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
                        <div>
                            <span data-section-text className="text-xs uppercase tracking-[0.3em] text-secondary font-medium">
                                Section 05
                            </span>
                        </div>
                        <div className="lg:col-span-3 max-w-3xl">
                            <h2 data-section-text className="text-3xl md:text-4xl font-bold text-base-content tracking-tight leading-tight mb-8">
                                The Data Speaks
                            </h2>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed">
                                The impact of platform-enabled split-fee recruiting is measurable
                                across every key metric. The following data reflects aggregate
                                performance across active platform users.
                            </p>
                        </div>
                    </div>

                    {/* Impact metrics grid */}
                    <div data-impact className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto lg:ml-[25%] mb-16">
                        {impactMetrics.map((metric) => (
                            <div key={metric.label} data-impact-cell className="text-center">
                                <p
                                    data-counter
                                    data-value={metric.value}
                                    data-suffix={metric.suffix}
                                    className="text-4xl md:text-5xl font-bold text-primary tracking-tight"
                                >
                                    0{metric.suffix}
                                </p>
                                <p className="text-sm uppercase tracking-[0.2em] text-base-content/60 mt-2">
                                    {metric.label}
                                </p>
                                <p className="text-xs text-base-content/40 mt-1">
                                    {metric.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div data-divider className="h-px bg-base-300 mb-16" />

                    {/* Continuation text */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        <div className="hidden lg:block" />
                        <div className="lg:col-span-3 max-w-3xl" data-article-section>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed mb-6">
                                These numbers represent a structural shift, not a marginal
                                improvement. Recruiters earn more because they access roles
                                beyond their individual network. Companies fill faster because
                                they activate an entire community of specialists. And candidates
                                get better outcomes because multiple recruiters are advocating
                                for them simultaneously.
                            </p>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed">
                                The 92% partner satisfaction rate is particularly significant.
                                It suggests that once recruiters experience the split-fee model
                                on a modern platform, they do not go back to working solo. The
                                collaborative model becomes the default operating mode.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Pull Quote 3 ────────────────────────────────────────────── */}
            <section className="bg-neutral text-neutral-content py-20 md:py-24">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <blockquote data-pull-quote className="max-w-4xl mx-auto">
                        <div className="border-l-4 border-secondary pl-8 md:pl-12">
                            <p className="text-2xl md:text-4xl font-bold leading-snug tracking-tight mb-6">
                                &ldquo;The platform is the trust layer. When everything
                                is tracked and transparent, collaboration becomes
                                effortless.&rdquo;
                            </p>
                            <cite className="text-sm text-neutral-content/50 not-italic uppercase tracking-[0.2em]">
                                Hiring Manager, Enterprise Client
                            </cite>
                        </div>
                    </blockquote>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                Section 06 - What This Means for You
               ═══════════════════════════════════════════════════════════════ */}
            <section data-article-section className="py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        <div>
                            <span data-section-text className="text-xs uppercase tracking-[0.3em] text-secondary font-medium">
                                Section 06
                            </span>
                        </div>
                        <div className="lg:col-span-3 max-w-3xl">
                            <h2 data-section-text className="text-3xl md:text-4xl font-bold text-base-content tracking-tight leading-tight mb-8">
                                What This Means for You
                            </h2>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed mb-6">
                                <strong className="text-base-content font-semibold">If you are a recruiter:</strong>{" "}
                                The split-fee model gives you access to roles and markets that
                                would take years to build on your own. You keep doing what you
                                do best -- sourcing, screening, advocating -- while partnering
                                with others who complement your strengths. The administrative
                                burden disappears when the platform handles terms, tracking,
                                and payments.
                            </p>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed mb-6">
                                <strong className="text-base-content font-semibold">If you are a company:</strong>{" "}
                                Instead of managing a dozen recruiter contracts with different
                                terms, you post a role once and activate an entire network.
                                Every recruiter working your role operates under the same terms.
                                You see every candidate, every submission, every status update
                                in one pipeline. And you only pay when someone starts.
                            </p>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed mb-6">
                                <strong className="text-base-content font-semibold">If you are a candidate:</strong>{" "}
                                The split-fee model means more recruiters are aware of your
                                profile and actively advocating for you. You get matched with
                                specialists in your field. You receive real communication and
                                feedback. And because the platform tracks everything, you never
                                get ghosted again.
                            </p>
                            <p data-section-text className="text-lg text-base-content/70 leading-relaxed">
                                The future of recruiting is collaborative, transparent, and
                                platform-enabled. The split-fee model is not a niche strategy
                                anymore -- it is becoming the industry standard. The only
                                question is whether you will be part of building it.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Article Footer / Tags ───────────────────────────────────── */}
            <section className="bg-base-200 py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                        <p className="text-xs uppercase tracking-[0.3em] text-base-content/40 font-medium">
                            Tags
                        </p>
                        <div className="lg:col-span-3 flex flex-wrap gap-3">
                            {["Split-Fee", "Recruiting", "Marketplace", "Technology", "Collaboration", "Industry Trends"].map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs uppercase tracking-[0.15em] text-base-content/50 border border-base-300 px-4 py-2 hover:border-secondary hover:text-secondary transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-base-300 my-8" />

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <p className="text-xs uppercase tracking-[0.3em] text-base-content/40 font-medium">
                            Published
                        </p>
                        <div className="lg:col-span-3 flex flex-wrap gap-10">
                            <div>
                                <span className="text-xs uppercase tracking-[0.15em] text-base-content/40 block mb-1">Date</span>
                                <span className="text-sm font-semibold">{articleMeta.date}</span>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-[0.15em] text-base-content/40 block mb-1">Author</span>
                                <span className="text-sm font-semibold">{articleMeta.author}</span>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-[0.15em] text-base-content/40 block mb-1">Reading Time</span>
                                <span className="text-sm font-semibold">{articleMeta.readTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Full-Bleed Image Break ──────────────────────────────────── */}
            <section data-image-section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
                <div data-parallax-image className="absolute inset-0 -top-[8%] -bottom-[8%]">
                    <img
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80&auto=format&fit=crop"
                        alt="Diverse team collaborating in a bright workspace"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-primary opacity-20" />
            </section>

            {/* ─── Final CTA ───────────────────────────────────────────────── */}
            <section data-cta className="bg-primary text-primary-content py-24 md:py-32">
                <div data-cta-content className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-primary-content/60 font-medium mb-6">
                        Join the Movement
                    </p>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
                        Be part of the future
                        <br />
                        of recruiting.
                    </h2>
                    <p className="text-xl text-primary-content/80 max-w-2xl mx-auto leading-relaxed mb-10">
                        Join thousands of recruiters and hiring teams who have already
                        made the shift to transparent, collaborative recruiting.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <a
                            href="https://splits.network/sign-up"
                            className="btn btn-secondary btn-lg text-base font-semibold px-10"
                        >
                            <i className="fa-duotone fa-regular fa-user-tie mr-2" />
                            Recruiter Sign Up
                        </a>
                        <a
                            href="https://applicant.network/sign-up"
                            className="btn btn-ghost btn-lg text-base font-semibold px-10 border border-primary-content/30 text-primary-content hover:bg-primary-content/10"
                        >
                            <i className="fa-duotone fa-regular fa-user mr-2" />
                            Candidate Sign Up
                        </a>
                        <a
                            href="https://splits.network/sign-up"
                            className="btn btn-ghost btn-lg text-base font-semibold px-10 border border-primary-content/30 text-primary-content hover:bg-primary-content/10"
                        >
                            <i className="fa-duotone fa-regular fa-building mr-2" />
                            Post a Role
                        </a>
                    </div>
                </div>
            </section>

            {/* ─── Colophon ────────────────────────────────────────────────── */}
            <section className="bg-base-200 py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">
                        Splits Network &middot; Applicant Network &middot;
                        Employment Networks
                    </p>
                </div>
            </section>
        </div>
    );
}
