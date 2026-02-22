"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { BaselWizardModal } from "@splits-network/basel-ui";
import { MarkdownEditor, MarkdownRenderer } from "@splits-network/shared-ui";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Job {
    id: string;
    title: string;
    company_id: string;
    company_name?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    fee_percentage: number;
    status: string;
    description?: string;
    requirements?: string[];
}

interface Candidate {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    current_title?: string;
    current_company?: string;
    linkedin_url?: string;
}

interface Document {
    id: string;
    filename: string;
    file_type: string;
}

interface BaselSubmitCandidateWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const WIZARD_STEPS = [
    { label: "Find a Role" },
    { label: "Select Candidate" },
    { label: "Build Your Case" },
    { label: "Review & Submit" },
];

const STATUS_BADGE_MAP: Record<string, string> = {
    active: "badge-success",
    paused: "badge-warning",
    closed: "badge-neutral",
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function BaselSubmitCandidateWizard({
    isOpen,
    onClose,
    onSuccess,
}: BaselSubmitCandidateWizardProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Wizard state
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Animation refs
    const containerRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const stepContentRef = useRef<HTMLDivElement>(null);

    // Step 1: Job Selection
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobSearchQuery, setJobSearchQuery] = useState("");
    const [debouncedJobSearch, setDebouncedJobSearch] = useState("");
    const [jobPage, setJobPage] = useState(1);
    const [jobTotalPages, setJobTotalPages] = useState(1);
    const [jobTotalCount, setJobTotalCount] = useState(0);
    const [jobStatusFilter, setJobStatusFilter] = useState("active");

    // Step 2: Candidate Selection/Creation
    const [candidateMode, setCandidateMode] = useState<"select" | "new">(
        "select",
    );
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

    // New candidate form
    const [candidateFormData, setCandidateFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        location: "",
        current_title: "",
        current_company: "",
        linkedin_url: "",
    });

    // Step 3: Details
    const [pitch, setPitch] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [candidateDocuments, setCandidateDocuments] = useState<Document[]>(
        [],
    );
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(
        new Set(),
    );

    const limit = 25;

    /* ── GSAP step transition ─────────────────────────────────────────── */

    useGSAP(() => {
        if (!isOpen || !stepContentRef.current) return;
        gsap.fromTo(
            stepContentRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
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
            { opacity: 1, y: 0, scale: 1, duration: 0.4 },
            "-=0.15",
        );
    }, [isOpen]);

    /* ── Reset on close ───────────────────────────────────────────────── */

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            setSelectedJob(null);
            setSelectedCandidate(null);
            setCandidateMode("select");
            setPitch("");
            setResumeFile(null);
            setSelectedDocIds(new Set());
            setError(null);
            setCandidateFormData({
                full_name: "",
                email: "",
                phone: "",
                location: "",
                current_title: "",
                current_company: "",
                linkedin_url: "",
            });
        }
    }, [isOpen]);

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

    /* ── Load jobs (step 1) ───────────────────────────────────────────── */

    useEffect(() => {
        if (currentStep !== 0) return;

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
    }, [currentStep, jobPage, debouncedJobSearch, jobStatusFilter]);

    /* ── Load candidates (step 2) ─────────────────────────────────────── */

    useEffect(() => {
        if (currentStep !== 1 || candidateMode !== "select") return;

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

                if (
                    (response.data?.data || response.data)?.length === 0 &&
                    !debouncedCandidateSearch
                ) {
                    setCandidateMode("new");
                }
            } catch (err: any) {
                console.error("Failed to load candidates:", err);
                setError("Failed to load candidates. Please try again.");
            } finally {
                setCandidatesLoading(false);
            }
        }

        loadCandidates();
    }, [currentStep, candidateMode, candidatePage, debouncedCandidateSearch]);

    /* ── Load candidate documents (step 3) ────────────────────────────── */

    useEffect(() => {
        if (currentStep !== 2 || !selectedCandidate || candidateMode === "new")
            return;

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
    }, [currentStep, selectedCandidate, candidateMode]);

    /* ── File handling ─────────────────────────────────────────────────── */

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain",
            ];
            if (!allowedTypes.includes(file.type)) {
                setError("Please upload a PDF, DOC, DOCX, or TXT file");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError("File size must be less than 10MB");
                return;
            }
            setResumeFile(file);
            setError(null);
        }
    };

    /* ── Navigation ───────────────────────────────────────────────────── */

    const handleNext = useCallback(() => {
        setError(null);

        if (currentStep === 0) {
            if (!selectedJob) {
                setError("Please select a role to continue.");
                return;
            }
            setCurrentStep(1);
        } else if (currentStep === 1) {
            if (candidateMode === "select" && !selectedCandidate) {
                setError("Please select a candidate to continue.");
                return;
            } else if (candidateMode === "new") {
                if (
                    !candidateFormData.full_name.trim() ||
                    !candidateFormData.email.trim()
                ) {
                    setError(
                        "Name and email are required to create a new candidate.",
                    );
                    return;
                }
                setSelectedCandidate({
                    id: "",
                    full_name: candidateFormData.full_name,
                    email: candidateFormData.email,
                    phone: candidateFormData.phone,
                    location: candidateFormData.location,
                    current_title: candidateFormData.current_title,
                    current_company: candidateFormData.current_company,
                    linkedin_url: candidateFormData.linkedin_url,
                });
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!pitch.trim()) {
                setError("A pitch is required before proceeding to review.");
                return;
            }
            setCurrentStep(3);
        }
    }, [
        currentStep,
        selectedJob,
        candidateMode,
        selectedCandidate,
        candidateFormData,
        pitch,
    ]);

    const handleBack = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
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
            let finalCandidateId = selectedCandidate.id;

            // Create new candidate if in 'new' mode
            if (candidateMode === "new" && !selectedCandidate.id) {
                const candidateResponse = await client.post(
                    "/candidates",
                    candidateFormData,
                );
                finalCandidateId = candidateResponse.data.data.id;
            }

            // Upload resume if provided
            let resumeDocumentId = null;
            if (resumeFile) {
                const formData = new FormData();
                formData.append("file", resumeFile);
                formData.append("entity_type", "candidate");
                formData.append("entity_id", finalCandidateId);
                formData.append("document_type", "resume");

                const uploadResponse = await client.post(
                    "/documents",
                    formData as any,
                );
                resumeDocumentId = uploadResponse.data.data.id;
            }

            // Create application
            const documentIds = resumeDocumentId
                ? [resumeDocumentId, ...Array.from(selectedDocIds)]
                : Array.from(selectedDocIds);

            await client.post("/applications", {
                candidate_id: finalCandidateId,
                job_id: selectedJob.id,
                notes: pitch,
                document_ids: documentIds,
            });

            toast.success(
                `Proposal submitted. ${selectedCandidate.full_name} has been notified.`,
            );
            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error("Failed to submit candidate:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to submit proposal. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    }, [
        selectedJob,
        selectedCandidate,
        pitch,
        candidateMode,
        candidateFormData,
        resumeFile,
        selectedDocIds,
        onSuccess,
        onClose,
    ]);

    const canProceed = () => {
        if (currentStep === 0) return !!selectedJob;
        if (currentStep === 1) {
            return candidateMode === "select"
                ? !!selectedCandidate
                : !!(
                      candidateFormData.full_name.trim() &&
                      candidateFormData.email.trim()
                  );
        }
        if (currentStep === 2) return !!pitch.trim();
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
            tl.to(box, {
                opacity: 0,
                y: 30,
                scale: 0.97,
                duration: 0.25,
            });
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
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            submitting={submitting}
            nextDisabled={!canProceed()}
            nextLabel={currentStep === 2 ? "Review Submission" : "Continue"}
            submitLabel="Propose Candidate"
            submittingLabel="Submitting Proposal..."
            maxWidth="max-w-4xl"
            containerRef={containerRef}
            backdropRef={backdropRef}
            stepContentRef={stepContentRef}
        >
            {/* Error */}
            {error && (
                <div className="bg-error/10 border-l-4 border-error p-4 mb-5">
                    <div className="flex gap-3 items-start">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg mt-0.5" />
                        <span className="text-sm font-semibold text-base-content">
                            {error}
                        </span>
                    </div>
                </div>
            )}

            {/* ═══ Step 1: Find a Role ═══ */}
            {currentStep === 0 && (
                <div className="space-y-5">
                    {/* Search + Filter */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <fieldset>
                            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                Search Open Roles
                            </label>
                            <input
                                type="text"
                                placeholder="Search by title, company, location..."
                                className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                style={{ borderRadius: 0 }}
                                value={jobSearchQuery}
                                onChange={(e) =>
                                    setJobSearchQuery(e.target.value)
                                }
                            />
                            <p className="text-sm text-base-content/40 mt-2">
                                {jobsLoading && debouncedJobSearch ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs mr-1" />
                                        Searching...
                                    </>
                                ) : (
                                    "Results update as you type."
                                )}
                            </p>
                        </fieldset>

                        <fieldset>
                            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                Role Status
                            </label>
                            <select
                                className="select w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                style={{ borderRadius: 0 }}
                                value={jobStatusFilter}
                                onChange={(e) =>
                                    setJobStatusFilter(e.target.value)
                                }
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="closed">Closed</option>
                            </select>
                        </fieldset>
                    </div>

                    {/* Jobs Table */}
                    {jobsLoading ? (
                        <div className="flex justify-center py-12">
                            <span className="loading loading-spinner loading-lg" />
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="bg-base-200 border-l-4 border-base-300 p-5">
                            <p className="text-sm font-semibold text-base-content/60">
                                No roles match your search.
                            </p>
                            <p className="text-sm text-base-content/40 mt-1">
                                Adjust your filters or search by a different job
                                title or keyword.
                            </p>
                        </div>
                    ) : (
                        <>
                            {debouncedJobSearch && (
                                <p className="text-sm text-base-content/60">
                                    Found {jobTotalCount} role
                                    {jobTotalCount !== 1 ? "s" : ""} matching
                                    &ldquo;{debouncedJobSearch}&rdquo;
                                </p>
                            )}
                            <div
                                className="overflow-x-auto border border-base-300"
                                style={{ borderRadius: 0 }}
                            >
                                <table className="table">
                                    <thead className="bg-base-200">
                                        <tr>
                                            <th className="w-12"></th>
                                            <th>Role</th>
                                            <th>Company</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                            <th>Fee</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobs.map((job) => (
                                            <tr
                                                key={job.id}
                                                className={`cursor-pointer hover:bg-base-200 transition-colors ${
                                                    selectedJob?.id === job.id
                                                        ? "bg-primary/10 border-l-4 border-l-primary"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setSelectedJob(job)
                                                }
                                            >
                                                <td>
                                                    <input
                                                        type="radio"
                                                        className="radio radio-primary"
                                                        checked={
                                                            selectedJob?.id ===
                                                            job.id
                                                        }
                                                        onChange={() =>
                                                            setSelectedJob(job)
                                                        }
                                                    />
                                                </td>
                                                <td className="font-semibold">
                                                    {job.title}
                                                </td>
                                                <td>{job.company_name}</td>
                                                <td>
                                                    {job.location || (
                                                        <span className="text-base-content/40">
                                                            Not specified
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${STATUS_BADGE_MAP[job.status] || "badge-neutral"}`}
                                                        style={{
                                                            borderRadius: 0,
                                                        }}
                                                    >
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td>{job.fee_percentage}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {jobTotalPages > 1 && (
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-base-content/60">
                                        Page {jobPage} of {jobTotalPages} (
                                        {jobTotalCount} total)
                                    </p>
                                    <div className="join">
                                        <button
                                            className="join-item btn btn-sm"
                                            style={{ borderRadius: 0 }}
                                            onClick={() =>
                                                setJobPage(
                                                    Math.max(1, jobPage - 1),
                                                )
                                            }
                                            disabled={jobPage === 1}
                                        >
                                            <i className="fa-duotone fa-regular fa-chevron-left" />
                                        </button>
                                        <button
                                            className="join-item btn btn-sm"
                                            style={{ borderRadius: 0 }}
                                        >
                                            Page {jobPage}
                                        </button>
                                        <button
                                            className="join-item btn btn-sm"
                                            style={{ borderRadius: 0 }}
                                            onClick={() =>
                                                setJobPage(
                                                    Math.min(
                                                        jobTotalPages,
                                                        jobPage + 1,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                jobPage === jobTotalPages
                                            }
                                        >
                                            <i className="fa-duotone fa-regular fa-chevron-right" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ═══ Step 2: Select Candidate ═══ */}
            {currentStep === 1 && (
                <div className="space-y-5">
                    {/* Mode tabs */}
                    <div className="flex border-b border-base-300">
                        <button
                            className={`px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] border-b-2 transition-colors ${
                                candidateMode === "select"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-base-content/50 hover:text-base-content"
                            }`}
                            onClick={() => setCandidateMode("select")}
                        >
                            <i className="fa-duotone fa-regular fa-user-check mr-2" />
                            Existing Candidate
                        </button>
                        <button
                            className={`px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] border-b-2 transition-colors ${
                                candidateMode === "new"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-base-content/50 hover:text-base-content"
                            }`}
                            onClick={() => setCandidateMode("new")}
                        >
                            <i className="fa-duotone fa-regular fa-user-plus mr-2" />
                            New Candidate
                        </button>
                    </div>

                    {candidateMode === "select" ? (
                        <>
                            {/* Candidate search */}
                            <fieldset>
                                <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                    Search Candidates
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search by name, email, title, company..."
                                    className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                    style={{ borderRadius: 0 }}
                                    value={candidateSearchQuery}
                                    onChange={(e) =>
                                        setCandidateSearchQuery(e.target.value)
                                    }
                                />
                                <p className="text-sm text-base-content/40 mt-2">
                                    {candidatesLoading &&
                                    debouncedCandidateSearch ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs mr-1" />
                                            Searching...
                                        </>
                                    ) : (
                                        "Results update as you type."
                                    )}
                                </p>
                            </fieldset>

                            {/* Candidates table */}
                            {candidatesLoading ? (
                                <div className="flex justify-center py-12">
                                    <span className="loading loading-spinner loading-lg" />
                                </div>
                            ) : candidates.length === 0 ? (
                                <div className="bg-base-200 border-l-4 border-base-300 p-5">
                                    <p className="text-sm font-semibold text-base-content/60">
                                        {debouncedCandidateSearch
                                            ? `No candidates matching "${debouncedCandidateSearch}".`
                                            : "No candidates found."}
                                    </p>
                                    <p className="text-sm text-base-content/40 mt-1">
                                        Try a different search term or add a new
                                        candidate.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {debouncedCandidateSearch && (
                                        <p className="text-sm text-base-content/60">
                                            Found {candidateTotalCount}{" "}
                                            candidate
                                            {candidateTotalCount !== 1
                                                ? "s"
                                                : ""}{" "}
                                            matching &ldquo;
                                            {debouncedCandidateSearch}&rdquo;
                                        </p>
                                    )}
                                    <div
                                        className="overflow-x-auto border border-base-300"
                                        style={{ borderRadius: 0 }}
                                    >
                                        <table className="table">
                                            <thead className="bg-base-200">
                                                <tr>
                                                    <th className="w-12"></th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Current Role</th>
                                                    <th>Location</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {candidates.map((candidate) => (
                                                    <tr
                                                        key={candidate.id}
                                                        className={`cursor-pointer hover:bg-base-200 transition-colors ${
                                                            selectedCandidate?.id ===
                                                            candidate.id
                                                                ? "bg-primary/10 border-l-4 border-l-primary"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            setSelectedCandidate(
                                                                candidate,
                                                            )
                                                        }
                                                    >
                                                        <td>
                                                            <input
                                                                type="radio"
                                                                className="radio radio-primary"
                                                                checked={
                                                                    selectedCandidate?.id ===
                                                                    candidate.id
                                                                }
                                                                onChange={() =>
                                                                    setSelectedCandidate(
                                                                        candidate,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="font-semibold">
                                                            {
                                                                candidate.full_name
                                                            }
                                                        </td>
                                                        <td>
                                                            {candidate.email}
                                                        </td>
                                                        <td>
                                                            {candidate.current_title ||
                                                            candidate.current_company ? (
                                                                <span className="text-sm">
                                                                    {
                                                                        candidate.current_title
                                                                    }
                                                                    {candidate.current_title &&
                                                                        candidate.current_company &&
                                                                        " \u2022 "}
                                                                    {
                                                                        candidate.current_company
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-base-content/40">
                                                                    Not
                                                                    specified
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {candidate.location || (
                                                                <span className="text-base-content/40">
                                                                    Not
                                                                    specified
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {candidateTotalPages > 1 && (
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-base-content/60">
                                                Page {candidatePage} of{" "}
                                                {candidateTotalPages} (
                                                {candidateTotalCount} total)
                                            </p>
                                            <div className="join">
                                                <button
                                                    className="join-item btn btn-sm"
                                                    style={{ borderRadius: 0 }}
                                                    onClick={() =>
                                                        setCandidatePage(
                                                            Math.max(
                                                                1,
                                                                candidatePage -
                                                                    1,
                                                            ),
                                                        )
                                                    }
                                                    disabled={
                                                        candidatePage === 1
                                                    }
                                                >
                                                    <i className="fa-duotone fa-regular fa-chevron-left" />
                                                </button>
                                                <button
                                                    className="join-item btn btn-sm"
                                                    style={{ borderRadius: 0 }}
                                                >
                                                    Page {candidatePage}
                                                </button>
                                                <button
                                                    className="join-item btn btn-sm"
                                                    style={{ borderRadius: 0 }}
                                                    onClick={() =>
                                                        setCandidatePage(
                                                            Math.min(
                                                                candidateTotalPages,
                                                                candidatePage +
                                                                    1,
                                                            ),
                                                        )
                                                    }
                                                    disabled={
                                                        candidatePage ===
                                                        candidateTotalPages
                                                    }
                                                >
                                                    <i className="fa-duotone fa-regular fa-chevron-right" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        /* New candidate form */
                        <div className="space-y-5">
                            <div className="bg-info/10 border-l-4 border-info p-4">
                                <div className="flex gap-3 items-start">
                                    <i className="fa-duotone fa-regular fa-circle-info text-info text-lg mt-0.5" />
                                    <p className="text-sm text-base-content/70 leading-relaxed">
                                        This candidate will be added to your
                                        roster and proposed for this role.
                                        Ensure their information is accurate
                                        before proceeding.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <fieldset>
                                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                        Full Name{" "}
                                        <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                        style={{ borderRadius: 0 }}
                                        value={candidateFormData.full_name}
                                        onChange={(e) =>
                                            setCandidateFormData({
                                                ...candidateFormData,
                                                full_name: e.target.value,
                                            })
                                        }
                                        placeholder="John Doe"
                                    />
                                </fieldset>

                                <fieldset>
                                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                        Email{" "}
                                        <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                        style={{ borderRadius: 0 }}
                                        value={candidateFormData.email}
                                        onChange={(e) =>
                                            setCandidateFormData({
                                                ...candidateFormData,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder="john@example.com"
                                    />
                                </fieldset>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <fieldset>
                                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                        style={{ borderRadius: 0 }}
                                        value={candidateFormData.phone}
                                        onChange={(e) =>
                                            setCandidateFormData({
                                                ...candidateFormData,
                                                phone: e.target.value,
                                            })
                                        }
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </fieldset>

                                <fieldset>
                                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                        style={{ borderRadius: 0 }}
                                        value={candidateFormData.location}
                                        onChange={(e) =>
                                            setCandidateFormData({
                                                ...candidateFormData,
                                                location: e.target.value,
                                            })
                                        }
                                        placeholder="City, State/Country"
                                    />
                                </fieldset>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <fieldset>
                                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                        Current Title
                                    </label>
                                    <input
                                        type="text"
                                        className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                        style={{ borderRadius: 0 }}
                                        value={candidateFormData.current_title}
                                        onChange={(e) =>
                                            setCandidateFormData({
                                                ...candidateFormData,
                                                current_title: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., Senior Software Engineer"
                                    />
                                </fieldset>

                                <fieldset>
                                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                        Current Company
                                    </label>
                                    <input
                                        type="text"
                                        className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                        style={{ borderRadius: 0 }}
                                        value={
                                            candidateFormData.current_company
                                        }
                                        onChange={(e) =>
                                            setCandidateFormData({
                                                ...candidateFormData,
                                                current_company: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., Acme Corp"
                                    />
                                </fieldset>
                            </div>

                            <fieldset>
                                <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                    LinkedIn URL
                                </label>
                                <input
                                    type="url"
                                    className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                    style={{ borderRadius: 0 }}
                                    value={candidateFormData.linkedin_url}
                                    onChange={(e) =>
                                        setCandidateFormData({
                                            ...candidateFormData,
                                            linkedin_url: e.target.value,
                                        })
                                    }
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </fieldset>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Step 3: Build Your Case ═══ */}
            {currentStep === 2 && selectedCandidate && (
                <div className="space-y-6">
                    {/* Context cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-base-200 border-l-4 border-primary p-4">
                            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-2">
                                <i className="fa-duotone fa-regular fa-briefcase mr-2" />
                                Role
                            </p>
                            <p className="font-bold text-lg">
                                {selectedJob?.title}
                            </p>
                            {selectedJob?.company_name && (
                                <p className="text-sm text-base-content/60">
                                    {selectedJob.company_name}
                                </p>
                            )}
                        </div>

                        <div className="bg-base-200 border-l-4 border-secondary p-4">
                            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-2">
                                <i className="fa-duotone fa-regular fa-user mr-2" />
                                Candidate
                            </p>
                            <p className="font-bold text-lg">
                                {selectedCandidate.full_name}
                            </p>
                            <p className="text-sm text-base-content/60">
                                {selectedCandidate.email}
                            </p>
                        </div>
                    </div>

                    {/* Pitch */}
                    <div>
                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                            Your Pitch{" "}
                            <span className="text-error">*</span>
                        </label>
                        <MarkdownEditor
                            value={pitch}
                            onChange={setPitch}
                            placeholder="Explain why this candidate is positioned for this specific role. Speak to their background, their fit, and what sets them apart."
                            height={220}
                            maxLength={500}
                            showCount
                        />
                    </div>

                    {/* Documents from profile */}
                    {candidateMode === "select" &&
                        candidateDocuments.length > 0 && (
                            <fieldset>
                                <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3 block">
                                    Supporting Documents
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {candidateDocuments.map((doc) => (
                                        <label
                                            key={doc.id}
                                            className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                                                selectedDocIds.has(doc.id)
                                                    ? "border-primary bg-primary/5"
                                                    : "border-base-300 hover:border-base-content/20"
                                            }`}
                                            style={{ borderRadius: 0 }}
                                        >
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary checkbox-sm"
                                                checked={selectedDocIds.has(
                                                    doc.id,
                                                )}
                                                onChange={(e) => {
                                                    const newSelected = new Set(
                                                        selectedDocIds,
                                                    );
                                                    if (e.target.checked) {
                                                        newSelected.add(doc.id);
                                                    } else {
                                                        newSelected.delete(
                                                            doc.id,
                                                        );
                                                    }
                                                    setSelectedDocIds(
                                                        newSelected,
                                                    );
                                                }}
                                            />
                                            <i className="fa-duotone fa-regular fa-file text-base-content/40" />
                                            <span className="text-sm font-medium">
                                                {doc.filename}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        )}

                    {/* Resume upload */}
                    <fieldset>
                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                            {candidateMode === "new"
                                ? "Attach Resume"
                                : "Attach Additional Resume"}
                        </label>
                        <p className="text-sm text-base-content/40 mb-3">
                            Optional — attach a current version or one tailored
                            to this role.
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="file-input w-full"
                            style={{ borderRadius: 0 }}
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileChange}
                        />
                        {resumeFile && (
                            <div className="mt-3 flex items-center gap-3 bg-base-200 p-3">
                                <i className="fa-duotone fa-regular fa-file text-primary" />
                                <span className="text-sm font-medium flex-1">
                                    {resumeFile.name}
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    style={{ borderRadius: 0 }}
                                    onClick={() => {
                                        setResumeFile(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = "";
                                        }
                                    }}
                                >
                                    <i className="fa-duotone fa-regular fa-xmark" />
                                </button>
                            </div>
                        )}
                    </fieldset>
                </div>
            )}

            {/* ═══ Step 4: Review & Submit ═══ */}
            {currentStep === 3 && selectedJob && selectedCandidate && (
                <div className="space-y-6">
                    {/* Review banner */}
                    <div className="bg-info/10 border-l-4 border-info p-4">
                        <div className="flex gap-3 items-start">
                            <i className="fa-duotone fa-regular fa-circle-info text-info text-lg mt-0.5" />
                            <p className="text-sm text-base-content/70 leading-relaxed">
                                Review the submission below before it goes out.
                                Once confirmed, {selectedCandidate.full_name}{" "}
                                will receive an email notification and must
                                approve this opportunity before it proceeds to
                                the hiring company.
                            </p>
                        </div>
                    </div>

                    {/* Role */}
                    <div className="bg-base-200 border-l-4 border-primary p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-3">
                            <i className="fa-duotone fa-regular fa-briefcase mr-2" />
                            Role
                        </p>
                        <p className="text-lg font-bold">
                            {selectedJob.title}
                        </p>
                        {selectedJob.company_name && (
                            <p className="text-sm text-base-content/60 mt-1">
                                <i className="fa-duotone fa-regular fa-building mr-1" />
                                {selectedJob.company_name}
                            </p>
                        )}
                        {selectedJob.location && (
                            <p className="text-sm text-base-content/60 mt-1">
                                <i className="fa-duotone fa-regular fa-map-marker-alt mr-1" />
                                {selectedJob.location}
                            </p>
                        )}
                    </div>

                    {/* Candidate */}
                    <div className="bg-base-200 border-l-4 border-secondary p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-3">
                            <i className="fa-duotone fa-regular fa-user mr-2" />
                            Candidate
                        </p>
                        <p className="text-lg font-bold">
                            {selectedCandidate.full_name}
                        </p>
                        <p className="text-sm text-base-content/60 mt-1">
                            {selectedCandidate.email}
                        </p>
                        {(selectedCandidate.current_title ||
                            selectedCandidate.current_company) && (
                            <p className="text-sm text-base-content/60 mt-1">
                                {selectedCandidate.current_title}
                                {selectedCandidate.current_title &&
                                    selectedCandidate.current_company &&
                                    " \u2022 "}
                                {selectedCandidate.current_company}
                            </p>
                        )}
                        {selectedCandidate.location && (
                            <p className="text-sm text-base-content/60 mt-1">
                                <i className="fa-duotone fa-regular fa-map-marker-alt mr-1" />
                                {selectedCandidate.location}
                            </p>
                        )}
                    </div>

                    {/* Pitch */}
                    <div className="bg-base-200 border-l-4 border-accent p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-3">
                            <i className="fa-duotone fa-regular fa-message mr-2" />
                            Pitch
                        </p>
                        <div className="prose prose-sm max-w-none">
                            <MarkdownRenderer content={pitch} />
                        </div>
                    </div>

                    {/* Documents */}
                    {(selectedDocIds.size > 0 || resumeFile) && (
                        <div className="bg-base-200 border-l-4 border-neutral p-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-3">
                                <i className="fa-duotone fa-regular fa-file mr-2" />
                                Documents
                            </p>
                            <div className="space-y-2">
                                {resumeFile && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <i className="fa-duotone fa-regular fa-file-arrow-up text-primary" />
                                        <span className="font-medium">
                                            {resumeFile.name}
                                        </span>
                                        <span className="text-base-content/40">
                                            (new upload)
                                        </span>
                                    </div>
                                )}
                                {Array.from(selectedDocIds).map((docId) => {
                                    const doc = candidateDocuments.find(
                                        (d) => d.id === docId,
                                    );
                                    return (
                                        doc && (
                                            <div
                                                key={docId}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <i className="fa-duotone fa-regular fa-file text-base-content/40" />
                                                <span className="font-medium">
                                                    {doc.filename}
                                                </span>
                                            </div>
                                        )
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </BaselWizardModal>
    );
}
