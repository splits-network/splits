import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, kicker } from "../../shared/styles";
import { fadeIn, slideUp, staggerDelay } from "../../shared/animations";

const fields = [
  "First Name",
  "Last Name",
  "Email Address",
  "Phone Number",
  "Street Address",
  "City, State, Zip",
  "Current Employer",
  "Previous Employer (1)",
  "Previous Employer (2)",
  "Education History",
  "Skills (separate with commas)",
  "Certifications",
  "References (minimum 3)",
];

export const Scene3Form: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={fullScreen}>
      <div
        style={{
          ...kicker,
          color: colors.textMuted,
          opacity: fadeIn(frame, fps, 0),
          marginBottom: 40,
        }}
      >
        STEP 3 OF 12
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: 860,
        }}
      >
        {fields.map((field, i) => {
          const delay = staggerDelay(i, 5, 8);
          const opacity = fadeIn(frame, fps, delay);
          const yOffset = slideUp(frame, fps, delay, 30);

          return (
            <div
              key={i}
              style={{
                padding: "20px 28px",
                backgroundColor: colors.surface,
                border: `1px solid ${colors.surfaceLight}`,
                opacity,
                transform: `translateY(${yOffset}px)`,
                fontSize: 36,
                color: colors.textDim,
                fontWeight: 500,
              }}
            >
              {field}
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: colors.accent,
          marginTop: 50,
          textAlign: "center" as const,
          opacity: fadeIn(frame, fps, 140),
          transform: `translateY(${slideUp(frame, fps, 140)}px)`,
        }}
      >
        ...and 47 more fields.
      </div>
    </AbsoluteFill>
  );
};
