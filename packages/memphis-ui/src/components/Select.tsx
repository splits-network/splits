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
 * Sharp corners, thick border, flat styling.
 * Custom caret via CSS, no native browser styling.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <fieldset className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block font-bold text-sm uppercase tracking-wider text-dark mb-2"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={[
                        'w-full border-4 border-dark px-4 py-2.5',
                        'bg-white text-dark text-base',
                        'focus:outline-none focus:border-coral',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'appearance-none cursor-pointer',
                        error ? 'border-coral' : '',
                        className,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231A1A2E' stroke-width='3' stroke-linecap='square'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '40px',
                    }}
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
                    <p className="mt-1 text-sm font-bold text-coral">{error}</p>
                )}
            </fieldset>
        );
    }
);

Select.displayName = 'Select';
