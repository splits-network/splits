"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { WizardData } from "../../modals/proposal-response-wizard";

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50 flex-shrink-0 pt-0.5">
                {label}
            </span>
            <span className="text-sm text-base-content/80 text-right">
                {value}
            </span>
        </div>
    );
}

interface ReviewSubmitStepProps {
    wizardData: WizardData;
    questions: Array<{
        id: string;
        question: string;
        question_type: "text" | "yes_no" | "multiple_choice";
        required: boolean;
        options?: string[];
    }>;
}

export function ReviewSubmitStep({
    wizardData,
    questions,
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

            const client = createAuthenticatedClient(token);
            const response = await client.get("/documents");
            const docs = response.data || response;
            setExistingDocs(docs);
        } catch (err) {
            console.error("Failed to load existing documents:", err);
        } finally {
            setLoadingDocs(false);
        }
    };

    const selectedExistingDocs = existingDocs.filter((doc) =>
        wizardData.existingDocumentIds.includes(doc.id),
    );

    const primaryDocument = wizardData.primaryExistingDocId
        ? selectedExistingDocs.find(
              (doc) => doc.id === wizardData.primaryExistingDocId,
          )
        : wizardData.primaryResumeIndex !== null
          ? wizardData.documents[wizardData.primaryResumeIndex]
          : null;

    const answeredQuestions = questions.filter(
        (q) => wizardData.preScreenAnswers[q.id],
    );

    const totalDocCount =
        wizardData.documents.length + selectedExistingDocs.length;

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    Final Step
                </p>
                <h4 className="text-sm font-black tracking-tight mb-2">
                    Review Your Application
                </h4>
                <p className="text-base-content/70 text-sm">
                    Please review all information before submitting. You can go
                    back to make changes.
                </p>
            </div>

            {/* Documents Section */}
            <div className="bg-base-200 p-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                    Documents ({totalDocCount})
                </p>

                {loadingDocs ? (
                    <div className="flex items-center justify-center py-4">
                        <span className="loading loading-spinner"></span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* Primary Document */}
                        {primaryDocument && (
                            <div className="bg-primary/10 border-l-4 border-primary p-4">
                                <div className="flex items-center gap-3">
                                    <i className="fa-duotone fa-regular fa-star text-primary"></i>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">
                                            {"name" in primaryDocument
                                                ? primaryDocument.name
                                                : primaryDocument.file_name}
                                        </div>
                                        <div className="text-xs text-base-content/40">
                                            Primary Resume
                                            {wizardData.primaryExistingDocId
                                                ? " (Existing)"
                                                : " (New Upload)"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Existing Selected Documents (not primary) */}
                        {selectedExistingDocs.map((doc) => {
                            if (doc.id === wizardData.primaryExistingDocId)
                                return null;
                            return (
                                <ReviewRow
                                    key={doc.id}
                                    label={doc.document_type}
                                    value={
                                        <span>
                                            {doc.file_name}
                                            <span className="text-base-content/40 ml-2">
                                                {(doc.file_size / 1024).toFixed(1)} KB • Existing
                                            </span>
                                        </span>
                                    }
                                />
                            );
                        })}

                        {/* New Uploaded Documents (not primary) */}
                        {wizardData.documents.map((doc, index) => {
                            if (index === wizardData.primaryResumeIndex)
                                return null;
                            return (
                                <ReviewRow
                                    key={index}
                                    label="New Upload"
                                    value={
                                        <span>
                                            {doc.name}
                                            <span className="text-base-content/40 ml-2">
                                                {(doc.size / 1024).toFixed(1)} KB
                                            </span>
                                        </span>
                                    }
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Cover Letter Section */}
            <div className="bg-base-200 p-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                    Cover Letter
                </p>

                {/* Show uploaded cover letter files */}
                {selectedExistingDocs.filter(
                    (doc) => doc.document_type === "cover_letter",
                ).length > 0 && (
                    <div className="space-y-2 mb-2">
                        {selectedExistingDocs
                            .filter(
                                (doc) =>
                                    doc.document_type === "cover_letter",
                            )
                            .map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-2 p-2 bg-base-100"
                                >
                                    <i className="fa-duotone fa-regular fa-file-lines text-primary"></i>
                                    <span className="font-bold text-sm">
                                        {doc.file_name}
                                    </span>
                                    <span className="text-xs text-base-content/40">
                                        ({(doc.file_size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                            ))}
                    </div>
                )}

                {/* Show cover letter text */}
                {wizardData.coverLetter ? (
                    <div className="bg-base-100 p-4 text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {wizardData.coverLetter}
                    </div>
                ) : selectedExistingDocs.filter(
                      (doc) => doc.document_type === "cover_letter",
                  ).length > 0 ? null : (
                    <p className="text-sm text-base-content/30 italic">
                        No cover letter provided
                    </p>
                )}
            </div>

            {/* Pre-screen Answers Section */}
            {answeredQuestions.length > 0 && (
                <div className="bg-base-200 p-6 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                        Screening Answers ({answeredQuestions.length})
                    </p>
                    <div className="space-y-3">
                        {answeredQuestions.map((question, index) => (
                            <div key={question.id}>
                                <p className="text-xs text-base-content/50 mb-0.5">
                                    {index + 1}. {question.question}
                                </p>
                                <p className="text-sm font-bold">
                                    {wizardData.preScreenAnswers[question.id]}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes Section */}
            {wizardData.notes && (
                <div className="bg-base-200 p-6 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                        Additional Notes
                    </p>
                    <p className="text-sm text-base-content/70 whitespace-pre-wrap">
                        {wizardData.notes}
                    </p>
                </div>
            )}

            {/* Submission Warning */}
            <div className="alert alert-warning">
                <i className="fa-duotone fa-regular fa-exclamation-triangle"></i>
                <div>
                    <div className="font-bold text-sm">Before you submit</div>
                    <div className="text-sm">
                        Once submitted, your application will be reviewed by AI
                        and forwarded to the employer. Make sure all information
                        is accurate and complete.
                    </div>
                </div>
            </div>
        </div>
    );
}
