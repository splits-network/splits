'use client';

import React, { useEffect, useRef, useState } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import type { ICommand } from '@uiw/react-md-editor';
import type { MarkdownPreviewProps } from '@uiw/react-markdown-preview';
import { markdownRenderConfig } from './markdown-renderer';

export interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    helperText?: string;
    maxLength?: number;
    showCount?: boolean;
    height?: number;
    preview?: 'edit' | 'live' | 'preview';
    className?: string;
    toolbarCommands?: ICommand[];
    disabled?: boolean;
    textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

export const markdownToolbarCommands: ICommand[] = [
    commands.title,
    commands.divider,
    commands.bold,
    commands.italic,
    commands.divider,
    commands.link,
    commands.divider,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.divider,
    commands.code,
    commands.codeBlock,
];

export function MarkdownEditor({
    value,
    onChange,
    placeholder,
    label,
    helperText,
    maxLength,
    showCount,
    height = 240,
    preview = 'live',
    className,
    toolbarCommands = markdownToolbarCommands,
    disabled = false,
    textareaProps,
}: MarkdownEditorProps) {
    const handleChange = (nextValue?: string) => {
        const safeValue = nextValue ?? '';
        if (maxLength && safeValue.length > maxLength) return;
        onChange(safeValue);
    };

    const {
        value: _ignoredValue,
        onScroll: _ignoredScroll,
        ...safeTextareaProps
    } = (textareaProps ?? {}) as React.TextareaHTMLAttributes<HTMLTextAreaElement>;

    const previewOptions: MarkdownPreviewProps = {
        ...markdownRenderConfig,
    };

    const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
    const hostRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const resolveTheme = () => {
            if (typeof document === 'undefined') return;
            const theme = document.documentElement.getAttribute('data-theme') || '';
            const isDark = theme.includes('dark');
            setColorMode(isDark ? 'dark' : 'light');
        };

        resolveTheme();

        const observer = new MutationObserver(resolveTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const host = hostRef.current;
        if (!host) return;

        const editor = host.querySelector('.w-md-editor') as HTMLElement | null;
        if (!editor) return;

        const placeholder = document.createElement('div');
        const originalParent = editor.parentElement;

        const applyFullscreen = () => {
            const isFullscreen = editor.classList.contains('w-md-editor-fullscreen');
            if (isFullscreen && editor.parentElement !== document.body) {
                originalParent?.insertBefore(placeholder, editor);
                document.body.appendChild(editor);
            } else if (!isFullscreen && editor.parentElement === document.body) {
                if (placeholder.parentElement) {
                    placeholder.parentElement.insertBefore(editor, placeholder);
                    placeholder.remove();
                }
            }
        };

        applyFullscreen();

        const classObserver = new MutationObserver(applyFullscreen);
        classObserver.observe(editor, { attributes: true, attributeFilter: ['class'] });

        return () => {
            classObserver.disconnect();
            if (editor.parentElement === document.body && placeholder.parentElement) {
                placeholder.parentElement.insertBefore(editor, placeholder);
                placeholder.remove();
            }
        };
    }, []);

    return (
        <fieldset className={className} data-color-mode={colorMode}>
            {label && (
                <legend className="fieldset-legend">
                    {label}
                    {(showCount || maxLength) && (
                        <span className="text-base-content/60 font-normal text-sm ml-2">
                            ({value.length}{maxLength ? `/${maxLength}` : ''} characters)
                        </span>
                    )}
                </legend>
            )}

            <div className="wmde-markdown-var" />
            <div ref={hostRef}>
                <MDEditor
                    value={value}
                    onChange={handleChange}
                    preview={preview}
                    height={height}
                    commands={toolbarCommands}
                    textareaProps={{
                        placeholder,
                        disabled,
                        ...safeTextareaProps,
                    }}
                    previewOptions={previewOptions}
                />
            </div>

            {helperText && (
                <p className="fieldset-label">
                    <i className="fa-duotone fa-regular fa-lightbulb"></i>
                    {helperText}
                </p>
            )}
        </fieldset>
    );
}
