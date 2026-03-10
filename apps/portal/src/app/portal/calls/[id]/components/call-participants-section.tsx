"use client";

import { BaselBadge } from "@splits-network/basel-ui";
import type { CallParticipantItem } from "../../types";

interface CallParticipantsSectionProps {
    participants: CallParticipantItem[];
}

export function CallParticipantsSection({
    participants,
}: CallParticipantsSectionProps) {
    if (participants.length === 0) return null;

    return (
        <div>
            <h3 className="font-bold text-sm uppercase tracking-[0.15em] mb-4">
                <i className="fa-duotone fa-regular fa-users mr-2 text-base-content/40" />
                Participants ({participants.length})
            </h3>

            <div className="border-2 border-base-300 overflow-x-auto">
                <table className="w-full" style={{ minWidth: 500 }}>
                    <thead>
                        <tr className="bg-base-200 border-b-2 border-base-300">
                            <th className="px-4 py-2.5 text-left text-sm uppercase tracking-[0.15em] font-bold text-base-content/40">
                                Name
                            </th>
                            <th className="px-4 py-2.5 text-left text-sm uppercase tracking-[0.15em] font-bold text-base-content/40">
                                Role
                            </th>
                            <th className="px-4 py-2.5 text-left text-sm uppercase tracking-[0.15em] font-bold text-base-content/40">
                                Joined
                            </th>
                            <th className="px-4 py-2.5 text-left text-sm uppercase tracking-[0.15em] font-bold text-base-content/40">
                                Left
                            </th>
                            <th className="px-4 py-2.5 text-left text-sm uppercase tracking-[0.15em] font-bold text-base-content/40">
                                Duration
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map((p) => (
                            <ParticipantRow key={p.id} participant={p} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ParticipantRow({
    participant,
}: {
    participant: CallParticipantItem;
}) {
    const name = participant.user.name;
    const joined = participant.joined_at
        ? new Date(participant.joined_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
          })
        : "--";
    const left = participant.left_at
        ? new Date(participant.left_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
          })
        : "--";

    const duration = computeDuration(
        participant.joined_at,
        participant.left_at
    );

    const roleColor = participant.role === "host"
        ? "primary"
        : participant.role === "observer"
          ? "warning"
          : "neutral";

    return (
        <tr className="border-b border-base-300">
            <td className="px-4 py-2.5">
                <div className="flex items-center gap-3">
                    {participant.user.avatar_url ? (
                        <div className="avatar">
                            <div className="w-8 h-8">
                                <img
                                    src={participant.user.avatar_url}
                                    alt={name}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="avatar placeholder">
                            <div className="w-8 h-8 bg-base-300 text-base-content/50">
                                <span className="text-sm">
                                    {participant.user.name[0]}
                                </span>
                            </div>
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-bold">{name}</p>
                        <p className="text-sm text-base-content/40">
                            {participant.user.email}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-2.5">
                <BaselBadge color={roleColor}>
                    {participant.role}
                </BaselBadge>
            </td>
            <td className="px-4 py-2.5">
                <span className="text-sm font-mono">{joined}</span>
            </td>
            <td className="px-4 py-2.5">
                <span className="text-sm font-mono">{left}</span>
            </td>
            <td className="px-4 py-2.5">
                <span className="text-sm">{duration}</span>
            </td>
        </tr>
    );
}

function computeDuration(
    joinedAt: string | null,
    leftAt: string | null
): string {
    if (!joinedAt) return "--";
    const start = new Date(joinedAt).getTime();
    const end = leftAt ? new Date(leftAt).getTime() : Date.now();
    const diffMs = end - start;
    if (diffMs < 0) return "--";

    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);

    if (mins < 1) return `${secs}s`;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
}
