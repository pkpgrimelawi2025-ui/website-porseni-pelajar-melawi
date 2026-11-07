
/**
 * PORSENI PELAJAR MELAWI 2026
 * Tahap 1: Audit pembacaan 14 sumber spreadsheet.
 *
 * Keamanan:
 * - Hanya membaca sumber.
 * - Tidak mengubah spreadsheet asal.
 * - Tidak menerbitkan data ke website.
 * - Keluaran peserta dibatasi pada 7 kolom publik.
 */

const KONFIGURASI = {
  namaProyek: "PORSENI Pelajar Melawi 2026",
  versi: "1.0.0",

  sumber: [
    {
      kode: "BOLA_VOLI",
      nama: "Bola Voli",
      id: "1icrJQNfYygjEU1bfe4xckoyH-ehXiuFsIm-ewotMavg",
      gid: 912745545
    },
    {
      kode: "SEPAK_BOLA_MINI",
      nama: "Sepak Bola Mini",
      id: "1fobXJ_pKMKGkv2F3JJmj9Ta-b7Z-F1ZLzQUDAjoo04o",
      gid: 1043834311
    },
    {
      kode: "ATLETIK",
      nama: "Atletik",
      id: "1pXuer2V-NlkhbYfx6A_KR-TEQPAOeRZcbWX5coRi8do",
      gid: 2065186910
    },
    {
      kode: "CATUR",
      nama: "Catur",
      id: "1E0Iq3C-Wy0e7fpeImU7kYJT0P8gPUSPFxqlfv7CUL0k",
      gid: 1655015635
    },
    {
      kode: "TENIS_MEJA",
      nama: "Tenis Meja",
      id: "1gBwDJYt5vBfLM_60kZz2h1EsJA7JahHANVaTKai53Bw",
      gid: 346316743
    },
    {
      kode: "KARATE",
      nama: "Karate",
      id: "1luaVhUol63W8NmyycYpzw9PmbX9kGG85lb7lLgZewiw",
      gid: 693318468
    },
    {
      kode: "MENYANYI_SOLO",
      nama: "Menyanyi Solo",
      id: "1a6f5Xgc3fYCSne__rhyFPPn-9JveWLdeG_JwU1H1onc",
      gid: 884070524
    },
    {
      kode: "BACA_PUISI",
      nama: "Baca Puisi",
      id: "1S-4AbgNmsItPstUCKpC_63NnzalzI7i7d8P1L3z6Ut0",
      gid: 284799990
    },
    {
      kode: "PANTOMIM",
      nama: "Pantomim",
      id: "17m3R0usgNbUVA7wZDGksYY3dXaTl4Nwap_M2l363QHg",
      gid: 1285164873
    },
    {
      kode: "SENI_TARI",
      nama: "Seni Tari",
      id: "1wHbxkbJ5Lg7ELWz9iXptPWBs2KIizT7qEN66BgI-Ouk",
      gid: 1519803277
    },
    {
      kode: "MENDONGENG",
      nama: "Mendongeng",
      id: "1VgeXjbMzM8S9ugQ_C49tE4emV226Db9rCoEywf2Y3hg",
      gid: 1724139732
    },
    {
      kode: "MENULIS_CERITA",
      nama: "Menulis Cerita",
      id: "1a9_seg482ZpDrHHXCzudUy8cI1XqcuDqziCeNtUfGac",
      gid: 964087810
    },
    {
      kode: "SENI_KRIYA",
      nama: "Seni Kriya",
      id: "1EPHqsPR7NvLJ5pppxZgRoe2WuUq1ZCYxzXblron5t2w",
      gid: 1024083953
    },
    {
      kode: "GAMBAR_BERCERITA",
      nama: "Gambar Bercerita",
      id: "1kvF2qgtHJ45rBPflRyGHdV2-eWjMTHjjJ2pBMwnQlMw",
      gid: 1208055
    }
  ]
};

const DAFTAR_KECAMATAN = [
  "Nanga Pinoh",
  "Pinoh Utara",
  "Pinoh Selatan",
  "Belimbing",
  "Belimbing Hulu",
  "Ella Hilir",
  "Menukung",
  "Sayan",
  "Tanah Pinoh",
  "Tanah Pinoh Barat",
  "Sokan"
];

/**
 * Normalisasi teks untuk pencocokan header.
 */
function normalisasiHeader(nilai) {
  return String(nilai || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Mencari indeks kolom dengan beberapa kemungkinan nama.
 */
function cariKolom(header, kandidat) {
  const headerNormal = header.map(normalisasiHeader);
  const kandidatNormal = kandidat.map(normalisasiHeader);

  // Prioritas pertama: cocok persis.
  for (const nama of kandidatNormal) {
    const indeks = headerNormal.indexOf(nama);
    if (indeks !== -1) return indeks;
  }

  // Prioritas kedua: header mengandung kata kunci.
  for (const nama of kandidatNormal) {
    if (nama.length < 5) continue;

    const indeks = headerNormal.findIndex(
      item => item.includes(nama)
    );

    if (indeks !== -1) return indeks;
  }

  return -1;
}

/**
 * Memetakan header asli menjadi kolom yang diperlukan publik.
 */
function petakanHeader(header) {
  return {
    kecamatan: cariKolom(header, ["Kecamatan"]),

    jenjang: cariKolom(header, [
      "Jenjang Sekolah",
      "Jenjang Pendidikan"
    ]),

    kategori: cariKolom(header, [
      "Kategori Bola Voli",
      "Kategori Sepak Bola Mini",
      "Kategori Cabang Atletik",
      "Kategori Catur",
      "Kategori Tenis Meja",
      "Kategori Karate",
      "Kategori Baca Puisi",
      "Kategori"
    ]),

    nama: cariKolom(header, [
      "Nama Lengkap",
      "Nama Peserta",
      "Nama Pemain"
    ]),

    jenisKelamin: cariKolom(header, [
      "Jenis Kelamin"
    ]),

    kelas: cariKolom(header, [
      "Kelas"
    ]),

    sekolah: cariKolom(header, [
      "Nama Sekolah",
      "Asal Sekolah"
    ])
  };
}

/**
 * Mengubah kategori berdasarkan nilai sumber.
 * Jika kategori kosong, gunakan jenis kelamin.
 */
function tentukanKategori(kategori, jenisKelamin) {
  const nilai = String(kategori || "").trim().toLowerCase();
  const gender = String(jenisKelamin || "").trim().toLowerCase();

  if (["putra", "putri"].includes(nilai)) {
    return nilai === "putra" ? "Putra" : "Putri";
  }

  if (["laki-laki", "laki laki", "laki", "pria"].includes(gender)) {
    return "Putra";
  }

  if (["perempuan", "wanita"].includes(gender)) {
    return "Putri";
  }

  // Belum dapat ditentukan: jangan menebak.
  return "Belum ditentukan";
}

/**
 * Membuka tab berdasarkan GID, bukan berdasarkan nama tab.
 */
function ambilSheetBerdasarkanGid(spreadsheet, gid) {
  const sheet = spreadsheet.getSheets().find(
    item => item.getSheetId() === Number(gid)
  );

  if (!sheet) {
    throw new Error(
      `Tab dengan GID ${gid} tidak ditemukan.`
    );
  }

  return sheet;
}

/**
 * Memisahkan nama peserta berdasarkan aturan baris
 * yang telah dikonfirmasi melalui audit.
 *
 * Mendukung:
 * - Nomor urut: 1. Nama A 2. Nama B
 * - Koma: Nama A, Nama B
 * - Kata "dan": Nama A dan Nama B
 *
 * Tidak mengubah data sumber.
 */
function pisahkanNamaPeserta(nilai, polaPemisah) {
  const teks = String(nilai || "").trim();

  if (!teks) return [];

  const potongan = polaPemisah
    ? teks.split(polaPemisah)
    : [teks];

  return potongan
    .map(nama =>
      nama
        .replace(/^\s*\d+\s*\.\s*/, "")
        .trim()
    )
    .filter(Boolean);
}

/**
 * Membaca dan memetakan satu sumber.
 * Nama beregu dipisahkan hanya pada baris yang sudah diaudit.
 * Data sumber tidak diubah.
 * Penanda verifikasi dipertahankan untuk proses internal.
 */
function bacaSatuSumber(sumber) {
  const spreadsheet = SpreadsheetApp.openById(sumber.id);

  const sheet = ambilSheetBerdasarkanGid(
    spreadsheet,
    sumber.gid
  );

  const data = sheet.getDataRange().getDisplayValues();

  if (!data.length || !data[0].length) {
    throw new Error("Spreadsheet tidak memiliki data.");
  }

  const header = data[0].map(
    nilai => String(nilai || "").trim()
  );

  const peta = petakanHeader(header);

  const kolomWajib = [
    "kecamatan",
    "jenjang",
    "nama",
    "jenisKelamin",
    "kelas",
    "sekolah"
  ];

  const kolomTidakDitemukan = kolomWajib.filter(
    nama => peta[nama] === -1
  );

  if (kolomTidakDitemukan.length) {
    throw new Error(
      "Kolom wajib belum terpetakan: " +
      kolomTidakDitemukan.join(", ")
    );
  }

  /*
   * Aturan pemisahan nama berdasarkan hasil audit.
   * Nomor baris menggunakan nomor asli spreadsheet.
   */
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
      // Baris 5: dipisahkan dengan koma atau kata "dan".
      5: /\s*,\s*|\s+dan\s+/i,

      // Baris 18: dipisahkan berdasarkan nomor urut.
      18: /(?=\s*\d+\s*\.\s*)/
    }
  };

  const peserta = [];

  let barisTerisi = 0;
  let barisTidakLengkap = 0;
  let kategoriBelumDitentukan = 0;
  let barisPerluVerifikasi = 0;
  let totalNamaHasilPemisahan = 0;

  for (let i = 1; i < data.length; i++) {
    const baris = data[i];
    const nomorBarisSumber = i + 1;

    if (!baris.some(
      nilai => String(nilai || "").trim()
    )) {
      continue;
    }

    barisTerisi++;

    const namaAsli = String(
      baris[peta.nama] || ""
    ).trim();

    const kecamatan = String(
      baris[peta.kecamatan] || ""
    ).trim();

    if (!namaAsli || !kecamatan) {
      barisTidakLengkap++;
      continue;
    }

    const jenjang = String(
      baris[peta.jenjang] || ""
    ).trim();

    const kelas = String(
      baris[peta.kelas] || ""
    ).trim();

    const jenisKelaminSumber = String(
      baris[peta.jenisKelamin] || ""
    ).trim();

    const kategoriSumber = peta.kategori === -1
      ? ""
      : String(baris[peta.kategori] || "").trim();

    const sekolahSumber = String(
      baris[peta.sekolah] || ""
    ).trim();

    const aturanCabang =
      aturanPemisahan[sumber.kode] || {};

    const polaPemisah =
      aturanCabang[nomorBarisSumber] || null;

    const namaPeserta = pisahkanNamaPeserta(
      namaAsli,
      polaPemisah
    );

    if (!namaPeserta.length) {
      barisTidakLengkap++;
      continue;
    }

    const hasilPemisahan = Boolean(polaPemisah);

    if (hasilPemisahan) {
      totalNamaHasilPemisahan += namaPeserta.length;
      barisPerluVerifikasi++;
    }

    namaPeserta.forEach(nama => {
      /*
       * Atribut individual pada data beregu tetap
       * ditandai perlu verifikasi.
       */
      const jenisKelamin = hasilPemisahan
        ? ""
        : jenisKelaminSumber;

      const kategori = hasilPemisahan
        ? "Belum ditentukan"
        : tentukanKategori(
            kategoriSumber,
            jenisKelaminSumber
          );

      if (kategori === "Belum ditentukan") {
        kategoriBelumDitentukan++;
      }

      peserta.push({
        kode_sumber: sumber.kode,
        baris_sumber: nomorBarisSumber,
        nama: nama,
        cabang_lomba: sumber.nama,
        jenjang_sekolah: jenjang,
        kategori: kategori,
        jenis_kelamin: jenisKelamin,
        kelas: kelas,

        asal_sekolah: hasilPemisahan
          ? ""
          : sekolahSumber,

        kecamatan: kecamatan,

        hasil_pemisahan_nama: hasilPemisahan,

        status_verifikasi: hasilPemisahan
          ? "perlu_verifikasi_individual"
          : "belum_diaudit_individual",

        jenjang_perlu_verifikasi: hasilPemisahan,
        kelas_perlu_verifikasi: hasilPemisahan,
        sekolah_perlu_verifikasi: hasilPemisahan,
        jenis_kelamin_perlu_verifikasi: hasilPemisahan,
        kategori_perlu_verifikasi: hasilPemisahan
      });
    });
  }

  return {
    kode: sumber.kode,
    cabang: sumber.nama,
    spreadsheet: spreadsheet.getName(),
    namaTab: sheet.getName(),
    gid: sheet.getSheetId(),
    jumlahKolomHeader: header.filter(Boolean).length,
    header: header,
    petaKolom: peta,
    barisTerisi: barisTerisi,
    barisTidakLengkap: barisTidakLengkap,
    kategoriBelumDitentukan: kategoriBelumDitentukan,
    barisPerluVerifikasi: barisPerluVerifikasi,
    totalNamaHasilPemisahan: totalNamaHasilPemisahan,
    jumlahPesertaTerbaca: peserta.length,
    peserta: peserta
  };
}

/**
 * UJI UTAMA
 *
 * Jalankan fungsi ini dari editor Apps Script.
 * Hasil audit muncul pada Execution log.
 */
function ujiBacaSemuaSumber() {
  const laporan = [];
  let totalPeserta = 0;
  let berhasil = 0;
  let gagal = 0;

  KONFIGURASI.sumber.forEach(sumber => {
    try {
      const hasil = bacaSatuSumber(sumber);

      berhasil++;
      totalPeserta += hasil.jumlahPesertaTerbaca;

      laporan.push({
        kode: hasil.kode,
        cabang: hasil.cabang,
        status: "BERHASIL",
        spreadsheet: hasil.spreadsheet,
        tab: hasil.namaTab,
        gid: hasil.gid,
        kolomHeader: hasil.jumlahKolomHeader,
        barisTerisi: hasil.barisTerisi,
        pesertaTerbaca: hasil.jumlahPesertaTerbaca,
        barisTidakLengkap: hasil.barisTidakLengkap,
        kategoriBelumDitentukan: hasil.kategoriBelumDitentukan,
        petaKolom: hasil.petaKolom
      });

    } catch (error) {
      gagal++;

      laporan.push({
        kode: sumber.kode,
        cabang: sumber.nama,
        status: "GAGAL",
        pesan: error.message
      });
    }
  });

  const hasilAkhir = {
    proyek: KONFIGURASI.namaProyek,
    versi: KONFIGURASI.versi,
    waktuUji: new Date().toISOString(),
    jumlahSumber: KONFIGURASI.sumber.length,
    berhasil: berhasil,
    gagal: gagal,
    totalPesertaTerbaca: totalPeserta,
    hasil: laporan
  };

  console.log(JSON.stringify(hasilAkhir, null, 2));

  return hasilAkhir;
}

/**
 * Menghasilkan daftar peserta dari seluruh sumber.
 * Belum memublikasikan data ke mana pun.
 */
function bacaSemuaPeserta() {
  const peserta = [];
  const kesalahan = [];

  KONFIGURASI.sumber.forEach(sumber => {
    try {
      const hasil = bacaSatuSumber(sumber);
      peserta.push(...hasil.peserta);
    } catch (error) {
      kesalahan.push({
        cabang: sumber.nama,
        pesan: error.message
      });
    }
  });

  return {
    status: kesalahan.length === 0 ? "berhasil" : "sebagian_gagal",
    jumlahSumber: KONFIGURASI.sumber.length,
    jumlahPeserta: peserta.length,
    kesalahan: kesalahan,
    peserta: peserta
  };
}

function ujiRingkasSumber() {
  const laporan = [];
  let totalBaris = 0;
  let totalPesertaTerbaca = 0;
  let jumlahBerhasil = 0;
  let jumlahGagal = 0;

  KONFIGURASI.sumber.forEach(sumber => {
    try {
      const hasil = bacaSatuSumber(sumber);

      jumlahBerhasil++;
      totalBaris += hasil.barisTerisi;
      totalPesertaTerbaca += hasil.jumlahPesertaTerbaca;

      laporan.push({
        cabang: hasil.cabang,
        status: "BERHASIL",
        barisTerisi: hasil.barisTerisi,
        pesertaTerbaca: hasil.jumlahPesertaTerbaca,
        barisTidakLengkap: hasil.barisTidakLengkap,
        kategoriBelumDitentukan: hasil.kategoriBelumDitentukan
      });
    } catch (error) {
      jumlahGagal++;

      laporan.push({
        cabang: sumber.nama,
        status: "GAGAL",
        pesan: error.message
      });
    }
  });

  console.log("=== AUDIT RINGKAS PORSENI ===");
  console.log(JSON.stringify({
    jumlahSumber: KONFIGURASI.sumber.length,
    berhasil: jumlahBerhasil,
    gagal: jumlahGagal,
    totalBarisTerisi: totalBaris,
    totalPesertaTerbaca: totalPesertaTerbaca,
    hasilPerCabang: laporan
  }, null, 2));
}

/**
 * AUDIT NAMA BEREGU DAN KATEGORI
 * Mode baca-saja: tidak mengubah spreadsheet sumber.
 * Tidak mencatat nama peserta ke log.
 */
function auditNamaBereguDanKategori() {
  const laporan = [];

  const pemisahNama = [
    /\r?\n/,
    /;/,
    /,/,
    /\s+dan\s+/i,
    /\s*&\s*/
  ];

  KONFIGURASI.sumber.forEach(sumber => {
    try {
      const spreadsheet = SpreadsheetApp.openById(sumber.id);
      const sheet = ambilSheetBerdasarkanGid(
        spreadsheet,
        sumber.gid
      );

      const data = sheet.getDataRange().getDisplayValues();
      if (data.length < 2) {
        laporan.push({
          cabang: sumber.nama,
          status: "TIDAK ADA BARIS DATA"
        });
        return;
      }

      const header = data[0].map(
        nilai => String(nilai || "").trim()
      );

      const peta = petakanHeader(header);
      const distribusiKategori = {};
      const distribusiGender = {};
      const dugaanNamaGabungan = [];
      let barisDiperiksa = 0;

      for (let i = 1; i < data.length; i++) {
        const baris = data[i];

        if (!baris.some(
          nilai => String(nilai || "").trim()
        )) {
          continue;
        }

        barisDiperiksa++;

        const nama = String(
          baris[peta.nama] || ""
        ).trim();

        const kategori = peta.kategori >= 0
          ? String(baris[peta.kategori] || "").trim()
          : "";

        const gender = peta.jenisKelamin >= 0
          ? String(baris[peta.jenisKelamin] || "").trim()
          : "";

        if (kategori) {
          distribusiKategori[kategori] =
            (distribusiKategori[kategori] || 0) + 1;
        } else {
          distribusiKategori["(kosong/tidak tersedia)"] =
            (distribusiKategori["(kosong/tidak tersedia)"] || 0) + 1;
        }

        if (gender) {
          distribusiGender[gender] =
            (distribusiGender[gender] || 0) + 1;
        } else {
          distribusiGender["(kosong)"] =
            (distribusiGender["(kosong)"] || 0) + 1;
        }

        const ditemukanPemisah = pemisahNama.some(
          pola => pola.test(nama)
        );

        if (ditemukanPemisah) {
          dugaanNamaGabungan.push({
            nomorBarisSpreadsheet: i + 1,
            panjangIsiNama: nama.length,
            alasan: "Ada tanda pemisah yang perlu diperiksa"
          });
        }
      }

      laporan.push({
        cabang: sumber.nama,
        status: "BERHASIL",
        namaTab: sheet.getName(),
        kolomNama: header[peta.nama] || "(tidak ditemukan)",
        kolomKategori: peta.kategori >= 0
          ? header[peta.kategori]
          : "(tidak ada kolom kategori khusus)",
        kolomJenisKelamin: header[peta.jenisKelamin] || "(tidak ditemukan)",
        barisDiperiksa: barisDiperiksa,
        distribusiNilaiKategori: distribusiKategori,
        distribusiNilaiJenisKelamin: distribusiGender,
        jumlahDugaanNamaGabungan: dugaanNamaGabungan.length,
        dugaanNamaGabungan: dugaanNamaGabungan
      });

    } catch (error) {
      laporan.push({
        cabang: sumber.nama,
        status: "GAGAL",
        pesan: error.message
      });
    }
  });

  const ringkasan = {
    judul: "Audit Nama Beregu dan Kategori PORSENI",
    waktuAudit: new Date().toISOString(),
    jumlahSumber: KONFIGURASI.sumber.length,
    jumlahSumberBerhasil: laporan.filter(
      item => item.status === "BERHASIL"
    ).length,
    jumlahSumberGagal: laporan.filter(
      item => item.status === "GAGAL"
    ).length,
    hasil: laporan
  };

  console.log(JSON.stringify(ringkasan, null, 2));
  return ringkasan;
}

/**
 * Audit pemisah nama pada baris yang sudah dikonfirmasi.
 * Hanya membaca sumber; tidak mengubah data.
 * Nama peserta tidak ditulis ke log.
 */
function auditPemisahNamaTerkonfirmasi() {
  const target = [
    { kode: "SEPAK_BOLA_MINI", baris: 27 },
    { kode: "PANTOMIM", baris: 4 },
    { kode: "PANTOMIM", baris: 9 },
    { kode: "SENI_TARI", baris: 5 }
  ];

  const polaPemisah = [
    { nama: "baris baru", regex: /\r?\n/ },
    { nama: "titik koma", regex: /;/ },
    { nama: "pipa", regex: /\|/ },
    { nama: "koma", regex: /,/ },
    { nama: "kata dan", regex: /\s+dan\s+/i },
    { nama: "ampersand", regex: /\s*&\s*/ },
    { nama: "tanda tambah", regex: /\s+\+\s+/ }
  ];

  const laporan = [];

  target.forEach(item => {
    try {
      const sumber = KONFIGURASI.sumber.find(
        s => s.kode === item.kode
      );

      if (!sumber) {
        throw new Error("Kode sumber tidak ditemukan.");
      }

      const spreadsheet = SpreadsheetApp.openById(sumber.id);
      const sheet = ambilSheetBerdasarkanGid(
        spreadsheet,
        sumber.gid
      );

      const data = sheet.getDataRange().getDisplayValues();
      const header = data[0].map(normalisasiHeader);

      const indeksNama = header.findIndex(nama =>
        ["nama lengkap", "nama peserta", "nama pemain"]
          .includes(nama)
      );

      if (indeksNama < 0) {
        throw new Error("Kolom nama tidak ditemukan.");
      }

      if (item.baris < 2 || item.baris > data.length) {
        throw new Error("Nomor baris di luar rentang data.");
      }

      const nilai = String(
        data[item.baris - 1][indeksNama] || ""
      ).trim();

      const pemisahDitemukan = polaPemisah
        .filter(p => p.regex.test(nilai))
        .map(p => p.nama);

      laporan.push({
        cabang: sumber.nama,
        nomorBaris: item.baris,
        selNamaTerisi: Boolean(nilai),
        panjangTeks: nilai.length,
        pemisahDitemukan: pemisahDitemukan,
        status: pemisahDitemukan.length
          ? "PERLU UJI PEMISAHAN"
          : "PERLU PEMERIKSAAN MANUAL"
      });

    } catch (error) {
      laporan.push({
        cabang: item.kode,
        nomorBaris: item.baris,
        status: "GAGAL",
        pesan: error.message
      });
    }
  });

  console.log(JSON.stringify({
    judul: "Audit Pemisah Nama Terkonfirmasi",
    jumlahBaris: laporan.length,
    hasil: laporan
  }, null, 2));

  return laporan;
}

function ujiJumlahPotonganNama() {
  const target = [
    { kode: "SEPAK_BOLA_MINI", baris: 27 },
    { kode: "PANTOMIM", baris: 4 },
    { kode: "PANTOMIM", baris: 9 },
    { kode: "SENI_TARI", baris: 5 }
  ];

  const hasil = [];

  target.forEach(item => {
    try {
      const sumber = KONFIGURASI.sumber.find(
        s => s.kode === item.kode
      );

      if (!sumber) {
        throw new Error("Sumber tidak ditemukan.");
      }

      const spreadsheet = SpreadsheetApp.openById(sumber.id);
      const sheet = ambilSheetBerdasarkanGid(
        spreadsheet,
        sumber.gid
      );

      const data = sheet.getDataRange().getDisplayValues();
      const header = data[0].map(normalisasiHeader);

      const indeksNama = header.findIndex(nama =>
        ["nama lengkap", "nama peserta", "nama pemain"]
          .includes(nama)
      );

      if (indeksNama < 0) {
        throw new Error("Kolom nama tidak ditemukan.");
      }

      const nilai = String(
        data[item.baris - 1][indeksNama] || ""
      ).trim();

      let pola = null;
      let jenisPemisah = "";

      if (/\r?\n/.test(nilai)) {
        pola = /\r?\n/;
        jenisPemisah = "baris baru";
      } else if (/\s+dan\s+/i.test(nilai)) {
        pola = /\s+dan\s+/i;
        jenisPemisah = "kata dan";
      } else if (/,/.test(nilai)) {
        pola = /,/;
        jenisPemisah = "koma";
      }

      if (!pola) {
        hasil.push({
          cabang: sumber.nama,
          baris: item.baris,
          status: "TIDAK ADA PEMISAH YANG DIDUKUNG"
        });
        return;
      }

      const potongan = nilai
        .split(pola)
        .map(teks => teks.trim())
        .filter(Boolean);

      hasil.push({
        cabang: sumber.nama,
        baris: item.baris,
        jenisPemisah: jenisPemisah,
        panjangTeks: nilai.length,
        jumlahPotongan: potongan.length,
        semuaPotonganTerisi: potongan.every(Boolean),
        status: potongan.length > 1
          ? "KANDIDAT PEMISAHAN"
          : "PERLU PEMERIKSAAN"
      });

    } catch (error) {
      hasil.push({
        cabang: item.kode,
        baris: item.baris,
        status: "GAGAL",
        pesan: error.message
      });
    }
  });

  console.log(JSON.stringify({
    judul: "Uji Jumlah Potongan Nama",
    jumlahBarisDiuji: hasil.length,
    hasil: hasil
  }, null, 2));

  return hasil;
}

function auditPanjangPotonganNama() {
  const targetAudit = [
    {
      kodeCabang: "SEPAK_BOLA_MINI",
      namaCabang: "Sepak Bola Mini",
      baris: 27,
      pola: /,/
    },
    {
      kodeCabang: "PANTOMIM",
      namaCabang: "Pantomim",
      baris: 4,
      pola: /\s+dan\s+/i
    },
    {
      kodeCabang: "PANTOMIM",
      namaCabang: "Pantomim",
      baris: 9,
      pola: /\s+dan\s+/i
    },
    {
      kodeCabang: "SENI_TARI",
      namaCabang: "Seni Tari",
      baris: 5,
      pola: /\s*,\s*|\s+dan\s+/i
    }
  ];

  const hasil = [];

  targetAudit.forEach(target => {
    const sumber = KONFIGURASI.sumber.find(
      item => item.kode === target.kodeCabang
    );

    if (!sumber) {
      hasil.push({
        cabang: target.namaCabang,
        baris: target.baris,
        status: "KONFIGURASI TIDAK DITEMUKAN"
      });
      return;
    }

    try {
      const spreadsheet = SpreadsheetApp.openById(sumber.id);
      const sheet = spreadsheet.getSheets()
        .find(item => item.getSheetId() === Number(sumber.gid));
      if (!sheet) {
        hasil.push({
          cabang: target.namaCabang,
          baris: target.baris,
          status: "SHEET DENGAN GID TERSEBUT TIDAK DITEMUKAN"
        });
        return;
      }
      if (target.baris > sheet.getLastRow()) {
        hasil.push({
          cabang: target.namaCabang,
          baris: target.baris,
          status: "BARIS TIDAK DITEMUKAN"
        });
        return;
      }

      const header = sheet
        .getRange(1, 1, 1, sheet.getLastColumn())
        .getDisplayValues()[0];

      const peta = petakanHeader(header);

      if (peta.nama < 0) {
        hasil.push({
          cabang: target.namaCabang,
          baris: target.baris,
          status: "KOLOM NAMA TIDAK DITEMUKAN"
        });
        return;
      }

      const teks = String(
        sheet.getRange(target.baris, peta.nama + 1)
          .getDisplayValue() || ""
      ).trim();

      const potongan = teks
        .split(target.pola)
        .map(nama => nama.trim())
        .filter(Boolean);

      hasil.push({
        cabang: target.namaCabang,
        baris: target.baris,
        jumlahPotongan: potongan.length,
        panjangSetiapPotongan: potongan.map(nama => nama.length),
        jumlahKataSetiapPotongan: potongan.map(nama =>
          nama.split(/\s+/).filter(Boolean).length
        ),
        adaPotonganPendek: potongan.some(nama => nama.length < 3),
        status: potongan.length > 1
          ? "PERLU VALIDASI"
          : "PEMISAHAN BELUM TERBUKTI"
      });

    } catch (error) {
      hasil.push({
        cabang: target.namaCabang,
        baris: target.baris,
        status: "GAGAL DIAUDIT",
        pesan: error.message
      });
    }
  });

  const laporan = {
    judul: "Audit Panjang Potongan Nama",
    jumlahBarisDiuji: hasil.length,
    hasil: hasil
  };

  console.log(JSON.stringify(laporan, null, 2));
  return laporan;
}

function auditMetadataNamaBeregu() {
  const targetAudit = [
    {
      kode: "SEPAK_BOLA_MINI",
      nama: "Sepak Bola Mini",
      baris: 27,
      pola: /,/
    },
    {
      kode: "PANTOMIM",
      nama: "Pantomim",
      baris: 4,
      pola: /\s+dan\s+/i
    },
    {
      kode: "PANTOMIM",
      nama: "Pantomim",
      baris: 9,
      pola: /\s+dan\s+/i
    },
    {
      kode: "SENI_TARI",
      nama: "Seni Tari",
      baris: 5,
      pola: /\s*,\s*|\s+dan\s+/i
    }
  ];

  const hasil = [];

  targetAudit.forEach(target => {
    const sumber = KONFIGURASI.sumber.find(
      item => item.kode === target.kode
    );

    if (!sumber) {
      hasil.push({
        cabang: target.nama,
        baris: target.baris,
        status: "KONFIGURASI TIDAK DITEMUKAN"
      });
      return;
    }

    try {
      const spreadsheet = SpreadsheetApp.openById(sumber.id);
      const sheet = spreadsheet.getSheets().find(
        item => item.getSheetId() === Number(sumber.gid)
      );

      if (!sheet) {
        hasil.push({
          cabang: target.nama,
          baris: target.baris,
          status: "SHEET TIDAK DITEMUKAN"
        });
        return;
      }

      if (target.baris > sheet.getLastRow()) {
        hasil.push({
          cabang: target.nama,
          baris: target.baris,
          status: "BARIS TIDAK DITEMUKAN"
        });
        return;
      }

      const header = sheet
        .getRange(1, 1, 1, sheet.getLastColumn())
        .getDisplayValues()[0];

      const peta = petakanHeader(header);

      const kolomAudit = [
        { nama: "kecamatan", indeks: peta.kecamatan },
        { nama: "jenjang_sekolah", indeks: peta.jenjang },
        { nama: "kategori", indeks: peta.kategori },
        { nama: "jenis_kelamin", indeks: peta.jenisKelamin },
        { nama: "kelas", indeks: peta.kelas },
        { nama: "asal_sekolah", indeks: peta.sekolah }
      ];

      const nilaiBaris = sheet
        .getRange(target.baris, 1, 1, sheet.getLastColumn())
        .getDisplayValues()[0];

      const metadata = {};
      let jumlahKolomTersedia = 0;
      let jumlahKolomTerisi = 0;

      kolomAudit.forEach(kolom => {
        if (
          typeof kolom.indeks !== "number" ||
          kolom.indeks < 0 ||
          kolom.indeks >= nilaiBaris.length
        ) {
          metadata[kolom.nama] = "KOLOM TIDAK DITEMUKAN";
          return;
        }

        jumlahKolomTersedia++;

        const nilai = String(
          nilaiBaris[kolom.indeks] || ""
        ).replace(/\s+/g, " ").trim();

        if (nilai) {
          jumlahKolomTerisi++;
          metadata[kolom.nama] = "TERISI";
        } else {
          metadata[kolom.nama] = "KOSONG";
        }
      });

      const teksNama = String(
        nilaiBaris[peta.nama] || ""
      ).trim();

      const potongan = teksNama
        .split(target.pola)
        .map(item => item.trim())
        .filter(Boolean);

      hasil.push({
        cabang: target.nama,
        baris: target.baris,
        jumlahPotonganNama: potongan.length,
        jumlahKolomMetadataTersedia: jumlahKolomTersedia,
        jumlahKolomMetadataTerisi: jumlahKolomTerisi,
        metadata: metadata,
        status: jumlahKolomTersedia === 6 &&
          jumlahKolomTerisi === 6
          ? "METADATA LENGKAP - PERLU VALIDASI KESESUAIAN"
          : "METADATA BELUM LENGKAP"
      });

    } catch (error) {
      hasil.push({
        cabang: target.nama,
        baris: target.baris,
        status: "GAGAL DIAUDIT",
        pesan: error.message
      });
    }
  });

  const laporan = {
    judul: "Audit Metadata Nama Beregu",
    jumlahBarisDiuji: hasil.length,
    hasil: hasil
  };

  console.log(JSON.stringify(laporan, null, 2));
  return laporan;
}

function auditHasilNormalisasi() {
  const hasilBaca = bacaSemuaPeserta();
  const peserta = hasilBaca.peserta || [];

  const ringkasan = {
    judul: "Audit Hasil Normalisasi PORSENI",
    statusPembacaan: hasilBaca.status,
    jumlahSumber: hasilBaca.jumlahSumber,
    jumlahPeserta: peserta.length,
    jumlahHasilPemisahan: 0,
    jumlahPerluVerifikasi: 0,
    jumlahAsalSekolahKosongPadaHasilPemisahan: 0,
    jumlahKecamatanKosong: 0,
    jumlahCabangKosong: 0,
    jumlahNamaKosong: 0,
    jumlahNamaMasihBernomor: 0,
    contohNamaMasihBernomor: [],
    jumlahJenjangPerluVerifikasi: 0,
    jumlahKelasPerluVerifikasi: 0,
    jumlahJenisKelaminPerluVerifikasi: 0,
    jumlahKategoriPerluVerifikasi: 0,
    jumlahBarisSumberUnik: 0,
    perCabang: {},
    kesalahan: hasilBaca.kesalahan || []
  };

  const barisSumberUnik = new Set();

  peserta.forEach(item => {
    const cabang = item.cabang_lomba || "Tidak diketahui";

    if (!ringkasan.perCabang[cabang]) {
      ringkasan.perCabang[cabang] = {
        jumlahPeserta: 0,
        hasilPemisahan: 0,
        perluVerifikasi: 0
      };
    }

    ringkasan.perCabang[cabang].jumlahPeserta++;

    if (!String(item.nama || "").trim()) {
      ringkasan.jumlahNamaKosong++;
    }

    if (!item.kecamatan) {
      ringkasan.jumlahKecamatanKosong++;
    }

    if (!item.cabang_lomba) {
      ringkasan.jumlahCabangKosong++;
    }

    if (/^\s*\d+\s*\.\s*/.test(String(item.nama || ""))) {
      ringkasan.jumlahNamaMasihBernomor++;

      if (ringkasan.contohNamaMasihBernomor.length < 10) {
        ringkasan.contohNamaMasihBernomor.push({
          cabang: item.cabang_lomba,
          nama: item.nama,
          barisSumber: item.baris_sumber
        });
      }
    }

    if (item.hasil_pemisahan_nama === true) {
      ringkasan.jumlahHasilPemisahan++;
      ringkasan.perCabang[cabang].hasilPemisahan++;

      if (!item.asal_sekolah) {
        ringkasan.jumlahAsalSekolahKosongPadaHasilPemisahan++;
      }

      if (item.status_verifikasi === "perlu_verifikasi_individual") {
        ringkasan.jumlahPerluVerifikasi++;
        ringkasan.perCabang[cabang].perluVerifikasi++;
      }

      if (item.jenjang_perlu_verifikasi) {
        ringkasan.jumlahJenjangPerluVerifikasi++;
      }

      if (item.kelas_perlu_verifikasi) {
        ringkasan.jumlahKelasPerluVerifikasi++;
      }

      if (item.jenis_kelamin_perlu_verifikasi) {
        ringkasan.jumlahJenisKelaminPerluVerifikasi++;
      }

      if (item.kategori_perlu_verifikasi) {
        ringkasan.jumlahKategoriPerluVerifikasi++;
      }
    }

    if (
      item.kode_sumber &&
      item.baris_sumber !== undefined
    ) {
      barisSumberUnik.add(
        item.kode_sumber + ":" + item.baris_sumber
      );
    }
  });

  ringkasan.jumlahBarisSumberUnik = barisSumberUnik.size;

  const lolosPemeriksaan =
    ringkasan.statusPembacaan === "berhasil" &&
    ringkasan.jumlahPeserta === 282 &&
    ringkasan.jumlahHasilPemisahan === 25 &&
    ringkasan.jumlahPerluVerifikasi === 25 &&
    ringkasan.jumlahAsalSekolahKosongPadaHasilPemisahan === 25 &&
    ringkasan.jumlahKecamatanKosong === 0 &&
    ringkasan.jumlahCabangKosong === 0 &&
    ringkasan.jumlahNamaKosong === 0 &&
    ringkasan.jumlahNamaMasihBernomor === 0 &&
    ringkasan.kesalahan.length === 0;

  ringkasan.hasilAudit = lolosPemeriksaan
    ? "LOLOS PEMERIKSAAN AWAL"
    : "PERLU PEMERIKSAAN LANJUTAN";

  console.log(JSON.stringify(ringkasan, null, 2));
  return ringkasan;
}

/**
 * Membentuk JSON publik untuk website PORSENI.
 * Tidak mengirim data ke GitHub atau mengubah sumber.
 */
function ujiBentukJsonPublik() {
  const hasilBaca = bacaSemuaPeserta();

  if (hasilBaca.status !== "berhasil") {
    throw new Error(
      "JSON publik dibatalkan: ada sumber yang gagal dibaca."
    );
  }

  const pesertaPublik = hasilBaca.peserta.map(item => ({
    nama: item.nama || "",
    cabang_lomba: item.cabang_lomba || "",
    jenjang_sekolah: item.jenjang_sekolah || "",
    kategori: item.kategori || "Belum ditentukan",
    jenis_kelamin: item.jenis_kelamin || "",
    kelas: item.kelas || "",
    asal_sekolah: item.sekolah_perlu_verifikasi
      ? "Belum terverifikasi"
      : (item.asal_sekolah || ""),
    kecamatan: item.kecamatan || ""
  }));

  const ringkasanCabang = {};

  pesertaPublik.forEach(item => {
    const cabang = item.cabang_lomba;
    ringkasanCabang[cabang] =
      (ringkasanCabang[cabang] || 0) + 1;
  });

  const jsonPublik = {
    versi: "1.0",
    diperbarui_pada: new Date().toISOString(),
    status: "tersedia",
    ringkasan: {
      total_keikutsertaan: pesertaPublik.length,
      total_cabang: KONFIGURASI.sumber.length,
      jumlah_cabang_terdaftar:
        Object.keys(ringkasanCabang).length,
      per_cabang: ringkasanCabang
    },
    peserta: pesertaPublik
  };

  // Pemeriksaan dasar sebelum hasil dinyatakan lolos.
  const kolomDiizinkan = [
    "nama",
    "cabang_lomba",
    "jenjang_sekolah",
    "kategori",
    "jenis_kelamin",
    "kelas",
    "asal_sekolah",
    "kecamatan"
  ];

  const pelanggaranSkema = pesertaPublik.some(item =>
    Object.keys(item).some(
      kolom => !kolomDiizinkan.includes(kolom)
    )
  );

  const pesertaTanpaNama = pesertaPublik.filter(
    item => !item.nama.trim()
  ).length;

  const pesertaTanpaCabang = pesertaPublik.filter(
    item => !item.cabang_lomba.trim()
  ).length;

  const sekolahBelumTerverifikasi = pesertaPublik.filter(
    item => item.asal_sekolah === "Belum terverifikasi"
  ).length;

  const laporan = {
    judul: "Uji JSON Publik PORSENI",
    statusPembacaan: hasilBaca.status,
    totalPeserta: pesertaPublik.length,
    totalCabangTerdaftar:
      Object.keys(ringkasanCabang).length,
    jumlahKolomTabel: 7,
    jumlahAtributJson: pesertaPublik.length
      ? Object.keys(pesertaPublik[0]).length
      : 0,
    pesertaTanpaNama: pesertaTanpaNama,
    pesertaTanpaCabang: pesertaTanpaCabang,
    sekolahBelumTerverifikasi:
      sekolahBelumTerverifikasi,
    pelanggaranSkema: pelanggaranSkema,
    statusUji:
      !pelanggaranSkema &&
      pesertaTanpaNama === 0 &&
      pesertaTanpaCabang === 0
        ? "LOLOS UJI STRUKTUR AWAL"
        : "PERLU PERBAIKAN"
  };

  console.log(
    "=== LAPORAN UJI JSON PUBLIK ==="
  );
  console.log(JSON.stringify(laporan, null, 2));

  // Tidak mencetak nama peserta atau seluruh isi JSON.
  return {
    laporan: laporan,
    jsonPublik: jsonPublik
  };
}

/**
 * Ekspor JSON publik ke Google Drive.
 * Tidak mengirim data ke GitHub.
 *
 * File baru dibuat setiap kali fungsi dijalankan,
 * sehingga file ekspor sebelumnya tidak tertimpa.
 */
function eksporJsonPublikKeDrive() {
  const hasilBaca = bacaSemuaPeserta();

  if (hasilBaca.status !== "berhasil") {
    throw new Error(
      "Ekspor dibatalkan karena ada sumber yang gagal dibaca."
    );
  }

  const pesertaPublik = hasilBaca.peserta.map(item => ({
    nama: item.nama || "",
    cabang_lomba: item.cabang_lomba || "",
    jenjang_sekolah: item.jenjang_sekolah || "",
    kategori: item.kategori || "Belum ditentukan",
    jenis_kelamin: item.jenis_kelamin || "",
    kelas: item.kelas || "",
    asal_sekolah: item.sekolah_perlu_verifikasi
      ? "Belum terverifikasi"
      : (item.asal_sekolah || ""),
    kecamatan: item.kecamatan || ""
  }));

  const ringkasanCabang = {};

  pesertaPublik.forEach(item => {
    ringkasanCabang[item.cabang_lomba] =
      (ringkasanCabang[item.cabang_lomba] || 0) + 1;
  });

  const jsonPublik = {
    versi: "1.0",
    diperbarui_pada: new Date().toISOString(),
    status: "tersedia",
    ringkasan: {
      total_keikutsertaan: pesertaPublik.length,
      total_cabang: KONFIGURASI.sumber.length,
      jumlah_cabang_terdaftar:
        Object.keys(ringkasanCabang).length,
      per_cabang: ringkasanCabang
    },
    peserta: pesertaPublik
  };

  // Validasi dasar sebelum file dibuat.
  const namaKosong = pesertaPublik.filter(
    item => !item.nama.trim()
  ).length;

  const cabangKosong = pesertaPublik.filter(
    item => !item.cabang_lomba.trim()
  ).length;

  const kecamatanKosong = pesertaPublik.filter(
    item => !item.kecamatan.trim()
  ).length;

  const jumlahSekolahBelumTerverifikasi =
    pesertaPublik.filter(
      item => item.asal_sekolah === "Belum terverifikasi"
    ).length;

  if (
    namaKosong > 0 ||
    cabangKosong > 0 ||
    kecamatanKosong > 0
  ) {
    throw new Error(
      "Ekspor dibatalkan: ada nama, cabang, atau kecamatan kosong."
    );
  }

  if (pesertaPublik.length !== 282) {
    throw new Error(
      "Ekspor dibatalkan: jumlah peserta tidak sesuai hasil audit terakhir. " +
      "Jumlah saat ini: " + pesertaPublik.length
    );
  }

  if (jumlahSekolahBelumTerverifikasi !== 25) {
    throw new Error(
      "Ekspor dibatalkan: jumlah sekolah belum terverifikasi berubah. " +
      "Jumlah saat ini: " + jumlahSekolahBelumTerverifikasi
    );
  }

  const isiJson = JSON.stringify(jsonPublik, null, 2);
  const namaFile = "rekap-pendaftaran.json";

  // Membuat file baru; tidak menimpa ekspor sebelumnya.
  const file = DriveApp.createFile(
    namaFile,
    isiJson,
    MimeType.PLAIN_TEXT
  );

  const laporan = {
    status: "BERHASIL",
    namaFile: file.getName(),
    idFile: file.getId(),
    jumlahPeserta: pesertaPublik.length,
    jumlahCabangTerdaftar:
      Object.keys(ringkasanCabang).length,
    jumlahSekolahBelumTerverifikasi:
      jumlahSekolahBelumTerverifikasi,
    ukuranKarakterJson: isiJson.length,
    urlDrive: file.getUrl()
  };

  console.log(JSON.stringify(laporan, null, 2));

  return laporan;
}

function auditPerubahanJumlahPeserta() {
  const hasil = bacaSemuaPeserta();
  const perCabang = {};
  const barisSumberBeregu = {};

  hasil.peserta.forEach(item => {
    const cabang = item.cabang_lomba || "Tidak diketahui";

    if (!perCabang[cabang]) {
      perCabang[cabang] = 0;
    }
    perCabang[cabang]++;

    if (item.hasil_pemisahan_nama === true) {
      const kunci = cabang + ":" + item.baris_sumber;
      barisSumberBeregu[kunci] =
        (barisSumberBeregu[kunci] || 0) + 1;
    }
  });

  const laporan = {
    judul: "Audit Perubahan Jumlah Peserta",
    statusPembacaan: hasil.status,
    jumlahSumber: hasil.jumlahSumber,
    totalPeserta: hasil.jumlahPeserta,
    jumlahCabangTerdaftar: Object.keys(perCabang).length,
    perCabang: perCabang,
    jumlahBarisBeregu: Object.keys(barisSumberBeregu).length,
    jumlahPotonganBeregu: Object.values(barisSumberBeregu)
      .reduce((total, jumlah) => total + jumlah, 0),
    kesalahan: hasil.kesalahan
  };

  console.log(JSON.stringify(laporan, null, 2));
  return laporan;
}

function auditFinalBarisSeniTari() {
  const sumber = KONFIGURASI.sumber.find(
    item => item.kode === "SENI_TARI"
  );

  if (!sumber) {
    throw new Error("Sumber Seni Tari tidak ditemukan.");
  }

  const spreadsheet = SpreadsheetApp.openById(sumber.id);
  const sheet = ambilSheetBerdasarkanGid(
    spreadsheet,
    sumber.gid
  );

  const data = sheet.getDataRange().getDisplayValues();
  const peta = petakanHeader(data[0]);

  const hasil = [5, 18].map(nomorBaris => {
    if (nomorBaris > data.length) {
      return {
        baris: nomorBaris,
        status: "BARIS TIDAK DITEMUKAN"
      };
    }

    const nilaiNama = String(
      data[nomorBaris - 1][peta.nama] || ""
    ).trim();

    const potongan = nilaiNama
      .split(/\s*,\s*|\s+dan\s+/i)
      .map(item => item.replace(/^\s*\d+\s*\.\s*/, "").trim())
      .filter(Boolean);

    return {
      baris: nomorBaris,
      kolomNama: data[0][peta.nama],
      selNamaTerisi: Boolean(nilaiNama),
      panjangTeks: nilaiNama.length,
      jumlahPotonganNama: potongan.length,
      panjangSetiapPotongan: potongan.map(item => item.length),
      status: potongan.length > 1
        ? "KANDIDAT NAMA BEREGU"
        : "BUKAN NAMA BEREGU BERDASARKAN PEMISAH"
    };
  });

  console.log(JSON.stringify({
    judul: "Audit Final Baris Seni Tari",
    waktuAudit: new Date().toISOString(),
    hasil: hasil
  }, null, 2));

  return hasil;
}

/**
 * AUDIT TIMESTAMP SELURUH CABANG
 * Versi 1.0.0
 *
 * Mode baca-saja:
 * - Tidak mengubah spreadsheet sumber.
 * - Tidak mencatat timestamp individual.
 * - Memeriksa kelengkapan dan duplikasi timestamp.
 */
function auditTimestampSeluruhCabang() {
  const laporan = [];

  let totalRespons = 0;
  let totalTimestampKosong = 0;
  let totalTimestampTidakValid = 0;
  let totalTimestampDuplikat = 0;
  let sumberBerhasil = 0;
  let sumberGagal = 0;

  KONFIGURASI.sumber.forEach(sumber => {
    try {
      const spreadsheet = SpreadsheetApp.openById(sumber.id);

      const sheet = ambilSheetBerdasarkanGid(
        spreadsheet,
        sumber.gid
      );

      const data = sheet.getDataRange().getValues();
      const tampilan = sheet.getDataRange().getDisplayValues();

      if (!data.length || !data[0].length) {
        throw new Error("Sumber tidak memiliki data.");
      }

      const header = tampilan[0].map(normalisasiHeader);

      const indeksTimestamp = header.findIndex(
        item => item === "timestamp"
      );

      if (indeksTimestamp === -1) {
        throw new Error("Kolom Timestamp tidak ditemukan.");
      }

      const daftarTimestamp = new Map();

      let responsDiperiksa = 0;
      let timestampKosong = 0;
      let timestampTidakValid = 0;
      let timestampDuplikat = 0;

      for (let i = 1; i < data.length; i++) {
        const seluruhBaris = tampilan[i];

        // Abaikan baris yang benar-benar kosong.
        if (!seluruhBaris.some(
          nilai => String(nilai || "").trim()
        )) {
          continue;
        }

        responsDiperiksa++;

        const nilaiTimestamp = data[i][indeksTimestamp];

        if (
          nilaiTimestamp === "" ||
          nilaiTimestamp === null ||
          typeof nilaiTimestamp === "undefined"
        ) {
          timestampKosong++;
          continue;
        }

        // Timestamp Google Forms normalnya dibaca
        // sebagai objek Date oleh getValues().
        if (
          !(nilaiTimestamp instanceof Date) ||
          isNaN(nilaiTimestamp.getTime())
        ) {
          timestampTidakValid++;
          continue;
        }

        const kunciTimestamp = String(
          nilaiTimestamp.getTime()
        );

        if (daftarTimestamp.has(kunciTimestamp)) {
          timestampDuplikat++;
        } else {
          daftarTimestamp.set(kunciTimestamp, true);
        }
      }

      totalRespons += responsDiperiksa;
      totalTimestampKosong += timestampKosong;
      totalTimestampTidakValid += timestampTidakValid;
      totalTimestampDuplikat += timestampDuplikat;

      sumberBerhasil++;

      laporan.push({
        kode: sumber.kode,
        cabang: sumber.nama,
        status: "BERHASIL",
        responsDiperiksa: responsDiperiksa,
        timestampKosong: timestampKosong,
        timestampTidakValid: timestampTidakValid,
        timestampDuplikat: timestampDuplikat,
        timestampUnik: daftarTimestamp.size
      });

    } catch (error) {
      sumberGagal++;

      laporan.push({
        kode: sumber.kode,
        cabang: sumber.nama,
        status: "GAGAL",
        pesan: error.message
      });
    }
  });

  const hasilAkhir = {
    judul: "Audit Timestamp PORSENI Pelajar Melawi 2026",
    versi: "1.0.0",
    waktuAudit: new Date().toISOString(),

    jumlahSumber: KONFIGURASI.sumber.length,
    sumberBerhasil: sumberBerhasil,
    sumberGagal: sumberGagal,

    totalRespons: totalRespons,
    totalTimestampKosong: totalTimestampKosong,
    totalTimestampTidakValid: totalTimestampTidakValid,
    totalTimestampDuplikat: totalTimestampDuplikat,

    statusAudit:
      sumberGagal === 0 &&
      totalTimestampKosong === 0 &&
      totalTimestampTidakValid === 0 &&
      totalTimestampDuplikat === 0
        ? "LULUS PEMERIKSAAN AWAL"
        : "PERLU PEMERIKSAAN LANJUTAN",

    hasilPerCabang: laporan
  };

  console.log(JSON.stringify(hasilAkhir, null, 2));

  return hasilAkhir;
}

/**
 * AUDIT PEMETAAN NISN INDIVIDUAL
 * Versi 1.0.0
 *
 * Mode baca-saja.
 * Tidak mengubah sumber dan tidak mencatat
 * nama maupun nilai NISN ke Execution Log.
 */
function auditPemetaanNisnSeluruhCabang() {
  const laporan = [];

  let totalRespons = 0;
  let totalPesertaTerdeteksi = 0;
  let totalNisnTerdeteksi = 0;

  let responsSesuai = 0;
  let responsTidakSesuai = 0;
  let responsNisnKosong = 0;
  let responsTanpaKolomNisn = 0;
  let responsPerluVerifikasi = 0;

  let sumberBerhasil = 0;
  let sumberGagal = 0;

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

  KONFIGURASI.sumber.forEach(sumber => {
    try {
      const spreadsheet = SpreadsheetApp.openById(sumber.id);

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

      // Pemetaan NISN dilakukan secara khusus.
      const kandidatNisn = [];

      header.forEach((nilai, indeks) => {
        const normal = normalisasiHeader(nilai);

        if (
          normal === "nisn" ||
          normal.includes(" nisn") ||
          normal.startsWith("nisn ")
        ) {
          kandidatNisn.push(indeks);
        }
      });

      if (peta.nama < 0) {
        throw new Error("Kolom nama tidak ditemukan.");
      }

      const kolomNisnTersedia =
        kandidatNisn.length === 1;

      const indeksNisn = kolomNisnTersedia
        ? kandidatNisn[0]
        : -1;

      let responsDiperiksa = 0;
      let pesertaTerdeteksi = 0;
      let nisnTerdeteksi = 0;

      let responsSesuaiCabang = 0;
      let responsTidakSesuaiCabang = 0;
      let responsKosongCabang = 0;
      let responsPerluVerifikasiCabang = 0;

      for (let i = 1; i < data.length; i++) {
        const baris = data[i];

        if (!baris.some(
          nilai => String(nilai || "").trim()
        )) {
          continue;
        }

        const namaAsli = String(
          baris[peta.nama] || ""
        ).trim();

        if (!namaAsli) {
          continue;
        }

        responsDiperiksa++;

        const nomorBaris = i + 1;

        const aturanCabang =
          aturanPemisahan[sumber.kode] || {};

        const polaNama =
          aturanCabang[nomorBaris] || null;

        const namaPeserta = pisahkanNamaPeserta(
          namaAsli,
          polaNama
        );

        const jumlahNama = namaPeserta.length;

        pesertaTerdeteksi += jumlahNama;

        if (!kolomNisnTersedia) {
          responsTidakSesuaiCabang++;
          responsPerluVerifikasiCabang++;
          continue;
        }

        const nilaiNisn = String(
          baris[indeksNisn] || ""
        ).trim();

        if (!nilaiNisn) {
          responsKosongCabang++;
          responsTidakSesuaiCabang++;
          responsPerluVerifikasiCabang++;
          continue;
        }

        /*
         * Menghitung kelompok angka untuk audit.
         * Tidak ada pembatasan panjang digit NISN.
         * Nilai NISN asli tidak diubah.
         */
        const kelompokNisn = nilaiNisn
          .replace(/(?:^|\s)\d+\s*[.)]\s*/g, " ")
          .match(/\d+/g) || [];

        const jumlahNisn = kelompokNisn.length;

        nisnTerdeteksi += jumlahNisn;

        if (jumlahNama === jumlahNisn) {
          responsSesuaiCabang++;
        } else {
          responsTidakSesuaiCabang++;
          responsPerluVerifikasiCabang++;
        }
      }

      if (!kolomNisnTersedia) {
        responsTanpaKolomNisn++;
      }

      totalRespons += responsDiperiksa;
      totalPesertaTerdeteksi += pesertaTerdeteksi;
      totalNisnTerdeteksi += nisnTerdeteksi;

      responsSesuai += responsSesuaiCabang;
      responsTidakSesuai += responsTidakSesuaiCabang;
      responsNisnKosong += responsKosongCabang;
      responsPerluVerifikasi += responsPerluVerifikasiCabang;

      sumberBerhasil++;

      laporan.push({
        kode: sumber.kode,
        cabang: sumber.nama,
        status: "BERHASIL",
        kolomNisnDitemukan: kolomNisnTersedia,
        jumlahKandidatKolomNisn: kandidatNisn.length,
        responsDiperiksa: responsDiperiksa,
        pesertaTerdeteksi: pesertaTerdeteksi,
        nisnTerdeteksi: nisnTerdeteksi,
        responsSesuai: responsSesuaiCabang,
        responsTidakSesuai: responsTidakSesuaiCabang,
        responsNisnKosong: responsKosongCabang,
        responsPerluVerifikasi: responsPerluVerifikasiCabang
      });

    } catch (error) {
      sumberGagal++;

      laporan.push({
        kode: sumber.kode,
        cabang: sumber.nama,
        status: "GAGAL",
        pesan: error.message
      });
    }
  });

  const hasilAkhir = {
    judul: "Audit Pemetaan NISN Individual PORSENI",
    versi: "1.1.0",
    waktuAudit: new Date().toISOString(),

    jumlahSumber: KONFIGURASI.sumber.length,
    sumberBerhasil: sumberBerhasil,
    sumberGagal: sumberGagal,

    totalRespons: totalRespons,
    totalPesertaTerdeteksi: totalPesertaTerdeteksi,
    totalNisnTerdeteksi: totalNisnTerdeteksi,

    responsSesuai: responsSesuai,
    responsTidakSesuai: responsTidakSesuai,
    responsNisnKosong: responsNisnKosong,
    responsTanpaKolomNisn: responsTanpaKolomNisn,
    responsPerluVerifikasi: responsPerluVerifikasi,

    statusAudit:
      sumberGagal === 0 &&
      responsTidakSesuai === 0 &&
      responsTanpaKolomNisn === 0
        ? "SESUAI SECARA STRUKTUR - PERLU VERIFIKASI INDIVIDUAL"
        : "PERLU PEMERIKSAAN LANJUTAN",

    hasilPerCabang: laporan
  };

  console.log(JSON.stringify(hasilAkhir, null, 2));

  return hasilAkhir;
}

function auditDetailKetidaksesuaianNisnSeniTari() {
  const sumber = KONFIGURASI.sumber.find(
    item => item.kode === "SENI_TARI"
  );

  if (!sumber) {
    throw new Error("Sumber Seni Tari tidak ditemukan.");
  }

  const spreadsheet = SpreadsheetApp.openById(sumber.id);
  const sheet = ambilSheetBerdasarkanGid(
    spreadsheet,
    sumber.gid
  );

  const data = sheet.getDataRange().getDisplayValues();
  const header = data[0].map(normalisasiHeader);
  const peta = petakanHeader(data[0]);

  const kandidatNisn = [];

  header.forEach((nilai, indeks) => {
    if (
      nilai === "nisn" ||
      nilai.includes(" nisn") ||
      nilai.startsWith("nisn ")
    ) {
      kandidatNisn.push(indeks);
    }
  });

  if (peta.nama < 0 || kandidatNisn.length !== 1) {
    throw new Error(
      "Pemetaan kolom nama atau NISN tidak valid."
    );
  }

  const indeksNisn = kandidatNisn[0];
  const hasil = [];

  let totalRespons = 0;
  let totalNama = 0;
  let totalNisn = 0;

  for (let i = 1; i < data.length; i++) {
    const baris = data[i];

    if (!baris.some(
      nilai => String(nilai || "").trim()
    )) {
      continue;
    }

    const namaAsli = String(
      baris[peta.nama] || ""
    ).trim();

    if (!namaAsli) continue;

    totalRespons++;

    const polaNama = i + 1 === 5
      ? /\s*,\s*|\s+dan\s+/i
      : null;

    const namaPeserta = (
      polaNama
        ? namaAsli.split(polaNama)
        : [namaAsli]
    )
      .map(nama =>
        nama.replace(/^\s*\d+\s*\.\s*/, "").trim()
      )
      .filter(Boolean);

    const nilaiNisn = String(
      baris[indeksNisn] || ""
    ).trim();

    const kelompokNisn = nilaiNisn
      .replace(/(?:^|\s)\d+\s*[.)]\s*/g, " ")
      .match(/\d+/g) || [];

    totalNama += namaPeserta.length;
    totalNisn += kelompokNisn.length;

    if (namaPeserta.length !== kelompokNisn.length) {
      hasil.push({
        barisSumber: i + 1,
        jumlahNama: namaPeserta.length,
        jumlahNisn: kelompokNisn.length,
        selisih: kelompokNisn.length - namaPeserta.length,
        status: "PERLU PEMERIKSAAN"
      });
    }
  }

  const laporan = {
    judul: "Audit Detail Ketidaksesuaian NISN Seni Tari",
    jumlahRespons: totalRespons,
    totalNama: totalNama,
    totalNisn: totalNisn,
    jumlahBarisBermasalah: hasil.length,
    hasil: hasil
  };

  console.log(JSON.stringify(laporan, null, 2));

  return laporan;
}
/**
 * WEB APP ROUTER — KARTU PESERTA PORSENI
 * Tidak mengubah Registry atau sumber data.
 */
function doGet(e) {
  const halaman = e && e.parameter
    ? e.parameter.halaman
    : "";

  if (halaman === "kartu-peserta") {
    return tampilkanKartuPeserta();
  }

  return HtmlService.createHtmlOutput(
    "<h2>PORSENI PELAJAR MELAWI 2026</h2>" +
    "<p>Halaman utama website.</p>" +
    "<p><a href='?halaman=kartu-peserta'>" +
    "Buka Kartu Peserta</a></p>"
  ).setTitle("PORSENI Pelajar Melawi 2026");
}