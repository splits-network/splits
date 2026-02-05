'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { LoadingState } from '@splits-network/shared-ui';
import CandidateActionsToolbar from './candidate-actions-toolbar';
import type { Candidate } from './browse/types';

// Import existing detail components from browse folder
import DetailHeader from './browse/detail-header';
import DetailBio from './browse/detail-bio';
import DetailPreferences from './browse/detail-preferences';
import DetailSkills from './browse/detail-skills';
import DetailApplications from './browse/detail-applications';
import DetailDocuments from './browse/detail-documents';
import DetailTimeline from './browse/detail-timeline';
import DetailInvitation from './browse/detail-invitation';

// Import modals
import EditCandidateModal from './edit-candidate-modal';
import VerificationModal from './verification-modal';
import SubmitToJobWizard from './submit-to-job-wizard';

interface CandidateDetailSidebarProps {
    candidateId: string | null;
    onClose: () => void;
}

export default function CandidateDetailSidebar({
    candidateId,
    onClose,
}: CandidateDetailSidebarProps) {
    const { getToken } = useAuth();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showSubmitWizard, setShowSubmitWizard] = useState(false);

    useEffect(() => {
        if (candidateId) {
            fetchCandidate(candidateId);
        } else {
            setCandidate(null);
        }
    }, [candidateId]);

    const fetchCandidate = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No auth token available');
            }

            const client = createAuthenticatedClient(token);
            const response: any = await client.get(`/candidates/${id}`);
            setCandidate(response.data);
        } catch (err: any) {
            console.error('Failed to fetch candidate:', err);
            setError('Failed to load candidate details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (candidateId) {
            fetchCandidate(candidateId);
        }
    };

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleVerify = () => {
        setShowVerifyModal(true);
    };

    const handleSendJobOpportunity = () => {
        setShowSubmitWizard(true);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        handleRefresh();
    };

    const handleVerifyUpdate = (updatedCandidate: any) => {
        setCandidate(updatedCandidate);
        setShowVerifyModal(false);
    };

    const handleSubmitToJob = async (jobId: string, notes: string, documentIds: string[]) => {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);
        await client.post('/proposals', {
            candidate_id: candidateId,
            job_id: jobId,
            recruiter_pitch: notes,
            document_ids: documentIds,
        });

        setShowSubmitWizard(false);
        handleRefresh();
    };

    if (!candidateId) {
        return null;
    }

    return (
        <>
            <div className="drawer drawer-end">
                <input
                    id="candidate-detail-drawer"
                    type="checkbox"
                    className="drawer-toggle"
                    checked={!!candidateId}
                    readOnly
                />

                <div className="drawer-side z-50">
                    <label
                        className="drawer-overlay"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    ></label>

                    <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Candidate Details</h2>
                            <div className="flex items-center gap-2">
                                {candidate && !loading && (
                                    <>
                                        {/* Mobile: icon-only */}
                                        <div className="md:hidden">
                                            <CandidateActionsToolbar
                                                candidate={candidate}
                                                variant="icon-only"
                                                layout="horizontal"
                                                size="sm"
                                                onRefresh={handleRefresh}
                                                onEdit={handleEdit}
                                                onVerify={handleVerify}
                                                onSendJobOpportunity={handleSendJobOpportunity}
                                                showActions={{
                                                    viewDetails: false,
                                                }}
                                            />
                                        </div>
                                        {/* Desktop: descriptive */}
                                        <div className="hidden md:block">
                                            <CandidateActionsToolbar
                                                candidate={candidate}
                                                variant="descriptive"
                                                layout="horizontal"
                                                size="sm"
                                                onRefresh={handleRefresh}
                                                onEdit={handleEdit}
                                                onVerify={handleVerify}
                                                onSendJobOpportunity={handleSendJobOpportunity}
                                                showActions={{
                                                    viewDetails: false,
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                                <button
                                    onClick={onClose}
                                    className="btn btn-sm btn-circle btn-ghost"
                                    aria-label="Close"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark"></i>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {loading && (
                                <div className="p-8">
                                    <LoadingState message="Loading candidate details..." />
                                </div>
                            )}

                            {error && !loading && (
                                <div className="p-4">
                                    <div className="alert alert-error">
                                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                        <span>{error}</span>
                                    </div>
                                </div>
                            )}

                            {candidate && !loading && (
                                <div className="p-6 space-y-6">
                                    {/* Header Section */}
                                    <DetailHeader candidate={candidate} />

                                    {/* Bio Section */}
                                    <DetailBio candidate={candidate} />

                                    {/* Invitation Status */}
                                    <DetailInvitation candidateId={candidateId} />

                                    {/* Preferences */}
                                    <DetailPreferences candidate={candidate} />

                                    {/* Skills */}
                                    <DetailSkills candidate={candidate} />

                                    {/* Applications */}
                                    <DetailApplications candidateId={candidateId} />

                                    {/* Documents */}
                                    <DetailDocuments candidateId={candidateId} />

                                    {/* Timeline */}
                                    <DetailTimeline candidateId={candidateId} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showEditModal && candidateId && (
                <EditCandidateModal
                    candidateId={candidateId}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleEditSuccess}
                />
            )}

            {showVerifyModal && candidate && (
                <VerificationModal
                    candidate={candidate}
                    isOpen={showVerifyModal}
                    onClose={() => setShowVerifyModal(false)}
                    onUpdate={handleVerifyUpdate}
                />
            )}

            {showSubmitWizard && candidate && (
                <SubmitToJobWizard
                    candidateId={candidate.id}
                    candidateName={candidate.full_name || 'Unknown'}
                    onClose={() => setShowSubmitWizard(false)}
                    onSubmit={handleSubmitToJob}
                />
            )}
        </>
    );
}
