"use client";

import { useState } from "react";
import { BaselModal, BaselModalBody, BaselModalHeader } from "@splits-network/basel-ui";
import { ModalPortal } from "@splits-network/shared-ui";
import ResumeTab from "./resume-tab";
import type { ApplicationResumeData } from "@splits-network/shared-types";

const SOURCE_LABELS: Record<string, string> = {
    mcp_tool: "Submitted via ChatGPT App",
    custom_gpt: "Submitted via ChatGPT",
    document_extraction: "Extracted from uploaded document",
};

interface ResumeSummaryTabProps {
    resumeData?: ApplicationResumeData | null;
}

export function ResumeSummaryTab({ resumeData }: ResumeSummaryTabProps) {
    const [showFull, setShowFull] = useState(false);

    if (!resumeData) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-file-user text-4xl mb-2 block" />
                <p>No resume data available for this application.</p>
            </div>
        );
    }

    const recentExperience = resumeData.experience?.[0];
    const topSkills = (resumeData.skills || []).slice(0, 8);

    return (
        <>
            <div className="space-y-6">
                {/* Summary */}
                {resumeData.summary && (
                    <div className="border-l-4 border-primary pl-4">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                            Summary
                        </h3>
                        <p className="text-sm text-base-content/70 leading-relaxed">
                            {resumeData.summary.length > 300
                                ? resumeData.summary.substring(0, 300).trim() + "..."
                                : resumeData.summary}
                        </p>
                    </div>
                )}

                {/* Most Recent Experience */}
                {recentExperience && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Most Recent Role
                        </h3>
                        <div className="border-l-2 border-base-300 pl-4">
                            <div className="font-bold text-sm">{recentExperience.title}</div>
                            <div className="text-sm text-base-content/60">
                                {recentExperience.company}
                                {recentExperience.location && ` \u2022 ${recentExperience.location}`}
                            </div>
                            <div className="text-sm text-base-content/40">
                                {recentExperience.start_date || ""}
                                {recentExperience.start_date && (recentExperience.end_date || recentExperience.is_current) && " \u2013 "}
                                {recentExperience.is_current ? "Present" : recentExperience.end_date || ""}
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Skills */}
                {topSkills.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {topSkills.map((s, i) => (
                                <span key={i} className="text-sm px-2 py-1 bg-base-200 text-base-content/70">
                                    {s.name}
                                </span>
                            ))}
                            {(resumeData.skills?.length || 0) > 8 && (
                                <span className="text-sm px-2 py-1 text-base-content/40">
                                    +{(resumeData.skills?.length || 0) - 8} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Source */}
                <div className="flex items-center gap-2 text-sm text-base-content/40 pt-2 border-t border-base-300">
                    <i className="fa-duotone fa-regular fa-circle-info" />
                    {SOURCE_LABELS[resumeData.source] || resumeData.source}
                </div>

                {/* View Full Resume */}
                <button
                    type="button"
                    className="btn btn-primary btn-sm w-full"
                    onClick={() => setShowFull(true)}
                >
                    <i className="fa-duotone fa-regular fa-file-user mr-1" />
                    View Full Resume
                </button>
            </div>

            {/* Full Resume Modal */}
            {showFull && (
                <ModalPortal>
                    <BaselModal
                        isOpen
                        onClose={() => setShowFull(false)}
                        maxWidth="max-w-4xl"
                        className="h-[90vh]"
                    >
                        <BaselModalHeader
                            title="Full Resume"
                            icon="fa-duotone fa-regular fa-file-user"
                            onClose={() => setShowFull(false)}
                        />
                        <BaselModalBody scrollable>
                            <ResumeTab resumeData={resumeData} />
                        </BaselModalBody>
                    </BaselModal>
                </ModalPortal>
            )}
        </>
    );
}
