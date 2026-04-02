"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface TailoredResumeTabProps {
    candidateId: string;
    jobId: string;
    applicationId: string;
}

interface TailoredResume {
    summary: string;
    experience: any[];
    relevant_projects: any[];
    skills: any[];
    education: any[];
    certifications: any[];
}

export function TailoredResumeTab({ candidateId, jobId, applicationId }: TailoredResumeTabProps) {
    const { getToken } = useAuth();
    const [resume, setResume] = useState<TailoredResume | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        generateResume();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidateId, jobId]);

    const generateResume = async () => {
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
            console.error("Failed to generate tailored resume:", err);
            setError(err.message || "Failed to generate tailored resume");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!printRef.current) return;
        // Dynamic import to avoid SSR issues
        const html2pdf = (await import("html2pdf.js")).default;
        html2pdf()
            .set({
                margin: [10, 10, 10, 10],
                filename: `application-${applicationId}-resume.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            })
            .from(printRef.current)
            .save();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
                <span className="loading loading-spinner loading-lg" />
                <p className="text-sm text-base-content/50">
                    Generating tailored resume...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <i className="fa-duotone fa-regular fa-circle-exclamation text-4xl mb-3 block text-error" />
                <p className="text-base-content/60 mb-4">{error}</p>
                <button type="button" className="btn btn-primary btn-sm" onClick={generateResume}>
                    <i className="fa-duotone fa-regular fa-rotate-right mr-1" />
                    Retry
                </button>
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-file-user text-4xl mb-2 block" />
                <p>No Smart Resume data available for this candidate.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Actions */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-primary" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40">
                        AI-Tailored Resume
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={generateResume}
                    >
                        <i className="fa-duotone fa-regular fa-rotate-right" />
                        Regenerate
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleDownloadPdf}
                    >
                        <i className="fa-duotone fa-regular fa-download" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Printable Content */}
            <div ref={printRef} className="space-y-6">
                <ResumeContent resume={resume} />
            </div>
        </div>
    );
}

/** Read-only display of the tailored resume — also used as the PDF source */
function ResumeContent({ resume }: { resume: TailoredResume }) {
    return (
        <div className="space-y-6">
            {/* Summary */}
            {resume.summary && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                        Professional Summary
                    </h3>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                        {resume.summary}
                    </p>
                </section>
            )}

            {/* Experience */}
            {resume.experience?.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Relevant Experience
                    </h3>
                    <div className="space-y-4">
                        {resume.experience.map((exp: any, i: number) => (
                            <div key={i} className="border-l-2 border-base-300 pl-4">
                                <div className="font-bold text-sm">{exp.title}</div>
                                <div className="text-sm text-base-content/60">
                                    {exp.company}
                                    {exp.location && ` \u2022 ${exp.location}`}
                                </div>
                                {(exp.start_date || exp.dates) && (
                                    <div className="text-xs text-base-content/40">
                                        {exp.dates || `${exp.start_date}${exp.end_date ? ` \u2013 ${exp.end_date}` : exp.is_current ? " \u2013 Present" : ""}`}
                                    </div>
                                )}
                                {exp.description && (
                                    <p className="text-sm text-base-content/60 mt-1">{exp.description}</p>
                                )}
                                {exp.highlights?.length > 0 && (
                                    <ul className="mt-1 space-y-0.5">
                                        {exp.highlights.map((h: string, j: number) => (
                                            <li key={j} className="text-sm text-base-content/60 flex gap-2">
                                                <span className="text-base-content/30 shrink-0">\u2022</span>
                                                {h}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {resume.relevant_projects?.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Relevant Projects
                    </h3>
                    <div className="space-y-3">
                        {resume.relevant_projects.map((proj: any, i: number) => (
                            <div key={i} className="border-l-2 border-secondary pl-4">
                                <div className="font-bold text-sm">{proj.name}</div>
                                {proj.description && (
                                    <p className="text-sm text-base-content/60">{proj.description}</p>
                                )}
                                {proj.outcome && (
                                    <p className="text-xs text-base-content/50 mt-0.5">
                                        <span className="font-semibold">Impact:</span> {proj.outcome}
                                    </p>
                                )}
                                {proj.skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {proj.skills.map((s: string, j: number) => (
                                            <span key={j} className="text-xs px-1.5 py-0.5 bg-base-200 text-base-content/60">{s}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {resume.skills?.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {resume.skills.map((skill: any, i: number) => {
                            const label = typeof skill === "string" ? skill : skill.name;
                            const proficiency = typeof skill === "object" ? skill.proficiency : null;
                            return (
                                <span key={i} className="text-sm px-2 py-1 bg-base-200 text-base-content/70">
                                    {label}
                                    {proficiency && (
                                        <span className="text-xs text-base-content/40 ml-1">({proficiency})</span>
                                    )}
                                </span>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Education */}
            {resume.education?.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Education
                    </h3>
                    <div className="space-y-2">
                        {resume.education.map((edu: any, i: number) => (
                            <div key={i} className="border-l-2 border-base-300 pl-4">
                                <div className="font-bold text-sm">
                                    {edu.degree}{edu.field_of_study && ` in ${edu.field_of_study}`}
                                </div>
                                <div className="text-sm text-base-content/60">{edu.institution}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Certifications */}
            {resume.certifications?.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Certifications
                    </h3>
                    <div className="space-y-1">
                        {resume.certifications.map((cert: any, i: number) => (
                            <div key={i} className="text-sm">
                                <span className="font-semibold">{cert.name}</span>
                                {cert.issuer && <span className="text-base-content/50"> — {cert.issuer}</span>}
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
