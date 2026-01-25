import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Modern Recruiting & Candidate Experience',
    description: 'Employment Networks powers Splits and Applicant for collaborative recruiting and candidate success.',
};

export default function HomePage() {
    return (
        <>
            {/* Hero Section */}
            <section className="hero min-h-[600px] bg-linear-to-br from-primary/5 to-secondary/5">
                <div className="hero-content text-center max-w-4xl px-6">
                    <div>
                        <h1 className="text-5xl lg:text-6xl font-bold text-base-content mb-6">
                            The Future of Recruiting
                        </h1>
                        <p className="text-xl lg:text-2xl text-base-content/70 mb-8">
                            Employment Networks powers modern recruiting through two innovative platforms:
                            <span className="font-semibold text-primary"> Splits</span> for collaborative recruiting networks and
                            <span className="font-semibold text-secondary"> Applicant</span> for exceptional candidate experiences.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="#products" className="btn btn-primary btn-lg">
                                Explore Our Products
                            </Link>
                            <Link href="#contact" className="btn btn-outline btn-lg">
                                Get in Touch
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section id="products" className="py-20 px-6 lg:px-12 bg-base-100">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-4">Our Products</h2>
                    <p className="text-center text-base-content/70 mb-16 max-w-2xl mx-auto">
                        Two powerful platforms working together to transform the recruiting landscape.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Splits Product Card */}
                        <div className="card bg-base-200 shadow">
                            <div className="card-body">
                                <div className="badge badge-primary badge-lg mb-4">For Recruiters</div>
                                <h3 className="card-title text-3xl mb-4">
                                    <img src='/splits.png' alt='Splits Network' className='h-10 mr-3 inline-block' />
                                </h3>
                                <p className="text-lg mb-6">
                                    The collaborative recruiting marketplace where recruiters share roles, split fees,
                                    and build powerful networks. Track placements, manage applications, and grow your business.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>Split-fee recruiting network</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>Full ATS & candidate management</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>Automated placement tracking</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>Real-time collaboration tools</span>
                                    </li>
                                </ul>
                                <div className="card-actions">
                                    <a href="https://splits.network" className="btn btn-primary w-full">
                                        Access Splits Platform
                                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Applicant Product Card */}
                        <div className="card bg-base-200 shadow">
                            <div className="card-body">
                                <div className="badge badge-secondary badge-lg mb-4">For Candidates</div>
                                <h3 className="card-title text-3xl mb-4">
                                    <img src='/applicant.png' alt='Applicant Network' className='h-10 mr-3 inline-block' />
                                </h3>
                                <p className="text-lg mb-6">
                                    A modern, candidate-first portal that transforms the application experience.
                                    Track your applications, verify information, and stay connected throughout the hiring process.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>Secure identity verification</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>Real-time application tracking</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>Document management</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>Direct recruiter communication</span>
                                    </li>
                                </ul>
                                <div className="card-actions">
                                    <a href="https://applicant.network" className="btn btn-secondary w-full">
                                        Access Applicant Portal
                                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 px-6 lg:px-12 bg-base-200">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">About Employment Networks</h2>
                    <p className="text-lg text-base-content/80 mb-8">
                        Employment Networks is revolutionizing the recruiting industry by building platforms
                        that serve both recruiters and candidates with equal excellence. Our mission is to
                        create transparent, efficient, and collaborative hiring ecosystems.
                    </p>
                    <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-100">
                        <div className="stat">
                            <div className="stat-title">Platform</div>
                            <div className="stat-value text-primary">Modern</div>
                            <div className="stat-desc">Built with latest tech</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">Network</div>
                            <div className="stat-value text-secondary">Growing</div>
                            <div className="stat-desc">Expanding recruiter base</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">Experience</div>
                            <div className="stat-value text-accent">First-Class</div>
                            <div className="stat-desc">For all users</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-6 lg:px-12 bg-base-100">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
                    <p className="text-lg text-base-content/70 mb-8">
                        Interested in learning more about our platforms or partnering with us?
                        We'd love to hear from you.
                    </p>
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 justify-center">
                                    <i className="fa-duotone fa-regular fa-envelope text-2xl text-primary"></i>
                                    <a href="mailto:hello@employment-networks.com" className="link link-primary text-lg">
                                        hello@employment-networks.com
                                    </a>
                                </div>
                                <div className="divider">OR</div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a href="https://splits.network" className="btn btn-primary">
                                        Join as a Recruiter
                                    </a>
                                    <a href="https://applicant.network" className="btn btn-secondary">
                                        Access Candidate Portal
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
