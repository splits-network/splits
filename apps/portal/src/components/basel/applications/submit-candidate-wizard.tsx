"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { BaselWizardModal, BaselAlertBox } from "@splits-network/basel-ui";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import type {
    Job,
    Candidate,
    CandidateDocument,
    StepId,
} from "./submit-candidate/types";
import { STEP_LABELS } from "./submit-candidate/types";
import StepFindRole from "./submit-candidate/step-find-role";
import StepSelectCandidate from "./submit-candidate/step-select-candidate";
import StepBuildCase from "./submit-candidate/step-build-case";
import StepReview from "./submit-candidate/step-review";

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface BaselSubmitCandidateWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    /** Pre-selected job — skips the "Find a Role" step */
    preSelectedJob?: Pick<
        Job,
        "id" | "title" | "company_id" | "fee_percentage" | "status"
    > & {
        company_name?: string;
        location?: string;
    };
    /** Pre-selected candidate — skips the "Select Candidate" step */
    preSelectedCandidate?: Pick<Candidate, "id" | "full_name" | "email"> & {
        current_title?: string;
        current_company?: string;
        location?: string;
    };
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function BaselSubmitCandidateWizard({
    isOpen,
    onClose,
    onSuccess,
    preSelectedJob,
    preSelectedCandidate,
}: BaselSubmitCandidateWizardProps) {
    const { getToken } = useAuth();
    const toast = useToast();

    // Wizard state
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Animation refs
    const containerRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const stepContentRef = useRef<HTMLDivElement>(null);

    // Job selection state
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobSearchQuery, setJobSearchQuery] = useState("");
    const [debouncedJobSearch, setDebouncedJobSearch] = useState("");
    const [jobPage, setJobPage] = useState(1);
    const [jobTotalPages, setJobTotalPages] = useState(1);
    const [jobTotalCount, setJobTotalCount] = useState(0);
    const [jobStatusFilter, setJobStatusFilter] = useState("active");

    // Candidate selection state
    const [selectedCandidate, setSelectedCandidate] =
        useState<Candidate | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [candidateSearchQuery, setCandidateSearchQuery] = useState("");
    const [debouncedCandidateSearch, setDebouncedCandidateSearch] =
        useState("");
    const [candidatePage, setCandidatePage] = useState(1);
    const [candidateTotalPages, setCandidateTotalPages] = useState(1);
    const [candidateTotalCount, setCandidateTotalCount] = useState(0);

    // Details state
    const [pitch, setPitch] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [candidateDocuments, setCandidateDocuments] = useState<
        CandidateDocument[]
    >([]);
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(
        new Set(),
    );

    const limit = 25;

    /* ── Dynamic steps based on pre-selection ───────────────────────────── */

    const activeStepIds = useMemo<StepId[]>(() => {
        const ids: StepId[] = [];
        if (!preSelectedJob) ids.push("find-role");
        if (!preSelectedCandidate) ids.push("select-candidate");
        ids.push("build-case", "review");
        return ids;
    }, [preSelectedJob, preSelectedCandidate]);

    const wizardSteps = useMemo(
        () => activeStepIds.map((id) => ({ label: STEP_LABELS[id] })),
        [activeStepIds],
    );

    const currentStepId = activeStepIds[currentStep];
    const isLastContentStep =
        currentStepId === activeStepIds[activeStepIds.length - 2];

    /* ── GSAP step transition ─────────────────────────────────────────── */

    useGSAP(() => {
        if (!isOpen || !stepContentRef.current) return;
        gsap.fromTo(
            stepContentRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out", clearProps: "transform" },
        );
    }, [currentStep, isOpen]);

    /* ── GSAP entrance ────────────────────────────────────────────────── */

    useGSAP(() => {
        if (!isOpen) return;
        const backdrop = backdropRef.current;
        const box = containerRef.current;
        if (!backdrop || !box) return;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        tl.fromTo(
            box,
            { opacity: 0, y: 40, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, clearProps: "transform" },
            "-=0.15",
        );
    }, [isOpen]);

    /* ── Initialize pre-selected values on open ────────────────────────── */

    useEffect(() => {
        if (isOpen) {
            if (preSelectedJob) setSelectedJob(preSelectedJob as Job);
            if (preSelectedCandidate)
                setSelectedCandidate(preSelectedCandidate as Candidate);
        }
    }, [isOpen, preSelectedJob, preSelectedCandidate]);

    /* ── Reset on close ───────────────────────────────────────────────── */

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            setSelectedJob(preSelectedJob ? (preSelectedJob as Job) : null);
            setSelectedCandidate(
                preSelectedCandidate
                    ? (preSelectedCandidate as Candidate)
                    : null,
            );
            setPitch("");
            setResumeFile(null);
            setSelectedDocIds(new Set());
            setError(null);
        }
    }, [isOpen, preSelectedJob, preSelectedCandidate]);

    /* ── Debounced search ─────────────────────────────────────────────── */

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedJobSearch(jobSearchQuery);
            setJobPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [jobSearchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedCandidateSearch(candidateSearchQuery);
            setCandidatePage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [candidateSearchQuery]);

    /* ── Load jobs ─────────────────────────────────────────────────────── */

    useEffect(() => {
        if (currentStepId !== "find-role") return;

        async function loadJobs() {
            try {
                setJobsLoading(true);
                setError(null);
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const params: any = {
                    page: jobPage,
                    limit,
                    search: debouncedJobSearch || undefined,
                    status: jobStatusFilter || undefined,
                    sort_by: "created_at",
                    sort_order: "desc",
                };

                const response = await client.get("/jobs", { params });

                if (response.data?.data) {
                    setJobs(response.data.data);
                    if (response.data.pagination) {
                        setJobTotalPages(
                            response.data.pagination.total_pages || 1,
                        );
                        setJobTotalCount(response.data.pagination.total || 0);
                    }
                } else if (Array.isArray(response.data)) {
                    setJobs(response.data);
                    setJobTotalPages(1);
                    setJobTotalCount(response.data.length);
                } else {
                    setJobs([]);
                    setJobTotalPages(1);
                    setJobTotalCount(0);
                }
            } catch (err: any) {
                console.error("Failed to load jobs:", err);
                setError("Failed to load roles. Please try again.");
            } finally {
                setJobsLoading(false);
            }
        }

        loadJobs();
    }, [currentStepId, jobPage, debouncedJobSearch, jobStatusFilter]);

    /* ── Load candidates ───────────────────────────────────────────────── */

    useEffect(() => {
        if (currentStepId !== "select-candidate") return;

        async function loadCandidates() {
            try {
                setCandidatesLoading(true);
                setError(null);
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const params: any = {
                    page: candidatePage,
                    limit,
                    search: debouncedCandidateSearch || undefined,
                    sort_by: "created_at",
                    sort_order: "desc",
                };

                const response = await client.get("/candidates", { params });

                if (response.data?.data) {
                    setCandidates(response.data.data);
                    if (response.data.pagination) {
                        setCandidateTotalPages(
                            response.data.pagination.total_pages || 1,
                        );
                        setCandidateTotalCount(
                            response.data.pagination.total || 0,
                        );
                    }
                } else if (Array.isArray(response.data)) {
                    setCandidates(response.data);
                    setCandidateTotalPages(1);
                    setCandidateTotalCount(response.data.length);
                } else {
                    setCandidates([]);
                    setCandidateTotalPages(1);
                    setCandidateTotalCount(0);
                }
            } catch (err: any) {
                console.error("Failed to load candidates:", err);
                setError("Failed to load candidates. Please try again.");
            } finally {
                setCandidatesLoading(false);
            }
        }

        loadCandidates();
    }, [currentStepId, candidatePage, debouncedCandidateSearch]);

    /* ── Load candidate documents ──────────────────────────────────────── */

    useEffect(() => {
        if (currentStepId !== "build-case" || !selectedCandidate) return;

        async function loadCandidateDocuments() {
            try {
                const token = await getToken();
                if (!token) return;
                if (!selectedCandidate) return;

                const client = createAuthenticatedClient(token);
                const response = await client.get(
                    `/documents?entity_type=candidate&entity_id=${selectedCandidate.id}`,
                );

                if (response.data?.data) {
                    setCandidateDocuments(response.data.data);
                } else if (Array.isArray(response.data)) {
                    setCandidateDocuments(response.data);
                } else {
                    setCandidateDocuments([]);
                }
            } catch (err: any) {
                console.error("Failed to load candidate documents:", err);
                setCandidateDocuments([]);
            }
        }

        loadCandidateDocuments();
    }, [currentStepId, selectedCandidate]);

    /* ── Navigation ───────────────────────────────────────────────────── */

    const handleNext = useCallback(() => {
        setError(null);

        if (currentStepId === "find-role" && !selectedJob) {
            setError("Please select a role to continue.");
            return;
        }
        if (currentStepId === "select-candidate" && !selectedCandidate) {
            setError("Please select a candidate to continue.");
            return;
        }
        if (currentStepId === "build-case" && !pitch.trim()) {
            setError("A pitch is required before proceeding to review.");
            return;
        }

        setCurrentStep((prev) => prev + 1);
    }, [currentStepId, selectedJob, selectedCandidate, pitch]);

    const handleBack = useCallback(() => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    }, [currentStep]);

    /* ── Submit ────────────────────────────────────────────────────────── */

    const handleSubmit = useCallback(async () => {
        if (!selectedJob || !selectedCandidate || !pitch.trim()) {
            setError("Please complete all required fields.");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            const client = createAuthenticatedClient(token);

            // Upload resume if provided
            let resumeDocumentId = null;
            if (resumeFile) {
                const formData = new FormData();
                formData.append("file", resumeFile);
                formData.append("entity_type", "candidate");
                formData.append("entity_id", selectedCandidate.id);
                formData.append("document_type", "resume");

                const uploadResponse = await client.post(
                    "/documents",
                    formData as any,
                );
                resumeDocumentId = uploadResponse.data.id;
            }

            const documentIds = resumeDocumentId
                ? [resumeDocumentId, ...Array.from(selectedDocIds)]
                : Array.from(selectedDocIds);

            const appResponse = await client.post("/applications", {
                candidate_id: selectedCandidate.id,
                job_id: selectedJob.id,
                document_ids: documentIds,
            });

            // Create the recruiter pitch as an application note
            const applicationId = appResponse.data.id;
            if (pitch.trim()) {
                await client.post(
                    `/applications/${applicationId}/notes`,
                    {
                        created_by_type: "candidate_recruiter",
                        note_type: "pitch",
                        visibility: "shared",
                        message_text: pitch.trim(),
                    },
                );
            }

            toast.success(
                `Proposal submitted. ${selectedCandidate.full_name} has been notified.`,
            );
            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error("Failed to submit candidate:", err);
            setError(
                err.message || "Failed to submit proposal. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    }, [selectedJob, selectedCandidate, pitch, resumeFile, selectedDocIds, onSuccess, onClose]);

    const canProceed = () => {
        if (currentStepId === "find-role") return !!selectedJob;
        if (currentStepId === "select-candidate") return !!selectedCandidate;
        if (currentStepId === "build-case") return !!pitch.trim();
        return true;
    };

    /* ── Animated close ───────────────────────────────────────────────── */

    const handleClose = useCallback(() => {
        if (submitting) return;
        const backdrop = backdropRef.current;
        const box = containerRef.current;

        if (backdrop && box) {
            const tl = gsap.timeline({
                defaults: { ease: "power2.in" },
                onComplete: onClose,
            });
            tl.to(box, { opacity: 0, y: 30, scale: 0.97, duration: 0.25 });
            tl.to(backdrop, { opacity: 0, duration: 0.2 }, "-=0.1");
        } else {
            onClose();
        }
    }, [submitting, onClose]);

    /* ── Render ────────────────────────────────────────────────────────── */

    return (
        <BaselWizardModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Propose a Candidate"
            icon="fa-paper-plane"
            accentColor="primary"
            steps={wizardSteps}
            currentStep={currentStep}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            submitting={submitting}
            nextDisabled={!canProceed()}
            nextLabel={isLastContentStep ? "Review Submission" : "Continue"}
            submitLabel="Propose Candidate"
            submittingLabel="Submitting Proposal..."
            maxWidth="max-w-4xl"
            containerRef={containerRef}
            backdropRef={backdropRef}
            stepContentRef={stepContentRef}
        >
            {error && (
                <BaselAlertBox variant="error" title="Error" className="mb-5">
                    {error}
                </BaselAlertBox>
            )}

            {currentStepId === "find-role" && (
                <StepFindRole
                    jobs={jobs}
                    jobsLoading={jobsLoading}
                    selectedJob={selectedJob}
                    onSelectJob={setSelectedJob}
                    jobSearchQuery={jobSearchQuery}
                    onSearchChange={setJobSearchQuery}
                    debouncedJobSearch={debouncedJobSearch}
                    jobStatusFilter={jobStatusFilter}
                    onStatusFilterChange={setJobStatusFilter}
                    jobPage={jobPage}
                    jobTotalPages={jobTotalPages}
                    jobTotalCount={jobTotalCount}
                    onPageChange={setJobPage}
                />
            )}

            {currentStepId === "select-candidate" && (
                <StepSelectCandidate
                    candidates={candidates}
                    candidatesLoading={candidatesLoading}
                    selectedCandidate={selectedCandidate}
                    onSelectCandidate={setSelectedCandidate}
                    candidateSearchQuery={candidateSearchQuery}
                    onSearchChange={setCandidateSearchQuery}
                    debouncedCandidateSearch={debouncedCandidateSearch}
                    candidatePage={candidatePage}
                    candidateTotalPages={candidateTotalPages}
                    candidateTotalCount={candidateTotalCount}
                    onPageChange={setCandidatePage}
                />
            )}

            {currentStepId === "build-case" && selectedCandidate && (
                <StepBuildCase
                    selectedJob={selectedJob}
                    selectedCandidate={selectedCandidate}
                    pitch={pitch}
                    onPitchChange={setPitch}
                    candidateDocuments={candidateDocuments}
                    selectedDocIds={selectedDocIds}
                    onSelectedDocIdsChange={setSelectedDocIds}
                    resumeFile={resumeFile}
                    onResumeFileChange={setResumeFile}
                    onFileError={setError}
                />
            )}

            {currentStepId === "review" &&
                selectedJob &&
                selectedCandidate && (
                    <StepReview
                        selectedJob={selectedJob}
                        selectedCandidate={selectedCandidate}
                        pitch={pitch}
                        candidateDocuments={candidateDocuments}
                        selectedDocIds={selectedDocIds}
                        resumeFile={resumeFile}
                    />
                )}
        </BaselWizardModal>
    );
}
