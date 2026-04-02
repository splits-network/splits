"use client";

import { useState } from "react";
import { BaselTabBar } from "@splits-network/basel-ui";
import { ApplicationDetailHeader } from "./application-detail-header";
import { ApplicationOverviewTab } from "./application-overview-tab";
import { ApplicationRoleTab } from "./application-role-tab";
import { ApplicationDocumentsTab } from "./application-documents-tab";
import { ApplicationNotesTab } from "./application-notes-tab";
import AIReviewPanel from "./ai-review-panel";
import { TailoredResumeSection } from "./tailored-resume-section";
import { ApplicationCallsSection } from "./application-calls-section";
import ApplicationTimeline from "./application-timeline";
import type { Application } from "../../types";

type TabKey =
    | "overview"
    | "role"
    | "resume"
    | "documents"
    | "ai_review"
    | "notes"
    | "calls"
    | "timeline";

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "fa-clipboard" },
    { key: "role", label: "Role", icon: "fa-briefcase" },
    { key: "resume", label: "Smart Resume", icon: "fa-file-user" },
    { key: "documents", label: "Documents", icon: "fa-file" },
    { key: "ai_review", label: "AI Analysis", icon: "fa-brain" },
    { key: "notes", label: "Notes", icon: "fa-comments" },
    { key: "calls", label: "Calls", icon: "fa-phone" },
    { key: "timeline", label: "Timeline", icon: "fa-timeline" },
];

interface ApplicationDetailPanelProps {
    application: Application;
    onClose?: () => void;
    onRefresh?: () => void;
}

export function ApplicationDetailPanel({
    application,
    onClose,
    onRefresh,
}: ApplicationDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("overview");

    const documents = application.documents || [];
    const auditLogs = application.timeline || application.audit_log || [];

    return (
        <div className="flex flex-col h-full bg-base-100">
            <ApplicationDetailHeader
                application={application}
                onClose={onClose}
                onRefresh={onRefresh}
            />

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
                    <ApplicationOverviewTab
                        application={application}
                        onRefresh={onRefresh}
                    />
                )}
                {activeTab === "role" && (
                    <ApplicationRoleTab application={application} />
                )}
                {activeTab === "resume" && (
                    (application as any).candidate_id && (application as any).job_id ? (
                        <TailoredResumeSection
                            candidateId={(application as any).candidate_id}
                            jobId={(application as any).job_id}
                            applicationId={application.id}
                        />
                    ) : (
                        <EmptyState
                            icon="fa-file-user"
                            message="Smart resume is not available for this application."
                        />
                    )
                )}
                {activeTab === "documents" && (
                    <ApplicationDocumentsTab documents={documents} />
                )}
                {activeTab === "ai_review" && (
                    <AIReviewPanel
                        applicationId={application.id}
                        variant="full"
                    />
                )}
                {activeTab === "notes" && (
                    <ApplicationNotesTab applicationId={application.id} />
                )}
                {activeTab === "calls" && (
                    <ApplicationCallsSection applicationId={application.id} />
                )}
                {activeTab === "timeline" && (
                    auditLogs.length > 0 ? (
                        <ApplicationTimeline
                            auditLogs={auditLogs}
                            currentStage={application.stage}
                        />
                    ) : (
                        <EmptyState
                            icon="fa-timeline"
                            message="No timeline events yet."
                        />
                    )
                )}
            </div>
        </div>
    );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
    return (
        <div className="text-center p-8 text-base-content/50">
            <i className={`fa-duotone fa-regular ${icon} text-4xl mb-2 block`} />
            <p>{message}</p>
        </div>
    );
}
