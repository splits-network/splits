'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import type { AIReview } from '@splits-network/shared-types';

interface AIReviewPanelProps {
    aiReviewId: string;
}

const getRecommendationColor = (recommendation: string | null) => {
    if (!recommendation) return 'badge-ghost';
    switch (recommendation) {
        case 'strong_fit':
            return 'badge-success';
        case 'good_fit':
            return 'badge-info';
        case 'fair_fit':
            return 'badge-warning';
        case 'poor_fit':
            return 'badge-error';
        default:
            return 'badge-ghost';
    }
};

const getRecommendationLabel = (recommendation: string | null) => {
    if (!recommendation) return 'Not Yet Analyzed';
    switch (recommendation) {
        case 'strong_fit':
            return 'Strong Match';
        case 'good_fit':
            return 'Good Match';
        case 'fair_fit':
            return 'Fair Match';
        case 'poor_fit':
            return 'Needs Improvement';
        default:
            return recommendation;
    }
};

const getFitScoreColor = (score: number | null) => {
    if (!score) return 'text-base-content';
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-info';
    if (score >= 50) return 'text-warning';
    return 'text-error';
};

const getFitScoreIcon = (score: number | null) => {
    if (!score) return 'fa-duotone fa-regular fa-question';
    if (score >= 90) return 'fa-duotone fa-regular fa-trophy';
    if (score >= 70) return 'fa-duotone fa-regular fa-chart-line';
    if (score >= 50) return 'fa-duotone fa-regular fa-chart-simple';
    return 'fa-duotone fa-regular fa-triangle-exclamation';
};

const getConfidenceIcon = (confidence: number | null) => {
    if (!confidence) return 'fa-duotone fa-regular fa-question';
    if (confidence >= 90) return 'fa-duotone fa-regular fa-shield-check';
    if (confidence >= 70) return 'fa-duotone fa-regular fa-shield-halved';
    if (confidence >= 50) return 'fa-duotone fa-regular fa-shield';
    return 'fa-duotone fa-regular fa-shield-exclamation';
};

const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'text-base-content';
    if (confidence >= 90) return 'text-success';
    if (confidence >= 70) return 'text-info';
    if (confidence >= 50) return 'text-warning';
    return 'text-error';
};

const getLocationLabel = (compatibility: string) => {
    switch (compatibility) {
        case 'perfect':
            return 'Perfect Match';
        case 'good':
            return 'Good Match';
        case 'challenging':
            return 'Challenging';
        case 'mismatch':
            return 'Location Mismatch';
        default:
            return compatibility;
    }
};

export default function AIReviewPanel({ aiReviewId }: AIReviewPanelProps) {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [aiReview, setAIReview] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = await getToken();
                if (!token) {
                    setError('Authentication required');
                    setLoading(false);
                    return;
                }
                const client = createAuthenticatedClient(token);

                // Fetch AI review
                const response = await client.get<{ data: any }>(`/ai-reviews/${aiReviewId}`);
                console.log('Fetched AI review:', response.data);
                setAIReview(response.data);
                setError(null);
            } catch (err) {
                // Network errors or other API errors
                console.error('Error fetching data:', err);
                const errorMsg = err instanceof Error ? err.message : 'Unable to load data';
                // Check if it's a service unavailability error
                if (errorMsg.includes('500') || errorMsg.includes('fetch failed') || errorMsg.includes('Service call failed')) {
                    // Service unavailable - silently set to null to hide the panel
                    console.warn('AI review service temporarily unavailable');
                    setAIReview(null);
                    setError(null);
                } else {
                    setError('Unable to load AI review at this time');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [aiReviewId]);

    const handleRequestNewReview = async () => {
        setRequesting(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) {
                setError('Authentication required');
                return;
            }
            const client = createAuthenticatedClient(token);
            const response = await client.post<{ data: AIReview }>('/ai-reviews', { application_id: aiReview?.application_id });
            // V2 API returns { data: {...} } envelope
            setAIReview(response.data);
        } catch (err) {
            console.error('Error requesting new AI review:', err);
            setError(err instanceof Error ? err.message : 'Failed to request new review');
        } finally {
            setRequesting(false);
        }
    };

    if (loading) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-robot"></i>
                        AI Analysis
                    </h2>
                    <div className="flex items-center justify-center py-8">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card-body">
                <h2 className="card-title">
                    <i className="fa-duotone fa-regular fa-robot"></i>
                    AI Analysis
                </h2>
                <div className="alert alert-warning">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                    <div>
                        <div className="font-semibold">Unable to Load AI Review</div>
                        <div className="text-sm mt-1">{error}</div>
                        <div className="text-sm mt-2">Please try refreshing the page or check back later.</div>
                    </div>
                </div>
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
            </div>
        );
    }

    if (!aiReview) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-robot"></i>
                        AI Analysis
                    </h2>
                    <div className="alert alert-info">
                        <i className="fa-duotone fa-regular fa-circle-info"></i>
                        <span>Your application is being reviewed by our AI system. You'll receive an email when the analysis is complete.</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 pt-0">
            <h2 className="mb-4">
                <i className="fa-duotone fa-regular fa-robot mr-2"></i>
                AI Analysis
            </h2>

            <div className='grid grid-cols-4 gap-4'>
                {/* Fit Score */}
                <div className='flex flex-col gap-4'>
                    <div className="stats shadow bg-base-100">
                        <div className="stat overflow-clip">
                            <div className="stat-figure">
                                <i className={`${getFitScoreIcon(aiReview.fit_score)} fa-2x ${getFitScoreColor(aiReview.fit_score)}`}></i>
                            </div>
                            <div className="stat-title">Match Score</div>
                            <div className={`stat-value ${getFitScoreColor(aiReview.fit_score)}`}>
                                {aiReview.fit_score}/100
                            </div>
                            <div className="stat-desc">
                                <span className={`badge badge-sm ${getRecommendationColor(aiReview.recommendation)}`}>
                                    {getRecommendationLabel(aiReview.recommendation)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="stats shadow bg-base-100">
                        <div className="stat">
                            <div className="stat-figure">
                                <i className={`${getConfidenceIcon(aiReview.confidence_level)} fa-2x ${getConfidenceColor(aiReview.confidence_level)}`}></i>
                            </div>
                            <div className="stat-title">Confidence Level</div>
                            <div className={`stat-value ${getConfidenceColor(aiReview.confidence_level)}`}>{aiReview.confidence_level}%</div>
                            <div className="stat-desc">AI confidence in analysis</div>
                        </div>
                    </div>
                </div>

                {/* Overall Summary */}
                <div className="mt-4">
                    <h3 className="font-semibold text-lg mb-2">Summary</h3>
                    <p className="text-base-content/80">{aiReview.overall_summary}</p>
                </div>

                {/* Strengths */}
                {aiReview.strengths && aiReview.strengths.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-circle-check text-success"></i>
                            Your Strengths
                        </h3>
                        <ul className="list-disc list-inside space-y-1">
                            {aiReview.strengths.map((strength, index) => (
                                <li key={index} className="text-base-content/80">{strength}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Concerns */}
                {aiReview.concerns && aiReview.concerns.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-warning"></i>
                            Areas to Address
                        </h3>
                        <ul className="list-disc list-inside space-y-1">
                            {aiReview.concerns.map((concern, index) => (
                                <li key={index} className="text-base-content/80">{concern}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Skills Match */}
                {(aiReview.skills_match.match_percentage !== null) && (
                    <div className="">
                        <h3 className="font-semibold text-lg mb-2">Skills Analysis</h3>

                        {aiReview.skills_match.match_percentage !== null && (
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm">Skills Match:</span>
                                <div className="flex-1">
                                    <progress
                                        className="progress progress-success w-full"
                                        value={aiReview.skills_match.match_percentage}
                                        max="100"
                                    ></progress>
                                </div>
                                <span className="text-sm font-semibold">{aiReview.skills_match.match_percentage}%</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="mb-2">
                    <span className="text-sm font-medium">Matched Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {aiReview.skills_match.matched_skills && aiReview.skills_match.matched_skills.length > 0 ? (
                            <ul className="list-disc list-inside marker:text-success marker:text-xl">
                                {aiReview.skills_match.matched_skills.map((skill, index) => (
                                    <li key={index} className="text-sm">{skill}</li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-sm text-base-content/60 italic">No matched skills identified</span>
                        )}
                    </div>
                </div>

                <div>
                    <span className="text-sm font-medium">Skills to Develop:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {aiReview.skills_match.missing_skills && aiReview.skills_match.missing_skills.length > 0 ? (
                            <ul className="list-disc list-inside marker:text-warning marker:text-xl">
                                {aiReview.skills_match.missing_skills.map((skill, index) => (
                                    <li key={index} className="text-sm">{skill}</li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-sm text-base-content/60 italic">You have all required skills!</span>
                        )}
                    </div>
                </div>

                {/* Experience & Location */}
                <div className="flex flex-col gap-4">
                    {aiReview.experience_analysis.candidate_years !== null && aiReview.experience_analysis.required_years !== null && (
                        <div>
                            <h4 className="font-medium text-sm mb-1">Experience</h4>
                            <div className="flex items-center gap-2">
                                {aiReview.experience_analysis.meets_requirement ? (
                                    <i className="fa-duotone fa-regular fa-circle-check text-success"></i>
                                ) : (
                                    <i className="fa-duotone fa-regular fa-circle-xmark text-warning"></i>
                                )}
                                <span className="text-sm">
                                    {aiReview.experience_analysis.candidate_years} years (Required: {aiReview.experience_analysis.required_years})
                                </span>
                            </div>
                        </div>
                    )}

                    {aiReview.location_compatibility && (
                        <div>
                            <h4 className="font-medium text-sm mb-1">Location</h4>
                            <span className="text-sm">{getLocationLabel(aiReview.location_compatibility)}</span>
                        </div>
                    )}
                </div>

                {/* Analysis Info */}
                <div className="mt-4 text-xs text-base-content/60 text-right col-span-4">
                    <p>Analyzed by {aiReview.model_version ?? 'AI'} on {aiReview.analyzed_at ? new Date(aiReview.analyzed_at).toLocaleString() : 'N/A'}</p>
                </div>
            </div>
        </div>
    );
}
