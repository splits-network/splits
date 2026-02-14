import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { ScrollAnimator } from "@/components/scroll-animator";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Integration Partners",
    description:
        "Discover integrations and partners powering Splits Network workflows, from ATS connections to reporting and collaboration tools.",
    openGraph: {
        title: "Integration Partners",
        description:
            "Discover integrations and partners powering Splits Network workflows, from ATS connections to reporting and collaboration tools.",
        url: "https://splits.network/public/integration-partners",
    },
    ...buildCanonical("/public/integration-partners"),
};

const plannedIntegrations = [
    {
        icon: "fa-envelope",
        iconColor: "text-primary",
        bgColor: "bg-primary/20",
        title: "Email & Communication",
        items: ["Gmail", "Outlook", "Slack", "Microsoft Teams"],
        badge: { text: "Coming Soon", className: "badge-warning" },
    },
    {
        icon: "fa-calendar",
        iconColor: "text-secondary",
        bgColor: "bg-secondary/20",
        title: "Calendar & Scheduling",
        items: [
            "Google Calendar",
            "Outlook Calendar",
            "Calendly",
            "Acuity Scheduling",
        ],
        badge: { text: "Coming Soon", className: "badge-warning" },
    },
    {
        icon: "fa-briefcase",
        iconColor: "text-accent",
        bgColor: "bg-accent/20",
        title: "Job Boards",
        items: ["LinkedIn", "Indeed", "ZipRecruiter", "Monster"],
        badge: { text: "Coming Soon", className: "badge-warning" },
    },
    {
        icon: "fa-sitemap",
        iconColor: "text-primary",
        bgColor: "bg-primary/20",
        title: "External ATS",
        items: ["Greenhouse", "Lever", "Workday", "iCIMS"],
        badge: { text: "Coming Soon", className: "badge-warning" },
    },
    {
        icon: "fa-credit-card",
        iconColor: "text-success",
        bgColor: "bg-success/20",
        title: "Payment Processing",
        items: [
            { name: "Stripe", badge: "badge-success", active: true },
            { name: "PayPal" },
            { name: "Wire Transfer" },
            { name: "ACH" },
        ],
        badge: { text: "Phase 2", className: "badge-info" },
    },
    {
        icon: "fa-shield-halved",
        iconColor: "text-secondary",
        bgColor: "bg-secondary/20",
        title: "Background Checks",
        items: ["Checkr", "Sterling", "HireRight", "GoodHire"],
        badge: { text: "Coming Soon", className: "badge-warning" },
    },
];

const apiFeatures = [
    "Full REST API with OpenAPI documentation",
    "Webhook support for real-time events",
    "OAuth 2.0 authentication",
    "SDKs for popular languages",
    "Rate limiting and sandbox environment",
];

const automationExamples = [
    {
        title: "New Candidate Alert",
        description:
            "Send Slack notification when recruiter submits candidate",
    },
    {
        title: "CRM Sync",
        description: "Add new placements to Salesforce automatically",
    },
    {
        title: "Invoice Generation",
        description:
            "Create invoice in QuickBooks when placement logged",
    },
];

const webhookEvents = [
    {
        event: "application.created",
        description: "New candidate submission",
        color: "text-primary",
    },
    {
        event: "application.stage_changed",
        description: "Candidate moves to new stage",
        color: "text-primary",
    },
    {
        event: "placement.created",
        description: "Successful hire logged",
        color: "text-success",
    },
    {
        event: "role.published",
        description: "New job posted",
        color: "text-secondary",
    },
    {
        event: "recruiter.approved",
        description: "Recruiter joins network",
        color: "text-accent",
    },
    {
        event: "payment.processed",
        description: "Payment completed",
        color: "text-info",
    },
];

export default function IntegrationsPage() {
    return (
        <ScrollAnimator>
            {/* Hero Section */}
            <section className="hero bg-info text-info-content py-20 overflow-hidden">
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Integrations & Ecosystem
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Connect Splits Network with your existing tools and
                            workflows to create a seamless recruiting experience
                        </p>
                    </div>
                </div>
            </section>

            {/* Coming Soon Notice */}
            <section className="py-12 bg-warning text-warning-content overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <i className="fa-duotone fa-regular fa-wrench text-5xl mb-4"></i>
                        <div>
                            <h2 className="text-2xl font-bold mb-3">
                                Integrations Coming in Phase 2
                            </h2>
                            <p className="text-lg opacity-90">
                                We're building a robust integration ecosystem.
                                In Phase 1, we're focused on delivering the core
                                split placement platform. Stay tuned for these
                                integrations!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Planned Integrations Section */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 opacity-0">
                        <h2 className="text-4xl font-bold mb-4">
                            Planned Integrations
                        </h2>
                        <p className="text-lg text-base-content/70">
                            Connect with the tools you already use
                        </p>
                    </div>

                    <div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
                        data-animate-stagger
                    >
                        {plannedIntegrations.map((integration, index) => (
                            <div
                                key={index}
                                className="card bg-base-200 shadow opacity-0 hover:-translate-y-1 hover:shadow-lg transition-all"
                            >
                                <div className="card-body">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-14 h-14 rounded-lg ${integration.bgColor} flex items-center justify-center`}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${integration.icon} ${integration.iconColor} text-2xl`}
                                            ></i>
                                        </div>
                                        <h3 className="card-title">
                                            {integration.title}
                                        </h3>
                                    </div>
                                    <ul className="space-y-2 text-sm text-base-content/70">
                                        {integration.items.map(
                                            (item, itemIndex) => (
                                                <li
                                                    key={itemIndex}
                                                    className="flex items-center gap-2"
                                                >
                                                    {typeof item ===
                                                    "string" ? (
                                                        <span className="badge badge-sm badge-ghost">
                                                            {item}
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <span
                                                                className={`badge badge-sm ${item.badge || "badge-ghost"}`}
                                                            >
                                                                {item.name}
                                                            </span>
                                                            {item.active && (
                                                                <span className="text-xs">
                                                                    (Active)
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                    <div
                                        className={`badge ${integration.badge.className} mt-4`}
                                    >
                                        {integration.badge.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* API Section */}
            <section className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="badge badge-primary mb-4">
                                    FOR DEVELOPERS
                                </div>
                                <h2 className="text-4xl font-bold mb-6">
                                    RESTful API Access
                                </h2>
                                <p className="text-lg text-base-content/70 mb-6">
                                    Build custom integrations and automate your
                                    recruiting workflow with our comprehensive
                                    API. Available on Partner tier plans.
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {apiFeatures.map((feature, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2"
                                        >
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/pricing"
                                    className="btn btn-primary"
                                >
                                    View Partner Plans
                                </Link>
                            </div>
                            <div className="mockup-code bg-neutral text-neutral-content">
                                <pre data-prefix="$">
                                    <code>
                                        curl -X POST
                                        https://api.splits.network/v1/candidates
                                        \
                                    </code>
                                </pre>
                                <pre data-prefix="">
                                    <code>
                                        {
                                            '  -H "Authorization: Bearer YOUR_API_KEY" \\'
                                        }
                                    </code>
                                </pre>
                                <pre data-prefix="">
                                    <code>
                                        {
                                            '  -H "Content-Type: application/json" \\'
                                        }
                                    </code>
                                </pre>
                                <pre data-prefix="">
                                    <code>{`  -d '{`}</code>
                                </pre>
                                <pre data-prefix="">
                                    <code>
                                        {'    "role_id": "role_123",'}
                                    </code>
                                </pre>
                                <pre data-prefix="">
                                    <code>
                                        {'    "name": "Jane Smith",'}
                                    </code>
                                </pre>
                                <pre data-prefix="">
                                    <code>
                                        {'    "email": "jane@example.com",'}
                                    </code>
                                </pre>
                                <pre data-prefix="">
                                    <code>
                                        {'    "resume_url": "https://..."'}
                                    </code>
                                </pre>
                                <pre data-prefix="">
                                    <code>{`  }'`}</code>
                                </pre>
                                <pre
                                    data-prefix=">"
                                    className="text-success"
                                >
                                    <code>201 Created</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Zapier & Automation */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="card bg-base-200 shadow">
                                    <div className="card-body">
                                        <h3 className="card-title text-2xl mb-4">
                                            <i className="fa-duotone fa-regular fa-bolt text-warning"></i>
                                            Automation Examples
                                        </h3>
                                        <div
                                            className="space-y-4"
                                            data-animate-stagger
                                        >
                                            {automationExamples.map(
                                                (example, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-start gap-3 p-3 bg-base-100 rounded-lg opacity-0"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-arrow-right text-primary mt-1"></i>
                                                        <div>
                                                            <div className="font-bold">
                                                                {example.title}
                                                            </div>
                                                            <div className="text-sm text-base-content/60">
                                                                {
                                                                    example.description
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="badge badge-accent mb-4">
                                    AUTOMATION
                                </div>
                                <h2 className="text-4xl font-bold mb-6">
                                    Zapier & Make Integration
                                </h2>
                                <p className="text-lg text-base-content/70 mb-6">
                                    Connect Splits Network to 5,000+ apps with
                                    no-code automation platforms. Build custom
                                    workflows that fit your unique process.
                                </p>
                                <div className="flex flex-wrap gap-3 mb-8">
                                    <span className="badge badge-lg">
                                        Zapier
                                    </span>
                                    <span className="badge badge-lg">
                                        Make (Integromat)
                                    </span>
                                    <span className="badge badge-lg">n8n</span>
                                    <span className="badge badge-lg">
                                        Automate.io
                                    </span>
                                </div>
                                <div className="badge badge-warning">
                                    Phase 2 - Coming Soon
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Webhooks Section */}
            <section className="py-20 bg-neutral text-neutral-content overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12 opacity-0">
                            <h2 className="text-3xl font-bold mb-4">
                                Webhook Events
                            </h2>
                            <p className="text-lg opacity-80">
                                Real-time notifications for important platform
                                events
                            </p>
                        </div>
                        <div
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                            data-animate-stagger
                        >
                            {webhookEvents.map((webhook, index) => (
                                <div
                                    key={index}
                                    className="card bg-base-100 text-base-content opacity-0 hover:-translate-y-1 hover:shadow-lg transition-all"
                                >
                                    <div className="card-body p-4">
                                        <div
                                            className={`font-mono text-sm ${webhook.color}`}
                                        >
                                            {webhook.event}
                                        </div>
                                        <p className="text-xs text-base-content/70">
                                            {webhook.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <div className="badge badge-warning badge-lg">
                                Available in Phase 2
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Request Integration Section */}
            <section className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="card bg-base-100 shadow">
                            <div className="card-body text-center p-12">
                                <i className="fa-duotone fa-regular fa-lightbulb text-6xl text-warning mb-6"></i>
                                <h2 className="text-3xl font-bold mb-4">
                                    Don't See What You Need?
                                </h2>
                                <p className="text-lg text-base-content/70 mb-8">
                                    We're actively building our integration
                                    ecosystem. Let us know which tools are most
                                    important to your workflow, and we'll
                                    prioritize them in our roadmap.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="mailto:integrations@splits.network"
                                        className="btn btn-primary btn-lg"
                                    >
                                        <i className="fa-duotone fa-regular fa-envelope"></i>
                                        Request an Integration
                                    </a>
                                    <Link
                                        href="/updates"
                                        className="btn btn-outline btn-lg"
                                    >
                                        <i className="fa-duotone fa-regular fa-rss"></i>
                                        View Roadmap
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-content overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Build on Splits Network
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Whether you need simple automation or custom
                        integrations, we've got you covered.
                    </p>
                    <Link
                        href="/sign-up"
                        className="btn btn-lg btn-neutral hover:scale-105 transition-transform"
                    >
                        <i className="fa-duotone fa-regular fa-code"></i>
                        Get Started
                    </Link>
                </div>
            </section>
        </ScrollAnimator>
    );
}
