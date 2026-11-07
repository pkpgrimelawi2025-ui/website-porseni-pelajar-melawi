
/**
 * PORSENI PELAJAR MELAWI 2026
 * Import 01 — Source Reader
 * Versi: 1.0.0
 *
 * Fungsi:
 * - Audit akses ke 14 spreadsheet sumber.
 * - Memastikan GID/tab ditemukan.
 * - Memeriksa metadata jumlah baris dan kolom.
 *
 * KEAMANAN:
 * - Read-only.
 * - Tidak membaca isi sel peserta.
 * - Tidak menulis ke spreadsheet sumber.
 * - Tidak menulis ke Registry.
 * - Tidak mencetak Spreadsheet ID atau data pribadi ke log.
 */

function registryAuditSourceReader() {
  const mulai = new Date();
  const hasil = [];

  if (
    typeof KONFIGURASI === "undefined" ||
    !Array.isArray(KONFIGURASI.sumber)
  ) {
    throw new Error(
      "KONFIGURASI.sumber tidak ditemukan atau bukan array."
    );
  }

  KONFIGURASI.sumber.forEach(function (sumber) {
    const item = {
      kode: sumber.kode || "TANPA_KODE",
      nama: sumber.nama || "Tanpa Nama",
      statusAkses: "BELUM_DIPERIKSA",
      statusTab: "BELUM_DIPERIKSA",
      jumlahBaris: null,
      jumlahKolom: null,
      status: "PENDING"
    };

    try {
      if (!sumber.id || sumber.gid === undefined || sumber.gid === null) {
        throw new Error("Konfigurasi ID/GID tidak lengkap.");
      }

      // Membuka spreadsheet dalam mode baca.
      const ss = SpreadsheetApp.openById(sumber.id);

      item.statusAkses = "BERHASIL";

      // Mencari tab berdasarkan GID, bukan nama tab.
      const sheet = ss.getSheets().find(function (tab) {
        return tab.getSheetId() === Number(sumber.gid);
      });

      if (!sheet) {
        item.statusTab = "GID_TIDAK_DITEMUKAN";
        item.status = "GAGAL";
      } else {
        item.statusTab = "DITEMUKAN";
        item.jumlahBaris = sheet.getLastRow();
        item.jumlahKolom = sheet.getLastColumn();
        item.status = "BERHASIL";
      }

    } catch (err) {
      // Pesan error tidak dicetak agar tidak membocorkan ID sumber.
      item.statusAkses = "GAGAL";
      item.status = "GAGAL";
      item.catatan = "Spreadsheet tidak dapat diakses atau terjadi kesalahan.";
    }

    hasil.push(item);
  });

  const berhasil = hasil.filter(function (item) {
    return item.status === "BERHASIL";
  }).length;

  const gagal = hasil.length - berhasil;

  const laporan = {
    proyek: KONFIGURASI.namaProyek,
    tahap: "Import 01 — Source Reader",
    versi: "1.0.0",
    waktuMulai: mulai,
    waktuSelesai: new Date(),
    totalSumber: hasil.length,
    berhasil: berhasil,
    gagal: gagal,
    statusKeseluruhan: gagal === 0 ? "AUDIT LULUS" : "AUDIT PERLU REVIEW",
    detail: hasil
  };

  Logger.log(JSON.stringify(laporan, null, 2));

  return laporan;
}

/**
 * Import 02 — Audit Header 14 Sumber
 * Read-only: membaca baris header saja.
 * Tidak membaca isi data peserta.
 * Tidak menulis ke Registry.
 */

function registryAuditHeaderSumber() {
  const laporan = [];

  KONFIGURASI.sumber.forEach(function (sumber) {
    const item = {
      kode: sumber.kode,
      nama: sumber.nama,
      status: "PENDING",
      header: []
    };

    try {
      const ss = SpreadsheetApp.openById(sumber.id);

      const sheet = ss.getSheets().find(function (tab) {
        return tab.getSheetId() === Number(sumber.gid);
      });

      if (!sheet) {
        item.status = "GID_TIDAK_DITEMUKAN";
        laporan.push(item);
        return;
      }

      const jumlahKolom = sheet.getLastColumn();

      if (jumlahKolom < 1) {
        item.status = "SHEET_KOSONG";
        laporan.push(item);
        return;
      }

      // Hanya membaca baris pertama/header.
      item.header = sheet
        .getRange(1, 1, 1, jumlahKolom)
        .getDisplayValues()[0];

      item.status = "BERHASIL";

    } catch (err) {
      item.status = "GAGAL";
      item.catatan = "Header tidak dapat dibaca.";
    }

    laporan.push(item);
  });

  Logger.log(JSON.stringify({
    tahap: "Import 02 — Audit Header",
    total: laporan.length,
    berhasil: laporan.filter(x => x.status === "BERHASIL").length,
    gagal: laporan.filter(x => x.status !== "BERHASIL").length,
    detail: laporan
  }, null, 2));

  return laporan;
}
