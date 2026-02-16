"use client";

import React, { useState } from 'react';

export interface AuthInputProps {
    /** Input label text (displayed uppercase via fieldset-legend) */
    label: string;
    /** Input value */
    value: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** HTML input type */
    type?: 'text' | 'email' | 'password' | 'tel' | 'url';
    /** Placeholder text */
    placeholder?: string;
    /** Error message. When set, the input shows error state. */
    error?: string;
    /** Show password toggle for password fields */
    showPasswordToggle?: boolean;
    /** Additional className for the outer fieldset */
    className?: string;
}

/**
 * AuthInput - Memphis-styled form input with label and error state
 *
 * Uses .fieldset wrapper, .fieldset-legend for the label (uppercase +
 * letter-spacing), .input for the field, .btn for the toggle, .label for errors.
 */
export function AuthInput({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    error,
    showPasswordToggle = false,
    className = '',
}: AuthInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword && showPassword ? 'text' : type;

    return (
        <fieldset className={['fieldset', className].filter(Boolean).join(' ')}>
            <legend className="fieldset-legend">{label}</legend>
            <div className="relative">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    type={resolvedType}
                    className={[
                        'input w-full',
                        error ? 'input-error' : '',
                        isPassword && showPasswordToggle ? 'pr-12' : '',
                    ].filter(Boolean).join(' ')}
                />
                {isPassword && showPasswordToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn btn-ghost btn-xs btn-square absolute right-2 top-1/2 -translate-y-1/2"
                    >
                        <i className={`fa-duotone fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                )}
            </div>
            {error && error.trim() && (
                <p className="label text-error">{error}</p>
            )}
        </fieldset>
    );
}
