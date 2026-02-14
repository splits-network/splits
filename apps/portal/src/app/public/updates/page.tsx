import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical } from "@/lib/seo";
import { ScrollAnimator } from "@/components/scroll-animator";

export const metadata: Metadata = {
    title: "Product Updates",
    description: "Latest releases and improvements across the Splits Network platform, including workflow enhancements, integrations, and product fixes.",
    openGraph: {
        title: "Product Updates",
        description: "Latest releases and improvements across the Splits Network platform, including workflow enhancements, integrations, and product fixes.",
        url: "https://splits.network/public/updates",
    },
    ...buildCanonical("/public/updates"),
};

const recentUpdates = [
    {
        date: "DEC 2025",
        badgeClass: "badge-primary",
        icon: "fa-rocket",
        iconColor: "text-primary",
        title: "Platform Launch",
        description: "Splits Network Phase 1 is officially live! Core features include:",
        features: [
            "Full ATS with roles, candidates, stages",
            "Split placement tracking",
            "Recruiter network management",
            "Three-tier subscription model",
            "Email notifications",
            "Admin console",
        ],
        cta: { href: "/sign-up", text: "Get Started Today" },
    },
    {
        date: "NOV 2025",
        badgeClass: "badge-secondary",
        icon: "fa-flask",
        iconColor: "text-secondary",
        title: "Beta Testing Phase",
        description: "Selected recruiters and companies helped us refine the platform:",
        bullets: [
            "10+ beta recruiters submitted 50+ candidates",
            "5 companies posted real roles",
            "Feedback incorporated into UX improvements",
        ],
    },
    {
        date: "OCT 2025",
        badgeClass: "badge-accent",
        icon: "fa-hammer",
        iconColor: "text-accent",
        title: "Alpha Development",
        description: "Core architecture built and internal testing completed. Microservices deployed, authentication configured, and foundational features validated.",
    },
];

const phase2Features = [
    { icon: "fa-money-bill-transfer", iconColor: "text-success", title: "Payment Processing", description: "Integrated payment flows with Stripe Connect. Companies pay platform, automatic splits distributed to recruiters." },
    { icon: "fa-plug", iconColor: "text-info", title: "Integrations Marketplace", description: "Connect with Gmail, Outlook, Calendly, LinkedIn, and other essential tools. Zapier integration for custom workflows." },
    { icon: "fa-chart-line", iconColor: "text-primary", title: "Advanced Analytics", description: "Detailed performance metrics, ROI tracking, conversion rates, and custom reporting dashboards for both recruiters and companies." },
    { icon: "fa-mobile-screen", iconColor: "text-secondary", title: "Mobile Apps", description: "Native iOS and Android apps for recruiters to manage candidates and track placements on the go." },
];

const phase3Features = [
    { icon: "fa-brain", iconColor: "text-accent", title: "AI-Powered Matching", description: "Smart candidate-to-role matching using machine learning. Automatic recruiter recommendations based on specialties." },
    { icon: "fa-users-gear", iconColor: "text-primary", title: "Multi-Recruiter Splits", description: "Support for multiple recruiters collaborating on a single placement with configurable split percentages." },
    { icon: "fa-code", iconColor: "text-secondary", title: "Public API", description: "Full REST API with webhooks, OAuth 2.0, and comprehensive documentation for custom integrations." },
    { icon: "fa-tags", iconColor: "text-success", title: "White-Label Options", description: "Recruiting firms can customize branding, domain, and certain features for their own recruiter networks." },
];

const futureVision = [
    { icon: "fa-globe", text: "International expansion with multi-currency support" },
    { icon: "fa-building-columns", text: "Enterprise features for large recruiting firms and staffing agencies" },
    { icon: "fa-graduation-cap", text: "Training and certification programs for recruiters" },
    { icon: "fa-trophy", text: "Gamification and leaderboards to foster healthy competition" },
    { icon: "fa-handshake", text: "Marketplace for specialized recruiting services and consulting" },
];

const resourceLinks = [
    { href: "/public/status", icon: "fa-heartbeat", iconColor: "text-success", title: "System Status", description: "Check platform health and uptime" },
    { href: "https://docs.splits.network", icon: "fa-book", iconColor: "text-info", title: "Documentation", description: "Read detailed guides and API docs", isExternal: true },
    { href: "https://github.com/splits-network/splits", icon: "fa-github", iconColor: "", title: "Open Source", description: "View our public repositories", isExternal: true, isBrand: true },
];

export default function UpdatesPage() {
    return (
        <ScrollAnimator>
            {/* Hero Section */}
            <section className="hero bg-gradient-to-r from-primary to-secondary text-primary-content py-20 overflow-hidden">
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Platform Updates & Roadmap
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Stay informed about new features, improvements, and what's coming next for Splits Network
                        </p>
                    </div>
                </div>
            </section>

            {/* Current Phase Banner */}
            <section className="py-12 bg-info text-info-content overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="badge badge-lg badge-success mb-4">NOW LIVE</div>
                        <h2 className="text-3xl font-bold mb-3">Phase 1: Core Platform</h2>
                        <p className="text-lg opacity-90">
                            The foundation is here! Essential ATS, split tracking, and recruiter network features are now available.
                        </p>
                    </div>
                </div>
            </section>

            {/* Recent Updates Timeline */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 opacity-0">
                        <h2 className="text-4xl font-bold mb-4">Recent Updates</h2>
                        <p className="text-lg text-base-content/70">
                            What we've shipped recently
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="space-y-8" data-animate-stagger>
                            {recentUpdates.map((update, index) => (
                                <div key={index} className="card bg-base-200 shadow">
                                    <div className="card-body">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            <div className="flex-shrink-0">
                                                <div className={`badge ${update.badgeClass} badge-lg`}>{update.date}</div>
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-2xl font-bold mb-3">
                                                    <i className={`fa-duotone fa-regular ${update.icon} ${update.iconColor}`}></i> {update.title}
                                                </h3>
                                                <p className="text-base-content/70 mb-4">
                                                    {update.description}
                                                </p>
                                                {update.features && (
                                                    <ul className="grid md:grid-cols-2 gap-2 mb-4">
                                                        {update.features.map((feature, fIndex) => (
                                                            <li key={fIndex} className="flex items-center gap-2">
                                                                <i className="fa-duotone fa-regular fa-check text-success"></i>
                                                                <span className="text-sm">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {update.bullets && (
                                                    <ul className="space-y-2 text-sm">
                                                        {update.bullets.map((bullet, bIndex) => (
                                                            <li key={bIndex} className="flex items-start gap-2">
                                                                <i className={`fa-duotone fa-regular fa-arrow-right ${update.iconColor} mt-1`}></i>
                                                                <span>{bullet}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {update.cta && (
                                                    <Link href={update.cta.href} className="btn btn-primary btn-sm">
                                                        {update.cta.text}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Roadmap Section */}
            <section className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 opacity-0">
                        <h2 className="text-4xl font-bold mb-4">What's Coming Next</h2>
                        <p className="text-lg text-base-content/70">
                            Our product roadmap for the next 6-12 months
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        {/* Phase 2 */}
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="badge badge-lg badge-warning">Q1 2026</div>
                                <h3 className="text-3xl font-bold">Phase 2: Enhanced Functionality</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6" data-animate-stagger>
                                {phase2Features.map((feature, index) => (
                                    <div key={index} className="card bg-base-100 shadow hover:-translate-y-1 hover:shadow-lg transition-all">
                                        <div className="card-body">
                                            <h4 className="card-title">
                                                <i className={`fa-duotone fa-regular ${feature.icon} ${feature.iconColor}`}></i>
                                                {feature.title}
                                            </h4>
                                            <p className="text-base-content/70 text-sm">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Phase 3 */}
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="badge badge-lg badge-info">Q2-Q3 2026</div>
                                <h3 className="text-3xl font-bold">Phase 3: Scale & Automation</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6" data-animate-stagger>
                                {phase3Features.map((feature, index) => (
                                    <div key={index} className="card bg-base-100 shadow hover:-translate-y-1 hover:shadow-lg transition-all">
                                        <div className="card-body">
                                            <h4 className="card-title">
                                                <i className={`fa-duotone fa-regular ${feature.icon} ${feature.iconColor}`}></i>
                                                {feature.title}
                                            </h4>
                                            <p className="text-base-content/70 text-sm">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Future Vision */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="badge badge-lg">2027+</div>
                                <h3 className="text-3xl font-bold">Future Vision</h3>
                            </div>
                            <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow">
                                <div className="card-body">
                                    <ul className="space-y-3">
                                        {futureVision.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <i className={`fa-duotone fa-regular ${item.icon} mt-1`}></i>
                                                <span>{item.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Voting Section */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="card bg-primary text-primary-content shadow">
                            <div className="card-body text-center p-12">
                                <i className="fa-duotone fa-regular fa-lightbulb text-6xl mb-6 opacity-80"></i>
                                <h2 className="text-3xl font-bold mb-4">Help Shape Our Roadmap</h2>
                                <p className="text-lg opacity-90 mb-8">
                                    Your feedback drives our development priorities. Share what features matter
                                    most to you, and vote on what we should build next.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a href="mailto:feedback@splits.network" className="btn btn-lg btn-neutral">
                                        <i className="fa-duotone fa-regular fa-comment"></i>
                                        Submit Feedback
                                    </a>
                                    <a href="mailto:help@splits.network" className="btn btn-lg btn-outline btn-neutral">
                                        <i className="fa-duotone fa-regular fa-heart"></i>
                                        Request a Feature
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Signup */}
            <section className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
                        <p className="text-lg text-base-content/70 mb-8">
                            Get notified when we ship new features and updates
                        </p>
                        <div className="join w-full max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="input w-full join-item flex-grow"
                            />
                            <button className="btn btn-primary join-item">
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                Subscribe
                            </button>
                        </div>
                        <p className="text-sm text-base-content/60 mt-4">
                            Monthly updates. No spam. Unsubscribe anytime.
                        </p>
                    </div>
                </div>
            </section>

            {/* Changelog Link */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-6" data-animate-stagger>
                            {resourceLinks.map((link, index) => {
                                const CardWrapper = link.isExternal ? "a" : Link;
                                const extraProps = link.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
                                return (
                                    <CardWrapper
                                        key={index}
                                        href={link.href}
                                        className="card bg-base-200 shadow hover:-translate-y-1 hover:shadow-lg transition-all"
                                        {...extraProps}
                                    >
                                        <div className="card-body text-center">
                                            <i className={`${link.isBrand ? 'fa-brands' : 'fa-duotone fa-regular'} ${link.icon} text-4xl ${link.iconColor} mb-3`}></i>
                                            <h3 className="card-title justify-center">{link.title}</h3>
                                            <p className="text-sm text-base-content/70">
                                                {link.description}
                                            </p>
                                        </div>
                                    </CardWrapper>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-content overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Join Us on This Journey</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Be part of the platform that's redefining split-fee recruiting. Early users help shape the future.
                    </p>
                    <Link href="/sign-up" className="btn btn-lg btn-neutral">
                        <i className="fa-duotone fa-regular fa-rocket"></i>
                        Get Started Today
                    </Link>
                </div>
            </section>
        </ScrollAnimator>
    );
}
