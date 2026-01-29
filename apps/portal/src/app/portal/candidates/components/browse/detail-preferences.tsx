"use client";

import { Candidate } from "./types";

export default function DetailPreferences({
    candidate,
}: {
    candidate: Candidate;
}) {
    return (
        <section className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="p-4 border-b border-base-200 bg-base-200/30">
                <h3 className="font-semibold flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-briefcase text-accent"></i>
                    Career Preferences
                </h3>
            </div>

            <div className="p-4 space-y-4">
                {/* Salary */}
                <div className="flex flex-col">
                    <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                        Desired Salary
                    </span>
                    <span className="font-medium">
                        {candidate.desired_salary_min ||
                        candidate.desired_salary_max ? (
                            <>
                                {candidate.desired_salary_min
                                    ? `$${candidate.desired_salary_min.toLocaleString()}`
                                    : ""}
                                {candidate.desired_salary_min &&
                                candidate.desired_salary_max
                                    ? " - "
                                    : ""}
                                {candidate.desired_salary_max
                                    ? `$${candidate.desired_salary_max.toLocaleString()}`
                                    : ""}
                            </>
                        ) : (
                            <span className="text-sm opacity-40 italic">
                                Not specified
                            </span>
                        )}
                    </span>
                </div>

                {/* Job Type */}
                <div className="flex flex-col">
                    <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                        Job Type
                    </span>
                    <span className="font-medium capitalize">
                        {candidate.desired_job_type ? (
                            candidate.desired_job_type.replace(/_/g, " ")
                        ) : (
                            <span className="text-sm opacity-40 italic">
                                Not specified
                            </span>
                        )}
                    </span>
                </div>

                {/* Availability */}
                <div className="flex flex-col">
                    <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                        Availability
                    </span>
                    <span className="font-medium capitalize">
                        {candidate.availability ? (
                            candidate.availability.replace(/_/g, " ")
                        ) : (
                            <span className="text-sm opacity-40 italic">
                                Not specified
                            </span>
                        )}
                    </span>
                </div>

                {/* Industries */}
                {candidate.marketplace_profile?.industries &&
                    candidate.marketplace_profile.industries.length > 0 && (
                        <div className="flex flex-col">
                            <span className="text-xs font-medium opacity-60 uppercase tracking-wider mb-1">
                                Preferred Industries
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {candidate.marketplace_profile.industries.map(
                                    (ind, i) => (
                                        <span
                                            key={i}
                                            className="badge badge-sm badge-neutral"
                                        >
                                            {ind}
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>
                    )}

                {/* Remote / Relocation */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                        Work Mode
                    </span>
                    <div className="flex gap-2 flex-wrap">
                        {candidate.open_to_remote && (
                            <div className="badge badge-success badge-soft gap-2 badge-md border-0">
                                <i className="fa-duotone fa-house-laptop"></i>{" "}
                                Remote
                            </div>
                        )}
                        {candidate.open_to_relocation && (
                            <div className="badge badge-info badge-soft gap-2 badge-md border-0">
                                <i className="fa-duotone fa-plane-departure"></i>{" "}
                                Open to Relocation
                            </div>
                        )}
                        {!candidate.open_to_remote &&
                            !candidate.open_to_relocation && (
                                <span className="opacity-40 italic text-sm">
                                    No preferences listed
                                </span>
                            )}
                    </div>
                </div>
            </div>
        </section>
    );
}
