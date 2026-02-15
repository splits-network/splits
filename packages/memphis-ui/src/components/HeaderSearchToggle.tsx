import React from 'react';

export interface HeaderSearchToggleProps {
    isOpen: boolean;
    onToggle: () => void;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSubmit?: (value: string) => void;
    className?: string;
}

const COLORS = {
    teal: '#4ECDC4',
    navy: '#1A1A2E',
    darkGray: '#2D2D44',
};

export function HeaderSearchToggle({
    isOpen,
    onToggle,
    placeholder = 'SEARCH THE NETWORK...',
    value,
    onChange,
    onSubmit,
    className = '',
}: HeaderSearchToggleProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onSubmit) {
            onSubmit((e.target as HTMLInputElement).value);
        }
        if (e.key === 'Escape') {
            onToggle();
        }
    };

    return (
        <div style={{ position: 'relative' }} className={className}>
            <button
                onClick={onToggle}
                style={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `4px solid ${isOpen ? COLORS.teal : COLORS.darkGray}`,
                    color: isOpen ? COLORS.teal : 'rgba(255,255,255,0.5)',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
            >
                <i className={`fa-duotone fa-regular ${isOpen ? 'fa-xmark' : 'fa-magnifying-glass'}`}
                    style={{ fontSize: 14 }}
                />
            </button>
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 8,
                        width: 380,
                        border: `4px solid ${COLORS.teal}`,
                        backgroundColor: COLORS.navy,
                        padding: 16,
                        zIndex: 50,
                    }}
                >
                    {/* Search label */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 12,
                    }}>
                        <div style={{ width: 6, height: 20, backgroundColor: COLORS.teal }} />
                        <span style={{
                            fontSize: 10,
                            fontWeight: 900,
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.15em',
                            color: COLORS.teal,
                        }}>
                            Search
                        </span>
                    </div>

                    {/* Input row */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="text"
                            placeholder={placeholder}
                            autoFocus
                            value={value}
                            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                            onKeyDown={handleKeyDown}
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                border: `4px solid ${COLORS.darkGray}`,
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                color: '#FFFFFF',
                                fontSize: 12,
                                fontWeight: 700,
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.1em',
                                outline: 'none',
                            }}
                        />
                        <button
                            onClick={() => onSubmit?.(value || '')}
                            style={{
                                width: 44,
                                height: 44,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `4px solid ${COLORS.teal}`,
                                backgroundColor: COLORS.teal,
                                color: COLORS.navy,
                                cursor: 'pointer',
                                flexShrink: 0,
                            }}
                        >
                            <i className="fa-duotone fa-regular fa-arrow-right" style={{ fontSize: 14 }} />
                        </button>
                    </div>

                    {/* Hint text */}
                    <div style={{
                        marginTop: 10,
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.15em',
                        color: 'rgba(255,255,255,0.25)',
                    }}>
                        Press Enter to search · Esc to close
                    </div>

                    {/* Accent bar */}
                    <div style={{
                        display: 'flex',
                        marginTop: 12,
                        marginLeft: -16,
                        marginRight: -16,
                        marginBottom: -16,
                    }}>
                        <div style={{ flex: 1, height: 4, backgroundColor: '#FF6B6B' }} />
                        <div style={{ flex: 1, height: 4, backgroundColor: '#4ECDC4' }} />
                        <div style={{ flex: 1, height: 4, backgroundColor: '#FFE66D' }} />
                        <div style={{ flex: 1, height: 4, backgroundColor: '#A78BFA' }} />
                    </div>
                </div>
            )}
        </div>
    );
}
