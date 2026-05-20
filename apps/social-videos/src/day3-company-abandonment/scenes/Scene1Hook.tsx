import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, kicker } from "../../shared/styles";
import { fadeIn, slideUp, scaleIn } from "../../shared/animations";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={fullScreen}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.surfaceLight}22 1px, transparent 1px),
            linear-gradient(90deg, ${colors.surfaceLight}22 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: fadeIn(frame, fps, 0) * 0.4,
        }}
      />

      <div
        style={{
          ...kicker,
          color: colors.primary,
          opacity: fadeIn(frame, fps, 5),
          transform: `translateY(${slideUp(frame, fps, 5)}px)`,
          marginBottom: 40,
        }}
      >
        THE LEAKY FUNNEL
      </div>

      <div
        style={{
          fontSize: 84,
          fontWeight: 900,
          lineHeight: 1.1,
          color: colors.text,
          textAlign: "center" as const,
          maxWidth: 900,
          opacity: fadeIn(frame, fps, 15),
          transform: `translateY(${slideUp(frame, fps, 15)}px)`,
        }}
      >
        Your application
        <br />
        form is
      </div>

      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          lineHeight: 1.1,
          color: colors.accent,
          textAlign: "center" as const,
          marginTop: 30,
          opacity: fadeIn(frame, fps, 40),
          transform: `scale(${scaleIn(frame, fps, 40)})`,
        }}
      >
        burning money.
      </div>
    </AbsoluteFill>
  );
};
