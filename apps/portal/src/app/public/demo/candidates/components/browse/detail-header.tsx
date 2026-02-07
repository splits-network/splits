"use client";

import { Candidate } from "@splits-network/shared-types";

interface DetailHeaderProps {
    candidate: Candidate;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function DetailHeader({
    candidate,
    onEdit,
    onDelete,
}: DetailHeaderProps) {
    return (
        <div className="p-4">
            <div className="flex items-start justify-between">
                {/* Candidate Info */}
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="avatar avatar-placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-16">
                            <span className="text-lg font-bold">
                                {candidate.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            {candidate.name}
                        </h1>
                        <p className="text-base-content/70 mb-3">
                            {candidate.current_role ||
                                "Seeking new opportunities"}
                        </p>

                        <div className="flex items-center gap-3 mb-3">
                            {/* Status */}
                            <span
                                className={`badge ${
                                    candidate.status === "active"
                                        ? "badge-success"
                                        : candidate.status === "placed"
                                          ? "badge-info"
                                          : "badge-ghost"
                                }`}
                            >
                                <i className="fa-duotone fa-regular fa-circle mr-1"></i>
                                {candidate.status}
                            </span>

                            {/* Verification */}
                            {candidate.verified && (
                                <span className="badge badge-outline badge-success">
                                    <i className="fa-duotone fa-regular fa-badge-check mr-1"></i>
                                    Verified
                                </span>
                            )}

                            {/* Active Relationship */}
                            {candidate.has_active_relationship && (
                                <span className="badge badge-primary">
                                    <i className="fa-duotone fa-regular fa-handshake mr-1"></i>
                                    Active Relationship
                                </span>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-envelope text-base-content/50 w-4"></i>
                                <a
                                    href={`mailto:${candidate.email}`}
                                    className="link link-hover"
                                >
                                    {candidate.email}
                                </a>
                            </div>
                            {candidate.phone && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-phone text-base-content/50 w-4"></i>
                                    <a
                                        href={`tel:${candidate.phone}`}
                                        className="link link-hover"
                                    >
                                        {candidate.phone}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-location-dot text-base-content/50 w-4"></i>
                                <span>{candidate.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="dropdown dropdown-end">
                    <button
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-sm"
                    >
                        <i className="fa-duotone fa-regular fa-ellipsis-vertical"></i>
                    </button>
                    <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                            <button onClick={onEdit}>
                                <i className="fa-duotone fa-regular fa-pen"></i>
                                Edit Candidate
                            </button>
                        </li>
                        <li>
                            <button>
                                <i className="fa-duotone fa-regular fa-file-export"></i>
                                Export Profile
                            </button>
                        </li>
                        <li>
                            <button>
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                Send Message
                            </button>
                        </li>
                        <li className="divider"></li>
                        <li>
                            <button onClick={onDelete} className="text-error">
                                <i className="fa-duotone fa-regular fa-trash"></i>
                                Delete Candidate
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
