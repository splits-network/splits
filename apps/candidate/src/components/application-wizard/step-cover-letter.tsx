"use client";

import { MarkdownEditor } from "@splits-network/shared-ui";
import { WizardHelpZone } from "@splits-network/basel-ui";

interface StepCoverLetterProps {
    coverLetter: string;
    onChange: (coverLetter: string) => void;
    onSkipConfirm: () => void;
    showSkipWarning: boolean;
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
    onSkipConfirm,
    showSkipWarning,
    uploadedCoverLetterDocs = [],
}: StepCoverLetterProps) {

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
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
            <WizardHelpZone
                title="Cover Letter"
                description="A personal message to the hiring team explaining why you're a great fit. Applications with cover letters consistently get more attention."
                icon="fa-duotone fa-regular fa-file-lines"
                tips={[
                    "Mention something specific about the company or role — generic letters get skimmed",
                    "Connect your experience directly to what they need",
                    "Keep it to 2-3 short paragraphs — brevity shows respect for their time",
                    "This step is optional, but a strong cover letter can set you apart",
                ]}
            >
            <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2 block">
                    {uploadedCoverLetterDocs.length > 0
                        ? "Additional Notes"
                        : "Your Message"}
                </label>
                <div className="min-h-[240px] border border-base-300 overflow-hidden">
                    <MarkdownEditor
                        value={coverLetter}
                        onChange={onChange}
                        placeholder={
                            uploadedCoverLetterDocs.length > 0
                                ? "Anything else you'd like the hiring team to know..."
                                : "What excites you about this role? What relevant experience do you bring?"
                        }
                        className="min-h-[240px]"
                    />
                </div>
            </div>
            </WizardHelpZone>

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
                            onClick={onSkipConfirm}
                        >
                            Skip
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
