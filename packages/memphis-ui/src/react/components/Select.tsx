import React from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

/**
 * Memphis Select
 *
 * Uses the .select CSS class from select.css.
 * Label follows showcase/forms/six pattern.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <fieldset className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="flex items-center gap-1 text-sm font-black uppercase tracking-[0.15em] text-dark mb-2"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={[
                        'select w-full',
                        error ? 'select-error' : '',
                        className,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="text-sm font-bold text-error mt-1.5">{error}</p>
                )}
            </fieldset>
        );
    }
);

Select.displayName = 'Select';
