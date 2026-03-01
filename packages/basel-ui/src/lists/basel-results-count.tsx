export interface BaselResultsCountProps {
    count: number;
    total: number;
    label?: string;
}

export function BaselResultsCount({ count, total, label = 'results' }: BaselResultsCountProps) {
    return (
        <span className="text-sm uppercase tracking-wider text-base-content/40 font-bold">
            {count} of {total} {label}
        </span>
    );
}
