
/**
 * PORSENI PELAJAR MELAWI 2026
 * Import 06B.3 — Final Reconciliation Audit
 *
 * Read-only terhadap data peserta.
 * Tidak membuat UUID atau menulis Registry.
 */

const WEBSITE_RECON_06B3_CONFIG = Object.freeze({
  mode: "DRY_RUN",
  reportSpreadsheetIdProperty:
    "PORSENI_06B2_REVIEW_SPREADSHEET_ID"
});


function registryAuditReconciliation06B3() {
  if (WEBSITE_RECON_06B3_CONFIG.mode !== "DRY_RUN") {
    throw new Error("Mode wajib DRY_RUN.");
  }

  const props = PropertiesService.getScriptProperties();

  const reportId = props.getProperty(
    WEBSITE_RECON_06B3_CONFIG.reportSpreadsheetIdProperty
  );

  if (!reportId) {
    throw new Error(
      "Script Property PORSENI_06B2_REVIEW_SPREADSHEET_ID belum diisi."
    );
  }

  const ss = SpreadsheetApp.openById(reportId);

  const requiredSheets = [
    "AMBIGUOUS_MATCH",
    "WEBSITE_UNMATCHED",
    "SOURCE_UNMATCHED"
  ];

  requiredSheets.forEach(function(name) {
    if (!ss.getSheetByName(name)) {
      throw new Error("Sheet laporan tidak ditemukan: " + name);
    }
  });

  const ambiguous = readReviewSheet06B3_(
    ss.getSheetByName("AMBIGUOUS_MATCH")
  );

  const websiteUnmatched = readReviewSheet06B3_(
    ss.getSheetByName("WEBSITE_UNMATCHED")
  );

  const sourceUnmatched = readReviewSheet06B3_(
    ss.getSheetByName("SOURCE_UNMATCHED")
  );

  const ambiguousCount = ambiguous.length;
  const websiteUnmatchedCount = websiteUnmatched.length;
  const sourceUnmatchedCount = sourceUnmatched.length;

  const summary = [
    ["PORSENI 2026 — FINAL RECONCILIATION 06B.3", ""],
    ["Mode", "DRY_RUN"],
    ["Tanggal audit", new Date()],
    ["", ""],
    ["Kategori", "Jumlah", "Status", "Tindakan"],
    [
      "Kasus ambigu",
      ambiguousCount,
      ambiguousCount > 0 ? "REVIEW_REQUIRED" : "CLEAR",
      ambiguousCount > 0
        ? "Verifikasi manual; jangan merge otomatis."
        : "Tidak ada kasus ambigu."
    ],
    [
      "Website unmatched",
      websiteUnmatchedCount,
      websiteUnmatchedCount > 0 ? "REVIEW_REQUIRED" : "CLEAR",
      websiteUnmatchedCount > 0
        ? "Pertahankan data website; investigasi sumber."
        : "Semua website records memiliki kandidat."
    ],
    [
      "Source unmatched",
      sourceUnmatchedCount,
      sourceUnmatchedCount > 0 ? "REVIEW_REQUIRED" : "CLEAR",
      sourceUnmatchedCount > 0
        ? "Jangan impor otomatis ke master website."
        : "Semua source records memiliki kandidat."
    ],
    ["", ""],
    ["Registry Build Status", "BLOCKED_PENDING_REVIEW"],
    [
      "Alasan",
      "Masih terdapat kasus yang perlu verifikasi manual."
    ],
    ["Registry ditulis", "NO"],
    ["UUID dibuat", "NO"],
    ["Kartu diterbitkan", "NO"],
    ["Sumber diubah", "NO"]
  ];

  let target = ss.getSheetByName("RECONCILIATION_06B3");

  if (target) {
    throw new Error(
      "Sheet RECONCILIATION_06B3 sudah ada. " +
      "Tidak ditimpa untuk menjaga hasil audit sebelumnya."
    );
  }

  target = ss.insertSheet("RECONCILIATION_06B3");

  target.getRange(
    1, 1, summary.length, 4
  ).setValues(summary.map(function(row) {
    return [
      row[0] || "",
      row[1] || "",
      row[2] || "",
      row[3] || ""
    ];
  }));

  target.setFrozenRows(5);
  target.getRange(1, 1, 1, 4).setFontWeight("bold");
  target.getRange(5, 1, 1, 4).setFontWeight("bold");
  target.getDataRange().setWrap(true);
  target.autoResizeColumns(1, 4);

  const result = {
    tahap: "Import 06B.3 — Final Reconciliation Audit",
    mode: "DRY_RUN",
    ambiguousCases: ambiguousCount,
    websiteUnmatched: websiteUnmatchedCount,
    sourceUnmatched: sourceUnmatchedCount,
    reconciliationSheetCreated: true,
    registryBuildStatus: "BLOCKED_PENDING_REVIEW",
    registryWritten: false,
    uuidGenerated: false,
    cardsPublished: false,
    sourceModified: false,
    privacy: "NO_PERSONAL_DATA_LOGGED"
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


function readReviewSheet06B3_(sheet) {
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) return [];

  return values.slice(1).filter(function(row) {
    return row.some(function(value) {
      return String(value || "").trim() !== "";
    });
  });
}
