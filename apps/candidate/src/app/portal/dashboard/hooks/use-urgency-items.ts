'use client';

import { useMemo } from 'react';
import type { Application, ActiveRecruiter } from './use-candidate-dashboard-data';

export interface UrgencyItem {
    id: string;
    priority: 0 | 1 | 2;
    level: 'error' | 'warning' | 'info';
    icon: string;
    message: string;
    href: string;
    count?: number;
}

interface UrgencyInput {
    applications: Application[];
    activeRecruiters: ActiveRecruiter[];
    unreadMessages: number;
    unreadNotifications: number;
    profileCompletion: number;
    hasResume: boolean;
}

const MAX_ITEMS = 3;

export function useUrgencyItems({
    applications,
    activeRecruiters,
    unreadMessages,
    unreadNotifications,
    profileCompletion,
    hasResume,
}: UrgencyInput): UrgencyItem[] {
    return useMemo(() => {
        const items: UrgencyItem[] = [];

        // P0 (error): Pending offers
        const offers = applications.filter(a => a.stage === 'offer');
        if (offers.length > 0) {
            items.push({
                id: 'pending-offers',
                priority: 0,
                level: 'error',
                icon: 'fa-trophy',
                message: offers.length === 1
                    ? `You have an offer waiting from ${offers[0].job?.company?.name || 'a company'}`
                    : `You have ${offers.length} offers waiting for review`,
                href: '/portal/applications',
                count: offers.length,
            });
        }

        // P0 (error): Recruiter relationship expiring within 7 days
        const expiring = activeRecruiters.filter(
            r => r.days_until_expiry !== undefined && r.days_until_expiry <= 7
        );
        if (expiring.length > 0) {
            items.push({
                id: 'expiring-recruiters',
                priority: 0,
                level: 'error',
                icon: 'fa-user-clock',
                message: expiring.length === 1
                    ? `Your relationship with ${expiring[0].recruiter_name} expires in ${expiring[0].days_until_expiry} days`
                    : `${expiring.length} recruiter relationships expiring soon`,
                href: '/portal/recruiters',
                count: expiring.length,
            });
        }

        // P1 (warning): Unread messages
        if (unreadMessages > 0) {
            items.push({
                id: 'unread-messages',
                priority: 1,
                level: 'warning',
                icon: 'fa-messages',
                message: `${unreadMessages} unread message${unreadMessages !== 1 ? 's' : ''} from your recruiter${unreadMessages !== 1 ? 's' : ''}`,
                href: '/portal/messages',
                count: unreadMessages,
            });
        }

        // P1 (warning): Stale applications (14+ days at same stage, non-terminal)
        const now = new Date();
        const staleApps = applications.filter(app => {
            if (['rejected', 'withdrawn', 'hired', 'expired', 'draft'].includes(app.stage)) return false;
            if (app.job?.status === 'closed' || app.job?.status === 'filled') return false;
            if (!app.updated_at) return false;
            const daysSinceUpdate = Math.floor(
                (now.getTime() - new Date(app.updated_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysSinceUpdate >= 14;
        });
        if (staleApps.length > 0) {
            items.push({
                id: 'stale-applications',
                priority: 1,
                level: 'warning',
                icon: 'fa-clock',
                message: `${staleApps.length} application${staleApps.length !== 1 ? 's' : ''} haven't moved in 14+ days`,
                href: '/portal/applications',
                count: staleApps.length,
            });
        }

        // P2 (info): Profile incomplete
        if (profileCompletion < 70) {
            items.push({
                id: 'profile-incomplete',
                priority: 2,
                level: 'info',
                icon: 'fa-user-pen',
                message: `Your profile is ${profileCompletion}% complete — a stronger profile gets more recruiter attention`,
                href: '/portal/profile',
            });
        }

        // P2 (info): No resume
        if (!hasResume) {
            items.push({
                id: 'no-resume',
                priority: 2,
                level: 'info',
                icon: 'fa-file-arrow-up',
                message: 'Upload your resume to be matched with opportunities faster',
                href: '/portal/documents',
            });
        }

        // Sort by priority, take top N
        return items
            .sort((a, b) => a.priority - b.priority)
            .slice(0, MAX_ITEMS);
    }, [applications, activeRecruiters, unreadMessages, unreadNotifications, profileCompletion, hasResume]);
}
