type AdminLoadingStateProps = {
    variant?: 'card' | 'table';
    rows?: number;
};

function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="overflow-x-auto">
            <table className="table table-sm w-full">
                <thead>
                    <tr>
                        {[40, 120, 100, 80, 60].map((w, i) => (
                            <th key={i}>
                                <div className="skeleton h-3 rounded" style={{ width: w }} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i}>
                            {[60, 140, 100, 80, 40].map((w, j) => (
                                <td key={j}>
                                    <div className="skeleton h-3 rounded" style={{ width: w }} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function CardSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card bg-base-100 shadow">
                    <div className="card-body gap-3">
                        <div className="skeleton h-4 w-3/4 rounded" />
                        <div className="skeleton h-3 w-full rounded" />
                        <div className="skeleton h-3 w-2/3 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function AdminLoadingState({ variant = 'table', rows }: AdminLoadingStateProps) {
    if (variant === 'card') return <CardSkeleton />;
    return <TableSkeleton rows={rows} />;
}
