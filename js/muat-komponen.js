
/* ==================================================
   COMPONENT LOADER
   Website PORSENI Pelajar Melawi 2026
   File: js/muat-komponen.js
   ================================================== */

async function muatKomponen({
    sumber,
    target,
    pesanGagal = "Komponen belum dapat dimuat."
}) {
    const wadah = document.querySelector(target);

    if (!wadah) {
        console.warn(
            `[Component Loader] Target tidak ditemukan: ${target}`
        );
        return false;
    }

    try {
        const respons = await fetch(sumber, {
            cache: "no-cache"
        });

        if (!respons.ok) {
            throw new Error(`HTTP ${respons.status}`);
        }

        const html = await respons.text();

        if (!html.trim()) {
            throw new Error("Konten komponen kosong.");
        }

        wadah.innerHTML = html;

        console.info(
            `[Component Loader] Berhasil memuat: ${sumber}`
        );

        return true;
    } catch (error) {
        console.error(
            `[Component Loader] Gagal memuat ${sumber}:`,
            error
        );

        wadah.textContent = pesanGagal;
        return false;
    }
}
window.muatKomponen = muatKomponen;