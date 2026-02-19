"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    MarkdownEditor,
    MarkdownRenderer,
    ButtonLoading,
    LoadingState,
} from "@splits-network/shared-ui";

// ── Types ──────────────────────────────────────────────────────────────────

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
}

interface Document {
    id: string;
    filename: string;
    file_type: string;
}

interface SubmitToJobWizardProps {
    candidateId: string;
    candidateName: string;
    onClose: () => void;
    onSubmit: (
        jobId: string,
        notes: string,
        documentIds: string[],
    ) => Promise<void>;
}

// ── Constants ──────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
    { label: "Select Job", icon: "fa-duotone fa-regular fa-briefcase" },
    { label: "Details", icon: "fa-duotone fa-regular fa-pen" },
    { label: "Review", icon: "fa-duotone fa-regular fa-check-double" },
];

const STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "filled", label: "Filled" },
    { value: "closed", label: "Closed" },
];

const STATUS_COLORS: Record<string, string> = {
    active: "bg-success/15 text-success",
    open: "bg-success/15 text-success",
    paused: "bg-warning/15 text-warning",
    filled: "bg-info/15 text-info",
    closed: "bg-error/15 text-error",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatSalary(min?: number, max?: number): string {
    if (!min && !max) return "Not specified";
    if (!max) return `$${min?.toLocaleString()}+`;
    if (!min) return `Up to $${max?.toLocaleString()}`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
}

function fileIcon(fileType?: string): string {
    if (fileType === "application/pdf") return "fa-file-pdf";
    if (fileType?.startsWith("image/")) return "fa-file-image";
    return "fa-file";
}

// ── Component ──────────────────────────────────────────────────────────────

export default function SubmitToJobWizard({
    candidateId,
    candidateName,
    onClose,
    onSubmit,
}: SubmitToJobWizardProps) {
    const { getToken } = useAuth();

    // Wizard state
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [notes, setNotes] = useState("");
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(
        new Set(),
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Job list state
    const [jobs, setJobs] = useState<Job[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 25;

    // Document state
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);

    // ── Debounced search ──────────────────────────────────────────────────

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [statusFilter, debouncedSearch]);

    // ── Load jobs (step 0) ────────────────────────────────────────────────

    useEffect(() => {
        if (currentStep !== 0) return;

        async function loadJobs() {
            try {
                setJobsLoading(true);
                setError(null);
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const params = {
                    page,
                    limit,
                    status:
                        statusFilter === "all" ? undefined : statusFilter,
                    search: debouncedSearch || undefined,
                    sort_by: "created_at",
                    sort_order: "desc",
                };

                const response = await client.get("/jobs", { params });

                if (response.data?.data) {
                    setJobs(response.data);
                    if (response.data.pagination) {
                        setTotalPages(
                            response.data.pagination.total_pages || 1,
                        );
                        setTotalCount(
                            response.data.pagination.total || 0,
                        );
                    }
                } else if (Array.isArray(response.data)) {
                    setJobs(response.data);
                    setTotalPages(1);
                    setTotalCount(response.data.length);
                } else {
                    setJobs([]);
                    setTotalPages(1);
                    setTotalCount(0);
                }
            } catch (err: any) {
                console.error("Failed to load jobs:", err);
                setError("Failed to load jobs. Please try again.");
            } finally {
                setJobsLoading(false);
            }
        }

        loadJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, page, statusFilter, debouncedSearch]);

    // ── Load documents (step 1) ───────────────────────────────────────────

    useEffect(() => {
        if (currentStep !== 1 || documents.length > 0) return;

        async function loadDocuments() {
            try {
                setDocumentsLoading(true);
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const response = await client.get(
                    `/documents/entity/candidate/${candidateId}`,
                );
                if (response.data) {
                    setDocuments(response.data);
                }
            } catch (err) {
                console.error("Failed to load documents:", err);
            } finally {
                setDocumentsLoading(false);
            }
        }

        loadDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, candidateId, documents.length]);

    // ── Handlers ──────────────────────────────────────────────────────────

    const toggleDocument = (docId: string) => {
        const next = new Set(selectedDocIds);
        if (next.has(docId)) {
            next.delete(docId);
        } else {
            next.add(docId);
        }
        setSelectedDocIds(next);
    };

    const handleNext = () => {
        if (currentStep === 0 && !selectedJob) {
            setError("Please select a job to continue");
            return;
        }
        setError(null);
        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setError(null);
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (!selectedJob) return;
        try {
            setSubmitting(true);
            setError(null);
            await onSubmit(
                selectedJob.id,
                notes,
                Array.from(selectedDocIds),
            );
        } catch (err: any) {
            setError(err.message || "Failed to submit candidate");
            setSubmitting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <dialog className="modal modal-open" onClick={onClose}>
            <div
                className="modal-box bg-base-100 border-2 border-base-300 max-w-5xl w-full p-0 max-h-[90vh] overflow-hidden flex flex-col"
                style={{ borderRadius: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ──────────────────────────────────────────── */}
                <div className="bg-primary px-6 py-4 border-b border-base-300">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-primary-content">
                                Submit to Role
                            </h3>
                            <p className="text-sm text-primary-content/70 mt-1">
                                Submitting {candidateName} for review
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-sm btn-square text-primary-content"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-0 mt-2">
                        {WIZARD_STEPS.map((step, i) => (
                            <div
                                key={step.label}
                                className="flex items-center"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center text-sm font-black transition-colors ${
                                            i <= currentStep
                                                ? "bg-primary-content text-primary"
                                                : "bg-primary-content/20 text-primary-content/40"
                                        }`}
                                    >
                                        {i < currentStep ? (
                                            <i className="fa-duotone fa-regular fa-check text-sm" />
                                        ) : (
                                            i + 1
                                        )}
                                    </div>
                                    <span
                                        className={`text-sm font-semibold uppercase tracking-[0.15em] hidden sm:inline ${
                                            i <= currentStep
                                                ? "text-primary-content"
                                                : "text-primary-content/40"
                                        }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {i < WIZARD_STEPS.length - 1 && (
                                    <div
                                        className={`w-8 h-0.5 mx-2 ${
                                            i < currentStep
                                                ? "bg-primary-content"
                                                : "bg-primary-content/20"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Error ───────────────────────────────────────────── */}
                {error && (
                    <div className="mx-6 mt-4 bg-error/10 border-l-4 border-error p-3 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error" />
                        <span className="text-sm font-semibold text-base-content">
                            {error}
                        </span>
                    </div>
                )}

                {/* ── Step Content ────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-6">
                    {currentStep === 0 && (
                        <StepSelectJob
                            jobs={jobs}
                            jobsLoading={jobsLoading}
                            selectedJob={selectedJob}
                            onSelectJob={setSelectedJob}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            debouncedSearch={debouncedSearch}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            page={page}
                            totalPages={totalPages}
                            totalCount={totalCount}
                            onPageChange={setPage}
                        />
                    )}

                    {currentStep === 1 && selectedJob && (
                        <StepDetails
                            selectedJob={selectedJob}
                            candidateName={candidateName}
                            notes={notes}
                            onNotesChange={setNotes}
                            documents={documents}
                            documentsLoading={documentsLoading}
                            selectedDocIds={selectedDocIds}
                            onToggleDocument={toggleDocument}
                        />
                    )}

                    {currentStep === 2 && selectedJob && (
                        <StepReview
                            candidateName={candidateName}
                            selectedJob={selectedJob}
                            notes={notes}
                            documents={documents}
                            selectedDocIds={selectedDocIds}
                        />
                    )}
                </div>

                {/* ── Footer ──────────────────────────────────────────── */}
                <div className="px-6 py-4 border-t border-base-300 flex items-center justify-between">
                    <button
                        className="btn btn-outline btn-sm"
                        style={{ borderRadius: 0 }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                className="btn btn-outline btn-sm"
                                style={{ borderRadius: 0 }}
                                onClick={handleBack}
                                disabled={submitting}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-left mr-1" />
                                Back
                            </button>
                        )}
                        {currentStep < 2 ? (
                            <button
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: 0 }}
                                onClick={handleNext}
                                disabled={!selectedJob}
                            >
                                Continue
                                <i className="fa-duotone fa-regular fa-chevron-right ml-1" />
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: 0 }}
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                <ButtonLoading
                                    loading={submitting}
                                    text="Send to Candidate"
                                    loadingText="Sending..."
                                />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </dialog>
    );
}

// ── Step 1: Select Job ──────────────────────────────────────────────────────

function StepSelectJob({
    jobs,
    jobsLoading,
    selectedJob,
    onSelectJob,
    searchQuery,
    onSearchChange,
    debouncedSearch,
    statusFilter,
    onStatusChange,
    page,
    totalPages,
    totalCount,
    onPageChange,
}: {
    jobs: Job[];
    jobsLoading: boolean;
    selectedJob: Job | null;
    onSelectJob: (job: Job) => void;
    searchQuery: string;
    onSearchChange: (v: string) => void;
    debouncedSearch: string;
    statusFilter: string;
    onStatusChange: (v: string) => void;
    page: number;
    totalPages: number;
    totalCount: number;
    onPageChange: (p: number) => void;
}) {
    return (
        <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-base-200 p-4">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-1 block">
                            Search Roles
                        </label>
                        <div className="relative">
                            <i className="fa-duotone fa-regular fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm" />
                            <input
                                type="text"
                                className="input input-bordered w-full pl-9 bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                style={{ borderRadius: 0 }}
                                value={searchQuery}
                                onChange={(e) =>
                                    onSearchChange(e.target.value)
                                }
                                placeholder="Search by title, company, location..."
                            />
                        </div>
                        <p className="text-sm text-base-content/40 mt-1">
                            {jobsLoading && debouncedSearch ? (
                                <>
                                    <span className="loading loading-spinner loading-xs mr-1" />
                                    Searching...
                                </>
                            ) : (
                                "Results update as you type"
                            )}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-1 block">
                            Status
                        </label>
                        <select
                            className="select select-bordered select-sm font-medium bg-base-100 border-base-300 focus:border-primary focus:outline-none"
                            style={{ borderRadius: 0, appearance: "auto" }}
                            value={statusFilter}
                            onChange={(e) => onStatusChange(e.target.value)}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Job List */}
            {jobsLoading ? (
                <div className="flex justify-center py-12">
                    <LoadingState message="Loading jobs..." />
                </div>
            ) : jobs.length === 0 ? (
                <div className="border-2 border-base-300 p-8 text-center">
                    <i className="fa-duotone fa-regular fa-briefcase text-3xl text-base-content/20 mb-3" />
                    <h4 className="font-black text-lg uppercase tracking-tight mb-2 text-base-content">
                        No Roles Found
                    </h4>
                    <p className="text-sm text-base-content/40">
                        {debouncedSearch
                            ? `No jobs matching "${debouncedSearch}".`
                            : "No roles match your current filters. Try broadening your search."}
                    </p>
                </div>
            ) : (
                <>
                    {debouncedSearch && (
                        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50">
                            Found {totalCount} job
                            {totalCount !== 1 ? "s" : ""} matching &ldquo;
                            {debouncedSearch}&rdquo;
                        </div>
                    )}

                    <div
                        className="border-2 border-base-300 overflow-hidden"
                        style={{ borderRadius: 0 }}
                    >
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-neutral text-neutral-content">
                                    <th className="font-black uppercase tracking-[0.15em] text-sm w-12" />
                                    <th className="font-black uppercase tracking-[0.15em] text-sm">
                                        Role
                                    </th>
                                    <th className="font-black uppercase tracking-[0.15em] text-sm">
                                        Company
                                    </th>
                                    <th className="font-black uppercase tracking-[0.15em] text-sm hidden md:table-cell">
                                        Location
                                    </th>
                                    <th className="font-black uppercase tracking-[0.15em] text-sm hidden lg:table-cell">
                                        Salary
                                    </th>
                                    <th className="font-black uppercase tracking-[0.15em] text-sm">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => {
                                    const isSelected =
                                        selectedJob?.id === job.id;
                                    return (
                                        <tr
                                            key={job.id}
                                            onClick={() => onSelectJob(job)}
                                            className={`cursor-pointer transition-colors border-b border-base-200 ${
                                                isSelected
                                                    ? "bg-primary/5 border-l-4 border-l-primary"
                                                    : "hover:bg-base-200/50"
                                            }`}
                                        >
                                            <td className="text-center">
                                                <input
                                                    type="radio"
                                                    className="radio radio-primary radio-sm"
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        onSelectJob(job)
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <span className="font-bold text-base-content">
                                                    {job.title}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="flex items-center gap-2 text-base-content/70">
                                                    <i className="fa-duotone fa-regular fa-building text-base-content/40" />
                                                    {job.company_name ||
                                                        `Company ${job.company_id.substring(0, 8)}`}
                                                </span>
                                            </td>
                                            <td className="hidden md:table-cell">
                                                {job.location ? (
                                                    <span className="flex items-center gap-2 text-base-content/70">
                                                        <i className="fa-duotone fa-regular fa-location-dot text-base-content/40" />
                                                        {job.location}
                                                    </span>
                                                ) : (
                                                    <span className="text-base-content/30 italic text-sm">
                                                        Not specified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="hidden lg:table-cell">
                                                <span className="text-sm font-bold text-base-content">
                                                    {formatSalary(
                                                        job.salary_min,
                                                        job.salary_max,
                                                    )}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${
                                                        STATUS_COLORS[
                                                            job.status
                                                        ] ||
                                                        "bg-base-content/10 text-base-content/50"
                                                    }`}
                                                >
                                                    {job.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <span className="text-sm text-base-content/50">
                                Page {page} of {totalPages} ({totalCount}{" "}
                                total)
                            </span>
                            <div className="flex gap-2">
                                <button
                                    className="btn btn-outline btn-xs"
                                    style={{ borderRadius: 0 }}
                                    disabled={page <= 1}
                                    onClick={() => onPageChange(page - 1)}
                                >
                                    <i className="fa-duotone fa-regular fa-chevron-left" />
                                </button>
                                <button
                                    className="btn btn-outline btn-xs"
                                    style={{ borderRadius: 0 }}
                                    disabled={page >= totalPages}
                                    onClick={() => onPageChange(page + 1)}
                                >
                                    <i className="fa-duotone fa-regular fa-chevron-right" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ── Step 2: Details (Notes + Documents) ─────────────────────────────────────

function StepDetails({
    selectedJob,
    candidateName,
    notes,
    onNotesChange,
    documents,
    documentsLoading,
    selectedDocIds,
    onToggleDocument,
}: {
    selectedJob: Job;
    candidateName: string;
    notes: string;
    onNotesChange: (v: string) => void;
    documents: Document[];
    documentsLoading: boolean;
    selectedDocIds: Set<string>;
    onToggleDocument: (id: string) => void;
}) {
    return (
        <div className="space-y-6">
            {/* Selected Job Banner */}
            <div className="bg-success/10 border-l-4 border-success p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-success flex items-center justify-center flex-shrink-0">
                    <i className="fa-duotone fa-regular fa-briefcase text-success-content" />
                </div>
                <div>
                    <div className="font-black text-base-content uppercase tracking-tight">
                        {selectedJob.title}
                    </div>
                    <div className="text-sm text-base-content/60">
                        {selectedJob.company_name ||
                            `Company ${selectedJob.company_id.substring(0, 8)}`}
                        {selectedJob.location &&
                            ` - ${selectedJob.location}`}
                    </div>
                </div>
            </div>

            {/* Notes / Pitch */}
            <MarkdownEditor
                className="fieldset"
                label="Your Pitch to Candidate (Optional)"
                value={notes}
                onChange={onNotesChange}
                placeholder="Why is this opportunity a great fit?"
                helperText={`Explain why you think ${candidateName} should consider this role.`}
                height={220}
            />

            {/* Documents */}
            <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3 flex items-center gap-2 border-l-4 border-accent pl-3">
                    Attach Documents
                </h4>

                {documentsLoading ? (
                    <div className="flex justify-center py-8">
                        <LoadingState message="Loading documents..." />
                    </div>
                ) : documents.length === 0 ? (
                    <div
                        className="border-2 border-base-300 p-6 text-center"
                        style={{ borderRadius: 0 }}
                    >
                        <p className="text-sm text-base-content/40">
                            No documents on file. Upload documents from the candidate profile first.
                        </p>
                    </div>
                ) : (
                    <div
                        className="border-2 border-base-300 max-h-64 overflow-y-auto"
                        style={{ borderRadius: 0 }}
                    >
                        {documents.map((doc, i) => (
                            <div
                                key={doc.id}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                                    selectedDocIds.has(doc.id)
                                        ? "bg-accent/10"
                                        : "hover:bg-base-200"
                                } ${
                                    i < documents.length - 1
                                        ? "border-b border-base-200"
                                        : ""
                                }`}
                                onClick={() => onToggleDocument(doc.id)}
                            >
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-accent checkbox-sm"
                                    checked={selectedDocIds.has(doc.id)}
                                    onChange={() =>
                                        onToggleDocument(doc.id)
                                    }
                                />
                                <i
                                    className={`fa-duotone fa-regular ${fileIcon(doc.file_type)} text-base-content/60`}
                                />
                                <span className="text-sm font-semibold text-base-content">
                                    {doc.filename}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-sm text-base-content/40 mt-2">
                    {selectedDocIds.size} document(s) selected
                </p>
            </div>
        </div>
    );
}

// ── Step 3: Review ──────────────────────────────────────────────────────────

function StepReview({
    candidateName,
    selectedJob,
    notes,
    documents,
    selectedDocIds,
}: {
    candidateName: string;
    selectedJob: Job;
    notes: string;
    documents: Document[];
    selectedDocIds: Set<string>;
}) {
    return (
        <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-info/10 border-l-4 border-info p-4 flex items-center gap-3">
                <i className="fa-duotone fa-regular fa-info-circle text-info text-lg" />
                <span className="text-sm text-base-content">
                    Confirm the details below. {candidateName} will be notified
                    and must approve before the submission is finalized.
                </span>
            </div>

            {/* Candidate Card */}
            <div
                className="border-2 border-base-300 overflow-hidden"
                style={{ borderRadius: 0 }}
            >
                <div className="px-4 py-2 border-b border-base-300 bg-primary">
                    <h4 className="font-black text-sm uppercase tracking-[0.2em] text-primary-content flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-user" />
                        Candidate
                    </h4>
                </div>
                <div className="p-4">
                    <span className="text-lg font-black text-base-content">
                        {candidateName}
                    </span>
                </div>
            </div>

            {/* Job Card */}
            <div
                className="border-2 border-base-300 overflow-hidden"
                style={{ borderRadius: 0 }}
            >
                <div className="px-4 py-2 border-b border-base-300 bg-secondary">
                    <h4 className="font-black text-sm uppercase tracking-[0.2em] text-secondary-content flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-briefcase" />
                        Selected Role
                    </h4>
                </div>
                <div className="p-4 space-y-2">
                    <div className="text-lg font-black text-base-content">
                        {selectedJob.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5 text-base-content/60">
                            <i className="fa-duotone fa-regular fa-building" />
                            {selectedJob.company_name ||
                                `Company ${selectedJob.company_id.substring(0, 8)}`}
                        </span>
                        {selectedJob.location && (
                            <span className="flex items-center gap-1.5 text-base-content/60">
                                <i className="fa-duotone fa-regular fa-location-dot" />
                                {selectedJob.location}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5 text-base-content/60">
                            <i className="fa-duotone fa-regular fa-money-bill" />
                            {formatSalary(
                                selectedJob.salary_min,
                                selectedJob.salary_max,
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Notes Card */}
            {notes && (
                <div
                    className="border-2 border-base-300 overflow-hidden"
                    style={{ borderRadius: 0 }}
                >
                    <div className="px-4 py-2 border-b border-base-300 bg-accent">
                        <h4 className="font-black text-sm uppercase tracking-[0.2em] text-accent-content flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-message" />
                            Your Pitch
                        </h4>
                    </div>
                    <div className="p-4">
                        <MarkdownRenderer
                            content={notes}
                            className="prose prose-sm max-w-none"
                        />
                    </div>
                </div>
            )}

            {/* Documents Card */}
            {selectedDocIds.size > 0 && (
                <div
                    className="border-2 border-base-300 overflow-hidden"
                    style={{ borderRadius: 0 }}
                >
                    <div className="px-4 py-2 border-b border-base-300 bg-neutral">
                        <h4 className="font-black text-sm uppercase tracking-[0.2em] text-neutral-content flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-paperclip" />
                            Attachments ({selectedDocIds.size})
                        </h4>
                    </div>
                    <div className="p-4 space-y-2">
                        {documents
                            .filter((doc) => selectedDocIds.has(doc.id))
                            .map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-2 text-sm font-semibold text-base-content"
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${fileIcon(doc.file_type)} text-base-content/60`}
                                    />
                                    {doc.filename}
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
