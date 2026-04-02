"use client";

import { useState } from "react";
import { BaselTabBar } from "@splits-network/basel-ui";
import { ApplicationDetailHeader } from "./application-detail-header";
import { ApplicationOverviewTab } from "./application-overview-tab";
import { ApplicationCandidateDetail } from "./application-candidate-detail";
import { ApplicationRoleDetail } from "./application-role-detail";
import { TailoredResumeTab } from "./tailored-resume-tab";
import { ApplicationDocumentsTab } from "./application-documents-tab";
import AIReviewPanel from "@/components/basel/applications/ai-review-panel";
import { ApplicationNotesTab } from "./application-notes-tab";
import { ApplicationCallsTab } from "./application-calls-tab";
import ApplicationTimeline from "./application-timeline";
import { ExpiredBanner } from "./expired-banner";
import type { Application } from "../../types";

type TabKey =
    | "overview"
    | "candidate"
    | "job"
    | "resume"
    | "documents"
    | "ai_review"
    | "calls"
    | "notes"
    | "timeline";

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "fa-clipboard" },
    { key: "candidate", label: "Candidate", icon: "fa-user" },
    { key: "job", label: "Role", icon: "fa-briefcase" },
    { key: "resume", label: "Smart Resume", icon: "fa-file-user" },
    { key: "documents", label: "Documents", icon: "fa-file" },
    { key: "ai_review", label: "AI Analysis", icon: "fa-brain" },
    { key: "calls", label: "Calls", icon: "fa-phone" },
    { key: "notes", label: "Notes", icon: "fa-comments" },
    { key: "timeline", label: "Timeline", icon: "fa-timeline" },
];

interface ApplicationDetailPanelProps {
    application: Application;
    onClose: () => void;
    onRefresh: () => void;
}

export function ApplicationDetailPanel({
    application,
    onClose,
    onRefresh,
}: ApplicationDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("overview");

    const isExpired = !!(application as any).expired_at;
    const documents = application.documents || [];
    const auditLogs =
        application.timeline || (application as any).audit_log || [];

    return (
        <div className="flex flex-col h-full bg-base-100">
            <ApplicationDetailHeader
                application={application}
                onClose={onClose}
                onRefresh={onRefresh}
            />

            {isExpired && (
                <ExpiredBanner
                    applicationId={application.id}
                    onReactivated={onRefresh}
                />
            )}

            <BaselTabBar
                tabs={TABS.map((tab) => ({
                    label: tab.label,
                    value: tab.key,
                    icon: `fa-duotone fa-regular ${tab.icon}`,
                    count:
                        tab.key === "documents" && documents.length > 0
                            ? documents.length
                            : undefined,
                }))}
                active={activeTab}
                onChange={(v) => setActiveTab(v as TabKey)}
                className="bg-base-100 border-b border-base-300 shrink-0"
            />

            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
                {activeTab === "overview" && (
                    <ApplicationOverviewTab application={application} />
                )}
                {activeTab === "candidate" &&
                    (application.candidate ? (
                        <ApplicationCandidateDetail
                            candidate={application.candidate as any}
                        />
                    ) : (
                        <EmptyState
                            icon="fa-user"
                            message="No candidate data on file for this application."
                        />
                    ))}
                {activeTab === "job" &&
                    (application.job ? (
                        <ApplicationRoleDetail job={application.job as any} />
                    ) : (
                        <EmptyState
                            icon="fa-briefcase"
                            message="No role data on file for this application."
                        />
                    ))}
                {activeTab === "resume" && (
                    <TailoredResumeTab
                        candidateId={(application as any).candidate_id || application.candidate?.id}
                        jobId={(application as any).job_id || application.job?.id}
                        applicationId={application.id}
                    />
                )}
                {activeTab === "documents" && (
                    <ApplicationDocumentsTab application={application} />
                )}
                {activeTab === "ai_review" && (
                    <AIReviewPanel applicationId={application.id} />
                )}
                {activeTab === "calls" && (
                    <ApplicationCallsTab
                        applicationId={application.id}
                        applicationTitle={`${application.candidate?.full_name || "Candidate"} — ${application.job?.title || "Application"}`}
                    />
                )}
                {activeTab === "notes" && (
                    <ApplicationNotesTab applicationId={application.id} />
                )}
                {activeTab === "timeline" && (
                    <ApplicationTimeline
                        auditLogs={auditLogs}
                        currentStage={application.stage || "draft"}
                    />
                )}
            </div>
        </div>
    );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
    return (
        <div className="text-center p-8 text-base-content/50">
            <i className={`fa-duotone ${icon} text-4xl mb-2 block`} />
            <p>{message}</p>
        </div>
    );
}
