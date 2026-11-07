
/**
 * ============================================================
 * PORSENI PELAJAR MELAWI 2026
 * MODUL: AUDIT STRUKTUR PESERTA
 * FILE: AuditStrukturPeserta.gs
 * VERSI: 1.0.0
 * ============================================================
 *
 * Tujuan:
 * 1. Memeriksa baris 5 dan 18 Seni Tari.
 * 2. Memeriksa baris 4 dan 9 Pantomim.
 * 3. Membandingkan pola pemisahan nama dan NISN.
 * 4. Memeriksa kelengkapan metadata.
 *
 * Keamanan:
 * - Hanya membaca Spreadsheet.
 * - Tidak mengubah data sumber.
 * - Tidak mencetak nama, NISN, atau URL foto.
 * - Tidak mengubah izin Google Drive.
 * ============================================================
 */

function auditStrukturPesertaVersi100() {

  const targetAudit = [
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
    judul: "Audit Struktur Peserta PORSENI",
    versi: "1.0.0",
    mode: "BACA SAJA",
    jumlahCabang: targetAudit.length,
    jumlahBarisDiuji: 0,
    hasil: []
  };

  targetAudit.forEach(target => {

    const sumber = KONFIGURASI.sumber.find(
      item => item.kode === target.kode
    );

    if (!sumber) {
      laporan.hasil.push({
        cabang: target.nama,
        status: "KONFIGURASI TIDAK DITEMUKAN"
      });
      return;
    }

    const spreadsheet = SpreadsheetApp.openById(sumber.id);

    const sheet = ambilSheetBerdasarkanGid(
      spreadsheet,
      sumber.gid
    );

    if (!sheet) {
      laporan.hasil.push({
        cabang: target.nama,
        status: "SHEET TIDAK DITEMUKAN"
      });
      return;
    }

    const jumlahKolom = sheet.getLastColumn();

    if (jumlahKolom < 1) {
      laporan.hasil.push({
        cabang: target.nama,
        status: "SHEET KOSONG"
      });
      return;
    }

    const header = sheet.getRange(
      1, 1, 1, jumlahKolom
    ).getDisplayValues()[0];

    const indeks = {};

    header.forEach((nama, i) => {

      const normal = auditNormalisasiHeader(nama);

      if (normal === "nama lengkap") {
        indeks.nama = i;
      }

      if (normal === "nisn") {
        indeks.nisn = i;
      }

      if (normal === "jenis kelamin") {
        indeks.jenisKelamin = i;
      }

      if (normal === "kelas") {
        indeks.kelas = i;
      }

      if (normal === "nama sekolah") {
        indeks.sekolah = i;
      }

      if (normal === "kecamatan") {
        indeks.kecamatan = i;
      }

      if (normal.startsWith("jenjang sekolah")) {
        indeks.jenjang = i;
      }

      if (normal.includes("foto")) {
        indeks.foto = i;
      }
    });

    target.baris.forEach(nomorBaris => {

      laporan.jumlahBarisDiuji++;

      if (nomorBaris > sheet.getLastRow()) {
        laporan.hasil.push({
          cabang: target.nama,
          baris: nomorBaris,
          status: "BARIS TIDAK TERSEDIA"
        });
        return;
      }

      const data = sheet.getRange(
        nomorBaris,
        1,
        1,
        jumlahKolom
      ).getDisplayValues()[0];

      const ambil = key => {
        return indeks[key] !== undefined
          ? String(data[indeks[key]] || "").trim()
          : "";
      };

      const nama = ambil("nama");
      const nisn = ambil("nisn");

      const hasilNama = auditAnalisisDaftar(
        nama,
        "nama"
      );

      const hasilNisn = auditAnalisisDaftar(
        nisn,
        "nisn"
      );

      const metadata = {
        kecamatan: Boolean(ambil("kecamatan")),
        jenjang: Boolean(ambil("jenjang")),
        jenisKelamin: Boolean(ambil("jenisKelamin")),
        kelas: Boolean(ambil("kelas")),
        sekolah: Boolean(ambil("sekolah")),
        foto: Boolean(ambil("foto"))
      };

      const jumlahMetadataTerisi =
        Object.values(metadata).filter(Boolean).length;

      laporan.hasil.push({
        cabang: target.nama,
        baris: nomorBaris,

        nama:
          nama
            ? {
                tersedia: true,
                panjangKarakter: nama.length,
                analisis: hasilNama
              }
            : {
                tersedia: false
              },

        nisn:
          nisn
            ? {
                tersedia: true,
                panjangKarakter: nisn.length,
                analisis: hasilNisn
              }
            : {
                tersedia: false
              },

        metadata: metadata,

        jumlahMetadataTerisi: jumlahMetadataTerisi,
        jumlahMetadataDiperiksa: 6,

        status:
          nama && nisn
            ? "DATA TERBACA - PERLU VALIDASI"
            : "DATA NAMA ATAU NISN KOSONG"
      });
    });
  });

  console.log(
    "=== HASIL AUDIT STRUKTUR PESERTA ==="
  );

  console.log(
    JSON.stringify(laporan, null, 2)
  );

  return laporan;
}


/**
 * Normalisasi header khusus audit.
 */
function auditNormalisasiHeader(teks) {

  return String(teks || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}


/**
 * Menganalisis jumlah potongan nama atau NISN.
 * Tidak mencetak isi asli.
 */
function auditAnalisisDaftar(teks, jenis) {

  const nilai = String(teks || "").trim();

  if (!nilai) {
    return {
      jumlahPotonganKomaDan: 0,
      jumlahPotonganNomor: 0,
      panjangSetiapPotongan: []
    };
  }

  let daftarKomaDan = nilai
    .replace(/\s+dan\s+/gi, ",")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

  const daftarNomor = nilai
    .split(/(?:^|\s)\d+\s*[.)]\s*/)
    .map(item => item.trim())
    .filter(Boolean);

  const daftar = jenis === "nama"
    ? (
        daftarNomor.length > 1
          ? daftarNomor
          : daftarKomaDan
      )
    : daftarKomaDan;

  return {
    jumlahPotonganKomaDan: daftarKomaDan.length,
    jumlahPotonganNomor: daftarNomor.length,
    panjangSetiapPotongan: daftar.map(
      item => item.length
    )
  };
}
