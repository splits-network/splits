import { CSSProperties } from "react";

/**
 * Brand palettes for each platform
 */
export const brands = {
  applicant: {
    name: "Applicant Network",
    url: "applicant.network",
    tagColor: "#0f9d8a",
  },
  splits: {
    name: "Splits Network",
    url: "splits.network",
    tagColor: "#3b5ccc",
  },
  employment: {
    name: "Employment Networks",
    url: "employment-networks.com",
    tagColor: "#233876",
  },
};

export const colors = {
  bg: "#09090b",
  surface: "#18181b",
  surfaceLight: "#27272a",
  primary: "#233876",
  primaryLight: "#3b5ccc",
  secondary: "#0f9d8a",
  accent: "#db2777",
  text: "#fafafa",
  textDim: "#a1a1aa",
  textMuted: "#71717a",
};

export const fullScreen: CSSProperties = {
  width: 1080,
  height: 1920,
  position: "absolute",
  top: 0,
  left: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.bg,
  overflow: "hidden",
};

/**
 * Font sizes — minimum 36px for readability on mobile
 */
export const kicker: CSSProperties = {
  fontSize: 36,
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: colors.secondary,
};

export const heading: CSSProperties = {
  fontSize: 96,
  fontWeight: 900,
  lineHeight: 1.05,
  color: colors.text,
  textAlign: "center" as const,
};

export const subheading: CSSProperties = {
  fontSize: 64,
  fontWeight: 700,
  lineHeight: 1.15,
  color: colors.text,
  textAlign: "center" as const,
};

export const body: CSSProperties = {
  fontSize: 44,
  fontWeight: 400,
  lineHeight: 1.5,
  color: colors.textDim,
  textAlign: "center" as const,
  maxWidth: 900,
};

export const stat: CSSProperties = {
  fontSize: 200,
  fontWeight: 900,
  lineHeight: 1,
  color: colors.accent,
};

export const statLabel: CSSProperties = {
  fontSize: 48,
  fontWeight: 600,
  color: colors.textDim,
  textAlign: "center" as const,
  maxWidth: 800,
};

export const citation: CSSProperties = {
  fontSize: 32,
  color: colors.textMuted,
  fontWeight: 400,
};

export const featureTitle: CSSProperties = {
  fontSize: 40,
  fontWeight: 700,
  color: colors.text,
  lineHeight: 1.3,
};

export const featureDesc: CSSProperties = {
  fontSize: 36,
  color: colors.textDim,
  marginTop: 6,
};
