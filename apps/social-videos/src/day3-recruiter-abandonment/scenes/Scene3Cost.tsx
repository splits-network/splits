import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, kicker } from "../../shared/styles";
import { fadeIn, slideUp, staggerDelay } from "../../shared/animations";

const costs = [
  { label: "Lost top-tier candidates" },
  { label: "Incomplete profile data" },
  { label: "Smaller candidate pools" },
  { label: "More time per placement" },
];

export const Scene3Cost: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={fullScreen}>
      <div
        style={{
          ...kicker,
          color: colors.textMuted,
          opacity: fadeIn(frame, fps, 0),
          marginBottom: 60,
        }}
      >
        WHAT LONG FORMS COST YOU
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
          width: 860,
        }}
      >
        {costs.map((item, i) => {
          const delay = staggerDelay(i, 15, 20);
          const opacity = fadeIn(frame, fps, delay);
          const yOffset = slideUp(frame, fps, delay, 50);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                opacity,
                transform: `translateY(${yOffset}px)`,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 60,
                  backgroundColor: colors.accent,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: colors.text,
                  lineHeight: 1.3,
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontSize: 44,
          fontWeight: 500,
          color: colors.textDim,
          marginTop: 70,
          textAlign: "center" as const,
          maxWidth: 800,
          lineHeight: 1.5,
          opacity: fadeIn(frame, fps, 100),
          transform: `translateY(${slideUp(frame, fps, 100)}px)`,
        }}
      >
        Good candidates quit
        <br />
        at field 23.
      </div>
    </AbsoluteFill>
  );
};
