"use client";

interface TailoredResumeSectionProps {
    candidateId: string;
    jobId: string;
    applicationId: string;
    resumeData?: any;
}

/**
 * Displays the tailored resume stored on the application record (resume_data).
 * Shows what was submitted with the application — no fallbacks, no fetching.
 */
export function TailoredResumeSection({
    resumeData,
}: TailoredResumeSectionProps) {
    if (!resumeData || typeof resumeData !== "object" || !resumeData.summary) {
        return (
            <div className="text-center py-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-file-user text-3xl mb-2 block" />
                <p className="text-sm">No tailored resume was generated for this application.</p>
            </div>
        );
    }

    const { summary, experience, relevant_projects, skills, education, certifications } = resumeData;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40">
                    Tailored Resume
                </h3>
                <span className="text-xs text-base-content/40 flex items-center gap-1">
                    <i className="fa-duotone fa-regular fa-wand-magic-sparkles" />
                    AI-tailored for this role
                </span>
            </div>

            <div className="space-y-5">
                {summary && (
                    <div className="border-l-4 border-primary pl-4">
                        <p className="text-sm text-base-content/70 leading-relaxed">{summary}</p>
                    </div>
                )}

                {experience?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                            Experience
                        </h4>
                        <div className="space-y-3">
                            {experience.map((exp: any, i: number) => (
                                <div key={i} className="border-l-2 border-base-300 pl-3">
                                    <div className="font-semibold text-sm">{exp.title}</div>
                                    <div className="text-sm text-base-content/60">
                                        {exp.company}
                                        {exp.location && ` \u2022 ${exp.location}`}
                                    </div>
                                    {exp.description && (
                                        <p className="text-sm text-base-content/50 mt-1">{exp.description}</p>
                                    )}
                                    {exp.achievements?.length > 0 && (
                                        <ul className="mt-1 space-y-0.5">
                                            {exp.achievements.map((a: string, j: number) => (
                                                <li key={j} className="text-sm text-base-content/60 flex gap-2">
                                                    <span className="text-base-content/30 shrink-0">{"\u2022"}</span>
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

                {relevant_projects?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                            Projects
                        </h4>
                        <div className="space-y-2">
                            {relevant_projects.map((proj: any, i: number) => (
                                <div key={i} className="border-l-2 border-secondary pl-3">
                                    <div className="font-semibold text-sm">{proj.name}</div>
                                    {proj.description && (
                                        <p className="text-sm text-base-content/50">{proj.description}</p>
                                    )}
                                    {proj.skills_used?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {proj.skills_used.map((s: string, j: number) => (
                                                <span key={j} className="text-xs px-1.5 py-0.5 bg-base-200 text-base-content/60">{s}</span>
                                            ))}
                                        </div>
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

                {certifications?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                            Certifications
                        </h4>
                        <div className="space-y-1">
                            {certifications.map((cert: any, i: number) => (
                                <div key={i} className="text-sm">
                                    <span className="font-semibold">{cert.name}</span>
                                    {cert.issuer && <span className="text-base-content/50"> — {cert.issuer}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
