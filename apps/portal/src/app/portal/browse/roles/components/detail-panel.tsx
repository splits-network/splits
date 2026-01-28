"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Job } from "./types";
import DetailHeader from "./detail-header";

interface DetailPanelProps {
    id: string | null;
    onClose: () => void;
}

export default function DetailPanel({ id, onClose }: DetailPanelProps) {
    const { getToken } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
        "overview" | "requirements" | "financials"
    >("overview");

    useEffect(() => {
        if (!id) {
            setJob(null);
            return;
        }

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                // V2 API standard: /jobs/:id?include=company,requirements
                const res = await client.get(`/jobs/${id}`, {
                    params: { include: "company,requirements" },
                });
                setJob(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load role details");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id, getToken]);

    if (!id) {
        return (
            <div className="hidden md:flex flex-1 items-center justify-center text-base-content/30 bg-base-100">
                <div className="text-center">
                    <i className="fa-duotone fa-briefcase text-6xl mb-4 opacity-50" />
                    <p className="text-lg">Select a role to view details</p>
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

    if (error || !job) {
        return (
            <div className="flex-1 flex items-center justify-center bg-base-100">
                <div className="text-center max-w-md p-6">
                    <div className="alert alert-error">
                        <i className="fa-regular fa-circle-exclamation" />
                        <span>{error || "Role not found"}</span>
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

    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader job={job} onClose={onClose} />

            <div className="flex-1 overflow-y-auto">
                {/* Tabs */}
                <div
                    role="tablist"
                    className="tabs tabs-bordered w-full px-4 pt-2"
                >
                    <a
                        role="tab"
                        className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        Overview
                    </a>
                    <a
                        role="tab"
                        className={`tab ${activeTab === "requirements" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("requirements")}
                    >
                        Requirements
                    </a>
                    <a
                        role="tab"
                        className={`tab ${activeTab === "financials" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("financials")}
                    >
                        Financials
                    </a>
                </div>

                {/* Content */}
                <div className="p-6 max-w-4xl">
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-lg font-bold mb-3">
                                    About the Role
                                </h3>
                                <div className="prose prose-sm max-w-none text-base-content/80 whitespace-pre-wrap">
                                    {job.recruiter_description ||
                                        job.description ||
                                        "No description provided."}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold mb-3">
                                    Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-base-200/50 p-3 rounded-lg">
                                        <div className="text-xs text-base-content/60">
                                            Employment Type
                                        </div>
                                        <div className="font-medium capitalize">
                                            {job.employment_type?.replace(
                                                "_",
                                                " ",
                                            ) || "N/A"}
                                        </div>
                                    </div>
                                    <div className="bg-base-200/50 p-3 rounded-lg">
                                        <div className="text-xs text-base-content/60">
                                            Workplace
                                        </div>
                                        <div className="font-medium">
                                            {job.open_to_relocation
                                                ? "Relocation Available"
                                                : "Local Only"}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "requirements" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold mb-3">
                                Requirements
                            </h3>
                            {job.requirements && job.requirements.length > 0 ? (
                                <ul className="list-disc list-inside space-y-2 text-base-content/80">
                                    {job.requirements.map((req) => (
                                        <li key={req.id}>
                                            <span
                                                className={
                                                    req.requirement_type ===
                                                    "mandatory"
                                                        ? "font-medium"
                                                        : ""
                                                }
                                            >
                                                {req.description}
                                            </span>
                                            {req.requirement_type ===
                                                "preferred" && (
                                                <span className="badge badge-sm badge-ghost ml-2">
                                                    Preferred
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-base-content/60 italic">
                                    No specific requirements listed.
                                </p>
                            )}
                        </div>
                    )}

                    {activeTab === "financials" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="card bg-base-200 shadow-sm border border-base-300">
                                    <div className="card-body p-4">
                                        <h3 className="card-title text-base">
                                            Compensation
                                        </h3>
                                        <div className="text-2xl font-bold font-mono text-success">
                                            {job.salary_min && job.salary_max
                                                ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                                                : "DOE"}
                                        </div>
                                        <p className="text-xs text-base-content/60">
                                            Annual Salary
                                        </p>
                                    </div>
                                </div>

                                <div className="card bg-base-200 shadow-sm border border-base-300">
                                    <div className="card-body p-4">
                                        <h3 className="card-title text-base">
                                            Placement Fee
                                        </h3>
                                        <div className="text-2xl font-bold font-mono text-primary">
                                            {job.fee_percentage}%
                                        </div>
                                        <p className="text-xs text-base-content/60">
                                            of first year salary
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="alert alert-info bg-info/10 text-base-content border-info/20">
                                <i className="fa-duotone fa-circle-info text-info" />
                                <div>
                                    <h4 className="font-bold">
                                        Fee Split Policy
                                    </h4>
                                    <p className="text-sm">
                                        This role is subject to the standard
                                        platform split of{" "}
                                        {job.splits_fee_percentage || 50}%.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
