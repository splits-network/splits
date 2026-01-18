export function gateDeniedRecruiterEmail(data: {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    gate: string;
    reason: string;
}): { subject: string; html: string } {
    const subject = `Application denied: ${data.candidateName} - ${data.jobTitle}`;

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
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 32px; text-align: center; background-color: #fef2f2; border-radius: 8px 8px 0 0; border-bottom: 3px solid #dc2626;">
                            <h1 style="margin: 0; color: #991b1b; font-size: 24px; font-weight: 700; line-height: 1.2;">
                                Gate Denied
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                                Hi ${data.recruiterName},
                            </p>

                            <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                                The application for <strong>${data.candidateName}</strong> has been denied at the 
                                <strong>${data.gate}</strong> stage for <strong>${data.jobTitle}</strong> at 
                                <strong>${data.companyName}</strong>.
                            </p>

                            <div style="background-color: #f3f4f6; border-radius: 6px; padding: 20px; margin: 24px 0;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 140px;">
                                            <strong>Candidate:</strong>
                                        </td>
                                        <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                                            ${data.candidateName}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                                            <strong>Position:</strong>
                                        </td>
                                        <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                                            ${data.jobTitle}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                                            <strong>Company:</strong>
                                        </td>
                                        <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                                            ${data.companyName}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                                            <strong>Gate:</strong>
                                        </td>
                                        <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                                            ${data.gate}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 4px;">
                                <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; font-weight: 600;">
                                    Denial Reason:
                                </p>
                                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">
                                    ${data.reason}
                                </p>
                            </div>

                            <p style="margin: 24px 0 0; color: #111827; font-size: 16px; line-height: 1.6;">
                                The candidate has been notified of this decision. The application process for this role has concluded.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
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
