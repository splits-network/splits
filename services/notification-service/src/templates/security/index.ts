/**
 * Security & Fraud Email Templates
 * Templates for fraud detection alerts sent to the ops/admin team
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, alert, infoCard, divider } from '../components.js';

export interface FraudAlertData {
    signalType: string;
    severity: string;
    description: string;
    entityType?: string;
    entityId?: string;
    detectedAt: string;
    reviewUrl: string;
    source?: EmailSource;
}

// ─── Security Replay Alert ─────────────────────────────────────────────────

export interface SecurityReplayAlertData {
    clerkUserId: string;
    tokenId: string;
    detectedAt: string;
    reviewUrl: string;
    source?: EmailSource;
}

export function securityReplayAlertEmail(data: SecurityReplayAlertData): string {
    const content = `
${heading({ level: 1, text: 'Security alert — token replay detected' })}

${alert({
        type: 'error',
        title: 'Potential replay attack',
        message: 'A token replay attempt has been detected on an OAuth2 refresh token. This may indicate a compromised token or session hijack attempt.',
    })}

${infoCard({
        title: 'Incident Details',
        items: [
            { label: 'User ID', value: data.clerkUserId },
            { label: 'Token ID', value: data.tokenId },
            { label: 'Detected At', value: new Date(data.detectedAt).toLocaleString() },
            { label: 'Severity', value: 'High', highlight: true },
        ],
    })}

${paragraph(
        'The affected refresh token has been automatically revoked. Review the user\'s recent activity and consider forcing a password reset if suspicious activity is confirmed.'
    )}

${button({
        href: data.reviewUrl,
        text: 'Review User Activity →',
        variant: 'primary',
    })}

${divider()}

${paragraph('This is an automated security alert. Investigate promptly to determine if further action is needed.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Security alert: Token replay detected for user ${data.clerkUserId}.`,
        source: data.source || 'corporate',
    });
}

// ─── Fraud Alert ───────────────────────────────────────────────────────────

export function fraudAlertEmail(data: FraudAlertData): string {
    const infoItems: Array<{ label: string; value: string; highlight?: boolean }> = [
        { label: 'Signal Type', value: data.signalType },
        { label: 'Severity', value: data.severity, highlight: true },
    ];

    if (data.entityType && data.entityId) {
        infoItems.push({ label: 'Entity', value: `${data.entityType} — ${data.entityId}` });
    }

    infoItems.push({ label: 'Detected At', value: new Date(data.detectedAt).toLocaleString() });

    const content = `
${heading({ level: 1, text: 'Fraud signal detected' })}

${alert({
        type: 'error',
        message: `A ${data.severity} severity fraud signal has been detected and requires review.`,
    })}

${infoCard({
        title: 'Signal Details',
        items: infoItems,
    })}

${paragraph(data.description)}

${button({
        href: data.reviewUrl,
        text: 'Review Fraud Signal →',
        variant: 'primary',
    })}

${divider()}

${paragraph('This is an automated alert from the fraud detection system. Please review promptly.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Fraud alert: ${data.signalType} (${data.severity}) — requires review.`,
        source: data.source || 'corporate',
    });
}
