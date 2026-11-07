
/**
 * REGISTRY PORSENI 2026
 * RegistryBuild.gs
 * Schema 1.0
 */

/**
 * Fungsi utama Registry Build.
 *
 * DRY_RUN:
 *   Tidak mengubah apa pun.
 *
 * LIVE:
 *   Membuat Registry jika belum ada,
 *   atau memverifikasi Registry yang sudah ada.
 */
function registryBuild() {
  const mode = String(
    REGISTRY_CONFIG.mode
  ).toUpperCase();

  if (!["DRY_RUN", "LIVE"].includes(mode)) {
    throw new Error(
      "Mode Registry tidak valid: " + mode
    );
  }

  if (REGISTRY_CONFIG.sourceDataEnabled) {
    throw new Error(
      "Build Registry tidak boleh membaca sumber peserta."
    );
  }

  const lock = LockService.getScriptLock();

  if (!lock.tryLock(30000)) {
    throw new Error(
      "Registry Build sedang dijalankan oleh proses lain."
    );
  }

  try {
    const properties =
      PropertiesService.getScriptProperties();

    const registryId = properties.getProperty(
      REGISTRY_CONFIG.scriptPropertyKey
    );

    Logger.log("======================================");
    Logger.log("REGISTRY BUILD");
    Logger.log("======================================");
    Logger.log("Mode: " + mode);
    Logger.log("Schema: " + REGISTRY_CONFIG.schemaVersion);
    Logger.log("Registry Name: " + REGISTRY_CONFIG.registryName);
    Logger.log("Source Data: DISABLED");
    Logger.log("======================================");

    if (mode === "DRY_RUN") {
      registryBuildDryRun_(registryId);
      return;
    }

    if (mode === "LIVE") {
      registryBuildLive_(registryId);
      return;
    }

  } finally {
    lock.releaseLock();
  }
}

/**
 * Simulasi tanpa membuat atau mengubah spreadsheet.
 */
function registryBuildDryRun_(registryId) {
  Logger.log("MODE DRY_RUN: tidak ada perubahan.");

  if (!registryId) {
    Logger.log(
      "Registry belum terdaftar di Script Properties."
    );

    Logger.log(
      "Rencana: membuat spreadsheet Registry baru."
    );

    Logger.log(
      "Sheet yang direncanakan: " +
      REGISTRY_CONFIG.sheets.length
    );

    REGISTRY_CONFIG.sheets.forEach(configSheet => {
      Logger.log(
        "CREATE SHEET: " + configSheet.name +
        " | Kolom: " + configSheet.headers.length
      );
    });

    Logger.log(
      "STATUS: DRY_RUN READY"
    );

    return;
  }

  Logger.log(
    "Registry ID ditemukan: " + registryId
  );

  const spreadsheet =
    SpreadsheetApp.openById(registryId);

  const hasil =
    registryValidasiStruktur_(spreadsheet);

  registryTampilkanLaporanValidasi_(hasil);

  if (!hasil.valid) {
    Logger.log(
      "STATUS: DRY_RUN FAILED — Registry perlu audit."
    );

    return;
  }

  Logger.log(
    "STATUS: DRY_RUN READY — Registry valid."
  );
}

/**
 * Operasi LIVE.
 */
function registryBuildLive_(registryId) {
  if (!REGISTRY_CONFIG.createIfMissing && !registryId) {
    throw new Error(
      "Registry belum ada dan createIfMissing=false."
    );
  }

  let spreadsheet;
  let registryBaru = false;

  if (registryId) {
    spreadsheet =
      SpreadsheetApp.openById(registryId);

    Logger.log(
      "Registry existing ditemukan."
    );

  } else {
    spreadsheet = SpreadsheetApp.create(
      REGISTRY_CONFIG.registryName
    );

    registryBaru = true;

    PropertiesService
      .getScriptProperties()
      .setProperty(
        REGISTRY_CONFIG.scriptPropertyKey,
        spreadsheet.getId()
      );

    Logger.log(
      "Registry baru dibuat."
    );

    Logger.log(
      "Registry ID: " + spreadsheet.getId()
    );
  }

  registryBuildSheets_(spreadsheet);

  const hasil =
    registryValidasiStruktur_(spreadsheet);

  registryTampilkanLaporanValidasi_(hasil);

  if (!hasil.valid) {
    throw new Error(
      "Registry Build gagal validasi."
    );
  }

  Logger.log("======================================");
  Logger.log("REGISTRY BUILD REPORT");
  Logger.log("======================================");

  Logger.log(
    "Registry Name: " + spreadsheet.getName()
  );

  Logger.log(
    "Registry ID: " + spreadsheet.getId()
  );

  Logger.log(
    "Schema Version: " + REGISTRY_CONFIG.schemaVersion
  );

  Logger.log(
    "Mode: LIVE"
  );

  Logger.log(
    "Sheet Expected: " + REGISTRY_CONFIG.sheets.length
  );

  Logger.log(
    "Header Valid: " + hasil.totalHeaderValid
  );

  Logger.log(
    "Data Rows: 0 (Build tidak memasukkan data peserta)"
  );

  Logger.log(
    "Source Access: DISABLED"
  );

  Logger.log(
    "Participant ID: NOT GENERATED"
  );

  Logger.log(
    "Card Dataset: NOT GENERATED"
  );

  Logger.log(
    "New Registry: " + (registryBaru ? "YES" : "NO")
  );

  Logger.log(
    "STATUS: BUILD SUCCESS"
  );

  Logger.log("======================================");

  Logger.log(
    "URL Registry: " + spreadsheet.getUrl()
  );
}

/**
 * Membuat sheet dan header sesuai schema.
 *
 * Jika sheet sudah ada:
 * - header cocok: pertahankan
 * - header berbeda: hentikan
 *
 * Data existing tidak dihapus.
 */
function registryBuildSheets_(spreadsheet) {
  REGISTRY_CONFIG.sheets.forEach(configSheet => {
    let sheet =
      spreadsheet.getSheetByName(configSheet.name);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(
        configSheet.name
      );

      Logger.log(
        "Sheet dibuat: " + configSheet.name
      );

      sheet.getRange(
        1,
        1,
        1,
        configSheet.headers.length
      ).setValues([
        configSheet.headers
      ]);

      registryFormatHeader_(sheet);

      return;
    }

    const existingHeaders = sheet
      .getRange(
        1,
        1,
        1,
        configSheet.headers.length
      )
      .getDisplayValues()[0]
      .map(value => String(value).trim());

    const cocok =
      JSON.stringify(existingHeaders) ===
      JSON.stringify(configSheet.headers);

    if (!cocok) {
      throw new Error(
        "Header mismatch pada sheet " +
        configSheet.name +
        ". Build dihentikan tanpa menimpa header."
      );
    }

    Logger.log(
      "Sheet existing valid: " + configSheet.name
    );
  });

  registryBuildTanganiSheetDefault_(spreadsheet);
}

/**
 * Jika spreadsheet baru masih memiliki Sheet1,
 * hapus hanya sheet kosong default setelah 7 sheet
 * Registry berhasil dibuat.
 */
function registryBuildTanganiSheetDefault_(spreadsheet) {
  const sheetDefault =
    spreadsheet.getSheetByName("Sheet1");

  if (!sheetDefault) {
    return;
  }

  const adaSheetRegistry =
    REGISTRY_CONFIG.sheets.every(configSheet =>
      spreadsheet.getSheetByName(configSheet.name)
    );

  if (!adaSheetRegistry) {
    return;
  }

  const lastRow = sheetDefault.getLastRow();
  const lastColumn = sheetDefault.getLastColumn();

  const benarBenarKosong =
    lastRow === 0 ||
    (
      lastRow === 1 &&
      lastColumn === 1 &&
      sheetDefault.getRange("A1").isBlank()
    );

  if (benarBenarKosong) {
    spreadsheet.deleteSheet(sheetDefault);

    Logger.log(
      "Sheet kosong default Sheet1 dihapus."
    );
  }
}

/**
 * Format dasar header.
 */
function registryFormatHeader_(sheet) {
  const lastColumn = sheet.getLastColumn();

  if (lastColumn < 1) {
    return;
  }

  sheet
    .getRange(1, 1, 1, lastColumn)
    .setFontWeight("bold")
    .setBackground("#17365D")
    .setFontColor("#FFFFFF")
    .setWrap(true);

  sheet.setFrozenRows(1);

  sheet.autoResizeColumns(
    1,
    lastColumn
  );
}
