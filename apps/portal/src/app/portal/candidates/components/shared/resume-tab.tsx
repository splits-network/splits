"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Candidate } from "../../types";

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

/* ─── Section Label ────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-4">
            {children}
        </p>
    );
}

/* ─── Resume Tab ───────────────────────────────────────────────────────── */

export function ResumeTab({ candidate }: { candidate: Candidate }) {
    const { getToken } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSmartResume();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidate.id]);

    const loadSmartResume = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const result = await client.get(
                "/smart-resume-profiles/views/matching-data",
                { params: { candidate_id: candidate.id } },
            );
            setProfile(result.data);
        } catch (err) {
            console.error("Failed to load smart resume:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <i className="fa-duotone fa-regular fa-file-user text-3xl text-base-content/20 mb-4 block" />
                    <h3 className="text-lg font-black tracking-tight mb-2">
                        No Smart Resume
                    </h3>
                    <p className="text-sm text-base-content/40">
                        This candidate hasn't created a Smart Resume yet.
                    </p>
                </div>
            </div>
        );
    }

    const experiences = profile.experiences || [];
    const education = profile.education || [];
    const skills = profile.skills || [];
    const certifications = profile.certifications || [];
    const projects = profile.projects || [];
    const publications = profile.publications || [];

    // Group skills by category
    const skillsByCategory = skills.length > 0
        ? skills.reduce((acc: Record<string, any[]>, s: any) => {
              const cat = s.category || "other";
              (acc[cat] ??= []).push(s);
              return acc;
          }, {} as Record<string, any[]>)
        : {};

    return (
        <div className="space-y-8 p-6">
            {/* Professional Summary */}
            {profile.professional_summary && (
                <div className="border-l-4 border-l-primary pl-6">
                    <SectionLabel>Professional Summary</SectionLabel>
                    <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-line">
                        {profile.professional_summary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {experiences.length > 0 && (
                <div>
                    <SectionLabel>Experience</SectionLabel>
                    <div className="space-y-[2px] bg-base-300">
                        {experiences.map((exp: any, i: number) => (
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
                                {exp.achievements && exp.achievements.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {exp.achievements.map((a: string, j: number) => (
                                            <li key={j} className="text-sm text-base-content/60 pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-base-content/30 before:font-bold">
                                                {a}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
                <div>
                    <SectionLabel>Projects</SectionLabel>
                    <div className="space-y-[2px] bg-base-300">
                        {projects.map((proj: any, i: number) => (
                            <div key={i} className="bg-base-100 p-4">
                                <h4 className="font-bold text-sm tracking-tight">{proj.name}</h4>
                                {proj.description && (
                                    <p className="text-sm text-base-content/60 mt-1">{proj.description}</p>
                                )}
                                {proj.skills_used && proj.skills_used.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {proj.skills_used.map((s: string, j: number) => (
                                            <span key={j} className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {education.length > 0 && (
                <div>
                    <SectionLabel>Education</SectionLabel>
                    <div className="space-y-[2px] bg-base-300">
                        {education.map((edu: any, i: number) => (
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
            {skills.length > 0 && (
                <div>
                    <SectionLabel>Skills</SectionLabel>
                    <div className="space-y-4">
                        {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                            <div key={category}>
                                <p className="text-sm font-bold text-base-content/50 mb-2">
                                    {category.replace(/_/g, " ")}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(catSkills as any[]).map((skill: any, i: number) => (
                                        <span key={i} className="badge badge-sm badge-soft badge-primary normal-case">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
                <div>
                    <SectionLabel>Certifications</SectionLabel>
                    <div className="space-y-[2px] bg-base-300">
                        {certifications.map((cert: any, i: number) => (
                            <div key={i} className="bg-base-100 p-4 flex items-center justify-between gap-3">
                                <div>
                                    <h4 className="font-bold text-sm tracking-tight">{cert.name}</h4>
                                    {cert.issuer && (
                                        <p className="text-sm text-base-content/60 mt-0.5">{cert.issuer}</p>
                                    )}
                                </div>
                                <span className="text-sm text-base-content/40 whitespace-nowrap shrink-0">
                                    {cert.date_obtained && formatDateRange(cert.date_obtained)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Publications */}
            {publications.length > 0 && (
                <div>
                    <SectionLabel>Publications</SectionLabel>
                    <div className="space-y-[2px] bg-base-300">
                        {publications.map((pub: any, i: number) => (
                            <div key={i} className="bg-base-100 p-4">
                                <h4 className="font-bold text-sm tracking-tight">{pub.title}</h4>
                                {pub.description && (
                                    <p className="text-sm text-base-content/60 mt-0.5">{pub.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
