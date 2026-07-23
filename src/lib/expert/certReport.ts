import { normalizeMongoId } from "@/lib/expert/format";
import type { BackendReport } from "@/lib/expert/types";

export type CertReport = {
  requestId: string;
  certificationNo: string;
  pcgsNo: string;
  dateMintmark: string;
  denomination: string;
  region: string;
  grade: string;
  pedigree: string;
  mintage: string;
  holderType: string;
  population: string;
  popHigher: string;
  priceGuideValue: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "—"): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && !Number.isNaN(value)) return String(value);
  return fallback;
}

function formatUsdRange(min: string, max: string, average: string): string {
  if (average !== "—") return `$${average}`;
  if (min !== "—" && max !== "—") return `$${min} – $${max}`;
  if (max !== "—") return `$${max}`;
  if (min !== "—") return `$${min}`;
  return "—";
}

export function mapReportToCertView(report: BackendReport): CertReport {
  const content = asRecord(report.content);
  const min = asString(content.estimatedValueMinUsd, "");
  const max = asString(content.estimatedValueMaxUsd, "");
  const average = asString(content.averageMarketValueUsd, "");

  return {
    requestId: normalizeMongoId(report.requestId) || asString(report.requestId),
    certificationNo: normalizeMongoId(report._id).slice(-8).toUpperCase() || "—",
    pcgsNo: asString(content.nameDesignation),
    dateMintmark: asString(
      [content.yearOfMinting, content.periodReign].find(
        (value) => typeof value === "string" && value.trim(),
      ),
    ),
    denomination: asString(content.currency),
    region: asString(content.issuer),
    grade: asString(content.conditionGrade),
    pedigree: asString(content.mintStation),
    mintage: asString(content.circulation),
    holderType: asString(content.material),
    population: asString(content.rarityIndex),
    popHigher: asString(content.rarity),
    priceGuideValue: formatUsdRange(min, max, average),
  };
}

export function certReportDownloadFilename(report: CertReport): string {
  const safe = report.certificationNo.replace(/\s+/g, "");
  return `Coinzy-CERT-${safe}.html`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildCertReportDownloadHtml(report: CertReport): string {
  const title = `CERT VERIFICATION #${report.certificationNo}`;
  const rows: [string, string][] = [
    ["PCGS #", report.pcgsNo],
    ["Date, Mintmark", report.dateMintmark],
    ["Denomination", report.denomination],
    ["Region", report.region],
    ["Grade", report.grade],
    ["Pedigree", report.pedigree],
    ["Mintage", report.mintage],
    ["Holder Type", report.holderType],
    ["Population", report.population],
    ["Pop Higher", report.popHigher],
    ["PCGS Price Guide™ Value", report.priceGuideValue],
  ];

  const tableRows = rows
    .map(
      ([label, value], index) =>
        `<tr style="background:${index % 2 === 0 ? "#f9fafb" : "#fff"}"><td style="padding:10px 14px;font-weight:600;color:#374151;width:38%;border-bottom:1px solid #e5e7eb">${escapeHtml(label)}</td><td style="padding:10px 14px;color:#111827;border-bottom:1px solid #e5e7eb">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 16px; background: #f3f4f6; color: #111827; }
    .toolbar { display: flex; align-items: center; gap: 8px; max-width: 720px; margin: 0 auto 16px; padding: 8px 12px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; }
    .toolbar button { width: 32px; height: 32px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; cursor: pointer; font-size: 16px; line-height: 1; }
    .toolbar button:disabled { opacity: 0.4; cursor: not-allowed; }
    .toolbar span { min-width: 52px; text-align: center; font-size: 13px; font-weight: 600; }
    .viewport { overflow: auto; max-width: 100%; }
    .wrap { max-width: 720px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.08); transform-origin: top center; transition: transform .2s ease; }
    .hint { font-size: 13px; color: #4b5563; margin-bottom: 24px; padding: 12px 16px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe; }
    h1 { font-size: 22px; letter-spacing: .04em; margin: 0 0 8px; }
    .sub { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    @media print { .toolbar, .hint { display: none; } body { padding: 0; background: #fff; } .wrap { box-shadow: none; transform: none !important; } }
  </style>
</head>
<body>
  <div class="toolbar" role="toolbar" aria-label="Zoom controls">
    <button type="button" id="zoom-out" aria-label="Zoom out">−</button>
    <span id="zoom-label">100%</span>
    <button type="button" id="zoom-in" aria-label="Zoom in">+</button>
  </div>
  <div class="viewport">
  <div class="wrap" id="report-content">
    <p class="hint"><strong>Save as PDF:</strong> Open this file in Chrome or Edge, press <strong>Ctrl+P</strong> (⌘P on Mac), and choose <strong>Save as PDF</strong>.</p>
    <p style="font-size:12px;color:#2563eb;margin:0 0 16px">Coinzy request: ${escapeHtml(report.requestId)}</p>
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">PCGS Coin Information — According to the PCGS Certification Database, the requested certification number is defined as the following:</p>
    <table>${tableRows}</table>
    <p style="margin-top:24px;font-size:12px;color:#9ca3af">Generated by Coinzy. Not affiliated with PCGS.</p>
  </div>
  </div>
  <script>
    (function () {
      var zoom = 100;
      var min = 50;
      var max = 200;
      var step = 25;
      var content = document.getElementById("report-content");
      var label = document.getElementById("zoom-label");
      var out = document.getElementById("zoom-out");
      var inn = document.getElementById("zoom-in");
      function render() {
        content.style.transform = "scale(" + (zoom / 100) + ")";
        label.textContent = zoom + "%";
        out.disabled = zoom <= min;
        inn.disabled = zoom >= max;
      }
      out.addEventListener("click", function () { zoom = Math.max(min, zoom - step); render(); });
      inn.addEventListener("click", function () { zoom = Math.min(max, zoom + step); render(); });
      render();
    })();
  </script>
</body>
</html>`;
}

export function downloadCertReportHtml(report: CertReport): void {
  const html = buildCertReportDownloadHtml(report);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = certReportDownloadFilename(report);
  anchor.rel = "noopener";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function printCertReportPdf(report: CertReport): void {
  const html = buildCertReportDownloadHtml(report);
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    downloadCertReportHtml(report);
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
  };
}
