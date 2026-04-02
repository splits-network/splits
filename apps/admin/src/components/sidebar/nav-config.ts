import type { AdminCounts } from '@/hooks/use-realtime-counts';

export type NavItem = {
    href: string;
    label: string;
    icon: string;
    badgeKey?: keyof AdminCounts;
    keywords?: string[];
};

export type NavSection = {
    id: string;
    title: string;
    icon: string;
    items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
    {
        id: 'overview',
        title: 'Overview',
        icon: 'fa-house-chimney',
        items: [
            { href: '/secure', label: 'Dashboard', icon: 'fa-gauge-high' },
        ],
    },
    {
        id: 'operations',
        title: 'Operations',
        icon: 'fa-briefcase',
        items: [
            {
                href: '/secure/recruiters',
                label: 'Recruiters',
                icon: 'fa-user-tie',
                badgeKey: 'pendingRecruiters',
                keywords: ['recruiter', 'pending', 'approval'],
            },
            { href: '/secure/assignments', label: 'Assignments', icon: 'fa-handshake', keywords: ['assignment', 'split'] },
            { href: '/secure/placements', label: 'Placements', icon: 'fa-trophy', keywords: ['placement', 'hire'] },
            {
                href: '/secure/applications',
                label: 'Applications',
                icon: 'fa-file-user',
                badgeKey: 'totalApplications',
                keywords: ['application', 'candidate'],
            },
            {
                href: '/secure/notifications',
                label: 'Notifications',
                icon: 'fa-bell',
                badgeKey: 'activeNotifications',
                keywords: ['notification', 'alert'],
            },
        ],
    },
    {
        id: 'directory',
        title: 'Directory',
        icon: 'fa-address-book',
        items: [
            {
                href: '/secure/users',
                label: 'Users',
                icon: 'fa-users',
                badgeKey: 'totalUsers',
                keywords: ['user', 'account', 'member'],
            },
            { href: '/secure/organizations', label: 'Organizations', icon: 'fa-building', keywords: ['org', 'organization'] },
            { href: '/secure/firms', label: 'Firms', icon: 'fa-building-columns', keywords: ['firm', 'agency', 'marketplace', 'approval'] },
            { href: '/secure/companies', label: 'Companies', icon: 'fa-city', keywords: ['company', 'employer'] },
            {
                href: '/secure/jobs',
                label: 'Jobs',
                icon: 'fa-briefcase-blank',
                badgeKey: 'totalJobs',
                keywords: ['job', 'position', 'role'],
            },
            { href: '/secure/candidates', label: 'Candidates', icon: 'fa-person-circle-check', keywords: ['candidate', 'talent'] },
        ],
    },
    {
        id: 'intelligence',
        title: 'Intelligence',
        icon: 'fa-brain-circuit',
        items: [
            { href: '/secure/matches', label: 'Matches', icon: 'fa-link-horizontal', keywords: ['match', 'ai', 'suggestion'] },
            { href: '/secure/automation', label: 'Automation Rules', icon: 'fa-robot', keywords: ['automation', 'rule', 'workflow'] },
            {
                href: '/secure/fraud',
                label: 'Fraud Detection',
                icon: 'fa-shield-exclamation',
                badgeKey: 'activeFraud',
                keywords: ['fraud', 'risk', 'security'],
            },
            { href: '/secure/decision-log', label: 'Decision Log', icon: 'fa-list-check', keywords: ['decision', 'log', 'audit'] },
            { href: '/secure/ai-usage', label: 'AI Models', icon: 'fa-microchip-ai', keywords: ['ai', 'model', 'usage', 'cost', 'openai', 'anthropic'] },
            { href: '/secure/support-chat', label: 'Support Chat', icon: 'fa-headset', keywords: ['support', 'chat', 'help', 'visitor'] },
            { href: '/secure/support-tickets', label: 'Support Tickets', icon: 'fa-ticket', keywords: ['support', 'ticket', 'help', 'offline'] },
            { href: '/secure/chat', label: 'Chat Moderation', icon: 'fa-comments', keywords: ['chat', 'moderation', 'message'] },
            { href: '/secure/ownership', label: 'Ownership Audit', icon: 'fa-magnifying-glass-chart', keywords: ['ownership', 'audit'] },
            { href: '/secure/reputation', label: 'Reputation', icon: 'fa-star', keywords: ['reputation', 'rating', 'score'] },
        ],
    },
    {
        id: 'finance',
        title: 'Finance',
        icon: 'fa-money-bill-wave',
        items: [
            {
                href: '/secure/payouts',
                label: 'Payouts',
                icon: 'fa-money-check-dollar',
                badgeKey: 'pendingPayouts',
                keywords: ['payout', 'payment', 'transfer'],
            },
            {
                href: '/secure/payouts/escrow',
                label: 'Escrow Holds',
                icon: 'fa-vault',
                badgeKey: 'activeEscrow',
                keywords: ['escrow', 'hold', 'funds'],
            },
            { href: '/secure/billing-profiles', label: 'Billing Profiles', icon: 'fa-credit-card', keywords: ['billing', 'invoice', 'payment'] },
        ],
    },
    {
        id: 'content',
        title: 'Content & Settings',
        icon: 'fa-gear',
        items: [
            { href: '/secure/content/pages', label: 'Pages', icon: 'fa-file-lines', keywords: ['page', 'content', 'cms'] },
            { href: '/secure/content/navigation', label: 'Navigation', icon: 'fa-sitemap', keywords: ['nav', 'menu', 'link'] },
            { href: '/secure/content/images', label: 'Images', icon: 'fa-images', keywords: ['image', 'media', 'upload'] },
            { href: '/secure/metrics', label: 'Metrics', icon: 'fa-chart-mixed', keywords: ['metric', 'analytics', 'stats'] },
            { href: '/secure/activity', label: 'Activity Log', icon: 'fa-clock-rotate-left', keywords: ['activity', 'log', 'history'] },
            { href: '/secure/settings', label: 'Platform Settings', icon: 'fa-sliders', keywords: ['settings', 'config', 'platform'] },
        ],
    },
];
