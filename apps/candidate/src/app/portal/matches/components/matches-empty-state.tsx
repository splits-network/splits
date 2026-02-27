"use client";

import Link from "next/link";

export default function MatchesEmptyState() {
    return (
        <div className="text-center py-16">
            <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <i className="fa-duotone fa-regular fa-radar text-2xl text-primary/40" />
            </div>
            <h3 className="text-lg font-bold text-base-content mb-2">
                Your matches are on the way
            </h3>
            <p className="text-sm text-base-content/60 max-w-md mx-auto mb-6">
                Matches are generated based on your skills, experience, and
                preferences. A complete profile helps surface the most relevant
                opportunities for you.
            </p>
            <div className="flex gap-3 justify-center">
                <Link
                    href="/jobs"
                    className="btn btn-ghost btn-sm rounded-none"
                >
                    <i className="fa-duotone fa-regular fa-magnifying-glass" />
                    Browse Roles
                </Link>
                <Link
                    href="/portal/profile"
                    className="btn btn-primary btn-sm rounded-none"
                >
                    <i className="fa-duotone fa-regular fa-user-pen" />
                    Complete Profile
                </Link>
            </div>
        </div>
    );
}
