"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { StatCardGrid, StatCard } from "@/components/ui";

interface JobStats {
    totalJobs: number;
    remoteFriendly: number;
    newThisWeek: number;
    avgSalary: number | null;
}

const emptyStats: JobStats = {
    totalJobs: 0,
    remoteFriendly: 0,
    newThisWeek: 0,
    avgSalary: null,
};

export default function Stats() {
    const [stats, setStats] = useState<JobStats>(emptyStats);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                const response: any = await apiClient.get("/jobs", {
                    params: { limit: 1000 },
                });

                const jobs = response.data || [];
                if (!cancelled) {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                    const remoteFriendly = jobs.filter(
                        (j: any) => j.open_to_relocation,
                    ).length;

                    const newThisWeek = jobs.filter((j: any) => {
                        if (!j.updated_at) return false;
                        return new Date(j.updated_at) >= oneWeekAgo;
                    }).length;

                    const jobsWithSalary = jobs.filter(
                        (j: any) => j.salary_min && j.salary_max,
                    );
                    const avgSalary =
                        jobsWithSalary.length > 0
                            ? Math.round(
                                  jobsWithSalary.reduce(
                                      (sum: number, j: any) =>
                                          sum +
                                          (j.salary_min + j.salary_max) / 2,
                                      0,
                                  ) / jobsWithSalary.length,
                              )
                            : null;

                    setStats({
                        totalJobs:
                            response.pagination?.total || jobs.length,
                        remoteFriendly,
                        newThisWeek,
                        avgSalary,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch job stats:", error);
                if (!cancelled) setStats(emptyStats);
            }
        };

        void run();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="card bg-base-200">
            <StatCardGrid className="m-2 shadow-lg">
                <StatCard
                    title="Total Jobs"
                    value={stats.totalJobs.toLocaleString()}
                    icon="fa-briefcase"
                    color="accent"
                />
                <StatCard
                    title="Remote Friendly"
                    value={stats.remoteFriendly.toLocaleString()}
                    icon="fa-house-laptop"
                    color="secondary"
                />
                <StatCard
                    title="New This Week"
                    value={stats.newThisWeek.toLocaleString()}
                    icon="fa-calendar-plus"
                    color="info"
                />
                <StatCard
                    title="Avg. Salary"
                    value={
                        stats.avgSalary
                            ? `$${stats.avgSalary.toLocaleString()}`
                            : "---"
                    }
                    icon="fa-dollar-sign"
                    color="success"
                />
            </StatCardGrid>
        </div>
    );
}
