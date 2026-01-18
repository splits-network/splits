import Link from 'next/link';

export const metadata = {
    title: 'Page Not Found',
};

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 px-4 py-16">
            <div className="max-w-3xl w-full">
                {/* Main content card */}
                <div className="card bg-base-100 shadow-2xl">
                    <div className="card-body items-center text-center p-8 md:p-12">
                        {/* Animated icon */}
                        <div className="mb-6">
                            <div className="relative">
                                <i className="fa-duotone fa-solid fa-map-location-dot text-8xl text-primary animate-pulse"></i>
                                <div className="absolute -top-2 -right-2">
                                    <span className="relative flex h-6 w-6">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-6 w-6 bg-error">
                                            <i className="fa-solid fa-question text-white text-xs m-auto"></i>
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Error code */}
                        <div className="badge badge-error badge-lg mb-4 px-6 py-4 text-lg font-mono">
                            ERROR 404
                        </div>

                        {/* Main message */}
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
                            Lost Your Way?
                        </h1>
                        <p className="text-xl text-base-content/80 mb-2">
                            This page seems to have taken a different career path.
                        </p>
                        <p className="text-base-content/60 mb-8 max-w-md">
                            The page you're looking for doesn't exist. Let's get you back on track to finding your dream job.
                        </p>

                        {/* Quick action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mb-8">
                            <Link href="/jobs" className="btn btn-primary flex-1 gap-2">
                                <i className="fa-duotone fa-regular fa-magnifying-glass"></i>
                                Browse Jobs
                            </Link>
                            <Link href="/" className="btn btn-outline flex-1 gap-2">
                                <i className="fa-duotone fa-regular fa-house"></i>
                                Go Home
                            </Link>
                        </div>

                        <div className="divider my-8">Popular Destinations</div>

                        {/* Quick links grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                            <Link
                                href="/jobs"
                                className="btn btn-ghost btn-sm flex-col h-auto py-4 gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-briefcase text-2xl text-primary"></i>
                                <span className="text-xs">All Jobs</span>
                            </Link>
                            <Link
                                href="/profile"
                                className="btn btn-ghost btn-sm flex-col h-auto py-4 gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-user text-2xl text-secondary"></i>
                                <span className="text-xs">My Profile</span>
                            </Link>
                            <Link
                                href="/applications"
                                className="btn btn-ghost btn-sm flex-col h-auto py-4 gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-file-lines text-2xl text-accent"></i>
                                <span className="text-xs">Applications</span>
                            </Link>
                            <Link
                                href="/recruiters"
                                className="btn btn-ghost btn-sm flex-col h-auto py-4 gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-users text-2xl text-info"></i>
                                <span className="text-xs">Recruiters</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Help footer */}
                <div className="text-center mt-6 text-sm text-base-content/60">
                    Still can't find what you're looking for?{' '}
                    <a href="mailto:support@applicant.network" className="link link-primary font-semibold">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}
