/**
 * Candidate Match Digest Email Template
 * Sent to candidates every Monday with their top job matches from the past week
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, infoCard, badge, divider, alert } from '../components.js';

export interface MatchItem {
    jobTitle: string;
    companyName: string;
    location: string;
    employmentType: string;
    matchScore: number;
    matchTier: 'standard' | 'true';
    topSkills: string[];
}

export interface CandidateMatchDigestData {
    candidateName: string;
    weekStartDate: string;
    weekEndDate: string;
    totalNewMatches: number;
    matches: MatchItem[];
    matchesUrl: string;
    profileUrl: string;
    source?: EmailSource;
}

function formatEmploymentType(type: string): string {
    const map: Record<string, string> = {
        full_time: 'Full-time',
        part_time: 'Part-time',
        contract: 'Contract',
        temporary: 'Temporary',
    };
    return map[type] || type;
}

function matchScoreBadge(score: number, tier: 'standard' | 'true'): string {
    const variant = score >= 80 ? 'success' : score >= 60 ? 'primary' : 'neutral';
    const label = tier === 'true' ? `${score}% True Match` : `${score}% Match`;
    return badge({ text: label, variant });
}

function matchCard(match: MatchItem): string {
    const skills = match.topSkills.length > 0
        ? match.topSkills.slice(0, 3).join(', ')
        : 'General fit';

    return infoCard({
        title: match.jobTitle,
        items: [
            { label: 'Company', value: match.companyName },
            { label: 'Location', value: match.location || 'Remote' },
            { label: 'Type', value: formatEmploymentType(match.employmentType) },
            { label: 'Skills', value: skills },
            { label: 'Score', value: matchScoreBadge(match.matchScore, match.matchTier), highlight: true },
        ],
    });
}

export function candidateMatchDigestEmail(data: CandidateMatchDigestData): string {
    const hasMatches = data.matches.length > 0;

    const matchCards = hasMatches
        ? data.matches.map(matchCard).join('\n')
        : '';

    const content = hasMatches
        ? buildMatchesContent(data, matchCards)
        : buildNoMatchesContent(data);

    const preheader = hasMatches
        ? `${data.totalNewMatches} new job match${data.totalNewMatches === 1 ? '' : 'es'} this week`
        : 'No new matches this week — update your profile to improve results';

    return baseEmailTemplate({
        preheader,
        content,
        source: data.source || 'candidate',
    });
}

function buildMatchesContent(data: CandidateMatchDigestData, matchCards: string): string {
    const matchWord = data.totalNewMatches === 1 ? 'match' : 'matches';

    return `
${heading({ level: 1, text: 'Your weekly job matches' })}

${paragraph(
        `Hi <strong>${data.candidateName}</strong>, we found <strong>${data.totalNewMatches} new ${matchWord}</strong> for you from <strong>${data.weekStartDate}</strong> to <strong>${data.weekEndDate}</strong>.`
    )}

${data.totalNewMatches > data.matches.length
            ? paragraph(`Here are your top ${data.matches.length} matches:`)
            : ''
        }

${matchCards}

${button({
            href: data.matchesUrl,
            text: 'View All Matches →',
            variant: 'primary',
        })}

${divider()}

${paragraph('You receive this digest every Monday. To adjust your email preferences, visit your notification settings.')}
    `.trim();
}

function buildNoMatchesContent(data: CandidateMatchDigestData): string {
    return `
${heading({ level: 1, text: 'Your weekly job matches' })}

${paragraph(
        `Hi <strong>${data.candidateName}</strong>, we didn't find any new matches for you this past week.`
    )}

${alert({
            type: 'info',
            title: 'Improve your match results',
            message: 'Updating your skills, experience, and availability helps our matching engine find better opportunities for you.',
        })}

${paragraph('<strong>Quick ways to improve your matches:</strong>')}

${paragraph('1. <strong>Add new skills</strong> — include technologies and certifications you\'ve picked up.')}
${paragraph('2. <strong>Update your preferences</strong> — refine your desired salary, location, and job type.')}
${paragraph('3. <strong>Refresh your availability</strong> — confirm you\'re open to new opportunities.')}

${button({
            href: data.profileUrl,
            text: 'Update Your Profile →',
            variant: 'primary',
        })}

${divider()}

${paragraph('You receive this digest every Monday. To adjust your email preferences, visit your notification settings.')}
    `.trim();
}
