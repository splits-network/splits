import React from "react";
import {
    STAGE_DISPLAY_NAMES,
    DIRECT_PIPELINE_STAGES,
    RECRUITER_PIPELINE_STAGES,
} from "./types";

interface PipelineProgressProps {
    currentStage: string;
    hasRecruiter: boolean;
    expiredAt?: string | null;
}

const TERMINAL_STAGES = ["rejected", "withdrawn"];

export function PipelineProgress({
    currentStage,
    hasRecruiter,
    expiredAt,
}: PipelineProgressProps) {
    const isTerminal = TERMINAL_STAGES.includes(currentStage);
    const isExpired = !!expiredAt;
    const stages = hasRecruiter
        ? [...RECRUITER_PIPELINE_STAGES]
        : [...DIRECT_PIPELINE_STAGES];

    // Find current stage index in pipeline
    // ai_reviewed maps to ai_review step, recruiter_proposed maps to draft, company_feedback maps to company_review
    const stageMapping: Record<string, string> = {
        ai_reviewed: "ai_review",
        recruiter_proposed: "draft",
        company_feedback: "company_review",
    };
    const mappedStage = stageMapping[currentStage] || currentStage;
    const currentIndex = stages.indexOf(mappedStage as any);

    return (
        <div className="overflow-x-auto pb-2">
            <ul className="steps steps-horizontal w-full">
                {stages.map((stage, index) => {
                    const isCompleted = currentIndex > index;
                    const isCurrent = currentIndex === index && !isTerminal;
                    const isActive = isCompleted || isCurrent;
                    const displayName = STAGE_DISPLAY_NAMES[stage] || stage;

                    return (
                        <li
                            key={stage}
                            className={`step text-xs ${isActive ? "step-primary" : ""}`}
                            data-content={
                                isCompleted
                                    ? "\u2713"
                                    : isCurrent
                                      ? "\u25CF"
                                      : ""
                            }
                        >
                            {displayName}
                        </li>
                    );
                })}
            </ul>
            {isTerminal && (
                <div className="flex justify-center mt-2">
                    <span
                        className={`badge ${currentStage === "rejected" ? "badge-error" : "badge-warning"} badge-sm gap-1`}
                    >
                        <i
                            className={`fa-duotone fa-regular ${currentStage === "rejected" ? "fa-times-circle" : "fa-undo"}`}
                        />
                        {STAGE_DISPLAY_NAMES[currentStage] || currentStage}
                    </span>
                </div>
            )}
            {isExpired && !isTerminal && (
                <div className="flex justify-center mt-2">
                    <span className="badge badge-warning badge-sm gap-1">
                        <i className="fa-duotone fa-regular fa-clock" />
                        Expired
                    </span>
                </div>
            )}
        </div>
    );
}
