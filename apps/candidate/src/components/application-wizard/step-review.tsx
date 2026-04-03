"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { WizardHelpZone } from "@splits-network/basel-ui";

interface PreScreenQuestion {
    question: string;
    question_type: "text" | "yes_no" | "select" | "multi_select";
    is_required: boolean;
    options?: string[];
    disclaimer?: string;
}

interface Answer {
    index: number;
    answer: string | string[] | boolean;
}

interface SelectedRecruiter {
    recruiter_id: string;
    recruiter_name: string;
    recruiter_email: string;
}

export type ReviewProcessingStage =
    | "idle"
    | "tailoring"
    | "creating"
    | "reviewing"
    | "complete"
    | "error";

interface TailoredResumeData {
    summary: string;
    experience: {
        company: string;
        title: string;
        location?: string;
        start_date?: string;
        end_date?: string;
        is_current?: boolean;
        description?: string;
        achievements?: string[];
    }[];
    relevant_projects: {
        name: string;
        description?: string;
        outcomes?: string;
        skills_used?: string[];
    }[];
    skills: {
        name: string;
        category?: string;
        proficiency?: string;
        relevance_note?: string;
    }[];
    education: {
        institution: string;
        degree?: string;
        field_of_study?: string;
    }[];
    certifications: {
        name: string;
        issuer?: string;
        date_obtained?: string;
    }[];
}

interface StepReviewProps {
    job: any;
    documents: any[];
    selectedDocuments: string[];
    coverLetter?: string;
    questions: PreScreenQuestion[];
    answers: Answer[];
    additionalNotes: string;
    selectedRecruiter?: SelectedRecruiter | null;
    error?: string | null;
    processingStage: ReviewProcessingStage;
    tailoredResume?: TailoredResumeData | null;
}

const STAGE_MESSAGES: Record<
    Exclude<ReviewProcessingStage, "idle" | "complete" | "error">,
    { label: string; description: string }
> = {
    tailoring: {
        label: "Generating your tailored resume...",
        description: "AI is optimizing your Smart Resume for this specific role.",
    },
    creating: {
        label: "Creating your application...",
        description: "Saving your application data",
    },
    reviewing: {
        label: "Running AI fit analysis...",
        description:
            "Our AI is analyzing your profile against the job requirements. This usually takes 15-30 seconds.",
    },
};

export default function StepReview({
    job,
    documents,
    selectedDocuments,
    coverLetter,
    questions,
    answers,
    additionalNotes,
    selectedRecruiter,
    error = null,
    processingStage,
    tailoredResume,
}: StepReviewProps) {
    const [showPreview, setShowPreview] = useState(false);
    const selectedDocs = documents.filter((d) =>
        selectedDocuments.includes(d.id),
    );
    const coverLetterDocs = selectedDocs.filter(
        (d) => d.document_type === "cover_letter",
    );
    const supportingDocs = selectedDocs.filter(
        (d) =>
            d.document_type !== "resume" &&
            d.document_type !== "cover_letter",
    );

    const getQuestionText = (index: number) => {
        return questions[index]?.question || "Unknown question";
    };

    const formatAnswer = (answer: string | string[] | boolean) => {
        if (typeof answer === "boolean") return answer ? "Yes" : "No";
        if (Array.isArray(answer)) return answer.join(", ");
        return answer;
    };

    const isProcessing =
        processingStage === "tailoring" ||
        processingStage === "creating" ||
        processingStage === "reviewing";

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-black tracking-tight mb-2">
                    Review your application
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                    Make sure everything looks right, then get your AI fit
                    analysis.
                </p>
            </div>

            {error && (
                <div className="bg-error/5 border-l-4 border-error p-4">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error mt-0.5" />
                        <span className="text-sm">{error}</span>
                    </div>
                </div>
            )}

            {/* AI Review Processing State */}
            {isProcessing && (
                <div className="bg-primary/5 border-l-4 border-primary p-5">
                    <div className="flex items-center gap-4">
                        <span className="loading loading-spinner loading-md text-primary" />
                        <div>
                            <p className="font-bold text-sm">
                                {STAGE_MESSAGES[processingStage].label}
                            </p>
                            <p className="text-xs text-base-content/50 mt-0.5">
                                {STAGE_MESSAGES[processingStage].description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Sections */}
            <WizardHelpZone
                title="Application Summary"
                description="Review everything you're about to submit. Use the Back button to fix anything that doesn't look right."
                icon="fa-duotone fa-regular fa-clipboard-check"
                tips={[
                    "Your Smart Resume will be automatically tailored to this role",
                    "Save as draft if you want to come back and polish it later",
                    "The AI analysis takes 15-30 seconds to complete",
                    "You can track your application status from your dashboard",
                ]}
            >
                <div className="bg-base-200 p-6 space-y-5">
                    {/* Position */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2">
                            Position
                        </p>
                        <div className="flex items-start gap-3">
                            <i className="fa-duotone fa-regular fa-briefcase text-primary mt-0.5" />
                            <div>
                                <p className="font-bold text-sm">{job.title}</p>
                                <p className="text-xs text-base-content/50">
                                    {job.company?.name || "Company"}
                                    {job.location && ` · ${job.location}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recruiter */}
                    {selectedRecruiter && (
                        <>
                            <div className="border-t border-base-300" />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2">
                                    Your Recruiter
                                </p>
                                <div className="flex items-center gap-3">
                                    <i className="fa-duotone fa-regular fa-user-tie text-primary" />
                                    <div>
                                        <p className="font-bold text-sm">
                                            {selectedRecruiter.recruiter_name}
                                        </p>
                                        <p className="text-sm text-base-content/50">
                                            {selectedRecruiter.recruiter_email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="border-t border-base-300" />

                    {/* Smart Resume */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2">
                            Resume
                        </p>
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-file-user text-primary" />
                            <span className="text-sm font-semibold">
                                Smart Resume (auto-tailored)
                            </span>
                            {tailoredResume ? (
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-xs text-primary"
                                    onClick={() => setShowPreview(true)}
                                >
                                    <i className="fa-duotone fa-regular fa-eye text-xs" />
                                    Preview
                                </button>
                            ) : processingStage === "tailoring" ? (
                                <span className="text-xs text-base-content/40 flex items-center gap-1">
                                    <span className="loading loading-spinner loading-xs" />
                                    Generating...
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {/* Supporting Documents */}
                    {supportingDocs.length > 0 && (
                        <>
                            <div className="border-t border-base-300" />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2">
                                    Supporting Documents
                                </p>
                                <div className="space-y-1">
                                    {supportingDocs.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <i className="fa-duotone fa-regular fa-file text-secondary" />
                                            <span className="font-semibold">
                                                {doc.file_name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="border-t border-base-300" />

                    {/* Cover Letter */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2">
                            Cover Letter
                        </p>
                        {coverLetterDocs.length > 0 && (
                            <div className="space-y-1 mb-2">
                                {coverLetterDocs.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <i className="fa-duotone fa-regular fa-file-lines text-info" />
                                        <span className="font-semibold">
                                            {doc.file_name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {coverLetter ? (
                            <div className="bg-base-100 p-4 text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {coverLetter}
                            </div>
                        ) : coverLetterDocs.length === 0 ? (
                            <p className="text-sm text-base-content/30 italic">
                                None provided
                            </p>
                        ) : null}
                    </div>

                    {/* Pre-Screen Answers */}
                    {answers.length > 0 && (
                        <>
                            <div className="border-t border-base-300" />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-3">
                                    Screening Answers
                                </p>
                                <div className="space-y-3">
                                    {answers.map((answer, idx) => (
                                        <div key={answer.index}>
                                            <p className="text-xs text-base-content/50 mb-0.5">
                                                {idx + 1}.{" "}
                                                {getQuestionText(answer.index)}
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {formatAnswer(answer.answer)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Additional Notes */}
                    {additionalNotes && (
                        <>
                            <div className="border-t border-base-300" />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2">
                                    Additional Notes
                                </p>
                                <p className="text-sm text-base-content/70 whitespace-pre-wrap">
                                    {additionalNotes}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </WizardHelpZone>

            {/* Tailored Resume Preview Modal */}
            {showPreview && tailoredResume &&
                createPortal(
                    <div className="modal modal-open" role="dialog" style={{ zIndex: 9999 }}>
                        <div
                            className="modal-backdrop bg-neutral/60"
                            onClick={() => setShowPreview(false)}
                        />
                        <div className="modal-box max-w-2xl bg-base-100 p-0 max-h-[85vh] flex flex-col">
                            {/* Header */}
                            <div className="border-b border-base-300 px-6 py-4 flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">
                                        Tailored Resume Preview
                                    </h3>
                                    <p className="text-xs text-base-content/50 mt-0.5">
                                        AI-optimized for this role
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm btn-square"
                                    onClick={() => setShowPreview(false)}
                                >
                                    <i className="fa-duotone fa-regular fa-xmark" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="overflow-y-auto p-6 space-y-6">
                                {/* Summary */}
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">
                                        Professional Summary
                                    </p>
                                    <p className="text-sm text-base-content/70 leading-relaxed">
                                        {tailoredResume.summary}
                                    </p>
                                </div>

                                {/* Experience */}
                                {tailoredResume.experience.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                            Experience
                                        </p>
                                        <div className="space-y-4">
                                            {tailoredResume.experience.map((exp, i) => (
                                                <div key={i} className="border-l-2 border-primary/30 pl-4">
                                                    <p className="font-bold text-sm">{exp.title}</p>
                                                    <p className="text-xs text-base-content/50">
                                                        {exp.company}
                                                        {exp.location && ` · ${exp.location}`}
                                                        {" · "}
                                                        {exp.start_date || "?"} – {exp.is_current ? "Present" : exp.end_date || "?"}
                                                    </p>
                                                    {exp.description && (
                                                        <p className="text-sm text-base-content/60 mt-1">
                                                            {exp.description}
                                                        </p>
                                                    )}
                                                    {exp.achievements && exp.achievements.length > 0 && (
                                                        <ul className="mt-1.5 space-y-1">
                                                            {exp.achievements.map((a, j) => (
                                                                <li key={j} className="flex items-start gap-2 text-sm text-base-content/60">
                                                                    <i className="fa-solid fa-caret-right text-primary/40 text-xs mt-1 shrink-0" />
                                                                    {a}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Projects */}
                                {tailoredResume.relevant_projects.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                            Relevant Projects
                                        </p>
                                        <div className="space-y-3">
                                            {tailoredResume.relevant_projects.map((proj, i) => (
                                                <div key={i} className="border-l-2 border-secondary/30 pl-4">
                                                    <p className="font-bold text-sm">{proj.name}</p>
                                                    {proj.description && (
                                                        <p className="text-sm text-base-content/60 mt-0.5">
                                                            {proj.description}
                                                        </p>
                                                    )}
                                                    {proj.skills_used && proj.skills_used.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                            {proj.skills_used.map((s) => (
                                                                <span key={s} className="badge badge-sm bg-secondary/10 text-secondary border-secondary/20">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Skills */}
                                {tailoredResume.skills.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                                            Skills
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {tailoredResume.skills.map((skill) => (
                                                <span
                                                    key={skill.name}
                                                    className="badge badge-sm bg-primary/10 text-primary border-primary/20 font-semibold"
                                                    title={skill.relevance_note || undefined}
                                                >
                                                    {skill.name}
                                                    {skill.proficiency && (
                                                        <span className="text-primary/50 ml-1">
                                                            · {skill.proficiency}
                                                        </span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {tailoredResume.education.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                                            Education
                                        </p>
                                        <div className="space-y-2">
                                            {tailoredResume.education.map((edu, i) => (
                                                <div key={i}>
                                                    <p className="text-sm font-bold">
                                                        {edu.degree && `${edu.degree} `}
                                                        {edu.field_of_study && `in ${edu.field_of_study}`}
                                                    </p>
                                                    <p className="text-xs text-base-content/50">
                                                        {edu.institution}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Certifications */}
                                {tailoredResume.certifications.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                                            Certifications
                                        </p>
                                        <div className="space-y-1">
                                            {tailoredResume.certifications.map((cert, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                    <i className="fa-duotone fa-regular fa-certificate text-warning text-xs" />
                                                    <span className="font-semibold">{cert.name}</span>
                                                    {cert.issuer && (
                                                        <span className="text-base-content/40">
                                                            — {cert.issuer}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
