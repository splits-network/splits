'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface SubmitCandidateWizardProps {
    roleId: string;
    roleTitle: string;
    companyName?: string;
    onClose: () => void;
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

export default function SubmitCandidateWizard({
    roleId,
    roleTitle,
    companyName,
    onClose,
}: SubmitCandidateWizardProps) {
    const { getToken } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Wizard state
    const [currentStep, setCurrentStep] = useState(1);
    const [mode, setMode] = useState<'select' | 'new'>('select');
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [pitch, setPitch] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Candidate selection/creation state
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 25;

    // New candidate form data
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        location: '',
        current_title: '',
        current_company: '',
        linkedin_url: '',
    });

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
    }, [debouncedSearch]);

    // Load candidates with server-side search and pagination
    useEffect(() => {
        if (currentStep !== 1 || mode !== 'select') return;

        async function loadCandidates() {
            try {
                setCandidatesLoading(true);
                setError(null);

                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);

                const params: any = {
                    page,
                    limit,
                    search: debouncedSearch || undefined,
                    sort_by: 'created_at',
                    sort_order: 'desc',
                };

                const response = await client.get('/candidates', { params });

                if (response.data?.data) {
                    setCandidates(response.data.data);
                    if (response.data.pagination) {
                        setTotalPages(response.data.pagination.total_pages || 1);
                        setTotalCount(response.data.pagination.total || 0);
                    }
                } else if (Array.isArray(response.data)) {
                    setCandidates(response.data);
                    setTotalPages(1);
                    setTotalCount(response.data.length);
                } else {
                    setCandidates([]);
                    setTotalPages(1);
                    setTotalCount(0);
                }

                // If no candidates exist, default to new mode
                if ((response.data?.data || response.data)?.length === 0 && !debouncedSearch) {
                    setMode('new');
                }
            } catch (err: any) {
                console.error('Failed to load candidates:', err);
                setError('Failed to load candidates. Please try again.');
            } finally {
                setCandidatesLoading(false);
            }
        }

        loadCandidates();
    }, [currentStep, mode, page, debouncedSearch, getToken]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
            ];
            if (!allowedTypes.includes(file.type)) {
                setError('Please upload a PDF, DOC, DOCX, or TXT file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setResumeFile(file);
            setError(null);
        }
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (mode === 'select' && !selectedCandidate) {
                setError('Please select a candidate to continue');
                return;
            }
            if (mode === 'new') {
                // Validate new candidate form
                if (!formData.full_name.trim() || !formData.email.trim()) {
                    setError('Please provide candidate name and email');
                    return;
                }
                // Create temporary candidate object
                setSelectedCandidate({
                    id: 'new',
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    location: formData.location,
                    current_title: formData.current_title,
                    current_company: formData.current_company,
                    linkedin_url: formData.linkedin_url,
                });
            }
        }
        if (currentStep === 2 && !pitch.trim()) {
            setError('Please provide a pitch for this opportunity');
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
        if (!selectedCandidate) return;

        try {
            setSubmitting(true);
            setError(null);

            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);

            let candidateId: string | undefined;
            let applicationId: string | undefined;

            // Step 1: Create or use existing candidate
            if (mode === 'select' && selectedCandidate.id !== 'new') {
                // Use existing candidate
                candidateId = selectedCandidate.id;

                const applicationResponse: any = await client.post('/applications', {
                    job_id: roleId,
                    candidate_id: candidateId,
                    full_name: selectedCandidate.full_name,
                    email: selectedCandidate.email,
                });

                applicationId =
                    applicationResponse.data?.id ||
                    applicationResponse.data?.application?.id ||
                    applicationResponse.id;
            } else {
                // Create new candidate
                const createResponse: any = await client.submitCandidate({
                    job_id: roleId,
                    ...formData,
                });

                candidateId =
                    createResponse.data?.candidate?.id ||
                    createResponse.candidate?.id;
                applicationId =
                    createResponse.data?.application?.id ||
                    createResponse.data?.id ||
                    createResponse.application?.id;

                if (!applicationId && candidateId) {
                    const applicationResponse: any = await client.post('/applications', {
                        job_id: roleId,
                        candidate_id: candidateId,
                        stage: 'recruiter_proposed',
                        recruiter_pitch: pitch.trim(),
                    });

                    applicationId =
                        applicationResponse.data?.id ||
                        applicationResponse.data?.application?.id ||
                        applicationResponse.id;
                }
            }

            if (!applicationId) {
                throw new Error('Could not create application for this proposal');
            }

            // Step 2: Set application to recruiter_proposed stage with pitch
            await client.patch(`/applications/${applicationId}/stage`, {
                stage: 'recruiter_proposed',
                notes: pitch.trim(),
            });

            // Step 3: Upload resume if provided
            if (resumeFile && candidateId) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', resumeFile);
                uploadFormData.append('entity_type', 'candidate');
                uploadFormData.append('entity_id', candidateId);
                uploadFormData.append('document_type', 'resume');

                await client.uploadDocument(uploadFormData);
            }

            // Success
            alert(`Opportunity sent to ${selectedCandidate.full_name}! They'll receive an email notification.`);
            onClose();
            window.location.reload();
        } catch (err: any) {
            console.error('Failed to submit candidate:', err);
            setError(err.message || 'Failed to send opportunity to candidate');
            setSubmitting(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-2xl">Submit Candidate to Role</h3>
                        <p className="text-sm text-base-content/70 mt-1">
                            Step {currentStep} of 3 • {roleTitle}
                            {companyName && ` • ${companyName}`}
                        </p>
                    </div>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Progress Steps */}
                <ul className="steps steps-horizontal w-full mb-6">
                    <li className={`step ${currentStep >= 1 ? 'step-primary' : ''}`}>
                        Select Candidate
                    </li>
                    <li className={`step ${currentStep >= 2 ? 'step-primary' : ''}`}>
                        Proposal Details
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
                    {/* Step 1: Candidate Selection/Creation */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            {/* Mode Selection Tabs */}
                            <div className="tabs tabs-boxed bg-base-200">
                                <a
                                    className={`tab ${mode === 'select' ? 'tab-active' : ''}`}
                                    onClick={() => setMode('select')}
                                >
                                    <i className="fa-solid fa-user-check mr-2"></i>
                                    Select Existing
                                </a>
                                <a
                                    className={`tab ${mode === 'new' ? 'tab-active' : ''}`}
                                    onClick={() => setMode('new')}
                                >
                                    <i className="fa-solid fa-user-plus mr-2"></i>
                                    Add New
                                </a>
                            </div>

                            {mode === 'select' ? (
                                <>
                                    {/* Search */}
                                    <div className="card bg-base-200">
                                        <div className="card-body py-4">
                                            <div className="fieldset">
                                                <label className="label">Search Candidates</label>
                                                <input
                                                    type="text"
                                                    placeholder="Search by name, email, title, company..."
                                                    className="input w-full"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                                <label className="label">
                                                    <span className="label-text-alt text-base-content/50">
                                                        {candidatesLoading && debouncedSearch ? (
                                                            <>
                                                                <span className="loading loading-spinner loading-xs mr-1"></span>
                                                                Searching...
                                                            </>
                                                        ) : (
                                                            'Search updates as you type'
                                                        )}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Candidates Table */}
                                    {candidatesLoading ? (
                                        <div className="flex justify-center py-12">
                                            <span className="loading loading-spinner loading-lg"></span>
                                        </div>
                                    ) : candidates.length === 0 ? (
                                        <div className="alert">
                                            <i className="fa-solid fa-info-circle"></i>
                                            <span>
                                                {debouncedSearch
                                                    ? `No candidates found matching "${debouncedSearch}". Try a different search term or add a new candidate.`
                                                    : 'No candidates found. Please add a new candidate.'}
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            {debouncedSearch && (
                                                <div className="text-sm text-base-content/70 mb-2">
                                                    Found {totalCount} candidate{totalCount !== 1 ? 's' : ''} matching "{debouncedSearch}"
                                                </div>
                                            )}
                                            <div className="overflow-x-auto border border-base-300 rounded-lg">
                                                <table className="table table-zebra">
                                                    <thead>
                                                        <tr>
                                                            <th>Select</th>
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
                                                                className={`cursor-pointer hover:bg-base-200 ${selectedCandidate?.id === candidate.id ? 'bg-primary/10' : ''
                                                                    }`}
                                                                onClick={() => setSelectedCandidate(candidate)}
                                                            >
                                                                <td>
                                                                    <input
                                                                        type="radio"
                                                                        className="radio radio-primary"
                                                                        checked={selectedCandidate?.id === candidate.id}
                                                                        onChange={() => setSelectedCandidate(candidate)}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <div className="font-semibold">{candidate.full_name}</div>
                                                                </td>
                                                                <td>{candidate.email}</td>
                                                                <td>
                                                                    {candidate.current_title || candidate.current_company ? (
                                                                        <div className="text-sm">
                                                                            {candidate.current_title}
                                                                            {candidate.current_title && candidate.current_company && ' • '}
                                                                            {candidate.current_company}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-base-content/50">Not specified</span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {candidate.location || (
                                                                        <span className="text-base-content/50">Not specified</span>
                                                                    )}
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
                                                        Showing page {page} of {totalPages} ({totalCount} total candidates)
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
                                </>
                            ) : (
                                /* New Candidate Form */
                                <div className="space-y-4">
                                    <div className="alert alert-info">
                                        <i className="fa-solid fa-info-circle"></i>
                                        <span>This candidate will be added to your database and proposed for this role.</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="fieldset">
                                            <label className="label">Full Name *</label>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div className="fieldset">
                                            <label className="label">Email *</label>
                                            <input
                                                type="email"
                                                className="input w-full"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="fieldset">
                                            <label className="label">Phone</label>
                                            <input
                                                type="tel"
                                                className="input w-full"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>

                                        <div className="fieldset">
                                            <label className="label">Location</label>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="City, State/Country"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="fieldset">
                                            <label className="label">Current Title</label>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={formData.current_title}
                                                onChange={(e) => setFormData({ ...formData, current_title: e.target.value })}
                                                placeholder="e.g., Senior Software Engineer"
                                            />
                                        </div>

                                        <div className="fieldset">
                                            <label className="label">Current Company</label>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={formData.current_company}
                                                onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                                                placeholder="e.g., Acme Corp"
                                            />
                                        </div>
                                    </div>

                                    <div className="fieldset">
                                        <label className="label">LinkedIn URL</label>
                                        <input
                                            type="url"
                                            className="input w-full"
                                            value={formData.linkedin_url}
                                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                            placeholder="https://linkedin.com/in/..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Proposal Details */}
                    {currentStep === 2 && selectedCandidate && (
                        <div className="space-y-6">
                            {/* Selected Candidate Summary */}
                            <div className="alert alert-info">
                                <i className="fa-solid fa-user"></i>
                                <div>
                                    <div className="font-semibold">{selectedCandidate.full_name}</div>
                                    <div className="text-sm">{selectedCandidate.email}</div>
                                </div>
                            </div>

                            {/* Pitch */}
                            <div className="fieldset">
                                <label className="label">Your Pitch to Candidate *</label>
                                <textarea
                                    className="textarea h-48 w-full"
                                    value={pitch}
                                    onChange={(e) => setPitch(e.target.value)}
                                    placeholder="Why is this role a great fit? This message will be included in the email notification to the candidate..."
                                />
                                <label className="label">
                                    <span className="label-text-alt">
                                        Explain why you think {selectedCandidate.full_name} should consider this role. Be specific about how it matches their skills and career goals.
                                    </span>
                                    <span className="label-text-alt">{pitch.length} / 500 characters</span>
                                </label>
                            </div>

                            {/* Resume Upload */}
                            <div className="fieldset">
                                <label className="label">
                                    Resume (Optional)
                                    <span className="label-text-alt text-base-content/60">PDF, DOC, DOCX, or TXT - Max 10MB</span>
                                </label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="file-input w-full"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={handleFileChange}
                                />
                                {resumeFile && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <i className="fa-solid fa-file text-primary"></i>
                                        <span className="text-sm">{resumeFile.name}</span>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={() => {
                                                setResumeFile(null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                        >
                                            <i className="fa-solid fa-times"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review and Submit */}
                    {currentStep === 3 && selectedCandidate && (
                        <div className="space-y-6">
                            <div className="alert alert-info">
                                <i className="fa-solid fa-info-circle"></i>
                                <span>Review the details below. {selectedCandidate.full_name} will receive an email notification and must approve this opportunity before it proceeds.</span>
                            </div>

                            {/* Role Summary */}
                            <div className="card bg-base-200">
                                <div className="card-body">
                                    <h4 className="font-semibold mb-2">
                                        <i className="fa-solid fa-briefcase mr-2"></i>
                                        Role
                                    </h4>
                                    <div className="text-lg font-semibold">{roleTitle}</div>
                                    {companyName && (
                                        <div className="text-sm text-base-content/70">
                                            <i className="fa-solid fa-building mr-1"></i>
                                            {companyName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Candidate Summary */}
                            <div className="card bg-base-200">
                                <div className="card-body">
                                    <h4 className="font-semibold mb-2">
                                        <i className="fa-solid fa-user mr-2"></i>
                                        Candidate
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="text-lg font-semibold">{selectedCandidate.full_name}</div>
                                        <div className="text-sm text-base-content/70">{selectedCandidate.email}</div>
                                        {(selectedCandidate.current_title || selectedCandidate.current_company) && (
                                            <div className="text-sm text-base-content/70">
                                                {selectedCandidate.current_title}
                                                {selectedCandidate.current_title && selectedCandidate.current_company && ' • '}
                                                {selectedCandidate.current_company}
                                            </div>
                                        )}
                                        {selectedCandidate.location && (
                                            <div className="text-sm text-base-content/70">
                                                <i className="fa-solid fa-location-dot mr-1"></i>
                                                {selectedCandidate.location}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Pitch */}
                            {pitch && (
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h4 className="font-semibold mb-2">
                                            <i className="fa-solid fa-message mr-2"></i>
                                            Your Pitch
                                        </h4>
                                        <div className="whitespace-pre-wrap text-sm">{pitch}</div>
                                    </div>
                                </div>
                            )}

                            {/* Resume */}
                            {resumeFile && (
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h4 className="font-semibold mb-2">
                                            <i className="fa-solid fa-file mr-2"></i>
                                            Resume
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm">
                                            <i className="fa-solid fa-file-pdf text-error"></i>
                                            {resumeFile.name}
                                        </div>
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
                            <button
                                onClick={handleNext}
                                className="btn btn-primary"
                                disabled={
                                    (currentStep === 1 && mode === 'select' && !selectedCandidate) ||
                                    (currentStep === 1 && mode === 'new' && (!formData.full_name.trim() || !formData.email.trim()))
                                }
                            >
                                Next
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="btn btn-primary"
                                disabled={submitting}
                            >
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
