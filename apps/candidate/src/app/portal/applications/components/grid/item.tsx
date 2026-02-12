"use client";

import { formatDate } from "@/lib/utils";
import { EntityCard, DataList, DataRow } from "@/components/ui";
import {
    type Application,
    getStatusColor,
    formatStage,
    getRecommendationLabel,
    getRecommendationColor,
} from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

interface ItemProps {
    item: Application;
    onViewDetails: (id: string) => void;
    onStageChange?: () => void;
}

export default function Item({
    item,
    onViewDetails,
    onStageChange,
}: ItemProps) {
    const companyInitial = (item.job?.company?.name || "C")[0].toUpperCase();

    return (
        <EntityCard className="group hover:shadow-lg transition-all duration-200">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
                <div
                    className={`badge ${getStatusColor(item.stage)} font-semibold whitespace-nowrap w-full rounded-t-2xl`}
                >
                    {formatStage(item.stage)}
                </div>
            </div>
            <EntityCard.Header>
                <div className="flex items-center gap-3 w-full">
                    <div className="flex justify-between w-full items-center">
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Company Logo/Avatar */}
                            <div className="avatar avatar-placeholder shrink-0">
                                <div className="bg-primary/10 text-primary rounded-full w-12 flex items-center justify-center font-bold text-lg">
                                    {item.job?.company?.logo_url ? (
                                        <img
                                            src={item.job.company.logo_url}
                                            alt={`${item.job?.company.name} logo`}
                                            className="w-full h-full object-contain rounded-full"
                                        />
                                    ) : (
                                        <span>{companyInitial}</span>
                                    )}
                                </div>
                            </div>
                            {/* Job Title and Company */}
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-base leading-tight truncate">
                                    {item.job?.title || "Unknown Position"}
                                </h3>
                                <p className="text-sm text-base-content/60 truncate">
                                    {item.job?.company?.name ||
                                        "Unknown Company"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </EntityCard.Header>

            <EntityCard.Body>
                <DataList compact={false}>
                    <DataRow
                        icon="fa-location-dot"
                        label="Location"
                        value={
                            item.job?.location ||
                            item.job?.company?.headquarters_location ||
                            "Not specified"
                        }
                    />
                    {item.job?.company?.industry && (
                        <DataRow
                            icon="fa-industry"
                            label="Industry"
                            value={item.job.company.industry}
                        />
                    )}
                    {item.recruiter?.user?.name && (
                        <DataRow
                            icon="fa-user"
                            label="Recruiter"
                            value={item.recruiter.user.name}
                        />
                    )}
                    <DataRow
                        icon="fa-calendar"
                        label="Applied"
                        value={formatDate(item.created_at)}
                    />
                    {item.ai_review && (
                        <DataRow icon="fa-robot" label="AI Fit Score">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`badge badge-sm ${getRecommendationColor(item.ai_review.recommendation)} gap-1`}
                                >
                                    {getRecommendationLabel(
                                        item.ai_review.recommendation,
                                    )}
                                </span>
                                <div
                                    className={`radial-progress ${
                                        item.ai_review.fit_score >= 75
                                            ? "text-success"
                                            : item.ai_review.fit_score >= 50
                                              ? "text-warning"
                                              : "text-error"
                                    }`}
                                    style={
                                        {
                                            "--value": `${item.ai_review.fit_score}`,
                                            "--size": "2rem",
                                        } as React.CSSProperties
                                    }
                                >
                                    {item.ai_review.fit_score}
                                </div>
                            </div>
                        </DataRow>
                    )}
                </DataList>
            </EntityCard.Body>

            <EntityCard.Footer>
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-base-content/50">
                        Updated {formatDate(item.updated_at)}
                    </span>
                    <ActionsToolbar
                        item={item}
                        variant="icon-only"
                        size="xs"
                        onStageChange={onStageChange}
                        onViewDetails={onViewDetails}
                    />
                </div>
            </EntityCard.Footer>
        </EntityCard>
    );
}
