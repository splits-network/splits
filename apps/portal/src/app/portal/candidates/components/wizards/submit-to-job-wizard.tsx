"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    Button,
    Badge,
    Checkbox,
    Modal,
    SearchInput,
    StepProgress,
    Pagination,
} from "@splits-network/memphis-ui";
import type { Step } from "@splits-network/memphis-ui";
import { MarkdownEditor, MarkdownRenderer, ButtonLoading } from "@splits-network/shared-ui";

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

const WIZARD_STEPS: Step[] = [
    { label: "Select Job", icon: "fa-duotone fa-regular fa-briefcase", accent: "coral" },
    { label: "Details", icon: "fa-duotone fa-regular fa-pen", accent: "teal" },
    { label: "Review", icon: "fa-duotone fa-regular fa-check-double", accent: "purple" },
];

const STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "filled", label: "Filled" },
    { value: "closed", label: "Closed" },
];

const STATUS_VARIANT: Record<string, "teal" | "coral" | "yellow" | "purple"> = {
    active: "teal",
    open: "teal",
    paused: "yellow",
    filled: "purple",
    closed: "coral",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

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

function fileIconColor(fileType?: string): string {
    if (fileType === "application/pdf") return "text-coral";
    if (fileType?.startsWith("image/")) return "text-teal";
    return "text-dark/70";
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
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
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
                    status: statusFilter === "all" ? undefined : statusFilter,
                    search: debouncedSearch || undefined,
                    sort_by: "created_at",
                    sort_order: "desc",
                };

                const response = await client.get("/jobs", { params });

                if (response.data?.data) {
                    setJobs(response.data);
                    if (response.data.pagination) {
                        setTotalPages(response.data.pagination.total_pages || 1);
                        setTotalCount(response.data.pagination.total || 0);
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
            await onSubmit(selectedJob.id, notes, Array.from(selectedDocIds));
        } catch (err: any) {
            setError(err.message || "Failed to submit candidate");
            setSubmitting(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <Modal
            open={true}
            onClose={onClose}
            maxWidth="max-w-5xl"
            padding={false}
            className="!overflow-hidden flex flex-col"
        >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="px-6 pt-6 pb-4 border-b-4 border-dark">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-wider text-dark">
                            Send Job Opportunity
                        </h3>
                        <p className="text-sm font-bold text-dark/50 mt-1">
                            {candidateName} will review and approve
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-square btn-outline btn-dark flex-shrink-0"
                        aria-label="Close"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                <StepProgress
                    steps={WIZARD_STEPS}
                    currentStep={currentStep}
                    className="mt-2"
                />
            </div>

            {/* ── Error ───────────────────────────────────────────────────── */}
            {error && (
                <div className="mx-6 mt-4 border-4 border-coral bg-coral/10 p-3 flex items-center gap-3">
                    <i className="fa-duotone fa-regular fa-circle-exclamation text-coral" />
                    <span className="text-sm font-bold text-dark">{error}</span>
                </div>
            )}

            {/* ── Step Content ────────────────────────────────────────────── */}
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

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <div className="px-6 py-4 border-t-4 border-dark flex items-center justify-between">
                <Button color="dark" size="sm" onClick={onClose}>
                    Cancel
                </Button>
                <div className="flex gap-3">
                    {currentStep > 0 && (
                        <Button
                            color="dark"
                            size="sm"
                            onClick={handleBack}
                            disabled={submitting}
                        >
                            <i className="fa-duotone fa-regular fa-chevron-left mr-1" />
                            Back
                        </Button>
                    )}
                    {currentStep < 2 ? (
                        <Button
                            color="coral"
                            size="sm"
                            onClick={handleNext}
                            disabled={!selectedJob}
                        >
                            Next
                            <i className="fa-duotone fa-regular fa-chevron-right ml-1" />
                        </Button>
                    ) : (
                        <Button
                            color="teal"
                            size="sm"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            <ButtonLoading
                                loading={submitting}
                                text="Send to Candidate"
                                loadingText="Sending..."
                            />
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
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
            <div className="border-4 border-dark p-4">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-xs font-black uppercase tracking-wider text-dark/50 mb-1 block">
                            Search Jobs
                        </label>
                        <SearchInput
                            value={searchQuery}
                            onChange={onSearchChange}
                            placeholder="Search by title, company, location..."
                        />
                        <p className="text-xs font-bold text-dark/40 mt-1">
                            {jobsLoading && debouncedSearch ? (
                                <>
                                    <span className="loading loading-spinner loading-xs mr-1" />
                                    Searching...
                                </>
                            ) : (
                                "Search updates as you type"
                            )}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-dark/50 mb-1 block">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusChange(e.target.value)}
                            className="select select-sm font-bold uppercase"
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
                    <div className="text-center">
                        <div className="flex justify-center gap-3 mb-4">
                            <div className="w-4 h-4 bg-coral animate-pulse" />
                            <div className="w-4 h-4 rounded-full bg-teal animate-pulse" />
                            <div className="w-4 h-4 rotate-45 bg-yellow animate-pulse" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider text-dark/50">
                            Loading jobs...
                        </span>
                    </div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="border-4 border-dark/20 p-8 text-center">
                    <div className="flex justify-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-purple" />
                        <div className="w-6 h-6 rotate-12 bg-coral" />
                    </div>
                    <h4 className="font-black text-lg uppercase tracking-tight mb-2 text-dark">
                        No Jobs Found
                    </h4>
                    <p className="text-sm text-dark/40">
                        {debouncedSearch
                            ? `No jobs matching "${debouncedSearch}".`
                            : "Try adjusting your filters."}
                    </p>
                </div>
            ) : (
                <>
                    {debouncedSearch && (
                        <div className="text-xs font-bold uppercase tracking-wider text-dark/50">
                            Found {totalCount} job{totalCount !== 1 ? "s" : ""} matching "{debouncedSearch}"
                        </div>
                    )}

                    <div className="border-4 border-dark overflow-hidden">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-dark text-cream">
                                    <th className="font-black uppercase tracking-wider text-xs w-12" />
                                    <th className="font-black uppercase tracking-wider text-xs">
                                        Job Title
                                    </th>
                                    <th className="font-black uppercase tracking-wider text-xs">
                                        Company
                                    </th>
                                    <th className="font-black uppercase tracking-wider text-xs">
                                        Location
                                    </th>
                                    <th className="font-black uppercase tracking-wider text-xs">
                                        Salary
                                    </th>
                                    <th className="font-black uppercase tracking-wider text-xs">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => {
                                    const isSelected = selectedJob?.id === job.id;
                                    return (
                                        <tr
                                            key={job.id}
                                            onClick={() => onSelectJob(job)}
                                            className={[
                                                "cursor-pointer transition-colors border-b-2 border-dark/10",
                                                isSelected
                                                    ? "bg-teal/10 border-l-4 border-l-teal"
                                                    : "hover:bg-cream",
                                            ].join(" ")}
                                        >
                                            <td className="text-center">
                                                <input
                                                    type="radio"
                                                    className="radio radio-sm"
                                                    checked={isSelected}
                                                    onChange={() => onSelectJob(job)}
                                                    style={{
                                                        borderColor: isSelected
                                                            ? "var(--color-teal)"
                                                            : undefined,
                                                        backgroundColor: isSelected
                                                            ? "var(--color-teal)"
                                                            : undefined,
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <span className="font-bold text-dark">
                                                    {job.title}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="flex items-center gap-2 text-dark/70">
                                                    <i className="fa-duotone fa-regular fa-building text-dark/40" />
                                                    {job.company_name ||
                                                        `Company ${job.company_id.substring(0, 8)}`}
                                                </span>
                                            </td>
                                            <td>
                                                {job.location ? (
                                                    <span className="flex items-center gap-2 text-dark/70">
                                                        <i className="fa-duotone fa-regular fa-location-dot text-dark/40" />
                                                        {job.location}
                                                    </span>
                                                ) : (
                                                    <span className="text-dark/30 italic text-sm">
                                                        Not specified
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="text-sm font-bold text-dark">
                                                    {formatSalary(job.salary_min, job.salary_max)}
                                                </span>
                                            </td>
                                            <td>
                                                <Badge
                                                    color={STATUS_VARIANT[job.status] || "dark"}
                                                    size="sm"
                                                >
                                                    {job.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onChange={onPageChange}
                            totalItems={totalCount}
                            perPage={25}
                            accent="coral"
                        />
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
            <div className="border-4 border-teal bg-teal/10 p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-teal flex items-center justify-center flex-shrink-0">
                    <i className="fa-duotone fa-regular fa-briefcase text-dark" />
                </div>
                <div>
                    <div className="font-black text-dark uppercase tracking-tight">
                        {selectedJob.title}
                    </div>
                    <div className="text-sm font-bold text-dark/60">
                        {selectedJob.company_name ||
                            `Company ${selectedJob.company_id.substring(0, 8)}`}
                        {selectedJob.location && ` - ${selectedJob.location}`}
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
                <h4 className="text-xs font-black uppercase tracking-wider text-dark/50 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple" />
                    Attach Documents (Optional)
                </h4>

                {documentsLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="text-center">
                            <div className="flex justify-center gap-3 mb-3">
                                <div className="w-3 h-3 bg-purple animate-pulse" />
                                <div className="w-3 h-3 rounded-full bg-yellow animate-pulse" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-dark/50">
                                Loading documents...
                            </span>
                        </div>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="border-4 border-dark/20 p-6 text-center">
                        <p className="text-sm font-bold text-dark/40">
                            No documents available for this candidate.
                        </p>
                    </div>
                ) : (
                    <div className="border-4 border-dark max-h-64 overflow-y-auto">
                        {documents.map((doc, i) => (
                            <div
                                key={doc.id}
                                className={[
                                    "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                                    selectedDocIds.has(doc.id)
                                        ? "bg-purple/10"
                                        : "hover:bg-cream",
                                    i < documents.length - 1
                                        ? "border-b-2 border-dark/10"
                                        : "",
                                ].join(" ")}
                                onClick={() => onToggleDocument(doc.id)}
                            >
                                <Checkbox
                                    checked={selectedDocIds.has(doc.id)}
                                    onChange={() => onToggleDocument(doc.id)}
                                    color="purple"
                                />
                                <i
                                    className={`fa-duotone fa-regular ${fileIcon(doc.file_type)} ${fileIconColor(doc.file_type)}`}
                                />
                                <span className="text-sm font-bold text-dark">
                                    {doc.filename}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs font-bold text-dark/40 mt-2">
                    {selectedDocIds.size} document(s) selected
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
        <div className="space-y-6">
            {/* Info Banner */}
            <div className="border-4 border-purple bg-purple/10 p-4 flex items-center gap-3">
                <i className="fa-duotone fa-regular fa-info-circle text-purple text-lg" />
                <span className="text-sm font-bold text-dark">
                    Review the details below. {candidateName} will receive an email
                    notification and must approve this opportunity.
                </span>
            </div>

            {/* Candidate Card */}
            <div className="border-4 border-dark">
                <div className="px-4 py-2 border-b-4 border-coral bg-coral">
                    <h4 className="font-black text-xs uppercase tracking-wider text-white flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-user" />
                        Candidate
                    </h4>
                </div>
                <div className="p-4">
                    <span className="text-lg font-black text-dark">{candidateName}</span>
                </div>
            </div>

            {/* Job Card */}
            <div className="border-4 border-dark">
                <div className="px-4 py-2 border-b-4 border-teal bg-teal">
                    <h4 className="font-black text-xs uppercase tracking-wider text-dark flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-briefcase" />
                        Job
                    </h4>
                </div>
                <div className="p-4 space-y-2">
                    <div className="text-lg font-black text-dark">
                        {selectedJob.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5 font-bold text-dark/60">
                            <i className="fa-duotone fa-regular fa-building" />
                            {selectedJob.company_name ||
                                `Company ${selectedJob.company_id.substring(0, 8)}`}
                        </span>
                        {selectedJob.location && (
                            <span className="flex items-center gap-1.5 font-bold text-dark/60">
                                <i className="fa-duotone fa-regular fa-location-dot" />
                                {selectedJob.location}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5 font-bold text-dark/60">
                            <i className="fa-duotone fa-regular fa-money-bill" />
                            {formatSalary(selectedJob.salary_min, selectedJob.salary_max)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Notes Card */}
            {notes && (
                <div className="border-4 border-dark">
                    <div className="px-4 py-2 border-b-4 border-yellow bg-yellow">
                        <h4 className="font-black text-xs uppercase tracking-wider text-dark flex items-center gap-2">
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
                <div className="border-4 border-dark">
                    <div className="px-4 py-2 border-b-4 border-purple bg-purple">
                        <h4 className="font-black text-xs uppercase tracking-wider text-white flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-paperclip" />
                            Attached Documents ({selectedDocIds.size})
                        </h4>
                    </div>
                    <div className="p-4 space-y-2">
                        {documents
                            .filter((doc) => selectedDocIds.has(doc.id))
                            .map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-2 text-sm font-bold text-dark"
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
