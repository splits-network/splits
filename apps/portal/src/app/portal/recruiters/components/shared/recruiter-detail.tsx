"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Badge } from "@splits-network/memphis-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import type { AccentClasses } from "./accent";
import { statusVariant } from "./accent";
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
    accent,
    onClose,
    onRefresh,
}: {
    recruiter: RecruiterWithUser;
    accent: AccentClasses;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const name = getDisplayName(recruiter);
    const email = recruiterEmail(recruiter);
    const location = recruiterLocation(recruiter);
    const specialties = recruiter.specialties || [];
    const industries = recruiter.industries || [];

    const bioContent =
        recruiter.marketplace_profile?.description ||
        recruiter.marketplace_profile?.bio_rich ||
        recruiter.marketplace_profile?.bio ||
        recruiter.bio;

    return (
        <div>
            {/* Header */}
            <div className={`p-6 border-b-4 ${accent.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        {recruiter.users?.profile_image_url ? (
                            <img
                                src={recruiter.users.profile_image_url}
                                alt={name}
                                className={`w-16 h-16 object-cover border-4 ${accent.border}`}
                            />
                        ) : (
                            <div
                                className={`w-16 h-16 flex items-center justify-center border-4 ${accent.border} ${accent.bg} ${accent.textOnBg} text-xl font-black`}
                            >
                                {getInitials(name)}
                            </div>
                        )}
                        <div className="flex-1">
                            {isNew(recruiter) && (
                                <Badge color="yellow" className="mb-2" size="sm">
                                    <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                                    New
                                </Badge>
                            )}
                            <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-1 text-dark">
                                {name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                {recruiter.tagline && (
                                    <span className={`font-bold ${accent.text}`}>
                                        {recruiter.tagline}
                                    </span>
                                )}
                                {location && (
                                    <>
                                        {recruiter.tagline && <span className="text-dark/50">|</span>}
                                        <span className="text-dark/70">
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
                            className={`btn btn-xs btn-square btn-ghost flex-shrink-0 ${accent.text}`}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}
                </div>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <Badge color={statusVariant(recruiter.marketplace_profile?.status || "active")} variant="outline">
                        {formatStatus(recruiter.marketplace_profile?.status || "active")}
                    </Badge>
                    {experienceDisplay(recruiter) && (
                        <Badge color="dark" variant="outline">
                            {experienceDisplay(recruiter)} experience
                        </Badge>
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
            <div className={`grid grid-cols-3 border-b-4 ${accent.border}`}>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {placementsDisplay(recruiter)}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Placements
                    </div>
                </div>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {successRateDisplay(recruiter) || "N/A"}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Success Rate
                    </div>
                </div>
                <div className="p-4 text-center">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {reputationDisplay(recruiter) || "N/A"}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Reputation
                    </div>
                </div>
            </div>

            {/* Bio */}
            <div className="p-6">
                {bioContent && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="badge badge-xs badge-coral">
                                <i className="fa-duotone fa-regular fa-address-card" />
                            </span>
                            About
                        </h3>
                        <MarkdownRenderer
                            content={bioContent}
                            className="prose prose-sm max-w-none text-dark/80"
                        />
                    </div>
                )}

                {/* Specialties */}
                {specialties.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="badge badge-xs badge-teal">
                                <i className="fa-duotone fa-regular fa-briefcase" />
                            </span>
                            Specialties
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {specialties.map((specialty, i) => (
                                <Badge
                                    key={`specialty-${i}`}
                                    color="coral"
                                    variant="outline"
                                >
                                    {specialty}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Industries */}
                {industries.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="badge badge-xs badge-purple">
                                <i className="fa-duotone fa-regular fa-industry" />
                            </span>
                            Industries
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {industries.map((industry, i) => (
                                <Badge
                                    key={`industry-${i}`}
                                    color="purple"
                                    variant="outline"
                                >
                                    {industry}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contact Info */}
                <div className={`p-4 border-4 ${accent.border}`}>
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 text-dark">
                        Contact
                    </h3>
                    <div className="space-y-2">
                        {email && (
                            <a
                                href={`mailto:${email}`}
                                className="flex items-center gap-2 text-sm text-dark/70 hover:text-dark transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-envelope w-5" />
                                <span className="truncate">{email}</span>
                            </a>
                        )}
                        {recruiter.phone && (
                            <div className="flex items-center gap-2 text-sm text-dark/70">
                                <i className="fa-duotone fa-regular fa-phone w-5" />
                                <span>{recruiter.phone}</span>
                            </div>
                        )}
                        {location && (
                            <div className="flex items-center gap-2 text-sm text-dark/70">
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
    accent,
    onClose,
    onRefresh,
}: {
    recruiterId: string;
    accent: AccentClasses;
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
                const res = await client.get<{ data: RecruiterWithUser }>(`/recruiters/${recruiterId}`, {
                    params: { include: "user,reputation" },
                });
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
                <div className="text-center">
                    <div className="flex justify-center gap-3 mb-4">
                        <div className="w-4 h-4 bg-coral animate-pulse" />
                        <div className="w-4 h-4 rounded-full bg-teal animate-pulse" />
                        <div className="w-4 h-4 rotate-45 bg-yellow animate-pulse" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Loading details...
                    </span>
                </div>
            </div>
        );
    }

    if (!recruiter) return null;

    return (
        <RecruiterDetail
            recruiter={recruiter}
            accent={accent}
            onClose={onClose}
            onRefresh={onRefresh}
        />
    );
}
