import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

/**
 * Memphis Input
 *
 * Uses the .input CSS class from input.css.
 * Label follows showcase/forms/six pattern.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <fieldset className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="flex items-center gap-1 text-sm font-black uppercase tracking-[0.15em] text-dark mb-2"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={[
                        'input w-full',
                        error ? 'input-error' : '',
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

Input.displayName = 'Input';
