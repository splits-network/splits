"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import { statusColor } from "./status-color";
import {
    recruiterEmail,
    recruiterLocation,
    formatStatus,
    placementsDisplay,
    successRateDisplay,
    reputationDisplay,
    experienceDisplay,
    isNew,
} from "./helpers";
import RecruiterActionsToolbar from "./actions-toolbar";

// ─── Detail Panel ───────────────────────────────────────────────────────────

export function RecruiterDetail({
    recruiter,
    onClose,
    onRefresh,
}: {
    recruiter: RecruiterWithUser;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const name = getDisplayName(recruiter);
    const email = recruiterEmail(recruiter);
    const location = recruiterLocation(recruiter);
    const specialties = recruiter.specialties || [];
    const industries = recruiter.industries || [];
    const status = recruiter.marketplace_profile?.status || "active";

    const bioContent =
        recruiter.marketplace_profile?.description ||
        recruiter.marketplace_profile?.bio_rich ||
        recruiter.marketplace_profile?.bio ||
        recruiter.bio;

    return (
        <div>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-base-100 border-b-2 border-base-300 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        {recruiter.users?.profile_image_url ? (
                            <img
                                src={recruiter.users.profile_image_url}
                                alt={name}
                                className="w-16 h-16 object-cover border-2 border-primary"
                            />
                        ) : (
                            <div className="w-16 h-16 flex items-center justify-center border-2 border-primary bg-primary/10 text-primary text-xl font-black">
                                {getInitials(name)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            {/* Status + NEW */}
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span
                                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(status)}`}
                                >
                                    {formatStatus(status)}
                                </span>
                                {isNew(recruiter) && (
                                    <span className="text-[10px] uppercase tracking-wider bg-warning/15 text-warning px-2 py-1">
                                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                                        New
                                    </span>
                                )}
                                {experienceDisplay(recruiter) && (
                                    <span className="text-[10px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1">
                                        {experienceDisplay(recruiter)} exp
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-black tracking-tight leading-tight mb-0.5">
                                {name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                {recruiter.tagline && (
                                    <span className="font-semibold text-primary">
                                        {recruiter.tagline}
                                    </span>
                                )}
                                {location && (
                                    <>
                                        {recruiter.tagline && (
                                            <span className="text-base-content/30">
                                                |
                                            </span>
                                        )}
                                        <span className="text-base-content/60">
                                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                            {location}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost flex-shrink-0"
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4">
                    <RecruiterActionsToolbar
                        recruiter={recruiter}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewDetails: false,
                        }}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 border-b border-base-200">
                {[
                    {
                        value: placementsDisplay(recruiter),
                        label: "Placements",
                    },
                    {
                        value: successRateDisplay(recruiter) || "N/A",
                        label: "Success Rate",
                    },
                    {
                        value: reputationDisplay(recruiter) || "N/A",
                        label: "Reputation",
                    },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className={`p-4 text-center ${i < 2 ? "border-r border-base-200" : ""}`}
                    >
                        <div className="text-lg font-black text-primary">
                            {stat.value}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 font-bold">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Content sections */}
            <div className="p-6">
                {/* Bio */}
                {bioContent && (
                    <div className="mb-6">
                        <h3 className="uppercase tracking-[0.2em] text-base-content/40 text-xs font-bold mb-3">
                            About
                        </h3>
                        <MarkdownRenderer
                            content={bioContent}
                            className="prose prose-sm max-w-none text-base-content/80"
                        />
                    </div>
                )}

                {/* Specialties */}
                {specialties.length > 0 && (
                    <div className="mb-6">
                        <h3 className="uppercase tracking-[0.2em] text-base-content/40 text-xs font-bold mb-3">
                            Specialties
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {specialties.map((specialty, i) => (
                                <span
                                    key={`specialty-${i}`}
                                    className="text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1"
                                >
                                    {specialty}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Industries */}
                {industries.length > 0 && (
                    <div className="mb-6">
                        <h3 className="uppercase tracking-[0.2em] text-base-content/40 text-xs font-bold mb-3">
                            Industries
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {industries.map((industry, i) => (
                                <span
                                    key={`industry-${i}`}
                                    className="text-xs font-semibold uppercase tracking-wider bg-secondary/10 text-secondary px-3 py-1"
                                >
                                    {industry}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contact Info */}
                <div className="border-l-4 border-primary p-4 bg-base-200/50">
                    <h3 className="uppercase tracking-[0.2em] text-base-content/40 text-xs font-bold mb-3">
                        Contact
                    </h3>
                    <div className="space-y-2">
                        {email && (
                            <a
                                href={`mailto:${email}`}
                                className="flex items-center gap-2 text-sm text-base-content/70 hover:text-primary transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-envelope w-5" />
                                <span className="truncate">{email}</span>
                            </a>
                        )}
                        {recruiter.phone && (
                            <div className="flex items-center gap-2 text-sm text-base-content/70">
                                <i className="fa-duotone fa-regular fa-phone w-5" />
                                <span>{recruiter.phone}</span>
                            </div>
                        )}
                        {location && (
                            <div className="flex items-center gap-2 text-sm text-base-content/70">
                                <i className="fa-duotone fa-regular fa-location-dot w-5" />
                                <span>{location}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Detail Loading Wrapper ─────────────────────────────────────────────────

export function DetailLoader({
    recruiterId,
    onClose,
    onRefresh,
}: {
    recruiterId: string;
    onClose: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [recruiter, setRecruiter] = useState<RecruiterWithUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: RecruiterWithUser }>(
                    `/recruiters/${recruiterId}`,
                    {
                        params: { include: "user,reputation" },
                    },
                );
                if (!cancelled) setRecruiter(res.data);
            } catch (err) {
                console.error("Failed to fetch recruiter detail:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recruiterId]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <span className="loading loading-spinner loading-md text-primary" />
            </div>
        );
    }

    if (!recruiter) return null;

    return (
        <RecruiterDetail
            recruiter={recruiter}
            onClose={onClose}
            onRefresh={onRefresh}
        />
    );
}
