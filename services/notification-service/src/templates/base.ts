/**
 * Base HTML Email Template for Splits Network
 * Basel Design System — editorial layouts, DaisyUI semantic tokens, deep indigo palette.
 * A left-border accent on the card, kicker label above the logo, sharp corners throughout.
 *
 * Logo is chosen by recipient role (pass via `source`):
 *
 *   'candidate'  → candidates
 *                  logo: https://applicant.network/logo.png
 *
 *   'portal'     → recruiters, company admins, hiring managers  (DEFAULT)
 *                  logo: https://splits.network/logo.png
 *
 *   'corporate'  → platform admins
 *                  logo: https://employment-networks.com/logo.png
 */

export type EmailSource = 'portal' | 'candidate' | 'corporate';

export interface EmailTheme {
    /** Deep indigo — DaisyUI primary */
    primary: string;
    /** Teal — DaisyUI secondary */
    secondary: string;
    /** Deep magenta — DaisyUI accent */
    accent: string;
    /** Zinc-900 — DaisyUI neutral */
    neutral: string;
    /** Main body text — DaisyUI base-content */
    text: string;
    /** Muted / secondary text */
    textMuted: string;
    /** Page / outer background — DaisyUI base-200 */
    background: string;
    /** Subtle borders — DaisyUI base-300 */
    border: string;
    /** Card surface — DaisyUI base-100 */
    surface: string;
    success: string;
    warning: string;
    error: string;
    info: string;
}

/** Basel Design System palette — matches the DaisyUI splits-light theme */
export const defaultTheme: EmailTheme = {
    primary: '#233876',  // deep indigo
    secondary: '#0f9d8a',  // teal
    accent: '#db2777',  // deep magenta
    neutral: '#18181b',  // zinc-900
    text: '#18181b',  // zinc-900
    textMuted: '#71717a',  // zinc-500
    background: '#f4f4f5',  // zinc-100 / base-200
    border: '#e4e4e7',  // zinc-200 / base-300
    surface: '#ffffff',  // white / base-100
    success: '#16a34a',
    warning: '#d97706',
    error: '#ef4444',
    info: '#0ea5e9',
};

export interface BaseEmailProps {
    preheader?: string;
    content: string;
    /**
     * Controls which brand logo appears in the email header.
     *   'candidate'  — candidates              → applicant.network logo
     *   'portal'     — recruiters / company     → splits.network logo  (default)
     *   'corporate'  — platform admins          → employment-networks.com logo
     */
    source?: EmailSource;
    /** Override individual theme tokens. Defaults to Basel brand theme. */
    theme?: Partial<EmailTheme>;
}

interface SourceMeta {
    kicker: string;
    name: string;
    tagline: string;
    homeUrl: string;
    logoUrl: string;
}

function getSourceMeta(source?: EmailSource): SourceMeta {
    // homeUrl uses env vars so footer links resolve in each environment.
    // logoUrl is a fixed public URL — the file must exist at that path in each app.
    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network';
    const candidateUrl = process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network';
    const corporateUrl = process.env.NEXT_PUBLIC_CORPORATE_URL || 'https://employment-networks.com';

    switch (source) {
        case 'candidate':
            // Recipients: candidates
            return {
                kicker: 'APPLICANT NETWORK',
                name: 'Applicant Network',
                tagline: 'Your career, represented.',
                homeUrl: candidateUrl,
                logoUrl: 'https://applicant.network/logo.png',
            };
        case 'corporate':
            // Recipients: platform admins
            return {
                kicker: 'EMPLOYMENT NETWORKS',
                name: 'Employment Networks',
                tagline: 'The infrastructure powering collaborative recruiting.',
                homeUrl: corporateUrl,
                logoUrl: 'https://employment-networks.com/logo.png',
            };
        case 'portal':
        default:
            // Recipients: recruiters, company admins, hiring managers
            return {
                kicker: 'SPLITS NETWORK',
                name: 'Splits Network',
                tagline: 'The marketplace for collaborative recruiting.',
                homeUrl: portalUrl,
                logoUrl: 'https://splits.network/logo.png',
            };
    }
}

/**
 * Base email template — Basel Design System.
 * Optimised for email clients: all styles are inline, zero border-radius, no external CSS.
 *
 * Layout:
 *   outer bg: base-200 (zinc-100)
 *   card:     base-100 (white), left-border 4px primary (indigo)
 *   header:   kicker label + logo
 *   content:  passed-in HTML block
 *   footer:   base-200, compact nav links
 */
export function baseEmailTemplate({ preheader, content, source, theme }: BaseEmailProps): string {
    const t = { ...defaultTheme, ...theme };
    const meta = getSourceMeta(source);
    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network';

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
  <title>${meta.name}</title>
  <style>
    @media (max-width: 600px) {
      .sm-w-full  { width: 100% !important; }
      .sm-px-24   { padding-left: 24px !important; padding-right: 24px !important; }
      .sm-py-32   { padding-top: 32px !important; padding-bottom: 32px !important; }
      .sm-text-sm { font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; width: 100%; padding: 0; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: ${t.background};">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheader} ${'&nbsp;&zwnj;'.repeat(90)}</div>` : ''}

  <div role="article" aria-roledescription="email" aria-label="${meta.name}" lang="en">
    <table style="width: 100%; font-family: -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="background-color: ${t.background}; padding: 32px 16px 48px;">

          <!-- Email card (max 600px) -->
          <table style="width: 100%; max-width: 600px;" cellpadding="0" cellspacing="0" role="presentation">

            <!-- ─── HEADER ─── -->
            <tr>
              <td style="background-color: ${t.surface}; padding: 32px 40px 28px; border-left: 4px solid ${t.primary}; border-top: 1px solid ${t.border}; border-right: 1px solid ${t.border};">
                <!-- Kicker -->
                <p style="margin: 0 0 14px; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${t.primary};">
                  ${meta.kicker}
                </p>
                <!-- Logo -->
                <img src="${meta.logoUrl}" alt="${meta.name}" width="160" height="40"
                     style="height: 40px; width: auto; max-width: 160px; display: block; border: 0; outline: none; text-decoration: none;" />
              </td>
            </tr>

            <!-- ─── CONTENT ─── -->
            <tr>
              <td style="background-color: ${t.surface}; padding: 40px 40px 48px; border-left: 4px solid ${t.primary}; border-right: 1px solid ${t.border};">
                ${content}
              </td>
            </tr>

            <!-- ─── FOOTER ─── -->
            <tr>
              <td style="background-color: ${t.background}; padding: 24px 40px 32px; border: 1px solid ${t.border}; border-top: none;">
                <table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding-bottom: 10px; border-bottom: 1px solid ${t.border}; padding-bottom: 16px; margin-bottom: 12px;">
                      <a href="${meta.homeUrl}" style="color: ${t.primary}; text-decoration: none; font-size: 12px; font-weight: 700; margin-right: 16px;">${meta.name}</a>
                      <a href="${portalUrl}/help"    style="color: ${t.textMuted}; text-decoration: none; font-size: 12px; margin-right: 16px;">Help Center</a>
                      <a href="${portalUrl}/privacy" style="color: ${t.textMuted}; text-decoration: none; font-size: 12px; margin-right: 16px;">Privacy</a>
                      <a href="${portalUrl}/terms"   style="color: ${t.textMuted}; text-decoration: none; font-size: 12px;">Terms</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 12px;">
                      <p style="margin: 0; font-size: 11px; line-height: 18px; color: ${t.textMuted};">
                        © ${new Date().getFullYear()} Employment Networks, Inc. All rights reserved.
                      </p>
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
