"use client";

import { Candidate } from "@splits-network/shared-types";

interface DetailApplicationsProps {
    candidate: Candidate;
}

// Mock applications data for demo
const mockApplications = [
    {
        id: "app-1",
        job: {
            title: "Senior Software Engineer",
            company: "TechCorp",
            location: "San Francisco, CA",
        },
        stage: "interview",
        status: "active",
        applied_at: "2024-01-15",
        last_updated: "2024-01-18",
    },
    {
        id: "app-2",
        job: {
            title: "Tech Lead",
            company: "InnovateLabs",
            location: "Remote",
        },
        stage: "offer",
        status: "pending",
        applied_at: "2024-01-10",
        last_updated: "2024-01-20",
    },
    {
        id: "app-3",
        job: {
            title: "Principal Engineer",
            company: "StartupXYZ",
            location: "New York, NY",
        },
        stage: "rejected",
        status: "closed",
        applied_at: "2024-01-05",
        last_updated: "2024-01-12",
    },
];

export function DetailApplications({ candidate }: DetailApplicationsProps) {
    const getStageColor = (stage: string) => {
        switch (stage) {
            case "applied":
                return "badge-info";
            case "screening":
                return "badge-warning";
            case "interview":
                return "badge-primary";
            case "offer":
                return "badge-success";
            case "rejected":
                return "badge-error";
            case "withdrawn":
                return "badge-ghost";
            default:
                return "badge-ghost";
        }
    };

    const getStatusIcon = (stage: string) => {
        switch (stage) {
            case "applied":
                return "fa-paper-plane";
            case "screening":
                return "fa-search";
            case "interview":
                return "fa-comments";
            case "offer":
                return "fa-handshake";
            case "rejected":
                return "fa-times-circle";
            case "withdrawn":
                return "fa-ban";
            default:
                return "fa-circle";
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                    Applications ({mockApplications.length})
                </h3>
                <button className="btn btn-primary btn-sm">
                    <i className="fa-duotone fa-regular fa-plus mr-2"></i>
                    Add Application
                </button>
            </div>

            {/* Applications List */}
            {mockApplications.length === 0 ? (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body text-center py-8">
                        <i className="fa-duotone fa-regular fa-briefcase text-3xl text-base-content/30 mb-3"></i>
                        <h4 className="font-medium mb-2">
                            No applications yet
                        </h4>
                        <p className="text-base-content/70 text-sm mb-4">
                            This candidate hasn't applied to any positions yet.
                        </p>
                        <button className="btn btn-primary btn-sm">
                            <i className="fa-duotone fa-regular fa-plus mr-2"></i>
                            Create First Application
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {mockApplications.map((application) => (
                        <div
                            key={application.id}
                            className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="card-body p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            <div className="avatar avatar-placeholder shrink-0 mt-1">
                                                <div className="bg-neutral text-neutral-content rounded w-10">
                                                    <span className="text-xs">
                                                        {application.job.company
                                                            .substring(0, 2)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="font-medium text-base mb-1">
                                                    {application.job.title}
                                                </h4>
                                                <p className="text-base-content/70 text-sm mb-2">
                                                    {application.job.company} •{" "}
                                                    {application.job.location}
                                                </p>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <span
                                                        className={`badge badge-sm ${getStageColor(application.stage)}`}
                                                    >
                                                        <i
                                                            className={`fa-duotone fa-regular ${getStatusIcon(application.stage)} mr-1`}
                                                        ></i>
                                                        {application.stage}
                                                    </span>
                                                </div>

                                                <div className="text-xs text-base-content/50">
                                                    Applied{" "}
                                                    {new Date(
                                                        application.applied_at,
                                                    ).toLocaleDateString()}{" "}
                                                    • Last updated{" "}
                                                    {new Date(
                                                        application.last_updated,
                                                    ).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="dropdown dropdown-end">
                                        <button
                                            tabIndex={0}
                                            role="button"
                                            className="btn btn-ghost btn-sm"
                                        >
                                            <i className="fa-duotone fa-regular fa-ellipsis-vertical"></i>
                                        </button>
                                        <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                            <li>
                                                <button>
                                                    <i className="fa-duotone fa-regular fa-eye"></i>
                                                    View Details
                                                </button>
                                            </li>
                                            <li>
                                                <button>
                                                    <i className="fa-duotone fa-regular fa-pen"></i>
                                                    Update Stage
                                                </button>
                                            </li>
                                            <li>
                                                <button>
                                                    <i className="fa-duotone fa-regular fa-message"></i>
                                                    Add Note
                                                </button>
                                            </li>
                                            <li className="divider"></li>
                                            <li>
                                                <button className="text-error">
                                                    <i className="fa-duotone fa-regular fa-ban"></i>
                                                    Withdraw
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="stat bg-base-100 shadow-sm rounded-box p-4">
                    <div className="stat-title text-xs">Total</div>
                    <div className="stat-value text-lg">
                        {mockApplications.length}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow-sm rounded-box p-4">
                    <div className="stat-title text-xs">Active</div>
                    <div className="stat-value text-lg text-primary">
                        {
                            mockApplications.filter(
                                (a) => a.status === "active",
                            ).length
                        }
                    </div>
                </div>
                <div className="stat bg-base-100 shadow-sm rounded-box p-4">
                    <div className="stat-title text-xs">Interviews</div>
                    <div className="stat-value text-lg text-warning">
                        {
                            mockApplications.filter(
                                (a) => a.stage === "interview",
                            ).length
                        }
                    </div>
                </div>
                <div className="stat bg-base-100 shadow-sm rounded-box p-4">
                    <div className="stat-title text-xs">Offers</div>
                    <div className="stat-value text-lg text-success">
                        {
                            mockApplications.filter((a) => a.stage === "offer")
                                .length
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
