import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, stat, statLabel, citation } from "../../shared/styles";
import { fadeIn, slideUp, pulse, countUp } from "../../shared/animations";

export const Scene2Stat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const count = countUp(frame, fps, 10, 1.5, 90);

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
          ...stat,
          opacity: fadeIn(frame, fps, 5),
          transform: `translateY(${slideUp(frame, fps, 5, 60)}px)`,
        }}
      >
        {count}%
      </div>

      <div
        style={{
          ...statLabel,
          marginTop: 30,
          opacity: fadeIn(frame, fps, 25),
          transform: `translateY(${slideUp(frame, fps, 25)}px)`,
        }}
      >
        of job seekers report
        <br />
        being ghosted after interviews
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
