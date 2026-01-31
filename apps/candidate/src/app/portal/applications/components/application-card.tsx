'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { getStatusColor, formatStage } from '@/lib/application-utils';
import { EntityCard, DataList, DataRow, VerticalDataRow, InteractiveDataRow } from '@/components/ui';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { startChatConversation } from '@/lib/chat-start';
import { useToast } from '@/lib/toast-context';
import { usePresence } from '@/hooks/use-presence';
import { Presence } from '@/components/presense';

interface ApplicationCardProps {
    application: {
        id: string;
        stage: string;
        created_at: string;
        updated_at: string;
        ai_reviewed?: boolean;
        job_id: string;
        recruiter_notes?: string;
        job?: {
            title?: string;
            location?: string;
            candidate_description?: string;
            job_requirements?: {
                requirement_type: string;
                description: string;
            }[];
            company?: {
                id?: string;
                name?: string;
                industry?: string;
                headquarters_location?: string;
                logo_url?: string;
            };
        };
        recruiter?: {
            user?: {
                id?: string;
                name?: string;
                email?: string;
            };
        };
        ai_review?: {
            fit_score: number;
            recommendation: 'strong_fit' | 'good_fit' | 'fair_fit' | 'poor_fit';
        };
    }
}

export default function ApplicationCard({ application: app }: ApplicationCardProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startingChat, setStartingChat] = useState(false);
    const modalRef = useRef<HTMLDialogElement>(null);

    // Handle modal open/close
    useEffect(() => {
        if (isModalOpen && modalRef.current) {
            modalRef.current.showModal();
        }
    }, [isModalOpen]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        modalRef.current?.close();
    };

    // Compute initials for company logo
    const companyInitial = (app.job?.company?.name || 'C')[0].toUpperCase();

    const recruiterUserId = app.recruiter?.user?.id;
    const chatDisabledReason = recruiterUserId
        ? null
        : "Your recruiter isn't linked to a user yet.";
    const presence = usePresence([recruiterUserId], {
        enabled: Boolean(recruiterUserId),
    });
    const presenceStatus = recruiterUserId
        ? presence[recruiterUserId]?.status
        : undefined;

    return (
        <EntityCard className="group hover:shadow-lg transition-all duration-200">
            <EntityCard.Header>
                <div className="flex items-center gap-3 min-w-0">
                    <div className='flex justify-between w-full items-center'>
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Company Logo/Avatar */}
                            <div className="avatar avatar-placeholder shrink-0">
                                <div className="bg-primary/10 text-primary rounded-full w-12 flex items-center justify-center font-bold text-lg">
                                    {app.job?.company?.logo_url ? (
                                        <img
                                            src={app.job.company.logo_url}
                                            alt={`${app.job?.company.name} logo`}
                                            className="w-full h-full object-cover rounded-full"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                if (e.currentTarget.nextElementSibling) {
                                                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                                }
                                            }}
                                        />
                                    ) : null}
                                    <span className={app.job?.company?.logo_url ? 'hidden' : ''}>
                                        {companyInitial}
                                    </span>
                                </div>
                            </div>
                            {/* Job Title and Company */}
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-base leading-tight truncate">
                                    {app.job?.title || 'Unknown Position'}
                                </h3>
                                <p className="text-sm text-base-content/60 truncate">
                                    {app.job?.company?.name || 'Unknown Company'}
                                </p>
                            </div>
                        </div>
                        {/* Status Badge */}
                        <div className="flex items-center gap-2 ml-4">
                            <div className={`badge ${getStatusColor(app.stage)} badge-sm font-semibold whitespace-nowrap`}>
                                {formatStage(app.stage)}
                            </div>
                        </div>
                    </div>
                </div>
            </EntityCard.Header>

            <EntityCard.Body>
                {/* Data Rows */}
                <DataList compact={false}>
                    <InteractiveDataRow
                        icon="fa-briefcase"
                        label="Description"
                    >
                        <div onClick={handleOpenModal} className="text-sm font-medium cursor-pointer text-primary hover:underline">
                            <i className='fa-duotone fa-regular fa-eye mr-2'></i>
                            View Job Description
                        </div>
                    </InteractiveDataRow>
                    <DataRow
                        icon="fa-location-dot"
                        label="Location"
                        value={app.job?.location || app.job?.company?.headquarters_location || 'Not specified'}
                    />
                    {app.job?.company?.industry && (
                        <DataRow
                            icon="fa-industry"
                            label="Industry"
                            value={app.job.company.industry}
                        />
                    )}
                    {app.recruiter?.user?.name && (
                        <DataRow
                            icon="fa-user"
                            label="Recruiter"
                            value={app.recruiter.user.name}
                        />
                    )}
                    {app.recruiter_notes && (
                        <VerticalDataRow
                            icon="fa-comment"
                            label="Notes"
                            value={app.recruiter_notes}
                        />
                    )}
                    <DataRow
                        icon="fa-calendar"
                        label="Applied"
                        value={formatDate(app.created_at)}
                    />
                    {app.ai_reviewed && (
                        <DataRow
                            icon="fa-sparkles"
                            label="AI Reviewed"
                        >
                            <span className="badge badge-sm badge-success gap-1">
                                <i className="fa-duotone fa-regular fa-check"></i>
                                Reviewed
                            </span>
                        </DataRow>
                    )}
                    {app.ai_review && (
                        <DataRow
                            icon="fa-robot"
                            label="AI Fit Score"
                        >
                            <div className="flex items-center gap-2">
                                {app.ai_review.recommendation && (
                                    <span className={`badge badge-sm ${app.ai_review.recommendation === 'strong_fit' ? 'badge-success' :
                                        app.ai_review.recommendation === 'good_fit' ? 'badge-info' :
                                            app.ai_review.recommendation === 'fair_fit' ? 'badge-warning' : 'badge-error'
                                        } gap-1`}>
                                        {app.ai_review.recommendation === 'strong_fit' && 'Strong Fit'}
                                        {app.ai_review.recommendation === 'good_fit' && 'Good Fit'}
                                        {app.ai_review.recommendation === 'fair_fit' && 'Fair Fit'}
                                        {app.ai_review.recommendation === 'poor_fit' && 'Poor Fit'}
                                    </span>
                                )}
                                <div
                                    className={`radial-progress ${app.ai_review.fit_score >= 75 ? 'text-success' :
                                        app.ai_review.fit_score >= 50 ? 'text-warning' :
                                            'text-error'
                                        }`}
                                    style={{ '--value': `${app.ai_review.fit_score}`, '--size': '2rem' } as React.CSSProperties}
                                >
                                    {app.ai_review.fit_score}
                                </div>
                            </div>
                        </DataRow>
                    )}
                </DataList>
            </EntityCard.Body>

            <EntityCard.Footer>
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-base-content/50">
                        Updated {formatDate(app.updated_at)}
                    </span>
                    <div className="flex items-center gap-2">
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
                                                    application_id: app.id,
                                                    job_id: app.job_id,
                                                    company_id:
                                                        app.job?.company?.id ??
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
                                    <span className="inline-flex items-center gap-2">
                                        <Presence status={presenceStatus} />
                                        Message
                                    </span>
                                )}
                            </button>
                        </span>
                        <Link
                            href={`/portal/applications/${app.id}`}
                            className="btn btn-primary btn-sm"
                        >
                            View Details
                            <i className="fa-duotone fa-regular fa-arrow-right ml-1.5"></i>
                        </Link>
                    </div>
                </div>
            </EntityCard.Footer>

            {/* Job Details Modal */}
            <dialog ref={modalRef} className="modal">
                <div className="modal-box max-w-6xl max-h-[90vh] overflow-y-auto bg-base-300">
                    <form method="dialog" className='flex items-center '>
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg"></i>
                        </button>
                    </form>

                    <h3 className="font-bold text-2xl mb-4">
                        {app.job?.title || 'Job Details'}
                    </h3>

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Company Section */}
                        <div className='flex flex-col basis-2/3'>
                            <div className='card bg-base-100'>
                                {app.job?.candidate_description && (
                                    <div className="card card-border">
                                        <div className="card-body">
                                            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                <i className="fa-duotone fa-regular fa-file-lines"></i>
                                                Job Description
                                            </h4>
                                            <p className="text-sm whitespace-pre-wrap">{app.job?.candidate_description}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='flex flex-col basis-1/3 gap-4'>
                            {/* Job Section */}
                            <div className="card bg-base-200">
                                <div className="card-body">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-briefcase"></i>
                                        Requirements
                                    </h4>
                                    <DataList compact={false}>
                                        {app.job?.job_requirements && app.job.job_requirements.length > 0 ? (
                                            app.job.job_requirements.toSorted((a, b) => a.requirement_type.localeCompare(b.requirement_type)).map((req, index) => (
                                                <VerticalDataRow
                                                    key={index}
                                                    icon="fa-check"
                                                    label={req.requirement_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                    labelColor="text-error"
                                                    value={req.description}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-sm text-base-content/60">No specific requirements listed.</p>
                                        )}
                                    </DataList>
                                </div>
                            </div>

                            <div className="modal-action">
                                <button type="button" onClick={handleCloseModal} className="btn">
                                    Close
                                </button>
                                <Link href={`/portal/applications/${app.id}`} className="btn btn-primary">
                                    View Full Application
                                    <i className="fa-duotone fa-regular fa-arrow-right ml-1.5"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </dialog>
        </EntityCard>
    );
}


