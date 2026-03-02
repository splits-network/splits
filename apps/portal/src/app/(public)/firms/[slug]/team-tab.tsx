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
        <div className="profile-section opacity-0 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-base-content/40 mb-4">
                Team Members
            </h3>
            {members.map((m) => {
                const name = m.recruiter?.user?.name || "Team Member";
                const initials = firmInitials(name);
                return (
                    <div
                        key={m.id}
                        className="flex items-center gap-3 p-3 bg-base-200"
                    >
                        <div
                            className="w-10 h-10 flex items-center justify-center bg-base-100 border border-base-300 text-sm font-bold text-base-content/60"
                            style={{ borderRadius: 0 }}
                        >
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{name}</p>
                        </div>
                        <span className="text-sm uppercase tracking-wider text-base-content/40 font-bold">
                            {m.role}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
