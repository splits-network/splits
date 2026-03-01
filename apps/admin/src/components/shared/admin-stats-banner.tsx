'use client';

export type StatCard = {
    label: string;
    value: number | string;
    icon?: string;
    color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
};

type AdminStatsBannerProps = {
    stats: StatCard[];
    loading?: boolean;
};

const COLOR_MAP: Record<string, string> = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
};

export function AdminStatsBanner({ stats, loading }: AdminStatsBannerProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="stat bg-base-100 shadow rounded-lg p-4">
                        <div className="skeleton h-3 w-20 mb-2" />
                        <div className="skeleton h-7 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div key={stat.label} className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm flex items-center gap-2">
                        {stat.icon && (
                            <i className={`${stat.icon} ${stat.color ? COLOR_MAP[stat.color] : 'text-base-content/50'}`} />
                        )}
                        {stat.label}
                    </div>
                    <div className={`stat-value text-2xl ${stat.color ? COLOR_MAP[stat.color] : ''}`}>
                        {stat.value}
                    </div>
                </div>
            ))}
        </div>
    );
}
