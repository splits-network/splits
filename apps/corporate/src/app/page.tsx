import type { Metadata } from "next";
import { JsonLd } from "@splits-network/shared-ui";
import { buildCanonical } from "@/lib/seo";
import { HomeBaselAnimator } from "./home-animator";

export const metadata: Metadata = {
    title: "Modern Recruiting & Candidate Experience | Employment Networks",
    description:
        "Employment Networks powers Splits Network for recruiters and Applicant Network for candidates. Two platforms, one connected ecosystem for transparent recruiting.",
    ...buildCanonical("/"),
};

/* ─── Images (Unsplash — professional / recruiting themes) ────────────────── */

const img = {
    hero: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
    office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    teamwork: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    skyline: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
};

/* ─── Data ────────────────────────────────────────────────────────────────── */

const STATS = [
    { value: "10,000+", label: "Active Roles" },
    { value: "2,000+", label: "Recruiters" },
    { value: "500+", label: "Companies" },
    { value: "95%", label: "48hr Response" },
];

const STEPS = [
    {
        num: "01",
        title: "Companies Post Roles",
        body: "Set your terms once. Fees, expectations, and timelines apply to every recruiter consistently.",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        num: "02",
        title: "Recruiters Engage",
        body: "Specialized recruiters pick roles that match their niche. No cold outreach, no wasted time.",
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
    },
    {
        num: "03",
        title: "Candidates Get Matched",
        body: "Expert recruiters advocate for candidates. Real communication, real feedback, no ghosting.",
        icon: "fa-duotone fa-regular fa-user-check",
    },
    {
        num: "04",
        title: "Everyone Wins",
        body: "Transparent splits, visible pipelines, and a single connected ecosystem.",
        icon: "fa-duotone fa-regular fa-handshake",
    },
];

const RECRUITER_FEATURES = [
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Curated Roles",
        text: "Access roles that match your expertise—no cold outreach needed.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-simple",
        title: "Unified Pipeline",
        text: "Track every candidate and submission in one clean dashboard.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "Transparent Earnings",
        text: "See exactly what you'll earn on each placement. No mystery math.",
    },
];

const CANDIDATE_FEATURES = [
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "Specialized Advocates",
        text: "Get matched with recruiters who actually advocate for you.",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Real Communication",
        text: "Status updates, feedback, and no ghosting. Ever.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Privacy First",
        text: "Your data stays private until you choose to share it.",
    },
];

const COMPANY_FEATURES = [
    {
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        title: "Recruiter Network",
        text: "Tap into specialized recruiters—no individual contracts.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        title: "Full Visibility",
        text: "See who's working your roles and every pipeline status.",
    },
    {
        icon: "fa-duotone fa-regular fa-hand-holding-dollar",
        title: "Pay on Hire",
        text: "Pay only when someone starts. No retainers, no surprises.",
    },
];

const TESTIMONIALS = [
    {
        quote: "Splits Network changed how I run my desk. I pick roles that fit my niche and the splits are always transparent.",
        name: "Marcus Chen",
        role: "Senior Recruiter",
        initials: "MC",
    },
    {
        quote: "We went from managing 15 recruiter contracts to one platform. Complete visibility into every pipeline.",
        name: "Sarah Okonkwo",
        role: "VP of Talent, TechCorp",
        initials: "SO",
    },
    {
        quote: "For the first time, I actually knew what was happening with my applications. My recruiter kept me in the loop at every stage.",
        name: "David Park",
        role: "Software Engineer",
        initials: "DP",
    },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function HomeBaselPage() {
    const homeJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Employment Networks - Modern Recruiting & Candidate Experience",
        url: "https://employment-networks.com",
        description:
            "Employment Networks powers Splits Network for recruiters and Applicant Network for candidates.",
        isPartOf: {
            "@type": "WebSite",
            name: "Employment Networks",
            url: "https://employment-networks.com",
        },
    };

    return (
        <>
            <JsonLd data={homeJsonLd} id="employment-home-jsonld" />
            <HomeBaselAnimator>
                {/* ══════════════════════════════════════════════════════════
                    HERO — Split-screen 60/40 with diagonal clip
                   ══════════════════════════════════════════════════════════ */}
                <section className="bh-hero-section relative min-h-[92vh] flex items-center bg-base-100">
                    {/* Right image panel — 40% on desktop */}
                    <div
                        className="bh-hero-img absolute inset-0 lg:left-[58%] opacity-0"
                        style={{ clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)" }}
                    >
                        <img
                            src={img.hero}
                            alt="Professional recruiter in modern office"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-neutral/60 lg:bg-neutral/20" />
                    </div>

                    {/* Content panel — 60% on desktop */}
                    <div className="relative z-10 container mx-auto px-6 lg:px-12 py-28">
                        <div className="max-w-2xl">
                            <p className="bh-hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6 opacity-0">
                                Employment Networks
                            </p>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.92] tracking-tight mb-8">
                                <span className="bh-hero-word inline-block opacity-0 text-base-content">
                                    Two
                                </span>{" "}
                                <span className="bh-hero-word inline-block opacity-0 text-base-content">
                                    platforms.
                                </span>{" "}
                                <span className="bh-hero-word inline-block opacity-0 text-primary">
                                    One
                                </span>{" "}
                                <span className="bh-hero-word inline-block opacity-0 text-base-content">
                                    ecosystem.
                                </span>
                            </h1>

                            <p className="bh-hero-body text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl mb-10 opacity-0">
                                Splits Network for recruiters and companies.
                                Applicant Network for candidates. A connected
                                ecosystem built for transparent, modern recruiting.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="https://splits.network/sign-up"
                                    className="bh-hero-cta btn btn-primary btn-lg shadow-md opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-rocket" />
                                    Join as Recruiter
                                </a>
                                <a
                                    href="https://applicant.network/sign-up"
                                    className="bh-hero-cta btn btn-secondary btn-lg shadow-md opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-user-plus" />
                                    Find a Job
                                </a>
                                <a
                                    href="#how-it-works"
                                    className="bh-hero-cta btn btn-ghost btn-lg opacity-0"
                                >
                                    Learn More
                                    <i className="fa-duotone fa-regular fa-arrow-down" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    STATS BAR
                   ══════════════════════════════════════════════════════════ */}
                <section className="bh-stats-bar bg-primary text-primary-content py-10">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                            {STATS.map((stat, i) => (
                                <div key={i} className="bh-stat-item opacity-0">
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

                {/* ══════════════════════════════════════════════════════════
                    PROBLEM — Editorial split-screen (60 text / 40 image)
                   ══════════════════════════════════════════════════════════ */}
                <section className="bh-problem-section py-28 bg-base-200">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                            {/* Text — 3 of 5 columns (60%) */}
                            <div className="bh-problem-text lg:col-span-3 opacity-0">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-error mb-4">
                                    The Industry Problem
                                </p>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                    Recruiting is broken
                                    <br />
                                    for everyone.
                                </h2>
                                <p className="text-lg text-base-content/70 leading-relaxed mb-10 max-w-lg">
                                    Fragmented tools, opaque fees, and zero
                                    communication. The old model fails recruiters,
                                    companies, and candidates alike.
                                </p>

                                <div className="space-y-4">
                                    {[
                                        {
                                            icon: "fa-duotone fa-regular fa-puzzle-piece-simple",
                                            audience: "Recruiters",
                                            text: "Spreadsheet chaos for split-fee tracking and fragmented tools that don't talk to each other",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-ghost",
                                            audience: "Candidates",
                                            text: "Ghosted after interviews with no feedback — applications vanish into black holes",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-eye-slash",
                                            audience: "Companies",
                                            text: "Managing dozens of recruiter contracts with no visibility into activity",
                                        },
                                    ].map((pain, i) => (
                                        <div
                                            key={i}
                                            className="bh-problem-pain flex items-start gap-4 opacity-0"
                                        >
                                            <div className="w-10 h-10 flex-shrink-0 bg-error/10 flex items-center justify-center">
                                                <i className={`${pain.icon} text-error`} />
                                            </div>
                                            <div className="pt-2">
                                                <span className="font-bold text-base-content">
                                                    {pain.audience}:
                                                </span>{" "}
                                                <span className="text-base-content/80 leading-relaxed">
                                                    {pain.text}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Image — 2 of 5 columns (40%) */}
                            <div className="bh-problem-img lg:col-span-2 opacity-0">
                                <div
                                    className="relative overflow-hidden"
                                    style={{
                                        clipPath:
                                            "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
                                    }}
                                >
                                    <img
                                        src={img.office}
                                        alt="Outdated office environment"
                                        className="w-full h-[500px] object-cover"
                                    />
                                    <div className="absolute inset-0 bg-error/10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    HOW IT WORKS — Numbered editorial steps
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="how-it-works"
                    className="bh-hiw-section py-28 bg-neutral text-neutral-content"
                >
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="bh-hiw-heading max-w-3xl mb-20 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                                How It Works
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                                Four steps to a
                                <br />
                                better hire.
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-x-16 gap-y-14">
                            {STEPS.map((step, i) => (
                                <div
                                    key={i}
                                    className="bh-hiw-step flex gap-6 opacity-0"
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

                {/* ══════════════════════════════════════════════════════════
                    FOR RECRUITERS — Editorial split with mock UI
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="for-recruiters"
                    className="bh-recruiter-section py-28 bg-base-100"
                >
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Content */}
                            <div>
                                <div className="bh-recruiter-header opacity-0">
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                        <i className="fa-duotone fa-regular fa-user-tie mr-2" />
                                        For Recruiters
                                    </p>
                                    <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                                        Work smarter.
                                        <br />
                                        <span className="text-primary">
                                            Earn more.
                                        </span>
                                    </h2>
                                    <p className="text-lg text-base-content/70 leading-relaxed mb-10">
                                        Splits Network gives you the tools to find
                                        better roles, manage candidates efficiently,
                                        and track every placement in one place.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {RECRUITER_FEATURES.map((f, i) => (
                                        <div
                                            key={i}
                                            className="bh-recruiter-feature border-l-4 border-primary bg-base-200 p-6 flex items-start gap-4 opacity-0"
                                        >
                                            <div className="w-10 h-10 flex-shrink-0 bg-primary/10 flex items-center justify-center">
                                                <i
                                                    className={`${f.icon} text-primary`}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-1">
                                                    {f.title}
                                                </h4>
                                                <p className="text-sm text-base-content/70 leading-relaxed">
                                                    {f.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bh-recruiter-cta mt-10 opacity-0">
                                    <a
                                        href="https://splits.network/sign-up"
                                        className="btn btn-primary btn-lg shadow-md"
                                    >
                                        <i className="fa-duotone fa-regular fa-arrow-right" />
                                        Join Splits Network
                                    </a>
                                </div>
                            </div>

                            {/* Mock UI visual */}
                            <div className="bh-recruiter-visual opacity-0">
                                <div className="border-l-4 border-primary bg-base-200 p-8 shadow-md">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary">
                                            Your Pipeline
                                        </h4>
                                        <span className="text-xs uppercase tracking-wider text-base-content/40">
                                            12 Active Roles
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            {
                                                role: "Senior Software Engineer",
                                                company: "TechCorp",
                                                status: "3 Candidates",
                                            },
                                            {
                                                role: "Product Manager",
                                                company: "StartupXYZ",
                                                status: "Interviewing",
                                            },
                                            {
                                                role: "UX Designer",
                                                company: "DesignCo",
                                                status: "Offer Stage",
                                            },
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                className="bg-base-100 border-l-2 border-base-300 p-4 hover:border-primary transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <h5 className="text-sm font-bold">
                                                        {item.role}
                                                    </h5>
                                                    <span className="badge badge-sm badge-primary badge-outline">
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-base-content/60">
                                                    {item.company}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    FOR CANDIDATES — Reversed editorial split
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="for-candidates"
                    className="bh-candidate-section py-28 bg-base-200"
                >
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Mock UI visual (left on desktop) */}
                            <div className="bh-candidate-visual opacity-0 order-2 lg:order-1">
                                <div className="border-l-4 border-secondary bg-base-100 p-8 shadow-md">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-secondary">
                                            Your Applications
                                        </h4>
                                        <span className="text-xs uppercase tracking-wider text-base-content/40">
                                            8 Active
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            {
                                                role: "Senior Frontend Developer",
                                                company: "Acme Inc",
                                                status: "Interview Scheduled",
                                            },
                                            {
                                                role: "Full Stack Engineer",
                                                company: "TechStart",
                                                status: "Under Review",
                                            },
                                            {
                                                role: "React Developer",
                                                company: "BuildCo",
                                                status: "Recruiter Matched",
                                            },
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                className="bg-base-200 border-l-2 border-base-300 p-4 hover:border-secondary transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <h5 className="text-sm font-bold">
                                                        {item.role}
                                                    </h5>
                                                    <span className="badge badge-sm badge-secondary badge-outline">
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-base-content/60">
                                                    {item.company}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Content (right on desktop) */}
                            <div className="order-1 lg:order-2">
                                <div className="bh-candidate-header opacity-0">
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                                        <i className="fa-duotone fa-regular fa-user mr-2" />
                                        For Candidates
                                    </p>
                                    <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                                        Find your dream job.
                                        <br />
                                        <span className="text-secondary">
                                            No ghosting.
                                        </span>
                                    </h2>
                                    <p className="text-lg text-base-content/70 leading-relaxed mb-10">
                                        Applicant Network connects you with specialized
                                        recruiters who actually care about your success.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {CANDIDATE_FEATURES.map((f, i) => (
                                        <div
                                            key={i}
                                            className="bh-candidate-feature border-l-4 border-secondary bg-base-100 p-6 flex items-start gap-4 opacity-0"
                                        >
                                            <div className="w-10 h-10 flex-shrink-0 bg-secondary/10 flex items-center justify-center">
                                                <i
                                                    className={`${f.icon} text-secondary`}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-1">
                                                    {f.title}
                                                </h4>
                                                <p className="text-sm text-base-content/70 leading-relaxed">
                                                    {f.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bh-candidate-cta mt-10 opacity-0">
                                    <a
                                        href="https://applicant.network/sign-up"
                                        className="btn btn-secondary btn-lg shadow-md"
                                    >
                                        <i className="fa-duotone fa-regular fa-arrow-right" />
                                        Join Applicant Network
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    FOR COMPANIES — Editorial split with mock UI
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="for-companies"
                    className="bh-company-section py-28 bg-base-100"
                >
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Content */}
                            <div>
                                <div className="bh-company-header opacity-0">
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-4">
                                        <i className="fa-duotone fa-regular fa-building mr-2" />
                                        For Companies
                                    </p>
                                    <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                                        Hire faster.
                                        <br />
                                        <span className="text-accent">
                                            Pay less.
                                        </span>
                                    </h2>
                                    <p className="text-lg text-base-content/70 leading-relaxed mb-10">
                                        Access a network of specialized recruiters with
                                        one platform. Full transparency, consistent terms.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {COMPANY_FEATURES.map((f, i) => (
                                        <div
                                            key={i}
                                            className="bh-company-feature border-l-4 border-accent bg-base-200 p-6 flex items-start gap-4 opacity-0"
                                        >
                                            <div className="w-10 h-10 flex-shrink-0 bg-accent/10 flex items-center justify-center">
                                                <i
                                                    className={`${f.icon} text-accent`}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-1">
                                                    {f.title}
                                                </h4>
                                                <p className="text-sm text-base-content/70 leading-relaxed">
                                                    {f.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bh-company-cta mt-10 opacity-0">
                                    <a
                                        href="https://splits.network/sign-up"
                                        className="btn btn-accent btn-lg shadow-md"
                                    >
                                        <i className="fa-duotone fa-regular fa-arrow-right" />
                                        Start Hiring Today
                                    </a>
                                </div>
                            </div>

                            {/* Mock UI visual */}
                            <div className="bh-company-visual opacity-0">
                                <div className="border-l-4 border-accent bg-base-200 p-8 shadow-md">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-accent">
                                            Open Roles
                                        </h4>
                                        <span className="text-xs uppercase tracking-wider text-base-content/40">
                                            6 Active
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            {
                                                role: "Backend Engineer",
                                                location: "San Francisco, CA",
                                                candidates: "5 Candidates",
                                                recruiters: "3 Recruiters",
                                            },
                                            {
                                                role: "Sales Director",
                                                location: "Remote",
                                                candidates: "2 Candidates",
                                                recruiters: "2 Recruiters",
                                            },
                                            {
                                                role: "Product Manager",
                                                location: "New York, NY",
                                                candidates: "8 Candidates",
                                                recruiters: "4 Recruiters",
                                            },
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                className="bg-base-100 border-l-2 border-base-300 p-4 hover:border-accent transition-colors"
                                            >
                                                <h5 className="text-sm font-bold mb-1">
                                                    {item.role}
                                                </h5>
                                                <p className="text-xs text-base-content/60 mb-3">
                                                    {item.location}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-accent">
                                                    <span>{item.candidates}</span>
                                                    <span className="text-base-content/20">
                                                        &bull;
                                                    </span>
                                                    <span>{item.recruiters}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    EDITORIAL SPLIT — Ecosystem (40 image / 60 text)
                   ══════════════════════════════════════════════════════════ */}
                <section className="bh-editorial-section py-28 bg-base-200">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                            {/* Image — 2 of 5 columns (40%) */}
                            <div className="bh-editorial-img lg:col-span-2 opacity-0">
                                <div
                                    className="relative overflow-hidden"
                                    style={{
                                        clipPath:
                                            "polygon(0 0, 92% 0, 100% 100%, 0% 100%)",
                                    }}
                                >
                                    <img
                                        src={img.teamwork}
                                        alt="Team collaborating around a table"
                                        className="w-full h-[520px] object-cover"
                                    />
                                </div>
                            </div>

                            {/* Text — 3 of 5 columns (60%) */}
                            <div className="bh-editorial-text lg:col-span-3 opacity-0">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                    The Ecosystem
                                </p>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                    Transparent by design.
                                </h2>
                                <p className="text-lg text-base-content/70 leading-relaxed mb-8 max-w-lg">
                                    Employment Networks connects companies,
                                    recruiters, and candidates through a single,
                                    transparent ecosystem. Visible pipelines, clear
                                    terms, and real communication at every step.
                                </p>

                                <div className="grid sm:grid-cols-3 gap-6">
                                    {[
                                        {
                                            icon: "fa-duotone fa-regular fa-building",
                                            title: "Companies",
                                            body: "Post roles, set terms, review candidates from vetted recruiters.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-user-tie",
                                            title: "Recruiters",
                                            body: "Pick roles, submit candidates, earn transparent splits.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-user",
                                            title: "Candidates",
                                            body: "Apply, get matched, track progress in real time.",
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

                {/* ══════════════════════════════════════════════════════════
                    TESTIMONIALS
                   ══════════════════════════════════════════════════════════ */}
                <section className="bh-testimonials-section py-28 bg-base-100">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="bh-testimonials-heading max-w-3xl mb-16 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                What People Say
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                                Trusted by
                                <br />
                                the industry.
                            </h2>
                        </div>

                        <div className="bh-testimonials-grid grid md:grid-cols-3 gap-8">
                            {TESTIMONIALS.map((t, i) => (
                                <div
                                    key={i}
                                    className="bh-testimonial-card border-l-4 border-primary bg-base-200 p-8 opacity-0"
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

                {/* ══════════════════════════════════════════════════════════
                    FULL-BLEED IMAGE BREAK
                   ══════════════════════════════════════════════════════════ */}
                <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                    <img
                        src={img.skyline}
                        alt="City skyline representing growth"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral/70 flex items-center justify-center">
                        <p className="text-4xl md:text-5xl lg:text-6xl font-black text-white text-center leading-[0.95] tracking-tight px-6">
                            The future of recruiting
                            <br />
                            <span className="text-secondary">starts here.</span>
                        </p>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    FINAL CTA
                   ══════════════════════════════════════════════════════════ */}
                <section className="bh-final-cta py-28 bg-primary text-primary-content">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="bh-final-cta-content max-w-4xl mx-auto text-center opacity-0">
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
                                    <i className="fa-duotone fa-regular fa-rocket" />
                                    Join Splits Network
                                </a>
                                <a
                                    href="https://applicant.network/sign-up"
                                    className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                                >
                                    <i className="fa-duotone fa-regular fa-user-plus" />
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
            </HomeBaselAnimator>
        </>
    );
}
