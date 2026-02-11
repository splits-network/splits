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

    const getQuestionText = (questionId: string) => {
        return (
            questions.find((q) => q.id === questionId)?.question_text ||
            "Unknown question"
        );
    };

    const formatAnswer = (answer: string | string[] | boolean) => {
        if (typeof answer === "boolean") {
            return answer ? "Yes" : "No";
        }
        if (Array.isArray(answer)) {
            return answer.join(", ");
        }
        return answer;
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);

        try {
            await onSubmit();
            // Success - parent modal will handle navigation
        } catch (err: any) {
            setError(
                err.message ||
                    "Failed to submit application. Please try again.",
            );
            setSubmitting(false);
        }
    };

    const handleSaveAsDraft = async () => {
        setSubmitting(true);
        setError(null);

        try {
            await onSaveAsDraft();
            // Success - parent modal will handle navigation
        } catch (err: any) {
            setError(err.message || "Failed to save draft. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">
                    Review Your Application
                </h2>
                <p className="text-base-content/70">
                    Please review your application before submitting.
                </p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Job Info */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h3 className="card-title text-lg">Position</h3>
                    <div>
                        <div className="font-semibold">{job.title}</div>
                        <div className="text-sm text-base-content/70">
                            {job.company?.name || "Unknown Company"}
                        </div>
                        {job.location && (
                            <div className="text-sm text-base-content/60">
                                <i className="fa-duotone fa-regular fa-location-dot"></i>{" "}
                                {job.location}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h3 className="card-title text-lg">Documents</h3>
                    <div className="space-y-2">
                        {selectedDocs.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-file text-base-content/60"></i>
                                <span>{doc.file_name}</span>
                                {doc.document_type === "resume" && (
                                    <span className="badge badge-primary badge-sm">
                                        <i className="fa-duotone fa-regular fa-file-text"></i>
                                        Resume
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cover Letter */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h3 className="card-title text-lg">Cover Letter</h3>

                    {/* Show uploaded cover letter files */}
                    {selectedDocs.filter(
                        (doc) => doc.document_type === "cover_letter",
                    ).length > 0 && (
                        <div className="mb-4">
                            <div className="text-sm font-medium mb-2">
                                Uploaded Cover Letter Files:
                            </div>
                            <div className="space-y-2">
                                {selectedDocs
                                    .filter(
                                        (doc) =>
                                            doc.document_type ===
                                            "cover_letter",
                                    )
                                    .map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center gap-2 p-2 rounded bg-base-100"
                                        >
                                            <i className="fa-duotone fa-regular fa-file-lines text-primary"></i>
                                            <span className="font-medium">
                                                {doc.file_name}
                                            </span>
                                            <span className="text-sm text-base-content/60">
                                                (
                                                {(doc.file_size / 1024).toFixed(
                                                    1,
                                                )}{" "}
                                                KB)
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Show cover letter text */}
                    {coverLetter ? (
                        <div className="bg-base-100 p-3 rounded-lg">
                            <div className="text-sm font-medium mb-2">
                                Cover Letter Text:
                            </div>
                            <div className="text-base-content/70 whitespace-pre-wrap">
                                {coverLetter}
                            </div>
                        </div>
                    ) : (
                        <div className="text-base-content/50 p-3 rounded-lg bg-base-100 text-center italic">
                            {selectedDocs.filter(
                                (doc) => doc.document_type === "cover_letter",
                            ).length > 0
                                ? "Using uploaded cover letter file only"
                                : "No cover letter provided"}
                        </div>
                    )}
                </div>
            </div>

            {/* Pre-Screen Answers */}
            {answers.length > 0 && (
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h3 className="card-title text-lg">
                            Pre-Screening Answers
                        </h3>
                        <div className="space-y-3">
                            {answers.map((answer, index) => (
                                <div key={answer.question_id}>
                                    <div className="font-medium text-sm mb-1">
                                        {index + 1}.{" "}
                                        {getQuestionText(answer.question_id)}
                                    </div>
                                    <div className="text-base-content/70">
                                        {formatAnswer(answer.answer)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Additional Notes */}
            {additionalNotes && (
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h3 className="card-title text-lg">Additional Notes</h3>
                        <p className="text-base-content/70 whitespace-pre-wrap">
                            {additionalNotes}
                        </p>
                    </div>
                </div>
            )}

            {/* Important Notice */}
            <div className="alert">
                <i className="fa-duotone fa-regular fa-circle-info"></i>
                <div>
                    <div className="font-semibold">Before you submit:</div>
                    <ul className="list-disc list-inside text-sm mt-1">
                        <li>Review all information for accuracy</li>
                        <li>Ensure you've attached the correct documents</li>
                        <li>
                            Double-check your answers to pre-screening questions
                        </li>
                    </ul>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <button
                    type="button"
                    className="btn"
                    onClick={onBack}
                    disabled={submitting}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                    Back
                </button>
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={handleSaveAsDraft}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-floppy-disk"></i>
                                Save as Draft
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
                                <span className="loading loading-spinner loading-sm"></span>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                Submit Application
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
