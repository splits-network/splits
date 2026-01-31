"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import {
    getApplicationStageBadge,
    getApplicationStageClass,
} from "@/lib/utils/badge-styles";
import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
    ExpandedDetailSection,
} from "@/components/ui/tables";
import type { Application } from "./application-card";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import { useState } from "react";

// ===== TYPES =====

interface Badge {
    class: string;
    icon: string;
    text?: string;
    tooltip?: string;
    animated?: boolean;
}

interface ApplicationTableRowProps {
    application: Application;
    canAccept?: boolean;
    isAccepting?: boolean;
    onAccept?: () => void;
    getStageColor?: (stage: string) => string;
    formatDate: (date: string | Date) => string;
    isSelected?: boolean;
    onToggleSelect?: () => void;
    isRecruiter?: boolean;
    isCompanyUser?: boolean;
}

// Get AI recommendation badge
function getAIRecommendationBadge(recommendation: string): string {
    switch (recommendation) {
        case "strong_fit":
            return "badge-success";
        case "good_fit":
            return "badge-info";
        case "fair_fit":
            return "badge-warning";
        case "poor_fit":
            return "badge-error";
        default:
            return "badge-ghost";
    }
}

// ===== COMPONENT =====

export function ApplicationTableRow({
    application,
    canAccept = false,
    isAccepting = false,
    onAccept,
    getStageColor = getApplicationStageClass,
    formatDate,
    isSelected = false,
    onToggleSelect,
    isRecruiter = false,
    isCompanyUser = false,
}: ApplicationTableRowProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [startingChat, setStartingChat] = useState(false);
    const companyName =
        application.company_name ||
        application.job?.company?.name ||
        "Unknown Company";
    const hasAIReview = application.ai_reviewed && application.ai_review;
    const isMasked = application.candidate._masked;
    const canChat = Boolean(application.candidate.user_id);
    const chatDisabledReason = canChat
        ? null
        : "Candidate isn't linked to a user yet.";

    // Calculate badges
    const badges: Badge[] = [];

    if (application.accepted_by_company) {
        badges.push({
            class: "badge-success",
            icon: "fa-check-circle",
            text: "Accepted",
            tooltip: "Accepted by company",
        });
    }

    if (hasAIReview) {
        badges.push({
            class: getAIRecommendationBadge(
                application.ai_review!.recommendation,
            ),
            icon: "fa-robot",
            text: `AI: ${application.ai_review!.fit_score}%`,
            tooltip: `AI Fit Score: ${application.ai_review!.recommendation.replace("_", " ")}`,
        });
    }

    if (application.stage === "screen") {
        badges.push({
            class: "badge-warning",
            icon: "fa-clock",
            text: "Awaiting Review",
            tooltip: "Pending company review",
            animated: true,
        });
    }

    if (isMasked) {
        badges.push({
            class: "badge-warning",
            icon: "fa-eye-slash",
            text: "Anonymous",
            tooltip: "Anonymous candidate",
        });
    }

    // Main row cells
    const cells = (
        <>
            <td className="py-4">
                <div className="flex items-center gap-3">
                    {/* Candidate Avatar */}
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-base-content/70 w-10 rounded-full flex items-center justify-center text-sm font-semibold">
                            {isMasked ? (
                                <i className="fa-duotone fa-regular fa-user-secret"></i>
                            ) : (
                                application.candidate.full_name[0].toUpperCase()
                            )}
                        </div>
                    </div>
                    <div className="text-sm min-w-0">
                        <span
                            className="font-semibold whitespace-pre-line flex items-center gap-2"
                            title={application.candidate.full_name}
                        >
                            {application.candidate.full_name}
                            {isMasked && (
                                <i
                                    className="fa-duotone fa-regular fa-eye-slash text-warning"
                                    title="Anonymous"
                                ></i>
                            )}
                        </span>
                        <div className="text-sm text-base-content/60">
                            {!isMasked && application.candidate.email}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <span className="text-sm">{application.job.title}</span>
            </td>
            <td>
                <span className="text-sm">{companyName}</span>
            </td>
            <td>
                {hasAIReview ? (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">
                            {application.ai_review!.fit_score}
                        </span>
                        <span className="text-xs text-base-content/60">
                            /100
                        </span>
                    </div>
                ) : application.stage === "ai_review" ? (
                    <span className="loading loading-spinner loading-sm"></span>
                ) : (
                    <span className="text-base-content/30">—</span>
                )}
            </td>
            <td>
                <div
                    className={`badge badge-sm ${getStageColor(application.stage)}`}
                >
                    {application.stage}
                </div>
            </td>
            <td>
                <span className="text-sm text-base-content/60">
                    {formatRelativeTime(application.created_at)}
                </span>
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
                                if (!application.candidate.user_id) {
                                    return;
                                }
                                try {
                                    setStartingChat(true);
                                    const conversationId =
                                        await startChatConversation(
                                            getToken,
                                            application.candidate.user_id,
                                            {
                                                application_id:
                                                    application.id,
                                                job_id: application.job.id,
                                                company_id:
                                                    application.job.company?.id ??
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
                            <i className="fa-duotone fa-regular fa-messages text-xs"></i>
                        </button>
                    </span>
                    {canAccept && isCompanyUser && onAccept && (
                        <button
                            onClick={onAccept}
                            className="btn btn-ghost btn-sm btn-square"
                            disabled={isAccepting}
                            title="Accept Application"
                        >
                            {isAccepting ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                                <i className="fa-duotone fa-regular fa-check text-xs"></i>
                            )}
                        </button>
                    )}
                    <Link
                        href={`/portal/applications/${application.id}`}
                        className="btn btn-primary btn-sm"
                        title="View Details"
                    >
                        View
                    </Link>
                </div>
            </td>
        </>
    );

    // Expanded content
    const expandedContent = (
        <div className="space-y-4">
            {/* Badges Row */}
            {badges.length > 0 && (
                <ExpandedDetailSection title="Status Indicators">
                    <div className="flex flex-wrap gap-2">
                        {badges.map((badge: Badge, idx: number) => (
                            <span
                                key={idx}
                                className={`badge ${badge.class} gap-1.5 ${badge.animated ? "animate-pulse" : ""}`}
                                title={badge.tooltip}
                            >
                                <i
                                    className={`fa-duotone fa-regular ${badge.icon}`}
                                ></i>
                                {badge.text}
                            </span>
                        ))}
                    </div>
                </ExpandedDetailSection>
            )}

            {/* Details Grid */}
            <ExpandedDetailGrid cols={4}>
                <ExpandedDetailItem
                    icon="fa-user"
                    label="Candidate"
                    value={
                        <div>
                            <div>{application.candidate.full_name}</div>
                            {!isMasked && (
                                <div className="text-xs text-base-content/50">
                                    {application.candidate.email}
                                </div>
                            )}
                        </div>
                    }
                />
                <ExpandedDetailItem
                    icon="fa-building"
                    label="Company"
                    value={companyName}
                />
                <ExpandedDetailItem
                    icon="fa-briefcase"
                    label="Job Title"
                    value={application.job.title}
                />
                {application.recruiter && (
                    <ExpandedDetailItem
                        icon="fa-user-tie"
                        label="Recruiter"
                        value={
                            <div>
                                <div>{application.recruiter.name}</div>
                                <div className="text-xs text-base-content/50">
                                    {application.recruiter.email}
                                </div>
                            </div>
                        }
                    />
                )}
            </ExpandedDetailGrid>

            {/* Second Row - Stats */}
            <ExpandedDetailGrid cols={4}>
                <ExpandedDetailItem
                    icon="fa-robot"
                    label="AI Fit Score"
                    value={
                        hasAIReview ? (
                            <span className="text-success font-semibold">
                                {application.ai_review!.fit_score}/100
                            </span>
                        ) : (
                            "Not reviewed"
                        )
                    }
                />
                <ExpandedDetailItem
                    icon="fa-signal"
                    label="Stage"
                    value={
                        <span
                            className={`badge badge-sm ${getStageColor(application.stage)}`}
                        >
                            {application.stage}
                        </span>
                    }
                />
                <ExpandedDetailItem
                    icon="fa-calendar"
                    label="Submitted"
                    value={formatRelativeTime(application.created_at)}
                />
                {application.accepted_by_company && application.accepted_at && (
                    <ExpandedDetailItem
                        icon="fa-check-circle"
                        label="Accepted"
                        value={formatRelativeTime(application.accepted_at)}
                    />
                )}
            </ExpandedDetailGrid>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-base-300">
                <Link
                    href={`/portal/applications/${application.id}`}
                    className="btn btn-primary btn-sm gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <i className="fa-duotone fa-regular fa-eye"></i>
                    View Details
                </Link>
                <span title={chatDisabledReason || undefined}>
                    <button
                        className="btn btn-outline btn-sm gap-2"
                        disabled={!canChat || startingChat}
                        onClick={async (e) => {
                            e.stopPropagation();
                            if (!application.candidate.user_id) {
                                return;
                            }
                            try {
                                setStartingChat(true);
                                const conversationId =
                                    await startChatConversation(
                                        getToken,
                                        application.candidate.user_id,
                                        {
                                            application_id: application.id,
                                            job_id: application.job.id,
                                            company_id:
                                                application.job.company?.id ??
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
                                    err?.message || "Failed to start chat",
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
                        Message
                    </button>
                </span>
                <Link
                    href={`/portal/applications/${application.id}?tab=timeline`}
                    className="btn btn-outline btn-sm gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <i className="fa-duotone fa-regular fa-clock-rotate-left"></i>
                    View Timeline
                </Link>
                {canAccept &&
                    isCompanyUser &&
                    onAccept &&
                    !application.accepted_by_company && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAccept();
                            }}
                            className="btn btn-success btn-sm gap-2"
                            disabled={isAccepting}
                        >
                            {isAccepting ? (
                                <>
                                    <span className="loading loading-spinner loading-xs"></span>
                                    Accepting...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check"></i>
                                    Accept Application
                                </>
                            )}
                        </button>
                    )}
            </div>
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`application-${application.id}`}
            cells={cells}
            expandedContent={expandedContent}
            showToggle={true}
        />
    );
}

