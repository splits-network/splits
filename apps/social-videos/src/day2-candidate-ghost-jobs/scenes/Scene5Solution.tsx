import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, kicker, featureTitle, featureDesc } from "../../shared/styles";
import { fadeIn, slideUp, staggerDelay } from "../../shared/animations";

const features = [
  {
    icon: "$",
    title: "Financial Incentive",
    desc: "Recruiters earn split fees on every fill",
  },
  {
    icon: "REP",
    title: "Reputation at Stake",
    desc: "Visible scores and badge history",
  },
  {
    icon: "AI",
    title: "Fraud Detection",
    desc: "AI flags suspicious posting patterns",
  },
  {
    icon: "VER",
    title: "Verified Recruiters",
    desc: "Real people with real track records",
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
        APPLICANT NETWORK
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
