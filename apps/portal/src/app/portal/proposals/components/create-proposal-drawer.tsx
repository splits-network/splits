/**
 * Create Proposal Drawer Component
 * 
 * Drawer interface for recruiters to propose candidates for jobs.
 * Includes job selection, candidate selection, and proposal notes.
 * 
 * @see docs/implementation-plans/proposals-workflow-ui-frontend.md
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ApiClient } from '@/lib/api-client';

interface CreateProposalDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    preselectedJobId?: string;
    preselectedCandidateId?: string;
}

interface Job {
    id: string;
    title: string;
    company_name?: string;
    company?: { name: string };
}

interface Candidate {
    id: string;
    name: string;
    email: string;
}

/**
 * CreateProposalDrawer component for creating new candidate proposals
 */
export default function CreateProposalDrawer({
    isOpen,
    onClose,
    onSuccess,
    preselectedJobId,
    preselectedCandidateId,
}: CreateProposalDrawerProps) {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [jobId, setJobId] = useState(preselectedJobId || '');
    const [candidateId, setCandidateId] = useState(preselectedCandidateId || '');
    const [notes, setNotes] = useState('');

    // Selection lists
    const [jobs, setJobs] = useState<Job[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    // Load jobs and candidates when drawer opens
    useEffect(() => {
        if (isOpen) {
            loadJobs();
            loadCandidates();
        }
    }, [isOpen]);

    // Reset form when drawer opens/closes
    useEffect(() => {
        if (isOpen) {
            setJobId(preselectedJobId || '');
            setCandidateId(preselectedCandidateId || '');
            setNotes('');
            setError(null);
        }
    }, [isOpen, preselectedJobId, preselectedCandidateId]);

    const loadJobs = async () => {
        setLoadingJobs(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = new ApiClient(token);
            const response: any = await client.get('/jobs', {
                params: {
                    limit: 100,
                    status: 'open',
                    sort_by: 'created_at',
                    sort_order: 'desc',
                }
            });

            const jobsData = response?.data?.data || response?.data || [];
            setJobs(jobsData);
        } catch (err) {
            console.error('Failed to load jobs:', err);
        } finally {
            setLoadingJobs(false);
        }
    };

    const loadCandidates = async () => {
        setLoadingCandidates(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = new ApiClient(token);
            const response: any = await client.get('/candidates', {
                params: {
                    limit: 100,
                    sort_by: 'created_at',
                    sort_order: 'desc',
                }
            });

            const candidatesData = response?.data?.data || response?.data || [];
            setCandidates(candidatesData);
        } catch (err) {
            console.error('Failed to load candidates:', err);
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!jobId || !candidateId) {
            setError('Please select both a job and a candidate');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = new ApiClient(token);

            // Get current user's recruiter ID
            const userResponse: any = await client.get('/users/me');
            const userData = userResponse?.data?.data?.[0] || userResponse?.data?.[0];
            const recruiterId = userData?.recruiter_id;

            if (!recruiterId) {
                throw new Error('Recruiter profile not found');
            }

            // Create proposal
            await client.post('/proposals', {
                recruiter_id: recruiterId,
                job_id: jobId,
                candidate_id: candidateId,
                proposal_notes: notes || undefined,
            });

            // Success
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Failed to create proposal:', err);
            setError(err?.message || 'Failed to create proposal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="drawer drawer-end">
            <input type="checkbox" className="drawer-toggle" checked={isOpen} readOnly />
            <div className="drawer-side z-50">
                <label className="drawer-overlay" onClick={onClose}></label>
                <div className="menu p-6 w-full max-w-lg h-full bg-base-100 text-base-content">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">New Proposal</h2>
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-circle btn-ghost"
                            disabled={loading}
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-xl"></i>
                        </button>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Info Alert */}
                    <div className="alert alert-info mb-6">
                        <i className="fa-duotone fa-regular fa-circle-info"></i>
                        <div className="text-sm">
                            <p className="font-medium">72-Hour Response Window</p>
                            <p className="opacity-80">
                                Company users will have 72 hours to accept or decline this proposal.
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
                        {/* Job Selection */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Job *</legend>
                            <select
                                className="select w-full"
                                value={jobId}
                                onChange={(e) => setJobId(e.target.value)}
                                disabled={loading || loadingJobs || !!preselectedJobId}
                                required
                            >
                                <option value="">
                                    {loadingJobs ? 'Loading jobs...' : 'Select a job'}
                                </option>
                                {jobs.map((job) => {
                                    const companyName = job.company_name || job.company?.name;
                                    return (
                                        <option key={job.id} value={job.id}>
                                            {job.title}
                                            {companyName && ` - ${companyName}`}
                                        </option>
                                    );
                                })}
                            </select>
                            <p className="fieldset-label">
                                Select the job opportunity for this proposal
                            </p>
                        </fieldset>

                        {/* Candidate Selection */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Candidate *</legend>
                            <select
                                className="select w-full"
                                value={candidateId}
                                onChange={(e) => setCandidateId(e.target.value)}
                                disabled={loading || loadingCandidates || !!preselectedCandidateId}
                                required
                            >
                                <option value="">
                                    {loadingCandidates ? 'Loading candidates...' : 'Select a candidate'}
                                </option>
                                {candidates.map((candidate) => (
                                    <option key={candidate.id} value={candidate.id}>
                                        {candidate.name} ({candidate.email})
                                    </option>
                                ))}
                            </select>
                            <p className="fieldset-label">
                                Select the candidate to propose for this role
                            </p>
                        </fieldset>

                        {/* Notes */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Proposal Notes (Optional)</legend>
                            <textarea
                                className="textarea w-full h-32"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes or context about why this candidate is a good fit..."
                                disabled={loading}
                            />
                            <p className="fieldset-label">
                                Explain why this candidate is a good fit for the role
                            </p>
                        </fieldset>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-ghost flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary flex-1"
                                disabled={loading || !jobId || !candidateId}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                        Submit Proposal
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
