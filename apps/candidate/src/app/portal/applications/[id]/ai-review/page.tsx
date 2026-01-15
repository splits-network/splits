'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { ApplicationFeedback } from '@splits-network/shared-types';

interface AIReviewPageProps {
    params: Promise<{ id: string }>;
}

export default function AIReviewPage({ params }: AIReviewPageProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const [applicationId, setApplicationId] = useState<string>('');
    const [application, setApplication] = useState<any>(null);
    const [aiReview, setAIReview] = useState<any>(null);
    const [feedback, setFeedback] = useState<ApplicationFeedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Feedback form state
    const [newFeedback, setNewFeedback] = useState('');
    const [sendingFeedback, setSendingFeedback] = useState(false);

    useEffect(() => {
        async function loadParams() {
            const resolvedParams = await params;
            setApplicationId(resolvedParams.id);
        }
        loadParams();
    }, [params]);

    useEffect(() => {
        if (!applicationId) return;

        async function loadData() {
            try {
                const token = await getToken();
                if (!token) {
                    router.push('/sign-in');
                    return;
                }

                const client = createAuthenticatedClient(token);

                // Fetch application with AI review
                const appResponse = await client.get(`/applications/${applicationId}`, {
                    params: { include: 'job,ai_review' }
                });
                const appData = (appResponse as any).data || appResponse;
                setApplication(appData);
                setAIReview(appData.ai_review);

                // Fetch feedback thread
                const feedbackResponse = await client.get(`/applications/${applicationId}/feedback`);
                const feedbackData = (feedbackResponse as any).data?.data || [];
                setFeedback(feedbackData);

                setLoading(false);
            } catch (err: any) {
                console.error('Error loading AI review:', err);
                setError(err.message || 'Failed to load AI review');
                setLoading(false);
            }
        }

        loadData();
    }, [applicationId, getToken, router]);

    const handleReturnToDraft = async () => {
        try {
            setSubmitting(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.post(`/applications/${applicationId}/return-to-draft`, {});

            router.push(`/portal/applications/${applicationId}`);
        } catch (err: any) {
            console.error('Error returning to draft:', err);
            setError('Failed to return to draft');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitApplication = async () => {
        try {
            setSubmitting(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.post(`/applications/${applicationId}/submit`, {});

            router.push(`/portal/applications/${applicationId}`);
        } catch (err: any) {
            console.error('Error submitting application:', err);
            setError('Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendFeedback = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newFeedback.trim()) return;

        try {
            setSendingFeedback(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.post(`/applications/${applicationId}/feedback`, {
                message_text: newFeedback,
                feedback_type: 'note',
                created_by_type: 'candidate'
            });

            const newFeedbackItem = (response as any).data;
            setFeedback([...feedback, newFeedbackItem]);
            setNewFeedback('');
        } catch (err: any) {
            console.error('Error sending feedback:', err);
            setError('Failed to send feedback');
        } finally {
            setSendingFeedback(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    if (error || !application || !aiReview) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error || 'AI review not found'}</span>
                </div>
                <Link href={`/portal/applications/${applicationId}`} className="btn btn-ghost mt-4">
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                    Back to Application
                </Link>
            </div>
        );
    }

    const job = application.job || {};
    const fitScoreColor = aiReview.fit_score >= 70 ? 'success' : aiReview.fit_score >= 50 ? 'warning' : 'error';

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <div className="text-sm breadcrumbs mb-6">
                <ul>
                    <li><Link href="/portal/dashboard">Dashboard</Link></li>
                    <li><Link href="/portal/applications">Applications</Link></li>
                    <li><Link href={`/portal/applications/${applicationId}`}>Application</Link></li>
                    <li>AI Review</li>
                </ul>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">AI Review Results</h1>
                <p className="text-xl text-base-content/70">{job.title || 'Position'}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Fit Score Card */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title mb-4">
                                <i className="fa-duotone fa-regular fa-chart-line"></i>
                                Overall Fit Score
                            </h2>

                            <div className="flex items-center gap-6">
                                <div className={`radial-progress text-${fitScoreColor}`} style={{ "--value": aiReview.fit_score, "--size": "8rem", "--thickness": "0.5rem" } as any}>
                                    <span className="text-3xl font-bold">{aiReview.fit_score}</span>
                                </div>

                                <div className="flex-1">
                                    <div className="mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">Recommendation</span>
                                            <span className={`badge badge-${aiReview.recommendation === 'good_fit' ? 'success' : aiReview.recommendation === 'poor_fit' ? 'error' : 'warning'}`}>
                                                {aiReview.recommendation?.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <progress className={`progress progress-${fitScoreColor} w-full`} value={aiReview.confidence_level} max="100"></progress>
                                        <span className="text-xs text-base-content/60">{aiReview.confidence_level}% confidence</span>
                                    </div>

                                    <p className="text-sm text-base-content/70 mt-4">
                                        {aiReview.overall_summary}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Strengths */}
                    {aiReview.strengths && aiReview.strengths.length > 0 && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h2 className="card-title text-success mb-4">
                                    <i className="fa-duotone fa-regular fa-check-circle"></i>
                                    Strengths
                                </h2>
                                <ul className="space-y-2">
                                    {aiReview.strengths.map((strength: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-circle-check text-success mt-1"></i>
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Concerns */}
                    {aiReview.concerns && aiReview.concerns.length > 0 && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h2 className="card-title text-warning mb-4">
                                    <i className="fa-duotone fa-regular fa-exclamation-triangle"></i>
                                    Areas for Improvement
                                </h2>
                                <ul className="space-y-2">
                                    {aiReview.concerns.map((concern: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-exclamation-circle text-warning mt-1"></i>
                                            <span>{concern}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Skills Match */}
                    {aiReview.skills_match && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h2 className="card-title mb-4">
                                    <i className="fa-duotone fa-regular fa-tools"></i>
                                    Skills Analysis
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Match Score</span>
                                            <span className="text-sm font-bold">{aiReview.skills_match.match_percentage}%</span>
                                        </div>
                                        <progress className="progress progress-primary w-full" value={aiReview.skills_match.match_percentage} max="100"></progress>
                                    </div>

                                    {aiReview.skills_match.matched_skills && aiReview.skills_match.matched_skills.length > 0 && (
                                        <div>
                                            <div className="text-sm font-medium mb-2">Matched Skills</div>
                                            <div className="flex flex-wrap gap-2">
                                                {aiReview.skills_match.matched_skills.map((skill: string, index: number) => (
                                                    <span key={index} className="badge badge-success badge-outline">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {aiReview.skills_match.missing_skills && aiReview.skills_match.missing_skills.length > 0 && (
                                        <div>
                                            <div className="text-sm font-medium mb-2">Skills to Develop</div>
                                            <div className="flex flex-wrap gap-2">
                                                {aiReview.skills_match.missing_skills.map((skill: string, index: number) => (
                                                    <span key={index} className="badge badge-warning badge-outline">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feedback Thread */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title mb-4">
                                <i className="fa-duotone fa-regular fa-comments"></i>
                                Discussion
                            </h2>

                            {feedback.length === 0 ? (
                                <p className="text-base-content/60 text-sm">No messages yet. Start a conversation about this review.</p>
                            ) : (
                                <div className="space-y-4 mb-4">
                                    {feedback.map((item) => (
                                        <div key={item.id} className={`chat ${item.created_by_type === 'candidate' ? 'chat-end' : 'chat-start'}`}>
                                            <div className="chat-bubble">
                                                <div className="text-xs text-base-content/60 mb-1">
                                                    {item.created_by_type === 'candidate' ? 'You' : 'Recruiter'} • {new Date(item.created_at).toLocaleDateString()}
                                                </div>
                                                <p>{item.message_text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New message form */}
                            <form onSubmit={handleSendFeedback} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newFeedback}
                                    onChange={(e) => setNewFeedback(e.target.value)}
                                    placeholder="Add a note or question..."
                                    className="input input-bordered flex-1"
                                    disabled={sendingFeedback}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={sendingFeedback || !newFeedback.trim()}
                                >
                                    {sendingFeedback ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Sending
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                            Send
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h3 className="card-title text-base mb-4">Next Steps</h3>

                            <div className="space-y-4">
                                <div className="alert alert-info">
                                    <i className="fa-duotone fa-regular fa-info-circle"></i>
                                    <div className="text-sm">
                                        <p className="font-medium mb-1">Review Complete</p>
                                        <p className="text-base-content/70">You can edit your application or proceed with submission.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleReturnToDraft}
                                    className="btn btn-outline btn-block"
                                    disabled={submitting}
                                >
                                    <i className="fa-duotone fa-regular fa-edit"></i>
                                    Edit Draft
                                </button>

                                <button
                                    onClick={handleSubmitApplication}
                                    className="btn btn-primary btn-block"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-check-circle"></i>
                                            Submit Application
                                        </>
                                    )}
                                </button>

                                <Link
                                    href={`/portal/applications/${applicationId}`}
                                    className="btn btn-ghost btn-block"
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                                    Back to Application
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Analysis Details */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h3 className="card-title text-base mb-4">Analysis Details</h3>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="text-base-content/60">Analyzed</div>
                                    <div className="font-medium">
                                        {new Date(aiReview.analyzed_at).toLocaleString()}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-base-content/60">Processing Time</div>
                                    <div className="font-medium">
                                        {(aiReview.processing_time_ms / 1000).toFixed(2)}s
                                    </div>
                                </div>

                                <div>
                                    <div className="text-base-content/60">Model Version</div>
                                    <div className="font-medium">{aiReview.model_version}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
