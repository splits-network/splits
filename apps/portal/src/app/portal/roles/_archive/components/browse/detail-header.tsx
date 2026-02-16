import { Job } from "./types";
import RoleActionsToolbar from "../shared/actions-toolbar";

interface DetailHeaderProps {
    job: Job;
    onClose: () => void;
    onEdit: () => void;
}

export default function DetailHeader({
    job,
    onClose,
    onEdit,
}: DetailHeaderProps) {
    if (!job) {
        return null;
    }
    return (
        <div className="p-4 sm:p-6 border-b border-base-300 bg-base-100 flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={onClose}
                        className="md:hidden btn btn-ghost btn-circle btn-sm -ml-2"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left" />
                    </button>

                    {job.company?.logo_url && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-base-200 flex-shrink-0">
                            <img
                                src={job.company.logo_url}
                                alt={`${job.company.name} logo`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        </div>
                    )}

                    <h1 className="text-xl sm:text-2xl font-bold text-base-content line-clamp-1">
                        {job.title}
                    </h1>

                    <span
                        className={`badge badge-sm ${
                            job.status === "active"
                                ? "badge-success"
                                : job.status === "paused"
                                  ? "badge-warning"
                                  : job.status === "closed"
                                    ? "badge-error"
                                    : "badge-neutral"
                        }`}
                    >
                        {job.status
                            ? job.status.charAt(0).toUpperCase() +
                              job.status.slice(1)
                            : "Active"}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-base-content/60 text-sm ml-12 md:ml-0">
                    <i className="fa-duotone fa-building" />
                    <span className="font-medium">
                        {job.company?.name || "Confidential Company"}
                    </span>
                    {job.location && (
                        <>
                            <span className="mx-1">•</span>
                            <i className="fa-duotone fa-location-dot" />
                            <span>{job.location}</span>
                        </>
                    )}
                    {job.department && (
                        <>
                            <span className="mx-1">•</span>
                            <i className="fa-duotone fa-sitemap" />
                            <span>{job.department}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <RoleActionsToolbar
                    job={job}
                    variant="descriptive"
                    layout="horizontal"
                    size="md"
                    showActions={{
                        viewDetails: false, // Already in detail view
                    }}
                />
            </div>
        </div>
    );
}
