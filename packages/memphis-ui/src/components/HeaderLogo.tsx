import React from 'react';

export type LogoBrand = 'splits' | 'applicant' | 'employment';

export interface HeaderLogoProps {
    brand?: LogoBrand;
    size?: 'sm' | 'md';
    className?: string;
}

const BRANDS: Record<LogoBrand, {
    initials: string;
    name: string;
    subtitle: string;
    color: string;
    dotColor: string;
}> = {
    splits: {
        initials: 'SN',
        name: 'Splits',
        subtitle: 'Network',
        color: '#FF6B6B',   // coral
        dotColor: '#4ECDC4', // teal
    },
    applicant: {
        initials: 'AN',
        name: 'Applicant',
        subtitle: 'Network',
        color: '#4ECDC4',   // teal
        dotColor: '#FF6B6B', // coral
    },
    employment: {
        initials: 'EN',
        name: 'Employment',
        subtitle: 'Networks',
        color: '#FFE66D',   // yellow
        dotColor: '#A78BFA', // purple
    },
};

const SIZES = {
    sm: { box: 'w-9 h-9', text: 'text-[11px]', name: 'text-sm', sub: 'text-[8px]', dot: 'w-2.5 h-2.5', tracking: 'tracking-[0.12em]' },
    md: { box: 'w-11 h-11', text: 'text-sm', name: 'text-base', sub: 'text-[9px]', dot: 'w-3 h-3', tracking: 'tracking-[0.15em]' },
};

export function HeaderLogo({ brand = 'splits', size = 'md', className = '' }: HeaderLogoProps) {
    const s = SIZES[size];
    const b = BRANDS[brand];
    const textOnBg = brand === 'employment' ? '#1A1A2E' : '#FFFFFF';

    return (
        <div className={['flex items-center gap-3', className].filter(Boolean).join(' ')}>
            <div className="relative">
                <div
                    className={`${s.box} flex items-center justify-center border-[3px]`}
                    style={{ borderColor: b.color, backgroundColor: b.color }}
                >
                    <span className={`${s.text} font-black tracking-tight`} style={{ color: textOnBg }}>
                        {b.initials}
                    </span>
                </div>
                <div
                    className={`absolute -top-1 -right-1 ${s.dot} rounded-full`}
                    style={{ backgroundColor: b.dotColor }}
                />
            </div>
            <div>
                <div
                    className={`${s.name} font-black uppercase ${s.tracking} leading-none`}
                    style={{ color: '#FFFFFF' }}
                >
                    {b.name}
                </div>
                <div
                    className={`${s.sub} font-bold uppercase tracking-[0.25em]`}
                    style={{ color: b.color }}
                >
                    {b.subtitle}
                </div>
            </div>
        </div>
    );
}
