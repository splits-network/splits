import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, kicker } from "../../shared/styles";
import { fadeIn, slideUp, staggerDelay } from "../../shared/animations";

const listings = [
  { title: "Senior Product Manager", status: "Posted 47 days ago", ghost: true },
  { title: "Full Stack Engineer", status: "Posted 62 days ago", ghost: true },
  { title: "Marketing Director", status: "Posted 31 days ago", ghost: true },
  { title: "Data Analyst", status: "Posted 55 days ago", ghost: true },
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
        LOOK FAMILIAR?
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          width: 860,
        }}
      >
        {listings.map((job, i) => {
          const delay = staggerDelay(i, 10, 18);
          const opacity = fadeIn(frame, fps, delay);
          const yOffset = slideUp(frame, fps, delay, 50);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "30px 36px",
                backgroundColor: colors.surface,
                border: `1px solid ${colors.surfaceLight}`,
                opacity,
                transform: `translateY(${yOffset}px)`,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: 700,
                    color: colors.text,
                    lineHeight: 1.3,
                  }}
                >
                  {job.title}
                </div>
                <div
                  style={{
                    fontSize: 36,
                    color: colors.accent,
                    marginTop: 4,
                  }}
                >
                  {job.status}
                </div>
              </div>

              {/* Ghost indicator */}
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: colors.accent,
                  opacity: fadeIn(frame, fps, delay + 25),
                }}
              >
                GHOST
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
          marginTop: 50,
          textAlign: "center" as const,
          opacity: fadeIn(frame, fps, 100),
          transform: `translateY(${slideUp(frame, fps, 100)}px)`,
        }}
      >
        Hours wasted. Hope burned.
      </div>
    </AbsoluteFill>
  );
};
