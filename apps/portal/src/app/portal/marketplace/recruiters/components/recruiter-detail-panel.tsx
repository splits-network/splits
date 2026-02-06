"use client";

import React from "react";
import { MarketplaceRecruiterDTO } from "@splits-network/shared-types";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import UserAvatar from "@/components/common/UserAvatar";

// Extended type to include joined user data from Supabase
interface RecruiterWithUser extends MarketplaceRecruiterDTO {
    users?: {
        id: string;
        name: string;
        email: string;
        profile_image_url?: string;
    };
}

interface RecruiterDetailPanelProps {
    recruiter: RecruiterWithUser | null;
    onClose: () => void;
    onInvite?: () => void;
}

// Helper component for empty state display
const EmptyValue = ({ text = "Not provided" }: { text?: string }) => (
    <span className="text-base-content/40 italic">{text}</span>
);

export function RecruiterDetailPanel({
    recruiter,
    onClose,
    onInvite,
}: RecruiterDetailPanelProps) {
    if (!recruiter) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-base-content/40">
                <div className="bg-base-200 p-6 rounded-full mb-4">
                    <i className="fa-duotone fa-regular fa-user-magnifying-glass text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                    Select a Recruiter
                </h3>
                <p className="max-w-xs">
                    Browse the marketplace to find recruiters for your hiring
                    needs.
                </p>
            </div>
        );
    }

    // Get name from joined users table or fallback
    const displayName =
        recruiter.users?.name ||
        recruiter.name ||
        recruiter.users?.email ||
        "Unknown Recruiter";
    const displayEmail = recruiter.users?.email || recruiter.email;

    const specialties = recruiter.marketplace_specialties || [];
    const industries = recruiter.marketplace_industries || [];

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

    // Render marketplace_profile content
    const renderMarketplaceProfile = () => {
        if (
            !recruiter.marketplace_profile ||
            Object.keys(recruiter.marketplace_profile).length === 0
        ) {
            return null;
        }

        // If there's a description field, render it as markdown
        if (recruiter.marketplace_profile.description) {
            return (
                <MarkdownRenderer
                    content={recruiter.marketplace_profile.description}
                />
            );
        }

        // Otherwise render key-value pairs for other fields
        const entries = Object.entries(recruiter.marketplace_profile).filter(
            ([key, value]) => value !== null && value !== undefined && value !== "",
        );

        if (entries.length === 0) return null;

        return (
            <div className="space-y-2">
                {entries.map(([fieldKey, value]) => (
                    <div key={fieldKey} className="flex flex-col">
                        <span className="text-xs text-base-content/50 capitalize">
                            {fieldKey.replace(/_/g, " ")}
                        </span>
                        <span className="text-base-content/80">
                            {Array.isArray(value)
                                ? value.join(", ")
                                : String(value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const memberSince = formatMemberSince(recruiter.created_at);
    const marketplaceProfileContent = renderMarketplaceProfile();

    return (
        <div className="h-full flex flex-col">
            {/* Mobile Header with Back Button */}
            <div className="flex md:hidden items-center p-4 border-b border-base-300 bg-base-100">
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-sm mr-3"
                    aria-label="Back to list"
                >
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                </button>
                <h3 className="text-lg font-semibold flex-1">
                    Recruiter Profile
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <UserAvatar
                            user={{
                                name: displayName,
                                profile_image_url:
                                    recruiter.users?.profile_image_url,
                            }}
                            size="lg"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-bold truncate">
                                {displayName}
                            </h3>
                            <p className="text-base-content/70 mt-1">
                                {recruiter.marketplace_tagline || (
                                    <EmptyValue text="No tagline provided" />
                                )}
                            </p>
                            <p className="text-sm text-base-content/50 mt-1">
                                <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                                {recruiter.marketplace_location || (
                                    <EmptyValue text="Location not specified" />
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats - Always show all 4 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="stat bg-base-200 rounded-lg p-3">
                            <div className="stat-title text-xs">Placements</div>
                            <div className="stat-value text-lg text-primary">
                                {recruiter.total_placements !== undefined
                                    ? recruiter.total_placements
                                    : "—"}
                            </div>
                        </div>
                        <div className="stat bg-base-200 rounded-lg p-3">
                            <div className="stat-title text-xs">
                                Success Rate
                            </div>
                            <div className="stat-value text-lg text-success">
                                {recruiter.success_rate !== undefined
                                    ? `${Math.round(recruiter.success_rate)}%`
                                    : "—"}
                            </div>
                        </div>
                        <div className="stat bg-base-200 rounded-lg p-3">
                            <div className="stat-title text-xs">Reputation</div>
                            <div className="stat-value text-lg text-warning">
                                {recruiter.reputation_score !== undefined
                                    ? recruiter.reputation_score
                                    : "—"}
                            </div>
                        </div>
                        <div className="stat bg-base-200 rounded-lg p-3">
                            <div className="stat-title text-xs">
                                Avg. Time to Hire
                            </div>
                            <div className="stat-value text-lg text-info">
                                {recruiter.average_time_to_hire !== undefined
                                    ? `${recruiter.average_time_to_hire}d`
                                    : "—"}
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h4 className="card-title text-lg">
                                <i className="fa-duotone fa-regular fa-user mr-2"></i>
                                About
                            </h4>
                            {recruiter.bio ? (
                                <div className="prose prose-sm max-w-none text-base-content/80">
                                    <MarkdownRenderer content={recruiter.bio} />
                                </div>
                            ) : (
                                <p>
                                    <EmptyValue text="No bio provided" />
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Marketplace Profile - Only show if has content */}
                    {marketplaceProfileContent && (
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h4 className="card-title text-lg">
                                    <i className="fa-duotone fa-regular fa-id-card mr-2"></i>
                                    Profile Details
                                </h4>
                                <div className="prose prose-sm max-w-none text-base-content/80">
                                    {marketplaceProfileContent}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Specialties */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h4 className="card-title text-lg">
                                <i className="fa-duotone fa-regular fa-briefcase mr-2"></i>
                                Specialties
                            </h4>
                            {specialties.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {specialties.map((specialty, index) => (
                                        <span
                                            key={index}
                                            className="badge badge-primary badge-soft"
                                        >
                                            {specialty}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p>
                                    <EmptyValue text="No specialties listed" />
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Industries */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h4 className="card-title text-lg">
                                <i className="fa-duotone fa-regular fa-industry mr-2"></i>
                                Industries
                            </h4>
                            {industries.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {industries.map((industry, index) => (
                                        <span
                                            key={index}
                                            className="badge badge-secondary badge-soft"
                                        >
                                            {industry}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p>
                                    <EmptyValue text="No industries specified" />
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h4 className="card-title text-lg">
                                <i className="fa-duotone fa-regular fa-clock mr-2"></i>
                                Experience
                            </h4>
                            <p className="text-base-content/80">
                                {recruiter.marketplace_years_experience ? (
                                    `${recruiter.marketplace_years_experience}+ years in recruitment`
                                ) : (
                                    <EmptyValue text="Not specified" />
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h4 className="card-title text-lg">
                                <i className="fa-duotone fa-regular fa-address-card mr-2"></i>
                                Contact
                            </h4>
                            {displayEmail || recruiter.phone ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-envelope text-base-content/50 w-5"></i>
                                        <span>
                                            {displayEmail || (
                                                <EmptyValue text="No email provided" />
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-phone text-base-content/50 w-5"></i>
                                        <span>
                                            {recruiter.phone || (
                                                <EmptyValue text="No phone provided" />
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p>
                                    <EmptyValue text="Contact information not available" />
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Member Since */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h4 className="card-title text-lg">
                                <i className="fa-duotone fa-regular fa-calendar mr-2"></i>
                                Member Since
                            </h4>
                            <p className="text-base-content/80">
                                {memberSince || (
                                    <EmptyValue text="Not available" />
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            {onInvite && (
                <div className="p-4 border-t border-base-300 bg-base-100">
                    <button
                        onClick={onInvite}
                        className="btn btn-primary w-full"
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane mr-2"></i>
                        Invite to Company
                    </button>
                </div>
            )}
        </div>
    );
}
