"use client";

import React, { useState } from "react";
import { UploadDocumentsStep } from "../shared/wizard-steps/upload-documents-step";
import { CoverLetterStep } from "../shared/wizard-steps/cover-letter-step";
import { AnswerQuestionsStep } from "../shared/wizard-steps/answer-questions-step";
import { AddNotesStep } from "../shared/wizard-steps/add-notes-step";
import { ReviewSubmitStep } from "../shared/wizard-steps/review-submit-step";

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

    const currentStepTitle = STEPS[currentStep - 1]?.title ?? "";
    const isLastStep = currentStep === STEPS.length;

    return (
        <div className="modal modal-open" role="dialog">
            <div
                className="modal-box max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0"
                style={{ borderRadius: 0 }}
            >
                {/* Header */}
                <div className="bg-neutral text-neutral-content px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-clipboard-list"></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-tight">
                                    Complete Your Application
                                </h3>
                                <p className="text-sm text-neutral-content/60">
                                    Step {currentStep} of {STEPS.length} &mdash;{" "}
                                    {currentStepTitle}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="btn btn-ghost btn-sm btn-square text-neutral-content/60 hover:text-neutral-content"
                            style={{ borderRadius: 0 }}
                            disabled={submitting}
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg"></i>
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="flex gap-2 mt-5">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 transition-colors duration-300 ${
                                    i < currentStep
                                        ? "bg-secondary"
                                        : "bg-neutral-content/20"
                                }`}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="px-8 pt-4">
                        <div className="alert alert-error">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Step Content */}
                <div className="p-8 min-h-[280px] flex-1 overflow-y-auto">
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
                        />
                    )}

                    {currentStep === 2 && (
                        <CoverLetterStep
                            coverLetterText={wizardData.coverLetter}
                            uploadedCoverLetterDocs={
                                wizardData.existingDocumentIds
                                    .map(() => null)
                                    .filter(Boolean) as any[]
                            }
                            onUpdate={(coverLetter: string) =>
                                updateWizardData({ coverLetter })
                            }
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
                        />
                    )}

                    {currentStep === 4 && (
                        <AddNotesStep
                            notes={wizardData.notes}
                            onUpdate={(notes: string) =>
                                updateWizardData({ notes })
                            }
                        />
                    )}

                    {currentStep === 5 && (
                        <ReviewSubmitStep
                            wizardData={wizardData}
                            questions={preScreenQuestions}
                        />
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="px-8 pb-8">
                    <div className="flex justify-between border-t border-base-200 pt-6">
                        <div>
                            {currentStep > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="btn btn-ghost"
                                    style={{ borderRadius: 0 }}
                                    disabled={submitting}
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                                    Back
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="btn btn-ghost"
                                style={{ borderRadius: 0 }}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            {isLastStep ? (
                                <button
                                    onClick={handleComplete}
                                    className="btn btn-primary"
                                    style={{ borderRadius: 0 }}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                            Submit Application
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="btn btn-secondary"
                                    style={{ borderRadius: 0 }}
                                    disabled={submitting}
                                >
                                    Next
                                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal-backdrop bg-neutral/60"
                onClick={handleClose}
            />
        </div>
    );
}
