"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface CompanyRole {
    id: string;
    title: string;
    department?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    status?: string;
}

function formatRoleSalary(min?: number, max?: number): string | null {
    if (!min && !max) return null;
    const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max!)}`;
}

export function CompanyRolesTab({ companyId }: { companyId: string }) {
    const { getToken } = useAuth();
    const [roles, setRoles] = useState<CompanyRole[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRoles = useCallback(
        async (signal?: { cancelled: boolean }) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: CompanyRole[] }>("/jobs", {
                    params: { company_id: companyId, limit: 20, job_owner_filter: "all" },
                });
                if (!signal?.cancelled) setRoles(res.data);
            } catch (err) {
                console.error("Failed to fetch company roles:", err);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [companyId],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);
        fetchRoles(signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });
        return () => { signal.cancelled = true; };
    }, [fetchRoles]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="loading loading-spinner loading-md text-primary" />
            </div>
        );
    }

    if (roles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <i className="fa-duotone fa-regular fa-briefcase text-3xl text-base-content/20 mb-3" />
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40">No open roles</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-3">
            {roles.map((role) => (
                <div key={role.id} className="bg-base-200 border border-base-300 border-l-4 border-l-primary p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold mb-1">{role.title}</p>
                            <div className="flex items-center gap-3 text-sm text-base-content/50">
                                {role.department && (
                                    <span className="flex items-center gap-1">
                                        <i className="fa-duotone fa-regular fa-sitemap" /> {role.department}
                                    </span>
                                )}
                                {role.location && (
                                    <span className="flex items-center gap-1">
                                        <i className="fa-duotone fa-regular fa-location-dot" /> {role.location}
                                    </span>
                                )}
                            </div>
                        </div>
                        {formatRoleSalary(role.salary_min, role.salary_max) && (
                            <span className="text-sm font-bold text-primary whitespace-nowrap">
                                {formatRoleSalary(role.salary_min, role.salary_max)}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
