/**
 * Health Alert Email Templates
 * Sent to ops when services go down or recover
 */

import { baseEmailTemplate } from '../base';
import { heading, alert, infoCard, paragraph, divider } from '../components';

export interface ServiceAlertData {
    serviceName: string;
    serviceDisplayName: string;
    severity: string;
    status: 'unhealthy' | 'degraded' | 'recovered';
    error?: string;
    environment?: string;
    statusPageUrl: string;
    timestamp: string;
}

export function serviceUnhealthyEmail(data: ServiceAlertData): string {
    const severityLabel = data.severity === 'unhealthy' ? 'Unhealthy' : 'Degraded';
    const alertType = data.severity === 'unhealthy' ? 'error' : 'warning';

    const content = `
${heading({ level: 1, text: `Service Alert: ${data.serviceDisplayName}` })}

${alert({
    type: alertType as 'error' | 'warning',
    title: `${data.serviceDisplayName} is ${severityLabel}`,
    message: `The health monitor has detected that ${data.serviceDisplayName} is currently experiencing issues. A user-facing notification has been posted.`,
})}

${infoCard({
    title: 'Incident Details',
    items: [
        { label: 'Service', value: data.serviceDisplayName, highlight: true },
        { label: 'Status', value: severityLabel },
        { label: 'Environment', value: (data.environment || 'unknown').toUpperCase() },
        { label: 'Internal Name', value: data.serviceName },
        { label: 'Detected At', value: new Date(data.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'long' }) },
        ...(data.error ? [{ label: 'Error', value: data.error }] : []),
    ],
})}

${paragraph('This alert was triggered after the sliding window threshold was met (3 failures in the last 5 checks). A site-wide degradation banner is now visible to users.')}

${divider()}

${paragraph(`<a href="${data.statusPageUrl}" style="color: #FF6B6B; font-weight: 600;">View Status Page →</a>`)}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `[ALERT] ${data.serviceDisplayName} is ${severityLabel}`,
        source: 'corporate',
    });
}

export function serviceRecoveredEmail(data: ServiceAlertData): string {
    const content = `
${heading({ level: 1, text: `Resolved: ${data.serviceDisplayName}` })}

${alert({
    type: 'success',
    title: `${data.serviceDisplayName} has recovered`,
    message: `The health monitor has confirmed that ${data.serviceDisplayName} is healthy again. The user-facing degradation banner has been removed.`,
})}

${infoCard({
    title: 'Recovery Details',
    items: [
        { label: 'Service', value: data.serviceDisplayName, highlight: true },
        { label: 'Status', value: 'Healthy' },
        { label: 'Environment', value: (data.environment || 'unknown').toUpperCase() },
        { label: 'Internal Name', value: data.serviceName },
        { label: 'Resolved At', value: new Date(data.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'long' }) },
    ],
})}

${paragraph('The sliding window now shows the service passing consistently. No further action is needed.')}

${divider()}

${paragraph(`<a href="${data.statusPageUrl}" style="color: #FF6B6B; font-weight: 600;">View Status Page →</a>`)}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `[RESOLVED] ${data.serviceDisplayName} has recovered`,
        source: 'corporate',
    });
}
