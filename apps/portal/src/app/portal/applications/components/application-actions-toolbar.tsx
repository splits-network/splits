'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useToast } from '@/lib/toast-context';
import { useUserProfile } from '@/contexts';
import ApproveGateModal from './approve-gate-modal';
import DenyGateModal from './deny-gate-modal';
import AddNoteModal from './add-note-modal';
import {
    canTakeActionOnApplication,
    getNextStageOnApprove,
    formatApplicationNote,
} from '../lib/permission-utils';
import type { Application } from './browse/types';
import type { ApplicationStage } from '@splits-network/shared-types';

// ===== TYPES =====

export interface ApplicationActionsToolbarProps {
    application: Application;
    variant: 'icon-only' | 'descriptive';
    layout?: 'horizontal' | 'vertical';
    size?: 'xs' | 'sm' | 'md';
    showActions?: {
        viewDetails?: boolean;
        addNote?: boolean;
        advanceStage?: boolean;
        reject?: boolean;
    };
    onRefresh?: () => void;
    onViewDetails?: (applicationId: string) => void;
    className?: string;
}

// ===== COMPONENT =====

export default function ApplicationActionsToolbar({
    application,
    variant,
    layout = 'horizontal',
    size = 'sm',
    showActions = {},
    onRefresh,
    onViewDetails,
    className = '',
}: ApplicationActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { profile, isAdmin, isRecruiter, isCompanyUser } = useUserProfile();

    // Modal states
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showDenyModal, setShowDenyModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [moveToOffer, setMoveToOffer] = useState(false);

    // Loading states
    const [actionLoading, setActionLoading] = useState(false);

    // ===== PERMISSION LOGIC =====

    const permissions = useMemo(() => {
        return canTakeActionOnApplication(
            application.stage as ApplicationStage,
            isRecruiter || false,
            isCompanyUser || false,
            isAdmin || false,
            application.candidate_recruiter_id
        );
    }, [application.stage, application.candidate_recruiter_id, isRecruiter, isCompanyUser, isAdmin]);

    // ===== ACTION HANDLERS =====

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(application.id);
        }
    };

    const handleApprove = (toOffer: boolean = false) => {
        setMoveToOffer(toOffer);
        setShowApproveModal(true);
    };

    const handleConfirmApprove = async (note?: string, salary?: number) => {
        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);

            const targetStage = getNextStageOnApprove(
                application.stage as ApplicationStage,
                application.candidate_recruiter_id,
                moveToOffer
            );

            // Check if this is a company accepting the application
            const isAcceptingApplication =
                application.stage === 'submitted' && (isCompanyUser || isAdmin);

            const updateData: any = {
                stage: targetStage,
                ...(note && {
                    notes: formatApplicationNote(
                        application.notes,
                        note,
                        isRecruiter || false,
                        isCompanyUser || false,
                        isAdmin || false
                    ),
                }),
                ...(salary && { salary }),
                ...(isAcceptingApplication && {
                    accepted_by_company: true,
                    accepted_at: new Date().toISOString(),
                }),
            };

            await client.patch(`/applications/${application.id}`, updateData);

            if (targetStage === 'hired') {
                toast.success('Candidate marked as hired successfully!');
            } else if (isAcceptingApplication) {
                toast.success('Application accepted and moved to company review');
            } else {
                toast.success('Application moved to next stage successfully');
            }

            setShowApproveModal(false);
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('Failed to approve application:', error);
            toast.error(error.message || 'Failed to approve application');
        } finally {
            setActionLoading(false);
            setMoveToOffer(false);
        }
    };

    const handleConfirmDeny = async (reason: string) => {
        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${application.id}`, {
                stage: 'rejected' as ApplicationStage,
                decline_reason: reason,
                notes: formatApplicationNote(
                    application.notes,
                    reason,
                    isRecruiter || false,
                    isCompanyUser || false,
                    isAdmin || false
                ),
            });

            toast.success('Application rejected');
            setShowDenyModal(false);
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('Failed to reject application:', error);
            toast.error(error.message || 'Failed to reject application');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveNote = async (note: string) => {
        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${application.id}`, {
                notes: formatApplicationNote(
                    application.notes,
                    note,
                    isRecruiter || false,
                    isCompanyUser || false,
                    isAdmin || false
                ),
            });

            toast.success('Note added successfully');
            setShowNoteModal(false);
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('Failed to add note:', error);
            toast.error(error.message || 'Failed to add note');
        } finally {
            setActionLoading(false);
        }
    };

    // ===== ACTION VISIBILITY =====

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        addNote: showActions.addNote !== false && permissions.canAddNote,
        advanceStage: showActions.advanceStage !== false && permissions.canApprove,
        reject: showActions.reject !== false && permissions.canReject,
    };

    // Check if this is company_review stage (has two approve options)
    const isCompanyReviewStage = application.stage === 'company_review';

    // ===== RENDER HELPERS =====

    const getSizeClass = () => `btn-${size}`;

    const getLayoutClass = () => {
        return layout === 'horizontal' ? 'gap-1' : 'flex-col gap-2';
    };

    // ===== RENDER VARIANTS =====

    if (variant === 'icon-only') {
        return (
            <>
                <div className={`flex ${getLayoutClass()} ${className}`}>
                    {/* View Details */}
                    {actions.viewDetails && onViewDetails && (
                        <button
                            onClick={handleViewDetails}
                            className={`btn ${getSizeClass()} btn-square btn-ghost`}
                            title="View Details"
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                        </button>
                    )}

                    {/* Add Note */}
                    {actions.addNote && (
                        <button
                            onClick={() => setShowNoteModal(true)}
                            className={`btn ${getSizeClass()} btn-square btn-ghost`}
                            title="Add Note"
                            disabled={actionLoading}
                        >
                            <i className="fa-duotone fa-regular fa-note-sticky" />
                        </button>
                    )}

                    {/* Quick Approve - Most relevant action */}
                    {actions.advanceStage && (
                        <button
                            onClick={() => handleApprove(false)}
                            className={`btn ${getSizeClass()} btn-square btn-success`}
                            title={permissions.approveButtonText}
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                                <i className="fa-duotone fa-regular fa-check" />
                            )}
                        </button>
                    )}

                    {/* Quick Reject */}
                    {actions.reject && (
                        <button
                            onClick={() => setShowDenyModal(true)}
                            className={`btn ${getSizeClass()} btn-square btn-error`}
                            title={permissions.rejectButtonText}
                            disabled={actionLoading}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}
                </div>

                {/* Modals */}
                <ApproveGateModal
                    isOpen={showApproveModal}
                    onClose={() => setShowApproveModal(false)}
                    onApprove={handleConfirmApprove}
                    candidateName={application.candidate?.full_name || 'Unknown'}
                    jobTitle={application.job?.title || 'Unknown'}
                    gateName={permissions.stageLabel}
                    isHireTransition={application.stage === 'offer'}
                    applicationId={application.id}
                    currentStage={application.stage ?? undefined}
                />

                <DenyGateModal
                    isOpen={showDenyModal}
                    onClose={() => setShowDenyModal(false)}
                    onDeny={handleConfirmDeny}
                    candidateName={application.candidate?.full_name || 'Unknown'}
                    jobTitle={application.job?.title || 'Unknown'}
                    gateName={permissions.stageLabel}
                />

                {showNoteModal && (
                    <AddNoteModal
                        applicationId={application.id}
                        onClose={() => setShowNoteModal(false)}
                        onSave={handleSaveNote}
                        loading={actionLoading}
                    />
                )}
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div className={`flex ${getLayoutClass()} ${className}`}>
                {/* View Details */}
                {actions.viewDetails && onViewDetails && (
                    <button
                        onClick={handleViewDetails}
                        className={`btn ${getSizeClass()} btn-outline gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-eye" />
                        View Details
                    </button>
                )}

                {/* Add Note */}
                {actions.addNote && (
                    <button
                        onClick={() => setShowNoteModal(true)}
                        className={`btn ${getSizeClass()} btn-info btn-outline gap-2`}
                        disabled={actionLoading}
                    >
                        <i className="fa-duotone fa-regular fa-note-sticky" />
                        Add Note
                    </button>
                )}

                {/* Advance Stage - Special handling for company_review */}
                {actions.advanceStage && (
                    <>
                        {isCompanyReviewStage ? (
                            <>
                                {/* Move to Interview (primary) */}
                                <button
                                    onClick={() => handleApprove(false)}
                                    className={`btn ${getSizeClass()} btn-success gap-2`}
                                    disabled={actionLoading}
                                >
                                    {actionLoading && !moveToOffer ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                        <i className="fa-duotone fa-regular fa-calendar" />
                                    )}
                                    Move to Interview
                                </button>

                                {/* Move to Offer (outline) */}
                                <button
                                    onClick={() => handleApprove(true)}
                                    className={`btn ${getSizeClass()} btn-success btn-outline gap-2`}
                                    disabled={actionLoading}
                                >
                                    {actionLoading && moveToOffer ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                        <i className="fa-duotone fa-regular fa-handshake" />
                                    )}
                                    Move to Offer
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => handleApprove(false)}
                                className={`btn ${getSizeClass()} btn-success gap-2`}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                    <i className="fa-duotone fa-regular fa-check" />
                                )}
                                {permissions.approveButtonText}
                            </button>
                        )}
                    </>
                )}

                {/* Reject */}
                {actions.reject && (
                    <button
                        onClick={() => setShowDenyModal(true)}
                        className={`btn ${getSizeClass()} btn-error gap-2`}
                        disabled={actionLoading}
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                        {permissions.rejectButtonText}
                    </button>
                )}
            </div>

            {/* Modals */}
            <ApproveGateModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onApprove={handleConfirmApprove}
                candidateName={application.candidate?.full_name || 'Unknown'}
                jobTitle={application.job?.title || 'Unknown'}
                gateName={permissions.stageLabel}
                isHireTransition={application.stage === 'offer'}
                applicationId={application.id}
                currentStage={application.stage ?? undefined}
            />

            <DenyGateModal
                isOpen={showDenyModal}
                onClose={() => setShowDenyModal(false)}
                onDeny={handleConfirmDeny}
                candidateName={application.candidate?.full_name || 'Unknown'}
                jobTitle={application.job?.title || 'Unknown'}
                gateName={permissions.stageLabel}
            />

            {showNoteModal && (
                <AddNoteModal
                    applicationId={application.id}
                    onClose={() => setShowNoteModal(false)}
                    onSave={handleSaveNote}
                    loading={actionLoading}
                />
            )}
        </>
    );
}
