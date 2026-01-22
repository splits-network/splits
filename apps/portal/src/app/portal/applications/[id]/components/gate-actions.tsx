'use client';

import { useState } from 'react';
import ApproveGateModal from '../../components/approve-gate-modal';
import DenyGateModal from '../../components/deny-gate-modal';
import RequestInfoModal from '../../components/request-info-modal';

interface ApplicationActionsProps {
    application: any;
    isRecruiter: boolean;
    isCompanyUser: boolean;
    isPlatformAdmin: boolean;
    onStageTransition: (newStage: string, notes?: string) => Promise<void>;
    onReject: (reason: string) => Promise<void>;
    onRequestInfo: (questions: string) => Promise<void>;
    onAddNote: (note: string) => Promise<void>;
    showAddNoteModal: (show: boolean) => void;
    actionLoading: boolean;
}

export default function ApplicationActions({
    application,
    isRecruiter,
    isCompanyUser,
    isPlatformAdmin,
    onStageTransition,
    onReject,
    onRequestInfo,
    onAddNote,
    showAddNoteModal,
    actionLoading = false,
}: ApplicationActionsProps) {
    const [modalType, setModalType] = useState<'approve' | 'deny' | 'request-info' | null>(null);
    const [nextStage, setNextStage] = useState<'interview' | 'offer'>('interview');

    const currentStage = application?.stage;

    // Don't show actions for terminal stages
    if (!currentStage || ['hired', 'rejected', 'withdrawn', 'expired'].includes(currentStage)) {
        return null;
    }

    // Determine if current user can take actions based on stage
    const canTakeAction = () => {
        switch (currentStage) {
            case 'screen':
            case 'company_review':
                return isCompanyUser || isPlatformAdmin;
            case 'recruiter_review':
            case 'recruiter_proposed':
                return isRecruiter || isPlatformAdmin;
            case 'company_feedback':
                // Depends on recruiter assignment
                if (application.candidate_recruiter_id) {
                    return isRecruiter || isPlatformAdmin;
                } else {
                    return isCompanyUser || isPlatformAdmin;
                }
            default:
                return false;
        }
    };

    const userHasActions = canTakeAction();

    const getStageLabel = () => {
        switch (currentStage) {
            case 'screen': return 'Initial Screening';
            case 'company_review': return 'Company Review';
            case 'recruiter_review': return 'Recruiter Review';
            case 'recruiter_proposed': return 'Recruiter Proposal';
            case 'company_feedback': return 'Company Feedback Stage';
            case 'interview': return 'Interview Stage';
            case 'offer': return 'Offer Stage';
            default: return 'Application Review';
        }
    };

    const getActionButtonText = () => {
        switch (currentStage) {
            case 'screen':
                return 'Approve & Submit to Company';
            case 'company_review':
                return 'Approve & Move Forward';
            case 'recruiter_review':
                return 'Approve & Forward to Company';
            case 'recruiter_proposed':
                return 'Approve Proposal';
            case 'company_feedback':
                return 'Approve & Continue';
            default:
                return 'Approve';
        }
    };

    const getDenyButtonText = () => {
        switch (currentStage) {
            case 'screen':
            case 'company_review':
                return 'Reject Application';
            case 'recruiter_review':
            case 'recruiter_proposed':
                return 'Decline to Represent';
            default:
                return 'Reject';
        }
    };

    const getWaitingMessage = () => {
        switch (currentStage) {
            case 'screen':
                return 'Application is being screened by the hiring team.';
            case 'company_review':
                return 'Application is under company review.';
            case 'recruiter_review':
                return 'Waiting for recruiter to review this application.';
            case 'recruiter_proposed':
                return 'Waiting for recruiter proposal to be reviewed.';
            case 'company_feedback':
                if (application.candidate_recruiter_id) {
                    return 'Waiting for recruiter to review company feedback.';
                } else {
                    return 'Application is pending further review.';
                }
            case 'interview':
                return 'Application is in the interview stage.';
            case 'offer':
                return 'Application is in the offer stage.';
            default:
                return 'Application is being processed.';
        }
    };

    const handleApprove = () => {
        setModalType('approve');
    };

    const handleDeny = () => {
        setModalType('deny');
    };

    const handleRequestInfo = () => {
        setModalType('request-info');
    };

    const handleConfirmApprove = async (note?: string) => {
        let targetStage;

        switch (currentStage) {
            case 'screen':
                targetStage = 'submitted';
                break;
            case 'company_review':
                targetStage = nextStage; // interview or offer
                break;
            case 'recruiter_review':
                targetStage = 'company_review';
                break;
            case 'recruiter_proposed':
                targetStage = 'company_review';
                break;
            case 'company_feedback':
                if (application.candidate_recruiter_id) {
                    targetStage = 'recruiter_review';
                } else {
                    targetStage = 'interview';
                }
                break;
            default:
                targetStage = 'company_review';
        }

        await onStageTransition(targetStage, note);
        setModalType(null);
    };

    const handleConfirmDeny = async (note: string) => {
        await onReject(note);
        setModalType(null);
    };

    const handleConfirmRequestInfo = async (note: string) => {
        await onRequestInfo(note);
        setModalType(null);
    };

    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    return (
        <>
            {/* Debug info div */}
            {isLocalhost && (
                <div className="fixed bottom-4 right-4 bg-base-300 border border-base-content/20 rounded-lg p-4 text-xs z-50 shadow-lg max-w-xs">
                    <div className="font-bold mb-2 text-sm">Debug Flags</div>
                    <div className="space-y-1">
                        <div>userHasActions: <span className={userHasActions ? 'text-success' : 'text-error'}>{String(userHasActions)}</span></div>
                        <div>canTakeAction: <span className={canTakeAction() ? 'text-success' : 'text-error'}>{String(canTakeAction())}</span></div>
                        <div className="border-t border-base-content/20 pt-1 mt-1">
                            <div>isRecruiter: <span className={isRecruiter ? 'text-success' : 'text-error'}>{String(isRecruiter)}</span></div>
                            <div>isCompanyUser: <span className={isCompanyUser ? 'text-success' : 'text-error'}>{String(isCompanyUser)}</span></div>
                            <div>isPlatformAdmin: <span className={isPlatformAdmin ? 'text-success' : 'text-error'}>{String(isPlatformAdmin)}</span></div>
                            <div>currentStage: <span className="text-info">{currentStage || 'null'}</span></div>
                            <div>applicationId: <span className="text-info">{application?.id || 'null'}</span></div>
                            <div>candidateRecruiterId: <span className="text-info">{application?.candidate_recruiter_id || 'null'}</span></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card bg-base-200 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-circle-check"></i>
                        {userHasActions
                            ? `${getStageLabel()} - Action Required`
                            : getStageLabel()
                        }
                    </h2>

                    <p className="text-sm text-base-content/70">
                        {userHasActions
                            ? 'You can take action on this application at this stage.'
                            : getWaitingMessage()
                        }
                    </p>

                    <div className="alert alert-info">
                        <i className="fa-duotone fa-regular fa-circle-info"></i>
                        <div>
                            <div className="font-semibold">Currently at: {getStageLabel()}</div>
                            <div className="text-sm">
                                {userHasActions ? (
                                    'You can take action on this application at this stage.'
                                ) : (
                                    'You will be notified when action is required from you.'
                                )}
                            </div>
                        </div>
                    </div>

                    {userHasActions && (
                        <div className="card-actions justify-end">

                            {currentStage === 'company_review' ? (
                                <>
                                    <button
                                        className="btn btn-success btn-sm btn-block"
                                        onClick={() => {
                                            setNextStage('interview');
                                            setModalType('approve');
                                        }}
                                        disabled={actionLoading}
                                    >
                                        <i className="fa-duotone fa-regular fa-calendar"></i>
                                        Move to Interview
                                    </button>
                                    <button
                                        className="btn btn-success btn-outline btn-sm btn-block"
                                        onClick={() => {
                                            setNextStage('offer');
                                            setModalType('approve');
                                        }}
                                        disabled={actionLoading}
                                    >
                                        <i className="fa-duotone fa-regular fa-handshake"></i>
                                        Move to Offer
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-check"></i>
                                            {getActionButtonText()}
                                        </>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={() => showAddNoteModal(true)}
                                className="btn btn-info btn-outline btn-sm btn-block gap-2"
                                disabled={actionLoading}
                            >
                                <i className="fa-duotone fa-regular fa-note-sticky"></i>
                                Add Note
                            </button>

                            {/* we will add this back later, or replace with full chat interface
                            <button
                                className="btn btn-warning btn-sm btn-block"
                                onClick={() => setModalType('request-info')}
                            >
                                <i className="fa-duotone fa-regular fa-circle-question"></i>
                                Request More Info
                            </button>
                            */}
                            <button
                                className="btn btn-error btn-sm btn-block"
                                onClick={handleDeny}
                                disabled={actionLoading}
                            >
                                <i className="fa-duotone fa-regular fa-circle-xmark"></i>
                                {getDenyButtonText()}
                            </button>
                        </div>
                    )}
                </div>
            </div >

            {/* Modals */}
            < ApproveGateModal
                isOpen={modalType === 'approve'
                }
                onClose={() => setModalType(null)}
                onApprove={handleConfirmApprove}
                candidateName={application.candidate?.full_name || 'Unknown'}
                jobTitle={application.job?.title || 'Unknown'}
                gateName={getStageLabel()}
            />

            <DenyGateModal
                isOpen={modalType === 'deny'}
                onClose={() => setModalType(null)}
                onDeny={handleConfirmDeny}
                candidateName={application.candidate?.full_name || 'Unknown'}
                jobTitle={application.job?.title || 'Unknown'}
                gateName={getStageLabel()}
            />

            <RequestInfoModal
                isOpen={modalType === 'request-info'}
                onClose={() => setModalType(null)}
                onRequestInfo={handleConfirmRequestInfo}
                candidateName={application.candidate?.full_name || 'Unknown'}
                jobTitle={application.job?.title || 'Unknown'}
                gateName={getStageLabel()}
            />
        </>
    );
}
