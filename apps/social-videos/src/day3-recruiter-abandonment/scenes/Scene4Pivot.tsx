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
          backgroundColor: colors.primaryLight,
          marginBottom: 50,
          opacity: fadeIn(frame, fps, 0),
          transform: `scaleX(${scaleIn(frame, fps, 0)})`,
        }}
      />

      <div
        style={{
          fontSize: 160,
          fontWeight: 900,
          color: colors.text,
          textAlign: "center" as const,
          opacity: fadeIn(frame, fps, 5),
          transform: `scale(${scaleIn(frame, fps, 5)})`,
          lineHeight: 1,
        }}
      >
        3 steps.
      </div>

      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: colors.primaryLight,
          textAlign: "center" as const,
          marginTop: 30,
          opacity: fadeIn(frame, fps, 30),
          transform: `translateY(${slideUp(frame, fps, 30)}px)`,
        }}
      >
        Not 30.
      </div>
    </AbsoluteFill>
  );
};
