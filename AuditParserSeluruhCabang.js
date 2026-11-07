
/**
 * AUDIT PARSER SELURUH 14 CABANG
 * Versi 1.0.0
 *
 * MODE: BACA SAJA
 *
 * Kebijakan:
 * - NISN 10 digit diterima.
 * - NISN 11 digit diterima.
 * - NISN tidak dipotong atau diubah.
 * - Nama beregu dengan penomoran didukung.
 * - Nama beregu dengan koma dan kata "dan" didukung.
 *
 * Tidak mengubah spreadsheet maupun Code.gs.
 * Tidak mencetak nama atau nomor NISN ke log.
 */

function auditParserSeluruhCabangVersi100() {

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
  let totalNisn10 = 0;
  let totalNisn11 = 0;

  SUMBER.forEach(sumber => {

    try {

      const ss = SpreadsheetApp.openById(sumber.id);
      const sheet = ss.getSheetById(sumber.gid);

      if (!sheet) {
        throw new Error("Sheet tidak ditemukan.");
      }

      const barisTerakhir = sheet.getLastRow();
      const kolomTerakhir = sheet.getLastColumn();

      if (barisTerakhir < 2) {
        ringkasan.push({
          cabang: sumber.cabang,
          status: "TIDAK ADA DATA"
        });
        return;
      }

      const header = sheet
        .getRange(1, 1, 1, kolomTerakhir)
        .getDisplayValues()[0];

      const indeksNama = header.findIndex(h => {
        const teks = String(h).toLowerCase().trim();
        return teks.includes("nama lengkap");
      });

      const indeksNisn = header.findIndex(h =>
        String(h).toLowerCase().includes("nisn")
      );

      if (indeksNama === -1 || indeksNisn === -1) {
        ringkasan.push({
          cabang: sumber.cabang,
          status: "HEADER TIDAK DITEMUKAN",
          kolomNamaDitemukan: indeksNama !== -1,
          kolomNisnDitemukan: indeksNisn !== -1
        });
        return;
      }

      const jumlahBaris = barisTerakhir - 1;

      const data = sheet
        .getRange(2, 1, jumlahBaris, kolomTerakhir)
        .getDisplayValues();

      let responsDiperiksa = 0;
      let pesertaTerdeteksi = 0;
      let nisnTerdeteksi = 0;
      let nisn10 = 0;
      let nisn11 = 0;

      let responsTunggal = 0;
      let responsBeregu = 0;
      let jumlahSesuai = 0;
      let jumlahTidakSesuai = 0;
      let nisnDiLuarKetentuan = 0;
      let dataKosong = 0;

      data.forEach((baris, indeks) => {

        const nomorBaris = indeks + 2;

        const teksNama =
          String(baris[indeksNama] || "").trim();

        const teksNisn =
          String(baris[indeksNisn] || "").trim();

        if (!teksNama && !teksNisn) return;

        responsDiperiksa++;

        const hasilNama =
          auditSeluruhParserNama100(teksNama);

        const hasilNisn =
          auditSeluruhParserNisn100(teksNisn);

        pesertaTerdeteksi += hasilNama.jumlah;
        nisnTerdeteksi += hasilNisn.jumlah;
        nisn10 += hasilNisn.jumlah10;
        nisn11 += hasilNisn.jumlah11;

        if (hasilNama.jumlah === 0 ||
            hasilNisn.jumlah === 0) {

          dataKosong++;

          seluruhAnomali.push({
            cabang: sumber.cabang,
            baris: nomorBaris,
            jumlahNama: hasilNama.jumlah,
            jumlahNisn: hasilNisn.jumlah,
            masalah: "NAMA ATAU NISN TIDAK TERBACA"
          });

          return;
        }

        if (hasilNama.jumlah === 1) {
          responsTunggal++;
        } else {
          responsBeregu++;
        }

        if (hasilNama.jumlah !== hasilNisn.jumlah) {

          jumlahTidakSesuai++;

          seluruhAnomali.push({
            cabang: sumber.cabang,
            baris: nomorBaris,
            jumlahNama: hasilNama.jumlah,
            jumlahNisn: hasilNisn.jumlah,
            panjangNama: hasilNama.panjang,
            panjangNisn: hasilNisn.panjang,
            masalah: "JUMLAH NAMA DAN NISN BERBEDA"
          });

        } else {

          jumlahSesuai++;
        }

        if (hasilNisn.jumlahDiLuar > 0) {

          nisnDiLuarKetentuan++;

          seluruhAnomali.push({
            cabang: sumber.cabang,
            baris: nomorBaris,
            jumlahNisn: hasilNisn.jumlah,
            panjangNisn: hasilNisn.panjang,
            masalah: "ADA NISN DI LUAR 10 ATAU 11 DIGIT"
          });
        }

      });

      totalRespons += responsDiperiksa;
      totalPeserta += pesertaTerdeteksi;
      totalNisn += nisnTerdeteksi;
      totalNisn10 += nisn10;
      totalNisn11 += nisn11;

      ringkasan.push({
        cabang: sumber.cabang,
        status: "BERHASIL DIAUDIT",
        responsDiperiksa: responsDiperiksa,
        responsTunggal: responsTunggal,
        responsBeregu: responsBeregu,
        pesertaTerdeteksi: pesertaTerdeteksi,
        nisnTerdeteksi: nisnTerdeteksi,
        nisn10Digit: nisn10,
        nisn11Digit: nisn11,
        responsJumlahSesuai: jumlahSesuai,
        responsJumlahTidakSesuai: jumlahTidakSesuai,
        responsDataKosong: dataKosong,
        responsDenganNisnDiLuarKetentuan:
          nisnDiLuarKetentuan
      });

    } catch (error) {

      ringkasan.push({
        cabang: sumber.cabang,
        status: "GAGAL DIAUDIT",
        pesan: String(error.message || error)
      });

    }

  });

  Logger.log(
    "=== HASIL AUDIT PARSER SELURUH CABANG ==="
  );

  Logger.log("=== RINGKASAN AUDIT ===");

  Logger.log(JSON.stringify({
    jumlahCabang: SUMBER.length,
    totalResponsDiperiksa: totalRespons,
    totalPesertaTerdeteksi: totalPeserta,
    totalNisnTerdeteksi: totalNisn,
    totalNisn10Digit: totalNisn10,
    totalNisn11Digit: totalNisn11,
    jumlahAnomali: seluruhAnomali.length
  }, null, 2));

  Logger.log("=== RINCIAN ANOMALI ===");

  seluruhAnomali.forEach((item, indeks) => {
    Logger.log(
      "ANOMALI " + (indeks + 1) + ": " +
      JSON.stringify(item)
    );
  });

}


/**
 * PARSER NAMA SELURUH CABANG
 *
 * Mendukung:
 * - 1. Nama pertama 2. Nama kedua
 * - Nama pertama, Nama kedua
 * - Nama pertama dan Nama kedua
 */
function auditSeluruhParserNama100(teks) {

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
 * PARSER NISN SELURUH CABANG
 *
 * - Menghapus nomor urut seperti 1. dan 2.
 * - Mengambil kelompok angka.
 * - Menerima 10 dan 11 digit.
 * - Tidak mengubah atau memotong nomor.
 */
function auditSeluruhParserNisn100(teks) {

  if (!teks) {
    return {
      jumlah: 0,
      jumlah10: 0,
      jumlah11: 0,
      jumlahDiLuar: 0,
      panjang: []
    };
  }

  const tanpaNomorUrut = teks.replace(
    /(?:^|\s)\d+\s*[.)]\s*/g,
    " "
  );

  const kelompok = tanpaNomorUrut.match(/\d+/g) || [];

  const panjang = kelompok.map(x => x.length);

  const jumlah10 =
    panjang.filter(x => x === 10).length;

  const jumlah11 =
    panjang.filter(x => x === 11).length;

  const jumlahDiLuar =
    panjang.filter(x => x !== 10 && x !== 11).length;

  return {
    jumlah: kelompok.length,
    jumlah10: jumlah10,
    jumlah11: jumlah11,
    jumlahDiLuar: jumlahDiLuar,
    panjang: panjang
  };

}
