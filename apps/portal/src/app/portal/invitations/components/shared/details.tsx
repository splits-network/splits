"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@splits-network/shared-ui";
import { RepresentationStatus } from "@/components/representation-status";
import {
    Invitation,
    getDisplayStatus,
    formatInvitationDate,
} from "../../types";
import { useFilter } from "../../contexts/filter-context";

interface DetailsProps {
    itemId: string;
    onRefresh?: () => void;
}

export default function Details({ itemId, onRefresh }: DetailsProps) {
    const { getToken } = useAuth();
    const { refresh } = useFilter();
    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const response = await client.get(
                `/recruiter-candidates/${itemId}`,
                { params: { include: "candidate" } },
            );
            setInvitation(response.data);
        } catch (err) {
            console.error("Failed to fetch invitation detail:", err);
        } finally {
            setLoading(false);
        }
    }, [itemId, getToken]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleUpdate = useCallback(() => {
        fetchDetail();
        refresh();
        onRefresh?.();
    }, [fetchDetail, refresh, onRefresh]);

    if (loading && !invitation) {
        return (
            <div className="p-6">
                <LoadingState message="Loading invitation details..." />
            </div>
        );
    }

    if (!invitation) {
        return (
            <div className="p-6 text-center text-base-content/40">
                <p>Invitation not found</p>
            </div>
        );
    }

    const candidate = invitation.candidate;
    const status = getDisplayStatus(invitation);
    const isDeclined = !!invitation.declined_at;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-2xl font-bold">
                        {candidate?.full_name || "Unknown Candidate"}
                    </h3>
                    <p className="text-base-content/60 mt-1">
                        {candidate?.email || "No email"}
                    </p>
                </div>
                <div className={`badge ${status.badgeClass} badge-lg`}>
                    {status.label}
                </div>
            </div>

            {/* Representation Status */}
            <RepresentationStatus
                invitation={invitation}
                onResend={(id: string) => handleUpdate()}
                onCancel={() => handleUpdate()}
                resendingId={null}
                cancellingId={null}
                onUpdate={handleUpdate}
            />

            {/* Invitation Details */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h4 className="card-title text-lg">
                        <i className="fa-duotone fa-regular fa-envelope mr-2" />
                        Invitation Details
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium text-base-content/70">
                                Invited Date
                            </div>
                            <div>
                                {formatInvitationDate(invitation.invited_at)}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-base-content/70">
                                Expires Date
                            </div>
                            <div>
                                {formatInvitationDate(
                                    invitation.invitation_expires_at,
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-base-content/70">
                                Declined Date
                            </div>
                            <div>
                                {formatInvitationDate(invitation.declined_at)}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-base-content/70">
                                Status
                            </div>
                            <div
                                className={`badge ${status.badgeClass}`}
                            >
                                {status.label}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Candidate Information */}
            {candidate && (
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h4 className="card-title text-lg">
                            <i className="fa-duotone fa-regular fa-user mr-2" />
                            Candidate Information
                        </h4>

                        <div className="space-y-3">
                            <div>
                                <div className="text-sm font-medium text-base-content/70">
                                    Full Name
                                </div>
                                <div>{candidate.full_name}</div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-base-content/70">
                                    Email
                                </div>
                                <div>{candidate.email}</div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-base-content/70">
                                    Phone
                                </div>
                                <div>
                                    {candidate.phone || "Not provided"}
                                </div>
                            </div>

                            {candidate.location && (
                                <div>
                                    <div className="text-sm font-medium text-base-content/70">
                                        Location
                                    </div>
                                    <div>{candidate.location}</div>
                                </div>
                            )}

                            {candidate.current_title && (
                                <div>
                                    <div className="text-sm font-medium text-base-content/70">
                                        Current Title
                                    </div>
                                    <div>{candidate.current_title}</div>
                                </div>
                            )}

                            {candidate.current_company && (
                                <div>
                                    <div className="text-sm font-medium text-base-content/70">
                                        Current Company
                                    </div>
                                    <div>{candidate.current_company}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Decline Reason */}
            {isDeclined && invitation.declined_reason && (
                <div className="card bg-error/10 border border-error/20">
                    <div className="card-body">
                        <h4 className="card-title text-lg text-error">
                            <i className="fa-duotone fa-regular fa-times-circle mr-2" />
                            Decline Reason
                        </h4>
                        <p className="text-error/80">
                            {invitation.declined_reason}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
