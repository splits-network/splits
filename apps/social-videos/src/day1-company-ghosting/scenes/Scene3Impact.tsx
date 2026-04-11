import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, kicker } from "../../shared/styles";
import { fadeIn, slideUp, staggerDelay } from "../../shared/animations";

const chain = [
  "Candidate ghosted after interview",
  "Posts negative review online",
  "Future candidates see it",
  "Fewer quality applicants",
  "Longer time-to-fill",
  "Higher cost-per-hire",
];

export const Scene3Impact: React.FC = () => {
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
        THE CHAIN REACTION
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          width: 860,
        }}
      >
        {chain.map((step, i) => {
          const delay = staggerDelay(i, 10, 16);
          const opacity = fadeIn(frame, fps, delay);
          const yOffset = slideUp(frame, fps, delay, 40);
          const isLast = i === chain.length - 1;

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
                  padding: "24px 40px",
                  fontSize: 40,
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
                    height: 28,
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
