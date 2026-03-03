"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface SkillOption {
    id: string;
    name: string;
    slug: string;
}

export interface BaselSkillPickerProps {
    /** Currently selected skills */
    selectedSkills: SkillOption[];
    /** Called when skills change */
    onSkillsChange: (skills: SkillOption[]) => void;
    /** Search function — caller provides the API call */
    searchFn: (query: string) => Promise<SkillOption[]>;
    /** Create function — caller provides the API call */
    createFn: (name: string) => Promise<SkillOption>;
    /** Input placeholder */
    placeholder?: string;
    /** Maximum number of skills allowed */
    maxSkills?: number;
    /** Label text */
    label?: string;
    /** Additional className on the container */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function BaselSkillPicker({
    selectedSkills,
    onSkillsChange,
    searchFn,
    createFn,
    placeholder = "Search skills...",
    maxSkills,
    label,
    className,
}: BaselSkillPickerProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SkillOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const selectedIds = new Set(selectedSkills.map((s) => s.id));
    const atMax = maxSkills ? selectedSkills.length >= maxSkills : false;

    // Filter out already-selected skills from results
    const filteredResults = results.filter((r) => !selectedIds.has(r.id));

    // Check if query exactly matches a result (case-insensitive)
    const exactMatch = filteredResults.some(
        (r) => r.name.toLowerCase() === query.trim().toLowerCase(),
    );
    const showCreateOption = query.trim().length >= 2 && !exactMatch && !atMax;

    // Total items in dropdown (results + optional create)
    const totalItems = filteredResults.length + (showCreateOption ? 1 : 0);

    const search = useCallback(
        async (q: string) => {
            if (q.trim().length < 1) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            try {
                const data = await searchFn(q.trim());
                setResults(data);
                setIsOpen(true);
                setHighlightIndex(-1);
            } catch {
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        },
        [searchFn],
    );

    const handleInputChange = useCallback(
        (value: string) => {
            setQuery(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => search(value), 300);
        },
        [search],
    );

    const addSkill = useCallback(
        (skill: SkillOption) => {
            if (atMax || selectedIds.has(skill.id)) return;
            onSkillsChange([...selectedSkills, skill]);
            setQuery("");
            setResults([]);
            setIsOpen(false);
            inputRef.current?.focus();
        },
        [selectedSkills, onSkillsChange, atMax, selectedIds],
    );

    const removeSkill = useCallback(
        (skillId: string) => {
            onSkillsChange(selectedSkills.filter((s) => s.id !== skillId));
        },
        [selectedSkills, onSkillsChange],
    );

    const handleCreate = useCallback(async () => {
        if (!query.trim() || atMax) return;
        setIsLoading(true);
        try {
            const skill = await createFn(query.trim());
            addSkill(skill);
        } catch {
            // Silently fail — user can retry
        } finally {
            setIsLoading(false);
        }
    }, [query, createFn, addSkill, atMax]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!isOpen && e.key !== "Escape") return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setHighlightIndex((i) => Math.min(i + 1, totalItems - 1));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setHighlightIndex((i) => Math.max(i - 1, 0));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (highlightIndex >= 0 && highlightIndex < filteredResults.length) {
                        addSkill(filteredResults[highlightIndex]);
                    } else if (highlightIndex === filteredResults.length && showCreateOption) {
                        handleCreate();
                    } else if (showCreateOption) {
                        handleCreate();
                    }
                    break;
                case "Escape":
                    setIsOpen(false);
                    setHighlightIndex(-1);
                    break;
            }
        },
        [isOpen, highlightIndex, filteredResults, totalItems, showCreateOption, addSkill, handleCreate],
    );

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={className}>
            {label && (
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/50 mb-2 block">
                    {label}
                </label>
            )}

            {/* Selected skills chips */}
            {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSkills.map((skill) => (
                        <span
                            key={skill.id}
                            className="badge badge-primary gap-1.5 font-semibold"
                        >
                            {skill.name}
                            <button
                                type="button"
                                onClick={() => removeSkill(skill.id)}
                                className="hover:opacity-70"
                                aria-label={`Remove ${skill.name}`}
                            >
                                <i className="fa-solid fa-xmark text-xs" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Search input with dropdown */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    className="input input-bordered w-full rounded-none"
                    placeholder={atMax ? `Maximum ${maxSkills} skills reached` : placeholder}
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => query.trim().length >= 1 && results.length > 0 && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    disabled={atMax}
                />
                {isLoading && (
                    <span className="loading loading-spinner loading-xs absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                )}

                {/* Dropdown results */}
                {isOpen && totalItems > 0 && (
                    <div
                        ref={dropdownRef}
                        className="absolute z-50 top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 shadow-lg max-h-60 overflow-y-auto"
                    >
                        <ul className="menu menu-sm p-1 gap-0.5">
                            {filteredResults.map((skill, i) => (
                                <li key={skill.id}>
                                    <button
                                        type="button"
                                        className={`rounded-none ${i === highlightIndex ? "active" : ""}`}
                                        onClick={() => addSkill(skill)}
                                    >
                                        <i className="fa-duotone fa-regular fa-tag text-xs text-base-content/40" />
                                        {skill.name}
                                    </button>
                                </li>
                            ))}
                            {showCreateOption && (
                                <li>
                                    <button
                                        type="button"
                                        className={`rounded-none text-primary font-semibold ${highlightIndex === filteredResults.length ? "active" : ""}`}
                                        onClick={handleCreate}
                                    >
                                        <i className="fa-duotone fa-regular fa-plus text-xs" />
                                        Create &ldquo;{query.trim()}&rdquo;
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {maxSkills && (
                <p className="text-xs text-base-content/30 mt-1.5">
                    {selectedSkills.length} / {maxSkills} skills selected
                </p>
            )}
        </div>
    );
}
