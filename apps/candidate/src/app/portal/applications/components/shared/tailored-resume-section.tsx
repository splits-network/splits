"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface TailoredResumeSectionProps {
    candidateId: string;
    jobId: string;
}

interface TailoredResume {
    summary: string;
    experience: any[];
    relevant_projects: any[];
    skills: any[];
    education: any[];
    certifications: any[];
}

export function TailoredResumeSection({ candidateId, jobId }: TailoredResumeSectionProps) {
    const { getToken } = useAuth();
    const [resume, setResume] = useState<TailoredResume | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadResume();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidateId, jobId]);

    const loadResume = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const result = await client.post("/ai-reviews/actions/generate-resume", {
                candidate_id: candidateId,
                job_id: jobId,
            });
            setResume(result.data || result);
        } catch (err: any) {
            console.error("Failed to load tailored resume:", err);
            setError(err.message || "Failed to generate resume preview");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <span className="loading loading-spinner loading-md" />
                <p className="text-sm text-base-content/50">
                    Generating your tailored resume...
                </p>
            </div>
        );
    }

    if (error || !resume) {
        return (
            <div className="text-center py-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-file-user text-3xl mb-2 block" />
                <p className="text-sm mb-3">{error || "Resume preview unavailable"}</p>
                <button type="button" className="btn btn-ghost btn-sm" onClick={loadResume}>
                    <i className="fa-duotone fa-regular fa-rotate-right mr-1" />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40">
                    Smart Resume
                </h3>
                <span className="text-xs text-base-content/40 flex items-center gap-1">
                    <i className="fa-duotone fa-regular fa-wand-magic-sparkles" />
                    AI-tailored for this role
                </span>
            </div>

            <div className="space-y-5">
                {resume.summary && (
                    <div className="border-l-4 border-primary pl-4">
                        <p className="text-sm text-base-content/70 leading-relaxed">{resume.summary}</p>
                    </div>
                )}

                {resume.experience?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                            Relevant Experience
                        </h4>
                        <div className="space-y-3">
                            {resume.experience.map((exp: any, i: number) => (
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

                {resume.relevant_projects?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                            Key Projects
                        </h4>
                        <div className="space-y-2">
                            {resume.relevant_projects.map((proj: any, i: number) => (
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

                {resume.skills?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                            Skills
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {resume.skills.map((skill: any, i: number) => {
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

                {resume.education?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                            Education
                        </h4>
                        {resume.education.map((edu: any, i: number) => (
                            <div key={i} className="text-sm">
                                <span className="font-semibold">{edu.degree}</span>
                                {edu.field_of_study && ` in ${edu.field_of_study}`}
                                {edu.institution && <span className="text-base-content/50"> — {edu.institution}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
