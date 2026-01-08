'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

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
    onSubmit: (jobId: string, notes: string, documentIds: string[]) => Promise<void>;
}

export default function SubmitToJobWizard({
    candidateId,
    candidateName,
    onClose,
    onSubmit,
}: SubmitToJobWizardProps) {
    const { getToken } = useAuth();

    // Wizard state
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [notes, setNotes] = useState('');
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Job selection state
    const [jobs, setJobs] = useState<Job[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 25;

    // Step 2: Documents state
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);

    // Debounce search query (300ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to first page when search changes
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [statusFilter, debouncedSearch]);

    // Load jobs with server-side filtering, search, and pagination
    useEffect(() => {
        if (currentStep !== 1) return;

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
                    status: statusFilter === 'all' ? undefined : statusFilter,
                    search: debouncedSearch || undefined,
                    sort_by: 'created_at',
                    sort_order: 'desc',
                };

                const response = await client.get('/jobs', { params });

                if (response.data?.data) {
                    setJobs(response.data);
                    if (response.data.pagination) {
                        setTotalPages(response.data.pagination.total_pages || 1);
                        setTotalCount(response.data.pagination.total || 0);
                    }
                } else if (Array.isArray(response.data)) {
                    // Handle direct array response (no wrapper)
                    setJobs(response.data);
                    setTotalPages(1);
                    setTotalCount(response.data.length);
                } else {
                    setJobs([]);
                    setTotalPages(1);
                    setTotalCount(0);
                }
            } catch (err: any) {
                console.error('Failed to load jobs:', err);
                setError('Failed to load jobs. Please try again.');
            } finally {
                setJobsLoading(false);
            }
        }

        loadJobs();
    }, [currentStep, page, statusFilter, debouncedSearch, getToken]);

    // Load documents when moving to Step 2
    useEffect(() => {
        if (currentStep !== 2 || length > 0) return;

        async function loadDocuments() {
            try {
                setDocumentsLoading(true);

                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);

                const response = await client.get(`/documents/entity/candidate/${candidateId}`);
                if (response.data) {
                    setDocuments(response.data);
                }
            } catch (err) {
                console.error('Failed to load documents:', err);
            } finally {
                setDocumentsLoading(false);
            }
        }

        loadDocuments();
    }, [currentStep, candidateId, getToken, length]);

    const toggleDocument = (docId: string) => {
        const newSet = new Set(selectedDocIds);
        if (newSet.has(docId)) {
            newSet.delete(docId);
        } else {
            newSet.add(docId);
        }
        setSelectedDocIds(newSet);
    };

    const handleNext = () => {
        if (currentStep === 1 && !selectedJob) {
            setError('Please select a job to continue');
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
            setError(err.message || 'Failed to submit candidate');
            setSubmitting(false);
        }
    };

    const formatSalary = (min?: number, max?: number) => {
        if (!min && !max) return 'Not specified';
        if (!max) return `$${min?.toLocaleString()}+`;
        if (!min) return `Up to $${max?.toLocaleString()}`;
        return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-2xl">Send Job Opportunity to {candidateName}</h3>
                        <p className="text-sm text-base-content/70 mt-1">
                            Step {currentStep} of 3 • Candidate will review and approve
                        </p>
                    </div>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Progress Steps */}
                <ul className="steps steps-horizontal w-full mb-6">
                    <li className={`step ${currentStep >= 1 ? 'step-primary' : ''}`}>
                        Select Job
                    </li>
                    <li className={`step ${currentStep >= 2 ? 'step-primary' : ''}`}>
                        Details
                    </li>
                    <li className={`step ${currentStep >= 3 ? 'step-primary' : ''}`}>
                        Review
                    </li>
                </ul>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Step 1: Job Selection */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            {/* Search and Filter */}
                            <div className="card bg-base-200">
                                <div className="card-body py-4">
                                    <div className="flex gap-4 items-end">
                                        <fieldset className="fieldset flex-1">
                                            <legend className="fieldset-legend">Search Jobs</legend>
                                            <input
                                                type="text"
                                                placeholder="Search by title, company, location..."
                                                className="input w-full"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            <p className="fieldset-label text-base-content/50">
                                                {jobsLoading && debouncedSearch ? (
                                                    <>
                                                        <span className="loading loading-spinner loading-xs mr-1"></span>
                                                        Searching...
                                                    </>
                                                ) : (
                                                    'Search updates as you type'
                                                )}
                                            </p>
                                        </fieldset>
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">Status</legend>
                                            <select
                                                className="select w-full"
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                            >
                                                <option value="all">All Statuses</option>
                                                <option value="active">Active</option>
                                                <option value="paused">Paused</option>
                                                <option value="filled">Filled</option>
                                                <option value="closed">Closed</option>
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
                                    <i className="fa-solid fa-info-circle"></i>
                                    <span>
                                        {debouncedSearch
                                            ? `No jobs found matching "${debouncedSearch}". Try a different search term.`
                                            : 'No jobs found. Try adjusting your filters.'}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    {debouncedSearch && (
                                        <div className="text-sm text-base-content/70 mb-2">
                                            Found {totalCount} job{totalCount !== 1 ? 's' : ''} matching "{debouncedSearch}"
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
                                                    <th>Salary Range</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {jobs.map((job) => (
                                                    <tr
                                                        key={job.id}
                                                        className={`cursor-pointer hover:bg-base-200 ${selectedJob?.id === job.id ? 'bg-primary/10' : ''
                                                            }`}
                                                        onClick={() => setSelectedJob(job)}
                                                    >
                                                        <td>
                                                            <input
                                                                type="radio"
                                                                className="radio radio-primary"
                                                                checked={selectedJob?.id === job.id}
                                                                onChange={() => setSelectedJob(job)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="font-semibold">{job.title}</div>
                                                        </td>
                                                        <td>
                                                            <div className="flex items-center gap-2">
                                                                <i className="fa-solid fa-building text-base-content/50"></i>
                                                                {job.company_name || `Company ${job.company_id.substring(0, 8)}`}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {job.location ? (
                                                                <div className="flex items-center gap-2">
                                                                    <i className="fa-solid fa-location-dot text-base-content/50"></i>
                                                                    {job.location}
                                                                </div>
                                                            ) : (
                                                                <span className="text-base-content/50">Not specified</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="text-sm">
                                                                {formatSalary(job.salary_min, job.salary_max)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div
                                                                className={`badge badge-sm ${job.status === 'active' || job.status === 'open'
                                                                    ? 'badge-success'
                                                                    : job.status === 'paused'
                                                                        ? 'badge-warning'
                                                                        : 'badge-neutral'
                                                                    }`}
                                                            >
                                                                {job.status}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="text-sm text-base-content/70">
                                                Showing page {page} of {totalPages} ({totalCount} total jobs)
                                            </div>
                                            <div className="join">
                                                <button
                                                    className="join-item btn btn-sm"
                                                    onClick={() => setPage(Math.max(1, page - 1))}
                                                    disabled={page === 1}
                                                >
                                                    <i className="fa-solid fa-chevron-left"></i>
                                                </button>
                                                <button className="join-item btn btn-sm">
                                                    Page {page}
                                                </button>
                                                <button
                                                    className="join-item btn btn-sm"
                                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                                    disabled={page === totalPages}
                                                >
                                                    <i className="fa-solid fa-chevron-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 2: Submission Details */}
                    {currentStep === 2 && selectedJob && (
                        <div className="space-y-6">
                            {/* Selected Job Summary */}
                            <div className="alert alert-info">
                                <i className="fa-solid fa-briefcase"></i>
                                <div>
                                    <div className="font-semibold">{selectedJob.title}</div>
                                    <div className="text-sm">
                                        {selectedJob.company_name || `Company ${selectedJob.company_id.substring(0, 8)}`}
                                        {selectedJob.location && ` • ${selectedJob.location}`}
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Your Pitch to Candidate (Optional)</legend>
                                <textarea
                                    className="textarea h-48 w-full"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Why is this opportunity a great fit? This message will be included in the email notification to the candidate..."
                                />
                                <p className="fieldset-label">
                                    Explain why you think {candidateName} should consider this role. Be specific about how it matches their skills and career goals.
                                </p>
                            </fieldset>

                            {/* Document Selection */}
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Attach Documents (Optional)</legend>
                                {documentsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <span className="loading loading-spinner"></span>
                                    </div>
                                ) : length === 0 ? (
                                    <div className="alert">
                                        <i className="fa-solid fa-info-circle"></i>
                                        <span>No documents available for this candidate.</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto border border-base-300 rounded-lg p-3">
                                        {documents.map((doc) => (
                                            <label
                                                key={doc.id}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-sm"
                                                    checked={selectedDocIds.has(doc.id)}
                                                    onChange={() => toggleDocument(doc.id)}
                                                />
                                                <i
                                                    className={`fa-solid ${doc.file_type === 'application/pdf'
                                                        ? 'fa-file-pdf text-error'
                                                        : doc.file_type?.startsWith('image/')
                                                            ? 'fa-file-image text-info'
                                                            : 'fa-file text-base-content/70'
                                                        }`}
                                                ></i>
                                                <span className="text-sm">{doc.filename}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                <p className="fieldset-label">{selectedDocIds.size} document(s) selected</p>
                            </fieldset>
                        </div>
                    )}

                    {/* Step 3: Review and Submit */}
                    {currentStep === 3 && selectedJob && (
                        <div className="space-y-6">
                            <div className="alert alert-info">
                                <i className="fa-solid fa-info-circle"></i>
                                <span>Review the details below. {candidateName} will receive an email notification and must approve this opportunity before it proceeds.</span>
                            </div>

                            {/* Candidate Summary */}
                            <div className="card bg-base-200">
                                <div className="card-body">
                                    <h4 className="font-semibold mb-2">
                                        <i className="fa-solid fa-user mr-2"></i>
                                        Candidate
                                    </h4>
                                    <div className="text-lg">{candidateName}</div>
                                </div>
                            </div>

                            {/* Job Summary */}
                            <div className="card bg-base-200">
                                <div className="card-body">
                                    <h4 className="font-semibold mb-2">
                                        <i className="fa-solid fa-briefcase mr-2"></i>
                                        Job
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="text-lg font-semibold">{selectedJob.title}</div>
                                        <div className="flex items-center gap-4 text-sm text-base-content/70">
                                            <span className="flex items-center gap-1">
                                                <i className="fa-solid fa-building"></i>
                                                {selectedJob.company_name || `Company ${selectedJob.company_id.substring(0, 8)}`}
                                            </span>
                                            {selectedJob.location && (
                                                <span className="flex items-center gap-1">
                                                    <i className="fa-solid fa-location-dot"></i>
                                                    {selectedJob.location}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <i className="fa-solid fa-money-bill"></i>
                                                {formatSalary(selectedJob.salary_min, selectedJob.salary_max)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {notes && (
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h4 className="font-semibold mb-2">
                                            <i className="fa-solid fa-message mr-2"></i>
                                            Your Pitch
                                        </h4>
                                        <div className="whitespace-pre-wrap text-sm">{notes}</div>
                                    </div>
                                </div>
                            )}

                            {/* Documents */}
                            {selectedDocIds.size > 0 && (
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h4 className="font-semibold mb-2">
                                            <i className="fa-solid fa-paperclip mr-2"></i>
                                            Attached Documents ({selectedDocIds.size})
                                        </h4>
                                        <ul className="space-y-1">
                                            {documents
                                                .filter((doc) => selectedDocIds.has(doc.id))
                                                .map((doc) => (
                                                    <li key={doc.id} className="flex items-center gap-2 text-sm">
                                                        <i
                                                            className={`fa-solid ${doc.file_type === 'application/pdf'
                                                                ? 'fa-file-pdf text-error'
                                                                : doc.file_type?.startsWith('image/')
                                                                    ? 'fa-file-image text-info'
                                                                    : 'fa-file text-base-content/70'
                                                                }`}
                                                        ></i>
                                                        {doc.filename}
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-base-300">
                    <button onClick={onClose} className="btn btn-ghost">
                        Cancel
                    </button>
                    <div className="flex gap-2">
                        {currentStep > 1 && (
                            <button onClick={handleBack} className="btn" disabled={submitting}>
                                <i className="fa-solid fa-chevron-left"></i>
                                Back
                            </button>
                        )}
                        {currentStep < 3 ? (
                            <button onClick={handleNext} className="btn btn-primary" disabled={!selectedJob}>
                                Next
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className="btn btn-primary" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-paper-plane"></i>
                                        Send to Candidate
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
