"use client";

import { useState, useRef, useEffect } from "react";
import { MarkdownEditor, MarkdownRenderer } from "@splits-network/shared-ui";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";

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

interface UniversalSubmitCandidateWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function UniversalSubmitCandidateWizard({
    isOpen,
    onClose,
    onSuccess,
}: UniversalSubmitCandidateWizardProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Wizard state
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // New candidate form data
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

    // Reset wizard state when closed
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1);
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

    // Debounce job search (300ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedJobSearch(jobSearchQuery);
            setJobPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [jobSearchQuery]);

    // Debounce candidate search (300ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedCandidateSearch(candidateSearchQuery);
            setCandidatePage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [candidateSearchQuery]);

    // Load jobs for step 1
    useEffect(() => {
        if (currentStep !== 1) return;

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
                setError("Failed to load jobs. Please try again.");
            } finally {
                setJobsLoading(false);
            }
        }

        loadJobs();
    }, [currentStep, jobPage, debouncedJobSearch, jobStatusFilter]);

    // Load candidates for step 2
    useEffect(() => {
        if (currentStep !== 2 || candidateMode !== "select") return;

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

                // If no candidates exist, default to new mode
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

    // Load candidate documents for step 3
    useEffect(() => {
        if (currentStep !== 3 || !selectedCandidate || candidateMode === "new")
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
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setError("File size must be less than 10MB");
                return;
            }
            setResumeFile(file);
            setError(null);
        }
    };

    const handleNext = () => {
        setError(null);

        if (currentStep === 1) {
            if (!selectedJob) {
                setError("Please select a job to continue");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (candidateMode === "select" && !selectedCandidate) {
                setError("Please select a candidate to continue");
                return;
            } else if (candidateMode === "new") {
                if (
                    !candidateFormData.full_name.trim() ||
                    !candidateFormData.email.trim()
                ) {
                    setError(
                        "Please fill in the required candidate fields (name and email)",
                    );
                    return;
                }
                // Create candidate object for new candidate
                setSelectedCandidate({
                    id: "", // Will be created during submission
                    full_name: candidateFormData.full_name,
                    email: candidateFormData.email,
                    phone: candidateFormData.phone,
                    location: candidateFormData.location,
                    current_title: candidateFormData.current_title,
                    current_company: candidateFormData.current_company,
                    linkedin_url: candidateFormData.linkedin_url,
                });
            }
            setCurrentStep(3);
        } else if (currentStep === 3) {
            if (!pitch.trim()) {
                setError("Please provide a pitch to the candidate");
                return;
            }
            setCurrentStep(4);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!selectedJob || !selectedCandidate || !pitch.trim()) {
            setError("Please complete all required fields");
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

            toast.success("Candidate submitted successfully!");
            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error("Failed to submit candidate:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to submit candidate. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const canProceed = () => {
        if (currentStep === 1) return selectedJob;
        if (currentStep === 2) {
            return candidateMode === "select"
                ? selectedCandidate
                : candidateFormData.full_name.trim() &&
                      candidateFormData.email.trim();
        }
        if (currentStep === 3) return pitch.trim();
        return true;
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-4xl h-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-2xl">Submit Candidate</h3>
                        <p className="text-sm text-base-content/70 mt-1">
                            Step {currentStep} of 4
                            {selectedJob && ` • ${selectedJob.title}`}
                            {selectedJob?.company_name &&
                                ` • ${selectedJob.company_name}`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost"
                    >
                        <i className="fa-duotone fa-regular fa-xmark"></i>
                    </button>
                </div>

                {/* Progress Steps */}
                <ul className="steps steps-horizontal w-full mb-6">
                    <li
                        className={`step ${currentStep >= 1 ? "step-primary" : ""}`}
                    >
                        Select Job
                    </li>
                    <li
                        className={`step ${currentStep >= 2 ? "step-primary" : ""}`}
                    >
                        Select Candidate
                    </li>
                    <li
                        className={`step ${currentStep >= 3 ? "step-primary" : ""}`}
                    >
                        Details
                    </li>
                    <li
                        className={`step ${currentStep >= 4 ? "step-primary" : ""}`}
                    >
                        Review
                    </li>
                </ul>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Step 1: Job Selection */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="card bg-base-200">
                                <div className="card-body py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">
                                                Search Jobs
                                            </legend>
                                            <input
                                                type="text"
                                                placeholder="Search by title, company, location..."
                                                className="input w-full"
                                                value={jobSearchQuery}
                                                onChange={(e) =>
                                                    setJobSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <p className="label text-base-content/50">
                                                {jobsLoading &&
                                                debouncedJobSearch ? (
                                                    <>
                                                        <span className="loading loading-spinner loading-xs mr-1"></span>
                                                        Searching...
                                                    </>
                                                ) : (
                                                    "Search updates as you type"
                                                )}
                                            </p>
                                        </fieldset>

                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">
                                                Status Filter
                                            </legend>
                                            <select
                                                className="select w-full"
                                                value={jobStatusFilter}
                                                onChange={(e) =>
                                                    setJobStatusFilter(
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    All Statuses
                                                </option>
                                                <option value="active">
                                                    Active
                                                </option>
                                                <option value="paused">
                                                    Paused
                                                </option>
                                                <option value="closed">
                                                    Closed
                                                </option>
                                            </select>
                                        </fieldset>
                                    </div>
                                </div>
                            </div>

                            {/* Jobs Table */}
                            {jobsLoading ? (
                                <div className="flex justify-center py-12">
                                    <span className="loading loading-spinner loading-lg"></span>
                                </div>
                            ) : jobs.length === 0 ? (
                                <div className="alert">
                                    <i className="fa-duotone fa-regular fa-info-circle"></i>
                                    <span>
                                        {debouncedJobSearch
                                            ? `No jobs found matching "${debouncedJobSearch}". Try a different search term.`
                                            : "No jobs found."}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    {debouncedJobSearch && (
                                        <div className="text-sm text-base-content/70 mb-2">
                                            Found {jobTotalCount} job
                                            {jobTotalCount !== 1 ? "s" : ""}{" "}
                                            matching "{debouncedJobSearch}"
                                        </div>
                                    )}
                                    <div className="overflow-x-auto border border-base-300 rounded-lg">
                                        <table className="table table-zebra">
                                            <thead>
                                                <tr>
                                                    <th>Select</th>
                                                    <th>Job Title</th>
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
                                                        className={`cursor-pointer hover:bg-base-200 ${
                                                            selectedJob?.id ===
                                                            job.id
                                                                ? "bg-primary/10"
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
                                                                    setSelectedJob(
                                                                        job,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="font-semibold">
                                                                {job.title}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {job.company_name}
                                                        </td>
                                                        <td>
                                                            {job.location || (
                                                                <span className="text-base-content/50">
                                                                    Not
                                                                    specified
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div
                                                                className={`badge ${
                                                                    job.status ===
                                                                    "active"
                                                                        ? "badge-success"
                                                                        : job.status ===
                                                                            "paused"
                                                                          ? "badge-warning"
                                                                          : "badge-neutral"
                                                                }`}
                                                            >
                                                                {job.status}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {job.fee_percentage}
                                                            %
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    {jobTotalPages > 1 && (
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="text-sm text-base-content/70">
                                                Showing page {jobPage} of{" "}
                                                {jobTotalPages} ({jobTotalCount}{" "}
                                                total jobs)
                                            </div>
                                            <div className="join">
                                                <button
                                                    className="join-item btn btn-sm"
                                                    onClick={() =>
                                                        setJobPage(
                                                            Math.max(
                                                                1,
                                                                jobPage - 1,
                                                            ),
                                                        )
                                                    }
                                                    disabled={jobPage === 1}
                                                >
                                                    <i className="fa-duotone fa-regular fa-chevron-left"></i>
                                                </button>
                                                <button className="join-item btn btn-sm">
                                                    Page {jobPage}
                                                </button>
                                                <button
                                                    className="join-item btn btn-sm"
                                                    onClick={() =>
                                                        setJobPage(
                                                            Math.min(
                                                                jobTotalPages,
                                                                jobPage + 1,
                                                            ),
                                                        )
                                                    }
                                                    disabled={
                                                        jobPage ===
                                                        jobTotalPages
                                                    }
                                                >
                                                    <i className="fa-duotone fa-regular fa-chevron-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 2: Candidate Selection/Creation */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            {/* Mode Selection Tabs */}
                            <div className="tabs tabs-boxed bg-base-200">
                                <a
                                    className={`tab ${candidateMode === "select" ? "tab-active" : ""}`}
                                    onClick={() => setCandidateMode("select")}
                                >
                                    <i className="fa-duotone fa-regular fa-user-check mr-2"></i>
                                    Select Existing
                                </a>
                                <a
                                    className={`tab ${candidateMode === "new" ? "tab-active" : ""}`}
                                    onClick={() => setCandidateMode("new")}
                                >
                                    <i className="fa-duotone fa-regular fa-user-plus mr-2"></i>
                                    Add New
                                </a>
                            </div>

                            {candidateMode === "select" ? (
                                <>
                                    {/* Search */}
                                    <div className="card bg-base-200">
                                        <div className="card-body py-4">
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend">
                                                    Search Candidates
                                                </legend>
                                                <input
                                                    type="text"
                                                    placeholder="Search by name, email, title, company..."
                                                    className="input w-full"
                                                    value={candidateSearchQuery}
                                                    onChange={(e) =>
                                                        setCandidateSearchQuery(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <p className="label text-base-content/50">
                                                    {candidatesLoading &&
                                                    debouncedCandidateSearch ? (
                                                        <>
                                                            <span className="loading loading-spinner loading-xs mr-1"></span>
                                                            Searching...
                                                        </>
                                                    ) : (
                                                        "Search updates as you type"
                                                    )}
                                                </p>
                                            </fieldset>
                                        </div>
                                    </div>

                                    {/* Candidates Table */}
                                    {candidatesLoading ? (
                                        <div className="flex justify-center py-12">
                                            <span className="loading loading-spinner loading-lg"></span>
                                        </div>
                                    ) : candidates.length === 0 ? (
                                        <div className="alert">
                                            <i className="fa-duotone fa-regular fa-info-circle"></i>
                                            <span>
                                                {debouncedCandidateSearch
                                                    ? `No candidates found matching "${debouncedCandidateSearch}". Try a different search term or add a new candidate.`
                                                    : "No candidates found. Please add a new candidate."}
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            {debouncedCandidateSearch && (
                                                <div className="text-sm text-base-content/70 mb-2">
                                                    Found {candidateTotalCount}{" "}
                                                    candidate
                                                    {candidateTotalCount !== 1
                                                        ? "s"
                                                        : ""}{" "}
                                                    matching "
                                                    {debouncedCandidateSearch}"
                                                </div>
                                            )}
                                            <div className="overflow-x-auto border border-base-300 rounded-lg">
                                                <table className="table table-zebra">
                                                    <thead>
                                                        <tr>
                                                            <th>Select</th>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>
                                                                Current Role
                                                            </th>
                                                            <th>Location</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {candidates.map(
                                                            (candidate) => (
                                                                <tr
                                                                    key={
                                                                        candidate.id
                                                                    }
                                                                    className={`cursor-pointer hover:bg-base-200 ${
                                                                        selectedCandidate?.id ===
                                                                        candidate.id
                                                                            ? "bg-primary/10"
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
                                                                    <td>
                                                                        <div className="font-semibold">
                                                                            {
                                                                                candidate.full_name
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            candidate.email
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {candidate.current_title ||
                                                                        candidate.current_company ? (
                                                                            <div className="text-sm">
                                                                                {
                                                                                    candidate.current_title
                                                                                }
                                                                                {candidate.current_title &&
                                                                                    candidate.current_company &&
                                                                                    " • "}
                                                                                {
                                                                                    candidate.current_company
                                                                                }
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-base-content/50">
                                                                                Not
                                                                                specified
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {candidate.location || (
                                                                            <span className="text-base-content/50">
                                                                                Not
                                                                                specified
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination Controls */}
                                            {candidateTotalPages > 1 && (
                                                <div className="flex justify-between items-center mt-4">
                                                    <div className="text-sm text-base-content/70">
                                                        Showing page{" "}
                                                        {candidatePage} of{" "}
                                                        {candidateTotalPages} (
                                                        {candidateTotalCount}{" "}
                                                        total candidates)
                                                    </div>
                                                    <div className="join">
                                                        <button
                                                            className="join-item btn btn-sm"
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
                                                                candidatePage ===
                                                                1
                                                            }
                                                        >
                                                            <i className="fa-duotone fa-regular fa-chevron-left"></i>
                                                        </button>
                                                        <button className="join-item btn btn-sm">
                                                            Page {candidatePage}
                                                        </button>
                                                        <button
                                                            className="join-item btn btn-sm"
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
                                                            <i className="fa-duotone fa-regular fa-chevron-right"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                /* New Candidate Form */
                                <div className="space-y-4">
                                    <div className="alert alert-info">
                                        <i className="fa-duotone fa-regular fa-info-circle"></i>
                                        <span>
                                            This candidate will be added to your
                                            database and proposed for this role.
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">
                                                Full Name *
                                            </legend>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={
                                                    candidateFormData.full_name
                                                }
                                                onChange={(e) =>
                                                    setCandidateFormData({
                                                        ...candidateFormData,
                                                        full_name:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="John Doe"
                                            />
                                        </fieldset>

                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">
                                                Email *
                                            </legend>
                                            <input
                                                type="email"
                                                className="input w-full"
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">
                                                Phone
                                            </legend>
                                            <input
                                                type="tel"
                                                className="input w-full"
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

                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">
                                                Location
                                            </legend>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={
                                                    candidateFormData.location
                                                }
                                                onChange={(e) =>
                                                    setCandidateFormData({
                                                        ...candidateFormData,
                                                        location:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="City, State/Country"
                                            />
                                        </fieldset>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">
                                                Current Title
                                            </legend>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={
                                                    candidateFormData.current_title
                                                }
                                                onChange={(e) =>
                                                    setCandidateFormData({
                                                        ...candidateFormData,
                                                        current_title:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., Senior Software Engineer"
                                            />
                                        </fieldset>

                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">
                                                Current Company
                                            </legend>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={
                                                    candidateFormData.current_company
                                                }
                                                onChange={(e) =>
                                                    setCandidateFormData({
                                                        ...candidateFormData,
                                                        current_company:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., Acme Corp"
                                            />
                                        </fieldset>
                                    </div>

                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">
                                            LinkedIn URL
                                        </legend>
                                        <input
                                            type="url"
                                            className="input w-full"
                                            value={
                                                candidateFormData.linkedin_url
                                            }
                                            onChange={(e) =>
                                                setCandidateFormData({
                                                    ...candidateFormData,
                                                    linkedin_url:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="https://linkedin.com/in/..."
                                        />
                                    </fieldset>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {currentStep === 3 && selectedCandidate && (
                        <div className="space-y-6">
                            {/* Selected Job and Candidate Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="card bg-base-200">
                                    <div className="card-body py-3">
                                        <h4 className="font-semibold mb-2">
                                            <i className="fa-duotone fa-regular fa-briefcase mr-2"></i>
                                            Selected Job
                                        </h4>
                                        <div className="font-semibold text-lg">
                                            {selectedJob?.title}
                                        </div>
                                        {selectedJob?.company_name && (
                                            <div className="text-sm text-base-content/70">
                                                {selectedJob.company_name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card bg-base-200">
                                    <div className="card-body py-3">
                                        <h4 className="font-semibold mb-2">
                                            <i className="fa-duotone fa-regular fa-user mr-2"></i>
                                            Selected Candidate
                                        </h4>
                                        <div className="font-semibold text-lg">
                                            {selectedCandidate.full_name}
                                        </div>
                                        <div className="text-sm text-base-content/70">
                                            {selectedCandidate.email}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pitch */}
                            <MarkdownEditor
                                className="fieldset"
                                label="Your Pitch to Candidate *"
                                value={pitch}
                                onChange={setPitch}
                                placeholder="Why is this role a great fit? This message will be included in the email notification to the candidate..."
                                helperText={`Explain why you think ${selectedCandidate.full_name} should consider this role. Be specific about how it matches their skills and career goals.`}
                                height={220}
                                maxLength={500}
                                showCount
                            />

                            {/* Document Selection/Upload */}
                            {candidateMode === "select" &&
                                candidateDocuments.length > 0 && (
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">
                                            Select Documents from Candidate
                                            Profile
                                        </legend>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {candidateDocuments.map((doc) => (
                                                <label
                                                    key={doc.id}
                                                    className="cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox checkbox-primary mr-2"
                                                        checked={selectedDocIds.has(
                                                            doc.id,
                                                        )}
                                                        onChange={(e) => {
                                                            const newSelected =
                                                                new Set(
                                                                    selectedDocIds,
                                                                );
                                                            if (
                                                                e.target.checked
                                                            ) {
                                                                newSelected.add(
                                                                    doc.id,
                                                                );
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
                                                    <span className="text-sm">
                                                        {doc.filename}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                )}

                            {/* Resume Upload */}
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    {candidateMode === "new"
                                        ? "Resume (Optional)"
                                        : "Additional Resume (Optional)"}
                                    <span className="text-base-content/60 font-normal text-sm ml-2">
                                        PDF, DOC, DOCX, or TXT - Max 10MB
                                    </span>
                                </legend>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="file-input w-full"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={handleFileChange}
                                />
                                {resumeFile && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-file text-primary"></i>
                                        <span className="text-sm">
                                            {resumeFile.name}
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={() => {
                                                setResumeFile(null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value =
                                                        "";
                                                }
                                            }}
                                        >
                                            <i className="fa-duotone fa-regular fa-times"></i>
                                        </button>
                                    </div>
                                )}
                            </fieldset>
                        </div>
                    )}

                    {/* Step 4: Review and Submit */}
                    {currentStep === 4 && selectedJob && selectedCandidate && (
                        <div className="space-y-6">
                            <div className="alert alert-info">
                                <i className="fa-duotone fa-regular fa-info-circle"></i>
                                <span>
                                    Review the details below.{" "}
                                    {selectedCandidate.full_name} will receive
                                    an email notification and must approve this
                                    opportunity before it proceeds.
                                </span>
                            </div>

                            {/* Job Summary */}
                            <div className="card bg-base-200">
                                <div className="card-body">
                                    <h4 className="font-semibold mb-2">
                                        <i className="fa-duotone fa-regular fa-briefcase mr-2"></i>
                                        Job
                                    </h4>
                                    <div className="text-lg font-semibold">
                                        {selectedJob.title}
                                    </div>
                                    {selectedJob.company_name && (
                                        <div className="text-sm text-base-content/70">
                                            <i className="fa-duotone fa-regular fa-building mr-1"></i>
                                            {selectedJob.company_name}
                                        </div>
                                    )}
                                    {selectedJob.location && (
                                        <div className="text-sm text-base-content/70">
                                            <i className="fa-duotone fa-regular fa-map-marker-alt mr-1"></i>
                                            {selectedJob.location}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Candidate Summary */}
                            <div className="card bg-base-200">
                                <div className="card-body">
                                    <h4 className="font-semibold mb-2">
                                        <i className="fa-duotone fa-regular fa-user mr-2"></i>
                                        Candidate
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="text-lg font-semibold">
                                            {selectedCandidate.full_name}
                                        </div>
                                        <div className="text-sm text-base-content/70">
                                            {selectedCandidate.email}
                                        </div>
                                        {(selectedCandidate.current_title ||
                                            selectedCandidate.current_company) && (
                                            <div className="text-sm text-base-content/70">
                                                {
                                                    selectedCandidate.current_title
                                                }
                                                {selectedCandidate.current_title &&
                                                    selectedCandidate.current_company &&
                                                    " • "}
                                                {
                                                    selectedCandidate.current_company
                                                }
                                            </div>
                                        )}
                                        {selectedCandidate.location && (
                                            <div className="text-sm text-base-content/70">
                                                <i className="fa-duotone fa-regular fa-map-marker-alt mr-1"></i>
                                                {selectedCandidate.location}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Pitch Preview */}
                            <div className="card bg-base-200">
                                <div className="card-body">
                                    <h4 className="font-semibold mb-2">
                                        <i className="fa-duotone fa-regular fa-message mr-2"></i>
                                        Your Pitch
                                    </h4>
                                    <div className="prose prose-sm max-w-none">
                                        <MarkdownRenderer content={pitch} />
                                    </div>
                                </div>
                            </div>

                            {/* Documents Summary */}
                            {(selectedDocIds.size > 0 || resumeFile) && (
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h4 className="font-semibold mb-2">
                                            <i className="fa-duotone fa-regular fa-file mr-2"></i>
                                            Documents
                                        </h4>
                                        <div className="space-y-1">
                                            {resumeFile && (
                                                <div className="text-sm">
                                                    📄 {resumeFile.name} (new
                                                    upload)
                                                </div>
                                            )}
                                            {Array.from(selectedDocIds).map(
                                                (docId) => {
                                                    const doc =
                                                        candidateDocuments.find(
                                                            (d) =>
                                                                d.id === docId,
                                                        );
                                                    return (
                                                        doc && (
                                                            <div
                                                                key={docId}
                                                                className="text-sm"
                                                            >
                                                                📄{" "}
                                                                {doc.filename}
                                                            </div>
                                                        )
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-base-300">
                    <button
                        className="btn btn-ghost"
                        onClick={currentStep === 1 ? onClose : handleBack}
                        disabled={submitting}
                    >
                        {currentStep === 1 ? "Cancel" : "Back"}
                    </button>

                    <div className="flex gap-2">
                        {currentStep < 4 ? (
                            <button
                                className="btn btn-primary"
                                onClick={handleNext}
                                disabled={!canProceed() || submitting}
                            >
                                Next
                                <i className="fa-duotone fa-regular fa-chevron-right"></i>
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={!canProceed() || submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                        Submit Candidate
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
