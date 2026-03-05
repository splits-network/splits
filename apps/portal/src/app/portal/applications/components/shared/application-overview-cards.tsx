// ─── Recruiter & Sourcer Cards for Overview Tab ─────────────────────────────

interface RecruiterCardProps {
    label: string;
    name: string | null;
    email: string | null;
    initials: string;
    borderColor: string;
    avatarColor: string;
}

export function RecruiterCard({
    label,
    name,
    email,
    initials,
    borderColor,
    avatarColor,
}: RecruiterCardProps) {
    const hasRecruiter = name || email;

    return (
        <div className={`bg-base-100 border-l-4 ${borderColor} p-6`}>
            <h3 className="text-sm uppercase tracking-[0.2em] text-base-content/40 font-bold mb-4">
                {label}
            </h3>
            <div className={`flex gap-4 ${hasRecruiter ? "items-start" : "items-center"}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${hasRecruiter ? avatarColor : "bg-base-200 text-base-content/40"}`}>
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-lg font-black tracking-tight truncate">
                        {name || "Not yet assigned"}
                    </div>
                    {email && (
                        <a
                            href={`mailto:${email}`}
                            className="text-sm text-primary hover:text-primary/80 font-bold truncate block"
                        >
                            {email}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

interface SourcerCardProps {
    label: string;
    name: string | null;
    email: string | null;
    initials: string;
    accentColor: string;
    borderColor: string;
}

export function SourcerCard({
    label,
    name,
    email,
    initials,
    accentColor,
    borderColor,
}: SourcerCardProps) {
    const hasSourcer = name || email;

    return (
        <div className={`bg-base-200/50 border-l-4 ${borderColor} px-4 py-3 flex items-center gap-3`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${hasSourcer ? `${accentColor} bg-base-300` : "bg-base-200 text-base-content/30"}`}>
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm text-base-content/40 uppercase tracking-[0.15em] font-bold">
                    {label}
                </div>
                <div className="text-sm font-bold truncate">
                    {name || "Not yet assigned"}
                </div>
            </div>
            {email && (
                <a
                    href={`mailto:${email}`}
                    className={`text-sm ${accentColor} hover:opacity-70 font-bold flex-shrink-0`}
                >
                    <i className="fa-duotone fa-regular fa-envelope" />
                </a>
            )}
        </div>
    );
}
