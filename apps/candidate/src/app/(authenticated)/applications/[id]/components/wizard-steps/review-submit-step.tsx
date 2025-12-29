'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getMyDocuments } from '@/lib/api-client';
import type { WizardData } from '../proposal-response-wizard';

interface ReviewSubmitStepProps {
    wizardData: WizardData;
    questions: Array<{
        id: string;
        question: string;
        question_type: 'text' | 'yes_no' | 'multiple_choice';
        required: boolean;
        options?: string[];
    }>;
    onBack: () => void;
    onSubmit: () => void;
    submitting: boolean;
}

export function ReviewSubmitStep({
    wizardData,
    questions,
    onBack,
    onSubmit,
    submitting,
}: ReviewSubmitStepProps) {
    const { getToken } = useAuth();
    const [existingDocs, setExistingDocs] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);

    useEffect(() => {
        loadExistingDocs();
    }, []);

    const loadExistingDocs = async () => {
        try {
            const token = await getToken();
            if (!token) {
                setLoadingDocs(false);
                return;
            }

            const response = await getMyDocuments(token) as { data: any[] };
            setExistingDocs(response.data || []);
        } catch (err) {
            console.error('Failed to load existing documents:', err);
        } finally {
            setLoadingDocs(false);
        }
    };

    const selectedExistingDocs = existingDocs.filter((doc) =>
        wizardData.existingDocumentIds.includes(doc.id)
    );

    const primaryDocument = wizardData.primaryExistingDocId
        ? selectedExistingDocs.find((doc) => doc.id === wizardData.primaryExistingDocId)
        : wizardData.primaryResumeIndex !== null
            ? wizardData.documents[wizardData.primaryResumeIndex]
            : null;

    const answeredQuestions = questions.filter((q) => wizardData.preScreenAnswers[q.id]);

    const totalDocCount = wizardData.documents.length + selectedExistingDocs.length;

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold mb-2">
                    <i className="fa-solid fa-check-circle"></i>
                    {' '}Review Your Application
                </h4>
                <p className="text-base-content/70 text-sm">
                    Please review all information before submitting. You can go back to make changes.
                </p>
            </div>

            {/* Documents Summary */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h5 className="font-semibold flex items-center gap-2">
                        <i className="fa-solid fa-file text-primary"></i>
                        Documents ({totalDocCount})
                    </h5>

                    {loadingDocs ? (
                        <div className="flex items-center justify-center py-4">
                            <span className="loading loading-spinner"></span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Primary Document */}
                            {primaryDocument && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                                    <i className="fa-solid fa-star text-primary"></i>
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            {'name' in primaryDocument
                                                ? primaryDocument.name
                                                : primaryDocument.filename}
                                        </div>
                                        <div className="text-sm text-base-content/60">
                                            Primary Resume
                                            {wizardData.primaryExistingDocId ? ' (Existing)' : ' (New Upload)'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Existing Selected Documents (not primary) */}
                            {selectedExistingDocs.map((doc) => {
                                if (doc.id === wizardData.primaryExistingDocId) return null;
                                return (
                                    <div
                                        key={doc.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-base-200"
                                    >
                                        <i className="fa-solid fa-file text-base-content/60"></i>
                                        <div className="flex-1">
                                            <div className="font-medium">{doc.filename}</div>
                                            <div className="text-sm text-base-content/60">
                                                {doc.document_type} • {(doc.file_size / 1024).toFixed(1)} KB
                                                {' • Existing'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* New Uploaded Documents (not primary) */}
                            {wizardData.documents.map((doc, index) => {
                                if (index === wizardData.primaryResumeIndex) return null;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-base-200"
                                    >
                                        <i className="fa-solid fa-file-arrow-up text-success"></i>
                                        <div className="flex-1">
                                            <div className="font-medium">{doc.name}</div>
                                            <div className="text-sm text-base-content/60">
                                                {(doc.size / 1024).toFixed(1)} KB • New Upload
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Pre-screen Answers Summary */}
            {answeredQuestions.length > 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h5 className="font-semibold flex items-center gap-2">
                            <i className="fa-solid fa-clipboard-question text-primary"></i>
                            Pre-screening Answers ({answeredQuestions.length})
                        </h5>
                        <div className="space-y-4">
                            {answeredQuestions.map((question) => (
                                <div key={question.id}>
                                    <div className="font-medium text-sm mb-1">{question.question}</div>
                                    <div className="text-base-content/70 p-3 rounded-lg bg-base-200">
                                        {wizardData.preScreenAnswers[question.id]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Summary */}
            {wizardData.notes && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h5 className="font-semibold flex items-center gap-2">
                            <i className="fa-solid fa-note-sticky text-primary"></i>
                            Your Notes
                        </h5>
                        <div className="text-base-content/70 p-3 rounded-lg bg-base-200 whitespace-pre-wrap">
                            {wizardData.notes}
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Warning */}
            <div className="alert alert-warning">
                <i className="fa-solid fa-exclamation-triangle"></i>
                <div>
                    <div className="font-semibold">Before you submit</div>
                    <div className="text-sm">
                        Once submitted, your application will be reviewed by AI and forwarded to the employer.
                        Make sure all information is accurate and complete.
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="btn btn-outline"
                    disabled={submitting}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                    Back
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    className="btn btn-primary"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-paper-plane"></i>
                            Submit Application
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
