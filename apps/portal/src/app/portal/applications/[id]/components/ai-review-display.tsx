'use client';

import { useState, useEffect } from 'react';
import { createAuthenticatedClient } from '@/lib/api-client';
import type { AIReview } from '@splits-network/shared-types';
import { StatCard, StatCardGrid } from '@/components/ui';

interface AIReviewDisplayProps {
    applicationId: string;
    isRecruiter: boolean;
    isCompanyUser: boolean;
    token: string | null;
}

export default function AIReviewDisplay({ applicationId, isRecruiter, isCompanyUser, token }: AIReviewDisplayProps) {
    const [aiReview, setAIReview] = useState<AIReview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAIReview() {
            if (!token) return;

            try {
                const client = createAuthenticatedClient(token);
                const response = await client.get<{ data: AIReview[] }>('/ai-reviews', {
                    params: { application_id: applicationId }
                });

                const reviews = response.data;
                if (reviews && reviews.length > 0) {
                    setAIReview(reviews[0]);
                }
            } catch (err) {
                console.error('Error fetching AI review:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchAIReview();
    }, [applicationId, token]);

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

    if (!aiReview) {
        return null; // Don't show if no AI review exists
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
    // Company users (admin/hiring manager) see only score and recommendation
    if (isCompanyUser && !isRecruiter) {
        return (
            <div className="p-4 pt-0">
                <h2 className="mb-4">
                    <i className="fa-duotone fa-regular fa-robot mr-2"></i>
                    AI Analysis
                </h2>
                <div className="space-y-3">
                    <div>
                        <div className="text-sm text-base-content/60 mb-1">Fit Score</div>
                        <div className={`text-3xl font-bold ${getFitScoreColor(aiReview.fit_score)}`}>
                            {aiReview.fit_score}%
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-base-content/60 mb-1">Recommendation</div>
                        <span className={`badge ${getRecommendationColor(aiReview.recommendation)} badge-lg`}>
                            {getRecommendationLabel(aiReview.recommendation)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Recruiters and platform admins see full AI review details
    return (
        <div className="p-4 pt-0">
            <h2 className="mb-4">
                <i className="fa-duotone fa-regular fa-robot mr-2"></i>
                AI Analysis
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
                {/* Fit Score */}
                <div className='flex flex-col gap-4'>
                    <div className="stats shadow bg-base-100">
                        <div className="stat overflow-clip">
                            <div className="stat-figure">
                                <i className={`${getFitScoreIcon(aiReview.fit_score)} fa-2x ${getFitScoreColor(aiReview.fit_score)}`}></i>
                            </div>
                            <div className="stat-title">Match Score</div>
                            <div className={`stat-value ${getFitScoreColor(aiReview.fit_score)}`}>
                                {aiReview.fit_score}%
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
                {aiReview.overall_summary && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Summary</h3>
                        <p className="text-sm text-base-content/80">{aiReview.overall_summary}</p>
                    </div>
                )}
                {aiReview.strengths && aiReview.strengths.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Strengths</h3>
                        <ul className="text-sm text-base-content/80 list-disc list-inside">
                            {aiReview.strengths.map((strength: string, i: number) => (
                                <li key={i}>{strength}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {aiReview.concerns && aiReview.concerns.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Concerns</h3>
                        <ul className="text-sm text-base-content/80 list-disc list-inside">
                            {aiReview.concerns.map((concern: string, i: number) => (
                                <li key={i}>{concern}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
