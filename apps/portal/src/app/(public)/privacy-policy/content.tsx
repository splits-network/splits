import Link from "next/link";

/* ─── Metadata ──────────────────────────────────────────────────────────── */
const meta = {
    title: "Privacy Policy",
    subtitle:
        "How we collect, use, and protect your personal information across the Splits Network platform",
    lastUpdated: "February 20, 2026",
    entity: "Employment Networks, Inc.",
};

const heroImage =
    "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=1920&q=80";

/* ─── TOC Items ─────────────────────────────────────────────────────────── */
const tocItems = [
    { id: "overview", label: "Overview", icon: "fa-eye" },
    { id: "information-we-collect", label: "Information We Collect", icon: "fa-database" },
    { id: "how-we-use-information", label: "How We Use Information", icon: "fa-gear" },
    { id: "information-sharing", label: "Information Sharing", icon: "fa-share-nodes" },
    { id: "data-security", label: "Data Security", icon: "fa-shield" },
    { id: "data-retention", label: "Data Retention", icon: "fa-clock" },
    { id: "your-rights", label: "Your Privacy Rights", icon: "fa-hand" },
    { id: "cookies", label: "Cookies & Tracking", icon: "fa-cookie-bite" },
    { id: "third-party", label: "Third-Party Services", icon: "fa-link" },
    { id: "ai-processing", label: "AI & Automated Processing", icon: "fa-robot" },
    { id: "international", label: "International Transfers", icon: "fa-earth-americas" },
    { id: "children", label: "Children's Privacy", icon: "fa-child" },
    { id: "california", label: "California Rights (CCPA/CPRA)", icon: "fa-scroll" },
    { id: "gdpr", label: "GDPR Rights (EU)", icon: "fa-flag" },
    { id: "changes", label: "Changes to This Policy", icon: "fa-rotate" },
];

/* ─── Third-Party Services Data ─────────────────────────────────────────── */
const thirdPartyServices = [
    {
        name: "Clerk",
        purpose: "Authentication, identity management, SSO, social login",
        data: "Name, email, profile image, session data, login history",
        url: "https://clerk.com/privacy",
        icon: "fa-lock",
    },
    {
        name: "Stripe",
        purpose: "Payment processing, billing, invoicing",
        data: "Payment method details, transaction history, billing address",
        url: "https://stripe.com/privacy",
        icon: "fa-credit-card",
    },
    {
        name: "Google Analytics (GA4)",
        purpose: "Page views, user interactions, demographics, device info",
        data: "Browsing behavior, session duration, geographic location (general)",
        url: "https://policies.google.com/privacy",
        icon: "fa-chart-line",
    },
    {
        name: "Microsoft Clarity",
        purpose: "Session recordings, heatmaps, click tracking, scroll depth",
        data: "User interaction recordings, mouse movements, click patterns",
        url: "https://privacy.microsoft.com/en-us/privacystatement",
        icon: "fa-cursor",
    },
    {
        name: "OpenAI / ChatGPT",
        purpose: "AI-powered candidate matching, job recommendations, AI assistant",
        data: "Job descriptions, anonymized candidate profiles, AI chat messages",
        url: "https://openai.com/privacy",
        icon: "fa-brain",
    },
    {
        name: "Supabase",
        purpose: "Database infrastructure, real-time data, file storage",
        data: "All platform data stored in encrypted PostgreSQL database",
        url: "https://supabase.com/privacy",
        icon: "fa-database",
    },
    {
        name: "Resend",
        purpose: "Transactional and marketing email delivery",
        data: "Email addresses, message content, delivery status",
        url: "https://resend.com/legal/privacy-policy",
        icon: "fa-envelope",
    },
    {
        name: "LinkedIn",
        purpose: "Professional network integration, profile import",
        data: "Professional profile data, work history, connections (with consent)",
        url: "https://www.linkedin.com/legal/privacy-policy",
        icon: "fa-briefcase",
    },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function PrivacyPolicyContent() {
    return (
        <main className="overflow-hidden">
            {/* ═══════════════════════════════════════════════════════
                HERO -- Split-screen 60/40 with diagonal clip
               ═══════════════════════════════════════════════════════ */}
            <section className="hero-section relative min-h-[92vh] flex items-center bg-base-100">
                {/* Right image panel -- 40% on desktop */}
                <div
                    className="hero-img-wrap absolute inset-0 lg:left-[58%]"
                    style={{
                        clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                >
                    <img
                        src={heroImage}
                        alt="Data security and privacy protection"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral/60 lg:bg-neutral/20"></div>
                </div>

                {/* Content panel -- 60% on desktop */}
                <div className="relative z-10 container mx-auto px-6 lg:px-12 py-28">
                    <div className="max-w-2xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6">
                            <i className="fa-duotone fa-regular fa-shield-check mr-2"></i>
                            Legal
                        </p>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="hero-headline-word inline-block text-base-content lg:text-base-content">
                                Privacy
                            </span>{" "}
                            <span className="hero-headline-word inline-block text-primary">
                                Policy.
                            </span>
                        </h1>

                        <p className="hero-subtitle text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl mb-8">
                            {meta.subtitle}
                        </p>

                        <div className="flex flex-wrap items-center gap-6">
                            <span className="hero-meta-item text-xs uppercase tracking-[0.15em] text-base-content/50">
                                <i className="fa-duotone fa-regular fa-building mr-1"></i>
                                {meta.entity}
                            </span>
                            <span className="hero-meta-item text-xs uppercase tracking-[0.15em] text-base-content/50">
                                <i className="fa-duotone fa-regular fa-calendar mr-1"></i>
                                Last Updated: {meta.lastUpdated}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                TABLE OF CONTENTS
               ═══════════════════════════════════════════════════════ */}
            <section className="py-20 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <div className="border-l-4 border-primary pl-8 lg:pl-12">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                <i className="fa-duotone fa-regular fa-list mr-2"></i>
                                Quick Navigation
                            </p>
                            <h2 className="text-3xl md:text-4xl font-black leading-[0.95] tracking-tight mb-8">
                                Table of Contents
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                                {tocItems.map((item, i) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className="flex items-center gap-3 text-base-content/70 hover:text-primary transition-colors"
                                    >
                                        <span className="text-xs font-bold text-primary w-6">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <i className={`fa-duotone fa-regular ${item.icon} text-sm text-primary/50 w-5`}></i>
                                        <span className="text-sm">{item.label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 1 -- Overview
                Article block
               ═══════════════════════════════════════════════════════ */}
            <section id="overview" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            01 -- Overview
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Your privacy matters to us.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                Employment Networks, Inc. (&ldquo;Splits Network,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates a split-fee recruiting marketplace that connects recruiters, candidates, and companies. We are committed to protecting your privacy and being transparent about how we handle your personal information.
                            </p>
                            <p>
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you:
                            </p>
                            <ul className="space-y-3 pl-4">
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Visit our websites, including splits.network and applicant.network</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Use our platform, mobile applications, or related services</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Create an account as a recruiter, candidate, or company representative</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Interact with our AI-powered features, customer support, or marketing communications</span>
                                </li>
                            </ul>
                            <p>
                                By accessing or using our services, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please do not use our services.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 2 -- Information We Collect
                Split-screen (60 text / 40 image)
               ═══════════════════════════════════════════════════════ */}
            <section id="information-we-collect" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                        {/* Text -- 3 of 5 columns */}
                        <div className="split-text-left lg:col-span-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                02 -- Information We Collect
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                What we collect
                                <br />
                                and why.
                            </h2>

                            {/* Information You Provide */}
                            <h3 className="text-2xl font-black tracking-tight mb-4 mt-8">
                                Information You Provide Directly
                            </h3>
                            <div className="space-y-4 text-base-content/70 leading-relaxed text-lg mb-8">
                                <p>
                                    <strong className="text-base-content font-bold">Account Information:</strong>{" "}
                                    When you register, we collect your name, email address, phone number, job title, company name, and password. If you authenticate through Clerk using social login (Google, LinkedIn, or SSO), we receive your name, email, and profile image from those providers.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Profile Information:</strong>{" "}
                                    Professional background, skills, experience, education history, resume or CV, certifications, work authorization status, and professional headshot.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Identity Verification:</strong>{" "}
                                    Government-issued identification, professional licenses, and employment verification documents when required for compliance.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Payment Information:</strong>{" "}
                                    Bank account details, billing address, and tax identification numbers. Payment card details are processed and stored exclusively by Stripe and are never stored on our servers.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Communications:</strong>{" "}
                                    Messages sent through our platform, feedback, support requests, and interactions with our AI assistant.
                                </p>
                            </div>

                            {/* Automatic Collection */}
                            <h3 className="text-2xl font-black tracking-tight mb-4">
                                Information Collected Automatically
                            </h3>
                            <div className="space-y-4 text-base-content/70 leading-relaxed text-lg mb-8">
                                <p>
                                    <strong className="text-base-content font-bold">Device and Browser Data:</strong>{" "}
                                    IP address, browser type and version, operating system, device identifiers, screen resolution, and language preferences.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Usage Analytics:</strong>{" "}
                                    Through Google Analytics (GA4), we collect page views, user interactions, session duration, navigation paths, demographic data, and general geographic location. Through Microsoft Clarity, we record session replays, heatmaps, click tracking, and scroll depth to understand how users interact with our platform.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Authentication Data:</strong>{" "}
                                    Clerk collects session tokens, login timestamps, login methods, device fingerprints, and authentication history to secure your account.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Performance Data:</strong>{" "}
                                    Error logs, page loading times, API response times, and application performance metrics.
                                </p>
                            </div>

                            {/* Third-Party Sources */}
                            <h3 className="text-2xl font-black tracking-tight mb-4">
                                Information from Third Parties
                            </h3>
                            <div className="space-y-4 text-base-content/70 leading-relaxed text-lg">
                                <p>
                                    <strong className="text-base-content font-bold">LinkedIn:</strong>{" "}
                                    When you connect your LinkedIn account, we receive professional profile information, work history, education, skills, and endorsements with your explicit consent.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Background Checks:</strong>{" "}
                                    Employment verification and references provided with your consent through authorized verification services.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Integration Partners:</strong>{" "}
                                    Data from applicant tracking systems (ATS) and HR platforms that you or your employer choose to integrate with Splits Network.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Public Sources:</strong>{" "}
                                    Publicly available professional information from business directories, professional associations, and public social media profiles.
                                </p>
                            </div>
                        </div>

                        {/* Image -- 2 of 5 columns */}
                        <div className="split-img-right lg:col-span-2">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80"
                                    alt="Data collection and digital security"
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-primary/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 3 -- How We Use Information
                Article block
               ═══════════════════════════════════════════════════════ */}
            <section id="how-we-use-information" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            03 -- How We Use Information
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Purpose drives
                            <br />
                            every decision.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <h3 className="text-2xl font-black tracking-tight text-base-content">
                                Platform Services
                            </h3>
                            <p>
                                We use your information to operate and deliver the core Splits Network platform: creating and managing your account, facilitating candidate-to-job matching, enabling split-fee agreements between recruiters, processing payments through Stripe, providing customer support, and verifying identities for compliance purposes.
                            </p>

                            <h3 className="text-2xl font-black tracking-tight text-base-content">
                                Communication
                            </h3>
                            <p>
                                We send transactional emails through Resend regarding account activity, job opportunities, candidate submissions, split-fee agreement updates, feature announcements, and platform notifications. Marketing communications are sent only with your consent, and you can opt out at any time.
                            </p>

                            <h3 className="text-2xl font-black tracking-tight text-base-content">
                                Analytics and AI
                            </h3>
                            <p>
                                We use Google Analytics and Microsoft Clarity to understand how users interact with our platform, identify usability issues, and improve the user experience. Our AI features, powered by OpenAI, analyze job descriptions and candidate profiles (in anonymized form) to provide intelligent matching, recommendations, and conversational assistance. We do not use your personal data to train third-party AI models.
                            </p>

                            <h3 className="text-2xl font-black tracking-tight text-base-content">
                                Platform Improvement and Safety
                            </h3>
                            <p>
                                We analyze usage patterns to develop new features, improve existing functionality, monitor for security threats, detect and prevent fraud, enforce our terms of service, and comply with legal obligations. We may use anonymized, aggregated data for industry research and reporting that cannot identify individual users.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                PULL QUOTE 1
               ═══════════════════════════════════════════════════════ */}
            <section className="pull-quote-block py-20 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="border-l-4 border-secondary pl-8 lg:pl-12">
                            <i className="fa-duotone fa-regular fa-quote-left text-4xl text-secondary/30 mb-6 block"></i>
                            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                                &ldquo;Your data belongs to you. We are custodians, not owners.&rdquo;
                            </blockquote>
                            <cite className="text-sm uppercase tracking-[0.2em] text-neutral-content/50 not-italic">
                                -- Splits Network Privacy Principles
                            </cite>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 4 -- Information Sharing & Disclosure
                Split-screen (40 image / 60 text)
               ═══════════════════════════════════════════════════════ */}
            <section id="information-sharing" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                        {/* Image -- 2 of 5 columns */}
                        <div className="split-img-left lg:col-span-2">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(0 0, 92% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80"
                                    alt="Secure data sharing and collaboration"
                                    className="w-full h-[520px] object-cover"
                                />
                            </div>
                        </div>

                        {/* Text -- 3 of 5 columns */}
                        <div className="split-text-right lg:col-span-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                04 -- Information Sharing
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                Who sees
                                <br />
                                your data.
                            </h2>

                            <h3 className="text-2xl font-black tracking-tight mb-4">
                                Within the Platform
                            </h3>
                            <div className="space-y-4 text-base-content/70 leading-relaxed text-lg mb-8">
                                <p>
                                    <strong className="text-base-content font-bold">Candidate Profiles:</strong>{" "}
                                    Shared with recruiters and companies as part of the matching and placement process. You control the visibility of your profile and can restrict sharing at any time.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Recruiter Information:</strong>{" "}
                                    Shared with other recruiters to facilitate split-fee partnerships, and with companies to present qualified candidates during the hiring process.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Company Information:</strong>{" "}
                                    Job postings and company profiles are shared with recruiters in the network. Confidential searches are handled with additional privacy controls.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Anonymized Analytics:</strong>{" "}
                                    Aggregated success rates, placement metrics, and industry benchmarks that cannot identify individuals.
                                </p>
                            </div>

                            <h3 className="text-2xl font-black tracking-tight mb-4">
                                Service Providers
                            </h3>
                            <p className="text-base-content/70 leading-relaxed text-lg mb-8">
                                We share information with trusted service providers who process data on our behalf, subject to strict contractual obligations. These include Clerk (authentication), Stripe (payments), Supabase (database), Resend (email), Google Analytics and Microsoft Clarity (analytics), and OpenAI (AI features). Each provider is bound by data processing agreements and may only use your data to provide services to us.
                            </p>

                            <h3 className="text-2xl font-black tracking-tight mb-4">
                                Legal Requirements
                            </h3>
                            <p className="text-base-content/70 leading-relaxed text-lg">
                                We may disclose your information when required by law, in response to valid legal process (such as a subpoena or court order), to protect the rights, property, or safety of Employment Networks, our users, or the public, or to detect, prevent, or address fraud, security issues, or technical problems.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 5 -- Data Security
                Article block
               ═══════════════════════════════════════════════════════ */}
            <section id="data-security" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            05 -- Data Security
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Security is not optional.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                            </p>

                            <div className="space-y-4">
                                {[
                                    {
                                        icon: "fa-duotone fa-regular fa-lock-keyhole",
                                        title: "Encryption",
                                        body: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Payment data is processed in PCI DSS-compliant environments through Stripe.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-user-shield",
                                        title: "Access Controls",
                                        body: "Role-based access controls, multi-factor authentication through Clerk, and the principle of least privilege ensure only authorized personnel access your data.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-server",
                                        title: "Infrastructure Security",
                                        body: "Our infrastructure is hosted on secure cloud platforms with regular security audits, penetration testing, and vulnerability assessments. Supabase provides enterprise-grade database security with row-level security policies.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-radar",
                                        title: "Monitoring and Incident Response",
                                        body: "24/7 security monitoring, automated threat detection, and a documented incident response plan ensure rapid identification and remediation of security events.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-arrows-rotate",
                                        title: "Regular Updates",
                                        body: "Continuous security patches, dependency updates, and regular review of security practices to address emerging threats.",
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-10 h-10 flex-shrink-0 bg-primary/10 flex items-center justify-center">
                                            <i className={`${item.icon} text-primary`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base-content text-lg mb-1">{item.title}</h4>
                                            <p className="text-sm text-base-content/60 leading-relaxed">{item.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p>
                                While we implement robust security measures, no method of transmission over the Internet or electronic storage is completely secure. We encourage you to use strong, unique passwords, enable two-factor authentication, and promptly report any suspicious activity on your account.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 6 -- Data Retention
                Split-screen (60 text / 40 image)
               ═══════════════════════════════════════════════════════ */}
            <section id="data-retention" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                        {/* Text -- 3 of 5 columns */}
                        <div className="split-text-left lg:col-span-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                06 -- Data Retention
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                We keep data only
                                <br />
                                as long as needed.
                            </h2>
                            <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                                <p>
                                    We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Active Accounts:</strong>{" "}
                                    Your information is retained for the duration of your active account. You can request deletion at any time through your account settings or by contacting us.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Inactive Accounts:</strong>{" "}
                                    Accounts that have been inactive for more than three years may be scheduled for deletion. We will send a 60-day notice to your registered email before any deletion occurs.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Transaction Records:</strong>{" "}
                                    Financial records, including payment history and split-fee agreement records, are retained for seven years to comply with tax, accounting, and regulatory requirements.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Legal Holds:</strong>{" "}
                                    When required by law, litigation, or regulatory investigation, we may retain information beyond standard retention periods.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Analytics Data:</strong>{" "}
                                    Google Analytics data is retained for 14 months. Microsoft Clarity session recordings are retained for 30 days. Anonymized and aggregated data may be retained indefinitely for statistical analysis.
                                </p>
                            </div>
                        </div>

                        {/* Image -- 2 of 5 columns */}
                        <div className="split-img-right lg:col-span-2">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80"
                                    alt="Secure data storage infrastructure"
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-primary/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 7 -- Your Privacy Rights
                Article block
               ═══════════════════════════════════════════════════════ */}
            <section id="your-rights" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            07 -- Your Privacy Rights
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            You are in control.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                Regardless of where you are located, we provide all users with the following rights regarding their personal information:
                            </p>

                            <div className="space-y-4">
                                {[
                                    {
                                        icon: "fa-duotone fa-regular fa-eye",
                                        title: "Right to Access",
                                        body: "You may request a copy of the personal information we hold about you. We will provide this in a commonly used, machine-readable format within 30 days of your request.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-pen-to-square",
                                        title: "Right to Correction",
                                        body: "You may request that we correct any inaccurate or incomplete personal information. You can also update most information directly through your account settings.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-trash-can",
                                        title: "Right to Deletion",
                                        body: "You may request deletion of your personal information, subject to certain exceptions such as legal obligations, active financial transactions, or fraud prevention requirements.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-download",
                                        title: "Right to Data Portability",
                                        body: "You may request your data in a structured, commonly used, and machine-readable format, and have it transferred to another service provider where technically feasible.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-hand",
                                        title: "Right to Restrict Processing",
                                        body: "You may request that we limit how we process your data in certain circumstances, such as when you contest the accuracy of data or object to processing.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-circle-xmark",
                                        title: "Right to Object",
                                        body: "You may object to the processing of your personal information for direct marketing purposes, or where we rely on legitimate interests as the legal basis for processing.",
                                    },
                                    {
                                        icon: "fa-duotone fa-regular fa-arrow-rotate-left",
                                        title: "Right to Withdraw Consent",
                                        body: "Where we process your data based on consent, you may withdraw that consent at any time. Withdrawal does not affect the lawfulness of processing performed before withdrawal.",
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-10 h-10 flex-shrink-0 bg-primary/10 flex items-center justify-center">
                                            <i className={`${item.icon} text-primary`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base-content text-lg mb-1">{item.title}</h4>
                                            <p className="text-sm text-base-content/60 leading-relaxed">{item.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p>
                                To exercise any of these rights, please contact us at{" "}
                                <a href="mailto:privacy@splits.network" className="text-primary underline">
                                    privacy@splits.network
                                </a>
                                . We will respond to your request within 30 days. We may ask you to verify your identity before processing your request to protect your account security.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                PULL QUOTE 2
               ═══════════════════════════════════════════════════════ */}
            <section className="pull-quote-block py-20 bg-primary text-primary-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <i className="fa-duotone fa-regular fa-quote-left text-4xl text-primary-content/20 mb-6 block"></i>
                        <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                            &ldquo;Privacy is not a feature. It is a fundamental right.&rdquo;
                        </blockquote>
                        <cite className="text-sm uppercase tracking-[0.2em] text-primary-content/50 not-italic">
                            -- Splits Network Privacy Principles
                        </cite>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 8 -- Cookies & Tracking Technologies
                Split-screen (40 image / 60 text)
               ═══════════════════════════════════════════════════════ */}
            <section id="cookies" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                        {/* Image -- 2 of 5 columns */}
                        <div className="split-img-left lg:col-span-2">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(0 0, 92% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80"
                                    alt="Digital tracking and cookie technologies"
                                    className="w-full h-[520px] object-cover"
                                />
                            </div>
                        </div>

                        {/* Text -- 3 of 5 columns */}
                        <div className="split-text-right lg:col-span-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                08 -- Cookies & Tracking
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                Transparency about
                                <br />
                                tracking.
                            </h2>

                            <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                                <p>
                                    We use cookies and similar tracking technologies to operate our platform, analyze usage, and personalize your experience. Below is a detailed breakdown of the cookies we use.
                                </p>

                                <h3 className="text-2xl font-black tracking-tight text-base-content">
                                    Essential Cookies (Clerk)
                                </h3>
                                <p>
                                    Clerk sets session cookies that are strictly necessary for authentication and security. These cookies maintain your login state, manage session tokens, enable single sign-on (SSO) functionality, and protect against cross-site request forgery. These cookies cannot be disabled without breaking core platform functionality.
                                </p>

                                <h3 className="text-2xl font-black tracking-tight text-base-content">
                                    Analytics Cookies (Google Analytics -- GA4)
                                </h3>
                                <p>
                                    Google Analytics uses cookies (including <code className="text-primary bg-base-300 px-1.5 py-0.5 text-sm">_ga</code>, <code className="text-primary bg-base-300 px-1.5 py-0.5 text-sm">_ga_*</code>, and <code className="text-primary bg-base-300 px-1.5 py-0.5 text-sm">_gid</code>) to distinguish unique users, track session activity, measure page views and user interactions, collect demographic and interest data, and generate aggregated usage reports. These cookies have a maximum lifespan of 2 years. Data is transmitted to and processed by Google in the United States.
                                </p>

                                <h3 className="text-2xl font-black tracking-tight text-base-content">
                                    Experience Cookies (Microsoft Clarity)
                                </h3>
                                <p>
                                    Microsoft Clarity uses cookies (including <code className="text-primary bg-base-300 px-1.5 py-0.5 text-sm">_clck</code> and <code className="text-primary bg-base-300 px-1.5 py-0.5 text-sm">_clsk</code>) to record session replays and heatmaps of user interactions. These recordings help us understand how users navigate the platform, identify UX issues, measure click patterns and scroll behavior, and improve page layouts and workflows. Clarity automatically masks sensitive input fields. These cookies have a maximum lifespan of 1 year. Data is processed by Microsoft.
                                </p>

                                <h3 className="text-2xl font-black tracking-tight text-base-content">
                                    Managing Cookies
                                </h3>
                                <p>
                                    You can control cookie preferences through your browser settings. Most browsers allow you to block or delete cookies. However, blocking essential cookies may prevent you from using our platform. For detailed information about our cookie practices, please see our{" "}
                                    <Link href="/cookie-policy" className="text-primary underline">
                                        Cookie Policy
                                    </Link>
                                    .
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 9 -- Third-Party Services
                Article block with service cards
               ═══════════════════════════════════════════════════════ */}
            <section id="third-party" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            09 -- Third-Party Services
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                            Our trusted partners.
                        </h2>
                        <p className="text-lg text-base-content/70 leading-relaxed mb-10">
                            Our platform integrates with the following third-party services. Each provider maintains their own privacy policy governing how they process your data. We encourage you to review their policies.
                        </p>

                        <div className="space-y-6">
                            {thirdPartyServices.map((service, i) => (
                                <div key={i} className="border-l-4 border-base-300 pl-6 py-2 hover:border-primary transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 flex-shrink-0 bg-primary/10 flex items-center justify-center mt-1">
                                            <i className={`fa-duotone fa-regular ${service.icon} text-primary`}></i>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-base-content text-lg">
                                                {service.name}
                                            </h4>
                                            <p className="text-sm text-base-content/70 mb-1">
                                                {service.purpose}
                                            </p>
                                            <p className="text-sm text-base-content/50 mb-2">
                                                <strong>Data processed:</strong> {service.data}
                                            </p>
                                            <a
                                                href={service.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary uppercase tracking-[0.15em] font-semibold hover:underline"
                                            >
                                                View Privacy Policy <i className="fa-duotone fa-regular fa-arrow-up-right-from-square ml-1"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-base-content/70 leading-relaxed text-lg mt-10">
                            We enter into data processing agreements with all third-party service providers to ensure they handle your data in compliance with applicable privacy laws. We regularly review these agreements and the security practices of our partners.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 10 -- AI & Automated Processing
                Split-screen (60 text / 40 image)
               ═══════════════════════════════════════════════════════ */}
            <section id="ai-processing" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                        {/* Text -- 3 of 5 columns */}
                        <div className="split-text-left lg:col-span-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                10 -- AI & Automated Processing
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                Responsible AI,
                                <br />
                                always.
                            </h2>
                            <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                                <p>
                                    Splits Network uses artificial intelligence and automated processing, powered by OpenAI&apos;s technology, to enhance our platform services. We are committed to using AI responsibly and transparently.
                                </p>

                                <h3 className="text-2xl font-black tracking-tight text-base-content">
                                    How We Use AI
                                </h3>
                                <p>
                                    <strong className="text-base-content font-bold">Candidate Matching:</strong>{" "}
                                    Our AI analyzes job descriptions and candidate profiles to suggest optimal matches based on skills, experience, location, and other relevant factors. Candidate data is anonymized before being processed by AI systems.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">Job Recommendations:</strong>{" "}
                                    AI-powered recommendations suggest relevant job opportunities to candidates based on their profile, preferences, and activity patterns.
                                </p>
                                <p>
                                    <strong className="text-base-content font-bold">AI Assistant:</strong>{" "}
                                    Our conversational AI assistant helps users navigate the platform, answer questions, and provide guidance. Chat messages with the AI assistant may be processed by OpenAI to generate responses.
                                </p>

                                <h3 className="text-2xl font-black tracking-tight text-base-content">
                                    Data Protection in AI Processing
                                </h3>
                                <p>
                                    We take the following measures to protect your data during AI processing:
                                </p>
                                <ul className="space-y-3 pl-4">
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                        <span>Candidate profiles are anonymized before AI processing -- personal identifiers are removed</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                        <span>We do not use your personal data to train third-party AI models</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                        <span>AI outputs are recommendations only -- no automated decisions are made without human review</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                        <span>Data sent to OpenAI is transmitted over encrypted connections and subject to our data processing agreement</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                        <span>You can opt out of AI-powered features at any time through your account settings</span>
                                    </li>
                                </ul>

                                <h3 className="text-2xl font-black tracking-tight text-base-content">
                                    Your Rights Regarding AI
                                </h3>
                                <p>
                                    You have the right to: request information about how AI is used in decisions affecting you, object to automated processing, request human review of any AI-generated recommendation, and opt out of AI-powered features entirely. No solely automated decision with legal or similarly significant effects is made about you without human oversight.
                                </p>
                            </div>
                        </div>

                        {/* Image -- 2 of 5 columns */}
                        <div className="split-img-right lg:col-span-2">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80"
                                    alt="Artificial intelligence and data processing"
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-primary/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                PULL QUOTE 3
               ═══════════════════════════════════════════════════════ */}
            <section className="pull-quote-block py-20 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="border-l-4 border-secondary pl-8 lg:pl-12">
                            <i className="fa-duotone fa-regular fa-quote-left text-4xl text-secondary/30 mb-6 block"></i>
                            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                                &ldquo;AI should serve people, not surveil them.&rdquo;
                            </blockquote>
                            <cite className="text-sm uppercase tracking-[0.2em] text-neutral-content/50 not-italic">
                                -- Splits Network AI Ethics Principles
                            </cite>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 11 -- International Data Transfers
                Article block
               ═══════════════════════════════════════════════════════ */}
            <section id="international" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            11 -- International Data Transfers
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Data across borders.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                Employment Networks, Inc. is based in the United States. Your information may be transferred to, stored in, and processed in the United States and other countries where our service providers operate. These countries may have different data protection laws than your country of residence.
                            </p>
                            <p>
                                When we transfer personal data outside of the European Economic Area (EEA), the United Kingdom, or Switzerland, we ensure appropriate safeguards are in place, including:
                            </p>
                            <ul className="space-y-3 pl-4">
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span><strong className="text-base-content">Adequacy Decisions:</strong> Transferring data to countries that the European Commission has determined provide an adequate level of data protection.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span><strong className="text-base-content">Standard Contractual Clauses:</strong> Using EU-approved standard contractual clauses with our service providers that require them to protect your data to European standards.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span><strong className="text-base-content">Data Processing Agreements:</strong> Binding contractual commitments with all service providers regarding data handling, security, and breach notification.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span><strong className="text-base-content">Supplementary Measures:</strong> Additional technical and organizational measures where necessary, including encryption, pseudonymization, and access controls.</span>
                                </li>
                            </ul>
                            <p>
                                You may request a copy of the safeguards we use for international transfers by contacting{" "}
                                <a href="mailto:privacy@splits.network" className="text-primary underline">
                                    privacy@splits.network
                                </a>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 12 -- Children's Privacy
                Article block (short)
               ═══════════════════════════════════════════════════════ */}
            <section id="children" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-error mb-4">
                            12 -- Children&apos;s Privacy
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Not for users under 16.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                Our services are designed for professional use and are not intended for individuals under the age of 16. We do not knowingly collect, solicit, or maintain personal information from anyone under 16 years of age.
                            </p>
                            <p>
                                If we become aware that we have collected personal information from a child under 16, we will take immediate steps to delete that information from our servers. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at{" "}
                                <a href="mailto:privacy@splits.network" className="text-primary underline">
                                    privacy@splits.network
                                </a>{" "}
                                so we can take appropriate action.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 13 -- California Privacy Rights (CCPA/CPRA)
                Split-screen (60 text / 40 image)
               ═══════════════════════════════════════════════════════ */}
            <section id="california" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                        {/* Text -- 3 of 5 columns */}
                        <div className="split-text-left lg:col-span-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                13 -- California Privacy Rights
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                CCPA and CPRA
                                <br />
                                compliance.
                            </h2>
                            <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                                <p>
                                    If you are a California resident, the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA) provide you with additional rights regarding your personal information.
                                </p>

                                <div className="space-y-4">
                                    {[
                                        {
                                            icon: "fa-duotone fa-regular fa-magnifying-glass",
                                            title: "Right to Know",
                                            body: "You have the right to request that we disclose the categories and specific pieces of personal information we have collected about you, the categories of sources from which it was collected, the business purpose for collecting it, and the categories of third parties with whom we share it.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-trash-can",
                                            title: "Right to Delete",
                                            body: "You have the right to request that we delete your personal information, subject to certain exceptions required by law, such as completing transactions, detecting security incidents, or complying with legal obligations.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-pen-to-square",
                                            title: "Right to Correct",
                                            body: "You have the right to request correction of inaccurate personal information we maintain about you.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-ban",
                                            title: "Right to Opt-Out of Sale or Sharing",
                                            body: "We do not sell your personal information. We do not share your personal information for cross-context behavioral advertising purposes.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-sliders",
                                            title: "Right to Limit Use of Sensitive Information",
                                            body: "You have the right to limit our use and disclosure of sensitive personal information to purposes necessary for performing our services.",
                                        },
                                        {
                                            icon: "fa-duotone fa-regular fa-shield-check",
                                            title: "Right to Non-Discrimination",
                                            body: "We will not discriminate against you for exercising any of your CCPA/CPRA rights. You will not receive a different level or quality of service for exercising your rights.",
                                        },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <div className="w-10 h-10 flex-shrink-0 bg-primary/10 flex items-center justify-center">
                                                <i className={`${item.icon} text-primary`}></i>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-base-content text-lg mb-1">{item.title}</h4>
                                                <p className="text-sm text-base-content/60 leading-relaxed">{item.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p>
                                    To submit a request, email{" "}
                                    <a href="mailto:privacy@splits.network" className="text-primary underline">
                                        privacy@splits.network
                                    </a>{" "}
                                    with the subject line &ldquo;California Privacy Rights Request.&rdquo; You may also designate an authorized agent to make a request on your behalf. We will verify your identity before fulfilling any request.
                                </p>
                            </div>
                        </div>

                        {/* Image -- 2 of 5 columns */}
                        <div className="split-img-right lg:col-span-2">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80"
                                    alt="Legal compliance and privacy rights"
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-secondary/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 14 -- GDPR Rights (EU Users)
                Article block
               ═══════════════════════════════════════════════════════ */}
            <section id="gdpr" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            14 -- GDPR Rights (EU Users)
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            European data protection.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                If you are located in the European Economic Area (EEA), the United Kingdom, or Switzerland, the General Data Protection Regulation (GDPR) provides you with specific rights regarding your personal data.
                            </p>

                            <h3 className="text-2xl font-black tracking-tight text-base-content">
                                Lawful Basis for Processing
                            </h3>
                            <p>
                                We process your personal data under the following lawful bases:
                            </p>
                            <ul className="space-y-3 pl-4">
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span><strong className="text-base-content">Contract Performance:</strong> Processing necessary to provide our platform services, manage your account, facilitate placements, and process payments.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span><strong className="text-base-content">Legitimate Interests:</strong> Processing for platform improvement, security monitoring, fraud prevention, and analytics, where balanced against your rights and expectations.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span><strong className="text-base-content">Consent:</strong> Processing for marketing communications, non-essential cookies (analytics and experience), AI-powered features, and LinkedIn profile integration.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span><strong className="text-base-content">Legal Obligation:</strong> Processing required to comply with applicable laws, regulations, and legal proceedings.</span>
                                </li>
                            </ul>

                            <h3 className="text-2xl font-black tracking-tight text-base-content">
                                Your GDPR Rights
                            </h3>
                            <p>
                                In addition to the general privacy rights described in Section 7, EU/EEA users have the right to: lodge a complaint with your local data protection supervisory authority, object to processing based on legitimate interests, request restriction of processing while disputes are resolved, and not be subject to decisions based solely on automated processing that produce legal effects.
                            </p>

                            <h3 className="text-2xl font-black tracking-tight text-base-content">
                                Data Protection Officer
                            </h3>
                            <p>
                                You may contact our Data Protection Officer at{" "}
                                <a href="mailto:dpo@splits.network" className="text-primary underline">
                                    dpo@splits.network
                                </a>{" "}
                                for any questions or concerns regarding how we handle your personal data under GDPR. We will respond within 30 days.
                            </p>

                            <h3 className="text-2xl font-black tracking-tight text-base-content">
                                Automated Decision-Making
                            </h3>
                            <p>
                                Our AI-powered matching and recommendation features assist recruiters and candidates but do not make binding decisions without human review. You have the right to request human intervention in any automated process, express your point of view, and contest any decision. Contact{" "}
                                <a href="mailto:privacy@splits.network" className="text-primary underline">
                                    privacy@splits.network
                                </a>{" "}
                                to exercise these rights.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 15 -- Changes to This Policy
                Article block
               ═══════════════════════════════════════════════════════ */}
            <section id="changes" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            15 -- Changes to This Policy
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Keeping you informed.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes:
                            </p>
                            <ul className="space-y-3 pl-4">
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>We will post the updated policy on this page with a revised &ldquo;Last Updated&rdquo; date</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>For material changes, we will notify you via email to your registered address at least 30 days before the changes take effect</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>We will provide a prominent notice on our platform when significant changes are made</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>We maintain an archive of previous versions for your reference</span>
                                </li>
                            </ul>
                            <p>
                                Your continued use of our services after the updated Privacy Policy becomes effective constitutes your acceptance of the changes. If you do not agree with the updated policy, you should discontinue use of our services and contact us to delete your account.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                CROSS-LINKS -- Related Policies
               ═══════════════════════════════════════════════════════ */}
            <section className="py-20 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                            Related Policies
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black leading-[0.95] tracking-tight mb-8">
                            Other legal documents.
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <Link
                                href="/terms-of-service"
                                className="group border-l-4 border-base-300 hover:border-primary pl-6 py-4 transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="fa-duotone fa-regular fa-file-contract text-primary text-xl"></i>
                                    <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors">
                                        Terms of Service
                                    </h3>
                                </div>
                                <p className="text-sm text-base-content/60">
                                    The terms governing your use of the Splits Network platform.
                                </p>
                                <span className="text-xs text-primary uppercase tracking-[0.15em] font-semibold mt-2 inline-block">
                                    Read Terms <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                                </span>
                            </Link>
                            <Link
                                href="/cookie-policy"
                                className="group border-l-4 border-base-300 hover:border-primary pl-6 py-4 transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="fa-duotone fa-regular fa-cookie-bite text-primary text-xl"></i>
                                    <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors">
                                        Cookie Policy
                                    </h3>
                                </div>
                                <p className="text-sm text-base-content/60">
                                    Detailed information about cookies and tracking technologies we use.
                                </p>
                                <span className="text-xs text-primary uppercase tracking-[0.15em] font-semibold mt-2 inline-block">
                                    Read Policy <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                CONTACT CTA
               ═══════════════════════════════════════════════════════ */}
            <section className="final-cta py-28 bg-primary text-primary-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="final-cta-content max-w-4xl mx-auto text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-content/50 mb-6">
                            <i className="fa-duotone fa-regular fa-envelope mr-2"></i>
                            Contact Us
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                            Questions about
                            <br />
                            your privacy?
                        </h2>
                        <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Our privacy team is here to help. Reach out with any
                            questions, concerns, or requests regarding your personal data.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12 text-left">
                            <div className="border-l-4 border-primary-content/30 pl-6">
                                <h3 className="font-bold text-lg mb-1">Privacy Questions</h3>
                                <a
                                    href="mailto:privacy@splits.network"
                                    className="underline opacity-80 hover:opacity-100 transition-opacity"
                                >
                                    privacy@splits.network
                                </a>
                                <p className="text-sm opacity-60 mt-1">
                                    Response within 5 business days
                                </p>
                            </div>
                            <div className="border-l-4 border-primary-content/30 pl-6">
                                <h3 className="font-bold text-lg mb-1">Data Protection Officer</h3>
                                <a
                                    href="mailto:dpo@splits.network"
                                    className="underline opacity-80 hover:opacity-100 transition-opacity"
                                >
                                    dpo@splits.network
                                </a>
                                <p className="text-sm opacity-60 mt-1">
                                    GDPR inquiries -- 30-day response
                                </p>
                            </div>
                        </div>

                        <div className="opacity-60 text-sm">
                            <p>Employment Networks, Inc.</p>
                            <p>Attention: Privacy Team</p>
                            <p className="mt-4">
                                Last updated: {meta.lastUpdated}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
