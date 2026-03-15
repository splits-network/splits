export interface BaselFilterSelectProps {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    options: Array<{ value: string; label: string }>;
    placeholder: string;
    className?: string;
}

export function BaselFilterSelect({
    value,
    onChange,
    options,
    placeholder,
    className,
}: BaselFilterSelectProps) {
    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className={`select select-sm w-auto uppercase rounded-none ${className ?? ''}`}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}
