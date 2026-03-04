/* ─── Mock Data for Match Detail Panel Showcase ───────────────────────── */

import type { PanelStat } from "./panel-header";

/* Factor checks displayed in the factors tab */
export const FACTOR_CHECKS = [
    { key: "salary_overlap", label: "Salary overlap", detail: "78% range overlap" },
    { key: "employment_type_match", label: "Employment type", detail: "Full-Time" },
    { key: "job_level_match", label: "Job level", detail: "Senior" },
    { key: "location_compatible", label: "Location", detail: "Remote" },
    { key: "commute_compatible", label: "Commute", detail: "Compatible" },
    { key: "availability_compatible", label: "Availability", detail: "2 weeks notice" },
] as const;

/* Candidate detail rows */
export const CANDIDATE_ROWS = [
    { icon: "fa-duotone fa-regular fa-briefcase", label: "Current Role", value: "Staff Engineer at DataFlow Inc." },
    { icon: "fa-duotone fa-regular fa-clock", label: "Experience", value: "7 years" },
    { icon: "fa-duotone fa-regular fa-graduation-cap", label: "Education", value: "B.S. Computer Science, UT Austin" },
    { icon: "fa-duotone fa-regular fa-location-dot", label: "Location", value: "Austin, TX" },
    { icon: "fa-duotone fa-regular fa-calendar-check", label: "Availability", value: "2 weeks notice" },
    { icon: "fa-duotone fa-regular fa-dollar-sign", label: "Salary Expectation", value: "$190k - $210k" },
];

/* Job detail rows */
export const JOB_ROWS = [
    { icon: "fa-duotone fa-regular fa-building", label: "Department", value: "Platform Engineering" },
    { icon: "fa-duotone fa-regular fa-users", label: "Team Size", value: "8 engineers" },
    { icon: "fa-duotone fa-regular fa-user-tie", label: "Reports To", value: "VP of Engineering" },
    { icon: "fa-duotone fa-regular fa-dollar-sign", label: "Salary Range", value: "$180k - $220k" },
    { icon: "fa-duotone fa-regular fa-handshake", label: "Split Fee", value: "20%" },
    { icon: "fa-duotone fa-regular fa-shield-check", label: "Guarantee", value: "90 days" },
];

export const data = {
    /* Header */
    candidateName: "Alex Chen",
    candidateInitials: "AC",
    jobTitle: "Senior Full-Stack Engineer",
    companyName: "TechCorp Solutions",
    generatedAt: "Feb 24, 2026",
    generatedAgo: "7 days ago",
    matchTier: "true" as const,

    stats: [
        { label: "Overall", value: "92", icon: "fa-duotone fa-regular fa-bullseye" },
        { label: "Rules", value: "88", icon: "fa-duotone fa-regular fa-list-check" },
        { label: "Skills", value: "85", icon: "fa-duotone fa-regular fa-code" },
        { label: "AI", value: "96", icon: "fa-duotone fa-regular fa-brain" },
    ] satisfies PanelStat[],

    /* Scores */
    matchScore: 92,
    ruleScore: 88,
    skillsScore: 85,
    aiScore: 96,

    /* Match factors */
    factors: {
        salary_overlap: true,
        employment_type_match: true,
        commute_compatible: true,
        job_level_match: true,
        location_compatible: true,
        availability_compatible: true,
        skills_matched: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
        skills_missing: ["Terraform", "GraphQL"],
        skills_match_pct: 71,
        ai_summary:
            "Exceptionally strong candidate. Deep full-stack expertise with 7 years building distributed systems aligns directly with TechCorp's platform architecture. Leadership experience managing a 5-person team demonstrates readiness for senior IC ownership. Minor gaps in Terraform and GraphQL are non-critical given strong fundamentals and rapid learning history.",
        cosine_similarity: 0.89,
    },

    strengths: [
        "7 years building production distributed systems at scale",
        "Led platform migration to microservices for 10K+ user product",
        "Direct experience with entire required stack (TS, React, Node, Postgres, AWS)",
        "Track record of mentoring junior engineers",
    ],
    concerns: [
        "No Terraform experience — infrastructure-as-code gap",
        "Limited GraphQL exposure — primarily REST background",
        "Has not worked at enterprise scale (>1000 engineers)",
    ],
};
