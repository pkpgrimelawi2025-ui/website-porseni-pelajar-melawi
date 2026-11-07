
/**
 * REGISTRY PORSENI 2026
 * RegistryRecovery.gs
 *
 * Recovery test non-destruktif.
 * Tidak mengganti Registry utama.
 * Tidak mengubah Script Properties.
 */

function registryRecoveryTest() {
  const backupId =
    "1PjZJ9CSoWlSmILT2LmtPOLDLNr4zAFyMqJ83m6gYxJU";

  const folderId =
    REGISTRY_CONFIG.backupFolderId;

  const lock = LockService.getScriptLock();

  if (!lock.tryLock(30000)) {
    throw new Error(
      "Proses Registry sedang berjalan."
    );
  }

  try {
    const properties =
      PropertiesService.getScriptProperties();

    const mainRegistryId =
      properties.getProperty(
        REGISTRY_CONFIG.scriptPropertyKey
      );

    if (!mainRegistryId) {
      throw new Error(
        "Registry utama belum terdaftar."
      );
    }

    if (backupId === mainRegistryId) {
      throw new Error(
        "Backup ID tidak boleh sama dengan Registry utama."
      );
    }

    const backupSpreadsheet =
      SpreadsheetApp.openById(backupId);

    const backupValidation =
      registryValidasiStruktur_(backupSpreadsheet);

    if (!backupValidation.valid) {
      throw new Error(
        "Backup sumber tidak valid. Recovery dibatalkan."
      );
    }

    const folder =
      DriveApp.getFolderById(folderId);

    const backupFile =
      DriveApp.getFileById(backupId);

    const timezone = "Asia/Jakarta";

    const timestamp = Utilities.formatDate(
      new Date(),
      timezone,
      "yyyyMMdd_HHmmss"
    );

    const recoveryName =
      "registry_recovery_test_" + timestamp;

    Logger.log("======================================");
    Logger.log("REGISTRY RECOVERY TEST");
    Logger.log("======================================");

    Logger.log(
      "Main Registry ID: " + mainRegistryId
    );

    Logger.log(
      "Source Backup ID: " + backupId
    );

    Logger.log(
      "Source Backup Validation: VALID"
    );

    Logger.log(
      "Creating recovery test copy..."
    );

    const recoveryFile =
      backupFile.makeCopy(recoveryName, folder);

    const recoverySpreadsheet =
      SpreadsheetApp.openById(
        recoveryFile.getId()
      );

    const recoveryValidation =
      registryValidasiStruktur_(
        recoverySpreadsheet
      );

    if (!recoveryValidation.valid) {
      throw new Error(
        "Recovery copy gagal validasi."
      );
    }

    let totalSheetRowCountMatch = 0;
    const details = [];

    REGISTRY_CONFIG.sheets.forEach(configSheet => {
      const sourceSheet =
        backupSpreadsheet.getSheetByName(
          configSheet.name
        );

      const recoverySheet =
        recoverySpreadsheet.getSheetByName(
          configSheet.name
        );

      const sourceLastRow =
        sourceSheet.getLastRow();

      const recoveryLastRow =
        recoverySheet.getLastRow();

      const sourceDataRows =
        Math.max(0, sourceLastRow - 1);

      const recoveryDataRows =
        Math.max(0, recoveryLastRow - 1);

      const rowCountMatch =
        sourceDataRows === recoveryDataRows;

      if (rowCountMatch) {
        totalSheetRowCountMatch++;
      }

      details.push({
        sheet: configSheet.name,
        sourceRows: sourceDataRows,
        recoveryRows: recoveryDataRows,
        match: rowCountMatch
      });
    });

    const allRowsMatch =
      totalSheetRowCountMatch ===
      REGISTRY_CONFIG.sheets.length;

    Logger.log("======================================");
    Logger.log("RECOVERY TEST REPORT");
    Logger.log("======================================");

    Logger.log(
      "Recovery Name: " + recoveryName
    );

    Logger.log(
      "Recovery ID: " + recoveryFile.getId()
    );

    Logger.log(
      "Schema Validation: " +
      (recoveryValidation.valid ? "VALID" : "INVALID")
    );

    details.forEach(detail => {
      Logger.log(
        detail.sheet +
        " | Backup Rows: " + detail.sourceRows +
        " | Recovery Rows: " + detail.recoveryRows +
        " | Match: " + detail.match
      );
    });

    Logger.log(
      "Sheet Row Count Match: " +
      totalSheetRowCountMatch +
      "/" +
      REGISTRY_CONFIG.sheets.length
    );

    Logger.log(
      "Main Registry Modified: NO"
    );

    Logger.log(
      "Script Properties Modified: NO"
    );

    const success =
      recoveryValidation.valid &&
      allRowsMatch;

    Logger.log(
      "STATUS: " +
      (success
        ? "RECOVERY TEST SUCCESS"
        : "RECOVERY TEST FAILED")
    );

    Logger.log(
      "Recovery URL: " +
      recoverySpreadsheet.getUrl()
    );

    Logger.log("======================================");

    return {
      success: success,
      recoveryId: recoveryFile.getId(),
      recoveryUrl: recoverySpreadsheet.getUrl(),
      rowCountMatch: allRowsMatch
    };

  } finally {
    lock.releaseLock();
  }
}
