import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, statLabel, citation } from "../../shared/styles";
import { fadeIn, slideUp, pulse, scaleIn } from "../../shared/animations";

export const Scene2Stat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={fullScreen}>
      {/* Glow */}
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
          fontSize: 180,
          fontWeight: 900,
          lineHeight: 1,
          color: colors.accent,
          opacity: fadeIn(frame, fps, 5),
          transform: `scale(${scaleIn(frame, fps, 5)})`,
        }}
      >
        2x
      </div>

      <div
        style={{
          ...statLabel,
          marginTop: 40,
          opacity: fadeIn(frame, fps, 25),
          transform: `translateY(${slideUp(frame, fps, 25)}px)`,
        }}
      >
        higher cost-per-hire when
        <br />
        employer brand is weak
      </div>

      <div
        style={{
          ...citation,
          marginTop: 60,
          opacity: fadeIn(frame, fps, 40),
        }}
      >
        2026 Global Talent Acquisition Report
      </div>
    </AbsoluteFill>
  );
};
