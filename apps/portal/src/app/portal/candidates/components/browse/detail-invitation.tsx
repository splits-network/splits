"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { RepresentationStatus } from "@/components/representation-status";
import { RecruiterCandidateWithCandidate } from "@splits-network/shared-types";

interface DetailInvitationProps {
    candidateId: string;
}

export default function DetailInvitation({
    candidateId,
}: DetailInvitationProps) {
    const { getToken } = useAuth();
    const [invitation, setInvitation] =
        useState<RecruiterCandidateWithCandidate | null>(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <RepresentationStatus
            invitation={invitation}
            loading={loading}
            onUpdate={fetchInvitation}
            className="mb-6"
        />
    );
}
