'use client';

export interface VerticalDataRowProps {
    /** Label text */
    label: string;
    /** Label color */
    labelColor?: string;
    /** Value to display */
    value?: string | number;
    /** Icon class (FontAwesome) */
    icon?: string;
    /** Custom content (overrides value) */
    children?: React.ReactNode;
}

export function VerticalDataRow({ label, labelColor = 'text-base-content/70', value, icon, children }: VerticalDataRowProps) {
    const isPlaceholder = value === 'Not provided';
    const valueClass = isPlaceholder ? 'text-sm text-base-content/40 italic' : 'font-medium tabular-nums';

    return (
        <div className="flex flex-col gap-1 py-2">
            <span className={`text-sm ${labelColor} font-medium flex items-center gap-2`}>
                {icon && <i className={`fa-duotone fa-regular ${icon} text-xs`}></i>}
                {label}
            </span>
            {children ? (
                <div className="w-full">
                    {children}
                </div>
            ) : (
                <span className={valueClass}>{value}</span>
            )}
        </div>
    );
}
