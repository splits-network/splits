import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@splits-network/shared-ui";
import { buildCanonical } from "@/lib/seo";
import { candidateFaqs } from "@/components/landing/sections/faq-data";
import { LandingAnimator } from "@/components/landing/landing-animator";

export const metadata: Metadata = {
    title: "Find Your Next Career Opportunity",
    description:
        "Browse thousands of roles and connect with expert recruiters on Applicant Network.",
    openGraph: {
        title: "Find Your Next Career Opportunity",
        description:
            "Browse thousands of roles and connect with expert recruiters on Applicant Network.",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network",
    },
    ...buildCanonical(""),
};

const painPoints = [
    {
        icon: "fa-duotone fa-regular fa-circle-xmark text-secondary",
        iconBg: "bg-secondary/20",
        title: "Application Black Holes",
        text: "You send applications into the void. No response, no feedback, just silence.",
    },
    {
        icon: "fa-duotone fa-regular fa-ghost text-error",
        iconBg: "bg-error/20",
        title: "Ghosted by Recruiters",
        text: "Phone screens go well, then nothing. You're left wondering if you said something wrong.",
    },
    {
        icon: "fa-duotone fa-regular fa-shuffle text-info",
        iconBg: "bg-info/20",
        title: "Endless Job Board Scrolling",
        text: "Hours spent on Indeed, LinkedIn, Glassdoor—duplicates everywhere, outdated listings.",
    },
    {
        icon: "fa-duotone fa-regular fa-question text-warning",
        iconBg: "bg-warning/20",
        title: "No Salary Transparency",
        text: "You invest time interviewing only to discover the pay is half your expectations.",
    },
];

const promises = [
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "A recruiter in your corner",
        text: "Someone who knows your industry and actually advocates for you",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Real communication",
        text: "Status updates, feedback, and responses—not radio silence",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Curated opportunities",
        text: "Roles that match your skills and goals, not keyword spam",
    },
];

const steps = [
    {
        number: "1",
        icon: "fa-duotone fa-regular fa-user-circle",
        title: "Create Your Profile",
        description:
            "Build a profile that showcases your skills, experience, and what you're looking for. Upload your resume to get started in minutes.",
        color: "primary",
    },
    {
        number: "2",
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        title: "Browse & Apply",
        description:
            "Explore curated opportunities from top companies. Apply with one click and get matched with recruiters who specialize in your field.",
        color: "secondary",
    },
    {
        number: "3",
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Get Expert Support",
        description:
            "Your recruiter preps you for interviews, negotiates on your behalf, and keeps you updated every step of the way.",
        color: "accent",
    },
    {
        number: "4",
        icon: "fa-duotone fa-regular fa-rocket",
        title: "Land Your Dream Job",
        description:
            "Accept an offer you're excited about and start your new role with confidence. That's it—no ghosting, no guessing.",
        color: "success",
    },
];

const features = [
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Expert Recruiter Network",
        description:
            "Get matched with specialized recruiters who know your industry and genuinely advocate for your success.",
        color: "primary",
    },
    {
        icon: "fa-duotone fa-regular fa-bolt",
        title: "One-Click Apply",
        description:
            "Apply to multiple jobs instantly with your saved profile—no more copying and pasting the same info.",
        color: "secondary",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Real-Time Updates",
        description:
            "Track your application status and get instant notifications. No more wondering where you stand.",
        color: "accent",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Privacy First",
        description:
            "Your information is secure and only shared with companies you approve. You control your data.",
        color: "success",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Career Insights",
        description:
            "Access salary data, market trends, and personalized recommendations to make informed decisions.",
        color: "warning",
    },
    {
        icon: "fa-duotone fa-regular fa-graduation-cap",
        title: "Interview Prep",
        description:
            "Get coaching and resources from your recruiter to ace interviews with confidence.",
        color: "info",
    },
];

const metrics = [
    {
        value: 10000,
        suffix: "+",
        label: "Active Job Listings",
        description: "New roles added daily from top companies",
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "primary",
    },
    {
        value: 500,
        suffix: "+",
        label: "Companies Hiring",
        description: "From startups to Fortune 500",
        icon: "fa-duotone fa-regular fa-building",
        color: "secondary",
    },
    {
        value: 2000,
        suffix: "+",
        label: "Expert Recruiters",
        description: "Specialized across every industry",
        icon: "fa-duotone fa-regular fa-users",
        color: "accent",
    },
    {
        value: 95,
        suffix: "%",
        label: "Response Rate",
        description: "Candidates hear back within 48 hours",
        icon: "fa-duotone fa-regular fa-comments",
        color: "success",
    },
];

export default async function CandidateHomePage() {
    const homeJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Applicant Network - Find Your Next Career Opportunity",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network",
        description:
            "Browse thousands of roles and connect with expert recruiters on Applicant Network.",
        isPartOf: {
            "@type": "WebSite",
            name: "Applicant Network",
            url:
                process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network",
        },
    };
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: candidateFaqs.map((faq) => ({
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
            <JsonLd data={homeJsonLd} id="applicant-home-jsonld" />
            <JsonLd data={faqJsonLd} id="applicant-home-faq-jsonld" />
            <LandingAnimator>
                {/* ── Hero Section ────────────────────────────────── */}
                <section className="hero-section hero min-h-[85vh] relative overflow-hidden">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="hero-video absolute inset-0 w-full h-full object-cover opacity-15"
                    >
                        <source
                            src="/candidate-hero.mp4"
                            type="video/mp4"
                        />
                    </video>

                    <div className="hero-content text-center max-w-6xl relative z-10 py-20">
                        <div className="space-y-8">
                            <h1 className="hero-headline text-5xl md:text-7xl font-bold leading-tight opacity-0">
                                Find Your Dream Job,
                                <br />
                                <span className="text-secondary">
                                    Powered by Expert Recruiters
                                </span>
                            </h1>
                            <p className="hero-subtext text-xl md:text-2xl text-base-content/80 max-w-3xl mx-auto leading-relaxed opacity-0">
                                Browse thousands of opportunities from top
                                companies. Get matched with specialized
                                recruiters who advocate for you throughout the
                                hiring process.
                            </p>
                            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                <Link
                                    href="/public/jobs"
                                    className="btn btn-primary btn-lg gap-2 shadow hover:shadow-lg transition-all"
                                >
                                    <i className="fa-duotone fa-regular fa-magnifying-glass"></i>
                                    Explore Jobs
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="btn btn-outline btn-lg gap-2"
                                >
                                    <i className="fa-duotone fa-regular fa-user-plus"></i>
                                    Create Your Profile
                                </Link>
                            </div>
                            <div className="hero-trust flex items-center justify-center gap-8 pt-8 text-sm">
                                <div className="hero-trust-item flex items-center gap-2 opacity-0">
                                    <i className="fa-duotone fa-regular fa-check-circle text-success"></i>
                                    <span>Free to use</span>
                                </div>
                                <div className="hero-trust-item flex items-center gap-2 opacity-0">
                                    <i className="fa-duotone fa-regular fa-check-circle text-success"></i>
                                    <span>Expert guidance</span>
                                </div>
                                <div className="hero-trust-item flex items-center gap-2 opacity-0">
                                    <i className="fa-duotone fa-regular fa-check-circle text-success"></i>
                                    <span>Top companies</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Problem Section ─────────────────────────────── */}
                <section className="problem-section py-24 bg-neutral text-neutral-content overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="problem-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <p className="text-sm uppercase tracking-wider opacity-60 mb-3">
                                Sound Familiar?
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Job searching shouldn&apos;t feel
                                like&nbsp;
                                <span className="text-error">this:</span>
                            </h2>
                            <p className="text-lg opacity-70">
                                You&apos;re qualified, motivated, and
                                ready—but the traditional job search feels
                                like shouting into a void.
                            </p>
                        </div>

                        <div className="pain-cards grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {painPoints.map((point, index) => (
                                <div
                                    key={index}
                                    className="pain-card flex items-start gap-4 p-6 bg-base-100/5 rounded-xl border border-base-100/10 opacity-0"
                                >
                                    <div
                                        className={`pain-icon w-12 h-12 rounded-full ${point.iconBg} flex items-center justify-center flex-shrink-0`}
                                    >
                                        <i
                                            className={`${point.icon} text-xl`}
                                        ></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">
                                            {point.title}
                                        </h3>
                                        <p className="text-sm opacity-70">
                                            {point.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Solution Bridge Section ─────────────────────── */}
                <section className="bridge-section py-24 bg-base-100 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="bridge-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <p className="text-sm uppercase tracking-wider text-secondary mb-3">
                                There&apos;s a Better Way
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                What if your job search had{" "}
                                <span className="text-secondary">
                                    backup?
                                </span>
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Imagine having an expert recruiter working
                                alongside you—opening doors, prepping you for
                                interviews, and making sure you never get
                                ghosted again.
                            </p>
                        </div>

                        <div className="promise-cards grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {promises.map((promise, index) => (
                                <div
                                    key={index}
                                    className="promise-card text-center p-8 bg-base-200 rounded-2xl opacity-0"
                                >
                                    <div className="promise-icon w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                                        <i
                                            className={`${promise.icon} text-2xl text-secondary`}
                                        ></i>
                                    </div>
                                    <h3 className="font-bold text-xl mb-3">
                                        {promise.title}
                                    </h3>
                                    <p className="text-base-content/70">
                                        {promise.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── How It Works Section ────────────────────────── */}
                <section
                    id="how-it-works"
                    className="how-section py-24 bg-base-200 overflow-hidden"
                >
                    <div className="container mx-auto px-4">
                        <div className="how-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <p className="text-sm uppercase tracking-wider text-primary mb-3">
                                How It Works
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Your Path to Success
                            </h2>
                            <p className="text-lg text-base-content/70">
                                From profile to placement—here&apos;s how we
                                help you land your next role
                            </p>
                        </div>

                        <div className="how-timeline relative max-w-4xl mx-auto">
                            <svg
                                className="absolute left-8 top-0 h-full hidden md:block"
                                width="4"
                                style={{ overflow: "visible" }}
                            >
                                <path
                                    className="timeline-line"
                                    d="M2,0 L2,100%"
                                    stroke="url(#timelineGradient)"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient
                                        id="timelineGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="0%"
                                        y2="100%"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#233876"
                                        />
                                        <stop
                                            offset="50%"
                                            stopColor="#0f9d8a"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#36d399"
                                        />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <div className="space-y-8 md:space-y-12">
                                {steps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="step-card relative flex items-start gap-6 md:gap-8 opacity-0"
                                    >
                                        <div
                                            className={`step-badge relative z-10 w-16 h-16 rounded-full bg-${step.color} text-${step.color}-content flex items-center justify-center flex-shrink-0 shadow-lg`}
                                        >
                                            <span className="text-2xl font-bold">
                                                {step.number}
                                            </span>
                                        </div>
                                        <div className="flex-1 bg-base-100 rounded-2xl p-6 shadow-sm">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`w-12 h-12 rounded-xl bg-${step.color}/10 flex items-center justify-center flex-shrink-0`}
                                                >
                                                    <i
                                                        className={`${step.icon} text-xl text-${step.color}`}
                                                    ></i>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-xl mb-2">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-base-content/70">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Features Section ────────────────────────────── */}
                <section className="features-section py-24 bg-base-100 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="features-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <p className="text-sm uppercase tracking-wider text-primary mb-3">
                                Platform Features
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Why Candidates Love Us
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Tools and support designed to accelerate your
                                job search and land you the right role
                            </p>
                        </div>

                        <div className="feature-cards grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="feature-card bg-base-200 rounded-2xl p-6 opacity-0 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-base-300"
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`feature-icon w-14 h-14 rounded-xl bg-${feature.color}/10 flex items-center justify-center flex-shrink-0`}
                                        >
                                            <i
                                                className={`${feature.icon} text-2xl text-${feature.color}`}
                                            ></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-base-content/70">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Metrics Section ─────────────────────────────── */}
                <section className="metrics-section py-24 bg-base-200 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="metrics-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                            <p className="text-sm uppercase tracking-wider text-secondary mb-3">
                                By The Numbers
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                A Growing Network
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Join thousands of candidates finding their
                                next opportunity through expert recruiters
                            </p>
                        </div>

                        <div className="metric-cards grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            {metrics.map((metric, index) => (
                                <div
                                    key={index}
                                    className="metric-card bg-base-100 rounded-2xl p-8 text-center opacity-0 shadow-sm"
                                >
                                    <div
                                        className={`metric-icon w-16 h-16 rounded-full bg-${metric.color}/10 flex items-center justify-center mx-auto mb-6`}
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
                                    <div className="text-sm text-base-content/60">
                                        {metric.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ Section ─────────────────────────────────── */}
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
                            {candidateFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="faq-item collapse collapse-plus bg-base-200 rounded-xl opacity-0"
                                >
                                    <input
                                        type="radio"
                                        name="landing-faq"
                                    />
                                    <div className="collapse-title font-semibold text-lg pr-4">
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

                {/* ── CTA Section ─────────────────────────────────── */}
                <section className="cta-section py-24 bg-primary text-primary-content overflow-hidden relative">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="cta-content opacity-0 max-w-4xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                Ready to Take the{" "}
                                <span className="text-secondary">
                                    Next Step?
                                </span>
                            </h2>
                            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
                                Join thousands of candidates who are finding
                                better opportunities with expert recruiter
                                support
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                            <Link
                                href="/sign-up"
                                className="cta-btn btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg opacity-0 hover:scale-105 transition-transform"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus"></i>
                                Create Free Account
                            </Link>
                            <Link
                                href="/public/jobs"
                                className="cta-btn btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary opacity-0 hover:scale-105 transition-transform"
                            >
                                <i className="fa-duotone fa-regular fa-magnifying-glass"></i>
                                Browse Jobs First
                            </Link>
                        </div>

                        <div className="cta-footer text-sm opacity-0 max-w-xl mx-auto text-primary-content/70">
                            <div className="flex items-center justify-center gap-6 flex-wrap">
                                <span className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-secondary"></i>
                                    No credit card required
                                </span>
                                <span className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-secondary"></i>
                                    Takes less than 2 minutes
                                </span>
                                <span className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-secondary"></i>
                                    Free forever
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </LandingAnimator>
        </>
    );
}
