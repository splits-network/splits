/**
 * Simple markdown to HTML renderer for email templates
 * Handles basic markdown syntax without heavy dependencies
 */

/**
 * Convert basic markdown content to HTML for email templates
 * Supports: **bold**, *italic*, links, line breaks
 */
export function renderMarkdownToHTMLSync(content: string): string {
    if (!content || content.trim() === '') {
        return '';
    }

    try {
        let html = content
            // Convert line breaks to <br>
            .replace(/\n/g, '<br>')
            // Convert **bold**
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Convert *italic*
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Convert [link](url) - basic email-safe links
            .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" style="color: #FF6B6B; text-decoration: none; font-weight: 700;">$1</a>')
            // Convert simple line breaks to paragraphs (double line breaks)
            .replace(/<br><br>/g, '</p><p style="margin: 8px 0; line-height: 1.5;">')
            // Wrap in paragraph tags
            .replace(/^(.*)$/, '<p style="margin: 8px 0; line-height: 1.5;">$1</p>');

        return html;
    } catch (error) {
        console.warn('Failed to render markdown content:', error);
        // Fallback to plain text with line breaks preserved
        return content.replace(/\n/g, '<br>');
    }
}

/**
 * Async version for consistency with interface (just calls sync version)
 */
export async function renderMarkdownToHTML(content: string): Promise<string> {
    return renderMarkdownToHTMLSync(content);
}