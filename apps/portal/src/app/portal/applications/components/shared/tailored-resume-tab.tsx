"use client";

import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface TailoredResumeTabProps {
    candidateId: string;
    jobId: string;
    applicationId: string;
    resumeData?: any;
    candidate?: {
        full_name?: string;
        email?: string;
        phone?: string;
        location?: string;
        linkedin_url?: string;
        portfolio_url?: string;
    } | null;
    jobTitle?: string;
}

/**
 * Displays the tailored resume stored on the application record (resume_data).
 * Shows what was submitted with the application — no fallbacks, no generation.
 * Used by recruiters in the application detail view.
 */
export function TailoredResumeTab({
    applicationId,
    resumeData,
    candidate,
    jobTitle,
}: TailoredResumeTabProps) {
    const { getToken } = useAuth();

    const handleDownloadResume = async () => {
        if (!resumeData) return;
        const doc = await buildResumePdf(resumeData, candidate);
        doc.save(`application-${applicationId}-resume.pdf`);
    };

    const handleDownloadFull = async () => {
        if (!resumeData) return;

        // Fetch the AI review for this application
        let aiReview: any = null;
        try {
            const token = await getToken();
            if (token) {
                const client = createAuthenticatedClient(token);
                const response = await client.get("/ai-reviews", {
                    params: { application_id: applicationId, limit: 1 },
                });
                const reviews = response.data || [];
                if (reviews.length > 0) aiReview = reviews[0];
            }
        } catch (err) {
            console.warn("Failed to fetch AI review for PDF:", err);
        }

        const doc = await buildFullPdf(resumeData, candidate, aiReview, jobTitle);
        doc.save(`application-${applicationId}-full-review.pdf`);
    };

    if (!resumeData || typeof resumeData !== "object" || !resumeData.summary) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-file-user text-4xl mb-2 block" />
                <p>No tailored resume was generated for this application.</p>
            </div>
        );
    }

    const { summary, experience, relevant_projects, skills, education, certifications } = resumeData;

    return (
        <div>
            {/* Actions */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-file-user text-primary" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40">
                        Tailored Resume
                    </span>
                    <span className="badge badge-sm bg-primary/10 text-primary border-primary/20 font-semibold">
                        AI-Tailored
                    </span>
                </div>
                <div className="join">
                    <button
                        type="button"
                        className="btn btn-primary btn-sm join-item"
                        onClick={handleDownloadResume}
                    >
                        <i className="fa-duotone fa-regular fa-download" />
                        Download PDF
                    </button>
                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-primary btn-sm join-item border-l border-primary-content/20"
                        >
                            <i className="fa-solid fa-chevron-down text-xs" />
                        </div>
                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 border border-base-300 shadow-lg w-52 p-1 z-50">
                            <li>
                                <button type="button" onClick={handleDownloadResume}>
                                    <i className="fa-duotone fa-regular fa-file-user text-sm" />
                                    Resume Only
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={handleDownloadFull}>
                                    <i className="fa-duotone fa-regular fa-file-chart-column text-sm" />
                                    Resume + AI Review
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Display Content */}
            <div className="space-y-6">
                {summary && (
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                            Professional Summary
                        </h3>
                        <p className="text-sm text-base-content/70 leading-relaxed">{summary}</p>
                    </section>
                )}

                {experience?.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Experience
                        </h3>
                        <div className="space-y-4">
                            {experience.map((exp: any, i: number) => (
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

                {relevant_projects?.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Projects
                        </h3>
                        <div className="space-y-3">
                            {relevant_projects.map((proj: any, i: number) => (
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

// ─── PDF Helpers ─────────────────────────────────────────────────────────────

interface PdfContext {
    doc: any;
    y: number;
    margin: number;
    contentWidth: number;
    pageWidth: number;
}

function checkPage(ctx: PdfContext, needed: number) {
    if (ctx.y + needed > 282) {
        ctx.doc.addPage();
        ctx.y = ctx.margin;
    }
}

function pdfHeading(ctx: PdfContext, text: string) {
    checkPage(ctx, 10);
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(150);
    ctx.doc.text(text.toUpperCase(), ctx.margin, ctx.y);
    ctx.y += 6;
}

function pdfBody(ctx: PdfContext, text: string, indent = 0) {
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(10);
    ctx.doc.setTextColor(60);
    const lines = ctx.doc.splitTextToSize(text, ctx.contentWidth - indent);
    for (const line of lines) {
        checkPage(ctx, 5);
        ctx.doc.text(line, ctx.margin + indent, ctx.y);
        ctx.y += 4.5;
    }
}

function pdfBold(ctx: PdfContext, text: string) {
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(10);
    ctx.doc.setTextColor(30);
    checkPage(ctx, 5);
    ctx.doc.text(text, ctx.margin, ctx.y);
    ctx.y += 4.5;
}

function pdfSub(ctx: PdfContext, text: string) {
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(100);
    checkPage(ctx, 5);
    ctx.doc.text(text, ctx.margin, ctx.y);
    ctx.y += 4;
}

function pdfDivider(ctx: PdfContext) {
    ctx.y += 2;
    ctx.doc.setDrawColor(200);
    ctx.doc.setLineWidth(0.3);
    ctx.doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y);
    ctx.y += 6;
}

function pdfCandidateHeader(ctx: PdfContext, candidate: any) {
    if (!candidate) return;
    const fullName = candidate.full_name || "";
    if (fullName) {
        ctx.doc.setFont("helvetica", "bold");
        ctx.doc.setFontSize(18);
        ctx.doc.setTextColor(30);
        ctx.doc.text(fullName, ctx.margin, ctx.y);
        ctx.y += 7;
    }

    const contactParts: string[] = [];
    if (candidate.email) contactParts.push(candidate.email);
    if (candidate.phone) contactParts.push(candidate.phone);
    if (candidate.location) contactParts.push(candidate.location);
    if (contactParts.length > 0) {
        ctx.doc.setFont("helvetica", "normal");
        ctx.doc.setFontSize(9);
        ctx.doc.setTextColor(100);
        ctx.doc.text(contactParts.join("  \u2022  "), ctx.margin, ctx.y);
        ctx.y += 4;
    }

    const linkParts: string[] = [];
    if (candidate.linkedin_url) linkParts.push(candidate.linkedin_url);
    if (candidate.portfolio_url) linkParts.push(candidate.portfolio_url);
    if (linkParts.length > 0) {
        ctx.doc.setFont("helvetica", "normal");
        ctx.doc.setFontSize(8);
        ctx.doc.setTextColor(120);
        ctx.doc.text(linkParts.join("  \u2022  "), ctx.margin, ctx.y);
        ctx.y += 4;
    }

    pdfDivider(ctx);
}

function pdfResumeContent(ctx: PdfContext, data: any) {
    if (data.summary) {
        pdfHeading(ctx, "Professional Summary");
        pdfBody(ctx, data.summary);
        ctx.y += 4;
    }

    if (data.experience?.length) {
        pdfHeading(ctx, "Experience");
        for (const exp of data.experience) {
            checkPage(ctx, 15);
            pdfBold(ctx, exp.title);
            const meta = [exp.company, exp.location].filter(Boolean).join(" \u2022 ");
            if (meta) pdfSub(ctx, meta);
            if (exp.start_date || exp.end_date) {
                pdfSub(ctx, `${exp.start_date || "?"} \u2013 ${exp.is_current ? "Present" : exp.end_date || "?"}`);
            }
            if (exp.description) { ctx.y += 1; pdfBody(ctx, exp.description); }
            if (exp.achievements?.length) {
                ctx.y += 1;
                for (const a of exp.achievements) pdfBody(ctx, `\u2022  ${a}`, 4);
            }
            ctx.y += 3;
        }
    }

    if (data.relevant_projects?.length) {
        pdfHeading(ctx, "Projects");
        for (const proj of data.relevant_projects) {
            checkPage(ctx, 10);
            pdfBold(ctx, proj.name);
            if (proj.description) pdfBody(ctx, proj.description);
            if (proj.skills_used?.length) pdfSub(ctx, proj.skills_used.join(", "));
            ctx.y += 3;
        }
    }

    if (data.skills?.length) {
        pdfHeading(ctx, "Skills");
        const labels = data.skills.map((s: any) => {
            const name = typeof s === "string" ? s : s.name;
            const prof = typeof s === "object" ? s.proficiency : null;
            return prof ? `${name} (${prof})` : name;
        });
        pdfBody(ctx, labels.join("  \u2022  "));
        ctx.y += 4;
    }

    if (data.education?.length) {
        pdfHeading(ctx, "Education");
        for (const edu of data.education) {
            checkPage(ctx, 8);
            const degree = [edu.degree, edu.field_of_study].filter(Boolean).join(" in ");
            if (degree) pdfBold(ctx, degree);
            if (edu.institution) pdfSub(ctx, edu.institution);
            ctx.y += 2;
        }
    }

    if (data.certifications?.length) {
        pdfHeading(ctx, "Certifications");
        for (const cert of data.certifications) {
            checkPage(ctx, 6);
            pdfBody(ctx, cert.issuer ? `${cert.name} — ${cert.issuer}` : cert.name);
        }
    }
}

// ─── Resume-only PDF ─────────────────────────────────────────────────────────

async function buildResumePdf(resumeData: any, candidate: any) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const ctx: PdfContext = { doc, y: 15, margin: 15, contentWidth: 180, pageWidth: 210 };

    pdfCandidateHeader(ctx, candidate);
    pdfResumeContent(ctx, resumeData);

    return doc;
}

// ─── Full PDF (AI Review + Resume) ───────────────────────────────────────────

async function buildFullPdf(resumeData: any, candidate: any, aiReview: any, jobTitle?: string) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const ctx: PdfContext = { doc, y: 15, margin: 15, contentWidth: 180, pageWidth: 210 };

    // Colors
    const C = {
        primary: [35, 56, 118] as [number, number, number],     // #233876
        success: [34, 197, 94] as [number, number, number],
        warning: [234, 179, 8] as [number, number, number],
        error: [239, 68, 68] as [number, number, number],
        accent: [15, 157, 138] as [number, number, number],     // #0f9d8a
        dark: [30, 30, 30] as [number, number, number],
        muted: [120, 120, 120] as [number, number, number],
        light: [200, 200, 200] as [number, number, number],
        bgLight: [245, 245, 245] as [number, number, number],
    };

    const scoreColor = (score: number) =>
        score >= 90 ? C.success : score >= 70 ? C.primary : score >= 50 ? C.warning : C.error;

    const recLabels: Record<string, string> = {
        strong_fit: "Strong Match", good_fit: "Good Match",
        fair_fit: "Fair Match", poor_fit: "Poor Match",
    };

    // Helper: draw a filled rect with colored top border
    const drawCard = (x: number, w: number, h: number, borderColor: [number, number, number]) => {
        doc.setFillColor(...C.bgLight);
        doc.rect(x, ctx.y, w, h, "F");
        doc.setFillColor(...borderColor);
        doc.rect(x, ctx.y, w, 1.2, "F");
    };

    // Helper: draw a section with colored left border
    const drawLeftBorderSection = (borderColor: [number, number, number], contentFn: () => void) => {
        const startY = ctx.y;
        doc.setFillColor(...borderColor);
        contentFn();
        const height = ctx.y - startY;
        // Draw the border retroactively
        doc.setFillColor(...borderColor);
        doc.rect(ctx.margin, startY, 1, height, "F");
    };

    // ── Page 1: AI Review ────────────────────────────────────────────────

    // Kicker + Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.accent);
    doc.text("INTELLIGENCE", ctx.margin, ctx.y);
    ctx.y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...C.dark);
    doc.text("AI Fit Analysis", ctx.margin, ctx.y);
    ctx.y += 8;

    // Role + Candidate meta
    if (jobTitle || candidate?.full_name) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...C.muted);
        const meta = [
            jobTitle ? `Role: ${jobTitle}` : null,
            candidate?.full_name ? `Candidate: ${candidate.full_name}` : null,
        ].filter(Boolean).join("   |   ");
        doc.text(meta, ctx.margin, ctx.y);
        ctx.y += 4;
    }

    pdfDivider(ctx);

    if (!aiReview) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...C.muted);
        doc.text("No AI review available for this application.", ctx.margin, ctx.y);
        ctx.y += 8;
    } else {
        // Normalize data (handle both flat and nested shapes)
        const fitScore = aiReview.fit_score ?? 0;
        const confidence = aiReview.confidence_level ?? 0;
        const skillsPct = aiReview.skills_match_percentage
            ?? aiReview.skills_match?.match_percentage ?? 0;
        const matchedSkills = aiReview.matched_skills
            ?? aiReview.skills_match?.matched_skills ?? [];
        const missingSkills = aiReview.missing_skills
            ?? aiReview.skills_match?.missing_skills ?? [];
        const expYears = aiReview.candidate_years
            ?? aiReview.experience_analysis?.candidate_years;
        const reqYears = aiReview.required_years
            ?? aiReview.experience_analysis?.required_years;
        const meetsExp = aiReview.meets_experience_requirement
            ?? aiReview.experience_analysis?.meets_requirement;

        // ── KPI Cards (3 across) ──────────────────────────────────────
        const cardW = (ctx.contentWidth - 8) / 3; // 3 cards with 4mm gaps
        const cardH = 22;

        // Card 1: Match Score
        const c1Color = scoreColor(fitScore);
        drawCard(ctx.margin, cardW, cardH, c1Color);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...c1Color);
        doc.text(`${Math.round(fitScore)}%`, ctx.margin + 4, ctx.y + 14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C.muted);
        doc.text("MATCH SCORE", ctx.margin + 4, ctx.y + 19);

        // Card 2: Confidence
        const c2x = ctx.margin + cardW + 4;
        const c2Color = scoreColor(confidence);
        drawCard(c2x, cardW, cardH, c2Color);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...c2Color);
        doc.text(`${Math.round(confidence)}%`, c2x + 4, ctx.y + 14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C.muted);
        doc.text("CONFIDENCE", c2x + 4, ctx.y + 19);

        // Card 3: Skills Match
        const c3x = ctx.margin + (cardW + 4) * 2;
        const c3Color = scoreColor(skillsPct);
        drawCard(c3x, cardW, cardH, c3Color);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...c3Color);
        doc.text(`${Math.round(skillsPct)}%`, c3x + 4, ctx.y + 14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C.muted);
        doc.text("SKILLS MATCH", c3x + 4, ctx.y + 19);

        ctx.y += cardH + 6;

        // Recommendation pill
        const recLabel = recLabels[aiReview.recommendation] || "N/A";
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...c1Color);
        doc.text(recLabel, ctx.margin, ctx.y);
        ctx.y += 6;

        // ── Summary ───────────────────────────────────────────────────
        if (aiReview.overall_summary) {
            const summaryStart = ctx.y;
            ctx.y += 2;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.5);
            doc.setTextColor(60);
            const lines = doc.splitTextToSize(aiReview.overall_summary, ctx.contentWidth - 6);
            for (const line of lines) {
                doc.text(line, ctx.margin + 5, ctx.y);
                ctx.y += 4.2;
            }
            ctx.y += 2;
            // Left accent border
            doc.setFillColor(...C.accent);
            doc.rect(ctx.margin, summaryStart, 1, ctx.y - summaryStart, "F");
            ctx.y += 3;
        }

        // ── Strengths & Concerns (side by side) ───────────────────────
        if (aiReview.strengths?.length || aiReview.concerns?.length) {
            const colW = (ctx.contentWidth - 4) / 2;
            const startY = ctx.y;

            // Strengths (left column)
            let leftY = startY;
            if (aiReview.strengths?.length) {
                doc.setFillColor(...C.success);
                doc.rect(ctx.margin, leftY, 1, 1, "F"); // marker
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(...C.muted);
                doc.text("KEY STRENGTHS", ctx.margin + 4, leftY + 1);
                leftY += 5;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(60);
                for (const s of aiReview.strengths) {
                    const sLines = doc.splitTextToSize(s, colW - 10);
                    doc.setTextColor(...C.success);
                    doc.text("\u2713", ctx.margin + 3, leftY);
                    doc.setTextColor(60);
                    for (const line of sLines) {
                        doc.text(line, ctx.margin + 8, leftY);
                        leftY += 4;
                    }
                    leftY += 1;
                }
            }

            // Concerns (right column)
            let rightY = startY;
            const rightX = ctx.margin + colW + 4;
            if (aiReview.concerns?.length) {
                doc.setFillColor(...C.warning);
                doc.rect(rightX, rightY, 1, 1, "F"); // marker
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(...C.muted);
                doc.text("AREAS TO ADDRESS", rightX + 4, rightY + 1);
                rightY += 5;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(60);
                for (const c of aiReview.concerns) {
                    const cLines = doc.splitTextToSize(c, colW - 10);
                    doc.setTextColor(...C.warning);
                    doc.text("\u2013", rightX + 3, rightY);
                    doc.setTextColor(60);
                    for (const line of cLines) {
                        doc.text(line, rightX + 8, rightY);
                        rightY += 4;
                    }
                    rightY += 1;
                }
            }

            ctx.y = Math.max(leftY, rightY) + 4;
        }

        // ── Skills Analysis ───────────────────────────────────────────
        if (matchedSkills.length || missingSkills.length) {
            const skillColW = (ctx.contentWidth - 4) / 2;
            const skillStartY = ctx.y;

            // Matched (left)
            let mY = skillStartY;
            if (matchedSkills.length) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.setTextColor(...C.muted);
                doc.text("MATCHED SKILLS", ctx.margin, mY);
                mY += 4;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                for (const s of matchedSkills) {
                    const sLines = doc.splitTextToSize(s, skillColW - 8);
                    doc.setTextColor(...C.success);
                    doc.text("\u2713", ctx.margin, mY);
                    doc.setTextColor(60);
                    for (const line of sLines) {
                        doc.text(line, ctx.margin + 5, mY);
                        mY += 4;
                    }
                }
            }

            // Missing (right)
            let msY = skillStartY;
            const msX = ctx.margin + skillColW + 4;
            if (missingSkills.length) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.setTextColor(...C.muted);
                doc.text("MISSING SKILLS", msX, msY);
                msY += 4;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                for (const s of missingSkills) {
                    const sLines = doc.splitTextToSize(s, skillColW - 8);
                    doc.setTextColor(...C.warning);
                    doc.text("\u2013", msX, msY);
                    doc.setTextColor(60);
                    for (const line of sLines) {
                        doc.text(line, msX + 5, msY);
                        msY += 4;
                    }
                }
            }

            ctx.y = Math.max(mY, msY) + 4;
        }

        // ── Requirements Analysis ─────────────────────────────────────
        const matchedReqs = aiReview.matched_requirements ?? [];
        const missingReqs = aiReview.missing_requirements ?? [];
        if (matchedReqs.length || missingReqs.length) {
            checkPage(ctx, 20);
            doc.setFillColor(...C.primary);
            doc.rect(ctx.margin, ctx.y, 1, 1, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...C.muted);
            doc.text("REQUIREMENTS ANALYSIS", ctx.margin + 4, ctx.y + 1);
            ctx.y += 6;

            if (matchedReqs.length) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.setTextColor(...C.muted);
                doc.text("MET REQUIREMENTS", ctx.margin, ctx.y);
                ctx.y += 4;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                for (const r of matchedReqs) {
                    checkPage(ctx, 5);
                    const rLines = doc.splitTextToSize(r, ctx.contentWidth - 8);
                    doc.setTextColor(...C.success);
                    doc.text("\u2713", ctx.margin, ctx.y);
                    doc.setTextColor(60);
                    for (const line of rLines) {
                        doc.text(line, ctx.margin + 5, ctx.y);
                        ctx.y += 4;
                    }
                }
                ctx.y += 2;
            }

            if (missingReqs.length) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.setTextColor(...C.muted);
                doc.text("UNMET REQUIREMENTS", ctx.margin, ctx.y);
                ctx.y += 4;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                for (const r of missingReqs) {
                    checkPage(ctx, 5);
                    const rLines = doc.splitTextToSize(r, ctx.contentWidth - 8);
                    doc.setTextColor(...C.error);
                    doc.text("\u2717", ctx.margin, ctx.y);
                    doc.setTextColor(60);
                    for (const line of rLines) {
                        doc.text(line, ctx.margin + 5, ctx.y);
                        ctx.y += 4;
                    }
                }
                ctx.y += 2;
            }

            ctx.y += 2;
        }

        // ── Experience & Location (side by side cards) ────────────────
        if (expYears != null || aiReview.location_compatibility) {
            const halfW = (ctx.contentWidth - 4) / 2;
            const rowH = 14;

            if (expYears != null && reqYears != null) {
                drawCard(ctx.margin, halfW, rowH, C.warning);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.setTextColor(...C.muted);
                doc.text("EXPERIENCE", ctx.margin + 4, ctx.y + 5);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(...C.dark);
                const expIcon = meetsExp ? "\u2713" : "\u2717";
                doc.text(`${expIcon}  ${expYears} yrs (Req: ${reqYears})`, ctx.margin + 4, ctx.y + 11);
            }

            if (aiReview.location_compatibility) {
                const locLabels: Record<string, string> = {
                    perfect: "Perfect Match", good: "Good Match",
                    challenging: "Challenging", mismatch: "Mismatch",
                };
                const locX = ctx.margin + halfW + 4;
                drawCard(locX, halfW, rowH, C.accent);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.setTextColor(...C.muted);
                doc.text("LOCATION", locX + 4, ctx.y + 5);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(...C.dark);
                doc.text(locLabels[aiReview.location_compatibility] || aiReview.location_compatibility, locX + 4, ctx.y + 11);
            }

            ctx.y += rowH + 4;
        }

        // ── Footer disclaimer ─────────────────────────────────────────
        ctx.y += 2;
        doc.setDrawColor(...C.light);
        doc.setLineWidth(0.2);
        doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y);
        ctx.y += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C.muted);
        const disclaimer = "This AI analysis is a supplementary tool. Always review the candidate\u2019s full profile alongside human judgment before making decisions.";
        const discLines = doc.splitTextToSize(disclaimer, ctx.contentWidth);
        for (const line of discLines) {
            doc.text(line, ctx.margin, ctx.y);
            ctx.y += 3;
        }
        ctx.y += 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C.primary);
        doc.text("Powered by Splits Network \u2014 The split-fee recruiting marketplace with AI-powered candidate matching.", ctx.margin, ctx.y);
        ctx.y += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C.accent);
        doc.text("https://splits.network", ctx.margin, ctx.y);
    }

    // ── Page 2+: Resume ──────────────────────────────────────────────────

    doc.addPage();
    ctx.y = ctx.margin;

    pdfCandidateHeader(ctx, candidate);
    pdfResumeContent(ctx, resumeData);

    return doc;
}
