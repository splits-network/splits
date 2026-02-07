"use client";

import { Candidate } from "@splits-network/shared-types";

interface DetailActivityProps {
    candidate: Candidate;
}

// Mock activity data for demo
const mockActivity = [
    {
        id: "activity-1",
        type: "status_change",
        description: "Status changed from inactive to active",
        user: "Sarah Johnson",
        timestamp: "2024-01-18T14:30:00Z",
        metadata: {
            from: "inactive",
            to: "active",
        },
    },
    {
        id: "activity-2",
        type: "note_added",
        description: "Added interview feedback note",
        user: "Mike Chen",
        timestamp: "2024-01-15T10:15:00Z",
        metadata: {
            noteType: "interview",
        },
    },
    {
        id: "activity-3",
        type: "application_created",
        description: "Applied to Senior Software Engineer at TechCorp",
        user: "System",
        timestamp: "2024-01-15T09:00:00Z",
        metadata: {
            jobTitle: "Senior Software Engineer",
            company: "TechCorp",
        },
    },
    {
        id: "activity-4",
        type: "profile_updated",
        description: "Updated professional information",
        user: "Jennifer Lee",
        timestamp: "2024-01-12T16:45:00Z",
        metadata: {
            fields: ["current_role", "skills"],
        },
    },
    {
        id: "activity-5",
        type: "verification_completed",
        description: "Background verification completed",
        user: "System",
        timestamp: "2024-01-10T11:20:00Z",
        metadata: {
            verificationType: "background",
        },
    },
    {
        id: "activity-6",
        type: "candidate_created",
        description: "Candidate profile created",
        user: "Sarah Johnson",
        timestamp: "2024-01-08T13:15:00Z",
        metadata: {},
    },
];

export function DetailActivity({ candidate }: DetailActivityProps) {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case "candidate_created":
                return { icon: "fa-user-plus", color: "text-success" };
            case "profile_updated":
                return { icon: "fa-pen", color: "text-primary" };
            case "status_change":
                return { icon: "fa-toggle-on", color: "text-warning" };
            case "note_added":
                return { icon: "fa-note", color: "text-info" };
            case "application_created":
                return { icon: "fa-briefcase", color: "text-primary" };
            case "verification_completed":
                return { icon: "fa-badge-check", color: "text-success" };
            case "document_uploaded":
                return { icon: "fa-file-upload", color: "text-info" };
            case "email_sent":
                return { icon: "fa-envelope", color: "text-neutral" };
            default:
                return { icon: "fa-circle", color: "text-base-content/50" };
        }
    };

    const formatActivityDescription = (activity: any) => {
        switch (activity.type) {
            case "status_change":
                return (
                    <span>
                        Status changed from{" "}
                        <span className="badge badge-xs badge-ghost">
                            {activity.metadata.from}
                        </span>{" "}
                        to{" "}
                        <span className="badge badge-xs badge-success">
                            {activity.metadata.to}
                        </span>
                    </span>
                );
            case "application_created":
                return (
                    <span>
                        Applied to{" "}
                        <span className="font-medium">
                            {activity.metadata.jobTitle}
                        </span>{" "}
                        at{" "}
                        <span className="font-medium">
                            {activity.metadata.company}
                        </span>
                    </span>
                );
            case "profile_updated":
                return (
                    <span>
                        Updated{" "}
                        {activity.metadata.fields?.map(
                            (field: string, index: number) => (
                                <span key={field}>
                                    {index > 0 && ", "}
                                    <span className="font-medium">
                                        {field.replace("_", " ")}
                                    </span>
                                </span>
                            ),
                        )}
                    </span>
                );
            default:
                return activity.description;
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                    Activity Log ({mockActivity.length})
                </h3>
                <div className="flex items-center gap-2">
                    <button className="btn btn-ghost btn-sm">
                        <i className="fa-duotone fa-regular fa-filter mr-2"></i>
                        Filter
                    </button>
                    <button className="btn btn-ghost btn-sm">
                        <i className="fa-duotone fa-regular fa-download mr-2"></i>
                        Export
                    </button>
                </div>
            </div>

            {/* Activity Timeline */}
            {mockActivity.length === 0 ? (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body text-center py-8">
                        <i className="fa-duotone fa-regular fa-clock text-3xl text-base-content/30 mb-3"></i>
                        <h4 className="font-medium mb-2">No activity yet</h4>
                        <p className="text-base-content/70 text-sm">
                            Activity will appear here as actions are taken on
                            this candidate.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-base-300"></div>

                    <div className="space-y-4">
                        {mockActivity
                            .sort(
                                (a, b) =>
                                    new Date(b.timestamp).getTime() -
                                    new Date(a.timestamp).getTime(),
                            )
                            .map((activity, index) => {
                                const { icon, color } = getActivityIcon(
                                    activity.type,
                                );

                                return (
                                    <div
                                        key={activity.id}
                                        className="relative flex items-start gap-4"
                                    >
                                        {/* Timeline dot */}
                                        <div
                                            className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-base-100 border-2 border-base-300`}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${icon} text-sm ${color}`}
                                            ></i>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pb-4">
                                            <div className="card bg-base-100 shadow-sm">
                                                <div className="card-body p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-base-content mb-2">
                                                                {formatActivityDescription(
                                                                    activity,
                                                                )}
                                                            </p>

                                                            <div className="flex items-center gap-2 text-xs text-base-content/50">
                                                                <div className="flex items-center gap-1">
                                                                    <div className="avatar avatar-placeholder">
                                                                        <div className="bg-neutral text-neutral-content rounded-full w-4">
                                                                            <span className="text-xs">
                                                                                {activity.user ===
                                                                                "System"
                                                                                    ? "S"
                                                                                    : activity.user
                                                                                          .split(
                                                                                              " ",
                                                                                          )
                                                                                          .map(
                                                                                              (
                                                                                                  n,
                                                                                              ) =>
                                                                                                  n[0],
                                                                                          )
                                                                                          .join(
                                                                                              "",
                                                                                          )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <span>
                                                                        {
                                                                            activity.user
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <span>•</span>
                                                                <span>
                                                                    {new Date(
                                                                        activity.timestamp,
                                                                    ).toLocaleDateString(
                                                                        "en-US",
                                                                        {
                                                                            year: "numeric",
                                                                            month: "short",
                                                                            day: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        },
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {activity.type !==
                                                            "candidate_created" && (
                                                            <button className="btn btn-ghost btn-xs">
                                                                <i className="fa-duotone fa-regular fa-ellipsis-vertical"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Load More */}
            {mockActivity.length > 0 && (
                <div className="text-center pt-4">
                    <button className="btn btn-ghost btn-sm">
                        <i className="fa-duotone fa-regular fa-chevron-down mr-2"></i>
                        Load Earlier Activity
                    </button>
                </div>
            )}
        </div>
    );
}
