/**
 * TypeScript mirror of `src/styles/colors.css` for non-CSS contexts
 * (charts, canvas, emails). Prefer CSS variables in components.
 */
export const coinzyColors = {
  canvas: "#f8f5f2",
  surface: "#ffffff",
  primary: "#7a3e3e",
  primaryHover: "#682f2f",
  primaryActive: "#5a2929",
  text: "#111111",
  textMuted: "#6b6b6b",
  border: "#e5e2dc",
  inputBg: "#f0eeea",
  logoBg: "#1c1917",
  logoAccent: "#4ade80",
  successRing: "#dcfce7",
  successCheck: "#166534",
} as const;
