"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { GeometricDecoration, Badge } from "@splits-network/memphis-ui";
import type { AccentColor } from "@splits-network/memphis-ui";
import {
    formatCommuteTypes,
    formatJobLevel,
    COMMUTE_TYPE_LABELS,
} from "../../roles/types";

interface MemphisInlineDetailProps {
    id: string;
    accent?: AccentColor;
    onClose: () => void;
    onViewPipeline?: (roleId: string) => void;
}

const BORDER_CLASSES: Record<string, string> = {
    coral: "border-coral",
    teal: "border-teal",
    yellow: "border-yellow",
    purple: "border-purple",
};

const TEXT_CLASSES: Record<string, string> = {
    coral: "text-coral",
    teal: "text-teal",
    yellow: "text-yellow",
    purple: "text-purple",
};

const BG_CLASSES: Record<string, string> = {
    coral: "bg-coral",
    teal: "bg-teal",
    yellow: "bg-yellow",
    purple: "bg-purple",
};

const STATUS_ACCENT: Record<string, AccentColor> = {
    active: "teal",
    paused: "yellow",
    filled: "purple",
    closed: "coral",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
    full_time: "Full-Time",
    contract: "Contract",
    temporary: "Temporary",
    parttime: "Part-Time",
    freelance: "Freelance",
};

const ACCENT_CYCLE: AccentColor[] = ["coral", "teal", "yellow", "purple"];

function formatSalary(min?: number, max?: number): string {
    if (!min && !max) return "\u2014";
    const fmt = (n: number) =>
        n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString();
    if (min && max) return `USD ${fmt(min)} - ${fmt(max)}`;
    if (max) return `USD ${fmt(max)}`;
    return `USD ${fmt(min!)}`;
}

/**
 * Memphis-styled inline detail panel matching showcase/lists/six JobDetail.
 * Renders inside the page layout (not as an overlay).
 */
export default function MemphisInlineDetail({
    id,
    accent = "coral",
    onClose,
    onViewPipeline,
}: MemphisInlineDetailProps) {
    const { getToken } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get(`/jobs/${id}`, {
                params: { include: "company,requirements,pre_screen_questions" },
            });
            setJob(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load role details");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const borderClass = BORDER_CLASSES[accent] || "border-coral";
    const textClass = TEXT_CLASSES[accent] || "text-coral";

    // --- Loading ---
    if (loading) {
        return (
            <div className={`border-memphis ${borderClass} bg-white p-8 text-center`}>
                <GeometricDecoration shape="square" color={accent} size={24} className="mx-auto mb-3 animate-spin" />
                <p className="text-xs font-black uppercase tracking-wider text-dark/40">
                    Loading details...
                </p>
            </div>
        );
    }

    // --- Error ---
    if (error || !job) {
        return (
            <div className={`border-memphis ${borderClass} bg-white p-6`}>
                <div className="border-memphis-detail border-dark bg-coral/10 p-4">
                    <p className="text-xs font-bold text-coral">
                        <i className="fa-duotone fa-regular fa-circle-exclamation mr-2" />
                        {error || "Role not found"}
                    </p>
                    <button onClick={onClose} className="memphis-btn memphis-btn-sm btn-coral mt-3">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // --- Data ---
    const statusAccent = STATUS_ACCENT[job.status] || "coral";
    const mandatoryReqs = (job.requirements || []).filter(
        (r: any) => r.requirement_type === "mandatory",
    );
    const preferredReqs = (job.requirements || []).filter(
        (r: any) => r.requirement_type === "preferred",
    );
    const description = job.recruiter_description || job.candidate_description || job.description;
    const commute = formatCommuteTypes(job.commute_types);
    const level = formatJobLevel(job.job_level);
    const empType = EMPLOYMENT_LABELS[job.employment_type] || job.employment_type;
    const maxPayout = job.salary_max
        ? Math.round((job.fee_percentage * job.salary_max) / 100)
        : null;

    return (
        <div className={`border-memphis ${borderClass} bg-white`}>
            <div className="h-full overflow-y-auto" style={{ maxHeight: "calc(100vh - 12rem)" }}>

                {/* ══════════════════════════════════════════
                    HEADER — Title, company, meta pills, close
                   ══════════════════════════════════════════ */}
                <div className={`p-6 border-b-4 ${borderClass}`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            {/* Status badge as featured-style label */}
                            <Badge variant={statusAccent} className="mb-3">
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>

                            <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2 text-dark">
                                {job.title}
                            </h2>

                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className={`font-bold ${textClass}`}>
                                    {job.company?.name || "Confidential"}
                                </span>
                                {job.location && (
                                    <>
                                        <span className="text-dark/50">|</span>
                                        <span className="text-dark/70">
                                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                            {job.location}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className={`w-8 h-8 flex items-center justify-center flex-shrink-0 font-black text-sm border-memphis-detail ${borderClass} ${textClass} transition-transform hover:-translate-y-0.5`}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    </div>

                    {/* Meta pills */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {empType && (
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-memphis-detail border-dark text-dark/60">
                                {empType}
                            </span>
                        )}
                        {level && (
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-memphis-detail border-dark text-dark/60">
                                {level}
                            </span>
                        )}
                        {commute && (
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-memphis-detail border-dark text-dark/60">
                                {commute}
                            </span>
                        )}
                        {job.open_to_relocation && (
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-memphis-detail border-teal text-teal">
                                Relocation OK
                            </span>
                        )}
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    STATS GRID — Salary, Fee, Applicants
                   ══════════════════════════════════════════ */}
                <div className={`grid grid-cols-3 border-b-4 ${borderClass}`}>
                    <div className="p-4 text-center border-r-2 border-dark/10">
                        <div className={`text-lg font-black ${textClass}`}>
                            {formatSalary(job.salary_min, job.salary_max)}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-dark/50">
                            Salary
                        </div>
                    </div>
                    <div className="p-4 text-center border-r-2 border-dark/10">
                        <div className={`text-lg font-black ${textClass}`}>
                            {job.fee_percentage}%
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-dark/50">
                            Placement Fee
                        </div>
                    </div>
                    <div className="p-4 text-center">
                        <div className={`text-lg font-black ${textClass}`}>
                            {job.application_count || 0}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-dark/50">
                            Applicants
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    BODY — Description, Requirements, etc.
                   ══════════════════════════════════════════ */}
                <div className="p-6">
                    {/* Description */}
                    {description && (
                        <p className="text-sm leading-relaxed mb-6 text-dark/80">
                            {description}
                        </p>
                    )}

                    {/* Mandatory Requirements */}
                    {mandatoryReqs.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                                <span className="w-6 h-6 flex items-center justify-center text-[10px] bg-coral text-white">
                                    <i className="fa-duotone fa-regular fa-list-check" />
                                </span>
                                Requirements
                            </h3>
                            <ul className="space-y-2">
                                {mandatoryReqs.map((req: any) => (
                                    <li key={req.id} className="flex items-start gap-2 text-sm text-dark/75">
                                        <i className="fa-duotone fa-regular fa-chevron-right mt-1 flex-shrink-0 text-[10px] text-coral" />
                                        {req.description}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Preferred Requirements */}
                    {preferredReqs.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                                <span className="w-6 h-6 flex items-center justify-center text-[10px] bg-teal text-dark">
                                    <i className="fa-duotone fa-regular fa-clipboard-list" />
                                </span>
                                Nice to Have
                            </h3>
                            <ul className="space-y-2">
                                {preferredReqs.map((req: any) => (
                                    <li key={req.id} className="flex items-start gap-2 text-sm text-dark/75">
                                        <i className="fa-duotone fa-regular fa-chevron-right mt-1 flex-shrink-0 text-[10px] text-teal" />
                                        {req.description}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Commute Types as tags */}
                    {job.commute_types && job.commute_types.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                                <span className="w-6 h-6 flex items-center justify-center text-[10px] bg-yellow text-dark">
                                    <i className="fa-duotone fa-regular fa-building-user" />
                                </span>
                                Work Arrangement
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {job.commute_types.map((ct: string) => (
                                    <span key={ct} className="px-3 py-1 text-xs font-semibold border-memphis-detail border-yellow/60 text-dark">
                                        {COMMUTE_TYPE_LABELS[ct] || ct}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pre-Screen Questions */}
                    {job.pre_screen_questions && job.pre_screen_questions.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                                <span className="w-6 h-6 flex items-center justify-center text-[10px] bg-purple text-white">
                                    <i className="fa-duotone fa-regular fa-question" />
                                </span>
                                Pre-Screen Questions
                            </h3>
                            <ul className="space-y-2">
                                {job.pre_screen_questions.map((q: any, i: number) => (
                                    <li key={q.id || i} className="flex items-start gap-2 text-sm text-dark/75">
                                        <i className="fa-duotone fa-regular fa-chevron-right mt-1 flex-shrink-0 text-[10px] text-purple" />
                                        <span>
                                            {q.question}
                                            {q.is_required && (
                                                <span className="ml-1 text-coral text-[10px] font-bold uppercase">Required</span>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Company Card */}
                    {job.company && (
                        <div className={`p-4 border-memphis ${borderClass} mb-4`}>
                            <h3 className="font-black text-xs uppercase tracking-wider mb-3 text-dark">
                                Company
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 border-memphis-detail ${borderClass} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                                    {job.company.logo_url ? (
                                        <img
                                            src={job.company.logo_url}
                                            alt={job.company.name}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-lg font-black text-dark">
                                            {(job.company.name || "C")[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-dark">
                                        {job.company.name}
                                    </div>
                                    {job.company.industry && (
                                        <div className={`text-xs ${textClass}`}>
                                            {job.company.industry}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fee / Commission info */}
                    {maxPayout && (
                        <div className="mt-4 p-3 border-memphis-detail border-purple/60 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-coins text-sm text-purple" />
                            <span className="text-xs font-bold uppercase tracking-wider text-dark">
                                Max Commission: ${maxPayout.toLocaleString()}
                            </span>
                        </div>
                    )}

                    {/* Guarantee */}
                    {job.guarantee_days && (
                        <div className="mt-4 p-3 border-memphis-detail border-teal/60 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-shield-check text-sm text-teal" />
                            <span className="text-xs font-bold uppercase tracking-wider text-dark">
                                Guarantee: {job.guarantee_days} days
                            </span>
                        </div>
                    )}

                    {/* Posted date */}
                    <div className="mt-4 p-3 border-memphis-detail border-coral/60 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-calendar-clock text-sm text-coral" />
                        <span className="text-xs font-bold uppercase tracking-wider text-dark">
                            Posted: {new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-6">
                        {onViewPipeline && (
                            <button
                                onClick={() => onViewPipeline(id)}
                                className="memphis-btn memphis-btn-sm btn-teal flex-1"
                            >
                                <i className="fa-duotone fa-regular fa-diagram-project" />
                                Pipeline
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
