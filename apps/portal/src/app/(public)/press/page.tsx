import Link from 'next/link';

export default function PressKitPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="hero bg-info text-info-content py-20">
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Press Kit
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Media resources, brand assets, and company information for journalists and partners
                        </p>
                    </div>
                </div>
            </section>

            {/* Company Overview */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold mb-8 text-center">Company Overview</h2>
                        <div className="prose lg:prose-xl max-w-none">
                            <h3 className="text-2xl font-bold mb-4">About Splits Network</h3>
                            <p className="text-lg text-base-content/80 mb-6">
                                Splits Network is a modern recruiting marketplace platform designed specifically for
                                split-fee placements. We connect specialized recruiters with companies seeking top talent,
                                providing transparent fee structures, collaborative tools, and a built-in ATS to streamline
                                the entire placement process.
                            </p>

                            <h3 className="text-2xl font-bold mb-4">Key Facts</h3>
                            <div className="grid md:grid-cols-2 gap-6 not-prose mb-8">
                                <div className="card bg-base-200 shadow">
                                    <div className="card-body">
                                        <div className="text-3xl font-bold text-primary mb-2">2025</div>
                                        <div className="text-sm text-base-content/70">Founded</div>
                                    </div>
                                </div>
                                <div className="card bg-base-200 shadow">
                                    <div className="card-body">
                                        <div className="text-3xl font-bold text-secondary mb-2">$0</div>
                                        <div className="text-sm text-base-content/70">For companies to post roles</div>
                                    </div>
                                </div>
                                <div className="card bg-base-200 shadow">
                                    <div className="card-body">
                                        <div className="text-3xl font-bold text-accent mb-2">65-85%</div>
                                        <div className="text-sm text-base-content/70">Recruiter share of placement fees</div>
                                    </div>
                                </div>
                                <div className="card bg-base-200 shadow">
                                    <div className="card-body">
                                        <div className="text-3xl font-bold text-success mb-2">Cloud-Native</div>
                                        <div className="text-sm text-base-content/70">Modern, scalable infrastructure</div>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4">Boilerplate</h3>
                            <div className="bg-base-200 p-6 rounded-lg mb-6">
                                <p className="text-base-content/80 italic">
                                    Splits Network is a split-fee recruiting marketplace that connects specialized recruiters
                                    with companies seeking top talent. The platform provides transparent fee structures,
                                    collaborative ATS tools, and automated split tracking—eliminating the spreadsheets and
                                    email chaos traditionally associated with split placements. Founded by recruiting industry
                                    veterans, Splits Network is built specifically for collaborative recruiting, not retrofitted
                                    from general-purpose systems.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brand Assets */}
            <section className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center">Brand Assets</h2>

                        {/* Logos */}
                        <div className="mb-16">
                            <h3 className="text-2xl font-bold mb-6">Logos</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="card bg-base-100 shadow">
                                    <div className="card-body">
                                        <h4 className="card-title">Primary Logo</h4>
                                        <div className="bg-white p-8 rounded-lg mb-4 flex items-center justify-center min-h-32">
                                            <div className="text-4xl font-bold text-primary">Splits Network</div>
                                        </div>
                                        <button className="btn btn-sm btn-primary">
                                            <i className="fa-solid fa-download"></i>
                                            Download PNG
                                        </button>
                                    </div>
                                </div>
                                <div className="card bg-base-100 shadow">
                                    <div className="card-body">
                                        <h4 className="card-title">Dark Background</h4>
                                        <div className="bg-neutral p-8 rounded-lg mb-4 flex items-center justify-center min-h-32">
                                            <div className="text-4xl font-bold text-neutral-content">Splits Network</div>
                                        </div>
                                        <button className="btn btn-sm btn-primary">
                                            <i className="fa-solid fa-download"></i>
                                            Download PNG
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Color Palette */}
                        <div className="mb-16">
                            <h3 className="text-2xl font-bold mb-6">Color Palette</h3>
                            <div className="grid md:grid-cols-4 gap-4">
                                <div className="card bg-primary text-primary-content shadow">
                                    <div className="card-body items-center text-center p-6">
                                        <div className="w-20 h-20 rounded-full bg-primary border-4 border-primary-content mb-3"></div>
                                        <div className="font-bold">Primary</div>
                                        <div className="text-xs opacity-75">#0066CC</div>
                                    </div>
                                </div>
                                <div className="card bg-secondary text-secondary-content shadow">
                                    <div className="card-body items-center text-center p-6">
                                        <div className="w-20 h-20 rounded-full bg-secondary border-4 border-secondary-content mb-3"></div>
                                        <div className="font-bold">Secondary</div>
                                        <div className="text-xs opacity-75">#7C3AED</div>
                                    </div>
                                </div>
                                <div className="card bg-accent text-accent-content shadow">
                                    <div className="card-body items-center text-center p-6">
                                        <div className="w-20 h-20 rounded-full bg-accent border-4 border-accent-content mb-3"></div>
                                        <div className="font-bold">Accent</div>
                                        <div className="text-xs opacity-75">#F59E0B</div>
                                    </div>
                                </div>
                                <div className="card bg-neutral text-neutral-content shadow">
                                    <div className="card-body items-center text-center p-6">
                                        <div className="w-20 h-20 rounded-full bg-neutral border-4 border-neutral-content mb-3"></div>
                                        <div className="font-bold">Neutral</div>
                                        <div className="text-xs opacity-75">#2A2E37</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Screenshots */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6">Product Screenshots</h3>
                            <div className="alert alert-info mb-6">
                                <i className="fa-solid fa-info-circle"></i>
                                <span>High-resolution product screenshots available upon request</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="card bg-base-100 shadow">
                                    <div className="card-body">
                                        <h4 className="font-bold">Dashboard View</h4>
                                        <div className="bg-base-300 rounded-lg aspect-video flex items-center justify-center">
                                            <i className="fa-solid fa-image text-6xl opacity-20"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="card bg-base-100 shadow">
                                    <div className="card-body">
                                        <h4 className="font-bold">ATS Pipeline</h4>
                                        <div className="bg-base-300 rounded-lg aspect-video flex items-center justify-center">
                                            <i className="fa-solid fa-image text-6xl opacity-20"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center">Media Contact</h2>
                        <div className="card bg-base-200 shadow">
                            <div className="card-body">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">Press Inquiries</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <i className="fa-solid fa-envelope text-primary"></i>
                                                <a href="mailto:press@splits.network" className="link link-hover">
                                                    press@splits.network
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <i className="fa-solid fa-phone text-primary"></i>
                                                <span>Available upon request</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">Partnership Inquiries</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <i className="fa-solid fa-envelope text-secondary"></i>
                                                <a href="mailto:partnerships@splits.network" className="link link-hover">
                                                    partnerships@splits.network
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <i className="fa-solid fa-handshake text-secondary"></i>
                                                <Link href="/partners" className="link link-hover">
                                                    Partner Program
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-12">
                            <p className="text-base-content/70 mb-6">
                                For additional materials, interview requests, or custom assets, please contact our press team.
                            </p>
                            <a href="mailto:press@splits.network" className="btn btn-primary btn-lg">
                                <i className="fa-solid fa-envelope"></i>
                                Contact Press Team
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent News */}
            <section className="py-20 bg-neutral text-neutral-content">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center">Recent News</h2>
                        <div className="space-y-6">
                            <div className="card bg-base-100 text-base-content shadow">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="badge badge-primary">DEC 2025</div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-lg mb-2">Splits Network Launches Platform for Split-Fee Recruiting</h3>
                                            <p className="text-sm text-base-content/70">
                                                New marketplace connects specialized recruiters with companies, offering transparent
                                                fee structures and collaborative tools designed specifically for split placements.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
