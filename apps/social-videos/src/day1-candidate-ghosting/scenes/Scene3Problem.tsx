import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fullScreen, kicker } from "../../shared/styles";
import { fadeIn, slideUp } from "../../shared/animations";

const messages = [
  { text: "Thank you for your time today!", align: "right" as const, delay: 5 },
  { text: "We'll be in touch soon.", align: "left" as const, delay: 20 },
  { text: "Hi! Any updates on the role?", align: "right" as const, delay: 50 },
  { text: "Just following up...", align: "right" as const, delay: 80 },
  { text: "Hello?", align: "right" as const, delay: 110 },
];

export const Scene3Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={fullScreen}>
      <div
        style={{
          ...kicker,
          color: colors.textMuted,
          opacity: fadeIn(frame, fps, 0),
          marginBottom: 50,
        }}
      >
        SOUND FAMILIAR?
      </div>

      <div
        style={{
          width: 860,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {messages.map((msg, i) => {
          const opacity = fadeIn(frame, fps, msg.delay);
          const yOffset = slideUp(frame, fps, msg.delay, 40);
          const isRight = msg.align === "right";

          return (
            <div
              key={i}
              style={{
                alignSelf: isRight ? "flex-end" : "flex-start",
                opacity,
                transform: `translateY(${yOffset}px)`,
              }}
            >
              <div
                style={{
                  padding: "28px 40px",
                  fontSize: 40,
                  fontWeight: 500,
                  color: isRight ? colors.text : colors.textDim,
                  backgroundColor: isRight ? colors.primaryLight : colors.surface,
                  maxWidth: 650,
                  lineHeight: 1.4,
                  border: isRight ? "none" : `1px solid ${colors.surfaceLight}`,
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        <div
          style={{
            alignSelf: "flex-start",
            opacity: fadeIn(frame, fps, 130),
            transform: `translateY(${slideUp(frame, fps, 130, 40)}px)`,
          }}
        >
          <div
            style={{
              padding: "28px 40px",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.surfaceLight}`,
              display: "flex",
              gap: 12,
            }}
          >
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: colors.textMuted,
                  opacity:
                    0.3 +
                    0.7 *
                      Math.abs(
                        Math.sin((frame / fps) * 3 + dot * 1.2)
                      ),
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
