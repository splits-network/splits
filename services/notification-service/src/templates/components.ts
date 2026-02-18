/**
 * Reusable Email Components
 * Memphis Design System — flat colors, bold borders, coral/teal/dark palette
 */

import { renderMarkdownToHTMLSync } from '../utils/markdown-renderer';

export interface ButtonProps {
    href: string;
    text: string;
    variant?: 'primary' | 'secondary' | 'accent';
    theme?: { primary: string; secondary: string; accent: string; };
}

export function button({ href, text, variant = 'primary', theme }: ButtonProps): string {
    const defaultColors = {
        primary: { bg: '#FF6B6B', text: '#ffffff' }, // Memphis Coral
        secondary: { bg: '#1A1A2E', text: '#ffffff' }, // Memphis Dark
        accent: { bg: '#4ECDC4', text: '#1A1A2E' }, // Memphis Teal
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
    <td style="border-radius: 4px; background-color: ${color.bg}; border: 2px solid #1A1A2E;">
      <a href="${href}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 700; line-height: 1; color: ${color.text}; text-decoration: none; border-radius: 4px;">
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
        primary: '#FF6B6B',
        border: '#1A1A2E',
        background: '#F5F0EB'
    };

    const colors = theme || defaultTheme;
    const rows = items
        .map(
            (item) => `
<tr>
  <td style="padding: 12px 20px; border-bottom: 1px solid #E5E0DB;">
    <span style="font-size: 13px; color: #1A1A2E; font-weight: 500;">${item.label}</span>
  </td>
  <td style="padding: 12px 20px; border-bottom: 1px solid #E5E0DB; text-align: right;">
    <span style="font-size: 14px; color: ${item.highlight ? colors.primary : '#1A1A2E'}; font-weight: ${item.highlight ? '700' : '600'};">
      ${item.value}
    </span>
  </td>
</tr>
    `.trim()
        )
        .join('\n');

    return `
<table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; border: 2px solid ${colors.border}; border-radius: 4px; overflow: hidden; margin: 24px 0;">
  <tr>
    <td colspan="2" style="background-color: ${colors.background}; padding: 16px 20px; border-bottom: 2px solid ${colors.border};">
      <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1A1A2E;">
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
        info: { bg: '#EDE9FE', border: '#A78BFA', text: '#1A1A2E' },    // Memphis Purple
        success: { bg: '#D5F5F0', border: '#4ECDC4', text: '#1A1A2E' }, // Memphis Teal
        warning: { bg: '#FFF8D6', border: '#FFE66D', text: '#1A1A2E' }, // Memphis Yellow
        error: { bg: '#FFE0E0', border: '#FF6B6B', text: '#1A1A2E' },   // Memphis Coral
    };

    const style = styles[type];

    return `
<table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; background-color: ${style.bg}; border-left: 4px solid ${style.border}; border-radius: 4px; margin: 20px 0;">
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
      <div style="border-bottom: 1px solid #E5E0DB; position: absolute; width: 100%; top: 50%; left: 0;"></div>
      <span style="background-color: #ffffff; padding: 0 16px; font-size: 13px; color: #1A1A2E; font-weight: 500; position: relative; z-index: 1;">
        ${text}
      </span>
    </td>
  </tr>
</table>
        `.trim();
    }

    return `<div style="border-bottom: 1px solid #E5E0DB; margin: 32px 0;"></div>`;
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
<h${level} style="margin: ${style.margin}; font-size: ${style.size}; font-weight: ${style.weight}; color: #1A1A2E; line-height: 1.2;">
  ${text}
</h${level}>
    `.trim();
}

export function paragraph(text: string): string {
    return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #1A1A2E;">${text}</p>`;
}

export interface ListItem {
    text: string;
    bold?: boolean;
}

export function list(items: ListItem[]): string {
    const listItems = items
        .map(
            (item) => `
<li style="margin-bottom: 8px; font-size: 15px; line-height: 24px; color: #1A1A2E;">
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
        primary: { bg: '#FFE0E0', text: '#1A1A2E' },   // Memphis Coral light
        secondary: { bg: '#1A1A2E', text: '#F5F0EB' },  // Memphis Dark
        success: { bg: '#D5F5F0', text: '#1A1A2E' },    // Memphis Teal light
        warning: { bg: '#FFF8D6', text: '#1A1A2E' },    // Memphis Yellow light
        error: { bg: '#FFE0E0', text: '#1A1A2E' },      // Memphis Coral light
        neutral: { bg: '#F5F0EB', text: '#1A1A2E' },    // Memphis Cream
    };

    const color = colors[variant];

    return `
<span style="display: inline-block; padding: 4px 12px; font-size: 13px; font-weight: 700; color: ${color.text}; background-color: ${color.bg}; border-radius: 4px; border: 1px solid #1A1A2E;">
  ${text}
</span>
    `.trim();
}

/**
 * Convert markdown to HTML for email templates
 * Uses the same renderer as the frontend for consistency
 */
export function markdownToHtml(content: string): string {
    if (!content) return '';

    try {
        // Use the existing markdown renderer with email-safe styling
        let html = renderMarkdownToHTMLSync(content);

        // Apply additional email-specific styling
        html = html
            .replace(/<p>/g, '<p style="margin: 8px 0; line-height: 1.5;">')
            .replace(/<h1>/g, '<h1 style="margin: 16px 0 8px 0; font-size: 24px; font-weight: 700; color: #1A1A2E;">')
            .replace(/<h2>/g, '<h2 style="margin: 12px 0 6px 0; font-size: 20px; font-weight: 700; color: #1A1A2E;">')
            .replace(/<h3>/g, '<h3 style="margin: 8px 0 4px 0; font-size: 18px; font-weight: 700; color: #1A1A2E;">')
            .replace(/<a\s/g, '<a style="color: #FF6B6B; text-decoration: none; font-weight: 700;" ')
            .replace(/<strong>/g, '<strong style="font-weight: 600;">')
            .replace(/<em>/g, '<em style="font-style: italic;">')
            .replace(/<code>/g, '<code style="background: #F5F0EB; padding: 2px 4px; border-radius: 2px; font-family: monospace; font-size: 14px;">')
            .replace(/<ul>/g, '<ul style="margin: 8px 0; padding-left: 20px; line-height: 1.5;">')
            .replace(/<ol>/g, '<ol style="margin: 8px 0; padding-left: 20px; line-height: 1.5;">')
            .replace(/<li>/g, '<li style="margin: 4px 0;">')
            .replace(/<blockquote>/g, '<blockquote style="margin: 16px 0; padding: 8px 16px; border-left: 4px solid #FF6B6B; background: #F5F0EB; font-style: italic;">');

        return html;
    } catch (error) {
        console.warn('Failed to render markdown content:', error);
        return content.replace(/\n/g, '<br>');
    }
}
