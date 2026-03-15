"use client";

import type { Job } from "../../types";
import { formatCommuteTypes, formatJobLevel } from "../../types";
import { requiredSkillNames, preferredSkillNames } from "./helpers";
import { BaselBadge } from "@splits-network/basel-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";

/* ─── Empty Placeholder ────────────────────────────────────────────────── */

function EmptyPlaceholder({ label }: { label: string }) {
    return (
        <p className="text-sm text-base-content/30 italic">
            No {label} specified
        </p>
    );
}

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

    return (
        <div className="space-y-8">
            {/* Recruiter Description */}
            <div className="border-l-4 border-l-warning pl-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    <i className="fa-duotone fa-regular fa-lock text-warning mr-1.5" />
                    Recruiter Brief
                </h3>
                {job.recruiter_description ? (
                    <MarkdownRenderer
                        content={job.recruiter_description}
                        className="prose prose-sm max-w-none text-base-content/70"
                    />
                ) : (
                    <EmptyPlaceholder label="recruiter brief" />
                )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                <div className="bg-base-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                        <i className="fa-duotone fa-regular fa-car text-base-content/20 mr-1" />
                        Commute
                    </p>
                    <p className={`font-bold text-sm ${!commute ? "text-base-content/30 italic font-normal" : ""}`}>
                        {commute || "Not specified"}
                    </p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                        <i className="fa-duotone fa-regular fa-sitemap text-base-content/20 mr-1" />
                        Department
                    </p>
                    <p className={`font-bold text-sm ${!job.department ? "text-base-content/30 italic font-normal" : ""}`}>
                        {job.department || "Not specified"}
                    </p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                        <i className="fa-duotone fa-regular fa-shield-halved text-base-content/20 mr-1" />
                        Guarantee
                    </p>
                    <p className={`font-bold text-sm ${job.guarantee_days == null ? "text-base-content/30 italic font-normal" : ""}`}>
                        {job.guarantee_days != null ? `${job.guarantee_days} days` : "Not specified"}
                    </p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                        <i className="fa-duotone fa-regular fa-signal text-base-content/20 mr-1" />
                        Level
                    </p>
                    <p className={`font-bold text-sm ${!level ? "text-base-content/30 italic font-normal" : ""}`}>
                        {level || "Not specified"}
                    </p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                        <i className={`fa-duotone fa-regular fa-plane mr-1 ${job.open_to_relocation ? "text-info" : "text-base-content/20"}`} />
                        Relocation
                    </p>
                    <p className={`font-bold text-sm ${job.open_to_relocation ? "text-info" : "text-base-content/30 italic font-normal"}`}>
                        {job.open_to_relocation ? "Open to relocation" : "Not specified"}
                    </p>
                </div>
            </div>

            {/* Mandatory Requirements */}
            <div className="border-l-4 border-l-primary pl-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    <i className="fa-duotone fa-regular fa-shield-check text-primary mr-1.5" />
                    Must Have
                </h3>
                {mandatoryReqs.length > 0 ? (
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
                ) : (
                    <EmptyPlaceholder label="mandatory requirements" />
                )}
            </div>

            {/* Preferred Requirements */}
            <div className="border-l-4 border-l-secondary pl-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    <i className="fa-duotone fa-regular fa-star text-secondary mr-1.5" />
                    Preferred
                </h3>
                {preferredReqs.length > 0 ? (
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
                ) : (
                    <EmptyPlaceholder label="preferred requirements" />
                )}
            </div>

            {/* Required Skills */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    <i className="fa-duotone fa-regular fa-stars text-primary mr-1.5" />
                    Required Skills
                </h3>
                {reqSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {reqSkills.map((skill) => (
                            <BaselBadge key={skill} color="primary" variant="soft" size="sm">
                                {skill}
                            </BaselBadge>
                        ))}
                    </div>
                ) : (
                    <EmptyPlaceholder label="required skills" />
                )}
            </div>

            {/* Preferred Skills */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    <i className="fa-duotone fa-regular fa-star text-secondary mr-1.5" />
                    Nice-to-Have Skills
                </h3>
                {prefSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {prefSkills.map((skill) => (
                            <BaselBadge key={skill} variant="outline" size="sm">
                                {skill}
                            </BaselBadge>
                        ))}
                    </div>
                ) : (
                    <EmptyPlaceholder label="preferred skills" />
                )}
            </div>
        </div>
    );
}
