"use client";

import { Candidate } from "@splits-network/shared-types";
import { UserAvatar } from "@/components/ui/user-avatar";

interface TableRowProps {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: () => void;
    onViewDetails: () => void;
    onEdit: () => void;
    onMessage: () => void;
    onDelete: () => void;
    onSubmitToJob: () => void;
}

export function TableRow({
    candidate,
    isSelected,
    onSelect,
    onViewDetails,
    onEdit,
    onMessage,
    onDelete,
    onSubmitToJob,
}: TableRowProps) {
    const getStatusBadge = () => {
        const statusConfig = {
            active: { class: "badge-success", text: "Active" },
            passive: { class: "badge-warning", text: "Passive" },
            not_interested: { class: "badge-error", text: "Not Interested" },
            placed: { class: "badge-info", text: "Placed" },
        };
        const config = statusConfig[candidate.status] || statusConfig.active;
        return (
            <span className={`badge badge-sm ${config.class}`}>
                {config.text}
            </span>
        );
    };

    const getVerificationIcon = () => {
        if (candidate.verification_status === "verified") {
            return (
                <div className="tooltip tooltip-top" data-tip="Verified">
                    <i className="fa-duotone fa-solid fa-circle-check text-success ml-2"></i>
                </div>
            );
        }
        if (candidate.verification_status === "pending") {
            return (
                <div
                    className="tooltip tooltip-top"
                    data-tip="Verification pending"
                >
                    <i className="fa-duotone fa-regular fa-clock text-warning ml-2"></i>
                </div>
            );
        }
        return null;
    };

    const getRelationshipIcon = () => {
        if (candidate.has_active_relationship) {
            return (
                <div
                    className="tooltip tooltip-top"
                    data-tip="Active relationship"
                >
                    <i className="fa-duotone fa-solid fa-handshake text-primary ml-1"></i>
                </div>
            );
        }
        if (candidate.has_pending_invitation) {
            return (
                <div
                    className="tooltip tooltip-top"
                    data-tip="Invitation pending"
                >
                    <i className="fa-duotone fa-regular fa-envelope text-info ml-1"></i>
                </div>
            );
        }
        return null;
    };

    return (
        <tr className={`hover ${isSelected ? "bg-primary/10" : ""}`}>
            {/* Selection */}
            <td>
                <input
                    type="checkbox"
                    className="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                />
            </td>

            {/* Name */}
            <td>
                <div className="flex items-center gap-3">
                    <UserAvatar
                        user={{
                            name: candidate.name,
                            profile_image_url: null, // Template - no real images
                        }}
                        size="sm"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">
                                {candidate.name}
                            </span>
                            {candidate.is_new && (
                                <span className="badge badge-xs badge-accent">
                                    New
                                </span>
                            )}
                            {getVerificationIcon()}
                            {getRelationshipIcon()}
                        </div>
                        {candidate.current_title && (
                            <div className="text-sm text-base-content/70">
                                {candidate.current_title}
                            </div>
                        )}
                        <div className="text-xs text-base-content/50">
                            {candidate.email}
                        </div>
                    </div>
                </div>
            </td>

            {/* Status */}
            <td>{getStatusBadge()}</td>

            {/* Location */}
            <td>
                <div className="text-sm">{candidate.location}</div>
                {candidate.marketplace_profile?.open_to_remote && (
                    <div className="text-xs text-base-content/50">
                        Open to remote
                    </div>
                )}
            </td>

            {/* Experience */}
            <td>
                {candidate.experience_years && (
                    <div className="text-sm">
                        {candidate.experience_years} years
                    </div>
                )}
                {candidate.skills && candidate.skills.length > 0 && (
                    <div className="text-xs text-base-content/50">
                        {candidate.skills.slice(0, 2).join(", ")}
                        {candidate.skills.length > 2 &&
                            ` +${candidate.skills.length - 2}`}
                    </div>
                )}
            </td>

            {/* Added */}
            <td>
                <div className="text-sm">
                    {new Date(candidate.created_at).toLocaleDateString()}
                </div>
                <div className="text-xs text-base-content/50">
                    {new Date(candidate.created_at).toLocaleDateString(
                        "en-US",
                        {
                            weekday: "short",
                        },
                    )}
                </div>
            </td>

            {/* Actions */}
            <td>
                <div className="flex items-center gap-1">
                    <button
                        className="btn btn-sm btn-ghost btn-square"
                        onClick={onViewDetails}
                        title="View Details"
                    >
                        <i className="fa-duotone fa-regular fa-eye"></i>
                    </button>

                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-sm btn-ghost btn-square"
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
            </td>
        </tr>
    );
}
