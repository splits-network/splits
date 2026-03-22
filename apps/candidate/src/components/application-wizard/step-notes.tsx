"use client";

import { MarkdownEditor } from "@splits-network/shared-ui";
import { WizardHelpZone } from "@splits-network/basel-ui";

interface StepNotesProps {
    notes: string;
    onChange: (notes: string) => void;
}

export default function StepNotes({
    notes,
    onChange,
}: StepNotesProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
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
            <WizardHelpZone
                title="Additional Notes"
                description="Share extra context, ask questions, or highlight things not covered elsewhere in your application. These notes are visible to the employer and your recruiter."
                icon="fa-duotone fa-regular fa-message-lines"
                tips={[
                    "Mention specific skills or experiences relevant to this role",
                    "Explain why you're interested in this opportunity",
                    "Ask any questions you have about the position or company",
                    "Highlight achievements that aren't on your resume",
                    "This is optional — skip it if your cover letter already says everything",
                ]}
            >
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
            </WizardHelpZone>

        </div>
    );
}
