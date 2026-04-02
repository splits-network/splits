"use client";

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
}

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
}: StepReviewProps) {
    const selectedDocs = documents.filter((d) =>
        selectedDocuments.includes(d.id),
    );
    const coverLetterDocs = selectedDocs.filter(
        (d) => d.document_type === "cover_letter",
    );
    const supportingDocs = selectedDocs.filter(
        (d) => d.document_type !== "resume" && d.document_type !== "cover_letter",
    );

    const getQuestionText = (index: number) => {
        return questions[index]?.question || "Unknown question";
    };

    const formatAnswer = (answer: string | string[] | boolean) => {
        if (typeof answer === "boolean") return answer ? "Yes" : "No";
        if (Array.isArray(answer)) return answer.join(", ");
        return answer;
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-black tracking-tight mb-2">
                    Review and submit for AI review
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                    Take a moment to make sure everything looks right. Your
                    application will go through an AI review before being
                    sent to the hiring team.
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

            {/* Review Sections */}
            <WizardHelpZone
                title="Application Summary"
                description="Review everything you're about to submit. Use the Back button to fix anything that doesn't look right."
                icon="fa-duotone fa-regular fa-clipboard-check"
                tips={[
                    "Your Smart Resume will be automatically tailored to this role",
                    "Save as draft if you want to come back and polish it later",
                    "After submission, your application goes through AI review before reaching the hiring team",
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

            {/* What happens next */}
            <div className="bg-primary/5 border-l-4 border-primary p-5">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-circle-info text-primary mt-0.5" />
                    <div className="text-sm text-base-content/60">
                        <p className="font-bold text-base-content/80 mb-1">
                            What happens next?
                        </p>
                        <p>
                            Your application will first be reviewed by our AI
                            system for completeness and quality. Once it passes,
                            it will be forwarded to the hiring team. You can
                            track its status anytime from your dashboard.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
