"use client";

import React from "react";
import { MarketplaceRecruiterDTO } from "@splits-network/shared-types";

// Extended type to include joined user data from Supabase
interface RecruiterWithUser extends MarketplaceRecruiterDTO {
    users?: {
        id: string;
        name: string;
        email: string;
    };
}

interface RecruiterDetailPanelProps {
    recruiter: RecruiterWithUser | null;
    onClose: () => void;
    onInvite?: () => void;
}

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

    // Get initials for avatar (defensive)
    const getInitials = (name: string | undefined | null) => {
        if (!name) return "??";
        const parts = name.trim().split(" ");
        if (parts.length >= 2 && parts[0] && parts[1]) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const specialties = recruiter.marketplace_specialties || [];
    const industries = recruiter.marketplace_industries || [];

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
                        <div className="avatar avatar-placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-16 h-16">
                                <span className="text-xl">
                                    {getInitials(displayName)}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-bold truncate">
                                {displayName}
                            </h3>
                            {recruiter.marketplace_tagline && (
                                <p className="text-base-content/70 mt-1">
                                    {recruiter.marketplace_tagline}
                                </p>
                            )}
                            {recruiter.marketplace_location && (
                                <p className="text-sm text-base-content/50 mt-1">
                                    <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                                    {recruiter.marketplace_location}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    {(recruiter.total_placements !== undefined ||
                        recruiter.success_rate !== undefined ||
                        recruiter.reputation_score !== undefined) && (
                        <div className="grid grid-cols-3 gap-3">
                            {recruiter.total_placements !== undefined && (
                                <div className="stat bg-base-200 rounded-lg p-3">
                                    <div className="stat-title text-xs">
                                        Placements
                                    </div>
                                    <div className="stat-value text-lg text-primary">
                                        {recruiter.total_placements}
                                    </div>
                                </div>
                            )}
                            {recruiter.success_rate !== undefined && (
                                <div className="stat bg-base-200 rounded-lg p-3">
                                    <div className="stat-title text-xs">
                                        Success Rate
                                    </div>
                                    <div className="stat-value text-lg text-success">
                                        {Math.round(recruiter.success_rate)}%
                                    </div>
                                </div>
                            )}
                            {recruiter.reputation_score !== undefined && (
                                <div className="stat bg-base-200 rounded-lg p-3">
                                    <div className="stat-title text-xs">
                                        Reputation
                                    </div>
                                    <div className="stat-value text-lg text-warning">
                                        {recruiter.reputation_score}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bio */}
                    {recruiter.bio && (
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h4 className="card-title text-lg">
                                    <i className="fa-duotone fa-regular fa-user mr-2"></i>
                                    About
                                </h4>
                                <p className="text-base-content/80 whitespace-pre-wrap">
                                    {recruiter.bio}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Specialties */}
                    {specialties.length > 0 && (
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h4 className="card-title text-lg">
                                    <i className="fa-duotone fa-regular fa-briefcase mr-2"></i>
                                    Specialties
                                </h4>
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
                            </div>
                        </div>
                    )}

                    {/* Industries */}
                    {industries.length > 0 && (
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h4 className="card-title text-lg">
                                    <i className="fa-duotone fa-regular fa-industry mr-2"></i>
                                    Industries
                                </h4>
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
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {recruiter.marketplace_years_experience && (
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h4 className="card-title text-lg">
                                    <i className="fa-duotone fa-regular fa-clock mr-2"></i>
                                    Experience
                                </h4>
                                <p className="text-base-content/80">
                                    {recruiter.marketplace_years_experience}+
                                    years in recruitment
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Contact Info */}
                    {(displayEmail || recruiter.phone) && (
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h4 className="card-title text-lg">
                                    <i className="fa-duotone fa-regular fa-address-card mr-2"></i>
                                    Contact
                                </h4>
                                <div className="space-y-2">
                                    {displayEmail && (
                                        <div className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-envelope text-base-content/50"></i>
                                            <span>{displayEmail}</span>
                                        </div>
                                    )}
                                    {recruiter.phone && (
                                        <div className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-phone text-base-content/50"></i>
                                            <span>{recruiter.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
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
