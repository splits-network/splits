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
    placeholder = "Search...",
    loading = false,
    className = "",
}: SearchInputProps) {
    return (
        <label className="input">
            <i className="fa-duotone fa-regular fa-search"></i>
            <input
                type="text"
                placeholder={placeholder}
                className=""
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {loading ? (
                <span className="loading loading-spinner loading-sm absolute right-3 top-1/2 -translate-y-1/2"></span>
            ) : value && onClear ? (
                <button
                    className="btn btn-ghost btn-xs btn-square absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={onClear}
                >
                    <i className="fa-duotone fa-regular fa-times"></i>
                </button>
            ) : null}
        </label>
    );
}
