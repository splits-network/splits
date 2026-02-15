import React from 'react';

export interface PasswordStrengthMeterProps {
    /** The password string to evaluate */
    password: string;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
    coral: '#FF6B6B',
    teal: '#4ECDC4',
    yellow: '#FFE66D',
};

function calculateStrength(pw: string): { level: number; label: string; color: string } {
    if (!pw) return { level: 0, label: '', color: COLORS.dark };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: COLORS.coral };
    if (score <= 2) return { level: 2, label: 'Fair', color: COLORS.yellow };
    if (score <= 3) return { level: 3, label: 'Good', color: COLORS.teal };
    return { level: 4, label: 'Strong', color: COLORS.teal };
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
                        className="flex-1 h-1.5"
                        style={{
                            backgroundColor: level <= strength.level ? strength.color : 'rgba(26,26,46,0.1)',
                        }}
                    />
                ))}
            </div>
            <span
                className="text-[10px] font-bold uppercase"
                style={{ color: strength.color }}
            >
                {strength.label}
            </span>
        </div>
    );
}
