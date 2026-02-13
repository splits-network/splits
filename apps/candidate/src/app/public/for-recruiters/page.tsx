import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical } from "@/lib/seo";
import { ScrollAnimator } from "@/components/scroll-animator";

export const metadata: Metadata = {
    title: "For Recruiters - Applicant Network | Build Your Recruiting Practice",
    description:
        "Join Applicant Network as a recruiter and build a thriving practice. Access top talent, manage placements, and earn competitive fees. Sign up to become a verified recruiter today.",
    keywords:
        "recruiter platform, recruiting opportunities, placement fees, talent acquisition, recruiting network",
    openGraph: {
        title: "For Recruiters - Applicant Network | Build Your Recruiting Practice",
        description:
            "Join Applicant Network as a recruiter and build a thriving practice. Access top talent, manage placements, and earn competitive fees. Sign up to become a verified recruiter today.",
        url: "https://applicant.network/public/for-recruiters",
        type: "website",
    },
    ...buildCanonical("/public/for-recruiters"),
};

const benefits = [
    { icon: "fa-users", iconColor: "text-primary", bgColor: "bg-primary/10", title: "Access Top Talent", description: "Connect with thousands of pre-qualified candidates actively seeking opportunities in your specialized industries." },
    { icon: "fa-sack-dollar", iconColor: "text-secondary", bgColor: "bg-secondary/10", title: "Competitive Fees", description: "Earn industry-standard placement fees with transparent terms. Get paid quickly when your candidates are hired." },
    { icon: "fa-chart-line", iconColor: "text-accent", bgColor: "bg-accent/10", title: "Powerful Tools", description: "Manage your pipeline, track placements, and communicate with candidates—all in one intuitive platform." },
];

const howItWorksSteps = [
    { number: 1, color: "bg-primary", title: "Create Your Profile", description: "Sign up and showcase your expertise. Specify your industries, roles, and geographic focus. Complete verification to build trust with candidates.", features: ["Quick profile setup", "Highlight specializations", "Complete verification process", "Set your availability"] },
    { number: 2, color: "bg-secondary", title: "Post Jobs & Find Candidates", description: "Create job postings for your client companies. Browse our talent pool and get matched with candidates based on your specialization.", features: ["Post unlimited job openings", "Receive qualified applications", "Search candidate database", "AI-powered candidate matching"] },
    { number: 3, color: "bg-accent", title: "Make Placements & Get Paid", description: "Guide candidates through the hiring process. When they're hired, submit your placement and receive payment within days.", features: ["Track all placements in one dashboard", "Automated fee calculations", "Fast payment processing", "Build your success metrics"] },
];

const features = [
    { icon: "fa-briefcase", iconColor: "text-primary", title: "Job Management", description: "Create, edit, and manage unlimited job postings with rich descriptions and requirements." },
    { icon: "fa-user-check", iconColor: "text-secondary", title: "Candidate Tracking", description: "Track all candidate interactions, applications, and placement progress in real-time." },
    { icon: "fa-comments", iconColor: "text-accent", title: "Direct Messaging", description: "Communicate directly with candidates through our secure messaging platform." },
    { icon: "fa-file-invoice-dollar", iconColor: "text-success", title: "Payment Tracking", description: "Automated invoicing and payment tracking with transparent fee structures." },
    { icon: "fa-chart-simple", iconColor: "text-info", title: "Analytics & Reports", description: "Track your performance with detailed analytics on placements, earnings, and more." },
    { icon: "fa-mobile-screen", iconColor: "text-warning", title: "Mobile Access", description: "Manage your recruiting business on the go with our mobile-optimized platform." },
];

const pricingPoints = [
    { title: "Free to Join", description: "No signup fees or monthly subscriptions" },
    { title: "Competitive Placement Fees", description: "Earn industry-standard percentages on successful placements" },
    { title: "Fast Payouts", description: "Receive payment within 5 business days of placement verification" },
    { title: "No Hidden Fees", description: "What you see is what you get—100% transparent" },
];

const testimonials = [
    { initials: "JD", name: "Jessica Davis", role: "Tech Recruiter", quote: "Splits Network has transformed my recruiting practice. The platform is intuitive, and I'm connecting with top candidates every day." },
    { initials: "MR", name: "Michael Rodriguez", role: "Healthcare Recruiter", quote: "Best recruiting platform I've used. The tools are powerful, payments are fast, and candidates are high-quality." },
    { initials: "SP", name: "Sarah Park", role: "Finance Recruiter", quote: "I've tripled my placements since joining Splits Network. The candidate quality and platform features are unmatched." },
];

export default function ForRecruitersPage() {
    return (
        <ScrollAnimator>
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <section className="text-center mb-16">
                    <div className="badge badge-primary badge-lg mb-4">
                        <i className="fa-duotone fa-regular fa-user-tie mr-2"></i>
                        For Recruiting Professionals
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Build Your{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            Recruiting Practice
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-base-content/80 max-w-3xl mx-auto">
                        Splits Network is the premier platform where recruiters connect with top talent and build successful practices. Access thousands of pre-qualified candidates and manage your placements with powerful tools.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <a href="https://splits.network" className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                            <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                            Visit Splits Network
                        </a>
                        <Link href="/how-it-works" className="btn btn-outline btn-lg">
                            <i className="fa-duotone fa-regular fa-circle-info mr-2"></i>
                            Learn More
                        </Link>
                    </div>
                </section>

                <section className="mb-16" id="benefits">
                    <h2 className="text-4xl font-bold text-center mb-12">Why Join Splits Network?</h2>
                    <div className="grid md:grid-cols-3 gap-8" data-animate-stagger>
                        {benefits.map((benefit, index) => (
                            <div key={index} className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <div className={`w-16 h-16 rounded-full ${benefit.bgColor} flex items-center justify-center mb-4`}>
                                        <i className={`fa-duotone fa-regular ${benefit.icon} text-3xl ${benefit.iconColor}`}></i>
                                    </div>
                                    <h3 className="card-title">{benefit.title}</h3>
                                    <p className="text-base-content/80">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-16 bg-base-200 -mx-4 px-4 py-12" id="how-it-works">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
                        <div className="space-y-12">
                            {howItWorksSteps.map((step, index) => (
                                <div key={step.number} className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className={index % 2 === 1 ? "order-2" : ""}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white text-xl font-bold`}>{step.number}</div>
                                            <h3 className="text-2xl font-bold">{step.title}</h3>
                                        </div>
                                        <p className="text-lg text-base-content/80">{step.description}</p>
                                    </div>
                                    <div className={index % 2 === 1 ? "order-1" : ""}>
                                        <div className="card bg-base-100 shadow">
                                            <div className="card-body">
                                                <ul className="space-y-2">
                                                    {step.features.map((feature, fIndex) => (
                                                        <li key={fIndex} className="flex items-center gap-2">
                                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                                            <span className="text-sm">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-4xl font-bold text-center mb-12">Platform Features</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-animate-stagger>
                        {features.map((feature, index) => (
                            <div key={index} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-3 mb-2">
                                        <i className={`fa-duotone fa-regular ${feature.icon} text-2xl ${feature.iconColor}`}></i>
                                        <h3 className="card-title text-lg">{feature.title}</h3>
                                    </div>
                                    <p className="text-sm text-base-content/70">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-16 bg-base-200 -mx-4 px-4 py-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
                        <p className="text-xl text-base-content/80 mb-8">No upfront costs or monthly fees. You only pay when you successfully place a candidate.</p>
                        <div className="card bg-base-100 shadow max-w-2xl mx-auto">
                            <div className="card-body">
                                <h3 className="text-3xl font-bold mb-4">Performance-Based Model</h3>
                                <div className="divider"></div>
                                <ul className="space-y-4 text-left">
                                    {pricingPoints.map((point, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-check-circle text-success text-xl mt-1"></i>
                                            <div>
                                                <strong>{point.title}</strong>
                                                <p className="text-sm text-base-content/70">{point.description}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-4xl font-bold text-center mb-12">What Splits Network Recruiters Say</h2>
                    <div className="grid md:grid-cols-3 gap-8" data-animate-stagger>
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (<i key={i} className="fa-duotone fa-regular fa-star text-warning"></i>))}
                                    </div>
                                    <p className="text-base-content/80 italic mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar avatar-placeholder">
                                            <div className="bg-neutral text-neutral-content rounded-full w-12"><span>{testimonial.initials}</span></div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{testimonial.name}</div>
                                            <div className="text-sm text-base-content/60">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Grow Your Practice?</h2>
                        <p className="text-xl text-base-content/80 mb-8 max-w-2xl mx-auto">Join hundreds of successful recruiters who are building thriving practices on Splits Network</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="https://splits.network" className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                                <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                                Join Splits Network
                            </a>
                            <Link href="/contact" className="btn btn-outline btn-lg">
                                <i className="fa-duotone fa-regular fa-envelope mr-2"></i>
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </ScrollAnimator>
    );
}
