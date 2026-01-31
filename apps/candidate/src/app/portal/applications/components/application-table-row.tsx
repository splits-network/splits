'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { startChatConversation } from '@/lib/chat-start';
import { useToast } from '@/lib/toast-context';

interface ApplicationTableRowProps {
    application: {
        id: string;
        stage: string;
        accepted_by_company: boolean;
        created_at: string;
        ai_reviewed?: boolean;
        candidate: {
            full_name: string;
            email: string;
            _masked?: boolean;
        };
        job?: {
            id?: string;
            title: string;
            status?: string;
        };
        company?: {
            id?: string;
            name: string;
        };
        recruiter?: {
            user?: {
                id?: string;
                name: string;
                email?: string;
            };
        };
        ai_review?: {
            fit_score: number;
            recommendation: 'strong_fit' | 'good_fit' | 'fair_fit' | 'poor_fit';
        };
    };
    getStageColor: (stage: string) => string;
    formatDate: (date: string) => string;
}

export function ApplicationTableRow({
    application,
    getStageColor,
    formatDate,
}: ApplicationTableRowProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [startingChat, setStartingChat] = useState(false);
    const candidate = application.candidate;
    const isMasked = candidate._masked;
    const recruiterUserId = application.recruiter?.user?.id;
    const chatDisabledReason = recruiterUserId
        ? null
        : "Your recruiter isn't linked to a user yet.";

    return (
        <tr className="hover">
            <td>
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder">
                        <div className="bg-primary/10 text-primary rounded-full w-10">
                            <span className="text-sm">
                                {isMasked ? <i className="fa-duotone fa-regular fa-user-secret"></i> : candidate.full_name[0]}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="font-bold flex items-center gap-2">
                            {isMasked && (
                                <i className="fa-duotone fa-regular fa-eye-slash text-warning" title="Anonymous"></i>
                            )}
                            {candidate.full_name}
                        </div>
                        <div className="text-sm text-base-content/70">
                            {!isMasked && candidate.email}
                            {isMasked && <span className="italic">{candidate.email}</span>}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                {application.job ? (
                    <div className="text-sm font-medium">
                        {application.job.title}
                    </div>
                ) : (
                    <span className="text-base-content/40">—</span>
                )}
            </td>
            <td>
                {application.company ? (
                    <div className="text-sm">
                        {application.company.name}
                    </div>
                ) : (
                    <span className="text-base-content/40">—</span>
                )}
            </td>
            <td>
                {application.ai_review?.fit_score}
                {application.ai_reviewed && application.ai_review ? (
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{application.ai_review.fit_score}</span>
                        <span className="text-xs text-base-content/60">/100</span>
                    </div>
                ) : application.stage === 'ai_review' ? (
                    <span className="loading loading-spinner loading-sm"></span>
                ) : (
                    <span className="text-base-content/40 text-sm">—</span>
                )}
            </td>
            <td>
                <span className={`badge ${getStageColor(application.stage)}`}>
                    {application.stage}
                </span>
            </td>
            <td>
                <div className="text-sm">{formatDate(application.created_at)}</div>
            </td>
            <td className="text-right">
                <div className="flex gap-2 justify-end">
                    <span title={chatDisabledReason || undefined}>
                        <button
                            className="btn btn-outline btn-sm"
                            disabled={!recruiterUserId || startingChat}
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!recruiterUserId) {
                                    return;
                                }
                                try {
                                    setStartingChat(true);
                                    const conversationId =
                                        await startChatConversation(
                                            getToken,
                                            recruiterUserId,
                                            {
                                                application_id: application.id,
                                                job_id: application.job?.id,
                                                company_id:
                                                    application.company?.id ??
                                                    null,
                                            },
                                        );
                                    router.push(
                                        `/portal/messages?conversationId=${conversationId}`,
                                    );
                                } catch (err: any) {
                                    console.error(
                                        "Failed to start chat:",
                                        err,
                                    );
                                    toast.error(
                                        err?.message ||
                                            "Failed to start chat",
                                    );
                                } finally {
                                    setStartingChat(false);
                                }
                            }}
                        >
                            {startingChat ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                                <i className="fa-duotone fa-regular fa-messages"></i>
                            )}
                        </button>
                    </span>
                    <Link
                        href={`/portal/applications/${application.id}`}
                        className="btn btn-primary btn-sm"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                    </Link>
                </div>
            </td>
        </tr >
    );
}

