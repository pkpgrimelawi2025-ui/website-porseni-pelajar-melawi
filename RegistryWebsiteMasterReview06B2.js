
/**
 * PORSENI PELAJAR MELAWI 2026
 * Import 06B.2 — Private Match Review Report
 *
 * READ ONLY terhadap sumber dan Registry.
 * Membuat spreadsheet laporan privat baru.
 *
 * Tidak:
 * - Mengubah Registry
 * - Mengubah master website
 * - Mengubah spreadsheet pendaftaran
 * - Membuat UUID Registry
 * - Menerbitkan kartu
 * - Menampilkan NISN/Drive ID/source row di log
 */

const WEBSITE_MASTER_REVIEW_06B2 = Object.freeze({
  mode: "DRY_RUN",
  title: "PORSENI 2026 — Private Match Review 06B.2",
  sourceConfigName: "KONFIGURASI"
});


function registryAuditWebsiteMasterReview06B2() {
  if (WEBSITE_MASTER_REVIEW_06B2.mode !== "DRY_RUN") {
    throw new Error("Mode wajib DRY_RUN.");
  }

  if (typeof KONFIGURASI === "undefined" ||
      !Array.isArray(KONFIGURASI.sumber)) {
    throw new Error("KONFIGURASI.sumber tidak ditemukan.");
  }

  const master = websiteAuditFetchMaster();
  const websiteMap = new Map();
  const sourceMap = new Map();

  const websiteRecords = [];
  const sourceRecords = [];

  let sourceErrors = 0;
  let sourceHeaderErrors = 0;
  let sourceResponseCount = 0;
  let sourceParticipantCount = 0;

  // --------------------------------------------------
  // 1. Website master
  // --------------------------------------------------

  master.peserta.forEach(function(item) {
    const name = String(item.nama || "").trim();
    const branch = String(item.cabang_lomba || "").trim();

    if (!name || !branch) return;

    const key = websiteAuditCreateKey(name, branch);

    const record = {
      name: name,
      branch: branch,
      key: key
    };

    websiteRecords.push(record);

    if (!websiteMap.has(key)) {
      websiteMap.set(key, []);
    }

    websiteMap.get(key).push(record);
  });

  // --------------------------------------------------
  // 2. Sumber pendaftaran
  // --------------------------------------------------

  KONFIGURASI.sumber.forEach(function(source) {
    try {
      const ss = SpreadsheetApp.openById(source.id);

      const sheet = ss.getSheets().find(function(tab) {
        return tab.getSheetId() === Number(source.gid);
      });

      if (!sheet) {
        sourceErrors++;
        return;
      }

      const values = sheet.getDataRange().getDisplayValues();

      if (values.length < 2) return;

      const headers = values[0];

      const missingHeaders = normalizerValidateHeaders(
        headers,
        source.kode
      );

      if (missingHeaders.length) {
        sourceHeaderErrors++;
        return;
      }

      const branchConfig = NORMALIZER_BRANCH[source.kode];

      for (let i = 1; i < values.length; i++) {
        const row = values[i];

        if (!row.some(function(cell) {
          return String(cell || "").trim() !== "";
        })) {
          continue;
        }

        const sourceRow = i + 1;

        const rawName = normalizerGetValue(
          row,
          headers,
          NORMALIZER_HEADER.nama
        );

        const names = normalizerSplitNames(
          source.kode,
          sourceRow,
          rawName
        );

        const photo = String(
          normalizerGetValue(
            row,
            headers,
            branchConfig.foto
          ) || ""
        ).trim();

        sourceResponseCount++;

        names.forEach(function(nameValue, ordinal) {
          const name = String(nameValue || "").trim();

          if (!name) return;

          const key = websiteAuditCreateKey(
            name,
            source.nama
          );

          const record = {
            name: name,
            branch: source.nama,
            key: key,
            photoAvailable: Boolean(photo),
            teamResponse: names.length > 1,
            teamSize: names.length
          };

          sourceRecords.push(record);
          sourceParticipantCount++;

          if (!sourceMap.has(key)) {
            sourceMap.set(key, []);
          }

          sourceMap.get(key).push(record);
        });
      }

    } catch (err) {
      // Tidak mencetak pesan error yang mungkin berisi detail sumber.
      sourceErrors++;
    }
  });

  // --------------------------------------------------
  // 3. Ambiguous match
  // --------------------------------------------------

  const ambiguousRows = [[
    "Nama Peserta",
    "Cabang",
    "Jumlah Master Website",
    "Jumlah Sumber",
    "Status Pencocokan",
    "Foto Tersedia pada Sumber",
    "Catatan Review"
  ]];

  const allKeys = new Set();

  websiteMap.forEach(function(_, key) {
    allKeys.add(key);
  });

  sourceMap.forEach(function(_, key) {
    allKeys.add(key);
  });

  allKeys.forEach(function(key) {
    const webEntries = websiteMap.get(key) || [];
    const srcEntries = sourceMap.get(key) || [];

    if (!webEntries.length || !srcEntries.length) return;

    if (webEntries.length > 1 || srcEntries.length > 1) {
      const representative =
        webEntries[0] || srcEntries[0];

      const photoAvailable = srcEntries.some(function(entry) {
        return entry.photoAvailable;
      });

      let status = "AMBIGUOUS";

      if (webEntries.length > 1 && srcEntries.length > 1) {
        status = "DUPLICATE_BOTH_SIDES";
      } else if (webEntries.length > 1) {
        status = "DUPLICATE_WEBSITE";
      } else {
        status = "DUPLICATE_SOURCE";
      }

      ambiguousRows.push([
        representative.name,
        representative.branch,
        webEntries.length,
        srcEntries.length,
        status,
        photoAvailable ? "YES" : "NO",
        "Perlu verifikasi manual; jangan auto-merge."
      ]);
    }
  });

  // --------------------------------------------------
  // 4. Website-only
  // --------------------------------------------------

  const websiteUnmatchedRows = [[
    "Nama Peserta",
    "Cabang",
    "Status",
    "Catatan"
  ]];

  websiteRecords.forEach(function(record) {
    const srcEntries = sourceMap.get(record.key) || [];

    if (srcEntries.length === 0) {
      websiteUnmatchedRows.push([
        record.name,
        record.branch,
        "WEBSITE_ONLY",
        "Tidak ditemukan kandidat pada sumber pendaftaran."
      ]);
    }
  });

  // --------------------------------------------------
  // 5. Source-only
  // --------------------------------------------------

  const sourceUnmatchedRows = [[
    "Nama Peserta",
    "Cabang",
    "Foto Tersedia",
    "Respons Tim",
    "Ukuran Tim",
    "Status",
    "Catatan"
  ]];

  sourceRecords.forEach(function(record) {
    const webEntries = websiteMap.get(record.key) || [];

    if (webEntries.length === 0) {
      sourceUnmatchedRows.push([
        record.name,
        record.branch,
        record.photoAvailable ? "YES" : "NO",
        record.teamResponse ? "YES" : "NO",
        record.teamSize,
        "SOURCE_ONLY",
        "Jangan tambahkan otomatis ke master website."
      ]);
    }
  });

  // --------------------------------------------------
  // 6. Create private review spreadsheet
  // --------------------------------------------------

  const report = SpreadsheetApp.create(
    WEBSITE_MASTER_REVIEW_06B2.title +
    " — " +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyyMMdd_HHmmss"
    )
  );

  const firstSheet = report.getSheets()[0];
  firstSheet.setName("AMBIGUOUS_MATCH");

  firstSheet.getRange(
    1, 1,
    ambiguousRows.length,
    ambiguousRows[0].length
  ).setValues(ambiguousRows);

  const websiteSheet = report.insertSheet("WEBSITE_UNMATCHED");
  websiteSheet.getRange(
    1, 1,
    websiteUnmatchedRows.length,
    websiteUnmatchedRows[0].length
  ).setValues(websiteUnmatchedRows);

  const sourceSheet = report.insertSheet("SOURCE_UNMATCHED");
  sourceSheet.getRange(
    1, 1,
    sourceUnmatchedRows.length,
    sourceUnmatchedRows[0].length
  ).setValues(sourceUnmatchedRows);

  // Format dasar laporan.
  [firstSheet, websiteSheet, sourceSheet].forEach(function(sheet) {
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, sheet.getLastColumn())
      .setFontWeight("bold")
      .setWrap(true);

    sheet.getDataRange().setVerticalAlignment("middle");
    sheet.autoResizeColumns(
      1,
      Math.min(sheet.getLastColumn(), 7)
    );
  });

  // --------------------------------------------------
  // 7. Anonymous execution summary
  // --------------------------------------------------

  const result = {
    tahap: "Import 06B.2 — Private Match Review Report",
    mode: "DRY_RUN",

    websiteRecords: websiteRecords.length,
    sourceResponses: sourceResponseCount,
    sourceParticipants: sourceParticipantCount,

    ambiguousReviewRows: Math.max(0, ambiguousRows.length - 1),
    websiteUnmatchedRows: Math.max(0, websiteUnmatchedRows.length - 1),
    sourceUnmatchedRows: Math.max(0, sourceUnmatchedRows.length - 1),

    sourceErrors: sourceErrors,
    sourceHeaderErrors: sourceHeaderErrors,

    reportCreated: true,
    reportPrivate: true,

    registryWritten: false,
    sourceModified: false,
    uuidGenerated: false,
    cardsPublished: false,

    privacy: "NO_PERSONAL_DATA_LOGGED"
  };

  result.reportUrl = report.getUrl();
  result.reportId = report.getId();

  console.log(JSON.stringify(result, null, 2));
  console.log("REPORT_URL: " + report.getUrl());
  console.log("REPORT_ID: " + report.getId());

  return result;
}
