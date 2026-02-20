"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { getInitials } from "../components/status-color";

interface SimilarRecruiter {
    id: string;
    user_id: string;
    tagline?: string;
    total_placements?: number;
    reputation_score?: number;
    users?: {
        name?: string;
    };
}

interface SimilarRecruitersProps {
    currentRecruiterId: string;
    industries?: string[];
    specialties?: string[];
}

export default function SimilarRecruiters({
    currentRecruiterId,
}: SimilarRecruitersProps) {
    const [recruiters, setRecruiters] = useState<SimilarRecruiter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSimilarRecruiters() {
            try {
                const response = await apiClient.get<{
                    data: SimilarRecruiter[];
                    pagination?: unknown;
                }>("/recruiters", {
                    params: {
                        page: 1,
                        limit: 4,
                        sort_by: "reputation_score",
                        sort_order: "desc",
                        include: "user",
                    },
                });

                const filtered = (response.data || [])
                    .filter((r) => r.id !== currentRecruiterId)
                    .slice(0, 3);
                setRecruiters(filtered);
            } catch {
                setRecruiters([]);
            } finally {
                setLoading(false);
            }
        }

        fetchSimilarRecruiters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRecruiterId]);

    if (loading) {
        return (
            <div className="bg-base-200 border-t-4 border-t-secondary p-6">
                <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                    Similar Recruiters
                </h3>
                <div className="flex items-center justify-center py-4">
                    <span className="loading loading-spinner loading-sm text-primary" />
                </div>
            </div>
        );
    }

    if (recruiters.length === 0) {
        return null;
    }

    return (
        <div className="bg-base-200 border-t-4 border-t-secondary p-6">
            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                Similar Recruiters
            </h3>
            <div className="flex flex-col gap-3">
                {recruiters.map((r) => {
                    const name = r.users?.name || "Recruiter";
                    const initials = getInitials(name);

                    return (
                        <Link key={r.id} href={`/marketplace/${r.id}`}>
                            <div className="flex items-center gap-3 p-3 bg-base-100 border border-base-300 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                                <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">
                                        {name}
                                    </p>
                                    <p className="text-[10px] text-base-content/50 truncate">
                                        {r.tagline || "Recruiter"}
                                    </p>
                                </div>
                                {r.total_placements !== undefined && (
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-sm font-black text-primary">
                                            {r.total_placements}
                                        </span>
                                        <p className="text-[8px] uppercase tracking-wider text-base-content/30">
                                            Placed
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
