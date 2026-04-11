import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, statLabel, citation } from "../../shared/styles";
import { fadeIn, slideUp, pulse, scaleIn } from "../../shared/animations";

export const Scene2Stat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={fullScreen}>
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}30 0%, transparent 70%)`,
          opacity: fadeIn(frame, fps, 10),
          transform: `scale(${pulse(frame, fps, 1.5)})`,
        }}
      />

      <div
        style={{
          fontSize: 120,
          fontWeight: 900,
          lineHeight: 1,
          color: colors.accent,
          textAlign: "center" as const,
          opacity: fadeIn(frame, fps, 5),
          transform: `scale(${scaleIn(frame, fps, 5)})`,
        }}
      >
        1 in 5
      </div>

      <div
        style={{
          ...statLabel,
          marginTop: 40,
          opacity: fadeIn(frame, fps, 25),
          transform: `translateY(${slideUp(frame, fps, 25)}px)`,
        }}
      >
        job postings are unfilled ghost jobs
      </div>

      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: colors.text,
          marginTop: 50,
          opacity: fadeIn(frame, fps, 45),
          transform: `translateY(${slideUp(frame, fps, 45)}px)`,
          textAlign: "center" as const,
        }}
      >
        When candidates lose trust,
        <br />
        your real postings get ignored.
      </div>

      <div
        style={{
          ...citation,
          marginTop: 50,
          opacity: fadeIn(frame, fps, 65),
        }}
      >
        2026 Global Talent Acquisition Report
      </div>
    </AbsoluteFill>
  );
};
