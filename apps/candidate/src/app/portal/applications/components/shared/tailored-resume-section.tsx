"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface TailoredResumeSectionProps {
    candidateId: string;
    jobId: string;
    applicationId: string;
}

/**
 * Displays the tailored resume stored on the application record.
 * Falls back to Smart Resume matching-data if no tailored resume exists.
 * Does NOT generate — that only happens in the application wizard.
 */
export function TailoredResumeSection({ candidateId, applicationId }: TailoredResumeSectionProps) {
    const { getToken } = useAuth();
    const [data, setData] = useState<any>(null);
    const [isTailored, setIsTailored] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadResume();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId, candidateId]);

    const loadResume = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            // Try to load tailored resume from application record
            const appResult = await client.get(`/applications/${applicationId}`);
            const resumeData = appResult.data?.resume_data;

            if (resumeData && typeof resumeData === "object" && resumeData.summary) {
                setData(resumeData);
                setIsTailored(true);
                return;
            }

            // Fallback: show Smart Resume matching data
            const profileResult = await client.get(
                "/smart-resume-profiles/views/matching-data",
                { params: { candidate_id: candidateId } },
            );
            setData(profileResult.data);
            setIsTailored(false);
        } catch (err: any) {
            console.error("Failed to load resume:", err);
            setError(err.message || "Failed to load resume data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <span className="loading loading-spinner loading-md" />
                <p className="text-sm text-base-content/50">Loading resume...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-file-user text-3xl mb-2 block" />
                <p className="text-sm">{error || "No resume available"}</p>
            </div>
        );
    }

    // Tailored resume uses different field names than matching-data
    const summary = isTailored ? data.summary : data.professional_summary;
    const experiences = isTailored ? data.experience : data.experiences;
    const projects = isTailored ? data.relevant_projects : data.projects;
    const skills = data.skills;
    const education = data.education;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40">
                    Smart Resume
                </h3>
                {isTailored && (
                    <span className="text-xs text-base-content/40 flex items-center gap-1">
                        <i className="fa-duotone fa-regular fa-wand-magic-sparkles" />
                        AI-tailored for this role
                    </span>
                )}
            </div>

            <div className="space-y-5">
                {summary && (
                    <div className="border-l-4 border-primary pl-4">
                        <p className="text-sm text-base-content/70 leading-relaxed">{summary}</p>
                    </div>
                )}

                {experiences?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                            Experience
                        </h4>
                        <div className="space-y-3">
                            {experiences.map((exp: any, i: number) => (
                                <div key={i} className="border-l-2 border-base-300 pl-3">
                                    <div className="font-semibold text-sm">{exp.title}</div>
                                    <div className="text-sm text-base-content/60">
                                        {exp.company}
                                        {exp.location && ` \u2022 ${exp.location}`}
                                    </div>
                                    {exp.description && (
                                        <p className="text-sm text-base-content/50 mt-1">{exp.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {projects?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                            Projects
                        </h4>
                        <div className="space-y-2">
                            {projects.map((proj: any, i: number) => (
                                <div key={i} className="border-l-2 border-secondary pl-3">
                                    <div className="font-semibold text-sm">{proj.name}</div>
                                    {proj.description && (
                                        <p className="text-sm text-base-content/50">{proj.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {skills?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                            Skills
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {skills.map((skill: any, i: number) => {
                                const label = typeof skill === "string" ? skill : skill.name;
                                return (
                                    <span key={i} className="text-xs px-2 py-1 bg-base-200 text-base-content/70">
                                        {label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {education?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                            Education
                        </h4>
                        {education.map((edu: any, i: number) => (
                            <div key={i} className="text-sm">
                                <span className="font-semibold">{edu.degree}</span>
                                {edu.field_of_study && ` in ${edu.field_of_study}`}
                                {edu.institution && (
                                    <span className="text-base-content/50"> — {edu.institution}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
