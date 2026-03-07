import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { LegalBaselAnimator } from "@/components/legal-animator";

export const metadata: Metadata = {
    title: "Privacy Policy | Employment Networks",
    description:
        "Learn how Employment Networks protects your privacy and handles your personal data in compliance with GDPR and CCPA.",
    ...buildCanonical("/privacy-policy"),
};

export default function PrivacyPolicyBaselPage() {
    const lastUpdated = "March 1, 2026";

    const tocItems = [
        { n: "1", id: "overview", label: "Overview" },
        { n: "2", id: "information-collection", label: "Information Collection" },
        { n: "3", id: "how-we-use", label: "How We Use" },
        { n: "4", id: "information-sharing", label: "Information Sharing" },
        { n: "5", id: "data-security", label: "Data Security" },
        { n: "6", id: "data-retention", label: "Data Retention" },
        { n: "7", id: "your-rights", label: "Your Privacy Rights" },
        { n: "8", id: "cookies", label: "Cookies & Tracking" },
        { n: "9", id: "third-party", label: "Third-Party Services" },
        { n: "10", id: "google-api-services", label: "Google API Services" },
        { n: "11", id: "ai-processing", label: "AI & Automated Processing" },
        { n: "12", id: "international", label: "International Transfers" },
        { n: "13", id: "children", label: "Children's Privacy" },
        { n: "14", id: "california", label: "California Rights (CCPA/CPRA)" },
        { n: "15", id: "gdpr", label: "GDPR Rights (EU)" },
        { n: "16", id: "changes", label: "Changes to This Policy" },
    ];

    const badgeColor = (n: number) =>
        ["primary", "secondary", "accent"][n % 3];

    return (
        <LegalBaselAnimator>
            {/* ═══ HERO ═══ */}
            <section className="py-28 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="bl-hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 scroll-reveal fade-up">
                            <i className="fa-duotone fa-regular fa-shield-check mr-2" />
                            Legal
                        </p>
                        <h1 className="bl-hero-headline text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-6 scroll-reveal fade-up">
                            Privacy <span className="text-primary">Policy</span>
                        </h1>
                        <p className="bl-hero-subtitle text-lg md:text-xl opacity-70 leading-relaxed mb-6 scroll-reveal fade-up">
                            How we protect and respect your personal data
                        </p>
                        <p className="bl-hero-date text-sm font-semibold uppercase tracking-wider opacity-40 scroll-reveal fade-up">
                            Last updated: {lastUpdated}
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ TABLE OF CONTENTS ═══ */}
            <section className="py-12 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-toc border-l-4 border-primary bg-base-100 p-8 shadow-sm scroll-reveal fade-up">
                        <h2 className="text-xl font-black tracking-tight mb-6">
                            Quick{" "}
                            <span className="text-primary">Navigation</span>
                        </h2>
                        <ul className="grid md:grid-cols-2 gap-3">
                            {tocItems.map((item) => (
                                <li key={item.id}>
                                    <a
                                        href={`#${item.id}`}
                                        className="text-sm font-bold text-base-content/70 hover:text-primary transition-colors flex items-center gap-3"
                                    >
                                        <span className="w-7 h-7 bg-primary text-primary-content flex items-center justify-center text-xs font-black flex-shrink-0">
                                            {item.n}
                                        </span>
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ═══ Section 1 — Overview ═══ */}
            <section id="overview" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                1
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Overview
                            </h2>
                        </div>
                        <p className="text-base leading-relaxed text-base-content/80 mb-6">
                            Employment Networks, Inc. (&ldquo;Splits
                            Network,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;
                            or &ldquo;our&rdquo;) operates a split-fee recruiting
                            marketplace that connects recruiters, candidates, and
                            companies. We are committed to protecting your privacy
                            and being transparent about how we handle your personal
                            information in compliance with GDPR, CCPA, and other
                            applicable privacy regulations.
                        </p>
                        <p className="text-base leading-relaxed text-base-content/80 mb-6">
                            This Privacy Policy explains how we collect, use,
                            disclose, and safeguard your information when you visit
                            our websites or use our services, including:
                        </p>
                        <div className="space-y-2 mb-6">
                            {[
                                "splits.network",
                                "applicant.network",
                                "employment-networks.com",
                            ].map((site) => (
                                <div
                                    key={site}
                                    className="border-l-4 border-primary bg-base-200 p-3 text-sm font-mono text-base-content/70"
                                >
                                    {site}
                                </div>
                            ))}
                        </div>
                        <p className="text-sm font-bold text-base-content mb-3">
                            Our commitments:
                        </p>
                        <ul className="space-y-3">
                            {[
                                "Your data is treated with utmost care and respect",
                                "We comply with GDPR, CCPA/CPRA, and other applicable privacy regulations",
                                "You have full control over your personal information",
                                "We never sell your personal data to third parties",
                                "Transparency in all data processing activities",
                            ].map((text, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-3 text-sm text-base-content/70"
                                >
                                    <i className="fa-duotone fa-regular fa-check text-success mt-0.5" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ═══ Section 2 — Information Collection ═══ */}
            <section id="information-collection" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                2
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Information We Collect
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border-l-4 border-primary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-3">
                                    You Provide
                                </h3>
                                <ul className="space-y-2 text-sm text-base-content/70">
                                    {[
                                        "Contact information (name, email, phone)",
                                        "Account details (job title, company)",
                                        "Resumes, CVs, and professional profiles",
                                        "Job descriptions and requirements",
                                        "Communications and support requests",
                                        "Payment and billing information",
                                    ].map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2"
                                        >
                                            <i className="fa-duotone fa-regular fa-check text-xs text-primary mt-1" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="border-l-4 border-secondary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-3">
                                    Automatically
                                </h3>
                                <ul className="space-y-2 text-sm text-base-content/70">
                                    {[
                                        "IP address and geographic location",
                                        "Browser type and device information",
                                        "Operating system and screen resolution",
                                        "Usage analytics via Google Analytics (GA4)",
                                        "Session recordings via Microsoft Clarity",
                                        "Authentication data via Clerk",
                                    ].map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2"
                                        >
                                            <i className="fa-duotone fa-regular fa-check text-xs text-secondary mt-1" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="border-l-4 border-accent bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-3">
                                    Third Parties
                                </h3>
                                <ul className="space-y-2 text-sm text-base-content/70">
                                    {[
                                        "Social login via Clerk (Google, LinkedIn, SSO)",
                                        "LinkedIn professional profile import",
                                        "Background and employment verification",
                                        "Integration partner data (ATS, HR platforms)",
                                    ].map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2"
                                        >
                                            <i className="fa-duotone fa-regular fa-check text-xs text-accent mt-1" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 3 — How We Use ═══ */}
            <section id="how-we-use" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-accent text-accent-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                3
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                How We Use Your Information
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "Service Delivery",
                                    desc: "Operating the platform, managing accounts, facilitating candidate-to-job matching, enabling split-fee agreements, and processing payments through Stripe",
                                },
                                {
                                    title: "Analytics & Improvement",
                                    desc: "Understanding usage via Google Analytics and Microsoft Clarity, identifying UX issues, developing new features, and improving platform functionality",
                                },
                                {
                                    title: "Communications",
                                    desc: "Transactional emails via Resend for account activity, job opportunities, agreement updates, and platform notifications. Marketing only with consent",
                                },
                                {
                                    title: "Legal Compliance",
                                    desc: "Meeting regulatory obligations, enforcing terms of service, detecting and preventing fraud, and responding to valid legal process",
                                },
                                {
                                    title: "AI-Powered Features",
                                    desc: "Candidate matching, job recommendations, and AI assistant powered by OpenAI. Candidate data is anonymized before AI processing",
                                },
                                {
                                    title: "Payment Processing",
                                    desc: "Billing, invoicing, and split-fee payment distribution through Stripe. Card details are never stored on our servers",
                                },
                            ].map((item, i) => (
                                <div
                                    key={item.title}
                                    className={`border-l-4 border-${badgeColor(i)} bg-base-200 p-6`}
                                >
                                    <h3 className="font-bold text-base mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-base-content/70">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 4 — Information Sharing ═══ */}
            <section id="information-sharing" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                4
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Information Sharing
                            </h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-6">
                            We share information only when necessary:
                        </p>
                        <div className="space-y-3 mb-6">
                            {[
                                {
                                    label: "Service Providers",
                                    desc: "Trusted providers who process data on our behalf (Clerk, Stripe, Supabase, Resend, Google Analytics, Microsoft Clarity, OpenAI), subject to strict data processing agreements",
                                },
                                {
                                    label: "Legal Requirements",
                                    desc: "When required by law, subpoena, court order, or to protect rights, property, or safety of Employment Networks, our users, or the public",
                                },
                                {
                                    label: "Platform Partners",
                                    desc: "Candidate profiles shared with recruiters and companies during the matching process. Recruiter information shared to facilitate split-fee partnerships",
                                },
                                {
                                    label: "Business Transfers",
                                    desc: "In connection with a merger, acquisition, reorganization, or sale of assets, your data may be transferred as part of that transaction",
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="border-l-4 border-primary bg-base-100 p-4 flex items-start gap-3"
                                >
                                    <span className="badge badge-primary badge-sm flex-shrink-0 mt-0.5">
                                        {item.label}
                                    </span>
                                    <p className="text-sm text-base-content/70">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="border-l-4 border-success bg-success/5 p-6">
                            <p className="font-bold text-sm mb-1">
                                <i className="fa-duotone fa-regular fa-shield-check text-success mr-2" />
                                We never sell your data
                            </p>
                            <p className="text-sm text-base-content/70">
                                Your personal information is never sold to third
                                parties for advertising or marketing purposes. We
                                enter into data processing agreements with all
                                service providers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 5 — Data Security ═══ */}
            <section id="data-security" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                5
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Data Security
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                {
                                    title: "Encryption in Transit",
                                    desc: "All data encrypted using TLS 1.3 for transit between your browser and our servers",
                                },
                                {
                                    title: "Encryption at Rest",
                                    desc: "AES-256 encryption for all stored data in our Supabase PostgreSQL database",
                                },
                                {
                                    title: "PCI DSS Compliance",
                                    desc: "Payment data processed in PCI DSS-compliant environments through Stripe",
                                },
                                {
                                    title: "Access Control & MFA",
                                    desc: "Role-based access controls and multi-factor authentication through Clerk",
                                },
                                {
                                    title: "Row-Level Security",
                                    desc: "Supabase row-level security policies ensure data isolation between tenants",
                                },
                                {
                                    title: "Regular Audits",
                                    desc: "Ongoing security audits, penetration testing, vulnerability assessments, and dependency updates",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="border-l-4 border-secondary bg-base-200 p-4"
                                >
                                    <p className="font-bold text-sm">
                                        {item.title}
                                    </p>
                                    <p className="text-sm text-base-content/60">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 6 — Data Retention ═══ */}
            <section id="data-retention" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-accent text-accent-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                6
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Data Retention
                            </h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-6">
                            We retain your personal information only for as long as
                            necessary to fulfill the purposes for which it was
                            collected.
                        </p>
                        <div className="space-y-3">
                            {[
                                {
                                    label: "Active Accounts",
                                    period: "Duration of account",
                                    desc: "Retained while your account is active. Request deletion anytime via account settings or by contacting us.",
                                },
                                {
                                    label: "Inactive Accounts",
                                    period: "3 years, then 60-day notice",
                                    desc: "Accounts inactive for more than three years may be scheduled for deletion. We send a 60-day notice before any deletion occurs.",
                                },
                                {
                                    label: "Financial Records",
                                    period: "7 years",
                                    desc: "Payment history and split-fee agreement records retained to comply with tax, accounting, and regulatory requirements.",
                                },
                                {
                                    label: "Google Analytics (GA4)",
                                    period: "14 months",
                                    desc: "Analytics data collected through GA4 is retained for 14 months per Google's data retention settings.",
                                },
                                {
                                    label: "Microsoft Clarity",
                                    period: "30 days",
                                    desc: "Session recordings and heatmap data are retained for 30 days by Microsoft Clarity.",
                                },
                                {
                                    label: "Anonymized Data",
                                    period: "Indefinite",
                                    desc: "Anonymized and aggregated data may be retained indefinitely for statistical analysis and industry reporting.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="border-l-4 border-accent bg-base-100 p-4"
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-bold text-sm">
                                            {item.label}
                                        </p>
                                        <span className="badge badge-accent badge-sm">
                                            {item.period}
                                        </span>
                                    </div>
                                    <p className="text-sm text-base-content/60">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 7 — Your Rights ═══ */}
            <section id="your-rights" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                7
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Your Privacy Rights
                            </h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-6">
                            Regardless of where you are located, we provide all
                            users with the following rights:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                {
                                    title: "Right to Access",
                                    desc: "Request a copy of your personal data in a machine-readable format. We respond within 30 days.",
                                },
                                {
                                    title: "Right to Correction",
                                    desc: "Request correction of inaccurate or incomplete personal information, or update directly via account settings.",
                                },
                                {
                                    title: "Right to Deletion",
                                    desc: "Request deletion of your data, subject to exceptions for legal obligations, active transactions, or fraud prevention.",
                                },
                                {
                                    title: "Right to Data Portability",
                                    desc: "Receive your data in a structured, commonly used, machine-readable format for transfer to another service.",
                                },
                                {
                                    title: "Right to Restrict Processing",
                                    desc: "Request limits on how we process your data when you contest accuracy or object to processing.",
                                },
                                {
                                    title: "Right to Object",
                                    desc: "Object to processing for direct marketing or where we rely on legitimate interests as the legal basis.",
                                },
                                {
                                    title: "Right to Withdraw Consent",
                                    desc: "Withdraw consent at any time where processing is based on consent. Withdrawal does not affect prior lawful processing.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="border-l-4 border-primary bg-base-200 p-5"
                                >
                                    <p className="font-bold text-sm">
                                        {item.title}
                                    </p>
                                    <p className="text-sm text-base-content/60">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-base-content/70 mt-6">
                            To exercise any of these rights, contact us at{" "}
                            <a
                                href="mailto:privacy@splits.network"
                                className="text-primary underline"
                            >
                                privacy@splits.network
                            </a>
                            . We will respond within 30 days and may verify your
                            identity before processing your request.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ Section 8 — Cookies & Tracking ═══ */}
            <section id="cookies" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                8
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Cookies & Tracking Technologies
                            </h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-6">
                            We use cookies and similar tracking technologies to
                            operate our platform, analyze usage, and personalize
                            your experience.
                        </p>
                        <div className="space-y-4">
                            <div className="border-l-4 border-secondary bg-base-100 p-5">
                                <h3 className="font-bold text-sm mb-2">
                                    <i className="fa-duotone fa-regular fa-chart-line text-secondary mr-2" />
                                    Google Analytics (GA4)
                                </h3>
                                <p className="text-sm text-base-content/70 mb-2">
                                    Tracks page views, user interactions, session
                                    duration, demographics, and geographic location.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <code className="text-sm bg-base-200 px-2 py-0.5">
                                        _ga / _ga_*
                                    </code>
                                    <span className="text-sm text-base-content/50">
                                        — 2 year lifespan
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <code className="text-sm bg-base-200 px-2 py-0.5">
                                        _gid
                                    </code>
                                    <span className="text-sm text-base-content/50">
                                        — 24 hour lifespan
                                    </span>
                                </div>
                            </div>
                            <div className="border-l-4 border-secondary bg-base-100 p-5">
                                <h3 className="font-bold text-sm mb-2">
                                    <i className="fa-duotone fa-regular fa-cursor text-secondary mr-2" />
                                    Microsoft Clarity
                                </h3>
                                <p className="text-sm text-base-content/70 mb-2">
                                    Session recordings, heatmaps, click tracking,
                                    and scroll depth analysis. Sensitive input
                                    fields are automatically masked.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <code className="text-sm bg-base-200 px-2 py-0.5">
                                        _clck / _clsk
                                    </code>
                                    <span className="text-sm text-base-content/50">
                                        — 1 year lifespan
                                    </span>
                                </div>
                            </div>
                            <div className="border-l-4 border-secondary bg-base-100 p-5">
                                <h3 className="font-bold text-sm mb-2">
                                    <i className="fa-duotone fa-regular fa-lock text-secondary mr-2" />
                                    Clerk (Essential)
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    Session cookies strictly necessary for
                                    authentication, login state, session tokens,
                                    SSO, and CSRF protection. Cannot be disabled
                                    without breaking core functionality.
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-base-content/70 mt-6">
                            You can manage cookie preferences through your browser
                            settings. For detailed information, see our{" "}
                            <a
                                href="/cookie-policy"
                                className="text-primary underline"
                            >
                                Cookie Policy
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ Section 9 — Third-Party Services ═══ */}
            <section id="third-party" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-accent text-accent-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                9
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Third-Party Services
                            </h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-6">
                            Our platform integrates with the following third-party
                            services. Each provider maintains their own privacy
                            policy governing how they process your data.
                        </p>
                        <div className="space-y-4">
                            {[
                                {
                                    icon: "fa-duotone fa-regular fa-lock",
                                    name: "Clerk",
                                    purpose: "Authentication, identity management, SSO, social login",
                                    data: "Name, email, profile image, session data, login history",
                                    url: "https://clerk.com/privacy",
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-credit-card",
                                    name: "Stripe",
                                    purpose: "Payment processing, billing, invoicing",
                                    data: "Payment method details, transaction history, billing address",
                                    url: "https://stripe.com/privacy",
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-chart-line",
                                    name: "Google Analytics (GA4)",
                                    purpose: "Page views, user interactions, demographics, device info",
                                    data: "Browsing behavior, session duration, geographic location",
                                    url: "https://policies.google.com/privacy",
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-cursor",
                                    name: "Microsoft Clarity",
                                    purpose: "Session recordings, heatmaps, click tracking, scroll depth",
                                    data: "User interaction recordings, mouse movements, click patterns",
                                    url: "https://privacy.microsoft.com/en-us/privacystatement",
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-brain",
                                    name: "OpenAI / ChatGPT",
                                    purpose: "AI-powered candidate matching, job recommendations, AI assistant",
                                    data: "Job descriptions, anonymized candidate profiles, AI chat messages",
                                    url: "https://openai.com/privacy",
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-database",
                                    name: "Supabase",
                                    purpose: "Database infrastructure, real-time data, file storage",
                                    data: "All platform data stored in encrypted PostgreSQL database",
                                    url: "https://supabase.com/privacy",
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-envelope",
                                    name: "Resend",
                                    purpose: "Transactional and marketing email delivery",
                                    data: "Email addresses, message content, delivery status",
                                    url: "https://resend.com/legal/privacy-policy",
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-briefcase",
                                    name: "LinkedIn",
                                    purpose: "Professional network integration, profile import",
                                    data: "Professional profile data, work history, connections (with consent)",
                                    url: "https://www.linkedin.com/legal/privacy-policy",
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-calendar",
                                    name: "Google Calendar",
                                    purpose: "Interview scheduling and calendar sync (recruiter integration)",
                                    data: "Calendar event details, free/busy availability, calendar list",
                                    url: "https://policies.google.com/privacy",
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-envelope",
                                    name: "Gmail (Google)",
                                    purpose: "Email tracking and communication management (recruiter integration)",
                                    data: "Email messages read and sent via the platform on behalf of the connected recruiter",
                                    url: "https://policies.google.com/privacy",
                                },
                            ].map((svc) => (
                                <div
                                    key={svc.name}
                                    className="border-l-4 border-accent bg-base-200 p-5 flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <i
                                            className={`${svc.icon} text-accent text-lg`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">
                                            {svc.name}
                                        </p>
                                        <p className="text-sm text-base-content/70 mb-1">
                                            {svc.purpose}
                                        </p>
                                        <p className="text-sm text-base-content/50 mb-2">
                                            <strong>Data processed:</strong>{" "}
                                            {svc.data}
                                        </p>
                                        <a
                                            href={svc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary underline hover:opacity-80"
                                        >
                                            View Privacy Policy{" "}
                                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square ml-1" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 10 — Google API Services ═══ */}
            <section id="google-api-services" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                10
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Google API Services
                            </h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-4">
                            Splits Network&apos;s use of information received from
                            Google APIs adheres to the{" "}
                            <a
                                href="https://developers.google.com/terms/api-services-user-data-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                            >
                                Google API Services User Data Policy
                            </a>
                            , including the Limited Use requirements.
                        </p>
                        <div className="space-y-3 mb-6">
                            {[
                                {
                                    scope: "calendar.events.owned, calendar.events.freebusy, calendar.calendarlist.readonly",
                                    use: "Google Calendar — schedule and display interview events, check free/busy availability",
                                },
                                {
                                    scope: "gmail.modify",
                                    use: "Gmail — send and read recruiting emails on behalf of the recruiter",
                                },
                            ].map((item) => (
                                <div
                                    key={item.scope}
                                    className="border-l-4 border-primary bg-base-100 p-4"
                                >
                                    <p className="text-sm font-bold text-base-content">
                                        {item.use}
                                    </p>
                                    <p className="text-sm text-base-content/60 font-mono mt-1">
                                        {item.scope}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3 mb-6">
                            {[
                                "Google data is never used for advertising, profiling, or any purpose beyond the feature for which access was granted",
                                "Google data is never sold to or shared with third parties except as necessary to operate the integration",
                                "Google data is never shared beyond what is required for the specific integration to function",
                                "Google data is never used to train AI models or for purposes unrelated to the recruiting features",
                            ].map((text, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 text-sm text-base-content/70"
                                >
                                    <i className="fa-duotone fa-regular fa-ban text-error mt-0.5 flex-shrink-0" />
                                    {text}
                                </div>
                            ))}
                        </div>
                        <div className="border-l-4 border-success bg-success/5 p-5 space-y-2">
                            <p className="font-bold text-sm">
                                <i className="fa-duotone fa-regular fa-shield-check text-success mr-2" />
                                Limited Use Compliance
                            </p>
                            <p className="text-sm text-base-content/70">
                                Google user data is used solely to provide
                                user-facing features prominent in the requesting
                                application&apos;s user interface. Recruiters can
                                revoke access at any time from Account Settings or
                                from their{" "}
                                <a
                                    href="https://myaccount.google.com/permissions"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline"
                                >
                                    Google Account permissions page
                                </a>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 11 — AI & Automated Processing ═══ */}
            <section id="ai-processing" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                11
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                AI & Automated Processing
                            </h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-6">
                            Splits Network uses artificial intelligence powered by
                            OpenAI/ChatGPT to enhance platform services, including
                            candidate matching, job recommendations, and our AI
                            assistant.
                        </p>
                        <div className="space-y-3 mb-6">
                            {[
                                {
                                    title: "Data Processing",
                                    desc: "AI analyzes job descriptions and anonymized candidate profiles. Data may be transmitted to OpenAI servers for processing over encrypted connections.",
                                },
                                {
                                    title: "No Third-Party Training",
                                    desc: "Your personal data is never used to train third-party AI models. We have a data processing agreement with OpenAI that prohibits this.",
                                },
                                {
                                    title: "Human Review",
                                    desc: "AI outputs are recommendations only. No automated decisions with legal or similarly significant effects are made without human review, especially for employment-related decisions.",
                                },
                                {
                                    title: "Opt-Out",
                                    desc: "You can opt out of AI-powered features at any time through your account settings or by contacting privacy@splits.network.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="border-l-4 border-secondary bg-base-200 p-4"
                                >
                                    <p className="font-bold text-sm">
                                        {item.title}
                                    </p>
                                    <p className="text-sm text-base-content/60">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 12 — International Transfers ═══ */}
            <section id="international" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-accent text-accent-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                12
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                International Data Transfers
                            </h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-6">
                            Employment Networks, Inc. is based in the United
                            States. Your information may be transferred to, stored
                            in, and processed in the United States and other
                            countries where our service providers operate.
                        </p>
                        <div className="space-y-3">
                            {[
                                {
                                    label: "Standard Contractual Clauses",
                                    desc: "EU-approved clauses with service providers requiring them to protect your data to European standards",
                                },
                                {
                                    label: "Adequate Protection",
                                    desc: "Additional technical and organizational measures including encryption, pseudonymization, and strict access controls",
                                },
                                {
                                    label: "Data Processing Agreements",
                                    desc: "Binding contractual commitments with all service providers regarding data handling, security, and breach notification",
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="border-l-4 border-accent bg-base-100 p-4 flex items-start gap-3"
                                >
                                    <span className="badge badge-accent badge-sm flex-shrink-0 mt-0.5">
                                        {item.label}
                                    </span>
                                    <p className="text-sm text-base-content/70">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 13 — Children's Privacy ═══ */}
            <section id="children" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                13
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Children&apos;s Privacy
                            </h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-4">
                            Our services are designed for professional use and are
                            not intended for individuals under the age of 16. We do
                            not knowingly collect, solicit, or maintain personal
                            information from anyone under 16 years of age.
                        </p>
                        <p className="text-base text-base-content/80">
                            If we become aware that we have collected personal
                            information from a child under 16, we will take
                            immediate steps to delete that information. If you are
                            a parent or guardian and believe your child has provided
                            us with personal information, please contact us at{" "}
                            <a
                                href="mailto:privacy@splits.network"
                                className="text-primary underline"
                            >
                                privacy@splits.network
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ Section 14 — California Rights (CCPA/CPRA) ═══ */}
            <section id="california" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                14
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                California Rights (CCPA/CPRA)
                            </h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-6">
                            If you are a California resident, the California
                            Consumer Privacy Act (CCPA) and California Privacy
                            Rights Act (CPRA) provide you with additional rights:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {[
                                {
                                    title: "Right to Know",
                                    desc: "Request disclosure of what personal information we collect, use, disclose, and sell",
                                },
                                {
                                    title: "Right to Delete",
                                    desc: "Request deletion of personal information we have collected from you",
                                },
                                {
                                    title: "Right to Correct",
                                    desc: "Request correction of inaccurate personal information",
                                },
                                {
                                    title: "Right to Opt-Out of Sale",
                                    desc: "We do not sell your personal information. No opt-out action is needed.",
                                },
                                {
                                    title: "Right to Limit Sensitive Info",
                                    desc: "Limit the use and disclosure of sensitive personal information",
                                },
                                {
                                    title: "Right to Non-Discrimination",
                                    desc: "We will not discriminate against you for exercising any of your CCPA/CPRA rights",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="border-l-4 border-secondary bg-base-100 p-5"
                                >
                                    <p className="font-bold text-sm">
                                        {item.title}
                                    </p>
                                    <p className="text-sm text-base-content/60">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-base-content/70">
                            To exercise your California privacy rights, contact us
                            at{" "}
                            <a
                                href="mailto:privacy@splits.network"
                                className="text-primary underline"
                            >
                                privacy@splits.network
                            </a>
                            . We will respond to verifiable consumer requests
                            within 45 days.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ Section 15 — GDPR Rights (EU) ═══ */}
            <section id="gdpr" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-accent text-accent-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                15
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                GDPR Rights (EU)
                            </h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-6">
                            If you are in the European Economic Area (EEA), we
                            process your personal data under the following lawful
                            bases:
                        </p>
                        <div className="space-y-3 mb-6">
                            {[
                                {
                                    title: "Contract Performance",
                                    desc: "Processing necessary to provide our platform services, manage your account, and fulfill split-fee agreements",
                                },
                                {
                                    title: "Legitimate Interests",
                                    desc: "Platform improvement, fraud prevention, security monitoring, and analytics (balanced against your privacy rights)",
                                },
                                {
                                    title: "Consent",
                                    desc: "Marketing communications, non-essential cookies, AI-powered features, and LinkedIn profile import",
                                },
                                {
                                    title: "Legal Obligation",
                                    desc: "Tax reporting, financial record-keeping, and responding to valid legal process",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="border-l-4 border-accent bg-base-200 p-4"
                                >
                                    <p className="font-bold text-sm">
                                        {item.title}
                                    </p>
                                    <p className="text-sm text-base-content/60">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="border-l-4 border-primary bg-base-200 p-5">
                            <p className="font-bold text-sm mb-2">
                                <i className="fa-duotone fa-regular fa-user-shield text-primary mr-2" />
                                Data Protection Officer
                            </p>
                            <p className="text-sm text-base-content/70">
                                Contact our DPO at{" "}
                                <a
                                    href="mailto:dpo@splits.network"
                                    className="text-primary underline"
                                >
                                    dpo@splits.network
                                </a>
                                . We respond to GDPR requests within 30 days. You
                                also have the right to lodge a complaint with your
                                local supervisory authority if you believe your
                                data protection rights have been violated.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 16 — Changes to This Policy ═══ */}
            <section id="changes" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                16
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Changes to This Policy
                            </h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-4">
                            We may update this Privacy Policy from time to time to
                            reflect changes in our practices, technology, legal
                            requirements, or other factors. For material changes,
                            we will provide at least 30 days&apos; advance notice
                            via email or a prominent notice on our platform before
                            the changes take effect.
                        </p>
                        <p className="text-base text-base-content/80">
                            Previous versions of this policy are available upon
                            request by contacting{" "}
                            <a
                                href="mailto:legal@splits.network"
                                className="text-primary underline"
                            >
                                legal@splits.network
                            </a>
                            . We encourage you to review this policy periodically
                            to stay informed about how we protect your information.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ CONTACT ═══ */}
            <section className="py-16 bg-primary text-primary-content">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-contact scroll-reveal fade-up">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-8 text-center">
                            Questions About Privacy?
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-l-4 border-white/30 bg-white/10 p-6">
                                <div className="w-12 h-12 bg-white/20 flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-envelope text-lg" />
                                </div>
                                <h3 className="font-bold text-base mb-2">
                                    Privacy Team
                                </h3>
                                <a
                                    href="mailto:privacy@employment-networks.com"
                                    className="text-sm font-bold underline hover:opacity-80 transition-opacity"
                                >
                                    privacy@employment-networks.com
                                </a>
                                <p className="text-sm opacity-60 mt-2">
                                    Response within 5 business days
                                </p>
                            </div>
                            <div className="border-l-4 border-white/30 bg-white/10 p-6">
                                <div className="w-12 h-12 bg-white/20 flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-map-pin text-lg" />
                                </div>
                                <h3 className="font-bold text-base mb-2">
                                    Mailing Address
                                </h3>
                                <p className="text-sm opacity-70">
                                    Employment Networks, Inc.
                                </p>
                                <p className="text-sm opacity-70">
                                    Wilmington, Delaware 19801
                                </p>
                                <p className="text-sm opacity-70">USA</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </LegalBaselAnimator>
    );
}
