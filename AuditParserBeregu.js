
/**
 * AUDIT PARSER BEREGU
 * Versi 1.1.0
 *
 * MODE: BACA SAJA
 *
 * Menguji:
 * - Nama dengan pemisah koma dan kata "dan".
 * - Nama dengan penomoran 1., 2., 3.
 * - NISN dengan tanda kurung dan penomoran.
 * - NISN 10 dan 11 digit diterima.
 *
 * Tidak mengubah sumber data.
 */

function auditParserBereguVersi110() {

  const SUMBER = [
    {
      cabang: "Seni Tari",
      id: "1wHbxkbJ5Lg7ELWz9iXptPWBs2KIizT7qEN66BgI-Ouk",
      gid: 1519803277,
      baris: [5, 18]
    },
    {
      cabang: "Pantomim",
      id: "17m3R0usgNbUVA7wZDGksYY3dXaTl4Nwap_M2l363QHg",
      gid: 1285164873,
      baris: [4, 9]
    }
  ];

  const seluruhHasil = [];

  SUMBER.forEach(sumber => {

    const ss = SpreadsheetApp.openById(sumber.id);
    const sheet = ss.getSheetById(sumber.gid);

    if (!sheet) {
      throw new Error(
        "Sheet tidak ditemukan: " + sumber.cabang
      );
    }

    const header = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getDisplayValues()[0];

    const indeksNama = header.findIndex(h =>
      String(h).toLowerCase().includes("nama lengkap")
    );

    const indeksNisn = header.findIndex(h =>
      String(h).toLowerCase().includes("nisn")
    );

    if (indeksNama === -1 || indeksNisn === -1) {
      throw new Error(
        "Kolom nama/NISN tidak ditemukan: " + sumber.cabang
      );
    }

    sumber.baris.forEach(nomorBaris => {

      const data = sheet
        .getRange(nomorBaris, 1, 1, sheet.getLastColumn())
        .getDisplayValues()[0];

      const teksNama = String(data[indeksNama] || "").trim();
      const teksNisn = String(data[indeksNisn] || "").trim();

      const hasilNama = parserBereguNama110(teksNama);
      const hasilNisn = parserBereguNisn110(teksNisn);

      const jumlahNama = hasilNama.jumlahPeserta;
      const jumlahNisn = hasilNisn.jumlahNisn;

      const hasil = {
        cabang: sumber.cabang,
        baris: nomorBaris,

        nama: hasilNama,
        nisn: hasilNisn,

        jumlahNama: jumlahNama,
        jumlahNisn: jumlahNisn,

        jumlahSesuai: jumlahNama === jumlahNisn,

        status:
          jumlahNama === 0 || jumlahNisn === 0
            ? "DATA KOSONG / TIDAK TERBACA"
            : jumlahNama !== jumlahNisn
              ? "JUMLAH NAMA DAN NISN BERBEDA"
              : hasilNisn.jumlahDiLuarKetentuan > 0
                ? "JUMLAH SESUAI - ADA NISN PERLU PEMERIKSAAN"
                : "JUMLAH DAN FORMAT SESUAI"
      };

      seluruhHasil.push(hasil);
    });
  });

  Logger.log("=== AUDIT PARSER BEREGU VERSI 1.1.0 ===");

  Logger.log(JSON.stringify({
    versi: "1.1.0",
    mode: "BACA SAJA",
    kebijakanNisn: "10 dan 11 digit diterima",
    jumlahBarisDiuji: seluruhHasil.length,
    hasil: seluruhHasil
  }, null, 2));
}


/**
 * PARSER NAMA
 *
 * Prioritas:
 * 1. Penomoran 1., 2., 3.
 * 2. Pemisah koma dan kata DAN.
 */
function parserBereguNama110(teks) {

  if (!teks) {
    return {
      metode: "KOSONG",
      jumlahPeserta: 0,
      panjangSetiapNama: []
    };
  }

  let bagian = [];
  let metode = "";

  const polaNomor = /(?:^|\s)\d+\s*[.)]\s*/;

  if (polaNomor.test(teks)) {

    bagian = teks
      .split(polaNomor)
      .map(x => x.trim())
      .filter(Boolean);

    metode = "PENOMORAN";

  } else {

    bagian = teks
      .replace(/\bdan\b/gi, ",")
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);

    metode = "KOMA_DAN";
  }

  return {
    metode: metode,
    jumlahPeserta: bagian.length,

    panjangSetiapNama: bagian.map(x => x.length),

    jumlahKataSetiapNama: bagian.map(x =>
      (x.match(/\S+/g) || []).length
    )
  };
}


/**
 * PARSER NISN
 *
 * Menghapus penomoran di depan kelompok angka,
 * lalu mengambil setiap kelompok angka.
 *
 * Tidak mencetak nomor NISN sebenarnya.
 * Tidak memotong atau mengubah angka.
 */
function parserBereguNisn110(teks) {

  if (!teks) {
    return {
      jumlahNisn: 0,
      jumlah10Digit: 0,
      jumlah11Digit: 0,
      jumlahDiLuarKetentuan: 0,
      panjangSetiapNisn: []
    };
  }

  // Hapus nomor urut seperti 1. dan 2.
  const tanpaNomorUrut = teks.replace(
    /(?:^|\s)\d+\s*[.)]\s*/g,
    " "
  );

  // Ambil kelompok angka, termasuk angka dalam kurung.
  const kelompokAngka =
    tanpaNomorUrut.match(/\d+/g) || [];

  const panjang = kelompokAngka.map(x => x.length);

  const jumlah10 = panjang.filter(x => x === 10).length;
  const jumlah11 = panjang.filter(x => x === 11).length;

  const jumlahDiLuar =
    panjang.filter(x => x !== 10 && x !== 11).length;

  return {
    metode: "EKSTRAKSI KELOMPOK ANGKA",
    jumlahNisn: kelompokAngka.length,
    jumlah10Digit: jumlah10,
    jumlah11Digit: jumlah11,
    jumlahDiLuarKetentuan: jumlahDiLuar,
    panjangSetiapNisn: panjang
  };
}
