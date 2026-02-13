/**
 * Resume Extraction Service - V2
 * AI-powered structured metadata extraction from resume text.
 * Extracts experience, skills, education, certifications - no PII.
 */

import { Logger } from '@splits-network/shared-logging';
import type { ResumeMetadata, DegreeLevel } from '@splits-network/shared-types';

export class ResumeExtractionService {
    private openaiApiKey: string;
    private modelVersion: string;

    constructor(private logger: Logger) {
        this.openaiApiKey = process.env.OPENAI_API_KEY || '';
        this.modelVersion = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        if (!this.openaiApiKey) {
            this.logger.warn('OPENAI_API_KEY not set. Resume extraction will not function.');
        }
    }

    /**
     * Extract structured metadata from raw resume text.
     * Returns ResumeMetadata with experience, skills, education, certifications.
     * Explicitly excludes PII (name, email, phone, address).
     */
    async extractStructuredData(
        extractedText: string,
        documentId: string
    ): Promise<ResumeMetadata> {
        if (!this.openaiApiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        const startTime = Date.now();
        const prompt = this.buildExtractionPrompt(extractedText);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.openaiApiKey}`,
            },
            body: JSON.stringify({
                model: this.modelVersion,
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are an expert resume parser. Extract structured professional data from resume text. Return valid JSON only. Never include personal contact information (name, email, phone, address) in the output.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1,
                max_tokens: 4000,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error: ${response.status} ${error}`);
        }

        const data = (await response.json()) as any;
        const content = data.choices[0].message.content;
        const rawResult = JSON.parse(content);

        const result = this.normalizeAndValidate(rawResult, documentId);

        const processingTime = Date.now() - startTime;
        this.logger.info(
            {
                document_id: documentId,
                processing_time_ms: processingTime,
                experience_count: result.experience.length,
                skills_count: result.skills_count,
                education_count: result.education.length,
                certifications_count: result.certifications.length,
            },
            'Resume structured extraction completed'
        );

        return result;
    }

    private buildExtractionPrompt(extractedText: string): string {
        // Truncate to 6000 chars to stay within token limits
        const truncatedText = extractedText.substring(0, 6000);

        return `Extract structured professional data from the following resume text.

IMPORTANT: Do NOT include any personal contact information (name, email, phone number, mailing address, social media URLs) in the output. Only extract professional/career data.

Resume text:
---
${truncatedText}
---

Return a JSON object with this exact structure:

{
  "professional_summary": "<2-3 sentence professional summary based on the resume>",
  "experience": [
    {
      "title": "<job title>",
      "company": "<company name>",
      "location": "<city, state/country or Remote>",
      "start_date": "<YYYY-MM format>",
      "end_date": "<YYYY-MM format or null if current>",
      "is_current": <boolean>,
      "description": "<brief role description>",
      "highlights": ["<key achievement 1>", "<key achievement 2>"]
    }
  ],
  "education": [
    {
      "institution": "<school/university name>",
      "degree": "<degree type, e.g. Bachelor of Science>",
      "field_of_study": "<major/field>",
      "start_date": "<YYYY-MM or null>",
      "end_date": "<YYYY-MM or null>",
      "gpa": "<GPA if mentioned>"
    }
  ],
  "skills": [
    {
      "name": "<skill name>",
      "category": "<one of: programming_language, framework, database, devops, cloud, design, soft_skill, domain_knowledge, tool, other>",
      "proficiency": "<one of: expert, advanced, intermediate, beginner - infer from context>",
      "years_used": <number or null>
    }
  ],
  "certifications": [
    {
      "name": "<certification name>",
      "issuer": "<issuing organization>",
      "date_obtained": "<YYYY-MM or null>",
      "expiry_date": "<YYYY-MM or null>"
    }
  ],
  "total_years_experience": <number - total professional years>,
  "highest_degree": "<one of: doctorate, masters, bachelors, associates, none>"
}

Guidelines:
- Order experience entries from most recent to oldest
- Order education entries from most recent to oldest
- For dates, use YYYY-MM format. If only a year is known, use YYYY-01
- Set is_current=true and end_date=null for current positions
- Infer skill proficiency from context (years used, role seniority, emphasis)
- If a field is not found in the resume, use null or empty array as appropriate
- Be conservative with proficiency estimates - only mark "expert" if clearly demonstrated`;
    }

    /**
     * Normalize AI output and compute derived fields
     */
    private normalizeAndValidate(raw: any, documentId: string): ResumeMetadata {
        const experience = Array.isArray(raw.experience)
            ? raw.experience.map((exp: any) => ({
                  title: String(exp.title || ''),
                  company: String(exp.company || ''),
                  location: exp.location || undefined,
                  start_date: String(exp.start_date || ''),
                  end_date: exp.end_date || null,
                  is_current: Boolean(exp.is_current),
                  description: exp.description || undefined,
                  highlights: Array.isArray(exp.highlights)
                      ? exp.highlights.map(String)
                      : undefined,
              }))
            : [];

        const education = Array.isArray(raw.education)
            ? raw.education.map((edu: any) => ({
                  institution: String(edu.institution || ''),
                  degree: edu.degree || undefined,
                  field_of_study: edu.field_of_study || undefined,
                  start_date: edu.start_date || undefined,
                  end_date: edu.end_date || undefined,
                  gpa: edu.gpa ? String(edu.gpa) : undefined,
              }))
            : [];

        const skills = Array.isArray(raw.skills)
            ? raw.skills.map((skill: any) => ({
                  name: String(skill.name || ''),
                  category: skill.category || undefined,
                  proficiency: this.validateProficiency(skill.proficiency),
                  years_used: typeof skill.years_used === 'number' ? skill.years_used : undefined,
              }))
            : [];

        const certifications = Array.isArray(raw.certifications)
            ? raw.certifications.map((cert: any) => ({
                  name: String(cert.name || ''),
                  issuer: cert.issuer || undefined,
                  date_obtained: cert.date_obtained || undefined,
                  expiry_date: cert.expiry_date || undefined,
              }))
            : [];

        const highestDegree = this.validateDegreeLevel(raw.highest_degree);
        const totalYears =
            typeof raw.total_years_experience === 'number'
                ? Math.round(raw.total_years_experience * 10) / 10
                : undefined;

        return {
            extracted_at: new Date().toISOString(),
            source_document_id: documentId,
            extraction_confidence: 0.85, // Default confidence for GPT extraction
            professional_summary: raw.professional_summary || undefined,
            experience,
            education,
            skills,
            certifications,
            total_years_experience: totalYears,
            highest_degree: highestDegree,
            skills_count: skills.length,
        };
    }

    private validateProficiency(
        value: string | undefined
    ): 'expert' | 'advanced' | 'intermediate' | 'beginner' | undefined {
        const valid = ['expert', 'advanced', 'intermediate', 'beginner'];
        return value && valid.includes(value)
            ? (value as 'expert' | 'advanced' | 'intermediate' | 'beginner')
            : undefined;
    }

    private validateDegreeLevel(value: string | undefined): DegreeLevel | undefined {
        const valid = ['doctorate', 'masters', 'bachelors', 'associates', 'none'];
        return value && valid.includes(value) ? (value as DegreeLevel) : undefined;
    }
}
