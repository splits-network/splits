/**
 * Layer 2: Skills Scoring Engine
 *
 * Two scoring paths:
 * 1. Structured: Direct skill-to-skill matching via job_skills ↔ candidate_skills
 * 2. Legacy: Tokenized matching of resume_metadata.skills[] against job_requirements[].description
 *
 * When structured skills are available, they take priority. Legacy is used as fallback.
 * Pure function — no DB calls.
 */

export interface StructuredSkill {
    id: string;
    name: string;
    slug: string;
}

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
    structured_candidate_skills?: StructuredSkill[];
    structured_job_skills?: Array<{
        skill: StructuredSkill;
        is_required: boolean;
    }>;
}

export interface SkillsScoringResult {
    score: number;
    matched_skills: string[];
    missing_mandatory: string[];
    missing_preferred: string[];
    match_pct: number;
    skills_source: 'structured' | 'legacy';
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
    const { candidate_skills, job_requirements, structured_candidate_skills, structured_job_skills } = input;

    // Use structured matching when both sides have structured skills
    const hasStructuredCandidate = structured_candidate_skills && structured_candidate_skills.length > 0;
    const hasStructuredJob = structured_job_skills && structured_job_skills.length > 0;

    if (hasStructuredCandidate && hasStructuredJob) {
        return computeStructuredScore(structured_candidate_skills!, structured_job_skills!);
    }

    // Fallback: legacy tokenized matching
    return computeLegacyScore(candidate_skills, job_requirements);
}

function computeStructuredScore(
    candidateSkills: StructuredSkill[],
    jobSkills: Array<{ skill: StructuredSkill; is_required: boolean }>,
): SkillsScoringResult {
    if (!candidateSkills.length || !jobSkills.length) {
        return { score: 50, matched_skills: [], missing_mandatory: [], missing_preferred: [], match_pct: 0, skills_source: 'structured' };
    }

    const candidateSlugSet = new Set(candidateSkills.map(s => s.slug));

    const required = jobSkills.filter(js => js.is_required);
    const preferred = jobSkills.filter(js => !js.is_required);

    const requiredMatched = required.filter(js => candidateSlugSet.has(js.skill.slug));
    const preferredMatched = preferred.filter(js => candidateSlugSet.has(js.skill.slug));

    const requiredScore = required.length > 0
        ? (requiredMatched.length / required.length) * 60
        : 30;
    const preferredScore = preferred.length > 0
        ? (preferredMatched.length / preferred.length) * 40
        : 20;

    const matchedNames = [
        ...requiredMatched.map(js => js.skill.name),
        ...preferredMatched.map(js => js.skill.name),
    ];

    const totalSkills = required.length + preferred.length;
    const totalMatched = requiredMatched.length + preferredMatched.length;

    return {
        score: Math.round(Math.min(100, requiredScore + preferredScore) * 100) / 100,
        matched_skills: [...new Set(matchedNames)],
        missing_mandatory: required.filter(js => !candidateSlugSet.has(js.skill.slug)).map(js => js.skill.name),
        missing_preferred: preferred.filter(js => !candidateSlugSet.has(js.skill.slug)).map(js => js.skill.name),
        match_pct: totalSkills > 0 ? Math.round((totalMatched / totalSkills) * 100) : 0,
        skills_source: 'structured',
    };
}

function computeLegacyScore(
    candidate_skills: SkillsScoringInput['candidate_skills'],
    job_requirements: SkillsScoringInput['job_requirements'],
): SkillsScoringResult {
    if (!candidate_skills.length || !job_requirements.length) {
        return { score: 50, matched_skills: [], missing_mandatory: [], missing_preferred: [], match_pct: 0, skills_source: 'legacy' };
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
        skills_source: 'legacy',
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
