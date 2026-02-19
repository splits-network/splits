import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { LegalBaselAnimator } from "@/components/legal-animator";

export const metadata: Metadata = {
    title: "Cookie Policy | Employment Networks",
    description:
        "Information about cookies and tracking technologies used on Employment Networks platforms.",
    ...buildCanonical("/cookie-policy"),
};

export default function CookiePolicyBaselPage() {
    const lastUpdated = "January 24, 2026";

    const tocItems = [
        { n: "1", id: "what-are-cookies", label: "What Are Cookies" },
        { n: "2", id: "how-we-use", label: "How We Use" },
        { n: "3", id: "types", label: "Types of Cookies" },
        { n: "4", id: "third-party", label: "Third-Party Cookies" },
        { n: "5", id: "management", label: "Management" },
        { n: "6", id: "consent", label: "Consent" },
        { n: "7", id: "dnt", label: "Do Not Track" },
        { n: "8", id: "updates", label: "Updates" },
    ];

    return (
        <LegalBaselAnimator>
            {/* ═══ HERO ═══ */}
            <section className="py-28 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="bl-hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                            <i className="fa-duotone fa-regular fa-cookie mr-2" />
                            Legal
                        </p>
                        <h1 className="bl-hero-headline text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-6 opacity-0">
                            Cookie <span className="text-primary">Policy</span>
                        </h1>
                        <p className="bl-hero-subtitle text-lg md:text-xl opacity-70 leading-relaxed mb-6 opacity-0">
                            How we use cookies and similar technologies
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

            {/* ═══ Section 1 — What Are Cookies ═══ */}
            <section id="what-are-cookies" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">1</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">What Are Cookies?</h2>
                        </div>
                        <p className="text-base leading-relaxed text-base-content/80 mb-6">
                            Cookies are small text files stored on your device when you visit our websites. They help us recognize you, remember your preferences, and improve your experience.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { title: "Web Beacons", desc: "Small transparent images that track page views" },
                                { title: "Local Storage", desc: "Browser storage for persistent data" },
                                { title: "Session Storage", desc: "Temporary data during your session" },
                                { title: "Fingerprinting", desc: "Device characteristics for analytics" },
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

            {/* ═══ Section 2 — How We Use Cookies ═══ */}
            <section id="how-we-use" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg flex-shrink-0">2</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">How We Use Cookies</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { title: "Essential", color: "primary", items: ["Authentication", "Security", "Session data", "Preferences"] },
                                { title: "Analytics", color: "secondary", items: ["Usage patterns", "Performance", "User behavior", "Traffic sources"] },
                                { title: "Personalization", color: "accent", items: ["Language settings", "Theme choice", "Content filters", "Recommendations"] },
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

            {/* ═══ Section 3 — Types of Cookies ═══ */}
            <section id="types" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-accent text-accent-content flex items-center justify-center font-black text-lg flex-shrink-0">3</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Types of Cookies</h2>
                        </div>

                        {[
                            {
                                label: "Essential", color: "primary",
                                rows: [
                                    ["session_id", "Session management", "Session end"],
                                    ["auth_token", "Authentication", "30 days"],
                                    ["csrf_token", "CSRF protection", "Session end"],
                                    ["user_prefs", "User preferences", "1 year"],
                                ],
                            },
                            {
                                label: "Analytics", color: "secondary",
                                rows: [
                                    ["_ga", "Google Analytics ID", "2 years"],
                                    ["_gid", "Session analytics", "24 hours"],
                                    ["usage_stats", "Usage tracking", "30 days"],
                                ],
                            },
                            {
                                label: "Personalization", color: "accent",
                                rows: [
                                    ["language", "Language preference", "1 year"],
                                    ["theme", "Theme selection", "1 year"],
                                    ["filters", "Content filters", "30 days"],
                                ],
                            },
                        ].map((table) => (
                            <div key={table.label} className={`border-l-4 border-${table.color} bg-base-200 p-6 mb-6 shadow-sm`}>
                                <span className={`badge badge-${table.color} mb-4`}>{table.label}</span>
                                <div className="overflow-x-auto">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th className="font-black uppercase text-xs tracking-wider">Cookie</th>
                                                <th className="font-black uppercase text-xs tracking-wider">Purpose</th>
                                                <th className="font-black uppercase text-xs tracking-wider">Expiration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {table.rows.map((row, i) => (
                                                <tr key={i}>
                                                    <td className="font-mono text-xs">{row[0]}</td>
                                                    <td>{row[1]}</td>
                                                    <td>{row[2]}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Section 4 — Third-Party Cookies ═══ */}
            <section id="third-party" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">4</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Third-Party Cookies</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { icon: "fa-duotone fa-regular fa-chart-line", name: "Google Analytics", desc: "Traffic analysis and behavior tracking" },
                                { icon: "fa-duotone fa-regular fa-user", name: "Clerk Authentication", desc: "User identity and authentication" },
                                { icon: "fa-duotone fa-regular fa-credit-card", name: "Stripe", desc: "Payment processing" },
                            ].map((svc) => (
                                <div key={svc.name} className="border-l-4 border-primary bg-base-100 p-5 flex items-center gap-4 shadow-sm">
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

            {/* ═══ Section 5 — Management ═══ */}
            <section id="management" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg flex-shrink-0">5</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">How to Manage Cookies</h2>
                        </div>
                        <p className="text-base text-base-content/80 mb-6">You can control cookies through your browser settings:</p>
                        <div className="grid md:grid-cols-2 gap-3">
                            {[
                                { label: "Chrome Settings", href: "https://support.google.com/chrome/answer/95647" },
                                { label: "Firefox Settings", href: "https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" },
                                { label: "Safari Settings", href: "https://support.apple.com/en-us/HT201265" },
                                { label: "Edge Settings", href: "https://support.microsoft.com/en-us/microsoft-edge/manage-cookies-in-microsoft-edge" },
                            ].map((browser) => (
                                <a
                                    key={browser.label}
                                    href={browser.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline btn-primary w-full"
                                >
                                    {browser.label}
                                    <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-xs" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 6 — Consent ═══ */}
            <section id="consent" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-accent text-accent-content flex items-center justify-center font-black text-lg flex-shrink-0">6</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Consent &amp; Cookie Banner</h2>
                        </div>
                        <div className="border-l-4 border-info bg-info/5 p-6">
                            <p className="font-bold text-sm mb-2">Your Consent Matters</p>
                            <p className="text-sm text-base-content/70">When you first visit our site, we ask for your consent before setting non-essential cookies. You can change your preferences anytime.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 7 — Do Not Track ═══ */}
            <section id="dnt" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">7</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Do Not Track (DNT)</h2>
                        </div>
                        <p className="text-base text-base-content/80">
                            Many browsers allow you to signal a &quot;Do Not Track&quot; (DNT) preference. Currently, we do not respond to DNT signals as there is no industry standard. However, you can still control cookies through your browser settings.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ Section 8 — Updates ═══ */}
            <section id="updates" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg flex-shrink-0">8</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Updates to This Policy</h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                { title: "We May Update", desc: "We review and update this policy regularly to reflect new technologies and regulations" },
                                { title: "Check Back Often", desc: "Significant changes will be announced on our website" },
                                { title: "Your Consent", desc: "Continued use means acceptance of any policy changes" },
                            ].map((item, i) => (
                                <div key={i} className="border-l-4 border-primary bg-base-100 p-4 flex items-start gap-3 shadow-sm">
                                    <span className="w-8 h-8 bg-primary text-primary-content flex items-center justify-center font-black text-sm flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <p className="font-bold text-sm">{item.title}</p>
                                        <p className="text-xs text-base-content/60">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CONTACT ═══ */}
            <section className="py-16 bg-primary text-primary-content">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-contact opacity-0">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-8 text-center">
                            Questions About Cookies?
                        </h2>
                        <div className="border-l-4 border-white/30 bg-white/10 p-6 max-w-lg mx-auto">
                            <div className="w-12 h-12 bg-white/20 flex items-center justify-center mb-4">
                                <i className="fa-duotone fa-regular fa-envelope text-lg" />
                            </div>
                            <h3 className="font-bold text-base mb-2">Contact Us</h3>
                            <a href="mailto:privacy@employment-networks.com" className="text-sm font-bold underline hover:opacity-80 transition-opacity">
                                privacy@employment-networks.com
                            </a>
                            <p className="text-xs opacity-60 mt-2">We typically respond within 5 business days</p>
                        </div>
                    </div>
                </div>
            </section>
        </LegalBaselAnimator>
    );
}
