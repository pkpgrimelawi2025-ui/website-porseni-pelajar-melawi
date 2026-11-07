
/**
 * AUDIT PARSER SELURUH 14 CABANG
 * Versi 1.2.0
 *
 * MODE: BACA SAJA
 *
 * KEBIJAKAN NISN:
 * - 9 digit diterima sebagai format.
 * - 10 digit diterima sebagai format.
 * - 11 digit diterima sebagai format.
 * - Selain itu ditandai PERLU VERIFIKASI.
 *
 * CATATAN:
 * - Format digit bukan bukti keabsahan NISN.
 * - Verifikasi dokumen resmi dilakukan terpisah.
 * - NISN tidak dipotong, ditambah, atau diubah.
 * - Nama beregu dengan penomoran didukung.
 * - Nama beregu dengan koma dan kata "dan" didukung.
 * - Tidak mencetak nama atau NISN ke log.
 * - Tidak mengubah spreadsheet maupun Code.gs.
 */

function auditParserSeluruhCabangVersi120() {

  const SUMBER = [
    {
      cabang: "Bola Voli",
      id: "1icrJQNfYygjEU1bfe4xckoyH-ehXiuFsIm-ewotMavg",
      gid: 912745545
    },
    {
      cabang: "Sepak Bola Mini",
      id: "1fobXJ_pKMKGkv2F3JJmj9Ta-b7Z-F1ZLzQUDAjoo04o",
      gid: 1043834311
    },
    {
      cabang: "Atletik",
      id: "1pXuer2V-NlkhbYfx6A_KR-TEQPAOeRZcbWX5coRi8do",
      gid: 2065186910
    },
    {
      cabang: "Catur",
      id: "1E0Iq3C-Wy0e7fpeImU7kYJT0P8gPUSPFxqlfv7CUL0k",
      gid: 1655015635
    },
    {
      cabang: "Tenis Meja",
      id: "1gBwDJYt5vBfLM_60kZz2h1EsJA7JahHANVaTKai53Bw",
      gid: 346316743
    },
    {
      cabang: "Karate",
      id: "1luaVhUol63W8NmyycYpzw9PmbX9kGG85lb7lLgZewiw",
      gid: 693318468
    },
    {
      cabang: "Menyanyi Solo",
      id: "1a6f5Xgc3fYCSne__rhyFPPn-9JveWLdeG_JwU1H1onc",
      gid: 884070524
    },
    {
      cabang: "Baca Puisi",
      id: "1S-4AbgNmsItPstUCKpC_63NnzalzI7i7d8P1L3z6Ut0",
      gid: 284799990
    },
    {
      cabang: "Pantomim",
      id: "17m3R0usgNbUVA7wZDGksYY3dXaTl4Nwap_M2l363QHg",
      gid: 1285164873
    },
    {
      cabang: "Seni Tari",
      id: "1wHbxkbJ5Lg7ELWz9iXptPWBs2KIizT7qEN66BgI-Ouk",
      gid: 1519803277
    },
    {
      cabang: "Mendongeng",
      id: "1VgeXjbMzM8S9ugQ_C49tE4emV226Db9rCoEywf2Y3hg",
      gid: 1724139732
    },
    {
      cabang: "Menulis Cerita",
      id: "1a9_seg482ZpDrHHXCzudUy8cI1XqcuDqziCeNtUfGac",
      gid: 964087810
    },
    {
      cabang: "Seni Kriya",
      id: "1EPHqsPR7NvLJ5pppxZgRoe2WuUq1ZCYxzXblron5t2w",
      gid: 1024083953
    },
    {
      cabang: "Gambar Bercerita",
      id: "1kvF2qgtHJ45rBPflRyGHdV2-eWjMTHjjJ2pBMwnQlMw",
      gid: 1208055
    }
  ];

  const ringkasan = [];
  const seluruhAnomali = [];

  let totalRespons = 0;
  let totalPeserta = 0;
  let totalNisn = 0;

  let totalNisn9 = 0;
  let totalNisn10 = 0;
  let totalNisn11 = 0;
  let totalNisnLainnya = 0;

  let totalResponsSesuai = 0;
  let totalResponsTidakSesuai = 0;
  let totalResponsKosong = 0;

  let jumlahCabangBerhasil = 0;
  let jumlahCabangGagal = 0;

  SUMBER.forEach(sumber => {

    try {

      const ss = SpreadsheetApp.openById(sumber.id);
      const sheet = ss.getSheetById(sumber.gid);

      if (!sheet) {
        throw new Error("Sheet tidak ditemukan.");
      }

      const barisTerakhir = sheet.getLastRow();
      const kolomTerakhir = sheet.getLastColumn();

      if (barisTerakhir < 2 || kolomTerakhir < 1) {

        ringkasan.push({
          cabang: sumber.cabang,
          status: "TIDAK ADA DATA"
        });

        jumlahCabangBerhasil++;
        return;
      }

      const header = sheet
        .getRange(1, 1, 1, kolomTerakhir)
        .getDisplayValues()[0];

      const headerNormal = header.map(h =>
        String(h || "")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim()
      );

      const kolomNama = [];

      const kolomNisn = [];

      headerNormal.forEach((h, indeks) => {

        if (h.includes("nama lengkap")) {
          kolomNama.push(indeks);
        }

        if (h.includes("nisn")) {
          kolomNisn.push(indeks);
        }

      });

      if (
        kolomNama.length !== 1 ||
        kolomNisn.length !== 1
      ) {

        ringkasan.push({
          cabang: sumber.cabang,
          status: "HEADER TIDAK VALID",
          jumlahKolomNama: kolomNama.length,
          jumlahKolomNisn: kolomNisn.length
        });

        jumlahCabangGagal++;
        return;
      }

      const indeksNama = kolomNama[0];
      const indeksNisn = kolomNisn[0];

      const jumlahBaris = barisTerakhir - 1;

      const data = sheet
        .getRange(2, 1, jumlahBaris, kolomTerakhir)
        .getDisplayValues();

      let responsDiperiksa = 0;
      let responsTunggal = 0;
      let responsBeregu = 0;

      let pesertaTerdeteksi = 0;
      let nisnTerdeteksi = 0;

      let nisn9 = 0;
      let nisn10 = 0;
      let nisn11 = 0;
      let nisnLainnya = 0;

      let jumlahSesuai = 0;
      let jumlahTidakSesuai = 0;
      let dataKosong = 0;
      let nisnPerluVerifikasi = 0;

      data.forEach((baris, indeks) => {

        const nomorBaris = indeks + 2;

        const teksNama =
          String(baris[indeksNama] || "").trim();

        const teksNisn =
          String(baris[indeksNisn] || "").trim();

        if (!teksNama && !teksNisn) return;

        responsDiperiksa++;

        const hasilNama =
          auditParserNama120(teksNama);

        const hasilNisn =
          auditParserNisn120(teksNisn);

        pesertaTerdeteksi += hasilNama.jumlah;
        nisnTerdeteksi += hasilNisn.jumlah;

        nisn9 += hasilNisn.jumlah9;
        nisn10 += hasilNisn.jumlah10;
        nisn11 += hasilNisn.jumlah11;
        nisnLainnya += hasilNisn.jumlahLainnya;

        const masalah = [];

        if (hasilNama.jumlah === 0 ||
            hasilNisn.jumlah === 0) {

          dataKosong++;

          masalah.push(
            "NAMA ATAU NISN TIDAK TERBACA"
          );

        } else {

          if (hasilNama.jumlah === 1) {
            responsTunggal++;
          } else {
            responsBeregu++;
          }

          if (
            hasilNama.jumlah !== hasilNisn.jumlah
          ) {

            jumlahTidakSesuai++;

            masalah.push(
              "JUMLAH NAMA DAN NISN BERBEDA"
            );

          } else {

            jumlahSesuai++;

          }

        }

        if (hasilNisn.jumlahLainnya > 0) {

          nisnPerluVerifikasi++;

          masalah.push(
            "ADA FORMAT NISN YANG PERLU VERIFIKASI"
          );

        }

        if (masalah.length > 0) {

          seluruhAnomali.push({
            cabang: sumber.cabang,
            baris: nomorBaris,
            jumlahNama: hasilNama.jumlah,
            jumlahNisn: hasilNisn.jumlah,
            panjangNisn: hasilNisn.panjang,
            masalah: masalah
          });

        }

      });

      totalRespons += responsDiperiksa;
      totalPeserta += pesertaTerdeteksi;
      totalNisn += nisnTerdeteksi;

      totalNisn9 += nisn9;
      totalNisn10 += nisn10;
      totalNisn11 += nisn11;
      totalNisnLainnya += nisnLainnya;

      totalResponsSesuai += jumlahSesuai;
      totalResponsTidakSesuai += jumlahTidakSesuai;
      totalResponsKosong += dataKosong;

      jumlahCabangBerhasil++;

      ringkasan.push({

        cabang: sumber.cabang,
        status: "BERHASIL DIAUDIT",

        responsDiperiksa: responsDiperiksa,
        responsTunggal: responsTunggal,
        responsBeregu: responsBeregu,

        pesertaTerdeteksi: pesertaTerdeteksi,
        nisnTerdeteksi: nisnTerdeteksi,

        nisn9Digit: nisn9,
        nisn10Digit: nisn10,
        nisn11Digit: nisn11,
        nisnFormatLainnya: nisnLainnya,

        responsJumlahSesuai: jumlahSesuai,
        responsJumlahTidakSesuai:
          jumlahTidakSesuai,

        responsDataKosong: dataKosong,

        responsDenganNisnPerluVerifikasi:
          nisnPerluVerifikasi

      });

    } catch (error) {

      jumlahCabangGagal++;

      ringkasan.push({
        cabang: sumber.cabang,
        status: "GAGAL DIAUDIT",
        pesan: "Terjadi kesalahan saat membaca sumber."
      });

    }

  });

  const auditLengkap =
    jumlahCabangBerhasil === SUMBER.length &&
    jumlahCabangGagal === 0;

  Logger.log(
    "=== AUDIT PARSER SELURUH 14 CABANG V1.2.0 ==="
  );

  Logger.log("=== RINGKASAN GLOBAL ===");

  Logger.log(JSON.stringify({

    versi: "1.2.0",

    jumlahCabang: SUMBER.length,
    jumlahCabangBerhasil: jumlahCabangBerhasil,
    jumlahCabangGagal: jumlahCabangGagal,

    statusAudit: auditLengkap
      ? "SELURUH CABANG BERHASIL DIAUDIT"
      : "AUDIT BELUM LENGKAP",

    totalResponsDiperiksa: totalRespons,
    totalPesertaTerdeteksi: totalPeserta,
    totalNisnTerdeteksi: totalNisn,

    totalNisn9Digit: totalNisn9,
    totalNisn10Digit: totalNisn10,
    totalNisn11Digit: totalNisn11,
    totalNisnFormatLainnya: totalNisnLainnya,

    totalResponsJumlahSesuai:
      totalResponsSesuai,

    totalResponsJumlahTidakSesuai:
      totalResponsTidakSesuai,

    totalResponsDataKosong:
      totalResponsKosong,

    jumlahCatatanAnomali:
      seluruhAnomali.length,

    catatan:
      "Format digit tidak membuktikan keabsahan NISN. Verifikasi dokumen resmi dilakukan terpisah."

  }, null, 2));

  Logger.log("=== RINGKASAN PER CABANG ===");

  ringkasan.forEach(item => {
    Logger.log(JSON.stringify(item));
  });

  Logger.log("=== RINCIAN ANOMALI ===");

  seluruhAnomali.forEach((item, indeks) => {

    Logger.log(
      "CATATAN " + (indeks + 1) + ": " +
      JSON.stringify(item)
    );

  });

}


/**
 * PARSER NAMA VERSI 1.2.0
 *
 * Mendukung:
 * - 1. Nama pertama 2. Nama kedua
 * - Nama pertama, Nama kedua
 * - Nama pertama dan Nama kedua
 */
function auditParserNama120(teks) {

  if (!teks) {
    return {
      jumlah: 0,
      panjang: [],
      metode: "KOSONG"
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
    jumlah: bagian.length,
    metode: metode,
    panjang: bagian.map(x => x.length)
  };

}


/**
 * PARSER NISN VERSI 1.2.0
 *
 * Format yang diterima:
 * - 9 digit
 * - 10 digit
 * - 11 digit
 *
 * Format lainnya ditandai untuk verifikasi.
 *
 * Tidak mengubah atau memotong angka.
 */
function auditParserNisn120(teks) {

  if (!teks) {

    return {
      jumlah: 0,
      jumlah9: 0,
      jumlah10: 0,
      jumlah11: 0,
      jumlahLainnya: 0,
      panjang: []
    };

  }

  const tanpaNomorUrut = teks.replace(
    /(?:^|\s)\d+\s*[.)]\s*/g,
    " "
  );

  const kelompok =
    tanpaNomorUrut.match(/\d+/g) || [];

  const panjang = kelompok.map(x => x.length);

  const jumlah9 =
    panjang.filter(x => x === 9).length;

  const jumlah10 =
    panjang.filter(x => x === 10).length;

  const jumlah11 =
    panjang.filter(x => x === 11).length;

  const jumlahLainnya =
    panjang.filter(x =>
      x !== 9 && x !== 10 && x !== 11
    ).length;

  return {

    jumlah: kelompok.length,

    jumlah9: jumlah9,
    jumlah10: jumlah10,
    jumlah11: jumlah11,

    jumlahLainnya: jumlahLainnya,

    panjang: panjang

  };

}
