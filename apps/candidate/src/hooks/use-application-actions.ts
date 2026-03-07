"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";

interface UseApplicationActionsOptions {
    onSuccess?: () => void;
}

interface UseApplicationActionsReturn {
    submitToAiReview: (id: string) => Promise<void>;
    submitApplication: (id: string) => Promise<void>;
    returnToDraft: (id: string) => Promise<void>;
    backToDraft: (id: string) => Promise<void>;
    withdraw: (id: string) => Promise<void>;
    acceptOffer: (id: string) => Promise<void>;
    declineProposal: (id: string, reason: string, details?: string) => Promise<void>;
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
            });
            await client.post(`/applications/${id}/notes`, {
                created_by_type: "candidate",
                note_type: "stage_transition",
                visibility: "shared",
                message_text: "Candidate moved application back to draft for edits",
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
            await client.patch(`/applications/${id}`, {
                stage: "withdrawn",
            });
            await client.post(`/applications/${id}/notes`, {
                created_by_type: "candidate",
                note_type: "stage_transition",
                visibility: "shared",
                message_text: "Candidate withdrew application",
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

    const acceptOffer = useCallback(async (id: string) => {
        setLoading("accept-offer");
        setError(null);
        try {
            const client = await getClient();
            await client.post(`/applications/${id}/accept-offer`, {});
            toast.success("Offer accepted!");
            options?.onSuccess?.();
        } catch (err: any) {
            const msg = err?.message || "Failed to accept offer";
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

    return {
        submitToAiReview,
        submitApplication,
        returnToDraft,
        backToDraft,
        withdraw,
        acceptOffer,
        declineProposal,
        loading,
        error,
        clearError,
    };
}
