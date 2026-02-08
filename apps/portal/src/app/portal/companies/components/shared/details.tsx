"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@splits-network/shared-ui";
import {
    Company,
    CompanyRelationship,
    getRelationshipStatusBadgeClass,
    formatDate,
} from "../../types";

interface DetailsProps {
    companyId: string;
    onRefresh?: () => void;
}

type TabType = "overview" | "jobs" | "relationship";

export default function Details({ companyId, onRefresh }: DetailsProps) {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const [company, setCompany] = useState<Company | null>(null);
    const [jobs, setJobs] = useState<any[]>([]);
    const [relationship, setRelationship] =
        useState<CompanyRelationship | null>(null);
    const [loading, setLoading] = useState(false);
    const [jobsLoading, setJobsLoading] = useState(false);

    const fetchCompany = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);

            const companyResponse: any = await client.get(
                `/companies/${companyId}`,
            );
            setCompany(companyResponse.data);

            // Check if relationship exists
            const relationshipsResponse: any = await client.get(
                "/recruiter-companies",
                { params: { company_id: companyId, limit: 1 } },
            );
            if (
                relationshipsResponse.data &&
                relationshipsResponse.data.length > 0
            ) {
                setRelationship(relationshipsResponse.data[0]);
            } else {
                setRelationship(null);
            }
        } catch (err) {
            console.error("Failed to fetch company:", err);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    const fetchJobs = useCallback(async () => {
        if (!companyId) return;
        setJobsLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);

            const jobsResponse: any = await client.get("/jobs", {
                params: { company_id: companyId, status: "active", limit: 50 },
            });
            setJobs(jobsResponse.data || []);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        } finally {
            setJobsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    useEffect(() => {
        fetchCompany();
    }, [fetchCompany]);

    useEffect(() => {
        if (activeTab === "jobs") {
            fetchJobs();
        }
    }, [activeTab, fetchJobs]);

    if (loading) {
        return (
            <div className="p-8">
                <LoadingState message="Loading company details..." />
            </div>
        );
    }

    if (!company) return null;

    return (
        <div className="space-y-6 p-6">
            {/* Tabs */}
            <div className="overflow-x-auto">
                <div role="tablist" className="tabs tabs-lift min-w-max mb-4">
                    <a
                        role="tab"
                        className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        <i className="fa-duotone fa-regular fa-building mr-2" />
                        Overview
                    </a>
                    <a
                        role="tab"
                        className={`tab ${activeTab === "jobs" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("jobs")}
                    >
                        <i className="fa-duotone fa-regular fa-briefcase mr-2" />
                        Jobs
                        {jobs.length > 0 && (
                            <span className="badge badge-xs badge-primary ml-1">
                                {jobs.length}
                            </span>
                        )}
                    </a>
                    {relationship && (
                        <a
                            role="tab"
                            className={`tab ${activeTab === "relationship" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("relationship")}
                        >
                            <i className="fa-duotone fa-regular fa-handshake mr-2" />
                            Relationship
                        </a>
                    )}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && <OverviewTab company={company} />}
            {activeTab === "jobs" && (
                <JobsTab jobs={jobs} loading={jobsLoading} />
            )}
            {activeTab === "relationship" && relationship && (
                <RelationshipTab relationship={relationship} />
            )}
        </div>
    );
}

function OverviewTab({ company }: { company: Company }) {
    return (
        <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
                {company.logo_url ? (
                    <img
                        src={company.logo_url}
                        alt={`${company.name} logo`}
                        className="w-16 h-16 rounded-lg object-contain border border-base-300 shadow"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                        {company.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <h3 className="text-lg font-bold">{company.name}</h3>
                    <p className="text-sm text-base-content/60">
                        {company.industry || "No industry specified"}
                    </p>
                </div>
            </div>

            {/* Description */}
            <div>
                <h4 className="text-sm font-semibold text-base-content/60 mb-1">
                    About
                </h4>
                <p className="text-sm">
                    {company.description || (
                        <span className="text-base-content/40 italic">
                            Not provided
                        </span>
                    )}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="text-sm font-semibold text-base-content/60 mb-1">
                        Industry
                    </h4>
                    <p className="text-sm">
                        {company.industry || (
                            <span className="text-base-content/40 italic">
                                Not provided
                            </span>
                        )}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-base-content/60 mb-1">
                        Size
                    </h4>
                    <p className="text-sm">
                        {company.company_size ? (
                            `${company.company_size} employees`
                        ) : (
                            <span className="text-base-content/40 italic">
                                Not provided
                            </span>
                        )}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-base-content/60 mb-1">
                        Location
                    </h4>
                    <p className="text-sm">
                        {company.headquarters_location ? (
                            <>
                                <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                {company.headquarters_location}
                            </>
                        ) : (
                            <span className="text-base-content/40 italic">
                                Not provided
                            </span>
                        )}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-base-content/60 mb-1">
                        Website
                    </h4>
                    {company.website ? (
                        <a
                            href={
                                company.website.startsWith("http")
                                    ? company.website
                                    : `https://${company.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm link link-primary"
                        >
                            {company.website}
                        </a>
                    ) : (
                        <p className="text-sm text-base-content/40 italic">
                            Not provided
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function JobsTab({ jobs, loading }: { jobs: any[]; loading: boolean }) {
    if (loading) {
        return <LoadingState message="Loading jobs..." />;
    }

    if (jobs.length === 0) {
        return (
            <div className="text-center py-8 text-base-content/60">
                <i className="fa-duotone fa-regular fa-briefcase text-3xl mb-2 block" />
                <p>No active jobs for this company</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {jobs.map((job: any) => (
                <div key={job.id} className="card bg-base-200 p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="font-semibold text-sm">
                                {job.title}
                            </h4>
                            <p className="text-xs text-base-content/60 mt-1">
                                <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                {job.location || "No location"}
                            </p>
                            <span className="badge badge-ghost badge-xs mt-1">
                                {job.employment_type || "Not specified"}
                            </span>
                        </div>
                        <span
                            className={`badge badge-xs ${job.status === "active" ? "badge-success" : "badge-ghost"}`}
                        >
                            {job.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function RelationshipTab({
    relationship,
}: {
    relationship: CompanyRelationship;
}) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="text-sm font-semibold text-base-content/60 mb-1">
                        Status
                    </h4>
                    <span
                        className={`badge ${getRelationshipStatusBadgeClass(relationship.status)}`}
                    >
                        {relationship.status}
                    </span>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-base-content/60 mb-1">
                        Type
                    </h4>
                    <p className="text-sm capitalize">
                        {relationship.relationship_type}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-base-content/60 mb-1">
                        Can Manage Jobs
                    </h4>
                    <p className="text-sm">
                        {relationship.can_manage_company_jobs ? (
                            <span className="text-success">
                                <i className="fa-duotone fa-regular fa-check mr-1" />
                                Yes
                            </span>
                        ) : (
                            <span className="text-base-content/60">No</span>
                        )}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-base-content/60 mb-1">
                        Start Date
                    </h4>
                    <p className="text-sm">
                        {relationship.relationship_start_date ? (
                            formatDate(relationship.relationship_start_date)
                        ) : (
                            <span className="text-base-content/40 italic">
                                Not provided
                            </span>
                        )}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-base-content/60 mb-1">
                        Invited By
                    </h4>
                    <p className="text-sm">
                        {relationship.invited_by || (
                            <span className="text-base-content/40 italic">
                                Not provided
                            </span>
                        )}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-base-content/60 mb-1">
                        Created
                    </h4>
                    <p className="text-sm">
                        {formatDate(relationship.created_at)}
                    </p>
                </div>
            </div>

            {relationship.status === "terminated" && (
                <div className="alert alert-warning">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation" />
                    <div>
                        <h3 className="font-bold text-sm">
                            Relationship Terminated
                        </h3>
                        <p className="text-xs">
                            Reason:{" "}
                            {relationship.termination_reason || (
                                <span className="italic">Not provided</span>
                            )}
                        </p>
                        <p className="text-xs">
                            Ended:{" "}
                            {relationship.relationship_end_date ? (
                                formatDate(relationship.relationship_end_date)
                            ) : (
                                <span className="italic">Not provided</span>
                            )}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
