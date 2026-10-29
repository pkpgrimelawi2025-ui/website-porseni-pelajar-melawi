
const dataCabangLomba = {
    olahraga: [
        {
            nama: "Bola Voli",
            kategori: "Olahraga",
            link: "https://forms.gle/mqPMz87JkykkNUih7"
        },
        {
            nama: "Sepak Bola Mini",
            kategori: "Olahraga",
            link: "https://forms.gle/Co2SXbVwXUxgKk4k8"
        },
        {
            nama: "Atletik",
            kategori: "Olahraga",
            link: "https://forms.gle/mdtdczAfoevcBj1T7"
        },
        {
            nama: "Catur",
            kategori: "Olahraga",
            link: "https://forms.gle/gXwTH2sdmQckqQue6"
        },
        {
            nama: "Tenis Meja",
            kategori: "Olahraga",
            link: "https://forms.gle/qEBtwDDhC2yjFQUX9"
        },
        {
            nama: "Karate",
            kategori: "Olahraga",
            link: "https://forms.gle/ddGsTgSjfj9QLeXq8"
        }
    ],

    seni: [
        {
            nama: "Menyanyi Solo",
            kategori: "Seni",
            link: "https://forms.gle/7eoyatAdYVNBZfdC8"
        },
        {
            nama: "Baca Puisi",
            kategori: "Seni",
            link: "https://forms.gle/3DHaDjUzMNofAojC8"
        },
        {
            nama: "Pantomim",
            kategori: "Seni",
            link: "https://forms.gle/exBMwKwrQYJ9dAnR9"
        },
        {
            nama: "Seni Tari",
            kategori: "Seni",
            link: "https://forms.gle/e6hbGXzhuMmciS168"
        },
        {
            nama: "Mendongeng",
            kategori: "Seni",
            link: "https://forms.gle/rq3uRzuYPEx15nsm6"
        },
        {
            nama: "Menulis Cerita",
            kategori: "Seni",
            link: "https://forms.gle/Z24LfzapKKiGvQCo8"
        },
        {
            nama: "Seni Kriya",
            kategori: "Seni",
            link: "https://forms.gle/8xw9wViRPvMkqLYv8"
        },
        {
            nama: "Gambar Bercerita",
            kategori: "Seni",
            link: "https://forms.gle/S7CabNpGQvUxDFVZ8"
        }
    ]
};


function buatKartuLomba(daftarLomba) {
    return daftarLomba.map((lomba, index) => `
        <article class="kartu-lomba">
            <div class="nomor-lomba">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <p class="kategori-lomba">${lomba.kategori}</p>

            <h3>${lomba.nama}</h3>

            <a
                class="tombol-daftar"
                href="${lomba.link}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Daftar Sekarang
                <span aria-hidden="true">↗</span>
            </a>
        </article>
    `).join("");
}


function tampilkanKartuLomba() {
    const wadahOlahraga = document.getElementById("daftar-olahraga");
    const wadahSeni = document.getElementById("daftar-seni");

    if (!wadahOlahraga || !wadahSeni) {
        console.warn("Area pendaftaran lomba belum ditemukan.");
        return;
    }

    wadahOlahraga.innerHTML = buatKartuLomba(dataCabangLomba.olahraga);
    wadahSeni.innerHTML = buatKartuLomba(dataCabangLomba.seni);
}

document.addEventListener("DOMContentLoaded", tampilkanKartuLomba);


function bukaKategoriLomba(kategori) {
    const areaOlahraga = document.getElementById("pendaftaran-olahraga");
    const areaSeni = document.getElementById("pendaftaran-seni");

    if (!areaOlahraga || !areaSeni) {
        console.warn("Area pendaftaran belum tersedia.");
        return;
    }

    areaOlahraga.hidden = kategori !== "olahraga";
    areaSeni.hidden = kategori !== "seni";

    const areaTujuan =
        kategori === "olahraga" ? areaOlahraga : areaSeni;

    areaTujuan.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function kembaliKeCabangLomba() {
    const areaOlahraga = document.getElementById("pendaftaran-olahraga");
    const areaSeni = document.getElementById("pendaftaran-seni");
    const bagianCabang = document.getElementById("cabang");

    if (areaOlahraga) {
        areaOlahraga.hidden = true;
    }

    if (areaSeni) {
        areaSeni.hidden = true;
    }

    if (bagianCabang) {
        bagianCabang.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

/* =========================================
   MEMUAT LOGO INSTANSI
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const wadahLogo = document.getElementById("wadah-logo");

    if (!wadahLogo) {
        console.error("Elemen wadah-logo tidak ditemukan.");
        return;
    }

    fetch("logos.html")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("File logos.html gagal dimuat.");
            }

            return response.text();
        })
        .then(function (html) {
            wadahLogo.innerHTML = html;
            console.log("Logo instansi berhasil dimuat.");
        })
        .catch(function (error) {
            console.error("Gagal memuat logo instansi:", error);
        });
});
