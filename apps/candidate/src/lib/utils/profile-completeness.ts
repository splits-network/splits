export interface CandidateProfileField {
    name: string;
    label: string;
    weight: number;
    category: 'basic' | 'professional' | 'preferences';
}

export const CANDIDATE_PROFILE_FIELDS: CandidateProfileField[] = [
    // Basic Info (30 points)
    { name: 'full_name', label: 'Full Name', weight: 5, category: 'basic' },
    { name: 'email', label: 'Email', weight: 3, category: 'basic' },
    { name: 'phone', label: 'Phone', weight: 4, category: 'basic' },
    { name: 'location', label: 'Location', weight: 6, category: 'basic' },
    { name: 'current_title', label: 'Current Title', weight: 6, category: 'basic' },
    { name: 'current_company', label: 'Current Company', weight: 6, category: 'basic' },

    // Professional Profile (40 points)
    { name: 'linkedin_url', label: 'LinkedIn Profile', weight: 5, category: 'professional' },
    { name: 'github_url', label: 'GitHub Profile', weight: 4, category: 'professional' },
    { name: 'portfolio_url', label: 'Portfolio Website', weight: 4, category: 'professional' },
    { name: 'bio', label: 'Profile Summary', weight: 10, category: 'professional' },
    { name: 'bio_rich', label: 'Detailed Bio', weight: 12, category: 'professional' },
    { name: 'skills', label: 'Skills & Technologies', weight: 10, category: 'professional' },

    // Career Preferences (30 points)
    { name: 'desired_salary_min', label: 'Desired Salary Range', weight: 8, category: 'preferences' },
    { name: 'desired_job_type', label: 'Job Type Preferences', weight: 6, category: 'preferences' },
    { name: 'open_to_remote', label: 'Remote Work Preference', weight: 5, category: 'preferences' },
    { name: 'open_to_relocation', label: 'Relocation Preference', weight: 5, category: 'preferences' },
    { name: 'availability', label: 'Availability to Start', weight: 6, category: 'preferences' },
];

export interface ProfileCompleteness {
    percentage: number;
    tier: 'complete' | 'strong' | 'basic' | 'incomplete';
    missingFields: CandidateProfileField[];
    completedFields: CandidateProfileField[];
    categoryBreakdown: {
        basic: { completed: number; total: number; percentage: number };
        professional: { completed: number; total: number; percentage: number };
        preferences: { completed: number; total: number; percentage: number };
    };
}

export function calculateProfileCompleteness(candidate: any): ProfileCompleteness {
    let totalPoints = 0;
    let earnedPoints = 0;
    const missingFields: CandidateProfileField[] = [];
    const completedFields: CandidateProfileField[] = [];

    const categoryTotals = {
        basic: 0,
        professional: 0,
        preferences: 0,
    };
    const categoryEarned = {
        basic: 0,
        professional: 0,
        preferences: 0,
    };

    for (const field of CANDIDATE_PROFILE_FIELDS) {
        totalPoints += field.weight;
        categoryTotals[field.category] += field.weight;

        // Special handling for bio_rich which is nested in marketplace_profile
        let value;
        if (field.name === 'bio_rich') {
            value = candidate.marketplace_profile?.bio_rich;
        } else {
            value = candidate[field.name];
        }

        const isComplete = value !== null && value !== undefined && value !== '';

        if (isComplete) {
            earnedPoints += field.weight;
            categoryEarned[field.category] += field.weight;
            completedFields.push(field);
        } else {
            missingFields.push(field);
        }
    }

    const percentage = Math.round((earnedPoints / totalPoints) * 100);

    let tier: 'complete' | 'strong' | 'basic' | 'incomplete';
    if (percentage >= 90) tier = 'complete';
    else if (percentage >= 70) tier = 'strong';
    else if (percentage >= 40) tier = 'basic';
    else tier = 'incomplete';

    // Sort missing fields by weight (highest first)
    missingFields.sort((a, b) => b.weight - a.weight);

    return {
        percentage,
        tier,
        missingFields: missingFields.slice(0, 3), // Top 3
        completedFields,
        categoryBreakdown: {
            basic: {
                completed: categoryEarned.basic,
                total: categoryTotals.basic,
                percentage: Math.round((categoryEarned.basic / categoryTotals.basic) * 100),
            },
            professional: {
                completed: categoryEarned.professional,
                total: categoryTotals.professional,
                percentage: Math.round((categoryEarned.professional / categoryTotals.professional) * 100),
            },
            preferences: {
                completed: categoryEarned.preferences,
                total: categoryTotals.preferences,
                percentage: Math.round((categoryEarned.preferences / categoryTotals.preferences) * 100),
            },
        },
    };
}

export const TIER_CONFIG = {
    complete: {
        title: 'Profile Complete!',
        subtitle: 'Maximum visibility to recruiters',
        color: 'success',
        benefits: [
            '3x more likely to get contacted',
            'Priority in recruiter searches',
            'Exclusive opportunity access',
        ],
    },
    strong: {
        title: 'Strong Profile',
        subtitle: 'Almost there! Complete for full impact',
        color: 'info',
        benefits: [
            'Increased visibility',
            'Better job matches',
            'Show up in more searches',
        ],
    },
    basic: {
        title: 'Basic Profile',
        subtitle: 'Add more to attract top recruiters',
        color: 'warning',
        benefits: [
            'Complete = more opportunities',
            'Recruiters prefer full profiles',
            'Stand out from competition',
        ],
    },
    incomplete: {
        title: 'Get Started',
        subtitle: 'Complete your profile to unlock opportunities',
        color: 'error',
        benefits: [
            'Make a great impression',
            'Get matched faster',
            'Access exclusive roles',
        ],
    },
};
