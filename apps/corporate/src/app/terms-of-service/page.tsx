import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { LegalBaselAnimator } from "@/components/legal-animator";

export const metadata: Metadata = {
    title: "Terms of Service | Employment Networks",
    description:
        "Legal terms and conditions for using Employment Networks platforms and services.",
    ...buildCanonical("/terms-of-service"),
};

const badgeColors = [
    "primary",
    "secondary",
    "accent",
    "error",
    "warning",
] as const;

const tocItems = [
    { n: "1", id: "acceptance", label: "Acceptance" },
    { n: "2", id: "description", label: "Service Description" },
    { n: "3", id: "eligibility", label: "Eligibility" },
    { n: "4", id: "accounts", label: "Accounts & Registration" },
    { n: "5", id: "conduct", label: "User Conduct" },
    { n: "6", id: "platform-rules", label: "Platform Rules" },
    { n: "7", id: "fees", label: "Fees & Payments" },
    { n: "8", id: "ip", label: "Intellectual Property" },
    { n: "9", id: "ai-features", label: "AI-Powered Features" },
    { n: "10", id: "privacy", label: "Privacy & Data" },
    { n: "11", id: "disclaimers", label: "Disclaimers" },
    { n: "12", id: "liability", label: "Limitation of Liability" },
    { n: "13", id: "indemnification", label: "Indemnification" },
    { n: "14", id: "termination", label: "Termination" },
    { n: "15", id: "disputes", label: "Dispute Resolution" },
    { n: "16", id: "governing-law", label: "Governing Law" },
    { n: "17", id: "changes", label: "Changes to Terms" },
];

function badgeColor(sectionIndex: number) {
    return badgeColors[sectionIndex % badgeColors.length];
}

function sectionBg(sectionIndex: number) {
    return sectionIndex % 2 === 0 ? "bg-base-100" : "bg-base-200";
}

export default function TermsOfServiceBaselPage() {
    const lastUpdated = "March 1, 2026";

    return (
        <LegalBaselAnimator>
            {/* ═══ HERO ═══ */}
            <section className="py-28 bg-base-300 text-base-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="bl-hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 scroll-reveal fade-up">
                            <i className="fa-duotone fa-regular fa-gavel mr-2" />
                            Legal
                        </p>
                        <h1 className="bl-hero-headline text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-6 scroll-reveal fade-up">
                            Terms of{" "}
                            <span className="text-primary">Service</span>
                        </h1>
                        <p className="bl-hero-subtitle text-lg md:text-xl opacity-70 leading-relaxed mb-6 scroll-reveal fade-up">
                            The rules, guidelines, and mutual commitments that
                            govern your use of Employment Networks platforms
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

            {/* ═══ Section 1 — Acceptance ═══ */}
            <section id="acceptance" className={`py-16 ${sectionBg(0)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(0)} text-${badgeColor(0)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                1
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Acceptance of Terms
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-base leading-relaxed text-base-content/80">
                                By accessing, browsing, or using Employment
                                Networks platforms (Splits Network, Applicant
                                Network, or any related services), operated by
                                Employment Networks, Inc., you acknowledge that
                                you have read, understood, and agree to be bound
                                by these Terms of Service. If you do not agree
                                to these Terms, you must not access or use the
                                platforms.
                            </p>
                            <p className="text-base leading-relaxed text-base-content/80">
                                These Terms constitute a legally binding
                                agreement between you and Employment Networks,
                                Inc. They apply to all users of the platforms,
                                including but not limited to recruiters,
                                candidates, company representatives, and
                                visitors. By creating an account, submitting
                                content, or using any feature of the platforms,
                                you affirm your acceptance of these Terms and
                                any additional policies referenced herein.
                            </p>
                            <p className="text-base leading-relaxed text-base-content/80">
                                We may update these Terms from time to time.
                                Your continued use of the platforms after such
                                changes constitutes acceptance of the revised
                                Terms. If you are using the platforms on behalf
                                of an organization, you represent and warrant
                                that you have the authority to bind that
                                organization to these Terms.
                            </p>
                        </div>
                        <div className="border-l-4 border-info bg-info/5 p-6 mt-6">
                            <p className="font-bold text-sm mb-1">
                                Binding Agreement
                            </p>
                            <p className="text-sm text-base-content/70">
                                These terms constitute a legally binding
                                agreement between you and Employment Networks,
                                Inc.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 2 — Service Description ═══ */}
            <section id="description" className={`py-16 ${sectionBg(1)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(1)} text-${badgeColor(1)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                2
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Service Description
                            </h2>
                        </div>
                        <p className="text-base leading-relaxed text-base-content/80 mb-6">
                            Splits Network is a split-fee recruiting marketplace
                            that connects recruiters, companies seeking talent,
                            and candidates. The platform provides infrastructure
                            for collaborative hiring through split-fee placement
                            arrangements, where two or more recruiting
                            professionals partner on a single placement and
                            share the resulting fee. The platform includes
                            AI-powered features driven by OpenAI technology,
                            including intelligent candidate matching, job
                            recommendations, and an AI chat assistant. All
                            payments are processed through Stripe.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-l-4 border-primary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-3">
                                    Splits Network
                                </h3>
                                <ul className="space-y-2 text-sm text-base-content/70">
                                    {[
                                        "Split-fee recruiting marketplace",
                                        "ATS and job management",
                                        "Placement tracking and pipeline visibility",
                                        "Automated payment processing",
                                        "AI-driven matching and recommendations",
                                        "Real-time messaging and collaboration",
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
                                    Applicant Network
                                </h3>
                                <ul className="space-y-2 text-sm text-base-content/70">
                                    {[
                                        "Candidate job search",
                                        "Application management",
                                        "Profile building",
                                        "Opportunity tracking",
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
                        </div>
                        <div className="border-l-4 border-info bg-info/5 p-6 mt-6">
                            <p className="font-bold text-sm mb-1">
                                Platform Role
                            </p>
                            <p className="text-sm text-base-content/70">
                                Splits Network acts as a marketplace platform
                                and is not itself a recruiting agency, employer,
                                or staffing firm. We do not guarantee
                                placements, employment outcomes, or the quality
                                of any candidate, job opportunity, or recruiting
                                partner.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 3 — Eligibility ═══ */}
            <section id="eligibility" className={`py-16 ${sectionBg(2)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(2)} text-${badgeColor(2)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                3
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Eligibility
                            </h2>
                        </div>
                        <p className="text-base leading-relaxed text-base-content/80 mb-6">
                            To access and use the platforms, you must meet all
                            of the following eligibility requirements. By using
                            the platforms, you represent and warrant that you
                            satisfy each condition.
                        </p>
                        <div className="space-y-3">
                            {[
                                {
                                    title: "Age Requirement",
                                    desc: "You must be at least eighteen (18) years of age. The platforms are not intended for individuals under the age of 18, and we do not knowingly collect information from minors.",
                                },
                                {
                                    title: "Legal Capacity",
                                    desc: "You must have the legal capacity and authority to enter into a binding contract. If you are accepting these Terms on behalf of a company or other legal entity, you represent that you have the authority to bind that entity.",
                                },
                                {
                                    title: "Work Authorization",
                                    desc: "If you are using the platforms as a recruiter or candidate, you must be legally authorized to work or provide recruiting services in your jurisdiction. You are responsible for compliance with all applicable employment laws.",
                                },
                                {
                                    title: "No Restrictions",
                                    desc: "You are not subject to any sanctions, embargoes, or legal restrictions that would prohibit you from using the platforms. You have not been previously banned or removed from the platforms for violations of these Terms.",
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="border-l-4 border-primary bg-base-200 p-4 flex items-start gap-3"
                                >
                                    <span className="w-8 h-8 bg-primary text-primary-content flex items-center justify-center font-black text-sm flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <p className="font-bold text-sm">
                                            {item.title}
                                        </p>
                                        <p className="text-sm text-base-content/70">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 4 — Accounts & Registration ═══ */}
            <section id="accounts" className={`py-16 ${sectionBg(3)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(3)} text-${badgeColor(3)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                4
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Accounts &amp; Registration
                            </h2>
                        </div>
                        {[
                            {
                                title: "Account Creation",
                                desc: "To access most features, you must create an account. Authentication is managed through Clerk, our third-party identity provider. You may register using email, single sign-on (SSO), or supported social login providers. By creating an account, you consent to the processing of your authentication data by Clerk.",
                            },
                            {
                                title: "Accurate Information",
                                desc: "You agree to provide accurate, current, and complete information during registration and to keep your account information updated at all times. Providing false, misleading, or outdated information is a violation of these Terms and may result in immediate account suspension or termination.",
                            },
                            {
                                title: "Account Security",
                                desc: "You are solely responsible for maintaining the confidentiality of your account credentials, including any passwords or authentication tokens. You agree to accept full responsibility for all activities that occur under your account. You must notify us immediately at security@splits.network if you suspect any unauthorized access.",
                            },
                            {
                                title: "Verification",
                                desc: "We may require identity verification or background checks to use certain platform features. Each individual may maintain only one account. Creating multiple accounts to circumvent restrictions or evade enforcement is strictly prohibited.",
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="border-l-4 border-secondary bg-base-100 p-6 mb-4 shadow-sm"
                            >
                                <h3 className="font-bold text-base mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                        <div className="border-l-4 border-warning bg-warning/5 p-6">
                            <p className="font-bold text-sm mb-1">
                                <i className="fa-duotone fa-regular fa-lock mr-2" />
                                Keep Your Password Secure
                            </p>
                            <p className="text-sm text-base-content/70">
                                Never share your password. You are liable for
                                all activity on your account.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 5 — User Conduct ═══ */}
            <section id="conduct" className={`py-16 ${sectionBg(4)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(4)} text-${badgeColor(4)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                5
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                User Conduct
                            </h2>
                        </div>
                        <p className="text-base leading-relaxed text-base-content/80 mb-6">
                            You agree to use the platforms in a manner
                            consistent with all applicable laws, regulations,
                            and these Terms. You are responsible for all content
                            you submit, communications you make, and actions you
                            take. You agree NOT to:
                        </p>
                        <div className="space-y-3">
                            {[
                                {
                                    title: "No Harassment",
                                    desc: "Harass, threaten, intimidate, defame, or discriminate against any other user or individual",
                                },
                                {
                                    title: "No Fraud",
                                    desc: "Engage in fraud, misrepresentation, or deceptive practices, including providing false information about yourself, qualifications, or job opportunities",
                                },
                                {
                                    title: "No Spam",
                                    desc: "Send unsolicited bulk communications or engage in any form of unauthorized advertising",
                                },
                                {
                                    title: "No Discrimination",
                                    desc: "Engage in discriminatory conduct that violates applicable laws or platform policies",
                                },
                                {
                                    title: "No Illegal Activity",
                                    desc: "Violate any applicable local, state, national, or international law, regulation, or third-party rights",
                                },
                                {
                                    title: "No Automation Abuse",
                                    desc: "Use automated tools, bots, or scripts to access or interact with the platforms except as expressly authorized",
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="border-l-4 border-error/30 bg-base-200 p-4 flex items-start gap-3"
                                >
                                    <span className="w-8 h-8 bg-error text-error-content flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-ban text-sm" />
                                    </span>
                                    <div>
                                        <p className="font-bold text-sm">
                                            {item.title}
                                        </p>
                                        <p className="text-sm text-base-content/60">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-base-content/70 mt-6">
                            We reserve the right to investigate and take
                            appropriate action against any user who violates
                            this section, including removing content, suspending
                            or terminating accounts, and reporting violations to
                            law enforcement authorities.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ Section 6 — Platform Rules ═══ */}
            <section id="platform-rules" className={`py-16 ${sectionBg(5)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(5)} text-${badgeColor(5)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                6
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Platform Rules
                            </h2>
                        </div>
                        <p className="text-base leading-relaxed text-base-content/80 mb-6">
                            As a split-fee recruiting marketplace, the following
                            rules govern professional conduct on the platforms.
                        </p>
                        <div className="space-y-4">
                            <div className="border-l-4 border-primary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    <i className="fa-duotone fa-regular fa-briefcase mr-2 text-primary" />
                                    For Recruiters
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    You must conduct all split-fee placements
                                    exclusively through the platform.
                                    Circumventing the platform to complete
                                    placements off-platform with contacts made
                                    through the platform is a material breach of
                                    these Terms. You must honor all split-fee
                                    agreements, maintain professional conduct in
                                    all interactions, report placements
                                    accurately and promptly, and provide
                                    truthful information about candidates and
                                    job opportunities.
                                </p>
                            </div>
                            <div className="border-l-4 border-secondary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    <i className="fa-duotone fa-regular fa-building mr-2 text-secondary" />
                                    For Companies
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    You must provide accurate and complete job
                                    descriptions, compensation details, and
                                    hiring requirements. You agree to pay all
                                    agreed placement fees promptly and in
                                    accordance with the fee schedule. You must
                                    honor placement agreements and treat all
                                    candidates referred through the platform
                                    professionally and in compliance with
                                    applicable employment laws. You may not
                                    contact candidates directly to circumvent
                                    placement fees.
                                </p>
                            </div>
                            <div className="border-l-4 border-accent bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    <i className="fa-duotone fa-regular fa-user mr-2 text-accent" />
                                    For Candidates
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    You must provide accurate information about
                                    your qualifications, experience, work
                                    history, and authorization to work. You
                                    agree to communicate promptly and
                                    professionally with recruiters and
                                    companies. Your profile information may be
                                    shared with recruiters and potential
                                    employers in the course of the placement
                                    process. You must not misrepresent your
                                    skills, credentials, or employment history.
                                </p>
                            </div>
                        </div>
                        <div className="border-l-4 border-info bg-info/5 p-6 mt-6">
                            <p className="font-bold text-sm mb-1">
                                Confidentiality
                            </p>
                            <p className="text-sm text-base-content/70">
                                All parties agree to maintain the
                                confidentiality of proprietary information
                                shared through the platform, including fee
                                arrangements, candidate details, and business
                                terms.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 7 — Fees & Payments ═══ */}
            <section id="fees" className={`py-16 ${sectionBg(6)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(6)} text-${badgeColor(6)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                7
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Fees &amp; Payments
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                {
                                    title: "Payment Processing",
                                    color: "primary",
                                    desc: "All payments on the platform are processed through Stripe, our third-party payment processor. By using the platform's payment features, you agree to Stripe's terms of service and privacy policy. You authorize Splits Network and Stripe to charge your designated payment method for all fees and charges incurred. Payment information is transmitted securely and is never stored on our servers.",
                                },
                                {
                                    title: "Fee Structure",
                                    color: "secondary",
                                    desc: "Placement fees are calculated as a percentage of the placed candidate's agreed first-year compensation. Fee percentages vary based on role type, seniority level, and market conditions. Detailed fee information is provided at the time each split-fee agreement is created on the platform.",
                                },
                                {
                                    title: "Payment Terms",
                                    color: "accent",
                                    desc: "Placement fees are due within thirty (30) days of a confirmed placement start date. Split-fee payments to recruiting partners are processed after the placement fee has been received and the guarantee period has been satisfied.",
                                },
                                {
                                    title: "Guarantee Period",
                                    color: "primary",
                                    desc: "The standard guarantee period is ninety (90) days from the candidate's start date, unless otherwise specified in the placement agreement. If a placed candidate does not complete the guarantee period, a pro-rated refund or replacement search will be offered in accordance with the terms of the specific placement agreement.",
                                },
                                {
                                    title: "Fee Disputes",
                                    color: "warning",
                                    desc: "Disputes regarding fees or payments must be raised within thirty (30) days of the transaction date.",
                                },
                                {
                                    title: "Taxes",
                                    color: "secondary",
                                    desc: "You are responsible for all applicable taxes associated with your use of the platforms and any fees or payments received through the platforms. Splits Network does not provide tax advice, and you should consult with a qualified tax professional regarding your tax obligations.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className={`border-l-4 border-${item.color} bg-base-100 p-6 shadow-sm`}
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

            {/* ═══ Section 8 — Intellectual Property ═══ */}
            <section id="ip" className={`py-16 ${sectionBg(7)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(7)} text-${badgeColor(7)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                8
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Intellectual Property
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="border-l-4 border-primary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    Platform Ownership
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    All content, features, functionality,
                                    design, code, trademarks, logos, and other
                                    intellectual property comprising the
                                    platforms are owned by Employment Networks,
                                    Inc. or our licensors and are protected by
                                    United States and international copyright,
                                    trademark, patent, trade secret, and other
                                    intellectual property laws.
                                </p>
                            </div>
                            <div className="border-l-4 border-secondary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    Limited License
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    We grant you a limited, non-exclusive,
                                    non-transferable, revocable license to
                                    access and use the platforms for their
                                    intended purpose, subject to these Terms.
                                    This license does not include the right to
                                    reproduce, distribute, modify, create
                                    derivative works from, publicly display,
                                    reverse engineer, or otherwise exploit any
                                    part of the platforms without our prior
                                    written consent.
                                </p>
                            </div>
                            <div className="border-l-4 border-accent bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    Your Content
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    You retain ownership of any content you
                                    submit to the platforms, including profile
                                    information, job descriptions, candidate
                                    summaries, and communications. By submitting
                                    content, you grant Employment Networks a
                                    worldwide, non-exclusive, royalty-free
                                    license to use, reproduce, modify, display,
                                    and distribute your content solely for the
                                    purpose of operating and improving the
                                    platforms. This license terminates when you
                                    delete your content or account, except where
                                    your content has been shared with others who
                                    have not deleted it.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 9 — AI-Powered Features ═══ */}
            <section id="ai-features" className={`py-16 ${sectionBg(8)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(8)} text-${badgeColor(8)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                9
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                AI-Powered Features
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                {
                                    title: "AI Features Overview",
                                    color: "primary",
                                    desc: "The platforms incorporate artificial intelligence and machine learning features powered by OpenAI (ChatGPT) technology. These features include intelligent candidate-to-job matching, personalized job recommendations, an AI-powered chat assistant, automated candidate profile analysis, and skill-based matching algorithms.",
                                },
                                {
                                    title: "Data Processing for AI",
                                    color: "secondary",
                                    desc: "By using the platforms, you consent to the processing of your data by AI systems. This includes the analysis of your profile information, job preferences, search history, and interactions to generate matches, recommendations, and insights. Your data may be transmitted to OpenAI's servers for processing. We implement appropriate safeguards to protect your data during AI processing.",
                                },
                                {
                                    title: "AI Limitations",
                                    color: "accent",
                                    desc: "AI-generated matches, recommendations, and responses are provided for informational purposes and as decision-support tools only. They do not constitute professional advice, guarantees of employment, or assurances of candidate quality. AI outputs may contain inaccuracies, biases, or errors. You should exercise your own judgment and conduct your own due diligence before making hiring, career, or business decisions.",
                                },
                                {
                                    title: "Automated Decision-Making",
                                    color: "error",
                                    desc: "No fully automated decisions are made regarding employment or contractual outcomes without human review. All final placement decisions are made by human users of the platforms.",
                                },
                                {
                                    title: "Opt-Out Rights",
                                    color: "warning",
                                    desc: "You have the right to opt out of AI-powered features and automated data processing. To exercise this right, contact us at privacy@splits.network. Opting out may limit the availability of certain features, including personalized matching and recommendations.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className={`border-l-4 border-${item.color} bg-base-100 p-6 shadow-sm`}
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
                        <div className="border-l-4 border-info bg-info/5 p-6 mt-6">
                            <p className="font-bold text-sm mb-1">
                                AI Content Disclaimer
                            </p>
                            <p className="text-sm text-base-content/70">
                                Content generated by AI features (including
                                match summaries, recommendations, and chat
                                responses) is provided &ldquo;as is&rdquo;
                                without warranty of accuracy, completeness, or
                                fitness for any purpose. You are responsible for
                                reviewing and verifying any AI-generated content
                                before relying on it.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 10 — Privacy & Data ═══ */}
            <section id="privacy" className={`py-16 ${sectionBg(9)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(9)} text-${badgeColor(9)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                10
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Privacy &amp; Data
                            </h2>
                        </div>
                        <p className="text-base leading-relaxed text-base-content/80 mb-6">
                            Your privacy is critically important to us. Our
                            collection, use, and protection of your personal
                            information is governed by our Privacy Policy, which
                            is incorporated into these Terms by reference.
                        </p>
                        <div className="space-y-4">
                            <div className="border-l-4 border-secondary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    <i className="fa-duotone fa-regular fa-shield-check mr-2 text-secondary" />
                                    Third-Party Data Processors
                                </h3>
                                <ul className="space-y-2 text-sm text-base-content/70">
                                    {[
                                        "Clerk — Authentication and account management",
                                        "Stripe — Payment processing",
                                        "Resend — Email communications",
                                        "Google — Analytics (GA4 for platform usage measurement)",
                                        "Microsoft — UX analytics (Clarity for session recordings and heatmaps)",
                                    ].map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2"
                                        >
                                            <i className="fa-duotone fa-regular fa-server text-xs text-secondary mt-1" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="border-l-4 border-primary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    Analytics and Tracking
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    The platforms use Google Analytics (GA4) for
                                    platform analytics and usage measurement,
                                    and Microsoft Clarity for user experience
                                    analysis including session recordings and
                                    heatmaps. These tools collect anonymized and
                                    aggregated data about how users interact
                                    with the platforms to help us identify
                                    issues, improve features, and enhance the
                                    overall user experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 11 — Disclaimers ═══ */}
            <section id="disclaimers" className={`py-16 ${sectionBg(10)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(10)} text-${badgeColor(10)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                11
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Disclaimers
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="border-l-4 border-warning bg-warning/5 p-6">
                                <p className="font-bold text-sm mb-2">
                                    AS-IS Service
                                </p>
                                <p className="text-sm text-base-content/70 uppercase font-semibold">
                                    THE PLATFORMS AND ALL CONTENT, FEATURES, AND
                                    SERVICES ARE PROVIDED &ldquo;AS IS&rdquo;
                                    AND &ldquo;AS AVAILABLE&rdquo; WITHOUT
                                    WARRANTIES OF ANY KIND, WHETHER EXPRESS,
                                    IMPLIED, STATUTORY, OR OTHERWISE. WE
                                    DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT
                                    LIMITED TO IMPLIED WARRANTIES OF
                                    MERCHANTABILITY, FITNESS FOR A PARTICULAR
                                    PURPOSE, NON-INFRINGEMENT, AND ANY
                                    WARRANTIES ARISING FROM COURSE OF DEALING OR
                                    USAGE OF TRADE.
                                </p>
                            </div>
                            <div className="border-l-4 border-warning bg-warning/5 p-6">
                                <p className="font-bold text-sm mb-2">
                                    No Guarantees
                                </p>
                                <p className="text-sm text-base-content/70">
                                    We do not warrant that the platforms will be
                                    uninterrupted, secure, or error-free, that
                                    defects will be corrected, that the
                                    platforms are free of viruses or other
                                    harmful components, or that any content or
                                    information is accurate, reliable, or
                                    complete. We make no guarantees regarding
                                    the success of placements, the quality of
                                    candidates or job opportunities, or the
                                    reliability of any user.
                                </p>
                            </div>
                            <div className="border-l-4 border-warning bg-warning/5 p-6">
                                <p className="font-bold text-sm mb-2">
                                    AI Disclaimer
                                </p>
                                <p className="text-sm text-base-content/70">
                                    We specifically disclaim all liability for
                                    AI-generated content, recommendations, and
                                    matching results. AI features are provided
                                    as decision-support tools and should not be
                                    the sole basis for any hiring, employment,
                                    or business decision.
                                </p>
                            </div>
                            <div className="border-l-4 border-warning bg-warning/5 p-6">
                                <p className="font-bold text-sm mb-2">
                                    Independent Relationship
                                </p>
                                <p className="text-sm text-base-content/70">
                                    Splits Network is a platform provider, not
                                    an employer, recruiter, or staffing agency.
                                    All users are independent parties. We are
                                    not responsible for the actions, omissions,
                                    or conduct of any user.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 12 — Limitation of Liability ═══ */}
            <section id="liability" className={`py-16 ${sectionBg(11)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(11)} text-${badgeColor(11)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                12
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Limitation of Liability
                            </h2>
                        </div>
                        <div className="border-l-4 border-error bg-error/5 p-6 mb-4">
                            <p className="font-bold text-sm mb-2">
                                Damages Limitation
                            </p>
                            <p className="text-sm text-base-content/70 uppercase font-semibold">
                                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE
                                LAW, EMPLOYMENT NETWORKS, INC. AND ITS OFFICERS,
                                DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, AND
                                LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT,
                                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                                DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF
                                PROFITS, DATA, BUSINESS OPPORTUNITIES, OR
                                GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE
                                OF THE PLATFORMS, REGARDLESS OF THE THEORY OF
                                LIABILITY.
                            </p>
                        </div>
                        <div className="border-l-4 border-error bg-error/5 p-6">
                            <p className="font-bold text-sm mb-2">
                                Liability Cap
                            </p>
                            <p className="text-sm text-base-content/70 uppercase font-semibold">
                                OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED
                                THE GREATER OF (A) THE AMOUNT YOU PAID TO US IN
                                THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR
                                (B) ONE HUNDRED DOLLARS ($100).
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 13 — Indemnification ═══ */}
            <section id="indemnification" className={`py-16 ${sectionBg(12)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(12)} text-${badgeColor(12)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                13
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Indemnification
                            </h2>
                        </div>
                        <p className="text-base leading-relaxed text-base-content/80 mb-6">
                            You agree to indemnify, defend, and hold harmless
                            Employment Networks, Inc. and its officers,
                            directors, employees, agents, affiliates,
                            successors, and assigns from and against any and all
                            claims, damages, losses, liabilities, costs, and
                            expenses (including reasonable attorneys&apos; fees)
                            arising out of or related to:
                        </p>
                        <div className="space-y-3">
                            {[
                                "Your use of or access to the platforms",
                                "Your violation of these Terms or any applicable law or regulation",
                                "Your content, including any claim that your content infringes or violates the intellectual property, privacy, or other rights of any third party",
                                "Any disputes between you and other platform users, including disputes related to placements, fees, or payments",
                                "Your negligence or willful misconduct in connection with your use of the platforms",
                                "Any misrepresentation made by you regarding your qualifications, authority, or eligibility",
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="border-l-4 border-accent bg-base-200 p-4 flex items-start gap-3"
                                >
                                    <span className="w-8 h-8 bg-accent text-accent-content flex items-center justify-center font-black text-sm flex-shrink-0">
                                        {String.fromCharCode(97 + i)}
                                    </span>
                                    <p className="text-sm text-base-content/70 pt-1">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="border-l-4 border-info bg-info/5 p-6 mt-6">
                            <p className="font-bold text-sm mb-1">
                                Defense and Settlement
                            </p>
                            <p className="text-sm text-base-content/70">
                                We reserve the right, at your expense, to assume
                                the exclusive defense and control of any matter
                                for which you are required to indemnify us. You
                                agree not to settle any such matter without our
                                prior written consent.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 14 — Termination ═══ */}
            <section id="termination" className={`py-16 ${sectionBg(13)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(13)} text-${badgeColor(13)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                14
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Termination
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="border-l-4 border-primary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    Termination by You
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    You may terminate your account at any time
                                    by contacting our support team at
                                    support@employment-networks.com or through
                                    the account settings within the platform.
                                    Upon termination, your right to use the
                                    platforms will cease immediately. Any
                                    outstanding obligations, including unpaid
                                    fees or pending placements, will survive
                                    termination.
                                </p>
                            </div>
                            <div className="border-l-4 border-secondary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    Termination by Employment Networks
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    We reserve the right to suspend or terminate
                                    your account, with or without notice, for
                                    any reason, including but not limited to:
                                    violation of these Terms; fraudulent,
                                    abusive, or illegal activity; repeated
                                    misconduct or professional violations;
                                    non-payment of fees or outstanding balances;
                                    extended inactivity (accounts inactive for
                                    more than twelve consecutive months); or at
                                    our sole discretion if we believe your
                                    continued use poses a risk to the platforms,
                                    its users, or our business.
                                </p>
                            </div>
                            <div className="border-l-4 border-accent bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    Data After Termination
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    Upon account termination, you may request a
                                    copy of your data in a machine-readable
                                    format by contacting privacy@splits.network
                                    within thirty (30) days. After this period,
                                    we may delete your data in accordance with
                                    our retention policies, except where
                                    retention is required by law.
                                </p>
                            </div>
                        </div>
                        <div className="border-l-4 border-info bg-info/5 p-6 mt-6">
                            <p className="font-bold text-sm mb-1">
                                Surviving Clauses
                            </p>
                            <p className="text-sm text-base-content/70">
                                The following provisions survive termination:
                                Intellectual Property, Disclaimers, Limitation
                                of Liability, Indemnification, Dispute
                                Resolution, and Governing Law. Any accrued
                                rights or obligations, including payment
                                obligations, will not be affected by
                                termination.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 15 — Dispute Resolution ═══ */}
            <section id="disputes" className={`py-16 ${sectionBg(14)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(14)} text-${badgeColor(14)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                15
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Dispute Resolution
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="border-l-4 border-primary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    <span className="w-7 h-7 bg-primary text-primary-content inline-flex items-center justify-center font-black text-sm mr-2">
                                        1
                                    </span>
                                    Informal Resolution
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    Before initiating any formal dispute
                                    resolution proceeding, you agree to first
                                    attempt to resolve any dispute informally by
                                    contacting us at
                                    legal@employment-networks.com. The parties
                                    will attempt in good faith to resolve the
                                    dispute within thirty (30) days of written
                                    notice.
                                </p>
                            </div>
                            <div className="border-l-4 border-secondary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    <span className="w-7 h-7 bg-secondary text-secondary-content inline-flex items-center justify-center font-black text-sm mr-2">
                                        2
                                    </span>
                                    Non-Binding Mediation
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    If the dispute cannot be resolved
                                    informally, the parties agree to submit the
                                    dispute to non-binding mediation
                                    administered by a mutually agreed-upon
                                    mediator. Mediation shall take place within
                                    sixty (60) days of the end of the informal
                                    resolution period. The costs of mediation
                                    shall be shared equally between the parties.
                                </p>
                            </div>
                            <div className="border-l-4 border-accent bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    <span className="w-7 h-7 bg-accent text-accent-content inline-flex items-center justify-center font-black text-sm mr-2">
                                        3
                                    </span>
                                    Binding Arbitration
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    If the dispute is not resolved through
                                    mediation, it shall be resolved by binding
                                    arbitration administered by the American
                                    Arbitration Association (AAA) in accordance
                                    with its Commercial Arbitration Rules. The
                                    arbitration shall be conducted by a single
                                    arbitrator in the State of Delaware. The
                                    arbitrator&apos;s decision shall be final
                                    and binding, and judgment on the award may
                                    be entered in any court of competent
                                    jurisdiction.
                                </p>
                            </div>
                        </div>
                        <div className="border-l-4 border-error bg-error/5 p-6 mt-6">
                            <p className="font-bold text-sm mb-2">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation mr-2" />
                                Class Action Waiver
                            </p>
                            <p className="text-sm text-base-content/70 uppercase font-semibold">
                                YOU AGREE THAT ANY DISPUTE RESOLUTION
                                PROCEEDINGS WILL BE CONDUCTED ONLY ON AN
                                INDIVIDUAL BASIS AND NOT IN A CLASS,
                                CONSOLIDATED, OR REPRESENTATIVE ACTION. YOU
                                EXPRESSLY WAIVE ANY RIGHT TO PARTICIPATE IN A
                                CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 16 — Governing Law ═══ */}
            <section id="governing-law" className={`py-16 ${sectionBg(15)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(15)} text-${badgeColor(15)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                16
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Governing Law
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-base leading-relaxed text-base-content/80">
                                These Terms of Service and any dispute arising
                                out of or related to them or the platforms shall
                                be governed by and construed in accordance with
                                the laws of the State of Delaware, United States
                                of America, without regard to its conflict of
                                law principles.
                            </p>
                            <p className="text-base leading-relaxed text-base-content/80">
                                For any matters not subject to arbitration under
                                these Terms, you agree to submit to the personal
                                and exclusive jurisdiction of the state and
                                federal courts located in the State of Delaware.
                                You waive any objection to the exercise of
                                jurisdiction over you by such courts and to
                                venue in such courts.
                            </p>
                            <p className="text-base leading-relaxed text-base-content/80">
                                If you are accessing the platforms from outside
                                the United States, you are responsible for
                                compliance with all applicable local laws.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 17 — Changes to Terms ═══ */}
            <section id="changes" className={`py-16 ${sectionBg(16)}`}>
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section scroll-reveal fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className={`w-10 h-10 bg-${badgeColor(16)} text-${badgeColor(16)}-content flex items-center justify-center font-black text-lg flex-shrink-0`}
                            >
                                17
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                Changes to Terms
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="border-l-4 border-primary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    Material Changes
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    For material changes that significantly
                                    affect your rights or obligations, we will
                                    provide at least thirty (30) days&apos;
                                    advance notice before the changes take
                                    effect. Notice will be provided through one
                                    or more of the following methods: email
                                    notification to the address associated with
                                    your account, prominent notice within the
                                    platforms, or announcement on our website.
                                </p>
                            </div>
                            <div className="border-l-4 border-secondary bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    Acceptance of Changes
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    Your continued use of the platforms after
                                    the effective date of any changes
                                    constitutes your acceptance of the revised
                                    Terms. If you do not agree to the revised
                                    Terms, you must stop using the platforms and
                                    may terminate your account.
                                </p>
                            </div>
                            <div className="border-l-4 border-accent bg-base-100 p-6 shadow-sm">
                                <h3 className="font-bold text-base mb-2">
                                    Version History
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    We maintain previous versions of these Terms
                                    for reference. You may request a copy of any
                                    prior version by contacting
                                    legal@employment-networks.com.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CONTACT ═══ */}
            <section
                id="contact"
                className="py-16 bg-primary text-primary-content"
            >
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-contact scroll-reveal fade-up">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-8 text-center">
                            Questions About These Terms?
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-l-4 border-white/30 bg-white/10 p-6">
                                <div className="w-12 h-12 bg-white/20 flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-gavel text-lg" />
                                </div>
                                <h3 className="font-bold text-base mb-2">
                                    Legal Team
                                </h3>
                                <a
                                    href="mailto:legal@employment-networks.com"
                                    className="text-sm font-bold underline hover:opacity-80 transition-opacity"
                                >
                                    legal@employment-networks.com
                                </a>
                            </div>
                            <div className="border-l-4 border-white/30 bg-white/10 p-6">
                                <div className="w-12 h-12 bg-white/20 flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-headset text-lg" />
                                </div>
                                <h3 className="font-bold text-base mb-2">
                                    Support
                                </h3>
                                <a
                                    href="mailto:support@employment-networks.com"
                                    className="text-sm font-bold underline hover:opacity-80 transition-opacity"
                                >
                                    support@employment-networks.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </LegalBaselAnimator>
    );
}
