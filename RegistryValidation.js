
/**
 * REGISTRY PORSENI 2026
 * RegistryValidation.gs
 * Schema 1.0
 */

/**
 * Memvalidasi struktur Registry.
 * Tidak melakukan perubahan pada spreadsheet.
 */
function registryValidasiStruktur_(spreadsheet) {
  const hasil = {
    valid: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    totalSheetExpected: REGISTRY_CONFIG.sheets.length,
    totalSheetFound: 0,
    totalHeaderValid: 0,
    errors: [],
    details: []
  };

  const sheetNames = spreadsheet
    .getSheets()
    .map(sheet => sheet.getName());

  hasil.totalSheetFound = sheetNames.length;

  REGISTRY_CONFIG.sheets.forEach(configSheet => {
    const sheet = spreadsheet.getSheetByName(configSheet.name);

    if (!sheet) {
      hasil.valid = false;
      hasil.errors.push(
        "Sheet tidak ditemukan: " + configSheet.name
      );

      hasil.details.push({
        sheet: configSheet.name,
        status: "MISSING"
      });

      return;
    }

    const jumlahKolom = configSheet.headers.length;

    const actualHeaders = sheet
      .getRange(1, 1, 1, jumlahKolom)
      .getDisplayValues()[0]
      .map(value => String(value).trim());

    const expectedHeaders = configSheet.headers;

    const headerDuplikat = actualHeaders.filter(
      (header, index) =>
        header !== "" && actualHeaders.indexOf(header) !== index
    );

    const headerCocok =
      JSON.stringify(actualHeaders) ===
      JSON.stringify(expectedHeaders);

    if (headerDuplikat.length > 0) {
      hasil.valid = false;
      hasil.errors.push(
        "Header duplikat pada " +
        configSheet.name +
        ": " +
        headerDuplikat.join(", ")
      );
    }

    if (!headerCocok) {
      hasil.valid = false;

      hasil.errors.push(
        "Header tidak cocok pada sheet: " +
        configSheet.name
      );

      hasil.details.push({
        sheet: configSheet.name,
        status: "HEADER_MISMATCH",
        expected: expectedHeaders,
        actual: actualHeaders
      });

      return;
    }

    hasil.totalHeaderValid++;

    hasil.details.push({
      sheet: configSheet.name,
      status: "VALID",
      columns: jumlahKolom
    });
  });

  if (
    hasil.totalHeaderValid !==
    REGISTRY_CONFIG.sheets.length
  ) {
    hasil.valid = false;
  }

  return hasil;
}

/**
 * Menampilkan laporan validasi Registry.
 */
function registryTampilkanLaporanValidasi_(hasil) {
  Logger.log("======================================");
  Logger.log("REGISTRY VALIDATION REPORT");
  Logger.log("======================================");

  Logger.log("Spreadsheet: " + hasil.spreadsheetName);
  Logger.log("ID: " + hasil.spreadsheetId);
  Logger.log("Sheet Expected: " + hasil.totalSheetExpected);
  Logger.log("Sheet Found: " + hasil.totalSheetFound);
  Logger.log("Header Valid: " + hasil.totalHeaderValid);

  hasil.details.forEach(detail => {
    Logger.log(
      detail.sheet + " : " + detail.status
    );
  });

  if (hasil.errors.length > 0) {
    Logger.log("ERRORS:");

    hasil.errors.forEach(error => {
      Logger.log("- " + error);
    });
  }

  Logger.log(
    "STATUS: " + (hasil.valid ? "VALID" : "INVALID")
  );

  Logger.log("======================================");

  return hasil.valid;
}

/**
 * Validasi Registry yang sudah terdaftar
 * pada Script Properties.
 */
function registryValidasi() {
  const properties =
    PropertiesService.getScriptProperties();

  const registryId = properties.getProperty(
    REGISTRY_CONFIG.scriptPropertyKey
  );

  if (!registryId) {
    Logger.log(
      "Registry ID belum disimpan pada Script Properties."
    );

    return;
  }

  const spreadsheet = SpreadsheetApp.openById(registryId);

  const hasil =
    registryValidasiStruktur_(spreadsheet);

  registryTampilkanLaporanValidasi_(hasil);
}

/**
 * Import 04 — Audit Respons Tambahan
 * READ-ONLY
 * Tidak menulis Registry.
 * Tidak mencetak nama, NISN, atau ID foto.
 */
function registryAuditResponsTambahan() {
  const TARGET = [
    { kode: "BOLA_VOLI", barisAwal: 76, barisAkhir: 80 },
    { kode: "SEPAK_BOLA_MINI", barisAwal: 38, barisAkhir: 42 },
    { kode: "CATUR", barisAwal: 31, barisAkhir: 31 },
    { kode: "BACA_PUISI", barisAwal: 18, barisAkhir: 18 }
  ];

  const hasil = [];
  let totalBaris = 0;
  let totalNamaTerisi = 0;
  let totalNisnTerisi = 0;
  let totalFotoTerisi = 0;
  let totalTimestampTerisi = 0;

  TARGET.forEach(function (target) {
    const sumber = KONFIGURASI.sumber.find(
      s => s.kode === target.kode
    );

    if (!sumber) {
      hasil.push({
        kode: target.kode,
        status: "KONFIGURASI_SUMBER_TIDAK_DITEMUKAN"
      });
      return;
    }

    try {
      const ss = SpreadsheetApp.openById(sumber.id);
      const sheet = ss.getSheets().find(
        tab => tab.getSheetId() === Number(sumber.gid)
      );

      if (!sheet) {
        hasil.push({
          kode: target.kode,
          status: "GID_TIDAK_DITEMUKAN"
        });
        return;
      }

      const lastRow = sheet.getLastRow();
      const headers = sheet.getRange(
        1, 1, 1, sheet.getLastColumn()
      ).getDisplayValues()[0];

      const indexTimestamp = headers.indexOf("Timestamp");
      const indexNama = headers.indexOf("Nama Lengkap");
      const indexNisn = headers.indexOf("NISN");

      const branchConfig = NORMALIZER_BRANCH[target.kode];
      const indexFoto = headers.indexOf(branchConfig.foto);

      if (
        indexTimestamp < 0 ||
        indexNama < 0 ||
        indexNisn < 0 ||
        indexFoto < 0
      ) {
        hasil.push({
          kode: target.kode,
          status: "HEADER_TIDAK_LENGKAP"
        });
        return;
      }

      const barisMulai = target.barisAwal;
      const barisSelesai = Math.min(
        target.barisAkhir,
        lastRow
      );

      const detail = [];

      if (barisMulai > lastRow) {
        hasil.push({
          kode: target.kode,
          status: "BARIS_TARGET_TIDAK_ADA",
          lastRow: lastRow
        });
        return;
      }

      for (let r = barisMulai; r <= barisSelesai; r++) {
        const row = sheet.getRange(
          r, 1, 1, sheet.getLastColumn()
        ).getDisplayValues()[0];

        const timestamp = String(
          row[indexTimestamp] || ""
        ).trim();

        const namaTerisi = String(
          row[indexNama] || ""
        ).trim() !== "";

        const nisnTerisi = String(
          row[indexNisn] || ""
        ).trim() !== "";

        const fotoTerisi = String(
          row[indexFoto] || ""
        ).trim() !== "";

        const barisTerisi = row.some(
          cell => String(cell || "").trim() !== ""
        );

        if (!barisTerisi) continue;

        totalBaris++;
        if (timestamp) totalTimestampTerisi++;
        if (namaTerisi) totalNamaTerisi++;
        if (nisnTerisi) totalNisnTerisi++;
        if (fotoTerisi) totalFotoTerisi++;

        detail.push({
          sourceRow: r,
          timestamp: timestamp || null,
          timestampPresent: Boolean(timestamp),
          namePresent: namaTerisi,
          nisnPresent: nisnTerisi,
          photoPresent: fotoTerisi,
          status: "METADATA_ONLY"
        });
      }

      hasil.push({
        kode: target.kode,
        status: "BERHASIL",
        barisTarget: barisMulai + "-" + barisSelesai,
        jumlahResponsTerbaca: detail.length,
        detail: detail
      });

    } catch (err) {
      hasil.push({
        kode: target.kode,
        status: "ERROR"
      });
    }
  });

  const report = {
    tahap: "Import 04 — Audit Respons Tambahan",
    mode: "READ_ONLY",
    jumlahCabang: TARGET.length,
    jumlahResponsTerbaca: totalBaris,
    timestampTerisi: totalTimestampTerisi,
    namaTerisi: totalNamaTerisi,
    nisnTerisi: totalNisnTerisi,
    fotoTerisi: totalFotoTerisi,
    detail: hasil,
    catatan: "Tidak mencetak nama, NISN, atau ID foto."
  };

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}
