"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import type { AIReview } from "@splits-network/shared-types";
import { StatCard, StatCardGrid } from "./ui";

interface AIReviewPanelProps {
    applicationId: string;
    compact?: boolean;
}

const getRecommendationColor = (recommendation: string | null) => {
    if (!recommendation) return "badge-ghost";
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

const getFitScoreColor = (score: number | null) => {
    if (!score) return "neutral";
    if (score >= 90) return "success";
    if (score >= 70) return "info";
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

const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return "neutral";
    if (confidence >= 90) return "success";
    if (confidence >= 70) return "info";
    if (confidence >= 50) return "warning";
    return "error";
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

export default function AIReviewPanel({
    applicationId,
    compact = false,
}: AIReviewPanelProps) {
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

                // V2 API returns { data: [...] } envelope, get first review
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
                    // AI service may be temporarily unavailable - show friendly message instead of error
                    const errorMsg =
                        err instanceof Error
                            ? err.message
                            : "Failed to load AI review";
                    if (
                        errorMsg.includes("500") ||
                        errorMsg.includes("fetch failed") ||
                        errorMsg.includes("Service call failed")
                    ) {
                        // Service unavailable - silently set to null to hide the panel
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

            // V2 API returns { data: {...} } envelope
            setAIReview(response.data);
        } catch (err) {
            console.error("Error requesting new AI review:", err);
            const errorMsg =
                err instanceof Error
                    ? err.message
                    : "Failed to request new review";
            // Check if it's a service unavailability error
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

    if (loading) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h3 className="card-title text-lg">
                        <i className="fa-duotone fa-regular fa-robot"></i>
                        AI Analysis
                    </h3>
                    <div className="flex items-center justify-center py-4">
                        <span className="loading loading-spinner loading-md"></span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <div className="flex justify-between">
                        <h3 className="card-title text-lg">
                            <i className="fa-duotone fa-regular fa-robot"></i>
                            AI Analysis
                        </h3>
                        {isAdmin && (
                            <button
                                onClick={handleRequestNewReview}
                                disabled={requesting}
                                className="btn btn-primary btn-sm"
                            >
                                {requesting ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs"></span>
                                        Requesting Review...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-rotate"></i>
                                        Request New Review
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <div>
                            <div className="font-semibold">
                                Unable to Load AI Review
                            </div>
                            <div className="text-sm mt-1">{error}</div>
                            <div className="text-sm mt-2">
                                Please try again or check back later.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!aiReview) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h3 className="card-title text-lg">
                        <i className="fa-duotone fa-regular fa-robot"></i>
                        AI Analysis
                    </h3>
                    <div className="alert alert-info">
                        <i className="fa-duotone fa-regular fa-circle-info"></i>
                        <span>
                            AI analysis is in progress or not available for this
                            application.
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <div className="flex justify-between">
                        <h3 className="card-title text-lg mb-4">
                            <i className="fa-duotone fa-regular fa-robot"></i>
                            AI Analysis
                        </h3>

                        {isAdmin && (
                            <button
                                onClick={handleRequestNewReview}
                                disabled={requesting}
                                className="btn btn-primary btn-sm"
                            >
                                {requesting ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs"></span>
                                        Requesting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-rotate"></i>
                                        Request New
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-sm text-base-content/60">
                                Match Score
                            </div>
                            <div
                                className={`text-3xl font-bold ${getFitScoreColor(aiReview.fit_score)}`}
                            >
                                {aiReview.fit_score}/100
                            </div>
                        </div>
                        <span
                            className={`badge ${getRecommendationColor(aiReview.recommendation)} badge-lg`}
                        >
                            {getRecommendationLabel(aiReview.recommendation)}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {aiReview.fit_score !== null && (
                            <div>
                                <div className="text-sm font-medium mb-1">
                                    Skills Match: {aiReview.fit_score}%
                                </div>
                                <progress
                                    className="progress progress-success w-full"
                                    value={aiReview.fit_score ?? 0}
                                    max="100"
                                ></progress>
                            </div>
                        )}

                        {aiReview.strengths &&
                            aiReview.strengths.length > 0 && (
                                <div>
                                    <div className="text-sm font-medium mb-1">
                                        <i className="fa-duotone fa-regular fa-circle-check text-success mr-1"></i>
                                        Top Strengths
                                    </div>
                                    <ul className="text-sm space-y-1">
                                        {aiReview.strengths
                                            .slice(0, 3)
                                            .map((strength, index) => (
                                                <li
                                                    key={index}
                                                    className="text-base-content/80"
                                                >
                                                    • {strength}
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}

                        {aiReview.concerns && aiReview.concerns.length > 0 && (
                            <div>
                                <div className="text-sm font-medium mb-1">
                                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning mr-1"></i>
                                    Areas to Address
                                </div>
                                <ul className="text-sm space-y-1">
                                    {aiReview.concerns
                                        .slice(0, 2)
                                        .map((concern, index) => (
                                            <li
                                                key={index}
                                                className="text-base-content/80"
                                            >
                                                • {concern}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <div className="flex justify-between">
                    <h3 className="card-title text-lg mb-4">
                        <i className="fa-duotone fa-regular fa-robot"></i>
                        AI Analysis
                    </h3>

                    {isAdmin && (
                        <button
                            onClick={handleRequestNewReview}
                            disabled={requesting}
                            className="btn btn-primary btn-sm"
                        >
                            {requesting ? (
                                <>
                                    <span className="loading loading-spinner loading-xs"></span>
                                    Requesting Review...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-rotate"></i>
                                    Request New Review
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <StatCardGrid
                        direction="responsive"
                        className="shadow-lg bg-base-200/50 w-full"
                    >
                        <StatCard
                            title="Match Score"
                            value={
                                aiReview.fit_score != null
                                    ? `${Math.round(aiReview.fit_score)}%`
                                    : "Not reviewed"
                            }
                            icon={getFitScoreIcon(aiReview.fit_score)}
                            color={getFitScoreColor(aiReview.fit_score)}
                            description={
                                <span
                                    className={`badge ${getRecommendationColor(
                                        aiReview.recommendation,
                                    )} badge-sm gap-1.5`}
                                >
                                    {getRecommendationLabel(
                                        aiReview.recommendation,
                                    )}
                                </span>
                            }
                        />
                        <StatCard
                            title="Confidence Level"
                            value={
                                aiReview.confidence_level != null
                                    ? `${aiReview.confidence_level}%`
                                    : "N/A"
                            }
                            icon={getConfidenceIcon(aiReview.confidence_level)}
                            color={getConfidenceColor(
                                aiReview.confidence_level,
                            )}
                            description="AI confidence in analysis"
                        />
                        <StatCard
                            title="Skills Match"
                            value={
                                aiReview.skills_match_percentage != null
                                    ? `${aiReview.skills_match_percentage}%`
                                    : "N/A"
                            }
                            icon="fa-duotone fa-regular fa-list-check"
                            color={getFitScoreColor(
                                aiReview.skills_match_percentage,
                            )}
                            description="Job skills match percentage"
                        />
                    </StatCardGrid>
                </div>

                {/* Overall Summary */}
                {aiReview.overall_summary && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-base mb-2">
                            Summary
                        </h4>
                        <p className="text-sm text-base-content/80">
                            {aiReview.overall_summary}
                        </p>
                    </div>
                )}

                {/* Strengths */}
                {aiReview.strengths && aiReview.strengths.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-circle-check text-success"></i>
                            Key Strengths
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                            {aiReview.strengths.map((strength, index) => (
                                <li
                                    key={index}
                                    className="text-sm text-base-content/80"
                                >
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Concerns */}
                {aiReview.concerns && aiReview.concerns.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning"></i>
                            Areas to Address
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                            {aiReview.concerns.map((concern, index) => (
                                <li
                                    key={index}
                                    className="text-sm text-base-content/80"
                                >
                                    {concern}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Skills Match - Using flat structure */}
                {aiReview.skills_match_percentage !== null && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-base mb-2">
                            Skills Analysis
                        </h4>

                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm">Match Rate:</span>
                            <div className="flex-1">
                                <progress
                                    className="progress progress-success w-full"
                                    value={
                                        aiReview.skills_match_percentage ?? 0
                                    }
                                    max="100"
                                ></progress>
                            </div>
                            <span className="text-sm font-semibold">
                                {aiReview.skills_match_percentage}%
                            </span>
                        </div>

                        {aiReview.matched_skills &&
                            aiReview.matched_skills.length > 0 && (
                                <div className="mb-2">
                                    <span className="text-sm font-medium">
                                        Matched Skills:
                                    </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {aiReview.matched_skills.map(
                                            (skill, index) => (
                                                <span
                                                    key={index}
                                                    className="badge badge-success badge-sm"
                                                >
                                                    {skill}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                        {aiReview.missing_skills &&
                            aiReview.missing_skills.length > 0 && (
                                <div>
                                    <span className="text-sm font-medium">
                                        Missing Skills:
                                    </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {aiReview.missing_skills.map(
                                            (skill, index) => (
                                                <span
                                                    key={index}
                                                    className="badge badge-warning badge-sm"
                                                >
                                                    {skill}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                )}

                {/* Experience & Location */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {aiReview.candidate_years !== null &&
                        aiReview.required_years !== null && (
                            <div>
                                <h4 className="font-medium text-sm mb-1">
                                    Experience
                                </h4>
                                <div className="flex items-center gap-2">
                                    {aiReview.meets_experience_requirement ? (
                                        <i className="fa-duotone fa-regular fa-circle-check text-success"></i>
                                    ) : (
                                        <i className="fa-duotone fa-regular fa-circle-xmark text-warning"></i>
                                    )}
                                    <span className="text-sm">
                                        {aiReview.candidate_years} yrs (Req:{" "}
                                        {aiReview.required_years})
                                    </span>
                                </div>
                            </div>
                        )}

                    <div>
                        <h4 className="font-medium text-sm mb-1">Location</h4>
                        <span className="text-sm">
                            {getLocationLabel(aiReview.location_compatibility)}
                        </span>
                    </div>
                </div>

                {/* Analysis Metadata */}
                <div className="text-xs text-base-content/60 border-t pt-2">
                    <p>
                        Analyzed by {aiReview.model_version ?? "AI"} on{" "}
                        {aiReview.analyzed_at
                            ? new Date(aiReview.analyzed_at).toLocaleString()
                            : "N/A"}
                    </p>
                </div>
            </div>
        </div>
    );
}
