'use client';

interface JobStats {
    totalJobs: number;
    remoteFriendly: number;
    newThisWeek: number;
    avgSalary: number | null;
}

interface JobsStatsProps {
    stats: JobStats | null;
    loading: boolean;
}

export default function JobsStats({ stats, loading }: JobsStatsProps) {
    if (loading && !stats) {
        return (
            <div className="flex justify-center py-6">
                <span className="loading loading-spinner loading-md"></span>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stats bg-base-100 shadow">
                <div className="stat">
                    <div className="stat-figure text-primary">
                        <i className="fa-duotone fa-regular fa-briefcase text-3xl"></i>
                    </div>
                    <div className="stat-title">Open Roles</div>
                    <div className="stat-value">{stats.totalJobs}</div>
                    <div className="stat-desc">Across the network</div>
                </div>
            </div>
            <div className="stats bg-base-100 shadow">
                <div className="stat">
                    <div className="stat-figure text-info">
                        <i className="fa-duotone fa-regular fa-house-laptop text-3xl"></i>
                    </div>
                    <div className="stat-title">Remote Friendly</div>
                    <div className="stat-value">{stats.remoteFriendly}</div>
                    <div className="stat-desc">Open to remote</div>
                </div>
            </div>
            <div className="stats bg-base-100 shadow">
                <div className="stat">
                    <div className="stat-figure text-success">
                        <i className="fa-duotone fa-regular fa-calendar-plus text-3xl"></i>
                    </div>
                    <div className="stat-title">New This Week</div>
                    <div className="stat-value text-success">{stats.newThisWeek}</div>
                    <div className="stat-desc">Fresh postings</div>
                </div>
            </div>
            <div className="stats bg-base-100 shadow">
                <div className="stat">
                    <div className="stat-figure text-secondary">
                        <i className="fa-duotone fa-regular fa-dollar-sign text-3xl"></i>
                    </div>
                    <div className="stat-title">Avg. Salary</div>
                    <div className="stat-value text-secondary">
                        {stats.avgSalary ? `$${stats.avgSalary.toLocaleString()}` : '—'}
                    </div>
                    <div className="stat-desc">Based on postings</div>
                </div>
            </div>
        </div>
    );
}
