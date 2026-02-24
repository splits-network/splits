"use client";

import type {
    ApplicationResumeData,
    ResumeExperience,
    ResumeEducation,
    ResumeCertification,
} from "@splits-network/shared-types";

interface ResumeTabProps {
    resumeData?: ApplicationResumeData | null;
}

const SOURCE_LABELS: Record<string, string> = {
    mcp_tool: "Submitted via ChatGPT App",
    custom_gpt: "Submitted via ChatGPT",
    portal_backfill: "Extracted from uploaded document",
};

export default function ResumeTab({ resumeData }: ResumeTabProps) {
    if (!resumeData) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-file-user text-4xl mb-2 block" />
                <p>No resume data available for this application.</p>
            </div>
        );
    }

    const hasStructured =
        resumeData.contact ||
        resumeData.summary ||
        resumeData.experience?.length ||
        resumeData.education?.length ||
        resumeData.skills?.length ||
        resumeData.certifications?.length;

    return (
        <div className="space-y-6">
            {/* Contact */}
            {resumeData.contact && (
                <Section title="Contact" icon="fa-address-card">
                    <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
                        {resumeData.contact.name && (
                            <Detail icon="fa-user" value={resumeData.contact.name} />
                        )}
                        {resumeData.contact.email && (
                            <Detail icon="fa-envelope" value={resumeData.contact.email} />
                        )}
                        {resumeData.contact.phone && (
                            <Detail icon="fa-phone" value={resumeData.contact.phone} />
                        )}
                        {resumeData.contact.location && (
                            <Detail icon="fa-location-dot" value={resumeData.contact.location} />
                        )}
                        {resumeData.contact.linkedin_url && (
                            <a
                                href={resumeData.contact.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-primary hover:text-primary/80"
                            >
                                <i className="fa-brands fa-linkedin" />
                                LinkedIn
                            </a>
                        )}
                        {resumeData.contact.website && (
                            <a
                                href={resumeData.contact.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-primary hover:text-primary/80"
                            >
                                <i className="fa-duotone fa-regular fa-globe" />
                                Website
                            </a>
                        )}
                    </div>
                </Section>
            )}

            {/* Summary */}
            {resumeData.summary && (
                <Section title="Summary" icon="fa-align-left">
                    <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-line">
                        {resumeData.summary}
                    </p>
                </Section>
            )}

            {/* Experience */}
            {resumeData.experience && resumeData.experience.length > 0 && (
                <Section title="Experience" icon="fa-briefcase">
                    <div className="space-y-4">
                        {resumeData.experience.map((exp: ResumeExperience, i: number) => (
                            <div key={i} className="border-l-2 border-base-300 pl-4">
                                <div className="font-bold text-sm">{exp.title}</div>
                                <div className="text-sm text-base-content/60">
                                    {exp.company}
                                    {exp.location && ` \u2022 ${exp.location}`}
                                </div>
                                <div className="text-sm text-base-content/40">
                                    {exp.start_date || ""}
                                    {exp.start_date && (exp.end_date || exp.is_current) && " \u2013 "}
                                    {exp.is_current ? "Present" : exp.end_date || ""}
                                </div>
                                {exp.description && (
                                    <p className="text-sm text-base-content/60 mt-1 leading-relaxed">
                                        {exp.description}
                                    </p>
                                )}
                                {exp.highlights && exp.highlights.length > 0 && (
                                    <ul className="list-disc list-inside text-sm text-base-content/60 mt-1 space-y-0.5">
                                        {exp.highlights.map((h: string, j: number) => (
                                            <li key={j}>{h}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Education */}
            {resumeData.education && resumeData.education.length > 0 && (
                <Section title="Education" icon="fa-graduation-cap">
                    <div className="space-y-3">
                        {resumeData.education.map((edu: ResumeEducation, i: number) => (
                            <div key={i} className="border-l-2 border-base-300 pl-4">
                                <div className="font-bold text-sm">{edu.institution}</div>
                                {(edu.degree || edu.field_of_study) && (
                                    <div className="text-sm text-base-content/60">
                                        {[edu.degree, edu.field_of_study].filter(Boolean).join(" in ")}
                                    </div>
                                )}
                                <div className="text-sm text-base-content/40">
                                    {[edu.start_date, edu.end_date].filter(Boolean).join(" \u2013 ")}
                                    {edu.gpa && ` \u2022 GPA: ${edu.gpa}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Skills */}
            {resumeData.skills && resumeData.skills.length > 0 && (
                <Section title="Skills" icon="fa-wrench">
                    <SkillsList skills={resumeData.skills} />
                </Section>
            )}

            {/* Certifications */}
            {resumeData.certifications && resumeData.certifications.length > 0 && (
                <Section title="Certifications" icon="fa-certificate">
                    <div className="space-y-2">
                        {resumeData.certifications.map((cert: ResumeCertification, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                                <i className="fa-duotone fa-regular fa-award text-accent mt-0.5" />
                                <div>
                                    <span className="font-bold">{cert.name}</span>
                                    {cert.issuer && (
                                        <span className="text-base-content/60"> {"\u2022"} {cert.issuer}</span>
                                    )}
                                    {cert.date_obtained && (
                                        <span className="text-base-content/40"> ({cert.date_obtained})</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Raw Text Fallback */}
            {!hasStructured && resumeData.raw_text && (
                <Section title="Resume Text" icon="fa-file-lines">
                    <div className="prose prose-sm max-w-none text-base-content/70 whitespace-pre-line leading-relaxed">
                        {resumeData.raw_text}
                    </div>
                </Section>
            )}

            {/* Source Badge */}
            <div className="flex items-center gap-2 text-sm text-base-content/40 pt-2 border-t border-base-300">
                <i className="fa-duotone fa-regular fa-circle-info" />
                {SOURCE_LABELS[resumeData.source] || resumeData.source}
                {resumeData.created_at && (
                    <span>
                        {" \u2022 "}
                        {new Date(resumeData.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Section({
    title,
    icon,
    children,
}: {
    title: string;
    icon: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-base-100 border-l-4 border-primary p-6">
            <h3 className="text-sm uppercase tracking-[0.2em] text-base-content/40 font-bold mb-4">
                <i className={`fa-duotone fa-regular ${icon} mr-2`} />
                {title}
            </h3>
            {children}
        </div>
    );
}

function Detail({ icon, value }: { icon: string; value: string }) {
    return (
        <div className="flex items-center gap-2">
            <i className={`fa-duotone fa-regular ${icon} text-primary`} />
            {value}
        </div>
    );
}

function SkillsList({ skills }: { skills: { name: string; category?: string }[] }) {
    // Group by category
    const grouped = skills.reduce<Record<string, string[]>>((acc, s) => {
        const cat = s.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s.name);
        return acc;
    }, {});

    const categories = Object.keys(grouped);
    const hasCategories = categories.length > 1 || categories[0] !== "Other";

    if (!hasCategories) {
        return (
            <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                    <span key={i} className="text-sm px-2 py-1 bg-base-200 text-base-content/70">
                        {s.name}
                    </span>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {categories.map((cat) => (
                <div key={cat}>
                    <div className="text-sm font-bold text-base-content/50 mb-1">{cat}</div>
                    <div className="flex flex-wrap gap-2">
                        {grouped[cat].map((name, i) => (
                            <span key={i} className="text-sm px-2 py-1 bg-base-200 text-base-content/70">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}