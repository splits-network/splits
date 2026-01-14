import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Careers',
    description: 'Join the team building the future of collaborative recruiting.',
};

export default function CareersPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="hero bg-gradient-to-r from-success to-info text-success-content py-20">
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Careers at Splits Network
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Join us in building the future of collaborative recruiting
                        </p>
                    </div>
                </div>
            </section>

            {/* Coming Soon Message */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-12">
                            <i className="fa-duotone fa-regular fa-rocket text-8xl text-primary opacity-20"></i>
                        </div>
                        <h2 className="text-4xl font-bold mb-6">Careers Page Coming Soon</h2>
                        <p className="text-xl text-base-content/70 mb-8 max-w-2xl mx-auto">
                            We're building something special at Splits Network, and we'll be looking for talented
                            individuals to join our team. Check back soon for open positions!
                        </p>
                        <div className="alert alert-info max-w-2xl mx-auto mb-8">
                            <i className="fa-duotone fa-regular fa-info-circle"></i>
                            <span>
                                Want to be notified when we start hiring? Send your resume and areas of interest
                                to careers@splits.network
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Work With Us */}
            <section className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center">Why Splits Network?</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="card bg-base-100 shadow">
                                <div className="card-body text-center">
                                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                        <i className="fa-duotone fa-regular fa-rocket text-primary text-2xl"></i>
                                    </div>
                                    <h3 className="card-title justify-center text-xl mb-3">Impact</h3>
                                    <p className="text-base-content/70">
                                        Build products that directly improve how thousands of recruiters and companies work together.
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow">
                                <div className="card-body text-center">
                                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                                        <i className="fa-duotone fa-regular fa-users text-secondary text-2xl"></i>
                                    </div>
                                    <h3 className="card-title justify-center text-xl mb-3">Culture</h3>
                                    <p className="text-base-content/70">
                                        Collaborative, transparent environment where your ideas and contributions matter.
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow">
                                <div className="card-body text-center">
                                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                                        <i className="fa-duotone fa-regular fa-chart-line text-accent text-2xl"></i>
                                    </div>
                                    <h3 className="card-title justify-center text-xl mb-3">Growth</h3>
                                    <p className="text-base-content/70">
                                        Join early and grow with the company. Opportunities to learn and lead.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Areas We're Building */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center">Areas We'll Be Hiring</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-200 shadow">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <i className="fa-duotone fa-regular fa-code text-primary"></i>
                                        Engineering
                                    </h3>
                                    <p className="text-sm text-base-content/70 mt-2">
                                        Full-stack engineers, backend specialists, DevOps, mobile developers
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-200 shadow">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <i className="fa-duotone fa-regular fa-palette text-secondary"></i>
                                        Design
                                    </h3>
                                    <p className="text-sm text-base-content/70 mt-2">
                                        Product designers, UX researchers, brand designers
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-200 shadow">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <i className="fa-duotone fa-regular fa-box text-accent"></i>
                                        Product
                                    </h3>
                                    <p className="text-sm text-base-content/70 mt-2">
                                        Product managers, product analysts, technical writers
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-200 shadow">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <i className="fa-duotone fa-regular fa-chart-line text-success"></i>
                                        Go-to-Market
                                    </h3>
                                    <p className="text-sm text-base-content/70 mt-2">
                                        Sales, marketing, customer success, partnerships
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-200 shadow">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <i className="fa-duotone fa-regular fa-headset text-info"></i>
                                        Support
                                    </h3>
                                    <p className="text-sm text-base-content/70 mt-2">
                                        Customer support specialists, community managers
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-200 shadow">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <i className="fa-duotone fa-regular fa-briefcase text-warning"></i>
                                        Operations
                                    </h3>
                                    <p className="text-sm text-base-content/70 mt-2">
                                        Finance, HR, legal, operations managers
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-neutral text-neutral-content">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center">What We Value</h2>
                        <div className="space-y-6">
                            <div className="card bg-base-100 text-base-content shadow">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <i className="fa-duotone fa-regular fa-lightbulb text-primary text-2xl mt-1"></i>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2">Ownership & Initiative</h3>
                                            <p className="text-base-content/70">
                                                We value team members who take ownership of problems and drive solutions forward.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-base-100 text-base-content shadow">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <i className="fa-duotone fa-regular fa-comments text-secondary text-2xl mt-1"></i>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2">Clear Communication</h3>
                                            <p className="text-base-content/70">
                                                We communicate openly, directly, and respectfully. Remote work requires great communication.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-base-100 text-base-content shadow">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <i className="fa-duotone fa-regular fa-user-group text-accent text-2xl mt-1"></i>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2">Customer Empathy</h3>
                                            <p className="text-base-content/70">
                                                Understand our users deeply. Build for their success, not just features on a roadmap.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-base-100 text-base-content shadow">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <i className="fa-duotone fa-regular fa-graduation-cap text-success text-2xl mt-1"></i>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2">Continuous Learning</h3>
                                            <p className="text-base-content/70">
                                                Stay curious, keep learning, and help others grow. We invest in development.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-content">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Interested in Joining?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Send your resume and tell us what excites you about Splits
                    </p>
                    <a href="mailto:careers@splits.network" className="btn btn-lg btn-neutral">
                        <i className="fa-duotone fa-regular fa-envelope"></i>
                        Email careers@splits.network
                    </a>
                    <p className="mt-6 text-sm opacity-75">
                        We'll reach out when relevant positions open up
                    </p>
                </div>
            </section>
        </>
    );
}
