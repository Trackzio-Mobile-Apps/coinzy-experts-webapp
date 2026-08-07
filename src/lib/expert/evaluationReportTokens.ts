/**
 * Evaluation report layout tokens — aligned to Figma "Report - coin authentic".
 */
export const EVALUATION_REPORT_TOKENS = {
  page: {
    maxWidthPx: 794,
    paddingXPx: 32,
    paddingYPx: 32,
  },
  colors: {
    /** Page and hero card background */
    canvas: "#FFFFFF",
    text: "#1A1A1A",
    textMuted: "#6B6560",
    labelMuted: "#8A847C",
    /** Maroon accent — kicker, section titles, avatar */
    primary: "#703838",
    border: "#E8E4DC",
    inputBg: "#F5F3EE",
    /** Nested white stats box inside expert card */
    statBoxBg: "#FFFFFF",
    statBoxBorder: "#E8E4DC",
    /** White panels (key-value cards, stat box) */
    surface: "#FFFFFF",
    /** Hero / nested panels on the report page */
    cardBg: "#FFFFFF",
    logoBg: "#1c1917",
    expertAvatarBg: "#703838",
    expertAvatarText: "#FFFFFF",
    /** Coin hero summary strip — shared label color */
    summaryLabel: "#1A1A1A",
    /** global/green/10 + value text (Authentic) */
    summaryAuthenticBg: "#E8FAF0",
    summaryAuthenticValue: "#0E835B",
    /** global/yellow/10 + value text (Doubtful) */
    summaryDoubtfulBg: "#FFF9E6",
    summaryDoubtfulValue: "#C86B00",
    /** global/red/10 + value text (Fake) */
    summaryFakeBg: "#FFF3F0",
    summaryFakeValue: "#8A1700",
    /** Pending / unknown authenticity */
    summaryNeutralBg: "#F5F3EE",
    summaryNeutralValue: "#6B6560",
    /** Condition grade tint inside Expert Assessment (Authentic only) */
    conditionBg: "#F8F3F0",
    rarityBg: "#FDF2B3",
    rarityText: "#967117",
    /** Expertise chips — light beige + gray text */
    chipBg: "#EDE8DF",
    chipText: "#6B6560",
    expertiseKicker: "#8A847C",
    /** Expert Assessment — Authentic tone */
    assessmentAuthenticCardBg: "#E8FAF0",
    assessmentAuthenticBadgeBg: "#00C853",
    /** Expert Assessment — Fake tone */
    assessmentFakeCardBg: "#FFF3F0",
    assessmentFakeBadgeBg: "#8A1700",
    /** Expert Assessment — Doubtful tone */
    assessmentDoubtfulCardBg: "#FFF9E6",
    assessmentDoubtfulBadgeBg: "#C86B00",
    assessmentBadgeText: "#FFFFFF",
    star: "#1A1A1A",
  },
  header: {
    logoSizePx: 44,
    logoRadiusPx: 10,
    paddingBottomPx: 28,
    brandGapPx: 14,
    reportTitleSizePx: 22,
    metaSizePx: 12,
  },
  hero: {
    gapPx: 24,
    marginTopPx: 32,
    cardRadiusPx: 16,
    cardPaddingPx: 22,
    cardBorderPx: 1,
    avatarSizePx: 56,
    coinImageSizePx: 56,
    coinImageOverlapPx: 14,
  },
  section: {
    gapPx: 32,
    marginTopPx: 36,
    iconSizePx: 28,
    cardRadiusPx: 12,
    rowPaddingYPx: 14,
    rowPaddingXPx: 18,
  },
  footer: {
    marginTopPx: 36,
    paddingTopPx: 28,
    fontSizePx: 11,
  },
  pdf: {
    /** A4 portrait at ~96dpi content width */
    pageWidthPx: 794,
    pageHeightPx: 1123,
    pagePaddingPx: 18,
    headerPaddingBottomPx: 14,
    heroMarginTopPx: 14,
    heroGapPx: 14,
    heroCardPaddingPx: 14,
    heroAvatarSizePx: 48,
    heroCoinImageSizePx: 48,
    sectionMarginTopPx: 16,
    sectionGapPx: 14,
    sectionHeadingGapPx: 8,
    kvRowPaddingYPx: 7,
    kvRowPaddingXPx: 12,
    kvFontSizePx: 13,
    designBlockMarginTopPx: 16,
    assessmentBlockMarginTopPx: 16,
    footerPaddingTopPx: 14,
  },
} as const;

export type AuthenticityTone = "authentic" | "doubtful" | "fake" | "neutral";

export function authenticityTone(value: string): AuthenticityTone {
  const normalized = value.trim().toLowerCase();
  if (normalized === "authentic") return "authentic";
  if (normalized === "doubtful") return "doubtful";
  if (normalized === "fake") return "fake";
  return "neutral";
}

export function authenticityAssessmentTheme(tone: AuthenticityTone): {
  cardBg: string;
  badgeBg: string;
  badgeText: string;
  showConditionTint: boolean;
} {
  const { colors } = EVALUATION_REPORT_TOKENS;
  switch (tone) {
    case "authentic":
      return {
        cardBg: colors.assessmentAuthenticCardBg,
        badgeBg: colors.assessmentAuthenticBadgeBg,
        badgeText: colors.assessmentBadgeText,
        showConditionTint: true,
      };
    case "fake":
      return {
        cardBg: colors.assessmentFakeCardBg,
        badgeBg: colors.assessmentFakeBadgeBg,
        badgeText: colors.assessmentBadgeText,
        showConditionTint: false,
      };
    case "doubtful":
      return {
        cardBg: colors.assessmentDoubtfulCardBg,
        badgeBg: colors.assessmentDoubtfulBadgeBg,
        badgeText: colors.assessmentBadgeText,
        showConditionTint: false,
      };
    default:
      return {
        cardBg: colors.inputBg,
        badgeBg: colors.labelMuted,
        badgeText: colors.assessmentBadgeText,
        showConditionTint: false,
      };
  }
}

export function authenticityBadgeColors(tone: AuthenticityTone): {
  bg: string;
  text: string;
  border: string;
} {
  const theme = authenticityAssessmentTheme(tone);
  return {
    bg: theme.badgeBg,
    text: theme.badgeText,
    border: theme.badgeBg,
  };
}

/** Coin hero summary box — bg + accent text/icons by authenticity tone. */
export function authenticitySummaryTheme(tone: AuthenticityTone): {
  boxBg: string;
  accentColor: string;
  labelColor: string;
} {
  const { colors } = EVALUATION_REPORT_TOKENS;
  switch (tone) {
    case "authentic":
      return {
        boxBg: colors.summaryAuthenticBg,
        accentColor: colors.summaryAuthenticValue,
        labelColor: colors.summaryLabel,
      };
    case "doubtful":
      return {
        boxBg: colors.summaryDoubtfulBg,
        accentColor: colors.summaryDoubtfulValue,
        labelColor: colors.summaryLabel,
      };
    case "fake":
      return {
        boxBg: colors.summaryFakeBg,
        accentColor: colors.summaryFakeValue,
        labelColor: colors.summaryLabel,
      };
    default:
      return {
        boxBg: colors.summaryNeutralBg,
        accentColor: colors.summaryNeutralValue,
        labelColor: colors.summaryLabel,
      };
  }
}
