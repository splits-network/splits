import Link from 'next/link';

export const metadata = {
    title: 'Page Not Found',
};

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <div className="max-w-2xl w-full text-center">
                {/* Large 404 with gradient background */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <i className="fa-duotone fa-solid fa-magnifying-glass text-[20rem] text-primary"></i>
                    </div>
                    <h1 className="text-9xl font-bold text-primary relative z-10">404</h1>
                </div>

                {/* Main message */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-base-content mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-base-content/70 mb-2">
                        Looks like this role has been filled...
                    </p>
                    <p className="text-base-content/60">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                {/* Quick links card */}
                <div className="card bg-base-100 shadow-xl mb-8">
                    <div className="card-body">
                        <h3 className="card-title text-lg mb-4">Try these instead:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Link
                                href="/portal/dashboard"
                                className="btn btn-outline btn-primary justify-start"
                            >
                                <i className="fa-duotone fa-regular fa-gauge-high"></i>
                                Dashboard
                            </Link>
                            <Link
                                href="/portal/roles"
                                className="btn btn-outline btn-primary justify-start"
                            >
                                <i className="fa-duotone fa-regular fa-briefcase"></i>
                                Browse Roles
                            </Link>
                            <Link
                                href="/portal/candidates"
                                className="btn btn-outline btn-primary justify-start"
                            >
                                <i className="fa-duotone fa-regular fa-users"></i>
                                Candidates
                            </Link>
                            <Link
                                href="/portal/invitations"
                                className="btn btn-outline btn-primary justify-start"
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                Invitations
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Home button */}
                <Link href="/portal/dashboard" className="btn btn-primary btn-lg gap-2">
                    <i className="fa-duotone fa-regular fa-house"></i>
                    Back to Dashboard
                </Link>

                {/* Help text */}
                <p className="mt-8 text-sm text-base-content/50">
                    Need help? Contact{' '}
                    <a href="mailto:support@splits.network" className="link link-primary">
                        support@splits.network
                    </a>
                </p>
            </div>
        </div>
    );
}
