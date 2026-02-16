import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

/**
 * Memphis Textarea
 *
 * Uses the .textarea CSS class from textarea.css.
 * Label follows showcase/forms/six pattern.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <fieldset className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="flex items-center gap-1 text-sm font-black uppercase tracking-[0.15em] text-dark mb-2"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={[
                        'textarea w-full',
                        error ? 'textarea-error' : '',
                        className,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    {...props}
                />
                {error && (
                    <p className="text-sm font-bold text-error mt-1.5">{error}</p>
                )}
            </fieldset>
        );
    }
);

Textarea.displayName = 'Textarea';
