"use client";

import { Badge, Card } from "@splits-network/memphis-ui";
import type { Candidate } from "../../types";
import { formatVerificationStatus } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import {
    candidateName,
    candidateInitials,
    candidateTitle,
    salaryDisplay,
    isNew,
    skillsList,
} from "../shared/helpers";
import CandidateActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
    candidate,
    accent,
    isSelected,
    onSelect,
    onRefresh,
}: {
    candidate: Candidate;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const name = candidateName(candidate);
    const skills = skillsList(candidate);

    return (
        <Card
            onClick={onSelect}
            className={`cursor-pointer border-4 transition-transform hover:-translate-y-1 relative ${isSelected ? ac.border : "border-dark/30"}`}
        >
            {/* Corner accent */}
            <div
                className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`}
            />

            <div className="card-body">
                {isNew(candidate) && (
                    <Badge
                        variant="yellow"
                        className="mb-2"
                    >
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </Badge>
                )}
                <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1 text-dark">
                    {name}
                </h3>
                <div
                    className={`text-sm font-bold mb-2 ${ac.text}`}
                >
                    {candidateTitle(candidate)}
                </div>

                {candidate.location && (
                    <div className="flex items-center gap-1 text-sm mb-3 text-dark/60">
                        <i className="fa-duotone fa-regular fa-location-dot" />
                        {candidate.location}
                    </div>
                )}

                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-black text-dark">
                        {salaryDisplay(candidate) || "Open to offers"}
                    </span>
                    <Badge
                        variant={statusVariant(candidate.verification_status)}
                    >
                        {formatVerificationStatus(candidate.verification_status)}
                    </Badge>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 3).map((skill) => (
                        <Badge
                            key={skill}
                            variant="purple"
                            style="outline"
                        >
                            {skill}
                        </Badge>
                    ))}
                    {skills.length > 3 && (
                        <Badge variant="yellow" style="outline">
                            +{skills.length - 3}
                        </Badge>
                    )}
                </div>
            </div>
            <div
                className={`card-actions justify-between gap-3 pt-3 border-t-2 ${ac.border}/30`}
            >
                {/* Candidate footer */}
                <div className="flex flex-row items-center gap-2 mt-2 min-w-0">
                    <div
                        className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 ${ac.border} bg-cream text-sm font-bold text-dark`}
                    >
                        {candidateInitials(name)}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-dark truncate">
                            {name}
                        </div>
                        <div className="text-sm text-dark/50 truncate">
                            {candidate.has_active_relationship
                                ? "Representing"
                                : "Available"}
                        </div>
                    </div>
                </div>
                <div className="mt-2 shrink-0">
                    <CandidateActionsToolbar
                        candidate={candidate}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewDetails: false,
                        }}
                    />
                </div>
            </div>
        </Card>
    );
}
