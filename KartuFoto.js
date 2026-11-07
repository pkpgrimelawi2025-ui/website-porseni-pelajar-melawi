
/**
 * ============================================================
 * PORSENI PELAJAR MELAWI 2026
 * MODUL: KARTU FOTO
 * FILE: KartuFoto.gs
 * VERSI: 1.0.0
 * ============================================================
 *
 * Fungsi:
 * - Menguji akses file foto Google Drive.
 * - Memeriksa MIME type gambar.
 * - Memeriksa ukuran file.
 * - Tidak mengubah file atau izin akses Drive.
 *
 * Mode: BACA SAJA
 * ============================================================
 */


/**
 * Mengambil ID file dari tautan Google Drive.
 */
function kartuFotoAmbilIdFile(url) {
  const teks = String(url || "").trim();

  const hasil = teks.match(/[?&]id=([^&]+)/);

  return hasil ? hasil[1] : "";
}


/**
 * Menguji akses satu foto Google Drive.
 */
function kartuFotoUjiAksesFile(idFile) {
  const laporan = {
    idFile: idFile,
    status: "GAGAL"
  };

  try {
    if (!idFile) {
      throw new Error("ID file tidak tersedia.");
    }

    const file = DriveApp.getFileById(idFile);
    const blob = file.getBlob();

    const mimeType = blob.getContentType();
    const ukuranByte = blob.getBytes().length;

    const merupakanGambar =
      Boolean(mimeType) &&
      mimeType.startsWith("image/");

    laporan.namaFile = file.getName();
    laporan.mimeType = mimeType;
    laporan.ukuranByte = ukuranByte;
    laporan.fileDapatDibaca = ukuranByte > 0;
    laporan.merupakanGambar = merupakanGambar;

    laporan.status =
      laporan.fileDapatDibaca && merupakanGambar
        ? "BERHASIL"
        : "PERLU PEMERIKSAAN";

  } catch (error) {
    laporan.pesanKesalahan = error.message;
  }

  return laporan;
}


/**
 * UJI UTAMA FOTO BOLA VOLI
 *
 * Jalankan fungsi ini dari editor Apps Script.
 */
function ujiAksesFotoBolaVoli() {
  const urlFoto =
    "https://drive.google.com/open?id=1YFwuJXmURcolAH4LUBKC6lj8aLcrXWGl";

  const idFile = kartuFotoAmbilIdFile(urlFoto);

  const hasil = kartuFotoUjiAksesFile(idFile);

  console.log(
    "=== HASIL UJI AKSES FOTO BOLA VOLI ==="
  );

  console.log(JSON.stringify(hasil, null, 2));

  return hasil;
}

/**
 * UJI BATCH FOTO BOLA VOLI
 *
 * Memeriksa seluruh 74 foto yang sudah dikumpulkan.
 * Tidak mengubah file maupun izin Drive.
 * Log hanya berisi ringkasan, bukan data pribadi peserta.
 */

function ujiBatchFotoBolaVoli() {
  const daftarId = [
    "1YFwuJXmURcolAH4LUBKC6lj8aLcrXWGl",
    "1VI9fWX5xKYaMOgSUDD98XNdHr1L-xvXK",
    "1cRkgW10BYIULo76b-ZrgIln_Nwbb2ppz",
    "1kCJWRxrNglGt-HqL0aZ2lyUd_r56KtMy",
    "12hrOXhy7WEWKveBrk0qIrZhXXmG1dzJ0",
    "1uXPFLV2kP1xHR59_T-Pukg9-RJwh3MHf",
    "10odtxdtK8D3ont6EoGcCo5Ai9WozEFf9",
    "1UIp5vLkeYnkF03f5Bbs7Vh-2zIMwPSC0",
    "1c-vAhp06LXbPzsDsorEtExzpp2U5JZ_n",
    "18FtKRljaIKyHuGFnVACDgi_jOTt6ohIC",
    "10BRa-h8d_RWREcToNY-4-ExKNJPBqhn3",
    "1HmJSuH7GbZGonZQfu4ARUM93Z_gzJfHB",
    "1baHdko6v2ma4dRiavydmM-Usrix5yNmn",
    "18b04JubtDh9BhijU8CYTMeQqFOIsPhaI",
    "1H-Gx9ApCkvpodXDEj2lFX_4MBpkdD9p0",
    "168yaRFbWAdrmNvVElof8IhzvoNku8Q12",
    "1UYFbzcQMhjVy2086Udip_HSGe7aWHI-r",
    "17zroz1J2XOSHI44y_KDmeHS6AcFGC83S",
    "1tmUWzWlcLsZCCsnYk4RCorWr6zb9QP_1",
    "1VUMg0cne114suC2hv6vKjR2b62FubQoW",
    "1j7UIiU5fBEK4uwc48D5utMpf1beiY4mx",
    "1s7t0d1YAP2xIJDObRyKX8i5Zo6IArOS8",
    "1mQCvm5bcqQlQNlrGjGlMfnhs14HepnoI",
    "1rV0AU6zZWICVKFz08eAMYH2JaMSg6BTw",
    "1iAVHOsaD4xsBUyzn55Wt9p4-L-IuJprQ",
    "1Y-jsARrUjDaoKRjocZX18lRUUWc2ICLv",
    "1HAC8XJuIVd5mhon8cUrgbkdPlq7eSflo",
    "1GLcY9O7HkJLy5IwKmnOdlH1hHfqSb9xe",
    "1lLa3fmd-_JOcUu7KwQcHKQtegz8pCFyn",
    "1a9jLEdzdfC2XpGtxNdQpZS8c0NGVXw2G",
    "1GBOJPLn3gjJNgW5t1HxEqyfYNuavyZ2W",
    "1NVnQgaeHbsIaa1FT23Pac87nYk7J1J4s",
    "1Na2vcfLkkDar4jIZcnp_0V5AzoSwaAne",
    "1i4qrJL0JOM3yDmJzKluftCepur-dns-N",
    "1XdXTpr1lh8hsg70hGv-Qm4CyBPlHRZQk",
    "1H-tGT8N221z63ZQBncgIX6FZkI-NK3i9",
    "1qOg9yVtvFFpItSu70HlPt1XKEZf2jPV_",
    "1VI5K9GPc6SXxPgda7-JhX16d324zhDsf",
    "1A22fgkQPDYLOnmOgxi9SpMtE0Wv8H5Je",
    "1Xy0e475yMe0CbpsPUPj7FVt9gNUl_NKY",
    "1onX9aOCTKYjBkz0rwl2O21iUeGMdRvyh",
    "148aBdcd2289XcPKZedmVzeIVxjVKAurg",
    "1ZiAIQjNy_rVks_K0FeV9dKBnYA4-OH7I",
    "1Wmq-WnaVfmsSHwy4Q6j0Bj44T5gWOGBo",
    "1seSakIfnFeEd8lc2UIbEIP15g0Kyg-vz",
    "1I2OdTH2C7UwLSimRfcvtXf43bTT8XUiN",
    "1U658P7x0o1a7PL1sSAoGsNurJjP1qhrM",
    "1ZnFW4Za9hMfvr6YLipvoAtTtFyjO39iK",
    "1sw53hx4HEFxm5rCrDkjIHjjgBb12kAIq",
    "1Vk3KnK1CFzkzAd_XQajkIUqFXKFgHCjm",
    "1fsJqYknyyKsqHcEc5--Dd4vROQR-Xa1g",
    "1cZ9oRyiMUhHAc87qQR-8AH4otz_T833F",
    "1ooyoJ4a7Ctu9Jogs6hxyM4cJ1Jezu9SI",
    "1hRvcMjFfd7kbWnxzuhgHjh7VbyYA6B4Z",
    "1bFBZ-28R1dEPDv2g799MmqGBCBYvP4AG",
    "1ncERYX4Ct-0i64zfggbBZxk1ks90pNEy",
    "1wtxJCOf2swy3IbMxc_AeMka2brnR-Pae",
    "1FXYyVVawRsCX7ji_09v2tgY_WNhMvWvH",
    "1o8pRkxuBti129W9x1uwa_5oQGXv1xMzw",
    "125boiWq6E_zlPYZIswjh_1Mo5448GvOY",
    "1BhErQLuuKXRB3ncP9bqMUWqnuGaOZ0FG",
    "1KImDK6ZeHL0jNwzIJbyf_Vyspdmd785A",
    "1EpmYdvmqPEtmyjzYyW0qa4GUI2Wc1oQh",
    "1l0BoXUPLAKDc0FpziGEMSvsKei3Poj6x",
    "1NqQ4SE7ErrfQPEIpmjbVZgIdV5hBw2KG",
    "1_62TBbuRS_rbqe2471Mb5FrWREJNMkj8",
    "1kPif0PVCIdV6QPoPmW_yy9hn_rJsC5eP",
    "1EeXc_FEIHSh4A-lgHzofJ46eG3oU1j7H",
    "1Vc9sXNWhlh23xRFJ0dsjDFME3ZClMISA",
    "1ke9gCpNA0eimA6z3xDecjIMqrgRmzxlZ",
    "1iFci6JBFYIXOcX_1Zhhh6LPMTpvogaUj",
    "1WGsBwAM-ypT0YQGIohFiTAiteQfUiomy",
    "1OjTbT7vRHmYbGuiLcFyL1ctRDhjRVzrf",
    "1gMgXc5OZ4InSlCOGXygMudI6BuAE8mp6"
  ];

  const hasil = {
    totalDiuji: daftarId.length,
    berhasil: 0,
    gagal: 0,
    bukanGambar: 0,
    totalUkuranByte: 0
  };

  daftarId.forEach(id => {
    const laporan = kartuFotoUjiAksesFile(id);

    if (laporan.status === "BERHASIL") {
      hasil.berhasil++;
      hasil.totalUkuranByte += laporan.ukuranByte;
    } else {
      hasil.gagal++;
      if (
        laporan.status === "PERLU PEMERIKSAAN"
      ) {
        hasil.bukanGambar++;
      }
    }
  });

  console.log(
    "=== RINGKASAN UJI 74 FOTO BOLA VOLI ==="
  );

  console.log(JSON.stringify(hasil, null, 2));

  return hasil;
}

/**
 * ============================================================
 * PORSENI PELAJAR MELAWI 2026
 * MODUL: AUDIT FOTO SELURUH CABANG
 * FILE: KartuFoto.gs
 * VERSI: 1.1.0
 * ============================================================
 *
 * Fungsi:
 * - Membaca kolom foto dari 13 cabang selain Bola Voli.
 * - Mengambil ID file Google Drive dari tautan foto.
 * - Menguji akses dan jenis file.
 * - Membuat laporan per cabang.
 *
 * Keamanan:
 * - Hanya membaca Spreadsheet dan Drive.
 * - Tidak mengubah data sumber.
 * - Tidak mengubah izin berbagi Drive.
 * - Tidak menerbitkan foto ke website.
 *
 * Eksekusi: satu cabang setiap kali dijalankan.
 * ============================================================
 */


/**
 * Mengekstrak seluruh ID file Google Drive
 * dari satu sel Spreadsheet.
 */
function kartuFotoEkstrakSemuaId(nilai) {
  const teks = String(nilai || "").trim();

  if (!teks || !/drive\.google\.com/i.test(teks)) {
    return [];
  }

  const hasil = teks.match(/[-\w]{25,}/g) || [];

  return [...new Set(hasil)];
}



/**
 * Menjalankan audit untuk satu cabang.
 * Versi 1.2.0
 *
 * Perbaikan:
 * 1. Hanya mendeteksi header yang mengandung
 *    kata "foto" atau "photo".
 * 2. Tidak lagi mendeteksi kata "gambar"
 *    sebagai indikator tunggal.
 * 3. Tetap mempertahankan audit akses file.
 * 4. Tidak mengubah spreadsheet sumber.
 */
function kartuFotoAuditSatuCabang(sumber) {
  const spreadsheet = SpreadsheetApp.openById(sumber.id);

  const sheet = ambilSheetBerdasarkanGid(
    spreadsheet,
    sumber.gid
  );

  if (!sheet) {
    throw new Error(
      "Sheet tidak ditemukan untuk cabang: " + sumber.nama
    );
  }

  const jumlahBaris = sheet.getLastRow();
  const jumlahKolom = sheet.getLastColumn();

  if (jumlahBaris < 1 || jumlahKolom < 1) {
    throw new Error("Spreadsheet tidak memiliki data.");
  }

  const data = sheet.getRange(
    1,
    1,
    jumlahBaris,
    jumlahKolom
  ).getDisplayValues();

  const header = data[0];

  // Deteksi khusus kolom foto.
  const indeksKolomFoto = [];

  header.forEach((nama, indeks) => {
    const normal = normalisasiHeader(nama);

    if (
      normal.includes("foto") ||
      normal.includes("photo")
    ) {
      indeksKolomFoto.push({
        indeks: indeks,
        nama: String(nama || "").trim()
      });
    }
  });

  const laporan = {
    cabang: sumber.nama,
    status: "DIPROSES",
    versiAudit: "1.2.0",
    totalBarisData: Math.max(0, data.length - 1),
    kolomFotoDitemukan: indeksKolomFoto.length,
    namaKolomFoto: indeksKolomFoto.map(item => item.nama),
    selFotoTerisi: 0,
    totalTautanFoto: 0,
    totalFileUnik: 0,
    berhasil: 0,
    gagal: 0,
    bukanGambar: 0,
    totalUkuranByte: 0,
    detailKesalahan: []
  };

  if (indeksKolomFoto.length === 0) {
    laporan.status = "KOLOM FOTO TIDAK DITEMUKAN";
    return laporan;
  }

  const daftarFile = new Set();

  // Membaca seluruh baris respons.
  for (let baris = 1; baris < data.length; baris++) {
    for (const kolom of indeksKolomFoto) {
      const nilai = data[baris][kolom.indeks];

      if (!String(nilai || "").trim()) {
        continue;
      }

      laporan.selFotoTerisi++;

      const daftarId = kartuFotoEkstrakSemuaId(nilai);

      laporan.totalTautanFoto += daftarId.length;

      daftarId.forEach(id => daftarFile.add(id));
    }
  }

  laporan.totalFileUnik = daftarFile.size;

  // Menguji setiap file unik.
  for (const id of daftarFile) {
    const hasil = kartuFotoUjiAksesFile(id);

    if (hasil.status === "BERHASIL") {
      laporan.berhasil++;
      laporan.totalUkuranByte += hasil.ukuranByte || 0;

    } else if (hasil.merupakanGambar === false) {
      laporan.bukanGambar++;

    } else {
      laporan.gagal++;

      laporan.detailKesalahan.push({
        idFile: id,
        pesan: hasil.pesanKesalahan || hasil.status
      });
    }
  }

  laporan.status =
    laporan.gagal === 0 && laporan.bukanGambar === 0
      ? "LULUS"
      : "PERLU PEMERIKSAAN";

  return laporan;
}


/**
 * AUDIT BERTAHAP 13 CABANG
 *
 * Setiap eksekusi memeriksa satu cabang.
 * Bola Voli dilewati karena sudah lulus 74/74.
 *
 * Jalankan fungsi ini berulang kali sampai selesai.
 */
function ujiAuditFotoCabangBerikutnya() {
  const properti = PropertiesService.getScriptProperties();

  const sumber = KONFIGURASI.sumber;

  const indeksAwal = sumber.findIndex(
    item => item.kode === "SEPAK_BOLA_MINI"
  );

  if (indeksAwal === -1) {
    throw new Error("Konfigurasi cabang Sepak Bola Mini tidak ditemukan.");
  }

  let indeksBerikutnya = Number(
    properti.getProperty("KARTU_FOTO_AUDIT_INDEX")
  );

  if (!Number.isInteger(indeksBerikutnya) || indeksBerikutnya < indeksAwal) {
    indeksBerikutnya = indeksAwal;
  }

  if (indeksBerikutnya >= sumber.length) {
    console.log("AUDIT 13 CABANG TELAH SELESAI.");
    console.log("Gunakan fungsi reset jika ingin mengulang audit.");
    return;
  }

  const cabang = sumber[indeksBerikutnya];

  console.log("====================================");
  console.log("MULAI AUDIT: " + cabang.nama);
  console.log("====================================");

  try {
    const laporan = kartuFotoAuditSatuCabang(cabang);

    console.log(
      "HASIL AUDIT " + cabang.nama
    );

    console.log(JSON.stringify(laporan, null, 2));

  } catch (error) {
    console.log(
      "AUDIT GAGAL: " + cabang.nama
    );

    console.log(error.message);
  }

  // Lanjut ke cabang berikutnya pada eksekusi selanjutnya.
  properti.setProperty(
    "KARTU_FOTO_AUDIT_INDEX",
    String(indeksBerikutnya + 1)
  );

  console.log("Eksekusi cabang ini selesai.");
}


/**
 * RESET AUDIT
 *
 * Gunakan hanya jika ingin mengulang dari Sepak Bola Mini.
 */
function resetAuditFotoSeluruhCabang() {
  PropertiesService
    .getScriptProperties()
    .deleteProperty("KARTU_FOTO_AUDIT_INDEX");

  console.log(
    "Posisi audit direset. Audit berikutnya dimulai dari Sepak Bola Mini."
  );
}

/**
 * Uji ulang khusus Gambar Bercerita.
 * Tidak mengubah indeks audit otomatis.
 */
function ujiUlangAuditGambarBercerita() {
  const sumber = KONFIGURASI.sumber.find(
    item => item.nama === "Gambar Bercerita"
  );

  if (!sumber) {
    throw new Error(
      "Konfigurasi Gambar Bercerita tidak ditemukan."
    );
  }

  Logger.log("====================================");
  Logger.log("UJI ULANG: GAMBAR BERCERITA");
  Logger.log("====================================");

  const hasil = kartuFotoAuditSatuCabang(sumber);

  Logger.log("HASIL UJI ULANG");
  Logger.log(JSON.stringify(hasil, null, 2));

  return hasil;
}

/**
 * ============================================================
 * PORSENI PELAJAR MELAWI 2026
 * AUDIT PEMETAAN FOTO PER RESPONS
 * VERSI: 1.0.0
 * ============================================================
 *
 * Tujuan:
 * - Memeriksa hubungan baris respons dengan foto.
 * - Menghitung peserta pada setiap baris.
 * - Menghitung file foto pada setiap baris.
 * - Mendeteksi foto kosong dan tautan yang tidak terbaca.
 *
 * Keamanan:
 * - Hanya membaca Spreadsheet dan Google Drive.
 * - Tidak mengubah sumber.
 * - Tidak mengubah izin berbagi.
 * - Tidak mencatat nama atau NISN ke log.
 * ============================================================
 */

function auditPemetaanFotoPerRespons() {

  const aturanPemisahan = {
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
  };

  const hasilPerCabang = [];

  let totalRespons = 0;
  let totalPeserta = 0;
  let totalFileFotoUnik = 0;
  let totalResponsDenganFoto = 0;
  let totalResponsTanpaFoto = 0;
  let totalSelFotoTidakTerbaca = 0;
  let totalResponsFotoPerluPemeriksaan = 0;

  KONFIGURASI.sumber.forEach(sumber => {

    try {

      const spreadsheet = SpreadsheetApp.openById(
        sumber.id
      );

      const sheet = ambilSheetBerdasarkanGid(
        spreadsheet,
        sumber.gid
      );

      const data = sheet.getDataRange().getDisplayValues();

      if (!data.length || !data[0].length) {
        throw new Error("Sumber tidak memiliki data.");
      }

      const header = data[0].map(
        nilai => String(nilai || "").trim()
      );

      const peta = petakanHeader(header);

      if (peta.nama < 0) {
        throw new Error("Kolom nama tidak ditemukan.");
      }

      // Deteksi kolom foto berdasarkan header.
      const kolomFoto = [];

      header.forEach((nama, indeks) => {

        const normal = normalisasiHeader(nama);

        if (
          normal.includes("foto") ||
          normal.includes("photo")
        ) {
          kolomFoto.push({
            indeks: indeks,
            nama: nama
          });
        }

      });

      if (!kolomFoto.length) {
        throw new Error("Kolom foto tidak ditemukan.");
      }

      const ringkasan = {
        kode: sumber.kode,
        cabang: sumber.nama,
        status: "BERHASIL",
        jumlahKolomFoto: kolomFoto.length,
        namaKolomFoto: kolomFoto.map(
          item => item.nama
        ),

        responsDiperiksa: 0,
        totalPeserta: 0,

        responsDenganFoto: 0,
        responsTanpaFoto: 0,

        totalSelFotoTerisi: 0,
        totalTautanFoto: 0,
        totalFileFotoUnik: 0,

        selFotoTidakTerbaca: 0,

        responsSatuPesertaSatuFoto: 0,
        responsBereguDenganFoto: 0,
        responsBereguTanpaFoto: 0,

        responsFotoPerluPemeriksaan: 0,

        detailPerluPemeriksaan: []
      };

      const semuaFileCabang = new Set();

      const aturanCabang =
        aturanPemisahan[sumber.kode] || {};

      for (let i = 1; i < data.length; i++) {

        const baris = data[i];

        const nomorBaris = i + 1;

        const namaAsli = String(
          baris[peta.nama] || ""
        ).trim();

        if (!namaAsli) {
          continue;
        }

        const polaNama =
          aturanCabang[nomorBaris] || null;

        const namaPeserta = pisahkanNamaPeserta(
          namaAsli,
          polaNama
        );

        const jumlahPeserta = namaPeserta.length;

        if (!jumlahPeserta) {
          continue;
        }

        ringkasan.responsDiperiksa++;
        ringkasan.totalPeserta += jumlahPeserta;

        const filePadaBaris = new Set();

        let selFotoTerisiPadaBaris = 0;
        let tautanFotoPadaBaris = 0;
        let selTidakTerbacaPadaBaris = 0;

        kolomFoto.forEach(kolom => {

          const nilai = String(
            baris[kolom.indeks] || ""
          ).trim();

          if (!nilai) {
            return;
          }

          selFotoTerisiPadaBaris++;

          const daftarId = kartuFotoEkstrakSemuaId(
            nilai
          );

          if (!daftarId.length) {
            selTidakTerbacaPadaBaris++;
            return;
          }

          tautanFotoPadaBaris += daftarId.length;

          daftarId.forEach(id => {
            filePadaBaris.add(id);
            semuaFileCabang.add(id);
          });

        });

        ringkasan.totalSelFotoTerisi +=
          selFotoTerisiPadaBaris;

        ringkasan.totalTautanFoto +=
          tautanFotoPadaBaris;

        ringkasan.selFotoTidakTerbaca +=
          selTidakTerbacaPadaBaris;

        const jumlahFoto = filePadaBaris.size;

        if (jumlahFoto > 0) {
          ringkasan.responsDenganFoto++;
        } else {
          ringkasan.responsTanpaFoto++;
        }

        if (
          jumlahPeserta === 1 &&
          jumlahFoto === 1
        ) {
          ringkasan.responsSatuPesertaSatuFoto++;
        }

        if (
          jumlahPeserta > 1 &&
          jumlahFoto > 0
        ) {
          ringkasan.responsBereguDenganFoto++;
        }

        if (
          jumlahPeserta > 1 &&
          jumlahFoto === 0
        ) {
          ringkasan.responsBereguTanpaFoto++;
        }

        let perluPemeriksaan = false;
        let alasan = [];

        if (jumlahFoto === 0) {
          perluPemeriksaan = true;
          alasan.push("FOTO TIDAK DITEMUKAN");
        }

        if (selTidakTerbacaPadaBaris > 0) {
          perluPemeriksaan = true;
          alasan.push("TAUTAN FOTO TIDAK TERBACA");
        }

        if (
          jumlahPeserta === 1 &&
          jumlahFoto > 1
        ) {
          perluPemeriksaan = true;
          alasan.push("LEBIH DARI SATU FOTO");
        }

        if (perluPemeriksaan) {

          ringkasan.responsFotoPerluPemeriksaan++;

          ringkasan.detailPerluPemeriksaan.push({
            barisSumber: nomorBaris,
            jumlahPeserta: jumlahPeserta,
            jumlahFotoUnik: jumlahFoto,
            jumlahSelFotoTerisi:
              selFotoTerisiPadaBaris,
            jumlahSelTidakTerbaca:
              selTidakTerbacaPadaBaris,
            alasan: alasan
          });

        }

      }

      ringkasan.totalFileFotoUnik =
        semuaFileCabang.size;

      ringkasan.statusAudit =
        ringkasan.responsFotoPerluPemeriksaan === 0
          ? "TIDAK ADA ANOMALI STRUKTUR"
          : "PERLU PEMERIKSAAN";

      totalRespons += ringkasan.responsDiperiksa;
      totalPeserta += ringkasan.totalPeserta;

      totalFileFotoUnik +=
        ringkasan.totalFileFotoUnik;

      totalResponsDenganFoto +=
        ringkasan.responsDenganFoto;

      totalResponsTanpaFoto +=
        ringkasan.responsTanpaFoto;

      totalSelFotoTidakTerbaca +=
        ringkasan.selFotoTidakTerbaca;

      totalResponsFotoPerluPemeriksaan +=
        ringkasan.responsFotoPerluPemeriksaan;

      hasilPerCabang.push(ringkasan);

    } catch (error) {

      hasilPerCabang.push({
        kode: sumber.kode,
        cabang: sumber.nama,
        status: "GAGAL",
        pesan: error.message
      });

    }

  });

  const sumberBerhasil = hasilPerCabang.filter(
    item => item.status === "BERHASIL"
  ).length;

  const sumberGagal = hasilPerCabang.filter(
    item => item.status === "GAGAL"
  ).length;

  const hasilAkhir = {

    judul: "Audit Pemetaan Foto Per Respons PORSENI",

    versi: "1.0.0",

    waktuAudit: new Date().toISOString(),

    jumlahSumber: KONFIGURASI.sumber.length,
    sumberBerhasil: sumberBerhasil,
    sumberGagal: sumberGagal,

    totalRespons: totalRespons,
    totalPeserta: totalPeserta,

    totalFileFotoUnik: totalFileFotoUnik,

    totalResponsDenganFoto:
      totalResponsDenganFoto,

    totalResponsTanpaFoto:
      totalResponsTanpaFoto,

    totalSelFotoTidakTerbaca:
      totalSelFotoTidakTerbaca,

    totalResponsFotoPerluPemeriksaan:
      totalResponsFotoPerluPemeriksaan,

    statusAudit:
      sumberGagal === 0 &&
      totalResponsFotoPerluPemeriksaan === 0
        ? "LOLOS AUDIT STRUKTUR AWAL"
        : "PERLU PEMERIKSAAN LANJUTAN",

    hasilPerCabang: hasilPerCabang

  };

  console.log(
    JSON.stringify(hasilAkhir, null, 2)
  );

  return hasilAkhir;

}

/**
 * ============================================================
 * PORSENI PELAJAR MELAWI 2026
 * MODUL: AUDIT PEMETAAN FOTO PER RESPONS
 * VERSI: 1.1.0
 * ============================================================
 *
 * Tujuan:
 * 1. Memeriksa penggunaan ulang ID foto antarrespons.
 * 2. Memetakan foto ke kode cabang dan timestamp respons.
 * 3. Memeriksa timestamp kosong/tidak valid.
 * 4. Mendeteksi foto yang muncul berulang dalam respons sama.
 *
 * Keamanan:
 * - Hanya membaca Google Sheets.
 * - Tidak mengubah data sumber.
 * - Tidak mengubah izin Google Drive.
 * - Tidak mencatat nama, NISN, atau ID file ke log.
 * ============================================================
 */

function auditDuplikasiFotoAntarRespons() {
  const sumberSemua = KONFIGURASI.sumber;

  const indeksFoto = new Map();

  const hasil = {
    judul: "Audit Duplikasi Foto Antarrespons PORSENI",
    versi: "1.1.0",
    jumlahSumber: sumberSemua.length,
    sumberBerhasil: 0,
    sumberGagal: 0,
    totalRespons: 0,
    totalResponsDenganFoto: 0,
    totalFileFotoUnik: 0,
    totalFotoBerulangDalamRespons: 0,
    totalFileDipakaiLintasRespons: 0,
    totalResponsTerdampakDuplikasi: 0,
    totalTimestampKosong: 0,
    totalTimestampTidakValid: 0,
    detailDuplikasi: [],
    hasilPerCabang: [],
    kesalahan: []
  };

  sumberSemua.forEach(sumber => {
    try {
      const spreadsheet = SpreadsheetApp.openById(sumber.id);

      const sheet = ambilSheetBerdasarkanGid(
        spreadsheet,
        sumber.gid
      );

      if (!sheet) {
        throw new Error("Sheet sumber tidak ditemukan.");
      }

      const rentang = sheet.getDataRange();
      const data = rentang.getDisplayValues();
      const nilaiAsli = rentang.getValues();

      if (!data.length || !data[0].length) {
        throw new Error("Sumber tidak memiliki data.");
      }

      const header = data[0].map(normalisasiHeader);

      const indeksTimestamp = header.findIndex(
        item => item === "timestamp"
      );

      if (indeksTimestamp === -1) {
        throw new Error("Kolom Timestamp tidak ditemukan.");
      }

      const kolomFoto = [];

      header.forEach((nama, indeks) => {
        if (
          nama.includes("foto") ||
          nama.includes("photo")
        ) {
          kolomFoto.push(indeks);
        }
      });

      if (!kolomFoto.length) {
        throw new Error("Kolom foto tidak ditemukan.");
      }

      const laporanCabang = {
        kode: sumber.kode,
        cabang: sumber.nama,
        status: "BERHASIL",
        responsDiperiksa: 0,
        responsDenganFoto: 0,
        fileFotoDitemukan: 0,
        fotoBerulangDalamRespons: 0,
        timestampKosong: 0,
        timestampTidakValid: 0
      };

      for (let i = 1; i < data.length; i++) {
        const baris = data[i];

        const barisTerisi = baris.some(
          nilai => String(nilai || "").trim() !== ""
        );

        if (!barisTerisi) continue;

        laporanCabang.responsDiperiksa++;
        hasil.totalRespons++;

        const timestamp = nilaiAsli[i][indeksTimestamp];

        let kunciRespons;

        if (
          timestamp instanceof Date &&
          !isNaN(timestamp.getTime())
        ) {
          kunciRespons =
            sumber.kode + ":" + timestamp.getTime();

        } else if (
          timestamp === "" ||
          timestamp === null ||
          typeof timestamp === "undefined"
        ) {
          laporanCabang.timestampKosong++;
          hasil.totalTimestampKosong++;

          // Fallback hanya untuk identifikasi audit.
          kunciRespons =
            sumber.kode + ":BARIS:" + (i + 1);

        } else {
          laporanCabang.timestampTidakValid++;
          hasil.totalTimestampTidakValid++;

          kunciRespons =
            sumber.kode + ":BARIS:" + (i + 1);
        }

        const fileDalamRespons = new Set();

        kolomFoto.forEach(indeks => {
          const nilaiFoto = baris[indeks];

          if (!String(nilaiFoto || "").trim()) return;

          const daftarId = kartuFotoEkstrakSemuaId(
            nilaiFoto
          );

          daftarId.forEach(id => {
            fileDalamRespons.add(id);
          });
        });

        if (fileDalamRespons.size > 0) {
          laporanCabang.responsDenganFoto++;
          hasil.totalResponsDenganFoto++;
        }

        const daftarFoto = [...fileDalamRespons];

        laporanCabang.fileFotoDitemukan +=
          daftarFoto.length;

        daftarFoto.forEach(id => {
          if (!indeksFoto.has(id)) {
            indeksFoto.set(id, new Map());
          }

          const daftarRespons = indeksFoto.get(id);

          if (daftarRespons.has(kunciRespons)) {
            laporanCabang.fotoBerulangDalamRespons++;
            hasil.totalFotoBerulangDalamRespons++;
          } else {
            daftarRespons.set(kunciRespons, {
              kode: sumber.kode,
              cabang: sumber.nama,
              nomorBaris: i + 1
            });
          }
        });
      }

      hasil.sumberBerhasil++;
      hasil.hasilPerCabang.push(laporanCabang);

    } catch (error) {
      hasil.sumberGagal++;

      hasil.kesalahan.push({
        kode: sumber.kode,
        cabang: sumber.nama,
        pesan: error.message
      });
    }
  });

  hasil.totalFileFotoUnik = indeksFoto.size;

  const responsTerdampak = new Set();

  indeksFoto.forEach(daftarRespons => {
    if (daftarRespons.size > 1) {
      hasil.totalFileDipakaiLintasRespons++;

      daftarRespons.forEach(info => {
        responsTerdampak.add(
          info.kode + ":" + info.nomorBaris
        );
      });

      // Batasi detail agar log tidak terlalu besar.
      if (hasil.detailDuplikasi.length < 50) {
        hasil.detailDuplikasi.push({
          jumlahResponsMenggunakanFoto: daftarRespons.size,
          lokasiRespons: [...daftarRespons.values()].map(
            info => ({
              cabang: info.cabang,
              nomorBaris: info.nomorBaris
            })
          )
        });
      }
    }
  });

  hasil.totalResponsTerdampakDuplikasi =
    responsTerdampak.size;

  hasil.statusAudit =
    hasil.sumberGagal === 0 &&
    hasil.totalTimestampKosong === 0 &&
    hasil.totalTimestampTidakValid === 0 &&
    hasil.totalFileDipakaiLintasRespons === 0
      ? "LOLOS AUDIT DUPLIKASI FOTO"
      : "PERLU PEMERIKSAAN";

  console.log(
    "=== HASIL AUDIT DUPLIKASI FOTO ANTARRESPONS ==="
  );

  console.log(JSON.stringify(hasil, null, 2));

  return hasil;
}
/**
 * ============================================================
 * AUDIT RELASI PESERTA - NISN - FOTO
 * PORSENI PELAJAR MELAWI 2026
 * VERSI 1.0.0
 *
 * Mode: BACA SAJA
 * Tidak mengubah Spreadsheet atau Google Drive.
 * Tidak mencetak nama, NISN, atau ID file ke log.
 * ============================================================
 */

function auditRelasiPesertaNisnFoto() {
  const aturanPemisahan = {
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
  };

  const ringkasan = {
    judul: "Audit Relasi Peserta - NISN - Foto",
    versi: "1.0.0",
    jumlahSumber: KONFIGURASI.sumber.length,
    sumberBerhasil: 0,
    sumberGagal: 0,
    totalRespons: 0,
    totalPeserta: 0,
    totalNisn: 0,
    totalResponsDenganFoto: 0,
    totalResponsTanpaFoto: 0,
    totalResponsNamaNisnSesuai: 0,
    totalResponsNamaNisnTidakSesuai: 0,
    totalResponsTimestampValid: 0,
    totalResponsTimestampTidakValid: 0,
    totalResponsFotoValid: 0,
    totalResponsFotoTidakValid: 0,
    totalResponsBeregu: 0,
    totalAnggotaBeregu: 0,
    totalRelasiPesertaFoto: 0,
    kesalahan: [],
    hasilPerCabang: []
  };

  function cariKolomTepat(header, nama) {
    const target = normalisasiHeader(nama);
    const indeks = [];

    header.forEach((item, i) => {
      if (normalisasiHeader(item) === target) {
        indeks.push(i);
      }
    });

    return indeks.length === 1 ? indeks[0] : -1;
  }

  function pecahNama(nilai, pola) {
    const teks = String(nilai || "").trim();
    if (!teks) return [];

    return (pola ? teks.split(pola) : [teks])
      .map(x => x.replace(/^\s*\d+\s*\.\s*/, "").trim())
      .filter(Boolean);
  }

  function hitungNisn(nilai) {
    const teks = String(nilai || "").trim();
    if (!teks) return 0;

    // Hilangkan nomor urut seperti "1. " dan "2. "
    const tanpaNomorUrut = teks.replace(
      /(?:^|\s)\d+\s*\.\s*/g,
      " "
    );

    return (tanpaNomorUrut.match(/\d+/g) || []).length;
  }

  function ambilTimestamp(nilai) {
    const teks = String(nilai || "").trim();
    if (!teks) return false;

    const tanggal = new Date(teks);
    return !isNaN(tanggal.getTime());
  }

  KONFIGURASI.sumber.forEach(sumber => {
    const hasil = {
      kode: sumber.kode,
      cabang: sumber.nama,
      status: "DIPROSES",
      jumlahRespons: 0,
      jumlahPeserta: 0,
      jumlahNisn: 0,
      responsNamaNisnSesuai: 0,
      responsNamaNisnTidakSesuai: 0,
      responsDenganFoto: 0,
      responsTanpaFoto: 0,
      responsTimestampValid: 0,
      responsTimestampTidakValid: 0,
      responsFotoValid: 0,
      responsFotoTidakValid: 0,
      responsBeregu: 0,
      anggotaBeregu: 0,
      relasiPesertaFoto: 0
    };

    try {
      const ss = SpreadsheetApp.openById(sumber.id);
      const sheet = ambilSheetBerdasarkanGid(ss, sumber.gid);
      const data = sheet.getDataRange().getDisplayValues();

      if (data.length < 2) {
        throw new Error("Tidak ada respons untuk diperiksa.");
      }

      const header = data[0];

      const kolomNama = cariKolomTepat(header, "Nama Lengkap");
      const kolomNisn = cariKolomTepat(header, "NISN");
      const kolomTimestamp = cariKolomTepat(header, "Timestamp");

      const kolomFoto = [];

      header.forEach((nama, i) => {
        const normal = normalisasiHeader(nama);
        if (normal.includes("foto") || normal.includes("photo")) {
          kolomFoto.push(i);
        }
      });

      if (
        kolomNama < 0 ||
        kolomNisn < 0 ||
        kolomTimestamp < 0 ||
        kolomFoto.length !== 1
      ) {
        throw new Error(
          "Pemetaan kolom nama, NISN, timestamp, atau foto tidak unik."
        );
      }

      const aturanCabang = aturanPemisahan[sumber.kode] || {};

      for (let i = 1; i < data.length; i++) {
        const baris = data[i];

        if (!baris.some(x => String(x || "").trim())) continue;

        hasil.jumlahRespons++;

        const nomorBaris = i + 1;
        const nama = pecahNama(
          baris[kolomNama],
          aturanCabang[nomorBaris] || null
        );

        const jumlahNisn = hitungNisn(baris[kolomNisn]);

        hasil.jumlahPeserta += nama.length;
        hasil.jumlahNisn += jumlahNisn;

        if (nama.length > 1) {
          hasil.responsBeregu++;
          hasil.anggotaBeregu += nama.length;
        }

        if (nama.length > 0 && nama.length === jumlahNisn) {
          hasil.responsNamaNisnSesuai++;
        } else {
          hasil.responsNamaNisnTidakSesuai++;
        }

        const timestampValid = ambilTimestamp(baris[kolomTimestamp]);

        if (timestampValid) {
          hasil.responsTimestampValid++;
        } else {
          hasil.responsTimestampTidakValid++;
        }

        const idFoto = kartuFotoEkstrakSemuaId(
          baris[kolomFoto[0]]
        );

        if (idFoto.length > 0) {
          hasil.responsDenganFoto++;

          // Satu respons harus memiliki satu referensi foto.
          if (idFoto.length === 1) {
            hasil.responsFotoValid++;

            // Satu foto dihubungkan ke seluruh anggota respons.
            hasil.relasiPesertaFoto += nama.length;
          } else {
            hasil.responsFotoTidakValid++;
          }
        } else {
          hasil.responsTanpaFoto++;
          hasil.responsFotoTidakValid++;
        }
      }

      hasil.status = "BERHASIL";
      ringkasan.sumberBerhasil++;

      ringkasan.totalRespons += hasil.jumlahRespons;
      ringkasan.totalPeserta += hasil.jumlahPeserta;
      ringkasan.totalNisn += hasil.jumlahNisn;
      ringkasan.totalResponsDenganFoto += hasil.responsDenganFoto;
      ringkasan.totalResponsTanpaFoto += hasil.responsTanpaFoto;
      ringkasan.totalResponsNamaNisnSesuai += hasil.responsNamaNisnSesuai;
      ringkasan.totalResponsNamaNisnTidakSesuai += hasil.responsNamaNisnTidakSesuai;
      ringkasan.totalResponsTimestampValid += hasil.responsTimestampValid;
      ringkasan.totalResponsTimestampTidakValid += hasil.responsTimestampTidakValid;
      ringkasan.totalResponsFotoValid += hasil.responsFotoValid;
      ringkasan.totalResponsFotoTidakValid += hasil.responsFotoTidakValid;
      ringkasan.totalResponsBeregu += hasil.responsBeregu;
      ringkasan.totalAnggotaBeregu += hasil.anggotaBeregu;
      ringkasan.totalRelasiPesertaFoto += hasil.relasiPesertaFoto;

    } catch (error) {
      hasil.status = "GAGAL";
      ringkasan.sumberGagal++;

      ringkasan.kesalahan.push({
        kode: sumber.kode,
        pesan: error.message
      });
    }

    ringkasan.hasilPerCabang.push(hasil);
  });

  ringkasan.statusAudit =
    ringkasan.sumberGagal === 0 &&
    ringkasan.totalResponsNamaNisnTidakSesuai === 0 &&
    ringkasan.totalResponsTanpaFoto === 0 &&
    ringkasan.totalResponsTimestampTidakValid === 0 &&
    ringkasan.totalResponsFotoTidakValid === 0 &&
    ringkasan.totalPeserta === ringkasan.totalNisn &&
    ringkasan.totalPeserta === ringkasan.totalRelasiPesertaFoto
      ? "LOLOS AUDIT STRUKTUR RELASI"
      : "PERLU PEMERIKSAAN";

  console.log(JSON.stringify(ringkasan, null, 2));
  return ringkasan;
}

/**
 * ============================================================
 * AUDIT ID RESPONS DAN ID PESERTA
 * PORSENI PELAJAR MELAWI 2026
 * VERSI 1.0.0
 *
 * Mode: BACA SAJA
 * ID dibuat sementara untuk pengujian.
 * Tidak mengubah Spreadsheet atau Drive.
 * Tidak mencatat nama dan NISN ke log.
 * ============================================================
 */

function auditIdResponsDanPeserta() {
  const aturanPemisahan = {
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
  };

  const ringkasan = {
    judul: "Audit ID Respons dan ID Peserta",
    versi: "1.0.0",
    jumlahSumber: KONFIGURASI.sumber.length,
    sumberBerhasil: 0,
    sumberGagal: 0,

    totalRespons: 0,
    totalPeserta: 0,

    totalTimestampValid: 0,
    totalTimestampTidakValid: 0,

    totalIdResponsDihasilkan: 0,
    totalIdPesertaDihasilkan: 0,

    totalTimestampDuplikatDalamCabang: 0,
    totalIdResponsDuplikat: 0,
    totalIdPesertaDuplikat: 0,

    totalResponsBeregu: 0,
    totalAnggotaBeregu: 0,

    kesalahan: [],
    hasilPerCabang: []
  };

  const semuaIdRespons = new Set();
  const semuaIdPeserta = new Set();

  function cariKolomTepat(header, nama) {
    const target = normalisasiHeader(nama);
    const indeks = [];

    header.forEach((item, i) => {
      if (normalisasiHeader(item) === target) {
        indeks.push(i);
      }
    });

    return indeks.length === 1 ? indeks[0] : -1;
  }

  function pecahNama(nilai, pola) {
    const teks = String(nilai || "").trim();

    if (!teks) return [];

    return (pola ? teks.split(pola) : [teks])
      .map(nama =>
        nama.replace(/^\s*\d+\s*\.\s*/, "").trim()
      )
      .filter(Boolean);
  }

  function konversiTimestamp(nilai) {
    if (
      Object.prototype.toString.call(nilai) ===
      "[object Date]"
    ) {
      return isNaN(nilai.getTime())
        ? null
        : nilai.getTime();
    }

    if (nilai === null || nilai === undefined || nilai === "") {
      return null;
    }

    const tanggal = new Date(nilai);

    return isNaN(tanggal.getTime())
      ? null
      : tanggal.getTime();
  }

  KONFIGURASI.sumber.forEach(sumber => {
    const hasil = {
      kode: sumber.kode,
      cabang: sumber.nama,
      status: "DIPROSES",

      jumlahRespons: 0,
      jumlahPeserta: 0,

      timestampValid: 0,
      timestampTidakValid: 0,

      idResponsDihasilkan: 0,
      idPesertaDihasilkan: 0,

      timestampDuplikat: 0,
      idResponsDuplikat: 0,
      idPesertaDuplikat: 0,

      responsBeregu: 0,
      anggotaBeregu: 0
    };

    try {
      const ss = SpreadsheetApp.openById(sumber.id);
      const sheet = ambilSheetBerdasarkanGid(
        ss,
        sumber.gid
      );

      const rentang = sheet.getDataRange();

      const dataDisplay = rentang.getDisplayValues();
      const dataAsli = rentang.getValues();

      if (dataDisplay.length < 2) {
        throw new Error("Tidak ada respons untuk diperiksa.");
      }

      const header = dataDisplay[0];

      const kolomNama = cariKolomTepat(
        header,
        "Nama Lengkap"
      );

      const kolomTimestamp = cariKolomTepat(
        header,
        "Timestamp"
      );

      if (kolomNama < 0 || kolomTimestamp < 0) {
        throw new Error(
          "Kolom Nama Lengkap atau Timestamp tidak ditemukan secara unik."
        );
      }

      const aturanCabang =
        aturanPemisahan[sumber.kode] || {};

      const timestampDalamCabang = new Set();

      for (let i = 1; i < dataDisplay.length; i++) {
        const barisDisplay = dataDisplay[i];
        const barisAsli = dataAsli[i];

        if (!barisDisplay.some(
          nilai => String(nilai || "").trim()
        )) {
          continue;
        }

        hasil.jumlahRespons++;

        const nomorBaris = i + 1;

        const timestampMs = konversiTimestamp(
          barisAsli[kolomTimestamp]
        );

        if (timestampMs === null) {
          hasil.timestampTidakValid++;
          continue;
        }

        hasil.timestampValid++;

        // Format ID respons berdasarkan kode cabang dan timestamp.
        const idRespons =
          sumber.kode + ":" + timestampMs;

        hasil.idResponsDihasilkan++;

        // Periksa timestamp ganda di cabang yang sama.
        if (timestampDalamCabang.has(timestampMs)) {
          hasil.timestampDuplikat++;
          ringkasan.totalTimestampDuplikatDalamCabang++;
        } else {
          timestampDalamCabang.add(timestampMs);
        }

        // Periksa ID respons ganda.
        if (semuaIdRespons.has(idRespons)) {
          hasil.idResponsDuplikat++;
          ringkasan.totalIdResponsDuplikat++;
        } else {
          semuaIdRespons.add(idRespons);
        }

        const pola =
          aturanCabang[nomorBaris] || null;

        const namaPeserta = pecahNama(
          barisDisplay[kolomNama],
          pola
        );

        if (namaPeserta.length > 1) {
          hasil.responsBeregu++;
          hasil.anggotaBeregu += namaPeserta.length;
        }

        hasil.jumlahPeserta += namaPeserta.length;

        // Setiap anggota mendapat ID individual.
        namaPeserta.forEach((nama, indeks) => {
          const nomorUrut = String(indeks + 1)
            .padStart(2, "0");

          const idPeserta =
            idRespons + ":" + nomorUrut;

          hasil.idPesertaDihasilkan++;

          if (semuaIdPeserta.has(idPeserta)) {
            hasil.idPesertaDuplikat++;
            ringkasan.totalIdPesertaDuplikat++;
          } else {
            semuaIdPeserta.add(idPeserta);
          }
        });
      }

      hasil.status = "BERHASIL";
      ringkasan.sumberBerhasil++;

      ringkasan.totalRespons += hasil.jumlahRespons;
      ringkasan.totalPeserta += hasil.jumlahPeserta;

      ringkasan.totalTimestampValid += hasil.timestampValid;
      ringkasan.totalTimestampTidakValid += hasil.timestampTidakValid;

      ringkasan.totalIdResponsDihasilkan +=
        hasil.idResponsDihasilkan;

      ringkasan.totalIdPesertaDihasilkan +=
        hasil.idPesertaDihasilkan;

      ringkasan.totalResponsBeregu += hasil.responsBeregu;
      ringkasan.totalAnggotaBeregu += hasil.anggotaBeregu;

    } catch (error) {
      hasil.status = "GAGAL";
      ringkasan.sumberGagal++;

      ringkasan.kesalahan.push({
        kode: sumber.kode,
        pesan: error.message
      });
    }

    ringkasan.hasilPerCabang.push(hasil);
  });

  ringkasan.statusAudit =
    ringkasan.sumberGagal === 0 &&
    ringkasan.totalTimestampTidakValid === 0 &&
    ringkasan.totalTimestampDuplikatDalamCabang === 0 &&
    ringkasan.totalIdResponsDuplikat === 0 &&
    ringkasan.totalIdPesertaDuplikat === 0 &&
    ringkasan.totalRespons ===
      ringkasan.totalIdResponsDihasilkan &&
    ringkasan.totalPeserta ===
      ringkasan.totalIdPesertaDihasilkan
        ? "LOLOS AUDIT ID"
        : "PERLU PEMERIKSAAN";

  console.log(JSON.stringify(ringkasan, null, 2));

  return ringkasan;
}
