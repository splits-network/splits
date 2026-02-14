"use client";

import React, { useState } from "react";
import { UploadDocumentsStep } from "./wizard-steps/upload-documents-step";
import { CoverLetterStep } from "./wizard-steps/cover-letter-step";
import { AnswerQuestionsStep } from "./wizard-steps/answer-questions-step";
import { AddNotesStep } from "./wizard-steps/add-notes-step";
import { ReviewSubmitStep } from "./wizard-steps/review-submit-step";

export interface WizardData {
    documents: File[];
    existingDocumentIds: string[];
    primaryResumeIndex: number | null;
    primaryExistingDocId: string | null;
    coverLetter: string;
    preScreenAnswers: { [questionId: string]: string };
    notes: string;
}

interface ProposalResponseWizardProps {
    isOpen: boolean;
    onClose: () => void;
    applicationId: string;
    jobTitle: string;
    preScreenQuestions?: Array<{
        id: string;
        question: string;
        question_type: "text" | "yes_no" | "multiple_choice";
        required: boolean;
        options?: string[];
    }>;
    onComplete: (data: WizardData) => Promise<void>;
}

const STEPS = [
    { id: 1, title: "Upload Documents", icon: "fa-file-upload" },
    { id: 2, title: "Cover Letter", icon: "fa-file-lines" },
    { id: 3, title: "Answer Questions", icon: "fa-clipboard-question" },
    { id: 4, title: "Add Notes", icon: "fa-note-sticky" },
    { id: 5, title: "Review & Submit", icon: "fa-check-circle" },
];

export function ProposalResponseWizard({
    isOpen,
    onClose,
    applicationId,
    jobTitle,
    preScreenQuestions = [],
    onComplete,
}: ProposalResponseWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [wizardData, setWizardData] = useState<WizardData>({
        documents: [],
        existingDocumentIds: [],
        primaryResumeIndex: null,
        primaryExistingDocId: null,
        coverLetter: "",
        preScreenAnswers: {},
        notes: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleNext = () => {
        setError(null);
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        setError(null);
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setCurrentStep(1);
            setWizardData({
                documents: [],
                existingDocumentIds: [],
                primaryResumeIndex: null,
                primaryExistingDocId: null,
                coverLetter: "",
                preScreenAnswers: {},
                notes: "",
            });
            setError(null);
            onClose();
        }
    };

    const handleComplete = async () => {
        setError(null);
        setSubmitting(true);

        try {
            await onComplete(wizardData);
            handleClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to submit application",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const updateWizardData = (updates: Partial<WizardData>) => {
        setWizardData({ ...wizardData, ...updates });
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="mb-6">
                    <h3 className="font-bold text-2xl mb-2">
                        Complete Your Application
                    </h3>
                    <p className="text-base-content/70">{jobTitle}</p>
                </div>

                {/* Step Indicator */}
                <div className="mb-6">
                    <ul className="steps w-full">
                        {STEPS.map((step) => (
                            <li
                                key={step.id}
                                className={`step ${currentStep >= step.id ? "step-primary" : ""}`}
                                data-content={
                                    currentStep > step.id ? "✓" : step.id
                                }
                            >
                                <span className="hidden sm:inline">
                                    {step.title}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Step Content - with overflow scroll */}
                <div className="flex-1 overflow-y-auto mb-6">
                    {currentStep === 1 && (
                        <UploadDocumentsStep
                            documents={wizardData.documents}
                            existingDocumentIds={wizardData.existingDocumentIds}
                            primaryResumeIndex={wizardData.primaryResumeIndex}
                            primaryExistingDocId={
                                wizardData.primaryExistingDocId
                            }
                            onUpdate={(
                                documents: File[],
                                existingDocumentIds: string[],
                                primaryResumeIndex: number | null,
                                primaryExistingDocId: string | null,
                            ) =>
                                updateWizardData({
                                    documents,
                                    existingDocumentIds,
                                    primaryResumeIndex,
                                    primaryExistingDocId,
                                })
                            }
                            onNext={handleNext}
                        />
                    )}

                    {currentStep === 2 && (
                        <CoverLetterStep
                            coverLetterText={wizardData.coverLetter}
                            uploadedCoverLetterDocs={
                                wizardData.existingDocumentIds
                                    .map((id) => {
                                        // In a real implementation, you'd need to get the actual document data
                                        // For now, we'll pass empty array and update this when we have document data
                                        return null;
                                    })
                                    .filter(Boolean) as any[]
                            }
                            onUpdate={(coverLetter: string) =>
                                updateWizardData({ coverLetter })
                            }
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 3 && (
                        <AnswerQuestionsStep
                            questions={preScreenQuestions.map((q) => ({
                                ...q,
                                is_required: q.required,
                            }))}
                            answers={wizardData.preScreenAnswers}
                            onUpdate={(answers: {
                                [questionId: string]: string;
                            }) =>
                                updateWizardData({ preScreenAnswers: answers })
                            }
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 4 && (
                        <AddNotesStep
                            notes={wizardData.notes}
                            onUpdate={(notes: string) =>
                                updateWizardData({ notes })
                            }
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 5 && (
                        <ReviewSubmitStep
                            wizardData={wizardData}
                            questions={preScreenQuestions}
                            onBack={handleBack}
                            onSubmit={handleComplete}
                            submitting={submitting}
                        />
                    )}
                </div>

                {/* Footer Actions */}
                <div className="modal-action mt-auto">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="btn"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                </div>
            </div>
            <form
                method="dialog"
                className="modal-backdrop"
                onClick={handleClose}
            >
                <button type="button">close</button>
            </form>
        </dialog>
    );
}
