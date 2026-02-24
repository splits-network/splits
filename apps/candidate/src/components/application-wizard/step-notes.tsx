"use client";

import { MarkdownEditor } from "@splits-network/shared-ui";

interface StepNotesProps {
    notes: string;
    onChange: (notes: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepNotes({
    notes,
    onChange,
    onNext,
    onBack,
}: StepNotesProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    Optional
                </p>
                <h3 className="text-xl font-black tracking-tight mb-2">
                    Additional notes
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                    Share any additional information, context, or questions for
                    the employer. This is optional but can help strengthen your
                    application.
                </p>
            </div>

            {/* Editor */}
            <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2 block">
                    Your Notes
                </label>
                <div className="min-h-[180px] border border-base-300 overflow-hidden">
                    <MarkdownEditor
                        value={notes}
                        onChange={onChange}
                        placeholder="Example: I'm particularly interested in this role because of my experience with..."
                        className="min-h-[180px]"
                    />
                </div>
                <p className="text-sm text-base-content/40 mt-1">
                    These notes will be visible to the employer and your
                    recruiter
                </p>
            </div>

            {/* Tips */}
            <div className="bg-base-200 p-5">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-lightbulb text-primary mt-0.5" />
                    <div className="text-sm text-base-content/60">
                        <p className="font-bold text-base-content/80 mb-1">
                            Tips for strong notes
                        </p>
                        <ul className="space-y-1">
                            <li>
                                Mention specific skills or experiences relevant
                                to this role
                            </li>
                            <li>
                                Explain why you're interested in this opportunity
                            </li>
                            <li>
                                Ask any questions you have about the position or
                                company
                            </li>
                            <li>
                                Highlight achievements that aren't on your resume
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between border-t border-base-200 pt-6">
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onBack}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    Back
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onNext}
                >
                    Continue to Review
                    <i className="fa-duotone fa-regular fa-arrow-right" />
                </button>
            </div>
        </div>
    );
}
