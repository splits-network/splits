"use client";

import { useState } from "react";
import { BaselBadge, BaselModal, BaselModalBody } from "@splits-network/basel-ui";
import { ModalPortal } from "@splits-network/shared-ui";
import { DetailLoader as CandidateDetailLoader } from "@/app/portal/candidates/components/shared/candidate-detail";
import { formatVerificationStatus } from "@/app/portal/candidates/types";
import { skillsList } from "@/app/portal/candidates/components/shared/helpers";
import type { Candidate } from "@/app/portal/candidates/types";
import type { BaselSemanticColor } from "@splits-network/basel-ui";

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function verificationColor(status?: string | null): BaselSemanticColor {
    switch (status) {
        case "verified": return "success";
        case "pending": return "warning";
        case "rejected": return "error";
        default: return "neutral";
    }
}

/* ─── Application Candidate Detail (Summary) ──────────────────────────── */

export function ApplicationCandidateDetail({ candidate }: { candidate: Candidate }) {
    const [showFullProfile, setShowFullProfile] = useState(false);

    const skills = skillsList(candidate);
    const topSkills = skills.slice(0, 8);
    const bioText = candidate.marketplace_profile?.bio || candidate.bio || candidate.description;

    return (
        <>
            <div className="space-y-6">
                {/* Contact Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                    {candidate.email && (
                        <a
                            href={`mailto:${candidate.email}`}
                            className="flex items-center gap-1.5 hover:text-primary transition-colors"
                        >
                            <i className="fa-duotone fa-regular fa-envelope" />
                            {candidate.email}
                        </a>
                    )}
                    {candidate.phone && (
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-phone" />
                            {candidate.phone}
                        </span>
                    )}
                    {candidate.location && (
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-location-dot" />
                            {candidate.location}
                        </span>
                    )}
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2">
                    <BaselBadge
                        color={verificationColor(candidate.verification_status)}
                        size="sm"
                        variant="soft"
                    >
                        {formatVerificationStatus(candidate.verification_status)}
                    </BaselBadge>
                    {candidate.has_active_relationship && (
                        <BaselBadge color="success" size="sm" variant="soft">
                            <i className="fa-duotone fa-regular fa-user-check" />
                            Your Candidate
                        </BaselBadge>
                    )}
                    {!candidate.has_active_relationship && candidate.has_other_active_recruiters && (
                        <BaselBadge color="warning" size="sm" variant="soft">
                            <i className="fa-duotone fa-regular fa-user-shield" />
                            Has Recruiter
                        </BaselBadge>
                    )}
                    {!candidate.has_active_relationship && !candidate.has_other_active_recruiters && candidate.has_pending_invitation && (
                        <BaselBadge color="info" size="sm" variant="soft">
                            <i className="fa-duotone fa-regular fa-clock" />
                            Invitation Pending
                        </BaselBadge>
                    )}
                </div>

                {/* Bio */}
                {bioText ? (
                    <div className="border-l-4 border-primary pl-4">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                            About
                        </h3>
                        <p className="text-sm text-base-content/70 leading-relaxed">
                            {bioText.length > 300 ? bioText.substring(0, 300).trim() + "..." : bioText}
                        </p>
                    </div>
                ) : (
                    <div className="border-l-4 border-base-300 pl-4">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                            About
                        </h3>
                        <p className="text-sm text-base-content/40 italic">No biography added.</p>
                    </div>
                )}

                {/* Work Mode */}
                <div className="flex flex-wrap items-center gap-2">
                    {candidate.open_to_remote && (
                        <BaselBadge color="success" size="sm" variant="soft">Remote</BaselBadge>
                    )}
                    {candidate.open_to_relocation && (
                        <BaselBadge color="info" size="sm" variant="soft">Relocation</BaselBadge>
                    )}
                </div>

                {/* Skills */}
                {topSkills.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {topSkills.map((skill, i) => (
                                <span key={i} className="bg-primary/10 text-primary px-3 py-1 text-sm font-semibold">
                                    {skill}
                                </span>
                            ))}
                            {skills.length > 8 && (
                                <span className="text-sm px-3 py-1 text-base-content/40">
                                    +{skills.length - 8} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* View Full Profile */}
                <button
                    type="button"
                    className="btn btn-primary btn-sm w-full"
                    onClick={() => setShowFullProfile(true)}
                >
                    <i className="fa-duotone fa-regular fa-user mr-1" />
                    View Full Profile
                </button>
            </div>

            {/* Full Profile Modal */}
            {showFullProfile && (
                <ModalPortal>
                    <BaselModal
                        isOpen
                        onClose={() => setShowFullProfile(false)}
                        maxWidth="max-w-5xl"
                        className="h-[90vh]"
                    >
                        <BaselModalBody padding="p-0" scrollable>
                            <CandidateDetailLoader
                                candidateId={candidate.id}
                                onClose={() => setShowFullProfile(false)}
                            />
                        </BaselModalBody>
                    </BaselModal>
                </ModalPortal>
            )}
        </>
    );
}
