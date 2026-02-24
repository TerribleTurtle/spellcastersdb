import { DeckBuilderState } from "@/store/types";
import { Deck, Team } from "@/types/deck";

export interface BackupData {
  version: number;
  timestamp: string;
  decks: Deck[];
  teams: Team[];
}

export class BackupService {
  private static CURRENT_VERSION = 1;

  /**
   * Generates a backup object from the current store state.
   *
   * @param state - The current `DeckBuilderState` containing saved decks and teams.
   * @returns A versioned `BackupData` snapshot with an ISO timestamp.
   *
   * @example
   * ```ts
   * const backup = BackupService.generateBackup(store.getState());
   * // { version: 1, timestamp: "2026-02-23T...", decks: [...], teams: [...] }
   * ```
   */
  public static generateBackup(state: DeckBuilderState): BackupData {
    return {
      version: this.CURRENT_VERSION,
      timestamp: new Date().toISOString(),
      decks: state.savedDecks,
      teams: state.savedTeams,
    };
  }

  /**
   * Triggers a browser download of the backup data as a JSON file.
   *
   * @param data - The `BackupData` object to serialize and download.
   * @param filename - The download filename. Defaults to `"spellcasters-backup.json"`.
   *
   * @example
   * ```ts
   * const backup = BackupService.generateBackup(state);
   * BackupService.downloadBackup(backup);             // uses default filename
   * BackupService.downloadBackup(backup, "my-decks.json"); // custom filename
   * ```
   */
  public static downloadBackup(
    data: BackupData,
    filename: string = "spellcasters-backup.json"
  ): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Validates the structure of imported backup data.
   *
   * @param data - The raw parsed JSON to validate.
   * @returns `true` (narrowing `data` to `BackupData`) if the object has valid `decks` and `teams` arrays.
   *
   * @example
   * ```ts
   * const parsed = JSON.parse(fileContents);
   * if (BackupService.validateBackup(parsed)) {
   *   // `parsed` is now typed as BackupData
   *   console.log(parsed.decks.length);
   * }
   * ```
   */
  public static validateBackup(data: unknown): data is BackupData {
    if (!data || typeof data !== "object") return false;

    // Basic structural check
    const backup = data as Partial<BackupData>;
    if (!Array.isArray(backup.decks)) return false;
    if (!Array.isArray(backup.teams)) return false;

    // We could add deeper validation here, but this covers the basics
    return true;
  }

  /**
   * Reads and parses a JSON backup file uploaded by the user.
   *
   * @param file - A browser `File` object (e.g. from an `<input type="file">`).
   * @returns The parsed and validated `BackupData`.
   * @throws {Error} If the file can't be read or fails structural validation.
   *
   * @example
   * ```ts
   * const file = inputRef.current.files[0];
   * const backup = await BackupService.parseBackupFile(file);
   * store.getState().importBackup(backup);
   * ```
   */
  public static async parseBackupFile(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== "string") {
            throw new Error("Failed to read file");
          }

          const parsed = JSON.parse(result);
          if (this.validateBackup(parsed)) {
            resolve(parsed);
          } else {
            reject(new Error("Invalid backup file format"));
          }
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  }
}
