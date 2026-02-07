"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StatCard, StatCardGrid } from "@/components/ui/cards";

interface InvitationStats {
    total: number;
    pending: number;
    accepted: number;
    expired: number;
    revoked: number;
}

const emptyStats: InvitationStats = {
    total: 0,
    pending: 0,
    accepted: 0,
    expired: 0,
    revoked: 0,
};

export default function Stats() {
    const { getToken, isLoaded } = useAuth();
    const [stats, setStats] = useState<InvitationStats>(emptyStats);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled || !isLoaded) return;

            const token = await getToken();
            if (!token) {
                if (!cancelled) setStats(emptyStats);
                return;
            }

            try {
                const client = createAuthenticatedClient(token);
                const response: any = await client.get(
                    "/company-invitations",
                    { params: { limit: 1000 } },
                );

                const invitations = response.data || [];
                const pending = invitations.filter(
                    (i: any) => i.status === "pending",
                ).length;
                const accepted = invitations.filter(
                    (i: any) => i.status === "accepted",
                ).length;
                const expired = invitations.filter(
                    (i: any) => i.status === "expired",
                ).length;
                const revoked = invitations.filter(
                    (i: any) => i.status === "revoked",
                ).length;

                if (!cancelled) {
                    setStats({
                        total:
                            response.pagination?.total || invitations.length,
                        pending,
                        accepted,
                        expired,
                        revoked,
                    });
                }
            } catch (error) {
                console.error(
                    "Failed to fetch company invitation stats:",
                    error,
                );
                if (!cancelled) setStats(emptyStats);
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [getToken, isLoaded]);

    return (
        <div className="card bg-base-200">
            <StatCardGrid className="m-2 shadow-lg">
                <StatCard
                    title="Total Invitations"
                    value={stats.total}
                    icon="fa-duotone fa-regular fa-envelopes"
                    color="primary"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon="fa-duotone fa-regular fa-clock"
                    color="info"
                />
                <StatCard
                    title="Accepted"
                    value={stats.accepted}
                    icon="fa-duotone fa-regular fa-circle-check"
                    color="success"
                />
                <StatCard
                    title="Expired"
                    value={stats.expired}
                    icon="fa-duotone fa-regular fa-hourglass-end"
                    color="warning"
                />
            </StatCardGrid>
        </div>
    );
}
