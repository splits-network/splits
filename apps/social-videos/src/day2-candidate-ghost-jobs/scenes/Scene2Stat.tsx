import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fullScreen, statLabel, citation } from "../../shared/styles";
import { fadeIn, slideUp, pulse } from "../../shared/animations";

export const Scene2Stat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lowCount = interpolate(frame - 10, [0, fps * 1.2], [0, 18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highCount = interpolate(frame - 10, [0, fps * 1.2], [0, 22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          fontSize: 160,
          fontWeight: 900,
          lineHeight: 1,
          color: colors.accent,
          opacity: fadeIn(frame, fps, 5),
          transform: `translateY(${slideUp(frame, fps, 5, 60)}px)`,
        }}
      >
        {Math.round(lowCount)}-{Math.round(highCount)}%
      </div>

      <div
        style={{
          ...statLabel,
          marginTop: 30,
          opacity: fadeIn(frame, fps, 25),
          transform: `translateY(${slideUp(frame, fps, 25)}px)`,
        }}
      >
        of job listings are ghost jobs
        <br />
        — roles that were never real
      </div>

      {/* Spike callout */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: colors.text,
          marginTop: 50,
          opacity: fadeIn(frame, fps, 50),
          transform: `translateY(${slideUp(frame, fps, 50)}px)`,
        }}
      >
        31% in corporate services
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
