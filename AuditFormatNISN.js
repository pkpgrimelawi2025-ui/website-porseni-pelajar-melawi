
/**
 * ============================================================
 * PORSENI PELAJAR MELAWI 2026
 * MODUL: AUDIT FORMAT NISN
 * FILE: AuditFormatNISN.gs
 * VERSI: 1.0.0
 * ============================================================
 *
 * Fungsi:
 * - Memeriksa format NISN.
 * - Mendeteksi pemisah koma dan kata DAN.
 * - Menghitung kandidat NISN 10 digit.
 * - Membandingkan jumlah nama dan NISN.
 *
 * Keamanan:
 * - Hanya membaca Spreadsheet.
 * - Tidak mencetak nama atau NISN asli.
 * - Tidak mengubah data sumber.
 * ============================================================
 */

function auditFormatNISNVersi100() {

  const target = [
    {
      kode: "SENI_TARI",
      nama: "Seni Tari",
      baris: [5, 18]
    },
    {
      kode: "PANTOMIM",
      nama: "Pantomim",
      baris: [4, 9]
    }
  ];

  const laporan = {
    judul: "Audit Format NISN",
    versi: "1.0.0",
    mode: "BACA SAJA",
    jumlahBarisDiuji: 0,
    hasil: []
  };

  target.forEach(item => {

    const sumber = KONFIGURASI.sumber.find(
      s => s.kode === item.kode
    );

    if (!sumber) {
      laporan.hasil.push({
        cabang: item.nama,
        status: "SUMBER TIDAK DITEMUKAN"
      });
      return;
    }

    const ss = SpreadsheetApp.openById(sumber.id);

    const sheet = ambilSheetBerdasarkanGid(
      ss,
      sumber.gid
    );

    if (!sheet) {
      laporan.hasil.push({
        cabang: item.nama,
        status: "SHEET TIDAK DITEMUKAN"
      });
      return;
    }

    const jumlahKolom = sheet.getLastColumn();

    const header = sheet.getRange(
      1, 1, 1, jumlahKolom
    ).getDisplayValues()[0];

    const indeksNama = header.findIndex(
      h => auditNormalisasiHeader(h) === "nama lengkap"
    );

    const indeksNisn = header.findIndex(
      h => auditNormalisasiHeader(h) === "nisn"
    );

    if (indeksNama === -1 || indeksNisn === -1) {
      laporan.hasil.push({
        cabang: item.nama,
        status: "KOLOM NAMA ATAU NISN TIDAK DITEMUKAN"
      });
      return;
    }

    item.baris.forEach(nomorBaris => {

      laporan.jumlahBarisDiuji++;

      const data = sheet.getRange(
        nomorBaris,
        1,
        1,
        jumlahKolom
      ).getDisplayValues()[0];

      const nama = String(
        data[indeksNama] || ""
      ).trim();

      const nisn = String(
        data[indeksNisn] || ""
      ).trim();

      const analisisNama =
        auditFormatNISNAnalisisNama(nama);

      const analisisNisn =
        auditFormatNISNAnalisisNomor(nisn);

      laporan.hasil.push({
        cabang: item.nama,
        baris: nomorBaris,

        jumlahNamaTerdeteksi:
          analisisNama.jumlah,

        jumlahKandidatNISN:
          analisisNisn.jumlahKandidat,

        jumlahNISN10Digit:
          analisisNisn.jumlahNISN10Digit,

        jumlahPemisahKoma:
          analisisNisn.jumlahKoma,

        menggunakanKataDan:
          analisisNisn.menggunakanDan,

        panjangTeksNISN:
          nisn.length,

        panjangSetiapKandidat:
          analisisNisn.panjangSetiapKandidat,

        kesesuaianJumlah:
          analisisNama.jumlah ===
          analisisNisn.jumlahNISN10Digit,

        status:
          analisisNama.jumlah ===
          analisisNisn.jumlahNISN10Digit
            ? "JUMLAH KANDIDAT SESUAI"
            : "PERLU VALIDASI FORMAT NISN"
      });
    });
  });

  console.log(
    "=== HASIL AUDIT FORMAT NISN ==="
  );

  console.log(
    JSON.stringify(laporan, null, 2)
  );

  return laporan;
}


/**
 * Mendeteksi jumlah nama berdasarkan
 * koma dan kata DAN.
 */
function auditFormatNISNAnalisisNama(teks) {

  const nilai = String(teks || "").trim();

  if (!nilai) {
    return { jumlah: 0 };
  }

  const daftar = nilai
    .replace(/\s+dan\s+/gi, ",")
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

  return {
    jumlah: daftar.length
  };
}


/**
 * Mendeteksi kandidat nomor NISN 10 digit.
 *
 * Tidak mencetak nomor aslinya.
 */
function auditFormatNISNAnalisisNomor(teks) {

  const nilai = String(teks || "").trim();

  const kandidat = nilai.match(/\d+/g) || [];

  const nisn10Digit = kandidat.filter(
    nomor => nomor.length === 10
  );

  const jumlahKoma = (
    nilai.match(/,/g) || []
  ).length;

  const menggunakanDan =
    /\s+dan\s+/i.test(nilai);

  return {
    jumlahKandidat: kandidat.length,
    jumlahNISN10Digit: nisn10Digit.length,
    jumlahKoma: jumlahKoma,
    menggunakanDan: menggunakanDan,
    panjangSetiapKandidat: kandidat.map(
      nomor => nomor.length
    )
  };
}
