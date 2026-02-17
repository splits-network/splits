"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import type { AIReview } from "@splits-network/shared-types";
import { Badge } from "@splits-network/memphis-ui";

type AIReviewVariant = "full" | "compact" | "badge" | "mini-card";

interface AIReviewPanelProps {
    applicationId: string;
    /** @deprecated Use variant="compact" instead */
    compact?: boolean;
    variant?: AIReviewVariant;
}

const getRecommendationAccent = (recommendation: string | null): "coral" | "teal" | "yellow" | "neutral" => {
    if (!recommendation) return "neutral";
    switch (recommendation) {
        case "strong_fit":
            return "teal";
        case "good_fit":
            return "coral";
        case "fair_fit":
            return "yellow";
        case "poor_fit":
            return "coral";
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

const getFitScoreAccent = (score: number | null): "coral" | "teal" | "yellow" => {
    if (!score) return "yellow";
    if (score >= 90) return "teal";
    if (score >= 70) return "coral";
    if (score >= 50) return "yellow";
    return "coral";
};

const getConfidenceIcon = (confidence: number | null) => {
    if (!confidence) return "fa-duotone fa-regular fa-question";
    if (confidence >= 90) return "fa-duotone fa-regular fa-shield-check";
    if (confidence >= 70) return "fa-duotone fa-regular fa-shield-halved";
    if (confidence >= 50) return "fa-duotone fa-regular fa-shield";
    return "fa-duotone fa-regular fa-shield-exclamation";
};

const getConfidenceAccent = (confidence: number | null): "coral" | "teal" | "yellow" => {
    if (!confidence) return "yellow";
    if (confidence >= 90) return "teal";
    if (confidence >= 70) return "coral";
    if (confidence >= 50) return "yellow";
    return "coral";
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

    // Badge variant: inline span only, invisible during load/error/null
    if (resolvedVariant === "badge") {
        if (loading || error || !aiReview || aiReview.fit_score == null)
            return null;
        const accent = getRecommendationAccent(aiReview.recommendation);
        return (
            <Badge size="sm" className={`ml-1 bg-${accent}`}>
                {Math.round(aiReview.fit_score)}%
            </Badge>
        );
    }

    // Mini-card variant: small overview card
    if (resolvedVariant === "mini-card") {
        if (loading) {
            return (
                <div className="bg-white p-4 border-4 border-dark/20 animate-pulse">
                    <div className="h-4 bg-dark/10 w-24 mb-2" />
                    <div className="h-3 bg-dark/10 w-32" />
                </div>
            );
        }
        if (error || !aiReview || aiReview.fit_score == null) return null;
        const accent = getFitScoreAccent(aiReview.fit_score);
        const borderColor = accent === 'coral' ? 'border-coral' : accent === 'teal' ? 'border-teal' : 'border-yellow';
        return (
            <div className={`bg-white p-4 border-4 ${borderColor}`}>
                <h4 className="font-black text-sm uppercase tracking-wider mb-2 text-dark">
                    AI Fit Score
                </h4>
                <div className="flex items-center gap-2">
                    <div className={`text-3xl font-black text-${accent}`}>
                        {Math.round(aiReview.fit_score)}%
                    </div>
                    {aiReview.recommendation && (
                        <Badge
                            size="sm"
                            className={`bg-${getRecommendationAccent(aiReview.recommendation)}`}
                        >
                            {getRecommendationLabel(aiReview.recommendation)}
                        </Badge>
                    )}
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white border-4 border-purple p-6">
                <h3 className="font-black text-lg uppercase tracking-wider mb-4 text-dark flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-robot"></i>
                    AI Analysis
                </h3>
                <div className="flex items-center justify-center py-8">
                    <div className="flex gap-3">
                        <div className="w-4 h-4 bg-coral animate-pulse" />
                        <div className="w-4 h-4 rounded-full bg-teal animate-pulse" />
                        <div className="w-4 h-4 rotate-45 bg-yellow animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border-4 border-coral p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-lg uppercase tracking-wider text-dark flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-robot"></i>
                        AI Analysis
                    </h3>
                    {isAdmin && (
                        <button
                            onClick={handleRequestNewReview}
                            disabled={requesting}
                            className="btn btn-sm bg-coral hover:bg-coral/80 text-white border-4 border-dark"
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
                <div className="bg-coral/10 border-l-4 border-coral p-4">
                    <i className="fa-duotone fa-regular fa-circle-exclamation text-coral mr-2"></i>
                    <span className="font-bold text-dark">Unable to Load AI Review</span>
                    <p className="text-sm mt-2 text-dark/80">{error}</p>
                    <p className="text-sm mt-2 text-dark/60">
                        Please try again or check back later.
                    </p>
                </div>
            </div>
        );
    }

    if (!aiReview) {
        return (
            <div className="bg-white border-4 border-teal p-6">
                <h3 className="font-black text-lg uppercase tracking-wider mb-4 text-dark flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-robot"></i>
                    AI Analysis
                </h3>
                <div className="bg-teal/10 border-l-4 border-teal p-4">
                    <i className="fa-duotone fa-regular fa-circle-info text-teal mr-2"></i>
                    <span className="text-dark">
                        AI analysis is in progress or not available for this
                        application.
                    </span>
                </div>
            </div>
        );
    }

    if (resolvedVariant === "compact") {
        const fitAccent = getFitScoreAccent(aiReview.fit_score);
        const confAccent = getConfidenceAccent(aiReview.confidence_level);
        const mainBorderColor = fitAccent === 'coral' ? 'border-coral' : fitAccent === 'teal' ? 'border-teal' : 'border-yellow';

        return (
            <div className={`bg-white border-4 ${mainBorderColor} p-6`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-lg uppercase tracking-wider text-dark flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-robot"></i>
                        AI Analysis
                    </h3>
                    {isAdmin && (
                        <button
                            onClick={handleRequestNewReview}
                            disabled={requesting}
                            className="btn btn-sm bg-coral hover:bg-coral/80 text-white border-4 border-dark"
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

                {/* Memphis Metrics */}
                <div className="retro-metrics grid grid-cols-2 mb-6">
                    <div className={`metric-block metric-block-sm bg-${fitAccent} text-white`}>
                        <div className="retro-metric-value">
                            {aiReview.fit_score ? Math.round(aiReview.fit_score) : "N/A"}%
                        </div>
                        <div className="retro-metric-label">Match Score</div>
                    </div>
                    <div className={`metric-block metric-block-sm bg-${confAccent} text-white`}>
                        <div className="retro-metric-value">
                            {aiReview.confidence_level || "N/A"}%
                        </div>
                        <div className="retro-metric-label">Confidence</div>
                    </div>
                </div>

                {aiReview.overall_summary && (
                    <div className="mb-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-2 text-dark">
                            Summary
                        </h4>
                        <p className="text-sm text-dark/80">
                            {aiReview.overall_summary}
                        </p>
                    </div>
                )}

                {aiReview.strengths && aiReview.strengths.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-2 text-dark flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-circle-check text-teal"></i>
                            Top Strengths
                        </h4>
                        <ul className="text-sm space-y-1">
                            {aiReview.strengths.slice(0, 3).map((strength, index) => (
                                <li key={index} className="text-dark/80 flex items-start gap-2">
                                    <span className="text-teal">•</span>
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {aiReview.concerns && aiReview.concerns.length > 0 && (
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-2 text-dark flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-yellow"></i>
                            Areas to Address
                        </h4>
                        <ul className="text-sm space-y-1">
                            {aiReview.concerns.slice(0, 2).map((concern, index) => (
                                <li key={index} className="text-dark/80 flex items-start gap-2">
                                    <span className="text-yellow">•</span>
                                    {concern}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    // Full variant
    const fitAccent = getFitScoreAccent(aiReview.fit_score);
    const confAccent = getConfidenceAccent(aiReview.confidence_level);
    const skillsAccent = getFitScoreAccent(aiReview.skills_match_percentage);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <h3 className="font-black text-xl uppercase tracking-wider text-dark flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-robot"></i>
                    AI Analysis
                </h3>
                {isAdmin && (
                    <button
                        onClick={handleRequestNewReview}
                        disabled={requesting}
                        className="btn btn-sm bg-coral hover:bg-coral/80 text-white border-4 border-dark"
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

            {/* Memphis Metrics Grid */}
            <div className="retro-metrics grid grid-cols-1 md:grid-cols-3">
                <div className={`metric-block bg-${fitAccent} text-white`}>
                    <div className="retro-metric-value">
                        {aiReview.fit_score ? Math.round(aiReview.fit_score) : "N/A"}%
                    </div>
                    <div className="retro-metric-label">Match Score</div>
                </div>
                <div className={`metric-block bg-${confAccent} text-white`}>
                    <div className="retro-metric-value">
                        {aiReview.confidence_level || "N/A"}%
                    </div>
                    <div className="retro-metric-label">Confidence Level</div>
                </div>
                <div className={`metric-block bg-${skillsAccent} text-white`}>
                    <div className="retro-metric-value">
                        {aiReview.skills_match_percentage || "N/A"}%
                    </div>
                    <div className="retro-metric-label">Skills Match</div>
                </div>
            </div>

            {/* Overall Summary */}
            {aiReview.overall_summary && (
                <div className="bg-white border-4 border-purple p-4">
                    <h4 className="font-bold uppercase tracking-wider mb-2 text-dark">
                        Summary
                    </h4>
                    <p className="text-sm text-dark/80">
                        {aiReview.overall_summary}
                    </p>
                </div>
            )}

            {/* Strengths & Concerns Grid */}
            {(aiReview.strengths?.length || aiReview.concerns?.length) && (
                <div className="grid md:grid-cols-2 gap-4">
                    {aiReview.strengths && aiReview.strengths.length > 0 && (
                        <div className="bg-teal/10 border-l-4 border-teal p-4">
                            <h4 className="font-bold uppercase tracking-wider mb-2 text-dark flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-circle-check text-teal"></i>
                                Key Strengths
                            </h4>
                            <ul className="space-y-1">
                                {aiReview.strengths.map((strength, index) => (
                                    <li
                                        key={index}
                                        className="text-sm text-dark/80 flex items-start gap-2"
                                    >
                                        <span className="text-teal">•</span>
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {aiReview.concerns && aiReview.concerns.length > 0 && (
                        <div className="bg-yellow/10 border-l-4 border-yellow p-4">
                            <h4 className="font-bold uppercase tracking-wider mb-2 text-dark flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-yellow"></i>
                                Areas to Address
                            </h4>
                            <ul className="space-y-1">
                                {aiReview.concerns.map((concern, index) => (
                                    <li
                                        key={index}
                                        className="text-sm text-dark/80 flex items-start gap-2"
                                    >
                                        <span className="text-yellow">•</span>
                                        {concern}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Skills Analysis */}
            {aiReview.skills_match_percentage !== null && (
                <div className="bg-white border-4 border-teal p-4">
                    <h4 className="font-bold uppercase tracking-wider mb-3 text-dark">
                        Skills Analysis
                    </h4>

                    {aiReview.matched_skills && aiReview.matched_skills.length > 0 && (
                        <div className="mb-3">
                            <span className="text-sm font-bold uppercase tracking-wider text-dark">
                                Matched Skills:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {aiReview.matched_skills.map((skill, index) => (
                                    <Badge
                                        key={index}
                                        size="sm"
                                        className="bg-teal max-w-[200px] truncate"
                                        title={skill}
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {aiReview.missing_skills && aiReview.missing_skills.length > 0 && (
                        <div>
                            <span className="text-sm font-bold uppercase tracking-wider text-dark">
                                Missing Skills:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {aiReview.missing_skills.map((skill, index) => (
                                    <Badge
                                        key={index}
                                        size="sm"
                                        className="bg-yellow max-w-[200px] truncate"
                                        title={skill}
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Experience & Location */}
            <div className="grid grid-cols-2 gap-4">
                {aiReview.candidate_years !== null &&
                    aiReview.required_years !== null && (
                        <div className="bg-white border-4 border-yellow p-4 text-center">
                            <h4 className="font-bold uppercase tracking-wider text-xs mb-2 text-dark">
                                Experience
                            </h4>
                            <div className="flex items-center justify-center gap-2">
                                {aiReview.meets_experience_requirement ? (
                                    <i className="fa-duotone fa-regular fa-circle-check text-teal text-xl"></i>
                                ) : (
                                    <i className="fa-duotone fa-regular fa-circle-xmark text-yellow text-xl"></i>
                                )}
                                <span className="text-sm font-bold text-dark">
                                    {aiReview.candidate_years} yrs (Req: {aiReview.required_years})
                                </span>
                            </div>
                        </div>
                    )}

                <div className="bg-white border-4 border-purple p-4 text-center">
                    <h4 className="font-bold uppercase tracking-wider text-xs mb-2 text-dark">
                        Location
                    </h4>
                    <span className="text-sm font-bold text-dark">
                        {getLocationLabel(aiReview.location_compatibility)}
                    </span>
                </div>
            </div>

            {/* Analysis Metadata */}
            <div className="text-xs text-dark/60 border-t-4 border-dark/20 pt-4">
                <p className="mb-2">
                    Analyzed by {aiReview.model_version ?? "AI"} on{" "}
                    {aiReview.analyzed_at
                        ? new Date(aiReview.analyzed_at).toLocaleString()
                        : "N/A"}
                </p>
                <p>
                    It is recommended to use this analysis as a supplementary
                    tool alongside human judgment. Always review the candidate's
                    full profile and application materials before making any
                    decisions. AI analysis may not capture all nuances of a
                    candidate's qualifications or potential.
                </p>
            </div>
        </div>
    );
}
