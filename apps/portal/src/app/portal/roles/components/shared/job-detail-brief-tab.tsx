"use client";

import type { Job } from "../../types";
import { formatCommuteTypes, formatJobLevel } from "../../types";
import { requiredSkillNames, preferredSkillNames } from "./helpers";
import { BaselBadge } from "@splits-network/basel-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";

/* ─── Recruiter Brief Tab ───────────────────────────────────────────────── */

export function RecruiterBriefTab({ job }: { job: Job }) {
    const mandatoryReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "mandatory")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const preferredReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "preferred")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const commute = formatCommuteTypes(job.commute_types);
    const level = formatJobLevel(job.job_level);
    const reqSkills = requiredSkillNames(job);
    const prefSkills = preferredSkillNames(job);

    const hasBrief =
        job.recruiter_description ||
        mandatoryReqs.length > 0 ||
        preferredReqs.length > 0 ||
        reqSkills.length > 0;

    if (!hasBrief) {
        return (
            <div className="text-center py-12 text-base-content/40">
                <i className="fa-duotone fa-regular fa-file-lines text-3xl mb-3 block" />
                <p className="text-sm font-semibold">
                    No recruiter brief available
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Recruiter Description */}
            {job.recruiter_description && (
                <div className="border-l-4 border-l-primary pl-6">
                    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                        Recruiter Brief
                    </h3>
                    <MarkdownRenderer
                        content={job.recruiter_description}
                        className="prose prose-sm max-w-none text-base-content/70"
                    />
                </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                {commute && (
                    <div className="bg-base-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                            Commute
                        </p>
                        <p className="font-bold text-sm">{commute}</p>
                    </div>
                )}
                {job.department && (
                    <div className="bg-base-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                            Department
                        </p>
                        <p className="font-bold text-sm">{job.department}</p>
                    </div>
                )}
                {job.guarantee_days !== undefined &&
                    job.guarantee_days !== null && (
                        <div className="bg-base-100 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                                Guarantee
                            </p>
                            <p className="font-bold text-sm">
                                {job.guarantee_days} days
                            </p>
                        </div>
                    )}
                {level && (
                    <div className="bg-base-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                            Level
                        </p>
                        <p className="font-bold text-sm">{level}</p>
                    </div>
                )}
                {job.open_to_relocation && (
                    <div className="bg-base-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                            Relocation
                        </p>
                        <p className="font-bold text-sm text-secondary">
                            Open to relocation
                        </p>
                    </div>
                )}
            </div>

            {/* Mandatory Requirements */}
            {mandatoryReqs.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                        Must Have
                    </h3>
                    <ul className="space-y-2">
                        {mandatoryReqs.map((req) => (
                            <li
                                key={req.id}
                                className="flex items-start gap-3 text-base-content/70"
                            >
                                <i className="fa-duotone fa-regular fa-check text-primary text-xs mt-1.5 flex-shrink-0" />
                                <span className="leading-relaxed">
                                    {req.description}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Preferred Requirements */}
            {preferredReqs.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                        Preferred
                    </h3>
                    <ul className="space-y-2">
                        {preferredReqs.map((req) => (
                            <li
                                key={req.id}
                                className="flex items-start gap-3 text-base-content/70"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right text-secondary text-xs mt-1.5 flex-shrink-0" />
                                <span className="leading-relaxed">
                                    {req.description}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Required Skills */}
            {reqSkills.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                        Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {reqSkills.map((skill) => (
                            <BaselBadge key={skill} color="primary" variant="soft" size="sm">
                                {skill}
                            </BaselBadge>
                        ))}
                    </div>
                </div>
            )}

            {/* Preferred Skills */}
            {prefSkills.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                        Nice-to-Have Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {prefSkills.map((skill) => (
                            <BaselBadge key={skill} variant="outline" size="sm">
                                {skill}
                            </BaselBadge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
