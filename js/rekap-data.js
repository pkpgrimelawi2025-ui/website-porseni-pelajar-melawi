
/* =========================================================
   REKAP DATA PORSENI PELAJAR MELAWI 2026
   File: js/rekap-data.js
   Tugas: Normalisasi data dan penghitungan keikutsertaan
   ========================================================= */

(function (global) {
    "use strict";

    const TOTAL_CABANG = 14;

    function teksAman(nilai) {
        if (nilai === null || nilai === undefined) {
            return "";
        }

        return String(nilai)
            .replace(/\s+/g, " ")
            .trim();
    }

    function normalisasiKategori(kategori, jenisKelamin) {
        const nilaiKategori = teksAman(kategori);

        if (nilaiKategori) {
            return nilaiKategori;
        }

        const gender = teksAman(jenisKelamin).toLowerCase();

        if (["laki-laki", "laki laki", "putra", "l"].includes(gender)) {
            return "Putra";
        }

        if (["perempuan", "putri", "p"].includes(gender)) {
            return "Putri";
        }

        return "Belum ditentukan";
    }

    /*
     * Satu objek = satu individu pada satu cabang lomba.
     * Fungsi ini tidak melakukan deduplikasi lintas cabang.
     */
    function normalisasiPeserta(data) {
        if (!data || typeof data !== "object") {
            return null;
        }

        const nama = teksAman(data.nama);
        const cabang = teksAman(data.cabang_lomba);

        if (!nama || !cabang) {
            return null;
        }

        return {
            nama: nama,
            cabang_lomba: cabang,
            jenjang_sekolah: teksAman(data.jenjang_sekolah),
            kategori: normalisasiKategori(
                data.kategori,
                data.jenis_kelamin
            ),
            jenis_kelamin: teksAman(data.jenis_kelamin),
            kelas: teksAman(data.kelas),
            asal_sekolah: teksAman(data.asal_sekolah),
            kecamatan: teksAman(data.kecamatan)
        };
    }

    function normalisasiDaftar(daftar) {
        if (!Array.isArray(daftar)) {
            return [];
        }

        return daftar
            .map(normalisasiPeserta)
            .filter(Boolean);
    }

    function hitungRingkasan(daftar) {
        const peserta = normalisasiDaftar(daftar);
        const perCabang = {};
        const perKecamatan = {};

        peserta.forEach(function (item) {
            perCabang[item.cabang_lomba] =
                (perCabang[item.cabang_lomba] || 0) + 1;

            const kecamatan = item.kecamatan || "Belum diketahui";

            perKecamatan[kecamatan] =
                (perKecamatan[kecamatan] || 0) + 1;
        });

        return {
            total_keikutsertaan: peserta.length,
            total_cabang: TOTAL_CABANG,
            jumlah_cabang_terdaftar: Object.keys(perCabang).length,
            per_cabang: perCabang,
            per_kecamatan: perKecamatan
        };
    }

    function filterPeserta(daftar, pilihan) {
        const peserta = normalisasiDaftar(daftar);
        const filter = pilihan || {};

        const namaCari = teksAman(filter.nama).toLowerCase();
        const cabangCari = teksAman(filter.cabang_lomba).toLowerCase();
        const kecamatanCari = teksAman(filter.kecamatan).toLowerCase();

        return peserta.filter(function (item) {
            const cocokNama = !namaCari ||
                item.nama.toLowerCase().includes(namaCari);

            const cocokCabang = !cabangCari ||
                item.cabang_lomba.toLowerCase() === cabangCari;

            const cocokKecamatan = !kecamatanCari ||
                item.kecamatan.toLowerCase() === kecamatanCari;

            return cocokNama && cocokCabang && cocokKecamatan;
        });
    }

    global.RekapData = Object.freeze({
        normalisasiPeserta: normalisasiPeserta,
        normalisasiDaftar: normalisasiDaftar,
        hitungRingkasan: hitungRingkasan,
        filterPeserta: filterPeserta
    });
})(window);
