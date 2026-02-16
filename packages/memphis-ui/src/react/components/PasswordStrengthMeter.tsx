import React from 'react';

export interface PasswordStrengthMeterProps {
    /** The password string to evaluate */
    password: string;
    /** Additional className */
    className?: string;
}

function calculateStrength(pw: string): { level: number; label: string; bgClass: string; textClass: string } {
    if (!pw) return { level: 0, label: '', bgClass: 'bg-dark', textClass: 'text-dark' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', bgClass: 'bg-coral', textClass: 'text-coral' };
    if (score <= 2) return { level: 2, label: 'Fair', bgClass: 'bg-yellow', textClass: 'text-yellow' };
    if (score <= 3) return { level: 3, label: 'Good', bgClass: 'bg-teal', textClass: 'text-teal' };
    return { level: 4, label: 'Strong', bgClass: 'bg-teal', textClass: 'text-teal' };
}

/**
 * PasswordStrengthMeter - Visual password strength indicator
 *
 * Displays a 4-segment bar that fills based on password complexity.
 * Uses Memphis colors: coral (weak), yellow (fair), teal (good/strong).
 * Extracted from auth-six showcase.
 */
export function PasswordStrengthMeter({ password, className = '' }: PasswordStrengthMeterProps) {
    const strength = calculateStrength(password);

    if (!password) return null;

    return (
        <div className={['mt-2 flex items-center gap-2', className].filter(Boolean).join(' ')}>
            <div className="flex-1 flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={`flex-1 h-1.5 ${level <= strength.level ? strength.bgClass : 'bg-dark/10'}`}
                    />
                ))}
            </div>
            <span className={`text-[10px] font-bold uppercase ${strength.textClass}`}>
                {strength.label}
            </span>
        </div>
    );
}
