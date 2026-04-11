import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, kicker } from "../../shared/styles";
import { fadeIn, slideUp, staggerDelay } from "../../shared/animations";

const cascade = [
  "Companies post roles they never fill",
  "Candidates waste hours applying",
  "Trust in job boards collapses",
  "Your legitimate postings get fewer applicants",
  "The entire market suffers",
];

export const Scene3Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={fullScreen}>
      <div
        style={{
          ...kicker,
          color: colors.textMuted,
          opacity: fadeIn(frame, fps, 0),
          marginBottom: 50,
        }}
      >
        THE TRUST CRISIS
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 860,
        }}
      >
        {cascade.map((step, i) => {
          const delay = staggerDelay(i, 10, 18);
          const opacity = fadeIn(frame, fps, delay);
          const yOffset = slideUp(frame, fps, delay, 40);
          const isLast = i === cascade.length - 1;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity,
                transform: `translateY(${yOffset}px)`,
              }}
            >
              <div
                style={{
                  padding: "22px 40px",
                  fontSize: 42,
                  fontWeight: isLast ? 800 : 600,
                  color: isLast ? colors.accent : colors.text,
                  textAlign: "center" as const,
                  lineHeight: 1.3,
                }}
              >
                {step}
              </div>
              {!isLast && (
                <div
                  style={{
                    width: 3,
                    height: 24,
                    backgroundColor: colors.surfaceLight,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
