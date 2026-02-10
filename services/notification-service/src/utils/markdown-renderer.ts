/**
 * Server-side Markdown to HTML renderer for email templates
 * Uses the same plugins as the frontend MarkdownRenderer for consistency
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

const allowedSchema = {
    ...defaultSchema,
    tagNames: [
        ...(defaultSchema.tagNames || []),
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'code',
        'pre',
        'blockquote',
    ],
    attributes: {
        ...(defaultSchema.attributes || {}),
        a: ['href', 'title', 'target', 'rel'],
        code: ['className'],
    },
};

// Create the unified processor for markdown to HTML conversion
const markdownProcessor = unified()
    .use(remarkParse)  // Parse markdown
    .use(remarkGfm)    // GitHub flavored markdown
    .use(remarkRehype, {
        allowDangerousHtml: false  // Don't allow raw HTML in markdown
    })
    .use(rehypeSanitize, allowedSchema)  // Sanitize HTML
    .use(rehypeStringify);  // Convert to HTML string

/**
 * Convert markdown content to safe HTML string for email templates
 * 
 * @param content - The markdown content to render
 * @returns HTML string safe for email embedding
 */
export async function renderMarkdownToHTML(content: string): Promise<string> {
    if (!content || content.trim() === '') {
        return '';
    }

    try {
        const result = await markdownProcessor.process(content.trim());
        return String(result);
    } catch (error) {
        console.warn('Failed to render markdown content:', error);
        // Fallback to plain text with line breaks preserved
        return content.replace(/\n/g, '<br>');
    }
}

/**
 * Synchronous version for simple use cases (use async version when possible)
 * Falls back to plain text with line breaks if markdown processing fails
 */
export function renderMarkdownToHTMLSync(content: string): string {
    if (!content || content.trim() === '') {
        return '';
    }

    try {
        const result = markdownProcessor.processSync(content.trim());
        return String(result);
    } catch (error) {
        console.warn('Failed to render markdown content:', error);
        // Fallback to plain text with line breaks preserved
        return content.replace(/\n/g, '<br>');
    }
}