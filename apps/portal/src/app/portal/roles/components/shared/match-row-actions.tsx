"use client";

import type { EnrichedMatch } from "@splits-network/shared-types";

interface Props {
    match: EnrichedMatch;
    onInvite: (matchId: string) => void;
    onDismiss: (matchId: string) => void;
    isInviting: boolean;
}

export function MatchRowActions({ match, onInvite, onDismiss, isInviting }: Props) {
    const isInvited = match.invite_status === "sent";
    const isDenied = match.invite_status === "denied";

    return (
        <div className="flex items-center gap-1">
            {isInvited ? (
                <span className="badge badge-info badge-sm gap-1">
                    <i className="fa-duotone fa-regular fa-paper-plane text-[10px]" />
                    Invited
                </span>
            ) : isDenied ? (
                <span className="badge badge-warning badge-sm gap-1">Declined</span>
            ) : (
                <button
                    className="btn btn-primary btn-xs"
                    onClick={(e) => {
                        e.stopPropagation();
                        onInvite(match.id);
                    }}
                    disabled={isInviting}
                >
                    {isInviting ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-paper-plane" />
                            Invite
                        </>
                    )}
                </button>
            )}
            <button
                className="btn btn-ghost btn-xs"
                onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(match.id);
                }}
                title="Dismiss match"
            >
                <i className="fa-duotone fa-regular fa-xmark" />
            </button>
        </div>
    );
}
