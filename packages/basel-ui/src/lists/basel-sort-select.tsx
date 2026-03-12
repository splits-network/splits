export interface BaselSortOption {
    value: string;
    label: string;
}

export interface BaselSortSelectProps {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (field: string, order: 'asc' | 'desc') => void;
    options: BaselSortOption[];
}

export function BaselSortSelect({
    sortBy,
    sortOrder,
    onSortChange,
    options,
}: BaselSortSelectProps) {
    const currentValue = `${sortBy}:${sortOrder}`;

    return (
        <select
            value={currentValue}
            onChange={(e) => {
                const [field, order] = e.target.value.split(':');
                onSortChange(field, order as 'asc' | 'desc');
            }}
            className="select select-sm w-auto uppercase rounded-none"
        >
            {options.map((opt) => (
                <optgroup key={opt.value} label={opt.label}>
                    <option value={`${opt.value}:desc`}>
                        {opt.label} — Newest
                    </option>
                    <option value={`${opt.value}:asc`}>
                        {opt.label} — Oldest
                    </option>
                </optgroup>
            ))}
        </select>
    );
}