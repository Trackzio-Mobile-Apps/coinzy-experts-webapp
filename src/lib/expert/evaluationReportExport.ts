import type { EvaluationReportDisplay } from "@/lib/expert/evaluationReportView";
import {
  EVALUATION_REPORT_BRAND,
  EVALUATION_REPORT_SUBTITLE,
  formatReportSubmittedAt,
  groupReportMedia,
} from "@/lib/expert/evaluationReportView";
import type { RequestMediaItem } from "@/lib/expert/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function reportSectionsHtml(report: EvaluationReportDisplay): string {
  return report.sections
    .map((section) => {
      const rows = section.fields
        .map(
          (field, index) => `
        <tr class="${index % 2 === 0 ? "row-even" : "row-odd"}">
          <th scope="row">${escapeHtml(field.label)}</th>
          <td>${escapeHtml(field.value)}</td>
        </tr>`,
        )
        .join("");

      return `
      <section class="report-section">
        <h2>${escapeHtml(section.title)}</h2>
        <div class="table-wrap">
          <table>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>`;
    })
    .join("");
}

function reportMediaHtml(report: EvaluationReportDisplay): string {
  if (report.media.length === 0) return "";

  const groups = groupReportMedia(report.media)
    .map(([group, items]) => {
      const tiles = items
        .map((item) => {
          if (item.kind === "image") {
            return `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" class="media-tile" loading="lazy" />`;
          }
          if (item.poster) {
            return `<div class="media-video"><img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.alt)}" class="media-tile" loading="lazy" /><span class="media-play">▶</span></div>`;
          }
          return `<div class="media-video media-video-fallback"><span>Video</span></div>`;
        })
        .join("");

      return `
      <div class="media-group">
        <p class="media-group-label">${escapeHtml(group)} (${items.length})</p>
        <div class="media-grid">${tiles}</div>
      </div>`;
    })
    .join("");

  return `
    <section class="media-section">
      <h2>Coin images &amp; videos</h2>
      ${groups}
    </section>`;
}

function reportDocumentStyles(): string {
  return `
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111111;
      line-height: 1.5;
    }
    .report {
      max-width: 768px;
      margin: 0 auto;
      padding: 0;
      background: #ffffff;
    }
    .report-header {
      border-bottom: 1px solid #e5e2dc;
      padding-bottom: 24px;
    }
    .report-header-top {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .report-logo {
      display: block;
      width: 48px;
      height: 48px;
      border-radius: 10px;
      object-fit: cover;
      background: #111111;
    }
    .brand-name {
      font-size: 14px;
      font-weight: 600;
      color: #111111;
      margin: 0;
      line-height: 1.3;
    }
    .brand {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #7b3f40;
      margin: 2px 0 0;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.025em;
      color: #111111;
      margin: 20px 0 0;
      line-height: 1.3;
    }
    .media-section { margin-top: 32px; }
    .media-section h2 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px;
      color: #111111;
    }
    .media-group { margin-bottom: 16px; }
    .media-group:last-child { margin-bottom: 0; }
    .media-group-label {
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
      margin: 0 0 8px;
    }
    .media-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .media-tile {
      width: 96px;
      height: 96px;
      border-radius: 8px;
      border: 1px solid #e5e2dc;
      object-fit: cover;
      background: #f0eeea;
    }
    .media-video {
      position: relative;
      width: 96px;
      height: 96px;
    }
    .media-video-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid #e5e2dc;
      background: #111111;
      color: #ffffff;
      font-size: 11px;
      font-weight: 600;
    }
    .media-play {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.28);
      color: #ffffff;
      font-size: 12px;
      border-radius: 8px;
    }
    .sections { margin-top: 32px; }
    .report-section { margin-bottom: 32px; page-break-inside: avoid; }
    .report-section:last-child { margin-bottom: 0; }
    .report-section h2 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: #111111;
    }
    .table-wrap {
      margin-top: 12px;
      overflow: hidden;
      border-radius: 12px;
      border: 1px solid #e5e2dc;
      background: #ffffff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      text-align: left;
    }
    th, td {
      border-bottom: 1px solid #e5e2dc;
      padding: 12px 16px;
      vertical-align: top;
    }
    tr:last-child th, tr:last-child td { border-bottom: none; }
    tr.row-even { background: #faf9f7; }
    tr.row-odd { background: #ffffff; }
    th {
      width: 38%;
      font-weight: 600;
      color: #111111;
    }
    td {
      color: #6b7280;
      white-space: pre-wrap;
      line-height: 1.625;
    }
    .footer {
      margin-top: 32px;
      font-size: 12px;
      color: #6b7280;
    }
  `;
}

function evaluationReportBaseFilename(report: EvaluationReportDisplay): string {
  const safe = report.coinTitle
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 48);
  const suffix = report.reportId.slice(-8).toUpperCase();
  return `Coinzy-Evaluation-${safe || "Report"}-${suffix}`;
}

export function evaluationReportPdfFilename(
  report: EvaluationReportDisplay,
): string {
  return `${evaluationReportBaseFilename(report)}.pdf`;
}

const REPORT_LOGO_PATH = "/coinzy-logo.png";
const REPORT_LOGO_SIZE_MM = 14;
const REPORT_MEDIA_PROXY_PATH = "/api/expert/media";

function reportMediaFetchUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  if (trimmed.startsWith("data:")) return trimmed;
  return `${REPORT_MEDIA_PROXY_PATH}?url=${encodeURIComponent(trimmed)}`;
}

function imageFormatFromBlob(blob: Blob, dataUrl: string): "PNG" | "JPEG" {
  if (blob.type.includes("png")) return "PNG";
  if (blob.type.includes("jpeg") || blob.type.includes("jpg")) return "JPEG";
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  return "JPEG";
}

async function loadReportLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch(REPORT_LOGO_PATH);
    if (!response.ok) return null;

    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }
        reject(new Error("Unable to read logo."));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Standalone HTML document matching the modal report layout. */
export function buildEvaluationReportPrintHtml(
  report: EvaluationReportDisplay,
): string {
  const submitted = formatReportSubmittedAt(report.submittedAt);
  const requestLabel = report.requestDisplayId ?? report.requestId;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(report.coinTitle)} — Coinzy Evaluation Report</title>
  <style>${reportDocumentStyles()}</style>
</head>
<body>
  <article class="report">
    <header class="report-header">
      <div class="report-header-top">
        <img src="${REPORT_LOGO_PATH}" alt="${escapeHtml(EVALUATION_REPORT_BRAND)}" class="report-logo" />
        <div>
          <p class="brand-name">${escapeHtml(EVALUATION_REPORT_BRAND)}</p>
          <p class="brand">${escapeHtml(EVALUATION_REPORT_SUBTITLE.toUpperCase())}</p>
        </div>
      </div>
      <h1 class="title">${escapeHtml(report.coinTitle)}</h1>
    </header>
    ${reportMediaHtml(report)}
    <div class="sections">
      ${reportSectionsHtml(report)}
    </div>
    <p class="footer">Request ${escapeHtml(requestLabel)} · Submitted ${escapeHtml(submitted)}</p>
  </article>
</body>
</html>`;
}

const PDF_COLORS = {
  primary: [123, 63, 64] as [number, number, number],
  text: [17, 17, 17] as [number, number, number],
  textMuted: [107, 114, 128] as [number, number, number],
  border: [229, 226, 220] as [number, number, number],
  rowEven: [250, 249, 247] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

async function loadRemoteImageDataUrl(
  url: string,
): Promise<{ dataUrl: string; format: "PNG" | "JPEG"; width: number; height: number } | null> {
  const fetchTargets = url.startsWith("http")
    ? [reportMediaFetchUrl(url), url]
    : [reportMediaFetchUrl(url)];

  for (const fetchUrl of fetchTargets) {
    try {
      const response = await fetch(fetchUrl, { credentials: "same-origin" });
      if (!response.ok) continue;

      const blob = await response.blob();
      if (!blob.type.startsWith("image/") && !blob.type.includes("octet-stream")) {
        continue;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Unable to read image."));
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });

      const dimensions = await new Promise<{ width: number; height: number } | null>(
        (resolve) => {
          const image = new Image();
          image.onload = () =>
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
          image.onerror = () => resolve(null);
          image.src = dataUrl;
        },
      );
      if (!dimensions || dimensions.width === 0 || dimensions.height === 0) {
        continue;
      }

      return {
        dataUrl,
        format: imageFormatFromBlob(blob, dataUrl),
        ...dimensions,
      };
    } catch {
      // Try next source (direct URL fallback).
    }
  }

  return null;
}

type LoadedReportImage = {
  dataUrl: string;
  format: "PNG" | "JPEG";
  width: number;
  height: number;
  group: string;
  label: string;
};

async function loadReportImages(
  media: RequestMediaItem[],
): Promise<LoadedReportImage[]> {
  const loaded: LoadedReportImage[] = [];

  for (const item of media) {
    const src =
      item.kind === "image"
        ? item.src
        : item.poster?.trim() || "";
    if (!src) continue;

    const image = await loadRemoteImageDataUrl(src);
    if (!image) continue;

    loaded.push({
      ...image,
      group: item.group?.trim() || "Other",
      label: item.alt || item.group || "Coin media",
    });
  }

  return loaded;
}

function buildEvaluationReportPdfDocument(
  report: EvaluationReportDisplay,
  jsPDF: typeof import("jspdf").jsPDF,
  logoDataUrl: string | null,
  images: LoadedReportImage[],
): import("jspdf").jsPDF {
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const margin = 15;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const headerTextX = logoDataUrl
    ? margin + REPORT_LOGO_SIZE_MM + 4
    : margin;

  if (logoDataUrl) {
    pdf.addImage(
      logoDataUrl,
      "PNG",
      margin,
      y,
      REPORT_LOGO_SIZE_MM,
      REPORT_LOGO_SIZE_MM,
    );
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(...PDF_COLORS.text);
  pdf.text(EVALUATION_REPORT_BRAND, headerTextX, y + 5);

  pdf.setFontSize(9);
  pdf.setTextColor(...PDF_COLORS.primary);
  pdf.text(EVALUATION_REPORT_SUBTITLE.toUpperCase(), headerTextX, y + 10);

  y += logoDataUrl ? REPORT_LOGO_SIZE_MM + 6 : 8;

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  pdf.setFontSize(18);
  pdf.setTextColor(...PDF_COLORS.text);
  for (const line of pdf.splitTextToSize(report.coinTitle, contentWidth)) {
    ensureSpace(8);
    pdf.text(line, margin, y);
    y += 8;
  }

  y += 2;
  pdf.setDrawColor(...PDF_COLORS.border);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 10;

  if (images.length > 0) {
    ensureSpace(14);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...PDF_COLORS.text);
    pdf.text("Coin images & videos", margin, y);
    y += 7;

    const tileMm = 28;
    const gapMm = 3;
    const tilesPerRow = Math.max(
      1,
      Math.floor((contentWidth + gapMm) / (tileMm + gapMm)),
    );

    let currentGroup = "";
    let col = 0;

    for (const image of images) {
      if (image.group !== currentGroup) {
        if (col > 0) {
          y += tileMm + gapMm;
          col = 0;
        }
        currentGroup = image.group;
        ensureSpace(10);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(...PDF_COLORS.textMuted);
        pdf.text(currentGroup, margin, y);
        y += 5;
      }

      if (col === tilesPerRow) {
        y += tileMm + gapMm;
        col = 0;
      }

      ensureSpace(tileMm + 4);

      const x = margin + col * (tileMm + gapMm);
      const aspect = image.width / image.height;
      let drawWidth = tileMm;
      let drawHeight = tileMm;
      if (aspect > 1) {
        drawHeight = tileMm / aspect;
      } else {
        drawWidth = tileMm * aspect;
      }

      pdf.addImage(
        image.dataUrl,
        image.format,
        x,
        y,
        drawWidth,
        drawHeight,
      );

      col += 1;
    }

    if (col > 0) {
      y += tileMm + 6;
    }
  }

  for (const item of report.media) {
    if (item.kind !== "video") continue;
    if (item.poster?.trim()) continue;
    ensureSpace(6);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...PDF_COLORS.textMuted);
    pdf.text(
      `Video: ${item.group?.trim() || "Attached"}`,
      margin,
      y,
    );
    y += 5;
  }

  if (report.media.some((item) => item.kind === "video" && !item.poster?.trim())) {
    y += 4;
  }

  const labelWidth = contentWidth * 0.38;
  const valueX = margin + labelWidth + 3;
  const valueWidth = contentWidth - labelWidth - 3;
  const lineHeight = 4.5;
  const cellPadY = 3;
  const cellPadX = 3;

  for (const section of report.sections) {
    ensureSpace(14);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...PDF_COLORS.text);
    pdf.text(section.title, margin, y);
    y += 7;

    for (let i = 0; i < section.fields.length; i++) {
      const field = section.fields[i];
      const labelLines = pdf.splitTextToSize(field.label, labelWidth - cellPadX * 2);
      const valueLines = pdf.splitTextToSize(field.value || "—", valueWidth - cellPadX * 2);
      const rowHeight =
        Math.max(labelLines.length, valueLines.length) * lineHeight + cellPadY * 2;

      ensureSpace(rowHeight);

      pdf.setFillColor(...(i % 2 === 0 ? PDF_COLORS.rowEven : PDF_COLORS.white));
      pdf.rect(margin, y, contentWidth, rowHeight, "F");

      pdf.setDrawColor(...PDF_COLORS.border);
      pdf.setLineWidth(0.2);
      pdf.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

      const textY = y + cellPadY + 3;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(...PDF_COLORS.text);
      pdf.text(labelLines, margin + cellPadX, textY);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...PDF_COLORS.textMuted);
      pdf.text(valueLines, valueX, textY);

      y += rowHeight;
    }

    y += 10;
  }

  ensureSpace(8);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...PDF_COLORS.textMuted);
  const requestLabel = report.requestDisplayId ?? report.requestId;
  const submitted = formatReportSubmittedAt(report.submittedAt);
  pdf.text(`Request ${requestLabel} · Submitted ${submitted}`, margin, y);

  return pdf;
}

/** Download a real `.pdf` file with the same content shown in the report modal. */
export async function downloadEvaluationReportPdf(
  report: EvaluationReportDisplay,
): Promise<void> {
  const [{ jsPDF }, logoDataUrl, images] = await Promise.all([
    import("jspdf"),
    loadReportLogoDataUrl(),
    loadReportImages(report.media),
  ]);
  const pdf = buildEvaluationReportPdfDocument(
    report,
    jsPDF,
    logoDataUrl,
    images,
  );
  pdf.save(evaluationReportPdfFilename(report));
}

/** Opens print dialog with report-only HTML (fallback). */
export function printEvaluationReportPdf(
  report: EvaluationReportDisplay,
): void {
  const html = buildEvaluationReportPrintHtml(report);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("title", "Print evaluation report");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    opacity: "0",
    pointerEvents: "none",
  });
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDocument = frameWindow?.document;
  if (!frameWindow || !frameDocument) {
    iframe.remove();
    return;
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    frameWindow.removeEventListener("afterprint", cleanup);
    iframe.remove();
  };

  frameWindow.addEventListener("afterprint", cleanup);
  window.setTimeout(cleanup, 60_000);

  window.setTimeout(() => {
    frameWindow.focus();
    frameWindow.print();
  }, 50);
}
