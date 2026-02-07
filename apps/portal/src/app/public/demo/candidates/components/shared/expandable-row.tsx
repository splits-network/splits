"use client";

import { useState, useCallback } from "react";
import { formatDate } from "@/lib/utils";
import { Candidate } from "@splits-network/shared-types";

export interface ExpandableRowProps {
    candidate: Candidate;
    isSelected?: boolean;
    onSelect?: (candidateId: string) => void;
    onViewDetails?: (candidateId: string) => void;
    onEdit?: (candidateId: string) => void;
    onMessage?: (candidate: Candidate) => void;
    onSubmitToJob?: (candidate: Candidate) => void;
}

export function ExpandableRow({
    candidate,
    isSelected = false,
    onSelect,
    onViewDetails,
    onEdit,
    onMessage,
    onSubmitToJob,
}: ExpandableRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleExpanded();
            }
        },
        [toggleExpanded],
    );

    const getInitials = (name: string) => {
        const names = name.split(" ");
        const firstInitial = names[0]?.[0]?.toUpperCase() || "";
        const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || "";
        return names.length > 1 ? firstInitial + lastInitial : firstInitial;
    };

    return (
        <>
            {/* Main row */}
            <tr
                className={`
                    hover:bg-base-200/50 cursor-pointer transition-colors
                    ${isExpanded ? "bg-base-100 shadow-lg" : ""}
                `}
                onClick={toggleExpanded}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="row"
                aria-expanded={isExpanded}
            >
                {/* Selection checkbox */}
                <td className="py-4">
                    <div className="flex justify-center">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={isSelected}
                            onChange={() => onSelect?.(candidate.id)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </td>

                <td className="py-4">
                    <div className="flex items-center gap-3">
                        {/* Expand toggle */}
                        <div className="btn btn-ghost btn-xs btn-square">
                            <i
                                className={`fa-duotone fa-regular fa-chevron-right text-xs transition-transform ${
                                    isExpanded ? "rotate-90" : ""
                                }`}
                            ></i>
                        </div>

                        {/* Candidate Avatar */}
                        <div className="avatar avatar-placeholder shrink-0">
                            <div className="bg-primary/10 text-primary rounded-full w-10 flex items-center justify-center text-sm font-semibold">
                                {getInitials(candidate.name)}
                            </div>
                        </div>

                        <div>
                            <div className="font-semibold">
                                {candidate.name}
                            </div>
                            <div className="text-sm text-base-content/60">
                                {candidate.email}
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div className="text-sm">
                        {candidate.current_title && (
                            <div className="font-medium">
                                {candidate.current_title}
                            </div>
                        )}
                        {candidate.current_company && (
                            <div className="text-base-content/60">
                                {candidate.current_company}
                            </div>
                        )}
                    </div>
                </td>
                <td>
                    <span className="text-sm">{candidate.location || "—"}</span>
                </td>
                <td>
                    {candidate.status && (
                        <span
                            className={`badge badge-sm ${
                                candidate.status === "active"
                                    ? "badge-success"
                                    : candidate.status === "inactive"
                                      ? "badge-neutral"
                                      : candidate.status === "pending"
                                        ? "badge-warning"
                                        : "badge-ghost"
                            }`}
                        >
                            {candidate.status}
                        </span>
                    )}
                </td>
                <td>
                    <span className="text-xs text-base-content/70">
                        {candidate.created_at
                            ? formatDate(candidate.created_at)
                            : "—"}
                    </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                        <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => onViewDetails?.(candidate.id)}
                            title="View Details"
                        >
                            <i className="fa-duotone fa-regular fa-eye"></i>
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => onEdit?.(candidate.id)}
                            title="Edit"
                        >
                            <i className="fa-duotone fa-regular fa-pen"></i>
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => onMessage?.(candidate)}
                            title="Send Message"
                        >
                            <i className="fa-duotone fa-regular fa-message"></i>
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => onSubmitToJob?.(candidate)}
                            title="Submit to Job"
                        >
                            <i className="fa-duotone fa-regular fa-paper-plane"></i>
                        </button>
                    </div>
                </td>
            </tr>

            {/* Expanded content row */}
            {isExpanded && (
                <tr>
                    <td colSpan={7} className="py-0">
                        <div className="bg-base-50 border-l-4 border-primary p-4 space-y-4">
                            {/* Contact Information */}
                            <div>
                                <h4 className="font-semibold text-sm mb-2">
                                    Contact Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    {candidate.email && (
                                        <div>
                                            <span className="text-base-content/60">
                                                Email:
                                            </span>
                                            <div className="font-medium">
                                                <a
                                                    href={`mailto:${candidate.email}`}
                                                    className="link link-hover"
                                                >
                                                    {candidate.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {candidate.phone && (
                                        <div>
                                            <span className="text-base-content/60">
                                                Phone:
                                            </span>
                                            <div className="font-medium">
                                                <a
                                                    href={`tel:${candidate.phone}`}
                                                    className="link link-hover"
                                                >
                                                    {candidate.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {candidate.location && (
                                        <div>
                                            <span className="text-base-content/60">
                                                Location:
                                            </span>
                                            <div className="font-medium">
                                                {candidate.location}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Professional Information */}
                            {(candidate.current_title ||
                                candidate.current_company ||
                                candidate.experience_years) && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">
                                        Professional Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        {candidate.current_title && (
                                            <div>
                                                <span className="text-base-content/60">
                                                    Current Title:
                                                </span>
                                                <div className="font-medium">
                                                    {candidate.current_title}
                                                </div>
                                            </div>
                                        )}
                                        {candidate.current_company && (
                                            <div>
                                                <span className="text-base-content/60">
                                                    Company:
                                                </span>
                                                <div className="font-medium">
                                                    {candidate.current_company}
                                                </div>
                                            </div>
                                        )}
                                        {candidate.experience_years && (
                                            <div>
                                                <span className="text-base-content/60">
                                                    Experience:
                                                </span>
                                                <div className="font-medium">
                                                    {candidate.experience_years}{" "}
                                                    years
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Skills */}
                            {candidate.skills &&
                                candidate.skills.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">
                                            Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-1">
                                            {candidate.skills
                                                .slice(0, 10)
                                                .map(
                                                    (
                                                        skill: string,
                                                        index: number,
                                                    ) => (
                                                        <span
                                                            key={index}
                                                            className="badge badge-sm badge-outline"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ),
                                                )}
                                            {candidate.skills.length > 10 && (
                                                <span className="badge badge-sm badge-ghost">
                                                    +
                                                    {candidate.skills.length -
                                                        10}{" "}
                                                    more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
