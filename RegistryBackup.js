
/**
 * REGISTRY PORSENI 2026
 * RegistryBackup.gs
 *
 * Backup Registry tanpa mengubah Registry asli.
 */

function registryBackup() {
  if (!REGISTRY_CONFIG.backupEnabled) {
    throw new Error("Backup Registry dinonaktifkan.");
  }

  const properties =
    PropertiesService.getScriptProperties();

  const registryId = properties.getProperty(
    REGISTRY_CONFIG.scriptPropertyKey
  );

  if (!registryId) {
    throw new Error("Registry ID belum ditemukan.");
  }

  const folderId = REGISTRY_CONFIG.backupFolderId;

  if (!folderId) {
    throw new Error("Backup Folder ID belum dikonfigurasi.");
  }

  const lock = LockService.getScriptLock();

  if (!lock.tryLock(30000)) {
    throw new Error("Proses Registry sedang berjalan.");
  }

  try {
    const registry =
      SpreadsheetApp.openById(registryId);

    const validation =
      registryValidasiStruktur_(registry);

    if (!validation.valid) {
      throw new Error(
        "Registry tidak valid. Backup dibatalkan."
      );
    }

    const folder = DriveApp.getFolderById(folderId);
    const sourceFile = DriveApp.getFileById(registryId);

    const timezone = "Asia/Jakarta";

    const timestamp = Utilities.formatDate(
      new Date(),
      timezone,
      "yyyyMMdd_HHmmss"
    );

    const backupName =
      "registry_backup_" + timestamp;

    const backupFile =
      sourceFile.makeCopy(backupName, folder);

    const backupSpreadsheet =
      SpreadsheetApp.openById(backupFile.getId());

    const backupValidation =
      registryValidasiStruktur_(backupSpreadsheet);

    if (!backupValidation.valid) {
      throw new Error(
        "Backup dibuat tetapi validasi backup gagal. " +
        "Backup ID: " + backupFile.getId()
      );
    }

    Logger.log("======================================");
    Logger.log("REGISTRY BACKUP REPORT");
    Logger.log("======================================");

    Logger.log("Registry ID: " + registryId);
    Logger.log("Backup Name: " + backupName);
    Logger.log("Backup ID: " + backupFile.getId());
    Logger.log("Backup Folder: " + folderId);
    Logger.log("Schema: " + REGISTRY_CONFIG.schemaVersion);
    Logger.log("Header Valid: " +
      backupValidation.totalHeaderValid);
    Logger.log("Status: BACKUP SUCCESS");

    Logger.log(
      "Backup URL: " + backupSpreadsheet.getUrl()
    );

    Logger.log("======================================");

    return {
      success: true,
      backupId: backupFile.getId(),
      backupName: backupName,
      backupUrl: backupSpreadsheet.getUrl()
    };

  } finally {
    lock.releaseLock();
  }
}
