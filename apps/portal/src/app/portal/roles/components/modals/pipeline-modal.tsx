"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { ModalPortal } from "@splits-network/shared-ui";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselTabBar,
    BaselEmptyState,
} from "@splits-network/basel-ui";
import ActionsToolbar from "@/app/portal/applications/components/shared/actions-toolbar";
import DocumentList from "@/components/document-list";
import type { Application } from "@/app/portal/applications/types";
import type { ApplicationStage } from "@splits-network/shared-types";

/* ─── Stage definitions ──────────────────────────────────────────────────── */

const stages: Array<{ key: ApplicationStage; label: string; color: string }> = [
    { key: "recruiter_proposed", label: "Proposed", color: "bg-secondary/15 text-secondary" },
    { key: "screen", label: "Screen", color: "bg-info/15 text-info" },
    { key: "submitted", label: "Submitted", color: "bg-base-300 text-base-content" },
    { key: "company_review", label: "Company Review", color: "bg-accent/15 text-accent" },
    { key: "interview", label: "Interview", color: "bg-primary/15 text-primary" },
    { key: "offer", label: "Offer", color: "bg-warning/15 text-warning" },
    { key: "hired", label: "Hired", color: "bg-success/15 text-success" },
    { key: "rejected", label: "Rejected", color: "bg-error/15 text-error" },
];

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface PipelineModalProps {
    isOpen: boolean;
    roleId: string;
    roleTitle?: string;
    onClose: () => void;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function PipelineModal({
    isOpen,
    roleId,
    roleTitle,
    onClose,
}: PipelineModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { isAdmin } = useUserProfile();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchApplications();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleId, isOpen]);

    const fetchApplications = async () => {
        try {
            const token = await getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const response: any = await client.get("/applications", {
                params: {
                    filters: { job_id: roleId },
                    include: "candidate,job,company",
                },
            });
            setApplications(response.data || []);
        } catch (error) {
            console.error("Failed to fetch applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStageChange = async (
        applicationId: string,
        newStage: ApplicationStage,
    ) => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${applicationId}`, {
                stage: newStage,
            });
            await fetchApplications();
        } catch (error) {
            console.error("Failed to update stage:", error);
            toast.error("Failed to update stage");
        }
    };

    /* ─── Filtering ── */

    const needsPreScreenCount = applications.filter(
        (app) => !app.candidate_recruiter_id && app.stage === "submitted",
    ).length;

    const filteredApplications =
        activeTab === "needs_prescreen"
            ? applications.filter(
                  (app) => !app.candidate_recruiter_id && app.stage === "submitted",
              )
            : activeTab !== "all"
              ? applications.filter((app) => app.stage === activeTab)
              : applications;

    /* ─── Tabs ── */

    const tabs = [
        { label: "All", value: "all", count: applications.length },
        ...(needsPreScreenCount > 0
            ? [{ label: "Needs Pre-Screen", value: "needs_prescreen", count: needsPreScreenCount }]
            : []),
        ...stages.map((s) => ({
            label: s.label,
            value: s.key,
            count: applications.filter((a) => a.stage === s.key).length,
        })),
    ];

    return (
        <ModalPortal>
            <BaselModal
                isOpen={isOpen}
                onClose={onClose}
                maxWidth="max-w-5xl"
                className="!h-[85vh]"
            >
                <BaselModalHeader
                    title="Candidate Pipeline"
                    subtitle={roleTitle}
                    icon="fa-users-line"
                    iconColor="accent"
                    onClose={onClose}
                />

                {/* Tabs below header */}
                <div className="border-b border-base-300 overflow-x-auto">
                    <BaselTabBar
                        tabs={tabs}
                        active={activeTab}
                        onChange={setActiveTab}
                        className="px-6"
                    />
                </div>

                <BaselModalBody padding="p-0" scrollable>
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                    Loading pipeline...
                                </span>
                            </div>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="py-16 px-6">
                            <BaselEmptyState
                                icon="fa-duotone fa-regular fa-users"
                                title={
                                    activeTab === "needs_prescreen"
                                        ? "No Applications Need Pre-Screen"
                                        : activeTab !== "all"
                                          ? `No candidates in ${stages.find((s) => s.key === activeTab)?.label}`
                                          : "No Candidates Yet"
                                }
                                description={
                                    activeTab === "needs_prescreen"
                                        ? "All direct applications have been assigned to recruiters"
                                        : activeTab !== "all"
                                          ? "Try selecting a different stage"
                                          : "Be the first to submit a candidate for this role"
                                }
                            />
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-base-200 border-b border-base-300">
                                    <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 w-8" />
                                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                        Candidate
                                    </th>
                                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                        Stage
                                    </th>
                                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                        Submitted
                                    </th>
                                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.map((application) => {
                                    const stage = stages.find((s) => s.key === application.stage);
                                    const isExpanded = expandedCandidate === application.candidate_id;
                                    const candidateName = application.candidate?.full_name ?? "Unknown";
                                    const initials = candidateName
                                        .split(" ")
                                        .filter(Boolean)
                                        .map((n: string) => n[0])
                                        .slice(0, 2)
                                        .join("")
                                        .toUpperCase();

                                    return (
                                        <React.Fragment key={application.id}>
                                            <tr className="border-b border-base-300 hover:bg-base-200/50 transition-colors">
                                                <td className="px-6 py-3">
                                                    <button
                                                        className="btn btn-ghost btn-xs btn-square"
                                                        onClick={() =>
                                                            setExpandedCandidate(
                                                                isExpanded ? null : application.candidate_id,
                                                            )
                                                        }
                                                    >
                                                        <i
                                                            className={`fa-duotone fa-regular fa-chevron-${isExpanded ? "down" : "right"} text-base-content/40`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 flex items-center justify-center bg-neutral text-neutral-content text-xs font-bold flex-shrink-0">
                                                            {initials}
                                                        </div>
                                                        <span className="font-semibold text-sm">
                                                            {candidateName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {isAdmin ? (
                                                        <select
                                                            className="select select-xs text-[10px] uppercase tracking-[0.15em] font-bold bg-base-200 border-0"
                                                            style={{ borderRadius: 0 }}
                                                            value={application.stage || ""}
                                                            onChange={(e) =>
                                                                handleStageChange(
                                                                    application.id,
                                                                    e.target.value as ApplicationStage,
                                                                )
                                                            }
                                                        >
                                                            {stages.map((s) => (
                                                                <option key={s.key} value={s.key}>
                                                                    {s.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span
                                                            className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 ${stage?.color || "bg-base-200 text-base-content/50"}`}
                                                        >
                                                            {stage?.label || application.stage}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-base-content/60">
                                                    {application.created_at
                                                        ? new Date(application.created_at).toLocaleDateString()
                                                        : "-"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <ActionsToolbar
                                                        application={application}
                                                        variant="icon-only"
                                                        size="xs"
                                                        showActions={{ viewDetails: false }}
                                                        onRefresh={fetchApplications}
                                                    />
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={5} className="bg-base-200/50 border-b border-base-300">
                                                        <div className="px-6 py-4">
                                                            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 mb-3 flex items-center gap-2">
                                                                <i className="fa-duotone fa-regular fa-paperclip" />
                                                                Documents
                                                            </h4>
                                                            <DocumentList
                                                                entityType="candidate"
                                                                entityId={application.candidate_id!}
                                                                showUpload={true}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </BaselModalBody>
            </BaselModal>
        </ModalPortal>
    );
}
