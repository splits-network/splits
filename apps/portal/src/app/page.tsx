import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import Link from 'next/link';

export default async function HomePage() {

    return (
        <>
            <Header />
            {/* Hero Section */}
            <section className="hero min-h-[80vh] relative overflow-hidden">
                {/* Video Background */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                >
                    <source src="/ads.mp4" type="video/mp4" />
                </video>

                {/* Overlay */}
                <div className="absolute inset-0 bg-base-100/80"></div>

                {/* Content */}
                <div className="hero-content text-center max-w-5xl relative z-10 py-20">
                    <div className="space-y-8">
                        <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
                            A recruiting network where
                            <br />
                            everyone wins on the placement
                        </h1>
                        <p className="text-lg md:text-xl text-base-content/80 max-w-2xl mx-auto leading-relaxed">
                            Companies post roles. Recruiters bring candidates. When someone gets hired, everyone gets their split.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link href="/sign-up" className="btn btn-primary btn-lg">
                                <i className="fa-solid fa-user-tie"></i>
                                Join as a Recruiter
                            </Link>
                            <Link href="#for-companies" className="btn btn-outline btn-lg">
                                <i className="fa-solid fa-building"></i>
                                Post Roles as a Company
                            </Link>
                        </div>
                        <div className="text-sm text-base-content/60 pt-4">
                            Built by recruiters. Designed for transparent splits.
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section - Dual Track */}
            <section id="how-it-works" className="py-20 bg-neutral text-neutral-content">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-lg opacity-70">
                            Simple steps for recruiters and companies
                        </p>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
                        {/* For Recruiters Track */}
                        <div>
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <i className="fa-solid fa-user-tie"></i>
                                For Recruiters
                            </h3>
                            <div className="space-y-6">
                                <div className="card bg-base-100 text-base-content shadow">
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xl font-bold text-primary">1</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-2">Join the Network</h4>
                                                <p className="opacity-70">
                                                    Choose roles in your niche and expertise areas.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card bg-base-100 text-base-content shadow">
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xl font-bold text-primary">2</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-2">Submit Candidates</h4>
                                                <p className="opacity-70">
                                                    Submit qualified candidates into a clean ATS pipeline.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card bg-base-100 text-base-content shadow">
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xl font-bold text-primary">3</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-2">Get Paid Your Split</h4>
                                                <p className="opacity-70">
                                                    Receive your split when they're hired, tracked transparently.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* For Companies Track */}
                        <div>
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <i className="fa-solid fa-building"></i>
                                For Companies
                            </h3>
                            <div className="space-y-6">
                                <div className="card bg-base-100 text-base-content shadow">
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xl font-bold text-secondary">1</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-2">Post Open Roles</h4>
                                                <p className="opacity-70">
                                                    List positions with clear fees and requirements.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card bg-base-100 text-base-content shadow">
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xl font-bold text-secondary">2</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-2">Access Vetted Recruiters</h4>
                                                <p className="opacity-70">
                                                    Tap into a network of specialized recruiting professionals.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card bg-base-100 text-base-content shadow">
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xl font-bold text-secondary">3</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-2">Pay Only on Hire</h4>
                                                <p className="opacity-70">
                                                    Full placement transparency with clear fee structures.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Splits Network Is Different */}
            <section className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Why Splits Network Is Different</h2>
                        <p className="text-lg text-base-content/70">
                            Built for split placements, not retrofitted
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-solid fa-handshake text-primary"></i>
                                    Split-First by Design
                                </h3>
                                <p className="text-base-content/70">
                                    The platform is built around split placements, not retrofitted for them.
                                </p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-solid fa-sitemap text-secondary"></i>
                                    Built-in ATS
                                </h3>
                                <p className="text-base-content/70">
                                    Jobs, candidates, stages, and placements all in one place.
                                </p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-solid fa-chart-line text-accent"></i>
                                    Real-Time Pipelines
                                </h3>
                                <p className="text-base-content/70">
                                    Everyone sees where each candidate stands in the process.
                                </p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-solid fa-file-invoice-dollar text-primary"></i>
                                    Transparent Fees & Splits
                                </h3>
                                <p className="text-base-content/70">
                                    Clear view of fee %, recruiter share, and platform share.
                                </p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-solid fa-crown text-secondary"></i>
                                    Subscription-Friendly
                                </h3>
                                <p className="text-base-content/70">
                                    Predictable access to roles and higher payout percentages on paid tiers.
                                </p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-solid fa-shield-halved text-accent"></i>
                                    Admin Controls
                                </h3>
                                <p className="text-base-content/70">
                                    Control who sees which roles and how splits are handled.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Recruiters Section */}
            <section id="for-recruiters" className="py-20 bg-primary text-primary-content">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">
                                Turn your relationships into recurring placements
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-check-circle text-xl flex-shrink-0 mt-1"></i>
                                    <p>
                                        Access curated roles you don't have to hunt down yourself
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-check-circle text-xl flex-shrink-0 mt-1"></i>
                                    <p>
                                        Work only the roles that fit your niche and strengths
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-check-circle text-xl flex-shrink-0 mt-1"></i>
                                    <p>
                                        Track all candidates and submissions in a single pipeline
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-check-circle text-xl flex-shrink-0 mt-1"></i>
                                    <p>
                                        See your placements and earnings clearly, with no mystery math
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-check-circle text-xl flex-shrink-0 mt-1"></i>
                                    <p>
                                        Grow your business with a network that brings roles to you
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8">
                                <Link href="/sign-up" className="btn btn-neutral btn-lg">
                                    <i className="fa-solid fa-user-tie"></i>
                                    Become a Network Recruiter
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="card bg-base-100 text-base-content shadow">
                                <div className="card-body">
                                    <div className="text-sm opacity-60 mb-2">Recruiter Dashboard Preview</div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                                            <span>Senior Software Engineer</span>
                                            <span className="badge badge-primary">Active</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                                            <span>Product Manager</span>
                                            <span className="badge badge-secondary">Interviewing</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                                            <span>UX Designer</span>
                                            <span className="badge badge-success">Offer Stage</span>
                                        </div>
                                        <div className="divider"></div>
                                        <div className="stats bg-base-200 shadow">
                                            <div className="stat p-3">
                                                <div className="stat-title text-xs">This Month</div>
                                                <div className="stat-value text-2xl text-primary">$12,450</div>
                                                <div className="stat-desc">3 placements</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Companies Section */}
            <section id="for-companies" className="py-20 bg-secondary text-secondary-content">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                        <div className="order-2 lg:order-1 relative">
                            <div className="card bg-base-100 text-base-content shadow">
                                <div className="card-body">
                                    <div className="text-sm opacity-60 mb-2">Company Roles Dashboard</div>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-base-200 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold">Backend Engineer</div>
                                                    <div className="text-sm opacity-60">San Francisco, CA</div>
                                                </div>
                                                <span className="badge badge-success">5 candidates</span>
                                            </div>
                                            <div className="flex gap-2 text-xs">
                                                <span className="badge badge-sm">3 recruiters</span>
                                                <span className="badge badge-sm">20% fee</span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-base-200 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold">Sales Director</div>
                                                    <div className="text-sm opacity-60">Remote</div>
                                                </div>
                                                <span className="badge badge-info">2 candidates</span>
                                            </div>
                                            <div className="flex gap-2 text-xs">
                                                <span className="badge badge-sm">2 recruiters</span>
                                                <span className="badge badge-sm">25% fee</span>
                                            </div>
                                        </div>
                                        <div className="divider"></div>
                                        <div className="text-center text-sm opacity-60">
                                            Manage all your external recruiters in one place
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <h2 className="text-4xl font-bold mb-6">
                                A network of recruiters, one simple platform
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-check-circle text-xl flex-shrink-0 mt-1"></i>
                                    <p>
                                        Manage all your external recruiters in one place
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-check-circle text-xl flex-shrink-0 mt-1"></i>
                                    <p>
                                        Get clear visibility into pipelines for every role
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-check-circle text-xl flex-shrink-0 mt-1"></i>
                                    <p>
                                        Keep fees and terms consistent and transparent
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-check-circle text-xl flex-shrink-0 mt-1"></i>
                                    <p>
                                        Pay only on hire; no retainers unless you choose to set them up
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-check-circle text-xl flex-shrink-0 mt-1"></i>
                                    <p>
                                        Simplify communication, reduce email and spreadsheet chaos
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8">
                                <Link href="/sign-up" className="btn btn-neutral btn-lg">
                                    <i className="fa-solid fa-building"></i>
                                    Post a Role
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How Money Flows */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">How Money Flows – The Split Model</h2>
                        <p className="text-lg text-base-content/70">
                            Clear terms. No surprise clawbacks from the platform.
                        </p>
                    </div>
                    <div className="max-w-5xl mx-auto">
                        {/* Flow Diagram */}
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-12">
                            <div className="card bg-primary text-primary-content shadow w-full lg:w-auto">
                                <div className="card-body items-center text-center">
                                    <i className="fa-solid fa-building text-4xl mb-2"></i>
                                    <h3 className="card-title">Company</h3>
                                    <p className="text-sm">Pays placement fee</p>
                                </div>
                            </div>
                            <i className="fa-solid fa-arrow-right text-3xl text-primary rotate-90 lg:rotate-0"></i>
                            <div className="card bg-secondary text-secondary-content shadow w-full lg:w-auto">
                                <div className="card-body items-center text-center">
                                    <i className="fa-solid fa-handshake text-4xl mb-2"></i>
                                    <h3 className="card-title">Splits Network</h3>
                                    <p className="text-sm">Platform share</p>
                                </div>
                            </div>
                            <i className="fa-solid fa-arrow-right text-3xl text-secondary rotate-90 lg:rotate-0"></i>
                            <div className="card bg-accent text-accent-content shadow w-full lg:w-auto">
                                <div className="card-body items-center text-center">
                                    <i className="fa-solid fa-user-tie text-4xl mb-2"></i>
                                    <h3 className="card-title">Recruiter</h3>
                                    <p className="text-sm">Recruiter share</p>
                                </div>
                            </div>
                        </div>

                        {/* Example Breakdown */}
                        <div className="card bg-base-200 shadow">
                            <div className="card-body">
                                <h3 className="card-title justify-center mb-4">Example Placement</h3>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary mb-2">$120,000</div>
                                        <div className="text-sm opacity-70">Candidate Salary</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-secondary mb-2">$24,000</div>
                                        <div className="text-sm opacity-70">Placement Fee (20%)</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-accent mb-2">$18,000</div>
                                        <div className="text-sm opacity-70">Recruiter Share (75%)</div>
                                    </div>
                                </div>
                                <div className="divider"></div>
                                <p className="text-center text-sm opacity-70">
                                    Platform share: $6,000 (25%) • Recruiter receives $18,000
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Features Overview</h2>
                        <p className="text-lg text-base-content/70">
                            Everything you need for split placements
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        <div className="card bg-base-100 shadow hover:shadow transition-shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-solid fa-sitemap text-primary"></i>
                                    ATS Foundation
                                </h3>
                                <p className="text-base-content/70">
                                    Manage roles, candidates, stages, and notes all in one place.
                                </p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow hover:shadow transition-shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-solid fa-chart-pie text-secondary"></i>
                                    Split Placement Engine
                                </h3>
                                <p className="text-base-content/70">
                                    Log placements, calculate fees, and track recruiter shares.
                                </p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow hover:shadow transition-shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-solid fa-users text-accent"></i>
                                    Recruiter Network
                                </h3>
                                <p className="text-base-content/70">
                                    Assign roles to recruiters and control access to opportunities.
                                </p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow hover:shadow transition-shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-solid fa-crown text-primary"></i>
                                    Subscriptions & Plans
                                </h3>
                                <p className="text-base-content/70">
                                    Simple subscription tiers with higher visibility and payouts.
                                </p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow hover:shadow transition-shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-solid fa-bell text-secondary"></i>
                                    Smart Notifications
                                </h3>
                                <p className="text-base-content/70">
                                    Email notifications for key events like submissions and hires.
                                </p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow hover:shadow transition-shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-solid fa-shield-halved text-accent"></i>
                                    Admin Console
                                </h3>
                                <p className="text-base-content/70">
                                    Approve recruiters, manage companies, and oversee placements.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-accent text-accent-content">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Trusted by Recruiters</h2>
                        <p className="text-lg opacity-70">
                            See what our community has to say
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="card bg-base-100 text-base-content shadow">
                            <div className="card-body">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="rating">
                                        <i className="fa-solid fa-star text-warning"></i>
                                        <i className="fa-solid fa-star text-warning"></i>
                                        <i className="fa-solid fa-star text-warning"></i>
                                        <i className="fa-solid fa-star text-warning"></i>
                                        <i className="fa-solid fa-star text-warning"></i>
                                    </div>
                                </div>
                                <p className="mb-4">
                                    "We replaced three spreadsheets and a Slack mess with Splits  Finally, all my split deals in one place."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="avatar avatar-placeholder">
                                        <div className="bg-primary text-primary-content rounded-full w-12">
                                            <span>SJ</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold">Sarah Johnson</div>
                                        <div className="text-sm text-base-content/60">Tech Recruiter</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card bg-base-100 text-base-content shadow">
                            <div className="card-body">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="rating">
                                        <i className="fa-solid fa-star text-warning"></i>
                                        <i className="fa-solid fa-star text-warning"></i>
                                        <i className="fa-solid fa-star text-warning"></i>
                                        <i className="fa-solid fa-star text-warning"></i>
                                        <i className="fa-solid fa-star text-warning"></i>
                                    </div>
                                </div>
                                <p className="mb-4">
                                    "As a company, this platform gave us access to specialized recruiters we couldn't afford to hire full-time. Game changer."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="avatar avatar-placeholder">
                                        <div className="bg-secondary text-secondary-content rounded-full w-12">
                                            <span>MC</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold">Michael Chen</div>
                                        <div className="text-sm text-base-content/60">Head of Talent</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card bg-base-100 text-base-content shadow">
                            <div className="card-body">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="rating">
                                        <i className="fa-solid fa-star text-warning"></i>
                                        <i className="fa-solid fa-star text-warning"></i>
                                        <i className="fa-solid fa-star text-warning"></i>
                                        <i className="fa-solid fa-star text-warning"></i>
                                        <i className="fa-solid fa-star text-warning"></i>
                                    </div>
                                </div>
                                <p className="mb-4">
                                    "The transparency and fair fee splits make this the only platform I use for split placements now. Highly recommended!"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="avatar avatar-placeholder">
                                        <div className="bg-accent text-accent-content rounded-full w-12">
                                            <span>ER</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold">Emily Rodriguez</div>
                                        <div className="text-sm text-base-content/60">Healthcare Recruiter</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-lg text-base-content/70">
                            Common questions about Splits Network
                        </p>
                    </div>
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="collapse collapse-plus bg-base-100 shadow">
                            <input type="radio" name="faq-accordion" defaultChecked />
                            <div className="collapse-title text-xl font-medium">
                                How do splits actually work on Splits Network?
                            </div>
                            <div className="collapse-content">
                                <p className="text-base-content/70">
                                    When a candidate is hired, the company pays a placement fee (typically 15-25% of salary).
                                    The platform takes a small percentage, and the recruiter receives the majority of the fee.
                                    All terms are agreed upon upfront and tracked transparently in your dashboard.
                                </p>
                            </div>
                        </div>
                        <div className="collapse collapse-plus bg-base-100 shadow">
                            <input type="radio" name="faq-accordion" />
                            <div className="collapse-title text-xl font-medium">
                                Who owns the candidate and relationship?
                            </div>
                            <div className="collapse-content">
                                <p className="text-base-content/70">
                                    The recruiter who submits the candidate maintains their relationship. Splits Network is the
                                    administrative platform that coordinates the placement process, but recruiters own their
                                    candidate relationships and company connections.
                                </p>
                            </div>
                        </div>
                        <div className="collapse collapse-plus bg-base-100 shadow">
                            <input type="radio" name="faq-accordion" />
                            <div className="collapse-title text-xl font-medium">
                                How do payouts work today? Is Splits Network handling the money?
                            </div>
                            <div className="collapse-content">
                                <p className="text-base-content/70">
                                    In Phase 1, Splits Network tracks the placement and splits but doesn't process payments directly.
                                    Companies pay recruiters according to their agreements, and the platform provides the tracking and
                                    documentation. Payment processing features will be added in future phases.
                                </p>
                            </div>
                        </div>
                        <div className="collapse collapse-plus bg-base-100 shadow">
                            <input type="radio" name="faq-accordion" />
                            <div className="collapse-title text-xl font-medium">
                                Can I bring my existing companies/recruiters onto the platform?
                            </div>
                            <div className="collapse-content">
                                <p className="text-base-content/70">
                                    Absolutely! You can invite your existing network to join Splits  Companies can post their
                                    roles, and you can collaborate with recruiters you already know and trust, all within one platform.
                                </p>
                            </div>
                        </div>
                        <div className="collapse collapse-plus bg-base-100 shadow">
                            <input type="radio" name="faq-accordion" />
                            <div className="collapse-title text-xl font-medium">
                                What does it cost for recruiters? What does it cost for companies?
                            </div>
                            <div className="collapse-content">
                                <p className="text-base-content/70">
                                    Recruiters pay a monthly subscription based on their tier (Starter, Pro, Partner).
                                    Companies post roles for free and pay only when a hire is made. The platform takes a small
                                    percentage of the placement fee, clearly disclosed upfront.
                                </p>
                            </div>
                        </div>
                        <div className="collapse collapse-plus bg-base-100 shadow">
                            <input type="radio" name="faq-accordion" />
                            <div className="collapse-title text-xl font-medium">
                                Do I have to switch away from my current ATS?
                            </div>
                            <div className="collapse-content">
                                <p className="text-base-content/70">
                                    No. Splits Network works alongside your existing systems. You can use it specifically for
                                    split placements and collaborative recruiting while keeping your primary ATS for direct hires
                                    and internal processes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="pricing" className="py-20 bg-neutral text-neutral-content">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to run your split deals on rails?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Stop juggling spreadsheets and side email threads. Give your split placements a proper home.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/sign-up" className="btn btn-lg btn-primary">
                            <i className="fa-solid fa-user-tie"></i>
                            I'm a Recruiter
                        </Link>
                        <Link href="/sign-up" className="btn btn-lg btn-secondary">
                            <i className="fa-solid fa-building"></i>
                            I'm a Company
                        </Link>
                    </div>
                    <p className="mt-8 text-sm opacity-75 max-w-2xl mx-auto">
                        Splits Network is for people who believe in fair, transparent, and scalable recruiting partnerships.
                    </p>
                </div>
            </section>
            <Footer />
        </>
    );
}
