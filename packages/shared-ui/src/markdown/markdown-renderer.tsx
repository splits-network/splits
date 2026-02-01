import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import type { Pluggable } from 'unified';

export interface MarkdownRendererProps {
    content: string;
    className?: string;
}

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

const components: Components = {
    a: ({ node: _node, ...props }) => (
        <a {...props} rel="nofollow noreferrer noopener" target="_blank" />
    ),
};

const isSafeUrl = (href: string) => {
    const value = href.trim().toLowerCase();
    return !(value.startsWith('javascript:') || value.startsWith('data:'));
};

const urlTransform = (href?: string) => {
    if (!href) return '';
    return isSafeUrl(href) ? href : '';
};

const remarkPlugins: Pluggable[] = [remarkGfm];
const rehypePlugins: Pluggable[] = [[rehypeSanitize, allowedSchema]];

export const markdownRenderConfig = {
    remarkPlugins,
    rehypePlugins,
    components,
    skipHtml: true,
    urlTransform,
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    if (!content) return null;

    return (
        <div className={className}>
            <ReactMarkdown {...markdownRenderConfig}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
