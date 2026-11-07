
/**
 * PORSENI PELAJAR MELAWI 2026
 * Import 03 — Normalizer & Staging Preview
 * Versi 1.0.0 — DRY RUN
 *
 * READ ONLY:
 * - Tidak menulis ke sumber.
 * - Tidak menulis ke Registry.
 * - Tidak membuat UUID.
 * - Tidak menerbitkan kartu.
 * - Tidak mencetak nama/NISN/Drive ID ke log.
 */

const NORMALIZER_CONFIG = Object.freeze({
  mode: "DRY_RUN",
  expectedResponses: 277,
  expectedParticipants: 299,
  expectedNisn: 299,
  expectedPhotoResponses: 277
});

/**
 * Header standar yang dibutuhkan.
 * Header khusus cabang dipetakan melalui pencarian nama header.
 */
const NORMALIZER_HEADER = Object.freeze({
  timestamp: "Timestamp",
  kecamatan: "Kecamatan",
  nama: "Nama Lengkap",
  jenisKelamin: "Jenis Kelamin",
  nisn: "NISN",
  kelas: "Kelas",
  sekolah: "Nama Sekolah",
  data8355: "Data 8355 Pemain"
});

/**
 * Header jenjang dan foto tiap cabang.
 */
const NORMALIZER_BRANCH = Object.freeze({
  BOLA_VOLI: {
    jenjang: "Jenjang Sekolah Pemain Bola Voli",
    foto: "Foto 1 (satu) Tim Pemain Bola Voli"
  },
  SEPAK_BOLA_MINI: {
    jenjang: "Jenjang Sekolah Pemain Sepak Bola Mini",
    foto: "Foto 1 (satu) Tim Pemain Bola Voli"
  },
  ATLETIK: {
    jenjang: "Jenjang Sekolah Cabang Atletik",
    foto: "Foto Pemain"
  },
  CATUR: {
    jenjang: "Jenjang Sekolah Pemain Catur",
    foto: "Foto Pemain"
  },
  TENIS_MEJA: {
    jenjang: "Jenjang Sekolah Pemain Tenis Meja",
    foto: "Foto Pemain"
  },
  KARATE: {
    jenjang: "Jenjang Sekolah Cabang Karate",
    foto: "Foto Peserta Karate"
  },
  MENYANYI_SOLO: {
    jenjang: "Jenjang Sekolah Menyanyi Solo",
    foto: "Foto Peserta Menyanyi Solo"
  },
  BACA_PUISI: {
    jenjang: "Jenjang Sekolah Peserta Seni Baca Puisi",
    foto: "Foto Peserta Baca Puisi"
  },
  PANTOMIM: {
    jenjang: "Jenjang Sekolah Peserta Pantomim",
    foto: "Foto Peserta Pantomim"
  },
  SENI_TARI: {
    jenjang: "Jenjang Sekolah Peserta Seni Tari",
    foto: "Foto 1 (satu) Tim Seni Tari"
  },
  MENDONGENG: {
    jenjang: "Jenjang Sekolah Peserta Mendongeng",
    foto: "Foto Peserta Mendongeng"
  },
  MENULIS_CERITA: {
    jenjang: "Jenjang Sekolah Peserta Menulis Cerita",
    foto: "Foto Peserta Menulis Cerita"
  },
  SENI_KRIYA: {
    jenjang: "Jenjang Sekolah Peserta Seni Kriya",
    foto: "Foto Peserta Seni Kriya"
  },
  GAMBAR_BERCERITA: {
    jenjang: "Jenjang Sekolah Peserta Gambar Bercerita",
    foto: "Foto Peserta Gambar Bercerita"
  }
});

/**
 * Pemisahan nama tim yang disetujui sebelumnya.
 * Nomor baris adalah nomor baris spreadsheet.
 */
const NORMALIZER_SPLIT_RULES = Object.freeze({
  BOLA_VOLI: {
    5: /\s+\d+\s*\.\s*/
  },
  SEPAK_BOLA_MINI: {
    27: /,/
  },
  PANTOMIM: {
    4: /\s+dan\s+/i,
    9: /\s+dan\s+/i
  },
  SENI_TARI: {
    5: /\s*,\s*|\s+dan\s+/i,
    18: /(?=\s*\d+\s*\.\s*)/
  }
});

/**
 * Cari posisi kolom berdasarkan header.
 */
function normalizerGetHeaderIndex(headers, namaHeader) {
  return headers.findIndex(function (h) {
    return String(h).trim() === String(namaHeader).trim();
  });
}

/**
 * Ambil nilai sel berdasarkan nama header.
 */
function normalizerGetValue(row, headers, namaHeader) {
  const idx = normalizerGetHeaderIndex(headers, namaHeader);
  return idx >= 0 ? row[idx] : "";
}

/**
 * Memecah nama berdasarkan aturan khusus cabang/baris.
 * Jika tidak ada aturan, nama dianggap satu peserta.
 */
function normalizerSplitNames(kodeCabang, sourceRow, rawNames) {
  const raw = String(rawNames || "").trim();

  if (!raw) return [];

  const rules = NORMALIZER_SPLIT_RULES[kodeCabang] || {};
  const rule = rules[sourceRow];

  if (!rule) {
    return [raw];
  }

  return raw
    .split(rule)
    .map(function (name) {
      return String(name).trim();
    })
    .filter(Boolean);
}

/**
 * Audit header sebelum normalisasi.
 */
function normalizerValidateHeaders(headers, kodeCabang) {
  const branch = NORMALIZER_BRANCH[kodeCabang];

  if (!branch) {
    return ["Mapping cabang tidak ditemukan"];
  }

  const required = [
    NORMALIZER_HEADER.timestamp,
    NORMALIZER_HEADER.kecamatan,
    NORMALIZER_HEADER.nama,
    NORMALIZER_HEADER.jenisKelamin,
    NORMALIZER_HEADER.nisn,
    NORMALIZER_HEADER.kelas,
    NORMALIZER_HEADER.sekolah,
    NORMALIZER_HEADER.data8355,
    branch.jenjang,
    branch.foto
  ];

  return required.filter(function (header) {
    return normalizerGetHeaderIndex(headers, header) < 0;
  });
}

/**
 * Import 03 — Normalizer DRY RUN
 */
function registryNormalizerDryRun() {
  if (NORMALIZER_CONFIG.mode !== "DRY_RUN") {
    throw new Error("Mode harus DRY_RUN.");
  }

  const hasilCabang = [];
  let totalResponses = 0;
  let totalParticipants = 0;
  let totalNisn = 0;
  let totalPhotos = 0;
  let totalBlankNames = 0;
  let totalBlankNisn = 0;
  let totalBlankPhotos = 0;
  let totalHeaderErrors = 0;

  KONFIGURASI.sumber.forEach(function (sumber) {
    const cabang = {
      kode: sumber.kode,
      nama: sumber.nama,
      status: "PENDING",
      responses: 0,
      participants: 0,
      nisnFilled: 0,
      photoResponses: 0,
      blankNames: 0,
      blankNisn: 0,
      blankPhotos: 0,
      headerErrors: 0
    };

    try {
      const ss = SpreadsheetApp.openById(sumber.id);

      const sheet = ss.getSheets().find(function (tab) {
        return tab.getSheetId() === Number(sumber.gid);
      });

      if (!sheet) {
        cabang.status = "GID_TIDAK_DITEMUKAN";
        hasilCabang.push(cabang);
        return;
      }

      const values = sheet.getDataRange().getDisplayValues();

      if (values.length < 2) {
        cabang.status = "TIDAK_ADA_DATA";
        hasilCabang.push(cabang);
        return;
      }

      const headers = values[0];
      const headerErrors = normalizerValidateHeaders(
        headers,
        sumber.kode
      );

      if (headerErrors.length) {
        cabang.status = "HEADER_TIDAK_VALID";
        cabang.headerErrors = headerErrors.length;
        totalHeaderErrors += headerErrors.length;
        hasilCabang.push(cabang);
        return;
      }

      const branchConfig = NORMALIZER_BRANCH[sumber.kode];

      for (let i = 1; i < values.length; i++) {
        const row = values[i];

        // Abaikan baris kosong sepenuhnya.
        if (!row.some(function (cell) {
          return String(cell || "").trim() !== "";
        })) {
          continue;
        }

        const sourceRow = i + 1;
        const rawNames = normalizerGetValue(
          row, headers, NORMALIZER_HEADER.nama
        );

        const names = normalizerSplitNames(
          sumber.kode,
          sourceRow,
          rawNames
        );

        const nisn = String(
          normalizerGetValue(
            row, headers, NORMALIZER_HEADER.nisn
          ) || ""
        ).trim();

        const photo = String(
          normalizerGetValue(
            row, headers, branchConfig.foto
          ) || ""
        ).trim();

        cabang.responses++;

        if (!names.length) {
          cabang.blankNames++;
        }

        cabang.participants += names.length;

        if (nisn) {
          cabang.nisnFilled += names.length;
        } else {
          cabang.blankNisn += names.length;
        }

        if (photo) {
          cabang.photoResponses++;
        } else {
          cabang.blankPhotos++;
        }
      }

      cabang.status = "BERHASIL";

    } catch (err) {
      cabang.status = "ERROR";
      // Không log chi tiết nguồn hoặc dữ liệu nhạy cảm.
    }

    totalResponses += cabang.responses;
    totalParticipants += cabang.participants;
    totalNisn += cabang.nisnFilled;
    totalPhotos += cabang.photoResponses;
    totalBlankNames += cabang.blankNames;
    totalBlankNisn += cabang.blankNisn;
    totalBlankPhotos += cabang.blankPhotos;

    hasilCabang.push(cabang);
  });

  const report = {
    tahap: "Import 03 — Normalizer DRY RUN",
    mode: NORMALIZER_CONFIG.mode,
    branches: hasilCabang.length,
    branchesSuccess: hasilCabang.filter(
      x => x.status === "BERHASIL"
    ).length,
    branchesError: hasilCabang.filter(
      x => x.status !== "BERHASIL"
    ).length,
    totalResponses: totalResponses,
    totalParticipants: totalParticipants,
    totalNisnFilled: totalNisn,
    totalPhotoResponses: totalPhotos,
    blankNames: totalBlankNames,
    blankNisn: totalBlankNisn,
    blankPhotoResponses: totalBlankPhotos,
    headerErrors: totalHeaderErrors,
    expectedResponses: NORMALIZER_CONFIG.expectedResponses,
    expectedParticipants: NORMALIZER_CONFIG.expectedParticipants,
    expectedNisn: NORMALIZER_CONFIG.expectedNisn,
    expectedPhotoResponses: NORMALIZER_CONFIG.expectedPhotoResponses,
    detail: hasilCabang
  };

  report.status =
    report.branchesError === 0 &&
    report.totalResponses === report.expectedResponses &&
    report.totalParticipants === report.expectedParticipants &&
    report.totalNisnFilled === report.expectedNisn &&
    report.totalPhotoResponses === report.expectedPhotoResponses &&
    report.blankNames === 0 &&
    report.blankNisn === 0 &&
    report.blankPhotoResponses === 0
      ? "DRY RUN LULUS"
      : "PERLU REVIEW";

  Logger.log(JSON.stringify(report, null, 2));

  return report;
}

/**
 * Audit selisih jumlah respons dengan baseline audit sebelumnya.
 * Read-only. Tidak mencetak data peserta.
 */

function registryAuditSelisihRespons() {
  const baseline = {
    BOLA_VOLI: 74,
    SEPAK_BOLA_MINI: 36,
    ATLETIK: 14,
    CATUR: 29,
    TENIS_MEJA: 17,
    KARATE: 3,
    MENYANYI_SOLO: 12,
    BACA_PUISI: 16,
    PANTOMIM: 8,
    SENI_TARI: 27,
    MENDONGENG: 7,
    MENULIS_CERITA: 6,
    SENI_KRIYA: 8,
    GAMBAR_BERCERITA: 6
  };

  const hasil = [];

  KONFIGURASI.sumber.forEach(function (sumber) {
    const ss = SpreadsheetApp.openById(sumber.id);

    const sheet = ss.getSheets().find(function (tab) {
      return tab.getSheetId() === Number(sumber.gid);
    });

    if (!sheet) {
      hasil.push({
        kode: sumber.kode,
        status: "GID_TIDAK_DITEMUKAN"
      });
      return;
    }

    const values = sheet.getDataRange().getDisplayValues();

    let responsAktual = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i].some(function (cell) {
        return String(cell || "").trim() !== "";
      })) {
        responsAktual++;
      }
    }

    const responsBaseline = baseline[sumber.kode];

    hasil.push({
      kode: sumber.kode,
      baseline: responsBaseline,
      aktual: responsAktual,
      selisih: responsAktual - responsBaseline,
      status:
        responsAktual === responsBaseline
          ? "SESUAI"
          : "BERUBAH"
    });
  });

  Logger.log(JSON.stringify({
    tahap: "Audit Selisih Respons",
    detail: hasil,
    totalBaseline: hasil.reduce(
      (sum, x) => sum + (x.baseline || 0), 0
    ),
    totalAktual: hasil.reduce(
      (sum, x) => sum + (x.aktual || 0), 0
    )
  }, null, 2));

  return hasil;
}

/**
 * Verifikasi respons terakhir Tenis Meja.
 * Hanya metadata, tanpa nama/NISN/foto.
 * Read-only.
 */
function registryAuditResponsTerakhirTenisMeja() {
  const sumber = KONFIGURASI.sumber.find(function (s) {
    return s.kode === "TENIS_MEJA";
  });

  if (!sumber) {
    throw new Error("Sumber Tenis Meja tidak ditemukan.");
  }

  const ss = SpreadsheetApp.openById(sumber.id);

  const sheet = ss.getSheets().find(function (tab) {
    return tab.getSheetId() === Number(sumber.gid);
  });

  if (!sheet) {
    throw new Error("Tab Tenis Meja tidak ditemukan.");
  }

  const lastRow = sheet.getLastRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0];

  const timestampIndex = headers.indexOf("Timestamp");

  if (timestampIndex < 0 || lastRow < 2) {
    throw new Error("Timestamp tidak ditemukan atau data kosong.");
  }

  const row = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0];

  const nonEmptyCells = row.filter(function (cell) {
    return String(cell || "").trim() !== "";
  }).length;

  Logger.log(JSON.stringify({
    cabang: "TENIS_MEJA",
    sourceRow: lastRow,
    timestamp: row[timestampIndex],
    nonEmptyCells: nonEmptyCells,
    hasNisn: String(row[headers.indexOf("NISN")] || "").trim() !== "",
    hasPhoto: String(
      row[headers.indexOf("Foto Pemain")] || ""
    ).trim() !== "",
    status: "METADATA_ONLY"
  }, null, 2));
}

function registryAuditJumlahPesertaBaruTenisMeja() {
  const sumber = KONFIGURASI.sumber.find(
    s => s.kode === "TENIS_MEJA"
  );

  const ss = SpreadsheetApp.openById(sumber.id);
  const sheet = ss.getSheets().find(
    tab => tab.getSheetId() === Number(sumber.gid)
  );

  const rowNumber = sheet.getLastRow();
  const headers = sheet.getRange(
    1, 1, 1, sheet.getLastColumn()
  ).getDisplayValues()[0];

  const row = sheet.getRange(
    rowNumber, 1, 1, sheet.getLastColumn()
  ).getDisplayValues()[0];

  const nameIndex = headers.indexOf("Nama Lengkap");
  const nisnIndex = headers.indexOf("NISN");

  if (nameIndex < 0 || nisnIndex < 0) {
    throw new Error("Header nama/NISN tidak ditemukan.");
  }

  const nama = String(row[nameIndex] || "").trim();
  const nisn = String(row[nisnIndex] || "").trim();

  Logger.log(JSON.stringify({
    branch: "TENIS_MEJA",
    sourceRow: rowNumber,
    namePresent: nama.length > 0,
    nisnPresent: nisn.length > 0,
    nameEntryCount: nama ? 1 : 0,
    nisnEntryCount: nisn ? 1 : 0,
    likelySingleParticipant:
      nama.length > 0 && nisn.length > 0,
    privacy: "NO_PERSONAL_DATA_LOGGED"
  }, null, 2));
}

/**
 * Import 04B — Audit Respons Terbaru Bola Voli
 * READ-ONLY, metadata only.
 */
function registryAuditResponsTerbaruBolaVoli() {
  const sumber = KONFIGURASI.sumber.find(
    s => s.kode === "BOLA_VOLI"
  );

  if (!sumber) {
    throw new Error("Sumber BOLA_VOLI tidak ditemukan.");
  }

  const ss = SpreadsheetApp.openById(sumber.id);
  const sheet = ss.getSheets().find(
    tab => tab.getSheetId() === Number(sumber.gid)
  );

  if (!sheet) {
    throw new Error("GID Bola Voli tidak ditemukan.");
  }

  const rowNumber = sheet.getLastRow();
  const headers = sheet.getRange(
    1, 1, 1, sheet.getLastColumn()
  ).getDisplayValues()[0];

  const row = sheet.getRange(
    rowNumber, 1, 1, sheet.getLastColumn()
  ).getDisplayValues()[0];

  const timestampIndex = headers.indexOf("Timestamp");
  const nameIndex = headers.indexOf("Nama Lengkap");
  const nisnIndex = headers.indexOf("NISN");

  const fotoHeader = NORMALIZER_BRANCH.BOLA_VOLI.foto;
  const photoIndex = headers.indexOf(fotoHeader);

  if (
    timestampIndex < 0 ||
    nameIndex < 0 ||
    nisnIndex < 0 ||
    photoIndex < 0
  ) {
    throw new Error("Header yang diperlukan tidak ditemukan.");
  }

  const timestamp = String(row[timestampIndex] || "").trim();
  const nama = String(row[nameIndex] || "").trim();
  const nisn = String(row[nisnIndex] || "").trim();
  const foto = String(row[photoIndex] || "").trim();

  Logger.log(JSON.stringify({
    cabang: "BOLA_VOLI",
    sourceRow: rowNumber,
    timestamp: timestamp || null,
    namePresent: Boolean(nama),
    nisnPresent: Boolean(nisn),
    photoPresent: Boolean(foto),
    status: "METADATA_ONLY"
  }, null, 2));
}
/**
 * IMPORT 05 — Audit Semantik Peserta Tim
 *
 * READ ONLY:
 * - Tidak menulis ke sumber.
 * - Tidak menulis ke Registry.
 * - Tidak membuat UUID.
 * - Tidak mencetak nama, NISN, foto, atau Drive ID.
 *
 * Tujuan:
 * - Mengidentifikasi respons yang terpecah menjadi beberapa peserta.
 * - Menghitung berapa banyak peserta dalam respons tim.
 * - Memeriksa apakah NISN berada dalam satu sel atau memiliki pemisah.
 *
 * Catatan:
 * Deteksi delimiter NISN hanya indikasi format, bukan validasi NISN.
 */

function registryAuditSemantikPesertaTim() {
  const delimiterNisnRegex = /[\n,;|]+/;

  const hasilCabang = [];

  let totalResponsTim = 0;
  let totalNamaTim = 0;
  let totalResponsNisnSatuSel = 0;
  let totalResponsNisnDenganDelimiter = 0;
  let totalResponsTimNisnKosong = 0;

  KONFIGURASI.sumber.forEach(function (sumber) {
    const cabang = {
      kode: sumber.kode,
      status: "PENDING",
      responses: 0,
      teamResponses: 0,
      participantsFromSplitNames: 0,
      nisnCellPresentOnTeamResponses: 0,
      nisnCellsWithCommonDelimiter: 0,
      teamResponsesWithBlankNisn: 0,
      reviewRequired: 0
    };

    try {
      const ss = SpreadsheetApp.openById(sumber.id);

      const sheet = ss.getSheets().find(function (tab) {
        return tab.getSheetId() === Number(sumber.gid);
      });

      if (!sheet) {
        cabang.status = "GID_TIDAK_DITEMUKAN";
        hasilCabang.push(cabang);
        return;
      }

      const values = sheet.getDataRange().getDisplayValues();

      if (values.length < 2) {
        cabang.status = "TIDAK_ADA_DATA";
        hasilCabang.push(cabang);
        return;
      }

      const headers = values[0];

      const headerErrors = normalizerValidateHeaders(
        headers,
        sumber.kode
      );

      if (headerErrors.length > 0) {
        cabang.status = "HEADER_TIDAK_VALID";
        cabang.headerErrors = headerErrors.length;
        hasilCabang.push(cabang);
        return;
      }

      for (let i = 1; i < values.length; i++) {
        const row = values[i];

        if (!row.some(function (cell) {
          return String(cell || "").trim() !== "";
        })) {
          continue;
        }

        const sourceRow = i + 1;

        const rawNames = normalizerGetValue(
          row,
          headers,
          NORMALIZER_HEADER.nama
        );

        const names = normalizerSplitNames(
          sumber.kode,
          sourceRow,
          rawNames
        );

        const nisn = String(
          normalizerGetValue(
            row,
            headers,
            NORMALIZER_HEADER.nisn
          ) || ""
        ).trim();

        cabang.responses++;

        // Hanya audit respons yang memiliki lebih dari satu nama
        if (names.length > 1) {
          cabang.teamResponses++;
          cabang.participantsFromSplitNames += names.length;

          if (nisn) {
            cabang.nisnCellPresentOnTeamResponses++;

            if (delimiterNisnRegex.test(nisn)) {
              cabang.nisnCellsWithCommonDelimiter++;
            } else {
              cabang.reviewRequired++;
            }
          } else {
            cabang.teamResponsesWithBlankNisn++;
          }
        }
      }

      cabang.status = "BERHASIL";

    } catch (err) {
      cabang.status = "ERROR";
    }

    totalResponsTim += cabang.teamResponses;
    totalNamaTim += cabang.participantsFromSplitNames;
    totalResponsNisnSatuSel += cabang.reviewRequired;
    totalResponsNisnDenganDelimiter +=
      cabang.nisnCellsWithCommonDelimiter;
    totalResponsTimNisnKosong +=
      cabang.teamResponsesWithBlankNisn;

    hasilCabang.push(cabang);
  });

  const report = {
    tahap: "Import 05 — Audit Semantik Peserta Tim",
    mode: "READ_ONLY",
    branches: hasilCabang.length,
    branchesSuccess: hasilCabang.filter(
      x => x.status === "BERHASIL"
    ).length,
    branchesError: hasilCabang.filter(
      x => x.status !== "BERHASIL"
    ).length,

    totalTeamResponses: totalResponsTim,
    totalParticipantsFromSplitNames: totalNamaTim,

    teamResponsesWithNisnCell: hasilCabang.reduce(
      (sum, x) => sum + x.nisnCellPresentOnTeamResponses,
      0
    ),

    teamResponsesWithNisnDelimiter:
      totalResponsNisnDenganDelimiter,

    teamResponsesWithSingleNisnCell:
      totalResponsNisnSatuSel,

    teamResponsesWithBlankNisn:
      totalResponsTimNisnKosong,

    privacy: "NO_PERSONAL_DATA_LOGGED",
    status:
      hasilCabang.every(x => x.status === "BERHASIL")
        ? "AUDIT SELESAI — REVIEW SEMANTIK DIPERLUKAN"
        : "PERLU REVIEW",

    detail: hasilCabang
  };

  Logger.log(JSON.stringify(report, null, 2));

  return report;
}
/**
 * IMPORT 05B — Audit Jumlah Entri NISN per Respons Beregu
 *
 * READ ONLY:
 * - Tidak menulis ke spreadsheet sumber.
 * - Tidak menulis ke Registry.
 * - Tidak membuat UUID.
 * - Tidak mencetak nama, NISN, foto, atau Drive ID.
 *
 * Audit membandingkan:
 * jumlah nama hasil split vs jumlah token NISN yang terdeteksi.
 *
 * Ini bukan validasi NISN resmi atau pemetaan identitas peserta.
 */

function registryAuditJumlahEntriNisnTim() {
  // Delimiter umum untuk memisahkan daftar NISN.
  // Tidak menggunakan spasi sebagai delimiter karena
  // format NISN sumber belum dipastikan.
  const nisnDelimiterRegex = /[\r\n,;|]+/;

  const hasilCabang = [];

  let totalResponsTim = 0;
  let totalNamaTim = 0;
  let totalEntriNisnTim = 0;
  let totalResponsJumlahCocok = 0;
  let totalResponsPerluReview = 0;
  let totalResponsNisnKosong = 0;

  KONFIGURASI.sumber.forEach(function (sumber) {
    const cabang = {
      kode: sumber.kode,
      status: "PENDING",
      teamResponses: 0,
      teamNames: 0,
      nisnEntriesDetected: 0,
      countMatchResponses: 0,
      mismatchResponses: 0,
      blankNisnResponses: 0
    };

    try {
      const ss = SpreadsheetApp.openById(sumber.id);

      const sheet = ss.getSheets().find(function (tab) {
        return tab.getSheetId() === Number(sumber.gid);
      });

      if (!sheet) {
        cabang.status = "GID_TIDAK_DITEMUKAN";
        hasilCabang.push(cabang);
        return;
      }

      const values = sheet.getDataRange().getDisplayValues();

      if (values.length < 2) {
        cabang.status = "TIDAK_ADA_DATA";
        hasilCabang.push(cabang);
        return;
      }

      const headers = values[0];

      const headerErrors = normalizerValidateHeaders(
        headers,
        sumber.kode
      );

      if (headerErrors.length > 0) {
        cabang.status = "HEADER_TIDAK_VALID";
        cabang.headerErrors = headerErrors.length;
        hasilCabang.push(cabang);
        return;
      }

      for (let i = 1; i < values.length; i++) {
        const row = values[i];

        if (!row.some(function (cell) {
          return String(cell || "").trim() !== "";
        })) {
          continue;
        }

        const sourceRow = i + 1;

        const rawNames = normalizerGetValue(
          row,
          headers,
          NORMALIZER_HEADER.nama
        );

        const names = normalizerSplitNames(
          sumber.kode,
          sourceRow,
          rawNames
        );

        // Hanya respons yang terpecah menjadi >1 peserta
        if (names.length <= 1) {
          continue;
        }

        const rawNisn = String(
          normalizerGetValue(
            row,
            headers,
            NORMALIZER_HEADER.nisn
          ) || ""
        ).trim();

        cabang.teamResponses++;
        cabang.teamNames += names.length;

        if (!rawNisn) {
          cabang.blankNisnResponses++;
          cabang.mismatchResponses++;
          continue;
        }

        const nisnEntries = rawNisn
          .split(nisnDelimiterRegex)
          .map(function (value) {
            return String(value || "").trim();
          })
          .filter(Boolean);

        const nisnCount = nisnEntries.length;

        cabang.nisnEntriesDetected += nisnCount;

        if (nisnCount === names.length) {
          cabang.countMatchResponses++;
        } else {
          cabang.mismatchResponses++;
        }
      }

      cabang.status = "BERHASIL";

    } catch (err) {
      // Tidak mencetak error mentah karena bisa berisi
      // informasi sumber atau konfigurasi.
      cabang.status = "ERROR";
    }

    totalResponsTim += cabang.teamResponses;
    totalNamaTim += cabang.teamNames;
    totalEntriNisnTim += cabang.nisnEntriesDetected;
    totalResponsJumlahCocok += cabang.countMatchResponses;
    totalResponsPerluReview += cabang.mismatchResponses;
    totalResponsNisnKosong += cabang.blankNisnResponses;

    hasilCabang.push(cabang);
  });

  const report = {
    tahap: "Import 05B — Audit Jumlah Entri NISN Tim",
    mode: "READ_ONLY",
    branches: hasilCabang.length,
    branchesSuccess: hasilCabang.filter(
      x => x.status === "BERHASIL"
    ).length,
    branchesError: hasilCabang.filter(
      x => x.status !== "BERHASIL"
    ).length,

    totalTeamResponses: totalResponsTim,
    totalTeamNames: totalNamaTim,
    totalNisnEntriesDetected: totalEntriNisnTim,

    responsesWithMatchingCounts: totalResponsJumlahCocok,
    responsesRequiringReview: totalResponsPerluReview,
    responsesWithBlankNisn: totalResponsNisnKosong,

    privacy: "NO_PERSONAL_DATA_LOGGED",

    status:
      hasilCabang.every(x => x.status === "BERHASIL")
        ? "AUDIT SELESAI — HASIL JUMLAH PERLU INTERPRETASI"
        : "PERLU REVIEW",

    detail: hasilCabang
  };

  Logger.log(JSON.stringify(report, null, 2));

  return report;
}