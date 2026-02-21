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
    const [showSkipWarning, setShowSkipWarning] = useState(false);

    const handleNext = () => {
        if (!coverLetter?.trim() && uploadedCoverLetterDocs.length === 0) {
            setShowSkipWarning(true);
            return;
        }
        setShowSkipWarning(false);
        onNext();
    };

    const handleTextChange = (value: string) => {
        onChange(value);
        setShowSkipWarning(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    Step 2 · Optional
                </p>
                <h3 className="text-xl font-black tracking-tight mb-2">
                    Add a cover letter
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                    A short note about why you're interested goes a long way.
                    Keep it personal and specific to this role.
                </p>
            </div>

            {/* Uploaded cover letter files */}
            {uploadedCoverLetterDocs.length > 0 && (
                <div className="bg-info/5 border-l-4 border-info p-4">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-file-lines text-info mt-0.5" />
                        <div>
                            <p className="text-sm font-bold mb-1">
                                Cover letter file attached
                            </p>
                            {uploadedCoverLetterDocs.map((doc) => (
                                <p
                                    key={doc.id}
                                    className="text-xs text-base-content/50"
                                >
                                    {doc.file_name} (
                                    {(doc.file_size / 1024).toFixed(0)} KB)
                                </p>
                            ))}
                            <p className="text-xs text-base-content/40 mt-1">
                                You can add extra context below if you'd like.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Editor */}
            <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2 block">
                    {uploadedCoverLetterDocs.length > 0
                        ? "Additional Notes"
                        : "Your Message"}
                </label>
                <div className="min-h-[240px] border border-base-300 overflow-hidden">
                    <MarkdownEditor
                        value={coverLetter}
                        onChange={handleTextChange}
                        placeholder={
                            uploadedCoverLetterDocs.length > 0
                                ? "Anything else you'd like the hiring team to know..."
                                : "What excites you about this role? What relevant experience do you bring?"
                        }
                        className="min-h-[240px]"
                    />
                </div>
            </div>

            {/* Writing tips */}
            <div className="bg-base-200 p-5">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-lightbulb text-primary mt-0.5" />
                    <div className="text-sm text-base-content/60">
                        <p className="font-bold text-base-content/80 mb-1">
                            Quick tips
                        </p>
                        <ul className="space-y-1">
                            <li>
                                Mention something specific about the company or
                                role
                            </li>
                            <li>
                                Connect your experience directly to what they
                                need
                            </li>
                            <li>
                                Keep it to 2-3 short paragraphs — brevity shows
                                respect for their time
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Skip warning */}
            {showSkipWarning && (
                <div className="bg-warning/5 border-l-4 border-warning p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <i className="fa-duotone fa-regular fa-lightbulb text-warning mt-0.5" />
                            <p className="text-sm text-base-content/70">
                                Applications with a cover letter tend to get
                                more attention. Sure you want to skip?
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-warning btn-sm flex-shrink-0"
                            onClick={() => {
                                setShowSkipWarning(false);
                                onNext();
                            }}
                        >
                            Skip
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between border-t border-base-200 pt-6">
                <button type="button" className="btn btn-ghost" onClick={onBack}>
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    Back
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                >
                    Continue
                    <i className="fa-duotone fa-regular fa-arrow-right" />
                </button>
            </div>
        </div>
    );
}
