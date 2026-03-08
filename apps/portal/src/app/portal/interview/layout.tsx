import '@livekit/components-styles';

/**
 * Minimal full-screen layout for interview pages.
 * No sidebar, no header — the call needs all available screen real estate.
 */
export default function InterviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen w-screen overflow-hidden">
            {children}
        </div>
    );
}
