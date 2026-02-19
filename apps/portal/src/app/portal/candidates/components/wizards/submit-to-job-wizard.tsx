"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    MarkdownEditor,
    MarkdownRenderer,
    ButtonLoading,
} from "@splits-network/shared-ui";

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Constants ──────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
    { label: "Select Role", icon: "fa-duotone fa-regular fa-briefcase" },
    { label: "Add Details", icon: "fa-duotone fa-regular fa-pen" },
    { label: "Review", icon: "fa-duotone fa-regular fa-check-double" },
];

const STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "filled", label: "Filled" },
    { value: "closed", label: "Closed" },
];

const STATUS_BADGE: Record<string, string> = {
    active: "badge-success",
    open: "badge-success",
    paused: "badge-warning",
    filled: "badge-info",
    closed: "badge-error",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatSalary(min?: number, max?: number): string {
    if (!min && !max) return "Salary not listed";
    if (!max) return `$${min?.toLocaleString()}+`;
    if (!min) return `Up to $${max?.toLocaleString()}`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
}

function fileIcon(fileType?: string): string {
    if (fileType === "application/pdf") return "fa-file-pdf";
    if (fileType?.startsWith("image/")) return "fa-file-image";
    return "fa-file";
}

function fileIconColor(fileType?: string): string {
    if (fileType === "application/pdf") return "text-error";
    if (fileType?.startsWith("image/")) return "text-info";
    return "text-base-content/70";
}

// ─── Component ──────────────────────────────────────────────────────────────

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

    // ── Debounced search ────────────────────────────────────────────────────

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

    // ── Load jobs (step 0) ──────────────────────────────────────────────────

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
                setError("Could not load roles. Try again.");
            } finally {
                setJobsLoading(false);
            }
        }

        loadJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, page, statusFilter, debouncedSearch]);

    // ── Load documents (step 1) ─────────────────────────────────────────────

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

    // ── Handlers ────────────────────────────────────────────────────────────

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
            setError("Select a role to continue.");
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
            setError(err.message || "Submission failed. Try again.");
            setSubmitting(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <dialog className="modal modal-open modal-bottom sm:modal-middle">
            <div
                className="modal-box max-w-5xl p-0 flex flex-col max-h-[90vh]"
                style={{ borderRadius: 0 }}
            >
                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="px-6 pt-6 pb-4 border-b-2 border-base-300">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-primary">
                                <i className="fa-duotone fa-regular fa-paper-plane text-lg text-primary-content" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-wider">
                                    Submit to Role
                                </h3>
                                <p className="text-sm font-bold text-base-content/50 mt-1">
                                    {candidateName} will be notified for approval
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost flex-shrink-0"
                            aria-label="Close"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>

                    {/* Step Progress */}
                    <ul className="steps steps-horizontal w-full text-xs">
                        {WIZARD_STEPS.map((step, i) => (
                            <li
                                key={i}
                                className={`step ${i <= currentStep ? "step-primary" : ""}`}
                            >
                                <span className="hidden sm:inline text-[10px] uppercase tracking-[0.15em] font-bold">
                                    {step.label}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ── Error ───────────────────────────────────────────────── */}
                {error && (
                    <div className="mx-6 mt-4">
                        <div role="alert" className="alert alert-error">
                            <i className="fa-duotone fa-regular fa-circle-xmark" />
                            <span className="text-sm flex-1">{error}</span>
                            <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                onClick={() => setError(null)}
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step Content ────────────────────────────────────────── */}
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

                {/* ── Footer ──────────────────────────────────────────────── */}
                <div className="px-6 py-4 border-t-2 border-base-300 flex items-center justify-between">
                    <button
                        type="button"
                        className="btn btn-neutral btn-sm"
                        style={{ borderRadius: 0 }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                type="button"
                                className="btn btn-neutral btn-sm"
                                style={{ borderRadius: 0 }}
                                onClick={handleBack}
                                disabled={submitting}
                            >
                                <i className="fa-solid fa-arrow-left mr-1" />
                                Back
                            </button>
                        )}
                        {currentStep < 2 ? (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: 0 }}
                                onClick={handleNext}
                                disabled={!selectedJob}
                            >
                                Next
                                <i className="fa-solid fa-arrow-right ml-1" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: 0 }}
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                <ButtonLoading
                                    loading={submitting}
                                    text="Submit Candidate"
                                    loadingText="Submitting..."
                                />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}

// ─── Step 1: Select Job ─────────────────────────────────────────────────────

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
            <div className="border-2 border-base-300 p-4">
                <div className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-xs font-black uppercase tracking-wider text-base-content/50 mb-1 block">
                            Search Roles
                        </label>
                        <div className="relative">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                            <input
                                type="text"
                                className="input input-bordered w-full pl-9"
                                style={{ borderRadius: 0 }}
                                value={searchQuery}
                                onChange={(e) =>
                                    onSearchChange(e.target.value)
                                }
                                placeholder="Title, company, or location..."
                            />
                        </div>
                        <p className="text-xs font-bold text-base-content/40 mt-1">
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
                        <label className="text-xs font-black uppercase tracking-wider text-base-content/50 mb-1 block">
                            Status
                        </label>
                        <select
                            className="select select-bordered select-sm font-bold uppercase"
                            style={{ borderRadius: 0 }}
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
                <div className="flex flex-col items-center justify-center py-12">
                    <span className="loading loading-spinner loading-lg text-primary mb-3" />
                    <span className="text-sm font-bold uppercase tracking-wider text-base-content/50">
                        Loading available roles...
                    </span>
                </div>
            ) : jobs.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-base-300">
                    <i className="fa-duotone fa-regular fa-briefcase text-3xl text-base-content/20 mb-3" />
                    <h4 className="font-black text-lg uppercase tracking-tight mb-2 text-base-content">
                        No Roles Found
                    </h4>
                    <p className="text-sm text-base-content/40">
                        {debouncedSearch
                            ? `No roles matching "${debouncedSearch}". Try a different search.`
                            : "No roles match your current filters. Adjust them to see results."}
                    </p>
                </div>
            ) : (
                <>
                    {debouncedSearch && (
                        <div className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                            {totalCount} role
                            {totalCount !== 1 ? "s" : ""} matching &ldquo;
                            {debouncedSearch}&rdquo;
                        </div>
                    )}

                    <div className="border-2 border-base-300 overflow-hidden">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-base-200">
                                    <th className="font-black uppercase tracking-wider text-xs w-12" />
                                    <th className="font-black uppercase tracking-wider text-xs">
                                        Role
                                    </th>
                                    <th className="font-black uppercase tracking-wider text-xs hidden md:table-cell">
                                        Company
                                    </th>
                                    <th className="font-black uppercase tracking-wider text-xs hidden lg:table-cell">
                                        Location
                                    </th>
                                    <th className="font-black uppercase tracking-wider text-xs hidden lg:table-cell">
                                        Salary
                                    </th>
                                    <th className="font-black uppercase tracking-wider text-xs">
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
                                            className={[
                                                "cursor-pointer transition-colors",
                                                isSelected
                                                    ? "bg-primary/5 border-l-4 border-l-primary"
                                                    : "hover:bg-base-200",
                                            ].join(" ")}
                                        >
                                            <td className="text-center">
                                                <input
                                                    type="radio"
                                                    className="radio radio-sm radio-primary"
                                                    style={{ borderRadius: 0 }}
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
                                            <td className="hidden md:table-cell">
                                                <span className="flex items-center gap-2 text-base-content/70">
                                                    <i className="fa-duotone fa-regular fa-building text-base-content/40" />
                                                    {job.company_name ||
                                                        `Company ${job.company_id.substring(0, 8)}`}
                                                </span>
                                            </td>
                                            <td className="hidden lg:table-cell">
                                                {job.location ? (
                                                    <span className="flex items-center gap-2 text-base-content/70">
                                                        <i className="fa-duotone fa-regular fa-location-dot text-base-content/40" />
                                                        {job.location}
                                                    </span>
                                                ) : (
                                                    <span className="text-base-content/30 italic text-sm">
                                                        Remote / TBD
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
                                                    className={`badge badge-sm ${STATUS_BADGE[job.status] || "badge-neutral"}`}
                                                    style={{ borderRadius: 0 }}
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
                        <div className="flex items-center justify-between mt-3">
                            <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                style={{ borderRadius: 0 }}
                                onClick={() =>
                                    onPageChange(Math.max(1, page - 1))
                                }
                                disabled={page <= 1}
                            >
                                <i className="fa-solid fa-chevron-left mr-1" />
                                Prev
                            </button>
                            <span className="text-xs font-semibold text-base-content/50">
                                Page {page} of {totalPages} ({totalCount}{" "}
                                total)
                            </span>
                            <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                style={{ borderRadius: 0 }}
                                onClick={() =>
                                    onPageChange(
                                        Math.min(totalPages, page + 1),
                                    )
                                }
                                disabled={page >= totalPages}
                            >
                                Next
                                <i className="fa-solid fa-chevron-right ml-1" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Step 2: Details (Notes + Documents) ────────────────────────────────────

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
            <div className="bg-primary/5 border-l-4 border-primary p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary flex items-center justify-center flex-shrink-0">
                    <i className="fa-duotone fa-regular fa-briefcase text-primary-content" />
                </div>
                <div>
                    <div className="font-black text-base-content uppercase tracking-tight">
                        {selectedJob.title}
                    </div>
                    <div className="text-sm font-bold text-base-content/60">
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
                label="Recruiter Notes (Optional)"
                value={notes}
                onChange={onNotesChange}
                placeholder="Why is this role a strong match for this candidate?"
                helperText={`Provide context on why ${candidateName} is a fit for this role. The candidate will see this.`}
                height={220}
            />

            {/* Documents */}
            <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-base-content/50 mb-3 flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-paperclip text-base-content/40" />
                    Attachments (Optional)
                </h4>

                {documentsLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <span className="loading loading-spinner loading-md text-primary mb-3" />
                        <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                            Loading documents...
                        </span>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="py-6 text-center border-2 border-dashed border-base-300">
                        <i className="fa-duotone fa-regular fa-folder-open text-2xl text-base-content/20 mb-2" />
                        <p className="text-sm font-bold text-base-content/40">
                            No documents on file for this candidate.
                        </p>
                    </div>
                ) : (
                    <div className="border-2 border-base-300 max-h-64 overflow-y-auto">
                        {documents.map((doc, i) => (
                            <div
                                key={doc.id}
                                className={[
                                    "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                                    selectedDocIds.has(doc.id)
                                        ? "bg-primary/5"
                                        : "hover:bg-base-200",
                                    i < documents.length - 1
                                        ? "border-b border-base-300"
                                        : "",
                                ].join(" ")}
                                onClick={() => onToggleDocument(doc.id)}
                            >
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm checkbox-primary"
                                    style={{ borderRadius: 0 }}
                                    checked={selectedDocIds.has(doc.id)}
                                    onChange={() =>
                                        onToggleDocument(doc.id)
                                    }
                                />
                                <i
                                    className={`fa-duotone fa-regular ${fileIcon(doc.file_type)} ${fileIconColor(doc.file_type)}`}
                                />
                                <span className="text-sm font-bold text-base-content">
                                    {doc.filename}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs font-bold text-base-content/40 mt-2">
                    {selectedDocIds.size} {selectedDocIds.size === 1 ? "document" : "documents"} selected
                </p>
            </div>
        </div>
    );
}

// ─── Step 3: Review ─────────────────────────────────────────────────────────

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
        <div className="space-y-5">
            {/* Info Banner */}
            <div role="alert" className="alert alert-info">
                <i className="fa-duotone fa-regular fa-info-circle" />
                <span className="text-sm">
                    Confirm the details below. {candidateName} will be notified
                    by email and must approve before the submission is final.
                </span>
            </div>

            {/* Candidate Card */}
            <div className="border-l-4 border-primary border-2 border-base-300">
                <div className="px-4 py-2 bg-base-200 border-b border-base-300">
                    <h4 className="font-black text-xs uppercase tracking-wider text-primary flex items-center gap-2">
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
            <div className="border-l-4 border-secondary border-2 border-base-300">
                <div className="px-4 py-2 bg-base-200 border-b border-base-300">
                    <h4 className="font-black text-xs uppercase tracking-wider text-secondary flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-briefcase" />
                        Role
                    </h4>
                </div>
                <div className="p-4 space-y-2">
                    <div className="text-lg font-black text-base-content">
                        {selectedJob.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5 font-bold text-base-content/60">
                            <i className="fa-duotone fa-regular fa-building" />
                            {selectedJob.company_name ||
                                `Company ${selectedJob.company_id.substring(0, 8)}`}
                        </span>
                        {selectedJob.location && (
                            <span className="flex items-center gap-1.5 font-bold text-base-content/60">
                                <i className="fa-duotone fa-regular fa-location-dot" />
                                {selectedJob.location}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5 font-bold text-base-content/60">
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
                <div className="border-l-4 border-accent border-2 border-base-300">
                    <div className="px-4 py-2 bg-base-200 border-b border-base-300">
                        <h4 className="font-black text-xs uppercase tracking-wider text-accent flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-message" />
                            Recruiter Notes
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
                <div className="border-l-4 border-info border-2 border-base-300">
                    <div className="px-4 py-2 bg-base-200 border-b border-base-300">
                        <h4 className="font-black text-xs uppercase tracking-wider text-info flex items-center gap-2">
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
                                    className="flex items-center gap-2 text-sm font-bold text-base-content"
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${fileIcon(doc.file_type)} ${fileIconColor(doc.file_type)}`}
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
