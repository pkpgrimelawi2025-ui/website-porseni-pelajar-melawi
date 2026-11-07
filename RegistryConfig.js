
/**
 * REGISTRY PORSENI 2026
 * RegistryConfig.gs
 * Schema 1.0
 *
 * Mode awal: DRY_RUN
 * Sumber data: belum diaktifkan
 */

const REGISTRY_CONFIG = Object.freeze({
  registryName: "registry_porseni_2026",
  mode: "LIVE", // DRY_RUN atau LIVE
  schemaVersion: "1.0",

  createIfMissing: true,
  modifyExistingData: false,
  sourceDataEnabled: false,

  backupFolderId: "1tWggjwp4XtgvUxlzUa4YlyeiQ-df59dK",
  backupEnabled: true,

  scriptPropertyKey: "PORSENI_REGISTRY_SPREADSHEET_ID",

  sheets: [
    {
      name: "registry_respons",
      headers: [
        "id_respons",
        "kode_cabang",
        "source_spreadsheet_id",
        "source_gid",
        "source_timestamp_raw",
        "source_timestamp_key",
        "source_row_initial",
        "source_row_latest",
        "response_fingerprint",
        "status_registry",
        "created_at",
        "updated_at",
        "last_sync_at"
      ]
    },
    {
      name: "registry_peserta",
      headers: [
        "id_peserta",
        "nama_awal",
        "nama_terkini",
        "nisn_raw",
        "nisn_fingerprint",
        "status_registry",
        "created_at",
        "updated_at",
        "last_sync_at"
      ]
    },
    {
      name: "registry_partisipasi",
      headers: [
        "id_partisipasi",
        "id_peserta",
        "id_respons",
        "kode_cabang",
        "source_ordinal_initial",
        "source_ordinal_latest",
        "status_partisipasi",
        "created_at",
        "updated_at",
        "last_sync_at"
      ]
    },
    {
      name: "registry_kartu",
      headers: [
        "id_kartu",
        "id_partisipasi",
        "nomor_kartu",
        "status_kartu",
        "versi_kartu",
        "created_at",
        "updated_at",
        "published_at"
      ]
    },
    {
      name: "registry_foto",
      headers: [
        "id_foto",
        "id_respons",
        "drive_file_id",
        "mime_type",
        "ukuran_byte",
        "status_foto",
        "created_at",
        "updated_at"
      ]
    },
    {
      name: "registry_sumber_map",
      headers: [
        "id_mapping",
        "id_respons",
        "id_partisipasi",
        "kode_cabang",
        "source_spreadsheet_id",
        "source_gid",
        "source_timestamp_key",
        "source_row_latest",
        "source_ordinal_latest",
        "fingerprint_sumber",
        "last_seen_at",
        "status_mapping"
      ]
    },
    {
      name: "audit_perubahan",
      headers: [
        "id_audit",
        "waktu",
        "jenis_entitas",
        "id_entitas",
        "jenis_perubahan",
        "nilai_lama_fingerprint",
        "nilai_baru_fingerprint",
        "metode_pencocokan",
        "keputusan_otomatis",
        "catatan"
      ]
    }
  ]
});
