"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import { BaselCalculator } from "@/components/basel/pricing/basel-calculator";
import type { Job } from "@/app/portal/roles/types";
import { formatCommuteTypes, formatJobLevel } from "@/app/portal/roles/types";
import { statusColor } from "@/app/portal/roles/components/shared/status-color";
import {
    salaryDisplay,
    formatEmploymentType,
    formatStatus,
    companyName,
    companyInitials,
} from "@/app/portal/roles/components/shared/helpers";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type TabKey = "brief" | "candidate" | "financials" | "company";

interface CompanyMember {
    id: string;
    user_id: string;
    role_name: string;
    users?: {
        id: string;
        first_name?: string;
        last_name?: string;
        email?: string;
        avatar_url?: string;
    };
    roles?: {
        display_name?: string;
    };
}

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "brief", label: "Recruiter Brief", icon: "fa-file-lines" },
    { key: "candidate", label: "Candidate", icon: "fa-user" },
    { key: "financials", label: "Financials", icon: "fa-calculator" },
    { key: "company", label: "Company", icon: "fa-building" },
];

/* ─── Tab Content Components ────────────────────────────────────────────── */

function RecruiterBriefTab({ job }: { job: Job }) {
    const mandatoryReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "mandatory")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const preferredReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "preferred")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const commute = formatCommuteTypes(job.commute_types);
    const level = formatJobLevel(job.job_level);

    return (
        <div className="space-y-8">
            {/* Recruiter Description */}
            {job.recruiter_description && (
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
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
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Commute
                        </p>
                        <p className="font-bold text-sm">{commute}</p>
                    </div>
                )}
                {job.department && (
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Department
                        </p>
                        <p className="font-bold text-sm">{job.department}</p>
                    </div>
                )}
                {job.guarantee_days !== undefined &&
                    job.guarantee_days !== null && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Guarantee
                            </p>
                            <p className="font-bold text-sm">
                                {job.guarantee_days} days
                            </p>
                        </div>
                    )}
                {level && (
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Level
                        </p>
                        <p className="font-bold text-sm">{level}</p>
                    </div>
                )}
                {job.open_to_relocation && (
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
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
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
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
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
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

            {!job.recruiter_description &&
                mandatoryReqs.length === 0 &&
                preferredReqs.length === 0 && (
                    <div className="text-center py-12 text-base-content/40">
                        <i className="fa-duotone fa-regular fa-file-lines text-3xl mb-3 block" />
                        <p className="text-sm font-semibold">
                            No recruiter brief available
                        </p>
                    </div>
                )}
        </div>
    );
}

function CandidateDescriptionTab({ job }: { job: Job }) {
    const content = job.candidate_description || job.description;

    if (!content) {
        return (
            <div className="text-center py-12 text-base-content/40">
                <i className="fa-duotone fa-regular fa-user text-3xl mb-3 block" />
                <p className="text-sm font-semibold">
                    No candidate description available
                </p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                Candidate Description
            </h3>
            <MarkdownRenderer
                content={content}
                className="prose prose-sm max-w-none text-base-content/70 leading-relaxed"
            />
        </div>
    );
}

function FinancialsTab({ job }: { job: Job }) {
    const salary = salaryDisplay(job);

    return (
        <div className="space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                <div className="bg-base-100 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                        Compensation
                    </p>
                    <p className="text-lg font-black tracking-tight">
                        {salary || "N/A"}
                    </p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                        Fee
                    </p>
                    <p className="text-lg font-black tracking-tight">
                        {job.fee_percentage}%
                    </p>
                </div>
                {job.guarantee_days !== undefined &&
                    job.guarantee_days !== null && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Guarantee
                            </p>
                            <p className="text-lg font-black tracking-tight">
                                {job.guarantee_days} days
                            </p>
                        </div>
                    )}
            </div>

            {/* Calculator */}
            <div className="border-l-4 border-primary bg-base-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                    <i className="fa-duotone fa-regular fa-calculator mr-2" />
                    Payout Calculator
                </h3>
                <BaselCalculator
                    variant="compact"
                    initialSalary={job.salary_max || job.salary_min}
                    initialFeePercentage={job.fee_percentage}
                    lockFee
                />
            </div>
        </div>
    );
}

function CompanyTab({ job }: { job: Job }) {
    const { getToken } = useAuth();
    const name = companyName(job);
    const [members, setMembers] = useState<CompanyMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!job.company_id) {
                setLoadingMembers(false);
                return;
            }

            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{
                    data: CompanyMember[];
                }>("/memberships", {
                    params: { company_id: job.company_id, limit: 50 },
                });
                if (!cancelled) {
                    setMembers(Array.isArray(res.data) ? res.data : []);
                }
            } catch {
                // Access denied or no members — gracefully handle
            } finally {
                if (!cancelled) setLoadingMembers(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job.company_id]);

    const formatRoleName = (role: string) =>
        role
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

    const memberDisplayName = (m: CompanyMember) => {
        if (m.users?.first_name || m.users?.last_name) {
            return [m.users.first_name, m.users.last_name]
                .filter(Boolean)
                .join(" ");
        }
        return m.users?.email || "Unknown";
    };

    const memberInitials = (m: CompanyMember) => {
        if (m.users?.first_name && m.users?.last_name) {
            return (m.users.first_name[0] + m.users.last_name[0]).toUpperCase();
        }
        if (m.users?.email) return m.users.email[0].toUpperCase();
        return "?";
    };

    return (
        <div className="space-y-8">
            {/* Company Info */}
            <div className="flex items-center gap-4">
                {job.company?.logo_url ? (
                    <img
                        src={job.company.logo_url}
                        alt={name}
                        className="w-14 h-14 object-contain border-2 border-base-300"
                    />
                ) : (
                    <div className="w-14 h-14 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-lg">
                        {companyInitials(name)}
                    </div>
                )}
                <div>
                    <p className="text-lg font-black">{name}</p>
                    {job.company?.industry && (
                        <p className="text-sm text-base-content/50">
                            {job.company.industry}
                        </p>
                    )}
                    {job.company?.headquarters_location && (
                        <p className="text-sm text-base-content/50">
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {job.company.headquarters_location}
                        </p>
                    )}
                </div>
            </div>

            {/* Company Details */}
            {(job.company as any)?.description && (
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        About
                    </h3>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                        {(job.company as any).description}
                    </p>
                </div>
            )}

            {(job.company as any)?.website && (
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                        Website
                    </h3>
                    <a
                        href={(job.company as any).website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                    >
                        <i className="fa-duotone fa-regular fa-globe mr-1" />
                        {(job.company as any).website}
                    </a>
                </div>
            )}

            {/* Team Members */}
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                    Team Members
                </h3>

                {loadingMembers && (
                    <div className="flex items-center gap-3 py-4">
                        <span className="loading loading-spinner loading-sm text-primary" />
                        <span className="text-sm text-base-content/50">
                            Loading team...
                        </span>
                    </div>
                )}

                {!loadingMembers && members.length === 0 && (
                    <div className="text-center py-8 text-base-content/40">
                        <i className="fa-duotone fa-regular fa-users text-2xl mb-2 block" />
                        <p className="text-sm">No team members available</p>
                    </div>
                )}

                {!loadingMembers && members.length > 0 && (
                    <div className="space-y-[2px] bg-base-300">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-3 bg-base-100 p-4"
                            >
                                {member.users?.avatar_url ? (
                                    <img
                                        src={member.users.avatar_url}
                                        alt={memberDisplayName(member)}
                                        className="w-9 h-9 object-cover border border-base-300"
                                    />
                                ) : (
                                    <div className="w-9 h-9 flex items-center justify-center bg-base-200 border border-base-300 text-xs font-bold text-base-content/60">
                                        {memberInitials(member)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">
                                        {memberDisplayName(member)}
                                    </p>
                                    {member.users?.email && (
                                        <p className="text-xs text-base-content/40 truncate">
                                            {member.users.email}
                                        </p>
                                    )}
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 bg-base-200 text-base-content/50 shrink-0">
                                    {member.roles?.display_name ||
                                        formatRoleName(member.role_name)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Application Role Detail ───────────────────────────────────────────── */

export function ApplicationRoleDetail({ job }: { job: Job }) {
    const [activeTab, setActiveTab] = useState<TabKey>("brief");
    const name = companyName(job);
    const salary = salaryDisplay(job);

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Compact info header (no duplicate name/title) */}
            <div className="px-6 py-4 border-b border-base-300">
                <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                    <span>
                        <i className="fa-duotone fa-regular fa-building mr-1" />
                        {name}
                    </span>
                    {job.location && (
                        <span>
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {job.location}
                        </span>
                    )}
                    {job.employment_type && (
                        <span>
                            <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                            {formatEmploymentType(job.employment_type)}
                        </span>
                    )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-[2px] bg-base-300 mt-3">
                    <div className="bg-base-100 p-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-0.5">
                            Compensation
                        </p>
                        <p className="text-sm font-black tracking-tight">
                            {salary || "N/A"}
                        </p>
                    </div>
                    <div className="bg-base-100 p-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-0.5">
                            Fee
                        </p>
                        <p className="text-sm font-black tracking-tight">
                            {job.fee_percentage}%
                        </p>
                    </div>
                    <div className="bg-base-100 p-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-0.5">
                            Candidates
                        </p>
                        <p className="text-sm font-black tracking-tight">
                            {job.application_count ?? 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b-2 border-base-300">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-[0.15em] transition-colors border-b-2 -mb-[2px] ${
                            activeTab === tab.key
                                ? "border-primary text-primary"
                                : "border-transparent text-base-content/40 hover:text-base-content/70"
                        }`}
                    >
                        <i
                            className={`fa-duotone fa-regular ${tab.icon} mr-1.5`}
                        />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
                {activeTab === "brief" && <RecruiterBriefTab job={job} />}
                {activeTab === "candidate" && (
                    <CandidateDescriptionTab job={job} />
                )}
                {activeTab === "financials" && <FinancialsTab job={job} />}
                {activeTab === "company" && <CompanyTab job={job} />}
            </div>
        </div>
    );
}