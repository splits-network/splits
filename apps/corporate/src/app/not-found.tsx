import Link from "next/link";

export const metadata = {
    title: "Page Not Found",
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
            {/* Hero section with 404 */}
            <div className="hero min-h-screen">
                <div className="hero-content text-center max-w-4xl px-4">
                    <div>
                        {/* Decorative background elements */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
                            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
                        </div>

                        {/* Main content */}
                        <div className="relative z-10">
                            {/* Large 404 number */}
                            <div className="mb-8">
                                <h1 className="text-[12rem] md:text-[16rem] font-black leading-none">
                                    <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                        404
                                    </span>
                                </h1>
                            </div>

                            {/* Message */}
                            <div className="mb-12">
                                <h2 className="text-3xl md:text-5xl font-bold text-base-content mb-6">
                                    This Page Has Been Recruited Away
                                </h2>
                                <p className="text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto mb-4">
                                    Looks like this page found a better
                                    opportunity elsewhere. Don't worry — we have
                                    plenty more to explore.
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                                <Link
                                    href="/"
                                    className="btn btn-primary btn-lg gap-3"
                                >
                                    <i className="fa-duotone fa-regular fa-house text-xl"></i>
                                    Back to Home
                                </Link>
                                <a
                                    href="https://splits.network"
                                    className="btn btn-outline btn-lg gap-3"
                                >
                                    <i className="fa-duotone fa-regular fa-handshake text-xl"></i>
                                    Visit Splits Platform
                                </a>
                            </div>

                            {/* Quick Links Cards */}
                            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                {/* Splits Card */}
                                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                                    <div className="card-body items-center text-center">
                                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                                            <i className="fa-duotone fa-regular fa-users-between-lines text-4xl text-primary"></i>
                                        </div>
                                        <h3 className="card-title text-lg">
                                            For Recruiters
                                        </h3>
                                        <p className="text-sm text-base-content/70 mb-4">
                                            Collaborate and split fees on
                                            placements
                                        </p>
                                        <a
                                            href="https://splits.network"
                                            className="btn btn-sm btn-primary btn-outline"
                                        >
                                            Explore Splits
                                        </a>
                                    </div>
                                </div>

                                {/* Applicant Card */}
                                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                                    <div className="card-body items-center text-center">
                                        <div className="bg-secondary/10 p-4 rounded-full mb-4">
                                            <i className="fa-duotone fa-regular fa-briefcase text-4xl text-secondary"></i>
                                        </div>
                                        <h3 className="card-title text-lg">
                                            For Job Seekers
                                        </h3>
                                        <p className="text-sm text-base-content/70 mb-4">
                                            Find your next career opportunity
                                        </p>
                                        <a
                                            href="https://applicant.network"
                                            className="btn btn-sm btn-secondary btn-outline"
                                        >
                                            Browse Jobs
                                        </a>
                                    </div>
                                </div>

                                {/* Contact Card */}
                                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                                    <div className="card-body items-center text-center">
                                        <div className="bg-accent/10 p-4 rounded-full mb-4">
                                            <i className="fa-duotone fa-regular fa-envelope text-4xl text-accent"></i>
                                        </div>
                                        <h3 className="card-title text-lg">
                                            Need Help?
                                        </h3>
                                        <p className="text-sm text-base-content/70 mb-4">
                                            Our support team is here for you
                                        </p>
                                        <a
                                            href="mailto:support@employment-networks.com"
                                            className="btn btn-sm btn-accent btn-outline"
                                        >
                                            Contact Us
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Error reference */}
                            <p className="mt-12 text-sm text-base-content/40 font-mono">
                                ERROR_CODE: 404_PAGE_NOT_FOUND
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
