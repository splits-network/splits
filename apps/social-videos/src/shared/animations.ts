import { interpolate, spring, SpringConfig } from "remotion";

const springConfig: SpringConfig = {
  damping: 12,
  mass: 0.5,
  stiffness: 100,
};

export function fadeIn(frame: number, fps: number, delay: number = 0) {
  return interpolate(frame - delay, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function fadeOut(frame: number, fps: number, startFrame: number) {
  return interpolate(frame - startFrame, [0, fps * 0.4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function slideUp(
  frame: number,
  fps: number,
  delay: number = 0,
  distance: number = 80
) {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: springConfig,
  });
  return interpolate(progress, [0, 1], [distance, 0]);
}

export function scaleIn(frame: number, fps: number, delay: number = 0) {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, mass: 0.4, stiffness: 120 },
  });
  return interpolate(progress, [0, 1], [0.3, 1]);
}

export function countUp(
  frame: number,
  fps: number,
  delay: number,
  duration: number,
  target: number
) {
  const progress = interpolate(frame - delay, [0, fps * duration], [0, target], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.round(progress);
}

export function pulse(frame: number, fps: number, speed: number = 2) {
  return 1 + 0.05 * Math.sin((frame / fps) * Math.PI * speed);
}

export function staggerDelay(index: number, baseDelay: number, gap: number = 15) {
  return baseDelay + index * gap;
}
