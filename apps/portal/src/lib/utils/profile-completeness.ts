/**
 * Profile completeness calculation utility
 * Helps recruiters understand what they need to complete for better marketplace visibility
 */

import { MarketplaceProfile } from '@splits-network/shared-types';

export interface ProfileField {
    name: string;
    label: string;
    weight: number; // Importance weight (1-10)
    category: 'basic' | 'marketplace' | 'metrics';
}

export const PROFILE_FIELDS: ProfileField[] = [
    // Basic fields (30% total weight)
    { name: 'tagline', label: 'Professional Tagline', weight: 8, category: 'basic' },
    { name: 'location', label: 'Location', weight: 5, category: 'basic' },
    { name: 'years_experience', label: 'Years of Experience', weight: 5, category: 'basic' },
    { name: 'bio', label: 'Professional Bio', weight: 7, category: 'basic' },
    { name: 'industries', label: 'Industries', weight: 5, category: 'basic' },

    // Marketplace fields (50% total weight)
    { name: 'specialties', label: 'Specialties', weight: 8, category: 'marketplace' },
    { name: 'bio_rich', label: 'Detailed Bio', weight: 10, category: 'marketplace' },
    { name: 'marketplace_enabled', label: 'Marketplace Enabled', weight: 10, category: 'marketplace' },
    { name: 'show_success_metrics', label: 'Show Success Metrics', weight: 8, category: 'marketplace' },
    { name: 'show_contact_info', label: 'Show Contact Info', weight: 6, category: 'marketplace' },

    // Future: Metrics visibility (20% total weight)
    // These will be auto-populated but choosing to show them adds value
];

const TOTAL_WEIGHT = PROFILE_FIELDS.reduce((sum, field) => sum + field.weight, 0);

export interface CompletenessResult {
    percentage: number;
    completedFields: string[];
    missingFields: ProfileField[];
    categoryScores: {
        basic: number;
        marketplace: number;
        metrics: number;
    };
    tier: 'incomplete' | 'basic' | 'strong' | 'complete';
}

export function calculateProfileCompleteness(
    recruiter: {
        tagline?: string;
        location?: string;
        years_experience?: number;
        bio?: string;
        industries?: string[];
        specialties?: string[];
        marketplace_enabled?: boolean;
        marketplace_profile?: MarketplaceProfile;
        show_success_metrics?: boolean;
        show_contact_info?: boolean;
    }
): CompletenessResult {
    let completedWeight = 0;
    const completedFields: string[] = [];
    const missingFields: ProfileField[] = [];

    const categoryScores = {
        basic: 0,
        marketplace: 0,
        metrics: 0,
    };

    const categoryTotals = {
        basic: 0,
        marketplace: 0,
        metrics: 0,
    };

    PROFILE_FIELDS.forEach(field => {
        categoryTotals[field.category] += field.weight;

        let isComplete = false;

        switch (field.name) {
            case 'tagline':
                isComplete = !!recruiter.tagline && recruiter.tagline.trim().length > 0;
                break;
            case 'location':
                isComplete = !!recruiter.location && recruiter.location.trim().length > 0;
                break;
            case 'years_experience':
                isComplete = typeof recruiter.years_experience === 'number' && recruiter.years_experience > 0;
                break;
            case 'bio':
                isComplete = !!recruiter.bio && recruiter.bio.trim().length > 20; // Minimum meaningful bio
                break;
            case 'industries':
                isComplete = !!recruiter.industries && recruiter.industries.length > 0;
                break;
            case 'specialties':
                isComplete = !!recruiter.specialties && recruiter.specialties.length > 0;
                break;
            case 'bio_rich':
                isComplete = !!recruiter.marketplace_profile?.bio_rich &&
                    recruiter.marketplace_profile.bio_rich.trim().length > 50; // Richer content
                break;
            case 'marketplace_enabled':
                isComplete = recruiter.marketplace_enabled === true;
                break;
            case 'show_success_metrics':
                isComplete = recruiter.show_success_metrics === true;
                break;
            case 'show_contact_info':
                isComplete = recruiter.show_contact_info === true;
                break;
        }

        if (isComplete) {
            completedWeight += field.weight;
            completedFields.push(field.name);
            categoryScores[field.category] += field.weight;
        } else {
            missingFields.push(field);
        }
    });

    const percentage = Math.round((completedWeight / TOTAL_WEIGHT) * 100);

    // Calculate category percentages
    const categoryPercentages = {
        basic: categoryTotals.basic > 0 ? Math.round((categoryScores.basic / categoryTotals.basic) * 100) : 0,
        marketplace: categoryTotals.marketplace > 0 ? Math.round((categoryScores.marketplace / categoryTotals.marketplace) * 100) : 0,
        metrics: categoryTotals.metrics > 0 ? Math.round((categoryScores.metrics / categoryTotals.metrics) * 100) : 0,
    };

    // Determine tier
    let tier: CompletenessResult['tier'];
    if (percentage < 40) {
        tier = 'incomplete';
    } else if (percentage < 70) {
        tier = 'basic';
    } else if (percentage < 90) {
        tier = 'strong';
    } else {
        tier = 'complete';
    }

    return {
        percentage,
        completedFields,
        missingFields,
        categoryScores: categoryPercentages,
        tier,
    };
}

export function getCompletionTierBadge(tier: CompletenessResult['tier']) {
    switch (tier) {
        case 'complete':
            return {
                label: 'Complete Profile',
                color: 'badge-success',
                icon: 'fa-certificate',
            };
        case 'strong':
            return {
                label: 'Strong Profile',
                color: 'badge-primary',
                icon: 'fa-star',
            };
        case 'basic':
            return {
                label: 'Basic Profile',
                color: 'badge-warning',
                icon: 'fa-user',
            };
        case 'incomplete':
            return {
                label: 'Incomplete Profile',
                color: 'badge-ghost',
                icon: 'fa-circle-exclamation',
            };
    }
}

export function getTopPriorityFields(missingFields: ProfileField[], limit = 3): ProfileField[] {
    return missingFields
        .sort((a, b) => b.weight - a.weight)
        .slice(0, limit);
}

export function getCompletionIncentives(tier: CompletenessResult['tier']): string[] {
    const baseIncentives = [
        'Stand out in marketplace search results',
        'Build trust with candidates faster',
    ];

    switch (tier) {
        case 'incomplete':
            return [
                ...baseIncentives,
                'Complete profiles get 3x more connections',
                'Unlock marketplace visibility',
            ];
        case 'basic':
            return [
                ...baseIncentives,
                'Improve your search ranking',
                'Show your expertise with detailed bio',
            ];
        case 'strong':
            return [
                ...baseIncentives,
                'Earn "Complete Profile" badge',
                'Get featured in top recruiter lists',
            ];
        case 'complete':
            return [
                '✓ Maximum marketplace visibility',
                '✓ Featured in top recruiter lists',
                '✓ Trusted by candidates',
            ];
    }
}