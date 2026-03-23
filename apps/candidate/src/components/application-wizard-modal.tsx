"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import { BaselWizardModal, BaselAlertBox } from "@splits-network/basel-ui";
import StepDocuments from "@/components/application-wizard/step-documents";
import StepCoverLetter from "@/components/application-wizard/step-cover-letter";
import StepQuestions from "@/components/application-wizard/step-questions";
import StepNotes from "@/components/application-wizard/step-notes";
import StepRecruiter from "@/components/application-wizard/step-recruiter";
import StepReview from "@/components/application-wizard/step-review";

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

function buildWizardSteps(hasQuestions: boolean, hasRecruiterChoice: boolean): WizardStep[] {
    const steps: WizardStep[] = [
        { label: "Documents", description: "Select your resume and any supporting documents." },
        { label: "Cover Letter", description: "Add an optional cover letter to strengthen your application." },
    ];
    if (hasQuestions) {
        steps.push({ label: "Questions", description: "Answer screening questions from the hiring team." });
    }
    steps.push({ label: "Notes", description: "Share any additional context with the employer." });
    if (hasRecruiterChoice) {
        steps.push({ label: "Recruiter", description: "Choose which recruiter should represent you." });
    }
    steps.push({ label: "Review", description: "Review everything before submitting." });
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
            existingApplication?.candidate_recruiter_id || (null as string | null),
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCoverLetterSkipWarning, setShowCoverLetterSkipWarning] = useState(false);

    const hasQuestions = questions.length > 0;
    const hasRecruiterChoice = activeRecruiters.length > 1;
    const wizardSteps = buildWizardSteps(hasQuestions, hasRecruiterChoice);
    const currentStepLabel = wizardSteps[currentStep]?.label || "";
    const isReviewStep = currentStepLabel === "Review";

    /* ─── Data Loading ────────────────────────────────────────────────── */

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                const token = await getToken();
                if (!token) throw new Error("Authentication required");

                const authClient = createAuthenticatedClient(token);
                const [jobResponse, documentsResponse, recruitersResponse] = await Promise.all([
                    authClient.get<{ data: any }>(`/jobs/${jobId}/view/candidate-detail`),
                    authClient.get<{ data: any[] }>("/documents"),
                    authClient.get<{ data: any[] }>("/recruiter-candidates"),
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
                            .map((doc: any) => doc.metadata?.original_document_id)
                            .filter(Boolean),
                    );
                    documentsData = documentsData.filter(
                        (doc: any) => !appDocIds.has(doc.id) && !appOriginalDocIds.has(doc.id),
                    );
                    documentsData = [...documentsData, ...existingApplication.documents];
                }

                const allRecruiters = recruitersResponse.data || [];
                const active = allRecruiters.filter(
                    (r: any) => r.status === "active" && r.consent_given === true,
                );
                setActiveRecruiters(active);

                if (active.length === 1 && !existingApplication?.candidate_recruiter_id) {
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

    /* ─── Step Validation & Navigation ─────────────────────────────────── */

    const validateDocuments = useCallback((): string | null => {
        const currentDocs = localDocuments.length > 0 ? localDocuments : documents;
        const selected = formData.documents.selected;

        if (selected.length === 0) return "Select at least one document to continue.";

        const selectedResumes = selected.filter((id: string) => {
            const doc = currentDocs.find((d: any) => d.id === id);
            return doc && doc.document_type === "resume";
        });

        if (selectedResumes.length === 0) return "A resume is required. Please select one to continue.";
        if (selectedResumes.length > 1) return "Only one resume can be attached per application.";
        return null;
    }, [localDocuments, documents, formData.documents.selected]);

    const validateQuestions = useCallback((): string | null => {
        const missingRequired = questions
            .filter((q: any) => q.is_required)
            .filter((_: any, idx: number) => {
                const ans = formData.pre_screen_answers.find((a: any) => a.index === idx);
                const answer = ans?.answer;
                if (answer === undefined || answer === null || answer === "") return true;
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

        if (currentStepLabel === "Documents") {
            const validationError = validateDocuments();
            if (validationError) { setError(validationError); return; }
        }

        if (currentStepLabel === "Cover Letter") {
            const uploadedCoverLetterDocs = localDocuments.filter(
                (doc: any) => doc.document_type === "cover_letter" && formData.documents.selected.includes(doc.id),
            );
            if (!formData.cover_letter?.trim() && uploadedCoverLetterDocs.length === 0) {
                setShowCoverLetterSkipWarning(true);
                return;
            }
        }

        if (currentStepLabel === "Questions") {
            const validationError = validateQuestions();
            if (validationError) { setError(validationError); return; }
        }

        setCurrentStep((prev) => Math.min(prev + 1, wizardSteps.length - 1));
    }, [currentStepLabel, validateDocuments, validateQuestions, wizardSteps.length, localDocuments, formData]);

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
        if (submitting) return;
        onClose();
    }, [submitting, onClose]);

    /* ─── Submission ──────────────────────────────────────────────────── */

    const buildPreScreenAnswers = useCallback(() => {
        return questions.map((q: any, i: number) => {
            const ans = formData.pre_screen_answers.find((a: any) => a.index === i);
            return {
                question: q.question,
                question_type: q.question_type,
                is_required: q.is_required,
                ...(q.options ? { options: q.options } : {}),
                ...(q.disclaimer ? { disclaimer: q.disclaimer } : {}),
                answer: ans?.answer ?? null,
            };
        });
    }, [questions, formData.pre_screen_answers]);

    const saveNotes = useCallback(async (authClient: any, applicationId: string) => {
        if (formData.notes && formData.notes.trim()) {
            try {
                await authClient.post(`/applications/${applicationId}/notes`, {
                    created_by_type: "candidate",
                    note_type: "note",
                    visibility: "shared",
                    message_text: formData.notes.trim(),
                });
            } catch (noteError) {
                console.warn("Failed to create candidate note:", noteError);
            }
        }
    }, [formData.notes]);

    const saveApplication = useCallback(async (authClient: any, preScreenAnswers: any[]) => {
        if (existingApplication) {
            await authClient.patch(`/applications/${existingApplication.id}`, {
                document_ids: formData.documents.selected,
                cover_letter: formData.cover_letter,
                pre_screen_answers: preScreenAnswers,
            });
            return existingApplication.id;
        }

        const payload: Record<string, any> = {
            job_id: jobId,
            document_ids: formData.documents.selected,
            cover_letter: formData.cover_letter,
            pre_screen_answers: preScreenAnswers,
        };
        if (formData.candidate_recruiter_id) {
            payload.candidate_recruiter_id = formData.candidate_recruiter_id;
            payload.application_source = "recruiter";
        }
        const result = await authClient.post("/applications", payload);
        return result.data.id;
    }, [existingApplication, jobId, formData]);

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            const authClient = createAuthenticatedClient(token);
            const preScreenAnswers = buildPreScreenAnswers();
            const applicationId = await saveApplication(authClient, preScreenAnswers);

            // Transition to ai_review — triggers application.stage_changed event
            await authClient.patch(`/applications/${applicationId}`, { stage: "ai_review" });
            await saveNotes(authClient, applicationId);

            onClose();
            router.push(`/portal/applications?applicationId=${applicationId}`);
        } catch (err: any) {
            console.error("Failed to submit application:", err);
            setError(err.message || "Failed to submit application");
            setSubmitting(false);
        }
    }, [buildPreScreenAnswers, saveApplication, saveNotes, onClose, router]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSaveAsDraft = useCallback(async () => {
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            const authClient = createAuthenticatedClient(token);
            const preScreenAnswers = buildPreScreenAnswers();
            const applicationId = await saveApplication(authClient, preScreenAnswers);
            await saveNotes(authClient, applicationId);

            onClose();
            router.push(`/portal/applications?draft=true&application=${applicationId}`);
        } catch (err: any) {
            console.error("Failed to save draft:", err);
            setError(err.message || "Failed to save draft");
            setSubmitting(false);
        }
    }, [buildPreScreenAnswers, saveApplication, saveNotes, onClose, router]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ─── Derived: next disabled ──────────────────────────────────────── */

    const nextDisabled = loading || (currentStepLabel === "Recruiter" && !formData.candidate_recruiter_id);

    /* ─── Step Rendering ──────────────────────────────────────────────── */

    const renderStep = () => {
        if (!job) return null;

        switch (currentStepLabel) {
            case "Documents":
                return (
                    <StepDocuments
                        documents={localDocuments}
                        selected={formData.documents.selected}
                        onChange={(docs: any) => setFormData({ ...formData, documents: docs })}
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
                            setFormData({ ...formData, cover_letter: coverLetter })
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
                            setFormData({ ...formData, pre_screen_answers: answers })
                        }
                        error={error}
                    />
                );
            case "Notes":
                return (
                    <StepNotes
                        notes={formData.notes}
                        onChange={(notes: string) => setFormData({ ...formData, notes })}
                    />
                );
            case "Recruiter":
                return (
                    <StepRecruiter
                        recruiters={activeRecruiters}
                        selectedRecruiterId={formData.candidate_recruiter_id}
                        onChange={(id: string) =>
                            setFormData({ ...formData, candidate_recruiter_id: id })
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
                                (r: any) => r.recruiter_id === formData.candidate_recruiter_id,
                            ) || null
                        }
                        error={error}
                    />
                );
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
                    disabled={submitting}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    Back
                </button>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={handleSaveAsDraft}
                    className="btn btn-ghost"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-floppy-disk" />
                            Save Draft
                        </>
                    )}
                </button>
                <button
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />
                            Getting Your AI Review...
                        </>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-paper-plane" />
                            Get Your AI Review
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
            title={existingApplication ? "Edit Your Application" : "Apply to This Role"}
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
            footer={reviewFooter}
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
                    <p className="font-bold text-sm mb-1">Something went wrong</p>
                    <p className="text-sm text-base-content/60">{error}</p>
                </BaselAlertBox>
            ) : (
                renderStep()
            )}
        </BaselWizardModal>
    );
}
