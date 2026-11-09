
(function (global) {
    "use strict";

    const JUMLAH_PER_HALAMAN = 20;

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

    const CABANG_LOMBA = [
        "Bola Voli",
        "Sepak Bola Mini",
        "Atletik",
        "Catur",
        "Tenis Meja",
        "Karate",
        "Menyanyi Solo",
        "Baca Puisi",
        "Pantomim",
        "Seni Tari",
        "Mendongeng",
        "Menulis Cerita",
        "Seni Kriya",
        "Gambar Bercerita"
    ];

    let semuaPeserta = [];
    let pesertaTersaring = [];
    let halamanAktif = 1;
    let intervalPembaruanRekap = null;

    function elemen(id) {
        return document.getElementById(id);
    }

    function buatElemen(tag, teks, kelas) {
        const node = document.createElement(tag);

        if (teks !== undefined && teks !== null) {
            node.textContent = String(teks);
        }

        if (kelas) {
            node.className = kelas;
        }

        return node;
    }

    
    function buatKartuStatistik(nama, jumlah) {
        const kartu = buatElemen("div", null, "rekap-statistik-kartu");

        const namaKartu = buatElemen(
            "span",
            nama,
            "rekap-statistik-nama"
        );

        const angka = buatElemen(
            "strong",
            jumlah,
            "rekap-statistik-angka"
        );

        const label = buatElemen(
            "span",
            "Peserta",
            "rekap-statistik-label"
        );

        kartu.append(namaKartu, angka, label);

        return kartu;
    }

    function tampilkanStatistikPeserta() {
        const wadahKecamatan = elemen("rekap-statistik-kecamatan");
        const wadahCabang = elemen("rekap-statistik-cabang");

        if (!wadahKecamatan || !wadahCabang) return;

        wadahKecamatan.replaceChildren();
        wadahCabang.replaceChildren();

        // Menghitung peserta berdasarkan kecamatan
        const jumlahKecamatan = {};

        DAFTAR_KECAMATAN.forEach(kecamatan => {
            jumlahKecamatan[kecamatan.toLocaleLowerCase("id")] = 0;
        });

        // Menghitung peserta berdasarkan cabang lomba
        const jumlahCabang = {};

        CABANG_LOMBA.forEach(cabang => {
            jumlahCabang[cabang.toLocaleLowerCase("id")] = 0;
        });

        semuaPeserta.forEach(peserta => {
            const kecamatan = String(
                peserta.kecamatan || ""
            ).trim().toLocaleLowerCase("id");

            const cabang = String(
                peserta.cabang_lomba || ""
            ).trim().toLocaleLowerCase("id");

            if (Object.prototype.hasOwnProperty.call(
                jumlahKecamatan,
                kecamatan
            )) {
                jumlahKecamatan[kecamatan]++;
            }

            if (Object.prototype.hasOwnProperty.call(
                jumlahCabang,
                cabang
            )) {
                jumlahCabang[cabang]++;
            }
        });

        // Menampilkan 11 kartu kecamatan
        DAFTAR_KECAMATAN.forEach(kecamatan => {
            const jumlah =
                jumlahKecamatan[kecamatan.toLocaleLowerCase("id")] || 0;

            wadahKecamatan.appendChild(
                buatKartuStatistik(kecamatan, jumlah)
            );
        });

        // Menampilkan 14 kartu cabang lomba
        CABANG_LOMBA.forEach(cabang => {
            const jumlah =
                jumlahCabang[cabang.toLocaleLowerCase("id")] || 0;

            wadahCabang.appendChild(
                buatKartuStatistik(cabang, jumlah)
            );
        });
    }


    function tampilkanStatus(pesan, tipe) {
        const status = elemen("rekap-status");
        if (!status) return;

        status.textContent = pesan;
        status.dataset.status = tipe || "info";
    }

    function ambilFilter() {
        return {
            kecamatan: elemen("filter-kecamatan")?.value || "",
            cabang_lomba: elemen("filter-cabang")?.value || "",
            nama: elemen("cari-peserta")?.value || ""
        };
    }

    function terapkanFilter() {
        const filter = ambilFilter();

        pesertaTersaring = global.RekapData.filterPeserta(
            semuaPeserta,
            filter
        );

        halamanAktif = 1;
        tampilkanDaftarPeserta();
        tampilkanInfoHasil();
    }

    function tampilkanInfoHasil() {
        const info = elemen("rekap-info-hasil");
        if (!info) return;

        const total = pesertaTersaring.length;
        const awal = total === 0
            ? 0
            : (halamanAktif - 1) * JUMLAH_PER_HALAMAN + 1;

        const akhir = Math.min(
            halamanAktif * JUMLAH_PER_HALAMAN,
            total
        );

        info.textContent = total === 0
            ? "Tidak ada peserta yang sesuai dengan filter."
            : `Menampilkan ${awal}–${akhir} dari ${total} keikutsertaan.`;
    }

    function buatTabel() {
        const tabel = buatElemen("table");
        tabel.className = "rekap-tabel";

        const kepala = buatElemen("thead");
        const barisKepala = buatElemen("tr");

        const kolom = [
            "Nama Peserta",
            "Cabang Lomba",
            "Jenjang Sekolah",
            "Kategori",
            "Jenis Kelamin",
            "Kelas",
            "Asal Sekolah"
        ];

        kolom.forEach(namaKolom => {
            barisKepala.appendChild(
                buatElemen("th", namaKolom)
            );
        });

        kepala.appendChild(barisKepala);
        tabel.appendChild(kepala);

        const badan = buatElemen("tbody");
        const awal = (halamanAktif - 1) * JUMLAH_PER_HALAMAN;
        const dataHalaman = pesertaTersaring.slice(
            awal,
            awal + JUMLAH_PER_HALAMAN
        );

        dataHalaman.forEach(peserta => {
            const baris = buatElemen("tr");

            const nilaiKolom = [
                peserta.nama,
                peserta.cabang_lomba,
                peserta.jenjang_sekolah,
                peserta.kategori,
                peserta.jenis_kelamin,
                peserta.kelas,
                peserta.asal_sekolah
            ];

            nilaiKolom.forEach(nilai => {
                baris.appendChild(
                    buatElemen("td", nilai || "—")
                );
            });

            badan.appendChild(baris);
        });

        if (dataHalaman.length === 0) {
            const barisKosong = buatElemen("tr");
            const sel = buatElemen(
                "td",
                "Data peserta tidak ditemukan."
            );

            sel.colSpan = 7;
            sel.style.textAlign = "center";
            barisKosong.appendChild(sel);
            badan.appendChild(barisKosong);
        }

        tabel.appendChild(badan);
        return tabel;
    }

    function tampilkanNavigasiHalaman(wadah) {
        const totalHalaman = Math.ceil(
            pesertaTersaring.length / JUMLAH_PER_HALAMAN
        );

        const infoHalaman = elemen("rekap-info-halaman");
        if (!infoHalaman) return;

        infoHalaman.replaceChildren();

        if (totalHalaman <= 1) return;

        const navigasi = buatElemen("div");
        navigasi.className = "rekap-navigasi-halaman";

        const tombolSebelumnya = buatElemen(
            "button",
            "Sebelumnya"
        );
        tombolSebelumnya.type = "button";
        tombolSebelumnya.disabled = halamanAktif === 1;

        tombolSebelumnya.addEventListener("click", () => {
            if (halamanAktif > 1) {
                halamanAktif--;
                tampilkanDaftarPeserta();
                tampilkanInfoHasil();
            }
        });

        const keterangan = buatElemen(
            "span",
            `Halaman ${halamanAktif} dari ${totalHalaman}`
        );

        const tombolBerikutnya = buatElemen(
            "button",
            "Berikutnya"
        );
        tombolBerikutnya.type = "button";
        tombolBerikutnya.disabled =
            halamanAktif >= totalHalaman;

        tombolBerikutnya.addEventListener("click", () => {
            if (halamanAktif < totalHalaman) {
                halamanAktif++;
                tampilkanDaftarPeserta();
                tampilkanInfoHasil();
            }
        });

        navigasi.append(
            tombolSebelumnya,
            keterangan,
            tombolBerikutnya
        );

        infoHalaman.appendChild(navigasi);
    }

    function tampilkanDaftarPeserta() {
        const wadah = elemen("rekap-daftar-peserta");
        if (!wadah) return;

        wadah.replaceChildren();

        const pembungkus = buatElemen("div");
        pembungkus.className = "rekap-tabel-wrapper";
        pembungkus.appendChild(buatTabel());

        wadah.appendChild(pembungkus);
        tampilkanNavigasiHalaman(wadah);
    }

    function isiPilihanCabang() {
        const pilihan = elemen("filter-cabang");
        if (!pilihan) return;

        const nilaiSebelumnya = pilihan.value;
        pilihan.replaceChildren();

        pilihan.appendChild(
            new Option("Semua Cabang Lomba", "")
        );

        CABANG_LOMBA.forEach(cabang => {
            pilihan.appendChild(new Option(cabang, cabang));
        });

        pilihan.value = CABANG_LOMBA.includes(nilaiSebelumnya)
            ? nilaiSebelumnya
            : "";
    }

    /* =========================================================
    LIVE DATA PESERTA — GOOGLE APPS SCRIPT
    Sinkronisasi dengan halaman Kartu Peserta
    ========================================================= */

    const URL_DATA_PESERTA =
        "https://script.google.com/macros/s/AKfycbw2Vp1HH3mKF-f43Hhy-LB4P71kHamzWoC6Jy5fzZJAbL0rmV8iF7Jg1B8m74DIx086Zg/exec";


    function ambilDataPesertaLive() {
        return new Promise((resolve, reject) => {

            const callbackName =
                "rekapPorseniCallback_" + Date.now();

            const script = document.createElement("script");

            const url = new URL(URL_DATA_PESERTA);

            url.searchParams.set("halaman", "data-peserta");
            url.searchParams.set("callback", callbackName);
            url.searchParams.set("_", Date.now());

            let selesai = false;

            const timeout = setTimeout(() => {
                cleanup();

                reject(
                    new Error("Waktu pemuatan data peserta habis.")
                );
            }, 30000);

            function cleanup() {
                if (selesai) return;

                selesai = true;

                clearTimeout(timeout);
                script.remove();

                delete window[callbackName];
            }

            window[callbackName] = function(data) {

                if (!data || !Array.isArray(data.peserta)) {
                    cleanup();

                    reject(
                        new Error("Format data peserta tidak valid.")
                    );

                    return;
                }

                cleanup();
                resolve(data);
            };

            script.onerror = function() {
                cleanup();

                reject(
                    new Error("Gagal terhubung ke Google Apps Script.")
                );
            };

            script.src = url.toString();
            script.async = true;

            document.head.appendChild(script);
        });
    }


    /* =========================================================
    MEMUAT DAN MEMPERBARUI DATA REKAP
    ========================================================= */

    async function muatDataPesertaLive() {

        try {

            const data = await ambilDataPesertaLive();

            semuaPeserta = global.RekapData.normalisasiDaftar(
                data.peserta
            );

            // Perbarui statistik kecamatan dan cabang lomba
            tampilkanStatistikPeserta();

            // Perbarui tabel dan jumlah keikutsertaan
            terapkanFilter();

            const waktuPembaruan = new Date().toLocaleTimeString(
                "id-ID",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );

            tampilkanStatus(
                `Data peserta live berhasil dimuat: ${semuaPeserta.length} keikutsertaan. Terakhir diperbarui ${waktuPembaruan} WIB.`,
                "siap"
            );

            console.info(
                `[Rekap Live] ${semuaPeserta.length} peserta berhasil dimuat.`
            );

            return true;

        } catch (error) {

            console.error(
                "[Rekap Live] Gagal memperbarui data:",
                error
            );

            tampilkanStatus(
                "Data peserta belum dapat diperbarui. Periksa koneksi internet.",
                "error"
            );

            return false;
        }
    }

    async function mulaiRekapPendaftaran() {
        if (!global.RekapData) {
            tampilkanStatus(
                "Modul pengolahan data belum tersedia.",
                "error"
            );
            return;
        }

        const wadah = elemen("rekap-daftar-peserta");

        if (!wadah) {
            console.error(
                "[Rekap] Elemen daftar peserta tidak ditemukan."
            );
            return;
        }

        const filterKecamatan = elemen("filter-kecamatan");
        const filterCabang = elemen("filter-cabang");
        const cariNama = elemen("cari-peserta");

        if (filterKecamatan) {
            filterKecamatan.addEventListener(
                "change",
                terapkanFilter
            );
        }

        if (filterCabang) {
            filterCabang.addEventListener(
                "change",
                terapkanFilter
            );
        }

        if (cariNama) {
            cariNama.addEventListener(
                "input",
                terapkanFilter
            );
        }

        isiPilihanCabang();
        tampilkanStatus("Sedang memuat data peserta...", "info");

        /* =========================================================
        PEMUATAN AWAL DATA PESERTA LIVE
        ========================================================= */

        await muatDataPesertaLive();


        /* =========================================================
        PEMBARUAN OTOMATIS SETIAP 60 DETIK
        ========================================================= */

        if (!intervalPembaruanRekap) {

            intervalPembaruanRekap = setInterval(
                muatDataPesertaLive,
                60000
            );

        }
    }

    global.mulaiRekapPendaftaran = mulaiRekapPendaftaran;

})(window);
