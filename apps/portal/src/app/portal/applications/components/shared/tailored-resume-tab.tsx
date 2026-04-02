"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface TailoredResumeTabProps {
    candidateId: string;
    jobId: string;
    applicationId: string;
}

/**
 * Displays the tailored resume stored on the application record.
 * Falls back to Smart Resume matching-data if no tailored resume exists.
 * Used by recruiters in the application detail view.
 * Does NOT generate — that only happens in the candidate's application wizard.
 */
export function TailoredResumeTab({ candidateId, applicationId }: TailoredResumeTabProps) {
    const { getToken } = useAuth();
    const [data, setData] = useState<any>(null);
    const [isTailored, setIsTailored] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

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

    const handleDownloadPdf = async () => {
        if (!printRef.current) return;
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
                <p className="text-sm text-base-content/50">Loading resume...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-file-user text-4xl mb-2 block" />
                <p>{error || "No resume available for this candidate."}</p>
            </div>
        );
    }

    // Tailored resume uses different field names than matching-data
    const summary = isTailored ? data.summary : data.professional_summary;
    const experiences = isTailored ? data.experience : data.experiences;
    const projects = isTailored ? data.relevant_projects : data.projects;
    const skills = data.skills;
    const education = data.education;
    const certifications = isTailored ? data.certifications : data.certifications;

    return (
        <div>
            {/* Actions */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-file-user text-primary" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40">
                        Smart Resume
                    </span>
                    {isTailored && (
                        <span className="badge badge-sm bg-primary/10 text-primary border-primary/20 font-semibold">
                            AI-Tailored
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleDownloadPdf}
                >
                    <i className="fa-duotone fa-regular fa-download" />
                    Download PDF
                </button>
            </div>

            {/* Printable Content */}
            <div ref={printRef} className="space-y-6">
                {summary && (
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                            Professional Summary
                        </h3>
                        <p className="text-sm text-base-content/70 leading-relaxed">{summary}</p>
                    </section>
                )}

                {experiences?.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Experience
                        </h3>
                        <div className="space-y-4">
                            {experiences.map((exp: any, i: number) => (
                                <div key={i} className="border-l-2 border-base-300 pl-4">
                                    <div className="font-bold text-sm">{exp.title}</div>
                                    <div className="text-sm text-base-content/60">
                                        {exp.company}
                                        {exp.location && ` \u2022 ${exp.location}`}
                                    </div>
                                    {(exp.start_date || exp.end_date) && (
                                        <div className="text-xs text-base-content/40">
                                            {exp.start_date || "?"}
                                            {" \u2013 "}
                                            {exp.is_current ? "Present" : exp.end_date || "?"}
                                        </div>
                                    )}
                                    {exp.description && (
                                        <p className="text-sm text-base-content/60 mt-1">{exp.description}</p>
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
                    </section>
                )}

                {projects?.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Projects
                        </h3>
                        <div className="space-y-3">
                            {projects.map((proj: any, i: number) => (
                                <div key={i} className="border-l-2 border-secondary pl-4">
                                    <div className="font-bold text-sm">{proj.name}</div>
                                    {proj.description && (
                                        <p className="text-sm text-base-content/60">{proj.description}</p>
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
                    </section>
                )}

                {skills?.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill: any, i: number) => {
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

                {education?.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Education
                        </h3>
                        <div className="space-y-2">
                            {education.map((edu: any, i: number) => (
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

                {certifications?.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Certifications
                        </h3>
                        <div className="space-y-1">
                            {certifications.map((cert: any, i: number) => (
                                <div key={i} className="text-sm">
                                    <span className="font-semibold">{cert.name}</span>
                                    {cert.issuer && <span className="text-base-content/50"> — {cert.issuer}</span>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
