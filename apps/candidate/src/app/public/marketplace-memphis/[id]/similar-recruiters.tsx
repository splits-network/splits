"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

const C = { coral: "#FF6B6B", teal: "#4ECDC4", mint: "#95E1D3", yellow: "#FFE66D", purple: "#A78BFA", dark: "#1A1A2E", cream: "#F5F0EB", white: "#FFFFFF" };

interface SimilarRecruiter {
    id: string;
    user_id: string;
    tagline?: string;
    total_placements?: number;
    users?: {
        name?: string;
    };
}

interface SimilarRecruitersProps {
    currentRecruiterId: string;
    industries?: string[];
    specialties?: string[];
}

export default function SimilarRecruiters({ currentRecruiterId, industries, specialties }: SimilarRecruitersProps) {
    const [recruiters, setRecruiters] = useState<SimilarRecruiter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSimilarRecruiters() {
            try {
                const response = await apiClient.get<{ data: SimilarRecruiter[]; pagination?: any }>('/recruiters', {
                    params: {
                        page: 1,
                        limit: 4,
                        sort_by: 'created_at',
                        sort_order: 'desc',
                        include: 'user',
                    }
                });

                // Filter out current recruiter and take first 3
                const filtered = (response.data || []).filter(r => r.id !== currentRecruiterId).slice(0, 3);
                setRecruiters(filtered);
            } catch (error) {
                console.error('Failed to fetch similar recruiters:', error);
                setRecruiters([]);
            } finally {
                setLoading(false);
            }
        }

        fetchSimilarRecruiters();
    }, [currentRecruiterId, industries, specialties]);

    if (loading) {
        return (
            <div className="border-4 p-6" style={{ borderColor: C.teal, backgroundColor: C.white }}>
                <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                    <span className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                        <i className="fa-duotone fa-regular fa-users text-xs" style={{ color: C.dark }}></i>
                    </span>Similar Recruiters
                </h3>
                <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>Loading...</p>
            </div>
        );
    }

    if (recruiters.length === 0) {
        return null;
    }

    const colors = [C.coral, C.teal, C.purple];

    return (
        <div className="border-4 p-6" style={{ borderColor: C.teal, backgroundColor: C.white }}>
            <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                <span className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                    <i className="fa-duotone fa-regular fa-users text-xs" style={{ color: C.dark }}></i>
                </span>Similar Recruiters
            </h3>
            <div className="flex flex-col gap-4">
                {recruiters.map((r, i) => {
                    const color = colors[i % 3];
                    const name = r.users?.name || "Recruiter";
                    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();

                    return (
                        <Link key={r.id} href={`/public/marketplace-memphis/${r.id}`}>
                            <div className="flex items-center gap-3 p-3 border-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
                                style={{ borderColor: color }}>
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border-2 rounded-full"
                                    style={{ borderColor: color, backgroundColor: color }}>
                                    <span className="text-xs font-black" style={{ color: color === C.yellow ? C.dark : C.white }}>
                                        {initials}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black uppercase truncate" style={{ color: C.dark }}>{name}</p>
                                    <p className="text-[10px] truncate" style={{ color: C.dark, opacity: 0.5 }}>{r.tagline || "Recruiter"}</p>
                                </div>
                                {r.total_placements !== undefined && (
                                    <span className="text-sm font-black" style={{ color: color }}>{r.total_placements}</span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
