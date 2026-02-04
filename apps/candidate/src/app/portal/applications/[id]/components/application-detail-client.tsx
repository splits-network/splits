"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { ProposalAlert } from "./proposal-alert";
import { DeclineModal } from "./decline-modal";
import {
    ProposalResponseWizard,
    type WizardData,
} from "./proposal-response-wizard";

interface ApplicationDetailClientProps {
    application: any;
    job: any;
    token: string;
}

export function ApplicationDetailClient({
    application,
    job,
    token,
}: ApplicationDetailClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getToken } = useAuth();
    const { success } = useToast();
    const toastShownRef = useRef(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [preScreenQuestions, setPreScreenQuestions] = useState<any[] | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);

    // Handle success query param from wizard submission (only once)
    useEffect(() => {
        if (toastShownRef.current) return;

        const successParam = searchParams.get("success");

        if (successParam === "true") {
            const toastKey = `application-submitted-toast:${application.id}`;
            const alreadyShown =
                typeof window !== "undefined"
                    ? window.sessionStorage.getItem(toastKey) === "shown"
                    : false;

            if (!alreadyShown) {
                success(
                    "Application submitted successfully! You'll receive an email once it has been reviewed.",
                );
                toastShownRef.current = true;
                if (typeof window !== "undefined") {
                    window.sessionStorage.setItem(toastKey, "shown");
                }
            }

            // Clean up URL by removing query param
            router.replace(`/portal/applications/${application.id}`);
        }
    }, [searchParams, success, router, application.id]);

    const isProposed = application.stage === "recruiter_proposed";
    const isJobActive = job?.status === "active";
    const isJobClosed = ["closed", "filled", "cancelled"].includes(job?.status);

    const handleAccept = async () => {
        try {
            setError(null);

            const client = createAuthenticatedClient(token);
            const response = await client.get(`/job-pre-screen-questions`, {
                params: { job_id: application.job_id },
            });
            const questions = response.data || response;
            setPreScreenQuestions(Array.isArray(questions) ? questions : []);
            setShowWizard(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load application wizard",
            );
        }
    };

    const handleDecline = async (reason: string, details?: string) => {
        try {
            setError(null);

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${application.id}`, {
                stage: "rejected",
                decline_reason: reason,
                decline_details: details,
                candidate_notes: details,
            });

            // Refresh page to show updated state
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to decline proposal",
            );
            throw err; // Re-throw so modal can handle it
        }
    };

    const handleCompleteApplication = async (wizardData: WizardData) => {
        try {
            setError(null);
            const candidateId = application.candidate_id;
            if (!candidateId) {
                throw new Error(
                    "Missing candidate profile for this application",
                );
            }

            // Get a fresh token for API calls
            const freshToken = await getToken();
            if (!freshToken) {
                throw new Error(
                    "Authentication required. Please sign in again.",
                );
            }

            const client = createAuthenticatedClient(freshToken);

            // Step 1: Upload new documents (if any)
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

            // Combine existing and newly uploaded document IDs
            const allDocumentIds = [
                ...wizardData.existingDocumentIds,
                ...newDocumentIds,
            ];

            // Determine primary resume ID
            let primaryResumeId: string;
            if (wizardData.primaryExistingDocId) {
                // User selected an existing document as primary
                primaryResumeId = wizardData.primaryExistingDocId;
            } else if (wizardData.primaryResumeIndex !== null) {
                // User selected a newly uploaded document as primary
                primaryResumeId = newDocumentIds[wizardData.primaryResumeIndex];
            } else {
                // Fallback to first document
                primaryResumeId = allDocumentIds[0];
            }

            // Step 2: Save pre-screen answers via V2 endpoint
            // Transform answers from { questionId: answer } to array format
            const answersArray = Object.entries(
                wizardData.preScreenAnswers,
            ).map(([question_id, answer]) => ({
                application_id: application.id,
                question_id,
                answer,
            }));

            await client.post("/job-pre-screen-answers", {
                answers: answersArray,
            });

            // Step 3: Update application via V2 PATCH
            await client.patch(`/applications/${application.id}`, {
                stage: "ai_review",
                document_ids: allDocumentIds,
                primary_resume_id: primaryResumeId,
                candidate_notes: wizardData.notes || undefined,
            });

            // Success - refresh page
            router.refresh();
        } catch (err: any) {
            console.error("Error completing application:", err);
            if (err instanceof Error) {
                console.error("Error message:", err.message);
                console.error("Error stack:", err.stack);
            }
            // Extract more specific error message if available
            const errorMessage =
                err?.response?.data?.error?.message ||
                err?.message ||
                "Failed to complete application";
            console.error("Detailed error:", errorMessage);
            setError(errorMessage);
            throw err; // Re-throw so wizard can handle it
        }
    };

    if (!isProposed) {
        return null; // No UI changes needed for non-proposed applications
    }

    const recruiterName = application.recruiter
        ? `${application.recruiter.user.name}`
        : "Your recruiter";

    return (
        <>
            {error && (
                <div className="alert alert-error mb-6">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {isJobClosed && (
                <div className="alert alert-warning mb-6">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                    <div>
                        <h3 className="font-bold">
                            This position is no longer available
                        </h3>
                        <p className="text-sm mt-1">
                            The company has closed this position and is not
                            accepting new applications.
                        </p>
                    </div>
                </div>
            )}

            <ProposalAlert
                recruiterName={recruiterName}
                recruiterPitch={application.recruiter_notes}
                onAccept={handleAccept}
                onDecline={() => setShowDeclineModal(true)}
                isDisabled={!isJobActive}
            />

            <DeclineModal
                isOpen={showDeclineModal}
                onClose={() => setShowDeclineModal(false)}
                onSubmit={handleDecline}
                jobTitle={job?.title || "this position"}
            />

            <ProposalResponseWizard
                isOpen={showWizard}
                onClose={() => setShowWizard(false)}
                applicationId={application.id}
                jobTitle={job?.title || "this position"}
                preScreenQuestions={preScreenQuestions || []}
                onComplete={handleCompleteApplication}
            />
        </>
    );
}
