'use client';

import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { ContentCard, EmptyState } from '@/components/ui/cards';
import { ChartLoadingState } from '@splits-network/shared-ui';
import { PlatformStats } from '../../hooks/use-platform-stats';

ChartJS.register(ArcElement, Tooltip);

interface RoleDistributionDoughnutProps {
    stats: PlatformStats;
    loading: boolean;
    refreshKey?: number;
}

function getThemeColors() {
    if (typeof window === 'undefined') {
        return { primary: '#233876', secondary: '#0f9d8a', text: '#18181b', grid: '#e4e4e7', surface: '#ffffff', accent: '#db2777', warning: '#d97706' };
    }
    const style = getComputedStyle(document.documentElement);
    const read = (prop: string, fallback: string) =>
        style.getPropertyValue(prop).trim() || fallback;
    return {
        primary: read('--color-primary', '#233876'),
        secondary: read('--color-secondary', '#0f9d8a'),
        text: read('--color-base-content', '#18181b'),
        grid: read('--color-base-300', '#e4e4e7'),
        surface: read('--color-base-100', '#ffffff'),
        accent: read('--color-accent', '#db2777'),
        warning: read('--color-warning', '#d97706'),
    };
}

export default function RoleDistributionDoughnut({ stats, loading, refreshKey }: RoleDistributionDoughnutProps) {
    const [colors, setColors] = useState(getThemeColors());

    useEffect(() => {
        const update = () => setColors(getThemeColors());
        update();

        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        return () => observer.disconnect();
    }, []);

    if (loading) {
        return (
            <ContentCard title="Role distribution" icon="fa-chart-pie" className="bg-base-200">
                <ChartLoadingState height={200} />
            </ContentCard>
        );
    }

    const { job_statuses } = stats;
    const total = job_statuses.active + job_statuses.closed + job_statuses.expired + job_statuses.draft;

    if (total === 0) {
        return (
            <ContentCard title="Role distribution" icon="fa-chart-pie" className="bg-base-200">
                <EmptyState
                    icon="fa-chart-pie"
                    title="No roles yet"
                    description="Job distribution will appear once companies post roles."
                    size="sm"
                />
            </ContentCard>
        );
    }

    const chartData = {
        labels: ['Active', 'Closed', 'Expired', 'Draft'],
        datasets: [{
            data: [job_statuses.active, job_statuses.closed, job_statuses.expired, job_statuses.draft],
            backgroundColor: [colors.primary, colors.secondary, colors.warning, colors.grid],
            borderColor: colors.surface,
            borderWidth: 2,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: colors.surface,
                titleColor: colors.text,
                bodyColor: colors.text,
                borderColor: `${colors.text}20`,
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
            },
        },
    };

    return (
        <ContentCard title="Role distribution" icon="fa-chart-pie" className="bg-base-200">
            <div className="relative h-48">
                <Doughnut key={`role-dist-${refreshKey}`} data={chartData} options={options} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <div className="text-2xl font-bold tabular-nums">{total.toLocaleString()}</div>
                        <div className="text-xs text-base-content/60">Total roles</div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
                {[
                    { label: 'Active', count: job_statuses.active, color: colors.primary },
                    { label: 'Closed', count: job_statuses.closed, color: colors.secondary },
                    { label: 'Expired', count: job_statuses.expired, color: colors.warning },
                    { label: 'Draft', count: job_statuses.draft, color: colors.grid },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                        <span className="text-base-content/70">{item.label}</span>
                        <span className="font-semibold tabular-nums ml-auto">{item.count.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </ContentCard>
    );
}
