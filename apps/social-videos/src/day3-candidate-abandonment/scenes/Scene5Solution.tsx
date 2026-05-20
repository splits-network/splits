import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, kicker, featureTitle, featureDesc } from "../../shared/styles";
import { fadeIn, slideUp, staggerDelay } from "../../shared/animations";

const features = [
  {
    icon: "1",
    title: "Upload Your Resume",
    desc: "One time. That's it.",
  },
  {
    icon: "AI",
    title: "AI Builds Your Profile",
    desc: "Experience, skills, education — all parsed",
  },
  {
    icon: "GPT",
    title: "Apply via ChatGPT",
    desc: "Let AI agents apply for you",
  },
  {
    icon: "1C",
    title: "One-Click Apply",
    desc: "From match to applied in seconds",
  },
];

export const Scene5Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={fullScreen}>
      <div
        style={{
          ...kicker,
          color: colors.secondary,
          opacity: fadeIn(frame, fps, 0),
          marginBottom: 60,
        }}
      >
        SMART RESUME
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
          width: 860,
        }}
      >
        {features.map((f, i) => {
          const delay = staggerDelay(i, 15, 18);
          const opacity = fadeIn(frame, fps, delay);
          const yOffset = slideUp(frame, fps, delay, 50);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 32,
                padding: "32px 36px",
                backgroundColor: colors.surface,
                border: `1px solid ${colors.surfaceLight}`,
                opacity,
                transform: `translateY(${yOffset}px)`,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: colors.secondary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 36,
                  fontWeight: 900,
                  color: colors.text,
                }}
              >
                {f.icon}
              </div>
              <div>
                <div style={featureTitle}>{f.title}</div>
                <div style={featureDesc}>{f.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
