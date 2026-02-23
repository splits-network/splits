import type { Job } from "./types";
import { STATUS_BADGE_MAP } from "./types";

interface StepFindRoleProps {
    jobs: Job[];
    jobsLoading: boolean;
    selectedJob: Job | null;
    onSelectJob: (job: Job) => void;
    jobSearchQuery: string;
    onSearchChange: (query: string) => void;
    debouncedJobSearch: string;
    jobStatusFilter: string;
    onStatusFilterChange: (filter: string) => void;
    jobPage: number;
    jobTotalPages: number;
    jobTotalCount: number;
    onPageChange: (page: number) => void;
}

export default function StepFindRole({
    jobs,
    jobsLoading,
    selectedJob,
    onSelectJob,
    jobSearchQuery,
    onSearchChange,
    debouncedJobSearch,
    jobStatusFilter,
    onStatusFilterChange,
    jobPage,
    jobTotalPages,
    jobTotalCount,
    onPageChange,
}: StepFindRoleProps) {
    return (
        <div className="space-y-5">
            {/* Search + Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <fieldset>
                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                        Search Open Roles
                    </label>
                    <input
                        type="text"
                        placeholder="Search by title, company, location..."
                        className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                        style={{ borderRadius: 0 }}
                        value={jobSearchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <p className="text-sm text-base-content/40 mt-2">
                        {jobsLoading && debouncedJobSearch ? (
                            <>
                                <span className="loading loading-spinner loading-xs mr-1" />
                                Searching...
                            </>
                        ) : (
                            "Results update as you type."
                        )}
                    </p>
                </fieldset>

                <fieldset>
                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                        Role Status
                    </label>
                    <select
                        className="select w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                        style={{ borderRadius: 0 }}
                        value={jobStatusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="closed">Closed</option>
                    </select>
                </fieldset>
            </div>

            {/* Jobs Table */}
            {jobsLoading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg" />
                </div>
            ) : jobs.length === 0 ? (
                <div className="bg-base-200 border-l-4 border-base-300 p-5">
                    <p className="text-sm font-semibold text-base-content/60">
                        No roles match your search.
                    </p>
                    <p className="text-sm text-base-content/40 mt-1">
                        Adjust your filters or search by a different job title
                        or keyword.
                    </p>
                </div>
            ) : (
                <>
                    {debouncedJobSearch && (
                        <p className="text-sm text-base-content/60">
                            Found {jobTotalCount} role
                            {jobTotalCount !== 1 ? "s" : ""} matching &ldquo;
                            {debouncedJobSearch}&rdquo;
                        </p>
                    )}
                    <div
                        className="overflow-x-auto border border-base-300"
                        style={{ borderRadius: 0 }}
                    >
                        <table className="table">
                            <thead className="bg-base-200">
                                <tr>
                                    <th className="w-12"></th>
                                    <th>Role</th>
                                    <th>Company</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Fee</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <tr
                                        key={job.id}
                                        className={`cursor-pointer hover:bg-base-200 transition-colors ${
                                            selectedJob?.id === job.id
                                                ? "bg-primary/10 border-l-4 border-l-primary"
                                                : ""
                                        }`}
                                        onClick={() => onSelectJob(job)}
                                    >
                                        <td>
                                            <input
                                                type="radio"
                                                className="radio radio-primary"
                                                checked={
                                                    selectedJob?.id === job.id
                                                }
                                                onChange={() =>
                                                    onSelectJob(job)
                                                }
                                            />
                                        </td>
                                        <td className="font-semibold">
                                            {job.title}
                                        </td>
                                        <td>{job.company_name}</td>
                                        <td>
                                            {job.location || (
                                                <span className="text-base-content/40">
                                                    Not specified
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${STATUS_BADGE_MAP[job.status] || "badge-neutral"}`}
                                                style={{ borderRadius: 0 }}
                                            >
                                                {job.status}
                                            </span>
                                        </td>
                                        <td>{job.fee_percentage}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {jobTotalPages > 1 && (
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-base-content/60">
                                Page {jobPage} of {jobTotalPages} (
                                {jobTotalCount} total)
                            </p>
                            <div className="join">
                                <button
                                    className="join-item btn btn-sm"
                                    style={{ borderRadius: 0 }}
                                    onClick={() =>
                                        onPageChange(Math.max(1, jobPage - 1))
                                    }
                                    disabled={jobPage === 1}
                                >
                                    <i className="fa-duotone fa-regular fa-chevron-left" />
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    style={{ borderRadius: 0 }}
                                >
                                    Page {jobPage}
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    style={{ borderRadius: 0 }}
                                    onClick={() =>
                                        onPageChange(
                                            Math.min(
                                                jobTotalPages,
                                                jobPage + 1,
                                            ),
                                        )
                                    }
                                    disabled={jobPage === jobTotalPages}
                                >
                                    <i className="fa-duotone fa-regular fa-chevron-right" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
