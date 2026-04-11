import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, kicker } from "../../shared/styles";
import { fadeIn, slideUp, scaleIn, pulse } from "../../shared/animations";

export const Scene6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={fullScreen}>
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.secondary}20 0%, transparent 70%)`,
          transform: `scale(${pulse(frame, fps, 1)})`,
        }}
      />

      <div
        style={{
          ...kicker,
          color: colors.textMuted,
          opacity: fadeIn(frame, fps, 0),
          marginBottom: 40,
        }}
      >
        STOP WAITING. START KNOWING.
      </div>

      <div
        style={{
          fontSize: 88,
          fontWeight: 900,
          color: colors.text,
          textAlign: "center" as const,
          opacity: fadeIn(frame, fps, 10),
          transform: `translateY(${slideUp(frame, fps, 10)}px)`,
          lineHeight: 1.1,
        }}
      >
        Applicant
        <br />
        <span style={{ color: colors.secondary }}>Network</span>
      </div>

      <div
        style={{
          fontSize: 48,
          fontWeight: 600,
          color: colors.textDim,
          marginTop: 50,
          opacity: fadeIn(frame, fps, 25),
          transform: `translateY(${slideUp(frame, fps, 25)}px)`,
          letterSpacing: "0.05em",
        }}
      >
        applicant.network
      </div>

      <div
        style={{
          fontSize: 40,
          fontWeight: 500,
          color: colors.textMuted,
          marginTop: 60,
          textAlign: "center" as const,
          maxWidth: 700,
          lineHeight: 1.5,
          opacity: fadeIn(frame, fps, 40),
          transform: `translateY(${slideUp(frame, fps, 40)}px)`,
        }}
      >
        Your job search, visible.
        <br />
        Always know where you stand.
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 140,
          opacity: fadeIn(frame, fps, 50),
          transform: `translateY(${slideUp(frame, fps, 50, 30)}px)`,
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: colors.secondary,
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
          }}
        >
          FREE FOR CANDIDATES
        </div>
      </div>
    </AbsoluteFill>
  );
};
