"use client";

import type { EnrichedMatch } from "@splits-network/shared-types";
import { BaselBadge } from "@splits-network/basel-ui";

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
                <BaselBadge color="info" size="xs" variant="soft">
                    <i className="fa-duotone fa-regular fa-paper-plane text-sm" />
                    Invited
                </BaselBadge>
            ) : isDenied ? (
                <BaselBadge color="warning" size="xs" variant="soft">Declined</BaselBadge>
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
