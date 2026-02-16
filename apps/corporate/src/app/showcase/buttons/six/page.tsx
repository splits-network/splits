"use client";

import { useState } from "react";
import {
    Button,
    GeometricDecoration,
    AccentCycle,
    HeaderCta,
    ACCENT_HEX,
    ACCENT_TEXT,
    type AccentColor,
} from "@splits-network/memphis-ui";

// ─── Inline Memphis Components (not yet in dist) ───────────────────────────
// These mirror the source SectionDivider and ColorBar exactly.

function SectionDivider({
    label,
    icon,
    accent = "purple",
    className = "",
}: {
    label: string;
    icon?: string;
    accent?: AccentColor;
    className?: string;
}) {
    const hex = ACCENT_HEX[accent];
    const textHex = ACCENT_TEXT[accent];
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <span
                className="px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em]"
                style={{ backgroundColor: hex, color: textHex }}
            >
                {icon && <i className={`${icon} mr-2`} />}
                {label}
            </span>
            <div className="flex-1 h-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
        </div>
    );
}

function ColorBar({
    height = "h-1.5",
    className = "",
}: {
    height?: string;
    className?: string;
}) {
    return (
        <div className={`flex ${height} ${className}`}>
            <div className="flex-1" style={{ backgroundColor: ACCENT_HEX.coral }} />
            <div className="flex-1" style={{ backgroundColor: ACCENT_HEX.teal }} />
            <div className="flex-1" style={{ backgroundColor: ACCENT_HEX.yellow }} />
            <div className="flex-1" style={{ backgroundColor: ACCENT_HEX.purple }} />
        </div>
    );
}

// ─── Section Wrapper ────────────────────────────────────────────────────────
function Section({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={`mb-16 ${className}`}>{children}</section>
    );
}

// ─── Description Block ──────────────────────────────────────────────────────
function Desc({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-sm text-cream/60 mt-2 mb-6 max-w-2xl font-semibold">
            {children}
        </p>
    );
}

// ─── Subsection Label ───────────────────────────────────────────────────────
function SubLabel({ children }: { children: React.ReactNode }) {
    return (
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cream/40 mb-4 mt-8">
            {children}
        </h4>
    );
}

// ─── Row for displaying buttons ─────────────────────────────────────────────
function ButtonRow({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`flex flex-wrap items-center gap-4 ${className}`}>
            {children}
        </div>
    );
}

// ─── Main Showcase Page ─────────────────────────────────────────────────────
export default function ButtonsSixPage() {
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [activeView, setActiveView] = useState<"grid" | "list" | "table">("grid");

    const simulateLoading = (key: string) => {
        setLoadingStates((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => {
            setLoadingStates((prev) => ({ ...prev, [key]: false }));
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-dark">
            {/* Top Color Bar */}
            <ColorBar height="h-2" />

            {/* ═══════════════════════════════════════════════════════════════
                1. HERO SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 pointer-events-none">
                    <GeometricDecoration
                        shape="circle"
                        color="coral"
                        size={80}
                        className="absolute top-12 right-[15%] opacity-20"
                    />
                    <GeometricDecoration
                        shape="triangle"
                        color="teal"
                        size={60}
                        className="absolute top-32 left-[8%] opacity-15 rotate-12"
                    />
                    <GeometricDecoration
                        shape="square"
                        color="yellow"
                        size={50}
                        className="absolute bottom-8 right-[25%] opacity-15 rotate-45"
                    />
                    <GeometricDecoration
                        shape="cross"
                        color="purple"
                        size={45}
                        className="absolute top-20 left-[45%] opacity-10"
                    />
                    <GeometricDecoration
                        shape="zigzag"
                        color="coral"
                        size={120}
                        className="absolute bottom-16 left-[20%] opacity-10"
                    />
                </div>

                <div className="relative z-10 container mx-auto px-6 pt-20 pb-16 text-center">
                    {/* Badge */}
                    <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] bg-coral text-white border-4 border-dark mb-8">
                        <i className="fa-duotone fa-regular fa-hand-pointer" />
                        Designer Six Reference
                    </span>

                    {/* Title */}
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight leading-[0.9] text-white mb-6">
                        BUT
                        <span className="relative inline-block">
                            <span className="text-coral">TONS</span>
                            <span className="absolute -bottom-2 left-0 w-full h-3 bg-coral" />
                        </span>
                    </h1>

                    <p className="text-lg text-cream/50 max-w-xl mx-auto font-semibold">
                        The definitive Memphis Design System button reference.
                        Sharp corners, thick borders, bold colors, zero compromise.
                    </p>

                    {/* Decorative shapes row */}
                    <div className="flex items-center justify-center gap-6 mt-10">
                        <AccentCycle count={4}>
                            {(color, i) => {
                                const shapes = ["circle", "square", "triangle", "cross"] as const;
                                return (
                                    <GeometricDecoration
                                        key={i}
                                        shape={shapes[i]}
                                        color={color}
                                        size={32}
                                    />
                                );
                            }}
                        </AccentCycle>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 pb-24">

                {/* ═══════════════════════════════════════════════════════════
                    2. PRIMARY BUTTONS (Coral)
                ═══════════════════════════════════════════════════════════ */}
                <Section>
                    <SectionDivider
                        label="Primary Buttons"
                        icon="fa-duotone fa-regular fa-circle-1"
                        accent="coral"
                        className="mb-4"
                    />
                    <Desc>
                        The primary action button. Coral background signals the most important action on any screen.
                        Use for submits, confirmations, and primary CTAs.
                    </Desc>

                    <SubLabel>Default Variants</SubLabel>
                    <ButtonRow>
                        <Button variant="coral" size="md">
                            Primary Action
                        </Button>
                        <Button variant="coral" size="md">
                            <i className="fa-duotone fa-regular fa-plus mr-2" />
                            With Left Icon
                        </Button>
                        <Button variant="coral" size="md">
                            Continue
                            <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
                        </Button>
                        <Button variant="coral" size="md" className="!px-3">
                            <i className="fa-duotone fa-regular fa-star" />
                        </Button>
                        <Button variant="coral" size="md" disabled>
                            Disabled
                        </Button>
                    </ButtonRow>

                    <SubLabel>Sizes: XS / SM / MD / LG</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-dark bg-coral text-white font-bold uppercase tracking-wide transition-colors cursor-pointer px-3 py-1 text-xs">
                            Extra Small
                        </button>
                        <Button variant="coral" size="sm">
                            Small
                        </Button>
                        <Button variant="coral" size="md">
                            Medium
                        </Button>
                        <Button variant="coral" size="lg">
                            Large
                        </Button>
                    </ButtonRow>
                </Section>

                <GeometricDecoration
                    shape="zigzag"
                    color="teal"
                    size={200}
                    className="block mx-auto mb-12 opacity-30"
                />

                {/* ═══════════════════════════════════════════════════════════
                    3. SECONDARY BUTTONS (Teal)
                ═══════════════════════════════════════════════════════════ */}
                <Section>
                    <SectionDivider
                        label="Secondary Buttons"
                        icon="fa-duotone fa-regular fa-circle-2"
                        accent="teal"
                        className="mb-4"
                    />
                    <Desc>
                        Secondary actions that complement the primary. Teal provides a calming counterbalance.
                        Use for alternative paths, back actions, and secondary confirmations.
                    </Desc>

                    <SubLabel>Default Variants</SubLabel>
                    <ButtonRow>
                        <Button variant="teal" size="md">
                            Secondary Action
                        </Button>
                        <Button variant="teal" size="md">
                            <i className="fa-duotone fa-regular fa-filter mr-2" />
                            With Left Icon
                        </Button>
                        <Button variant="teal" size="md">
                            Export
                            <i className="fa-duotone fa-regular fa-download ml-2" />
                        </Button>
                        <Button variant="teal" size="md" className="!px-3">
                            <i className="fa-duotone fa-regular fa-gear" />
                        </Button>
                        <Button variant="teal" size="md" disabled>
                            Disabled
                        </Button>
                    </ButtonRow>

                    <SubLabel>Sizes: XS / SM / MD / LG</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-dark bg-teal text-dark font-bold uppercase tracking-wide transition-colors cursor-pointer px-3 py-1 text-xs">
                            Extra Small
                        </button>
                        <Button variant="teal" size="sm">
                            Small
                        </Button>
                        <Button variant="teal" size="md">
                            Medium
                        </Button>
                        <Button variant="teal" size="lg">
                            Large
                        </Button>
                    </ButtonRow>
                </Section>

                <div className="flex items-center gap-4 mb-12">
                    <GeometricDecoration shape="square" color="yellow" size={24} />
                    <div className="flex-1 h-1 bg-white/10" />
                    <GeometricDecoration shape="circle" color="purple" size={24} />
                    <div className="flex-1 h-1 bg-white/10" />
                    <GeometricDecoration shape="triangle" color="coral" size={24} />
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    4. ACCENT BUTTONS (Yellow & Purple)
                ═══════════════════════════════════════════════════════════ */}
                <Section>
                    <SectionDivider
                        label="Accent Buttons"
                        icon="fa-duotone fa-regular fa-circle-3"
                        accent="yellow"
                        className="mb-4"
                    />
                    <Desc>
                        Accent buttons for highlighting, warnings, and creative emphasis.
                        Yellow draws attention without urgency. Purple conveys premium or special actions.
                    </Desc>

                    <SubLabel>Yellow Accent</SubLabel>
                    <ButtonRow>
                        <Button variant="yellow" size="md">
                            Highlight Action
                        </Button>
                        <Button variant="yellow" size="md">
                            <i className="fa-duotone fa-regular fa-lightbulb mr-2" />
                            With Icon
                        </Button>
                        <Button variant="yellow" size="md">
                            Upgrade
                            <i className="fa-duotone fa-regular fa-arrow-up ml-2" />
                        </Button>
                        <Button variant="yellow" size="md" className="!px-3">
                            <i className="fa-duotone fa-regular fa-bell" />
                        </Button>
                        <Button variant="yellow" size="md" disabled>
                            Disabled
                        </Button>
                    </ButtonRow>

                    <SubLabel>Yellow Sizes</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-dark bg-yellow text-dark font-bold uppercase tracking-wide transition-colors cursor-pointer px-3 py-1 text-xs">
                            Extra Small
                        </button>
                        <Button variant="yellow" size="sm">
                            Small
                        </Button>
                        <Button variant="yellow" size="md">
                            Medium
                        </Button>
                        <Button variant="yellow" size="lg">
                            Large
                        </Button>
                    </ButtonRow>

                    <SubLabel>Purple Accent</SubLabel>
                    <ButtonRow>
                        <Button variant="purple" size="md">
                            Premium Action
                        </Button>
                        <Button variant="purple" size="md">
                            <i className="fa-duotone fa-regular fa-wand-magic-sparkles mr-2" />
                            With Icon
                        </Button>
                        <Button variant="purple" size="md">
                            AI Match
                            <i className="fa-duotone fa-regular fa-sparkles ml-2" />
                        </Button>
                        <Button variant="purple" size="md" className="!px-3">
                            <i className="fa-duotone fa-regular fa-crown" />
                        </Button>
                        <Button variant="purple" size="md" disabled>
                            Disabled
                        </Button>
                    </ButtonRow>

                    <SubLabel>Purple Sizes</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-dark bg-purple text-white font-bold uppercase tracking-wide transition-colors cursor-pointer px-3 py-1 text-xs">
                            Extra Small
                        </button>
                        <Button variant="purple" size="sm">
                            Small
                        </Button>
                        <Button variant="purple" size="md">
                            Medium
                        </Button>
                        <Button variant="purple" size="lg">
                            Large
                        </Button>
                    </ButtonRow>
                </Section>

                <ColorBar height="h-1.5" className="mb-12" />

                {/* ═══════════════════════════════════════════════════════════
                    5. OUTLINE / GHOST VARIANTS
                ═══════════════════════════════════════════════════════════ */}
                <Section>
                    <SectionDivider
                        label="Outline / Ghost Variants"
                        icon="fa-duotone fa-regular fa-circle-4"
                        accent="purple"
                        className="mb-4"
                    />
                    <Desc>
                        Border-only buttons for secondary or tertiary actions. Transparent fill keeps
                        the visual hierarchy clean without competing with primary actions.
                    </Desc>

                    <SubLabel>Coral Outline</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-coral bg-transparent text-coral font-bold uppercase tracking-wide px-6 py-3 text-base transition-colors cursor-pointer hover:bg-coral hover:text-white">
                            Coral Outline
                        </button>
                        <button className="border-4 border-coral bg-transparent text-coral font-bold uppercase tracking-wide px-6 py-3 text-base transition-colors cursor-pointer hover:bg-coral hover:text-white">
                            <i className="fa-duotone fa-regular fa-heart mr-2" />
                            With Icon
                        </button>
                        <button className="border-4 border-coral bg-transparent text-coral font-bold uppercase tracking-wide px-3 py-3 text-base transition-colors cursor-pointer hover:bg-coral hover:text-white">
                            <i className="fa-duotone fa-regular fa-bookmark" />
                        </button>
                    </ButtonRow>

                    <SubLabel>Teal Outline</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-teal bg-transparent text-teal font-bold uppercase tracking-wide px-6 py-3 text-base transition-colors cursor-pointer hover:bg-teal hover:text-dark">
                            Teal Outline
                        </button>
                        <button className="border-4 border-teal bg-transparent text-teal font-bold uppercase tracking-wide px-6 py-3 text-base transition-colors cursor-pointer hover:bg-teal hover:text-dark">
                            <i className="fa-duotone fa-regular fa-refresh mr-2" />
                            Refresh
                        </button>
                        <button className="border-4 border-teal bg-transparent text-teal font-bold uppercase tracking-wide px-3 py-3 text-base transition-colors cursor-pointer hover:bg-teal hover:text-dark">
                            <i className="fa-duotone fa-regular fa-eye" />
                        </button>
                    </ButtonRow>

                    <SubLabel>Yellow Outline</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-yellow bg-transparent text-yellow font-bold uppercase tracking-wide px-6 py-3 text-base transition-colors cursor-pointer hover:bg-yellow hover:text-dark">
                            Yellow Outline
                        </button>
                        <button className="border-4 border-yellow bg-transparent text-yellow font-bold uppercase tracking-wide px-6 py-3 text-base transition-colors cursor-pointer hover:bg-yellow hover:text-dark">
                            <i className="fa-duotone fa-regular fa-star mr-2" />
                            Favorite
                        </button>
                        <button className="border-4 border-yellow bg-transparent text-yellow font-bold uppercase tracking-wide px-3 py-3 text-base transition-colors cursor-pointer hover:bg-yellow hover:text-dark">
                            <i className="fa-duotone fa-regular fa-flag" />
                        </button>
                    </ButtonRow>

                    <SubLabel>Purple Outline</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-purple bg-transparent text-purple font-bold uppercase tracking-wide px-6 py-3 text-base transition-colors cursor-pointer hover:bg-purple hover:text-white">
                            Purple Outline
                        </button>
                        <button className="border-4 border-purple bg-transparent text-purple font-bold uppercase tracking-wide px-6 py-3 text-base transition-colors cursor-pointer hover:bg-purple hover:text-white">
                            <i className="fa-duotone fa-regular fa-link mr-2" />
                            Connect
                        </button>
                        <button className="border-4 border-purple bg-transparent text-purple font-bold uppercase tracking-wide px-3 py-3 text-base transition-colors cursor-pointer hover:bg-purple hover:text-white">
                            <i className="fa-duotone fa-regular fa-share-nodes" />
                        </button>
                    </ButtonRow>

                    <SubLabel>Dark (on dark background)</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-white/30 bg-transparent text-white/70 font-bold uppercase tracking-wide px-6 py-3 text-base transition-colors cursor-pointer hover:border-white hover:text-white">
                            Ghost Button
                        </button>
                        <button className="border-4 border-white/30 bg-transparent text-white/70 font-bold uppercase tracking-wide px-6 py-3 text-base transition-colors cursor-pointer hover:border-white hover:text-white">
                            <i className="fa-duotone fa-regular fa-xmark mr-2" />
                            Cancel
                        </button>
                    </ButtonRow>
                </Section>

                <div className="flex items-center gap-3 mb-12">
                    <GeometricDecoration shape="cross" color="coral" size={28} />
                    <GeometricDecoration shape="circle" color="teal" size={20} />
                    <div className="flex-1 h-1 bg-white/10" />
                    <GeometricDecoration shape="triangle" color="yellow" size={24} className="rotate-180" />
                    <GeometricDecoration shape="square" color="purple" size={20} />
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    6. BUTTON GROUPS
                ═══════════════════════════════════════════════════════════ */}
                <Section>
                    <SectionDivider
                        label="Button Groups"
                        icon="fa-duotone fa-regular fa-circle-5"
                        accent="coral"
                        className="mb-4"
                    />
                    <Desc>
                        Connected button groups for toggle selections, view switchers, and segmented controls.
                        Active state uses a filled Memphis color; inactive uses outline style.
                    </Desc>

                    <SubLabel>View Toggle (Grid / List / Table)</SubLabel>
                    <div className="flex">
                        {(["grid", "list", "table"] as const).map((view, i) => {
                            const icons = {
                                grid: "fa-duotone fa-regular fa-grid-2",
                                list: "fa-duotone fa-regular fa-list",
                                table: "fa-duotone fa-regular fa-table",
                            };
                            const isActive = activeView === view;
                            return (
                                <button
                                    key={view}
                                    onClick={() => setActiveView(view)}
                                    className={[
                                        "border-4 border-dark font-bold uppercase tracking-wide px-5 py-3 text-sm transition-colors cursor-pointer",
                                        isActive ? "bg-teal text-dark" : "bg-transparent text-white/70 hover:text-white",
                                        i > 0 ? "-ml-1" : "",
                                    ].join(" ")}
                                >
                                    <i className={`${icons[view]} mr-2`} />
                                    {view}
                                </button>
                            );
                        })}
                    </div>

                    <SubLabel>Pagination-Style Group</SubLabel>
                    <div className="flex">
                        <button className="border-4 border-dark bg-transparent text-white/70 font-bold px-4 py-2.5 text-sm transition-colors cursor-pointer hover:text-white">
                            <i className="fa-solid fa-chevron-left" />
                        </button>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                className={[
                                    "border-4 border-dark font-bold px-4 py-2.5 text-sm transition-colors cursor-pointer -ml-1",
                                    num === 1 ? "bg-coral text-white" : "bg-transparent text-white/70 hover:text-white",
                                ].join(" ")}
                            >
                                {num}
                            </button>
                        ))}
                        <button className="border-4 border-dark bg-transparent text-white/70 font-bold px-4 py-2.5 text-sm transition-colors cursor-pointer -ml-1 hover:text-white">
                            <i className="fa-solid fa-chevron-right" />
                        </button>
                    </div>

                    <SubLabel>Action Group (Toolbar)</SubLabel>
                    <div className="flex">
                        <button className="border-4 border-dark bg-purple text-white font-bold uppercase tracking-wide px-4 py-2.5 text-sm transition-colors cursor-pointer">
                            <i className="fa-duotone fa-regular fa-bold" />
                        </button>
                        <button className="border-4 border-dark bg-transparent text-white/70 font-bold uppercase tracking-wide px-4 py-2.5 text-sm transition-colors cursor-pointer -ml-1 hover:text-white">
                            <i className="fa-duotone fa-regular fa-italic" />
                        </button>
                        <button className="border-4 border-dark bg-transparent text-white/70 font-bold uppercase tracking-wide px-4 py-2.5 text-sm transition-colors cursor-pointer -ml-1 hover:text-white">
                            <i className="fa-duotone fa-regular fa-underline" />
                        </button>
                        <button className="border-4 border-dark bg-transparent text-white/70 font-bold uppercase tracking-wide px-4 py-2.5 text-sm transition-colors cursor-pointer -ml-1 hover:text-white">
                            <i className="fa-duotone fa-regular fa-strikethrough" />
                        </button>
                    </div>

                    <SubLabel>Color-Coded Group</SubLabel>
                    <div className="flex">
                        <AccentCycle count={4}>
                            {(color, i) => {
                                const labels = ["Jobs", "Candidates", "Companies", "Reports"];
                                const icons = [
                                    "fa-duotone fa-regular fa-briefcase",
                                    "fa-duotone fa-regular fa-users",
                                    "fa-duotone fa-regular fa-building",
                                    "fa-duotone fa-regular fa-chart-line",
                                ];
                                return (
                                    <Button
                                        key={i}
                                        variant={color}
                                        size="sm"
                                        className={i > 0 ? "-ml-1" : ""}
                                    >
                                        <i className={`${icons[i]} mr-1.5`} />
                                        {labels[i]}
                                    </Button>
                                );
                            }}
                        </AccentCycle>
                    </div>
                </Section>

                <GeometricDecoration
                    shape="zigzag"
                    color="yellow"
                    size={200}
                    className="block mx-auto mb-12 opacity-30"
                />

                {/* ═══════════════════════════════════════════════════════════
                    7. ICON BUTTONS
                ═══════════════════════════════════════════════════════════ */}
                <Section>
                    <SectionDivider
                        label="Icon Buttons"
                        icon="fa-duotone fa-regular fa-circle-6"
                        accent="teal"
                        className="mb-4"
                    />
                    <Desc>
                        Square icon-only buttons at each size. Used for compact actions in toolbars,
                        cards, and table rows. Always include an aria-label for accessibility.
                    </Desc>

                    <SubLabel>Coral Icons (All Sizes)</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-dark bg-coral text-white font-bold transition-colors cursor-pointer w-8 h-8 flex items-center justify-center text-xs" aria-label="Add">
                            <i className="fa-duotone fa-regular fa-plus" />
                        </button>
                        <button className="border-4 border-dark bg-coral text-white font-bold transition-colors cursor-pointer w-10 h-10 flex items-center justify-center text-sm" aria-label="Add">
                            <i className="fa-duotone fa-regular fa-plus" />
                        </button>
                        <button className="border-4 border-dark bg-coral text-white font-bold transition-colors cursor-pointer w-12 h-12 flex items-center justify-center text-base" aria-label="Add">
                            <i className="fa-duotone fa-regular fa-plus" />
                        </button>
                        <button className="border-4 border-dark bg-coral text-white font-bold transition-colors cursor-pointer w-14 h-14 flex items-center justify-center text-lg" aria-label="Add">
                            <i className="fa-duotone fa-regular fa-plus" />
                        </button>
                    </ButtonRow>

                    <SubLabel>Teal Icons (Common Actions)</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-dark bg-teal text-dark font-bold transition-colors cursor-pointer w-12 h-12 flex items-center justify-center text-base" aria-label="Edit">
                            <i className="fa-duotone fa-regular fa-pen" />
                        </button>
                        <button className="border-4 border-dark bg-teal text-dark font-bold transition-colors cursor-pointer w-12 h-12 flex items-center justify-center text-base" aria-label="Copy">
                            <i className="fa-duotone fa-regular fa-copy" />
                        </button>
                        <button className="border-4 border-dark bg-teal text-dark font-bold transition-colors cursor-pointer w-12 h-12 flex items-center justify-center text-base" aria-label="Download">
                            <i className="fa-duotone fa-regular fa-download" />
                        </button>
                        <button className="border-4 border-dark bg-teal text-dark font-bold transition-colors cursor-pointer w-12 h-12 flex items-center justify-center text-base" aria-label="Share">
                            <i className="fa-duotone fa-regular fa-share-nodes" />
                        </button>
                        <button className="border-4 border-dark bg-teal text-dark font-bold transition-colors cursor-pointer w-12 h-12 flex items-center justify-center text-base" aria-label="Settings">
                            <i className="fa-duotone fa-regular fa-gear" />
                        </button>
                    </ButtonRow>

                    <SubLabel>Outline Icon Buttons</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-coral bg-transparent text-coral font-bold transition-colors cursor-pointer w-12 h-12 flex items-center justify-center text-base hover:bg-coral hover:text-white" aria-label="Heart">
                            <i className="fa-duotone fa-regular fa-heart" />
                        </button>
                        <button className="border-4 border-teal bg-transparent text-teal font-bold transition-colors cursor-pointer w-12 h-12 flex items-center justify-center text-base hover:bg-teal hover:text-dark" aria-label="Bookmark">
                            <i className="fa-duotone fa-regular fa-bookmark" />
                        </button>
                        <button className="border-4 border-yellow bg-transparent text-yellow font-bold transition-colors cursor-pointer w-12 h-12 flex items-center justify-center text-base hover:bg-yellow hover:text-dark" aria-label="Star">
                            <i className="fa-duotone fa-regular fa-star" />
                        </button>
                        <button className="border-4 border-purple bg-transparent text-purple font-bold transition-colors cursor-pointer w-12 h-12 flex items-center justify-center text-base hover:bg-purple hover:text-white" aria-label="Link">
                            <i className="fa-duotone fa-regular fa-link" />
                        </button>
                    </ButtonRow>

                    <SubLabel>Mixed Variant Row (Toolbar Pattern)</SubLabel>
                    <div className="inline-flex border-4 border-dark">
                        {[
                            { icon: "fa-duotone fa-regular fa-arrows-rotate", label: "Refresh" },
                            { icon: "fa-duotone fa-regular fa-filter", label: "Filter" },
                            { icon: "fa-duotone fa-regular fa-sort", label: "Sort" },
                            { icon: "fa-duotone fa-regular fa-columns-3", label: "Columns" },
                            { icon: "fa-duotone fa-regular fa-ellipsis-vertical", label: "More" },
                        ].map((item, i) => (
                            <button
                                key={i}
                                className={[
                                    "bg-transparent text-white/60 font-bold transition-colors cursor-pointer w-11 h-11 flex items-center justify-center text-sm hover:text-teal hover:bg-white/5",
                                    i > 0 ? "border-l-4 border-dark" : "",
                                ].join(" ")}
                                aria-label={item.label}
                            >
                                <i className={item.icon} />
                            </button>
                        ))}
                    </div>
                </Section>

                <div className="flex items-center gap-4 mb-12">
                    <div className="flex-1 h-1 bg-white/10" />
                    <GeometricDecoration shape="cross" color="yellow" size={20} />
                    <GeometricDecoration shape="circle" color="coral" size={16} />
                    <GeometricDecoration shape="triangle" color="teal" size={18} />
                    <div className="flex-1 h-1 bg-white/10" />
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    8. LOADING STATES
                ═══════════════════════════════════════════════════════════ */}
                <Section>
                    <SectionDivider
                        label="Loading States"
                        icon="fa-duotone fa-regular fa-circle-7"
                        accent="yellow"
                        className="mb-4"
                    />
                    <Desc>
                        Buttons during async operations. Replace label text with a spinner and descriptive
                        loading text. Always disable the button to prevent double-submits.
                    </Desc>

                    <SubLabel>Static Loading Examples</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-dark bg-coral text-white font-bold uppercase tracking-wide px-6 py-3 text-base opacity-80 cursor-not-allowed" disabled>
                            <i className="fa-duotone fa-regular fa-spinner-third fa-spin mr-2" />
                            Saving...
                        </button>
                        <button className="border-4 border-dark bg-teal text-dark font-bold uppercase tracking-wide px-6 py-3 text-base opacity-80 cursor-not-allowed" disabled>
                            <i className="fa-duotone fa-regular fa-spinner-third fa-spin mr-2" />
                            Loading...
                        </button>
                        <button className="border-4 border-dark bg-purple text-white font-bold uppercase tracking-wide px-6 py-3 text-base opacity-80 cursor-not-allowed" disabled>
                            <i className="fa-duotone fa-regular fa-spinner-third fa-spin mr-2" />
                            Processing...
                        </button>
                        <button className="border-4 border-dark bg-yellow text-dark font-bold uppercase tracking-wide px-6 py-3 text-base opacity-80 cursor-not-allowed" disabled>
                            <i className="fa-duotone fa-regular fa-spinner-third fa-spin mr-2" />
                            Uploading...
                        </button>
                    </ButtonRow>

                    <SubLabel>Interactive Loading (Click to Test)</SubLabel>
                    <ButtonRow>
                        <Button
                            variant="coral"
                            size="md"
                            disabled={loadingStates["save"]}
                            className={loadingStates["save"] ? "opacity-80" : ""}
                            onClick={() => simulateLoading("save")}
                        >
                            {loadingStates["save"] ? (
                                <>
                                    <i className="fa-duotone fa-regular fa-spinner-third fa-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-floppy-disk mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                        <Button
                            variant="teal"
                            size="md"
                            disabled={loadingStates["export"]}
                            className={loadingStates["export"] ? "opacity-80" : ""}
                            onClick={() => simulateLoading("export")}
                        >
                            {loadingStates["export"] ? (
                                <>
                                    <i className="fa-duotone fa-regular fa-spinner-third fa-spin mr-2" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-file-export mr-2" />
                                    Export CSV
                                </>
                            )}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            disabled={loadingStates["match"]}
                            className={loadingStates["match"] ? "opacity-80" : ""}
                            onClick={() => simulateLoading("match")}
                        >
                            {loadingStates["match"] ? (
                                <>
                                    <i className="fa-duotone fa-regular fa-spinner-third fa-spin mr-2" />
                                    Matching...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-wand-magic-sparkles mr-2" />
                                    AI Match
                                </>
                            )}
                        </Button>
                    </ButtonRow>

                    <SubLabel>Icon-Only Loading</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-dark bg-coral text-white font-bold transition-colors w-12 h-12 flex items-center justify-center text-base opacity-80 cursor-not-allowed" disabled>
                            <i className="fa-duotone fa-regular fa-spinner-third fa-spin" />
                        </button>
                        <button className="border-4 border-dark bg-teal text-dark font-bold transition-colors w-12 h-12 flex items-center justify-center text-base opacity-80 cursor-not-allowed" disabled>
                            <i className="fa-duotone fa-regular fa-spinner-third fa-spin" />
                        </button>
                        <button className="border-4 border-dark bg-purple text-white font-bold transition-colors w-12 h-12 flex items-center justify-center text-base opacity-80 cursor-not-allowed" disabled>
                            <i className="fa-duotone fa-regular fa-spinner-third fa-spin" />
                        </button>
                    </ButtonRow>
                </Section>

                <GeometricDecoration
                    shape="zigzag"
                    color="coral"
                    size={200}
                    className="block mx-auto mb-12 opacity-30"
                />

                {/* ═══════════════════════════════════════════════════════════
                    9. DESTRUCTIVE ACTIONS
                ═══════════════════════════════════════════════════════════ */}
                <Section>
                    <SectionDivider
                        label="Destructive Actions"
                        icon="fa-duotone fa-regular fa-circle-8"
                        accent="coral"
                        className="mb-4"
                    />
                    <Desc>
                        Buttons for irreversible or dangerous actions. Use coral to convey urgency. Pair with
                        a secondary cancel/dismiss button. Require confirmation for critical operations.
                    </Desc>

                    <SubLabel>Delete / Remove / Cancel</SubLabel>
                    <ButtonRow>
                        <Button variant="coral" size="md">
                            <i className="fa-duotone fa-regular fa-trash mr-2" />
                            Delete
                        </Button>
                        <Button variant="coral" size="sm">
                            <i className="fa-duotone fa-regular fa-user-minus mr-2" />
                            Remove
                        </Button>
                        <button className="border-4 border-coral bg-transparent text-coral font-bold uppercase tracking-wide px-6 py-3 text-base transition-colors cursor-pointer hover:bg-coral hover:text-white">
                            <i className="fa-duotone fa-regular fa-ban mr-2" />
                            Cancel
                        </button>
                    </ButtonRow>

                    <SubLabel>Confirmation Dialog Pattern</SubLabel>
                    <div className="border-4 border-dark bg-white/5 p-6 max-w-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-coral border-4 border-dark flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-white" />
                            </div>
                            <div>
                                <h5 className="text-sm font-black uppercase tracking-wider text-white">
                                    Confirm Deletion
                                </h5>
                                <p className="text-xs text-cream/50">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 justify-end">
                            <button className="border-4 border-white/20 bg-transparent text-white/70 font-bold uppercase tracking-wide px-5 py-2.5 text-sm transition-colors cursor-pointer hover:border-white hover:text-white">
                                Cancel
                            </button>
                            <Button variant="coral" size="sm">
                                <i className="fa-duotone fa-regular fa-trash mr-2" />
                                Yes, Delete
                            </Button>
                        </div>
                    </div>

                    <SubLabel>Inline Destructive Actions</SubLabel>
                    <ButtonRow>
                        <button className="border-4 border-dark bg-transparent text-coral font-bold uppercase tracking-wide px-4 py-2 text-sm transition-colors cursor-pointer hover:bg-coral hover:text-white">
                            <i className="fa-duotone fa-regular fa-xmark mr-1.5" />
                            Dismiss
                        </button>
                        <button className="border-4 border-dark bg-transparent text-coral font-bold uppercase tracking-wide px-4 py-2 text-sm transition-colors cursor-pointer hover:bg-coral hover:text-white">
                            <i className="fa-duotone fa-regular fa-link-slash mr-1.5" />
                            Unlink
                        </button>
                        <button className="border-4 border-dark bg-transparent text-coral font-bold uppercase tracking-wide px-4 py-2 text-sm transition-colors cursor-pointer hover:bg-coral hover:text-white">
                            <i className="fa-duotone fa-regular fa-rotate-left mr-1.5" />
                            Revert
                        </button>
                    </ButtonRow>
                </Section>

                <div className="flex items-center gap-3 mb-12">
                    <GeometricDecoration shape="square" color="teal" size={22} />
                    <div className="flex-1 h-1 bg-white/10" />
                    <GeometricDecoration shape="cross" color="purple" size={28} />
                    <div className="flex-1 h-1 bg-white/10" />
                    <GeometricDecoration shape="circle" color="yellow" size={22} />
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    10. CTAs (Call to Action)
                ═══════════════════════════════════════════════════════════ */}
                <Section>
                    <SectionDivider
                        label="Calls to Action"
                        icon="fa-duotone fa-regular fa-circle-9"
                        accent="purple"
                        className="mb-4"
                    />
                    <Desc>
                        Full-width and prominent CTA buttons for hero sections, banners, and page-level actions.
                        Uses the HeaderCta component for consistent Memphis styling across headers and landing sections.
                    </Desc>

                    <SubLabel>HeaderCta Component (Primary & Secondary)</SubLabel>
                    <div className="flex flex-wrap gap-4 mb-8">
                        <HeaderCta
                            label="Get Started Free"
                            icon="fa-duotone fa-regular fa-rocket"
                            color="#FF6B6B"
                            variant="primary"
                        />
                        <HeaderCta
                            label="Watch Demo"
                            icon="fa-duotone fa-regular fa-play"
                            color="#FF6B6B"
                            variant="secondary"
                        />
                        <HeaderCta
                            label="Browse Jobs"
                            icon="fa-duotone fa-regular fa-briefcase"
                            color="#4ECDC4"
                            variant="primary"
                        />
                        <HeaderCta
                            label="Learn More"
                            icon="fa-duotone fa-regular fa-arrow-right"
                            color="#4ECDC4"
                            variant="secondary"
                        />
                    </div>

                    <SubLabel>Full-Width CTA</SubLabel>
                    <div className="space-y-4 max-w-2xl">
                        <button className="w-full border-4 border-dark bg-coral text-white font-black uppercase tracking-[0.15em] px-8 py-5 text-lg transition-colors cursor-pointer hover:bg-[#e85d5d] flex items-center justify-center gap-3">
                            <i className="fa-duotone fa-regular fa-paper-plane" />
                            Submit Your Application
                        </button>
                        <button className="w-full border-4 border-dark bg-teal text-dark font-black uppercase tracking-[0.15em] px-8 py-5 text-lg transition-colors cursor-pointer hover:bg-[#3dbdb4] flex items-center justify-center gap-3">
                            <i className="fa-duotone fa-regular fa-handshake" />
                            Join the Network
                        </button>
                    </div>

                    <SubLabel>CTA with Subtitle</SubLabel>
                    <div className="max-w-2xl">
                        <button className="w-full border-4 border-dark bg-purple text-white font-bold px-8 py-6 transition-colors cursor-pointer hover:bg-[#9577e8] text-left flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 border-4 border-white/30 flex items-center justify-center flex-shrink-0">
                                <i className="fa-duotone fa-regular fa-wand-magic-sparkles text-xl" />
                            </div>
                            <div>
                                <span className="block text-base font-black uppercase tracking-[0.12em]">
                                    Activate AI Matching
                                </span>
                                <span className="block text-xs text-white/60 mt-1 normal-case tracking-normal font-semibold">
                                    Let our AI find the perfect candidates for your open positions
                                </span>
                            </div>
                            <i className="fa-solid fa-arrow-right ml-auto text-lg" />
                        </button>
                    </div>

                    <SubLabel>Color Cycling CTAs</SubLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                        <AccentCycle count={4}>
                            {(color, i) => {
                                const ctas = [
                                    { label: "Post a Job", icon: "fa-duotone fa-regular fa-plus-circle", color: "#FF6B6B" },
                                    { label: "Find Talent", icon: "fa-duotone fa-regular fa-search", color: "#4ECDC4" },
                                    { label: "Upgrade Plan", icon: "fa-duotone fa-regular fa-crown", color: "#FFE66D" },
                                    { label: "Get Support", icon: "fa-duotone fa-regular fa-headset", color: "#A78BFA" },
                                ];
                                return (
                                    <HeaderCta
                                        key={i}
                                        label={ctas[i].label}
                                        icon={ctas[i].icon}
                                        color={ctas[i].color}
                                        variant="primary"
                                        className="w-full justify-center"
                                    />
                                );
                            }}
                        </AccentCycle>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════════════════════════
                    FOOTER
                ═══════════════════════════════════════════════════════════ */}
                <ColorBar height="h-1.5" className="mb-8" />

                <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <GeometricDecoration shape="triangle" color="coral" size={24} />
                        <GeometricDecoration shape="circle" color="teal" size={20} />
                        <GeometricDecoration shape="square" color="yellow" size={22} />
                        <GeometricDecoration shape="cross" color="purple" size={24} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                        Memphis Design System / Buttons / Designer Six
                    </p>
                </div>
            </div>
        </div>
    );
}
