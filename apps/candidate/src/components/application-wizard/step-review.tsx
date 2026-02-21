"use client";

import { useState } from "react";

interface PreScreenQuestion {
    id: string;
    question_text: string;
    question_type: "text" | "yes_no" | "select" | "multi_select";
}

interface Answer {
    question_id: string;
    answer: string | string[] | boolean;
}

interface StepReviewProps {
    job: any;
    documents: any[];
    selectedDocuments: string[];
    coverLetter?: string;
    questions: PreScreenQuestion[];
    answers: Answer[];
    additionalNotes: string;
    onBack: () => void;
    onSubmit: () => Promise<void>;
    onSaveAsDraft: () => Promise<void>;
}

export default function StepReview({
    job,
    documents,
    selectedDocuments,
    coverLetter,
    questions,
    answers,
    additionalNotes,
    onBack,
    onSubmit,
    onSaveAsDraft,
}: StepReviewProps) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedDocs = documents.filter((d) =>
        selectedDocuments.includes(d.id),
    );
    const selectedResume = selectedDocs.find(
        (d) => d.document_type === "resume",
    );
    const coverLetterDocs = selectedDocs.filter(
        (d) => d.document_type === "cover_letter",
    );

    const getQuestionText = (questionId: string) => {
        return (
            questions.find((q) => q.id === questionId)?.question_text ||
            "Unknown question"
        );
    };

    const formatAnswer = (answer: string | string[] | boolean) => {
        if (typeof answer === "boolean") return answer ? "Yes" : "No";
        if (Array.isArray(answer)) return answer.join(", ");
        return answer;
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            await onSubmit();
        } catch (err: any) {
            setError(
                err.message ||
                    "Something went wrong. Please try again.",
            );
            setSubmitting(false);
        }
    };

    const handleSaveAsDraft = async () => {
        setSubmitting(true);
        setError(null);
        try {
            await onSaveAsDraft();
        } catch (err: any) {
            setError(err.message || "Unable to save draft. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    Final Step
                </p>
                <h3 className="text-xl font-black tracking-tight mb-2">
                    Review and submit
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                    Take a moment to make sure everything looks right before
                    sending your application.
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

                <div className="border-t border-base-300" />

                {/* Resume */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2">
                        Resume
                    </p>
                    {selectedResume ? (
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-file-pdf text-primary" />
                            <span className="text-sm font-semibold">
                                {selectedResume.file_name}
                            </span>
                        </div>
                    ) : (
                        <p className="text-sm text-base-content/40 italic">
                            No resume selected
                        </p>
                    )}
                    {selectedDocs.filter(
                        (d) =>
                            d.document_type !== "resume" &&
                            d.document_type !== "cover_letter",
                    ).length > 0 && (
                        <div className="mt-2 space-y-1">
                            {selectedDocs
                                .filter(
                                    (d) =>
                                        d.document_type !== "resume" &&
                                        d.document_type !== "cover_letter",
                                )
                                .map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center gap-2 text-xs text-base-content/50"
                                    >
                                        <i className="fa-duotone fa-regular fa-file" />
                                        <span>{doc.file_name}</span>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

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
                                {answers.map((answer, index) => (
                                    <div key={answer.question_id}>
                                        <p className="text-xs text-base-content/50 mb-0.5">
                                            {index + 1}.{" "}
                                            {getQuestionText(
                                                answer.question_id,
                                            )}
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

            {/* What happens next */}
            <div className="bg-primary/5 border-l-4 border-primary p-5">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-circle-info text-primary mt-0.5" />
                    <div className="text-sm text-base-content/60">
                        <p className="font-bold text-base-content/80 mb-1">
                            What happens next?
                        </p>
                        <p>
                            Your application will be reviewed by our system and
                            then forwarded to the hiring team. You can track its
                            status anytime from your dashboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center border-t border-base-200 pt-6">
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onBack}
                    disabled={submitting}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    Back
                </button>
                <div className="flex gap-3">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={handleSaveAsDraft}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-floppy-disk" />
                                Save Draft
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-paper-plane" />
                                Submit Application
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
