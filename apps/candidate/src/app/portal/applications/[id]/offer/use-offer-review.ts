"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import type { Application } from "../../types";

export function useOfferReview(applicationId: string) {
    const { getToken } = useAuth();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const res = await client.get(
                    `/applications/${applicationId}/view/detail`,
                );
                const app: Application = res.data;

                if (app.stage !== "offer") {
                    setError(
                        `This application is currently at the "${app.stage}" stage. Offer review is only available when you have a pending offer.`,
                    );
                }

                if (app.accepted_by_candidate) {
                    setAccepted(true);
                }

                setApplication(app);
            } catch {
                setError("Failed to load application details.");
            } finally {
                setLoading(false);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId]);

    const handleAccept = useCallback(async () => {
        if (processing) return;
        setProcessing(true);

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.post(`/applications/${applicationId}/accept-offer`, {});

            toast.success("Offer accepted — congratulations!");
            setAccepted(true);
        } catch (err: any) {
            console.error("Failed to accept offer:", err);
            toast.error(
                err?.response?.data?.error?.message ||
                    "Failed to accept offer. Please try again.",
            );
        } finally {
            setProcessing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processing, applicationId]);

    const totalSteps = application?.documents?.some((d) =>
        [
            "offer_letter",
            "employment_contract",
            "benefits_summary",
            "company_handbook",
            "nda",
            "company_document",
        ].includes(d.document_type || ""),
    )
        ? 3
        : 2;

    const handleNext = () => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
    const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

    return {
        loading,
        error,
        application,
        currentStep,
        setCurrentStep,
        totalSteps,
        processing,
        accepted,
        handleAccept,
        handleNext,
        handleBack,
    };
}
