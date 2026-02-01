import { MarkdownRenderer as SharedMarkdownRenderer } from "@splits-network/shared-ui";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
    if (!content) return null;

    return (
        <SharedMarkdownRenderer
            content={content}
            className={`prose prose-sm max-w-none ${className}`.trim()}
        />
    );
}
