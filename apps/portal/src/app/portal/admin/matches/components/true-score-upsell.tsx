import Link from "next/link";

export function TrueScoreUpsell() {
    return (
        <div className="relative overflow-hidden rounded-lg border border-base-300 p-4">
            {/* Blurred background content */}
            <div className="blur-sm select-none pointer-events-none">
                <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-primary badge-lg gap-1">
                        <i className="fa-duotone fa-regular fa-stars"></i>
                        True Score: Excellent
                    </span>
                </div>
                <div className="text-sm text-base-content/60">
                    AI-powered analysis with semantic matching, career trajectory
                    scoring, and deeper candidate insights.
                </div>
            </div>

            {/* Overlay CTA */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100/80">
                <i className="fa-duotone fa-regular fa-lock text-2xl text-primary mb-2"></i>
                <p className="font-semibold text-base mb-1">Unlock True Score</p>
                <p className="text-sm text-base-content/60 mb-3 text-center px-4">
                    Get AI-powered match analysis, deeper candidate insights, and higher placement confidence with a Partner plan.
                </p>
                <Link href="/portal/billing" className="btn btn-primary btn-sm">
                    <i className="fa-duotone fa-regular fa-arrow-up-right mr-1"></i>
                    Upgrade to Partner
                </Link>
            </div>
        </div>
    );
}
