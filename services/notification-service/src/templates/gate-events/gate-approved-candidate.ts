export function gateApprovedCandidateEmail(data: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    gate: string;
    nextStep: string;
    notes?: string;
}): { subject: string; html: string } {
    const subject = `Great news! Your application is moving forward`;

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
                        <td style="padding: 40px 40px 32px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.2;">
                                🎉 Congratulations!
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                                Hi ${data.candidateName},
                            </p>

                            <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                                Great news! You've successfully passed the <strong>${data.gate}</strong> review stage for the 
                                <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>.
                            </p>

                            ${data.notes ? `
                            <div style="background-color: #f3f4f6; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
                                <p style="margin: 0 0 8px; color: #374151; font-size: 14px; font-weight: 600;">
                                    Reviewer Notes:
                                </p>
                                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">
                                    ${data.notes}
                                </p>
                            </div>
                            ` : ''}

                            <div style="background-color: #ecfdf5; border-radius: 6px; padding: 20px; margin: 24px 0;">
                                <p style="margin: 0 0 8px; color: #065f46; font-size: 14px; font-weight: 600;">
                                    Next Step:
                                </p>
                                <p style="margin: 0; color: #047857; font-size: 14px; line-height: 1.5;">
                                    ${data.nextStep}
                                </p>
                            </div>

                            <p style="margin: 24px 0 0; color: #111827; font-size: 16px; line-height: 1.6;">
                                Keep up the great work! We'll keep you updated as your application progresses.
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
