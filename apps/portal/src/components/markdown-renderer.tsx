/**
 * Simple markdown renderer for displaying formatted text
 * Supports: **bold**, *italic*, and bullet points (- item)
 */
export function renderMarkdown(text: string) {
    if (!text) return null;

    return text.split('\n').map((line, idx) => {
        // Bold
        line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Italic
        line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Bullet points
        if (line.trim().startsWith('- ')) {
            return <li key={idx} dangerouslySetInnerHTML={{ __html: line.replace(/^- /, '') }} />;
        }
        // Paragraphs
        return line.trim() ? <p key={idx} dangerouslySetInnerHTML={{ __html: line }} /> : <br key={idx} />;
    });
}

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

/**
 * Component wrapper for rendering markdown content
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    return (
        <div className={`prose prose-sm max-w-none ${className}`}>
            {renderMarkdown(content)}
        </div>
    );
}
