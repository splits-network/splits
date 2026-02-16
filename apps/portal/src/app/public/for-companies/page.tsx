import type { Metadata } from "next";
import Link from "next/link";
import { ScrollAnimator } from "@/components/scroll-animator";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "For Companies - Splits Network | Streamline Your Hiring",
    description:
        "Transform your hiring process with Splits Network's collaborative recruiting platform. Access top talent faster, reduce costs by up to 50%, and hire with confidence through our verified recruiter network.",
    openGraph: {
        title: "For Companies - Splits Network | Streamline Your Hiring",
        description:
            "Transform your hiring process with Splits Network's collaborative recruiting platform. Access top talent faster, reduce costs by up to 50%, and hire with confidence.",
        type: "website",
        url: "https://splits.network/public/for-companies",
    },
    twitter: {
        card: "summary_large_image",
        title: "For Companies - Splits Network | Streamline Your Hiring",
        description:
            "Transform your hiring process with Splits Network's collaborative recruiting platform. Access top talent faster, reduce costs by up to 50%, and hire with confidence.",
    },
    ...buildCanonical("/public/for-companies"),
};

const companyBenefits = [
    {
        icon: "fa-clock text-primary",
        badge: "badge-primary",
        title: "Hire 3x Faster",
        description:
            "Access a network of specialized recruiters who can source qualified candidates in days, not weeks. Reduce your time-to-hire significantly.",
        stats: "Average 14 days vs 45 days",
    },
    {
        icon: "fa-dollar-sign text-secondary",
        badge: "badge-secondary",
        title: "Reduce Costs by 50%",
        description:
            "Transparent, flat-rate recruiting fees that cost significantly less than traditional agencies. No markups, no hidden charges.",
        stats: "Starting at $15k per placement",
    },
    {
        icon: "fa-users text-accent",
        badge: "badge-accent",
        title: "Quality Talent Pool",
        description:
            "Access candidates that have been sourced and vetted by multiple recruiting professionals. Higher match rates and better retention.",
        stats: "95% candidate satisfaction",
    },
    {
        icon: "fa-chart-network text-info",
        badge: "badge-info",
        title: "Collaborative Approach",
        description:
            "Multiple recruiters work together on your roles, bringing diverse networks and specialized expertise to find the perfect fit.",
        stats: "2,500+ active recruiters",
    },
];

const hiringProcess = [
    {
        step: 1,
        title: "Post Your Role",
        description:
            "Create a detailed job posting with transparent fee structure. Our platform guides you through compensation benchmarking and role requirements.",
        details: "Average posting time: 10 minutes",
        icon: "fa-bullhorn",
    },
    {
        step: 2,
        title: "Recruiter Assignment",
        description:
            "Our algorithm matches your role with the best-fit recruiters based on industry expertise, track record, and network strength.",
        details: "Typical assignment within 24 hours",
        icon: "fa-user-tie",
    },
    {
        step: 3,
        title: "Candidate Sourcing",
        description:
            "Multiple recruiters work collaboratively to source and vet candidates. You receive pre-qualified profiles with detailed assessments.",
        details: "First candidates typically within 3-5 days",
        icon: "fa-search",
    },
    {
        step: 4,
        title: "Interview & Selection",
        description:
            "Use our built-in interview scheduling and feedback tools. Recruiters provide insights and support throughout the selection process.",
        details: "Streamlined coordination tools",
        icon: "fa-handshake",
    },
    {
        step: 5,
        title: "Onboarding Support",
        description:
            "Recruiters help with offer negotiation and onboarding. Our guarantee ensures successful placements with replacement support if needed.",
        details: "30-90 day guarantee periods",
        icon: "fa-check-circle",
    },
];

const industries = [
    { name: "Technology", icon: "fa-laptop-code", count: "500+ roles filled" },
    { name: "Healthcare", icon: "fa-stethoscope", count: "350+ roles filled" },
    { name: "Finance", icon: "fa-chart-line", count: "400+ roles filled" },
    { name: "Manufacturing", icon: "fa-industry", count: "250+ roles filled" },
    {
        name: "Sales & Marketing",
        icon: "fa-bullseye-arrow",
        count: "600+ roles filled",
    },
    { name: "Operations", icon: "fa-cogs", count: "300+ roles filled" },
];

export default function ForCompaniesPage() {
    return (
        <ScrollAnimator>
            <div className="min-h-screen bg-base-100">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-secondary/10 via-base-100 to-accent/10 py-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="badge badge-secondary badge-lg mb-6">
                                    <i className="fa-duotone fa-regular fa-building mr-2"></i>
                                    For Companies
                                </div>
                                <h1 className="text-5xl md:text-6xl font-bold text-base-content mb-8">
                                    Hire Better.{" "}
                                    <span className="text-secondary">
                                        Faster.
                                    </span>{" "}
                                    Smarter.
                                </h1>
                                <p className="text-xl text-base-content/80 mb-8 leading-relaxed">
                                    Transform your hiring with our collaborative
                                    recruiting network. Access specialized
                                    talent faster while reducing costs by up to
                                    50% compared to traditional recruiting
                                    agencies.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                    <Link
                                        href="/sign-up"
                                        className="btn btn-secondary btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                                        Start Hiring Now
                                    </Link>
                                    <Link
                                        href="https://calendly.com/floyd-employment-networks/30min"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-calendar mr-2"></i>
                                        Schedule a Demo
                                    </Link>
                                </div>

                                <div
                                    className="grid grid-cols-3 gap-4 text-center"
                                    data-animate-stagger
                                >
                                    <div>
                                        <div className="text-2xl font-bold text-secondary">
                                            1,200+
                                        </div>
                                        <div className="text-sm text-base-content/60">
                                            Companies Trust Us
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-accent">
                                            14 days
                                        </div>
                                        <div className="text-sm text-base-content/60">
                                            Avg Time to Hire
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-primary">
                                            95%
                                        </div>
                                        <div className="text-sm text-base-content/60">
                                            Success Rate
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
                                        alt="Modern office team collaboration"
                                        className="rounded-2xl shadow-2xl w-full h-96 object-contain"
                                    />
                                    <div className="absolute -bottom-6 -left-6 bg-secondary text-secondary-content p-4 rounded-xl shadow-lg">
                                        <div className="text-sm font-medium">
                                            Average Cost Savings
                                        </div>
                                        <div className="text-2xl font-bold">
                                            50%+
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 px-4 bg-base-200/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                                Why Companies Choose Us
                            </h2>
                            <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                                We've reimagined recruiting to be faster, more
                                cost-effective, and deliver better results for
                                growing companies.
                            </p>
                        </div>

                        <div
                            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                            data-animate-stagger
                        >
                            {companyBenefits.map((benefit) => (
                                <div key={benefit.title} className="opacity-0">
                                    <div className="card bg-base-100 shadow-lg h-full hover:-translate-y-1 hover:shadow-lg transition-all">
                                        <div className="card-body text-center">
                                            <div className="text-secondary text-5xl mb-4">
                                                <i
                                                    className={`fa-duotone fa-regular ${benefit.icon}`}
                                                ></i>
                                            </div>
                                            <h3 className="card-title text-xl justify-center mb-4">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-base-content/80 mb-4 flex-grow">
                                                {benefit.description}
                                            </p>
                                            <div
                                                className={`badge ${benefit.badge} badge-lg mx-auto`}
                                            >
                                                {benefit.stats}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Industries Section */}
                <section className="py-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                                Trusted Across Industries
                            </h2>
                            <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                                Our specialized recruiter network spans every
                                major industry, ensuring expert knowledge for
                                your specific hiring needs.
                            </p>
                        </div>

                        <div
                            className="grid md:grid-cols-3 lg:grid-cols-6 gap-6"
                            data-animate-stagger
                        >
                            {industries.map((industry) => (
                                <div key={industry.name} className="opacity-0">
                                    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="card-body text-center p-6">
                                            <div className="text-accent text-4xl mb-3">
                                                <i
                                                    className={`fa-duotone fa-regular ${industry.icon}`}
                                                ></i>
                                            </div>
                                            <h3 className="font-bold text-lg mb-2">
                                                {industry.name}
                                            </h3>
                                            <p className="text-sm text-base-content/60">
                                                {industry.count}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-24 px-4 bg-base-200/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                                Your Hiring Process, Simplified
                            </h2>
                            <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                                From job posting to successful hire, here's
                                exactly how our platform streamlines your
                                recruiting process.
                            </p>
                        </div>

                        <div className="relative" data-animate-stagger>
                            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-secondary/20 h-full"></div>

                            {hiringProcess.map((step, index) => (
                                <div
                                    key={step.step}
                                    className={`opacity-0 relative flex items-center mb-16 ${
                                        index % 2 === 0
                                            ? "md:flex-row-reverse"
                                            : ""
                                    }`}
                                >
                                    <div
                                        className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pl-16" : "md:pr-16"}`}
                                    >
                                        <div className="card bg-base-100 shadow-lg hover:-translate-y-1 hover:shadow-lg transition-all">
                                            <div className="card-body">
                                                <div className="flex items-center mb-4">
                                                    <div className="text-secondary text-3xl mr-3">
                                                        <i
                                                            className={`fa-duotone fa-regular ${step.icon}`}
                                                        ></i>
                                                    </div>
                                                    <div>
                                                        <div className="badge badge-secondary badge-sm mb-1">
                                                            Step {step.step}
                                                        </div>
                                                        <h3 className="card-title text-xl">
                                                            {step.title}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <p className="text-base-content/80 mb-4">
                                                    {step.description}
                                                </p>
                                                <div className="bg-secondary/5 p-3 rounded-lg">
                                                    <p className="text-sm text-secondary font-medium">
                                                        {step.details}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-secondary rounded-full items-center justify-center text-secondary-content font-bold text-lg">
                                        {step.step}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Real Company Gains Section */}
                <section className="py-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                                What Your Company Actually Gets
                            </h2>
                            <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                                Beyond faster hiring - here are the concrete
                                advantages that companies gain when they join
                                Splits Network.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12">
                            <div>
                                <div className="space-y-8">
                                    <div className="bg-primary/5 p-6 rounded-xl border-l-4 border-coral">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/20 p-3 rounded-lg flex-shrink-0">
                                                <i className="fa-duotone fa-regular fa-network-wired text-primary text-xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-base-content mb-3">
                                                    Massive Network Expansion
                                                </h3>
                                                <p className="text-base-content/80 mb-4">
                                                    Instead of being limited to
                                                    one recruiting firm's
                                                    network, you instantly gain
                                                    access to thousands of
                                                    specialized recruiters
                                                    across industries,
                                                    geographies, and skill sets.
                                                    Your difficult-to-fill roles
                                                    get exposed to talent pools
                                                    you never knew existed.
                                                </p>
                                                <div className="text-sm font-medium text-primary">
                                                    Real Impact: Roles that
                                                    typically sit open for
                                                    months get filled in weeks
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-secondary/5 p-6 rounded-xl border-l-4 border-secondary">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-secondary/20 p-3 rounded-lg flex-shrink-0">
                                                <i className="fa-duotone fa-regular fa-magnifying-glass-chart text-secondary text-xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-base-content mb-3">
                                                    Complete Process Visibility
                                                </h3>
                                                <p className="text-base-content/80 mb-4">
                                                    Track exactly which
                                                    recruiters are working on
                                                    your roles, see real
                                                    candidate pipelines, and get
                                                    detailed insights into your
                                                    hiring funnel. No more
                                                    wondering "what's happening
                                                    with my search?" - you see
                                                    everything in real-time.
                                                </p>
                                                <div className="text-sm font-medium text-secondary">
                                                    Real Impact: Cut hiring
                                                    manager stress and improve
                                                    stakeholder communication
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-accent/5 p-6 rounded-xl border-l-4 border-yellow">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-accent/20 p-3 rounded-lg flex-shrink-0">
                                                <i className="fa-duotone fa-regular fa-shield-check text-accent text-xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-base-content mb-3">
                                                    Built-in Risk Mitigation
                                                </h3>
                                                <p className="text-base-content/80 mb-4">
                                                    When multiple recruiters
                                                    evaluate the same
                                                    candidates, you get natural
                                                    quality control. Bad fits
                                                    get filtered out early, good
                                                    candidates get validated by
                                                    multiple professionals, and
                                                    your hiring decisions become
                                                    more confident.
                                                </p>
                                                <div className="text-sm font-medium text-accent">
                                                    Real Impact: Higher
                                                    retention rates and fewer
                                                    costly mis-hires
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="space-y-8">
                                    <div className="bg-info/5 p-6 rounded-xl border-l-4 border-info">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-info/20 p-3 rounded-lg flex-shrink-0">
                                                <i className="fa-duotone fa-regular fa-clock-rotate-left text-info text-xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-base-content mb-3">
                                                    Flexible Scaling Power
                                                </h3>
                                                <p className="text-base-content/80 mb-4">
                                                    Need to hire 1 person?
                                                    Great. Need to hire 50
                                                    people in 6 months? No
                                                    problem. Our network scales
                                                    up or down based on your
                                                    actual needs without
                                                    requiring long-term
                                                    contracts or minimum
                                                    commitments.
                                                </p>
                                                <div className="text-sm font-medium text-info">
                                                    Real Impact: Handle growth
                                                    spurts and urgent hiring
                                                    without panic
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-success/5 p-6 rounded-xl border-l-4 border-success">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-success/20 p-3 rounded-lg flex-shrink-0">
                                                <i className="fa-duotone fa-regular fa-dollar-sign text-success text-xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-base-content mb-3">
                                                    Predictable Cost Structure
                                                </h3>
                                                <p className="text-base-content/80 mb-4">
                                                    Know your recruiting costs
                                                    upfront with transparent,
                                                    flat-rate fees. No surprise
                                                    markups, no hidden charges
                                                    for "rush" searches, no
                                                    arbitrary fee increases.
                                                    Budget accurately for your
                                                    hiring needs.
                                                </p>
                                                <div className="text-sm font-medium text-success">
                                                    Real Impact: Better
                                                    financial planning and lower
                                                    cost-per-hire
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-warning/5 p-6 rounded-xl border-l-4 border-warning">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-warning/20 p-3 rounded-lg flex-shrink-0">
                                                <i className="fa-duotone fa-regular fa-users-medical text-warning text-xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-base-content mb-3">
                                                    Specialized Expertise
                                                    On-Demand
                                                </h3>
                                                <p className="text-base-content/80 mb-4">
                                                    Get access to recruiters who
                                                    specialize in your exact
                                                    industry, technology stack,
                                                    or role type. Instead of
                                                    working with generalists,
                                                    connect with experts who
                                                    understand your specific
                                                    hiring challenges.
                                                </p>
                                                <div className="text-sm font-medium text-warning">
                                                    Real Impact: Better
                                                    candidate quality and faster
                                                    time-to-productivity
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 text-center">
                            <div className="bg-gradient-to-r from-base-100 to-base-200 p-8 rounded-2xl shadow-lg">
                                <h3 className="text-2xl font-bold text-base-content mb-4">
                                    Ready to Experience Better Hiring?
                                </h3>
                                <p className="text-lg text-base-content/80 max-w-3xl mx-auto mb-6">
                                    Stop settling for the limitations of
                                    traditional recruiting. Join companies
                                    who've discovered that collaborative
                                    recruiting isn't just faster - it's
                                    fundamentally better.
                                </p>
                                <Link
                                    href="/sign-up"
                                    className="btn btn-primary btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                >
                                    <i className="fa-duotone fa-regular fa-handshake mr-2"></i>
                                    Partner With Us Today
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Splits Network Section */}
                <section id="benefits" className="py-24 px-4 bg-base-200/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                                Why Choose{" "}
                                <span className="text-secondary">
                                    Splits Network
                                </span>
                                ?
                            </h2>
                            <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                                See how our collaborative approach delivers
                                better results than traditional recruiting firms
                                or individual recruiters.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="space-y-8" data-animate-stagger>
                                    <div className="opacity-0 bg-base-100 p-6 rounded-xl shadow-lg">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-secondary/20 p-3 rounded-lg">
                                                <i className="fa-duotone fa-regular fa-users-gear text-secondary text-2xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-base-content mb-2">
                                                    Collective Intelligence vs.
                                                    Single Points of Failure
                                                </h3>
                                                <p className="text-base-content/80">
                                                    Traditional firms assign one
                                                    recruiter per role, creating
                                                    bottlenecks and limited
                                                    networks. Splits Network
                                                    connects your open positions
                                                    to thousands of specialized
                                                    recruiters, each bringing
                                                    their unique networks and
                                                    expertise. When multiple
                                                    minds work on your hiring
                                                    challenge, you get faster
                                                    results and higher-quality
                                                    candidates.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="opacity-0 bg-base-100 p-6 rounded-xl shadow-lg">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/20 p-3 rounded-lg">
                                                <i className="fa-duotone fa-regular fa-chart-line-up text-primary text-2xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-base-content mb-2">
                                                    Performance-Driven Results
                                                    vs. Hourly Billing
                                                </h3>
                                                <p className="text-base-content/80">
                                                    Unlike consulting firms that
                                                    charge by the hour
                                                    regardless of results, our
                                                    recruiters only get paid
                                                    when they successfully place
                                                    candidates. This alignment
                                                    means every recruiter is
                                                    motivated to find the best
                                                    talent quickly, not to
                                                    maximize billable hours. You
                                                    get faster placements with
                                                    better candidate fit.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="space-y-8" data-animate-stagger>
                                    <div className="opacity-0 bg-base-100 p-6 rounded-xl shadow-lg">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-accent/20 p-3 rounded-lg">
                                                <i className="fa-duotone fa-regular fa-scale-balanced text-accent text-2xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-base-content mb-2">
                                                    Transparent Economics vs.
                                                    Hidden Markups
                                                </h3>
                                                <p className="text-base-content/80">
                                                    Traditional recruiting firms
                                                    often mark up fees by
                                                    200-300% above what they pay
                                                    their recruiters. Our
                                                    transparent model shows
                                                    exactly how fees are split,
                                                    ensuring you get competitive
                                                    rates while recruiters earn
                                                    fair compensation. No hidden
                                                    charges, no surprise
                                                    invoices, no inflated
                                                    overhead costs.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="opacity-0 bg-base-100 p-6 rounded-xl shadow-lg">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-info/20 p-3 rounded-lg">
                                                <i className="fa-duotone fa-regular fa-shield-check text-info text-2xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-base-content mb-2">
                                                    Built-in Quality Control vs.
                                                    Hope and Pray
                                                </h3>
                                                <p className="text-base-content/80">
                                                    When you work with a single
                                                    recruiter, you're dependent
                                                    on their judgment and
                                                    network limitations. Our
                                                    platform creates natural
                                                    quality checks as multiple
                                                    recruiters evaluate
                                                    candidates, share insights,
                                                    and collaborate on the best
                                                    matches. The result is
                                                    higher-quality placements
                                                    with better long-term
                                                    retention.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 text-center">
                            <div className="bg-gradient-to-r from-secondary/10 to-primary/10 p-8 rounded-2xl">
                                <h3 className="text-2xl font-bold text-base-content mb-4">
                                    The Bottom Line: Better Hiring Outcomes
                                </h3>
                                <p className="text-lg text-base-content/80 max-w-4xl mx-auto leading-relaxed">
                                    While traditional recruiting firms focus on
                                    maintaining margins and individual
                                    recruiters are limited by their personal
                                    networks, Splits Network is designed around
                                    a simple principle:{" "}
                                    <strong className="text-secondary">
                                        the best hiring happens when great
                                        recruiters collaborate
                                    </strong>
                                    . Our platform removes the barriers that
                                    prevent excellent recruiters from working
                                    together on your most important roles.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                                    <Link
                                        href="/sign-up"
                                        className="btn btn-secondary btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                                        Start Better Hiring
                                    </Link>
                                    <Link
                                        href="/public/transparency"
                                        className="btn btn-outline btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-magnifying-glass mr-2"></i>
                                        See How It Works
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 px-4 bg-gradient-to-br from-secondary/10 via-base-100 to-accent/10">
                    <div className="max-w-7xl mx-auto text-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                                Ready to Transform Your Hiring?
                            </h2>
                            <p className="text-xl text-base-content/80 max-w-3xl mx-auto mb-12">
                                Join over 1,200 companies who've revolutionized
                                their recruiting process. Start hiring better
                                candidates faster.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                                <Link
                                    href="/sign-up"
                                    className="btn btn-secondary btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                >
                                    <i className="fa-duotone fa-regular fa-building mr-2"></i>
                                    Start Hiring Today
                                </Link>
                                <Link
                                    href="https://calendly.com/floyd-employment-networks/30min"
                                    className="btn btn-outline btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                >
                                    <i className="fa-duotone fa-regular fa-calendar mr-2"></i>
                                    Schedule a Demo
                                </Link>
                            </div>

                            <div
                                className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
                                data-animate-stagger
                            >
                                <div className="stat opacity-0">
                                    <div className="stat-title">Setup Time</div>
                                    <div className="stat-value text-secondary">
                                        1 day
                                    </div>
                                    <div className="stat-desc">
                                        From signup to first posting
                                    </div>
                                </div>
                                <div className="stat opacity-0">
                                    <div className="stat-title">Risk Free</div>
                                    <div className="stat-value text-accent">
                                        100%
                                    </div>
                                    <div className="stat-desc">
                                        Money-back guarantee
                                    </div>
                                </div>
                                <div className="stat opacity-0">
                                    <div className="stat-title">Support</div>
                                    <div className="stat-value text-primary">
                                        24/7
                                    </div>
                                    <div className="stat-desc">
                                        Dedicated account management
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </ScrollAnimator>
    );
}
