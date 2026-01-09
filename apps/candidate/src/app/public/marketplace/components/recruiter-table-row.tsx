'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Recruiter {
    id: string;
    user_id: string;
    name?: string;
    email?: string;
    tagline?: string;
    specialization?: string;
    location?: string;
    years_experience?: number;
    bio?: string;
    total_placements?: number;
    success_rate?: number;
    reputation_score?: number;
    created_at: string;
}

interface RecruiterTableRowProps {
    recruiter: Recruiter;
}

export function RecruiterTableRow({ recruiter }: RecruiterTableRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            {/* Collapsed Row */}
            <tr
                className="hover cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <td>
                    <button className="btn btn-ghost btn-xs btn-circle">
                        <i className={`fa-duotone fa-regular ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                    </button>
                </td>
                <td>
                    <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-10 h-10">
                                <span className="text-sm">
                                    {recruiter.name?.charAt(0).toUpperCase() || 'R'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="font-bold">{recruiter.name || 'Anonymous Recruiter'}</div>
                            {recruiter.specialization && (
                                <div className="badge badge-sm badge-ghost mt-1">
                                    {recruiter.specialization}
                                </div>
                            )}
                        </div>
                    </div>
                </td>
                <td>
                    {recruiter.location && (
                        <div className="flex items-center gap-1 text-sm">
                            <i className="fa-duotone fa-regular fa-location-dot"></i>
                            {recruiter.location}
                        </div>
                    )}
                </td>
                <td>
                    {recruiter.reputation_score !== undefined && (
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <i
                                    key={i}
                                    className={`fa-duotone fa-regular fa-star text-xs ${i < Math.round(recruiter.reputation_score! / 20)
                                        ? 'text-warning'
                                        : 'text-base-300'
                                        }`}
                                ></i>
                            ))}
                            <span className="text-sm ml-1">
                                ({recruiter.total_placements || 0} placements)
                            </span>
                        </div>
                    )}
                </td>
                <td>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Navigate to recruiter detail or contact
                        }}
                    >
                        <i className="fa-duotone fa-regular fa-envelope"></i>
                        Contact
                    </button>
                </td>
            </tr>

            {/* Expanded Row */}
            {isExpanded && (
                <tr>
                    <td colSpan={5} className="bg-base-200">
                        <div className="p-4 space-y-4">
                            {/* Bio */}
                            {recruiter.bio && (
                                <div>
                                    <h4 className="font-semibold mb-2">About</h4>
                                    <p className="text-sm text-base-content/70">{recruiter.bio}</p>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {recruiter.years_experience !== undefined && (
                                    <div className="stat bg-base-100 rounded-lg p-3">
                                        <div className="stat-title text-xs">Experience</div>
                                        <div className="stat-value text-lg">
                                            {recruiter.years_experience} yrs
                                        </div>
                                    </div>
                                )}

                                {recruiter.total_placements !== undefined && (
                                    <div className="stat bg-base-100 rounded-lg p-3">
                                        <div className="stat-title text-xs">Total Placements</div>
                                        <div className="stat-value text-lg">
                                            {recruiter.total_placements}
                                        </div>
                                    </div>
                                )}

                                {recruiter.success_rate !== undefined && (
                                    <div className="stat bg-base-100 rounded-lg p-3">
                                        <div className="stat-title text-xs">Success Rate</div>
                                        <div className="stat-value text-lg">
                                            {recruiter.success_rate}%
                                        </div>
                                    </div>
                                )}

                                {recruiter.reputation_score !== undefined && (
                                    <div className="stat bg-base-100 rounded-lg p-3">
                                        <div className="stat-title text-xs">Rating</div>
                                        <div className="stat-value text-lg">
                                            {(recruiter.reputation_score / 20).toFixed(1)}
                                            <span className="text-sm ml-1">/ 5</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tagline */}
                            {recruiter.tagline && (
                                <div className="alert alert-info">
                                    <i className="fa-duotone fa-regular fa-quote-left"></i>
                                    <span className="italic">{recruiter.tagline}</span>
                                </div>
                            )}

                            {/* Contact Actions */}
                            <div className="flex gap-2">
                                <button className="btn btn-primary">
                                    <i className="fa-duotone fa-regular fa-envelope"></i>
                                    Send Message
                                </button>
                                {recruiter.email && (
                                    <a
                                        href={`mailto:${recruiter.email}`}
                                        className="btn btn-outline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <i className="fa-duotone fa-regular fa-at"></i>
                                        Email
                                    </a>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
