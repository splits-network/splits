"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Firm, FirmMember, FirmInvitation } from "../../types";
import { FirmDetail } from "./firm-detail-panel";

/* --- Detail Loading Wrapper ----------------------------------------------- */

export function FirmDetailLoader({
    firmId,
    firm,
    onClose,
    onRefresh,
}: {
    firmId: string;
    firm?: Firm;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [loadedFirm, setLoadedFirm] = useState<Firm | null>(firm || null);
    const [members, setMembers] = useState<FirmMember[]>([]);
    const [invitations, setInvitations] = useState<FirmInvitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDetail = useCallback(
        async (
            id: string,
            firmProp: Firm | undefined,
            signal?: { cancelled: boolean },
        ) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);

                // Fetch firm if not provided
                if (!firmProp) {
                    const firmRes = await client.get<{ data: Firm }>(
                        `/firms/${id}`,
                    );
                    if (!signal?.cancelled) setLoadedFirm(firmRes.data);
                }

                // Fetch members and invitations in parallel
                const [membersRes, invitationsRes] = await Promise.all([
                    client.get(`/firms/${id}/members`),
                    client.get(`/firms/${id}/invitations`),
                ]);
                if (!signal?.cancelled) {
                    setMembers(membersRes.data || []);
                    setInvitations(invitationsRes.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch firm details:", err);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);

        fetchDetail(firmId, firm, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });

        return () => {
            signal.cancelled = true;
        };
    }, [firmId, refreshKey, fetchDetail, firm]);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
        onRefresh?.();
    }, [onRefresh]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <span className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                        Loading firm...
                    </span>
                </div>
            </div>
        );
    }

    const resolvedFirm = firm || loadedFirm;
    if (!resolvedFirm) return null;

    return (
        <FirmDetail
            firm={resolvedFirm}
            members={members}
            invitations={invitations}
            onClose={onClose}
            onRefresh={handleRefresh}
        />
    );
}
