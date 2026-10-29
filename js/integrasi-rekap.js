
document.addEventListener("DOMContentLoaded", async function () {
    "use strict";

    const wadahRekap = document.getElementById(
        "wadah-rekap-pendaftaran"
    );

    if (!wadahRekap) {
        console.warn(
            "[Integrasi Rekap] Wadah rekap belum tersedia di index.html."
        );
        return;
    }

    if (typeof window.muatKomponen !== "function") {
        console.error(
            "[Integrasi Rekap] Fungsi muatKomponen belum tersedia."
        );
        return;
    }

    const berhasil = await window.muatKomponen({
        sumber: "components/rekap-pendaftaran.html",
        target: "#wadah-rekap-pendaftaran",
        pesanGagal: "Bagian rekap pendaftaran belum dapat dimuat."
    });

    if (!berhasil) return;

    if (typeof window.mulaiRekapPendaftaran !== "function") {
        console.error(
            "[Integrasi Rekap] Modul tampilan belum tersedia."
        );
        return;
    }

    await window.mulaiRekapPendaftaran();
});
