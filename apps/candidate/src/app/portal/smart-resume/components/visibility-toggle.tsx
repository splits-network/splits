"use client";

interface VisibilityToggleProps {
    visible: boolean;
    onToggle: () => void;
    loading?: boolean;
}

export function VisibilityToggle({
    visible,
    onToggle,
    loading,
}: VisibilityToggleProps) {
    return (
        <div className="tooltip" data-tip={visible ? "Visible to recruiters" : "Hidden from matching"}>
            <button
                type="button"
                onClick={onToggle}
                disabled={loading}
                className={`btn btn-ghost btn-xs ${
                    visible ? "text-success" : "text-base-content/30"
                }`}
            >
                {loading ? (
                    <span className="loading loading-spinner loading-xs" />
                ) : (
                    <i
                        className={`fa-duotone fa-regular ${
                            visible ? "fa-eye" : "fa-eye-slash"
                        }`}
                    />
                )}
            </button>
        </div>
    );
}
