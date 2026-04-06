"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import { BaselWizardModal, BaselAlertBox } from "@splits-network/basel-ui";
import StepGetStarted from "@/components/application-wizard/step-get-started";
import StepDocuments from "@/components/application-wizard/step-documents";
import StepCoverLetter from "@/components/application-wizard/step-cover-letter";
import StepQuestions from "@/components/application-wizard/step-questions";
import StepNotes from "@/components/application-wizard/step-notes";
import StepRecruiter from "@/components/application-wizard/step-recruiter";
import StepReview from "@/components/application-wizard/step-review";
import StepAiResults from "@/components/application-wizard/step-ai-results";
import type { ReviewProcessingStage } from "@/components/application-wizard/step-review";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApplicationWizardModalProps {
    jobId: string;
    jobTitle: string;
    companyName: string;
    onClose: () => void;
    onSuccess?: (applicationId: string) => void;
    existingApplication?: any;
}

interface WizardStep {
    label: string;
    description: string;
}

// ─── Step Builder ────────────────────────────────────────────────────────────

function buildWizardSteps(
    hasQuestions: boolean,
    hasRecruiterChoice: boolean,
): WizardStep[] {
    const steps: WizardStep[] = [
        {
            label: "Get Started",
            description: "Overview of the application process.",
        },
        {
            label: "Documents",
            description:
                "Attach any supporting documents like portfolios or certifications.",
        },
        {
            label: "Cover Letter",
            description:
                "Add an optional cover letter to strengthen your application.",
        },
    ];
    if (hasQuestions) {
        steps.push({
            label: "Questions",
            description: "Answer screening questions from the hiring team.",
        });
    }
    steps.push({
        label: "Notes",
        description: "Share any additional context with the employer.",
    });
    if (hasRecruiterChoice) {
        steps.push({
            label: "Recruiter",
            description: "Choose which recruiter should represent you.",
        });
    }
    steps.push({
        label: "Review",
        description: "Review your application and get your AI fit analysis.",
    });
    steps.push({
        label: "AI Results",
        description: "See your fit analysis and submit your application.",
    });
    return steps;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ApplicationWizardModal({
    jobId,
    jobTitle,
    companyName,
    onClose,
    onSuccess,
    existingApplication,
}: ApplicationWizardModalProps) {
    const router = useRouter();
    const { getToken } = useAuth();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [localDocuments, setLocalDocuments] = useState<any[]>([]);
    const [activeRecruiters, setActiveRecruiters] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        documents: {
            selected:
                existingApplication?.documents?.map((d: any) => d.id) ||
                ([] as string[]),
        },
        cover_letter: existingApplication?.cover_letter || "",
        pre_screen_answers:
            existingApplication?.pre_screen_answers?.map(
                (a: any, i: number) => ({
                    index: i,
                    answer: a.answer,
                }),
            ) ||
            ([] as Array<{
                index: number;
                answer: string | string[] | boolean;
            }>),
        notes:
            existingApplication?.notes ||
            existingApplication?.candidate_notes ||
            "",
        candidate_recruiter_id:
            existingApplication?.candidate_recruiter_id ||
            (null as string | null),
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCoverLetterSkipWarning, setShowCoverLetterSkipWarning] =
        useState(false);

    // AI review state
    const [applicationId, setApplicationId] = useState<string | null>(
        existingApplication?.id || null,
    );
    const [reviewProcessingStage, setReviewProcessingStage] =
        useState<ReviewProcessingStage>("idle");
    const [aiReview, setAiReview] = useState<any>(null);
    const tailoredResumeStarted = useRef(false);
    const [tailoredResumeReady, setTailoredResumeReady] = useState(false);
    const [tailoredResumeData, setTailoredResumeData] = useState<any>(null);
    const tailoredResumeRef = useRef<any>(null);
    const [isRerunning, setIsRerunning] = useState(false);

    const hasQuestions = questions.length > 0;
    const hasRecruiterChoice = activeRecruiters.length > 1;
    const wizardSteps = buildWizardSteps(hasQuestions, hasRecruiterChoice);
    const currentStepLabel = wizardSteps[currentStep]?.label || "";
    const isReviewStep = currentStepLabel === "Review";
    const isAiResultsStep = currentStepLabel === "AI Results";

    /* ─── Data Loading ────────────────────────────────────────────────── */

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                const token = await getToken();
                if (!token) throw new Error("Authentication required");

                const authClient = createAuthenticatedClient(token);

                // Move existing application to draft so it can transition to ai_review later
                if (existingApplication?.id && existingApplication.stage !== "draft") {
                    try {
                        await authClient.patch(`/applications/${existingApplication.id}`, {
                            stage: "draft",
                        });
                    } catch (err) {
                        console.warn("Failed to move application to draft:", err);
                    }
                }

                const [jobResponse, documentsResponse, recruitersResponse] =
                    await Promise.all([
                        authClient.get<{ data: any }>(
                            `/jobs/${jobId}/view/candidate-detail`,
                        ),
                        authClient.get<{ data: any[] }>("/documents"),
                        authClient.get<{ data: any[] }>(
                            "/recruiter-candidates/views/list-for-candidate",
                        ),
                    ]);

                const jobData = jobResponse.data;
                const questionsData = jobData.pre_screen_questions || [];
                let documentsData = documentsResponse.data || [];

                if (existingApplication?.documents?.length > 0) {
                    const appDocIds = new Set(
                        existingApplication.documents.map((doc: any) => doc.id),
                    );
                    const appOriginalDocIds = new Set(
                        existingApplication.documents
                            .map(
                                (doc: any) =>
                                    doc.metadata?.original_document_id,
                            )
                            .filter(Boolean),
                    );
                    documentsData = documentsData.filter(
                        (doc: any) =>
                            !appDocIds.has(doc.id) &&
                            !appOriginalDocIds.has(doc.id),
                    );
                    documentsData = [
                        ...documentsData,
                        ...existingApplication.documents,
                    ];
                }

                const allRecruiters = recruitersResponse.data || [];
                const active = allRecruiters.filter(
                    (r: any) =>
                        r.status === "active" && r.consent_given === true,
                );
                setActiveRecruiters(active);

                if (
                    active.length === 1 &&
                    !existingApplication?.candidate_recruiter_id
                ) {
                    setFormData((prev) => ({
                        ...prev,
                        candidate_recruiter_id: active[0].recruiter_id,
                    }));
                }

                setJob(jobData);
                setQuestions(questionsData);
                setDocuments(documentsData);
                setLocalDocuments(documentsData);
            } catch (err: any) {
                console.error("Failed to load application data:", err);
                setError(err.message || "Failed to load application data");
            } finally {
                setLoading(false);
            }
        }

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId]);

    /* ─── Tailored Resume Generation (fire-and-forget from Get Started) ── */

    const startTailoredResumeGeneration = useCallback(async () => {
        if (tailoredResumeStarted.current) return;
        tailoredResumeStarted.current = true;

        try {
            const token = await getToken();
            if (!token) return;

            const authClient = createAuthenticatedClient(token);
            // Get candidate_id
            const candidateResponse = await authClient.get("/candidates", {
                params: { limit: 1 },
            });
            const candidateId = candidateResponse.data?.[0]?.id;
            if (!candidateId) {
                // Can't generate — let it pass through so AI review still works
                setTailoredResumeReady(true);
                return;
            }

            // Await the result so we know when it's done
            authClient
                .post("/ai-reviews/actions/generate-resume", {
                    candidate_id: candidateId,
                    job_id: jobId,
                })
                .then((response: any) => {
                    const data = response.data || response;
                    setTailoredResumeData(data);
                    tailoredResumeRef.current = data;
                    setTailoredResumeReady(true);
                })
                .catch((err: any) => {
                    console.warn(
                        "Tailored resume generation failed (non-blocking):",
                        err,
                    );
                    // Still mark as ready — AI review can proceed without it
                    setTailoredResumeReady(true);
                });
        } catch (err) {
            console.warn("Failed to start tailored resume generation:", err);
            setTailoredResumeReady(true);
        }
    }, [getToken, jobId]);

    /* ─── AI Review: Create Application + Trigger + Poll ──────────────── */

    const startAiReview = useCallback(async () => {
        setReviewProcessingStage("creating");
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            const authClient = createAuthenticatedClient(token);

            // Step 1: Create or update the application
            let appId = applicationId;

            const preScreenAnswers = questions.map((q: any, i: number) => {
                const ans = formData.pre_screen_answers.find(
                    (a: any) => a.index === i,
                );
                return {
                    question: q.question,
                    question_type: q.question_type,
                    is_required: q.is_required,
                    ...(q.options ? { options: q.options } : {}),
                    ...(q.disclaimer ? { disclaimer: q.disclaimer } : {}),
                    answer: ans?.answer ?? null,
                };
            });

            const currentResumeData = tailoredResumeRef.current;

            if (existingApplication) {
                await authClient.patch(
                    `/applications/${existingApplication.id}`,
                    {
                        document_ids: formData.documents.selected,
                        cover_letter: formData.cover_letter,
                        pre_screen_answers: preScreenAnswers,
                        ...(currentResumeData ? { resume_data: currentResumeData } : {}),
                    },
                );
                appId = existingApplication.id;
            } else {
                const payload: Record<string, any> = {
                    job_id: jobId,
                    document_ids: formData.documents.selected,
                    cover_letter: formData.cover_letter,
                    pre_screen_answers: preScreenAnswers,
                };
                if (currentResumeData) {
                    payload.resume_data = currentResumeData;
                }
                if (formData.candidate_recruiter_id) {
                    payload.candidate_recruiter_id =
                        formData.candidate_recruiter_id;
                    payload.application_source = "recruiter";
                }
                const result = await authClient.post("/applications", payload);
                appId = result.data.id;
            }

            setApplicationId(appId);

            // Save notes
            if (formData.notes?.trim()) {
                try {
                    await authClient.post(`/applications/${appId}/notes`, {
                        created_by_type: "candidate",
                        note_type: "note",
                        visibility: "shared",
                        message_text: formData.notes.trim(),
                    });
                } catch (noteError) {
                    console.warn("Failed to create candidate note:", noteError);
                }
            }

            // Step 2: Trigger AI review by transitioning to ai_review stage
            setReviewProcessingStage("reviewing");
            await authClient.patch(`/applications/${appId}`, {
                stage: "ai_review",
            });

            // Step 3: Poll for AI review completion
            if (appId) {
                await pollForAiReview(appId);
            }
        } catch (err: any) {
            console.error("AI review process failed:", err);
            setError(err.message || "Failed to process AI review");
            setReviewProcessingStage("error");
        }
    }, [
        applicationId,
        existingApplication,
        jobId,
        formData,
        questions,
        getToken,
    ]);

    const pollForAiReview = useCallback(
        async (appId: string) => {
            const MAX_POLLS = 30; // 30 × 3s = 90s max
            const POLL_INTERVAL = 3000;

            for (let i = 0; i < MAX_POLLS; i++) {
                const token = await getToken();
                if (!token) throw new Error("Authentication expired");

                const client = createAuthenticatedClient(token);
                const [reviewResponse, appResponse] = await Promise.all([
                    client.get("/ai-reviews", {
                        params: { application_id: appId, limit: 1 },
                    }),
                    client.get(`/applications/${appId}`),
                ]);

                const reviews = reviewResponse.data || [];
                const appStage = appResponse.data?.stage;
                // Wait for both: AI review data exists AND application stage updated to ai_reviewed
                if (
                    reviews.length > 0 &&
                    reviews[0].fit_score != null &&
                    appStage === "ai_reviewed"
                ) {
                    setAiReview(reviews[0]);
                    setReviewProcessingStage("complete");
                    return;
                }

                await new Promise((resolve) =>
                    setTimeout(resolve, POLL_INTERVAL),
                );
            }

            throw new Error(
                "AI review timed out. Your application was saved as a draft — you can check back later.",
            );
        },
        [getToken],
    );

    /* ─── Step Validation & Navigation ─────────────────────────────────── */

    const validateDocuments = useCallback((): string | null => {
        // Supporting documents are optional — no validation needed
        return null;
    }, []);

    const validateQuestions = useCallback((): string | null => {
        const missingRequired = questions
            .filter((q: any) => q.is_required)
            .filter((_: any, idx: number) => {
                const ans = formData.pre_screen_answers.find(
                    (a: any) => a.index === idx,
                );
                const answer = ans?.answer;
                if (answer === undefined || answer === null || answer === "")
                    return true;
                if (Array.isArray(answer) && answer.length === 0) return true;
                return false;
            });
        if (missingRequired.length > 0) {
            return `${missingRequired.length} required ${missingRequired.length === 1 ? "question needs" : "questions need"} an answer before you can continue.`;
        }
        return null;
    }, [questions, formData.pre_screen_answers]);

    const handleNext = useCallback(() => {
        setError(null);
        setShowCoverLetterSkipWarning(false);

        // Fire tailored resume generation when leaving Get Started
        if (currentStepLabel === "Get Started") {
            startTailoredResumeGeneration();
        }

        if (currentStepLabel === "Documents") {
            const validationError = validateDocuments();
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        if (currentStepLabel === "Cover Letter") {
            const uploadedCoverLetterDocs = localDocuments.filter(
                (doc: any) =>
                    doc.document_type === "cover_letter" &&
                    formData.documents.selected.includes(doc.id),
            );
            if (
                !formData.cover_letter?.trim() &&
                uploadedCoverLetterDocs.length === 0
            ) {
                setShowCoverLetterSkipWarning(true);
                return;
            }
        }

        if (currentStepLabel === "Questions") {
            const validationError = validateQuestions();
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        setCurrentStep((prev) => Math.min(prev + 1, wizardSteps.length - 1));
    }, [
        currentStepLabel,
        validateDocuments,
        validateQuestions,
        wizardSteps.length,
        localDocuments,
        formData,
        startTailoredResumeGeneration,
    ]);

    const handleCoverLetterSkipConfirm = useCallback(() => {
        setShowCoverLetterSkipWarning(false);
        setCurrentStep((prev) => Math.min(prev + 1, wizardSteps.length - 1));
    }, [wizardSteps.length]);

    const handleBack = useCallback(() => {
        setError(null);
        setShowCoverLetterSkipWarning(false);
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }, []);

    const handleClose = useCallback(() => {
        if (
            submitting ||
            reviewProcessingStage === "creating" ||
            reviewProcessingStage === "reviewing"
        )
            return;
        // Allow close even if tailored resume is still generating — it's non-blocking
        onClose();
    }, [submitting, reviewProcessingStage, onClose]);

    /* ─── Final Submission (from AI Results step) ────────────────────── */

    const handleFinalSubmit = useCallback(async () => {
        if (!applicationId) return;

        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            const authClient = createAuthenticatedClient(token);
            // Use the dedicated submit endpoint which routes to
            // recruiter_review (if candidate has recruiter) or submitted (direct)
            await authClient.post(`/applications/${applicationId}/submit`, {});

            onSuccess?.(applicationId);
            onClose();
            router.push(`/portal/applications?applicationId=${applicationId}`);
        } catch (err: any) {
            console.error("Failed to submit application:", err);
            setError(err.message || "Failed to submit application");
            setSubmitting(false);
        }
    }, [applicationId, getToken, onClose, router]);

    /* ─── Re-run AI Review (from AI Results step after resume changes) ─── */

    const handleRerunAnalysis = useCallback(async () => {
        if (!applicationId) return;

        setIsRerunning(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            const authClient = createAuthenticatedClient(token);

            // 1. Regenerate tailored resume with updated Smart Resume data
            const candidateResponse = await authClient.get("/candidates", {
                params: { limit: 1 },
            });
            const candidateId = candidateResponse.data?.[0]?.id;
            if (candidateId) {
                try {
                    const resumeResponse = await authClient.post(
                        "/ai-reviews/actions/generate-resume",
                        { candidate_id: candidateId, job_id: jobId },
                    );
                    const regenData = resumeResponse.data || resumeResponse;
                    setTailoredResumeData(regenData);
                    tailoredResumeRef.current = regenData;
                } catch (err) {
                    console.warn("Tailored resume regeneration failed:", err);
                }
            }

            // 2. Save updated tailored resume + re-trigger AI review
            const latestResumeData = tailoredResumeRef.current;
            await authClient.patch(`/applications/${applicationId}`, {
                stage: "ai_review",
                ...(latestResumeData ? { resume_data: latestResumeData } : {}),
            });

            // 3. Poll for new review
            await pollForAiReview(applicationId);
        } catch (err: any) {
            console.error("Re-run analysis failed:", err);
            setError(err.message || "Failed to re-run analysis");
        } finally {
            setIsRerunning(false);
        }
    }, [applicationId, jobId, getToken, pollForAiReview]);

    const handleSaveAsDraft = useCallback(async () => {
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            const authClient = createAuthenticatedClient(token);
            const preScreenAnswers = questions.map((q: any, i: number) => {
                const ans = formData.pre_screen_answers.find(
                    (a: any) => a.index === i,
                );
                return {
                    question: q.question,
                    question_type: q.question_type,
                    is_required: q.is_required,
                    ...(q.options ? { options: q.options } : {}),
                    ...(q.disclaimer ? { disclaimer: q.disclaimer } : {}),
                    answer: ans?.answer ?? null,
                };
            });

            let appId = applicationId;
            if (existingApplication) {
                await authClient.patch(
                    `/applications/${existingApplication.id}`,
                    {
                        document_ids: formData.documents.selected,
                        cover_letter: formData.cover_letter,
                        pre_screen_answers: preScreenAnswers,
                    },
                );
                appId = existingApplication.id;
            } else {
                const payload: Record<string, any> = {
                    job_id: jobId,
                    document_ids: formData.documents.selected,
                    cover_letter: formData.cover_letter,
                    pre_screen_answers: preScreenAnswers,
                };
                if (formData.candidate_recruiter_id) {
                    payload.candidate_recruiter_id =
                        formData.candidate_recruiter_id;
                    payload.application_source = "recruiter";
                }
                const result = await authClient.post("/applications", payload);
                appId = result.data.id;
            }

            if (formData.notes?.trim() && appId) {
                try {
                    await authClient.post(`/applications/${appId}/notes`, {
                        created_by_type: "candidate",
                        note_type: "note",
                        visibility: "shared",
                        message_text: formData.notes.trim(),
                    });
                } catch (noteError) {
                    console.warn("Failed to create candidate note:", noteError);
                }
            }

            if (appId) onSuccess?.(appId);
            onClose();
            router.push(`/portal/applications?draft=true&application=${appId}`);
        } catch (err: any) {
            console.error("Failed to save draft:", err);
            setError(err.message || "Failed to save draft");
            setSubmitting(false);
        }
    }, [
        applicationId,
        existingApplication,
        jobId,
        formData,
        questions,
        getToken,
        onClose,
        router,
    ]);

    /* ─── Derived: next disabled ──────────────────────────────────────── */

    const nextDisabled =
        loading ||
        (currentStepLabel === "Recruiter" &&
            !formData.candidate_recruiter_id) ||
        currentStepLabel === "AI Results"; // AI Results uses custom footer

    /* ─── Step Rendering ──────────────────────────────────────────────── */

    const renderStep = () => {
        if (!job) return null;

        switch (currentStepLabel) {
            case "Get Started":
                return (
                    <StepGetStarted
                        jobTitle={jobTitle}
                        companyName={companyName}
                        hasQuestions={hasQuestions}
                    />
                );
            case "Documents":
                return (
                    <StepDocuments
                        documents={localDocuments}
                        selected={formData.documents.selected}
                        onChange={(docs: any) =>
                            setFormData({ ...formData, documents: docs })
                        }
                        onDocumentsUpdated={setLocalDocuments}
                        error={error}
                    />
                );
            case "Cover Letter": {
                const uploadedCoverLetterDocs = localDocuments.filter(
                    (doc: any) =>
                        doc.document_type === "cover_letter" &&
                        formData.documents.selected.includes(doc.id),
                );
                return (
                    <StepCoverLetter
                        coverLetter={formData.cover_letter}
                        onChange={(coverLetter: string) =>
                            setFormData({
                                ...formData,
                                cover_letter: coverLetter,
                            })
                        }
                        onSkipConfirm={handleCoverLetterSkipConfirm}
                        showSkipWarning={showCoverLetterSkipWarning}
                        uploadedCoverLetterDocs={uploadedCoverLetterDocs}
                    />
                );
            }
            case "Questions":
                return (
                    <StepQuestions
                        questions={questions}
                        answers={formData.pre_screen_answers}
                        onChange={(answers: any) =>
                            setFormData({
                                ...formData,
                                pre_screen_answers: answers,
                            })
                        }
                        error={error}
                    />
                );
            case "Notes":
                return (
                    <StepNotes
                        notes={formData.notes}
                        onChange={(notes: string) =>
                            setFormData({ ...formData, notes })
                        }
                    />
                );
            case "Recruiter":
                return (
                    <StepRecruiter
                        recruiters={activeRecruiters}
                        selectedRecruiterId={formData.candidate_recruiter_id}
                        onChange={(id: string) =>
                            setFormData({
                                ...formData,
                                candidate_recruiter_id: id,
                            })
                        }
                    />
                );
            case "Review":
                return (
                    <StepReview
                        job={job}
                        documents={documents}
                        selectedDocuments={formData.documents.selected}
                        coverLetter={formData.cover_letter}
                        questions={questions}
                        answers={formData.pre_screen_answers}
                        additionalNotes={formData.notes}
                        selectedRecruiter={
                            activeRecruiters.find(
                                (r: any) =>
                                    r.recruiter_id ===
                                    formData.candidate_recruiter_id,
                            ) || null
                        }
                        error={error}
                        processingStage={
                            !tailoredResumeReady &&
                            reviewProcessingStage === "idle"
                                ? "tailoring"
                                : reviewProcessingStage
                        }
                        tailoredResume={tailoredResumeData}
                    />
                );
            case "AI Results":
                return aiReview ? (
                    <StepAiResults
                        review={aiReview}
                        jobTitle={jobTitle}
                        onRerunRequested={handleRerunAnalysis}
                        isRerunning={isRerunning}
                    />
                ) : null;
            default:
                return null;
        }
    };

    /* ─── Custom footer for Review step ───────────────────────────────── */

    const reviewFooter = isReviewStep ? (
        <>
            <div>
                <button
                    onClick={handleBack}
                    className="btn btn-ghost"
                    disabled={
                        reviewProcessingStage === "creating" ||
                        reviewProcessingStage === "reviewing"
                    }
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    Back
                </button>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={handleSaveAsDraft}
                    className="btn btn-ghost"
                    disabled={
                        reviewProcessingStage === "creating" ||
                        reviewProcessingStage === "reviewing"
                    }
                >
                    <i className="fa-duotone fa-regular fa-floppy-disk" />
                    Save Draft
                </button>
                {!tailoredResumeReady &&
                (reviewProcessingStage === "idle" ||
                    reviewProcessingStage === "error") ? (
                    <button className="btn btn-primary" disabled>
                        <span className="loading loading-spinner loading-sm" />
                        Preparing your tailored resume...
                    </button>
                ) : reviewProcessingStage === "idle" ||
                  reviewProcessingStage === "error" ? (
                    <button onClick={startAiReview} className="btn btn-primary">
                        <i className="fa-duotone fa-regular fa-brain-circuit" />
                        Get Your AI Review
                    </button>
                ) : reviewProcessingStage === "complete" ? (
                    <button
                        onClick={() => setCurrentStep((prev) => prev + 1)}
                        className="btn btn-primary"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-right" />
                        See Your Results
                    </button>
                ) : (
                    <button className="btn btn-primary" disabled>
                        <span className="loading loading-spinner loading-sm" />
                        Analyzing...
                    </button>
                )}
            </div>
        </>
    ) : undefined;

    /* ─── Custom footer for AI Results step ──────────────────────────── */

    const handleSaveAsDraftFromResults = useCallback(() => {
        // Application already exists from the Review step — just close and redirect
        if (applicationId) onSuccess?.(applicationId);
        onClose();
        router.push(`/portal/applications?draft=true&application=${applicationId}`);
    }, [applicationId, onClose, onSuccess, router]);

    const aiResultsFooter = isAiResultsStep ? (
        <>
            <div>
                <button
                    onClick={handleBack}
                    className="btn btn-ghost"
                    disabled={submitting}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    Go Back & Improve
                </button>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={handleSaveAsDraftFromResults}
                    className="btn btn-ghost"
                    disabled={submitting}
                >
                    <i className="fa-duotone fa-regular fa-floppy-disk" />
                    Save Draft
                </button>
                <button
                    onClick={handleFinalSubmit}
                    className="btn btn-primary"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-paper-plane" />
                            Submit to Job
                        </>
                    )}
                </button>
            </div>
        </>
    ) : undefined;

    /* ─── Render ──────────────────────────────────────────────────────── */

    return (
        <BaselWizardModal
            isOpen={true}
            onClose={handleClose}
            title={
                existingApplication
                    ? "Edit Your Application"
                    : "Apply to This Role"
            }
            icon="fa-duotone fa-regular fa-paper-plane"
            accentColor="primary"
            steps={wizardSteps}
            currentStep={currentStep}
            onNext={handleNext}
            onBack={handleBack}
            submitting={submitting}
            nextDisabled={nextDisabled}
            nextLabel="Continue"
            maxWidth="max-w-3xl"
            showHelpPanel
            footer={reviewFooter || aiResultsFooter}
        >
            {/* Job context bar */}
            <div className="bg-base-200 border-b border-base-300 px-4 py-3 -mx-6 -mt-6 mb-6">
                <div className="flex items-center gap-3 text-sm">
                    <i className="fa-duotone fa-regular fa-briefcase text-primary" />
                    <span className="font-bold">{jobTitle}</span>
                    <span className="text-base-content/40">at</span>
                    <span className="text-base-content/60">{companyName}</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <span className="loading loading-spinner loading-lg text-primary mb-4" />
                    <p className="text-sm font-semibold text-base-content/40 uppercase tracking-wider">
                        Preparing your application...
                    </p>
                </div>
            ) : error && !job ? (
                <BaselAlertBox variant="error">
                    <p className="font-bold text-sm mb-1">
                        Something went wrong
                    </p>
                    <p className="text-sm text-base-content/60">{error}</p>
                </BaselAlertBox>
            ) : (
                renderStep()
            )}
        </BaselWizardModal>
    );
}
