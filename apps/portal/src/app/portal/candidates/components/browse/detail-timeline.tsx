"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

export default function DetailTimeline({
    candidateId,
}: {
    candidateId: string;
}) {
    const { getToken } = useAuth();
    // Using simple mock data structure for MVP, real implementation would fetch history
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real implementation, this would fetch from /history or /activity-log endpoint
        const fetchHistory = async () => {
            setLoading(true);
            try {
                // Fetch fetching logic here
                // const res = await client.get('/candidates/' + candidateId + '/history');
                // setActivities(res.data);
                setActivities([]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [candidateId, getToken]);

    return (
        <section className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="p-4 border-b border-base-200 bg-base-200/30">
                <h3 className="font-semibold flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-clock-rotate-left text-primary"></i>
                    Activity Timeline
                </h3>
            </div>

            <div className="p-6">
                {loading && (
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="skeleton w-8 h-8 rounded-full shrink-0"></div>
                            <div className="flex-1 space-y-2 pt-1">
                                <div className="skeleton h-3 w-3/4"></div>
                                <div className="skeleton h-2 w-1/2"></div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="skeleton w-8 h-8 rounded-full shrink-0"></div>
                            <div className="flex-1 space-y-2 pt-1">
                                <div className="skeleton h-3 w-3/4"></div>
                                <div className="skeleton h-2 w-1/2"></div>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && (
                    <ul className="timeline timeline-compact timeline-vertical">
                        {activities.map((item, index) => (
                            <li key={item.id}>
                                {index !== 0 && <hr className="bg-base-200" />}
                                <div className="timeline-middle">
                                    <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center text-xs text-base-content/60">
                                        <i
                                            className={`fa-duotone fa-regular ${item.icon}`}
                                        ></i>
                                    </div>
                                </div>
                                <div className="timeline-end timeline-box bg-transparent border-0 shadow-none p-0 pl-2 mb-4">
                                    <div className="text-sm font-medium">
                                        {item.text}
                                    </div>
                                    <time className="text-xs text-base-content/50">
                                        {item.date}
                                    </time>
                                </div>
                                {index !== activities.length - 1 && (
                                    <hr className="bg-base-200" />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
