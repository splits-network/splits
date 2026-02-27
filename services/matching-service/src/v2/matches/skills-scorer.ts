/**
 * Layer 2: Skills Scoring Engine
 *
 * Matches candidate resume_metadata.skills[] against job_requirements[].description.
 * Pure function — no DB calls.
 */

export interface SkillsScoringInput {
    candidate_skills: Array<{
        name: string;
        category?: string;
        proficiency?: string;
    }>;
    job_requirements: Array<{
        description: string;
        requirement_type: 'mandatory' | 'preferred';
    }>;
}

export interface SkillsScoringResult {
    score: number;
    matched_skills: string[];
    missing_mandatory: string[];
    missing_preferred: string[];
    match_pct: number;
}

const NOISE_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'of', 'in', 'to', 'for', 'with',
    'is', 'are', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'shall', 'can', 'need',
    'experience', 'years', 'year', 'ability', 'strong', 'excellent',
    'good', 'knowledge', 'understanding', 'familiar', 'proficient',
    'required', 'preferred', 'minimum', 'at', 'least', 'plus',
]);

export function computeSkillsScore(input: SkillsScoringInput): SkillsScoringResult {
    const { candidate_skills, job_requirements } = input;

    if (!candidate_skills.length || !job_requirements.length) {
        return { score: 50, matched_skills: [], missing_mandatory: [], missing_preferred: [], match_pct: 0 };
    }

    // Build normalized candidate skill set
    const skillNames = new Set(candidate_skills.map(s => s.name.toLowerCase().trim()));
    // Also build n-grams for compound skill matching (e.g. "machine learning")
    const skillNamesArray = candidate_skills.map(s => s.name.toLowerCase().trim());

    const mandatory = job_requirements.filter(r => r.requirement_type === 'mandatory');
    const preferred = job_requirements.filter(r => r.requirement_type === 'preferred');

    const mandatoryResults = mandatory.map(r => matchRequirement(r.description, skillNames, skillNamesArray));
    const preferredResults = preferred.map(r => matchRequirement(r.description, skillNames, skillNamesArray));

    const mandatoryMatched = mandatoryResults.filter(r => r.matched);
    const preferredMatched = preferredResults.filter(r => r.matched);

    // Score: mandatory = 60 points, preferred = 40 points
    const mandatoryScore = mandatory.length > 0
        ? (mandatoryMatched.length / mandatory.length) * 60
        : 30; // No mandatory reqs = neutral
    const preferredScore = preferred.length > 0
        ? (preferredMatched.length / preferred.length) * 40
        : 20; // No preferred reqs = neutral

    const allMatched = [
        ...mandatoryMatched.flatMap(r => r.matchedKeywords),
        ...preferredMatched.flatMap(r => r.matchedKeywords),
    ];
    const uniqueMatched = [...new Set(allMatched)];

    const totalReqs = mandatory.length + preferred.length;
    const totalMatched = mandatoryMatched.length + preferredMatched.length;

    return {
        score: Math.round(Math.min(100, mandatoryScore + preferredScore) * 100) / 100,
        matched_skills: uniqueMatched,
        missing_mandatory: mandatoryResults.filter(r => !r.matched).map(r => r.description),
        missing_preferred: preferredResults.filter(r => !r.matched).map(r => r.description),
        match_pct: totalReqs > 0 ? Math.round((totalMatched / totalReqs) * 100) : 0,
    };
}

function matchRequirement(
    description: string,
    skillSet: Set<string>,
    skillArray: string[],
): { matched: boolean; matchedKeywords: string[]; description: string } {
    const keywords = tokenizeRequirement(description);
    const matchedKeywords: string[] = [];

    for (const keyword of keywords) {
        // Direct match
        if (skillSet.has(keyword)) {
            matchedKeywords.push(keyword);
            continue;
        }

        // Substring match — check if any candidate skill contains this keyword
        const partialMatch = skillArray.find(
            s => s.includes(keyword) || keyword.includes(s),
        );
        if (partialMatch) {
            matchedKeywords.push(partialMatch);
        }
    }

    return {
        matched: matchedKeywords.length > 0,
        matchedKeywords: [...new Set(matchedKeywords)],
        description,
    };
}

function tokenizeRequirement(description: string): string[] {
    return description
        .toLowerCase()
        .replace(/[^a-z0-9#+.\s-]/g, ' ')
        .split(/[\s,;/]+/)
        .map(t => t.trim())
        .filter(t => t.length >= 2 && !NOISE_WORDS.has(t));
}
