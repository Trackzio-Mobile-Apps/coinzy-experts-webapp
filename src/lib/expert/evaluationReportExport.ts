import type { EvaluationReportDisplay } from "@/lib/expert/evaluationReportView";
import { formatReportSubmittedAt } from "@/lib/expert/evaluationReportView";

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
    .brand {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #7b3f40;
      margin: 0;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.025em;
      color: #111111;
      margin: 8px 0 0;
      line-height: 1.3;
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
      <p class="brand">Coinzy Expert Evaluation Report</p>
      <h1 class="title">${escapeHtml(report.coinTitle)}</h1>
    </header>
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

function buildEvaluationReportPdfDocument(
  report: EvaluationReportDisplay,
  jsPDF: typeof import("jspdf").jsPDF,
): import("jspdf").jsPDF {
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const margin = 15;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...PDF_COLORS.primary);
  pdf.text("COINZY EXPERT EVALUATION REPORT", margin, y);
  y += 7;

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
  const { jsPDF } = await import("jspdf");
  const pdf = buildEvaluationReportPdfDocument(report, jsPDF);
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
