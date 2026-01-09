'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import ScreenForm from './screen-form';
import Link from 'next/link';

interface ProposalScreenClientProps {
    proposalId: string;
    initialProposal: any;
}

export default function ProposalScreenClient({
    proposalId,
    initialProposal,
}: ProposalScreenClientProps) {
    const router = useRouter();
    const { getToken } = useAuth();

    // Primary data (loaded immediately)
    const [proposal, setProposal] = useState(initialProposal);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Secondary data (loaded async)
    const [job, setJob] = useState<any>(null);
    const [jobLoading, setJobLoading] = useState(true);
    const [jobError, setJobError] = useState<string | null>(null);

    const [candidate, setCandidate] = useState<any>(null);
    const [candidateLoading, setCandidateLoading] = useState(true);
    const [candidateError, setCandidateError] = useState<string | null>(null);

    const [documents, setDocuments] = useState<any[]>([]);
    const [documentsLoading, setDocumentsLoading] = useState(true);

    // Verify proposal is still pending
    const isPending = proposal?.status === 'pending' || proposal?.status === 'proposed';

    // Load job details
    useEffect(() => {
        async function loadJob() {
            if (!proposal?.job_id) {
                setJobError('Job information is missing from the proposal');
                setJobLoading(false);
                return;
            }

            try {
                const token = await getToken();
                if (!token) throw new Error('Not authenticated');

                const client = createAuthenticatedClient(token);
                const response: any = await client.get(`/jobs/${proposal.job_id}`);
                const jobData = response.data || response;
                setJob(jobData.job || jobData);
                setJobLoading(false);
            } catch (err: any) {
                console.error('Error loading job:', err);
                setJobError('Could not load job details');
                setJobLoading(false);
            }
        }

        if (proposal) loadJob();
    }, [proposal, getToken]);

    // Load candidate details
    useEffect(() => {
        async function loadCandidate() {
            // Use candidate.id from enriched proposal
            const candidateId = proposal?.candidate?.id;

            if (!candidateId) {
                setCandidateError('Candidate information is missing from the proposal');
                setCandidateLoading(false);
                return;
            }

            try {
                const token = await getToken();
                if (!token) throw new Error('Not authenticated');

                const client = createAuthenticatedClient(token);
                const response: any = await client.get(`/candidates/${candidateId}`);
                const candidateData = response.data || response;
                setCandidate(candidateData.candidate || candidateData);
                setCandidateLoading(false);
            } catch (err: any) {
                console.error('Error loading candidate:', err);
                setCandidateError('Could not load full candidate details');
                setCandidateLoading(false);
            }
        }

        if (proposal) loadCandidate();
    }, [proposal, getToken]);

    // Load application documents (not candidate documents)
    useEffect(() => {
        async function loadDocuments() {
            // Use the proposal/application ID to get application-specific documents
            if (!proposal?.id) {
                setDocumentsLoading(false);
                return;
            }

            try {
                const token = await getToken();
                if (!token) throw new Error('Not authenticated');

                const client = createAuthenticatedClient(token);
                // Get documents for this specific application, not the candidate's general documents
                const response: any = await client.get(`/documents?entity_type=application&entity_id=${proposal.id}`);
                const docsData = response.data || response || [];
                setDocuments(Array.isArray(docsData) ? docsData : []);
                setDocumentsLoading(false);
            } catch (err: any) {
                console.warn('Could not load application documents:', err);
                setDocumentsLoading(false);
            }
        }

        if (proposal) loadDocuments();
    }, [proposal, getToken]);

    // Check proposal status validity
    useEffect(() => {
        if (proposal && !isPending && proposal.status) {
            setError(`This proposal has already been ${proposal.status}`);
        }
    }, [proposal, isPending]);

    if (error) {
        return (
            <div className="space-y-6">
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <div className="alert alert-error">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                        <div className="card-actions justify-start mt-4">
                            <Link href="/proposals" className="btn">
                                <i className="fa-duotone fa-regular fa-arrow-left"></i>
                                Back to Proposals
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading || !proposal) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-base-content/60">Loading proposal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-base-content/60">
                <Link href="/proposals" className="hover:text-primary">
                    <i className="fa-duotone fa-regular fa-arrow-left mr-2"></i>
                    Proposals
                </Link>
            </div>

            {/* Page Header */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h1 className="text-3xl font-bold">
                        <i className="fa-duotone fa-regular fa-user-check text-primary mr-3"></i>
                        Screen Candidate Proposal
                    </h1>
                    <p className="text-base-content/70">
                        Review the candidate and role details before accepting or declining this proposal
                    </p>
                </div>
            </div>

            {/* Show loading/error states for async data */}
            {(jobLoading || candidateLoading) && (
                <div className="alert alert-info">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Loading additional details...</span>
                </div>
            )}

            {(jobError || candidateError) && (
                <div className="alert alert-warning">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                    <div>
                        {jobError && <div>{jobError}</div>}
                        {candidateError && <div>{candidateError}</div>}
                        <div className="text-sm mt-1">You can still proceed with the information available.</div>
                    </div>
                </div>
            )}

            <ScreenForm
                proposal={proposal}
                job={job || {}}
                candidate={candidate || {}}
                documents={documents}
                jobLoading={jobLoading}
                candidateLoading={candidateLoading}
                documentsLoading={documentsLoading}
            />
        </div>
    );
}
