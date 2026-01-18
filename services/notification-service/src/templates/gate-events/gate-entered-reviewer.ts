export function gateEnteredReviewerEmail(data: {
    reviewerName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    gate: string;
    enteredAt: string;
    actionUrl: string;
}): { subject: string; html: string } {
    const subject = `New application ready for review: ${data.candidateName} - ${data.jobTitle}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 40px 40px 32px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                                🔔 New Application at Your Gate
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                                Hi ${data.reviewerName},
                            </p>
                            <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                                A new application is ready for your review at the <strong>${data.gate}</strong> gate.
                            </p>
                            <div style="background-color: #eff6ff; padding: 20px; margin: 24px 0; border-radius: 6px; border: 1px solid #dbeafe;">
                                <p style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 600;">Application Details:</p>
                                <p style="margin: 0 0 8px; color: #1e3a8a; font-size: 14px;">
                                    <strong>Candidate:</strong> ${data.candidateName}
                                </p>
                                <p style="margin: 0 0 8px; color: #1e3a8a; font-size: 14px;">
                                    <strong>Position:</strong> ${data.jobTitle} at ${data.companyName}
                                </p>
                                <p style="margin: 0 0 8px; color: #1e3a8a; font-size: 14px;">
                                    <strong>Gate:</strong> ${data.gate}
                                </p>
                                <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
                                    <strong>Entered:</strong> ${new Date(data.enteredAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    })}
                                </p>
                            </div>
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${data.actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);">
                                    Review Application
                                </a>
                            </div>
                            <p style="margin: 24px 0 0; color: #111827; font-size: 16px; line-height: 1.6;">
                                Please review this application and make your decision (approve, deny, or request more information).
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5; text-align: center;">
                                This is an automated notification from Splits Network.<br/>
                                © ${new Date().getFullYear()} Splits Network. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();

    return { subject, html };
}
