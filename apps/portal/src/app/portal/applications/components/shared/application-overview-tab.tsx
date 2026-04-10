"use client";

import AIReviewPanel from "@/components/basel/applications/ai-review-panel";
import { RecruiterCard, SourcerCard } from "./application-overview-cards";
import type { Application } from "../../types";
import { formatApplicationDate } from "../../types";

interface OverviewTabProps {
    application: Application;
}

export function ApplicationOverviewTab({ application }: OverviewTabProps) {
    const job = application.job;
    const candidate = application.candidate;

    const recruiter =
        application.recruiter || (application as any).assigned_recruiter;
    const recruiterName =
        recruiter?.name ||
        recruiter?.user?.name ||
        (recruiter as any)?.full_name ||
        ((recruiter as any)?.first_name && (recruiter as any)?.last_name
            ? `${(recruiter as any).first_name} ${(recruiter as any).last_name}`
            : null);
    const recruiterEmail = recruiter?.email || recruiter?.user?.email || null;
    const recruiterInitials = recruiterName
        ? recruiterName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        : "?";

    const companyRecruiter = (application as any)?.company_recruiter;
    const companyRecruiterName = companyRecruiter?.user?.name || null;
    const companyRecruiterEmail = companyRecruiter?.user?.email || null;
    const companyRecruiterInitials = companyRecruiterName
        ? companyRecruiterName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        : "?";

    const candidateSourcerRaw = (candidate as any)?.candidate_sourcer;
    const candidateSourcer = Array.isArray(candidateSourcerRaw)
        ? candidateSourcerRaw[0]
        : candidateSourcerRaw;
    const candidateSourcerRecruiter = candidateSourcer?.recruiter;
    const candidateSourcerName = candidateSourcerRecruiter?.user?.name || null;
    const candidateSourcerEmail = candidateSourcerRecruiter?.user?.email || null;
    const candidateSourcerInitials = candidateSourcerName
        ? candidateSourcerName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        : "?";

    const companySourcer = (application as any)?.company_sourcer;
    const companySourcerRecruiter = companySourcer?.recruiter;
    const companySourcerName = companySourcerRecruiter?.user?.name || null;
    const companySourcerEmail = companySourcerRecruiter?.user?.email || null;
    const companySourcerInitials = companySourcerName
        ? companySourcerName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        : "?";

    const truncateText = (text: string | null | undefined, maxLength = 400) => {
        if (!text) return null;
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + "...";
    };

    const jobDescription = job?.recruiter_description || job?.description;
    const candidateBio =
        (candidate?.marketplace_profile as any)?.rich_bio || candidate?.bio;

    return (
        <div className="space-y-6">
            {job && (
                <SummaryCard
                    title="Role Summary"
                    borderColor="border-primary"
                    heading={job.title}
                    sub={job.company?.name || "Company pending"}
                    metas={[
                        job.location ? { icon: "fa-location-dot", color: "text-primary", text: job.location } : null,
                        job.employment_type ? { icon: "fa-briefcase", color: "text-secondary", text: job.employment_type.replace("_", " ") } : null,
                        (job.salary_min || job.salary_max) ? { icon: "fa-money-bill-wave", color: "text-accent", text: `$${job.salary_min?.toLocaleString() || "..."} - $${job.salary_max?.toLocaleString() || "..."}` } : null,
                    ].filter(Boolean) as { icon: string; color: string; text: string }[]}
                    body={truncateText(jobDescription)}
                />
            )}

            {candidate && (
                <SummaryCard
                    title="Candidate Summary"
                    borderColor="border-secondary"
                    heading={candidate.full_name}
                    sub={candidate.current_title
                        ? `${candidate.current_title}${candidate.current_company ? ` at ${candidate.current_company}` : ""}`
                        : undefined}
                    metas={[
                        candidate.email ? { icon: "fa-envelope", color: "text-secondary", text: candidate.email } : null,
                        candidate.phone ? { icon: "fa-phone", color: "text-primary", text: candidate.phone } : null,
                        candidate.location ? { icon: "fa-location-dot", color: "text-accent", text: candidate.location } : null,
                    ].filter(Boolean) as { icon: string; color: string; text: string }[]}
                    body={truncateText(candidateBio)}
                />
            )}

            <div className="flex items-center gap-2 text-sm text-base-content/50">
                <i className="fa-duotone fa-regular fa-calendar" />
                Submitted {formatApplicationDate(application.created_at)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <RecruiterCard label="Candidate Recruiter" name={recruiterName} email={recruiterEmail} initials={recruiterInitials} borderColor="border-primary" avatarColor="bg-primary text-primary-content" />
                    <SourcerCard label="Candidate Sourcer" name={candidateSourcerName} email={candidateSourcerEmail} initials={candidateSourcerInitials} accentColor="text-primary" borderColor="border-primary" />
                </div>
                <div className="space-y-3">
                    <RecruiterCard label="Company Recruiter" name={companyRecruiterName} email={companyRecruiterEmail} initials={companyRecruiterInitials} borderColor="border-secondary" avatarColor="bg-secondary text-secondary-content" />
                    <SourcerCard label="Company Sourcer" name={companySourcerName} email={companySourcerEmail} initials={companySourcerInitials} accentColor="text-secondary" borderColor="border-secondary" />
                </div>
            </div>

            <AIReviewPanel applicationId={application.id} variant="compact" />
        </div>
    );
}

function SummaryCard({ title, borderColor, heading, sub, metas, body }: {
    title: string; borderColor: string; heading: string; sub?: string;
    metas: { icon: string; color: string; text: string }[]; body: string | null;
}) {
    return (
        <div className={`bg-base-100 border-l-4 ${borderColor} p-6`}>
            <h3 className="text-sm uppercase tracking-[0.2em] text-base-content/40 font-bold mb-4">{title}</h3>
            <div className="space-y-3">
                <div>
                    <div className="text-lg font-black tracking-tight">{heading}</div>
                    {sub && <div className="text-sm text-base-content/60">{sub}</div>}
                </div>
                {metas.length > 0 && (
                    <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
                        {metas.map((m) => (
                            <span key={m.text} className="flex items-center gap-2">
                                <i className={`fa-duotone fa-regular ${m.icon} ${m.color}`} />{m.text}
                            </span>
                        ))}
                    </div>
                )}
                {body && (
                    <div className="text-sm text-base-content/60 leading-relaxed pt-3 border-t border-base-300">
                        {body}
                    </div>
                )}
            </div>
        </div>
    );
}
