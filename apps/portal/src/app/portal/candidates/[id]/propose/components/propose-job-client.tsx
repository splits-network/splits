'use client';

import { useState, useEffect, FormEvent } from 'react';
import { MarkdownEditor } from '@splits-network/shared-ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface ProposeJobClientProps {
    candidateId: string;
}

export default function ProposeJobClient({ candidateId }: ProposeJobClientProps) {
    const { getToken } = useAuth();
    const router = useRouter();

    // Candidate info
    const [candidate, setCandidate] = useState<any>(null);
    const [candidateLoading, setCandidateLoading] = useState(true);
    const [candidateError, setCandidateError] = useState<string | null>(null);

    // Available jobs for recruiter
    const [jobs, setJobs] = useState<any[]>([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [jobsError, setJobsError] = useState<string | null>(null);

    // Form state
    const [selectedJobId, setSelectedJobId] = useState('');
    const [pitch, setPitch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Validation errors
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Load candidate details
    useEffect(() => {
        async function loadCandidate() {
            try {
                setCandidateLoading(true);
                setCandidateError(null);

                const token = await getToken();
                if (!token) {
                    setCandidateError('Not authenticated');
                    return;
                }

                const client = createAuthenticatedClient(token);
                const response = await client.get(`/candidates/${candidateId}`);
                setCandidate(response.data);
            } catch (err: any) {
                console.error('Failed to load candidate:', err);
                setCandidateError(err.message || 'Failed to load candidate');
            } finally {
                setCandidateLoading(false);
            }
        }

        loadCandidate();
    }, [candidateId, getToken]);

    // Load recruiter's active jobs
    useEffect(() => {
        async function loadJobs() {
            try {
                setJobsLoading(true);
                setJobsError(null);

                const token = await getToken();
                if (!token) {
                    setJobsError('Not authenticated');
                    return;
                }

                const client = createAuthenticatedClient(token);

                // Fetch jobs assigned to this recruiter with status=open
                const response = await client.get('/jobs', {
                    params: {
                        filters: {
                            status: 'open'
                        },
                        include: 'company',
                        limit: 100
                    }
                });

                setJobs(response.data || []);
            } catch (err: any) {
                console.error('Failed to load jobs:', err);
                setJobsError(err.message || 'Failed to load available jobs');
            } finally {
                setJobsLoading(false);
            }
        }

        loadJobs();
    }, [getToken]);

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!selectedJobId) {
            errors.job = 'Please select a job to propose';
        }

        if (pitch && pitch.length > 500) {
            errors.pitch = 'Pitch must be 500 characters or less';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            const token = await getToken();
            if (!token) {
                setSubmitError('Not authenticated');
                return;
            }

            const client = createAuthenticatedClient(token);

            // Call propose endpoint
            await client.post('/applications/propose', {
                candidate_id: candidateId,
                job_id: selectedJobId,
                pitch: pitch || undefined
            });

            // Success - redirect to candidate detail page
            router.push(`/portal/candidates/${candidateId}?proposed=true`);
        } catch (err: any) {
            console.error('Failed to propose job:', err);
            setSubmitError(err.message || 'Failed to send proposal. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (candidateLoading || jobsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    // Error state
    if (candidateError || jobsError) {
        return (
            <div className="space-y-4">
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{candidateError || jobsError}</span>
                </div>
                <Link href={`/portal/candidates/${candidateId}`} className="btn">
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                    Back to Candidate
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="text-sm breadcrumbs">
                <ul>
                    <li><Link href="/portal/candidates">Candidates</Link></li>
                    <li><Link href={`/portal/candidates/${candidateId}`}>{candidate?.name || 'Candidate'}</Link></li>
                    <li>Propose Job</li>
                </ul>
            </div>

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold">Propose Job to {candidate?.name}</h1>
                <p className="text-base-content/60 mt-2">
                    Select a job from your open roles to propose to this candidate. You can include a personalized pitch to explain why this opportunity is a great fit.
                </p>
            </div>

            {/* No jobs available */}
            {jobs.length === 0 && (
                <div className="alert alert-warning">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                    <div>
                        <div className="font-semibold">No Open Jobs Available</div>
                        <div className="text-sm mt-1">
                            You don't have any open jobs to propose. Create or activate a job first.
                        </div>
                    </div>
                </div>
            )}

            {/* Proposal Form */}
            {jobs.length > 0 && (
                <form onSubmit={handleSubmit} className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title">Proposal Details</h2>

                        {/* Submit Error */}
                        {submitError && (
                            <div className="alert alert-error">
                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                <span>{submitError}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Job Selection */}
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Select Job *</legend>
                                <select
                                    className={`select w-full ${validationErrors.job ? 'select-error' : ''}`}
                                    value={selectedJobId}
                                    onChange={(e) => {
                                        setSelectedJobId(e.target.value);
                                        setValidationErrors({ ...validationErrors, job: '' });
                                    }}
                                    required
                                >
                                    <option value="">Choose a job...</option>
                                    {jobs.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            {job.title} at {job.company?.name || 'Unknown Company'}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors.job && (
                                    <p className="fieldset-label text-error">{validationErrors.job}</p>
                                )}
                            </fieldset>

                            {/* Pitch (Optional) */}
                            <MarkdownEditor
                                className="fieldset"
                                label="Your Pitch (Optional)"
                                value={pitch}
                                onChange={(value) => {
                                    setPitch(value);
                                    if (value.length <= 500) {
                                        setValidationErrors({ ...validationErrors, pitch: '' });
                                    }
                                }}
                                placeholder="Explain why this candidate would be a great fit for this role..."
                                maxLength={500}
                                showCount
                                height={180}
                                preview="edit"
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="card-actions justify-end mt-6">
                            <Link
                                href={`/portal/candidates/${candidateId}`}
                                className="btn"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Sending Proposal...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                        Send Proposal
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Help Text */}
            <div className="alert alert-info">
                <i className="fa-duotone fa-regular fa-circle-info"></i>
                <div>
                    <div className="font-semibold">How Proposals Work</div>
                    <div className="text-sm mt-1">
                        The candidate will receive an email notification with details about the job opportunity.
                        They can accept or decline the proposal within 7 days.
                    </div>
                </div>
            </div>
        </div>
    );
}
