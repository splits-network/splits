"use client";

import type { CompanyRelationship } from "../../types";
import { formatDate } from "../../types";
import { statusColorName } from "./status-color";
import { formatStatus } from "./helpers";
import { BaselBadge } from "@splits-network/basel-ui";

export function CompanyRelationshipTab({
    relationship,
}: {
    relationship: CompanyRelationship | null;
}) {
    if (!relationship) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <i className="fa-duotone fa-regular fa-handshake text-3xl text-base-content/20 mb-3" />
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/40">
                    No relationship
                </p>
                <p className="text-sm text-base-content/30 mt-2">
                    Request to represent this company to establish a relationship.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Status & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.15em] text-base-content/40 mb-1">Status</p>
                    <BaselBadge color={statusColorName(relationship.status)} size="sm">
                        {formatStatus(relationship.status)}
                    </BaselBadge>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.15em] text-base-content/40 mb-1">Type</p>
                    <p className="font-bold text-sm capitalize">{relationship.relationship_type}</p>
                </div>
                {relationship.relationship_start_date && (
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.15em] text-base-content/40 mb-1">Start Date</p>
                        <p className="font-bold text-sm">{formatDate(relationship.relationship_start_date)}</p>
                    </div>
                )}
                {relationship.relationship_end_date && (
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.15em] text-base-content/40 mb-1">End Date</p>
                        <p className="font-bold text-sm">{formatDate(relationship.relationship_end_date)}</p>
                    </div>
                )}
            </div>

            {/* Granular Permissions */}
            {relationship.permissions && (
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-4">Permissions</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {([
                            { key: "can_view_jobs" as const, label: "View Jobs" },
                            { key: "can_create_jobs" as const, label: "Create Jobs" },
                            { key: "can_edit_jobs" as const, label: "Edit Jobs" },
                            { key: "can_submit_candidates" as const, label: "Submit Candidates" },
                            { key: "can_view_applications" as const, label: "View Applications" },
                            { key: "can_advance_candidates" as const, label: "Advance Candidates" },
                        ]).map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-2">
                                <i className={`fa-solid ${relationship.permissions![key] ? "fa-check text-success" : "fa-xmark text-base-content/30"} text-sm`} />
                                <span className={`text-sm ${relationship.permissions![key] ? "text-base-content" : "text-base-content/40"}`}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
