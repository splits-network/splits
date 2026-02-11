"use client";

import { DataRow, DataList, MetricCard } from "@/components/ui/cards";
import { formatDate } from "@/lib/utils";
import { Application, getDisplayStatus } from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

interface ItemProps {
    item: Application;
    onViewDetails: () => void;
    onMessage?: (
        conversationId: string,
        candidateName: string,
        candidateUserId: string,
        context?: any,
    ) => void;
}

export default function Item({ item, onViewDetails, onMessage }: ItemProps) {
    const status = getDisplayStatus(item);

    return (
        <MetricCard className="group hover:shadow-lg transition-all duration-200">
            <MetricCard.Header>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="avatar avatar-placeholder shrink-0">
                            <div className="bg-primary/10 text-primary w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold">
                                {(item.candidate?.full_name ||
                                    "U")[0].toUpperCase()}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h3
                                className="font-semibold text-base-content group-hover:text-primary transition-colors truncate"
                                title={item.candidate?.full_name || "Unknown"}
                            >
                                {item.candidate?.full_name || "Unknown"}
                            </h3>
                            <p
                                className="text-sm text-base-content/60 truncate"
                                title={item.candidate?.email || "N/A"}
                            >
                                {item.candidate?.email || "N/A"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        <span
                            className={`badge ${status.badgeClass} badge-sm gap-1.5`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${status.icon}`}
                            />
                            {status.label}
                        </span>
                    </div>
                </div>
            </MetricCard.Header>

            <MetricCard.Body>
                <DataList compact>
                    <DataRow
                        icon="fa-briefcase"
                        label="Job"
                        value={item.job?.title || "Unknown"}
                    />
                    <DataRow
                        icon="fa-building"
                        label="Company"
                        value={item.job?.company?.name || "N/A"}
                    />
                    <DataRow
                        icon="fa-robot"
                        label="AI Score"
                        value={
                            item.ai_review?.fit_score != null
                                ? `${Math.round(item.ai_review.fit_score)}%`
                                : "Not reviewed"
                        }
                    />
                    <DataRow
                        icon="fa-calendar"
                        label="Submitted"
                        value={
                            item.created_at
                                ? formatDate(item.created_at)
                                : "N/A"
                        }
                    />
                </DataList>
            </MetricCard.Body>

            <MetricCard.Footer>
                <div className="flex items-center justify-end w-full gap-2">
                    <ActionsToolbar
                        application={item}
                        variant="icon-only"
                        size="xs"
                        showActions={{
                            viewDetails: true,
                            message: true,
                            addNote: true,
                            advanceStage: true,
                            reject: true,
                        }}
                        onMessage={onMessage}
                        onViewDetails={onViewDetails}
                    />
                </div>
            </MetricCard.Footer>
        </MetricCard>
    );
}
