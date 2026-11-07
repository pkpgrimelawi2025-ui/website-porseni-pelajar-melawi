
/**
 * PORSENI PELAJAR MELAWI 2026
 * Import 06B — Website Master + Photo Match Audit
 *
 * MODE: READ ONLY / DRY RUN
 *
 * MASTER:
 *   Rekap website GitHub Pages
 *
 * SOURCE:
 *   14 spreadsheet pendaftaran
 *
 * TIDAK:
 *   - Menulis Registry
 *   - Mengubah spreadsheet sumber
 *   - Membuat UUID
 *   - Menerbitkan kartu
 *   - Mencetak nama/NISN/Drive ID ke log
 */

const WEBSITE_MASTER_AUDIT_CONFIG = Object.freeze({
  mode: "DRY_RUN",

  websiteJsonUrl:
    "https://pkpgrimelawi2025-ui.github.io/website-porseni-pelajar-melawi/data/rekap-pendaftaran.json",

  expectedWebsiteParticipation: 282,

  // Nama file konfigurasi utama harus tetap KONFIGURASI.
  sourceConfigName: "KONFIGURASI"
});


/**
 * Normalisasi teks untuk pencocokan.
 * Tidak mengubah data asli.
 */
function websiteAuditNormalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/**
 * Normalisasi nama cabang.
 */
function websiteAuditNormalizeBranch(value) {
  return websiteAuditNormalizeText(value);
}


/**
 * Membentuk key pencocokan nama + cabang.
 *
 * Nama dan cabang saja dipakai sebagai kandidat.
 * Tidak digunakan untuk menggabungkan identitas Registry.
 */
function websiteAuditCreateKey(name, branch) {
  return (
    websiteAuditNormalizeText(name) +
    "||" +
    websiteAuditNormalizeBranch(branch)
  );
}


/**
 * Mengambil JSON master website.
 */
function websiteAuditFetchMaster() {
  const response = UrlFetchApp.fetch(
    WEBSITE_MASTER_AUDIT_CONFIG.websiteJsonUrl,
    {
      muteHttpExceptions: true,
      followRedirects: true
    }
  );

  const status = response.getResponseCode();

  if (status !== 200) {
    throw new Error(
      "JSON website gagal dibaca. HTTP " + status
    );
  }

  const json = JSON.parse(response.getContentText());

  if (!json || !Array.isArray(json.peserta)) {
    throw new Error(
      "Struktur JSON website tidak sesuai. Properti peserta tidak ditemukan."
    );
  }

  return json;
}


/**
 * Import 06B — Audit master website terhadap 14 sumber.
 *
 * Keluaran hanya ringkasan anonim.
 */
function registryAuditWebsiteMaster06B() {
  if (
    WEBSITE_MASTER_AUDIT_CONFIG.mode !== "DRY_RUN"
  ) {
    throw new Error("Mode wajib DRY_RUN.");
  }

  if (
    typeof KONFIGURASI === "undefined" ||
    !Array.isArray(KONFIGURASI.sumber)
  ) {
    throw new Error(
      "KONFIGURASI.sumber tidak ditemukan."
    );
  }

  if (
    typeof normalizerSplitNames !== "function"
  ) {
    throw new Error(
      "Fungsi normalizerSplitNames() tidak ditemukan."
    );
  }

  const master = websiteAuditFetchMaster();
  const websiteParticipants = master.peserta;

  const websiteMap = new Map();
  const websiteBranchCounts = {};
  const sourceBranchCounts = {};

  let websiteRowsInvalid = 0;
  let websiteDuplicateKeys = 0;

  /**
   * Siapkan master website.
   * Website tetap menjadi sumber utama.
   */
  websiteParticipants.forEach(function (item) {
    const name = String(item.nama || "").trim();
    const branch = String(
      item.cabang_lomba || ""
    ).trim();

    if (!name || !branch) {
      websiteRowsInvalid++;
      return;
    }

    const key = websiteAuditCreateKey(
      name,
      branch
    );

    if (!websiteMap.has(key)) {
      websiteMap.set(key, []);
    }

    websiteMap.get(key).push(item);

    websiteBranchCounts[branch] =
      (websiteBranchCounts[branch] || 0) + 1;
  });

  websiteMap.forEach(function (items) {
    if (items.length > 1) {
      websiteDuplicateKeys++;
    }
  });

  /**
   * Audit sumber.
   * Sumber hanya digunakan untuk mencocokkan foto.
   */
  const sourceMap = new Map();

  let sourceResponses = 0;
  let sourceParticipants = 0;
  let sourcePhotosFilled = 0;
  let sourceErrors = 0;
  let sourceHeaderErrors = 0;

  const branchReport = [];

  KONFIGURASI.sumber.forEach(function (source) {
    const branchReportItem = {
      branch: source.nama,
      status: "PENDING",
      responses: 0,
      participants: 0,
      photoResponses: 0,
      matchedWebsite: 0,
      unmatchedSource: 0,
      matchedWithPhoto: 0,
      websiteOnlyCount: 0,
      errors: 0
    };

    try {
      const ss = SpreadsheetApp.openById(
        source.id
      );

      const sheet = ss.getSheets().find(
        function (tab) {
          return tab.getSheetId() ===
            Number(source.gid);
        }
      );

      if (!sheet) {
        branchReportItem.status =
          "GID_NOT_FOUND";
        branchReportItem.errors++;
        sourceErrors++;
        branchReport.push(branchReportItem);
        return;
      }

      const values =
        sheet.getDataRange().getDisplayValues();

      if (values.length < 2) {
        branchReportItem.status =
          "NO_DATA";
        branchReport.push(branchReportItem);
        return;
      }

      const headers = values[0];

      const missingHeaders =
        normalizerValidateHeaders(
          headers,
          source.kode
        );

      if (missingHeaders.length) {
        branchReportItem.status =
          "HEADER_INVALID";
        branchReportItem.errors++;
        sourceHeaderErrors++;
        branchReport.push(branchReportItem);
        return;
      }

      const branchConfig =
        NORMALIZER_BRANCH[source.kode];

      for (let i = 1; i < values.length; i++) {
        const row = values[i];

        const hasData = row.some(function (cell) {
          return String(cell || "").trim() !== "";
        });

        if (!hasData) continue;

        const sourceRow = i + 1;

        const rawName =
          normalizerGetValue(
            row,
            headers,
            NORMALIZER_HEADER.nama
          );

        const names =
          normalizerSplitNames(
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

        branchReportItem.responses++;
        sourceResponses++;

        if (photo) {
          branchReportItem.photoResponses++;
          sourcePhotosFilled++;
        }

        names.forEach(function (participantName) {
          const key = websiteAuditCreateKey(
            participantName,
            source.nama
          );

          sourceParticipants++;
          branchReportItem.participants++;

          if (!sourceMap.has(key)) {
            sourceMap.set(key, []);
          }

          sourceMap.get(key).push({
            branchCode: source.kode,
            photoAvailable: Boolean(photo)
          });
        });
      }

      branchReportItem.status = "SUCCESS";

    } catch (err) {
      branchReportItem.status = "ERROR";
      branchReportItem.errors++;
      sourceErrors++;
    }

    branchReport.push(branchReportItem);
  });


  /**
   * Pencocokan sumber ke master website.
   * Hanya menghitung kecocokan.
   */
  let sourceMatchedWebsite = 0;
  let sourceUnmatched = 0;
  let sourceMatchedPhoto = 0;

  sourceMap.forEach(function (sourceEntries, key) {
    const websiteEntries = websiteMap.get(key);

    if (!websiteEntries) {
      sourceUnmatched += sourceEntries.length;
      return;
    }

    sourceMatchedWebsite += sourceEntries.length;

    const hasPhoto = sourceEntries.some(
      function (entry) {
        return entry.photoAvailable;
      }
    );

    if (hasPhoto) {
      sourceMatchedPhoto += websiteEntries.length;
    }
  });


  /**
   * Hitung peserta website yang tidak ditemukan
   * pada sumber, berdasarkan nama + cabang.
   */
  let websiteOnly = 0;
  let websiteMatched = 0;
  let websiteMatchedWithPhoto = 0;

  websiteMap.forEach(function (websiteEntries, key) {
    const sourceEntries = sourceMap.get(key);

    if (!sourceEntries) {
      websiteOnly += websiteEntries.length;
      return;
    }

    websiteMatched += websiteEntries.length;

    const hasPhoto = sourceEntries.some(
      function (entry) {
        return entry.photoAvailable;
      }
    );

    if (hasPhoto) {
      websiteMatchedWithPhoto +=
        websiteEntries.length;
    }
  });


  /**
   * Per cabang: ringkasan pencocokan.
   */
  branchReport.forEach(function (branch) {
    const branchName = branch.branch;

    const websiteCount =
      websiteBranchCounts[branchName] || 0;

    const sourceCount =
      branch.participants;

    branch.websiteParticipants =
      websiteCount;

    branch.sourceParticipants =
      sourceCount;
  });


  const result = {
    tahap:
      "Import 06B — Website Master + Photo Match Audit",

    mode: "DRY_RUN",

    master: {
      totalWebsiteParticipation:
        websiteParticipants.length,

      expectedBaseline:
        WEBSITE_MASTER_AUDIT_CONFIG
          .expectedWebsiteParticipation,

      baselineMatches:
        websiteParticipants.length ===
        WEBSITE_MASTER_AUDIT_CONFIG
          .expectedWebsiteParticipation,

      websiteRowsInvalid:
        websiteRowsInvalid,

      duplicateNameBranchKeys:
        websiteDuplicateKeys
    },

    source: {
      branches: KONFIGURASI.sumber.length,
      responses: sourceResponses,
      participantsAfterSplit:
        sourceParticipants,
      photoResponsesFilled:
        sourcePhotosFilled,
      errors: sourceErrors,
      headerErrors: sourceHeaderErrors
    },

    matching: {
      sourceParticipantsMatchedToWebsite:
        sourceMatchedWebsite,

      sourceParticipantsUnmatched:
        sourceUnmatched,

      websiteParticipantsMatchedToSource:
        websiteMatched,

      websiteParticipantsOnly:
        websiteOnly,

      websiteParticipantsWithPhotoCandidate:
        websiteMatchedWithPhoto,

      photoMatchCoveragePercent:
        websiteParticipants.length
          ? Number(
              (
                websiteMatchedWithPhoto /
                websiteParticipants.length
              ) * 100
            ).toFixed(2)
          : 0
    },

    privacy:
      "NO_PERSONAL_DATA_LOGGED",

    registryWritten: false,
    sourceModified: false,
    uuidGenerated: false,
    cardsPublished: false,

    perBranch: branchReport
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}

/**
 * ============================================================
 * PORSENI PELAJAR MELAWI 2026
 * IMPORT 06B.1 — CORRECTED WEBSITE MASTER + PHOTO MATCH AUDIT
 * VERSION: 1.1.0
 *
 * MODE: READ ONLY / DRY RUN
 *
 * Website = MASTER kepesertaan
 * Spreadsheet sumber = kandidat foto
 *
 * Tidak:
 * - Menulis Registry
 * - Mengubah spreadsheet sumber
 * - Membuat UUID
 * - Menerbitkan kartu
 * - Mencetak nama/NISN/Drive ID ke log
 * ============================================================
 */

const WEBSITE_MASTER_AUDIT_06B1_CONFIG = Object.freeze({
  mode: "DRY_RUN",
  expectedWebsiteParticipation: 282
});


/**
 * Audit 06B.1
 *
 * Matching unik:
 *   satu peserta website + satu peserta sumber
 *
 * Ambigu:
 *   lebih dari satu kandidat pada website atau sumber
 *
 * Foto tim:
 *   satu respons sumber dengan lebih dari satu nama
 *   dan foto tersedia. Foto kandidat dapat digunakan
 *   bersama anggota tim yang cocok secara unik.
 *
 * Catatan:
 *   Tidak melakukan assignment otomatis pada key ambigu.
 */
function registryAuditWebsiteMaster06B1() {

  if (
    WEBSITE_MASTER_AUDIT_06B1_CONFIG.mode !== "DRY_RUN"
  ) {
    throw new Error("Mode harus DRY_RUN.");
  }

  if (
    typeof KONFIGURASI === "undefined" ||
    !Array.isArray(KONFIGURASI.sumber)
  ) {
    throw new Error("KONFIGURASI.sumber tidak ditemukan.");
  }

  if (
    typeof normalizerSplitNames !== "function" ||
    typeof normalizerValidateHeaders !== "function" ||
    typeof normalizerGetValue !== "function"
  ) {
    throw new Error("Fungsi Normalizer tidak lengkap.");
  }

  const master = websiteAuditFetchMaster();
  const websiteRows = master.peserta;

  const websiteMap = new Map();
  const sourceMap = new Map();
  const branchMap = new Map();

  let websiteInvalid = 0;
  let sourceResponses = 0;
  let sourceParticipants = 0;
  let sourcePhotosFilled = 0;
  let sourceErrors = 0;
  let sourceHeaderErrors = 0;

  let sourceTeamResponses = 0;
  let sourceTeamParticipants = 0;
  let sourceTeamPhotoParticipants = 0;

  /**
   * Branch key:
   * normalize branch label.
   */
  function branchKey(branch) {
    return websiteAuditNormalizeBranch(branch);
  }

  /**
   * Key participant:
   * normalized name + normalized branch.
   */
  function participantKey(name, branch) {
    return websiteAuditCreateKey(name, branch);
  }

  /**
   * Per-branch report object.
   */
  function getBranchReport(branchName) {
    const key = branchKey(branchName);

    if (!branchMap.has(key)) {
      branchMap.set(key, {
        branch: branchName,
        websiteParticipants: 0,
        sourceParticipants: 0,

        matchedUnique: 0,
        ambiguousWebsite: 0,
        ambiguousSource: 0,
        unmatchedWebsite: 0,
        unmatchedSource: 0,

        photoCandidateUnique: 0,
        photoCandidateTeamShared: 0,
        photoCandidateIndividual: 0,
        photoMissing: 0,
        photoAmbiguous: 0,

        sourceResponses: 0,
        sourcePhotoResponses: 0,
        sourceTeamResponses: 0,
        sourceTeamMembers: 0,

        errors: 0
      });
    }

    return branchMap.get(key);
  }

  /**
   * Website master indexing.
   */
  websiteRows.forEach(function (item) {
    const name = String(item.nama || "").trim();
    const branch = String(item.cabang_lomba || "").trim();

    if (!name || !branch) {
      websiteInvalid++;
      return;
    }

    const key = participantKey(name, branch);

    if (!websiteMap.has(key)) {
      websiteMap.set(key, []);
    }

    websiteMap.get(key).push({
      branch: branch,
      nameKey: websiteAuditNormalizeText(name)
    });

    getBranchReport(branch).websiteParticipants++;
  });


  /**
   * Read source registration spreadsheets.
   */
  KONFIGURASI.sumber.forEach(function (source) {

    const report = getBranchReport(source.nama);

    try {

      const ss = SpreadsheetApp.openById(source.id);

      const sheet = ss.getSheets().find(function (tab) {
        return tab.getSheetId() === Number(source.gid);
      });

      if (!sheet) {
        report.errors++;
        sourceErrors++;
        return;
      }

      const values = sheet.getDataRange().getDisplayValues();

      if (values.length < 2) {
        return;
      }

      const headers = values[0];

      const headerErrors = normalizerValidateHeaders(
        headers,
        source.kode
      );

      if (headerErrors.length) {
        report.errors++;
        sourceErrors++;
        sourceHeaderErrors++;
        return;
      }

      const branchConfig = NORMALIZER_BRANCH[source.kode];

      for (let i = 1; i < values.length; i++) {

        const row = values[i];

        const hasData = row.some(function (cell) {
          return String(cell || "").trim() !== "";
        });

        if (!hasData) continue;

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

        sourceResponses++;
        report.sourceResponses++;

        if (photo) {
          sourcePhotosFilled++;
          report.sourcePhotoResponses++;
        }

        const isTeam = names.length > 1;

        if (isTeam) {
          sourceTeamResponses++;
          report.sourceTeamResponses++;

          sourceTeamParticipants += names.length;
          report.sourceTeamMembers += names.length;

          if (photo) {
            sourceTeamPhotoParticipants += names.length;
          }
        }

        names.forEach(function (participantName) {

          const key = participantKey(
            participantName,
            source.nama
          );

          sourceParticipants++;
          report.sourceParticipants++;

          if (!sourceMap.has(key)) {
            sourceMap.set(key, []);
          }

          sourceMap.get(key).push({
            branchKey: branchKey(source.nama),
            photoAvailable: Boolean(photo),
            isTeam: isTeam,
            responseHasPhoto: Boolean(photo)
          });

        });
      }

    } catch (err) {
      report.errors++;
      sourceErrors++;
    }

  });


  /**
   * Matching per unique participant key.
   *
   * No auto-match if duplicates exist on either side.
   */
  let matchedUnique = 0;
  let ambiguousWebsite = 0;
  let ambiguousSource = 0;
  let unmatchedWebsite = 0;
  let unmatchedSource = 0;

  let photoCandidateUnique = 0;
  let photoCandidateTeamShared = 0;
  let photoCandidateIndividual = 0;
  let photoMissing = 0;
  let photoAmbiguous = 0;

  websiteMap.forEach(function (websiteEntries, key) {

    const sourceEntries = sourceMap.get(key);
    const branch = websiteEntries[0].branch;
    const report = getBranchReport(branch);

    if (!sourceEntries) {
      unmatchedWebsite += websiteEntries.length;
      report.unmatchedWebsite += websiteEntries.length;
      return;
    }

    /**
     * Ambiguous if duplicates appear on either side.
     * No automatic photo assignment.
     */
    if (
      websiteEntries.length !== 1 ||
      sourceEntries.length !== 1
    ) {

      ambiguousWebsite += websiteEntries.length;
      ambiguousSource += sourceEntries.length;

      report.ambiguousWebsite += websiteEntries.length;
      report.ambiguousSource += sourceEntries.length;

      photoAmbiguous += websiteEntries.length;
      report.photoAmbiguous += websiteEntries.length;

      return;
    }

    matchedUnique++;
    report.matchedUnique++;

    const sourceEntry = sourceEntries[0];

    if (!sourceEntry.photoAvailable) {
      photoMissing++;
      report.photoMissing++;
      return;
    }

    photoCandidateUnique++;
    report.photoCandidateUnique++;

    if (sourceEntry.isTeam) {
      photoCandidateTeamShared++;
      report.photoCandidateTeamShared++;
    } else {
      photoCandidateIndividual++;
      report.photoCandidateIndividual++;
    }

  });


  /**
   * Source-only keys:
   * Count source participants that do not appear
   * in the website master.
   */
  sourceMap.forEach(function (sourceEntries, key) {

    const websiteEntries = websiteMap.get(key);

    if (!websiteEntries) {
      unmatchedSource += sourceEntries.length;

      const branchReportItem = Array.from(
        branchMap.values()
      ).find(function (item) {
        return branchKey(item.branch) ===
          sourceEntries[0].branchKey;
      });

      if (branchReportItem) {
        branchReportItem.unmatchedSource +=
          sourceEntries.length;
      }
    }

  });


  /**
   * Final per-branch report.
   */
  const perBranch = Array.from(branchMap.values());

  perBranch.forEach(function (branch) {

    branch.photoCoveragePercent =
      branch.websiteParticipants
        ? Number(
            (
              branch.photoCandidateUnique /
              branch.websiteParticipants
            ) * 100
          ).toFixed(2)
        : 0;

  });


  const totalWebsiteValid = websiteRows.length - websiteInvalid;

  const result = {

    tahap:
      "Import 06B.1 — Corrected Website Master + Photo Match Audit",

    mode: "DRY_RUN",

    master: {
      totalWebsiteParticipation: websiteRows.length,
      expectedBaseline:
        WEBSITE_MASTER_AUDIT_06B1_CONFIG
          .expectedWebsiteParticipation,

      baselineMatches:
        websiteRows.length ===
        WEBSITE_MASTER_AUDIT_06B1_CONFIG
          .expectedWebsiteParticipation,

      websiteRowsInvalid: websiteInvalid,
      websiteRowsValid: totalWebsiteValid
    },

    source: {
      branches: KONFIGURASI.sumber.length,
      responses: sourceResponses,
      participantsAfterSplit: sourceParticipants,
      photoResponsesFilled: sourcePhotosFilled,
      teamResponses: sourceTeamResponses,
      teamParticipants: sourceTeamParticipants,
      teamPhotoParticipants: sourceTeamPhotoParticipants,
      errors: sourceErrors,
      headerErrors: sourceHeaderErrors
    },

    matching: {
      matchedUnique: matchedUnique,

      ambiguousWebsiteParticipants:
        ambiguousWebsite,

      ambiguousSourceParticipants:
        ambiguousSource,

      unmatchedWebsiteParticipants:
        unmatchedWebsite,

      unmatchedSourceParticipants:
        unmatchedSource,

      photoCandidateUnique:
        photoCandidateUnique,

      photoCandidateTeamShared:
        photoCandidateTeamShared,

      photoCandidateIndividual:
        photoCandidateIndividual,

      photoMissing:
        photoMissing,

      photoAmbiguous:
        photoAmbiguous,

      photoCandidateCoveragePercent:
        totalWebsiteValid
          ? Number(
              (
                photoCandidateUnique /
                totalWebsiteValid
              ) * 100
            ).toFixed(2)
          : 0
    },

    privacy: "NO_PERSONAL_DATA_LOGGED",

    registryWritten: false,
    sourceModified: false,
    uuidGenerated: false,
    cardsPublished: false,

    perBranch: perBranch
  };


  console.log(JSON.stringify(result, null, 2));

  return result;
}
