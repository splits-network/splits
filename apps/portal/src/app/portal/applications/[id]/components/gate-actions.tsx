'use client';

import { useState } from 'react';
import ApproveGateModal from '../../components/approve-gate-modal';
import DenyGateModal from '../../components/deny-gate-modal';
import RequestInfoModal from '../../components/request-info-modal';

interface GateActionsProps {
    application: any;
    craId: string | null;
    isRecruiter: boolean;
    isCompanyUser: boolean;
    currentGate: string | null;
    onGateAction: () => Promise<void>;
    onApprove: (notes?: string) => Promise<void>;
    onDeny: (reason: string) => Promise<void>;
    onRequestInfo: (questions: string) => Promise<void>;
    onAddNote: (note: string) => Promise<void>;
    showAddNoteModal: (show: boolean) => void;
    actionLoading: boolean;
}

export default function GateActions({
    application,
    craId,
    isRecruiter,
    isCompanyUser,
    currentGate,
    onGateAction,
    onApprove,
    onDeny,
    onRequestInfo,
    onAddNote,
    showAddNoteModal,
    actionLoading = false,
}: GateActionsProps) {
    const [modalType, setModalType] = useState<'approve' | 'deny' | 'request-info' | null>(null);
    const [nextStage, setNextStage] = useState<'interview' | 'offer'>('interview');

    // Don't show if no CRA exists yet
    if (!craId) {
        return null;
    }

    // Company users at company gate
    const showCompanyActions = isCompanyUser && currentGate === 'company';

    // Recruiter at candidate_recruiter gate
    const showCandidateRecruiterActions = isRecruiter && currentGate === 'candidate_recruiter';

    // Recruiter at company_recruiter gate
    const showCompanyRecruiterActions = isRecruiter && currentGate === 'company_recruiter';

    // Determine if user has actions available at this gate
    const userHasActions = showCompanyActions || showCandidateRecruiterActions || showCompanyRecruiterActions;

    const getGateLabel = () => {
        if (currentGate === 'company') return 'Company Gate';
        if (currentGate === 'candidate_recruiter') return 'Candidate Recruiter Gate';
        if (currentGate === 'company_recruiter') return 'Company Recruiter Gate';
        return 'Gate';
    };

    const getActionButtonText = () => {
        if (showCompanyActions) return 'Approve & Move to Offer';
        if (showCandidateRecruiterActions) return 'Approve & Forward to Company';
        if (showCompanyRecruiterActions) return 'Approve & Forward to Company';
        return 'Approve';
    };

    const getDenyButtonText = () => {
        if (showCompanyActions) return 'Reject Application';
        return 'Decline to Represent';
    };

    const getWaitingMessage = () => {
        if (currentGate === 'candidate_recruiter') {
            return 'Waiting for candidate recruiter to review and approve this application.';
        }
        if (currentGate === 'company_recruiter') {
            return 'Waiting for company recruiter to review and approve this application.';
        }
        if (currentGate === 'company') {
            return 'Waiting for company hiring team to review and make a decision.';
        }
        return 'Application is being reviewed at this stage.';
    };

    return (
        <>
            <div className="card bg-base-200 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-circle-check"></i>
                        {userHasActions
                            ? (showCompanyActions ? 'Company Decision Required' : 'Your Review Required')
                            : (getWaitingMessage())
                        }
                    </h2>

                    <p className="text-sm text-base-content/70">
                        {userHasActions
                            ? (showCompanyActions
                                ? 'This application requires your approval to move forward in the hiring process.'
                                : 'This application requires your approval before moving to the next stage.')
                            : getWaitingMessage()
                        }
                    </p>

                    <div className="alert alert-info">
                        <i className="fa-duotone fa-regular fa-circle-info"></i>
                        <div>
                            <div className="font-semibold">Currently at: {getGateLabel()}</div>
                            <div className="text-sm">
                                {userHasActions ? (
                                    <>
                                        {showCompanyActions && 'Make your hiring decision for this candidate.'}
                                        {showCandidateRecruiterActions && 'Review before forwarding to company recruiter.'}
                                        {showCompanyRecruiterActions && 'Review before forwarding to company.'}
                                    </>
                                ) : (
                                    'You will be notified when action is required from you.'
                                )}
                            </div>
                        </div>
                    </div>

                    {userHasActions && (
                        <div className="card-actions justify-end">

                            {showCompanyActions ? (
                                <>
                                    <button
                                        className="btn btn-success btn-sm btn-block"
                                        onClick={() => {
                                            setNextStage('interview');
                                            setModalType('approve');
                                        }}
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
                                    >
                                        <i className="fa-duotone fa-regular fa-handshake"></i>
                                        Skip to Offer
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="btn btn-primary btn-sm btn-block"
                                    onClick={() => setModalType('approve')}
                                >
                                    <i className="fa-duotone fa-regular fa-circle-check"></i>
                                    {getActionButtonText()}
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
                                onClick={() => setModalType('deny')}
                            >
                                <i className="fa-duotone fa-regular fa-circle-xmark"></i>
                                {getDenyButtonText()}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ApproveGateModal
                isOpen={modalType === 'approve'}
                onClose={() => setModalType(null)}
                onApprove={async (notes) => {
                    await onApprove(notes);
                    await onGateAction();
                    setModalType(null);
                }}
                candidateName={application.candidate?.full_name || 'Unknown'}
                jobTitle={application.job?.title || 'Unknown'}
                gateName={showCompanyActions && nextStage === 'offer' ? 'Company Gate (Skip to Offer)' : getGateLabel()}
            />

            <DenyGateModal
                isOpen={modalType === 'deny'}
                onClose={() => setModalType(null)}
                onDeny={async (reason) => {
                    await onDeny(reason);
                    await onGateAction();
                    setModalType(null);
                }}
                candidateName={application.candidate?.full_name || 'Unknown'}
                jobTitle={application.job?.title || 'Unknown'}
                gateName={getGateLabel()}
            />

            <RequestInfoModal
                isOpen={modalType === 'request-info'}
                onClose={() => setModalType(null)}
                onRequestInfo={async (questions) => {
                    await onRequestInfo(questions);
                    await onGateAction();
                    setModalType(null);
                }}
                candidateName={application.candidate?.full_name || 'Unknown'}
                jobTitle={application.job?.title || 'Unknown'}
                gateName={getGateLabel()}
            />
        </>
    );
}
