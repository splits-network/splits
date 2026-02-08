"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@splits-network/shared-ui";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import RecruiterReputationBadge from "@/components/recruiter-reputation-badge";
import { RecruiterWithUser, getDisplayName } from "../../types";

interface DetailsProps {
    itemId: string;
    onRefresh?: () => void;
}

export default function Details({ itemId, onRefresh }: DetailsProps) {
    const { getToken } = useAuth();
    const [recruiter, setRecruiter] = useState<RecruiterWithUser | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const response: any = await client.get(
                `/recruiters/${itemId}`,
                { params: { include: "user,reputation" } },
            );
            setRecruiter(response.data);
        } catch (err) {
            console.error("Failed to fetch recruiter detail:", err);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    if (loading) {
        return (
            <div className="p-8">
                <LoadingState message="Loading recruiter details..." />
            </div>
        );
    }

    if (!recruiter) return null;

    const bioContent =
        recruiter.marketplace_profile?.description ||
        recruiter.marketplace_profile?.bio_rich ||
        recruiter.marketplace_profile?.bio ||
        recruiter.bio;

    const specialties = recruiter.specialties || [];
    const industries = recruiter.industries || [];
    const displayEmail = recruiter.users?.email || recruiter.email;
    const yearsExperience = recruiter.years_experience;

    const formatMemberSince = (dateStr: string | undefined) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            });
        } catch {
            return null;
        }
    };

    const memberSince = formatMemberSince(recruiter.created_at);

    return (
        <div className="space-y-6 p-6">
            {/* Bio Section */}
            <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-address-card text-primary"></i>
                    About
                </h3>
                <div className="text-base-content/80 bg-base-200/50 p-4 rounded-lg border border-base-200">
                    {bioContent ? (
                        <MarkdownRenderer content={bioContent} />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center opacity-60">
                            <i className="fa-duotone fa-regular fa-pen-field text-4xl mb-2"></i>
                            <p className="italic">No biography provided.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Reputation Section - Always show for recruiters */}
            <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-medal text-primary"></i>
                    Reputation
                </h3>
                <RecruiterReputationBadge
                    reputation={{
                        recruiter_id: recruiter.id,
                        total_submissions: (recruiter as any).total_submissions || 0,
                        total_hires: (recruiter as any).total_hires || 0,
                        completed_placements: recruiter.total_placements || 0,
                        failed_placements: (recruiter as any).total_failures || 0,
                        hire_rate: (recruiter as any).hire_rate ?? null,
                        completion_rate: (recruiter as any).completion_rate ?? null,
                        reputation_score: recruiter.reputation_score ?? null,
                        avg_time_to_hire_days: (recruiter as any).avg_time_to_hire_days,
                        avg_response_time_hours: (recruiter as any).avg_response_time_hours,
                    }}
                    showDetails
                />
            </section>

            {/* Performance Stats */}
            <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-chart-simple text-primary"></i>
                    Performance Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard
                        title="Placements"
                        value={recruiter.total_placements}
                        icon="fa-handshake"
                        colorClass="text-primary"
                    />
                    <StatCard
                        title="Success Rate"
                        value={
                            recruiter.success_rate !== undefined
                                ? Math.round(recruiter.success_rate)
                                : undefined
                        }
                        icon="fa-bullseye"
                        colorClass="text-success"
                        suffix="%"
                    />
                    <StatCard
                        title="Avg. Time to Hire"
                        value={recruiter.average_time_to_hire}
                        icon="fa-clock"
                        colorClass="text-info"
                        suffix="d"
                    />
                </div>
            </section>

            {/* Experience */}
            {yearsExperience && (
                <section className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body p-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 rounded-full p-3">
                                <i className="fa-duotone fa-regular fa-calendar-clock text-primary text-xl"></i>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-base-content">
                                    {yearsExperience}+
                                </div>
                                <div className="text-sm text-base-content/60">
                                    Years in Recruitment
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Specialties */}
            {specialties.length > 0 && (
                <section className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="p-4 border-b border-base-200 bg-base-200/30">
                        <h3 className="font-semibold flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-briefcase text-primary"></i>
                            Specialties
                        </h3>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                        {specialties.map((specialty, i) => (
                            <span
                                key={`specialty-${i}`}
                                className="badge badge-lg bg-primary/10 text-primary border-primary/20 p-3"
                            >
                                {specialty}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Industries */}
            {industries.length > 0 && (
                <section className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="p-4 border-b border-base-200 bg-base-200/30">
                        <h3 className="font-semibold flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-industry text-secondary"></i>
                            Industries
                        </h3>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                        {industries.map((industry, i) => (
                            <span
                                key={`industry-${i}`}
                                className="badge badge-lg bg-secondary/10 text-secondary border-secondary/20 p-3"
                            >
                                {industry}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Contact Info */}
            {(displayEmail || recruiter.phone || memberSince) && (
                <section className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="p-4 border-b border-base-200 bg-base-200/30">
                        <h3 className="font-semibold flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-address-book text-info"></i>
                            Contact Info
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {displayEmail && (
                            <a
                                href={`mailto:${displayEmail}`}
                                className="flex items-center gap-3 text-base-content/80 hover:text-primary transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-envelope text-base-content/50 w-5"></i>
                                <span className="truncate">
                                    {displayEmail}
                                </span>
                            </a>
                        )}
                        {recruiter.phone && (
                            <div className="flex items-center gap-3 text-base-content/80">
                                <i className="fa-duotone fa-regular fa-phone text-base-content/50 w-5"></i>
                                <span>{recruiter.phone}</span>
                            </div>
                        )}
                        {memberSince && (
                            <div className="flex items-center gap-3 text-base-content/60 text-sm pt-2 border-t border-base-200">
                                <i className="fa-duotone fa-regular fa-calendar text-base-content/40 w-5"></i>
                                <span>Member since {memberSince}</span>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}

// Internal stat card component for performance metrics
function StatCard({
    title,
    value,
    icon,
    colorClass,
    suffix = "",
}: {
    title: string;
    value: string | number | undefined;
    icon: string;
    colorClass: string;
    suffix?: string;
}) {
    const displayValue =
        value !== undefined && value !== null ? `${value}${suffix}` : "\u2014";

    return (
        <div className="card bg-base-200 shadow-sm border border-base-300">
            <div className="card-body p-4">
                <div className="flex items-center gap-2 text-base-content/60 mb-1">
                    <i
                        className={`fa-duotone fa-regular ${icon} text-sm`}
                    ></i>
                    <h4 className="text-xs font-medium uppercase tracking-wide">
                        {title}
                    </h4>
                </div>
                <div className={`text-2xl font-bold font-mono ${colorClass}`}>
                    {displayValue}
                </div>
            </div>
        </div>
    );
}
