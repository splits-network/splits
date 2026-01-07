'use client';

import React from 'react';

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
                    <i className="fa-solid fa-note-sticky"></i>
                    {' '}Add Notes (Optional)
                </h4>
                <p className="text-base-content/70 text-sm">
                    Share any additional information, context, or questions for the employer.
                    This is optional but can help strengthen your application.
                </p>
            </div>

            <div className="fieldset">
                <label className="label">Your Notes</label>
                <textarea
                    value={notes}
                    onChange={(e) => onUpdate(e.target.value)}
                    placeholder="Example: I'm particularly interested in this role because of my experience with..."
                    className="textarea h-32 w-full"
                />
                <label className="label">
                    <span className="label-text-alt">
                        These notes will be visible to the employer and your recruiter
                    </span>
                </label>
            </div>

            <div className="alert alert-info">
                <i className="fa-solid fa-lightbulb"></i>
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
                    <i className="fa-solid fa-arrow-left"></i>
                    Back
                </button>
                <button type="button" onClick={onNext} className="btn btn-primary">
                    Next: Review & Submit
                    <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
}
