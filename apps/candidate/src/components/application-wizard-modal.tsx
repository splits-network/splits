"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { createAuthenticatedClient } from "@/lib/api-client";
import StepDocuments from "@/components/application-wizard/step-documents";
import StepCoverLetter from "@/components/application-wizard/step-cover-letter";
import StepQuestions from "@/components/application-wizard/step-questions";
import StepReview from "@/components/application-wizard/step-review";

interface ApplicationWizardModalProps {
    jobId: string;
    jobTitle: string;
    companyName: string;
    onClose: () => void;
    onSuccess?: (applicationId: string) => void;
    existingApplication?: any;
}

const STEP_LABELS = ["Documents", "Cover Letter", "Questions", "Review"];
const STEP_LABELS_NO_QUESTIONS = ["Documents", "Cover Letter", "Review"];

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
    const backdropRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const stepContentRef = useRef<HTMLDivElement>(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [localDocuments, setLocalDocuments] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        documents: {
            selected:
                existingApplication?.documents?.map((d: any) => d.id) ||
                ([] as string[]),
        },
        cover_letter: existingApplication?.cover_letter || "",
        pre_screen_answers:
            existingApplication?.pre_screen_answers ||
            ([] as Array<{
                question_id: string;
                answer: string | string[] | boolean;
            }>),
        notes:
            existingApplication?.notes ||
            existingApplication?.candidate_notes ||
            "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasQuestions = questions.length > 0;
    const totalSteps = hasQuestions ? 4 : 3;
    const stepLabels = hasQuestions ? STEP_LABELS : STEP_LABELS_NO_QUESTIONS;

    const currentStepLabel = stepLabels[currentStep - 1] || "";

    /* ─── GSAP Animations ─────────────────────────────────────────────── */

    useEffect(() => {
        if (!backdropRef.current || !boxRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(
            backdropRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 },
        );
        tl.fromTo(
            boxRef.current,
            { opacity: 0, y: 40, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4 },
            "-=0.15",
        );
    }, []);

    useEffect(() => {
        if (!stepContentRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;

        gsap.fromTo(
            stepContentRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
        );
    }, [currentStep, loading]);

    const animateClose = useCallback(
        (onComplete: () => void) => {
            if (
                !backdropRef.current ||
                !boxRef.current ||
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                onComplete();
                return;
            }
            const tl = gsap.timeline({
                defaults: { ease: "power2.in" },
                onComplete,
            });
            tl.to(boxRef.current, {
                opacity: 0,
                y: 30,
                scale: 0.97,
                duration: 0.25,
            });
            tl.to(
                backdropRef.current,
                { opacity: 0, duration: 0.2 },
                "-=0.1",
            );
        },
        [],
    );

    const handleClose = useCallback(() => {
        animateClose(onClose);
    }, [animateClose, onClose]);

    /* ─── Data Loading ────────────────────────────────────────────────── */

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                const token = await getToken();
                if (!token) {
                    throw new Error("Authentication required");
                }

                const authClient = createAuthenticatedClient(token);
                const [jobResponse, questionsResponse, documentsResponse] =
                    await Promise.all([
                        authClient.get<{ data: any }>(`/jobs/${jobId}`),
                        authClient.get<{ data: any[] }>(
                            `/job-pre-screen-questions?job_id=${jobId}`,
                        ),
                        authClient.get<{ data: any[] }>("/documents"),
                    ]);

                const jobData = jobResponse.data;
                const questionsData = questionsResponse.data || [];
                let documentsData = documentsResponse.data || [];

                if (existingApplication?.documents?.length > 0) {
                    const appDocIds = new Set(
                        existingApplication.documents.map(
                            (doc: any) => doc.id,
                        ),
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

    /* ─── Step Navigation ─────────────────────────────────────────────── */

    const handleNext = () => {
        setError(null);
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    };

    const handleBack = () => {
        setError(null);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    /* ─── Submission ──────────────────────────────────────────────────── */

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            let applicationId;
            const authClient = createAuthenticatedClient(token);

            if (existingApplication) {
                await authClient.patch<{ data: any }>(
                    `/applications/${existingApplication.id}`,
                    {
                        document_ids: formData.documents.selected,
                        cover_letter: formData.cover_letter,
                        stage: "ai_review",
                    },
                );
                applicationId = existingApplication.id;
            } else {
                const result = await authClient.post<{ data: any }>(
                    "/applications",
                    {
                        job_id: jobId,
                        document_ids: formData.documents.selected,
                        cover_letter: formData.cover_letter,
                        pre_screen_answers: formData.pre_screen_answers,
                        stage: "ai_review",
                    },
                );
                applicationId = result.data.id;
            }

            if (formData.notes && formData.notes.trim()) {
                try {
                    await authClient.post(
                        `/applications/${applicationId}/notes`,
                        {
                            created_by_type: "candidate",
                            note_type: "note",
                            visibility: "shared",
                            message_text: formData.notes.trim(),
                        },
                    );
                } catch (noteError) {
                    console.warn(
                        "Failed to create candidate note:",
                        noteError,
                    );
                }
            }

            onClose();
            router.push(
                `/portal/applications?applicationId=${applicationId}`,
            );
        } catch (err: any) {
            console.error("Failed to submit application:", err);
            setError(err.message || "Failed to submit application");
            setSubmitting(false);
        }
    };

    const handleSaveAsDraft = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            let applicationId;
            const authClient = createAuthenticatedClient(token);

            if (existingApplication) {
                await authClient.patch<{ data: any }>(
                    `/applications/${existingApplication.id}`,
                    {
                        document_ids: formData.documents.selected,
                        cover_letter: formData.cover_letter,
                        stage: "draft",
                    },
                );
                applicationId = existingApplication.id;
            } else {
                const result = await authClient.post<{ data: any }>(
                    "/applications",
                    {
                        job_id: jobId,
                        document_ids: formData.documents.selected,
                        cover_letter: formData.cover_letter,
                        pre_screen_answers: formData.pre_screen_answers,
                        stage: "draft",
                    },
                );
                applicationId = result.data.id;
            }

            if (formData.notes && formData.notes.trim()) {
                try {
                    await authClient.post(
                        `/applications/${applicationId}/notes`,
                        {
                            created_by_type: "candidate",
                            note_type: "note",
                            visibility: "shared",
                            message_text: formData.notes.trim(),
                        },
                    );
                } catch (noteError) {
                    console.warn(
                        "Failed to create candidate note:",
                        noteError,
                    );
                }
            }

            onClose();
            router.push(
                `/portal/applications?draft=true&application=${applicationId}`,
            );
        } catch (err: any) {
            console.error("Failed to save draft:", err);
            setError(err.message || "Failed to save draft");
            setSubmitting(false);
        }
    };

    /* ─── Step Rendering ──────────────────────────────────────────────── */

    const renderStep = () => {
        if (!job) return null;

        switch (currentStep) {
            case 1:
                return (
                    <StepDocuments
                        documents={localDocuments}
                        selected={formData.documents.selected}
                        onChange={(docs: any) =>
                            setFormData({ ...formData, documents: docs })
                        }
                        onNext={handleNext}
                        onDocumentsUpdated={setLocalDocuments}
                    />
                );
            case 2: {
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
                        onNext={handleNext}
                        onBack={handleBack}
                        uploadedCoverLetterDocs={uploadedCoverLetterDocs}
                    />
                );
            }
            case 3:
                if (hasQuestions) {
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
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    );
                } else {
                    return (
                        <StepReview
                            job={job}
                            documents={documents}
                            selectedDocuments={formData.documents.selected}
                            coverLetter={formData.cover_letter}
                            questions={questions}
                            answers={formData.pre_screen_answers}
                            additionalNotes={formData.notes}
                            onSubmit={handleSubmit}
                            onSaveAsDraft={handleSaveAsDraft}
                            onBack={handleBack}
                        />
                    );
                }
            case 4:
                return (
                    <StepReview
                        job={job}
                        documents={documents}
                        selectedDocuments={formData.documents.selected}
                        coverLetter={formData.cover_letter}
                        questions={questions}
                        answers={formData.pre_screen_answers}
                        additionalNotes={formData.notes}
                        onSubmit={handleSubmit}
                        onSaveAsDraft={handleSaveAsDraft}
                        onBack={handleBack}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="modal modal-open" role="dialog">
            {/* Backdrop */}
            <div
                ref={backdropRef}
                className="modal-backdrop bg-neutral/60"
                onClick={handleClose}
            />

            {/* Modal Box */}
            <div
                ref={boxRef}
                className="modal-box max-w-3xl bg-base-100 p-0 overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* ── Header ──────────────────────────────────── */}
                <div className="bg-neutral text-neutral-content px-8 py-6 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center flex-shrink-0">
                                <i className="fa-duotone fa-regular fa-paper-plane text-primary-content" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black">
                                    {existingApplication
                                        ? "Edit Your Application"
                                        : "Apply to This Role"}
                                </h3>
                                <p className="text-xs text-neutral-content/60 uppercase tracking-wider">
                                    {loading
                                        ? "Loading..."
                                        : `Step ${currentStep} of ${totalSteps} — ${currentStepLabel}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="btn btn-ghost btn-sm btn-square text-neutral-content/60 hover:text-neutral-content"
                            disabled={submitting}
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
                    </div>

                    {/* Progress bar */}
                    {!loading && (
                        <div className="flex gap-2 mt-5">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 flex-1 transition-colors duration-300 ${
                                        i < currentStep
                                            ? "bg-primary"
                                            : "bg-neutral-content/20"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Subheader Context ────────────────────────── */}
                <div className="bg-base-200 border-b border-base-300 px-8 py-3 flex-shrink-0">
                    <div className="flex items-center gap-3 text-sm">
                        <i className="fa-duotone fa-regular fa-briefcase text-primary" />
                        <span className="font-bold">{jobTitle}</span>
                        <span className="text-base-content/40">at</span>
                        <span className="text-base-content/60">
                            {companyName}
                        </span>
                    </div>
                </div>

                {/* ── Content ─────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <span className="loading loading-spinner loading-lg text-primary mb-4" />
                            <p className="text-sm font-semibold text-base-content/40 uppercase tracking-wider">
                                Preparing your application...
                            </p>
                        </div>
                    ) : error && !job ? (
                        <div className="py-12">
                            <div className="bg-error/5 border-l-4 border-error p-6">
                                <div className="flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation text-error mt-0.5" />
                                    <div>
                                        <p className="font-bold text-sm mb-1">
                                            Something went wrong
                                        </p>
                                        <p className="text-sm text-base-content/60">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div ref={stepContentRef}>
                            {error && (
                                <div className="bg-error/5 border-l-4 border-error p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error mt-0.5" />
                                        <span className="text-sm">
                                            {error}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {renderStep()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
