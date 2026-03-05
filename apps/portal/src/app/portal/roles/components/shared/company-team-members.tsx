"use client";

import type { CompanyMember } from "./job-detail-company-tab";

function formatRoleName(role: string) {
    return role
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

function memberDisplayName(m: CompanyMember) {
    if (m.users?.first_name || m.users?.last_name) {
        return [m.users.first_name, m.users.last_name].filter(Boolean).join(" ");
    }
    return m.users?.email || "Unknown";
}

function memberInitials(m: CompanyMember) {
    if (m.users?.first_name && m.users?.last_name) {
        return (m.users.first_name[0] + m.users.last_name[0]).toUpperCase();
    }
    if (m.users?.email) return m.users.email[0].toUpperCase();
    return "?";
}

export function CompanyTeamMembers({
    members,
    loading,
}: {
    members: CompanyMember[];
    loading: boolean;
}) {
    return (
        <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                Team Members
            </h3>

            {loading && (
                <div className="flex items-center gap-3 py-4">
                    <span className="loading loading-spinner loading-sm text-primary" />
                    <span className="text-sm text-base-content/50">Loading team...</span>
                </div>
            )}

            {!loading && members.length === 0 && (
                <div className="text-center py-8 text-base-content/40">
                    <i className="fa-duotone fa-regular fa-users text-2xl mb-2 block" />
                    <p className="text-sm">No team members available</p>
                </div>
            )}

            {!loading && members.length > 0 && (
                <div className="space-y-[2px] bg-base-300">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 bg-base-100 p-4">
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
                            <span className="text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 bg-base-200 text-base-content/50 shrink-0">
                                {member.roles?.display_name || formatRoleName(member.role_name)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
