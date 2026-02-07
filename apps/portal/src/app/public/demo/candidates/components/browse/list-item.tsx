"use client";

import { Candidate } from "@splits-network/shared-types";

interface ListItemProps {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: () => void;
}

export function ListItem({ candidate, isSelected, onSelect }: ListItemProps) {
    return (
        <button
            className={`w-full p-4 text-left hover:bg-base-100 transition-colors border-r-2 ${
                isSelected
                    ? "bg-primary/5 border-primary"
                    : "border-transparent"
            }`}
            onClick={onSelect}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="avatar avatar-placeholder shrink-0">
                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                        <span className="text-sm font-medium">
                            {candidate.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                            {candidate.name}
                        </h4>
                        {candidate.has_active_relationship && (
                            <span className="badge badge-primary badge-xs">
                                Mine
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-base-content/70 mb-2 truncate">
                        {candidate.current_role || "Seeking new opportunities"}
                    </p>

                    <div className="flex items-center gap-2">
                        {/* Status */}
                        <span
                            className={`badge badge-xs ${
                                candidate.status === "active"
                                    ? "badge-success"
                                    : candidate.status === "placed"
                                      ? "badge-info"
                                      : "badge-ghost"
                            }`}
                        >
                            {candidate.status}
                        </span>

                        {/* Verification */}
                        {candidate.verified && (
                            <span className="badge badge-xs badge-outline">
                                <i className="fa-duotone fa-regular fa-badge-check mr-1 text-xs"></i>
                                Verified
                            </span>
                        )}
                    </div>

                    {/* Meta info */}
                    <div className="text-xs text-base-content/50 mt-2">
                        {candidate.location} • Added{" "}
                        {new Date(candidate.created_at!).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </button>
    );
}
