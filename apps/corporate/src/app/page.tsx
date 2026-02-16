import type { Metadata } from "next";
import { JsonLd } from "@splits-network/shared-ui";
import { buildCanonical } from "@/lib/seo";
import { corporateFaqs } from "@/components/landing/sections/faq-data";
import { LandingAnimator } from "@/components/landing/landing-animator";

export const metadata: Metadata = {
    title: "Modern Recruiting & Candidate Experience | Employment Networks",
    description:
        "Employment Networks powers Splits Network for recruiters and Applicant Network for candidates. Two platforms, one connected ecosystem for transparent recruiting.",
    ...buildCanonical(""),
};

// ─── Data arrays ─────────────────────────────────────────────────────────────

const recruiterPains = [
    {
        icon: "fa-duotone fa-regular fa-puzzle-piece-simple",
        text: "Fragmented tools that don't talk to each other",
    },
    {
        icon: "fa-duotone fa-regular fa-file-spreadsheet",
        text: "Spreadsheet chaos for split-fee tracking",
    },
    {
        icon: "fa-duotone fa-regular fa-clock",
        text: "Hours wasted on admin instead of recruiting",
    },
];

const candidatePains = [
    {
        icon: "fa-duotone fa-regular fa-ghost",
        text: "Ghosted after interviews with no feedback",
    },
    {
        icon: "fa-duotone fa-regular fa-circle-xmark",
        text: "Applications vanish into black holes",
    },
    {
        icon: "fa-duotone fa-regular fa-shuffle",
        text: "Duplicate listings across dozens of boards",
    },
];

const companyPains = [
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        text: "Managing dozens of recruiter contracts",
    },
    {
        icon: "fa-duotone fa-regular fa-eye-slash",
        text: "No visibility into recruiter activity",
    },
    {
        icon: "fa-duotone fa-regular fa-money-bill-wave",
        text: "Surprise fees and unclear terms",
    },
];

const pillars = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Transparent Partnerships",
        text: "Clear terms, visible pipelines, and honest communication between all parties.",
    },
    {
        icon: "fa-duotone fa-regular fa-network-wired",
        title: "Connected Ecosystem",
        text: "Recruiters, companies, and candidates all on platforms designed to work together.",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Modern Technology",
        text: "Real-time updates, automated workflows, and tools that save everyone time.",
    },
];

const recruiterBenefits = [
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        text: "Access curated roles that match your expertise—no cold outreach needed",
    },
    {
        icon: "fa-duotone fa-regular fa-sliders",
        text: "Work only the roles that fit your niche. You choose what you take on.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-simple",
        text: "Track every candidate and submission in one clean pipeline",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        text: "See exactly what you'll earn on each placement. No mystery math.",
    },
];

const recruiterFeatures = [
    {
        label: "Split-fee marketplace",
        icon: "fa-duotone fa-regular fa-handshake",
    },
    { label: "Built-in ATS", icon: "fa-duotone fa-regular fa-table-columns" },
    {
        label: "Placement tracking",
        icon: "fa-duotone fa-regular fa-chart-line-up",
    },
    { label: "Team collaboration", icon: "fa-duotone fa-regular fa-users" },
];

const recruiterDashboardRoles = [
    {
        title: "Senior Software Engineer",
        company: "TechCorp",
        status: "Active",
        color: "badge-primary",
    },
    {
        title: "Product Manager",
        company: "StartupXYZ",
        status: "Interviewing",
        color: "badge-info",
    },
    {
        title: "UX Designer",
        company: "DesignCo",
        status: "Offer Stage",
        color: "badge-success",
    },
];

const candidateBenefits = [
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        text: "Get matched with specialized recruiters who actually advocate for you",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        text: "Real communication—status updates, feedback, and no ghosting",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        text: "Curated opportunities that match your skills and goals",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        text: "Your data stays private until you choose to share it",
    },
];

const candidateFeatures = [
    { label: "One-click apply", icon: "fa-duotone fa-regular fa-bolt" },
    {
        label: "Real-time tracking",
        icon: "fa-duotone fa-regular fa-chart-line",
    },
    {
        label: "Interview prep",
        icon: "fa-duotone fa-regular fa-graduation-cap",
    },
    { label: "100% free", icon: "fa-duotone fa-regular fa-badge-check" },
];

const candidateDashboardApps = [
    {
        title: "Senior Frontend Developer",
        company: "Acme Inc",
        status: "Interview Scheduled",
        color: "badge-success",
    },
    {
        title: "Full Stack Engineer",
        company: "TechStart",
        status: "Under Review",
        color: "badge-info",
    },
    {
        title: "React Developer",
        company: "BuildCo",
        status: "Recruiter Matched",
        color: "badge-primary",
    },
];

const companyBenefits = [
    {
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        text: "Tap into a network of specialized recruiters—no individual contracts",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        text: "Full visibility into every pipeline. See who's working your roles.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        text: "Set fees and terms once. They apply to every recruiter consistently.",
    },
    {
        icon: "fa-duotone fa-regular fa-hand-holding-dollar",
        text: "Pay only when someone starts. No retainers, no surprises.",
    },
];

const companyFeatures = [
    {
        label: "Recruiter network",
        icon: "fa-duotone fa-regular fa-network-wired",
    },
    { label: "Pipeline visibility", icon: "fa-duotone fa-regular fa-eye" },
    { label: "Consistent terms", icon: "fa-duotone fa-regular fa-handshake" },
    { label: "Pay on hire", icon: "fa-duotone fa-regular fa-badge-check" },
];

const companyDashboardRoles = [
    {
        title: "Backend Engineer",
        location: "San Francisco, CA",
        candidates: 5,
        recruiters: 3,
    },
    {
        title: "Sales Director",
        location: "Remote",
        candidates: 2,
        recruiters: 2,
    },
    {
        title: "Product Manager",
        location: "New York, NY",
        candidates: 8,
        recruiters: 4,
    },
];

const metrics = [
    {
        value: 10000,
        suffix: "+",
        label: "Active Job Listings",
        description: "Across both platforms",
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "primary",
    },
    {
        value: 2000,
        suffix: "+",
        label: "Recruiters",
        description: "In the Splits Network",
        icon: "fa-duotone fa-regular fa-user-tie",
        color: "primary",
    },
    {
        value: 500,
        suffix: "+",
        label: "Companies",
        description: "Hiring on the platform",
        icon: "fa-duotone fa-regular fa-building",
        color: "accent",
    },
    {
        value: 95,
        suffix: "%",
        label: "Response Rate",
        description: "Within 48 hours",
        icon: "fa-duotone fa-regular fa-comments",
        color: "secondary",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
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
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: corporateFaqs.map((faq) => ({
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
            <JsonLd data={homeJsonLd} id="employment-home-jsonld" />
            <JsonLd data={faqJsonLd} id="employment-home-faq-jsonld" />
            <LandingAnimator>
                {/* ══════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════ */}
                <section className="min-h-[90vh] relative overflow-hidden flex items-center">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5"></div>

                    {/* Decorative elements */}
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-5xl mx-auto text-center">
                            <h1 className="hero-headline text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 opacity-0">
                                The Future of{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                    Recruiting
                                </span>
                            </h1>

                            <p className="hero-subtext text-xl md:text-2xl text-base-content/70 mb-10 max-w-3xl mx-auto leading-relaxed opacity-0">
                                Employment Networks powers modern recruiting
                                through two innovative platforms—connecting
                                recruiters, companies, and candidates in one
                                seamless ecosystem.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                                <div className="platform-badge flex items-center gap-3 bg-base-200 rounded-2xl px-6 py-4 opacity-0">
                                    <img
                                        src="/splits.png"
                                        alt="Splits Network"
                                        className="h-8"
                                    />
                                    <div className="text-left">
                                        <div className="font-semibold">
                                            Splits Network
                                        </div>
                                        <div className="text-sm text-base-content/60">
                                            For Recruiters &amp; Companies
                                        </div>
                                    </div>
                                </div>
                                <div className="platform-badge flex items-center gap-3 bg-base-200 rounded-2xl px-6 py-4 opacity-0">
                                    <img
                                        src="/applicant.png"
                                        alt="Applicant Network"
                                        className="h-8"
                                    />
                                    <div className="text-left">
                                        <div className="font-semibold">
                                            Applicant Network
                                        </div>
                                        <div className="text-sm text-base-content/60">
                                            For Job Seekers
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="hero-cta-buttons flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="#for-recruiters"
                                    className="btn btn-primary btn-lg gap-2 shadow-lg opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-user-tie"></i>
                                    I&apos;m a Recruiter
                                </a>
                                <a
                                    href="#for-candidates"
                                    className="btn btn-secondary btn-lg gap-2 shadow-lg opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-user"></i>
                                    I&apos;m Looking for a Job
                                </a>
                                <a
                                    href="#for-companies"
                                    className="btn btn-outline btn-lg gap-2 opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-building"></i>
                                    I&apos;m Hiring
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    PROBLEM
                   ══════════════════════════════════════════════════════════ */}
                <section className="problem-section py-24 bg-neutral text-neutral-content overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="problem-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <p className="text-sm uppercase tracking-wider opacity-60 mb-3">
                                The Industry Problem
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Recruiting is{" "}
                                <span className="text-error">broken</span> for
                                everyone
                            </h2>
                            <p className="text-lg opacity-70">
                                Whether you&apos;re hiring, recruiting, or job
                                searching—the current system fails you.
                            </p>
                        </div>

                        <div className="pain-columns grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Recruiters Column */}
                            <div className="pain-column bg-base-100/5 rounded-2xl p-6 border border-base-100/10 opacity-0">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-user-tie text-xl text-primary"></i>
                                    </div>
                                    <h3 className="font-bold text-xl">
                                        For Recruiters
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {recruiterPains.map((pain, index) => (
                                        <div
                                            key={index}
                                            className="pain-item flex items-start gap-3 opacity-0"
                                        >
                                            <i
                                                className={`${pain.icon} text-error mt-1`}
                                            ></i>
                                            <span className="text-sm opacity-80">
                                                {pain.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Candidates Column */}
                            <div className="pain-column bg-base-100/5 rounded-2xl p-6 border border-base-100/10 opacity-0">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-user text-xl text-secondary"></i>
                                    </div>
                                    <h3 className="font-bold text-xl">
                                        For Candidates
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {candidatePains.map((pain, index) => (
                                        <div
                                            key={index}
                                            className="pain-item flex items-start gap-3 opacity-0"
                                        >
                                            <i
                                                className={`${pain.icon} text-error mt-1`}
                                            ></i>
                                            <span className="text-sm opacity-80">
                                                {pain.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Companies Column */}
                            <div className="pain-column bg-base-100/5 rounded-2xl p-6 border border-base-100/10 opacity-0">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-building text-xl text-accent"></i>
                                    </div>
                                    <h3 className="font-bold text-xl">
                                        For Companies
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {companyPains.map((pain, index) => (
                                        <div
                                            key={index}
                                            className="pain-item flex items-start gap-3 opacity-0"
                                        >
                                            <i
                                                className={`${pain.icon} text-error mt-1`}
                                            ></i>
                                            <span className="text-sm opacity-80">
                                                {pain.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    SOLUTION
                   ══════════════════════════════════════════════════════════ */}
                <section className="solution-section py-24 bg-base-100 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="solution-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <p className="text-sm uppercase tracking-wider text-primary mb-3">
                                Our Approach
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Building a{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                    better ecosystem
                                </span>
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Employment Networks creates platforms where
                                transparency, technology, and trust work
                                together to make recruiting work for everyone.
                            </p>
                        </div>

                        <div className="pillar-cards grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {pillars.map((pillar, index) => (
                                <div
                                    key={index}
                                    className="pillar-card text-center p-8 bg-base-200 rounded-2xl opacity-0"
                                >
                                    <div className="pillar-icon w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6">
                                        <i
                                            className={`${pillar.icon} text-3xl text-primary`}
                                        ></i>
                                    </div>
                                    <h3 className="font-bold text-xl mb-3">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-base-content/70">
                                        {pillar.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    FOR RECRUITERS
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="for-recruiters"
                    className="recruiters-section py-24 bg-primary text-primary-content overflow-hidden"
                >
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                            {/* Content */}
                            <div>
                                <div className="recruiters-heading opacity-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src="/splits.png"
                                            alt="Splits Network"
                                            className="h-8"
                                        />
                                        <span className="badge badge-outline">
                                            For Recruiters
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                        Turn your network into
                                        <br />
                                        <span className="opacity-90">
                                            recurring revenue
                                        </span>
                                    </h2>
                                    <p className="text-lg opacity-80 mb-8">
                                        Join a collaborative marketplace where
                                        split-fee recruiting actually works.
                                        Stop chasing roles—let opportunities
                                        come to you.
                                    </p>
                                </div>

                                <div className="recruiters-benefits space-y-4 mb-8">
                                    {recruiterBenefits.map((benefit, index) => (
                                        <div
                                            key={index}
                                            className="benefit-item flex items-start gap-4 opacity-0"
                                        >
                                            <div className="benefit-icon w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <i
                                                    className={`${benefit.icon} text-sm`}
                                                ></i>
                                            </div>
                                            <p className="opacity-90 leading-relaxed">
                                                {benefit.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="recruiters-features flex flex-wrap gap-2 mb-8">
                                    {recruiterFeatures.map((feature, index) => (
                                        <span
                                            key={index}
                                            className="feature-badge badge badge-lg bg-white/10 border-white/20 gap-2 opacity-0"
                                        >
                                            <i
                                                className={`${feature.icon} text-xs`}
                                            ></i>
                                            {feature.label}
                                        </span>
                                    ))}
                                </div>

                                <div className="recruiters-cta opacity-0">
                                    <a
                                        href="https://splits.network/sign-up"
                                        className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                                    >
                                        <i className="fa-duotone fa-regular fa-rocket"></i>
                                        Join Splits Network
                                    </a>
                                </div>
                            </div>

                            {/* Visual */}
                            <div className="relative">
                                <div className="bg-base-100 text-base-content rounded-2xl shadow-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-xs text-base-content/50 uppercase tracking-wider">
                                                Your Dashboard
                                            </div>
                                            <div className="font-bold text-lg">
                                                Active Roles
                                            </div>
                                        </div>
                                        <div className="badge badge-primary">
                                            3 roles
                                        </div>
                                    </div>
                                    <div className="space-y-3 mb-4">
                                        {recruiterDashboardRoles.map(
                                            (role, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center p-3 bg-base-200 rounded-lg"
                                                >
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {role.title}
                                                        </div>
                                                        <div className="text-xs text-base-content/60">
                                                            {role.company}
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`badge ${role.color} badge-sm`}
                                                    >
                                                        {role.status}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs text-base-content/60 uppercase tracking-wider">
                                                    This Month
                                                </div>
                                                <div className="text-3xl font-bold text-primary">
                                                    $12,450
                                                </div>
                                                <div className="text-xs text-base-content/60 mt-1">
                                                    from 3 placements
                                                </div>
                                            </div>
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                                <i className="fa-duotone fa-regular fa-chart-line-up text-2xl text-primary"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    FOR CANDIDATES
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="for-candidates"
                    className="candidates-section py-24 bg-secondary text-secondary-content overflow-hidden"
                >
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                            {/* Visual - on left for candidates */}
                            <div className="relative order-2 lg:order-1">
                                <div className="bg-base-100 text-base-content rounded-2xl shadow-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-xs text-base-content/50 uppercase tracking-wider">
                                                Your Applications
                                            </div>
                                            <div className="font-bold text-lg">
                                                Active Pipeline
                                            </div>
                                        </div>
                                        <div className="badge badge-secondary">
                                            5 active
                                        </div>
                                    </div>
                                    <div className="space-y-3 mb-4">
                                        {candidateDashboardApps.map(
                                            (app, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center p-3 bg-base-200 rounded-lg"
                                                >
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {app.title}
                                                        </div>
                                                        <div className="text-xs text-base-content/60">
                                                            {app.company}
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`badge ${app.color} badge-sm`}
                                                    >
                                                        {app.status}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs text-base-content/60 uppercase tracking-wider">
                                                    Your Recruiter
                                                </div>
                                                <div className="font-bold text-lg text-secondary">
                                                    Sarah Chen
                                                </div>
                                                <div className="text-xs text-base-content/60 mt-1">
                                                    Tech Recruiting Specialist
                                                </div>
                                            </div>
                                            <div className="avatar">
                                                <div className="w-14 h-14 rounded-full bg-secondary text-secondary-content flex items-center justify-center text-xl font-bold">
                                                    SC
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                            </div>

                            {/* Content - on right for candidates */}
                            <div className="order-1 lg:order-2">
                                <div className="candidates-heading opacity-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src="/applicant.png"
                                            alt="Applicant Network"
                                            className="h-8"
                                        />
                                        <span className="badge badge-outline">
                                            For Job Seekers
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                        Your job search,
                                        <br />
                                        <span className="opacity-90">
                                            with backup
                                        </span>
                                    </h2>
                                    <p className="text-lg opacity-80 mb-8">
                                        Get matched with expert recruiters who
                                        open doors, prep you for interviews, and
                                        make sure you never get ghosted again.
                                    </p>
                                </div>

                                <div className="candidates-benefits space-y-4 mb-8">
                                    {candidateBenefits.map((benefit, index) => (
                                        <div
                                            key={index}
                                            className="benefit-item flex items-start gap-4 opacity-0"
                                        >
                                            <div className="benefit-icon w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <i
                                                    className={`${benefit.icon} text-sm`}
                                                ></i>
                                            </div>
                                            <p className="opacity-90 leading-relaxed">
                                                {benefit.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="candidates-features flex flex-wrap gap-2 mb-8">
                                    {candidateFeatures.map((feature, index) => (
                                        <span
                                            key={index}
                                            className="feature-badge badge badge-lg bg-white/10 border-white/20 gap-2 opacity-0"
                                        >
                                            <i
                                                className={`${feature.icon} text-xs`}
                                            ></i>
                                            {feature.label}
                                        </span>
                                    ))}
                                </div>

                                <div className="candidates-cta opacity-0">
                                    <a
                                        href="https://applicant.network/sign-up"
                                        className="btn btn-lg bg-white text-secondary hover:bg-white/90 border-0 shadow-lg"
                                    >
                                        <i className="fa-duotone fa-regular fa-user-plus"></i>
                                        Create Free Profile
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    FOR COMPANIES
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="for-companies"
                    className="companies-section py-24 bg-base-200 overflow-hidden"
                >
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                            {/* Content */}
                            <div>
                                <div className="companies-heading opacity-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src="/splits.png"
                                            alt="Splits Network"
                                            className="h-8"
                                        />
                                        <span className="badge badge-accent">
                                            For Companies
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                        A network of recruiters,
                                        <br />
                                        <span className="text-accent">
                                            one simple platform
                                        </span>
                                    </h2>
                                    <p className="text-lg text-base-content/70 mb-8">
                                        Stop managing dozens of contracts. Get
                                        qualified candidates from vetted
                                        recruiters with complete transparency.
                                    </p>
                                </div>

                                <div className="companies-benefits space-y-4 mb-8">
                                    {companyBenefits.map((benefit, index) => (
                                        <div
                                            key={index}
                                            className="benefit-item flex items-start gap-4 opacity-0"
                                        >
                                            <div className="benefit-icon w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <i
                                                    className={`${benefit.icon} text-sm text-accent`}
                                                ></i>
                                            </div>
                                            <p className="text-base-content/80 leading-relaxed">
                                                {benefit.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="companies-features flex flex-wrap gap-2 mb-8">
                                    {companyFeatures.map((feature, index) => (
                                        <span
                                            key={index}
                                            className="feature-badge badge badge-lg bg-accent/10 border-yellow/20 text-accent gap-2 opacity-0"
                                        >
                                            <i
                                                className={`${feature.icon} text-xs`}
                                            ></i>
                                            {feature.label}
                                        </span>
                                    ))}
                                </div>

                                <div className="companies-cta opacity-0">
                                    <a
                                        href="https://splits.network/sign-up"
                                        className="btn btn-lg btn-accent shadow-lg"
                                    >
                                        <i className="fa-duotone fa-regular fa-building"></i>
                                        Post a Role
                                    </a>
                                </div>
                            </div>

                            {/* Visual */}
                            <div className="relative">
                                <div className="bg-base-100 rounded-2xl shadow-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-xs text-base-content/50 uppercase tracking-wider">
                                                Company Dashboard
                                            </div>
                                            <div className="font-bold text-lg">
                                                Your Open Roles
                                            </div>
                                        </div>
                                        <div className="badge badge-accent">
                                            3 active
                                        </div>
                                    </div>
                                    <div className="space-y-3 mb-4">
                                        {companyDashboardRoles.map(
                                            (role, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 bg-base-200 rounded-lg"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="font-medium text-sm">
                                                                {role.title}
                                                            </div>
                                                            <div className="text-xs text-base-content/60">
                                                                {role.location}
                                                            </div>
                                                        </div>
                                                        <span className="badge badge-success badge-sm">
                                                            {role.candidates}{" "}
                                                            candidates
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 text-xs">
                                                        <span className="badge badge-ghost badge-sm">
                                                            {role.recruiters}{" "}
                                                            recruiters
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs text-base-content/60 uppercase tracking-wider">
                                                    Total Candidates
                                                </div>
                                                <div className="text-3xl font-bold text-accent">
                                                    15
                                                </div>
                                                <div className="text-xs text-base-content/60 mt-1">
                                                    across 3 active roles
                                                </div>
                                            </div>
                                            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                                                <i className="fa-duotone fa-regular fa-users text-2xl text-accent"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    ECOSYSTEM
                   ══════════════════════════════════════════════════════════ */}
                <section className="ecosystem-section py-24 bg-base-100 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="ecosystem-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <p className="text-sm uppercase tracking-wider text-primary mb-3">
                                Connected Platforms
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                One ecosystem,{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                    everyone wins
                                </span>
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Companies, recruiters, and candidates all
                                connected through platforms designed to work
                                together seamlessly.
                            </p>
                        </div>

                        <div className="ecosystem-diagram relative max-w-4xl mx-auto">
                            {/* SVG connecting lines */}
                            <svg
                                className="ecosystem-arrows absolute inset-0 w-full h-full pointer-events-none hidden md:block"
                                viewBox="0 0 800 400"
                                preserveAspectRatio="xMidYMid meet"
                            >
                                <defs>
                                    <linearGradient
                                        id="lineGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#233876" />
                                        <stop
                                            offset="100%"
                                            stopColor="#0f9d8a"
                                        />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M 160 200 Q 280 200 400 200"
                                    stroke="url(#lineGradient)"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M 640 200 Q 520 200 400 200"
                                    stroke="url(#lineGradient)"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M 400 80 Q 400 140 400 200"
                                    stroke="url(#lineGradient)"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M 400 320 Q 400 260 400 200"
                                    stroke="url(#lineGradient)"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                            </svg>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-center min-h-[400px]">
                                {/* Left column - Recruiters */}
                                <div className="platform-card bg-primary text-primary-content rounded-2xl p-6 shadow-xl opacity-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <i className="fa-duotone fa-regular fa-user-tie text-2xl"></i>
                                        <div>
                                            <div className="font-bold">
                                                Recruiters
                                            </div>
                                            <div className="text-xs opacity-70">
                                                Splits Network
                                            </div>
                                        </div>
                                    </div>
                                    <ul className="text-sm space-y-2 opacity-90">
                                        <li className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                            Access roles
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                            Submit candidates
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                            Earn splits
                                        </li>
                                    </ul>
                                </div>

                                {/* Center column - Hub + Companies */}
                                <div className="flex flex-col items-center gap-8">
                                    <div className="platform-card bg-base-200 rounded-2xl p-6 shadow-xl opacity-0 w-full">
                                        <div className="flex items-center gap-3 mb-4">
                                            <i className="fa-duotone fa-regular fa-building text-2xl text-accent"></i>
                                            <div>
                                                <div className="font-bold">
                                                    Companies
                                                </div>
                                                <div className="text-xs text-base-content/60">
                                                    Splits Network
                                                </div>
                                            </div>
                                        </div>
                                        <ul className="text-sm space-y-2 text-base-content/80">
                                            <li className="flex items-center gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-xs text-accent"></i>
                                                Post roles
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-xs text-accent"></i>
                                                Review candidates
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-xs text-accent"></i>
                                                Make hires
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="center-hub w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl opacity-0">
                                        <i className="fa-duotone fa-regular fa-arrows-to-circle text-3xl text-white"></i>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-sm font-semibold text-base-content/60">
                                            Seamless Data Flow
                                        </div>
                                    </div>
                                </div>

                                {/* Right column - Candidates */}
                                <div className="platform-card bg-secondary text-secondary-content rounded-2xl p-6 shadow-xl opacity-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <i className="fa-duotone fa-regular fa-user text-2xl"></i>
                                        <div>
                                            <div className="font-bold">
                                                Candidates
                                            </div>
                                            <div className="text-xs opacity-70">
                                                Applicant Network
                                            </div>
                                        </div>
                                    </div>
                                    <ul className="text-sm space-y-2 opacity-90">
                                        <li className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                            Apply to jobs
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                            Get matched
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                            Track progress
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    METRICS
                   ══════════════════════════════════════════════════════════ */}
                <section className="metrics-section py-24 bg-neutral text-neutral-content overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="metrics-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <p className="text-sm uppercase tracking-wider opacity-60 mb-3">
                                By The Numbers
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                A Growing Ecosystem
                            </h2>
                            <p className="text-lg opacity-70">
                                Thousands of recruiters, companies, and
                                candidates building transparent partnerships
                            </p>
                        </div>

                        <div className="metrics-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            {metrics.map((metric, index) => (
                                <div
                                    key={index}
                                    className="metric-card bg-base-100/5 border border-base-100/10 rounded-2xl p-8 text-center opacity-0"
                                >
                                    <div
                                        className={`metric-icon w-16 h-16 rounded-full bg-${metric.color}/20 flex items-center justify-center mx-auto mb-6`}
                                    >
                                        <i
                                            className={`${metric.icon} text-2xl text-${metric.color}`}
                                        ></i>
                                    </div>
                                    <div
                                        className={`metric-value text-4xl md:text-5xl font-bold text-${metric.color} mb-2`}
                                        data-value={metric.value}
                                        data-suffix={metric.suffix}
                                    >
                                        {metric.value >= 1000
                                            ? metric.value.toLocaleString()
                                            : metric.value}
                                        {metric.suffix}
                                    </div>
                                    <div className="font-semibold text-lg mb-1">
                                        {metric.label}
                                    </div>
                                    <div className="text-sm opacity-60">
                                        {metric.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    FAQ
                   ══════════════════════════════════════════════════════════ */}
                <section className="faq-section py-24 bg-base-200 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="faq-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <p className="text-sm uppercase tracking-wider text-primary mb-3">
                                Common Questions
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Everything you need to know about our platforms
                            </p>
                        </div>

                        <div className="faq-list max-w-3xl mx-auto space-y-4">
                            {corporateFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="faq-item collapse collapse-plus bg-base-100 rounded-xl shadow-sm opacity-0"
                                >
                                    <input
                                        type="radio"
                                        name="corporate-landing-faq"
                                        defaultChecked={index === 0}
                                    />
                                    <div className="collapse-title font-semibold text-lg pr-12">
                                        {faq.question}
                                    </div>
                                    <div className="collapse-content">
                                        <p className="text-base-content/70 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    CTA
                   ══════════════════════════════════════════════════════════ */}
                <section
                    id="contact"
                    className="cta-section py-24 bg-gradient-to-br from-primary to-secondary text-white overflow-hidden relative"
                >
                    {/* Background decorations */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content text-center mb-12 opacity-0 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                Ready to transform how you recruit?
                            </h2>
                            <p className="text-xl opacity-90">
                                Join the ecosystem that&apos;s making recruiting
                                work for everyone
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                            {/* Recruiters Card */}
                            <div className="cta-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 opacity-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-user-tie text-xl"></i>
                                    </div>
                                    <div>
                                        <div className="font-bold">
                                            Recruiters
                                        </div>
                                        <div className="text-xs opacity-70">
                                            Splits Network
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm opacity-80 mb-6">
                                    Join a collaborative marketplace with
                                    curated roles and transparent splits.
                                </p>
                                <a
                                    href="https://splits.network/sign-up"
                                    className="btn btn-sm bg-white text-primary hover:bg-white/90 border-0 w-full hover:scale-105 transition-transform"
                                >
                                    Join Network
                                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                </a>
                            </div>

                            {/* Companies Card */}
                            <div className="cta-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 opacity-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-building text-xl"></i>
                                    </div>
                                    <div>
                                        <div className="font-bold">
                                            Companies
                                        </div>
                                        <div className="text-xs opacity-70">
                                            Splits Network
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm opacity-80 mb-6">
                                    Access a network of recruiters with full
                                    pipeline visibility and pay-on-hire.
                                </p>
                                <a
                                    href="https://splits.network/sign-up"
                                    className="btn btn-sm bg-white text-primary hover:bg-white/90 border-0 w-full hover:scale-105 transition-transform"
                                >
                                    Post a Role
                                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                </a>
                            </div>

                            {/* Candidates Card */}
                            <div className="cta-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 opacity-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-user text-xl"></i>
                                    </div>
                                    <div>
                                        <div className="font-bold">
                                            Candidates
                                        </div>
                                        <div className="text-xs opacity-70">
                                            Applicant Network
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm opacity-80 mb-6">
                                    Get matched with expert recruiters and never
                                    get ghosted again. Free forever.
                                </p>
                                <a
                                    href="https://applicant.network/sign-up"
                                    className="btn btn-sm bg-white text-secondary hover:bg-white/90 border-0 w-full hover:scale-105 transition-transform"
                                >
                                    Create Profile
                                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>

                        <div className="cta-footer text-center opacity-0">
                            <p className="text-sm opacity-70 mb-4">
                                Questions? Reach out to us directly.
                            </p>
                            <a
                                href="mailto:hello@employment-networks.com"
                                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                hello@employment-networks.com
                            </a>
                        </div>
                    </div>
                </section>
            </LandingAnimator>
        </>
    );
}
