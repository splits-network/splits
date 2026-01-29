'use client';

import Link from 'next/link';
import { formatDate, getVerificationStatusBadge, getVerificationStatusIcon } from '@/lib/utils';
import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
    ExpandedDetailSection,
} from '@/components/ui/tables';
import type { Candidate } from './candidate-card';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { startChatConversation } from '@/lib/chat-start';
import { useToast } from '@/lib/toast-context';
import { useState } from 'react';

// ===== TYPES =====

interface CandidateTableRowProps {
    candidate: Candidate;
    isRecruiter?: boolean;
}

// ===== COMPONENT =====

export function CandidateTableRow({ candidate, isRecruiter }: CandidateTableRowProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [startingChat, setStartingChat] = useState(false);
    const canChat = Boolean(candidate.user_id);
    const chatDisabledReason = canChat
        ? null
        : "This candidate isn't linked to a user yet.";
    // Get initials for avatar
    const getInitials = (name: string) => {
        const names = name.split(' ');
        const firstInitial = names[0]?.[0]?.toUpperCase() || '';
        const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || '';
        return names.length > 1 ? firstInitial + lastInitial : firstInitial;
    };

    // Main row cells
    const cells = (
        <>
            <td className="py-4">
                <div className="flex items-center gap-3">
                    {/* Candidate Avatar */}
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-primary rounded-full w-10 flex items-center justify-center text-sm font-semibold">
                            {getInitials(candidate.full_name)}
                        </div>
                    </div>
                    <div>
                        <Link
                            href={`/portal/candidates/${candidate.id}`}
                            className="font-semibold hover:text-primary transition-colors"
                        >
                            {candidate.full_name}
                        </Link>
                        <div className="text-sm text-base-content/60">
                            {candidate.email}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <div className="flex flex-wrap gap-1">
                    {candidate.verification_status && (
                        <div className={`badge badge-sm ${getVerificationStatusBadge(candidate.verification_status)} gap-1`}>
                            <i className={`fa-duotone fa-regular ${getVerificationStatusIcon(candidate.verification_status)}`}></i>
                            {candidate.verification_status.charAt(0).toUpperCase() + candidate.verification_status.slice(1)}
                        </div>
                    )}
                    {isRecruiter && (
                        <>
                            {
                                candidate.is_sourcer && (
                                    <span className="badge badge-sm badge-primary gap-1" title="You sourced this candidate">
                                        <i className="fa-duotone fa-regular fa-star"></i>
                                        Sourcer
                                    </span>
                                )
                            }
                            {candidate.has_active_relationship && (
                                <span className="badge badge-sm badge-success gap-1" title="Active relationship">
                                    <i className="fa-duotone fa-regular fa-handshake"></i>
                                    Active
                                </span>
                            )}
                            {!candidate.is_sourcer && !candidate.has_active_relationship && (
                                <span className="text-base-content/30 text-sm">—</span>
                            )}
                        </>
                    )}
                </div>
            </td>
            <td>
                <div className="flex gap-1">
                    {candidate.linkedin_url && (
                        <a
                            href={candidate.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm btn-square"
                            title="View LinkedIn Profile"
                        >
                            <i className="fa-brands fa-linkedin text-blue-600 text-sm"></i>
                        </a>
                    )}
                    {candidate.portfolio_url && (
                        <a
                            href={candidate.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm btn-square"
                            title="View Portfolio"
                        >
                            <i className="fa-duotone fa-regular fa-globe text-purple-600 text-sm"></i>
                        </a>
                    )}
                    {candidate.github_url && (
                        <a
                            href={candidate.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm btn-square"
                            title="View GitHub"
                        >
                            <i className="fa-brands fa-github text-gray-600 text-sm"></i>
                        </a>
                    )}
                    {!candidate.linkedin_url && !candidate.portfolio_url && !candidate.github_url && (
                        <span className="text-base-content/30 text-sm">—</span>
                    )}
                </div>
            </td>
            <td>
                <span className="text-xs text-base-content/70">{formatDate(candidate.created_at)}</span>
            </td>
            <td onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 justify-end">
                    <span title={chatDisabledReason || undefined}>
                        <button
                            className="btn btn-outline btn-sm"
                            title="Message Candidate"
                            disabled={!canChat || startingChat}
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (!candidate.user_id) {
                                    return;
                                }
                                try {
                                    setStartingChat(true);
                                    const conversationId =
                                        await startChatConversation(
                                            getToken,
                                            candidate.user_id,
                                            {
                                                company_id:
                                                    candidate.company_id ||
                                                    null,
                                            },
                                        );
                                    router.push(
                                        `/portal/messages/${conversationId}`,
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
                            <i className="fa-duotone fa-regular fa-messages text-xs"></i>
                        </button>
                    </span>
                    <Link
                        href={`/portal/candidates/${candidate.id}`}
                        className="btn btn-primary btn-sm"
                        title="View Details"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-right text-xs"></i>
                    </Link>
                </div>
            </td>
        </>
    );

    // Expanded content for additional details
    const expandedContent = (
        <div className="space-y-4">
            {/* Contact Information */}
            <ExpandedDetailSection title="Contact Information">
                <ExpandedDetailGrid>
                    <ExpandedDetailItem label="Email" value={
                        <a href={`mailto:${candidate.email}`} className="link link-hover">
                            {candidate.email}
                        </a>
                    } />
                    {candidate.phone && (
                        <ExpandedDetailItem label="Phone" value={
                            <a href={`tel:${candidate.phone}`} className="link link-hover">
                                {candidate.phone}
                            </a>
                        } />
                    )}
                    <ExpandedDetailItem label="Added" value={formatDate(candidate.created_at)} />
                </ExpandedDetailGrid>
            </ExpandedDetailSection>

            {/* Professional Links */}
            <ExpandedDetailSection title="Professional Links">
                <ExpandedDetailGrid>
                    {candidate.linkedin_url && (
                        <ExpandedDetailItem label="LinkedIn" value={
                            <a
                                href={candidate.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-hover flex items-center gap-2"
                            >
                                <i className="fa-brands fa-linkedin text-blue-600"></i>
                                View Profile
                            </a>
                        } />
                    )}
                    {candidate.portfolio_url && (
                        <ExpandedDetailItem label="Portfolio" value={
                            <a
                                href={candidate.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-hover flex items-center gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-globe text-purple-600"></i>
                                View Portfolio
                            </a>
                        } />
                    )}
                    {candidate.github_url && (
                        <ExpandedDetailItem label="GitHub" value={
                            <a
                                href={candidate.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-hover flex items-center gap-2"
                            >
                                <i className="fa-brands fa-github text-gray-600"></i>
                                View Profile
                            </a>
                        } />
                    )}
                </ExpandedDetailGrid>
            </ExpandedDetailSection>

            {/* Status and Relationship Info */}
            {isRecruiter && (
                <ExpandedDetailSection title="Relationship">
                    <ExpandedDetailGrid>
                        <ExpandedDetailItem label="Verification Status" value={
                            candidate.verification_status && (
                                <div className={`badge badge-sm ${getVerificationStatusBadge(candidate.verification_status)} gap-1 w-fit`}>
                                    <i className={`fa-duotone fa-regular ${getVerificationStatusIcon(candidate.verification_status)}`}></i>
                                    {candidate.verification_status.charAt(0).toUpperCase() + candidate.verification_status.slice(1)}
                                </div>
                            )
                        } />
                        {candidate.is_sourcer && (
                            <ExpandedDetailItem label="Sourcing" value={
                                <span className="badge badge-sm badge-primary gap-1">
                                    <i className="fa-duotone fa-regular fa-star"></i>
                                    You sourced this
                                </span>
                            } />
                        )}
                        {candidate.has_active_relationship && (
                            <ExpandedDetailItem label="Status" value={
                                <span className="badge badge-sm badge-success gap-1">
                                    <i className="fa-duotone fa-regular fa-handshake"></i>
                                    Active relationship
                                </span>
                            } />
                        )}
                    </ExpandedDetailGrid>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-base-300">
                        <Link
                            href={`/portal/candidates/${candidate.id}`}
                            className="btn btn-primary btn-sm gap-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <i className="fa-duotone fa-regular fa-eye"></i>
                            View Pipeline
                        </Link>
                        <span title={chatDisabledReason || undefined}>
                            <button
                                className="btn btn-outline btn-sm gap-2"
                                disabled={!canChat || startingChat}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!candidate.user_id) {
                                        return;
                                    }
                                    try {
                                        setStartingChat(true);
                                        const conversationId =
                                            await startChatConversation(
                                                getToken,
                                                candidate.user_id,
                                                {
                                                    company_id:
                                                        candidate.company_id ||
                                                        null,
                                                },
                                            );
                                        router.push(
                                            `/portal/messages/${conversationId}`,
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
                                <i className="fa-duotone fa-regular fa-messages"></i>
                                Message
                            </button>
                        </span>
                        <Link
                            href={`/portal/candidates/${candidate.id}?tab=candidates`}
                            className="btn btn-outline btn-sm gap-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <i className="fa-duotone fa-regular fa-user-plus"></i>
                            Send Job
                        </Link>
                    </div>
                </ExpandedDetailSection>
            )}
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`candidate-${candidate.id}`}
            cells={cells}
            expandedContent={expandedContent}
            showToggle={true}
        />
    );
}
