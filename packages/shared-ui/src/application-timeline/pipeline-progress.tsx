import React from "react";
import {
    STAGE_DISPLAY_NAMES,
    DIRECT_PIPELINE_STAGES,
    RECRUITER_PIPELINE_STAGES,
} from "./types";

interface PipelineProgressProps {
    currentStage: string;
    hasRecruiter: boolean;
}

const TERMINAL_STAGES = ["rejected", "withdrawn", "expired"];

export function PipelineProgress({
    currentStage,
    hasRecruiter,
}: PipelineProgressProps) {
    const isTerminal = TERMINAL_STAGES.includes(currentStage);
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
                        className={`badge ${currentStage === "rejected" ? "badge-error" : currentStage === "withdrawn" ? "badge-warning" : "badge-neutral"} badge-sm gap-1`}
                    >
                        <i
                            className={`fa-duotone fa-regular ${currentStage === "rejected" ? "fa-times-circle" : currentStage === "withdrawn" ? "fa-undo" : "fa-clock"}`}
                        />
                        {STAGE_DISPLAY_NAMES[currentStage] || currentStage}
                    </span>
                </div>
            )}
        </div>
    );
}
