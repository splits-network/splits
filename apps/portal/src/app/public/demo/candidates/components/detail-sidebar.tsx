"use client";

import { Candidate } from "@splits-network/shared-types";
import { UserAvatar } from "@/components/ui/user-avatar";

interface DetailSidebarProps {
    candidate: Candidate;
    onClose: () => void;
    onEdit: () => void;
    onMessage: () => void;
    onSubmitToJob: () => void;
}

export function DetailSidebar({
    candidate,
    onClose,
    onEdit,
    onMessage,
    onSubmitToJob,
}: DetailSidebarProps) {
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
        const config = {
            verified: {
                class: "badge-success",
                icon: "fa-circle-check",
                text: "Verified",
            },
            pending: {
                class: "badge-warning",
                icon: "fa-clock",
                text: "Pending",
            },
            rejected: {
                class: "badge-error",
                icon: "fa-circle-xmark",
                text: "Rejected",
            },
        };
        const status = config[candidate.verification_status] || config.pending;
        return (
            <span className={`badge ${status.class}`}>
                <i className={`fa-duotone fa-regular ${status.icon}`}></i>
                {status.text}
            </span>
        );
    };

    return (
        <div className="w-96 bg-base-100 border-l border-base-200 h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-base-100 border-b border-base-200 p-4 z-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Candidate Details</h3>
                    <button
                        className="btn btn-sm btn-ghost btn-square"
                        onClick={onClose}
                    >
                        <i className="fa-duotone fa-regular fa-xmark"></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
                {/* Basic Info */}
                <div className="text-center">
                    <UserAvatar
                        user={{
                            name: candidate.name,
                            profile_image_url: null, // Template - no real images
                        }}
                        size="xl"
                        className="mx-auto mb-3"
                    />
                    <h2 className="text-xl font-bold">{candidate.name}</h2>
                    {candidate.current_title && (
                        <p className="text-base-content/70">
                            {candidate.current_title}
                        </p>
                    )}
                    <p className="text-sm text-base-content/50">
                        {candidate.location}
                    </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {getStatusBadge()}
                    {getVerificationBadge()}
                    {candidate.is_new && (
                        <span className="badge badge-accent">New</span>
                    )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                    <button className="btn btn-sm btn-outline" onClick={onEdit}>
                        <i className="fa-duotone fa-regular fa-pen"></i>
                        Edit
                    </button>
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={onMessage}
                    >
                        <i className="fa-duotone fa-regular fa-message"></i>
                        Message
                    </button>
                    <button
                        className="btn btn-sm btn-primary col-span-2"
                        onClick={onSubmitToJob}
                    >
                        <i className="fa-duotone fa-regular fa-briefcase"></i>
                        Submit to Job
                    </button>
                </div>

                {/* Contact Info */}
                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-address-book"></i>
                        Contact Information
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-envelope w-4"></i>
                            <span>{candidate.email}</span>
                        </div>
                        {candidate.phone && (
                            <div className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-phone w-4"></i>
                                <span>{candidate.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-location-dot w-4"></i>
                            <span>{candidate.location}</span>
                        </div>
                    </div>
                </div>

                {/* Experience */}
                {candidate.experience_years && (
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-briefcase"></i>
                            Experience
                        </h4>
                        <div className="text-sm">
                            <p>
                                {candidate.experience_years} years of experience
                            </p>
                            {candidate.current_title && (
                                <p className="text-base-content/70 mt-1">
                                    {candidate.current_title}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-code"></i>
                            Skills
                        </h4>
                        <div className="flex flex-wrap gap-1">
                            {candidate.skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="badge badge-sm badge-ghost"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bio */}
                {candidate.bio && (
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-user"></i>
                            About
                        </h4>
                        <p className="text-sm text-base-content/80">
                            {candidate.bio}
                        </p>
                    </div>
                )}

                {/* Marketplace Profile */}
                {candidate.marketplace_profile && (
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-store"></i>
                            Job Preferences
                        </h4>
                        <div className="space-y-3 text-sm">
                            {/* Salary */}
                            {(candidate.marketplace_profile
                                .desired_salary_min ||
                                candidate.marketplace_profile
                                    .desired_salary_max) && (
                                <div>
                                    <span className="font-medium">
                                        Desired Salary:
                                    </span>
                                    <p className="text-base-content/70">
                                        $
                                        {candidate.marketplace_profile.desired_salary_min?.toLocaleString() ||
                                            "0"}{" "}
                                        - $
                                        {candidate.marketplace_profile.desired_salary_max?.toLocaleString() ||
                                            "0"}
                                    </p>
                                </div>
                            )}

                            {/* Desired Roles */}
                            {candidate.marketplace_profile.desired_roles &&
                                candidate.marketplace_profile.desired_roles
                                    .length > 0 && (
                                    <div>
                                        <span className="font-medium">
                                            Desired Roles:
                                        </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {candidate.marketplace_profile.desired_roles.map(
                                                (role) => (
                                                    <span
                                                        key={role}
                                                        className="badge badge-xs badge-outline"
                                                    >
                                                        {role}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Preferred Locations */}
                            {candidate.marketplace_profile
                                .preferred_locations &&
                                candidate.marketplace_profile
                                    .preferred_locations.length > 0 && (
                                    <div>
                                        <span className="font-medium">
                                            Preferred Locations:
                                        </span>
                                        <div className="text-base-content/70">
                                            {candidate.marketplace_profile.preferred_locations.join(
                                                ", ",
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Remote & Other Preferences */}
                            <div className="space-y-1">
                                {candidate.marketplace_profile
                                    .open_to_remote && (
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        <span>Open to remote work</span>
                                    </div>
                                )}
                                {candidate.marketplace_profile
                                    .visa_sponsorship_required && (
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-passport text-info"></i>
                                        <span>Requires visa sponsorship</span>
                                    </div>
                                )}
                                {candidate.marketplace_profile
                                    .notice_period_weeks && (
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-calendar-clock"></i>
                                        <span>
                                            {
                                                candidate.marketplace_profile
                                                    .notice_period_weeks
                                            }{" "}
                                            weeks notice period
                                        </span>
                                    </div>
                                )}
                                {candidate.marketplace_profile
                                    .availability_date && (
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-calendar-check"></i>
                                        <span>
                                            Available from{" "}
                                            {new Date(
                                                candidate.marketplace_profile
                                                    .availability_date,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Relationship Status */}
                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-handshake"></i>
                        Relationship Status
                    </h4>
                    <div className="space-y-2 text-sm">
                        {candidate.has_active_relationship && (
                            <div className="flex items-center gap-2 text-success">
                                <i className="fa-duotone fa-solid fa-circle-check"></i>
                                <span>Has active recruiter relationship</span>
                            </div>
                        )}
                        {candidate.has_pending_invitation && (
                            <div className="flex items-center gap-2 text-info">
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                <span>Invitation pending</span>
                            </div>
                        )}
                        {candidate.has_other_active_recruiters && (
                            <div className="flex items-center gap-2 text-warning">
                                <i className="fa-duotone fa-regular fa-users"></i>
                                <span>
                                    {candidate.other_active_recruiters_count ||
                                        0}{" "}
                                    other active recruiters
                                </span>
                            </div>
                        )}
                        {candidate.is_sourcer && (
                            <div className="flex items-center gap-2 text-primary">
                                <i className="fa-duotone fa-regular fa-search"></i>
                                <span>Sourcer candidate</span>
                            </div>
                        )}
                        {!candidate.has_active_relationship &&
                            !candidate.has_pending_invitation &&
                            !candidate.has_other_active_recruiters && (
                                <div className="flex items-center gap-2 text-base-content/50">
                                    <i className="fa-duotone fa-regular fa-circle"></i>
                                    <span>No active relationships</span>
                                </div>
                            )}
                    </div>
                </div>

                {/* Timeline */}
                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-clock"></i>
                        Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-plus-circle w-4"></i>
                            <div>
                                <span className="font-medium">Added:</span>
                                <p className="text-base-content/70">
                                    {new Date(
                                        candidate.created_at,
                                    ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                        {candidate.updated_at &&
                            candidate.updated_at !== candidate.created_at && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-pen w-4"></i>
                                    <div>
                                        <span className="font-medium">
                                            Last updated:
                                        </span>
                                        <p className="text-base-content/70">
                                            {new Date(
                                                candidate.updated_at,
                                            ).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
