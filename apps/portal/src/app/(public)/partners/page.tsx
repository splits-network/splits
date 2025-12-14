import Link from 'next/link';

export default function PartnersPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="hero bg-gradient-to-r from-secondary to-accent text-secondary-content py-20">
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Partner With Us
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Join our partner ecosystem and help build the future of collaborative recruiting
                        </p>
                    </div>
                </div>
            </section>

            {/* Partner Program Overview */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6">Why Partner With Splits Network?</h2>
                        <p className="text-lg text-base-content/70 max-w-3xl mx-auto">
                            We're building more than a platform—we're creating an ecosystem. Whether you're a 
                            recruiting firm, technology provider, or industry association, there's a place for you 
                            in our partner network.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="card bg-base-200 shadow-xl">
                            <div className="card-body text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-solid fa-users text-primary text-2xl"></i>
                                </div>
                                <h3 className="card-title justify-center text-xl mb-3">Recruiting Firms</h3>
                                <p className="text-base-content/70 text-sm">
                                    White-label solutions, team management, and revenue sharing opportunities for 
                                    established recruiting organizations.
                                </p>
                            </div>
                        </div>
                        <div className="card bg-base-200 shadow-xl">
                            <div className="card-body text-center">
                                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-solid fa-plug text-secondary text-2xl"></i>
                                </div>
                                <h3 className="card-title justify-center text-xl mb-3">Technology Partners</h3>
                                <p className="text-base-content/70 text-sm">
                                    Integrate your tools with our platform through our API, create custom workflows, 
                                    and reach our growing user base.
                                </p>
                            </div>
                        </div>
                        <div className="card bg-base-200 shadow-xl">
                            <div className="card-body text-center">
                                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-solid fa-handshake text-accent text-2xl"></i>
                                </div>
                                <h3 className="card-title justify-center text-xl mb-3">Associations</h3>
                                <p className="text-base-content/70 text-sm">
                                    Special pricing for members, co-branded experiences, and collaboration on 
                                    industry education and best practices.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partner Benefits */}
            <section className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center">Partner Benefits</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="card bg-base-100 shadow-lg">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <i className="fa-solid fa-dollar-sign text-success"></i>
                                        Revenue Opportunities
                                    </h3>
                                    <ul className="space-y-2 mt-4">
                                        <li className="flex items-start gap-2">
                                            <i className="fa-solid fa-check text-success mt-1"></i>
                                            <span>Revenue sharing on referrals</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-solid fa-check text-success mt-1"></i>
                                            <span>White-label licensing opportunities</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-solid fa-check text-success mt-1"></i>
                                            <span>Co-marketing initiatives</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 shadow-lg">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <i className="fa-solid fa-code text-info"></i>
                                        Technical Support
                                    </h3>
                                    <ul className="space-y-2 mt-4">
                                        <li className="flex items-start gap-2">
                                            <i className="fa-solid fa-check text-success mt-1"></i>
                                            <span>Priority API access and support</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-solid fa-check text-success mt-1"></i>
                                            <span>Dedicated integration assistance</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-solid fa-check text-success mt-1"></i>
                                            <span>Custom development opportunities</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 shadow-lg">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <i className="fa-solid fa-bullhorn text-primary"></i>
                                        Marketing & Visibility
                                    </h3>
                                    <ul className="space-y-2 mt-4">
                                        <li className="flex items-start gap-2">
                                            <i className="fa-solid fa-check text-success mt-1"></i>
                                            <span>Featured in partner directory</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-solid fa-check text-success mt-1"></i>
                                            <span>Co-branded content opportunities</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-solid fa-check text-success mt-1"></i>
                                            <span>Joint webinars and events</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 shadow-lg">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <i className="fa-solid fa-graduation-cap text-secondary"></i>
                                        Training & Resources
                                    </h3>
                                    <ul className="space-y-2 mt-4">
                                        <li className="flex items-start gap-2">
                                            <i className="fa-solid fa-check text-success mt-1"></i>
                                            <span>Partner onboarding program</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-solid fa-check text-success mt-1"></i>
                                            <span>Sales and marketing materials</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-solid fa-check text-success mt-1"></i>
                                            <span>Ongoing education and updates</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partner Types */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center">Partnership Opportunities</h2>
                        
                        <div className="space-y-8">
                            {/* Recruiting Firm Partners */}
                            <div className="card bg-base-200 shadow-xl">
                                <div className="card-body">
                                    <h3 className="card-title text-2xl mb-4">
                                        <i className="fa-solid fa-building text-primary"></i>
                                        Recruiting Firm Partners
                                    </h3>
                                    <p className="text-base-content/70 mb-4">
                                        Perfect for established recruiting firms who want to offer split placement 
                                        capabilities to their recruiters while maintaining their brand identity.
                                    </p>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="bg-base-100 p-4 rounded-lg">
                                            <div className="font-bold mb-2">White-Label Platform</div>
                                            <p className="text-sm text-base-content/60">
                                                Custom branding and domain for your recruiting network
                                            </p>
                                        </div>
                                        <div className="bg-base-100 p-4 rounded-lg">
                                            <div className="font-bold mb-2">Team Management</div>
                                            <p className="text-sm text-base-content/60">
                                                Manage multiple recruiters under your organization
                                            </p>
                                        </div>
                                        <div className="bg-base-100 p-4 rounded-lg">
                                            <div className="font-bold mb-2">Revenue Share</div>
                                            <p className="text-sm text-base-content/60">
                                                Earn from your recruiters' platform subscriptions
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Technology Partners */}
                            <div className="card bg-base-200 shadow-xl">
                                <div className="card-body">
                                    <h3 className="card-title text-2xl mb-4">
                                        <i className="fa-solid fa-laptop-code text-secondary"></i>
                                        Technology Integration Partners
                                    </h3>
                                    <p className="text-base-content/70 mb-4">
                                        For software vendors who want to integrate their solutions with Splits Network 
                                        and reach our growing user base.
                                    </p>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="bg-base-100 p-4 rounded-lg">
                                            <div className="font-bold mb-2">API Access</div>
                                            <p className="text-sm text-base-content/60">
                                                Full API documentation and integration support
                                            </p>
                                        </div>
                                        <div className="bg-base-100 p-4 rounded-lg">
                                            <div className="font-bold mb-2">Marketplace Listing</div>
                                            <p className="text-sm text-base-content/60">
                                                Featured placement in our integrations directory
                                            </p>
                                        </div>
                                        <div className="bg-base-100 p-4 rounded-lg">
                                            <div className="font-bold mb-2">Technical Support</div>
                                            <p className="text-sm text-base-content/60">
                                                Dedicated support for integration development
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Association Partners */}
                            <div className="card bg-base-200 shadow-xl">
                                <div className="card-body">
                                    <h3 className="card-title text-2xl mb-4">
                                        <i className="fa-solid fa-users-gear text-accent"></i>
                                        Industry Association Partners
                                    </h3>
                                    <p className="text-base-content/70 mb-4">
                                        For recruiting associations who want to provide value-added services to their 
                                        members and promote best practices in split placements.
                                    </p>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="bg-base-100 p-4 rounded-lg">
                                            <div className="font-bold mb-2">Member Benefits</div>
                                            <p className="text-sm text-base-content/60">
                                                Special pricing and features for association members
                                            </p>
                                        </div>
                                        <div className="bg-base-100 p-4 rounded-lg">
                                            <div className="font-bold mb-2">Co-Branded Experience</div>
                                            <p className="text-sm text-base-content/60">
                                                Association branding and customized onboarding
                                            </p>
                                        </div>
                                        <div className="bg-base-100 p-4 rounded-lg">
                                            <div className="font-bold mb-2">Education Programs</div>
                                            <p className="text-sm text-base-content/60">
                                                Joint training and certification opportunities
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Current Partners */}
            <section className="py-20 bg-neutral text-neutral-content">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-6">Our Partners</h2>
                        <p className="text-lg opacity-80 mb-12">
                            Growing our ecosystem with industry-leading organizations
                        </p>
                        <div className="alert alert-info">
                            <i className="fa-solid fa-info-circle"></i>
                            <span>
                                We're actively building our partner network. Be among our founding partners and help 
                                shape the future of collaborative recruiting.
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Application Process */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center">How to Become a Partner</h2>
                        <div className="space-y-6">
                            <div className="card bg-base-200 shadow-lg">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl font-bold text-primary">1</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2">Submit Application</h3>
                                            <p className="text-base-content/70">
                                                Fill out our partner application form and tell us about your organization 
                                                and partnership goals.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-base-200 shadow-lg">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl font-bold text-secondary">2</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2">Discovery Call</h3>
                                            <p className="text-base-content/70">
                                                Meet with our partnerships team to discuss opportunities and alignment.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-base-200 shadow-lg">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl font-bold text-accent">3</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2">Agreement & Onboarding</h3>
                                            <p className="text-base-content/70">
                                                Sign partnership agreement and complete onboarding with dedicated support.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-success text-success-content shadow-lg">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-success-content/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl font-bold">4</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2">Launch Partnership</h3>
                                            <p className="opacity-90">
                                                Go live with co-marketing, technical integration, or white-label deployment.
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
                    <h2 className="text-4xl font-bold mb-6">Ready to Partner With Us?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Join our partner ecosystem and help shape the future of collaborative recruiting.
                    </p>
                    <a href="mailto:partnerships@splits.network" className="btn btn-lg btn-neutral">
                        <i className="fa-solid fa-envelope"></i>
                        Contact Partnerships Team
                    </a>
                    <p className="mt-6 text-sm opacity-75">
                        Questions? Email us at partnerships@splits.network
                    </p>
                </div>
            </section>
        </>
    );
}
