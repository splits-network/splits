"use client";

import { WizardHelpZone } from "@splits-network/basel-ui";

interface AIReviewData {
    fit_score: number;
    recommendation: "strong_fit" | "good_fit" | "fair_fit" | "poor_fit";
    overall_summary: string;
    confidence_level: number;
    strengths: string[];
    concerns: string[];
    matched_skills: string[];
    missing_skills: string[];
    skills_match_percentage: number;
    matched_requirements: string[];
    missing_requirements: string[];
    required_years?: number;
    candidate_years?: number;
    meets_experience_requirement?: boolean;
    location_compatibility?: "perfect" | "good" | "challenging" | "mismatch";
}

interface StepAiResultsProps {
    review: AIReviewData;
    jobTitle: string;
}

const RECOMMENDATION_CONFIG = {
    strong_fit: {
        label: "Strong Fit",
        color: "text-success",
        bg: "bg-success/10",
        border: "border-success",
        icon: "fa-duotone fa-regular fa-circle-check",
        message: "You're a great match for this role.",
    },
    good_fit: {
        label: "Good Fit",
        color: "text-info",
        bg: "bg-info/10",
        border: "border-info",
        icon: "fa-duotone fa-regular fa-thumbs-up",
        message: "You're a solid match for this role.",
    },
    fair_fit: {
        label: "Fair Fit",
        color: "text-warning",
        bg: "bg-warning/10",
        border: "border-warning",
        icon: "fa-duotone fa-regular fa-circle-minus",
        message: "You meet some requirements but there are gaps.",
    },
    poor_fit: {
        label: "Needs Work",
        color: "text-error",
        bg: "bg-error/10",
        border: "border-error",
        icon: "fa-duotone fa-regular fa-circle-xmark",
        message: "This role may not be the best fit right now.",
    },
};

export default function StepAiResults({
    review,
    jobTitle,
}: StepAiResultsProps) {
    const config = RECOMMENDATION_CONFIG[review.recommendation];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-black tracking-tight mb-2">
                    Your AI fit analysis
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                    Here's how your profile matches <strong>{jobTitle}</strong>.
                    Review the results and decide if you'd like to submit.
                </p>
            </div>

            {/* Score + Recommendation hero */}
            <div className={`${config.bg} border-l-4 ${config.border} p-5`}>
                <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                        <div className={`text-3xl font-black ${config.color}`}>
                            {review.fit_score}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">
                            Fit Score
                        </div>
                    </div>
                    <div className="flex-1 border-l border-base-300 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                            <i className={`${config.icon} ${config.color}`} />
                            <span className={`font-black text-sm ${config.color}`}>
                                {config.label}
                            </span>
                        </div>
                        <p className="text-sm text-base-content/60">
                            {config.message}
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <WizardHelpZone
                title="AI Analysis"
                description="This analysis compares your Smart Resume against the job requirements, skills, and experience expectations."
                icon="fa-duotone fa-regular fa-brain-circuit"
                tips={[
                    "This score is visible only to you — employers see a separate review",
                    "You can improve your score by updating your Smart Resume",
                    "Even a fair fit can land an interview if your cover letter is strong",
                    "Go back and adjust your application if you want to improve your chances",
                ]}
            >
                <div className="space-y-5">
                    {/* Overall summary */}
                    <div className="bg-base-200 p-4">
                        <p className="text-sm text-base-content/70 leading-relaxed">
                            {review.overall_summary}
                        </p>
                    </div>

                    {/* Skills match */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40">
                                Skills Match
                            </p>
                            <span className="text-xs font-bold text-base-content/50">
                                {review.skills_match_percentage}%
                            </span>
                        </div>
                        <div className="w-full h-2 bg-base-300">
                            <div
                                className={`h-full transition-all ${
                                    review.skills_match_percentage >= 75
                                        ? "bg-success"
                                        : review.skills_match_percentage >= 50
                                          ? "bg-warning"
                                          : "bg-error"
                                }`}
                                style={{ width: `${review.skills_match_percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Strengths */}
                    {review.strengths.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-success mb-2">
                                <i className="fa-duotone fa-regular fa-circle-check mr-1" />
                                Strengths
                            </p>
                            <ul className="space-y-1.5">
                                {review.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-base-content/70">
                                        <i className="fa-solid fa-check text-success text-xs mt-1 shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Concerns */}
                    {review.concerns.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-warning mb-2">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation mr-1" />
                                Areas to Improve
                            </p>
                            <ul className="space-y-1.5">
                                {review.concerns.map((c, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-base-content/70">
                                        <i className="fa-solid fa-minus text-warning text-xs mt-1 shrink-0" />
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Matched vs Missing Skills */}
                    <div className="grid grid-cols-2 gap-4">
                        {review.matched_skills.length > 0 && (
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                                    Matched Skills
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {review.matched_skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="badge badge-sm bg-success/10 text-success border-success/20 font-semibold"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {review.missing_skills.length > 0 && (
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                                    Missing Skills
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {review.missing_skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="badge badge-sm bg-error/10 text-error border-error/20 font-semibold"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Experience */}
                    {review.required_years != null && (
                        <div className="flex items-center gap-3 p-3 bg-base-200">
                            <i className={`fa-duotone fa-regular fa-briefcase ${
                                review.meets_experience_requirement ? "text-success" : "text-warning"
                            }`} />
                            <div className="text-sm">
                                <span className="font-bold">Experience: </span>
                                <span className="text-base-content/60">
                                    {review.candidate_years ?? "?"} years
                                    {" "}(requires {review.required_years}+)
                                </span>
                                {review.meets_experience_requirement ? (
                                    <i className="fa-solid fa-check text-success text-xs ml-2" />
                                ) : (
                                    <i className="fa-solid fa-xmark text-warning text-xs ml-2" />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </WizardHelpZone>

            {/* Decision callout */}
            <div className="bg-base-200 border-l-4 border-base-300 p-4">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-circle-info text-base-content/40 mt-0.5" />
                    <div className="text-sm text-base-content/50">
                        <p className="font-bold text-base-content/70 mb-1">
                            Ready to submit?
                        </p>
                        <p>
                            Click <strong>Submit to Job</strong> to send your application to
                            the hiring team, or go back to make improvements first. Your
                            application will be saved as a draft either way.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
