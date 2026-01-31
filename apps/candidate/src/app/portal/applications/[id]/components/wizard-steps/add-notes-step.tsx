'use client';

import React from 'react';
import { MarkdownEditor } from '@splits-network/shared-ui';

interface AddNotesStepProps {
    notes: string;
    onUpdate: (notes: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export function AddNotesStep({ notes, onUpdate, onNext, onBack }: AddNotesStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold mb-2">
                    <i className="fa-duotone fa-regular fa-note-sticky"></i>
                    {' '}Add Notes (Optional)
                </h4>
                <p className="text-base-content/70 text-sm">
                    Share any additional information, context, or questions for the employer.
                    This is optional but can help strengthen your application.
                </p>
            </div>

            <MarkdownEditor
                className="fieldset"
                label="Your Notes"
                value={notes}
                onChange={onUpdate}
                placeholder="Example: I'm particularly interested in this role because of my experience with..."
                helperText="These notes will be visible to the employer and your recruiter"
                height={180}
            />

            <div className="alert alert-info">
                <i className="fa-duotone fa-regular fa-lightbulb"></i>
                <div>
                    <div className="font-semibold">Tips for Strong Notes</div>
                    <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                        <li>Mention specific skills or experiences relevant to this role</li>
                        <li>Explain why you're interested in this opportunity</li>
                        <li>Ask any questions you have about the position or company</li>
                        <li>Highlight achievements that aren't on your resume</li>
                    </ul>
                </div>
            </div>

            <div className="flex justify-between">
                <button type="button" onClick={onBack} className="btn btn-outline">
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                    Back
                </button>
                <button type="button" onClick={onNext} className="btn btn-primary">
                    Next: Review & Submit
                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
}
