"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";

export interface WizardData {
    documents: File[];
    existingDocumentIds: string[];
    primaryResumeIndex: number | null;
    primaryExistingDocId: string | null;
    preScreenAnswers: { [questionId: string]: string };
    notes: string;
}

interface UseApplicationActionsOptions {
    onSuccess?: () => void;
}

interface UseApplicationActionsReturn {
    submitToAiReview: (id: string) => Promise<void>;
    submitApplication: (id: string) => Promise<void>;
    returnToDraft: (id: string) => Promise<void>;
    backToDraft: (id: string) => Promise<void>;
    withdraw: (id: string) => Promise<void>;
    declineProposal: (id: string, reason: string, details?: string) => Promise<void>;
    completeProposalApplication: (id: string, candidateId: string, wizardData: WizardData) => Promise<void>;
    loading: string | null;
    error: string | null;
    clearError: () => void;
}

export function useApplicationActions(
    options?: UseApplicationActionsOptions,
): UseApplicationActionsReturn {
    const { getToken } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getClient = async () => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        return createAuthenticatedClient(token);
    };

    const clearError = useCallback(() => setError(null), []);

    const submitToAiReview = useCallback(async (id: string) => {
        setLoading("submit-ai");
        setError(null);
        try {
            const client = await getClient();
            await client.post(`/applications/${id}/trigger-ai-review`, {});
            toast.success("Application submitted for AI review");
            options?.onSuccess?.();
        } catch (err: any) {
            const msg = err?.message || "Failed to submit for AI review";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submitApplication = useCallback(async (id: string) => {
        setLoading("submit");
        setError(null);
        try {
            const client = await getClient();
            await client.post(`/applications/${id}/submit`, {});
            toast.success("Application submitted successfully");
            options?.onSuccess?.();
        } catch (err: any) {
            const msg = err?.message || "Failed to submit application";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const returnToDraft = useCallback(async (id: string) => {
        setLoading("return-to-draft");
        setError(null);
        try {
            const client = await getClient();
            await client.post(`/applications/${id}/return-to-draft`, {});
            toast.success("Application returned to draft");
            options?.onSuccess?.();
        } catch (err: any) {
            const msg = err?.message || "Failed to return to draft";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const backToDraft = useCallback(async (id: string) => {
        setLoading("back-to-draft");
        setError(null);
        try {
            const client = await getClient();
            await client.patch(`/applications/${id}`, {
                stage: "draft",
                notes: "Candidate moved application back to draft for edits",
            });
            toast.success("Application moved to draft");
            options?.onSuccess?.();
        } catch (err: any) {
            const msg = err?.message || "Failed to move to draft";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const withdraw = useCallback(async (id: string) => {
        setLoading("withdraw");
        setError(null);
        try {
            const client = await getClient();
            const timestamp = new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
            await client.patch(`/applications/${id}`, {
                stage: "withdrawn",
                notes: `\n[${timestamp}] Candidate: Withdrew application`,
            });
            toast.success("Application withdrawn");
            options?.onSuccess?.();
        } catch (err: any) {
            const msg = err?.message || "Failed to withdraw application";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const declineProposal = useCallback(async (id: string, reason: string, details?: string) => {
        setLoading("decline");
        setError(null);
        try {
            const client = await getClient();
            await client.patch(`/applications/${id}`, {
                stage: "rejected",
                decline_reason: reason,
                decline_details: details,
            });

            if (details && details.trim()) {
                try {
                    await client.post(`/applications/${id}/notes`, {
                        created_by_type: "candidate",
                        note_type: "stage_transition",
                        visibility: "shared",
                        message_text: details.trim(),
                    });
                } catch (noteError) {
                    console.warn("Failed to create decline note:", noteError);
                }
            }

            toast.success("Proposal declined");
            options?.onSuccess?.();
        } catch (err: any) {
            const msg = err?.message || "Failed to decline proposal";
            setError(msg);
            toast.error(msg);
            throw err;
        } finally {
            setLoading(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const completeProposalApplication = useCallback(
        async (id: string, candidateId: string, wizardData: WizardData) => {
            setLoading("complete-proposal");
            setError(null);
            try {
                const client = await getClient();

                // Step 1: Upload new documents
                const newDocumentIds: string[] = [];
                for (const file of wizardData.documents) {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("entity_type", "candidate");
                    formData.append("entity_id", candidateId);
                    const docType = file.name.toLowerCase().includes("resume")
                        ? "resume"
                        : "other";
                    formData.append("document_type", docType);

                    const uploaded = await client.post("/documents", formData);
                    const doc = uploaded.data || uploaded;
                    newDocumentIds.push(doc.id);
                }

                const allDocumentIds = [
                    ...wizardData.existingDocumentIds,
                    ...newDocumentIds,
                ];

                // Determine primary resume ID
                let primaryResumeId: string;
                if (wizardData.primaryExistingDocId) {
                    primaryResumeId = wizardData.primaryExistingDocId;
                } else if (
                    wizardData.primaryResumeIndex !== null &&
                    newDocumentIds[wizardData.primaryResumeIndex]
                ) {
                    primaryResumeId = newDocumentIds[wizardData.primaryResumeIndex];
                } else {
                    primaryResumeId = allDocumentIds[0];
                }

                // Step 2: Save pre-screen answers
                const answersArray = Object.entries(
                    wizardData.preScreenAnswers,
                ).map(([question_id, answer]) => ({
                    application_id: id,
                    question_id,
                    answer,
                }));

                await client.post("/job-pre-screen-answers", {
                    answers: answersArray,
                });

                // Step 3: Update application stage
                await client.patch(`/applications/${id}`, {
                    stage: "ai_review",
                    document_ids: allDocumentIds,
                    primary_resume_id: primaryResumeId,
                });

                // Step 4: Create note if provided
                if (wizardData.notes && wizardData.notes.trim()) {
                    try {
                        await client.post(`/applications/${id}/notes`, {
                            created_by_type: "candidate",
                            note_type: "note",
                            visibility: "shared",
                            message_text: wizardData.notes.trim(),
                        });
                    } catch (noteError) {
                        console.warn("Failed to create candidate note:", noteError);
                    }
                }

                toast.success(
                    "Application submitted successfully! You'll receive an email once it has been reviewed.",
                );
                options?.onSuccess?.();
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.error?.message ||
                    err?.message ||
                    "Failed to complete application";
                setError(errorMessage);
                toast.error(errorMessage);
                throw err;
            } finally {
                setLoading(null);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return {
        submitToAiReview,
        submitApplication,
        returnToDraft,
        backToDraft,
        withdraw,
        declineProposal,
        completeProposalApplication,
        loading,
        error,
        clearError,
    };
}
