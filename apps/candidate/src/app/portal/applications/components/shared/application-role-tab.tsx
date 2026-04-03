"use client";

import { MarkdownRenderer } from "@splits-network/shared-ui";
import type { Application } from "../../types";

interface ApplicationRoleTabProps {
    application: Application;
}

export function ApplicationRoleTab({ application }: ApplicationRoleTabProps) {
    const job = application.job;
    const requirements = job?.job_requirements || [];
    const mandatoryReqs = requirements
        .filter((r) => r.requirement_type === "mandatory")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const preferredReqs = requirements
        .filter((r) => r.requirement_type === "preferred")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    const description =
        job?.candidate_description || job?.recruiter_description || job?.description;

    if (!description && mandatoryReqs.length === 0 && preferredReqs.length === 0) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-briefcase text-4xl mb-2 block" />
                <p>No role details available for this application.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Job Description */}
            {description && (
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Job Description
                    </h3>
                    <MarkdownRenderer
                        content={description}
                        className="prose prose-sm max-w-none text-base-content/70 leading-relaxed"
                    />
                </div>
            )}

            {/* Must Have Requirements */}
            {mandatoryReqs.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Must Have
                    </h3>
                    <ul className="space-y-2">
                        {mandatoryReqs.map((req, i) => (
                            <li
                                key={req.id || i}
                                className="flex items-start gap-3 text-base-content/70"
                            >
                                <i className="fa-duotone fa-regular fa-check text-primary text-xs mt-1.5 flex-shrink-0" />
                                <span className="leading-relaxed">{req.description}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Preferred Requirements */}
            {preferredReqs.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Preferred
                    </h3>
                    <ul className="space-y-2">
                        {preferredReqs.map((req, i) => (
                            <li
                                key={req.id || i}
                                className="flex items-start gap-3 text-base-content/70"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right text-secondary text-xs mt-1.5 flex-shrink-0" />
                                <span className="leading-relaxed">{req.description}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Pre-screen Answers */}
            {application.pre_screen_answers && application.pre_screen_answers.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Pre-Screen Questions
                    </h3>
                    <div className="space-y-4">
                        {application.pre_screen_answers.map((answer: any, index: number) => (
                            <div key={index} className="border-l-4 border-primary pl-4">
                                <p className="font-semibold mb-1">
                                    {answer.question || `Question ${index + 1}`}
                                </p>
                                <p className="text-sm text-base-content/70">
                                    {typeof answer.answer === "boolean"
                                        ? answer.answer
                                            ? "Yes"
                                            : "No"
                                        : Array.isArray(answer.answer)
                                          ? answer.answer.join(", ")
                                          : answer.answer || "No answer"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
