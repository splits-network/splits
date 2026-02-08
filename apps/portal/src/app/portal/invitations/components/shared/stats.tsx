"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StatCard, StatCardGrid } from "@/components/ui/cards";
import { InvitationsTrendsChart } from "@/components/charts/invitations-trends-chart";

interface InvitationStats {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
}

interface StatsInvitation {
    id: string;
    consent_given: boolean;
    declined_at: string | null;
}

const emptyStats: InvitationStats = {
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
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
                const response = await client.get("/recruiter-candidates", {
                    params: { limit: 1000 },
                });

                const invitations: StatsInvitation[] = response.data || [];
                const pending = invitations.filter(
                    (inv) => !inv.consent_given && !inv.declined_at,
                ).length;
                const accepted = invitations.filter(
                    (inv) => inv.consent_given,
                ).length;
                const declined = invitations.filter(
                    (inv) => inv.declined_at != null,
                ).length;

                if (!cancelled) {
                    setStats({
                        total:
                            response.pagination?.total || invitations.length,
                        pending,
                        accepted,
                        declined,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch invitation stats:", error);
                if (!cancelled) setStats(emptyStats);
            }
        };

        void run();
        return () => {
            cancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]);

    return (
        <div className="card bg-base-200">
            <StatCardGrid className="m-2 shadow-lg">
                <StatCard
                    title="Total Invitations"
                    value={stats.total}
                    icon="fa-duotone fa-regular fa-envelopes"
                    description="Total candidate invitations"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon="fa-duotone fa-regular fa-hourglass-half"
                    color="info"
                    description="Awaiting response"
                />
                <StatCard
                    title="Accepted"
                    value={stats.accepted}
                    icon="fa-duotone fa-regular fa-check"
                    color="success"
                    description="Candidates joined"
                />
                <StatCard
                    title="Declined"
                    value={stats.declined}
                    icon="fa-duotone fa-regular fa-xmark"
                    color="error"
                    description="Not interested"
                />
            </StatCardGrid>
            <div className="p-4 pt-0">
                <InvitationsTrendsChart />
            </div>
        </div>
    );
}
