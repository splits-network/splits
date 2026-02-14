import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@splits-network/shared-ui";
import { buildCanonical } from "@/lib/seo";
import { Header } from "@/components/header";
import { LandingAnimator } from "@/components/landing/landing-animator";
import { portalFaqs } from "@/components/landing/sections/faq-data";

// ── Data arrays ─────────────────────────────────────────────────────────────

const painPoints = [
    {
        icon: "fa-duotone fa-regular fa-table-cells text-secondary",
        title: "Spreadsheet chaos",
        description:
            "Tracking splits across Excel files, hoping nothing gets lost between versions.",
    },
    {
        icon: "fa-duotone fa-regular fa-envelopes-bulk text-accent",
        title: "Email black holes",
        description:
            "Where did that candidate submission go? Check 47 threads to find out.",
    },
    {
        icon: "fa-duotone fa-regular fa-calculator text-info",
        title: "Mystery math",
        description:
            "Fees that change, clawbacks that surprise, splits that never quite add up.",
    },
    {
        icon: "fa-duotone fa-regular fa-eye-slash text-warning",
        title: "Zero visibility",
        description:
            "Is anyone working this role? Did the candidate move forward? Who knows.",
    },
];

const promises = [
    {
        icon: "fa-duotone fa-regular fa-grid-2",
        title: "One platform",
        description: "All your split deals in one place",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Transparent terms",
        description: "Everyone sees the same numbers",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Real-time visibility",
        description: "Know where every candidate stands",
    },
];

const recruiterSteps = [
    {
        number: 1,
        icon: "fa-duotone fa-regular fa-user-plus",
        title: "Join the network",
        description:
            "Sign up, set your specialties, and browse roles that match your expertise.",
    },
    {
        number: 2,
        icon: "fa-duotone fa-regular fa-paper-plane",
        title: "Submit candidates",
        description:
            "Found the right fit? Submit them directly into the hiring pipeline.",
    },
    {
        number: 3,
        icon: "fa-duotone fa-regular fa-money-bill-wave",
        title: "Get paid your split",
        description:
            "Candidate hired? You receive your share. Tracked transparently.",
    },
];

const companySteps = [
    {
        number: 1,
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Post your roles",
        description:
            "List positions with clear requirements, fees, and timelines.",
    },
    {
        number: 2,
        icon: "fa-duotone fa-regular fa-users",
        title: "Tap the network",
        description:
            "Specialized recruiters see your roles and start sourcing candidates.",
    },
    {
        number: 3,
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Pay only on hire",
        description:
            "No retainers. Pay the agreed split only when someone starts.",
    },
];

const recruiterBenefits = [
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        text: "Access curated roles that match your expertise\u2014no cold outreach needed",
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
        text: "See exactly what you\u2019ll earn on each placement. No mystery math.",
    },
    {
        icon: "fa-duotone fa-regular fa-rocket",
        text: "Scale your business with a network that brings opportunities to you",
    },
];

const recruiterDashboardRoles = [
    {
        title: "Senior Software Engineer",
        company: "TechCorp",
        status: "Active",
        statusColor: "badge-primary",
    },
    {
        title: "Product Manager",
        company: "StartupXYZ",
        status: "Interviewing",
        statusColor: "badge-info",
    },
    {
        title: "UX Designer",
        company: "DesignCo",
        status: "Offer Stage",
        statusColor: "badge-success",
    },
];

const companyBenefits = [
    {
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        text: "Tap into a network of specialized recruiters\u2014no need to manage individual contracts",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        text: "Full visibility into every pipeline. See who\u2019s working your roles and where candidates stand.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        text: "Set fees and terms once. They apply to every recruiter consistently.",
    },
    {
        icon: "fa-duotone fa-regular fa-hand-holding-dollar",
        text: "Pay only when someone starts. No retainers, no surprises.",
    },
    {
        icon: "fa-duotone fa-regular fa-messages",
        text: "All communication in one place. No more email threads or spreadsheet chaos.",
    },
];

const companyDashboardRoles = [
    {
        title: "Backend Engineer",
        location: "San Francisco, CA",
        candidates: 5,
        candidateColor: "badge-success",
        recruiters: 3,
        fee: "20%",
    },
    {
        title: "Sales Director",
        location: "Remote",
        candidates: 2,
        candidateColor: "badge-info",
        recruiters: 2,
        fee: "25%",
    },
    {
        title: "Product Manager",
        location: "New York, NY",
        candidates: 8,
        candidateColor: "badge-success",
        recruiters: 4,
        fee: "22%",
    },
];

const features = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Split-first by design",
        description:
            "Built for split placements from day one, not retrofitted onto a traditional ATS.",
        color: "primary",
    },
    {
        icon: "fa-duotone fa-regular fa-sitemap",
        title: "Built-in ATS",
        description:
            "Jobs, candidates, stages, and notes all in one place. No integrations needed.",
        color: "secondary",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Real-time pipelines",
        description:
            "Everyone sees where each candidate stands in the process, instantly.",
        color: "accent",
    },
    {
        icon: "fa-duotone fa-regular fa-file-invoice-dollar",
        title: "Transparent fee splits",
        description:
            "Clear view of fee percentage, recruiter share, and platform share. No mystery math.",
        color: "primary",
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Recruiter network",
        description:
            "Assign roles to recruiters and control who sees which opportunities.",
        color: "secondary",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Smart notifications",
        description:
            "Email alerts for key events: new submissions, stage changes, and placements.",
        color: "accent",
    },
];

const featureColorClasses: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    accent: "text-accent bg-accent/10",
};

type ComparisonStatus = "good" | "partial" | "poor";

const comparisonData: Array<{
    feature: string;
    spreadsheets: { status: ComparisonStatus; text: string };
    otherAts: { status: ComparisonStatus; text: string };
    splits: { status: ComparisonStatus; text: string };
}> = [
    {
        feature: "Split placement tracking",
        spreadsheets: { status: "poor", text: "Manual" },
        otherAts: { status: "partial", text: "Retrofitted" },
        splits: { status: "good", text: "Native" },
    },
    {
        feature: "Fee transparency",
        spreadsheets: { status: "poor", text: "None" },
        otherAts: { status: "partial", text: "Varies" },
        splits: { status: "good", text: "Full visibility" },
    },
    {
        feature: "Recruiter network",
        spreadsheets: { status: "poor", text: "DIY" },
        otherAts: { status: "partial", text: "Limited" },
        splits: { status: "good", text: "Built-in" },
    },
    {
        feature: "Pipeline visibility",
        spreadsheets: { status: "poor", text: "Scattered" },
        otherAts: { status: "partial", text: "Siloed" },
        splits: { status: "good", text: "Real-time" },
    },
    {
        feature: "Payment tracking",
        spreadsheets: { status: "poor", text: "Manual" },
        otherAts: { status: "partial", text: "External" },
        splits: { status: "good", text: "Integrated" },
    },
    {
        feature: "Multi-party collaboration",
        spreadsheets: { status: "poor", text: "Email chains" },
        otherAts: { status: "partial", text: "Bolt-on" },
        splits: { status: "good", text: "Core feature" },
    },
];

const metrics = [
    {
        value: "100%",
        label: "Fee transparency",
        description: "Every split is visible to all parties",
        icon: "fa-duotone fa-regular fa-eye",
    },
    {
        value: "Zero",
        label: "Hidden clawbacks",
        description: "No surprise deductions, ever",
        icon: "fa-duotone fa-regular fa-shield-check",
    },
    {
        value: "Real-time",
        label: "Pipeline visibility",
        description: "Know where every candidate stands",
        icon: "fa-duotone fa-regular fa-chart-line",
    },
    {
        value: "One",
        label: "Platform for everything",
        description: "No more spreadsheet chaos",
        icon: "fa-duotone fa-regular fa-grid-2",
    },
];

const exampleBreakdown = [
    { value: 120000, label: "Candidate Salary", color: "text-primary" },
    { value: 24000, label: "Placement Fee (20%)", color: "text-secondary" },
    { value: 18000, label: "Recruiter Share (75%)", color: "text-accent" },
];

// ── Helper components ───────────────────────────────────────────────────────

function StatusIcon({ status }: { status: ComparisonStatus }) {
    if (status === "good") {
        return (
            <i className="fa-duotone fa-regular fa-circle-check text-success text-lg"></i>
        );
    }
    if (status === "partial") {
        return (
            <i className="fa-duotone fa-regular fa-circle-minus text-warning text-lg"></i>
        );
    }
    return (
        <i className="fa-duotone fa-regular fa-circle-xmark text-error/60 text-lg"></i>
    );
}

function TimelineStep({
    number,
    icon,
    title,
    description,
    color,
    isLast,
}: {
    number: number;
    icon: string;
    title: string;
    description: string;
    color: "primary" | "secondary";
    isLast: boolean;
}) {
    const colorClasses = {
        primary: {
            bg: "bg-primary",
            text: "text-primary",
            line: "bg-primary/30",
            glow: "shadow-primary/20",
        },
        secondary: {
            bg: "bg-secondary",
            text: "text-secondary",
            line: "bg-secondary/30",
            glow: "shadow-secondary/20",
        },
    };
    const colors = colorClasses[color];

    return (
        <div className="timeline-step relative flex items-start gap-6">
            <div className="flex flex-col items-center">
                <div
                    className={`step-node relative z-10 w-16 h-16 rounded-full ${colors.bg} text-white flex items-center justify-center shadow-lg ${colors.glow} shadow-xl`}
                >
                    <span className="text-2xl font-bold">{number}</span>
                </div>
                {!isLast && (
                    <div
                        className={`timeline-line w-0.5 h-24 ${colors.line} mt-2`}
                    ></div>
                )}
            </div>
            <div className="step-content flex-1 pt-2 pb-8">
                <div
                    className={`inline-flex items-center gap-2 mb-2 ${colors.text}`}
                >
                    <i className={`${icon} text-xl`}></i>
                    <h4 className="font-bold text-xl text-base-content">
                        {title}
                    </h4>
                </div>
                <p className="text-base-content/70 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}

// ── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
    title: "Recruiting Marketplace for Split Placements",
    description:
        "Collaborate with recruiters, share roles, and split fees on Splits Network.",
    openGraph: {
        title: "Recruiting Marketplace for Split Placements",
        description:
            "Collaborate with recruiters, share roles, and split fees on Splits Network.",
        url: "https://splits.network",
    },
    ...buildCanonical(""),
};

// ── Page ────────────────────────────────────────────────────────────────────

export default async function HomePage() {
    const homeJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Splits Network - Recruiting Marketplace",
        url: "https://splits.network",
        description:
            "Collaborate with recruiters, share roles, and split fees on Splits Network.",
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
            <Header />
            <LandingAnimator>
                {/* ═══════════════════════════════════════════════════════════
                    1. HERO
                ═══════════════════════════════════════════════════════════ */}
                <section className="hero-section hero min-h-[90vh] relative overflow-hidden">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="hero-video absolute inset-0 w-full h-full object-contain opacity-25"
                    >
                        <source src="/ads.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-base-100/75"></div>
                    <div className="hero-content text-center max-w-5xl relative z-10 py-20">
                        <div className="space-y-8">
                            <h1 className="hero-headline text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight opacity-0">
                                A recruiting network where
                                <br />
                                <span className="text-secondary">
                                    everyone wins
                                </span>{" "}
                                on the placement
                            </h1>
                            <p className="hero-subtitle text-lg md:text-xl text-base-content/80 max-w-2xl mx-auto leading-relaxed opacity-0">
                                Companies post roles. Recruiters bring
                                candidates. When someone gets hired, everyone
                                gets their split.
                            </p>
                            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link
                                    href="/sign-up"
                                    className="btn btn-primary btn-lg opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-user-tie"></i>
                                    Join as a Recruiter
                                </Link>
                                <Link
                                    href="#for-companies"
                                    className="btn btn-outline btn-lg opacity-0"
                                >
                                    <i className="fa-duotone fa-regular fa-building"></i>
                                    Post Roles as a Company
                                </Link>
                            </div>
                            <div className="hero-tagline text-sm text-base-content/60 pt-4 opacity-0">
                                Built by recruiters. Designed for transparent
                                splits.
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    2. PROBLEM
                ═══════════════════════════════════════════════════════════ */}
                <section className="problem-section py-24 bg-neutral text-neutral-content">
                    <div className="container mx-auto px-4">
                        <div className="problem-heading text-center mb-16 opacity-0">
                            <p className="text-sm uppercase tracking-wider opacity-60 mb-3">
                                Sound familiar?
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                Split placements shouldn&apos;t be this hard
                            </h2>
                            <p className="text-lg opacity-70 max-w-2xl mx-auto">
                                Most recruiters and companies are still running
                                split deals the old way.
                            </p>
                        </div>
                        <div className="pain-cards grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                            {painPoints.map((point, index) => (
                                <div
                                    key={index}
                                    className="pain-card card bg-base-100/10 border border-base-100/20 backdrop-blur-sm opacity-0"
                                >
                                    <div className="card-body text-center">
                                        <div className="mb-4">
                                            <i
                                                className={`pain-icon ${point.icon} text-4xl`}
                                            ></i>
                                        </div>
                                        <h3 className="card-title justify-center text-lg">
                                            {point.title}
                                        </h3>
                                        <p className="text-sm opacity-70">
                                            {point.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    3. SOLUTION BRIDGE
                ═══════════════════════════════════════════════════════════ */}
                <section className="bridge-section py-24 bg-base-100">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="bridge-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-16 opacity-0">
                            What if split placements
                            <br />
                            <span className="text-secondary">just worked?</span>
                        </h2>
                        <div className="promise-cards grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {promises.map((promise, index) => (
                                <div
                                    key={index}
                                    className="promise-item opacity-0"
                                >
                                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                                        <i
                                            className={`${promise.icon} text-2xl text-secondary`}
                                        ></i>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">
                                        {promise.title}
                                    </h3>
                                    <p className="text-base-content/70">
                                        {promise.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    4. HOW IT WORKS
                ═══════════════════════════════════════════════════════════ */}
                <section
                    id="how-it-works"
                    className="how-section py-24 bg-base-200 text-base-content overflow-hidden relative"
                >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <svg
                            className="absolute w-full h-full"
                            viewBox="0 0 1200 800"
                            preserveAspectRatio="xMidYMid slice"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M0 100 Q300 200 400 400 T600 700"
                                fill="none"
                                stroke="oklch(var(--color-primary))"
                                strokeWidth="2"
                                strokeOpacity="0.08"
                                className="path-line"
                            />
                            <path
                                d="M-50 200 Q250 300 350 450 T550 750"
                                fill="none"
                                stroke="oklch(var(--color-primary))"
                                strokeWidth="1.5"
                                strokeOpacity="0.05"
                                className="path-line"
                            />
                            <path
                                d="M1200 100 Q900 200 800 400 T600 700"
                                fill="none"
                                stroke="oklch(var(--color-secondary))"
                                strokeWidth="2"
                                strokeOpacity="0.08"
                                className="path-line"
                            />
                            <path
                                d="M1250 200 Q950 300 850 450 T650 750"
                                fill="none"
                                stroke="oklch(var(--color-secondary))"
                                strokeWidth="1.5"
                                strokeOpacity="0.05"
                                className="path-line"
                            />
                            <pattern
                                id="dotPattern"
                                x="0"
                                y="0"
                                width="40"
                                height="40"
                                patternUnits="userSpaceOnUse"
                            >
                                <circle
                                    cx="20"
                                    cy="20"
                                    r="1"
                                    fill="currentColor"
                                    fillOpacity="0.05"
                                />
                            </pattern>
                            <rect
                                width="100%"
                                height="100%"
                                fill="url(#dotPattern)"
                            />
                            <circle
                                cx="600"
                                cy="700"
                                r="100"
                                fill="url(#convergenceGlow)"
                            />
                            <defs>
                                <radialGradient
                                    id="convergenceGlow"
                                    cx="50%"
                                    cy="50%"
                                    r="50%"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="oklch(var(--color-primary))"
                                        stopOpacity="0.1"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="oklch(var(--color-primary))"
                                        stopOpacity="0"
                                    />
                                </radialGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="how-heading text-center mb-20 opacity-0">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                Two paths, one platform
                            </h2>
                            <p className="text-lg opacity-70 max-w-2xl mx-auto">
                                Whether you&apos;re sourcing candidates or
                                hiring them, the journey is simple.
                            </p>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto mb-16">
                            <div className="recruiter-track">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-user-tie text-primary"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold">
                                        For Recruiters
                                    </h3>
                                </div>
                                <div className="pl-2">
                                    {recruiterSteps.map((step, index) => (
                                        <TimelineStep
                                            key={step.number}
                                            {...step}
                                            color="primary"
                                            isLast={
                                                index ===
                                                recruiterSteps.length - 1
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="company-track">
                                <div className="flex items-center gap-3 mb-10 lg:justify-end">
                                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-building text-secondary"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold">
                                        For Companies
                                    </h3>
                                </div>
                                <div className="lg:pr-2">
                                    {companySteps.map((step, index) => (
                                        <TimelineStep
                                            key={step.number}
                                            {...step}
                                            color="secondary"
                                            isLast={
                                                index ===
                                                companySteps.length - 1
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="convergence-point text-center opacity-0">
                            <div className="inline-flex items-center gap-4 px-8 py-6 rounded-2xl bg-base-100 shadow-lg border border-base-300">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md">
                                    <i className="fa-duotone fa-regular fa-user-tie text-white text-lg"></i>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <i className="fa-duotone fa-regular fa-arrows-to-circle text-2xl text-base-content/40"></i>
                                    <span className="text-sm font-medium text-base-content/70">
                                        Successful placement
                                    </span>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shadow-md">
                                    <i className="fa-duotone fa-regular fa-building text-white text-lg"></i>
                                </div>
                            </div>
                            <p className="mt-6 text-base-content/50 text-sm">
                                Both paths lead to the same destination: a hire
                                that works for everyone.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    5. FOR RECRUITERS
                ═══════════════════════════════════════════════════════════ */}
                <section
                    id="for-recruiters"
                    className="recruiters-section py-24 bg-primary text-primary-content overflow-hidden"
                >
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                            <div>
                                <div className="recruiters-heading opacity-0">
                                    <p className="text-sm uppercase tracking-wider opacity-70 mb-3">
                                        For Recruiters
                                    </p>
                                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                        Turn your network into
                                        <br />
                                        <span className="opacity-90">
                                            recurring revenue
                                        </span>
                                    </h2>
                                    <p className="text-lg opacity-80 mb-8">
                                        Stop chasing roles. Let opportunities
                                        come to you.
                                    </p>
                                </div>
                                <div className="recruiters-benefits space-y-4 mb-10">
                                    {recruiterBenefits.map(
                                        (benefit, index) => (
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
                                        ),
                                    )}
                                </div>
                                <div className="recruiters-cta opacity-0">
                                    <Link
                                        href="/sign-up"
                                        className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                                    >
                                        <i className="fa-duotone fa-regular fa-rocket"></i>
                                        Join as a Recruiter
                                    </Link>
                                </div>
                            </div>
                            <div
                                className="recruiters-dashboard relative opacity-0"
                                style={{ perspective: "1000px" }}
                            >
                                <div className="card bg-base-100 text-base-content shadow-2xl">
                                    <div className="card-body p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <div className="text-xs text-base-content/50 uppercase tracking-wider">
                                                    Dashboard
                                                </div>
                                                <div className="font-bold text-lg">
                                                    Your Active Roles
                                                </div>
                                            </div>
                                            <div className="badge badge-primary badge-outline">
                                                3 roles
                                            </div>
                                        </div>
                                        <div className="space-y-3 mb-4">
                                            {recruiterDashboardRoles.map(
                                                (role, index) => (
                                                    <div
                                                        key={index}
                                                        className="dashboard-row flex justify-between items-center p-3 bg-base-200 rounded-lg opacity-0"
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
                                                            className={`badge ${role.statusColor} badge-sm`}
                                                        >
                                                            {role.status}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                        <div className="divider my-2"></div>
                                        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-xs text-base-content/60 uppercase tracking-wider">
                                                        This Month
                                                    </div>
                                                    <div
                                                        className="stat-counter text-3xl font-bold text-primary"
                                                        data-value="12450"
                                                        data-prefix="$"
                                                    >
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
                                </div>
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    6. FOR COMPANIES
                ═══════════════════════════════════════════════════════════ */}
                <section
                    id="for-companies"
                    className="companies-section py-24 bg-secondary text-secondary-content overflow-hidden"
                >
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                            <div
                                className="companies-dashboard relative opacity-0 order-2 lg:order-1"
                                style={{ perspective: "1000px" }}
                            >
                                <div className="card bg-base-100 text-base-content shadow-2xl">
                                    <div className="card-body p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <div className="text-xs text-base-content/50 uppercase tracking-wider">
                                                    Company Dashboard
                                                </div>
                                                <div className="font-bold text-lg">
                                                    Your Open Roles
                                                </div>
                                            </div>
                                            <div className="badge badge-secondary badge-outline">
                                                3 active
                                            </div>
                                        </div>
                                        <div className="space-y-3 mb-4">
                                            {companyDashboardRoles.map(
                                                (role, index) => (
                                                    <div
                                                        key={index}
                                                        className="dashboard-row p-3 bg-base-200 rounded-lg opacity-0"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <div className="font-medium text-sm">
                                                                    {
                                                                        role.title
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-base-content/60">
                                                                    {
                                                                        role.location
                                                                    }
                                                                </div>
                                                            </div>
                                                            <span
                                                                className={`badge ${role.candidateColor} badge-sm`}
                                                            >
                                                                {
                                                                    role.candidates
                                                                }{" "}
                                                                candidates
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2 text-xs">
                                                            <span className="badge badge-ghost badge-sm">
                                                                {
                                                                    role.recruiters
                                                                }{" "}
                                                                recruiters
                                                            </span>
                                                            <span className="badge badge-ghost badge-sm">
                                                                {role.fee} fee
                                                            </span>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                        <div className="divider my-2"></div>
                                        <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-xs text-base-content/60 uppercase tracking-wider">
                                                        Total Candidates
                                                    </div>
                                                    <div
                                                        className="stat-counter text-3xl font-bold text-secondary"
                                                        data-value="15"
                                                        data-prefix=""
                                                    >
                                                        15
                                                    </div>
                                                    <div className="text-xs text-base-content/60 mt-1">
                                                        across 3 active roles
                                                    </div>
                                                </div>
                                                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                                                    <i className="fa-duotone fa-regular fa-users text-2xl text-secondary"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="companies-heading opacity-0">
                                    <p className="text-sm uppercase tracking-wider opacity-70 mb-3">
                                        For Companies
                                    </p>
                                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                        A network of recruiters,
                                        <br />
                                        <span className="opacity-90">
                                            one simple platform
                                        </span>
                                    </h2>
                                    <p className="text-lg opacity-80 mb-8">
                                        Stop managing dozens of contracts. Get
                                        qualified candidates from vetted
                                        recruiters.
                                    </p>
                                </div>
                                <div className="companies-benefits space-y-4 mb-10">
                                    {companyBenefits.map(
                                        (benefit, index) => (
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
                                        ),
                                    )}
                                </div>
                                <div className="companies-cta opacity-0">
                                    <Link
                                        href="/sign-up"
                                        className="btn btn-lg bg-white text-secondary hover:bg-white/90 border-0 shadow-lg"
                                    >
                                        <i className="fa-duotone fa-regular fa-building"></i>
                                        Post a Role
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    7. MONEY FLOW
                ═══════════════════════════════════════════════════════════ */}
                <section className="money-section py-24 bg-base-100 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="money-heading text-center mb-16 opacity-0">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                Follow the money
                            </h2>
                            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                                See exactly where every dollar goes. Clear
                                terms, no surprise clawbacks.
                            </p>
                        </div>
                        <div className="flow-cards max-w-5xl mx-auto mb-16">
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
                                <div className="flow-card card bg-primary text-primary-content shadow-xl w-full lg:w-56 opacity-0">
                                    <div className="card-body items-center text-center p-6">
                                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                                            <i className="fa-duotone fa-regular fa-building text-3xl"></i>
                                        </div>
                                        <h3 className="card-title text-lg">
                                            Company
                                        </h3>
                                        <p className="text-sm opacity-80">
                                            Pays placement fee
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden lg:flex items-center justify-center w-20">
                                    <svg
                                        className="arrow-svg w-full h-8"
                                        viewBox="0 0 80 32"
                                    >
                                        <path
                                            className="arrow-path"
                                            d="M0 16 L60 16 L50 6 M60 16 L50 26"
                                            fill="none"
                                            stroke="oklch(var(--color-primary))"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <div className="lg:hidden flex items-center justify-center h-12">
                                    <i className="fa-duotone fa-regular fa-arrow-down text-3xl text-primary"></i>
                                </div>
                                <div className="flow-card card bg-secondary text-secondary-content shadow-xl w-full lg:w-56 opacity-0">
                                    <div className="card-body items-center text-center p-6">
                                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                                            <i className="fa-duotone fa-regular fa-handshake text-3xl"></i>
                                        </div>
                                        <h3 className="card-title text-lg">
                                            Splits Network
                                        </h3>
                                        <p className="text-sm opacity-80">
                                            Platform share (25%)
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden lg:flex items-center justify-center w-20">
                                    <svg
                                        className="arrow-svg w-full h-8"
                                        viewBox="0 0 80 32"
                                    >
                                        <path
                                            className="arrow-path"
                                            d="M0 16 L60 16 L50 6 M60 16 L50 26"
                                            fill="none"
                                            stroke="oklch(var(--color-secondary))"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <div className="lg:hidden flex items-center justify-center h-12">
                                    <i className="fa-duotone fa-regular fa-arrow-down text-3xl text-secondary"></i>
                                </div>
                                <div className="flow-card card bg-accent text-accent-content shadow-xl w-full lg:w-56 opacity-0">
                                    <div className="card-body items-center text-center p-6">
                                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                                            <i className="fa-duotone fa-regular fa-user-tie text-3xl"></i>
                                        </div>
                                        <h3 className="card-title text-lg">
                                            Recruiter
                                        </h3>
                                        <p className="text-sm opacity-80">
                                            Recruiter share (75%)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="breakdown-card max-w-4xl mx-auto opacity-0">
                            <div className="card bg-base-200 shadow-lg">
                                <div className="card-body">
                                    <h3 className="text-xl font-bold text-center mb-6">
                                        Example Placement
                                    </h3>
                                    <div className="grid md:grid-cols-3 gap-8">
                                        {exampleBreakdown.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="text-center"
                                                >
                                                    <div
                                                        className={`counter-value text-4xl font-bold ${item.color} mb-2`}
                                                        data-value={item.value}
                                                        data-prefix="$"
                                                    >
                                                        $
                                                        {item.value.toLocaleString()}
                                                    </div>
                                                    <div className="text-sm text-base-content/70">
                                                        {item.label}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <div className="divider my-4"></div>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-base-content/60">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-secondary"></div>
                                            <span>
                                                Platform share: $6,000 (25%)
                                            </span>
                                        </div>
                                        <div className="hidden sm:block">
                                            &bull;
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-accent"></div>
                                            <span>
                                                Recruiter receives: $18,000
                                                (75%)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    8. FEATURES
                ═══════════════════════════════════════════════════════════ */}
                <section className="features-section py-24 bg-base-200">
                    <div className="container mx-auto px-4">
                        <div className="features-heading text-center mb-16 opacity-0">
                            <h2 className="text-4xl font-bold mb-4">
                                Everything you need
                            </h2>
                            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                                A complete platform for managing split
                                placements, from first submission to final
                                payout.
                            </p>
                        </div>
                        <div className="feature-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="feature-card card bg-base-100 shadow cursor-default opacity-0 hover:-translate-y-1 hover:shadow-lg transition-all"
                                >
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`feature-icon w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${featureColorClasses[feature.color]}`}
                                            >
                                                <i
                                                    className={`${feature.icon} text-xl`}
                                                ></i>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-1">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-base-content/70 text-sm">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    9. COMPARISON
                ═══════════════════════════════════════════════════════════ */}
                <section className="comparison-section py-24 bg-base-200">
                    <div className="container mx-auto px-4">
                        <div className="comparison-heading text-center mb-12 opacity-0">
                            <h2 className="text-4xl font-bold mb-4">
                                How we compare
                            </h2>
                            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                                Splits Network is built for split placements
                                from the ground up, not retrofitted.
                            </p>
                        </div>
                        <div className="comparison-table max-w-5xl mx-auto overflow-x-auto">
                            <table className="table w-full rounded-xl border border-base-300">
                                <thead>
                                    <tr className="comparison-row opacity-0">
                                        <th className="bg-base-100 text-base-content font-medium w-1/4"></th>
                                        <th className="bg-base-100 text-center text-base-content/70 font-medium">
                                            <div className="flex flex-col items-center gap-1">
                                                <i className="fa-duotone fa-regular fa-table-cells text-2xl opacity-50"></i>
                                                <span>Spreadsheets</span>
                                            </div>
                                        </th>
                                        <th className="bg-base-100 text-center text-base-content/70 font-medium">
                                            <div className="flex flex-col items-center gap-1">
                                                <i className="fa-duotone fa-regular fa-grid-2 text-2xl opacity-50"></i>
                                                <span>Other ATS</span>
                                            </div>
                                        </th>
                                        <th className="bg-secondary/10 text-center font-bold text-secondary splits-cell">
                                            <div className="flex flex-col items-center gap-1">
                                                <i className="fa-duotone fa-regular fa-handshake text-2xl"></i>
                                                <span>Splits Network</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonData.map((row, index) => (
                                        <tr
                                            key={index}
                                            className="comparison-row opacity-0 hover:bg-base-100"
                                        >
                                            <td className="font-medium">
                                                {row.feature}
                                            </td>
                                            <td className="text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <StatusIcon
                                                        status={
                                                            row.spreadsheets
                                                                .status
                                                        }
                                                    />
                                                    <span className="text-sm text-base-content/60">
                                                        {
                                                            row.spreadsheets
                                                                .text
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <StatusIcon
                                                        status={
                                                            row.otherAts
                                                                .status
                                                        }
                                                    />
                                                    <span className="text-sm text-base-content/60">
                                                        {row.otherAts.text}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-center splits-cell">
                                                <div className="flex flex-col items-center gap-1">
                                                    <StatusIcon
                                                        status={
                                                            row.splits.status
                                                        }
                                                    />
                                                    <span className="text-sm font-medium text-secondary">
                                                        {row.splits.text}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    10. METRICS
                ═══════════════════════════════════════════════════════════ */}
                <section className="metrics-section py-24 bg-primary text-primary-content">
                    <div className="container mx-auto px-4">
                        <div className="metrics-heading text-center mb-16 opacity-0">
                            <h2 className="text-4xl font-bold mb-4">
                                Built on transparency
                            </h2>
                            <p className="text-lg opacity-80 max-w-2xl mx-auto">
                                No mystery math. No surprise fees. Just clear
                                terms that everyone can see.
                            </p>
                        </div>
                        <div className="metric-cards grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            {metrics.map((metric, index) => (
                                <div
                                    key={index}
                                    className="metric-card card bg-base-100 text-base-content shadow-lg opacity-0"
                                >
                                    <div className="card-body text-center">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                            <i
                                                className={`${metric.icon} text-xl text-primary`}
                                            ></i>
                                        </div>
                                        <div className="text-4xl font-bold text-primary mb-1">
                                            {metric.value}
                                        </div>
                                        <div className="font-semibold text-lg">
                                            {metric.label}
                                        </div>
                                        <p className="text-sm text-base-content/60 mt-1">
                                            {metric.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    11. FAQ (DaisyUI collapse — no JS needed)
                ═══════════════════════════════════════════════════════════ */}
                <section className="faq-section py-24 bg-base-100 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="faq-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <p className="text-sm uppercase tracking-wider text-primary mb-3">
                                Common Questions
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Everything you need to know about getting
                                started
                            </p>
                        </div>
                        <div className="faq-items max-w-3xl mx-auto space-y-4">
                            {portalFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="faq-item collapse collapse-plus bg-base-200 rounded-xl opacity-0"
                                >
                                    <input
                                        type="radio"
                                        name="portal-landing-faq"
                                    />
                                    <div className="collapse-title font-semibold text-lg">
                                        {faq.question}
                                    </div>
                                    <div className="collapse-content text-base-content/70 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    12. CTA
                ═══════════════════════════════════════════════════════════ */}
                <section
                    id="pricing"
                    className="cta-section py-24 bg-neutral text-neutral-content overflow-hidden relative"
                >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
                    </div>
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="cta-content opacity-0">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                Your next split placement
                                <br />
                                <span className="text-primary">
                                    could close next week
                                </span>
                            </h2>
                            <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
                                Stop juggling spreadsheets and email threads.
                                Give your split placements a proper home.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                            <Link
                                href="/sign-up"
                                className="cta-btn btn btn-lg btn-primary shadow-lg opacity-0 hover:scale-105 transition-transform"
                            >
                                <i className="fa-duotone fa-regular fa-user-tie"></i>
                                Join as a Recruiter
                            </Link>
                            <Link
                                href="/sign-up"
                                className="cta-btn btn btn-lg btn-secondary shadow-lg opacity-0 hover:scale-105 transition-transform"
                            >
                                <i className="fa-duotone fa-regular fa-building"></i>
                                Post Roles as a Company
                            </Link>
                        </div>
                        <p className="cta-footer text-sm opacity-0 max-w-xl mx-auto text-neutral-content/60">
                            Join recruiters and companies building transparent
                            partnerships on Splits Network.
                        </p>
                    </div>
                </section>
            </LandingAnimator>
        </>
    );
}
