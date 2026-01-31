'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { startChatConversation } from '@/lib/chat-start';
import { useToast } from '@/lib/toast-context';
import { useUserProfile } from '@/contexts';
import { getApplicationStageBadge } from '@/lib/utils/badge-styles';
import StageUpdateModal from './stage-update-modal';
import type { ApplicationStage } from '@splits-network/shared-types';
import { useRouter } from 'next/navigation';

interface ApplicationHeaderProps {
    applicationId: string;
}

interface Application {
    id: string;
    stage: ApplicationStage;
    accepted_by_company: boolean;
    accepted_at?: string;
    created_at: string;
    updated_at: string;
    candidate: {
        id: string;
        user_id?: string | null;
        full_name: string;
        email: string;
    };
    job: {
        id: string;
        title: string;
        company?: {
            id: string;
            name: string;
        };
    };
    recruiter?: {
        id: string;
        name: string;
    };
    ai_review?: {
        fit_score: number;
        recommendation: string;
    };
}

export default function ApplicationHeader({ applicationId }: ApplicationHeaderProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const router = useRouter();
    const { isAdmin, isRecruiter, isCompanyUser } = useUserProfile();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showStageModal, setShowStageModal] = useState(false);
    const [startingChat, setStartingChat] = useState(false);
    const canChat = Boolean(application?.candidate?.user_id);
    const chatDisabledReason = canChat
        ? null
        : "Candidate isn't linked to a user yet.";

    const canManageStage = isAdmin || isRecruiter;

    useEffect(() => {
        fetchApplication();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId]);

    const fetchApplication = async () => {
        try {
            const token = await getToken();
            if (!token) {
                console.error('No auth token available');
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const response: any = await client.get(`/applications/${applicationId}?include=candidate,job,ai_review`);
            setApplication(response.data);
        } catch (error) {
            console.error('Failed to fetch application:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStageChange = async (newStage: ApplicationStage, notes?: string) => {
        setUpdating(true);
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No auth token');
            }

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${applicationId}`, { stage: newStage, notes });

            await fetchApplication();
            toast.success('Stage updated successfully!');
            setShowStageModal(false);
        } catch (error: any) {
            console.error('Failed to update stage:', error);
            toast.error(`Failed to update stage: ${error.message}`);
        } finally {
            setUpdating(false);
        }
    };

    const handleAccept = async () => {
        if (!confirm('Are you sure you want to accept this application?')) {
            return;
        }

        setUpdating(true);
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No auth token');
            }

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${applicationId}`, { accepted_by_company: true });

            await fetchApplication();
            toast.success('Application accepted!');
        } catch (error: any) {
            console.error('Failed to accept application:', error);
            toast.error(`Failed to accept application: ${error.message}`);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="card bg-base-200 shadow">
                <div className="card-body">
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="card bg-base-200 shadow">
                <div className="card-body">
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>Application not found</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card bg-base-200 shadow">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl font-bold">{application.candidate.full_name}</h1>
                                <div className={`badge ${getApplicationStageBadge(application.stage)}`}>
                                    {application.stage}
                                </div>
                                {application.accepted_by_company && (
                                    <div className="badge badge-success gap-1">
                                        <i className="fa-duotone fa-regular fa-circle-check"></i>
                                        Accepted
                                    </div>
                                )}
                                {application.ai_review && (
                                    <div className="badge badge-info gap-1">
                                        <i className="fa-duotone fa-regular fa-robot"></i>
                                        AI Score: {application.ai_review.fit_score}%
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-base-content/70">
                                <span className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-briefcase"></i>
                                    {application.job.title}
                                </span>
                                {application.job.company && (
                                    <span className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-building"></i>
                                        {application.job.company.name}
                                    </span>
                                )}
                                <span className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-envelope"></i>
                                    {application.candidate.email}
                                </span>
                                {application.recruiter && (
                                    <span className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-user-tie"></i>
                                        {application.recruiter.name}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span title={chatDisabledReason || undefined}>
                                <button
                                    className="btn btn-outline gap-2"
                                    onClick={async () => {
                                        try {
                                            if (!application.candidate.user_id) {
                                                return;
                                            }
                                            setStartingChat(true);
                                            const conversationId =
                                                await startChatConversation(
                                                    getToken,
                                                    application.candidate.user_id as string,
                                                    {
                                                        application_id:
                                                            application.id,
                                                        job_id: application.job.id,
                                                        company_id:
                                                            application.job.company?.id ??
                                                            null,
                                                    },
                                                );
                                            router.push(`/portal/messages?conversationId=${conversationId}`);
                                        } catch (error: any) {
                                            console.error('Failed to start chat:', error);
                                            toast.error(error?.message || 'Failed to start chat');
                                        } finally {
                                            setStartingChat(false);
                                        }
                                    }}
                                    disabled={!canChat || startingChat}
                                >
                                    {startingChat ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                        <i className="fa-duotone fa-regular fa-messages"></i>
                                    )}
                                    Message Candidate
                                </button>
                            </span>
                            {canManageStage && (
                                <button
                                    className="btn btn-primary gap-2"
                                    onClick={() => setShowStageModal(true)}
                                    disabled={updating}
                                >
                                    <i className="fa-duotone fa-regular fa-list-check"></i>
                                    Update Stage
                                </button>
                            )}
                            {isCompanyUser && !application.accepted_by_company && (
                                <button
                                    className="btn btn-success gap-2"
                                    onClick={handleAccept}
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <i className="fa-duotone fa-regular fa-check"></i>
                                    )}
                                    Accept Application
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showStageModal && (
                <StageUpdateModal
                    currentStage={application.stage}
                    onClose={() => setShowStageModal(false)}
                    onUpdate={handleStageChange}
                    loading={updating}
                />
            )}
        </>
    );
}

