"use client";

import { Candidate } from "./types";

interface DetailHeaderProps {
    candidate: Candidate;
}

export default function DetailHeader({ candidate }: DetailHeaderProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-5 items-start">
                <div className="avatar avatar-placeholder">
                    <div className="bg-secondary text-neutral-content rounded-full w-20 h-20">
                        <span className="text-2xl font-bold">
                            {candidate.full_name?.charAt(0) || "?"}
                        </span>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-base-content">
                            {candidate.full_name}
                        </h1>
                        {candidate.verification_status === "verified" && (
                            <span className="badge badge-sm badge-ghost text-secondary gap-1">
                                <i className="fa-duotone fa-regular fa-badge-check"></i>{" "}
                                Verified
                            </span>
                        )}
                        {candidate.is_new && (
                            <span className="badge badge-sm badge-primary">
                                New
                            </span>
                        )}
                        {candidate.has_active_relationship && (
                            <span className="badge badge-sm badge-success gap-1">
                                <i className="fa-duotone fa-regular fa-user-check"></i>
                                Representing
                            </span>
                        )}
                        {!candidate.has_active_relationship &&
                            !candidate.has_other_active_recruiters && (
                                <span className="badge badge-sm badge-accent badge-soft gap-1 border-0">
                                    <i className="fa-duotone fa-regular fa-user-plus"></i>
                                    Available
                                </span>
                            )}
                        {candidate.has_other_active_recruiters && (
                            <span
                                className="badge badge-sm badge-warning gap-1"
                                title={`${candidate.other_active_recruiters_count} recruiter(s)`}
                            >
                                <i className="fa-duotone fa-regular fa-users"></i>
                                Represented
                            </span>
                        )}
                        {candidate.is_sourcer && (
                            <span className="badge badge-sm badge-info gap-1">
                                <i className="fa-duotone fa-regular fa-magnifying-glass"></i>
                                Sourcer
                            </span>
                        )}
                        {candidate.marketplace_visibility === "private" && (
                            <span className="badge badge-sm badge-neutral">
                                Private
                            </span>
                        )}
                    </div>

                    <div className="text-lg text-base-content/80">
                        {candidate.current_title || "No Title"}
                        {candidate.current_company && (
                            <span className="text-base-content/60">
                                {" "}
                                at {candidate.current_company}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-base-content/60 pt-1">
                        {candidate.email && (
                            <a
                                href={`mailto:${candidate.email}`}
                                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                {candidate.email}
                            </a>
                        )}
                        {candidate.phone && (
                            <div className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-phone"></i>
                                {candidate.phone}
                            </div>
                        )}
                        {candidate.location && (
                            <div className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-location-dot"></i>
                                {candidate.location}
                            </div>
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {candidate.linkedin_url && (
                            <a
                                href={candidate.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-ghost gap-1.5 text-base-content/70"
                            >
                                <i className="fa-brands fa-linkedin"></i>
                                LinkedIn
                            </a>
                        )}
                        {candidate.github_url && (
                            <a
                                href={candidate.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-ghost gap-1.5 text-base-content/70"
                            >
                                <i className="fa-brands fa-github"></i> GitHub
                            </a>
                        )}
                        {candidate.portfolio_url && (
                            <a
                                href={candidate.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-ghost gap-1.5 text-base-content/70"
                            >
                                <i className="fa-duotone fa-regular fa-globe"></i>{" "}
                                Portfolio
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
