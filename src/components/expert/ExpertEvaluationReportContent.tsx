import { ExpertAvatar } from "@/components/expert/ExpertAvatar";
import {
  authenticityAssessmentTheme,
  authenticityBadgeColors,
  authenticityTone,
  EVALUATION_REPORT_TOKENS,
} from "@/lib/expert/evaluationReportTokens";
import {
  EVALUATION_REPORT_INTER_FONT_URL,
  evaluationReportFontFaceCss,
  evaluationReportLayoutCss,
} from "@/lib/expert/evaluationReportLayoutStyles";
import {
  EVALUATION_REPORT_BRAND,
  EVALUATION_REPORT_SUBTITLE,
  EVALUATION_REPORT_TITLE,
  formatReportHeaderDate,
  formatReportRating,
  formatReportRequestLabel,
  reportGalleryMedia,
  type EvaluationReportDisplay,
  type EvaluationReportSection,
} from "@/lib/expert/evaluationReportView";
import type { RequestMediaItem } from "@/lib/expert/types";

type ExpertEvaluationReportContentProps = {
  report: EvaluationReportDisplay;
};

const t = EVALUATION_REPORT_TOKENS;

function DocumentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v18M5 7l7 4 7-4M5 17l7-4 7 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CoinsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="8" cy="8" rx="5" ry="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M3 8v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V8" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="16" cy="14" rx="5" ry="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M11 14v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="m14.5 9.5-2 5-5 2 2-5 5-2Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ExpertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function AuthenticityBadge({ value }: { value: string }) {
  const tone = authenticityTone(value);
  const colors = authenticityBadgeColors(tone);

  return (
    <span
      className="eval-report-auth-badge"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {value === "—" ? "Pending" : value}
    </span>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 7.5 13.2 10.8 16.7 11.1 14.1 13.3 14.9 16.7 12 15 9.1 16.7 9.9 13.3 7.3 11.1 10.8 10.8 12 7.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ValueCoinsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="8" cy="8" rx="5" ry="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 8v3.5c0 1.2 2.2 2.25 5 2.25s5-1.05 5-2.25V8" stroke="currentColor" strokeWidth="1.75" />
      <ellipse cx="16" cy="14" rx="5" ry="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M11 14v3.5c0 1.2 2.2 2.25 5 2.25s5-1.05 5-2.25V14" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function ExpertStatRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="eval-report-stat-row">
      <span className="eval-report-stat-label">{label}</span>
      <span className="eval-report-stat-value">{value}</span>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="eval-report-summary-row">
      <span style={{ color: t.colors.summaryIcon, flexShrink: 0 }}>{icon}</span>
      <span className="eval-report-summary-label">{label}</span>
      <span className="eval-report-summary-value">{value}</span>
    </div>
  );
}

function CoinGalleryItem({
  item,
  index,
  isVideo,
}: {
  item: RequestMediaItem;
  index: number;
  isVideo?: boolean;
}) {
  const src = item.kind === "image" ? item.src : item.poster;
  const size = t.hero.coinImageSizePx;
  const overlap = index === 0 ? 0 : -t.hero.coinImageOverlapPx;

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-2 border-white bg-input-bg shadow-sm"
      style={{
        width: size,
        height: size,
        marginLeft: overlap,
        zIndex: 10 - index,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- user-uploaded remote media URL
        <img src={src} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-neutral-900 text-[10px] font-semibold text-white">
          Video
        </span>
      )}
      {isVideo ? (
        <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[8px] text-white">
          ▶
        </span>
      ) : null}
    </div>
  );
}

function KeyValueCard({ section }: { section: EvaluationReportSection }) {
  return (
    <div className="eval-report-kv-card">
      {section.fields.map((field) => (
        <div key={field.label} className="eval-report-kv-row">
          <span className="eval-report-kv-label">{field.label}</span>
          <span className="eval-report-kv-value">{field.value}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="eval-report-section-heading">
      <span className="eval-report-section-icon">{icon}</span>
      <h3 className="eval-report-section-title">{title}</h3>
    </div>
  );
}

function ReportPageShell({
  page,
  children,
}: {
  page: 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <section data-report-export-page={page} className="eval-report-page">
      {children}
    </section>
  );
}

function ReportHeader({
  requestLabel,
  submittedDate,
}: {
  requestLabel: string;
  submittedDate: string;
}) {
  return (
    <header className="eval-report-header">
      <div className="eval-report-header-brand">
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset from /public */}
        <img
          src="/coinzy-logo.png"
          alt={EVALUATION_REPORT_BRAND}
          width={t.header.logoSizePx}
          height={t.header.logoSizePx}
          className="eval-report-header-logo"
        />
        <div>
          <p className="eval-report-brand-name">{EVALUATION_REPORT_BRAND}</p>
          <p className="eval-report-brand-subtitle">{EVALUATION_REPORT_SUBTITLE}</p>
        </div>
      </div>

      <div className="eval-report-header-right">
        <h1 className="eval-report-report-title">{EVALUATION_REPORT_TITLE}</h1>
        <p className="eval-report-report-meta">
          Request ID: {requestLabel} | Date: {submittedDate}
        </p>
      </div>
    </header>
  );
}

function ReportHeroSection({ report }: { report: EvaluationReportDisplay }) {
  const gallery = reportGalleryMedia(report.media);
  const videoItems = report.media.filter((item) => item.kind === "video");
  const rarity = report.hero.rarity;
  const showRarityBadge = rarity !== "—";

  return (
    <div className="eval-report-hero-grid">
      <section className="eval-report-hero-card">
        <p className="eval-report-hero-kicker">Evaluated by Expert</p>

        {report.expert ? (
          <>
            <div className="eval-report-hero-profile">
              <ExpertAvatar
                profilePicture={report.expert.profilePicture}
                initials={report.expert.initials}
                name={report.expert.fullName}
                size="md"
                fallbackClassName="bg-[#703838] text-white"
                className="!h-14 !w-14 !text-lg shrink-0"
              />
              <div>
                <h2 className="eval-report-hero-name">{report.expert.fullName}</h2>
                <p className="eval-report-hero-tagline">{report.expert.tagline}</p>
              </div>
            </div>

            <div className="eval-report-stat-box">
              <ExpertStatRow
                label="Experience"
                value={report.expert.experienceLabel}
              />
              <ExpertStatRow
                label="Evaluations"
                value={String(report.expert.evaluationsCount)}
              />
              <ExpertStatRow
                label="Rating"
                value={formatReportRating(
                  report.expert.ratingAverage,
                  report.expert.ratingCount,
                )}
              />
            </div>

            {report.expert.expertiseTags.length > 0 ? (
              <div className="eval-report-expertise-block">
                <p className="eval-report-expertise-kicker">Expertise</p>
                <div className="eval-report-chip-row">
                  {report.expert.expertiseTags.map((tag) => (
                    <span key={tag} className="eval-report-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <p className="eval-report-hero-tagline" style={{ marginTop: 18 }}>
            Expert details unavailable.
          </p>
        )}
      </section>

      <section className="eval-report-hero-card">
        <div className="eval-report-coin-header">
          <h2 className="eval-report-coin-title">{report.hero.coinTitle}</h2>
          {showRarityBadge ? (
            <span className="eval-report-rarity-badge">{rarity}</span>
          ) : null}
        </div>

        {gallery.length > 0 || videoItems.length > 0 ? (
          <div className="eval-report-coin-gallery">
            {gallery.map((item, index) => (
              <CoinGalleryItem key={`${item.src}-${index}`} item={item} index={index} />
            ))}
            {videoItems.slice(0, 1).map((item, index) => (
              <CoinGalleryItem
                key={`video-${item.src}`}
                item={item}
                index={gallery.length + index}
                isVideo
              />
            ))}
          </div>
        ) : null}

        <div className="eval-report-summary-box">
          <SummaryRow
            icon={<ShieldIcon />}
            label="Authenticity"
            value={report.hero.authenticity}
          />
          <SummaryRow
            icon={<StarCircleIcon />}
            label="Condition"
            value={report.hero.condition}
          />
          <SummaryRow
            icon={<ValueCoinsIcon />}
            label="Est. Value"
            value={report.hero.estimatedValue}
          />
        </div>
      </section>
    </div>
  );
}

function ReportPageOneSections({ report }: { report: EvaluationReportDisplay }) {
  return (
    <div className="eval-report-sections-grid">
      <div>
        <SectionHeading icon={<DocumentIcon />} title={report.general.title} />
        <KeyValueCard section={report.general} />
      </div>

      <div className="eval-report-sections-right">
        <div>
          <SectionHeading icon={<ScaleIcon />} title={report.physical.title} />
          <KeyValueCard section={report.physical} />
        </div>
        <div>
          <SectionHeading icon={<CoinsIcon />} title={report.market.title} />
          <KeyValueCard section={report.market} />
        </div>
      </div>
    </div>
  );
}

function ReportDesignSection({ report }: { report: EvaluationReportDisplay }) {
  return (
    <div className="eval-report-design-block">
      <SectionHeading icon={<CompassIcon />} title="Design Details" />
      <div className="eval-report-design-card">
        <div className="eval-report-field-block">
          <p className="eval-report-field-label">Front (Obverse)</p>
          <p className="eval-report-field-value">{report.designDetails.obverse}</p>
        </div>
        <div className="eval-report-field-block">
          <p className="eval-report-field-label">Back (Reverse)</p>
          <p className="eval-report-field-value">{report.designDetails.reverse}</p>
        </div>
        <div className="eval-report-field-block">
          <p className="eval-report-field-label">History</p>
          <p className="eval-report-field-value">{report.designDetails.history}</p>
        </div>
      </div>
    </div>
  );
}

function ReportAssessmentSection({ report }: { report: EvaluationReportDisplay }) {
  const assessmentTheme = authenticityAssessmentTheme(
    authenticityTone(report.assessment.authenticity),
  );

  return (
    <div className="eval-report-assessment-block">
      <SectionHeading icon={<ExpertIcon />} title="Expert Assessment" />
      <div className="eval-report-assessment-card">
        <div
          className="eval-report-auth-card"
          style={{ backgroundColor: assessmentTheme.cardBg }}
        >
          <div className="eval-report-assessment-top">
            <p className="eval-report-field-label">Authenticity</p>
            <AuthenticityBadge value={report.assessment.authenticity} />
          </div>
          <p className="eval-report-auth-note">{report.assessment.authenticityNote}</p>
        </div>

        <div
          className={
            assessmentTheme.showConditionTint
              ? "eval-report-condition-card eval-report-field-block"
              : "eval-report-condition-card eval-report-condition-card--plain eval-report-field-block"
          }
          style={
            assessmentTheme.showConditionTint
              ? { backgroundColor: t.colors.conditionBg }
              : undefined
          }
        >
          <p className="eval-report-field-label">Condition Grade</p>
          <p className="eval-report-field-value">{report.assessment.condition}</p>
        </div>

        <div className="eval-report-recommendation eval-report-field-block">
          <p className="eval-report-field-label">Expert Recommendation</p>
          <p className="eval-report-field-value">
            {report.assessment.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReportFooter({ report }: { report: EvaluationReportDisplay }) {
  return (
    <footer className="eval-report-footer">
      <div>
        <p>Certified System Watermark</p>
        <p style={{ marginTop: 6 }}>Generated by Coinzy Expert Evaluation System</p>
      </div>
      {report.expert ? (
        <div className="eval-report-footer-right">
          <p className="eval-report-footer-name">{report.expert.fullName}</p>
          <p className="eval-report-footer-role">Expert Numismatist</p>
        </div>
      ) : null}
    </footer>
  );
}

export function ExpertEvaluationReportContent({
  report,
}: ExpertEvaluationReportContentProps) {
  const requestLabel = formatReportRequestLabel(
    report.requestDisplayId,
    report.requestId,
  );
  const submittedDate = formatReportHeaderDate(report.submittedAt);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- report preview + PDF must match Inter */}
      <link rel="stylesheet" href={EVALUATION_REPORT_INTER_FONT_URL} />
      <style
        dangerouslySetInnerHTML={{
          __html: `${evaluationReportFontFaceCss()}${evaluationReportLayoutCss()}`,
        }}
      />
      <div className="eval-report-pages-stack text-text">
      <ReportPageShell page={1}>
        <div className="eval-report-page-body">
          <ReportHeader
            requestLabel={requestLabel}
            submittedDate={submittedDate}
          />
          <ReportHeroSection report={report} />
          <ReportPageOneSections report={report} />
        </div>
      </ReportPageShell>

      <ReportPageShell page={2}>
        <div className="eval-report-page-body eval-report-page-body--page-two">
          <ReportHeader
            requestLabel={requestLabel}
            submittedDate={submittedDate}
          />
          <ReportDesignSection report={report} />
          <ReportAssessmentSection report={report} />
          <ReportFooter report={report} />
        </div>
      </ReportPageShell>
    </div>
    </>
  );
}
