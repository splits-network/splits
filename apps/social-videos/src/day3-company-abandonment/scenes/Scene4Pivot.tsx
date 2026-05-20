import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen } from "../../shared/styles";
import { fadeIn, slideUp, scaleIn } from "../../shared/animations";

export const Scene4Pivot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={fullScreen}>
      <div
        style={{
          width: 120,
          height: 4,
          backgroundColor: colors.secondary,
          marginBottom: 50,
          opacity: fadeIn(frame, fps, 0),
          transform: `scaleX(${scaleIn(frame, fps, 0)})`,
        }}
      />

      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: colors.text,
          textAlign: "center" as const,
          opacity: fadeIn(frame, fps, 5),
          transform: `translateY(${slideUp(frame, fps, 5)}px)`,
        }}
      >
        Fix the
      </div>

      <div
        style={{
          fontSize: 160,
          fontWeight: 900,
          color: colors.secondary,
          textAlign: "center" as const,
          marginTop: 20,
          opacity: fadeIn(frame, fps, 20),
          transform: `scale(${scaleIn(frame, fps, 20)})`,
          lineHeight: 1,
        }}
      >
        leak.
      </div>

      <div
        style={{
          fontSize: 48,
          fontWeight: 600,
          color: colors.textDim,
          textAlign: "center" as const,
          marginTop: 50,
          maxWidth: 800,
          opacity: fadeIn(frame, fps, 45),
          transform: `translateY(${slideUp(frame, fps, 45)}px)`,
        }}
      >
        Every lost applicant is
        <br />
        ad spend thrown away.
      </div>
    </AbsoluteFill>
  );
};
