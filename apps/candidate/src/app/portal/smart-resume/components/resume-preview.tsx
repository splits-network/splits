"use client";

import type {
    SmartResumeProfile,
    Experience,
    Project,
    Skill,
    Education,
    Certification,
    Publication,
} from "./types";

interface ResumePreviewProps {
    profile: SmartResumeProfile | null;
    experiences: Experience[];
    projects: Project[];
    skills: Skill[];
    education: Education[];
    certifications: Certification[];
    publications: Publication[];
}

export function ResumePreview({
    profile,
    experiences,
    projects,
    skills,
    education,
    certifications,
    publications,
}: ResumePreviewProps) {
    // Only show visible entries
    const visExp = experiences
        .filter((e) => e.visible_to_matching !== false)
        .sort((a, b) => {
            if (a.is_current && !b.is_current) return -1;
            if (!a.is_current && b.is_current) return 1;
            return (b.start_date || "").localeCompare(a.start_date || "");
        });
    const visProj = projects.filter((p) => p.visible_to_matching !== false);
    const visSkills = skills.filter((s) => s.visible_to_matching !== false);
    const visEdu = education.filter((e) => e.visible_to_matching !== false);
    const visCerts = certifications.filter((c) => c.visible_to_matching !== false);
    const visPubs = publications.filter((p) => p.visible_to_matching !== false);

    const isEmpty =
        !profile?.headline &&
        !profile?.professional_summary &&
        visExp.length === 0 &&
        visSkills.length === 0 &&
        visEdu.length === 0;

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-base-content/30 p-8">
                <i className="fa-duotone fa-regular fa-file-user text-4xl mb-3" />
                <p className="text-sm">Your resume preview will appear here</p>
                <p className="text-xs mt-1">Add entries on the left to see them rendered</p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-6 text-sm">
            {/* Header */}
            {(profile?.headline || profile?.professional_summary) && (
                <div className="border-b border-base-300 pb-5">
                    {profile.headline && (
                        <h2 className="text-lg font-black tracking-tight">
                            {profile.headline}
                        </h2>
                    )}
                    {profile.professional_summary && (
                        <p className="text-base-content/60 mt-2 leading-relaxed">
                            {profile.professional_summary}
                        </p>
                    )}
                </div>
            )}

            {/* Experience */}
            {visExp.length > 0 && (
                <PreviewSection title="Experience">
                    <div className="space-y-4">
                        {visExp.map((exp) => (
                            <div key={exp.id}>
                                <div className="font-bold">{exp.title}</div>
                                <div className="text-base-content/60">
                                    {exp.company}
                                    {exp.location && ` \u2022 ${exp.location}`}
                                </div>
                                <div className="text-xs text-base-content/40">
                                    {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                                </div>
                                {exp.description && (
                                    <p className="text-base-content/60 mt-1">{exp.description}</p>
                                )}
                                {exp.achievements && exp.achievements.length > 0 && (
                                    <ul className="mt-1 space-y-0.5">
                                        {exp.achievements.map((a, i) => (
                                            <li key={i} className="text-base-content/60 flex gap-2">
                                                <span className="text-base-content/25 shrink-0">{"\u2022"}</span>
                                                <span>{a}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </PreviewSection>
            )}

            {/* Projects */}
            {visProj.length > 0 && (
                <PreviewSection title="Projects">
                    <div className="space-y-3">
                        {visProj.map((proj) => (
                            <div key={proj.id}>
                                <div className="font-bold">{proj.name}</div>
                                {proj.description && (
                                    <p className="text-base-content/60">{proj.description}</p>
                                )}
                                {proj.outcomes && (
                                    <p className="text-base-content/50 text-xs mt-0.5">
                                        Impact: {proj.outcomes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </PreviewSection>
            )}

            {/* Skills */}
            {visSkills.length > 0 && (
                <PreviewSection title="Skills">
                    <div className="flex flex-wrap gap-1.5">
                        {visSkills.map((skill) => (
                            <span
                                key={skill.id}
                                className="text-xs px-2 py-0.5 bg-base-200 text-base-content/70"
                            >
                                {skill.name}
                                {skill.proficiency && (
                                    <span className="text-base-content/40 ml-1">
                                        ({skill.proficiency})
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                </PreviewSection>
            )}

            {/* Education */}
            {visEdu.length > 0 && (
                <PreviewSection title="Education">
                    <div className="space-y-2">
                        {visEdu.map((edu) => (
                            <div key={edu.id}>
                                <div className="font-bold">
                                    {edu.degree}
                                    {edu.field_of_study && ` in ${edu.field_of_study}`}
                                </div>
                                <div className="text-base-content/60">{edu.institution}</div>
                                {(edu.start_date || edu.end_date) && (
                                    <div className="text-xs text-base-content/40">
                                        {formatDateRange(edu.start_date, edu.end_date)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </PreviewSection>
            )}

            {/* Certifications */}
            {visCerts.length > 0 && (
                <PreviewSection title="Certifications">
                    <div className="space-y-1">
                        {visCerts.map((cert) => (
                            <div key={cert.id}>
                                <span className="font-semibold">{cert.name}</span>
                                {cert.issuer && (
                                    <span className="text-base-content/50"> — {cert.issuer}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </PreviewSection>
            )}

            {/* Publications */}
            {visPubs.length > 0 && (
                <PreviewSection title="Publications">
                    <div className="space-y-1">
                        {visPubs.map((pub) => (
                            <div key={pub.id}>
                                <span className="font-semibold">{pub.title}</span>
                                {pub.publisher && (
                                    <span className="text-base-content/50"> — {pub.publisher}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </PreviewSection>
            )}
        </div>
    );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                {title}
            </h3>
            {children}
        </div>
    );
}

function formatDateRange(start?: string, end?: string, isCurrent?: boolean): string {
    const fmt = (d: string) => {
        try {
            const date = new Date(d + (d.length <= 7 ? "-01" : ""));
            return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        } catch {
            return d;
        }
    };

    const parts: string[] = [];
    if (start) parts.push(fmt(start));
    if (isCurrent) parts.push("Present");
    else if (end) parts.push(fmt(end));

    return parts.join(" - ");
}
