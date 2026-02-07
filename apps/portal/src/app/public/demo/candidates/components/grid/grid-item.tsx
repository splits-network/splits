"use client";

import { Candidate } from "@splits-network/shared-types";
import { UserAvatar } from "@/components/ui/user-avatar";

interface GridItemProps {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: () => void;
    onViewDetails: () => void;
    onEdit: () => void;
    onMessage: () => void;
    onDelete: () => void;
    onSubmitToJob: () => void;
}

export function GridItem({
    candidate,
    isSelected,
    onSelect,
    onViewDetails,
    onEdit,
    onMessage,
    onDelete,
    onSubmitToJob,
}: GridItemProps) {
    const getStatusBadge = () => {
        const statusConfig = {
            active: { class: "badge-success", text: "Active" },
            passive: { class: "badge-warning", text: "Passive" },
            not_interested: { class: "badge-error", text: "Not Interested" },
            placed: { class: "badge-info", text: "Placed" },
        };
        const config = statusConfig[candidate.status] || statusConfig.active;
        return <span className={`badge ${config.class}`}>{config.text}</span>;
    };

    const getVerificationBadge = () => {
        if (candidate.verification_status === "verified") {
            return (
                <div
                    className="tooltip tooltip-top"
                    data-tip="Verified candidate"
                >
                    <i className="fa-duotone fa-solid fa-circle-check text-success"></i>
                </div>
            );
        }
        if (candidate.verification_status === "pending") {
            return (
                <div
                    className="tooltip tooltip-top"
                    data-tip="Verification pending"
                >
                    <i className="fa-duotone fa-regular fa-clock text-warning"></i>
                </div>
            );
        }
        return null;
    };

    const getRelationshipIndicator = () => {
        if (candidate.has_active_relationship) {
            return (
                <div
                    className="tooltip tooltip-top"
                    data-tip="Active relationship"
                >
                    <i className="fa-duotone fa-solid fa-handshake text-primary"></i>
                </div>
            );
        }
        if (candidate.has_pending_invitation) {
            return (
                <div
                    className="tooltip tooltip-top"
                    data-tip="Invitation pending"
                >
                    <i className="fa-duotone fa-regular fa-envelope text-info"></i>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            className={`card bg-base-100 shadow-md hover:shadow-lg transition-shadow ${isSelected ? "ring-2 ring-primary" : ""}`}
        >
            <div className="card-body p-4">
                {/* Header with selection and status */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={isSelected}
                            onChange={onSelect}
                        />
                        {candidate.is_new && (
                            <span className="badge badge-sm badge-accent">
                                New
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {getVerificationBadge()}
                        {getRelationshipIndicator()}
                    </div>
                </div>

                {/* Candidate info */}
                <div className="flex items-start gap-3 mb-3">
                    <UserAvatar
                        user={{
                            name: candidate.name,
                            profile_image_url: null, // Template - no real images
                        }}
                        size="md"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                            {candidate.name}
                        </h3>
                        {candidate.current_title && (
                            <p className="text-sm text-base-content/70 truncate">
                                {candidate.current_title}
                            </p>
                        )}
                        <p className="text-xs text-base-content/50">
                            {candidate.location}
                        </p>
                    </div>
                </div>

                {/* Status and experience */}
                <div className="flex items-center justify-between mb-3">
                    {getStatusBadge()}
                    {candidate.experience_years && (
                        <span className="text-xs text-base-content/70">
                            {candidate.experience_years} years exp
                        </span>
                    )}
                </div>

                {/* Skills preview */}
                {candidate.skills && candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {candidate.skills.slice(0, 3).map((skill) => (
                            <span
                                key={skill}
                                className="badge badge-sm badge-ghost"
                            >
                                {skill}
                            </span>
                        ))}
                        {candidate.skills.length > 3 && (
                            <span className="text-xs text-base-content/50">
                                +{candidate.skills.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        className="btn btn-sm btn-outline flex-1"
                        onClick={onViewDetails}
                    >
                        View Details
                    </button>

                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-sm btn-square btn-ghost"
                        >
                            <i className="fa-duotone fa-regular fa-ellipsis-vertical"></i>
                        </div>
                        <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-1 shadow-lg border border-base-200">
                            <li>
                                <button onClick={onEdit}>
                                    <i className="fa-duotone fa-regular fa-pen"></i>
                                    Edit
                                </button>
                            </li>
                            <li>
                                <button onClick={onMessage}>
                                    <i className="fa-duotone fa-regular fa-message"></i>
                                    Message
                                </button>
                            </li>
                            <li>
                                <button onClick={onSubmitToJob}>
                                    <i className="fa-duotone fa-regular fa-briefcase"></i>
                                    Submit to Job
                                </button>
                            </li>
                            <li>
                                <hr className="my-1" />
                            </li>
                            <li>
                                <button
                                    onClick={onDelete}
                                    className="text-error"
                                >
                                    <i className="fa-duotone fa-regular fa-trash"></i>
                                    Delete
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer with timestamp */}
                <div className="text-xs text-base-content/40 mt-2">
                    Added {new Date(candidate.created_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}
