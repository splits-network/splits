'use client';

import { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import ApproveGateModal from './approve-gate-modal';
import DenyGateModal from './deny-gate-modal';
import RequestInfoModal from './request-info-modal';
import ProvideInfoModal from './provide-info-modal';
import GateHistoryTimeline from '@/components/gate-history-timeline';

interface CandidateRoleAssignment {
    id: string;
    candidate_id: string;
    job_id: string;
    current_gate: string;
    state: string;
    gate_history: any[];
    created_at: string;
    // Enriched data
    candidate?: {
        id: string;
        name: string;
        email: string;
    };
    job?: {
        id: string;
        title: string;
        company: {
            name: string;
        };
    };
}

interface GateReviewListProps {
    gateType: 'candidate_recruiter' | 'company_recruiter' | 'company';
    userId?: string;
    className?: string;
}

type ModalState = {
    type: 'approve' | 'deny' | 'request-info' | 'provide-info' | 'history' | null;
    craId: string | null;
    candidateName?: string;
    jobTitle?: string;
    gateName?: string;
    gateHistory?: any[];
    questions?: string;
};

export default function GateReviewList({ gateType, userId, className = '' }: GateReviewListProps) {
    const { getToken } = useAuth();
    const [applications, setApplications] = useState<CandidateRoleAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalState, setModalState] = useState<ModalState>({ type: null, craId: null });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query params based on gate type
            const params: Record<string, any> = {
                current_gate: gateType,
                state: 'awaiting_gate_review', // Or appropriate state
                include: 'candidate,job',
                sort_by: 'created_at',
                sort_order: 'desc'
            };

            // Add role-specific filter if userId provided
            if (userId) {
                const filterKey = gateType === 'candidate_recruiter'
                    ? 'candidate_recruiter_id'
                    : gateType === 'company_recruiter'
                        ? 'company_recruiter_id'
                        : 'company_id';
                params[filterKey] = userId;
            }

            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: CandidateRoleAssignment[] }>(
                '/candidate-role-assignments',
                { params }
            );

            setApplications(response.data || []);
        } catch (err) {
            console.error('Failed to fetch gate reviews:', err);
            setError(err instanceof Error ? err.message : 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [gateType, userId]);

    const openModal = (
        type: 'approve' | 'deny' | 'request-info' | 'provide-info' | 'history',
        application: CandidateRoleAssignment,
        questions?: string
    ) => {
        setModalState({
            type,
            craId: application.id,
            candidateName: application.candidate?.name || 'Unknown',
            jobTitle: application.job?.title || 'Unknown',
            gateName: getGateLabel(gateType),
            gateHistory: application.gate_history,
            questions
        });
    };

    const closeModal = () => {
        setModalState({ type: null, craId: null });
    };

    const handleApprove = async (notes?: string) => {
        if (!modalState.craId) return;

        setActionLoading(true);

        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);
        try {
            await client.post(`/candidate-role-assignments/${modalState.craId}/approve-gate`, {
                notes
            });

            // Refresh list and close modal
            await fetchApplications();
            closeModal();

            // Optional: Show success toast
        } catch (err) {
            console.error('Failed to approve application:', err);
            throw err; // Let modal handle error display
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeny = async (reason: string) => {
        if (!modalState.craId) return;

        setActionLoading(true);
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);
        try {
            await client.post(`/candidate-role-assignments/${modalState.craId}/deny-gate`, {
                reason
            });

            await fetchApplications();
            closeModal();

        } catch (err) {
            console.error('Failed to deny application:', err);
            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestInfo = async (questions: string) => {
        if (!modalState.craId) return;

        setActionLoading(true);
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);
        try {
            await client.post(`/candidate-role-assignments/${modalState.craId}/request-info`, {
                questions
            });

            await fetchApplications();
            closeModal();

        } catch (err) {
            console.error('Failed to request information:', err);
            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    const handleProvideInfo = async (answers: string) => {
        if (!modalState.craId) return;

        setActionLoading(true);
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);
        try {
            await client.post(`/candidate-role-assignments/${modalState.craId}/provide-info`, {
                answers
            });

            await fetchApplications();
            closeModal();

        } catch (err) {
            console.error('Failed to provide information:', err);
            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    const getGateLabel = (gate: string) => {
        switch (gate) {
            case 'candidate_recruiter':
                return 'Candidate Recruiter Review';
            case 'company_recruiter':
                return 'Company Recruiter Review';
            case 'company':
                return 'Company Review';
            default:
                return gate;
        }
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center py-12 ${className}`}>
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`alert alert-error ${className}`}>
                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                <div>
                    <div className="font-semibold">Failed to Load Applications</div>
                    <div className="text-sm">{error}</div>
                </div>
                <button onClick={fetchApplications} className="btn btn-sm">
                    Retry
                </button>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className={`text-center py-12 ${className}`}>
                <i className="fa-duotone fa-regular fa-inbox text-6xl text-base-content/30 mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">No Applications Pending Review</h3>
                <p className="text-base-content/60">
                    There are currently no applications waiting at your gate.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className={className}>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Job Title</th>
                                <th>Company</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="w-12 rounded-full bg-neutral text-neutral-content">
                                                    <span className="text-lg">
                                                        {app.candidate?.name?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold">{app.candidate?.name || 'Unknown'}</div>
                                                <div className="text-sm text-base-content/60">
                                                    {app.candidate?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-medium">{app.job?.title || 'Unknown'}</div>
                                    </td>
                                    <td>{app.job?.company?.name || 'Unknown'}</td>
                                    <td>
                                        <span className="text-sm">
                                            {formatRelativeTime(app.created_at)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            {/* Show provide-info if info was requested */}
                                            {app.state === 'info_requested' && app.gate_history?.some(
                                                (h: any) => h.action === 'info_requested' && !h.answered
                                            ) ? (
                                                <button
                                                    onClick={() => {
                                                        const lastInfoRequest = app.gate_history
                                                            ?.filter((h: any) => h.action === 'info_requested')
                                                            ?.pop();
                                                        openModal('provide-info', app, lastInfoRequest?.questions);
                                                    }}
                                                    className="btn btn-info btn-sm"
                                                    title="Provide Requested Info"
                                                >
                                                    <i className="fa-duotone fa-regular fa-reply"></i>
                                                    Respond
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => openModal('approve', app)}
                                                        className="btn btn-success btn-sm"
                                                        title="Approve"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-circle-check"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('deny', app)}
                                                        className="btn btn-error btn-sm"
                                                        title="Deny"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-circle-xmark"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('request-info', app)}
                                                        className="btn btn-warning btn-sm"
                                                        title="Request Info"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-circle-question"></i>
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => openModal('history', app)}
                                                className="btn btn-ghost btn-sm"
                                                title="View History"
                                            >
                                                <i className="fa-duotone fa-regular fa-clock-rotate-left"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <ApproveGateModal
                isOpen={modalState.type === 'approve'}
                onClose={closeModal}
                onApprove={handleApprove}
                candidateName={modalState.candidateName || ''}
                jobTitle={modalState.jobTitle || ''}
                gateName={modalState.gateName || ''}
            />

            <DenyGateModal
                isOpen={modalState.type === 'deny'}
                onClose={closeModal}
                onDeny={handleDeny}
                candidateName={modalState.candidateName || ''}
                jobTitle={modalState.jobTitle || ''}
                gateName={modalState.gateName || ''}
            />

            <RequestInfoModal
                isOpen={modalState.type === 'request-info'}
                onClose={closeModal}
                onRequestInfo={handleRequestInfo}
                candidateName={modalState.candidateName || ''}
                jobTitle={modalState.jobTitle || ''}
                gateName={modalState.gateName || ''}
            />

            <ProvideInfoModal
                isOpen={modalState.type === 'provide-info'}
                onClose={closeModal}
                onProvideInfo={handleProvideInfo}
                candidateName={modalState.candidateName || ''}
                jobTitle={modalState.jobTitle || ''}
                gateName={modalState.gateName || ''}
                questions={modalState.questions || ''}
            />

            {/* History Modal */}
            {modalState.type === 'history' && (
                <dialog className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <button
                            onClick={closeModal}
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        >
                            ✕
                        </button>

                        <h3 className="font-bold text-lg mb-4">
                            <i className="fa-duotone fa-regular fa-clock-rotate-left mr-2"></i>
                            Gate History
                        </h3>

                        <div className="mb-4 p-3 bg-base-200 rounded">
                            <div className="text-sm">
                                <span className="font-semibold">Candidate:</span> {modalState.candidateName}
                            </div>
                            <div className="text-sm">
                                <span className="font-semibold">Job:</span> {modalState.jobTitle}
                            </div>
                        </div>

                        <GateHistoryTimeline history={modalState.gateHistory || []} />
                    </div>
                    <div className="modal-backdrop" onClick={closeModal}></div>
                </dialog>
            )
            }
        </>
    );
}
