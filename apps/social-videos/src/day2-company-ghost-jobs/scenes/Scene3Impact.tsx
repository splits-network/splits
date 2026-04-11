import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, kicker } from "../../shared/styles";
import { fadeIn, slideUp, staggerDelay } from "../../shared/animations";

const impacts = [
  { label: "Fewer quality applicants", color: colors.accent },
  { label: "Longer time-to-fill on real roles", color: colors.accent },
  { label: "Damaged employer reputation", color: colors.accent },
  { label: "Higher cost-per-hire", color: colors.accent },
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
          marginBottom: 60,
        }}
      >
        THE HIDDEN COST
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
          width: 860,
        }}
      >
        {impacts.map((item, i) => {
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
                  backgroundColor: item.color,
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
          marginTop: 60,
          textAlign: "center" as const,
          maxWidth: 800,
          lineHeight: 1.5,
          opacity: fadeIn(frame, fps, 100),
          transform: `translateY(${slideUp(frame, fps, 100)}px)`,
        }}
      >
        Even when you post real roles,
        <br />
        candidates assume the worst.
      </div>
    </AbsoluteFill>
  );
};
