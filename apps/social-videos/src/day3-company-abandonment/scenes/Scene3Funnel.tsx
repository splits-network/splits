import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, kicker } from "../../shared/styles";
import { fadeIn, slideUp, staggerDelay } from "../../shared/animations";

const funnel = [
  { label: "100 candidates visit your posting", width: 860, count: "100" },
  { label: "80 start your application", width: 720, count: "80" },
  { label: "60 hit field 20 and pause", width: 580, count: "60" },
  { label: "40 give up entirely", width: 440, count: "40" },
  { label: "Only the desperate finish", width: 300, count: "20", highlight: true },
];

export const Scene3Funnel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={fullScreen}>
      <div
        style={{
          ...kicker,
          color: colors.textMuted,
          opacity: fadeIn(frame, fps, 0),
          marginBottom: 40,
        }}
      >
        YOUR HIRING FUNNEL
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        {funnel.map((step, i) => {
          const delay = staggerDelay(i, 15, 20);
          const opacity = fadeIn(frame, fps, delay);
          const yOffset = slideUp(frame, fps, delay, 40);

          return (
            <div
              key={i}
              style={{
                width: step.width,
                padding: "28px 32px",
                backgroundColor: step.highlight ? colors.accent : colors.surface,
                border: `1px solid ${step.highlight ? colors.accent : colors.surfaceLight}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity,
                transform: `translateY(${yOffset}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 600,
                  color: step.highlight ? colors.text : colors.textDim,
                  lineHeight: 1.3,
                }}
              >
                {step.label}
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  color: step.highlight ? colors.text : colors.text,
                  marginLeft: 20,
                }}
              >
                {step.count}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontSize: 44,
          fontWeight: 700,
          color: colors.text,
          marginTop: 50,
          textAlign: "center" as const,
          opacity: fadeIn(frame, fps, 120),
          transform: `translateY(${slideUp(frame, fps, 120)}px)`,
        }}
      >
        You're hiring your worst option.
      </div>
    </AbsoluteFill>
  );
};
