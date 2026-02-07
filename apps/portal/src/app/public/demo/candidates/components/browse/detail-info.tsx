"use client";

import { Candidate } from "@splits-network/shared-types";

interface DetailInfoProps {
    candidate: Candidate;
}

export function DetailInfo({ candidate }: DetailInfoProps) {
    return (
        <div className="space-y-6">
            {/* Personal Information */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <h3 className="card-title text-base">
                        <i className="fa-duotone fa-regular fa-user text-primary"></i>
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">
                                <span className="label-text font-medium">
                                    Full Name
                                </span>
                            </label>
                            <p className="text-base-content">
                                {candidate.name}
                            </p>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-medium">
                                    Email
                                </span>
                            </label>
                            <p className="text-base-content">
                                {candidate.email}
                            </p>
                        </div>

                        {candidate.phone && (
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">
                                        Phone
                                    </span>
                                </label>
                                <p className="text-base-content">
                                    {candidate.phone}
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="label">
                                <span className="label-text font-medium">
                                    Location
                                </span>
                            </label>
                            <p className="text-base-content">
                                {candidate.location}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional Information */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <h3 className="card-title text-base">
                        <i className="fa-duotone fa-regular fa-briefcase text-primary"></i>
                        Professional Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">
                                <span className="label-text font-medium">
                                    Current Role
                                </span>
                            </label>
                            <p className="text-base-content">
                                {candidate.current_role || "Not specified"}
                            </p>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-medium">
                                    Experience Level
                                </span>
                            </label>
                            <p className="text-base-content">
                                {candidate.experience_level || "Not specified"}
                            </p>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-medium">
                                    Industry
                                </span>
                            </label>
                            <p className="text-base-content">
                                {candidate.industry || "Not specified"}
                            </p>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-medium">
                                    Skills
                                </span>
                            </label>
                            <div className="flex flex-wrap gap-1">
                                {candidate.skills?.length ? (
                                    candidate.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="badge badge-outline badge-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-base-content/50">
                                        No skills listed
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary */}
            {candidate.summary && (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body">
                        <h3 className="card-title text-base">
                            <i className="fa-duotone fa-regular fa-file-text text-primary"></i>
                            Summary
                        </h3>
                        <p className="text-base-content leading-relaxed">
                            {candidate.summary}
                        </p>
                    </div>
                </div>
            )}

            {/* Status & Verification */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <h3 className="card-title text-base">
                        <i className="fa-duotone fa-regular fa-shield-check text-primary"></i>
                        Status & Verification
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">
                                <span className="label-text font-medium">
                                    Status
                                </span>
                            </label>
                            <span
                                className={`badge ${
                                    candidate.status === "active"
                                        ? "badge-success"
                                        : candidate.status === "placed"
                                          ? "badge-info"
                                          : "badge-ghost"
                                }`}
                            >
                                {candidate.status}
                            </span>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-medium">
                                    Verification
                                </span>
                            </label>
                            {candidate.verified ? (
                                <span className="badge badge-success">
                                    <i className="fa-duotone fa-regular fa-badge-check mr-1"></i>
                                    Verified
                                </span>
                            ) : (
                                <span className="badge badge-warning">
                                    <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                    Pending
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-medium">
                                    Active Relationship
                                </span>
                            </label>
                            {candidate.has_active_relationship ? (
                                <span className="badge badge-primary">
                                    <i className="fa-duotone fa-regular fa-handshake mr-1"></i>
                                    Yes
                                </span>
                            ) : (
                                <span className="badge badge-ghost">No</span>
                            )}
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-medium">
                                    Date Added
                                </span>
                            </label>
                            <p className="text-base-content">
                                {new Date(
                                    candidate.created_at!,
                                ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
