"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type { PublicFirm, FirmMember } from "../types";
import { firmInitials } from "../types";

interface TeamTabProps {
    firm: PublicFirm;
}

export default function TeamTab({ firm }: TeamTabProps) {
    const [members, setMembers] = useState<FirmMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        apiClient
            .get<{ data: FirmMember[] }>(`/public/firms/${firm.slug}/members`)
            .then((res) => {
                if (!cancelled) setMembers(res.data ?? []);
            })
            .catch(() => {
                if (!cancelled) setMembers([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [firm.slug]);

    if (loading) {
        return (
            <div className="profile-section opacity-0 flex justify-center py-12">
                <span className="loading loading-spinner loading-md text-primary" />
            </div>
        );
    }

    if (members.length === 0) {
        return (
            <div className="profile-section opacity-0 text-center py-12">
                <i className="fa-duotone fa-regular fa-users text-3xl text-base-content/15 mb-3 block" />
                <p className="text-sm text-base-content/50">No team members to display.</p>
            </div>
        );
    }

    return (
        <div className="profile-section opacity-0">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-8">
                Team Members
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
                {members.map((m) => {
                    const name = m.recruiter?.user?.name || "Team Member";
                    const initials = firmInitials(name);
                    return (
                        <div
                            key={m.id}
                            className="flex items-center gap-4 bg-base-200 border border-base-300 px-5 py-4"
                        >
                            <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center font-black text-sm shrink-0">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black text-base-content leading-tight">
                                    {name}
                                </p>
                                <p className="text-xs font-bold uppercase tracking-wider text-base-content/30 mt-0.5">
                                    {m.role}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
