import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

/**
 * Memphis Input
 *
 * Sharp corners, thick border, flat styling.
 * Focus state uses coral border color.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <fieldset className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block font-bold text-sm uppercase tracking-wider text-dark mb-2"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={[
                        'w-full border-4 border-dark px-4 py-2.5',
                        'bg-white text-dark text-base',
                        'focus:outline-none focus:border-coral',
                        'placeholder:text-dark/40',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error ? 'border-coral' : '',
                        className,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm font-bold text-coral">{error}</p>
                )}
            </fieldset>
        );
    }
);

Input.displayName = 'Input';
