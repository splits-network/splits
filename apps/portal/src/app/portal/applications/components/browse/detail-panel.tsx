"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Application } from "./types";
import DetailHeader from "./detail-header";
import { getApplicationStageBadge } from "@/lib/utils/badge-styles";

interface DetailPanelProps {
    id: string | null;
    onClose: () => void;
}

export default function DetailPanel({ id, onClose }: DetailPanelProps) {
    const { getToken } = useAuth();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
        "overview" | "candidate" | "job" | "documents" | "timeline" | "ai_review"
    >("overview");

    const fetchDetail = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            // V2 API standard: /applications/:id?include=candidate,job,company,recruiter,ai_review,documents
            const res = await client.get(`/applications/${id}`, {
                params: {
                    include: "candidate,job,company,recruiter,ai_review,documents,timeline",
                },
            });
            setApplication(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load application details");
        } finally {
            setLoading(false);
        }
    }, [id, getToken]);

    useEffect(() => {
        if (!id) {
            setApplication(null);
            return;
        }

        fetchDetail();
    }, [fetchDetail]);

    if (!id) {
        return (
            <div className="hidden md:flex flex-1 items-center justify-center text-base-content/30 bg-base-100">
                <div className="text-center">
                    <i className="fa-duotone fa-user-check text-6xl mb-4 opacity-50" />
                    <p className="text-lg">Select an application to view details</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex flex-col bg-base-100">
                <div className="h-20 border-b border-base-300 animate-pulse bg-base-200/50" />
                <div className="p-8 space-y-4">
                    <div className="h-8 w-1/3 bg-base-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-base-200 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-base-200 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="flex-1 flex items-center justify-center bg-base-100">
                <div className="text-center max-w-md p-6">
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation" />
                        <span>{error || "Application not found"}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost mt-4 md:hidden"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const stageBadge = getApplicationStageBadge(application.stage);

    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader application={application} onClose={onClose} />

            <div className="flex-1 overflow-y-auto">
                {/* Tabs */}
                <div
                    role="tablist"
                    className="tabs tabs-bordered w-full px-4 pt-2 overflow-x-auto"
                >
                    <a
                        role="tab"
                        className={`tab whitespace-nowrap ${activeTab === "overview" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        <i className="fa-duotone fa-clipboard mr-2" />
                        Overview
                    </a>
                    <a
                        role="tab"
                        className={`tab whitespace-nowrap ${activeTab === "candidate" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("candidate")}
                    >
                        <i className="fa-duotone fa-user mr-2" />
                        Candidate
                    </a>
                    <a
                        role="tab"
                        className={`tab whitespace-nowrap ${activeTab === "job" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("job")}
                    >
                        <i className="fa-duotone fa-briefcase mr-2" />
                        Job Details
                    </a>
                    <a
                        role="tab"
                        className={`tab whitespace-nowrap ${activeTab === "documents" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("documents")}
                    >
                        <i className="fa-duotone fa-file mr-2" />
                        Documents
                        {application.documents && application.documents.length > 0 && (
                            <span className="badge badge-xs badge-primary ml-1">
                                {application.documents.length}
                            </span>
                        )}
                    </a>
                    <a
                        role="tab"
                        className={`tab whitespace-nowrap ${activeTab === "ai_review" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("ai_review")}
                    >
                        <i className="fa-duotone fa-brain mr-2" />
                        AI Review
                        {application.ai_review?.fit_score && (
                            <span className="badge badge-xs badge-accent ml-1">
                                {Math.round(application.ai_review.fit_score * 100)}%
                            </span>
                        )}
                    </a>
                    <a
                        role="tab"
                        className={`tab whitespace-nowrap ${activeTab === "timeline" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("timeline")}
                    >
                        <i className="fa-duotone fa-timeline mr-2" />
                        Timeline
                    </a>
                </div>

                {/* Content */}
                <div className="p-6 max-w-4xl">
                    {activeTab === "overview" && (
                        <div className="space-y-8">
                            {/* Application Summary */}
                            <section>
                                <h3 className="text-lg font-bold mb-4">Application Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="card bg-base-200 p-4">
                                        <h4 className="font-semibold mb-2">Status</h4>
                                        <span className={`badge ${stageBadge.className}`}>
                                            {stageBadge.label}
                                        </span>
                                    </div>
                                    <div className="card bg-base-200 p-4">
                                        <h4 className="font-semibold mb-2">Submitted</h4>
                                        <p>
                                            {application.created_at 
                                                ? new Date(application.created_at).toLocaleDateString()
                                                : "Unknown date"
                                            }
                                        </p>
                                    </div>
                                    {application.recruiter && (
                                        <div className="card bg-base-200 p-4">
                                            <h4 className="font-semibold mb-2">Recruiter</h4>
                                            <p>{application.recruiter.name}</p>
                                            <p className="text-sm text-base-content/60">{application.recruiter.email}</p>
                                        </div>
                                    )}
                                    {application.ai_review?.fit_score && (
                                        <div className="card bg-base-200 p-4">
                                            <h4 className="font-semibold mb-2">AI Fit Score</h4>
                                            <div className="flex items-center gap-2">
                                                <progress 
                                                    className="progress progress-accent w-20" 
                                                    value={application.ai_review.fit_score * 100} 
                                                    max="100"
                                                />
                                                <span className="font-bold">{Math.round(application.ai_review.fit_score * 100)}%</span>
                                            </div>
                                            {application.ai_review.recommendation && (
                                                <span className={`badge badge-xs mt-1 ${
                                                    application.ai_review.recommendation === 'strong_fit' ? 'badge-success' :
                                                    application.ai_review.recommendation === 'good_fit' ? 'badge-info' :
                                                    application.ai_review.recommendation === 'fair_fit' ? 'badge-warning' : 
                                                    'badge-error'
                                                }`}>
                                                    {application.ai_review.recommendation.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "candidate" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold">Candidate Profile</h3>
                            {application.candidate ? (
                                <div className="card bg-base-200 p-6">
                                    <h4 className="font-semibold text-lg mb-4">{application.candidate.full_name}</h4>
                                    <div className="grid gap-4">
                                        <div>
                                            <label className="font-medium text-sm text-base-content/70">Email</label>
                                            <p>{application.candidate.email}</p>
                                        </div>
                                        {application.candidate.linkedin_url && (
                                            <div>
                                                <label className="font-medium text-sm text-base-content/70">LinkedIn</label>
                                                <a 
                                                    href={application.candidate.linkedin_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="link link-primary"
                                                >
                                                    View Profile
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8 text-base-content/50">
                                    <i className="fa-duotone fa-user text-4xl mb-2" />
                                    <p>Candidate information not available</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "job" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold">Job Details</h3>
                            {application.job ? (
                                <div className="card bg-base-200 p-6">
                                    <h4 className="font-semibold text-lg mb-4">{application.job.title}</h4>
                                    <div className="grid gap-4">
                                        <div>
                                            <label className="font-medium text-sm text-base-content/70">Company</label>
                                            <p>{application.job.company?.name || "Confidential Company"}</p>
                                        </div>
                                        {application.job.location && (
                                            <div>
                                                <label className="font-medium text-sm text-base-content/70">Location</label>
                                                <p>{application.job.location}</p>
                                            </div>
                                        )}
                                        {application.job.description && (
                                            <div>
                                                <label className="font-medium text-sm text-base-content/70">Description</label>
                                                <div className="prose prose-sm max-w-none">
                                                    {application.job.description}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8 text-base-content/50">
                                    <i className="fa-duotone fa-briefcase text-4xl mb-2" />
                                    <p>Job information not available</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "documents" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold">Documents</h3>
                            {application.documents && application.documents.length > 0 ? (
                                <div className="space-y-4">
                                    {application.documents.map((doc: any, index: number) => (
                                        <div key={index} className="card bg-base-200 p-4 flex flex-row items-center gap-4">
                                            <i className="fa-duotone fa-file text-2xl text-primary" />
                                            <div className="flex-1">
                                                <h4 className="font-medium">{doc.filename || `Document ${index + 1}`}</h4>
                                                <p className="text-sm text-base-content/60">
                                                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Unknown date"}
                                                </p>
                                            </div>
                                            <button className="btn btn-ghost btn-sm">
                                                <i className="fa-duotone fa-download" />
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 text-base-content/50">
                                    <i className="fa-duotone fa-file text-4xl mb-2" />
                                    <p>No documents uploaded</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "ai_review" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold">AI Analysis</h3>
                            {application.ai_review ? (
                                <div className="space-y-4">
                                    <div className="card bg-base-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold">Fit Assessment</h4>
                                            {application.ai_review.recommendation && (
                                                <span className={`badge ${
                                                    application.ai_review.recommendation === 'strong_fit' ? 'badge-success' :
                                                    application.ai_review.recommendation === 'good_fit' ? 'badge-info' :
                                                    application.ai_review.recommendation === 'fair_fit' ? 'badge-warning' : 
                                                    'badge-error'
                                                }`}>
                                                    {application.ai_review.recommendation.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                        {application.ai_review.fit_score && (
                                            <div className="flex items-center gap-4 mb-4">
                                                <progress 
                                                    className="progress progress-accent flex-1" 
                                                    value={application.ai_review.fit_score * 100} 
                                                    max="100"
                                                />
                                                <span className="font-bold text-xl">{Math.round(application.ai_review.fit_score * 100)}%</span>
                                            </div>
                                        )}
                                        <p className="text-sm text-base-content/70">
                                            AI analysis based on resume content and job requirements matching.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8 text-base-content/50">
                                    <i className="fa-duotone fa-brain text-4xl mb-2" />
                                    <p>AI analysis not available</p>
                                    <button className="btn btn-primary btn-sm mt-4">
                                        Request AI Review
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "timeline" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold">Application Timeline</h3>
                            <div className="timeline timeline-vertical">
                                <div className="timeline-start timeline-box">
                                    Application Submitted
                                </div>
                                <div className="timeline-middle">
                                    <i className="fa-duotone fa-circle text-primary" />
                                </div>
                                <div className="timeline-end text-sm text-base-content/60">
                                    {application.created_at 
                                        ? new Date(application.created_at).toLocaleDateString()
                                        : "Unknown date"
                                    }
                                </div>
                            </div>
                            {/* TODO: Add more timeline events when timeline data is available */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}