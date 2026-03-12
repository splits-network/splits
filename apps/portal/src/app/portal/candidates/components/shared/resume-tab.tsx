"use client";

import type { Candidate, ResumeMetadata } from "../../types";

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function formatDateRange(start?: string | null, end?: string | null, isCurrent?: boolean): string {
    const fmt = (d: string) => {
        const [y, m] = d.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return m ? `${months[parseInt(m, 10) - 1]} ${y}` : y;
    };
    const s = start ? fmt(start) : "";
    const e = isCurrent ? "Present" : end ? fmt(end) : "";
    if (s && e) return `${s} — ${e}`;
    if (s) return s;
    if (e) return e;
    return "";
}

function proficiencyWidth(p?: string): string {
    switch (p) {
        case "expert": return "w-full";
        case "advanced": return "w-3/4";
        case "intermediate": return "w-1/2";
        case "beginner": return "w-1/4";
        default: return "w-1/2";
    }
}

function degreeLabel(d?: string): string {
    switch (d) {
        case "doctorate": return "Doctorate";
        case "masters": return "Master's";
        case "bachelors": return "Bachelor's";
        case "associates": return "Associate's";
        default: return d || "";
    }
}

/* ─── Section Label ────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
            {children}
        </p>
    );
}

/* ─── Empty State ──────────────────────────────────────────────────────── */

function EmptyResume() {
    return (
        <div className="h-full flex items-center justify-center p-12">
            <div className="text-center">
                <i className="fa-duotone fa-regular fa-file-user text-3xl text-base-content/20 mb-4 block" />
                <h3 className="text-lg font-black tracking-tight mb-2">
                    No Resume on File
                </h3>
                <p className="text-sm text-base-content/40">
                    No resume data has been extracted for this candidate yet.
                </p>
            </div>
        </div>
    );
}

/* ─── Resume Tab ───────────────────────────────────────────────────────── */

export function ResumeTab({ candidate }: { candidate: Candidate }) {
    const r = candidate.resume_metadata as ResumeMetadata | undefined;

    if (!r) return <EmptyResume />;

    const hasExperience = r.experience && r.experience.length > 0;
    const hasEducation = r.education && r.education.length > 0;
    const hasSkills = r.skills && r.skills.length > 0;
    const hasCerts = r.certifications && r.certifications.length > 0;

    // Group skills by category
    const skillsByCategory = hasSkills
        ? r.skills.reduce<Record<string, typeof r.skills>>((acc, s) => {
              const cat = s.category || "Other";
              (acc[cat] ??= []).push(s);
              return acc;
          }, {})
        : {};

    return (
        <div className="space-y-8 p-6">
            {/* Summary stats row */}
            {(r.total_years_experience || r.highest_degree || r.skills_count) && (
                <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                    {r.total_years_experience != null && (
                        <div className="bg-base-100 p-4 text-center">
                            <p className="text-2xl font-black tracking-tight">{r.total_years_experience}</p>
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40">Years Exp.</p>
                        </div>
                    )}
                    {r.highest_degree && (
                        <div className="bg-base-100 p-4 text-center">
                            <p className="text-2xl font-black tracking-tight">{degreeLabel(r.highest_degree)}</p>
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40">Highest Degree</p>
                        </div>
                    )}
                    {r.skills_count != null && (
                        <div className="bg-base-100 p-4 text-center">
                            <p className="text-2xl font-black tracking-tight">{r.skills_count}</p>
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40">Skills</p>
                        </div>
                    )}
                </div>
            )}

            {/* Professional Summary */}
            {r.professional_summary && (
                <div className="border-l-4 border-l-primary pl-6">
                    <SectionLabel>Professional Summary</SectionLabel>
                    <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-line">
                        {r.professional_summary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {hasExperience && (
                <div>
                    <SectionLabel>Experience</SectionLabel>
                    <div className="space-y-[2px] bg-base-300">
                        {r.experience.map((exp, i) => (
                            <div key={i} className="bg-base-100 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="font-bold text-sm tracking-tight">{exp.title}</h4>
                                        <p className="text-sm text-base-content/60 mt-0.5">
                                            {exp.company}
                                            {exp.location && <span className="text-base-content/40"> · {exp.location}</span>}
                                        </p>
                                    </div>
                                    <span className="text-sm text-base-content/40 whitespace-nowrap shrink-0">
                                        {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                                    </span>
                                </div>
                                {exp.description && (
                                    <p className="text-sm text-base-content/60 mt-2 leading-relaxed">
                                        {exp.description}
                                    </p>
                                )}
                                {exp.highlights && exp.highlights.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {exp.highlights.map((h, j) => (
                                            <li key={j} className="text-sm text-base-content/60 pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-base-content/30 before:font-bold">
                                                {h}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {hasEducation && (
                <div>
                    <SectionLabel>Education</SectionLabel>
                    <div className="space-y-[2px] bg-base-300">
                        {r.education.map((edu, i) => (
                            <div key={i} className="bg-base-100 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="font-bold text-sm tracking-tight">{edu.institution}</h4>
                                        <p className="text-sm text-base-content/60 mt-0.5">
                                            {[edu.degree, edu.field_of_study].filter(Boolean).join(" in ") || "Degree not specified"}
                                        </p>
                                        {edu.gpa && (
                                            <p className="text-sm text-base-content/40 mt-0.5">GPA: {edu.gpa}</p>
                                        )}
                                    </div>
                                    <span className="text-sm text-base-content/40 whitespace-nowrap shrink-0">
                                        {formatDateRange(edu.start_date, edu.end_date)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills by Category */}
            {hasSkills && (
                <div>
                    <SectionLabel>Skills</SectionLabel>
                    <div className="space-y-4">
                        {Object.entries(skillsByCategory).map(([category, skills]) => (
                            <div key={category}>
                                <p className="text-sm font-bold text-base-content/50 capitalize mb-2">
                                    {category.replace(/_/g, " ")}
                                </p>
                                <div className="space-y-1.5">
                                    {skills.map((skill, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-sm font-semibold w-32 shrink-0 truncate">{skill.name}</span>
                                            <div className="flex-1 bg-base-300 h-1.5">
                                                <div className={`h-full bg-primary ${proficiencyWidth(skill.proficiency)}`} />
                                            </div>
                                            {skill.proficiency && (
                                                <span className="text-sm text-base-content/40 capitalize w-24 shrink-0">{skill.proficiency}</span>
                                            )}
                                            {skill.years_used != null && (
                                                <span className="text-sm text-base-content/40 shrink-0">{skill.years_used}y</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications */}
            {hasCerts && (
                <div>
                    <SectionLabel>Certifications</SectionLabel>
                    <div className="space-y-[2px] bg-base-300">
                        {r.certifications.map((cert, i) => (
                            <div key={i} className="bg-base-100 p-4 flex items-center justify-between gap-3">
                                <div>
                                    <h4 className="font-bold text-sm tracking-tight">{cert.name}</h4>
                                    {cert.issuer && (
                                        <p className="text-sm text-base-content/60 mt-0.5">{cert.issuer}</p>
                                    )}
                                </div>
                                <span className="text-sm text-base-content/40 whitespace-nowrap shrink-0">
                                    {cert.date_obtained && formatDateRange(cert.date_obtained)}
                                    {cert.expiry_date && ` — Exp. ${formatDateRange(cert.expiry_date)}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Extraction metadata footer */}
            <div className="border-t border-base-300 pt-4">
                <p className="text-sm text-base-content/30">
                    Extracted {new Date(r.extracted_at).toLocaleDateString()}
                    {r.extraction_confidence != null && (
                        <span> · {Math.round(r.extraction_confidence * 100)}% confidence</span>
                    )}
                </p>
            </div>
        </div>
    );
}