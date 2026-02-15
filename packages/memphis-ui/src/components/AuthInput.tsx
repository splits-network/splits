import React, { useState } from 'react';

export interface AuthInputProps {
    /** Input label text (displayed uppercase) */
    label: string;
    /** Input value */
    value: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** HTML input type */
    type?: 'text' | 'email' | 'password' | 'tel' | 'url';
    /** Placeholder text */
    placeholder?: string;
    /** Error message. When set, the border turns coral. */
    error?: string;
    /** Show password toggle for password fields */
    showPasswordToggle?: boolean;
    /** Additional className for the outer fieldset */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
    cream: '#F5F0EB',
    coral: '#FF6B6B',
};

/**
 * AuthInput - Memphis-styled form input with label and error state
 *
 * Thick 3px border, cream background, uppercase label.
 * Supports password visibility toggle. Extracted from auth-six showcase.
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
        <fieldset className={className}>
            <label
                className="block text-xs font-black uppercase tracking-[0.15em] mb-2"
                style={{ color: COLORS.dark }}
            >
                {label}
            </label>
            <div className="relative">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    type={resolvedType}
                    className={[
                        'w-full px-4 py-3 border-3 text-sm font-semibold outline-none',
                        isPassword && showPasswordToggle ? 'pr-12' : '',
                    ].filter(Boolean).join(' ')}
                    style={{
                        borderColor: error ? COLORS.coral : COLORS.dark,
                        backgroundColor: COLORS.cream,
                        color: COLORS.dark,
                    }}
                />
                {isPassword && showPasswordToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: COLORS.dark, opacity: 0.4 }}
                    >
                        <i className={`fa-duotone fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                    </button>
                )}
            </div>
            {error && (
                <p className="text-xs font-bold mt-1" style={{ color: COLORS.coral }}>{error}</p>
            )}
        </fieldset>
    );
}
