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
          fontSize: 64,
          fontWeight: 600,
          color: colors.textDim,
          textAlign: "center" as const,
          opacity: fadeIn(frame, fps, 5),
          transform: `translateY(${slideUp(frame, fps, 5)}px)`,
        }}
      >
        What if you never
      </div>

      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: colors.text,
          textAlign: "center" as const,
          marginTop: 20,
          opacity: fadeIn(frame, fps, 20),
          transform: `translateY(${slideUp(frame, fps, 20)}px)`,
        }}
      >
        had to wonder
      </div>

      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: colors.secondary,
          textAlign: "center" as const,
          marginTop: 10,
          opacity: fadeIn(frame, fps, 35),
          transform: `translateY(${slideUp(frame, fps, 35)}px)`,
        }}
      >
        where you stand?
      </div>
    </AbsoluteFill>
  );
};
