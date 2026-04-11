import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Stat } from "./scenes/Scene2Stat";
import { Scene3Impact } from "./scenes/Scene3Impact";
import { Scene4Pivot } from "./scenes/Scene4Pivot";
import { Scene5Solution } from "./scenes/Scene5Solution";
import { Scene6CTA } from "./scenes/Scene6CTA";

const SCENE_DURATION = 210;
const FADE_DURATION = 15;

const scenes = [
  Scene1Hook,
  Scene2Stat,
  Scene3Impact,
  Scene4Pivot,
  Scene5Solution,
  Scene6CTA,
];

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

export const Day1CompanyGhosting: React.FC = () => {
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
