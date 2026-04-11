import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";

const SCENE_DURATION = 210;
const FADE_DURATION = 15;

export { SCENE_DURATION };

const SceneWithFade: React.FC<{
  children: React.ReactNode;
  duration: number;
  isLast: boolean;
}> = ({ children, duration, isLast }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, FADE_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = isLast
    ? 1
    : interpolate(frame, [duration - FADE_DURATION, duration], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      {children}
    </AbsoluteFill>
  );
};

export const SceneSequence: React.FC<{
  scenes: React.FC[];
}> = ({ scenes }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#09090b",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {scenes.map((Component, i) => (
        <Sequence
          key={i}
          from={i * SCENE_DURATION}
          durationInFrames={SCENE_DURATION}
        >
          <SceneWithFade
            duration={SCENE_DURATION}
            isLast={i === scenes.length - 1}
          >
            <Component />
          </SceneWithFade>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
