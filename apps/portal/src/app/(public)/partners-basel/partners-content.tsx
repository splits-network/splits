"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const partnerTypes = [
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Recruiting Firms",
        description:
            "White-label solutions, team management, and revenue sharing opportunities for established recruiting organizations.",
    },
    {
        icon: "fa-duotone fa-regular fa-plug",
        title: "Technology Partners",
        description:
            "Integrate your tools with our platform through our API, create custom workflows, and reach our growing user base.",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Associations",
        description:
            "Special pricing for members, co-branded experiences, and collaboration on industry education and best practices.",
    },
];

const benefitCategories = [
    {
        icon: "fa-duotone fa-regular fa-dollar-sign",
        title: "Revenue Opportunities",
        items: [
            "Revenue sharing on referrals",
            "White-label licensing opportunities",
            "Co-marketing initiatives",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-code",
        title: "Technical Support",
        items: [
            "Priority API access and support",
            "Dedicated integration assistance",
            "Custom development opportunities",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-bullhorn",
        title: "Marketing & Visibility",
        items: [
            "Featured in partner directory",
            "Co-branded content opportunities",
            "Joint webinars and events",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-graduation-cap",
        title: "Training & Resources",
        items: [
            "Partner onboarding program",
            "Sales and marketing materials",
            "Ongoing education and updates",
        ],
    },
];

const partnershipOpportunities = [
    {
        icon: "fa-duotone fa-regular fa-building",
        title: "Recruiting Firm Partners",
        description:
            "Perfect for established recruiting firms who want to offer split placement capabilities to their recruiters while maintaining their brand.",
        features: [
            {
                title: "White-Label Platform",
                description:
                    "Custom branding and domain for your recruiting network",
            },
            {
                title: "Team Management",
                description:
                    "Manage multiple recruiters under your organization",
            },
            {
                title: "Revenue Share",
                description:
                    "Earn from your recruiters' platform subscriptions",
            },
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-laptop-code",
        title: "Technology Integration Partners",
        description:
            "For software vendors who want to integrate their solutions with Splits Network and reach our growing user base.",
        features: [
            {
                title: "API Access",
                description:
                    "Full API documentation and integration support",
            },
            {
                title: "Marketplace Listing",
                description:
                    "Featured placement in our integrations directory",
            },
            {
                title: "Technical Support",
                description:
                    "Dedicated support for integration development",
            },
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Industry Association Partners",
        description:
            "For recruiting associations who want to provide value-added services to their members and promote best practices in split placements.",
        features: [
            {
                title: "Member Benefits",
                description:
                    "Special pricing and features for association members",
            },
            {
                title: "Co-Branded Experience",
                description:
                    "Association branding and customized onboarding",
            },
            {
                title: "Education Programs",
                description:
                    "Joint training and certification opportunities",
            },
        ],
    },
];

const processSteps = [
    {
        number: 1,
        title: "Submit Application",
        description:
            "Fill out our partner application form and tell us about your organization and partnership goals.",
    },
    {
        number: 2,
        title: "Discovery Call",
        description:
            "Meet with our partnerships team to discuss opportunities and alignment.",
    },
    {
        number: 3,
        title: "Agreement & Onboarding",
        description:
            "Sign partnership agreement and complete onboarding with dedicated support.",
    },
    {
        number: 4,
        title: "Launch Partnership",
        description:
            "Go live with co-marketing, technical integration, or white-label deployment.",
    },
];

const stats = [
    { value: "3", label: "Partnership Tiers" },
    { value: "40+", label: "API Endpoints" },
    { value: "48hr", label: "Response Time" },
    { value: "100%", label: "Revenue Visibility" },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export function PartnersBaselContent() {
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
                    .forEach((el) => {
                        (el as HTMLElement).style.opacity = "1";
                    });
                return;
            }

            const $ = (sel: string) =>
                mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                mainRef.current!.querySelector(sel);

            /* ── HERO ──────────────────────────────────────────── */
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

            // Hero image scale reveal + parallax
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

            const heroImg = $1(".hero-img-wrap img");
            if (heroImg) {
                gsap.to(heroImg, {
                    yPercent: 12,
                    ease: "none",
                    scrollTrigger: {
                        trigger: $1(".hero-section"),
                        start: "top top",
                        end: "bottom top",
                        scrub: true,
                    },
                });
            }

            /* ── SECTION REVEALS ───────────────────────────────── */
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

            /* ── SPLIT-SCREEN SECTIONS ─────────────────────────── */
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

            /* ── PULL QUOTES ───────────────────────────────────── */
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

            /* ── INLINE IMAGES ─────────────────────────────────── */
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

            /* ── STATS BAR ─────────────────────────────────────── */
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

            /* ── CTA ───────────────────────────────────────────── */
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
            {/* ═══════════════════════════════════════════════════════════
                1. HERO -- Split-screen 60/40 with diagonal clip
               ═══════════════════════════════════════════════════════════ */}
            <section className="hero-section relative min-h-[92vh] flex items-center bg-base-100">
                {/* Right image panel -- sits behind on mobile, 40% on desktop */}
                <div
                    className="hero-img-wrap absolute inset-0 lg:left-[58%] opacity-0"
                    style={{
                        clipPath:
                            "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80"
                        alt="Two professionals reviewing a shared strategy document in a modern office"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral/60 lg:bg-neutral/20"></div>
                </div>

                {/* Content panel -- 60% on desktop */}
                <div className="relative z-10 container mx-auto px-6 lg:px-12 py-28">
                    <div className="max-w-2xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6 opacity-0">
                            <i className="fa-duotone fa-regular fa-handshake mr-2"></i>
                            {/* COPY: Hero kicker text */}
                            Partnerships
                        </p>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="hero-headline-word inline-block opacity-0 text-base-content lg:text-base-content">
                                {/* COPY: Headline word 1 */}
                                Grow
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-base-content lg:text-base-content">
                                {/* COPY: Headline word 2 */}
                                the Network
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-primary">
                                {/* COPY: Headline word 3, accented */}
                                With Us.
                            </span>
                        </h1>

                        <p className="hero-subtitle text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl mb-8 opacity-0">
                            {/* COPY: Hero subtitle describing the partner program */}
                            Splits Network is building its founding partner cohort. Recruiting firms, technology providers, and industry associations that join now shape the platform from the inside.
                        </p>

                        <div className="flex flex-wrap items-center gap-6">
                            <span className="hero-meta-item text-xs uppercase tracking-[0.15em] text-base-content/50 opacity-0">
                                <i className="fa-duotone fa-regular fa-users mr-1"></i>
                                {/* COPY: Meta item 1 */}
                                3 Partnership Tiers
                            </span>
                            <span className="hero-meta-item text-xs uppercase tracking-[0.15em] text-base-content/50 opacity-0">
                                <i className="fa-duotone fa-regular fa-dollar-sign mr-1"></i>
                                {/* COPY: Meta item 2 */}
                                Revenue Share Model
                            </span>
                            <span className="hero-meta-item text-xs uppercase tracking-[0.15em] text-base-content/50 opacity-0">
                                <i className="fa-duotone fa-regular fa-rocket mr-1"></i>
                                {/* COPY: Meta item 3 */}
                                Founding Cohort Open
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                2. FULL-BLEED IMAGE BREAK
               ═══════════════════════════════════════════════════════════ */}
            <section className="inline-image relative h-[40vh] md:h-[50vh] overflow-hidden opacity-0">
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
                    alt="Team gathered around a shared workspace, focused on a collaborative planning session"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/50"></div>
                <div className="absolute bottom-6 left-6 lg:left-12">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                        {/* COPY: Caption for first full-bleed image */}
                        Partnerships built on shared infrastructure, not handshake deals
                    </span>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                3. SECTION 1 -- Partner Program (split-screen 60 text / 40 image)
               ═══════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                        {/* Text -- 3 of 5 columns (60%) */}
                        <div className="split-text-left lg:col-span-3 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                {/* COPY: Section 1 kicker */}
                                01 -- The Ecosystem
                            </p>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                {/* COPY: Section 1 headline */}
                                A platform is only as
                                <br />
                                strong as its network.
                            </h2>
                            <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                                <p>
                                    {/* COPY: Section 1 body paragraph 1 -- describe the partner ecosystem vision */}
                                    Split-fee recruiting runs on trust, speed, and reach. No single firm has all three at scale. The Splits Network partner program connects recruiting organizations, technology providers, and industry associations into a shared infrastructure where each partner strengthens the others.
                                </p>
                                <p>
                                    {/* COPY: Section 1 body paragraph 2 -- describe partnership value proposition */}
                                    This is a founding cohort, not an open marketplace. Partners who join now get direct input on product direction, priority API access, and revenue share terms that reward early commitment. The window is intentionally small. The impact is not.
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
                                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80"
                                    alt="Small team mapping out a strategic plan on a glass whiteboard"
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-primary/10"></div>
                            </div>
                        </div>
                    </div>

                    {/* Partner type cards below */}
                    <div className="article-block grid md:grid-cols-3 gap-8 mt-16 opacity-0">
                        {partnerTypes.map((type, i) => (
                            <div
                                key={i}
                                className="border-l-4 border-primary pl-6 py-2"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-none flex-shrink-0">
                                        <i
                                            className={`${type.icon} text-primary`}
                                        ></i>
                                    </div>
                                    <h3 className="font-bold text-lg">
                                        {type.title}
                                    </h3>
                                </div>
                                <p className="text-sm text-base-content/60 leading-relaxed">
                                    {type.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                4. PULL QUOTE 1
               ═══════════════════════════════════════════════════════════ */}
            <section className="pull-quote-block py-20 bg-neutral text-neutral-content opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="border-l-4 border-secondary pl-8 lg:pl-12">
                            <i className="fa-duotone fa-regular fa-quote-left text-4xl text-secondary/30 mb-6 block"></i>
                            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                                {/* COPY: Pull quote 1 -- about the value of partnership in recruiting */}
                                &ldquo;Every recruiter has a network. The ones who win are the ones who connect their network to a bigger one.&rdquo;
                            </blockquote>
                            <cite className="text-sm uppercase tracking-[0.2em] text-neutral-content/50 not-italic">
                                {/* COPY: Pull quote 1 attribution */}
                                -- The case for structured split-fee partnerships
                            </cite>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                5. SECTION 2 -- Benefits (split-screen 40 image / 60 text)
               ═══════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
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
                                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80"
                                    alt="Professional meeting at a clean conference table with laptops and documents"
                                    className="w-full h-[600px] object-cover"
                                />
                            </div>
                        </div>

                        {/* Text -- 3 of 5 columns (60%) */}
                        <div className="split-text-right lg:col-span-3 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                                {/* COPY: Section 2 kicker */}
                                02 -- The Returns
                            </p>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-10">
                                {/* COPY: Section 2 headline */}
                                Built for mutual
                                <br />
                                advantage.
                            </h2>

                            <div className="space-y-8">
                                {benefitCategories.map((benefit, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-10 h-10 flex-shrink-0 bg-secondary/10 flex items-center justify-center rounded-none">
                                            <i
                                                className={`${benefit.icon} text-secondary`}
                                            ></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-2">
                                                {benefit.title}
                                            </h4>
                                            <ul className="space-y-1">
                                                {benefit.items.map(
                                                    (item, j) => (
                                                        <li
                                                            key={j}
                                                            className="text-sm text-base-content/60 leading-relaxed flex items-start gap-2"
                                                        >
                                                            <i className="fa-duotone fa-regular fa-check text-secondary mt-0.5 text-xs"></i>
                                                            <span>
                                                                {item}
                                                            </span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                6. STATS BAR
               ═══════════════════════════════════════════════════════════ */}
            <section className="stats-bar bg-neutral text-neutral-content py-10">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, i) => (
                            <div key={i} className="stat-item opacity-0">
                                <div className="text-3xl md:text-4xl font-black tracking-tight">
                                    {/* COPY: Stat value */}
                                    {stat.value}
                                </div>
                                <div className="text-sm uppercase tracking-wider opacity-70 mt-1">
                                    {/* COPY: Stat label */}
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                7. SECTION 3 -- Partnership Opportunities (article body block)
               ═══════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            {/* COPY: Section 3 kicker */}
                            03 -- The Paths
                        </p>
                        <h2 className="text-3xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            {/* COPY: Section 3 headline */}
                            Three ways in.
                            <br />
                            One shared network.
                        </h2>

                        <div className="space-y-12">
                            {partnershipOpportunities.map((opp, i) => (
                                <div
                                    key={i}
                                    className="border-l-4 border-primary pl-6"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <i
                                            className={`${opp.icon} text-primary text-xl`}
                                        ></i>
                                        <h3 className="text-2xl font-black">
                                            {opp.title}
                                        </h3>
                                    </div>
                                    <p className="text-base-content/70 leading-relaxed mb-6">
                                        {opp.description}
                                    </p>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        {opp.features.map((feature, j) => (
                                            <div
                                                key={j}
                                                className="bg-base-200 p-4 rounded-none"
                                            >
                                                <div className="font-bold text-sm mb-1">
                                                    {feature.title}
                                                </div>
                                                <p className="text-xs text-base-content/60 leading-relaxed">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                8. PULL QUOTE 2 (centered variant)
               ═══════════════════════════════════════════════════════════ */}
            <section className="pull-quote-block py-20 bg-primary text-primary-content opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <i className="fa-duotone fa-regular fa-quote-left text-4xl text-primary-content/20 mb-6 block"></i>
                        <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                            {/* COPY: Pull quote 2 -- about partnership impact on recruiting */}
                            &ldquo;One platform. Shared infrastructure. Every partner makes the network more valuable for every other partner.&rdquo;
                        </blockquote>
                        <cite className="text-sm uppercase tracking-[0.2em] text-primary-content/50 not-italic">
                            {/* COPY: Pull quote 2 attribution */}
                            -- The compound advantage of ecosystem partnerships
                        </cite>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                9. SECTION 4 -- Application Process (split-screen 60 text / 40 image)
               ═══════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                        {/* Text -- 3 of 5 columns (60%) */}
                        <div className="split-text-left lg:col-span-3 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                {/* COPY: Section 4 kicker */}
                                04 -- Getting Started
                            </p>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-10">
                                {/* COPY: Section 4 headline */}
                                Application to launch
                                <br />
                                in four steps.
                            </h2>

                            <div className="space-y-6">
                                {processSteps.map((step) => (
                                    <div
                                        key={step.number}
                                        className="flex items-start gap-5"
                                    >
                                        <div className="w-12 h-12 flex-shrink-0 bg-primary flex items-center justify-center rounded-none">
                                            <span className="text-xl font-black text-primary-content">
                                                {step.number}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">
                                                {step.title}
                                            </h4>
                                            <p className="text-sm text-base-content/60 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
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
                                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80"
                                    alt="Professional reviewing and signing partnership documents at a clean desk"
                                    className="w-full h-[520px] object-cover"
                                />
                                <div className="absolute inset-0 bg-primary/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                10. FULL-BLEED IMAGE -- Statement
               ═══════════════════════════════════════════════════════════ */}
            <section className="inline-image relative h-[40vh] md:h-[50vh] overflow-hidden opacity-0">
                <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80"
                    alt="Abstract aerial view of interconnected city lights forming a network pattern"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/70 flex items-center justify-center">
                    <p className="text-3xl md:text-5xl lg:text-6xl font-black text-white text-center leading-[0.95] tracking-tight px-6">
                        {/* COPY: Statement line 1 */}
                        One connected ecosystem.
                        <br />
                        <span className="text-secondary">
                            {/* COPY: Statement line 2, accented */}
                            Built by its partners.
                        </span>
                    </p>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                11. FINAL CTA
               ═══════════════════════════════════════════════════════════ */}
            <section className="final-cta py-20 md:py-28 bg-primary text-primary-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="final-cta-content max-w-4xl mx-auto text-center opacity-0">
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                            {/* COPY: CTA headline */}
                            Join the founding
                            <br />
                            partner cohort.
                        </h2>
                        <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed">
                            {/* COPY: CTA subtitle */}
                            The partner program is accepting applications from recruiting firms, technology providers, and industry associations. Early partners get priority terms, direct product input, and founding-tier revenue share.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <a
                                href="mailto:partnerships@splits.network"
                                className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg rounded-none"
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                {/* COPY: Primary CTA button text */}
                                Apply Now
                            </a>
                            <a
                                href="/partners"
                                className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50 rounded-none"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                {/* COPY: Secondary CTA button text */}
                                View Program Details
                            </a>
                        </div>

                        <p className="text-sm opacity-60">
                            {/* COPY: CTA footer text */}
                            Questions about the program?{" "}
                            <a
                                href="mailto:partnerships@splits.network"
                                className="underline hover:opacity-100 transition-opacity"
                            >
                                partnerships@splits.network
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
