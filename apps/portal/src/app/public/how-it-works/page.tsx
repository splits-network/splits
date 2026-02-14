import type { Metadata } from "next";
import Link from "next/link";
import { ScrollAnimator } from "@/components/scroll-animator";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "How It Works",
    description:
        "See how Splits Network connects recruiters and companies for split placements, from role setup and submissions through interviews, hires, and payout tracking.",
    openGraph: {
        title: "How It Works",
        description:
            "See how Splits Network connects recruiters and companies for split placements, from role setup and submissions through interviews, hires, and payout tracking.",
        url: "https://splits.network/public/how-it-works",
    },
    ...buildCanonical("/public/how-it-works"),
};

const recruiterSteps = [
    {
        number: 1,
        title: "Sign Up & Choose Your Plan",
        description:
            "Create your account and select the subscription tier that matches your business. Higher tiers unlock better payout percentages and priority access to roles.",
        badges: [
            { text: "Quick signup", variant: "primary" },
            { text: "Starter: 65% share", variant: "primary" },
            { text: "Pro: 75% share", variant: "primary" },
            { text: "Partner: 85% share", variant: "primary" },
        ],
    },
    {
        number: 2,
        title: "Browse Available Roles",
        description:
            "View all open positions that match your expertise. See job details, compensation ranges, placement fee percentages, and company information—all upfront and transparent.",
        badges: [
            { text: "Filter by industry", variant: "secondary" },
            { text: "See fee structures", variant: "secondary" },
            { text: "Priority access for Pro+", variant: "secondary" },
        ],
    },
    {
        number: 3,
        title: "Submit Qualified Candidates",
        description:
            "Upload candidate information, including resume and profile details. Your submissions go directly into the company's pipeline, and you can track their progress in real-time.",
        badges: [
            { text: "Simple submission form", variant: "accent" },
            { text: "Real-time status updates", variant: "accent" },
            { text: "Communication tools", variant: "accent" },
        ],
    },
    {
        number: 4,
        title: "Track Candidate Progress",
        description:
            "Monitor your candidates through each stage of the hiring process. Get notified when they move forward, and see exactly where they stand in the company's pipeline.",
        badges: [
            { text: "Stage tracking", variant: "info" },
            { text: "Email notifications", variant: "info" },
            { text: "Activity history", variant: "info" },
        ],
    },
    {
        number: 5,
        title: "Get Paid on Placement",
        description:
            "When your candidate is hired, the placement is logged and your share is calculated automatically. See transparent breakdowns of the fee, your percentage, and earnings history.",
        badges: [
            { text: "Automatic calculation", variant: "success-content" },
            { text: "Transparent splits", variant: "success-content" },
            { text: "Earnings dashboard", variant: "success-content" },
        ],
        isSuccess: true,
    },
];

const companySteps = [
    {
        number: 1,
        title: "Create Your Company Account",
        description:
            "Sign up for free and set up your company profile. No credit card required—you only pay when you make a successful hire.",
        badges: [
            { text: "Free forever", variant: "secondary" },
            { text: "No credit card", variant: "secondary" },
            { text: "5-minute setup", variant: "secondary" },
        ],
    },
    {
        number: 2,
        title: "Post Your Open Roles",
        description:
            "Create job postings with clear requirements, compensation ranges, and set your placement fee percentage (typically 15-25%). Control which recruiters can see each role.",
        badges: [
            { text: "Unlimited postings", variant: "primary" },
            { text: "Set your own fees", variant: "primary" },
            { text: "Control visibility", variant: "primary" },
        ],
    },
    {
        number: 3,
        title: "Receive Candidate Submissions",
        description:
            "Specialized recruiters submit qualified candidates directly into your ATS pipeline. All submissions are organized by role with recruiter information attached.",
        badges: [
            { text: "Vetted recruiters", variant: "accent" },
            { text: "Organized pipeline", variant: "accent" },
            { text: "Quality candidates", variant: "accent" },
        ],
    },
    {
        number: 4,
        title: "Manage Your Hiring Pipeline",
        description:
            "Review candidates, schedule interviews, and move them through stages—all within the platform. Recruiters stay informed automatically as candidates progress.",
        badges: [
            { text: "Full ATS functionality", variant: "info" },
            { text: "Stage management", variant: "info" },
            { text: "Auto notifications", variant: "info" },
        ],
    },
    {
        number: 5,
        title: "Hire & Pay on Success",
        description:
            "When you hire a candidate, log the placement with salary details. The platform calculates the fee automatically, and splits are tracked transparently. Pay only on successful hires.",
        badges: [
            { text: "Pay only on hire", variant: "success-content" },
            { text: "Transparent fees", variant: "success-content" },
            { text: "Easy tracking", variant: "success-content" },
        ],
        isSuccess: true,
    },
];

export default function HowItWorksPage() {
    return (
        <ScrollAnimator>
            {/* Hero Section */}
            <section className="hero bg-accent text-accent-content py-20 overflow-hidden">
                <div className="hero-content text-center max-w-5xl opacity-0">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            How Splits Network Works
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            A simple, transparent process for companies and
                            recruiters to work together on placements
                        </p>
                    </div>
                </div>
            </section>

            {/* Overview Section */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto text-center mb-16 opacity-0">
                        <h2 className="text-3xl font-bold mb-6">
                            The Split Placement Model
                        </h2>
                        <p className="text-lg text-base-content/70 max-w-3xl mx-auto">
                            Splits Network connects companies who need talent
                            with specialized recruiters who know where to find
                            it. When a hire is made, everyone gets their fair
                            share—transparently and automatically.
                        </p>
                    </div>

                    {/* Visual Flow */}
                    <div
                        className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-6xl mx-auto"
                        data-animate-stagger
                    >
                        <div className="card bg-primary text-primary-content shadow w-full lg:w-64 opacity-0">
                            <div className="card-body items-center text-center p-6">
                                <i className="fa-duotone fa-regular fa-building text-5xl mb-3"></i>
                                <h3 className="card-title text-lg">
                                    Company Posts Role
                                </h3>
                                <p className="text-sm opacity-90">
                                    Lists job with fee structure
                                </p>
                            </div>
                        </div>

                        <i className="fa-duotone fa-regular fa-arrow-right text-4xl text-primary rotate-90 lg:rotate-0 opacity-0"></i>

                        <div className="card bg-secondary text-secondary-content shadow w-full lg:w-64 opacity-0">
                            <div className="card-body items-center text-center p-6">
                                <i className="fa-duotone fa-regular fa-user-tie text-5xl mb-3"></i>
                                <h3 className="card-title text-lg">
                                    Recruiter Submits
                                </h3>
                                <p className="text-sm opacity-90">
                                    Presents qualified candidate
                                </p>
                            </div>
                        </div>

                        <i className="fa-duotone fa-regular fa-arrow-right text-4xl text-secondary rotate-90 lg:rotate-0 opacity-0"></i>

                        <div className="card bg-success text-success-content shadow w-full lg:w-64 opacity-0">
                            <div className="card-body items-center text-center p-6">
                                <i className="fa-duotone fa-regular fa-handshake text-5xl mb-3"></i>
                                <h3 className="card-title text-lg">
                                    Hire & Pay
                                </h3>
                                <p className="text-sm opacity-90">
                                    Everyone gets their split
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Recruiters Process */}
            <section className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 opacity-0">
                            <h2 className="text-4xl font-bold mb-4">
                                <i className="fa-duotone fa-regular fa-user-tie text-primary"></i>{" "}
                                For Recruiters
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Your journey from joining to earning
                            </p>
                        </div>

                        <div
                            className="space-y-12"
                            data-animate-stagger
                        >
                            {recruiterSteps.map((step) => (
                                <div
                                    key={step.number}
                                    className={`card shadow hover:-translate-y-1 hover:shadow-lg transition-all opacity-0 ${
                                        step.isSuccess
                                            ? "bg-success text-success-content"
                                            : "bg-base-100"
                                    }`}
                                >
                                    <div className="card-body">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            <div className="flex-shrink-0">
                                                <div
                                                    className={`w-20 h-20 rounded-full flex items-center justify-center ${
                                                        step.isSuccess
                                                            ? "bg-success-content/20"
                                                            : "bg-primary/20"
                                                    }`}
                                                >
                                                    <span
                                                        className={`text-3xl font-bold ${
                                                            step.isSuccess
                                                                ? ""
                                                                : "text-primary"
                                                        }`}
                                                    >
                                                        {step.number}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-2xl font-bold mb-3">
                                                    {step.title}
                                                </h3>
                                                <p
                                                    className={`mb-4 ${
                                                        step.isSuccess
                                                            ? "opacity-90"
                                                            : "text-base-content/70"
                                                    }`}
                                                >
                                                    {step.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {step.badges.map(
                                                        (badge, index) => (
                                                            <span
                                                                key={index}
                                                                className={`badge badge-${badge.variant}`}
                                                            >
                                                                {badge.text}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* For Companies Process */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 opacity-0">
                            <h2 className="text-4xl font-bold mb-4">
                                <i className="fa-duotone fa-regular fa-building text-secondary"></i>{" "}
                                For Companies
                            </h2>
                            <p className="text-lg text-base-content/70">
                                From posting to hiring in five simple steps
                            </p>
                        </div>

                        <div
                            className="space-y-12"
                            data-animate-stagger
                        >
                            {companySteps.map((step) => (
                                <div
                                    key={step.number}
                                    className={`card shadow hover:-translate-y-1 hover:shadow-lg transition-all opacity-0 ${
                                        step.isSuccess
                                            ? "bg-success text-success-content"
                                            : "bg-base-200"
                                    }`}
                                >
                                    <div className="card-body">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            <div className="flex-shrink-0">
                                                <div
                                                    className={`w-20 h-20 rounded-full flex items-center justify-center ${
                                                        step.isSuccess
                                                            ? "bg-success-content/20"
                                                            : "bg-secondary/20"
                                                    }`}
                                                >
                                                    <span
                                                        className={`text-3xl font-bold ${
                                                            step.isSuccess
                                                                ? ""
                                                                : "text-secondary"
                                                        }`}
                                                    >
                                                        {step.number}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-2xl font-bold mb-3">
                                                    {step.title}
                                                </h3>
                                                <p
                                                    className={`mb-4 ${
                                                        step.isSuccess
                                                            ? "opacity-90"
                                                            : "text-base-content/70"
                                                    }`}
                                                >
                                                    {step.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {step.badges.map(
                                                        (badge, index) => (
                                                            <span
                                                                key={index}
                                                                className={`badge badge-${badge.variant}`}
                                                            >
                                                                {badge.text}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Money Flow Section */}
            <section className="py-20 bg-neutral text-neutral-content overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12 opacity-0">
                            <h2 className="text-4xl font-bold mb-4">
                                Understanding the Money Flow
                            </h2>
                            <p className="text-lg opacity-80">
                                Crystal clear fee structure with no hidden
                                surprises
                            </p>
                        </div>

                        {/* Example Calculation */}
                        <div className="card bg-base-100 text-base-content shadow opacity-0">
                            <div className="card-body p-8">
                                <h3 className="text-2xl font-bold mb-6 text-center">
                                    Example Placement Breakdown
                                </h3>

                                <div
                                    className="grid md:grid-cols-4 gap-6 mb-8"
                                    data-animate-stagger
                                >
                                    <div className="text-center p-4 bg-base-200 rounded-lg opacity-0">
                                        <div className="text-3xl font-bold text-primary mb-2">
                                            $120,000
                                        </div>
                                        <div className="text-sm text-base-content/70">
                                            Candidate Salary
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-base-200 rounded-lg opacity-0">
                                        <div className="text-3xl font-bold text-secondary mb-2">
                                            20%
                                        </div>
                                        <div className="text-sm text-base-content/70">
                                            Placement Fee
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-base-200 rounded-lg opacity-0">
                                        <div className="text-3xl font-bold text-accent mb-2">
                                            $24,000
                                        </div>
                                        <div className="text-sm text-base-content/70">
                                            Total Fee Amount
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-base-200 rounded-lg opacity-0">
                                        <div className="text-3xl font-bold text-success mb-2">
                                            75%
                                        </div>
                                        <div className="text-sm text-base-content/70">
                                            Recruiter Share (Pro)
                                        </div>
                                    </div>
                                </div>

                                <div className="divider">SPLIT</div>

                                <div
                                    className="grid md:grid-cols-2 gap-6"
                                    data-animate-stagger
                                >
                                    <div className="text-center p-6 bg-success/10 rounded-lg border-2 border-success opacity-0">
                                        <i className="fa-duotone fa-regular fa-user-tie text-4xl text-success mb-3"></i>
                                        <div className="text-3xl font-bold text-success mb-2">
                                            $18,000
                                        </div>
                                        <div className="text-sm">
                                            Recruiter Receives
                                        </div>
                                    </div>
                                    <div className="text-center p-6 bg-secondary/10 rounded-lg border-2 border-secondary opacity-0">
                                        <i className="fa-duotone fa-regular fa-handshake text-4xl text-secondary mb-3"></i>
                                        <div className="text-3xl font-bold text-secondary mb-2">
                                            $6,000
                                        </div>
                                        <div className="text-sm">
                                            Platform Share
                                        </div>
                                    </div>
                                </div>

                                <div className="alert alert-info mt-6">
                                    <i className="fa-duotone fa-regular fa-info-circle"></i>
                                    <span className="text-sm">
                                        Platform share covers infrastructure,
                                        support, payment processing, and
                                        continued development. Your percentage
                                        increases with higher subscription
                                        tiers.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-content overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <div className="opacity-0">
                        <h2 className="text-4xl font-bold mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Join the platform that makes split placements
                            simple, transparent, and profitable for everyone.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/sign-up"
                            className="btn btn-lg btn-neutral hover:scale-105 transition-all opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-user-tie"></i>
                            I'm a Recruiter
                        </Link>
                        <Link
                            href="/sign-up"
                            className="btn btn-lg btn-secondary hover:scale-105 transition-all opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-building"></i>
                            I'm a Company
                        </Link>
                    </div>
                </div>
            </section>
        </ScrollAnimator>
    );
}
