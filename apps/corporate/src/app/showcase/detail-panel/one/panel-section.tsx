"use client";

/* ─── Panel Section Wrapper ──────────────────────────────────────────── */

interface PanelSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
}

export function PanelSection({ title, description, children, className }: PanelSectionProps) {
    return (
        <section className={`detail-section opacity-0 mb-16 ${className || ""}`}>
            <div className="mb-6">
                <h2 className="text-2xl font-black tracking-tight mb-2">{title}</h2>
                <p className="text-sm text-base-content/50">{description}</p>
            </div>
            <div className="max-w-lg mx-auto border border-base-300 shadow-sm bg-base-100 overflow-hidden">
                {children}
            </div>
        </section>
    );
}
