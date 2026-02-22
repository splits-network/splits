import Link from "next/link";

/* ─── Metadata ──────────────────────────────────────────────────────────── */
const meta = {
    title: "Cookie Policy",
    subtitle:
        "How Applicant Network uses cookies and similar technologies to improve your experience and provide our services",
    lastUpdated: "February 21, 2026",
    entity: "Employment Networks, Inc.",
};

const heroImage =
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80";

/* ─── TOC Items ─────────────────────────────────────────────────────────── */
const tocItems = [
    { id: "what-are-cookies", label: "What Are Cookies", icon: "fa-cookie-bite" },
    { id: "how-we-use-cookies", label: "How We Use Cookies", icon: "fa-gear" },
    { id: "types-of-cookies", label: "Types of Cookies", icon: "fa-layer-group" },
    { id: "third-party-cookies", label: "Third-Party Cookies", icon: "fa-share-nodes" },
    { id: "cookie-management", label: "Cookie Management", icon: "fa-sliders" },
    { id: "your-consent", label: "Your Consent", icon: "fa-hand" },
    { id: "do-not-track", label: "Do Not Track", icon: "fa-eye-slash" },
    { id: "mobile-devices", label: "Mobile Devices", icon: "fa-mobile" },
    { id: "changes-to-policy", label: "Changes to Policy", icon: "fa-rotate" },
];

/* ─── Third-Party Services Data ─────────────────────────────────────────── */
const thirdPartyServices = [
    {
        name: "Clerk",
        purpose: "Authentication and user management",
        url: "https://clerk.com/privacy",
        icon: "fa-lock",
    },
    {
        name: "Google Analytics",
        purpose: "Website analytics and performance tracking",
        url: "https://policies.google.com/privacy",
        icon: "fa-chart-line",
    },
    {
        name: "Stripe",
        purpose: "Payment processing (recruiters only)",
        url: "https://stripe.com/privacy",
        icon: "fa-credit-card",
    },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function CookiePolicyContent() {
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
                        alt="Server infrastructure and technology"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral/60 lg:bg-neutral/20"></div>
                </div>

                {/* Content panel -- 60% on desktop */}
                <div className="relative z-10 container mx-auto px-6 lg:px-12 py-28">
                    <div className="max-w-2xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6">
                            <i className="fa-duotone fa-regular fa-cookie-bite mr-2"></i>
                            Legal
                        </p>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="hero-headline-word inline-block text-base-content lg:text-base-content">
                                Cookie
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
                        <div className="border-l-4 border-secondary pl-8 lg:pl-12">
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
                SECTION 1 -- What Are Cookies
               ═══════════════════════════════════════════════════════ */}
            <section id="what-are-cookies" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            01 -- What Are Cookies
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Small files, big role.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                Cookies are small text files that are placed on your
                                device (computer, tablet, or mobile phone) when you
                                visit a website. They help the website remember your
                                actions and preferences over time, so you don&rsquo;t have to
                                re-enter information when you return to the site or
                                browse from one page to another.
                            </p>
                            <p>
                                Cookies are widely used across the internet to make websites
                                work more efficiently and to provide information to website
                                owners. They can be &ldquo;first-party&rdquo; cookies (set by the website
                                you&rsquo;re visiting) or &ldquo;third-party&rdquo; cookies (set by a service
                                used by the website, such as an analytics or advertising provider).
                            </p>
                            <p>
                                Cookies can also be classified by how long they remain on your device:
                            </p>
                            <ul className="space-y-3 pl-4">
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>
                                        <strong className="text-base-content font-bold">Session cookies</strong> are
                                        temporary and are deleted when you close your browser.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>
                                        <strong className="text-base-content font-bold">Persistent cookies</strong> remain
                                        on your device for a set period or until you manually delete them.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 2 -- How We Use Cookies
               ═══════════════════════════════════════════════════════ */}
            <section id="how-we-use-cookies" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            02 -- How We Use Cookies
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Why we use cookies on Applicant Network.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                Applicant Network uses cookies and similar technologies to provide,
                                secure, and improve our platform. Specifically, we use cookies to:
                            </p>
                            <ul className="space-y-3 pl-4">
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>
                                        <strong className="text-base-content font-bold">Enable Essential Features:</strong>{" "}
                                        Allow you to log in, navigate the site, and use core functionality
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>
                                        <strong className="text-base-content font-bold">Remember Your Preferences:</strong>{" "}
                                        Store settings like language, theme, and display preferences
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>
                                        <strong className="text-base-content font-bold">Improve Performance:</strong>{" "}
                                        Help us understand how you use the site so we can make it better
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>
                                        <strong className="text-base-content font-bold">Analyze Usage:</strong>{" "}
                                        Collect data about site traffic and user behavior
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>
                                        <strong className="text-base-content font-bold">Enhance Security:</strong>{" "}
                                        Detect and prevent fraudulent activity and security threats
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>
                                        <strong className="text-base-content font-bold">Personalize Content:</strong>{" "}
                                        Show you relevant job recommendations and content
                                    </span>
                                </li>
                            </ul>
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
                                &ldquo;We use cookies to make your experience better, not to track you across the web.&rdquo;
                            </blockquote>
                            <cite className="text-sm uppercase tracking-[0.2em] text-neutral-content/50 not-italic">
                                -- Applicant Network Privacy Principles
                            </cite>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 3 -- Types of Cookies
               ═══════════════════════════════════════════════════════ */}
            <section id="types-of-cookies" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            03 -- Types of Cookies
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Understanding the cookies we use.
                        </h2>

                        {/* Strictly Necessary */}
                        <h3 className="text-2xl font-black tracking-tight mb-4 mt-8">
                            <i className="fa-duotone fa-regular fa-lock text-primary mr-3"></i>
                            Strictly Necessary Cookies
                        </h3>
                        <div className="space-y-4 text-base-content/70 leading-relaxed text-lg mb-8">
                            <p>
                                These cookies are essential for the website to function properly.
                                Without them, you won&rsquo;t be able to use basic features like
                                logging in or submitting applications. These cookies cannot be
                                disabled.
                            </p>
                            <ul className="space-y-3 pl-4">
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Authentication and session management</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Security and fraud prevention</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Load balancing</span>
                                </li>
                            </ul>
                        </div>

                        {/* Functionality */}
                        <h3 className="text-2xl font-black tracking-tight mb-4 mt-8">
                            <i className="fa-duotone fa-regular fa-sliders text-primary mr-3"></i>
                            Functionality Cookies
                        </h3>
                        <div className="space-y-4 text-base-content/70 leading-relaxed text-lg mb-8">
                            <p>
                                These cookies remember your preferences and choices to provide
                                a more personalized experience. They are optional and can be
                                disabled through your browser settings.
                            </p>
                            <ul className="space-y-3 pl-4">
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Theme and display preferences (dark/light mode)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Language selection</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Search filters and job preferences</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Recent job views</span>
                                </li>
                            </ul>
                        </div>

                        {/* Analytics */}
                        <h3 className="text-2xl font-black tracking-tight mb-4 mt-8">
                            <i className="fa-duotone fa-regular fa-chart-line text-primary mr-3"></i>
                            Analytics Cookies
                        </h3>
                        <div className="space-y-4 text-base-content/70 leading-relaxed text-lg mb-8">
                            <p>
                                These cookies help us understand how visitors interact with our
                                website by collecting anonymous information. They are optional
                                and can be disabled.
                            </p>
                            <ul className="space-y-3 pl-4">
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Page views and navigation patterns</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Time spent on pages</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Error tracking and debugging</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Performance metrics</span>
                                </li>
                            </ul>
                            <p className="text-sm text-base-content/50">
                                <strong className="text-base-content/60">Services we use:</strong>{" "}
                                Google Analytics (anonymized IP)
                            </p>
                        </div>

                        {/* Marketing */}
                        <h3 className="text-2xl font-black tracking-tight mb-4 mt-8">
                            <i className="fa-duotone fa-regular fa-bullseye text-primary mr-3"></i>
                            Marketing Cookies
                        </h3>
                        <div className="space-y-4 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                These cookies track your activity across websites to deliver
                                relevant advertising and measure campaign effectiveness. They
                                are optional and can be disabled.
                            </p>
                            <ul className="space-y-3 pl-4">
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Targeted advertising</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Social media integration</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Conversion tracking</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Remarketing campaigns</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 4 -- Third-Party Cookies
               ═══════════════════════════════════════════════════════ */}
            <section id="third-party-cookies" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            04 -- Third-Party Cookies
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Services that set cookies on our behalf.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                We use services from trusted third-party providers that may set
                                their own cookies on your device. We do not control these
                                third-party cookies. Please review the privacy policies of these
                                services to learn how they use cookies.
                            </p>

                            <div className="space-y-4 mt-8">
                                {thirdPartyServices.map((service) => (
                                    <div
                                        key={service.name}
                                        className="flex items-start gap-4 p-6 bg-base-100 border-l-4 border-primary"
                                    >
                                        <i className={`fa-duotone fa-regular ${service.icon} text-primary text-xl mt-0.5 flex-shrink-0`}></i>
                                        <div>
                                            <h3 className="font-bold text-base-content text-lg mb-1">
                                                {service.name}
                                            </h3>
                                            <p className="text-base-content/60 mb-2">
                                                {service.purpose}
                                            </p>
                                            <a
                                                href={service.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                View Privacy Policy
                                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square ml-1.5 text-xs"></i>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                            &ldquo;You are always in control of your cookie preferences.&rdquo;
                        </blockquote>
                        <cite className="text-sm uppercase tracking-[0.2em] text-primary-content/50 not-italic">
                            -- Applicant Network Cookie Principles
                        </cite>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 5 -- Cookie Management
               ═══════════════════════════════════════════════════════ */}
            <section id="cookie-management" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            05 -- Cookie Management
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Managing your cookie preferences.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                When you first visit Applicant Network, you&rsquo;ll see a cookie
                                banner where you can choose to accept or decline non-essential
                                cookies. You can change your preferences at any time.
                            </p>

                            <h3 className="text-2xl font-black tracking-tight mb-4 mt-8 text-base-content">
                                Browser Settings
                            </h3>
                            <p>
                                Most web browsers allow you to control cookies through their
                                settings. You can:
                            </p>
                            <ul className="space-y-3 pl-4">
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>View what cookies are stored on your device</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Delete existing cookies</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Block cookies from specific websites</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Block all third-party cookies</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>Clear all cookies when you close your browser</span>
                                </li>
                            </ul>
                            <p className="text-base-content/50 text-base mt-4">
                                <i className="fa-duotone fa-regular fa-circle-info text-primary mr-2"></i>
                                <strong className="text-base-content/60">Note:</strong>{" "}
                                Disabling cookies may affect your ability to use certain
                                features of our website.
                            </p>

                            <h3 className="text-2xl font-black tracking-tight mb-4 mt-8 text-base-content">
                                Browser-Specific Instructions
                            </h3>
                            <div className="space-y-4 mt-6">
                                <div className="flex items-start gap-4 p-6 bg-base-200 border-l-4 border-primary">
                                    <i className="fa-brands fa-chrome text-xl text-primary mt-0.5 flex-shrink-0"></i>
                                    <div>
                                        <h4 className="font-bold text-base-content mb-1">Google Chrome</h4>
                                        <p className="text-sm text-base-content/60">
                                            Settings &rarr; Privacy and security &rarr; Cookies and other site data
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-6 bg-base-200 border-l-4 border-primary">
                                    <i className="fa-brands fa-firefox text-xl text-primary mt-0.5 flex-shrink-0"></i>
                                    <div>
                                        <h4 className="font-bold text-base-content mb-1">Mozilla Firefox</h4>
                                        <p className="text-sm text-base-content/60">
                                            Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-6 bg-base-200 border-l-4 border-primary">
                                    <i className="fa-brands fa-safari text-xl text-primary mt-0.5 flex-shrink-0"></i>
                                    <div>
                                        <h4 className="font-bold text-base-content mb-1">Safari</h4>
                                        <p className="text-sm text-base-content/60">
                                            Preferences &rarr; Privacy &rarr; Manage Website Data
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-6 bg-base-200 border-l-4 border-primary">
                                    <i className="fa-brands fa-edge text-xl text-primary mt-0.5 flex-shrink-0"></i>
                                    <div>
                                        <h4 className="font-bold text-base-content mb-1">Microsoft Edge</h4>
                                        <p className="text-sm text-base-content/60">
                                            Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 6 -- Your Consent
               ═══════════════════════════════════════════════════════ */}
            <section id="your-consent" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            06 -- Your Consent
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            How we obtain and respect your consent.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                When you first visit Applicant Network, we present you with
                                a clear cookie consent banner that explains our use of cookies.
                                You can choose to accept all cookies, reject non-essential
                                cookies, or customize your preferences.
                            </p>
                            <p>
                                Strictly necessary cookies do not require your consent as they
                                are essential for the website to function. For all other
                                categories of cookies (functionality, analytics, and marketing),
                                we will only set them on your device after you have provided
                                your explicit consent.
                            </p>
                            <p>
                                You can withdraw your consent at any time by adjusting your
                                cookie preferences through the cookie settings option available
                                in the footer of our website, or by clearing cookies from your
                                browser settings.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 7 -- Do Not Track
               ═══════════════════════════════════════════════════════ */}
            <section id="do-not-track" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            07 -- Do Not Track
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Respecting browser signals.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                Some browsers have a &ldquo;Do Not Track&rdquo; (DNT) feature that sends
                                a signal to websites indicating that you don&rsquo;t want your online
                                activity tracked. Currently, there is no universal standard for
                                how websites should respond to Do Not Track signals.
                            </p>
                            <p>
                                We do not currently respond to Do Not Track signals, but you
                                can manage cookies as described in the Cookie Management section
                                above. We continue to monitor developments in this area and will
                                update our practices as industry standards evolve.
                            </p>
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
                                &ldquo;Transparency builds trust. We believe you should always know how your data is used.&rdquo;
                            </blockquote>
                            <cite className="text-sm uppercase tracking-[0.2em] text-neutral-content/50 not-italic">
                                -- Applicant Network Data Principles
                            </cite>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 8 -- Mobile Devices
               ═══════════════════════════════════════════════════════ */}
            <section id="mobile-devices" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            08 -- Mobile Devices
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Cookies on mobile devices.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                Our website uses cookies on mobile devices just as it does on
                                desktop computers. You can manage cookies on mobile devices
                                through your browser settings, similar to desktop browsers.
                            </p>
                            <p>
                                On mobile apps (if applicable), you can manage tracking
                                preferences through your device settings:
                            </p>
                            <ul className="space-y-3 pl-4">
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>
                                        <strong className="text-base-content font-bold">iOS:</strong>{" "}
                                        Settings &rarr; Privacy &rarr; Tracking
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm mt-1.5 flex-shrink-0"></i>
                                    <span>
                                        <strong className="text-base-content font-bold">Android:</strong>{" "}
                                        Settings &rarr; Google &rarr; Ads &rarr; Opt out of Ads Personalization
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 9 -- Changes to Policy
               ═══════════════════════════════════════════════════════ */}
            <section id="changes-to-policy" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            09 -- Changes to Policy
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Keeping you informed.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                We may update this Cookie Policy from time to time to reflect
                                changes in our practices, technologies, or legal requirements.
                                We will notify you of any material changes by posting the new
                                policy on this page and updating the &ldquo;Last Updated&rdquo; date at the
                                top.
                            </p>
                            <p>
                                We encourage you to review this Cookie Policy periodically
                                to stay informed about how we use cookies. Your continued use
                                of Applicant Network after any changes to this policy
                                constitutes your acceptance of the updated terms.
                            </p>
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
                            cookies?
                        </h2>
                        <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed">
                            If you have any questions about how we use cookies or want to
                            learn more about your options, our privacy team is here to help.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12 text-left">
                            <div className="border-l-4 border-primary-content/30 pl-6">
                                <h3 className="font-bold text-lg mb-1">Privacy Questions</h3>
                                <a
                                    href="mailto:privacy@applicant.network"
                                    className="underline opacity-80 hover:opacity-100 transition-opacity"
                                >
                                    privacy@applicant.network
                                </a>
                                <p className="text-sm opacity-60 mt-1">
                                    Response within 5 business days
                                </p>
                            </div>
                            <div className="border-l-4 border-primary-content/30 pl-6">
                                <h3 className="font-bold text-lg mb-1">General Support</h3>
                                <a
                                    href="mailto:support@applicant.network"
                                    className="underline opacity-80 hover:opacity-100 transition-opacity"
                                >
                                    support@applicant.network
                                </a>
                                <p className="text-sm opacity-60 mt-1">
                                    We&rsquo;re happy to help
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 mb-12">
                            <Link
                                href="/privacy-policy"
                                className="btn btn-outline border-primary-content/30 text-primary-content hover:bg-primary-content hover:text-primary"
                            >
                                <i className="fa-duotone fa-regular fa-shield-halved mr-2"></i>
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms-of-service"
                                className="btn btn-outline border-primary-content/30 text-primary-content hover:bg-primary-content hover:text-primary"
                            >
                                <i className="fa-duotone fa-regular fa-file-contract mr-2"></i>
                                Terms of Service
                            </Link>
                        </div>

                        <div className="opacity-60 text-sm">
                            <p>{meta.entity}</p>
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
