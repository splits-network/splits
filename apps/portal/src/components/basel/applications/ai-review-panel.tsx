"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import type { AIReview } from "@splits-network/shared-types";
import {
    BaselStatusPill,
    BaselMicroStat,
    BaselCheckList,
    type BaselSemanticColor,
    semanticBorder,
    semanticBg10,
    semanticText,
} from "@splits-network/basel-ui";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type AIReviewVariant = "full" | "compact" | "badge" | "mini-card";

interface AIReviewPanelProps {
    applicationId: string;
    /** @deprecated Use variant="compact" instead */
    compact?: boolean;
    variant?: AIReviewVariant;
}

/* ─── Color Mappers ──────────────────────────────────────────────────────── */

const getRecommendationColor = (
    recommendation: string | null,
): BaselSemanticColor => {
    if (!recommendation) return "neutral";
    switch (recommendation) {
        case "strong_fit":
            return "success";
        case "good_fit":
            return "primary";
        case "fair_fit":
            return "warning";
        case "poor_fit":
            return "error";
        default:
            return "neutral";
    }
};

const getRecommendationLabel = (recommendation: string | null) => {
    if (!recommendation) return "N/A";
    switch (recommendation) {
        case "strong_fit":
            return "Strong Match";
        case "good_fit":
            return "Good Match";
        case "fair_fit":
            return "Fair Match";
        case "poor_fit":
            return "Poor Match";
        default:
            return recommendation;
    }
};

const getFitScoreIcon = (score: number | null) => {
    if (!score) return "fa-duotone fa-regular fa-question";
    if (score >= 90) return "fa-duotone fa-regular fa-trophy";
    if (score >= 70) return "fa-duotone fa-regular fa-chart-line";
    if (score >= 50) return "fa-duotone fa-regular fa-chart-simple";
    return "fa-duotone fa-regular fa-triangle-exclamation";
};

const getScoreColor = (score: number | null): BaselSemanticColor => {
    if (!score) return "warning";
    if (score >= 90) return "success";
    if (score >= 70) return "primary";
    if (score >= 50) return "warning";
    return "error";
};

const getConfidenceIcon = (confidence: number | null) => {
    if (!confidence) return "fa-duotone fa-regular fa-question";
    if (confidence >= 90) return "fa-duotone fa-regular fa-shield-check";
    if (confidence >= 70) return "fa-duotone fa-regular fa-shield-halved";
    if (confidence >= 50) return "fa-duotone fa-regular fa-shield";
    return "fa-duotone fa-regular fa-shield-exclamation";
};

const getLocationLabel = (compatibility: string | null) => {
    if (!compatibility) return "Unknown";
    switch (compatibility) {
        case "perfect":
            return "Perfect Match";
        case "good":
            return "Good Match";
        case "challenging":
            return "Challenging";
        case "mismatch":
            return "Location Mismatch";
        default:
            return compatibility;
    }
};

/* ─── Section Header ─────────────────────────────────────────────────────── */

function SectionHeader({
    children,
    action,
}: {
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-1">
                    Intelligence
                </p>
                <h3 className="text-xl font-black tracking-tight text-base-content flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-robot" />
                    {children}
                </h3>
            </div>
            {action}
        </div>
    );
}

/* ─── Request Button ─────────────────────────────────────────────────────── */

function RequestReviewButton({
    requesting,
    onClick,
}: {
    requesting: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={requesting}
            className="btn btn-sm btn-primary"
        >
            {requesting ? (
                <>
                    <span className="loading loading-spinner loading-xs" />
                    Requesting...
                </>
            ) : (
                <>
                    <i className="fa-duotone fa-regular fa-rotate" />
                    Request New
                </>
            )}
        </button>
    );
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function AIReviewPanel({
    applicationId,
    compact = false,
    variant,
}: AIReviewPanelProps) {
    const resolvedVariant: AIReviewVariant =
        variant ?? (compact ? "compact" : "full");
    const { getToken } = useAuth();
    const { isAdmin } = useUserProfile();
    const [loading, setLoading] = useState(true);
    const [aiReview, setAIReview] = useState<AIReview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        async function fetchAIReview() {
            try {
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const response = await client.get<{ data: AIReview[] }>(
                    "/ai-reviews",
                    {
                        params: { application_id: applicationId },
                    },
                );

                const reviews = response.data;
                if (reviews && reviews.length > 0) {
                    setAIReview(reviews[0]);
                } else {
                    setAIReview(null);
                }
            } catch (err) {
                console.error("Error fetching AI review:", err);
                if (err instanceof Error && err.message.includes("404")) {
                    setAIReview(null);
                } else {
                    const errorMsg =
                        err instanceof Error
                            ? err.message
                            : "Failed to load AI review";
                    if (
                        errorMsg.includes("500") ||
                        errorMsg.includes("fetch failed") ||
                        errorMsg.includes("Service call failed")
                    ) {
                        console.warn(
                            "AI review service temporarily unavailable",
                        );
                        setAIReview(null);
                    } else {
                        setError(errorMsg);
                    }
                }
            } finally {
                setLoading(false);
            }
        }

        fetchAIReview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId]);

    const handleRequestNewReview = async () => {
        setRequesting(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) {
                setError("Authentication required");
                return;
            }

            const client = createAuthenticatedClient(token);
            const response = await client.post<{ data: AIReview }>(
                "/ai-reviews",
                {
                    application_id: applicationId,
                },
            );

            setAIReview(response.data);
        } catch (err) {
            console.error("Error requesting new AI review:", err);
            const errorMsg =
                err instanceof Error
                    ? err.message
                    : "Failed to request new review";
            if (
                errorMsg.includes("500") ||
                errorMsg.includes("fetch failed") ||
                errorMsg.includes("Service call failed")
            ) {
                setError(
                    "AI review service is temporarily unavailable. Please try again later.",
                );
            } else {
                setError(errorMsg);
            }
        } finally {
            setRequesting(false);
        }
    };

    /* ── Badge variant ────────────────────────────────────────────────────── */

    if (resolvedVariant === "badge") {
        if (loading || error || !aiReview || aiReview.fit_score == null)
            return null;
        const color = getRecommendationColor(aiReview.recommendation);
        return (
            <BaselStatusPill color={color} className="ml-1">
                {Math.round(aiReview.fit_score)}%
            </BaselStatusPill>
        );
    }

    /* ── Mini-card variant ────────────────────────────────────────────────── */

    if (resolvedVariant === "mini-card") {
        if (loading) {
            return (
                <div className="bg-base-100 border-l-4 border-base-300 p-4 animate-pulse">
                    <div className="h-4 bg-base-300 w-24 mb-2" />
                    <div className="h-3 bg-base-300 w-32" />
                </div>
            );
        }
        if (error || !aiReview || aiReview.fit_score == null) return null;
        const color = getScoreColor(aiReview.fit_score);
        return (
            <div
                className={`bg-base-100 border-l-4 ${semanticBorder[color]} p-4 shadow-sm`}
            >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/50 mb-2">
                    AI Fit Score
                </p>
                <div className="flex items-center gap-3">
                    <span
                        className={`text-3xl font-black ${semanticText[color]}`}
                    >
                        {Math.round(aiReview.fit_score)}%
                    </span>
                    {aiReview.recommendation && (
                        <BaselStatusPill
                            color={getRecommendationColor(
                                aiReview.recommendation,
                            )}
                        >
                            {getRecommendationLabel(aiReview.recommendation)}
                        </BaselStatusPill>
                    )}
                </div>
            </div>
        );
    }

    /* ── Loading state ────────────────────────────────────────────────────── */

    if (loading) {
        return (
            <div className="bg-base-100 border-l-4 border-accent p-6 shadow-sm">
                <SectionHeader>AI Analysis</SectionHeader>
                <div className="flex items-center justify-center py-8 gap-3">
                    <span className="loading loading-dots loading-md text-accent" />
                </div>
            </div>
        );
    }

    /* ── Error state ──────────────────────────────────────────────────────── */

    if (error) {
        return (
            <div className="bg-base-100 border-l-4 border-error p-6 shadow-sm">
                <SectionHeader
                    action={
                        isAdmin ? (
                            <RequestReviewButton
                                requesting={requesting}
                                onClick={handleRequestNewReview}
                            />
                        ) : undefined
                    }
                >
                    AI Analysis
                </SectionHeader>
                <div className="bg-error/10 border-l-4 border-error p-4 mt-4">
                    <div className="flex items-start gap-2">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error mt-0.5" />
                        <div>
                            <span className="font-bold text-base-content">
                                Unable to Load AI Review
                            </span>
                            <p className="text-sm mt-1 text-base-content/70">
                                {error}
                            </p>
                            <p className="text-sm mt-1 text-base-content/50">
                                Please try again or check back later.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Empty state ──────────────────────────────────────────────────────── */

    if (!aiReview) {
        return (
            <div className="bg-base-100 border-l-4 border-info p-6 shadow-sm">
                <SectionHeader>AI Analysis</SectionHeader>
                <div className="bg-info/10 border-l-4 border-info p-4 mt-4">
                    <div className="flex items-start gap-2">
                        <i className="fa-duotone fa-regular fa-circle-info text-info mt-0.5" />
                        <span className="text-base-content/70 text-sm">
                            AI analysis is in progress or not available for this
                            application.
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Compact variant ──────────────────────────────────────────────────── */

    if (resolvedVariant === "compact") {
        const fitColor = getScoreColor(aiReview.fit_score);
        const confColor = getScoreColor(aiReview.confidence_level);

        return (
            <div
                className={`bg-base-100 border-l-4 ${semanticBorder[fitColor]} p-6 shadow-sm`}
            >
                <SectionHeader
                    action={
                        isAdmin ? (
                            <RequestReviewButton
                                requesting={requesting}
                                onClick={handleRequestNewReview}
                            />
                        ) : undefined
                    }
                >
                    AI Analysis
                </SectionHeader>

                {/* Metric stats */}
                <div className="grid grid-cols-2 gap-3 mt-4 mb-5">
                    <BaselMicroStat
                        value={`${aiReview.fit_score ? Math.round(aiReview.fit_score) : "N/A"}%`}
                        label="Match Score"
                        color={fitColor}
                        className={`${semanticBg10[fitColor]} p-3`}
                    />
                    <BaselMicroStat
                        value={`${aiReview.confidence_level || "N/A"}%`}
                        label="Confidence"
                        color={confColor}
                        className={`${semanticBg10[confColor]} p-3`}
                    />
                </div>

                {aiReview.overall_summary && (
                    <div className="mb-4">
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/50 mb-2">
                            Summary
                        </h4>
                        <p className="text-sm text-base-content/70 leading-relaxed">
                            {aiReview.overall_summary}
                        </p>
                    </div>
                )}

                {aiReview.strengths && aiReview.strengths.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/50 mb-2 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-circle-check text-success" />
                            Top Strengths
                        </h4>
                        <BaselCheckList
                            items={aiReview.strengths.slice(0, 3)}
                            color="success"
                            icon="fa-duotone fa-regular fa-circle-check"
                        />
                    </div>
                )}

                {aiReview.concerns && aiReview.concerns.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/50 mb-2 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning" />
                            Areas to Address
                        </h4>
                        <BaselCheckList
                            items={aiReview.concerns.slice(0, 2)}
                            color="warning"
                            icon="fa-duotone fa-regular fa-triangle-exclamation"
                        />
                    </div>
                )}
            </div>
        );
    }

    /* ── Full variant ─────────────────────────────────────────────────────── */

    const fitColor = getScoreColor(aiReview.fit_score);
    const confColor = getScoreColor(aiReview.confidence_level);
    const skillsColor = getScoreColor(aiReview.skills_match_percentage);

    return (
        <div className="space-y-6">
            <SectionHeader
                action={
                    isAdmin ? (
                        <RequestReviewButton
                            requesting={requesting}
                            onClick={handleRequestNewReview}
                        />
                    ) : undefined
                }
            >
                AI Analysis
            </SectionHeader>

            {/* KPI metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    className={`bg-base-100 border-t-4 ${semanticBorder[fitColor]} p-5 shadow-sm`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className={`w-10 h-10 ${semanticBg10[fitColor]} flex items-center justify-center`}
                        >
                            <i
                                className={`${getFitScoreIcon(aiReview.fit_score)} ${semanticText[fitColor]}`}
                            />
                        </div>
                    </div>
                    <div
                        className={`text-3xl font-black ${semanticText[fitColor]}`}
                    >
                        {aiReview.fit_score
                            ? Math.round(aiReview.fit_score)
                            : "N/A"}
                        %
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-base-content/40 mt-1">
                        Match Score
                    </div>
                </div>
                <div
                    className={`bg-base-100 border-t-4 ${semanticBorder[confColor]} p-5 shadow-sm`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className={`w-10 h-10 ${semanticBg10[confColor]} flex items-center justify-center`}
                        >
                            <i
                                className={`${getConfidenceIcon(aiReview.confidence_level)} ${semanticText[confColor]}`}
                            />
                        </div>
                    </div>
                    <div
                        className={`text-3xl font-black ${semanticText[confColor]}`}
                    >
                        {aiReview.confidence_level || "N/A"}%
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-base-content/40 mt-1">
                        Confidence Level
                    </div>
                </div>
                <div
                    className={`bg-base-100 border-t-4 ${semanticBorder[skillsColor]} p-5 shadow-sm`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className={`w-10 h-10 ${semanticBg10[skillsColor]} flex items-center justify-center`}
                        >
                            <i
                                className={`fa-duotone fa-regular fa-list-check ${semanticText[skillsColor]}`}
                            />
                        </div>
                    </div>
                    <div
                        className={`text-3xl font-black ${semanticText[skillsColor]}`}
                    >
                        {aiReview.skills_match_percentage || "N/A"}%
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-base-content/40 mt-1">
                        Skills Match
                    </div>
                </div>
            </div>

            {/* Overall Summary */}
            {aiReview.overall_summary && (
                <div className="bg-base-100 border-l-4 border-accent p-5 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/50 mb-2">
                        Summary
                    </h4>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                        {aiReview.overall_summary}
                    </p>
                </div>
            )}

            {/* Strengths & Concerns */}
            {(aiReview.strengths?.length || aiReview.concerns?.length) && (
                <div className="grid md:grid-cols-2 gap-4">
                    {aiReview.strengths && aiReview.strengths.length > 0 && (
                        <div className="bg-success/5 border-l-4 border-success p-5">
                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/50 mb-3 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-circle-check text-success" />
                                Key Strengths
                            </h4>
                            <BaselCheckList
                                items={aiReview.strengths}
                                color="success"
                                icon="fa-duotone fa-regular fa-circle-check"
                            />
                        </div>
                    )}

                    {aiReview.concerns && aiReview.concerns.length > 0 && (
                        <div className="bg-warning/5 border-l-4 border-warning p-5">
                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/50 mb-3 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning" />
                                Areas to Address
                            </h4>
                            <BaselCheckList
                                items={aiReview.concerns}
                                color="warning"
                                icon="fa-duotone fa-regular fa-triangle-exclamation"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Skills Analysis */}
            {aiReview.skills_match_percentage !== null && (
                <div className="bg-base-100 border-l-4 border-primary p-5 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/50 mb-4">
                        Skills Analysis
                    </h4>

                    {aiReview.matched_skills &&
                        aiReview.matched_skills.length > 0 && (
                            <div className="mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">
                                    Matched Skills
                                </span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {aiReview.matched_skills.map(
                                        (skill, index) => (
                                            <BaselStatusPill
                                                key={index}
                                                color="success"
                                            >
                                                {skill}
                                            </BaselStatusPill>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                    {aiReview.missing_skills &&
                        aiReview.missing_skills.length > 0 && (
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">
                                    Missing Skills
                                </span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {aiReview.missing_skills.map(
                                        (skill, index) => (
                                            <BaselStatusPill
                                                key={index}
                                                color="warning"
                                            >
                                                {skill}
                                            </BaselStatusPill>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            )}

            {/* Experience & Location */}
            <div className="grid grid-cols-2 gap-4">
                {aiReview.candidate_years !== null &&
                    aiReview.required_years !== null && (
                        <div className="bg-base-100 border-t-4 border-warning p-5 shadow-sm text-center">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 mb-3">
                                Experience
                            </h4>
                            <div className="flex items-center justify-center gap-2">
                                {aiReview.meets_experience_requirement ? (
                                    <i className="fa-duotone fa-regular fa-circle-check text-success text-xl" />
                                ) : (
                                    <i className="fa-duotone fa-regular fa-circle-xmark text-warning text-xl" />
                                )}
                                <span className="text-sm font-bold text-base-content">
                                    {aiReview.candidate_years} yrs (Req:{" "}
                                    {aiReview.required_years})
                                </span>
                            </div>
                        </div>
                    )}

                <div className="bg-base-100 border-t-4 border-accent p-5 shadow-sm text-center">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 mb-3">
                        Location
                    </h4>
                    <span className="text-sm font-bold text-base-content">
                        {getLocationLabel(aiReview.location_compatibility)}
                    </span>
                </div>
            </div>

            {/* Analysis Metadata */}
            <div className="text-xs text-base-content/40 border-t border-base-300 pt-4">
                <p className="mb-2">
                    Analyzed by {aiReview.model_version ?? "AI"} on{" "}
                    {aiReview.analyzed_at
                        ? new Date(aiReview.analyzed_at).toLocaleString()
                        : "N/A"}
                </p>
                <p className="leading-relaxed">
                    It is recommended to use this analysis as a supplementary
                    tool alongside human judgment. Always review the
                    candidate&apos;s full profile and application materials
                    before making any decisions. AI analysis may not capture all
                    nuances of a candidate&apos;s qualifications or potential.
                </p>
            </div>
        </div>
    );
}
