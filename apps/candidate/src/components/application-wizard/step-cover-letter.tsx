"use client";

import { useState } from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";

interface StepCoverLetterProps {
    coverLetter: string;
    onChange: (coverLetter: string) => void;
    onNext: () => void;
    onBack: () => void;
    uploadedCoverLetterDocs?: Array<{
        id: string;
        file_name: string;
        file_size: number;
        document_type: string;
    }>;
}

export default function StepCoverLetter({
    coverLetter,
    onChange,
    onNext,
    onBack,
    uploadedCoverLetterDocs = [],
}: StepCoverLetterProps) {
    const [error, setError] = useState<string | null>(null);

    const handleNext = () => {
        // Cover letter is optional but provide guidance
        if (!coverLetter?.trim() && uploadedCoverLetterDocs.length === 0) {
            setError(
                "Consider adding a cover letter to make your application more compelling, either as text below or by uploading a file in the Documents step.",
            );
            return;
        }

        setError(null);
        onNext();
    };

    const handleTextChange = (value: string) => {
        onChange(value);
        setError(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-xl font-semibold mb-2">Cover Letter</h3>
                <p className="text-base-content/70">
                    Add a personal message to accompany your application. This
                    is optional but highly recommended.
                </p>
            </div>

            {/* Show uploaded cover letter files if any */}
            {uploadedCoverLetterDocs.length > 0 && (
                <div className="alert alert-info">
                    <i className="fa-duotone fa-regular fa-circle-info"></i>
                    <div className="flex flex-col gap-2">
                        <span className="font-medium">
                            Cover letter files uploaded:
                        </span>
                        <div className="space-y-1">
                            {uploadedCoverLetterDocs.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <i className="fa-duotone fa-regular fa-file-lines"></i>
                                    <span>{doc.file_name}</span>
                                    <span className="text-base-content/60">
                                        ({(doc.file_size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                            ))}
                        </div>
                        <span className="text-sm">
                            You can add additional text below to supplement your
                            uploaded cover letter.
                        </span>
                    </div>
                </div>
            )}

            {/* Cover Letter Text Editor */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="label">
                        <span className="label-text font-medium">
                            {uploadedCoverLetterDocs.length > 0
                                ? "Additional Cover Letter Text (Optional)"
                                : "Cover Letter Text"}
                        </span>
                    </label>

                    <div className="min-h-[240px] border border-base-300 rounded-lg overflow-hidden">
                        <MarkdownEditor
                            value={coverLetter}
                            onChange={handleTextChange}
                            placeholder={
                                uploadedCoverLetterDocs.length > 0
                                    ? "Add any additional thoughts or context to your uploaded cover letter..."
                                    : "Dear Hiring Manager,\n\nI am writing to express my interest in this position...\n\nThank you for your consideration.\n\nBest regards,\n[Your Name]"
                            }
                            className="min-h-[240px]"
                        />
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-base-200 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-lightbulb text-primary mt-1"></i>
                        <div className="text-sm text-base-content/80">
                            <p className="font-medium mb-1">
                                Cover Letter Tips:
                            </p>
                            <ul className="space-y-1 ml-4">
                                <li>
                                    • Research the company and mention specific
                                    reasons for your interest
                                </li>
                                <li>
                                    • Highlight relevant experience that matches
                                    the job requirements
                                </li>
                                <li>
                                    • Keep it concise (2-3 paragraphs maximum)
                                </li>
                                <li>
                                    • Show enthusiasm and personality while
                                    remaining professional
                                </li>
                                {uploadedCoverLetterDocs.length === 0 && (
                                    <li>
                                        • Alternatively, you can upload a cover
                                        letter file in the Documents step
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="alert alert-warning">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                    <span>{error}</span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="btn btn-warning btn-sm"
                            onClick={() => {
                                setError(null);
                                onNext();
                            }}
                        >
                            Continue Anyway
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
                <button type="button" className="btn" onClick={onBack}>
                    <i className="fa-duotone fa-regular fa-arrow-left mr-2"></i>
                    Back
                </button>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                >
                    Next
                    <i className="fa-duotone fa-regular fa-arrow-right ml-2"></i>
                </button>
            </div>
        </div>
    );
}
