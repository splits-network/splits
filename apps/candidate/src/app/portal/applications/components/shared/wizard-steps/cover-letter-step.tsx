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
}

export function CoverLetterStep({
    coverLetterText,
    uploadedCoverLetterDocs,
    onUpdate,
}: CoverLetterStepProps) {
    const [error, setError] = useState<string | null>(null);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const hasUploadedCoverLetter = uploadedCoverLetterDocs.length > 0;

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    Step 2 • Optional
                </p>
                <h4 className="text-sm font-black tracking-tight mb-2">
                    Cover Letter
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
                <div className="bg-info/5 border-l-4 border-info p-4">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-file-check text-info mt-0.5" />
                        <div>
                            <p className="text-sm font-bold mb-1">
                                Uploaded Cover Letter File
                                {uploadedCoverLetterDocs.length > 1 ? "s" : ""}
                            </p>
                            <div className="mt-2 space-y-2">
                                {uploadedCoverLetterDocs.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <i className="fa-duotone fa-regular fa-file-lines text-primary"></i>
                                        <span className="font-bold text-sm">
                                            {doc.file_name}
                                        </span>
                                        <span className="text-base-content/40">
                                            ({formatFileSize(doc.file_size)})
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-base-content/40 mt-2">
                                You can add additional text below or leave this
                                section empty to use only your uploaded file.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Text input for cover letter */}
            <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2 block">
                    {hasUploadedCoverLetter
                        ? "Additional Cover Letter Text"
                        : "Your Message"}
                </label>
                <MarkdownEditor
                    value={coverLetterText}
                    onChange={onUpdate}
                    placeholder={
                        hasUploadedCoverLetter
                            ? "Add any additional notes or personalization..."
                            : "Dear Hiring Manager,\n\nI am writing to express my interest in the [position] role at [company]...\n\nSincerely,\n[Your name]"
                    }
                    height={220}
                />
                <p className="text-xs text-base-content/40 mt-1">
                    {hasUploadedCoverLetter
                        ? "This text will complement your uploaded cover letter file"
                        : "This will be visible to the employer and your recruiter"}
                </p>
            </div>

            {/* Tips for writing cover letters */}
            {!hasUploadedCoverLetter && (
                <div className="bg-base-200 p-5">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-lightbulb text-primary mt-0.5" />
                        <div className="text-sm text-base-content/60">
                            <p className="font-bold text-base-content/80 mb-1">
                                Tips for Strong Cover Letters
                            </p>
                            <ul className="space-y-1 list-disc list-inside">
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
                </div>
            )}

            {error && (
                <div className="bg-error/5 border-l-4 border-error p-4">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error mt-0.5" />
                        <span className="text-sm">{error}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
