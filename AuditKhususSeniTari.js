/**
 * AUDIT KHUSUS SENI TARI BARIS 18
 * Versi 1.0.0
 *
 * MODE: BACA SAJA
 * Tujuan:
 * 1. Memeriksa pola penulisan nama beregu.
 * 2. Memeriksa pola penulisan NISN.
 * 3. Menampilkan struktur tanpa membocorkan nama dan nomor NISN.
 *
 * Tidak mengubah Google Sheets maupun Code.gs.
 */

function auditKhususSeniTariBaris18() {
  const ID_SPREADSHEET =
    "1wHbxkbJ5Lg7ELWz9iXptPWBs2KIizT7qEN66BgI-Ouk";

  const GID_SHEET = 1519803277;
  const NOMOR_BARIS = 18;

  const ss = SpreadsheetApp.openById(ID_SPREADSHEET);
  const sheet = ss.getSheetById(GID_SHEET);

  if (!sheet) {
    throw new Error("Sheet Seni Tari tidak ditemukan.");
  }

  const jumlahKolom = sheet.getLastColumn();

  const header = sheet
    .getRange(1, 1, 1, jumlahKolom)
    .getDisplayValues()[0];

  const kolomNama = header.findIndex(h =>
    String(h).toLowerCase().includes("nama lengkap")
  );

  const kolomNisn = header.findIndex(h =>
    String(h).toLowerCase().includes("nisn")
  );

  if (kolomNama === -1 || kolomNisn === -1) {
    throw new Error(
      "Kolom Nama Lengkap atau NISN tidak ditemukan."
    );
  }

  const data = sheet
    .getRange(NOMOR_BARIS, 1, 1, jumlahKolom)
    .getDisplayValues()[0];

  const teksNama = String(data[kolomNama] || "").trim();
  const teksNisn = String(data[kolomNisn] || "").trim();

  const hasil = {
    judul: "Audit Khusus Seni Tari Baris 18",
    versi: "1.0.0",
    mode: "BACA SAJA",
    cabang: "Seni Tari",
    baris: NOMOR_BARIS,

    analisisNama: auditPolaNamaSeniTari(teksNama),

    analisisNisn: auditPolaNisnSeniTari(teksNisn),

    catatan:
      "Hasil audit hanya menunjukkan pola teks, bukan validasi identitas."
  };

  Logger.log(
    "=== HASIL AUDIT KHUSUS SENI TARI BARIS 18 ==="
  );

  Logger.log(JSON.stringify(hasil, null, 2));
}


/**
 * Menganalisis struktur teks nama tanpa menampilkan nama.
 */
function auditPolaNamaSeniTari(teks) {
  const hasil = {
    panjangTeks: teks.length,
    jumlahKata: (teks.match(/\S+/g) || []).length,
    jumlahAngka: (teks.match(/\d/g) || []).length,
    jumlahKoma: (teks.match(/,/g) || []).length,
    jumlahTitik: (teks.match(/\./g) || []).length,
    jumlahTitikDua: (teks.match(/:/g) || []).length,
    menggunakanKataDan: /\bdan\b/i.test(teks),

    polaKarakter: auditPolaKarakter(teks),

    potonganBerdasarkanNomor:
      auditPotonganNomorNama(teks),

    potonganBerdasarkanKoma:
      auditPotonganKomaNama(teks)
  };

  return hasil;
}


/**
 * Mengubah huruf menjadi A dan angka menjadi 9.
 * Tanda baca tetap dipertahankan.
 */
function auditPolaKarakter(teks) {
  return teks
    .replace(/[A-Za-zÀ-ÿ]/g, "A")
    .replace(/\d/g, "9");
}


/**
 * Memeriksa kemungkinan format:
 * 1. Nama pertama
 * 2. Nama kedua
 * 3. Nama ketiga
 */
function auditPotonganNomorNama(teks) {
  const pola = teks.split(/(?:^|\s)\d+\s*[.)]\s*/);

  const hasil = pola
    .map(bagian => bagian.trim())
    .filter(Boolean)
    .map(bagian => ({
      panjangKarakter: bagian.length,
      jumlahKata: (bagian.match(/\S+/g) || []).length,
      jumlahAngka: (bagian.match(/\d/g) || []).length
    }));

  return {
    jumlahPotongan: hasil.length,
    rincian: hasil
  };
}


/**
 * Memeriksa pola pemisahan koma.
 */
function auditPotonganKomaNama(teks) {
  const bagian = teks
    .replace(/\bdan\b/gi, ",")
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

  return {
    jumlahPotongan: bagian.length,
    rincian: bagian.map(x => ({
      panjangKarakter: x.length,
      jumlahKata: (x.match(/\S+/g) || []).length
    }))
  };
}


/**
 * Menganalisis struktur angka pada kolom NISN.
 * Tidak menampilkan angka NISN sebenarnya.
 */
function auditPolaNisnSeniTari(teks) {
  const kelompokAngka = teks.match(/\d+/g) || [];

  const hasilKelompok = kelompokAngka.map((angka, indeks) => ({
    urutan: indeks + 1,
    panjangDigit: angka.length,
    kandidat10Digit: angka.length === 10
  }));

  return {
    panjangTeks: teks.length,
    jumlahDigit: (teks.match(/\d/g) || []).length,
    jumlahKelompokAngka: kelompokAngka.length,
    kelompokAngka: hasilKelompok,
    jumlahKandidat10Digit:
      kelompokAngka.filter(x => x.length === 10).length,

    polaKarakter: auditPolaKarakter(teks)
  };
}