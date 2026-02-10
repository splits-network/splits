/**
 * Reusable Email Components
 * Pre-built UI elements matching Splits Network brand
 */

import { marked } from 'marked';

export interface ButtonProps {
    href: string;
    text: string;
    variant?: 'primary' | 'secondary' | 'accent';
    theme?: { primary: string; secondary: string; accent: string; };
}

export function button({ href, text, variant = 'primary', theme }: ButtonProps): string {
    const defaultColors = {
        primary: { bg: '#233876', text: '#ffffff' }, // Brand blue
        secondary: { bg: '#0d9488', text: '#ffffff' }, // Teal
        accent: { bg: '#10b981', text: '#ffffff' }, // Success green
    };

    // Use theme colors if provided
    const colors = theme ? {
        primary: { bg: theme.primary, text: '#ffffff' },
        secondary: { bg: theme.secondary, text: '#ffffff' },
        accent: { bg: theme.accent, text: '#ffffff' },
    } : defaultColors;

    const color = colors[variant];

    return `
<table cellpadding="0" cellspacing="0" role="presentation">
  <tr>
    <td style="border-radius: 8px; background-color: ${color.bg};">
      <a href="${href}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; line-height: 1; color: ${color.text}; text-decoration: none; border-radius: 8px;">
        ${text}
      </a>
    </td>
  </tr>
</table>
    `.trim();
}

export interface InfoCardProps {
    title: string;
    items: Array<{ label: string; value: string | number; highlight?: boolean }>;
    theme?: { primary: string; border: string; background: string; };
}

export function infoCard({ title, items, theme }: InfoCardProps): string {
    const defaultTheme = {
        primary: '#233876',
        border: '#e5e7eb',
        background: '#f9fafb'
    };

    const colors = theme || defaultTheme;
    const rows = items
        .map(
            (item) => `
<tr>
  <td style="padding: 12px 20px; border-bottom: 1px solid ${colors.border};">
    <span style="font-size: 13px; color: #6b7280; font-weight: 500;">${item.label}</span>
  </td>
  <td style="padding: 12px 20px; border-bottom: 1px solid ${colors.border}; text-align: right;">
    <span style="font-size: 14px; color: ${item.highlight ? colors.primary : '#111827'}; font-weight: ${item.highlight ? '700' : '600'};">
      ${item.value}
    </span>
  </td>
</tr>
    `.trim()
        )
        .join('\n');

    return `
<table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; border: 1px solid ${colors.border}; border-radius: 12px; overflow: hidden; margin: 24px 0;">
  <tr>
    <td colspan="2" style="background-color: ${colors.background}; padding: 16px 20px; border-bottom: 2px solid ${colors.border};">
      <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">
        ${title}
      </h3>
    </td>
  </tr>
  ${rows}
</table>
    `.trim();
}

export interface AlertProps {
    type: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message: string;
}

export function alert({ type, title, message }: AlertProps): string {
    const styles = {
        info: { bg: '#dbeafe', border: '#60a5fa', text: '#1e40af' },
        success: { bg: '#dcfce7', border: '#16a34a', text: '#166534' },
        warning: { bg: '#fef3c7', border: '#eab308', text: '#854d0e' },
        error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
    };

    const style = styles[type];

    return `
<table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; background-color: ${style.bg}; border-left: 4px solid ${style.border}; border-radius: 8px; margin: 20px 0;">
  <tr>
    <td style="padding: 16px 20px;">
      ${title ? `<p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: ${style.text};">${title}</p>` : ''}
      <p style="margin: 0; font-size: 14px; line-height: 20px; color: ${style.text};">
        ${message}
      </p>
    </td>
  </tr>
</table>
    `.trim();
}

export interface DividerProps {
    text?: string;
}

export function divider({ text }: DividerProps = {}): string {
    if (text) {
        return `
<table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; margin: 32px 0;">
  <tr>
    <td style="width: 100%; position: relative; text-align: center;">
      <div style="border-bottom: 1px solid #e5e7eb; position: absolute; width: 100%; top: 50%; left: 0;"></div>
      <span style="background-color: #ffffff; padding: 0 16px; font-size: 13px; color: #6b7280; font-weight: 500; position: relative; z-index: 1;">
        ${text}
      </span>
    </td>
  </tr>
</table>
        `.trim();
    }

    return `<div style="border-bottom: 1px solid #e5e7eb; margin: 32px 0;"></div>`;
}

export interface HeadingProps {
    level: 1 | 2 | 3;
    text: string;
}

export function heading({ level, text }: HeadingProps): string {
    const sizes = {
        1: { size: '28px', weight: '800', margin: '0 0 16px' },
        2: { size: '22px', weight: '700', margin: '0 0 12px' },
        3: { size: '18px', weight: '600', margin: '0 0 8px' },
    };

    const style = sizes[level];

    return `
<h${level} style="margin: ${style.margin}; font-size: ${style.size}; font-weight: ${style.weight}; color: #111827; line-height: 1.2;">
  ${text}
</h${level}>
    `.trim();
}

export function paragraph(text: string): string {
    return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #374151;">${text}</p>`;
}

export interface ListItem {
    text: string;
    bold?: boolean;
}

export function list(items: ListItem[]): string {
    const listItems = items
        .map(
            (item) => `
<li style="margin-bottom: 8px; font-size: 15px; line-height: 24px; color: #374151;">
  ${item.bold ? `<strong>${item.text}</strong>` : item.text}
</li>
    `.trim()
        )
        .join('\n');

    return `
<ul style="margin: 0 0 16px; padding-left: 24px; list-style-type: disc;">
  ${listItems}
</ul>
    `.trim();
}

export interface BadgeProps {
    text: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
}

export function badge({ text, variant = 'neutral' }: BadgeProps): string {
    const colors = {
        primary: { bg: '#dbeafe', text: '#233876' },
        secondary: { bg: '#ccfbf1', text: '#0f9d8a' },
        success: { bg: '#dcfce7', text: '#166534' },
        warning: { bg: '#fef3c7', text: '#854d0e' },
        error: { bg: '#fee2e2', text: '#991b1b' },
        neutral: { bg: '#f3f4f6', text: '#374151' },
    };

    const color = colors[variant];

    return `
<span style="display: inline-block; padding: 4px 12px; font-size: 13px; font-weight: 600; color: ${color.text}; background-color: ${color.bg}; border-radius: 6px;">
  ${text}
</span>
    `.trim();
}

/**
 * Convert markdown to HTML for email templates
 * Renders markdown content safely for email display
 */
export function markdownToHtml(content: string): string {
    if (!content) return '';

    // Configure marked for email-safe HTML
    marked.setOptions({
        breaks: true,    // Convert line breaks to <br>
        gfm: true,       // GitHub Flavored Markdown
        sanitize: false, // We're not in a browser environment
        silent: true,    // Don't throw on errors
    });

    try {
        const html = marked(content);

        // Apply email-safe styling to common elements
        return html
            .replace(/<p>/g, '<p style="margin: 8px 0; line-height: 1.5;">')
            .replace(/<h1>/g, '<h1 style="margin: 16px 0 8px 0; font-size: 24px; font-weight: 600; color: #233876;">')
            .replace(/<h2>/g, '<h2 style="margin: 12px 0 6px 0; font-size: 20px; font-weight: 600; color: #233876;">')
            .replace(/<h3>/g, '<h3 style="margin: 8px 0 4px 0; font-size: 18px; font-weight: 600; color: #233876;">')
            .replace(/<ul>/g, '<ul style="margin: 8px 0; padding-left: 20px; line-height: 1.5;">')
            .replace(/<ol>/g, '<ol style="margin: 8px 0; padding-left: 20px; line-height: 1.5;">')
            .replace(/<li>/g, '<li style="margin: 4px 0;">')
            .replace(/<strong>/g, '<strong style="font-weight: 600;">')
            .replace(/<em>/g, '<em style="font-style: italic;">')
            .replace(/<a/g, '<a style="color: #233876; text-decoration: none; font-weight: 600;"')
            .replace(/<code>/g, '<code style="background: #f1f5f9; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 14px;">')
            .replace(/<blockquote>/g, '<blockquote style="margin: 16px 0; padding: 8px 16px; border-left: 4px solid #233876; background: #f8fafc; font-style: italic;">');
    } catch (error) {
        // Fallback to plain text if markdown parsing fails
        return content.replace(/\n/g, '<br>');
    }
}
