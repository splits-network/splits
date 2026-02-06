"use client";

import { RecruiterDetailProps } from "./types";

export default function RecruiterDetailContact({
    recruiter,
}: RecruiterDetailProps) {
    const displayEmail = recruiter.users?.email || recruiter.email;

    // Format member since date
    const formatMemberSince = (dateStr: string | undefined) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            });
        } catch {
            return null;
        }
    };

    const memberSince = formatMemberSince(recruiter.created_at);

    // Don't render if no contact info available
    if (!displayEmail && !recruiter.phone && !memberSince) return null;

    return (
        <section className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="p-4 border-b border-base-200 bg-base-200/30">
                <h3 className="font-semibold flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-address-book text-info"></i>
                    Contact Info
                </h3>
            </div>
            <div className="p-4 space-y-3">
                {displayEmail && (
                    <a
                        href={`mailto:${displayEmail}`}
                        className="flex items-center gap-3 text-base-content/80 hover:text-primary transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-envelope text-base-content/50 w-5"></i>
                        <span className="truncate">{displayEmail}</span>
                    </a>
                )}
                {recruiter.phone && (
                    <div className="flex items-center gap-3 text-base-content/80">
                        <i className="fa-duotone fa-regular fa-phone text-base-content/50 w-5"></i>
                        <span>{recruiter.phone}</span>
                    </div>
                )}
                {memberSince && (
                    <div className="flex items-center gap-3 text-base-content/60 text-sm pt-2 border-t border-base-200">
                        <i className="fa-duotone fa-regular fa-calendar text-base-content/40 w-5"></i>
                        <span>Member since {memberSince}</span>
                    </div>
                )}
            </div>
        </section>
    );
}
