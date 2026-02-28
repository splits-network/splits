'use client';

import React from 'react';
import { LineChart, BarChart, PieChart, AreaChart } from '@splits-network/shared-charts';
import type { TimePeriod } from '@/hooks/use-admin-stats';

// Sample data — replaced with real API data once endpoints stabilize
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

const userGrowth = MONTHS.map((x, i) => ({ x, y: 120 + i * 18 + Math.floor(Math.random() * 15) }));
const jobPostings = MONTHS.map((label, i) => ({ label, value: 45 + i * 8 + Math.floor(Math.random() * 10) }));
const applicationVolume = MONTHS.map((x, i) => ({ x, y: 200 + i * 25 + Math.floor(Math.random() * 30) }));
const revenueData = MONTHS.map((x, i) => ({ x, y: 8000 + i * 1200 + Math.floor(Math.random() * 800) }));

const recruiterStatus = [
    { label: 'Active', value: 312 },
    { label: 'Pending', value: 28 },
    { label: 'Suspended', value: 14 },
    { label: 'Inactive', value: 67 },
];

const applicationStatus = [
    { label: 'Applied', value: 820 },
    { label: 'Screening', value: 340 },
    { label: 'Interview', value: 180 },
    { label: 'Offer', value: 60 },
    { label: 'Hired', value: 42 },
];

const recruiterPieData = recruiterStatus.map((d) => ({ name: d.label, value: d.value }));
const fraudByType = [
    { name: 'Fake Jobs', value: 18 },
    { name: 'Identity', value: 12 },
    { name: 'Payment', value: 8 },
    { name: 'Other', value: 5 },
];
const billingPie = [
    { name: 'Escrow', value: 145000 },
    { name: 'Payouts', value: 87000 },
    { name: 'Fees', value: 23000 },
];

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    sample?: boolean;
}

function ChartCard({ title, children, sample = true }: ChartCardProps) {
    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-4 gap-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{title}</h3>
                    {sample && (
                        <div className="badge badge-ghost badge-xs text-base-content/40">
                            Sample Data
                        </div>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
}

interface DashboardChartsProps {
    timePeriod: TimePeriod;
}

export function DashboardCharts({ timePeriod: _timePeriod }: DashboardChartsProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* Row 1: Growth trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="User Growth">
                    <AreaChart data={userGrowth} height={220} smooth gradient />
                </ChartCard>
                <ChartCard title="Revenue Trend">
                    <AreaChart data={revenueData} height={220} smooth gradient />
                </ChartCard>
            </div>

            {/* Row 2: Volume charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Job Postings">
                    <BarChart data={jobPostings} height={220} />
                </ChartCard>
                <ChartCard title="Application Volume">
                    <LineChart data={applicationVolume} height={220} smooth />
                </ChartCard>
            </div>

            {/* Row 3: Distribution charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ChartCard title="Recruiter Status">
                    <PieChart data={recruiterPieData} donut height={220} showLabels={false} />
                </ChartCard>
                <ChartCard title="Fraud by Type">
                    <PieChart data={fraudByType} donut height={220} showLabels={false} />
                </ChartCard>
                <ChartCard title="Billing Distribution">
                    <PieChart data={billingPie} donut height={220} showLabels={false} />
                </ChartCard>
            </div>

            {/* Row 4: Application funnel + Recruiter bar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Application Funnel">
                    <BarChart data={applicationStatus} horizontal height={220} />
                </ChartCard>
                <ChartCard title="Recruiter Activity (Top Accounts)">
                    <BarChart
                        data={[
                            { label: 'Acme Corp', value: 34 },
                            { label: 'TechHire', value: 28 },
                            { label: 'TopTalent', value: 22 },
                            { label: 'RecruitPro', value: 19 },
                            { label: 'HireNow', value: 15 },
                        ]}
                        height={220}
                    />
                </ChartCard>
            </div>

            {/* Row 5: Multi-series comparison */}
            <div className="grid grid-cols-1 gap-4">
                <ChartCard title="Applications vs Hires (Multi-Period)">
                    <LineChart
                        series={[
                            { name: 'Applications', data: MONTHS.map((_, i) => 200 + i * 25) },
                            { name: 'Interviews', data: MONTHS.map((_, i) => 80 + i * 10) },
                            { name: 'Hires', data: MONTHS.map((_, i) => 20 + i * 4) },
                        ]}
                        xLabels={MONTHS}
                        height={240}
                        showLegend
                        smooth
                    />
                </ChartCard>
            </div>
        </div>
    );
}
