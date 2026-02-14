import type { Metadata } from "next";
import Link from "next/link";
import { ScrollAnimator } from "@/components/scroll-animator";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Features",
    description:
        "Explore the tools and workflows that power split placements on Splits Network, from role setup and submissions to messaging, placements, and payout tracking.",
    openGraph: {
        title: "Features",
        description:
            "Explore the tools and workflows that power split placements on Splits Network, from role setup and submissions to messaging, placements, and payout tracking.",
        url: "https://splits.network/public/features",
    },
    ...buildCanonical("/public/features"),
};

const coreFeatures = [
    {
        icon: "fa-duotone fa-regular fa-sitemap",
        title: "ATS Foundation",
        description:
            "Full applicant tracking system built for collaborative recruiting.",
        color: "primary",
        items: [
            "Role & job posting management",
            "Candidate profiles & resumes",
            "Application tracking & stages",
            "Notes & activity history",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-chart-pie",
        title: "Split Placement Engine",
        description:
            "Automatic fee calculation and transparent split tracking.",
        color: "secondary",
        items: [
            "Placement fee calculation",
            "Recruiter share tracking",
            "Platform fee transparency",
            "Placement history & reporting",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Recruiter Network",
        description:
            "Connect with specialized recruiters across industries.",
        color: "accent",
        items: [
            "Role assignments by niche",
            "Recruiter profiles & stats",
            "Access control & permissions",
            "Performance tracking",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-crown",
        title: "Flexible Plans",
        description:
            "Subscription tiers that grow with your business.",
        color: "primary",
        items: [
            "Starter, Pro & Partner tiers",
            "Higher payouts on paid plans",
            "Priority access to roles",
            "Enhanced features per tier",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Smart Notifications",
        description:
            "Stay informed with real-time updates via email.",
        color: "secondary",
        items: [
            "New application alerts",
            "Stage change notifications",
            "Placement confirmations",
            "Customizable preferences",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Admin Console",
        description:
            "Comprehensive controls for platform administrators.",
        color: "accent",
        items: [
            "Recruiter approval workflow",
            "Company management",
            "Placement oversight",
            "Analytics & reporting",
        ],
    },
];

const recruiterFeatures = [
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Role Discovery",
        description:
            "Browse curated roles that match your specialties. No more hunting through job boards—opportunities come to you based on your expertise and tier.",
    },
    {
        icon: "fa-duotone fa-regular fa-users-between-lines",
        title: "Candidate Management",
        description:
            "Submit candidates with ease. Track every submission through interview stages, and maintain full visibility into where each candidate stands.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-invoice-dollar",
        title: "Earnings Dashboard",
        description:
            "See exactly what you've earned, what's pending, and your placement history. No mystery math—just transparent fee calculations and clear splits.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Performance Insights",
        description:
            "Track your placement rate, average time to hire, and other key metrics to optimize your recruiting strategy and grow your business.",
    },
];

const companyFeatures = [
    {
        icon: "fa-duotone fa-regular fa-bullhorn",
        title: "Role Posting",
        description:
            "Post open positions with clear requirements, compensation, and fee structures. Control which recruiters have access to each role.",
    },
    {
        icon: "fa-duotone fa-regular fa-diagram-project",
        title: "Pipeline Visibility",
        description:
            "See all candidates across all external recruiters in one unified pipeline. No more scattered spreadsheets or email chains.",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Recruiter Coordination",
        description:
            "Manage all your external recruiters from one platform. Set fees, track performance, and maintain consistent communication.",
    },
    {
        icon: "fa-duotone fa-regular fa-dollar-sign",
        title: "Cost Management",
        description:
            "Track placement costs, analyze ROI by recruiter, and maintain transparency with standardized fee agreements.",
    },
];

const techFeatures = [
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Secure by Design",
        description:
            "Enterprise authentication, role-based access control, and encrypted data storage",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Lightning Fast",
        description:
            "Microservices architecture with optimized database queries for instant response times",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-spin",
        title: "Always Reliable",
        description:
            "99.9% uptime guarantee with automated backups and redundant systems",
    },
];

export default function FeaturesPage() {
    return (
        <ScrollAnimator>
            {/* Hero Section */}
            <section className="hero bg-primary text-primary-content py-20 overflow-hidden">
                <div className="hero-content text-center max-w-5xl opacity-0">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Everything You Need for Split Placements
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Built from the ground up for collaborative
                            recruiting. No retrofitting, no workarounds—just
                            pure split placement functionality.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Features Section */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 opacity-0">
                        <h2 className="text-4xl font-bold mb-4">
                            Core Platform Features
                        </h2>
                        <p className="text-lg text-base-content/70">
                            A complete recruiting ecosystem in one platform
                        </p>
                    </div>
                    <div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
                        data-animate-stagger
                    >
                        {coreFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="card bg-base-200 shadow hover:-translate-y-1 hover:shadow-lg transition-all opacity-0"
                            >
                                <div className="card-body">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-14 h-14 rounded-lg bg-${feature.color}/20 flex items-center justify-center`}
                                        >
                                            <i
                                                className={`${feature.icon} text-${feature.color} text-2xl`}
                                            ></i>
                                        </div>
                                        <h3 className="card-title">
                                            {feature.title}
                                        </h3>
                                    </div>
                                    <p className="text-base-content/70 mb-4">
                                        {feature.description}
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        {feature.items.map(
                                            (item, itemIndex) => (
                                                <li
                                                    key={itemIndex}
                                                    className="flex items-start gap-2"
                                                >
                                                    <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                    <span>{item}</span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Recruiters Features */}
            <section className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12 opacity-0">
                            <h2 className="text-3xl font-bold mb-4">
                                <i className="fa-duotone fa-regular fa-user-tie text-primary"></i>{" "}
                                For Recruiters
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Tools designed to maximize your placement
                                success
                            </p>
                        </div>
                        <div
                            className="grid md:grid-cols-2 gap-6"
                            data-animate-stagger
                        >
                            {recruiterFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className="card bg-base-100 shadow hover:-translate-y-1 hover:shadow-lg transition-all opacity-0"
                                >
                                    <div className="card-body">
                                        <h3 className="card-title text-xl mb-3">
                                            <i
                                                className={`${feature.icon} text-primary`}
                                            ></i>
                                            {feature.title}
                                        </h3>
                                        <p className="text-base-content/70">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* For Companies Features */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12 opacity-0">
                            <h2 className="text-3xl font-bold mb-4">
                                <i className="fa-duotone fa-regular fa-building text-secondary"></i>{" "}
                                For Companies
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Streamline your external recruiting operations
                            </p>
                        </div>
                        <div
                            className="grid md:grid-cols-2 gap-6"
                            data-animate-stagger
                        >
                            {companyFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className="card bg-base-200 shadow hover:-translate-y-1 hover:shadow-lg transition-all opacity-0"
                                >
                                    <div className="card-body">
                                        <h3 className="card-title text-xl mb-3">
                                            <i
                                                className={`${feature.icon} text-secondary`}
                                            ></i>
                                            {feature.title}
                                        </h3>
                                        <p className="text-base-content/70">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Features */}
            <section className="py-20 bg-neutral text-neutral-content overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 opacity-0">
                        <h2 className="text-3xl font-bold mb-4">
                            Built on Modern Architecture
                        </h2>
                        <p className="text-lg opacity-80">
                            Enterprise-grade infrastructure with security and
                            scalability
                        </p>
                    </div>
                    <div
                        className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
                        data-animate-stagger
                    >
                        {techFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="text-center opacity-0"
                            >
                                <i
                                    className={`${feature.icon} text-5xl mb-4 opacity-80`}
                                ></i>
                                <h3 className="font-bold text-xl mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm opacity-70">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-content overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <div className="opacity-0">
                        <h2 className="text-4xl font-bold mb-6">
                            Ready to Experience the Difference?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Join the platform built specifically for split
                            placements. No retrofitting, no compromises.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/sign-up"
                            className="btn btn-lg btn-neutral hover:scale-105 transition-all opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-user-tie"></i>
                            Join as a Recruiter
                        </Link>
                        <Link
                            href="/sign-up"
                            className="btn btn-lg btn-secondary hover:scale-105 transition-all opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-building"></i>
                            Post Roles as a Company
                        </Link>
                    </div>
                </div>
            </section>
        </ScrollAnimator>
    );
}
