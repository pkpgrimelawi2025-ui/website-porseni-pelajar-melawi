
/**
 * AUDIT ANOMALI TERARAH
 * Versi 1.0.0
 *
 * MODE: BACA SAJA
 * Tidak mengubah data sumber.
 * Tidak menampilkan nama dan NISN asli.
 */

function auditAnomaliTerarahVersi100() {

  const TARGET = [
    {
      cabang: "Bola Voli",
      id: "1icrJQNfYygjEU1bfe4xckoyH-ehXiuFsIm-ewotMavg",
      gid: 912745545,
      baris: [3, 29, 37, 48, 50, 51, 53]
    },
    {
      cabang: "Sepak Bola Mini",
      id: "1fobXJ_pKMKGkv2F3JJmj9Ta-b7Z-F1ZLzQUDAjoo04o",
      gid: 1043834311,
      baris: [14, 24, 27]
    },
    {
      cabang: "Atletik",
      id: "1pXuer2V-NlkhbYfx6A_KR-TEQPAOeRZcbWX5coRi8do",
      gid: 2065186910,
      baris: [5, 15]
    },
    {
      cabang: "Catur",
      id: "1E0Iq3C-Wy0e7fpeImU7kYJT0P8gPUSPFxqlfv7CUL0k",
      gid: 1655015635,
      baris: [12, 27]
    },
    {
      cabang: "Seni Tari",
      id: "1wHbxkbJ5Lg7ELWz9iXptPWBs2KIizT7qEN66BgI-Ouk",
      gid: 1519803277,
      baris: [4, 10, 12, 13, 21, 22]
    },
    {
      cabang: "Mendongeng",
      id: "1VgeXjbMzM8S9ugQ_C49tE4emV226Db9rCoEywf2Y3hg",
      gid: 1724139732,
      baris: [7]
    }
  ];

  let jumlahDiuji = 0;

  TARGET.forEach(sumber => {

    const ss = SpreadsheetApp.openById(sumber.id);
    const sheet = ss.getSheetById(sumber.gid);

    if (!sheet) {
      Logger.log(
        sumber.cabang + ": SHEET TIDAK DITEMUKAN"
      );
      return;
    }

    const kolomTerakhir = sheet.getLastColumn();

    const header = sheet
      .getRange(1, 1, 1, kolomTerakhir)
      .getDisplayValues()[0];

    const idxNama = header.findIndex(h =>
      String(h).toLowerCase().includes("nama lengkap")
    );

    const idxNisn = header.findIndex(h =>
      String(h).toLowerCase().includes("nisn")
    );

    if (idxNama < 0 || idxNisn < 0) {
      Logger.log(
        sumber.cabang + ": HEADER TIDAK DITEMUKAN"
      );
      return;
    }

    sumber.baris.forEach(nomorBaris => {

      const data = sheet
        .getRange(nomorBaris, 1, 1, kolomTerakhir)
        .getDisplayValues()[0];

      const nama = String(data[idxNama] || "").trim();
      const nisn = String(data[idxNisn] || "").trim();

      const hasil = {
        cabang: sumber.cabang,
        baris: nomorBaris,

        polaNama: auditAnomaliPola100(nama),
        polaNisn: auditAnomaliPola100(nisn),

        kelompokAngkaNisn:
          auditAnomaliKelompokAngka100(nisn)
      };

      jumlahDiuji++;

      Logger.log(JSON.stringify(hasil));

    });

  });

  Logger.log(
    "TOTAL BARIS ANOMALI DIPERIKSA: " + jumlahDiuji
  );
}


/**
 * Mengubah huruf menjadi A dan angka menjadi 9.
 * Tanda baca dan spasi dipertahankan.
 */
function auditAnomaliPola100(teks) {

  return {
    panjangKarakter: teks.length,

    pola:
      teks
        .replace(/[A-Za-zÀ-ÿ]/g, "A")
        .replace(/\d/g, "9"),

    jumlahKoma: (teks.match(/,/g) || []).length,
    jumlahTitik: (teks.match(/\./g) || []).length,
    jumlahKurungBuka: (teks.match(/\(/g) || []).length,
    jumlahKurungTutup: (teks.match(/\)/g) || []).length,
    menggunakanDan: /\bdan\b/i.test(teks)
  };
}


/**
 * Menghitung kelompok angka tanpa menampilkan angkanya.
 */
function auditAnomaliKelompokAngka100(teks) {

  const kelompok = teks.match(/\d+/g) || [];

  return {
    jumlahKelompok: kelompok.length,

    panjangSetiapKelompok:
      kelompok.map(x => x.length),

    jumlah10Digit:
      kelompok.filter(x => x.length === 10).length,

    jumlah11Digit:
      kelompok.filter(x => x.length === 11).length
  };
}
