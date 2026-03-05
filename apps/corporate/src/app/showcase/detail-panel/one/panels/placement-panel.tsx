"use client";

import { data as d } from "./placement-data";
import { PanelHeader, PanelTabs } from "./panel-header";

function fmt(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function PlacementPanel() {
    return (
        <div>
            <PanelHeader
                kicker={`Placed ${d.hiredAt}`}
                badges={[
                    { label: "Confirmed", className: "badge-success" },
                    { label: "Paid Out", className: "badge-primary badge-soft" },
                ]}
                avatar={{ initials: d.candidateInitials }}
                title={d.candidateName}
                subtitle={d.companyName}
                meta={[
                    { icon: "fa-duotone fa-regular fa-briefcase", text: d.jobTitle },
                    { icon: "fa-duotone fa-regular fa-envelope", text: d.candidateEmail },
                ]}
                stats={d.stats}
            />
            <PanelTabs
                tabs={[
                    { label: "Financials", value: "financials", icon: "fa-duotone fa-regular fa-coins" },
                    { label: "Dates", value: "dates", icon: "fa-duotone fa-regular fa-calendar" },
                    { label: "Splits", value: "splits", icon: "fa-duotone fa-regular fa-pie-chart" },
                ]}
            >
                {(tab) => {
                    if (tab === "financials") return <FinancialsTab />;
                    if (tab === "dates") return <DatesTab />;
                    return <SplitsTab />;
                }}
            </PanelTabs>
        </div>
    );
}

function FinancialsTab() {
    return (
        <div className="space-y-8 p-6">
            <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                {[
                    { l: "Salary", v: fmt(d.salary) },
                    { l: "Fee Rate", v: `${d.feePercentage}%` },
                    { l: "Your Share", v: fmt(d.recruiterShare), accent: true },
                ].map((s) => (
                    <div key={s.l} className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">{s.l}</p>
                        <p className={`text-lg font-black tracking-tight ${s.accent ? "text-primary" : ""}`}>{s.v}</p>
                    </div>
                ))}
            </div>
            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Commission Breakdown</p>
                {[
                    { l: "Total Fee", v: fmt(d.feeAmount), bold: true },
                    { l: "Recruiter Share", v: fmt(d.recruiterShare) },
                    { l: "Platform Share", v: fmt(d.platformShare) },
                ].map((r) => (
                    <div key={r.l} className="flex justify-between text-sm mb-1">
                        <span className="text-base-content/50">{r.l}</span>
                        <span className={r.bold ? "font-bold text-primary" : "font-semibold"}>{r.v}</span>
                    </div>
                ))}
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Guarantee Period</p>
                <div className="bg-primary/5 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-primary/60 mb-1">Duration</p>
                    <p className="text-base font-bold text-primary">{d.guaranteeDays} days</p>
                </div>
            </div>
        </div>
    );
}

function DatesTab() {
    const dates = [
        { l: "Hired", v: d.hiredAt },
        { l: "Start Date", v: d.startDate },
        { l: "Guarantee Expires", v: d.guaranteeExpiresAt },
    ];
    const info = [
        { l: "Candidate", v: d.candidateName },
        { l: "Position", v: d.jobTitle },
        { l: "Company", v: d.companyName },
        { l: "Email", v: d.candidateEmail },
    ];
    return (
        <div className="space-y-8 p-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Key Dates</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    {dates.map((dt) => (
                        <div key={dt.l} className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">{dt.l}</p>
                            <p className="font-bold text-sm">{dt.v}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">Placement Info</p>
                <div className="bg-base-200 border border-base-300 divide-y divide-base-300">
                    {info.map((r) => (
                        <div key={r.l} className="flex justify-between px-4 py-3">
                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-base-content/40">{r.l}</span>
                            <span className="text-sm font-semibold text-right">{r.v}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SplitsTab() {
    return (
        <div className="space-y-8 p-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">Split Partners</p>
                <ul className="space-y-2">
                    {d.splits.map((s) => (
                        <li key={s.id} className="flex items-center justify-between text-base-content/70 border-b border-base-200 pb-2">
                            <span className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-circle-check text-primary text-sm" />
                                <span className="text-sm font-semibold">
                                    {s.recruiterName}
                                    <span className="text-base-content/40 capitalize"> ({s.roleLabel})</span>
                                </span>
                            </span>
                            <span className="text-sm font-bold">{s.splitPercentage}% &middot; {fmt(s.splitAmount)}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-base-200 border border-base-300 p-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-base-content/50">Total Fee</span>
                    <span className="font-bold text-primary">{fmt(d.feeAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-base-content/50">Fee Rate</span>
                    <span className="font-semibold">{d.feePercentage}% of {fmt(d.salary)}</span>
                </div>
            </div>
        </div>
    );
}
