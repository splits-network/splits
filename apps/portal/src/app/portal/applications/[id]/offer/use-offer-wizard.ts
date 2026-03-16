"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import type { Application } from "../../types";
import type { StagedDocument } from "@/components/documents/company-document-upload";

export function useOfferWizard(applicationId: string) {
    const { getToken } = useAuth();
    const toast = useToast();

    // Data loading
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [feePercentage, setFeePercentage] = useState<number | null>(null);
    const [guaranteeDays, setGuaranteeDays] = useState(90);

    // Wizard state
    const [currentStep, setCurrentStep] = useState(0);
    const [salary, setSalary] = useState("");
    const [startDate, setStartDate] = useState("");
    const [notes, setNotes] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showDocUpload, setShowDocUpload] = useState(false);
    const [stagedDocuments, setStagedDocuments] = useState<StagedDocument[]>([]);
    const [completed, setCompleted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Load application and job fee data
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const res = await client.get(
                    `/applications/${applicationId}/view/detail?include=recruiter,documents,timeline,ai_review`,
                );
                const app: Application = res.data;

                if (app.stage !== "interview") {
                    setError(
                        `This application is currently at the "${app.stage}" stage. Offers can only be extended from the interview stage.`,
                    );
                    setApplication(app);
                    return;
                }

                setApplication(app);

                // Fetch job fee data
                if (app.job_id) {
                    try {
                        const jobRes = await client.get(`/jobs/${app.job_id}`);
                        const job = jobRes.data;
                        setFeePercentage(job.fee_percentage ?? null);
                        setGuaranteeDays(job.guarantee_days ?? 90);
                    } catch {
                        // Non-critical: fee data is informational
                    }
                }
            } catch {
                setError("Failed to load application details.");
            } finally {
                setLoading(false);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId]);

    // Upload staged documents
    const uploadStagedDocuments = useCallback(async () => {
        if (stagedDocuments.length === 0) return;
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const client = createAuthenticatedClient(token);
        const uploads = stagedDocuments.map(async (doc) => {
            const formData = new FormData();
            formData.append("file", doc.file);
            formData.append("entity_type", "application");
            formData.append("entity_id", applicationId);
            formData.append("document_type", doc.document_type);
            return client.post("/documents", formData);
        });

        await Promise.all(uploads);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stagedDocuments, applicationId]);

    // Submit offer
    const handleSubmit = useCallback(async () => {
        if (!agreeTerms || processing) return;
        setProcessing(true);
        setSubmitError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            if (stagedDocuments.length > 0) {
                await uploadStagedDocuments();
            }

            const client = createAuthenticatedClient(token);
            const parsedSalary = parseFloat(salary) || 0;

            await client.patch(`/applications/${applicationId}`, {
                stage: "offer",
                salary: parsedSalary,
                ...(startDate ? { start_date: startDate } : {}),
            });

            if (notes.trim()) {
                await client.post(`/application-notes`, {
                    application_id: applicationId,
                    note_type: "stage_transition",
                    message_text: notes.trim(),
                    visibility: "team",
                });
            }

            toast.success("Offer extended.");
            setCompleted(true);
        } catch (err: any) {
            console.error("Failed to extend offer:", err);
            setSubmitError(
                err instanceof Error ? err.message : "Failed to extend offer. Please try again.",
            );
        } finally {
            setProcessing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agreeTerms, processing, salary, notes, stagedDocuments, applicationId, uploadStagedDocuments]);

    // Navigation
    const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 3));
    const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));
    const canContinue = currentStep === 1
        ? salary.trim() !== "" && startDate.trim() !== ""
        : true;

    return {
        // Data
        loading,
        error,
        application,
        feePercentage,
        guaranteeDays,
        // Wizard state
        currentStep,
        setCurrentStep,
        salary,
        setSalary,
        startDate,
        setStartDate,
        notes,
        setNotes,
        agreeTerms,
        setAgreeTerms,
        processing,
        showDocUpload,
        setShowDocUpload,
        stagedDocuments,
        setStagedDocuments,
        completed,
        submitError,
        // Actions
        handleSubmit,
        handleNext,
        handleBack,
        canContinue,
    };
}
