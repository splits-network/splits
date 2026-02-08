"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@/components/standard-lists/loading-state";
import { DataList, DataRow, VerticalDataRow } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import {
    type Application,
    getStatusColor,
    formatStage,
    getRecommendationLabel,
    getRecommendationColor,
} from "../../types";

interface DetailsProps {
    itemId: string;
    onRefresh?: () => void;
}

export default function Details({ itemId, onRefresh }: DetailsProps) {
    const { getToken } = useAuth();
    const [item, setItem] = useState<Application | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const response: any = await client.get(
                `/applications/${itemId}`,
                {
                    params: { include: "job,recruiter,ai_review" },
                },
            );
            setItem(response.data);
        } catch (err) {
            console.error("Failed to fetch application detail:", err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    if (loading) {
        return (
            <div className="p-8">
                <LoadingState message="Loading application details..." />
            </div>
        );
    }

    if (!item) return null;

    return (
        <div className="space-y-6 p-6">
            {/* Job Header */}
            <div className="flex items-start gap-4">
                {/* Company Avatar */}
                <div className="avatar avatar-placeholder shrink-0">
                    <div className="bg-primary/10 text-primary rounded-full w-14 flex items-center justify-center font-bold text-xl">
                        {item.job?.company?.logo_url ? (
                            <img
                                src={item.job.company.logo_url}
                                alt={`${item.job?.company.name} logo`}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <span>
                                {(
                                    item.job?.company?.name ||
                                    "C"
                                )[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold truncate">
                        {item.job?.title || "Unknown Position"}
                    </h3>
                    <p className="text-sm text-base-content/60">
                        {item.job?.company?.name || "Unknown Company"}
                    </p>
                    <div className="mt-2">
                        <span
                            className={`badge ${getStatusColor(item.stage)} badge-sm font-semibold`}
                        >
                            {formatStage(item.stage)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Application Details */}
            <div className="card bg-base-200">
                <div className="card-body p-4">
                    <h4 className="font-semibold text-sm mb-2">
                        <i className="fa-duotone fa-regular fa-info-circle mr-2" />
                        Details
                    </h4>
                    <DataList compact>
                        <DataRow
                            icon="fa-location-dot"
                            label="Location"
                            value={
                                item.job?.location ||
                                item.job?.company
                                    ?.headquarters_location ||
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
                        <DataRow
                            icon="fa-clock"
                            label="Last Updated"
                            value={formatDate(item.updated_at)}
                        />
                    </DataList>
                </div>
            </div>

            {/* AI Review */}
            {item.ai_review && (
                <div className="card bg-base-200">
                    <div className="card-body p-4">
                        <h4 className="font-semibold text-sm mb-2">
                            <i className="fa-duotone fa-regular fa-robot mr-2" />
                            AI Review
                        </h4>
                        <div className="flex items-center gap-3">
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
                                        "--size": "3rem",
                                    } as React.CSSProperties
                                }
                            >
                                {item.ai_review.fit_score}
                            </div>
                            <span
                                className={`badge ${getRecommendationColor(item.ai_review.recommendation)}`}
                            >
                                {getRecommendationLabel(
                                    item.ai_review.recommendation,
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Recruiter Notes */}
            {item.recruiter_notes && (
                <div className="card bg-base-200">
                    <div className="card-body p-4">
                        <h4 className="font-semibold text-sm mb-2">
                            <i className="fa-duotone fa-regular fa-comment mr-2" />
                            Recruiter Notes
                        </h4>
                        <p className="text-sm whitespace-pre-wrap">
                            {item.recruiter_notes}
                        </p>
                    </div>
                </div>
            )}

            {/* Job Description */}
            {item.job?.candidate_description && (
                <div className="card bg-base-200">
                    <div className="card-body p-4">
                        <h4 className="font-semibold text-sm mb-2">
                            <i className="fa-duotone fa-regular fa-file-lines mr-2" />
                            Job Description
                        </h4>
                        <p className="text-sm whitespace-pre-wrap line-clamp-6">
                            {item.job.candidate_description}
                        </p>
                    </div>
                </div>
            )}

            {/* View Full Application Link */}
            <div className="flex justify-center">
                <Link
                    href={`/portal/applications/${item.id}`}
                    className="btn btn-primary btn-sm"
                >
                    View Full Application
                    <i className="fa-duotone fa-regular fa-arrow-right ml-1.5" />
                </Link>
            </div>
        </div>
    );
}
