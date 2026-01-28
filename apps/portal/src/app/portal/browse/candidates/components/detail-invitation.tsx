"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { RecruiterCandidate } from "./types";

interface DetailInvitationProps {
    candidateId: string;
}

export default function DetailInvitation({
    candidateId,
}: DetailInvitationProps) {
    const { getToken } = useAuth();
    const [invitation, setInvitation] = useState<RecruiterCandidate | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInvitation = async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            // V2 API to get my relationship with this candidate
            const response = await client.get(
                `/recruiter-candidates?candidate_id=${candidateId}`,
            );
            if (response.data && response.data.length > 0) {
                setInvitation(response.data[0]);
            } else {
                setInvitation(null);
            }
        } catch (err) {
            console.error(err);
            // Don't set error visible if just empty, but here 404 is unlikely for list
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitation();
    }, [candidateId, getToken]);

    const handleAction = async (action: "resend" | "revoke") => {
        if (!invitation) return;
        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            if (action === "resend") {
                await client.patch(`/recruiter-candidates/${invitation.id}`, {
                    resend_invitation: true,
                });
            } else {
                // revoke
                await client.patch(`/recruiter-candidates/${invitation.id}`, {
                    cancel_invitation: true,
                });
            }
            await fetchInvitation();
        } catch (err) {
            console.error(err);
            setError(`Failed to ${action} invitation`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="skeleton h-24 w-full mb-6"></div>;

    // Only show if there is an interaction
    if (!invitation) return null;

    const isPending =
        !invitation.consent_given &&
        !invitation.declined_at &&
        invitation.status !== "terminated";
    const isAccepted = invitation.consent_given;
    const isDeclined = !!invitation.declined_at;
    const isRevoked = invitation.status === "terminated";
    const isExpired =
        isPending && new Date(invitation.invitation_expires_at) < new Date();

    let statusBadge = <span className="badge badge-ghost">Unknown</span>;
    if (isAccepted)
        statusBadge = (
            <span className="badge badge-success text-white">Representing</span>
        );
    else if (isDeclined)
        statusBadge = (
            <span className="badge badge-error text-white">Declined</span>
        );
    else if (isRevoked)
        statusBadge = <span className="badge badge-neutral">Revoked</span>;
    else if (isExpired)
        statusBadge = (
            <span className="badge badge-warning text-white">Expired</span>
        );
    else if (isPending)
        statusBadge = (
            <span className="badge badge-info text-white">Invited</span>
        );

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200 mb-6">
            <div className="card-body p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="card-title text-sm font-semibold text-base-content/70 mb-1">
                            Representation Status
                        </h3>
                        <div className="flex gap-2 items-center">
                            {statusBadge}
                            {isPending && !isExpired && (
                                <span className="text-xs text-base-content/50">
                                    Expires{" "}
                                    {new Date(
                                        invitation.invitation_expires_at,
                                    ).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        {isDeclined && invitation.declined_reason && (
                            <p className="text-xs text-error mt-2">
                                Reason: {invitation.declined_reason}
                            </p>
                        )}
                        {error && (
                            <p className="text-xs text-error mt-2">{error}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {(isPending || isExpired) && !isRevoked && (
                            <div className="flex gap-2">
                                <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => handleAction("resend")}
                                    disabled={actionLoading}
                                >
                                    Resend
                                </button>
                                <button
                                    className="btn btn-sm btn-outline btn-error"
                                    onClick={() => handleAction("revoke")}
                                    disabled={actionLoading}
                                >
                                    Revoke
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
