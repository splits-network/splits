/**
 * Document Email Templates
 * Templates for document processing notifications
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, alert, infoCard, divider } from '../components';

export interface ResumeProcessedData {
    candidateName: string;
    fileName: string;
    skillsCount: number;
    experienceCount: number;
    educationCount: number;
    viewUrl: string;
    source?: EmailSource;
}

export function resumeProcessedEmail(data: ResumeProcessedData): string {
    const totalExtracted = data.skillsCount + data.experienceCount + data.educationCount;
    const summaryParts: string[] = [];
    if (data.skillsCount > 0) summaryParts.push(`${data.skillsCount} skill${data.skillsCount !== 1 ? 's' : ''}`);
    if (data.experienceCount > 0) summaryParts.push(`${data.experienceCount} experience entr${data.experienceCount !== 1 ? 'ies' : 'y'}`);
    if (data.educationCount > 0) summaryParts.push(`${data.educationCount} education entr${data.educationCount !== 1 ? 'ies' : 'y'}`);
    const summaryText = summaryParts.length > 0
        ? summaryParts.join(', ')
        : 'No structured data extracted';

    const content = `
${heading({ level: 1, text: 'Resume processed successfully' })}

${alert({
        type: totalExtracted > 0 ? 'success' : 'info',
        message: totalExtracted > 0
            ? `We extracted ${totalExtracted} data point${totalExtracted !== 1 ? 's' : ''} from the resume.`
            : 'The resume was processed but no structured data could be extracted.',
    })}

${infoCard({
        title: 'Processing Summary',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'File', value: data.fileName },
            { label: 'Extracted', value: summaryText, highlight: totalExtracted > 0 },
        ],
    })}

${paragraph(
        totalExtracted > 0
            ? 'The candidate\'s profile has been updated with the extracted information. Review the details to ensure accuracy before submitting applications.'
            : 'The resume may be in an unsupported format or contain limited parseable content. You can still review the candidate\'s profile and add details manually.'
    )}

${button({
        href: data.viewUrl,
        text: 'View Candidate Profile →',
        variant: 'primary',
    })}

${divider()}

${paragraph('Resume processing is automatic when documents are uploaded. Results may vary based on document format and content.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Resume processed for ${data.candidateName} — ${summaryText}.`,
        source: data.source || 'portal',
    });
}
