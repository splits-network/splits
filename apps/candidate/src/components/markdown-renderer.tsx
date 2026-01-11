/**
 * Simple markdown renderer for basic text formatting
 * Supports: **bold**, *italic*, bullet points (- item)
 */

import React, { ReactElement } from 'react';

export function renderMarkdown(text: string): ReactElement[] {
    const lines = text.split('\n');
    const elements: ReactElement[] = [];
    let listItems: ReactElement[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Handle bullet points
        if (line.trim().startsWith('- ')) {
            const content = line.trim().substring(2);
            const formatted = formatInlineMarkdown(content);
            listItems.push(
                <li
                    key={i}
                    dangerouslySetInnerHTML={{ __html: formatted }}
                />
            );
            continue;
        }

        // If we were in a list, close it
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
                    {listItems}
                </ul>
            );
            listItems = [];
        }

        // Handle empty lines
        if (line.trim() === '') {
            elements.push(<br key={i} />);
            continue;
        }

        // Handle regular paragraphs with inline formatting
        const formatted = formatInlineMarkdown(line);
        elements.push(
            <p
                key={i}
                className="mb-2"
                dangerouslySetInnerHTML={{ __html: formatted }}
            />
        );
    }

    // Close any remaining list
    if (listItems.length > 0) {
        elements.push(
            <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
                {listItems}
            </ul>
        );
    }

    return elements;
}

function formatInlineMarkdown(text: string): string {
    // Bold: **text**
    let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    return formatted;
}

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    if (!content) return null;

    return (
        <div className="prose prose-sm max-w-none">
            {renderMarkdown(content)}
        </div>
    );
}
