/**
 * Base HTML Email Template for Splits Network
 * Matches brand styling from the portal with consistent theme colors
 * Features white header with dynamic logo switching based on recipient role:
 * - source: 'candidate' → Applicant Network logo
 * - source: 'portal' → Splits Network logo (default for recruiters, admins, etc.)
 * - source: 'corporate' → Employment Networks logo
 */

export type EmailSource = 'portal' | 'candidate' | 'corporate';

export interface EmailTheme {
    primary: string;      // Main brand color
    secondary: string;    // Secondary brand color  
    accent: string;       // Success/accent color
    warning: string;      // Warning color
    error: string;        // Error color
    text: string;         // Primary text color
    textMuted: string;    // Muted text color
    background: string;   // Background color
    border: string;       // Border color
}

// Brand colors matching the website theme
export const defaultTheme: EmailTheme = {
    primary: '#233876',     // Brand blue
    secondary: '#0d9488',   // Teal
    accent: '#10b981',      // Success green
    warning: '#f59e0b',     // Warning orange
    error: '#ef4444',       // Error red
    text: '#374151',        // Dark gray text
    textMuted: '#6b7280',   // Muted gray text
    background: '#ffffff',  // White background
    border: '#e5e7eb',      // Light border
};

export interface BaseEmailProps {
    preheader?: string;
    content: string;
    /** Source determines which logo/branding to show. Use 'candidate' for candidates, 'portal' for all other users */
    source?: EmailSource;
    /** Custom theme colors. Defaults to brand theme if not provided */
    theme?: Partial<EmailTheme>;
}

/**
 * Get the logo URL based on source
 * Defaults to portal if not specified
 */
function getLogoUrl(source?: EmailSource): string {
    switch (source) {
        case 'candidate':
            return 'https://applicant.network/logo-email.png';
        case 'corporate':
            return 'https://employment-networks.com/logo.png';
        case 'portal':
        default:
            return 'https://splits.network/logo.png';
    }
}

/**
 * Get the tagline based on source
 */
function getTagline(source?: EmailSource): string {
    switch (source) {
        case 'candidate':
            return 'Your Career, Represented';
        case 'corporate':
            return 'Powering the Future of Hiring';
        case 'portal':
        default:
            return 'The Marketplace for Collaborative Recruiting';
    }
}

/**
 * Base email template with header, footer, and brand styling
 * Optimized for email clients with inline styles
 */
export function baseEmailTemplate({ preheader, content, source, theme }: BaseEmailProps): string {
    const logoUrl = getLogoUrl(source);
    const tagline = getTagline(source);
    const emailTheme = { ...defaultTheme, ...theme };
    return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office">
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
  </style>
  <![endif]-->
  <title>Splits Network</title>
  <style>
    @media (max-width: 600px) {
      .sm-w-full {
        width: 100% !important;
      }
      .sm-px-24 {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
      .sm-py-32 {
        padding-top: 32px !important;
        padding-bottom: 32px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; width: 100%; padding: 0; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #f3f4f6;">
  ${preheader ? `<div style="display: none;">${preheader}</div>` : ''}
  
  <div role="article" aria-roledescription="email" aria-label="Splits Network" lang="en">
    <!-- Email Container -->
    <table style="width: 100%; font-family: -apple-system, 'Segoe UI', sans-serif;" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="background-color: #f3f4f6; padding: 24px 0;">
          
          <!-- Main Email Card -->
          <table style="width: 100%; max-width: 600px;" cellpadding="0" cellspacing="0" role="presentation">
            
            <!-- Header with white background and full-color logo -->
            <tr>
              <td style="background-color: #ffffff; padding: 40px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                <table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                  <tr>
                    <td style="text-align: center;">
                      <img src="${logoUrl}" alt="Logo" width="180" height="48" style="height: 48px; width: auto; max-width: 180px; margin: 0 auto 12px; display: block; border: 0; outline: none;" />
                      <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 500;">
                        ${tagline}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="background-color: #ffffff; padding: 40px 32px;">
                ${content}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 32px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                  <tr>
                    <td style="text-align: center; padding-bottom: 16px;">
                      <a href="https://splits.network" style="color: ${emailTheme.primary}; text-decoration: none; font-size: 14px; font-weight: 600;">
                        Splits Network
                      </a>
                      <span style="color: #9ca3af; margin: 0 12px;">•</span>
                      <a href="https://applicant.network" style="color: ${emailTheme.primary}; text-decoration: none; font-size: 14px; font-weight: 600;">
                        Applicant Network
                      </a>
                      <span style="color: #9ca3af; margin: 0 12px;">•</span>
                      <a href="https://splits.network/help" style="color: ${emailTheme.primary}; text-decoration: none; font-size: 14px; font-weight: 600;">
                        Help Center
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; color: #6b7280; font-size: 13px; line-height: 20px;">
                      © ${new Date().getFullYear()} Employment Networks, Inc. All rights reserved.
                      <br>
                      <a href="https://splits.network/privacy" style="color: ${emailTheme.textMuted}; text-decoration: underline;">Privacy Policy</a>
                      <span style="margin: 0 8px;">•</span>
                      <a href="https://splits.network/terms" style="color: ${emailTheme.textMuted}; text-decoration: underline;">Terms of Service</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
          
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
    `.trim();
}
