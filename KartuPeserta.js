
/**
 * ==========================================================
 * MODUL: KARTU PESERTA PORSENI PELAJAR MELAWI 2026
 * Versi: 1.0.0
 * Fungsi: Membaca JSON publik dan menyiapkan data kartu
 * ==========================================================
 */

/**
 * Mengambil JSON publik dari fungsi yang sudah tersedia.
 * Tidak membaca ulang spreadsheet sumber secara langsung.
 */
function kartuPesertaAmbilJsonPublik() {
  const hasil = ujiBentukJsonPublik();

  if (
    !hasil ||
    !hasil.jsonPublik ||
    !Array.isArray(hasil.jsonPublik.peserta)
  ) {
    throw new Error(
      "JSON publik tidak valid atau peserta tidak ditemukan."
    );
  }

  return hasil.jsonPublik;
}

/**
 * Menyiapkan daftar kartu peserta.
 *
 * Setiap entri tetap diperlakukan sebagai partisipasi terpisah.
 * Tidak melakukan deduplikasi berdasarkan nama.
 */
function kartuPesertaAmbilSemua() {
  const jsonPublik = kartuPesertaAmbilJsonPublik();

  const peserta = jsonPublik.peserta;

  const daftarKartu = peserta.map(function(item, index) {
    const nomor = String(index + 1).padStart(4, "0");

    return {
      id_kartu: "PORSENI2026-" + nomor,
      nomor_urut: index + 1,

      nama: item.nama || "",
      cabang_lomba: item.cabang_lomba || "",
      jenjang_sekolah: item.jenjang_sekolah || "",
      kategori: item.kategori || "",
      jenis_kelamin: item.jenis_kelamin || "",
      kelas: item.kelas || "",
      asal_sekolah: item.asal_sekolah || "",
      kecamatan: item.kecamatan || ""
    };
  });

  return {
    status: "berhasil",
    versi_json: jsonPublik.versi || "",
    diperbarui_pada: jsonPublik.diperbarui_pada || "",
    total_kartu: daftarKartu.length,
    kartu: daftarKartu
  };
}

/**
 * Uji ringkas data kartu.
 * Tidak menampilkan nama peserta di log.
 */
function kartuPesertaUjiData() {
  const hasil = kartuPesertaAmbilSemua();

  const laporan = {
    status: hasil.status,
    totalKartu: hasil.total_kartu,
    jumlahIDUnik: new Set(
      hasil.kartu.map(function(item) {
        return item.id_kartu;
      })
    ).size,
    kartuPertama: hasil.kartu.length
      ? hasil.kartu[0].id_kartu
      : null,
    kartuTerakhir: hasil.kartu.length
      ? hasil.kartu[hasil.kartu.length - 1].id_kartu
      : null
  };

  console.log(JSON.stringify(laporan, null, 2));

  return laporan;
}
/**
 * UJI TAMPILAN KARTU PESERTA
 * Menghubungkan data dari KartuPeserta.gs
 * ke file Kartu-Peserta.html
 */
function tampilkanKartuPeserta() {
  const template = HtmlService.createTemplateFromFile(
    "Kartu-Peserta"
  );

  template.dataKartu = kartuPesertaAmbilSemua();

  return template
    .evaluate()
    .setTitle("Kartu Peserta PORSENI Pelajar Melawi 2026")
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}