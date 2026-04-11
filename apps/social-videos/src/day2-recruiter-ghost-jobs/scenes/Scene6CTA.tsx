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
          background: `radial-gradient(circle, ${colors.primaryLight}20 0%, transparent 70%)`,
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
        TRUST-VERIFIED RECRUITING
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
        Splits
        <br />
        <span style={{ color: colors.primaryLight }}>Network</span>
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
        splits.network
      </div>

      <div
        style={{
          fontSize: 40,
          fontWeight: 500,
          color: colors.textMuted,
          marginTop: 60,
          textAlign: "center" as const,
          maxWidth: 750,
          lineHeight: 1.5,
          opacity: fadeIn(frame, fps, 40),
          transform: `translateY(${slideUp(frame, fps, 40)}px)`,
        }}
      >
        Every listing backed by reputation,
        <br />
        commitment, and accountability.
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 140,
          width: 200,
          height: 4,
          backgroundColor: colors.primaryLight,
          opacity: fadeIn(frame, fps, 50),
          transform: `scaleX(${scaleIn(frame, fps, 50)})`,
        }}
      />
    </AbsoluteFill>
  );
};
