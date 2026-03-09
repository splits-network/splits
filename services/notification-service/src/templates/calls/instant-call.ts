/**
 * Instant Call Email Template
 * Sent to non-creator participants when someone starts an instant call.
 * Uses urgency styling to prompt immediate action.
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, alert } from '../components';

export interface InstantCallData {
    callerName: string;
    joinUrl: string;
    entityContext?: { companyName?: string; jobTitle?: string };
    source?: EmailSource;
}

export function instantCallEmail(data: InstantCallData): string {
    const contextLine = data.entityContext
        ? (() => {
            const parts: string[] = [];
            if (data.entityContext.companyName) parts.push(data.entityContext.companyName);
            if (data.entityContext.jobTitle) parts.push(data.entityContext.jobTitle);
            return parts.length > 0
                ? paragraph(`Regarding: <strong>${parts.join(' \u2014 ')}</strong>`)
                : '';
        })()
        : '';

    const content = `
${heading({ level: 1, text: `${data.callerName} is calling you` })}

${alert({
        type: 'info',
        title: 'Incoming Call',
        message: `<strong>${data.callerName}</strong> has started a call and is waiting for you to join.`,
    })}

${contextLine}

<table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; margin: 28px 0;">
  <tr>
    <td align="center" style="background-color: #233876; padding: 0; border-left: 4px solid #0f9d8a;">
      <a href="${data.joinUrl}" style="display: block; width: 100%; padding: 20px 32px; font-size: 18px; font-weight: 800; line-height: 1; color: #ffffff; text-decoration: none; text-align: center; letter-spacing: 0.02em;">
        Join Call &rarr;
      </a>
    </td>
  </tr>
</table>

${paragraph('Click the button above to join the call now.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.callerName} is calling you \u2014 join now`,
        content,
        source: data.source || 'portal',
    });
}
