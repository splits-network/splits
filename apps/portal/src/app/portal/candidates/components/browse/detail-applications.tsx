"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

export default function DetailApplications({
    candidateId,
}: {
    candidateId: string;
}) {
    const { getToken } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                // V2 API
                const res = await client.get(
                    `/applications?candidate_id=${candidateId}&include=job`,
                );
                setApplications(res.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, [candidateId, getToken]);

    return (
        <section className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-base-200 bg-base-200/30 flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-briefcase text-accent"></i>
                    Active Applications
                </h3>
                {!loading && (
                    <span className="badge badge-sm">
                        {applications.length}
                    </span>
                )}
            </div>

            <div className="p-0">
                {loading && (
                    <div className="p-4 space-y-3">
                        <div className="skeleton h-12 w-full"></div>
                        <div className="skeleton h-12 w-full"></div>
                    </div>
                )}

                {!loading && applications.length === 0 && (
                    <div className="p-8 text-center text-sm text-base-content/60">
                        No active applications
                    </div>
                )}

                <div className="divide-y divide-base-200">
                    {applications.map((app) => (
                        <div
                            key={app.id}
                            className="p-4 hover:bg-base-50 transition-colors flex justify-between items-center group cursor-pointer"
                        >
                            <div>
                                <div className="font-medium">
                                    {app.job?.title || "Unknown Job"}
                                </div>
                                <div className="text-xs text-base-content/60">
                                    {app.job?.company?.name ||
                                        "Unknown Company"}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="badge badge-sm badge-outline bg-base-100">
                                    {app.status_id || "Applied"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
