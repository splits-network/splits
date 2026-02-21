"use client";

import React from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";

interface AddNotesStepProps {
    notes: string;
    onUpdate: (notes: string) => void;
}

export function AddNotesStep({ notes, onUpdate }: AddNotesStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    Step 4 • Optional
                </p>
                <h4 className="text-sm font-black tracking-tight mb-2">
                    Additional Notes
                </h4>
                <p className="text-base-content/70 text-sm">
                    Share any additional information, context, or questions for the employer.
                    This is optional but can help strengthen your application.
                </p>
            </div>

            <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2 block">
                    Your Notes
                </label>
                <MarkdownEditor
                    value={notes}
                    onChange={onUpdate}
                    placeholder="Example: I'm particularly interested in this role because of my experience with..."
                    height={180}
                />
                <p className="text-xs text-base-content/40 mt-1">
                    These notes will be visible to the employer and your recruiter
                </p>
            </div>

            <div className="bg-base-200 p-5">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-lightbulb text-primary mt-0.5" />
                    <div className="text-sm text-base-content/60">
                        <p className="font-bold text-base-content/80 mb-1">
                            Tips for Strong Notes
                        </p>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Mention specific skills or experiences relevant to this role</li>
                            <li>Explain why you're interested in this opportunity</li>
                            <li>Ask any questions you have about the position or company</li>
                            <li>Highlight achievements that aren't on your resume</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
