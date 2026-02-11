"use client";

import React, { useState } from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";

interface UploadedCoverLetterDoc {
    id: string;
    file_name: string;
    file_size: number;
    document_type: string;
}

interface CoverLetterStepProps {
    coverLetterText: string;
    uploadedCoverLetterDocs: UploadedCoverLetterDoc[];
    onUpdate: (coverLetterText: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export function CoverLetterStep({
    coverLetterText,
    uploadedCoverLetterDocs,
    onUpdate,
    onNext,
    onBack,
}: CoverLetterStepProps) {
    const [error, setError] = useState<string | null>(null);

    const handleNext = () => {
        setError(null);
        onNext();
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const hasUploadedCoverLetter = uploadedCoverLetterDocs.length > 0;

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold mb-2">
                    <i className="fa-duotone fa-regular fa-file-lines"></i>{" "}
                    Cover Letter (Optional)
                </h4>
                <p className="text-base-content/70 text-sm">
                    Personalize your application with a cover letter to stand
                    out to employers.
                    {hasUploadedCoverLetter
                        ? " You can add additional text below or use your uploaded file."
                        : " Write your cover letter here."}
                </p>
            </div>

            {/* Show uploaded cover letter files if any */}
            {hasUploadedCoverLetter && (
                <div className="alert alert-info">
                    <i className="fa-duotone fa-regular fa-file-check"></i>
                    <div>
                        <div className="font-semibold">
                            Uploaded Cover Letter File
                            {uploadedCoverLetterDocs.length > 1 ? "s" : ""}
                        </div>
                        <div className="mt-2 space-y-2">
                            {uploadedCoverLetterDocs.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <i className="fa-duotone fa-regular fa-file-lines text-primary"></i>
                                    <span className="font-medium">
                                        {doc.file_name}
                                    </span>
                                    <span className="text-base-content/60">
                                        ({formatFileSize(doc.file_size)})
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="text-sm mt-2 text-base-content/70">
                            You can add additional text below or leave this
                            section empty to use only your uploaded file.
                        </div>
                    </div>
                </div>
            )}

            {/* Text input for cover letter */}
            <MarkdownEditor
                className="fieldset"
                label={
                    hasUploadedCoverLetter
                        ? "Additional Cover Letter Text"
                        : "Cover Letter"
                }
                value={coverLetterText}
                onChange={onUpdate}
                placeholder={
                    hasUploadedCoverLetter
                        ? "Add any additional notes or personalization..."
                        : "Dear Hiring Manager,\n\nI am writing to express my interest in the [position] role at [company]...\n\nSincerely,\n[Your name]"
                }
                helperText={
                    hasUploadedCoverLetter
                        ? "This text will complement your uploaded cover letter file"
                        : "This will be visible to the employer and your recruiter"
                }
                height={220}
            />

            {/* Tips for writing cover letters */}
            {!hasUploadedCoverLetter && (
                <div className="alert alert-info">
                    <i className="fa-duotone fa-regular fa-lightbulb"></i>
                    <div>
                        <div className="font-semibold">
                            Tips for Strong Cover Letters
                        </div>
                        <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                            <li>
                                Address the hiring manager by name if possible
                            </li>
                            <li>
                                Mention the specific role and company you're
                                applying to
                            </li>
                            <li>
                                Highlight 2-3 key achievements relevant to the
                                position
                            </li>
                            <li>
                                Explain why you're interested in this company
                                and role
                            </li>
                            <li>Keep it concise - ideally 3-4 paragraphs</li>
                            <li>
                                Close with a call to action (e.g., requesting an
                                interview)
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="btn btn-outline"
                >
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary"
                >
                    Next: Answer Questions
                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
}
