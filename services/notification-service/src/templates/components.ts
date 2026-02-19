/**
 * Reusable Email Components
 * Basel Design System — DaisyUI semantic tokens, deep indigo palette, sharp corners.
 * Editorial hierarchy: kicker → headline → body.
 */

import { renderMarkdownToHTMLSync } from '../utils/markdown-renderer';

// ─── Button ──────────────────────────────────────────────────────────────────

export interface ButtonProps {
    href: string;
    text: string;
    variant?: 'primary' | 'secondary' | 'accent';
    theme?: { primary: string; secondary: string; accent: string; };
}

export function button({ href, text, variant = 'primary', theme }: ButtonProps): string {
    const defaults = {
        primary: { bg: '#233876', fg: '#ffffff' },  // deep indigo
        secondary: { bg: '#18181b', fg: '#ffffff' },  // zinc-900
        accent: { bg: '#db2777', fg: '#ffffff' },  // deep magenta
    };

    const custom = theme ? {
        primary: { bg: theme.primary, fg: '#ffffff' },
        secondary: { bg: theme.secondary, fg: '#ffffff' },
        accent: { bg: theme.accent, fg: '#ffffff' },
    } : defaults;

    const { bg, fg } = custom[variant];

    return `
<table cellpadding="0" cellspacing="0" role="presentation" style="margin: 24px 0;">
  <tr>
    <td style="background-color: ${bg};">
      <a href="${href}" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; line-height: 1; color: ${fg}; text-decoration: none; letter-spacing: 0.01em;">
        ${text}
      </a>
    </td>
  </tr>
</table>
    `.trim();
}

// ─── Info Card ───────────────────────────────────────────────────────────────

export interface InfoCardProps {
    title: string;
    items: Array<{ label: string; value: string | number; highlight?: boolean }>;
    theme?: { primary: string; border: string; background: string; };
}

export function infoCard({ title, items, theme }: InfoCardProps): string {
    const t = theme ?? { primary: '#233876', border: '#e4e4e7', background: '#f4f4f5' };

    const rows = items.map((item) => `
<tr>
  <td style="padding: 12px 20px; border-bottom: 1px solid ${t.border}; width: 30%; white-space: nowrap;">
    <span style="font-size: 13px; color: #71717a; font-weight: 500;">${item.label}</span>
  </td>
  <td style="padding: 12px 20px; border-bottom: 1px solid ${t.border}; text-align: right;">
    <span style="font-size: 14px; color: ${item.highlight ? t.primary : '#18181b'}; font-weight: ${item.highlight ? '700' : '600'};">
      ${item.value}
    </span>
  </td>
</tr>
    `.trim()).join('\n');

    return `
<table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; border: 1px solid ${t.border}; margin: 24px 0; border-left: 3px solid ${t.primary};">
  <tr>
    <td colspan="2" style="background-color: ${t.background}; padding: 14px 20px; border-bottom: 1px solid ${t.border};">
      <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${t.primary};">
        ${title}
      </p>
    </td>
  </tr>
  ${rows}
</table>
    `.trim();
}

// ─── Alert ───────────────────────────────────────────────────────────────────

export interface AlertProps {
    type: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message: string;
}

export function alert({ type, title, message }: AlertProps): string {
    const styles: Record<typeof type, { bg: string; border: string; text: string; }> = {
        info: { bg: '#eff6ff', border: '#0ea5e9', text: '#18181b' },  // sky
        success: { bg: '#f0fdf4', border: '#16a34a', text: '#18181b' },  // green
        warning: { bg: '#fffbeb', border: '#d97706', text: '#18181b' },  // amber
        error: { bg: '#fef2f2', border: '#ef4444', text: '#18181b' },  // red
    };

    const s = styles[type];

    return `
<table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; background-color: ${s.bg}; border-left: 4px solid ${s.border}; margin: 20px 0;">
  <tr>
    <td style="padding: 16px 20px;">
      ${title ? `<p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${s.text};">${title}</p>` : ''}
      <p style="margin: 0; font-size: 14px; line-height: 22px; color: ${s.text};">
        ${message}
      </p>
    </td>
  </tr>
</table>
    `.trim();
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export interface DividerProps {
    text?: string;
}

export function divider({ text }: DividerProps = {}): string {
    if (text) {
        return `
<table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; margin: 32px 0;">
  <tr>
    <td style="width: 100%; text-align: center; position: relative;">
      <div style="border-bottom: 1px solid #e4e4e7; position: absolute; width: 100%; top: 50%; left: 0;"></div>
      <span style="background-color: #ffffff; padding: 0 16px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #71717a; position: relative; z-index: 1;">
        ${text}
      </span>
    </td>
  </tr>
</table>
        `.trim();
    }

    return `<div style="border-bottom: 1px solid #e4e4e7; margin: 32px 0;"></div>`;
}

// ─── Heading ─────────────────────────────────────────────────────────────────

export interface HeadingProps {
    level: 1 | 2 | 3;
    text: string;
    /** Optional kicker label displayed above the headline */
    kicker?: string;
}

export function heading({ level, text, kicker }: HeadingProps): string {
    const sizes: Record<1 | 2 | 3, { size: string; weight: string; leading: string; margin: string; }> = {
        1: { size: '28px', weight: '800', leading: '1.1', margin: '0 0 20px' },
        2: { size: '22px', weight: '700', leading: '1.2', margin: '0 0 14px' },
        3: { size: '17px', weight: '700', leading: '1.35', margin: '0 0 10px' },
    };

    const s = sizes[level];

    return `
${kicker ? `<p style="margin: 0 0 10px; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #233876;">${kicker}</p>` : ''}
<h${level} style="margin: ${s.margin}; font-size: ${s.size}; font-weight: ${s.weight}; color: #18181b; line-height: ${s.leading}; letter-spacing: -0.01em;">
  ${text}
</h${level}>
    `.trim();
}

// ─── Paragraph ───────────────────────────────────────────────────────────────

export function paragraph(text: string): string {
    return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 26px; color: #18181b;">${text}</p>`;
}

// ─── List ────────────────────────────────────────────────────────────────────

export interface ListItem {
    text: string;
    bold?: boolean;
}

export function list(items: ListItem[]): string {
    const listItems = items.map((item) => `
<li style="margin-bottom: 8px; font-size: 15px; line-height: 24px; color: #18181b;">
  ${item.bold ? `<strong>${item.text}</strong>` : item.text}
</li>
    `.trim()).join('\n');

    return `
<ul style="margin: 0 0 16px; padding-left: 24px; list-style-type: disc;">
  ${listItems}
</ul>
    `.trim();
}

// ─── Badge ───────────────────────────────────────────────────────────────────

export interface BadgeProps {
    text: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
}

export function badge({ text, variant = 'neutral' }: BadgeProps): string {
    const colors: Record<typeof variant, { bg: string; text: string; border: string; }> = {
        primary: { bg: '#eef2ff', text: '#233876', border: '#c7d2fe' },  // indigo tint
        secondary: { bg: '#f0fdfa', text: '#0f9d8a', border: '#99f6e4' },  // teal tint
        success: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
        warning: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
        error: { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' },
        neutral: { bg: '#f4f4f5', text: '#3f3f46', border: '#e4e4e7' },
    };

    const c = colors[variant ?? 'neutral'];

    return `
<span style="display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ${c.text}; background-color: ${c.bg}; border: 1px solid ${c.border};">
  ${text}
</span>
    `.trim();
}

// ─── Markdown → HTML ─────────────────────────────────────────────────────────

/**
 * Convert markdown to email-safe HTML.
 * Applies Basel colour tokens inline so the output renders correctly in all email clients.
 */
export function markdownToHtml(content: string): string {
    if (!content) return '';

    try {
        let html = renderMarkdownToHTMLSync(content);

        html = html
            .replace(/<p>/g, '<p style="margin: 8px 0; line-height: 1.6;">')
            .replace(/<h1>/g, '<h1 style="margin: 16px 0 8px; font-size: 24px; font-weight: 800; color: #18181b; letter-spacing: -0.01em;">')
            .replace(/<h2>/g, '<h2 style="margin: 12px 0 6px; font-size: 20px; font-weight: 700; color: #18181b; letter-spacing: -0.01em;">')
            .replace(/<h3>/g, '<h3 style="margin: 8px 0 4px; font-size: 17px; font-weight: 700; color: #18181b;">')
            .replace(/<a\s/g, '<a style="color: #233876; text-decoration: underline; font-weight: 600;" ')
            .replace(/<strong>/g, '<strong style="font-weight: 700;">')
            .replace(/<em>/g, '<em style="font-style: italic;">')
            .replace(/<code>/g, '<code style="background: #f4f4f5; padding: 2px 5px; font-family: monospace; font-size: 13px; color: #18181b;">')
            .replace(/<ul>/g, '<ul style="margin: 8px 0; padding-left: 20px; line-height: 1.6;">')
            .replace(/<ol>/g, '<ol style="margin: 8px 0; padding-left: 20px; line-height: 1.6;">')
            .replace(/<li>/g, '<li style="margin: 4px 0;">')
            .replace(/<blockquote>/g, '<blockquote style="margin: 16px 0; padding: 12px 20px; border-left: 4px solid #233876; background: #f4f4f5; font-style: italic; color: #3f3f46;">');

        return html;
    } catch (error) {
        console.warn('Failed to render markdown content:', error);
        return content.replace(/\n/g, '<br>');
    }
}
