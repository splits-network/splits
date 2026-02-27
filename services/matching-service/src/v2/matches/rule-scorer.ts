/**
 * Layer 1: Rule-Based Scoring Engine
 *
 * Deterministic scoring on hard filters. Pure function — no DB calls.
 * Weights sum to 100.
 */

export interface RuleScoringInput {
    candidate: {
        desired_salary_min?: number | null;
        desired_salary_max?: number | null;
        desired_job_type?: string | null;
        open_to_remote?: boolean | null;
        open_to_relocation?: boolean | null;
        location?: string | null;
        availability?: string | null;
    };
    job: {
        salary_min?: number | null;
        salary_max?: number | null;
        employment_type?: string | null;
        commute_types?: string[] | null;
        job_level?: string | null;
        location?: string | null;
        open_to_relocation?: boolean | null;
    };
    candidate_years_experience?: number | null;
}

export interface RuleScoringResult {
    score: number;
    factors: {
        salary_overlap: boolean;
        salary_overlap_pct: number;
        employment_type_match: boolean;
        commute_compatible: boolean;
        job_level_match: boolean;
        location_compatible: boolean;
        availability_compatible: boolean;
    };
}

const JOB_LEVEL_ORDER = ['entry', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c_suite'];

export function computeRuleScore(input: RuleScoringInput): RuleScoringResult {
    const salaryResult = scoreSalaryOverlap(input.candidate, input.job);
    const employmentResult = scoreEmploymentType(input.candidate, input.job);
    const commuteResult = scoreCommuteCompatibility(input.candidate, input.job);
    const levelResult = scoreJobLevel(input.job, input.candidate_years_experience);
    const locationResult = scoreLocation(input.candidate, input.job);
    const availabilityResult = scoreAvailability(input.candidate);

    const score =
        salaryResult.points +
        employmentResult.points +
        commuteResult.points +
        levelResult.points +
        locationResult.points +
        availabilityResult.points;

    return {
        score: Math.round(Math.min(100, Math.max(0, score)) * 100) / 100,
        factors: {
            salary_overlap: salaryResult.match,
            salary_overlap_pct: salaryResult.pct,
            employment_type_match: employmentResult.match,
            commute_compatible: commuteResult.match,
            job_level_match: levelResult.match,
            location_compatible: locationResult.match,
            availability_compatible: availabilityResult.match,
        },
    };
}

function scoreSalaryOverlap(
    candidate: RuleScoringInput['candidate'],
    job: RuleScoringInput['job'],
): { points: number; match: boolean; pct: number } {
    const MAX_POINTS = 30;
    const cMin = candidate.desired_salary_min;
    const cMax = candidate.desired_salary_max;
    const jMin = job.salary_min;
    const jMax = job.salary_max;

    // Missing data = neutral
    if (!cMin && !cMax) return { points: MAX_POINTS * 0.5, match: false, pct: 0 };
    if (!jMin && !jMax) return { points: MAX_POINTS * 0.5, match: false, pct: 0 };

    const candidateMin = cMin || 0;
    const candidateMax = cMax || candidateMin * 1.5;
    const jobMin = jMin || 0;
    const jobMax = jMax || jobMin * 1.5;

    const overlapMin = Math.max(candidateMin, jobMin);
    const overlapMax = Math.min(candidateMax, jobMax);

    if (overlapMax >= overlapMin) {
        const overlapRange = overlapMax - overlapMin;
        const candidateRange = candidateMax - candidateMin || 1;
        const pct = Math.min(1, overlapRange / candidateRange);
        return { points: MAX_POINTS * pct, match: true, pct: Math.round(pct * 100) };
    }

    // No overlap — penalize based on gap size
    const gap = overlapMin - overlapMax;
    const midpoint = (candidateMin + candidateMax) / 2 || 1;
    const gapPct = Math.min(1, gap / midpoint);
    return { points: MAX_POINTS * Math.max(0, 0.3 - gapPct), match: false, pct: 0 };
}

function scoreEmploymentType(
    candidate: RuleScoringInput['candidate'],
    job: RuleScoringInput['job'],
): { points: number; match: boolean } {
    const MAX_POINTS = 20;
    if (!candidate.desired_job_type || !job.employment_type) {
        return { points: MAX_POINTS * 0.5, match: false };
    }
    const cNorm = candidate.desired_job_type.toLowerCase().replace(/[_-]/g, '');
    const jNorm = job.employment_type.toLowerCase().replace(/[_-]/g, '');
    const match = cNorm === jNorm;
    return { points: match ? MAX_POINTS : 0, match };
}

function scoreCommuteCompatibility(
    candidate: RuleScoringInput['candidate'],
    job: RuleScoringInput['job'],
): { points: number; match: boolean } {
    const MAX_POINTS = 20;
    const commutes = job.commute_types;
    if (!commutes || commutes.length === 0) return { points: MAX_POINTS * 0.5, match: false };

    // Candidate prefers remote
    if (candidate.open_to_remote && commutes.includes('remote')) {
        return { points: MAX_POINTS, match: true };
    }

    // Job offers remote — always compatible
    if (commutes.includes('remote')) return { points: MAX_POINTS, match: true };

    // Candidate willing to relocate for hybrid/in-office
    if (candidate.open_to_relocation) return { points: MAX_POINTS * 0.7, match: true };

    // Same location assumed for hybrid/in-office
    if (candidate.location && job.location) {
        const sameCity = candidate.location.toLowerCase().includes(job.location.toLowerCase()) ||
            job.location.toLowerCase().includes(candidate.location.toLowerCase());
        if (sameCity) return { points: MAX_POINTS, match: true };
    }

    return { points: MAX_POINTS * 0.3, match: false };
}

function scoreJobLevel(
    job: RuleScoringInput['job'],
    yearsExperience?: number | null,
): { points: number; match: boolean } {
    const MAX_POINTS = 15;
    if (!job.job_level) return { points: MAX_POINTS * 0.5, match: false };
    if (!yearsExperience) return { points: MAX_POINTS * 0.5, match: false };

    const levelIndex = JOB_LEVEL_ORDER.indexOf(job.job_level);
    if (levelIndex === -1) return { points: MAX_POINTS * 0.5, match: false };

    // Rough mapping: entry=0-2, mid=2-5, senior=5-8, lead=8-12, manager=10+, director=12+, vp=15+, c_suite=18+
    const expectedYears = [0, 2, 5, 8, 10, 12, 15, 18];
    const expected = expectedYears[levelIndex] || 0;
    const diff = Math.abs(yearsExperience - expected);

    if (diff <= 2) return { points: MAX_POINTS, match: true };
    if (diff <= 4) return { points: MAX_POINTS * 0.5, match: false };
    return { points: 0, match: false };
}

function scoreLocation(
    candidate: RuleScoringInput['candidate'],
    job: RuleScoringInput['job'],
): { points: number; match: boolean } {
    const MAX_POINTS = 15;
    if (!candidate.location || !job.location) return { points: MAX_POINTS * 0.5, match: false };

    const cLoc = candidate.location.toLowerCase();
    const jLoc = job.location.toLowerCase();

    if (cLoc.includes(jLoc) || jLoc.includes(cLoc)) return { points: MAX_POINTS, match: true };
    if (candidate.open_to_relocation || job.open_to_relocation) return { points: MAX_POINTS * 0.7, match: true };
    return { points: 0, match: false };
}

function scoreAvailability(
    candidate: RuleScoringInput['candidate'],
): { points: number; match: boolean } {
    // Availability doesn't have a weight in the 100-point budget.
    // It's a bonus factor tracked in match_factors but doesn't affect score.
    if (!candidate.availability) return { points: 0, match: false };
    const immediate = candidate.availability === 'immediate' || candidate.availability === '2_weeks';
    return { points: 0, match: immediate };
}
