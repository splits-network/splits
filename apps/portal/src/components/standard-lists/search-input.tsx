
interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
    placeholder?: string;
    loading?: boolean;
    className?: string;
}

export function SearchInput({
    value,
    onChange,
    onClear,
    placeholder = 'Search...',
    loading = false,
    className = '',
}: SearchInputProps) {
    return (
        <div className={`relative ${className}`}>
            <label className='input'>
                <span className="sr-only">Search</span>
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"></i>
                <input
                    type="text"
                    placeholder={placeholder}
                    className="inputw-full pl-10 pr-10"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    name="search-input"
                />
            </label>
            {/* Currently disabled as its not working properly with the list filtering */}
            {/* {loading ? (
                <span className="loading loading-spinner loading-sm absolute right-3 top-1/2 -translate-y-1/2"></span>
            ) : value && onClear ? (
                <button
                    className="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={onClear}
                >
                    <i className="fa-solid fa-times"></i>
                </button>
            ) : null} */}
        </div>
    );
}