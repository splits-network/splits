import type { Metadata } from "next";
import Link from "next/link";
import { ScrollAnimator } from "@/components/scroll-animator";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "For Recruiters",
    description:
        "Join thousands of recruiters earning more through collaborative placements on Splits Network. Transparent fees, flexible tiers, and unlimited earning potential.",
    openGraph: {
        title: "For Recruiters",
        description:
            "Join thousands of recruiters earning more through collaborative placements on Splits Network. Transparent fees, flexible tiers, and unlimited earning potential.",
        url: "https://splits.network/public/for-recruiters",
    },
    ...buildCanonical("/public/for-recruiters"),
};

const recruiterBenefits = [
    {
        icon: "fa-chart-line text-primary",
        badge: "badge-primary",
        title: "Increase Your Income",
        description:
            "Earn 20-40% of placement fees based on your subscription tier. Higher tiers unlock better payouts and more opportunities.",
        stats: "Up to $50k+ per placement",
    },
    {
        icon: "fa-handshake text-secondary",
        badge: "badge-secondary",
        title: "Collaborative Network",
        description:
            "Work with other recruiters to fill challenging roles. Share candidates, split fees, and build lasting professional relationships.",
        stats: "2,500+ active recruiters",
    },
    {
        icon: "fa-eye text-accent",
        badge: "badge-accent",
        title: "Complete Transparency",
        description:
            "See exact fee structures, payout percentages, and earnings potential before you start. No hidden fees or surprise deductions.",
        stats: "100% transparent pricing",
    },
    {
        icon: "fa-rocket text-info",
        badge: "badge-info",
        title: "Flexible Business Model",
        description:
            "Scale your recruiting business on your terms. Work part-time or full-time, focus on your specialties, and grow at your pace.",
        stats: "Start earning immediately",
    },
];

const processSteps = [
    {
        step: 1,
        title: "Sign Up & Get Verified",
        description:
            "Create your recruiter profile and choose your subscription tier. Our verification process ensures quality and trust in the network.",
        details: "Complete profile setup takes just 5 minutes",
        icon: "fa-user-check",
    },
    {
        step: 2,
        title: "Browse Available Roles",
        description:
            "Access our curated job board with transparent fee structures. Filter by industry, location, salary range, and placement fee percentage.",
        details: "100+ new roles added weekly",
        icon: "fa-briefcase",
    },
    {
        step: 3,
        title: "Submit Quality Candidates",
        description:
            "Present your best candidates with detailed profiles and documentation. Our platform handles the entire submission and tracking process.",
        details: "Real-time status updates and feedback",
        icon: "fa-user-plus",
    },
    {
        step: 4,
        title: "Collaborate & Close",
        description:
            "Work with other recruiters and hiring companies to move candidates through the process. Share insights and coordinate next steps.",
        details: "Built-in communication tools",
        icon: "fa-handshake",
    },
    {
        step: 5,
        title: "Get Paid Fairly",
        description:
            "When placements are made, fees are automatically calculated and distributed based on your contribution and subscription tier.",
        details: "Fast, transparent payouts",
        icon: "fa-money-bill-wave",
    },
];

export default function ForRecruitersPage() {
    return (
        <ScrollAnimator>
            <div className="min-h-screen bg-base-100">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 py-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="badge badge-primary badge-lg mb-6">
                                    <i className="fa-duotone fa-regular fa-users mr-2"></i>
                                    For Recruiters
                                </div>
                                <h1 className="text-5xl md:text-6xl font-bold text-base-content mb-8">
                                    Earn More Through{" "}
                                    <span className="text-primary">
                                        Collaboration
                                    </span>
                                </h1>
                                <p className="text-xl text-base-content/80 mb-8 leading-relaxed">
                                    Join the largest network of collaborative
                                    recruiters. Increase your income, expand your
                                    reach, and build lasting professional
                                    relationships while placing top talent.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                    <Link
                                        href="/sign-up"
                                        className="btn btn-primary btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                                        Start Recruiting Today
                                    </Link>
                                    <Link
                                        href="/public/transparency"
                                        className="btn btn-outline btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-chart-pie mr-2"></i>
                                        See Fee Structure
                                    </Link>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-center" data-animate-stagger>
                                    <div>
                                        <div className="text-2xl font-bold text-primary">
                                            2,500+
                                        </div>
                                        <div className="text-sm text-base-content/60">
                                            Active Recruiters
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-secondary">
                                            $85M+
                                        </div>
                                        <div className="text-sm text-base-content/60">
                                            Fees Distributed
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-accent">
                                            12k+
                                        </div>
                                        <div className="text-sm text-base-content/60">
                                            Successful Placements
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:order-first">
                                <div className="relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2088&q=80"
                                        alt="Recruiter working collaboratively"
                                        className="rounded-2xl shadow-2xl w-full h-96 object-cover object-[0_20%]"
                                    />
                                    <div className="absolute -bottom-6 -right-6 bg-primary text-primary-content p-4 rounded-xl shadow-lg">
                                        <div className="text-sm font-medium">
                                            Average Monthly Earnings
                                        </div>
                                        <div className="text-2xl font-bold">
                                            $8,500+
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
                                Why Choose Splits Network
                            </h2>
                            <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                                We've built the most transparent, profitable, and
                                collaborative recruiting platform in the industry.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" data-animate-stagger>
                            {recruiterBenefits.map((benefit) => (
                                <div key={benefit.title} className="opacity-0">
                                    <div className="card bg-base-100 shadow-lg h-full hover:-translate-y-1 hover:shadow-lg transition-all">
                                        <div className="card-body text-center">
                                            <div className="text-5xl mb-4">
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

                {/* Platform Benefits Section */}
                <section className="py-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                                Transform Your Recruiting Business
                            </h2>
                            <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                                Join a platform built specifically for professional
                                recruiters who want to scale their business and
                                maximize earnings.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                                                <i className="fa-duotone fa-regular fa-network-wired text-primary text-xl"></i>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">
                                                Access to Exclusive Opportunities
                                            </h3>
                                            <p className="text-base-content/80">
                                                Get first access to high-paying
                                                roles from vetted companies actively
                                                looking to hire. Our platform
                                                connects you with roles that match
                                                your expertise and offer competitive
                                                compensation packages that make your
                                                time investment worthwhile.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                                                <i className="fa-duotone fa-regular fa-handshake-simple text-secondary text-xl"></i>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">
                                                Collaborative Success Model
                                            </h3>
                                            <p className="text-base-content/80">
                                                Work alongside other skilled
                                                recruiters to fill challenging
                                                positions. Share candidates,
                                                leverage diverse networks, and earn
                                                from placements even when you didn't
                                                source the final candidate. Our
                                                collaborative approach means more
                                                successful placements and higher
                                                overall earnings for everyone.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                                                <i className="fa-duotone fa-regular fa-shield-check text-accent text-xl"></i>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">
                                                Complete Transparency & Trust
                                            </h3>
                                            <p className="text-base-content/80">
                                                No hidden fees, unclear commission
                                                structures, or surprise deductions.
                                                See exactly what you'll earn before
                                                submitting a candidate, track your
                                                progress in real-time, and get paid
                                                fairly and on time. We believe
                                                transparency builds trust and
                                                long-term success.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="relative">
                                    <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl">
                                        <div className="card-body p-8">
                                            <h3 className="text-2xl font-bold text-center mb-6">
                                                What You Gain
                                            </h3>

                                            <div className="space-y-6">
                                                <div className="stat bg-base-100 rounded-lg p-4">
                                                    <div className="stat-title text-sm">
                                                        Average Monthly Earnings
                                                    </div>
                                                    <div className="stat-value text-primary text-3xl">
                                                        $8,500+
                                                    </div>
                                                    <div className="stat-desc">
                                                        From collaborative
                                                        placements
                                                    </div>
                                                </div>

                                                <div className="stat bg-base-100 rounded-lg p-4">
                                                    <div className="stat-title text-sm">
                                                        Time to First Placement
                                                    </div>
                                                    <div className="stat-value text-secondary text-3xl">
                                                        14 days
                                                    </div>
                                                    <div className="stat-desc">
                                                        Average for new recruiters
                                                    </div>
                                                </div>

                                                <div className="stat bg-base-100 rounded-lg p-4">
                                                    <div className="stat-title text-sm">
                                                        Network Reach
                                                    </div>
                                                    <div className="stat-value text-accent text-3xl">
                                                        2,500+
                                                    </div>
                                                    <div className="stat-desc">
                                                        Active recruiting partners
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center mt-8">
                                                <Link
                                                    href="/sign-up"
                                                    className="btn btn-primary btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                                >
                                                    <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                                                    Start Your Success Story
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-24 px-4 bg-base-200/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                                Your Path to Success
                            </h2>
                            <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
                                From signup to payout, here's exactly how the
                                process works for recruiters.
                            </p>
                        </div>

                        <div className="relative" data-animate-stagger>
                            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-primary/20 h-full"></div>

                            {processSteps.map((step, index) => (
                                <div
                                    key={step.step}
                                    className={`opacity-0 relative flex items-center mb-16 ${
                                        index % 2 === 0 ? "md:flex-row-reverse" : ""
                                    }`}
                                >
                                    <div
                                        className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pl-16" : "md:pr-16"}`}
                                    >
                                        <div className="card bg-base-100 shadow-lg hover:-translate-y-1 hover:shadow-lg transition-all">
                                            <div className="card-body">
                                                <div className="flex items-center mb-4">
                                                    <div className="text-primary text-3xl mr-3">
                                                        <i
                                                            className={`fa-duotone fa-regular ${step.icon}`}
                                                        ></i>
                                                    </div>
                                                    <div>
                                                        <div className="badge badge-primary badge-sm mb-1">
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
                                                <div className="bg-primary/5 p-3 rounded-lg">
                                                    <p className="text-sm text-primary font-medium">
                                                        {step.details}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary rounded-full items-center justify-center text-primary-content font-bold text-lg">
                                        {step.step}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/*
                TODO: Restore when we have real recruiter testimonials
                Success Stories Section
                */}

                {/* Remote Work Freedom Section */}
                <section className="py-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-8">
                                    Your Office is{" "}
                                    <span className="text-primary">Everywhere</span>
                                </h2>

                                <div className="space-y-6 text-lg text-base-content/80 leading-relaxed">
                                    <p>
                                        Whether you're a solo recruiter working from
                                        your home office, a small team operating
                                        from a co-working space, or an established
                                        recruiting firm with distributed talent,
                                        Splits Network empowers you to maximize your
                                        potential from anywhere in the world.{" "}
                                        <strong className="text-base-content">
                                            No corporate office required.
                                        </strong>
                                    </p>

                                    <p>
                                        Our cloud-based platform gives you instant
                                        access to thousands of high-quality
                                        opportunities, collaborative tools that
                                        connect you with top recruiters worldwide,
                                        and transparent earning structures that put
                                        more money in your pocket. Scale your
                                        recruiting business on your terms – whether
                                        that's from a coffee shop in downtown
                                        Seattle, a beachside villa in Costa Rica, or
                                        your kitchen table at 6 AM.
                                    </p>

                                    <div className="bg-primary/5 p-6 rounded-xl border-l-4 border-primary">
                                        <p className="font-medium text-primary mb-2">
                                            The future of recruiting is flexible
                                        </p>
                                        <p className="text-base">
                                            Join thousands of independent recruiters
                                            and recruiting teams who've discovered
                                            that the most successful placements
                                            happen when talent is free to work at
                                            their peak performance – wherever that
                                            might be.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                    <Link
                                        href="/sign-up"
                                        className="btn btn-primary btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-globe mr-2"></i>
                                        Start Working Remotely
                                    </Link>
                                    <Link
                                        href="/public/transparency"
                                        className="btn btn-outline btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                    >
                                        <i className="fa-duotone fa-regular fa-eye mr-2"></i>
                                        See Earning Potential
                                    </Link>
                                </div>
                            </div>

                            <div className="lg:order-first">
                                <div className="relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
                                        alt="Remote work from a beautiful beach location with laptop"
                                        className="rounded-2xl shadow-2xl w-full h-96 object-cover rounded"
                                    />
                                    <div className="absolute -bottom-6 -right-6 bg-secondary text-secondary-content p-4 rounded-xl shadow-lg">
                                        <div className="text-sm font-medium">
                                            Work From Anywhere
                                        </div>
                                        <div className="text-2xl font-bold">
                                            100% Remote
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 px-4 bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10">
                    <div className="max-w-7xl mx-auto text-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
                                Ready to Transform Your Recruiting Business?
                            </h2>
                            <p className="text-xl text-base-content/80 max-w-3xl mx-auto mb-12">
                                Join thousands of successful recruiters who've
                                increased their income through collaborative
                                placements. Start free today.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                                <Link
                                    href="/sign-up"
                                    className="btn btn-primary btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                >
                                    <i className="fa-duotone fa-regular fa-user-plus mr-2"></i>
                                    Start Your Free Account
                                </Link>
                                <Link
                                    href="/public/how-it-works"
                                    className="btn btn-outline btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                >
                                    <i className="fa-duotone fa-regular fa-circle-play mr-2"></i>
                                    Watch How It Works
                                </Link>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto" data-animate-stagger>
                                <div className="stat opacity-0">
                                    <div className="stat-title">Quick Setup</div>
                                    <div className="stat-value text-primary">
                                        5 min
                                    </div>
                                    <div className="stat-desc">
                                        From signup to first application
                                    </div>
                                </div>
                                <div className="stat opacity-0">
                                    <div className="stat-title">Zero Risk</div>
                                    <div className="stat-value text-secondary">
                                        $0
                                    </div>
                                    <div className="stat-desc">
                                        Start completely free forever
                                    </div>
                                </div>
                                <div className="stat opacity-0">
                                    <div className="stat-title">Support</div>
                                    <div className="stat-value text-accent">
                                        24/7
                                    </div>
                                    <div className="stat-desc">
                                        Expert recruiting support
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
