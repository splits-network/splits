import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@splits-network/shared-ui";
import { buildCanonical } from "@/lib/seo";
import { portalFaqs } from "@/components/landing/sections/faq-data";
import { LandingAnimator } from "@/components/landing/landing-animator";

/* ─── Unsplash images (unique to portal — no overlap with corporate/candidate) */
const img = {
    hero: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    problem:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    editorial:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    break: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
};

/* ─── Data ───────────────────────────────────────────────────────────────── */

const stats = [
    { value: "75/25", label: "Recruiter Split" },
    { value: "48hrs", label: "Avg. Response" },
    { value: "100%", label: "Fee Transparency" },
    { value: "$0", label: "Upfront Cost" },
];

const splitSteps = [
    {
        num: "01",
        title: "Post a Role",
        body: "Define your fee structure, split ratio, and requirements. Terms apply to every recruiter who engages. Set them once.",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        num: "02",
        title: "Recruit by Specialty",
        body: "Browse open roles filtered to your niche. Submit candidates with split terms locked before the first resume goes out.",
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
    },
    {
        num: "03",
        title: "Track Every Stage",
        body: "Screen, interview, offer — visible to all parties in real time. No follow-up emails. No status calls.",
        icon: "fa-duotone fa-regular fa-user-check",
    },
    {
        num: "04",
        title: "Close and Get Paid",
        body: "Candidate starts. Fee collected. Split calculated and distributed to the recruiter. Automatically.",
        icon: "fa-duotone fa-regular fa-handshake",
    },
];

const platforms = [
    {
        name: "For Recruiters",
        tagline: "Recruit on Your Terms",
        href: "/sign-up",
        color: "primary" as const,
        features: [
            "Browse roles matched to your specialty",
            "See your split before you engage",
            "Track candidates from one dashboard",
            "Earn on every verified placement",
            "Scale through the network",
            "No cold outreach required",
        ],
        icon: "fa-duotone fa-regular fa-user-tie",
    },
    {
        name: "For Companies",
        tagline: "Hire With Clarity",
        href: "/sign-up",
        color: "secondary" as const,
        features: [
            "Post a role with defined terms",
            "Access specialized recruiters instantly",
            "See every recruiter working your roles",
            "Track candidates across the pipeline",
            "Pay only when someone starts",
            "No individual recruiter contracts",
        ],
        icon: "fa-duotone fa-regular fa-building",
    },
];

const testimonials = [
    {
        quote: "I see my split on every role before I submit a single candidate. No more back-and-forth on terms. The pipeline view replaced three tools I used to juggle.",
        name: "Marcus Chen",
        role: "Senior Recruiter",
        initials: "MC",
    },
    {
        quote: "We posted five roles and had specialized recruiters working them within 48 hours. One dashboard for every recruiter, every candidate, every stage.",
        name: "Sarah Okonkwo",
        role: "VP of Talent, TechCorp",
        initials: "SO",
    },
    {
        quote: "My recruiter kept me updated at every stage. I always knew where I stood and what was happening next. That had never happened before.",
        name: "David Park",
        role: "Software Engineer",
        initials: "DP",
    },
];

/* ─── Metadata ───────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
    title: "Split-Fee Recruiting Marketplace",
    description:
        "Post roles, set split terms, and track every placement from submission to payout. The platform built for split-fee recruiters and hiring companies.",
    openGraph: {
        title: "Split-Fee Recruiting, Built on Infrastructure",
        description:
            "The recruiting platform where companies define terms once, specialized recruiters engage by niche, and every placement is tracked from submission to payout.",
        url: "https://splits.network",
    },
    ...buildCanonical(""),
};

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function HomePage() {
    const homeJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Splits Network - Split-Fee Recruiting Marketplace",
        url: "https://splits.network",
        description:
            "Post roles, set split terms, and track every placement from submission to payout. The platform built for split-fee recruiters and hiring companies.",
        isPartOf: {
            "@type": "WebSite",
            name: "Splits Network",
            url: "https://splits.network",
        },
    };
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: portalFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };

    return (
        <>
            <JsonLd data={homeJsonLd} id="splits-home-jsonld" />
            <JsonLd data={faqJsonLd} id="splits-home-faq-jsonld" />
            <LandingAnimator>
                {/* ═══════════════════════════════════════════════════════
                    HERO — Split-screen 60/40 with diagonal clip
                   ═══════════════════════════════════════════════════════ */}
                <section className="hero-section relative min-h-[92vh] flex items-center bg-base-100">
                    {/* Right image panel — sits behind on mobile, 40% on desktop */}
                    <div
                        className="hero-img-wrap absolute inset-0 lg:left-[58%] opacity-0"
                        style={{
                            clipPath:
                                "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
                        }}
                    >
                        <img
                            src={img.hero}
                            alt="Two professionals reviewing a placement together"
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay for text readability on mobile */}
                        <div className="absolute inset-0 bg-neutral/60 lg:bg-neutral/20" />
                    </div>

                    {/* Content panel — 60% on desktop */}
                    <div className="relative z-10 container mx-auto px-6 lg:px-12 py-28">
                        <div className="max-w-2xl">
                            <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6 opacity-0">
                                Split-Fee Marketplace
                            </p>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.92] tracking-tight mb-8">
                                <span className="hero-headline-word inline-block opacity-0 text-base-content lg:text-base-content">
                                    Post
                                </span>{" "}
                                <span className="hero-headline-word inline-block opacity-0 text-base-content lg:text-base-content">
                                    roles.
                                </span>{" "}
                                <span className="hero-headline-word inline-block opacity-0 text-primary">
                                    Split
                                </span>{" "}
                                <span className="hero-headline-word inline-block opacity-0 text-base-content lg:text-base-content">
                                    the
                                </span>{" "}
                                <span className="hero-headline-word inline-block opacity-0 text-base-content lg:text-base-content">
                                    fee.
                                </span>
                            </h1>

                            <p className="hero-body text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl mb-10 opacity-0">
                                The recruiting platform where companies define
                                terms once, specialized recruiters engage by
                                niche, and every placement is tracked from
                                submission to payout.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/sign-up"
                                    className="hero-cta btn btn-primary btn-lg shadow-lg opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-rocket" />
                                    Post a Role
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="hero-cta btn btn-secondary btn-lg shadow-lg opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-user-plus" />
                                    Start Recruiting
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className="hero-cta btn btn-ghost btn-lg opacity-0"
                                >
                                    See How It Works
                                    <i className="fa-duotone fa-regular fa-arrow-down" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    STATS BAR
                   ═══════════════════════════════════════════════════════ */}
                <section className="stats-bar bg-primary text-primary-content py-10">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                            {stats.map((stat, i) => (
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
                    PROBLEM — Split-screen editorial (60 text / 40 image)
                   ═══════════════════════════════════════════════════════ */}
                <section className="problem-section py-28 bg-base-200">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                            {/* Text — 3 of 5 columns (60%) */}
                            <div className="problem-text lg:col-span-3 opacity-0">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-error mb-4">
                                    The Old Way
                                </p>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                    Split deals shouldn&rsquo;t
                                    <br />
                                    require spreadsheets.
                                </h2>
                                <p className="text-lg text-base-content/70 leading-relaxed mb-10 max-w-lg">
                                    Most split-fee placements still run on email
                                    threads, verbal agreements, and manual
                                    invoicing. Recruiters have no visibility.
                                    Companies have no control. Candidates fall
                                    through the cracks.
                                </p>

                                <div className="space-y-4">
                                    {[
                                        {
                                            icon: "fa-duotone fa-regular fa-handshake-slash",
                                            text: "Terms agreed on a phone call. No documentation, no enforcement, no recourse when the deal changes.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-inbox",
                                            text: "Pipeline updates buried in email threads. Weeks of silence between submission and the next status check.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-file-invoice-dollar",
                                            text: "Manual invoicing after placement. Average payment cycle: 52 days. No visibility into when — or if — you get paid.",
                                        },
                                    ].map((pain, i) => (
                                        <div
                                            key={i}
                                            className="problem-pain flex items-start gap-4 opacity-0"
                                        >
                                            <div className="w-10 h-10 flex-shrink-0 bg-error/10 flex items-center justify-center">
                                                <i
                                                    className={`${pain.icon} text-error`}
                                                />
                                            </div>
                                            <p className="text-base-content/80 leading-relaxed pt-2">
                                                {pain.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Image — 2 of 5 columns (40%) */}
                            <div className="problem-img lg:col-span-2 opacity-0">
                                <div
                                    className="relative overflow-hidden"
                                    style={{
                                        clipPath:
                                            "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
                                    }}
                                >
                                    <img
                                        src={img.problem}
                                        alt="Desk covered in paperwork and spreadsheets"
                                        className="w-full h-[500px] object-cover"
                                    />
                                    <div className="absolute inset-0 bg-error/10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    HOW IT WORKS — Numbered steps editorial
                   ═══════════════════════════════════════════════════════ */}
                <section
                    id="how-it-works"
                    className="hiw-section py-28 bg-neutral text-neutral-content"
                >
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="hiw-heading max-w-3xl mb-20 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                                How It Works
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                                From role posting to
                                <br />
                                recruiter payout.
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-x-16 gap-y-14">
                            {splitSteps.map((step, i) => (
                                <div
                                    key={i}
                                    className="hiw-step flex gap-6 opacity-0"
                                >
                                    <div className="flex-shrink-0">
                                        <span className="text-6xl font-black text-secondary/30 leading-none">
                                            {step.num}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <i
                                                className={`${step.icon} text-xl text-secondary`}
                                            />
                                            <h3 className="text-xl font-bold">
                                                {step.title}
                                            </h3>
                                        </div>
                                        <p className="opacity-70 leading-relaxed">
                                            {step.body}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    PLATFORMS — Two-column editorial comparison
                   ═══════════════════════════════════════════════════════ */}
                <section className="platforms-section py-28 bg-base-100">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="platforms-heading max-w-3xl mx-auto text-center mb-20 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                Who It&rsquo;s For
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                                Built for both sides
                                <br />
                                of the split.
                            </h2>
                        </div>

                        <div className="platforms-grid grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {platforms.map((p, i) => (
                                <div
                                    key={i}
                                    className={`platform-card border-t-4 ${
                                        p.color === "primary"
                                            ? "border-primary"
                                            : "border-secondary"
                                    } bg-base-200 p-10 opacity-0`}
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div
                                            className={`w-14 h-14 flex items-center justify-center ${
                                                p.color === "primary"
                                                    ? "bg-primary text-primary-content"
                                                    : "bg-secondary text-secondary-content"
                                            }`}
                                        >
                                            <i
                                                className={`${p.icon} text-2xl`}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black">
                                                {p.name}
                                            </h3>
                                            <p className="text-sm text-base-content/60 uppercase tracking-wider">
                                                {p.tagline}
                                            </p>
                                        </div>
                                    </div>

                                    <ul className="space-y-3 mb-8">
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

                                    <Link
                                        href={p.href}
                                        className={`btn ${
                                            p.color === "primary"
                                                ? "btn-primary"
                                                : "btn-secondary"
                                        } btn-lg w-full`}
                                    >
                                        Get Started
                                        <i className="fa-duotone fa-regular fa-arrow-right" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    EDITORIAL SPLIT — Ecosystem (40 image / 60 text)
                   ═══════════════════════════════════════════════════════ */}
                <section className="editorial-section py-28 bg-base-200">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                            {/* Image — 2 of 5 columns (40%) */}
                            <div className="editorial-img lg:col-span-2 opacity-0">
                                <div
                                    className="relative overflow-hidden"
                                    style={{
                                        clipPath:
                                            "polygon(0 0, 92% 0, 100% 100%, 0% 100%)",
                                    }}
                                >
                                    <img
                                        src={img.editorial}
                                        alt="Recruiting team in a strategy session"
                                        className="w-full h-[520px] object-cover"
                                    />
                                </div>
                            </div>

                            {/* Text — 3 of 5 columns (60%) */}
                            <div className="editorial-text lg:col-span-3 opacity-0">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                    How It&rsquo;s Built
                                </p>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                    Every detail, tracked.
                                </h2>
                                <p className="text-lg text-base-content/70 leading-relaxed mb-8 max-w-lg">
                                    Every split-fee placement generates a
                                    documented record — who submitted the
                                    candidate, what terms were agreed, where the
                                    pipeline stands, and when payment
                                    distributes. Nothing verbal. Nothing
                                    assumed.
                                </p>

                                <div className="grid sm:grid-cols-3 gap-6">
                                    {[
                                        {
                                            icon: "fa-duotone fa-regular fa-file-contract",
                                            title: "Defined Terms",
                                            body: "Fee structure and split ratio are locked before the first candidate is submitted.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-chart-gantt",
                                            title: "Visible Pipeline",
                                            body: "Every stage tracked and visible to recruiters and companies in real time.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-money-bill-transfer",
                                            title: "Automated Payment",
                                            body: "Placement closes. Platform calculates the split. Recruiter gets paid.",
                                        },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-3">
                                                <i
                                                    className={`${item.icon} text-xl text-primary`}
                                                />
                                            </div>
                                            <h4 className="font-bold text-lg mb-1">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-base-content/60 leading-relaxed">
                                                {item.body}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    TESTIMONIALS
                   ═══════════════════════════════════════════════════════ */}
                <section className="testimonials-section py-28 bg-base-100">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="testimonials-heading max-w-3xl mb-16 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                From the Platform
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                                What recruiters and
                                <br />
                                companies are saying.
                            </h2>
                        </div>

                        <div className="testimonials-grid grid md:grid-cols-3 gap-8">
                            {testimonials.map((t, i) => (
                                <div
                                    key={i}
                                    className="testimonial-card border-l-4 border-primary bg-base-200 p-8 opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-quote-left text-3xl text-primary/20 mb-4 block" />
                                    <p className="text-base-content/80 leading-relaxed mb-6 italic">
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-bold text-sm">
                                            {t.initials}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">
                                                {t.name}
                                            </div>
                                            <div className="text-xs text-base-content/60">
                                                {t.role}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    FULL-BLEED IMAGE BREAK
                   ═══════════════════════════════════════════════════════ */}
                <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                    <img
                        src={img.break}
                        alt="Modern glass architecture representing platform infrastructure"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral/70 flex items-center justify-center">
                        <p className="text-4xl md:text-5xl lg:text-6xl font-black text-white text-center leading-[0.95] tracking-tight px-6">
                            Your next placement
                            <br />
                            <span className="text-secondary">starts here.</span>
                        </p>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    FAQ
                   ═══════════════════════════════════════════════════════ */}
                <section className="faq-section py-28 bg-base-100">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="faq-heading max-w-3xl mb-16 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                Common Questions
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                                Straight
                                <br />
                                answers.
                            </h2>
                        </div>

                        <div className="faq-items max-w-3xl space-y-4">
                            {portalFaqs.map((faq, i) => (
                                <div
                                    key={i}
                                    className="faq-item border-l-4 border-primary bg-base-200 opacity-0"
                                >
                                    <details className="group">
                                        <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-base text-base-content">
                                            {faq.question}
                                            <i className="fa-duotone fa-regular fa-chevron-down text-sm text-primary flex-shrink-0 ml-4 transition-transform group-open:rotate-180" />
                                        </summary>
                                        <div className="px-6 pb-6">
                                            <p className="text-base-content/70 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    FINAL CTA
                   ═══════════════════════════════════════════════════════ */}
                <section className="final-cta py-28 bg-primary text-primary-content">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="final-cta-content max-w-4xl mx-auto text-center opacity-0">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                The platform is live.
                                <br />
                                Start today.
                            </h2>
                            <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed">
                                Post your first role or browse the marketplace.
                                No contracts, no setup fees, no commitment.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                                <Link
                                    href="/sign-up"
                                    className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                                >
                                    <i className="fa-duotone fa-regular fa-rocket" />
                                    Post a Role
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                                >
                                    <i className="fa-duotone fa-regular fa-user-tie" />
                                    Start Recruiting
                                </Link>
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
            </LandingAnimator>
        </>
    );
}
