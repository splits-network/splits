import '@livekit/components-styles';

/**
 * Minimal full-screen layout for candidate interview pages.
 * No navigation, no footer -- the call needs all available screen real estate.
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
