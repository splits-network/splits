export interface BaselScopeToggleProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
}

export function BaselScopeToggle({ value, onChange, options }: BaselScopeToggleProps) {
    return (
        <div className="join">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`join-item btn btn-sm rounded-none ${
                        value === opt.value ? 'btn-active' : ''
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}