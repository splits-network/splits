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
    const lastUpdated = "January 24, 2026";

    const tocItems = [
        { n: "1", id: "overview", label: "Overview" },
        { n: "2", id: "information-collection", label: "Information Collection" },
        { n: "3", id: "how-we-use", label: "How We Use" },
        { n: "4", id: "information-sharing", label: "Information Sharing" },
        { n: "5", id: "data-security", label: "Data Security" },
        { n: "6", id: "your-rights", label: "Your Rights" },
        { n: "7", id: "third-party", label: "Third-Party Services" },
        { n: "8", id: "contact", label: "Contact Us" },
    ];

    return (
        <LegalBaselAnimator>
            {/* ═══ HERO ═══ */}
            <section className="py-28 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="bl-hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                            <i className="fa-duotone fa-regular fa-shield-check mr-2" />
                            Legal
                        </p>
                        <h1 className="bl-hero-headline text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-6 opacity-0">
                            Privacy <span className="text-primary">Policy</span>
                        </h1>
                        <p className="bl-hero-subtitle text-lg md:text-xl opacity-70 leading-relaxed mb-6 opacity-0">
                            How we protect and respect your personal data
                        </p>
                        <p className="bl-hero-date text-sm font-semibold uppercase tracking-wider opacity-40 opacity-0">
                            Last updated: {lastUpdated}
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ TABLE OF CONTENTS ═══ */}
            <section className="py-12 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-toc border-l-4 border-primary bg-base-100 p-8 shadow-sm opacity-0">
                        <h2 className="text-xl font-black tracking-tight mb-6">
                            Quick <span className="text-primary">Navigation</span>
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
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">1</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Overview</h2>
                        </div>
                        <p className="text-base leading-relaxed text-base-content/80 mb-6">
                            Employment Networks (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the Splits and Applicant platforms. We&apos;re committed to protecting your privacy and ensuring transparent handling of your personal data.
                        </p>
                        <ul className="space-y-3">
                            {[
                                "Your data is treated with utmost care and respect",
                                "We comply with GDPR, CCPA, and other privacy regulations",
                                "You have full control over your personal information",
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-base-content/70">
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
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg flex-shrink-0">2</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Information We Collect</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { title: "You Provide", color: "primary", items: ["Contact information", "Account details", "Communications", "Business information"] },
                                { title: "Automatically", color: "secondary", items: ["IP address", "Browser type", "Device info", "Usage analytics"] },
                                { title: "Third Parties", color: "accent", items: ["Service providers", "Analytics partners", "Payment processors", "Auth platforms"] },
                            ].map((cat) => (
                                <div key={cat.title} className={`border-l-4 border-${cat.color} bg-base-100 p-6 shadow-sm`}>
                                    <h3 className="font-bold text-base mb-3">{cat.title}</h3>
                                    <ul className="space-y-2 text-sm text-base-content/70">
                                        {cat.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <i className={`fa-duotone fa-regular fa-check text-xs text-${cat.color} mt-1`} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 3 — How We Use ═══ */}
            <section id="how-we-use" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-accent text-accent-content flex items-center justify-center font-black text-lg flex-shrink-0">3</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">How We Use Your Information</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { title: "Service Delivery", desc: "Provide and improve our platforms" },
                                { title: "Analytics", desc: "Understand usage and optimize" },
                                { title: "Communications", desc: "Send updates and notifications" },
                            ].map((item) => (
                                <div key={item.title} className="border-l-4 border-primary bg-base-200 p-6">
                                    <h3 className="font-bold text-base mb-2">{item.title}</h3>
                                    <p className="text-sm text-base-content/70">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 4 — Information Sharing ═══ */}
            <section id="information-sharing" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">4</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Information Sharing</h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-6">We share information only when necessary:</p>
                        <div className="space-y-3 mb-6">
                            {[
                                { label: "Service Providers", desc: "Tools and services to operate our platforms" },
                                { label: "Legal Requirements", desc: "When required by law or legal process" },
                                { label: "Platform Partners", desc: "Integrated services for better functionality" },
                            ].map((item) => (
                                <div key={item.label} className="border-l-4 border-primary bg-base-100 p-4 flex items-start gap-3">
                                    <span className="badge badge-primary badge-sm flex-shrink-0 mt-0.5">{item.label}</span>
                                    <p className="text-sm text-base-content/70">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="border-l-4 border-success bg-success/5 p-6">
                            <p className="font-bold text-sm mb-1">We never sell your data</p>
                            <p className="text-sm text-base-content/70">Your information is never sold to third parties for marketing purposes.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 5 — Data Security ═══ */}
            <section id="data-security" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg flex-shrink-0">5</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Data Security</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { title: "Encryption", desc: "TLS/SSL encryption in transit" },
                                { title: "Access Control", desc: "Role-based permission system" },
                                { title: "Infrastructure", desc: "Secure cloud hosting" },
                                { title: "Monitoring", desc: "24/7 security monitoring" },
                            ].map((item) => (
                                <div key={item.title} className="border-l-4 border-secondary bg-base-200 p-4">
                                    <p className="font-bold text-sm">{item.title}</p>
                                    <p className="text-xs text-base-content/60">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 6 — Your Rights ═══ */}
            <section id="your-rights" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-accent text-accent-content flex items-center justify-center font-black text-lg flex-shrink-0">6</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Your Privacy Rights</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { title: "Access", desc: "Request a copy of your personal data" },
                                { title: "Correction", desc: "Update inaccurate information" },
                                { title: "Deletion", desc: "Request deletion of your data" },
                                { title: "Objection", desc: "Object to data processing" },
                            ].map((item) => (
                                <div key={item.title} className="border-l-4 border-accent bg-base-100 p-5">
                                    <p className="font-bold text-sm">{item.title}</p>
                                    <p className="text-xs text-base-content/60">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 7 — Third-Party Services ═══ */}
            <section id="third-party" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">7</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Third-Party Services</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { icon: "fa-duotone fa-regular fa-lock", name: "Clerk", desc: "Authentication and user management" },
                                { icon: "fa-duotone fa-regular fa-database", name: "Supabase", desc: "Database and infrastructure" },
                                { icon: "fa-duotone fa-regular fa-chart-line", name: "Google Analytics", desc: "Website analytics" },
                            ].map((svc) => (
                                <div key={svc.name} className="border-l-4 border-primary bg-base-200 p-5 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <i className={`${svc.icon} text-primary text-lg`} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{svc.name}</p>
                                        <p className="text-xs text-base-content/60">{svc.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CONTACT ═══ */}
            <section id="contact" className="py-16 bg-primary text-primary-content">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-contact opacity-0">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-8 text-center">
                            Questions About Privacy?
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-l-4 border-white/30 bg-white/10 p-6">
                                <div className="w-12 h-12 bg-white/20 flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-envelope text-lg" />
                                </div>
                                <h3 className="font-bold text-base mb-2">Privacy Team</h3>
                                <a href="mailto:privacy@employment-networks.com" className="text-sm font-bold underline hover:opacity-80 transition-opacity">
                                    privacy@employment-networks.com
                                </a>
                                <p className="text-xs opacity-60 mt-2">Response within 5 business days</p>
                            </div>
                            <div className="border-l-4 border-white/30 bg-white/10 p-6">
                                <div className="w-12 h-12 bg-white/20 flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-map-pin text-lg" />
                                </div>
                                <h3 className="font-bold text-base mb-2">Mailing Address</h3>
                                <p className="text-sm opacity-70">Employment Networks, Inc.</p>
                                <p className="text-sm opacity-70">Wilmington, Delaware 19801</p>
                                <p className="text-sm opacity-70">USA</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </LegalBaselAnimator>
    );
}
