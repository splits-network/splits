'use client';

interface NotificationFiltersProps {
    filter: 'all' | 'unread';
    onFilterChange: (filter: 'all' | 'unread') => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    categories: string[];
    unreadCount: number;
}

export default function NotificationFilters({
    filter,
    onFilterChange,
    selectedCategory,
    onCategoryChange,
    categories,
    unreadCount
}: NotificationFiltersProps) {
    return (
        <div className="card bg-base-100 shadow mb-4">
            <div className="card-body p-4">
                <div className="flex flex-wrap gap-4">
                    {/* Read/Unread Filter */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => onFilterChange('all')}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => onFilterChange('unread')}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="badge badge-sm">{unreadCount}</span>
                            )}
                        </button>
                    </div>

                    {/* Category Filter */}
                    {categories.length > 1 && (
                        <div className="flex gap-2 items-center">
                            <span className="text-sm text-base-content/60">Category:</span>
                            <select
                                className="select select-sm select-bordered"
                                value={selectedCategory}
                                onChange={(e) => onCategoryChange(e.target.value)}
                            >
                                {categories.map((cat) => {
                                    const label = cat === 'all' ? 'All Categories' : (cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : '');
                                    return (
                                        <option key={cat} value={cat}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}